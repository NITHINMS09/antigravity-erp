import prisma from '../../utils/prisma';
import { analyzeFeedback, detectToxicity } from '../ai/ai.service';
import logger from '../../utils/logger';

export class FeedbackService {
  async create(data: any) {
    const aiResult = await analyzeFeedback(data.content, data.category);
    const toxicity = await detectToxicity(data.content);

    const feedback = await prisma.feedback.create({
      data: {
        userId: data.isAnonymous ? null : data.userId,
        isAnonymous: data.isAnonymous || false,
        anonymousToken: data.isAnonymous ? `anon_${Date.now()}_${Math.random().toString(36).slice(2)}` : null,
        category: data.category,
        priority: data.priority || 'MEDIUM',
        title: data.title,
        content: data.content,
        departmentId: data.departmentId,
        branch: data.branch,
        starRating: data.starRating,
        moodEmoji: data.moodEmoji,
        stressLevel: data.stressLevel,
        satisfactionScore: data.satisfactionScore,
        keywords: aiResult.keywords,
        attachments: data.attachments || [],
        voiceRecording: data.voiceRecording,
        language: data.language || 'en',
        sentimentScore: aiResult.sentiment,
        emotionDetected: aiResult.emotion,
        toxicityScore: toxicity.score,
        urgencyScore: aiResult.urgencyScore,
        aiSummary: aiResult.summary,
        aiCategory: aiResult.category,
        aiSuggestions: aiResult.suggestions,
        status: 'SUBMITTED',
      },
      include: { user: { select: { id: true, firstName: true, lastName: true } }, department: true },
    });

    if (feedback.emotionDetected) {
      await prisma.emotionScore.create({
        data: { userId: data.userId, feedbackId: feedback.id, emotion: feedback.emotionDetected, score: Math.abs(aiResult.sentiment), confidence: aiResult.confidence },
      });
    }

    if (toxicity.score > 0.5) {
      await prisma.aIInsight.create({
        data: { type: 'TOXICITY_ALERT', title: 'Toxicity Detected', content: `Toxicity score: ${toxicity.score.toFixed(2)}. Categories: ${toxicity.categories.join(', ')}`, severity: toxicity.severity, feedbackId: feedback.id, departmentId: data.departmentId },
      });
    }

    if (data.category === 'COMPLAINT' || data.priority === 'HIGH' || data.priority === 'CRITICAL') {
      await prisma.complaint.create({
        data: { feedbackId: feedback.id, authorId: data.userId, status: 'AI_PROCESSING', priority: data.priority || 'MEDIUM', aiResolution: aiResult.suggestions?.[0] || null, aiConfidence: aiResult.confidence },
      });
    }

    logger.info(`Feedback created: ${feedback.id}`);
    return feedback;
  }

  async getAll(filters: any = {}) {
    const where: any = {};
    if (filters.category) where.category = filters.category;
    if (filters.priority) where.priority = filters.priority;
    if (filters.status) where.status = filters.status;
    if (filters.departmentId) where.departmentId = filters.departmentId;
    if (filters.userId) where.userId = filters.userId;
    if (filters.dateFrom) where.createdAt = { ...where.createdAt, gte: new Date(filters.dateFrom) };
    if (filters.dateTo) where.createdAt = { ...where.createdAt, lte: new Date(filters.dateTo) };

    const [feedbacks, total] = await Promise.all([
      prisma.feedback.findMany({
        where, include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } }, department: { select: { id: true, name: true } }, complaint: true },
        orderBy: { createdAt: 'desc' }, take: filters.limit || 50, skip: filters.offset || 0,
      }),
      prisma.feedback.count({ where }),
    ]);
    return { feedbacks, total, page: Math.floor((filters.offset || 0) / (filters.limit || 50)) + 1 };
  }

  async getById(id: string) {
    return prisma.feedback.findUnique({
      where: { id }, include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true, email: true } }, department: true, complaint: { include: { resolutionHistory: true } }, emotionScores: true, aiInsights: true },
    });
  }

  async getUserFeedbacks(userId: string) {
    return prisma.feedback.findMany({
      where: { userId }, include: { department: { select: { id: true, name: true } }, complaint: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: string, userId: string) {
    const feedback = await prisma.feedback.update({ where: { id }, data: { status: status as any } });
    if (feedback.complaint) {
      await prisma.complaint.update({ where: { feedbackId: id }, data: { status: status as any } });
    }
    await prisma.activityLog.create({ data: { userId, action: 'UPDATE_STATUS', entity: 'Feedback', entityId: id, details: { status } } });
    return feedback;
  }
}

export const feedbackService = new FeedbackService();
