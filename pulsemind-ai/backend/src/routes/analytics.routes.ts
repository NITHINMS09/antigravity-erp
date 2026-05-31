import { Router, Response } from 'express';
import { analyticsService } from '../services/analytics/analytics.service';
import { analyzeFeedback, predictBurnout, detectPatterns, generateRecommendations, generateSummary } from '../services/ai/ai.service';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';

const router = Router();

router.get('/health', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const health = await analyticsService.getOrganizationHealth(req.user!.organizationId);
    res.json(health);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

router.get('/departments', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const analytics = await analyticsService.getDepartmentAnalytics();
    res.json(analytics);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

router.get('/emotions', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const emotions = await analyticsService.getEmotionDistribution(req.query.departmentId as string);
    res.json(emotions);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

router.get('/trends', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const trends = await analyticsService.getFeedbackTrends(days);
    res.json(trends);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

router.get('/complaints', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const stats = await analyticsService.getComplaintStats();
    res.json(stats);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

router.get('/burnout/:userId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const history = await prisma.feedback.findMany({ where: { userId: req.params.userId }, orderBy: { createdAt: 'desc' }, take: 50 });
    const result = await predictBurnout(req.params.userId, history);
    res.json(result);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

router.get('/patterns', authenticate, authorize('HR_ADMIN', 'SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const feedbacks = await prisma.feedback.findMany({ include: { department: true }, orderBy: { createdAt: 'desc' }, take: 500 });
    const patterns = await detectPatterns(feedbacks);
    res.json(patterns);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

router.get('/summary', authenticate, authorize('HR_ADMIN', 'SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const feedbacks = await prisma.feedback.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
    const summary = await generateSummary(feedbacks);
    res.json({ summary });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

router.post('/analyze', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await analyzeFeedback(req.body.text, req.body.category);
    res.json(result);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

export default router;
