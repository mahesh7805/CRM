import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const getStockMovements = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { productId, movementType, userId, search, page = '1', limit = '15' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (productId && productId !== 'ALL') {
      where.productId = productId;
    }

    if (movementType && movementType !== 'ALL') {
      where.movementType = movementType;
    }

    if (userId && userId !== 'ALL') {
      where.createdById = userId;
    }

    if (search) {
      const q = (search as string).trim();
      where.OR = [
        { reason: { contains: q } },
        { product: { name: { contains: q } } },
        { product: { sku: { contains: q } } },
      ];
    }

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: { id: true, name: true, sku: true, category: { select: { name: true } } },
          },
          createdBy: {
            select: { id: true, name: true, role: { select: { name: true } } },
          },
        },
      }),
      prisma.stockMovement.count({ where }),
    ]);

    return res.json({
      success: true,
      movements,
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

export const adjustStock = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { productId, quantity, movementType, reason } = req.body;

    if (!productId || !quantity || !movementType || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, Quantity, Movement Type (IN/OUT), and Reason are required.',
      });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive integer.' });
    }

    if (!['IN', 'OUT'].includes(movementType)) {
      return res.status(400).json({ success: false, message: "Movement type must be 'IN' or 'OUT'." });
    }

    // Execute in Transaction to ensure stock and movement record are updated together
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });

      if (!product) {
        throw new Error('Product not found.');
      }

      if (movementType === 'OUT' && product.currentStock < qty) {
        throw new Error(`Insufficient stock for Product '${product.name}' (SKU: ${product.sku}). Available stock: ${product.currentStock}, Requested adjustment: ${qty}.`);
      }

      const newStock = movementType === 'IN' ? product.currentStock + qty : product.currentStock - qty;

      // Update product current stock
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { currentStock: newStock },
      });

      // Create Stock Movement record
      const movement = await tx.stockMovement.create({
        data: {
          productId,
          quantity: qty,
          movementType: movementType as 'IN' | 'OUT',
          reason: reason.trim(),
          createdById: req.user!.userId,
        },
      });

      // Log action
      await tx.auditLog.create({
        data: {
          action: `STOCK_ADJUST_${movementType}`,
          entity: 'Product',
          entityId: productId,
          details: `Manual Stock ${movementType}: ${qty} units. Reason: ${reason}. New Stock: ${newStock}`,
          userId: req.user!.userId,
        },
      });

      return { updatedProduct, movement };
    });

    return res.json({
      success: true,
      message: `Stock updated successfully. New stock for ${result.updatedProduct.name}: ${result.updatedProduct.currentStock}`,
      product: result.updatedProduct,
      movement: result.movement,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
