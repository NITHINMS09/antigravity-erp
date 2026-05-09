// @ts-nocheck
import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/workers
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const business = req.query.business as string || 'POWER_BRICK';
    const workers = await prisma.worker.findMany({
      where: { isActive: true, business },
      orderBy: { name: 'asc' },
    });
    res.json({ workers });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch workers.' });
  }
});

// GET /api/workers/:id
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const worker = await prisma.worker.findUnique({
      where: { id: req.params.id },
      include: {
        attendance: { orderBy: { date: 'desc' }, take: 30 },
        payments: { orderBy: { paidAt: 'desc' }, take: 20 },
      },
    });
    if (!worker) { res.status(404).json({ error: 'Worker not found.' }); return; }
    res.json({ worker });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch worker.' });
  }
});

// POST /api/workers
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { name, phone, address, ratePerPunch, business } = req.body;
    if (!name) { res.status(400).json({ error: 'Name is required.' }); return; }

    const worker = await prisma.worker.create({
      data: { name, phone, address, ratePerPunch: ratePerPunch || 0, business: business || 'POWER_BRICK' },
    });
    res.status(201).json({ worker });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create worker.' });
  }
});

// PUT /api/workers/:id
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const worker = await prisma.worker.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ worker });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update worker.' });
  }
});

// DELETE /api/workers/:id
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    await prisma.worker.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });
    res.json({ success: true, message: 'Worker removed successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove worker.' });
  }
});

// POST /api/workers/:id/attendance
router.post('/:id/attendance', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date, punchCount, isPresent, overtime, notes } = req.body;

    const worker = await prisma.worker.findUnique({ where: { id } });
    if (!worker) { res.status(404).json({ error: 'Worker not found.' }); return; }

    const rate = worker.ratePerPunch;
    const dailyEarning = (punchCount || 0) * rate + (overtime || 0);
    const attendanceDate = date ? new Date(date) : new Date();
    attendanceDate.setHours(0, 0, 0, 0);

    const attendance = await prisma.workerAttendance.upsert({
      where: { workerId_date: { workerId: id, date: attendanceDate } },
      update: { punchCount, isPresent, rate, dailyEarning, overtime, notes },
      create: {
        workerId: id,
        date: attendanceDate,
        punchCount: punchCount || 0,
        isPresent: isPresent !== false,
        rate,
        dailyEarning,
        overtime: overtime || 0,
        notes,
      },
    });

    // Update worker totals
    const totalEarned = await prisma.workerAttendance.aggregate({
      where: { workerId: id },
      _sum: { dailyEarning: true },
    });
    const totalPaid = await prisma.workerPayment.aggregate({
      where: { workerId: id, type: { in: ['salary', 'advance'] } },
      _sum: { amount: true },
    });

    await prisma.worker.update({
      where: { id },
      data: {
        totalEarned: totalEarned._sum.dailyEarning || 0,
        totalPaid: totalPaid._sum.amount || 0,
        pendingSalary: (totalEarned._sum.dailyEarning || 0) - (totalPaid._sum.amount || 0),
      },
    });

    res.json({ attendance });
  } catch (error: any) {
    console.error('Attendance error:', error);
    res.status(500).json({ error: 'Failed to record attendance.' });
  }
});

// POST /api/workers/:id/payment
router.post('/:id/payment', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, type, method, period, notes } = req.body;

    const payment = await prisma.workerPayment.create({
      data: { workerId: id, amount, type: type || 'salary', method, period, notes },
    });

    // Update totals
    const totalPaid = await prisma.workerPayment.aggregate({
      where: { workerId: id, type: { in: ['salary', 'advance'] } },
      _sum: { amount: true },
    });
    const worker = await prisma.worker.findUnique({ where: { id } });
    if (worker) {
      await prisma.worker.update({
        where: { id },
        data: {
          totalPaid: totalPaid._sum.amount || 0,
          pendingSalary: worker.totalEarned - (totalPaid._sum.amount || 0),
        },
      });
    }

    res.json({ payment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create payment.' });
  }
});

export default router;
