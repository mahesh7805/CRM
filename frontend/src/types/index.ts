export type RoleName = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';
export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';
export type FollowupStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';
export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
export type MovementType = 'IN' | 'OUT';
export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: RoleName;
  status?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  location: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  category?: Category;
  unitPrice: number;
  currentStock: number;
  minStockQuantity: number;
  warehouseId: string;
  warehouse?: Warehouse;
  stockStatus?: StockStatus;
  stockMovements?: StockMovement[];
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  businessName: string;
  gstNumber?: string;
  customerType: CustomerType;
  address: string;
  status: CustomerStatus;
  followupDate?: string;
  notes?: string;
  followups?: CustomerFollowup[];
  challans?: Challan[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    challans: number;
    followups: number;
  };
}

export interface CustomerFollowup {
  id: string;
  customerId: string;
  customer?: Customer;
  notes: string;
  followupDate: string;
  status: FollowupStatus;
  createdById: string;
  createdBy?: { id: string; name: string };
  completedAt?: string;
  createdAt: string;
  isOverdue?: boolean;
  isToday?: boolean;
}

export interface StockMovement {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    sku: string;
    category?: { name: string };
  };
  quantity: number;
  movementType: MovementType;
  reason: string;
  createdById: string;
  createdBy: { id: string; name: string; role?: { name: string } };
  createdAt: string;
}

export interface ChallanItem {
  id: string;
  challanId: string;
  productId?: string;
  product?: { id: string; currentStock: number; minStockQuantity: number; warehouse?: { name: string } };
  productName: string;
  productSku: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Challan {
  id: string;
  challanNumber: string;
  customerId: string;
  customer: Customer;
  totalQuantity: number;
  totalAmount: number;
  status: ChallanStatus;
  notes?: string;
  createdById: string;
  createdBy: { id: string; name: string; email?: string };
  confirmedAt?: string;
  items?: ChallanItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  user?: { name: string };
  createdAt: string;
}

export interface DashboardSummary {
  kpis: {
    totalCustomers: number;
    activeCustomers: number;
    totalProducts: number;
    totalInventoryValue: number;
    lowStockCount: number;
    todayChallans: number;
    pendingFollowups: number;
    overdueFollowups: number;
  };
  lowStockProducts: Array<{
    id: string;
    name: string;
    sku: string;
    currentStock: number;
    minStockQuantity: number;
    categoryName: string;
    stockStatus: StockStatus;
  }>;
  recentMovements: StockMovement[];
  recentAuditLogs: AuditLog[];
  recentChallans: Challan[];
  charts: {
    categoryChartData: Array<{ category: string; value: number; count: number }>;
    customerStatusBreakdown: Array<{ status: string; count: number }>;
    salesTrend: Array<{ challanNumber: string; customer: string; amount: number; date: string }>;
  };
}
