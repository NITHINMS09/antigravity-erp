// @ts-nocheck
import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/purchases
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { limit = '50' } = req.query;
    const purchases = await prisma.purchase.findMany({
      include: { supplier: true, items: { include: { material: true } } },
      orderBy: { purchaseDate: 'desc' },
      take: parseInt(limit as string),
    });
    res.json({ purchases });
  } catch (error) { res.status(500).json({ error: 'Failed to fetch purchases.' }); }
});

// GET /api/purchases/suppliers
router.get('/suppliers', authenticate, async (_req: Request, res: Response) => {
  try {
    const suppliers = await prisma.supplier.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
    res.json({ suppliers });
  } catch (error) { res.status(500).json({ error: 'Failed to fetch suppliers.' }); }
});

// POST /api/purchases/suppliers
router.post('/suppliers', authenticate, async (req: Request, res: Response) => {
  try {
    const { name, phone, address } = req.body;
    if (!name) { res.status(400).json({ error: 'Name is required.' }); return; }
    const supplier = await prisma.supplier.create({ data: { name, phone, address } });
    res.status(201).json({ supplier });
  } catch (error) { res.status(500).json({ error: 'Failed to create supplier.' }); }
});

// POST /api/purchases
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { supplierId, supplierName, supplierPhone, items, transportCost, loadingCost, otherCharges, paidAmount, paymentMethod, notes, purchaseDate } = req.body;

    // Create supplier inline if needed
    let finalSupplierId = supplierId;
    if (!finalSupplierId && supplierName) {
      const supplier = await prisma.supplier.create({ data: { name: supplierName, phone: supplierPhone || null } });
      finalSupplierId = supplier.id;
    }
    if (!finalSupplierId) { res.status(400).json({ error: 'Supplier is required.' }); return; }
    if (!items || items.length === 0) { res.status(400).json({ error: 'At least one item is required.' }); return; }

    const count = await prisma.purchase.count();
    const purchaseNumber = `PUR-${String(count + 1).padStart(5, '0')}`;
    const totalAmount = items.reduce((sum: number, item: any) => sum + item.quantity * item.rate, 0);
    const grandTotal = totalAmount + (transportCost || 0) + (loadingCost || 0) + (otherCharges || 0);
    const paid = paidAmount || 0;
    const due = grandTotal - paid;

    const purchase = await prisma.purchase.create({
      data: {
        purchaseNumber,
        supplierId: finalSupplierId,
        totalAmount,
        transportCost: transportCost || 0,
        loadingCost: loadingCost || 0,
        otherCharges: otherCharges || 0,
        grandTotal,
        paidAmount: paid,
        dueAmount: due,
        paymentStatus: paid >= grandTotal ? 'paid' : paid > 0 ? 'partial' : 'pending',
        paymentMethod,
        notes,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
        items: {
          create: items.map((item: any) => ({
            materialId: item.materialId,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.quantity * item.rate,
          })),
        },
      },
      include: { supplier: true, items: { include: { material: true } } },
    });

    // Increase stock for each item
    for (const item of items) {
      const stock = await prisma.stock.findUnique({ where: { materialId: item.materialId } });
      if (stock) {
        await prisma.stock.update({
          where: { materialId: item.materialId },
          data: { quantity: { increment: item.quantity }, lastUpdated: new Date() },
        });
      }
      await prisma.stockMovement.create({
        data: {
          materialId: item.materialId, type: 'IN', quantity: item.quantity,
          reference: purchase.id, referenceType: 'PURCHASE', notes: `Purchase ${purchaseNumber}`,
        },
      });
    }

    if (due > 0) {
      await prisma.supplier.update({ where: { id: finalSupplierId }, data: { totalDue: { increment: due } } });
    }

    res.status(201).json({ purchase });
  } catch (error: any) {
    console.error('Purchase error:', error);
    res.status(500).json({ error: 'Failed to create purchase.' });
  }
});

// DELETE /api/purchases/:id
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!purchase) {
      res.status(404).json({ error: 'Purchase not found.' });
      return;
    }

    // Reverse stock for each item
    for (const item of purchase.items) {
      const stock = await prisma.stock.findUnique({ where: { materialId: item.materialId } });
      if (stock) {
        await prisma.stock.update({
          where: { materialId: item.materialId },
          data: { quantity: { decrement: item.quantity }, lastUpdated: new Date() },
        });
      }
      // Delete stock movements related to this purchase
      await prisma.stockMovement.deleteMany({
        where: { reference: id, referenceType: 'PURCHASE' },
      });
    }

    // Update supplier total due (subtract the due amount of this purchase)
    if (purchase.dueAmount > 0) {
      await prisma.supplier.update({
        where: { id: purchase.supplierId },
        data: { totalDue: { decrement: purchase.dueAmount } },
      });
    }

    // Delete items and purchase
    await prisma.purchaseItem.deleteMany({ where: { purchaseId: id } });
    await prisma.purchase.delete({ where: { id } });

    res.json({ message: 'Purchase deleted successfully.' });
  } catch (error: any) {
    console.error('Delete purchase error:', error);
    res.status(500).json({ error: 'Failed to delete purchase.' });
  }
});

// POST /api/purchases/:id/payment
router.post('/:id/payment', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, method, notes } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ error: 'Valid payment amount is required.' });
      return;
    }

    const purchase = await prisma.purchase.findUnique({ where: { id } });
    if (!purchase) {
      res.status(404).json({ error: 'Purchase not found.' });
      return;
    }

    const newPaid = purchase.paidAmount + amount;
    const newDue = Math.max(0, purchase.grandTotal - newPaid);
    const newStatus = newPaid >= purchase.grandTotal ? 'paid' : 'partial';

    // In a real app we might have a PurchasePayment table, but let's keep it simple
    // and update the main record like the user requested.
    await prisma.purchase.update({
      where: { id },
      data: { 
        paidAmount: newPaid, 
        dueAmount: newDue, 
        paymentStatus: newStatus,
        notes: purchase.notes ? `${purchase.notes}\n[Payment: ₹${amount} via ${method}]` : `[Payment: ₹${amount} via ${method}]`
      },
    });

    // Update supplier due
    await prisma.supplier.update({
      where: { id: purchase.supplierId },
      data: { totalDue: { decrement: amount } },
    });

    res.json({ message: 'Payment recorded successfully.', paidAmount: newPaid, dueAmount: newDue, status: newStatus });
  } catch (error) {
    console.error('Purchase payment error:', error);
    res.status(500).json({ error: 'Failed to record payment.' });
  }
});

export default router;
