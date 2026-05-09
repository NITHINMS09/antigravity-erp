// @ts-nocheck
import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/stock
router.get('/', authenticate, async (_req: Request, res: Response) => {
  try {
    const stock = await prisma.stock.findMany({
      include: { material: true },
      orderBy: { material: { sortOrder: 'asc' } },
    });
    res.json({ stock });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stock.' });
  }
});

// GET /api/stock/movements
router.get('/movements', authenticate, async (req: Request, res: Response) => {
  try {
    const { materialId, type, limit = '50' } = req.query;

    const where: any = {};
    if (materialId) where.materialId = materialId;
    if (type) where.type = type;

    const movements = await prisma.stockMovement.findMany({
      where,
      include: { material: true },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
    });

    res.json({ movements });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stock movements.' });
  }
});

// POST /api/stock/adjust
router.post('/adjust', authenticate, async (req: Request, res: Response) => {
  try {
    const { materialId, quantity, type, notes } = req.body;

    if (!materialId || quantity === undefined || !type) {
      res.status(400).json({ error: 'materialId, quantity, and type are required.' });
      return;
    }

    const stock = await prisma.stock.findUnique({ where: { materialId } });
    if (!stock) {
      res.status(404).json({ error: 'Stock record not found.' });
      return;
    }

    let newQuantity = stock.quantity;
    if (type === 'IN') newQuantity += quantity;
    else if (type === 'OUT') newQuantity -= quantity;
    else if (type === 'ADJUSTMENT') newQuantity = quantity;
    else if (type === 'WASTAGE') newQuantity -= quantity;

    await prisma.stock.update({
      where: { materialId },
      data: { quantity: newQuantity, lastUpdated: new Date() },
    });

    await prisma.stockMovement.create({
      data: {
        materialId,
        type,
        quantity,
        referenceType: 'ADJUSTMENT',
        notes,
      },
    });

    res.json({ message: 'Stock updated.', newQuantity });
  } catch (error) {
    res.status(500).json({ error: 'Failed to adjust stock.' });
  }
});

// PUT /api/stock/:materialId/levels
router.put('/:materialId/levels', authenticate, async (req: Request, res: Response) => {
  try {
    const { materialId } = req.params;
    const { minLevel, maxLevel } = req.body;

    const stock = await prisma.stock.update({
      where: { materialId },
      data: { minLevel, maxLevel },
    });

    res.json({ stock });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update stock levels.' });
  }
});

export default router;
