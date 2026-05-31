import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { notificationService } from '../services/notification/notification.service';
import prisma from '../utils/prisma';

const router = Router();

// Notification routes
router.get('/notifications', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const unreadOnly = req.query.unread === 'true';
    const notifications = await notificationService.getUserNotifications(req.user!.userId, unreadOnly);
    res.json(notifications);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

router.get('/notifications/count', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const count = await notificationService.getUnreadCount(req.user!.userId);
    res.json({ count });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

router.patch('/notifications/:id/read', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await notificationService.markRead(req.params.id, req.user!.userId);
    res.json({ success: true });
  } catch (error: any) { res.status(400).json({ error: error.message }); }
});

router.patch('/notifications/read-all', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await notificationService.markAllRead(req.user!.userId);
    res.json({ success: true });
  } catch (error: any) { res.status(400).json({ error: error.message }); }
});

// Complaint routes
router.get('/complaints', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const where: any = {};
    if (req.user!.role === 'EMPLOYEE') where.authorId = req.user!.userId;
    if (req.query.status) where.status = req.query.status;
    const complaints = await prisma.complaint.findMany({
      where, include: { feedback: { include: { department: true } }, author: { select: { id: true, firstName: true, lastName: true } }, assignee: { select: { id: true, firstName: true, lastName: true } }, resolutionHistory: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(complaints);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

router.patch('/complaints/:id', authenticate, authorize('HR_ADMIN', 'SUPER_ADMIN', 'TEAM_MEMBER'), async (req: AuthRequest, res: Response) => {
  try {
    const complaint = await prisma.complaint.update({
      where: { id: req.params.id },
      data: { status: req.body.status, assigneeId: req.body.assigneeId, ...(req.body.status === 'RESOLVED' ? { resolvedAt: new Date() } : {}), ...(req.body.status === 'CLOSED' ? { closedAt: new Date() } : {}) },
    });
    if (req.body.action) {
      await prisma.resolutionHistory.create({ data: { complaintId: req.params.id, action: req.body.action, description: req.body.description || '', performedBy: req.user!.userId } });
    }
    res.json(complaint);
  } catch (error: any) { res.status(400).json({ error: error.message }); }
});

// User management (admin)
router.get('/users', authenticate, authorize('HR_ADMIN', 'SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, firstName: true, lastName: true, role: true, jobTitle: true, department: { select: { id: true, name: true } }, team: { select: { id: true, name: true } }, isActive: true, lastLogin: true, createdAt: true, _count: { select: { feedbacks: true, complaints: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

router.patch('/users/:id/role', authenticate, authorize('SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { role: req.body.role }, select: { id: true, email: true, firstName: true, lastName: true, role: true } });
    res.json(user);
  } catch (error: any) { res.status(400).json({ error: error.message }); }
});

// Department management
router.get('/departments', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const departments = await prisma.department.findMany({ include: { _count: { select: { users: true, feedbacks: true, teams: true } } } });
    res.json(departments);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

router.post('/departments', authenticate, authorize('HR_ADMIN', 'SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const dept = await prisma.department.create({ data: req.body });
    res.status(201).json(dept);
  } catch (error: any) { res.status(400).json({ error: error.message }); }
});

// Polls
router.get('/polls', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const polls = await prisma.poll.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' } });
    res.json(polls);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

router.post('/polls', authenticate, authorize('HR_ADMIN', 'SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const poll = await prisma.poll.create({ data: { ...req.body, createdBy: req.user!.userId } });
    res.status(201).json(poll);
  } catch (error: any) { res.status(400).json({ error: error.message }); }
});

// Activity logs
router.get('/activity-logs', authenticate, authorize('SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const logs = await prisma.activityLog.findMany({
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' }, take: 100,
    });
    res.json(logs);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

export default router;
