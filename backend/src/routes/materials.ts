// @ts-nocheck
import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/materials
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const where: any = {};
    if (category) where.category = category;

    const materials = await prisma.material.findMany({
      where,
      include: { stock: true, loadingCharges: true },
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ materials });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch materials.' });
  }
});

// POST /api/materials
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { name, code, unit, category, defaultRate, gstRate, hsnCode, sortOrder, initialStock } = req.body;

    if (!name || !code || !unit) {
      res.status(400).json({ error: 'Name, code, and unit are required.' });
      return;
    }

    const material = await prisma.material.create({
      data: { 
        name, code, unit, category: category || 'brick', 
        defaultRate: defaultRate || 0, gstRate: gstRate || 0, 
        hsnCode, sortOrder: sortOrder || 0 
      },
    });

    // Create stock record
    await prisma.stock.create({
      data: { materialId: material.id, quantity: initialStock || 0, minLevel: 0 },
    });

    if (initialStock > 0) {
      await prisma.stockMovement.create({
        data: {
          materialId: material.id,
          type: 'ADJUSTMENT',
          quantity: initialStock,
          notes: 'Initial stock on creation'
        }
      });
    }

    await prisma.activityLog.create({
      data: {
        userId: req.user!.userId,
        action: 'CREATE',
        entity: 'Material',
        entityId: material.id,
        details: `Created material: ${name}`,
      },
    });

    res.status(201).json({ material });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Material code already exists.' });
      return;
    }
    console.error('Create material error:', error);
    res.status(500).json({ error: 'Failed to create material.' });
  }
});

// PUT /api/materials/:id
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, code, unit, category, defaultRate, gstRate, hsnCode, isActive, sortOrder, currentStock } = req.body;

    const material = await prisma.material.update({
      where: { id },
      data: { name, code, unit, category, defaultRate, gstRate, hsnCode, isActive, sortOrder },
    });

    if (currentStock !== undefined) {
      const stock = await prisma.stock.findUnique({ where: { materialId: id } });
      if (stock) {
        const diff = currentStock - stock.quantity;
        if (diff !== 0) {
          await prisma.stock.update({
            where: { materialId: id },
            data: { quantity: currentStock, lastUpdated: new Date() }
          });
          await prisma.stockMovement.create({
            data: {
              materialId: id,
              type: 'ADJUSTMENT',
              quantity: Math.abs(diff),
              notes: `Manual adjustment during edit: ${diff > 0 ? 'Added' : 'Removed'} ${Math.abs(diff)}`
            }
          });
        }
      }
    }

    res.json({ material });
  } catch (error) {
    console.error('Update material error:', error);
    res.status(500).json({ error: 'Failed to update material.' });
  }
});

// DELETE /api/materials/:id
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if used in invoices or purchases
    const invoiceItem = await prisma.invoiceItem.findFirst({ where: { materialId: id } });
    const purchaseItem = await prisma.purchaseItem.findFirst({ where: { materialId: id } });

    if (invoiceItem || purchaseItem) {
      res.status(400).json({ error: 'Cannot delete: Material is used in an invoice or purchase. Please deactivate it instead.' });
      return;
    }

    // Deleting related records first (handled by Cascade in schema if applied)
    // But let's be safe and do it in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.stockMovement.deleteMany({ where: { materialId: id } });
      await tx.stock.deleteMany({ where: { materialId: id } });
      await tx.loadingCharge.deleteMany({ where: { materialId: id } });
      await tx.material.delete({ where: { id } });
    });

    res.json({ success: true, message: 'Material permanently deleted.' });
  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({ error: 'Failed to delete material.' });
  }
});

export default router;
