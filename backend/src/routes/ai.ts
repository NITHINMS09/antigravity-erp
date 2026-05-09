// @ts-nocheck
import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/insights', authenticate, async (_req: Request, res: Response) => {
  try {
    // AI insights - placeholder until Gemini integration
    res.json({
      insights: [
        { type: 'tip', title: 'Sales Trend', message: 'Your weekly sales are trending upward by 12%. Keep up the momentum!' },
        { type: 'warning', title: 'Low Stock Alert', message: 'Cement and 4-inch bricks are running low. Consider restocking soon.' },
        { type: 'info', title: 'Payment Collection', message: '₹45,000 in pending payments from 8 customers. Send reminders.' },
        { type: 'success', title: 'Profit Growth', message: 'Monthly profit has increased by 8% compared to last month.' },
      ],
    });
  } catch (e) { res.status(500).json({ error: 'Failed to fetch AI insights.' }); }
});

router.post('/analyze', authenticate, async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    // Placeholder for Gemini AI integration
    res.json({ analysis: `AI Analysis for: "${prompt}" — Full Gemini integration coming soon.` });
  } catch (e) { res.status(500).json({ error: 'AI analysis failed.' }); }
});

export default router;
