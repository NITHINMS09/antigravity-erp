import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/transport
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { limit = '50' } = req.query;
    const transports = await prisma.transport.findMany({
      orderBy: { tripDate: 'desc' },
      take: parseInt(limit as string),
    });
    res.json({ transports });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transport records.' });
  }
});

// POST /api/transport
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const data = req.body;
    data.totalCost = (data.charge || 0) + (data.dieselCost || 0) + (data.otherExpenses || 0);

    const transport = await prisma.transport.create({ data });
    res.status(201).json({ transport });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create transport record.' });
  }
});

// PUT /api/transport/:id
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (data.charge !== undefined || data.dieselCost !== undefined || data.otherExpenses !== undefined) {
      const existing = await prisma.transport.findUnique({ where: { id: req.params.id } });
      if (existing) {
        data.totalCost = (data.charge ?? existing.charge) + (data.dieselCost ?? existing.dieselCost) + (data.otherExpenses ?? existing.otherExpenses);
      }
    }
    const transport = await prisma.transport.update({ where: { id: req.params.id }, data });
    res.json({ transport });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update transport record.' });
  }
});

// GET /api/transport/summary
router.get('/summary', authenticate, async (_req: Request, res: Response) => {
  try {
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);

    const summary = await prisma.transport.aggregate({
      where: { tripDate: { gte: monthAgo } },
      _sum: { charge: true, dieselCost: true, otherExpenses: true, totalCost: true },
      _count: true,
    });
    res.json({ summary });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transport summary.' });
  }
});

export default router;
