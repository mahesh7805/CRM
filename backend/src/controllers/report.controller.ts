import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const getDashboardSummary = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const [
      totalCustomers,
      activeCustomers,
      totalProducts,
      allProducts,
      todayChallans,
      pendingFollowups,
      overdueFollowups,
      recentMovements,
      recentAuditLogs,
      recentChallans,
      customerStatusCounts,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { status: 'ACTIVE' } }),
      prisma.product.count(),
      prisma.product.findMany({
        include: { category: true },
      }),
      prisma.challan.count({
        where: { createdAt: { gte: todayStart, lte: todayEnd } },
      }),
      prisma.customerFollowup.count({ where: { status: 'PENDING' } }),
      prisma.customerFollowup.count({
        where: { status: 'PENDING', followupDate: { lt: todayStart } },
      }),
      prisma.stockMovement.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { name: true, sku: true } },
          createdBy: { select: { name: true } },
        },
      }),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } } },
      }),
      prisma.challan.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { name: true, businessName: true } },
        },
      }),
      prisma.customer.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ]);

    // Calculate total inventory valuation & low stock items count
    let totalInventoryValue = 0;
    const lowStockProducts: any[] = [];

    allProducts.forEach((p) => {
      totalInventoryValue += p.currentStock * p.unitPrice;
      if (p.currentStock <= p.minStockQuantity) {
        lowStockProducts.push({
          id: p.id,
          name: p.name,
          sku: p.sku,
          currentStock: p.currentStock,
          minStockQuantity: p.minStockQuantity,
          categoryName: p.category.name,
          stockStatus: p.currentStock === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
        });
      }
    });

    // Sales activity trend (last 6 confirmed challans revenue)
    const confirmedChallans = await prisma.challan.findMany({
      where: { status: 'CONFIRMED' },
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: { customer: { select: { businessName: true } } },
    });

    // Group sales by Category for charts
    const categoryValuationMap: Record<string, { category: string; value: number; count: number }> = {};
    allProducts.forEach((p) => {
      const catName = p.category.name;
      if (!categoryValuationMap[catName]) {
        categoryValuationMap[catName] = { category: catName, value: 0, count: 0 };
      }
      categoryValuationMap[catName].value += p.currentStock * p.unitPrice;
      categoryValuationMap[catName].count += p.currentStock;
    });

    const categoryChartData = Object.values(categoryValuationMap);

    return res.json({
      success: true,
      kpis: {
        totalCustomers,
        activeCustomers,
        totalProducts,
        totalInventoryValue,
        lowStockCount: lowStockProducts.length,
        todayChallans,
        pendingFollowups,
        overdueFollowups,
      },
      lowStockProducts,
      recentMovements,
      recentAuditLogs,
      recentChallans,
      charts: {
        categoryChartData,
        customerStatusBreakdown: customerStatusCounts.map((c) => ({
          status: c.status,
          count: c._count.status,
        })),
        salesTrend: confirmedChallans.slice(0, 10).map((ch) => ({
          challanNumber: ch.challanNumber,
          customer: ch.customer.businessName,
          amount: ch.totalAmount,
          date: ch.createdAt.toISOString().split('T')[0],
        })),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getInventoryReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        warehouse: true,
      },
      orderBy: { name: 'asc' },
    });

    const report = products.map((p) => {
      const totalVal = p.currentStock * p.unitPrice;
      let status = 'IN_STOCK';
      if (p.currentStock === 0) status = 'OUT_OF_STOCK';
      else if (p.currentStock <= p.minStockQuantity) status = 'LOW_STOCK';

      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category.name,
        warehouse: p.warehouse.name,
        unitPrice: p.unitPrice,
        currentStock: p.currentStock,
        minStockQuantity: p.minStockQuantity,
        totalValue: totalVal,
        stockStatus: status,
      };
    });

    return res.json({ success: true, report });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getChallanReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const challans = await prisma.challan.findMany({
      include: {
        customer: true,
        createdBy: { select: { name: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const report = challans.map((ch) => ({
      id: ch.id,
      challanNumber: ch.challanNumber,
      customerName: ch.customer.name,
      businessName: ch.customer.businessName,
      status: ch.status,
      totalQuantity: ch.totalQuantity,
      totalAmount: ch.totalAmount,
      createdBy: ch.createdBy.name,
      createdAt: ch.createdAt,
      confirmedAt: ch.confirmedAt,
      itemCount: ch.items.length,
    }));

    return res.json({ success: true, report });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
