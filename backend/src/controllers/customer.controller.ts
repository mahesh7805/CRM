import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const getCustomers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, status, type, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (search) {
      const q = (search as string).trim();
      where.OR = [
        { name: { contains: q } },
        { businessName: { contains: q } },
        { email: { contains: q } },
        { mobile: { contains: q } },
        { gstNumber: { contains: q } },
      ];
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (type && type !== 'ALL') {
      where.customerType = type;
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { challans: true, followups: true },
          },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    return res.json({
      success: true,
      customers,
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

export const getCustomerById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        followups: {
          orderBy: { followupDate: 'asc' },
          include: { createdBy: { select: { id: true, name: true } } },
        },
        challans: {
          orderBy: { createdAt: 'desc' },
          include: { createdBy: { select: { id: true, name: true } } },
        },
      },
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    // Build CRM Activity Timeline
    const timeline: any[] = [];

    // 1. Account Creation event
    timeline.push({
      id: `created-${customer.id}`,
      type: 'CUSTOMER_CREATED',
      title: 'Customer Onboarded',
      description: `Customer account created for ${customer.businessName}`,
      timestamp: customer.createdAt,
    });

    // 2. Followup events
    customer.followups.forEach((f) => {
      timeline.push({
        id: `followup-${f.id}`,
        type: 'FOLLOWUP_SCHEDULED',
        title: `Follow-up ${f.status}`,
        description: f.notes,
        timestamp: f.createdAt,
        user: f.createdBy.name,
      });
    });

    // 3. Challan events
    customer.challans.forEach((ch) => {
      timeline.push({
        id: `challan-${ch.id}`,
        type: 'CHALLAN_CREATED',
        title: `Challan ${ch.challanNumber} (${ch.status})`,
        description: `Total Items: ${ch.totalQuantity} | Amount: ₹${ch.totalAmount.toLocaleString('en-IN')}`,
        timestamp: ch.createdAt,
        user: ch.createdBy.name,
      });
    });

    // Sort timeline by timestamp descending
    timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return res.json({
      success: true,
      customer,
      timeline,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createCustomer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, mobile, email, businessName, gstNumber, customerType, address, status, followupDate, notes } = req.body;

    if (!name || !mobile || !businessName || !address) {
      return res.status(400).json({ success: false, message: 'Name, Mobile, Business Name, and Address are required.' });
    }

    const customer = await prisma.customer.create({
      data: {
        name: name.trim(),
        mobile: mobile.trim(),
        email: email ? email.trim() : null,
        businessName: businessName.trim(),
        gstNumber: gstNumber ? gstNumber.trim().toUpperCase() : null,
        customerType: customerType || 'WHOLESALE',
        address: address.trim(),
        status: status || 'LEAD',
        followupDate: followupDate ? new Date(followupDate) : null,
        notes: notes ? notes.trim() : null,
      },
    });

    // If initial followup date or note provided, create a CustomerFollowup entry
    if (followupDate || notes) {
      await prisma.customerFollowup.create({
        data: {
          customerId: customer.id,
          notes: notes || 'Initial customer onboarding note.',
          followupDate: followupDate ? new Date(followupDate) : new Date(),
          status: 'PENDING',
          createdById: req.user!.userId,
        },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'CUSTOMER_CREATED',
        entity: 'Customer',
        entityId: customer.id,
        details: `Created customer ${customer.name} (${customer.businessName})`,
        userId: req.user!.userId,
      },
    });

    return res.status(201).json({ success: true, customer });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCustomer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, mobile, email, businessName, gstNumber, customerType, address, status, followupDate, notes } = req.body;

    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name: name ? name.trim() : existing.name,
        mobile: mobile ? mobile.trim() : existing.mobile,
        email: email !== undefined ? (email ? email.trim() : null) : existing.email,
        businessName: businessName ? businessName.trim() : existing.businessName,
        gstNumber: gstNumber !== undefined ? (gstNumber ? gstNumber.trim().toUpperCase() : null) : existing.gstNumber,
        customerType: customerType || existing.customerType,
        address: address ? address.trim() : existing.address,
        status: status || existing.status,
        followupDate: followupDate !== undefined ? (followupDate ? new Date(followupDate) : null) : existing.followupDate,
        notes: notes !== undefined ? (notes ? notes.trim() : null) : existing.notes,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'CUSTOMER_UPDATED',
        entity: 'Customer',
        entityId: customer.id,
        details: `Updated customer details for ${customer.businessName}`,
        userId: req.user!.userId,
      },
    });

    return res.json({ success: true, customer });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCustomer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    // Deactivate rather than hard delete if customer has linked challans
    const challanCount = await prisma.challan.count({ where: { customerId: id } });

    if (challanCount > 0) {
      await prisma.customer.update({
        where: { id },
        data: { status: 'INACTIVE' },
      });
      return res.json({ success: true, message: 'Customer has active transaction history and was set to INACTIVE status.' });
    }

    await prisma.customer.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: 'CUSTOMER_DELETED',
        entity: 'Customer',
        entityId: id,
        details: `Deleted customer ${customer.businessName}`,
        userId: req.user!.userId,
      },
    });

    return res.json({ success: true, message: 'Customer deleted successfully.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
