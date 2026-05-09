// @ts-nocheck
import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/materials
router.get('/', authenticate, async (_req: Request, res: Response) => {
  try {
    const materials = await prisma.material.findMany({
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
    const { name, code, unit, category, defaultRate, gstRate, hsnCode, sortOrder } = req.body;

    if (!name || !code || !unit) {
      res.status(400).json({ error: 'Name, code, and unit are required.' });
      return;
    }

    const material = await prisma.material.create({
      data: { name, code, unit, category, defaultRate: defaultRate || 0, gstRate: gstRate || 0, hsnCode, sortOrder: sortOrder || 0 },
    });

    // Create stock record
    await prisma.stock.create({
      data: { materialId: material.id, quantity: 0, minLevel: 0 },
    });

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
    res.status(500).json({ error: 'Failed to create material.' });
  }
});

// PUT /api/materials/:id
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, code, unit, category, defaultRate, gstRate, hsnCode, isActive, sortOrder } = req.body;

    const material = await prisma.material.update({
      where: { id },
      data: { name, code, unit, category, defaultRate, gstRate, hsnCode, isActive, sortOrder },
    });

    res.json({ material });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update material.' });
  }
});

// DELETE /api/materials/:id
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Soft delete
    await prisma.material.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({ message: 'Material deactivated.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete material.' });
  }
});

export default router;
