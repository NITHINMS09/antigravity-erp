// @ts-nocheck
import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/dashboard
router.get('/', authenticate, async (_req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);

    // Daily sales
    const dailySales = await prisma.invoice.aggregate({
      where: { invoiceDate: { gte: today } },
      _sum: { grandTotal: true },
      _count: true,
    });

    // Weekly sales
    const weeklySales = await prisma.invoice.aggregate({
      where: { invoiceDate: { gte: weekAgo } },
      _sum: { grandTotal: true },
      _count: true,
    });

    // Monthly sales
    const monthlySales = await prisma.invoice.aggregate({
      where: { invoiceDate: { gte: monthAgo } },
      _sum: { grandTotal: true },
      _count: true,
    });

    // Pending payments
    const pendingPayments = await prisma.invoice.aggregate({
      where: { paymentStatus: { not: 'paid' } },
      _sum: { dueAmount: true },
      _count: true,
    });

    // Low stock alerts
    const lowStockItems = await prisma.stock.findMany({
      where: {
        quantity: { lte: 0 }
      },
      include: { material: true },
    });

    // Also get items where quantity <= minLevel
    const allStock = await prisma.stock.findMany({
      include: { material: true },
    });
    const lowStockAlerts = allStock.filter(s => s.quantity <= s.minLevel);

    // Recent expenses
    const monthlyExpenses = await prisma.expense.aggregate({
      where: { createdAt: { gte: monthAgo } },
      _sum: { amount: true },
    });

    // Worker expenses this month
    const workerPayments = await prisma.workerPayment.aggregate({
      where: { createdAt: { gte: monthAgo } },
      _sum: { amount: true },
    });

    // Transport expenses this month
    const transportExpenses = await prisma.transport.aggregate({
      where: { createdAt: { gte: monthAgo } },
      _sum: { totalCost: true },
    });

    // Purchase costs this month
    const purchaseCosts = await prisma.purchase.aggregate({
      where: { createdAt: { gte: monthAgo } },
      _sum: { grandTotal: true },
    });

    // Recent invoices
    const recentInvoices = await prisma.invoice.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { customer: true },
    });

    // Bakery daily sales
    const bakeryDailySales = await prisma.bakerySale.aggregate({
      where: { saleDate: { gte: today } },
      _sum: { totalAmount: true, cashAmount: true, upiAmount: true, cardAmount: true },
    });

    // Sales trend (last 7 days)
    const salesTrend = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(today);
      dayStart.setDate(dayStart.getDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const daySales = await prisma.invoice.aggregate({
        where: { invoiceDate: { gte: dayStart, lt: dayEnd } },
        _sum: { grandTotal: true },
      });

      salesTrend.push({
        date: dayStart.toISOString().split('T')[0],
        sales: daySales._sum.grandTotal || 0,
      });
    }

    const totalRevenue = (monthlySales._sum.grandTotal || 0);
    const totalCosts = (purchaseCosts._sum.grandTotal || 0) +
      (workerPayments._sum.amount || 0) +
      (transportExpenses._sum.totalCost || 0) +
      (monthlyExpenses._sum.amount || 0);

    res.json({
      dailySales: { total: dailySales._sum.grandTotal || 0, count: dailySales._count },
      weeklySales: { total: weeklySales._sum.grandTotal || 0, count: weeklySales._count },
      monthlySales: { total: monthlySales._sum.grandTotal || 0, count: monthlySales._count },
      monthlyProfit: totalRevenue - totalCosts,
      pendingPayments: { total: pendingPayments._sum.dueAmount || 0, count: pendingPayments._count },
      lowStockAlerts: lowStockAlerts.length,
      lowStockItems: lowStockAlerts.slice(0, 5),
      expenses: {
        labour: workerPayments._sum.amount || 0,
        transport: transportExpenses._sum.totalCost || 0,
        general: monthlyExpenses._sum.amount || 0,
        purchases: purchaseCosts._sum.grandTotal || 0,
      },
      bakeryDailySales: {
        total: bakeryDailySales._sum.totalAmount || 0,
        cash: bakeryDailySales._sum.cashAmount || 0,
        upi: bakeryDailySales._sum.upiAmount || 0,
        card: bakeryDailySales._sum.cardAmount || 0,
      },
      recentInvoices,
      salesTrend,
    });
  } catch (error: any) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data.' });
  }
});

export default router;
