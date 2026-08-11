import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const RoleName = { ADMIN: 'ADMIN', SALES: 'SALES', WAREHOUSE: 'WAREHOUSE', ACCOUNTS: 'ACCOUNTS' };
const CustomerType = { RETAIL: 'RETAIL', WHOLESALE: 'WHOLESALE', DISTRIBUTOR: 'DISTRIBUTOR' };
const CustomerStatus = { LEAD: 'LEAD', ACTIVE: 'ACTIVE', INACTIVE: 'INACTIVE' };
const FollowupStatus = { PENDING: 'PENDING', COMPLETED: 'COMPLETED', CANCELLED: 'CANCELLED' };
const MovementType = { IN: 'IN', OUT: 'OUT' };
const ChallanStatus = { DRAFT: 'DRAFT', CONFIRMED: 'CONFIRMED', CANCELLED: 'CANCELLED' };

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Database Seeding...');

  // 1. Clear existing data in correct dependency order
  await prisma.auditLog.deleteMany();
  await prisma.challanItem.deleteMany();
  await prisma.challan.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.customerFollowup.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();

  // 2. Create Roles
  console.log('Creating Roles...');
  const roleAdmin = await prisma.role.create({
    data: { name: RoleName.ADMIN, description: 'Full System Access & Governance' },
  });
  const roleSales = await prisma.role.create({
    data: { name: RoleName.SALES, description: 'Customer CRM, Sales Challan Creation & Follow-ups' },
  });
  const roleWarehouse = await prisma.role.create({
    data: { name: RoleName.WAREHOUSE, description: 'Inventory Management, Stock Movements & Fulfillment' },
  });
  const roleAccounts = await prisma.role.create({
    data: { name: RoleName.ACCOUNTS, description: 'Financial Auditing, Billing Views & Operational Reports' },
  });

  // 3. Create Users
  console.log('Creating Demo Users...');
  const salt = await bcrypt.genSalt(10);
  
  const adminUser = await prisma.user.create({
    data: {
      name: 'Rajesh Sharma (Admin)',
      email: 'admin@fundsroom.com',
      password: await bcrypt.hash('admin123', salt),
      roleId: roleAdmin.id,
      status: 'ACTIVE',
    },
  });

  const salesUser = await prisma.user.create({
    data: {
      name: 'Priya Verma (Sales Manager)',
      email: 'sales@fundsroom.com',
      password: await bcrypt.hash('sales123', salt),
      roleId: roleSales.id,
      status: 'ACTIVE',
    },
  });

  const warehouseUser = await prisma.user.create({
    data: {
      name: 'Vikram Singh (Warehouse Head)',
      email: 'warehouse@fundsroom.com',
      password: await bcrypt.hash('wh123456', salt),
      roleId: roleWarehouse.id,
      status: 'ACTIVE',
    },
  });

  const accountsUser = await prisma.user.create({
    data: {
      name: 'Ananya Iyer (Accounts Officer)',
      email: 'accounts@fundsroom.com',
      password: await bcrypt.hash('acc123456', salt),
      roleId: roleAccounts.id,
      status: 'ACTIVE',
    },
  });

  // 4. Create Warehouses
  console.log('Creating Warehouses...');
  const whCentral = await prisma.warehouse.create({
    data: { name: 'Central Logistics Hub', code: 'WH-MUM', location: 'Bhiwandi, Mumbai, MH' },
  });
  const whNorth = await prisma.warehouse.create({
    data: { name: 'Northern Regional Hub', code: 'WH-DEL', location: 'Okhla Phase 3, New Delhi, DL' },
  });
  const whSouth = await prisma.warehouse.create({
    data: { name: 'Southern Distribution Park', code: 'WH-BLR', location: 'Peenya Industrial Area, Bangalore, KA' },
  });

  // 5. Create Categories
  console.log('Creating Product Categories...');
  const catElec = await prisma.category.create({
    data: { name: 'Electronics & Automation', description: 'Sensors, Controllers, and Electrical Assemblies' },
  });
  const catHardware = await prisma.category.create({
    data: { name: 'Industrial Hardware', description: 'Fasteners, Valves, Bearings and Pumps' },
  });
  const catPack = await prisma.category.create({
    data: { name: 'Packaging & Logistics', description: 'Corrugated boxes, Crates, Strapping & Pallets' },
  });
  const catOffice = await prisma.category.create({
    data: { name: 'Office Supplies & IT', description: 'Computer Peripherals, Thermal Printers & Paper' },
  });
  const catRaw = await prisma.category.create({
    data: { name: 'Raw Materials & Chemicals', description: 'Polymers, Solvents and Alloy Sheets' },
  });

  // 6. Create Products
  console.log('Creating 25+ Products...');
  const productsData = [
    // Electronics
    { name: 'Industrial PLC Controller FX-500', sku: 'ELEC-PLC-001', categoryId: catElec.id, warehouseId: whCentral.id, unitPrice: 24500, currentStock: 45, minStockQuantity: 10 },
    { name: 'Optical Distance Sensor 24V', sku: 'ELEC-SNS-002', categoryId: catElec.id, warehouseId: whCentral.id, unitPrice: 3800, currentStock: 120, minStockQuantity: 25 },
    { name: 'Digital Multimeter Pro 1000V', sku: 'ELEC-MM-003', categoryId: catElec.id, warehouseId: whNorth.id, unitPrice: 4200, currentStock: 8, minStockQuantity: 15 }, // LOW STOCK
    { name: 'Stepper Motor NEMA 34', sku: 'ELEC-MOT-004', categoryId: catElec.id, warehouseId: whSouth.id, unitPrice: 6500, currentStock: 30, minStockQuantity: 10 },
    { name: 'Solid State Relay 40A', sku: 'ELEC-SSR-005', categoryId: catElec.id, warehouseId: whCentral.id, unitPrice: 1250, currentStock: 4, minStockQuantity: 20 }, // LOW STOCK

    // Hardware
    { name: 'Stainless Steel Ball Valve 2 Inch', sku: 'HDW-VLV-101', categoryId: catHardware.id, warehouseId: whCentral.id, unitPrice: 1850, currentStock: 85, minStockQuantity: 20 },
    { name: 'High-Precision Tapered Roller Bearing', sku: 'HDW-BRG-102', categoryId: catHardware.id, warehouseId: whNorth.id, unitPrice: 2900, currentStock: 6, minStockQuantity: 15 }, // LOW STOCK
    { name: 'Hydraulic Gear Pump 25 LPM', sku: 'HDW-PMP-103', categoryId: catHardware.id, warehouseId: whSouth.id, unitPrice: 14200, currentStock: 18, minStockQuantity: 5 },
    { name: 'M12 Grade 8.8 Hex Bolts (Pack of 500)', sku: 'HDW-BLT-104', categoryId: catHardware.id, warehouseId: whCentral.id, unitPrice: 3400, currentStock: 150, minStockQuantity: 30 },
    { name: 'Pneumatic Air Cylinder 50mm Stroke', sku: 'HDW-CYL-105', categoryId: catHardware.id, warehouseId: whNorth.id, unitPrice: 5100, currentStock: 22, minStockQuantity: 8 },

    // Packaging
    { name: 'Heavy Duty Corrugated Box 5-Ply (50x40x40cm)', sku: 'PKG-BOX-201', categoryId: catPack.id, warehouseId: whCentral.id, unitPrice: 145, currentStock: 1200, minStockQuantity: 300 },
    { name: 'Industrial Stretch Wrap Film 23 Micron (6 Rolls)', sku: 'PKG-FLM-202', categoryId: catPack.id, warehouseId: whNorth.id, unitPrice: 2800, currentStock: 85, minStockQuantity: 50 },
    { name: 'HDPE Plastic Pallet 1200x1000mm', sku: 'PKG-PLT-203', categoryId: catPack.id, warehouseId: whSouth.id, unitPrice: 3200, currentStock: 3, minStockQuantity: 20 }, // LOW STOCK
    { name: 'Polypropylene Strapping Roll 15mm x 1500m', sku: 'PKG-STP-204', categoryId: catPack.id, warehouseId: whCentral.id, unitPrice: 2100, currentStock: 40, minStockQuantity: 15 },
    { name: 'Bubble Wrap Cushioning Roll 100m', sku: 'PKG-BBL-205', categoryId: catPack.id, warehouseId: whNorth.id, unitPrice: 1650, currentStock: 65, minStockQuantity: 20 },

    // Office
    { name: 'Thermal Barcode Label Printer 4-Inch', sku: 'OFC-PRN-301', categoryId: catOffice.id, warehouseId: whCentral.id, unitPrice: 16800, currentStock: 14, minStockQuantity: 5 },
    { name: 'Direct Thermal Labels 100x150mm (Roll of 500)', sku: 'OFC-LBL-302', categoryId: catOffice.id, warehouseId: whNorth.id, unitPrice: 420, currentStock: 250, minStockQuantity: 50 },
    { name: 'Wireless 2D Handheld Barcode Scanner', sku: 'OFC-SCN-303', categoryId: catOffice.id, warehouseId: whSouth.id, unitPrice: 3900, currentStock: 5, minStockQuantity: 10 }, // LOW STOCK
    { name: 'Heavy Duty Desktop Paper Shredder', sku: 'OFC-SHR-304', categoryId: catOffice.id, warehouseId: whCentral.id, unitPrice: 9500, currentStock: 12, minStockQuantity: 4 },

    // Raw Materials
    { name: 'Polypropylene Plastic Granules (25kg Bag)', sku: 'RAW-PLN-401', categoryId: catRaw.id, warehouseId: whCentral.id, unitPrice: 3100, currentStock: 340, minStockQuantity: 100 },
    { name: 'Aluminum Alloy Sheet 6061-T6 2mm', sku: 'RAW-ALU-402', categoryId: catRaw.id, warehouseId: whNorth.id, unitPrice: 8400, currentStock: 42, minStockQuantity: 15 },
    { name: 'Industrial Solvent Cleaner (20L Drum)', sku: 'RAW-SOL-403', categoryId: catRaw.id, warehouseId: whSouth.id, unitPrice: 4500, currentStock: 2, minStockQuantity: 15 }, // LOW STOCK
    { name: 'Copper Busbar Strip 50x5mm (3 meter)', sku: 'RAW-CPR-404', categoryId: catRaw.id, warehouseId: whCentral.id, unitPrice: 7200, currentStock: 28, minStockQuantity: 10 },
    { name: 'EPDM Rubber Gasket Material Roll 10m', sku: 'RAW-GSK-405', categoryId: catRaw.id, warehouseId: whNorth.id, unitPrice: 2400, currentStock: 55, minStockQuantity: 15 },
  ];

  const createdProducts: any[] = [];
  for (const p of productsData) {
    const prod = await prisma.product.create({ data: p });
    createdProducts.push(prod);

    // Initial Stock Movement record for each product
    await prisma.stockMovement.create({
      data: {
        productId: prod.id,
        quantity: prod.currentStock,
        movementType: MovementType.IN,
        reason: 'Initial Warehouse Inbound Stocking',
        createdById: warehouseUser.id,
      },
    });
  }

  // 7. Create Customers
  console.log('Creating 18+ Customers...');
  const customersData = [
    { name: 'Amit Patel', mobile: '+91 98201 12345', email: 'amit@apexind.com', businessName: 'Apex Industrial Solutions Pvt Ltd', gstNumber: '27AAACA12341Z5', customerType: CustomerType.DISTRIBUTOR, address: 'Plot 42, MIDC Andheri East, Mumbai, MH 400093', status: CustomerStatus.ACTIVE, followupDate: new Date(Date.now() + 86400000 * 2), notes: 'Key distributor for Western Region. Interested in bulk PLC orders.' },
    { name: 'Sanjay Gupta', mobile: '+91 98110 56789', email: 'sanjay@delhimachinery.co.in', businessName: 'Delhi Machinery Corp', gstNumber: '07BBBCD56781Z2', customerType: CustomerType.WHOLESALE, address: '78 Wazirpur Industrial Area, New Delhi 110052', status: CustomerStatus.ACTIVE, followupDate: new Date(), notes: 'Due today: Confirm payment terms for pending quotation.' },
    { name: 'Kavita Menon', mobile: '+91 94470 99887', email: 'kavita@southpack.com', businessName: 'SouthPack Logistics Solution', gstNumber: '29CCCCE90121Z9', customerType: CustomerType.DISTRIBUTOR, address: '12 Electronic City Phase 1, Bangalore 560100', status: CustomerStatus.ACTIVE, followupDate: new Date(Date.now() - 86400000 * 1), notes: 'OVERDUE: Requires update on HDPE pallet delivery schedule.' },
    { name: 'Rohan Deshmukh', mobile: '+91 97654 32109', email: 'rohan@technocraft.in', businessName: 'Technocraft Engineering Works', gstNumber: '27DDDEF34561Z4', customerType: CustomerType.WHOLESALE, address: 'T-204 Bhosari MIDC, Pune, MH 411026', status: CustomerStatus.ACTIVE, followupDate: new Date(Date.now() + 86400000 * 5), notes: 'Regular monthly order for ball valves and gear pumps.' },
    { name: 'Neeraj Agarwal', mobile: '+91 98300 44332', email: 'neeraj@eastcorp.org', businessName: 'Eastern Automation Agencies', gstNumber: '19EEEFG78901Z1', customerType: CustomerType.RETAIL, address: '15 Brabourne Road, Kolkata, WB 700001', status: CustomerStatus.LEAD, followupDate: new Date(Date.now() + 86400000 * 3), notes: 'New inquiry regarding optical distance sensors.' },
    { name: 'Meera Krishnan', mobile: '+91 98400 11223', email: 'meera@chennaibearings.com', businessName: 'Chennai Precision Bearings', gstNumber: '33FFFGH12341Z7', customerType: CustomerType.DISTRIBUTOR, address: '88 Guindy Industrial Estate, Chennai, TN 600032', status: CustomerStatus.ACTIVE, followupDate: new Date(Date.now() + 86400000 * 1), notes: 'Interested in annual rate contract for taper bearings.' },
    { name: 'Hardik Shah', mobile: '+91 98980 77665', email: 'hardik@gujaratpolymers.com', businessName: 'Gujarat Polymer Synthetics', gstNumber: '24GGGHJ56781Z3', customerType: CustomerType.WHOLESALE, address: 'GIDC Vatva Phase 4, Ahmedabad, GJ 382445', status: CustomerStatus.ACTIVE, followupDate: new Date(Date.now() + 86400000 * 7), notes: 'Consistently buys 50+ bags of PP granules per order.' },
    { name: 'Pooja Reddy', mobile: '+91 99890 33445', email: 'pooja@deccanpack.com', businessName: 'Deccan Packaging & Paper', gstNumber: '36HHHJK90121Z8', customerType: CustomerType.WHOLESALE, address: 'Bolanpur Industrial Area, Hyderabad, TS 500018', status: CustomerStatus.LEAD, followupDate: new Date(Date.now() - 86400000 * 2), notes: 'OVERDUE: Demo of barcode printers pending.' },
    { name: 'Vikas Malhotra', mobile: '+91 98140 66554', email: 'vikas@punjabtools.co.in', businessName: 'Punjab Tooling Center', gstNumber: '03IIIKL34561Z0', customerType: CustomerType.RETAIL, address: 'GT Road, Ludhiana, PB 141003', status: CustomerStatus.ACTIVE, followupDate: new Date(Date.now() + 86400000 * 4), notes: 'Re-stocking small batch fasteners.' },
    { name: 'Sunil Rao', mobile: '+91 98230 88776', email: 'sunil@goa-hardware.com', businessName: 'Goa Marine & Industrial Supplies', gstNumber: '30JJJKM78901Z6', customerType: CustomerType.WHOLESALE, address: 'Verna Industrial Estate, Verna, Goa 403722', status: CustomerStatus.INACTIVE, followupDate: null, notes: 'Account dormant since last fiscal year.' },
    { name: 'Tarun Bansal', mobile: '+91 98180 12121', email: 'tarun@bansalsteel.com', businessName: 'Bansal Steel & Alloy Stockists', gstNumber: '06KKKNP12341Z5', customerType: CustomerType.DISTRIBUTOR, address: 'Faridabad Industrial Area, HR 121001', status: CustomerStatus.ACTIVE, followupDate: new Date(Date.now() + 86400000 * 6), notes: 'Requires high volume aluminum sheet delivery.' },
    { name: 'Deepak Saxena', mobile: '+91 98390 34343', email: 'deepak@up-electromart.com', businessName: 'UP Electromart Traders', gstNumber: '09LLLPR56781Z1', customerType: CustomerType.RETAIL, address: 'Transport Nagar, Kanpur, UP 208023', status: CustomerStatus.LEAD, followupDate: new Date(Date.now() + 86400000 * 2), notes: 'Requested quotation for multimeter series.' },
  ];

  const createdCustomers: any[] = [];
  for (const c of customersData) {
    const cust = await prisma.customer.create({ data: c });
    createdCustomers.push(cust);

    // Create followup entries for customers with followupDate
    if (c.followupDate) {
      await prisma.customerFollowup.create({
        data: {
          customerId: cust.id,
          notes: c.notes || 'Follow-up regarding order pipeline and stock requirements.',
          followupDate: c.followupDate,
          status: c.followupDate < new Date() ? FollowupStatus.PENDING : FollowupStatus.PENDING,
          createdById: salesUser.id,
        },
      });
    }
  }

  // 8. Create Sales Challans & Challan Items
  console.log('Creating Sales Challans & Historical Snapshots...');
  
  // Challan 1: Confirmed Challan for Apex Industrial
  const p1 = createdProducts[0]; // PLC Controller
  const p2 = createdProducts[5]; // SS Ball Valve
  const ch1 = await prisma.challan.create({
    data: {
      challanNumber: 'CH-1001',
      customerId: createdCustomers[0].id,
      totalQuantity: 7,
      totalAmount: (p1.unitPrice * 2) + (p2.unitPrice * 5),
      status: ChallanStatus.CONFIRMED,
      notes: 'Dispatched via GATI Cargo LR# 884920. Payment terms 30 days.',
      createdById: salesUser.id,
      confirmedAt: new Date(Date.now() - 86400000 * 3),
      items: {
        create: [
          {
            productId: p1.id,
            productName: p1.name,
            productSku: p1.sku,
            unitPrice: p1.unitPrice,
            quantity: 2,
            lineTotal: p1.unitPrice * 2,
          },
          {
            productId: p2.id,
            productName: p2.name,
            productSku: p2.sku,
            unitPrice: p2.unitPrice,
            quantity: 5,
            lineTotal: p2.unitPrice * 5,
          },
        ],
      },
    },
  });

  // OUT stock movements for confirmed challan 1
  await prisma.stockMovement.createMany({
    data: [
      {
        productId: p1.id,
        quantity: 2,
        movementType: MovementType.OUT,
        reason: `Sales Fulfillment for Challan ${ch1.challanNumber}`,
        createdById: warehouseUser.id,
        createdAt: new Date(Date.now() - 86400000 * 3),
      },
      {
        productId: p2.id,
        quantity: 5,
        movementType: MovementType.OUT,
        reason: `Sales Fulfillment for Challan ${ch1.challanNumber}`,
        createdById: warehouseUser.id,
        createdAt: new Date(Date.now() - 86400000 * 3),
      },
    ],
  });

  // Challan 2: Draft Challan for Delhi Machinery
  const p3 = createdProducts[10]; // Corrugated Box
  const p4 = createdProducts[11]; // Stretch Wrap
  await prisma.challan.create({
    data: {
      challanNumber: 'CH-1002',
      customerId: createdCustomers[1].id,
      totalQuantity: 210,
      totalAmount: (p3.unitPrice * 200) + (p4.unitPrice * 10),
      status: ChallanStatus.DRAFT,
      notes: 'Draft quotation prepared by Sales. Pending customer confirmation.',
      createdById: salesUser.id,
      items: {
        create: [
          {
            productId: p3.id,
            productName: p3.name,
            productSku: p3.sku,
            unitPrice: p3.unitPrice,
            quantity: 200,
            lineTotal: p3.unitPrice * 200,
          },
          {
            productId: p4.id,
            productName: p4.name,
            productSku: p4.sku,
            unitPrice: p4.unitPrice,
            quantity: 10,
            lineTotal: p4.unitPrice * 10,
          },
        ],
      },
    },
  });

  // Challan 3: Confirmed Challan for Technocraft
  const p5 = createdProducts[8]; // Hex Bolts
  const p6 = createdProducts[19]; // PP Granules
  const ch3 = await prisma.challan.create({
    data: {
      challanNumber: 'CH-1003',
      customerId: createdCustomers[3].id,
      totalQuantity: 35,
      totalAmount: (p5.unitPrice * 10) + (p6.unitPrice * 25),
      status: ChallanStatus.CONFIRMED,
      notes: 'Direct warehouse pickup by customer vehicle MH-12-PQ-9901.',
      createdById: salesUser.id,
      confirmedAt: new Date(Date.now() - 86400000 * 1),
      items: {
        create: [
          {
            productId: p5.id,
            productName: p5.name,
            productSku: p5.sku,
            unitPrice: p5.unitPrice,
            quantity: 10,
            lineTotal: p5.unitPrice * 10,
          },
          {
            productId: p6.id,
            productName: p6.name,
            productSku: p6.sku,
            unitPrice: p6.unitPrice,
            quantity: 25,
            lineTotal: p6.unitPrice * 25,
          },
        ],
      },
    },
  });

  await prisma.stockMovement.createMany({
    data: [
      {
        productId: p5.id,
        quantity: 10,
        movementType: MovementType.OUT,
        reason: `Sales Fulfillment for Challan ${ch3.challanNumber}`,
        createdById: warehouseUser.id,
        createdAt: new Date(Date.now() - 86400000 * 1),
      },
      {
        productId: p6.id,
        quantity: 25,
        movementType: MovementType.OUT,
        reason: `Sales Fulfillment for Challan ${ch3.challanNumber}`,
        createdById: warehouseUser.id,
        createdAt: new Date(Date.now() - 86400000 * 1),
      },
    ],
  });

  // 9. Audit Logs
  console.log('Creating Audit Logs...');
  await prisma.auditLog.createMany({
    data: [
      { action: 'USER_LOGIN', entity: 'User', entityId: adminUser.id, details: 'Admin logged in from 192.168.1.10', userId: adminUser.id },
      { action: 'CUSTOMER_CREATED', entity: 'Customer', entityId: createdCustomers[0].id, details: 'Created customer Apex Industrial Solutions', userId: salesUser.id },
      { action: 'CHALLAN_CREATED', entity: 'Challan', entityId: ch1.id, details: 'Created Draft Challan CH-1001', userId: salesUser.id },
      { action: 'CHALLAN_CONFIRMED', entity: 'Challan', entityId: ch1.id, details: 'Confirmed Challan CH-1001 and deducted inventory', userId: salesUser.id },
      { action: 'STOCK_RESTOCK', entity: 'Product', entityId: p1.id, details: 'Manual Restock +20 units by Warehouse', userId: warehouseUser.id },
    ],
  });

  console.log('✅ Database Seeding Successfully Completed!');
  console.log('\n----------------------------------------');
  console.log('🔑 TEST DEMO CREDENTIALS:');
  console.log('1. Admin:     admin@fundsroom.com     / admin123');
  console.log('2. Sales:     sales@fundsroom.com     / sales123');
  console.log('3. Warehouse: warehouse@fundsroom.com / wh123456');
  console.log('4. Accounts:  accounts@fundsroom.com  / acc123456');
  console.log('----------------------------------------\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
