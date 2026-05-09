// @ts-nocheck
import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/:businessCode', authenticate, async (req: Request, res: Response) => {
  try {
    const config = await prisma.businessConfig.findUnique({ where: { businessCode: req.params.businessCode } });
    if (!config) { res.status(404).json({ error: 'Config not found.' }); return; }
    res.json({ config });
  } catch (e) { res.status(500).json({ error: 'Failed to fetch config.' }); }
});

router.put('/:businessCode', authenticate, async (req: Request, res: Response) => {
  try {
    const config = await prisma.businessConfig.upsert({
      where: { businessCode: req.params.businessCode },
      update: req.body,
      create: { ...req.body, businessCode: req.params.businessCode, businessName: req.body.businessName || req.params.businessCode },
    });
    res.json({ config });
  } catch (e) { res.status(500).json({ error: 'Failed to update config.' }); }
});

router.get('/', authenticate, async (_req: Request, res: Response) => {
  try {
    const configs = await prisma.businessConfig.findMany();
    res.json({ configs });
  } catch (e) { res.status(500).json({ error: 'Failed to fetch configs.' }); }
});

export default router;
