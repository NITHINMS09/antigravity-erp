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
    const { id } = req.params;
    // Check if worker has attendance or payments
    const attendanceCount = await prisma.workerAttendance.count({ where: { workerId: id } });
    if (attendanceCount > 0) {
      await prisma.worker.update({
        where: { id },
        data: { isActive: false },
      });
      res.json({ success: true, message: 'Worker deactivated (has history).' });
    } else {
      await prisma.worker.delete({ where: { id } });
      res.json({ success: true, message: 'Worker permanently deleted.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove worker.' });
  }
});

// POST /api/workers/:id/attendance
router.post('/:id/attendance', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date, punchCount, isPresent, overtime, notes, punchType } = req.body;

    if (punchCount < 0 || overtime < 0) {
      res.status(400).json({ error: 'Values cannot be negative.' });
      return;
    }

    const worker = await prisma.worker.findUnique({ where: { id } });
    if (!worker) { res.status(404).json({ error: 'Worker not found.' }); return; }

    const rate = worker.ratePerPunch;
    const dailyEarning = (punchCount || 0) * rate + (overtime || 0);
    const attendanceDate = date ? new Date(date) : new Date();
    attendanceDate.setHours(0, 0, 0, 0);

    // Find existing attendance to handle stock reversal
    const existing = await prisma.workerAttendance.findUnique({
      where: { workerId_date: { workerId: id, date: attendanceDate } }
    });

    if (existing && existing.bricksProduced > 0 && existing.punchType) {
      const oldMatCode = existing.punchType === '4_inch' ? '4_INCH_BRICK' : '6_INCH_BRICK';
      const oldMat = await prisma.material.findUnique({ where: { code: oldMatCode } });
      if (oldMat) {
        await prisma.stock.update({
          where: { materialId: oldMat.id },
          data: { quantity: { decrement: existing.bricksProduced } }
        });
        await prisma.stockMovement.create({
          data: {
            materialId: oldMat.id, type: 'OUT', quantity: existing.bricksProduced,
            referenceType: 'ADJUSTMENT', notes: `Reversed previous punch for ${worker.name} on ${attendanceDate.toDateString()}`
          }
        });
      }
    }

    let bricksProduced = 0;
    if (punchCount && punchType) {
      if (punchType === '4_inch') bricksProduced = punchCount * 8;
      else if (punchType === '6_inch') bricksProduced = punchCount * 5;
    }

    const attendance = await prisma.workerAttendance.upsert({
      where: { workerId_date: { workerId: id, date: attendanceDate } },
      update: { punchCount, isPresent, rate, dailyEarning, overtime, notes, punchType, bricksProduced },
      create: {
        workerId: id,
        date: attendanceDate,
        punchCount: punchCount || 0,
        isPresent: isPresent !== false,
        rate,
        dailyEarning,
        overtime: overtime || 0,
        notes,
        punchType,
        bricksProduced
      },
    });

    if (bricksProduced > 0 && punchType) {
      const materialCode = punchType === '4_inch' ? '4_INCH_BRICK' : '6_INCH_BRICK';
      const materialName = punchType === '4_inch' ? '4 Inch Brick' : '6 Inch Brick';

      let material = await prisma.material.findUnique({ where: { code: materialCode } });
      if (!material) {
        material = await prisma.material.create({
          data: {
            name: materialName, code: materialCode, unit: 'pieces', category: 'brick',
            defaultRate: 0, gstRate: 0, sortOrder: 0
          }
        });
        await prisma.stock.create({ data: { materialId: material.id, quantity: 0, minLevel: 0 } });
      }

      await prisma.stock.update({
        where: { materialId: material.id },
        data: { quantity: { increment: bricksProduced }, lastUpdated: new Date() }
      });

      const punchLabel = punchType === '4_inch' ? '4 Inch' : '6 Inch';
      await prisma.stockMovement.create({
        data: {
          materialId: material.id, type: 'IN', quantity: bricksProduced,
          referenceType: 'ADJUSTMENT',
          notes: `Worker Punch: ${punchCount} punches of ${punchLabel} by ${worker.name}`
        }
      });
    }

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

// DELETE /api/workers/attendance/:id
router.delete('/attendance/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const attendance = await prisma.workerAttendance.findUnique({
      where: { id },
      include: { worker: true }
    });

    if (!attendance) {
      res.status(404).json({ error: 'Attendance record not found.' });
      return;
    }

    // Reverse stock if bricks were produced
    if (attendance.bricksProduced > 0 && attendance.punchType) {
      const matCode = attendance.punchType === '4_inch' ? '4_INCH_BRICK' : '6_INCH_BRICK';
      const material = await prisma.material.findUnique({ where: { code: matCode } });
      if (material) {
        await prisma.stock.update({
          where: { materialId: material.id },
          data: { quantity: { decrement: attendance.bricksProduced } }
        });
        await prisma.stockMovement.create({
          data: {
            materialId: material.id, type: 'OUT', quantity: attendance.bricksProduced,
            referenceType: 'ADJUSTMENT', notes: `Deleted punch for ${attendance.worker.name} on ${attendance.date.toDateString()}`
          }
        });
      }
    }

    const workerId = attendance.workerId;
    await prisma.workerAttendance.delete({ where: { id } });

    // Update worker totals
    const totalEarned = await prisma.workerAttendance.aggregate({
      where: { workerId },
      _sum: { dailyEarning: true },
    });
    const totalPaid = await prisma.workerPayment.aggregate({
      where: { workerId, type: { in: ['salary', 'advance'] } },
      _sum: { amount: true },
    });

    await prisma.worker.update({
      where: { id: workerId },
      data: {
        totalEarned: totalEarned._sum.dailyEarning || 0,
        totalPaid: totalPaid._sum.amount || 0,
        pendingSalary: (totalEarned._sum.dailyEarning || 0) - (totalPaid._sum.amount || 0),
      },
    });

    res.json({ success: true, message: 'Attendance record deleted.' });
  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({ error: 'Failed to delete attendance record.' });
  }
});

// POST /api/workers/:id/payment
router.post('/:id/payment', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, type, method, period, notes } = req.body;

    if (amount <= 0) {
      res.status(400).json({ error: 'Amount must be positive.' });
      return;
    }

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
