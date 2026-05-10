// @ts-nocheck
import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/purchases
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { limit = '50', business } = req.query;
    const where: any = {};
    if (business) where.business = business;

    const purchases = await prisma.purchase.findMany({
      where,
      include: { 
        supplier: true, 
        items: { 
          include: { 
            material: true,
            bakeryProduct: true
          } 
        } 
      },
      orderBy: { purchaseDate: 'desc' },
      take: parseInt(limit as string),
    });
    res.json({ purchases });
  } catch (error) { 
    console.error('Fetch purchases error:', error);
    res.status(500).json({ error: 'Failed to fetch purchases.' }); 
  }
});

// GET /api/purchases/suppliers
router.get('/suppliers', authenticate, async (req: Request, res: Response) => {
  try {
    const { business } = req.query;
    const where: any = { isActive: true };
    if (business) where.business = business;

    const suppliers = await prisma.supplier.findMany({ 
      where, 
      orderBy: { name: 'asc' } 
    });
    res.json({ suppliers });
  } catch (error) { res.status(500).json({ error: 'Failed to fetch suppliers.' }); }
});

// POST /api/purchases/suppliers
router.post('/suppliers', authenticate, async (req: Request, res: Response) => {
  try {
    const { name, phone, address, business } = req.body;
    if (!name) { res.status(400).json({ error: 'Name is required.' }); return; }
    const supplier = await prisma.supplier.create({ 
      data: { name, phone, address, business: business || 'POWER_BRICK' } 
    });
    res.status(201).json({ supplier });
  } catch (error) { res.status(500).json({ error: 'Failed to create supplier.' }); }
});

// POST /api/purchases
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { 
      supplierId, supplierName, supplierPhone, items, 
      transportCost, loadingCost, otherCharges, 
      paidAmount, paymentMethod, notes, purchaseDate, business 
    } = req.body;

    const finalBusiness = business || 'POWER_BRICK';

    // Create supplier inline if needed
    let finalSupplierId = supplierId;
    if (!finalSupplierId && supplierName) {
      const supplier = await prisma.supplier.create({ 
        data: { name: supplierName, phone: supplierPhone || null, business: finalBusiness } 
      });
      finalSupplierId = supplier.id;
    }
    if (!finalSupplierId) { res.status(400).json({ error: 'Supplier is required.' }); return; }
    if (!items || items.length === 0) { res.status(400).json({ error: 'At least one item is required.' }); return; }

    const count = await prisma.purchase.count();
    const purchaseNumber = `PUR-${String(count + 1).padStart(5, '0')}`;
    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.quantity * item.rate), 0);
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
        business: finalBusiness,
        items: {
          create: items.map((item: any) => ({
            materialId: finalBusiness === 'POWER_BRICK' ? item.materialId : null,
            bakeryProductId: finalBusiness === 'BAKE_LAND' ? item.productId : null,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.quantity * item.rate,
          })),
        },
      },
      include: { supplier: true, items: { include: { material: true, bakeryProduct: true } } },
    });

    // Update stock for each item
    for (const item of items) {
      if (finalBusiness === 'POWER_BRICK') {
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
      } else if (finalBusiness === 'BAKE_LAND') {
        await prisma.bakeryProduct.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
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

// PUT /api/purchases/:id
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { items, transportCost, loadingCost, otherCharges, paidAmount, paymentMethod, notes, purchaseDate } = req.body;

    const oldPurchase = await prisma.purchase.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!oldPurchase) {
      res.status(404).json({ error: 'Purchase not found.' });
      return;
    }

    // This is complex because we need to reverse old stock and apply new stock.
    // For simplicity in this ERP, we'll suggest deleting and re-creating or handle it carefully.
    // Let's implement a basic update for non-item fields first, as item update requires careful stock management.
    
    const totalAmount = items ? items.reduce((sum, item) => sum + (item.quantity * item.rate), 0) : oldPurchase.totalAmount;
    const grandTotal = totalAmount + (transportCost ?? oldPurchase.transportCost) + (loadingCost ?? oldPurchase.loadingCost) + (otherCharges ?? oldPurchase.otherCharges);
    const paid = paidAmount ?? oldPurchase.paidAmount;
    const due = grandTotal - paid;

    // If items changed, we'd need to reverse stock for oldPurchase.items and apply for new items.
    // For now, let's update non-item fields and only items if provided (with stock adjustment).
    
    if (items) {
      // Reverse old stock
      for (const item of oldPurchase.items) {
        if (oldPurchase.business === 'POWER_BRICK' && item.materialId) {
          await prisma.stock.update({
            where: { materialId: item.materialId },
            data: { quantity: { decrement: item.quantity } }
          });
        } else if (oldPurchase.business === 'BAKE_LAND' && item.bakeryProductId) {
          await prisma.bakeryProduct.update({
            where: { id: item.bakeryProductId },
            data: { stock: { decrement: item.quantity } }
          });
        }
      }

      // Delete old items
      await prisma.purchaseItem.deleteMany({ where: { purchaseId: id } });

      // Create new items and update stock
      for (const item of items) {
        await prisma.purchaseItem.create({
          data: {
            purchaseId: id,
            materialId: oldPurchase.business === 'POWER_BRICK' ? item.materialId : null,
            bakeryProductId: oldPurchase.business === 'BAKE_LAND' ? item.productId : null,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.quantity * item.rate,
          }
        });

        if (oldPurchase.business === 'POWER_BRICK' && item.materialId) {
          await prisma.stock.update({
            where: { materialId: item.materialId },
            data: { quantity: { increment: item.quantity }, lastUpdated: new Date() }
          });
        } else if (oldPurchase.business === 'BAKE_LAND' && item.productId) {
          await prisma.bakeryProduct.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } }
          });
        }
      }
    }

    const purchase = await prisma.purchase.update({
      where: { id },
      data: {
        totalAmount,
        transportCost: transportCost ?? oldPurchase.transportCost,
        loadingCost: loadingCost ?? oldPurchase.loadingCost,
        otherCharges: otherCharges ?? oldPurchase.otherCharges,
        grandTotal,
        paidAmount: paid,
        dueAmount: due,
        paymentStatus: paid >= grandTotal ? 'paid' : paid > 0 ? 'partial' : 'pending',
        paymentMethod: paymentMethod ?? oldPurchase.paymentMethod,
        notes: notes ?? oldPurchase.notes,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : oldPurchase.purchaseDate,
      },
      include: { supplier: true, items: { include: { material: true, bakeryProduct: true } } }
    });

    // Update supplier total due
    const dueDifference = due - oldPurchase.dueAmount;
    if (dueDifference !== 0) {
      await prisma.supplier.update({
        where: { id: oldPurchase.supplierId },
        data: { totalDue: { increment: dueDifference } }
      });
    }

    res.json({ purchase });
  } catch (error: any) {
    console.error('Update purchase error:', error);
    res.status(500).json({ error: 'Failed to update purchase.' });
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
      if (purchase.business === 'POWER_BRICK' && item.materialId) {
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
      } else if (purchase.business === 'BAKE_LAND' && item.bakeryProductId) {
        await prisma.bakeryProduct.update({
          where: { id: item.bakeryProductId },
          data: { stock: { decrement: item.quantity } }
        });
      }
    }

    // Update supplier total due
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
