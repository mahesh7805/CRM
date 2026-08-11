import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const getProducts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, categoryId, warehouseId, stockStatus, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (search) {
      const q = (search as string).trim();
      where.OR = [
        { name: { contains: q } },
        { sku: { contains: q } },
      ];
    }

    if (categoryId && categoryId !== 'ALL') {
      where.categoryId = categoryId;
    }

    if (warehouseId && warehouseId !== 'ALL') {
      where.warehouseId = warehouseId;
    }

    if (stockStatus) {
      if (stockStatus === 'OUT_OF_STOCK') {
        where.currentStock = 0;
      } else if (stockStatus === 'LOW_STOCK') {
        // Current stock > 0 and <= minStockQuantity
        // Prisma SQLite condition: handled in post-query or custom filter
      }
    }

    let [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { name: 'asc' },
        include: {
          category: true,
          warehouse: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Enhance products with calculated stock status
    const enhancedProducts = products.map((p) => {
      let computedStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' = 'IN_STOCK';
      if (p.currentStock === 0) {
        computedStatus = 'OUT_OF_STOCK';
      } else if (p.currentStock <= p.minStockQuantity) {
        computedStatus = 'LOW_STOCK';
      }
      return {
        ...p,
        stockStatus: computedStatus,
      };
    });

    // If stockStatus filter is LOW_STOCK or IN_STOCK, apply post-filter if needed
    let filteredResult = enhancedProducts;
    if (stockStatus === 'LOW_STOCK') {
      filteredResult = enhancedProducts.filter((p) => p.stockStatus === 'LOW_STOCK');
    } else if (stockStatus === 'IN_STOCK') {
      filteredResult = enhancedProducts.filter((p) => p.stockStatus === 'IN_STOCK');
    }

    return res.json({
      success: true,
      products: filteredResult,
      pagination: {
        total: stockStatus ? filteredResult.length : total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil((stockStatus ? filteredResult.length : total) / limitNum),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        warehouse: true,
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            createdBy: { select: { id: true, name: true, role: { select: { name: true } } } },
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    let stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' = 'IN_STOCK';
    if (product.currentStock === 0) {
      stockStatus = 'OUT_OF_STOCK';
    } else if (product.currentStock <= product.minStockQuantity) {
      stockStatus = 'LOW_STOCK';
    }

    return res.json({
      success: true,
      product: {
        ...product,
        stockStatus,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, sku, categoryId, unitPrice, initialStock, minStockQuantity, warehouseId } = req.body;

    if (!name || !sku || !categoryId || unitPrice === undefined || !warehouseId) {
      return res.status(400).json({ success: false, message: 'Name, SKU, Category, Price, and Warehouse are required.' });
    }

    const existingSku = await prisma.product.findUnique({ where: { sku: sku.trim().toUpperCase() } });
    if (existingSku) {
      return res.status(400).json({ success: false, message: `Product SKU '${sku}' already exists.` });
    }

    const stockVal = Math.max(0, parseInt(initialStock || '0', 10));

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        categoryId,
        unitPrice: parseFloat(unitPrice),
        currentStock: stockVal,
        minStockQuantity: parseInt(minStockQuantity || '10', 10),
        warehouseId,
      },
    });

    // Create initial stock movement if stock > 0
    if (stockVal > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          quantity: stockVal,
          movementType: 'IN',
          reason: 'Initial Product Stock Setup',
          createdById: req.user!.userId,
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        action: 'PRODUCT_CREATED',
        entity: 'Product',
        entityId: product.id,
        details: `Created product ${product.name} (SKU: ${product.sku}) with stock ${stockVal}`,
        userId: req.user!.userId,
      },
    });

    return res.status(201).json({ success: true, product });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, categoryId, unitPrice, minStockQuantity, warehouseId } = req.body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: name ? name.trim() : existing.name,
        categoryId: categoryId || existing.categoryId,
        unitPrice: unitPrice !== undefined ? parseFloat(unitPrice) : existing.unitPrice,
        minStockQuantity: minStockQuantity !== undefined ? parseInt(minStockQuantity, 10) : existing.minStockQuantity,
        warehouseId: warehouseId || existing.warehouseId,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'PRODUCT_UPDATED',
        entity: 'Product',
        entityId: product.id,
        details: `Updated product ${product.name}`,
        userId: req.user!.userId,
      },
    });

    return res.json({ success: true, product });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMetadata = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [categories, warehouses] = await Promise.all([
      prisma.category.findMany({ orderBy: { name: 'asc' } }),
      prisma.warehouse.findMany({ orderBy: { name: 'asc' } }),
    ]);

    return res.json({
      success: true,
      categories,
      warehouses,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
