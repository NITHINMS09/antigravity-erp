import prisma from '../../utils/prisma';
import logger from '../../utils/logger';

export class AnalyticsService {
  async getOrganizationHealth(orgId?: string) {
    const where = orgId ? { user: { organizationId: orgId } } : {};
    const feedbacks = await prisma.feedback.findMany({ where: where as any, include: { department: true }, orderBy: { createdAt: 'desc' }, take: 500 });
    const total = feedbacks.length || 1;
    const avgSentiment = feedbacks.reduce((s, f) => s + (f.sentimentScore || 0), 0) / total;
    const avgStress = feedbacks.reduce((s, f) => s + (f.stressLevel || 5), 0) / total;
    const avgSatisfaction = feedbacks.reduce((s, f) => s + (f.satisfactionScore || 50), 0) / total;
    const toxicCount = feedbacks.filter(f => (f.toxicityScore || 0) > 0.5).length;
    const resolved = await prisma.complaint.count({ where: { status: 'RESOLVED' } });
    const totalComplaints = await prisma.complaint.count();

    return {
      overallScore: Math.round(((avgSentiment + 1) / 2) * 50 + (avgSatisfaction / 100) * 50),
      employeeSatisfaction: Math.round(avgSatisfaction),
      stressIndex: Math.round(avgStress * 10),
      engagementRate: Math.round(Math.min(100, (total / 30) * 100)),
      burnoutRisk: Math.round(avgStress > 7 ? 75 : avgStress > 5 ? 50 : 25),
      toxicityLevel: Math.round((toxicCount / total) * 100),
      feedbackRate: total,
      resolutionRate: totalComplaints > 0 ? Math.round((resolved / totalComplaints) * 100) : 100,
      totalFeedbacks: total,
      totalComplaints,
      resolvedComplaints: resolved,
    };
  }

  async getDepartmentAnalytics() {
    const departments = await prisma.department.findMany({ include: { feedbacks: { orderBy: { createdAt: 'desc' }, take: 100 }, _count: { select: { users: true, feedbacks: true } } } });
    return departments.map(dept => {
      const fb = dept.feedbacks;
      const total = fb.length || 1;
      const avgSent = fb.reduce((s, f) => s + (f.sentimentScore || 0), 0) / total;
      const avgStress = fb.reduce((s, f) => s + (f.stressLevel || 5), 0) / total;
      const avgSat = fb.reduce((s, f) => s + (f.satisfactionScore || 50), 0) / total;
      return {
        id: dept.id, name: dept.name, employeeCount: dept._count.users, feedbackCount: dept._count.feedbacks,
        satisfactionScore: Math.round(avgSat), stressScore: Math.round(avgStress * 10),
        sentimentScore: parseFloat(avgSent.toFixed(2)),
        burnoutRisk: avgStress > 7 ? 'HIGH' : avgStress > 5 ? 'MEDIUM' : 'LOW',
        topIssues: [...new Set(fb.flatMap(f => f.keywords))].slice(0, 5),
        trend: avgSent > 0 ? 'improving' : avgSent < -0.2 ? 'declining' : 'stable',
      };
    });
  }

  async getEmotionDistribution(departmentId?: string) {
    const where = departmentId ? { feedback: { departmentId } } : {};
    const emotions = await prisma.emotionScore.groupBy({ by: ['emotion'], where: where as any, _count: true, _avg: { score: true } });
    return emotions.map(e => ({ emotion: e.emotion, count: e._count, avgScore: e._avg.score }));
  }

  async getFeedbackTrends(days: number = 30) {
    const since = new Date(); since.setDate(since.getDate() - days);
    const feedbacks = await prisma.feedback.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true, category: true, sentimentScore: true, stressLevel: true }, orderBy: { createdAt: 'asc' } });
    const dailyMap = new Map<string, { count: number; sentiment: number; stress: number }>();
    feedbacks.forEach(f => {
      const day = f.createdAt.toISOString().split('T')[0];
      const prev = dailyMap.get(day) || { count: 0, sentiment: 0, stress: 0 };
      dailyMap.set(day, { count: prev.count + 1, sentiment: prev.sentiment + (f.sentimentScore || 0), stress: prev.stress + (f.stressLevel || 5) });
    });
    return Array.from(dailyMap.entries()).map(([date, data]) => ({
      date, count: data.count, avgSentiment: parseFloat((data.sentiment / data.count).toFixed(2)), avgStress: parseFloat((data.stress / data.count).toFixed(1)),
    }));
  }

  async getComplaintStats() {
    const statuses = await prisma.complaint.groupBy({ by: ['status'], _count: true });
    const priorities = await prisma.complaint.groupBy({ by: ['priority'], _count: true });
    const total = await prisma.complaint.count();
    const resolved = statuses.find(s => s.status === 'RESOLVED')?._count || 0;
    return { statuses: statuses.map(s => ({ status: s.status, count: s._count })), priorities: priorities.map(p => ({ priority: p.priority, count: p._count })), total, resolved, resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 100 };
  }
}

export const analyticsService = new AnalyticsService();
