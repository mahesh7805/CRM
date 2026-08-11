import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const getChallans = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, status, customerId, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (search) {
      const q = (search as string).trim();
      where.OR = [
        { challanNumber: { contains: q } },
        { customer: { name: { contains: q } } },
        { customer: { businessName: { contains: q } } },
      ];
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (customerId && customerId !== 'ALL') {
      where.customerId = customerId;
    }

    const [challans, total] = await Promise.all([
      prisma.challan.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true, businessName: true, mobile: true, email: true } },
          createdBy: { select: { id: true, name: true } },
          _count: { select: { items: true } },
        },
      }),
      prisma.challan.count({ where }),
    ]);

    return res.json({
      success: true,
      challans,
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

export const getChallanById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const challan = await prisma.challan.findUnique({
      where: { id },
      include: {
        customer: true,
        createdBy: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: {
              select: { id: true, currentStock: true, minStockQuantity: true, warehouse: { select: { name: true } } },
            },
          },
        },
      },
    });

    if (!challan) {
      return res.status(404).json({ success: false, message: 'Sales Challan not found.' });
    }

    return res.json({ success: true, challan });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createChallan = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { customerId, items, notes, status } = req.body;

    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Customer and at least one product item are required.' });
    }

    const requestedStatus = status === 'CONFIRMED' ? 'CONFIRMED' : 'DRAFT';

    // Generate Next Challan Number e.g. CH-1004
    const lastChallan = await prisma.challan.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { challanNumber: true },
    });

    let nextNumber = 1001;
    if (lastChallan && lastChallan.challanNumber.startsWith('CH-')) {
      const parsed = parseInt(lastChallan.challanNumber.replace('CH-', ''), 10);
      if (!isNaN(parsed)) {
        nextNumber = parsed + 1;
      }
    }
    const challanNumber = `CH-${nextNumber}`;

    // Execute creation in transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch customer
      const customer = await tx.customer.findUnique({ where: { id: customerId } });
      if (!customer) {
        throw new Error('Customer not found.');
      }

      // 2. Process items, validate products & prices, build snapshots
      let grandTotalQty = 0;
      let grandTotalAmount = 0;
      const preparedItems: any[] = [];

      for (const item of items) {
        const { productId, quantity } = item;
        const qty = parseInt(quantity, 10);
        if (!productId || isNaN(qty) || qty <= 0) {
          throw new Error('Invalid product or quantity specified in items.');
        }

        const product = await tx.product.findUnique({ where: { id: productId } });
        if (!product) {
          throw new Error(`Product with ID ${productId} not found.`);
        }

        // Stock check if attempting direct confirmation
        if (requestedStatus === 'CONFIRMED' && product.currentStock < qty) {
          throw new Error(`Insufficient stock for Product '${product.name}' (SKU: ${product.sku}). Available: ${product.currentStock}, Requested: ${qty}.`);
        }

        const lineTotal = product.unitPrice * qty;
        grandTotalQty += qty;
        grandTotalAmount += lineTotal;

        preparedItems.push({
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          unitPrice: product.unitPrice,
          quantity: qty,
          lineTotal,
        });
      }

      // 3. Create Challan Record
      const newChallan = await tx.challan.create({
        data: {
          challanNumber,
          customerId,
          totalQuantity: grandTotalQty,
          totalAmount: grandTotalAmount,
          status: requestedStatus,
          notes: notes ? notes.trim() : null,
          createdById: req.user!.userId,
          confirmedAt: requestedStatus === 'CONFIRMED' ? new Date() : null,
          items: {
            create: preparedItems,
          },
        },
        include: { items: true },
      });

      // 4. If CONFIRMED status requested, deduct inventory and write OUT stock movements
      if (requestedStatus === 'CONFIRMED') {
        for (const item of preparedItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { decrement: item.quantity } },
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              movementType: 'OUT',
              reason: `Sales Fulfillment for Challan ${challanNumber}`,
              createdById: req.user!.userId,
            },
          });
        }
      }

      // Log Audit
      await tx.auditLog.create({
        data: {
          action: requestedStatus === 'CONFIRMED' ? 'CHALLAN_CONFIRMED' : 'CHALLAN_CREATED',
          entity: 'Challan',
          entityId: newChallan.id,
          details: `Created ${requestedStatus} Challan ${challanNumber} for ${customer.businessName} (Total ₹${grandTotalAmount.toLocaleString('en-IN')})`,
          userId: req.user!.userId,
        },
      });

      return newChallan;
    });

    return res.status(201).json({
      success: true,
      message: requestedStatus === 'CONFIRMED' ? `Challan ${challanNumber} confirmed and stock updated.` : `Challan ${challanNumber} saved as draft.`,
      challan: result,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const confirmChallan = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await prisma.$transaction(async (tx) => {
      const challan = await tx.challan.findUnique({
        where: { id },
        include: { items: true, customer: true },
      });

      if (!challan) {
        throw new Error('Challan not found.');
      }

      if (challan.status === 'CONFIRMED') {
        throw new Error(`Challan ${challan.challanNumber} is already confirmed.`);
      }

      if (challan.status === 'CANCELLED') {
        throw new Error(`Cannot confirm a cancelled challan.`);
      }

      // Validate stock for all items
      for (const item of challan.items) {
        if (!item.productId) continue;
        const product = await tx.product.findUnique({ where: { id: item.productId } });

        if (!product) {
          throw new Error(`Product '${item.productName}' no longer exists in catalog.`);
        }

        if (product.currentStock < item.quantity) {
          throw new Error(`Insufficient stock for Product '${item.productName}' (SKU: ${item.productSku}). Available: ${product.currentStock}, Requested: ${item.quantity}.`);
        }
      }

      // Deduct stock and create OUT stock movement records
      for (const item of challan.items) {
        if (!item.productId) continue;

        await tx.product.update({
          where: { id: item.productId },
          data: { currentStock: { decrement: item.quantity } },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            movementType: 'OUT',
            reason: `Sales Fulfillment for Challan ${challan.challanNumber}`,
            createdById: req.user!.userId,
          },
        });
      }

      // Update Challan Status
      const updatedChallan = await tx.challan.update({
        where: { id },
        data: {
          status: 'CONFIRMED',
          confirmedAt: new Date(),
        },
      });

      await tx.auditLog.create({
        data: {
          action: 'CHALLAN_CONFIRMED',
          entity: 'Challan',
          entityId: id,
          details: `Confirmed Challan ${challan.challanNumber} for ${challan.customer.businessName}`,
          userId: req.user!.userId,
        },
      });

      return updatedChallan;
    });

    return res.json({
      success: true,
      message: `Challan ${result.challanNumber} confirmed successfully. Inventory updated.`,
      challan: result,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const cancelChallan = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await prisma.$transaction(async (tx) => {
      const challan = await tx.challan.findUnique({
        where: { id },
        include: { items: true, customer: true },
      });

      if (!challan) {
        throw new Error('Challan not found.');
      }

      if (challan.status === 'CANCELLED') {
        throw new Error(`Challan ${challan.challanNumber} is already cancelled.`);
      }

      // If challan was CONFIRMED, restore product stock & add IN stock movement records
      if (challan.status === 'CONFIRMED') {
        for (const item of challan.items) {
          if (!item.productId) continue;

          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { increment: item.quantity } },
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              movementType: 'IN',
              reason: `Challan Cancellation Restock for ${challan.challanNumber}`,
              createdById: req.user!.userId,
            },
          });
        }
      }

      const updatedChallan = await tx.challan.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });

      await tx.auditLog.create({
        data: {
          action: 'CHALLAN_CANCELLED',
          entity: 'Challan',
          entityId: id,
          details: `Cancelled Challan ${challan.challanNumber}`,
          userId: req.user!.userId,
        },
      });

      return updatedChallan;
    });

    return res.json({
      success: true,
      message: `Challan ${result.challanNumber} has been cancelled.`,
      challan: result,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
