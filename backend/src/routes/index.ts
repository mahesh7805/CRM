import { Router } from 'express';
import { authenticateJwt } from '../middleware/auth';
import { requireRoles } from '../middleware/role';

import * as authController from '../controllers/auth.controller';
import * as customerController from '../controllers/customer.controller';
import * as productController from '../controllers/product.controller';
import * as inventoryController from '../controllers/inventory.controller';
import * as challanController from '../controllers/challan.controller';
import * as followupController from '../controllers/followup.controller';
import * as userController from '../controllers/user.controller';
import * as reportController from '../controllers/report.controller';

const router = Router();

// ==========================================
// 1. AUTHENTICATION ROUTES (Public & Auth)
// ==========================================
router.post('/auth/login', authController.login);
router.get('/auth/me', authenticateJwt, authController.getMe);

// ==========================================
// 2. METADATA ROUTES (Categories, Warehouses)
// ==========================================
router.get('/metadata', authenticateJwt, productController.getMetadata);

// ==========================================
// 3. DASHBOARD & REPORTS (All Authenticated)
// ==========================================
router.get('/dashboard/summary', authenticateJwt, reportController.getDashboardSummary);
router.get('/reports/inventory', authenticateJwt, reportController.getInventoryReport);
router.get('/reports/challans', authenticateJwt, reportController.getChallanReport);

// ==========================================
// 4. CUSTOMER CRM MODULE
// Permissions: Admin, Sales, Accounts can view; Admin, Sales can write
// ==========================================
router.get('/customers', authenticateJwt, requireRoles(['ADMIN', 'SALES', 'ACCOUNTS', 'WAREHOUSE']), customerController.getCustomers);
router.get('/customers/:id', authenticateJwt, requireRoles(['ADMIN', 'SALES', 'ACCOUNTS', 'WAREHOUSE']), customerController.getCustomerById);
router.post('/customers', authenticateJwt, requireRoles(['ADMIN', 'SALES']), customerController.createCustomer);
router.put('/customers/:id', authenticateJwt, requireRoles(['ADMIN', 'SALES']), customerController.updateCustomer);
router.delete('/customers/:id', authenticateJwt, requireRoles(['ADMIN']), customerController.deleteCustomer);

// ==========================================
// 5. FOLLOW-UP CRM MODULE
// Permissions: Admin, Sales can access
// ==========================================
router.get('/followups', authenticateJwt, requireRoles(['ADMIN', 'SALES', 'ACCOUNTS']), followupController.getFollowups);
router.post('/followups', authenticateJwt, requireRoles(['ADMIN', 'SALES']), followupController.createFollowup);
router.post('/followups/:id/complete', authenticateJwt, requireRoles(['ADMIN', 'SALES']), followupController.completeFollowup);

// ==========================================
// 6. PRODUCT CATALOG MODULE
// Permissions: All roles view; Admin, Warehouse create/edit
// ==========================================
router.get('/products', authenticateJwt, requireRoles(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']), productController.getProducts);
router.get('/products/:id', authenticateJwt, requireRoles(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']), productController.getProductById);
router.post('/products', authenticateJwt, requireRoles(['ADMIN', 'WAREHOUSE']), productController.createProduct);
router.put('/products/:id', authenticateJwt, requireRoles(['ADMIN', 'WAREHOUSE']), productController.updateProduct);

// ==========================================
// 7. INVENTORY & STOCK MOVEMENTS MODULE
// Permissions: All view; Admin & Warehouse can manually adjust stock
// ==========================================
router.get('/inventory/movements', authenticateJwt, requireRoles(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']), inventoryController.getStockMovements);
router.post('/inventory/adjust', authenticateJwt, requireRoles(['ADMIN', 'WAREHOUSE']), inventoryController.adjustStock);

// ==========================================
// 8. SALES CHALLAN MODULE
// Permissions: All view; Admin & Sales create/confirm/cancel
// ==========================================
router.get('/challans', authenticateJwt, requireRoles(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']), challanController.getChallans);
router.get('/challans/:id', authenticateJwt, requireRoles(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']), challanController.getChallanById);
router.post('/challans', authenticateJwt, requireRoles(['ADMIN', 'SALES']), challanController.createChallan);
router.post('/challans/:id/confirm', authenticateJwt, requireRoles(['ADMIN', 'SALES']), challanController.confirmChallan);
router.post('/challans/:id/cancel', authenticateJwt, requireRoles(['ADMIN', 'SALES']), challanController.cancelChallan);

// ==========================================
// 9. USER MANAGEMENT MODULE (Admin Only)
// ==========================================
router.get('/users', authenticateJwt, requireRoles(['ADMIN']), userController.getUsers);
router.get('/users/roles', authenticateJwt, requireRoles(['ADMIN']), userController.getRoles);
router.post('/users', authenticateJwt, requireRoles(['ADMIN']), userController.createUser);
router.post('/users/:id/toggle-status', authenticateJwt, requireRoles(['ADMIN']), userController.toggleUserStatus);

export default router;
