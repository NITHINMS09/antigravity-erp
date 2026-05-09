// @ts-nocheck
import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { category, business, month } = req.query;
    const where: any = {};
    if (category) where.category = category;
    if (business) where.business = business;
    if (month) where.month = month;
    const expenses = await prisma.expense.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json({ expenses });
  } catch (e) { res.status(500).json({ error: 'Failed to fetch expenses.' }); }
});

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const expense = await prisma.expense.create({ data: req.body });
    res.status(201).json({ expense });
  } catch (e) { res.status(500).json({ error: 'Failed to create expense.' }); }
});

router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const expense = await prisma.expense.update({ where: { id: req.params.id }, data: req.body });
    res.json({ expense });
  } catch (e) { res.status(500).json({ error: 'Failed to update expense.' }); }
});

router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    await prisma.expense.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted.' });
  } catch (e) { res.status(500).json({ error: 'Failed to delete expense.' }); }
});

router.get('/summary', authenticate, async (_req: Request, res: Response) => {
  try {
    const monthAgo = new Date(); monthAgo.setDate(monthAgo.getDate() - 30);
    const byCategory = await prisma.expense.groupBy({
      by: ['category'], where: { createdAt: { gte: monthAgo } },
      _sum: { amount: true }, _count: true,
    });
    res.json({ summary: byCategory });
  } catch (e) { res.status(500).json({ error: 'Failed to fetch summary.' }); }
});

export default router;
