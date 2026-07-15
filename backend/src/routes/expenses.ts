import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

const expenseSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.'),
  amount: z.coerce.number().positive('Amount must be greater than 0.'),
  category: z.string().default('miscellaneous'),
  subCategory: z.string().optional(),
  business: z.string().optional(),
  description: z.string().optional().default(''),
  billNumber: z.string().optional(),
  paymentMethod: z.string().optional().default('cash'),
  isPaid: z.boolean().optional(),
  dueDate: z.coerce.date().optional(),
  paidDate: z.coerce.date().optional(),
  month: z.string().optional(),
});

// GET /api/expenses
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { category, business, month } = req.query;
    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (business) where.business = business;
    if (month) where.month = month;

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json({ expenses });
  } catch (error) {
    console.error('Fetch expenses error:', error);
    res.status(500).json({ error: 'Failed to fetch expenses.' });
  }
});

// POST /api/expenses
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = expenseSchema.parse(req.body);
    const expense = await prisma.expense.create({ data: parsed as any });
    res.status(201).json({ expense });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues[0]?.message ?? 'Invalid expense data.' });
      return;
    }
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Failed to create expense.' });
  }
});

// PUT /api/expenses/:id
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = expenseSchema.partial().parse(req.body);
    const expense = await prisma.expense.update({
      where: { id: req.params.id as string },
      data: parsed as any,
    });
    res.json({ expense });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues[0]?.message ?? 'Invalid expense data.' });
      return;
    }
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Failed to update expense.' });
  }
});

// DELETE /api/expenses/:id
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    await prisma.expense.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Deleted.' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Failed to delete expense.' });
  }
});

// GET /api/expenses/summary
router.get('/summary', authenticate, async (_req: Request, res: Response) => {
  try {
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const byCategory = await prisma.expense.groupBy({
      by: ['category'],
      where: { createdAt: { gte: monthAgo } },
      _sum: { amount: true },
      _count: true,
    });
    res.json({ summary: byCategory });
  } catch (error) {
    console.error('Expense summary error:', error);
    res.status(500).json({ error: 'Failed to fetch summary.' });
  }
});

export default router;
