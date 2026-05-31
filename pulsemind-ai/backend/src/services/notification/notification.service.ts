import prisma from '../../utils/prisma';
import logger from '../../utils/logger';

export class NotificationService {
  async create(data: { userId: string; type: string; title: string; message: string; link?: string; metadata?: any }) {
    return prisma.notification.create({ data: data as any });
  }

  async getUserNotifications(userId: string, unreadOnly = false) {
    return prisma.notification.findMany({
      where: { userId, ...(unreadOnly ? { isRead: false } : {}) },
      orderBy: { createdAt: 'desc' }, take: 50,
    });
  }

  async markRead(id: string, userId: string) {
    return prisma.notification.update({ where: { id }, data: { isRead: true } });
  }

  async markAllRead(userId: string) {
    return prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
  }

  async getUnreadCount(userId: string) {
    return prisma.notification.count({ where: { userId, isRead: false } });
  }

  async createBulk(userIds: string[], data: { type: string; title: string; message: string; link?: string }) {
    return prisma.notification.createMany({
      data: userIds.map(userId => ({ userId, ...data } as any)),
    });
  }
}

export const notificationService = new NotificationService();
