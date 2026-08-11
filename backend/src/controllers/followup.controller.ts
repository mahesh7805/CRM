import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const getFollowups = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, filter, page = '1', limit = '15' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    if (filter === 'OVERDUE') {
      where.status = 'PENDING';
      where.followupDate = { lt: todayStart };
    } else if (filter === 'TODAY') {
      where.status = 'PENDING';
      where.followupDate = { gte: todayStart, lte: todayEnd };
    } else if (filter === 'UPCOMING') {
      where.status = 'PENDING';
      where.followupDate = { gt: todayEnd };
    }

    const [followups, total] = await Promise.all([
      prisma.customerFollowup.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { followupDate: 'asc' },
        include: {
          customer: {
            select: { id: true, name: true, businessName: true, mobile: true, email: true, status: true },
          },
          createdBy: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.customerFollowup.count({ where }),
    ]);

    // Enhance with overdue flag
    const enhanced = followups.map((f) => ({
      ...f,
      isOverdue: f.status === 'PENDING' && new Date(f.followupDate) < todayStart,
      isToday: f.status === 'PENDING' && new Date(f.followupDate) >= todayStart && new Date(f.followupDate) <= todayEnd,
    }));

    return res.json({
      success: true,
      followups: enhanced,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createFollowup = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { customerId, notes, followupDate } = req.body;

    if (!customerId || !notes || !followupDate) {
      return res.status(400).json({ success: false, message: 'Customer ID, Notes, and Follow-up Date are required.' });
    }

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const targetDate = new Date(followupDate);

    const followup = await prisma.customerFollowup.create({
      data: {
        customerId,
        notes: notes.trim(),
        followupDate: targetDate,
        status: 'PENDING',
        createdById: req.user!.userId,
      },
      include: { customer: true },
    });

    // Also update customer's next followupDate field
    await prisma.customer.update({
      where: { id: customerId },
      data: { followupDate: targetDate },
    });

    return res.status(201).json({ success: true, followup });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const completeFollowup = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { nextFollowupDate, nextNotes } = req.body;

    const followup = await prisma.customerFollowup.findUnique({ where: { id } });
    if (!followup) {
      return res.status(404).json({ success: false, message: 'Followup task not found.' });
    }

    const updated = await prisma.customerFollowup.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    // If next followup details provided, schedule a new followup item
    let newFollowup = null;
    if (nextFollowupDate && nextNotes) {
      const nextDate = new Date(nextFollowupDate);
      newFollowup = await prisma.customerFollowup.create({
        data: {
          customerId: followup.customerId,
          notes: nextNotes.trim(),
          followupDate: nextDate,
          status: 'PENDING',
          createdById: req.user!.userId,
        },
      });

      await prisma.customer.update({
        where: { id: followup.customerId },
        data: { followupDate: nextDate },
      });
    }

    return res.json({
      success: true,
      message: 'Followup marked as completed.',
      followup: updated,
      nextFollowup: newFollowup,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
