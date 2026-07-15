import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';
import { authenticate } from '../middleware/auth';
import { cacheMiddleware } from '../utils/cache';

const router = Router();

// GET /api/dashboard
router.get('/', authenticate, cacheMiddleware(60), async (_req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);

    // Run all independent queries in parallel instead of sequentially
    const [
      dailySales,
      weeklySales,
      monthlySales,
      pendingPayments,
      lowStockItems,
      monthlyExpenses,
      workerPayments,
      transportExpenses,
      purchaseCosts,
      recentInvoices,
      bakeryDailySales,
    ] = await Promise.all([
      // Daily sales
      prisma.invoice.aggregate({
        where: { invoiceDate: { gte: today } },
        _sum: { grandTotal: true },
        _count: true,
      }),
      // Weekly sales
      prisma.invoice.aggregate({
        where: { invoiceDate: { gte: weekAgo } },
        _sum: { grandTotal: true },
        _count: true,
      }),
      // Monthly sales
      prisma.invoice.aggregate({
        where: { invoiceDate: { gte: monthAgo } },
        _sum: { grandTotal: true },
        _count: true,
      }),
      // Pending payments
      prisma.invoice.aggregate({
        where: { paymentStatus: { not: 'paid' } },
        _sum: { dueAmount: true },
        _count: true,
      }),
      // Low stock — filter at DB level instead of fetching ALL and filtering in JS
      prisma.$queryRawUnsafe<Array<{ id: string; quantity: number; minLevel: number; materialId: string; materialName: string; materialUnit: string }>>(
        `SELECT s.id, s.quantity, s."minLevel", s."materialId", m.name as "materialName", m.unit as "materialUnit"
         FROM "Stock" s JOIN "Material" m ON s."materialId" = m.id
         WHERE s.quantity <= s."minLevel"
         ORDER BY s.quantity ASC
         LIMIT 10`
      ),
      // Monthly expenses
      prisma.expense.aggregate({
        where: { createdAt: { gte: monthAgo } },
        _sum: { amount: true },
      }),
      // Worker payments
      prisma.workerPayment.aggregate({
        where: { createdAt: { gte: monthAgo } },
        _sum: { amount: true },
      }),
      // Transport expenses
      prisma.transport.aggregate({
        where: { createdAt: { gte: monthAgo } },
        _sum: { totalCost: true },
      }),
      // Purchase costs
      prisma.purchase.aggregate({
        where: { createdAt: { gte: monthAgo } },
        _sum: { grandTotal: true },
      }),
      // Recent invoices — use select to reduce payload
      prisma.invoice.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          invoiceNumber: true,
          grandTotal: true,
          createdAt: true,
          customer: { select: { name: true } },
        },
      }),
      // Bakery daily sales
      prisma.bakerySale.aggregate({
        where: { saleDate: { gte: today } },
        _sum: { totalAmount: true, cashAmount: true, upiAmount: true, cardAmount: true },
      }),
    ]);

    // Sales trend — run all 7 days in parallel instead of sequential loop
    const trendPromises = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(today);
      dayStart.setDate(dayStart.getDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      trendPromises.push(
        prisma.invoice.aggregate({
          where: { invoiceDate: { gte: dayStart, lt: dayEnd } },
          _sum: { grandTotal: true },
        }).then(result => ({
          date: dayStart.toISOString().split('T')[0],
          sales: result._sum.grandTotal || 0,
        }))
      );
    }
    const salesTrend = await Promise.all(trendPromises);

    // Transform low stock results for frontend compatibility
    const formattedLowStock = lowStockItems.map((s: any) => ({
      id: s.id,
      quantity: s.quantity,
      minLevel: s.minLevel,
      materialId: s.materialId,
      material: { name: s.materialName, unit: s.materialUnit },
    }));

    const totalRevenue = monthlySales._sum.grandTotal || 0;
    const totalCosts =
      (purchaseCosts._sum.grandTotal || 0) +
      (workerPayments._sum.amount || 0) +
      (transportExpenses._sum.totalCost || 0) +
      (monthlyExpenses._sum.amount || 0);

    res.json({
      dailySales: { total: dailySales._sum.grandTotal || 0, count: dailySales._count },
      weeklySales: { total: weeklySales._sum.grandTotal || 0, count: weeklySales._count },
      monthlySales: { total: monthlySales._sum.grandTotal || 0, count: monthlySales._count },
      monthlyProfit: totalRevenue - totalCosts,
      pendingPayments: { total: pendingPayments._sum.dueAmount || 0, count: pendingPayments._count },
      lowStockAlerts: formattedLowStock.length,
      lowStockItems: formattedLowStock.slice(0, 5),
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
