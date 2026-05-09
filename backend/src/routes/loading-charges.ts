import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/loading-charges
router.get('/', authenticate, async (_req: Request, res: Response) => {
  try {
    const charges = await prisma.loadingCharge.findMany({
      where: { isActive: true },
      include: { material: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ charges });
  } catch (e) { res.status(500).json({ error: 'Failed to fetch loading charges.' }); }
});

// POST /api/loading-charges
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { materialId, rate, unit, description } = req.body;
    if (!materialId || rate === undefined) { res.status(400).json({ error: 'Material and rate are required.' }); return; }
    const charge = await prisma.loadingCharge.create({
      data: { materialId, rate, unit: unit || 'per_ton', description },
      include: { material: true },
    });
    res.status(201).json({ charge });
  } catch (e) { res.status(500).json({ error: 'Failed to create loading charge.' }); }
});

// PUT /api/loading-charges/:id
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const charge = await prisma.loadingCharge.update({
      where: { id: req.params.id },
      data: req.body,
      include: { material: true },
    });
    res.json({ charge });
  } catch (e) { res.status(500).json({ error: 'Failed to update loading charge.' }); }
});

// DELETE /api/loading-charges/:id
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    await prisma.loadingCharge.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ message: 'Deleted.' });
  } catch (e) { res.status(500).json({ error: 'Failed to delete loading charge.' }); }
});

export default router;
