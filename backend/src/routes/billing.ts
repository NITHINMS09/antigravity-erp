import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/billing
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { business, status, startDate, endDate, search, limit = '50' } = req.query;
    const where: any = {};
    if (business) where.business = business;
    if (status) where.paymentStatus = status;
    if (startDate || endDate) {
      where.invoiceDate = {};
      if (startDate) where.invoiceDate.gte = new Date(startDate as string);
      if (endDate) where.invoiceDate.lte = new Date(endDate as string);
    }
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search as string } },
        { customer: { name: { contains: search as string } } },
        { vehicleNumber: { contains: search as string } },
      ];
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        customer: true,
        items: { include: { material: true } },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
    });

    res.json({ invoices });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoices.' });
  }
});

// GET /api/billing/:id
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        items: { include: { material: true } },
        payments: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found.' });
      return;
    }
    res.json({ invoice });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoice.' });
  }
});

// POST /api/billing
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const {
      customerId, business, isGst, items, vehicleNumber, driverName,
      discountPercent, discountAmount, loadingCharge, transportCharge,
      tractorCharge, labourCharge, paidAmount, paymentMethod, notes, dueDate,
    } = req.body;

    if (!customerId || !items || items.length === 0) {
      res.status(400).json({ error: 'Customer and at least one item are required.' });
      return;
    }

    // Get business config for invoice numbering
    const bizCode = business || 'POWER_BRICK';
    let config = await prisma.businessConfig.findUnique({ where: { businessCode: bizCode } });
    if (!config) {
      config = await prisma.businessConfig.create({
        data: {
          businessName: bizCode === 'POWER_BRICK' ? 'POWER BRICK' : 'BAKE LAND',
          businessCode: bizCode,
          invoicePrefix: bizCode === 'POWER_BRICK' ? 'PB' : 'BL',
          invoiceCounter: 0,
        },
      });
    }

    const newCounter = config.invoiceCounter + 1;
    const invoiceNumber = `${config.invoicePrefix || 'INV'}-${String(newCounter).padStart(5, '0')}`;

    // Calculate totals
    let subtotal = 0;
    let totalGst = 0;
    const processedItems = items.map((item: any) => {
      const amount = item.quantity * item.rate;
      const gstAmt = isGst ? (amount * (item.gstRate || 0)) / 100 : 0;
      subtotal += amount;
      totalGst += gstAmt;
      return {
        materialId: item.materialId,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        gstRate: item.gstRate || 0,
        gstAmount: gstAmt,
        amount,
      };
    });

    const disc = discountAmount || (subtotal * (discountPercent || 0)) / 100;
    const grandTotal = subtotal + totalGst - disc + (loadingCharge || 0) + (transportCharge || 0) + (tractorCharge || 0) + (labourCharge || 0);
    const paid = paidAmount || 0;
    const due = grandTotal - paid;
    const payStatus = paid >= grandTotal ? 'paid' : paid > 0 ? 'partial' : 'pending';

    // Create invoice with items
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        business: bizCode,
        customerId,
        createdById: req.user!.userId,
        isGst: isGst || false,
        subtotal,
        gstAmount: totalGst,
        discountAmount: disc,
        discountPercent: discountPercent || 0,
        loadingCharge: loadingCharge || 0,
        transportCharge: transportCharge || 0,
        tractorCharge: tractorCharge || 0,
        labourCharge: labourCharge || 0,
        grandTotal,
        paidAmount: paid,
        dueAmount: due,
        paymentStatus: payStatus,
        paymentMethod,
        vehicleNumber,
        driverName,
        notes,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        items: { create: processedItems },
        payments: paid > 0 ? {
          create: { amount: paid, method: paymentMethod || 'cash' },
        } : undefined,
      },
      include: {
        customer: true,
        items: { include: { material: true } },
        payments: true,
      },
    });

    // Update invoice counter
    await prisma.businessConfig.update({
      where: { businessCode: bizCode },
      data: { invoiceCounter: newCounter },
    });

    // Update customer due
    if (due > 0) {
      await prisma.customer.update({
        where: { id: customerId },
        data: { totalDue: { increment: due } },
      });
    }

    // Reduce stock for each item
    for (const item of processedItems) {
      const stock = await prisma.stock.findUnique({ where: { materialId: item.materialId } });
      if (stock) {
        await prisma.stock.update({
          where: { materialId: item.materialId },
          data: { quantity: { decrement: item.quantity }, lastUpdated: new Date() },
        });
        await prisma.stockMovement.create({
          data: {
            materialId: item.materialId,
            type: 'OUT',
            quantity: item.quantity,
            reference: invoice.id,
            referenceType: 'SALE',
            notes: `Invoice ${invoiceNumber}`,
          },
        });
      }
    }

    // Activity log
    await prisma.activityLog.create({
      data: {
        userId: req.user!.userId,
        action: 'CREATE',
        entity: 'Invoice',
        entityId: invoice.id,
        details: `Created invoice ${invoiceNumber} for ₹${grandTotal}`,
      },
    });

    res.status(201).json({ invoice });
  } catch (error: any) {
    console.error('Billing error:', error);
    res.status(500).json({ error: 'Failed to create invoice.' });
  }
});

// POST /api/billing/:id/payment
router.post('/:id/payment', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, method, reference, notes } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ error: 'Valid payment amount is required.' });
      return;
    }

    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found.' });
      return;
    }

    const newPaid = invoice.paidAmount + amount;
    const newDue = invoice.grandTotal - newPaid;
    const newStatus = newPaid >= invoice.grandTotal ? 'paid' : 'partial';

    await prisma.payment.create({
      data: { invoiceId: id, amount, method: method || 'cash', reference, notes },
    });

    await prisma.invoice.update({
      where: { id },
      data: { paidAmount: newPaid, dueAmount: Math.max(0, newDue), paymentStatus: newStatus },
    });

    // Update customer due
    await prisma.customer.update({
      where: { id: invoice.customerId },
      data: { totalDue: { decrement: amount } },
    });

    res.json({ message: 'Payment recorded.', paidAmount: newPaid, dueAmount: Math.max(0, newDue), status: newStatus });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record payment.' });
  }
});

export default router;
