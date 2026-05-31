import { Router, Response } from 'express';
import { feedbackService } from '../services/feedback/feedback.service';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const feedback = await feedbackService.create({ ...req.body, userId: req.user!.userId });
    res.status(201).json(feedback);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const filters = { ...req.query, limit: parseInt(req.query.limit as string) || 50, offset: parseInt(req.query.offset as string) || 0 };
    if (req.user!.role === 'EMPLOYEE') filters.userId = req.user!.userId;
    const result = await feedbackService.getAll(filters);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/my', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const feedbacks = await feedbackService.getUserFeedbacks(req.user!.userId);
    res.json(feedbacks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const feedback = await feedbackService.getById(req.params.id);
    if (!feedback) return res.status(404).json({ error: 'Feedback not found' });
    res.json(feedback);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/status', authenticate, authorize('HR_ADMIN', 'SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const feedback = await feedbackService.updateStatus(req.params.id, req.body.status, req.user!.userId);
    res.json(feedback);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
