// @ts-nocheck
import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/products', authenticate, async (_req: Request, res: Response) => {
  try {
    const products = await prisma.bakeryProduct.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
    res.json({ products });
  } catch (e) { res.status(500).json({ error: 'Failed to fetch products.' }); }
});

router.post('/products', authenticate, async (req: Request, res: Response) => {
  try {
    const product = await prisma.bakeryProduct.create({ data: req.body });
    res.status(201).json({ product });
  } catch (e) { res.status(500).json({ error: 'Failed to create product.' }); }
});

router.put('/products/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const product = await prisma.bakeryProduct.update({ where: { id: req.params.id }, data: req.body });
    res.json({ product });
  } catch (e) { res.status(500).json({ error: 'Failed to update product.' }); }
});

// GET /api/bakery/sales — simple daily sales list
router.get('/sales', authenticate, async (req: Request, res: Response) => {
  try {
    const sales = await prisma.bakerySale.findMany({
      orderBy: { saleDate: 'desc' },
      take: parseInt(req.query.limit as string || '60'),
    });
    res.json({ sales });
  } catch (e) { res.status(500).json({ error: 'Failed to fetch sales.' }); }
});

// POST /api/bakery/sales — simple daily total entry (no product dependency)
router.post('/sales', authenticate, async (req: Request, res: Response) => {
  try {
    const { totalAmount, cashAmount, upiAmount, cardAmount, discountAmount, notes, saleDate } = req.body;

    if (!totalAmount && totalAmount !== 0) {
      res.status(400).json({ error: 'Total amount is required.' });
      return;
    }

    const sale = await prisma.bakerySale.create({
      data: {
        saleDate: saleDate ? new Date(saleDate) : new Date(),
        totalAmount: totalAmount || 0,
        cashAmount: cashAmount || 0,
        upiAmount: upiAmount || 0,
        cardAmount: cardAmount || 0,
        discountAmount: discountAmount || 0,
        notes,
      },
    });

    res.status(201).json({ sale });
  } catch (e: any) { console.error(e); res.status(500).json({ error: 'Failed to create sale.' }); }
});

// PUT /api/bakery/sales/:id — update a daily sale entry
router.put('/sales/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const sale = await prisma.bakerySale.update({ where: { id: req.params.id }, data: req.body });
    res.json({ sale });
  } catch (e) { res.status(500).json({ error: 'Failed to update sale.' }); }
});

// DELETE /api/bakery/sales/:id
router.delete('/sales/:id', authenticate, async (req: Request, res: Response) => {
  try {
    await prisma.bakerySale.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted.' });
  } catch (e) { res.status(500).json({ error: 'Failed to delete sale.' }); }
});

export default router;
