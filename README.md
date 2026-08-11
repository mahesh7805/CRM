# Full-Stack Developer Case Study: Mini ERP + CRM Operations Portal

A realistic, production-quality internal Operations Portal designed for wholesale and distribution enterprises. Built with a modern **Light-Based Glassmorphism Design System**, Node.js/Express TypeScript backend, Prisma ORM database layer, React + TypeScript Vite frontend, and complete ACID transaction security for stock management.

---

## 📋 Case Study Submission Checklist

| Deliverable Requirement | Status & File Location |
| :--- | :--- |
| **1. GitHub Repository** | Complete Codebase (`backend/`, `frontend/`, `database/`, `docs/`) |
| **2. Live Frontend URL** | Deployable to Vercel / Netlify (See Deployment Guide below) |
| **3. Live Backend API URL** | Deployable to Render / Railway / Fly.io |
| **4. Test Credentials** | Pre-seeded accounts for Admin, Sales, Warehouse & Accounts (See below) |
| **5. Postman Collection** | Included in [`docs/postman_collection.json`](file:///d:/FUNDSROOM/docs/postman_collection.json) |
| **6. README & Architecture** | Documented in [`docs/ARCHITECTURE.md`](file:///d:/FUNDSROOM/docs/ARCHITECTURE.md) |
| **7. Bonus Features** | Docker setup (`Dockerfile`, `docker-compose.yml`), GitHub Actions (`.github/workflows/ci.yml`), CSV Export |
| **8. Known Limitations** | Documented below |

---

## 🔑 Test Login Credentials

You can test the application using any of the 4 role presets below or use the **One-Click Demo Switcher** bar at the top of the portal:

| Role | Email | Password | Access Rights & Highlights |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@fundsroom.com` | `admin123` | Full system access, user provisioning, stock adjustments & reports |
| **Sales** | `sales@fundsroom.com` | `sales123` | Customer CRM, follow-up management, Sales Challan creation & confirmation |
| **Warehouse** | `warehouse@fundsroom.com` | `wh123456` | Stock IN/OUT manual adjustments, movement history ledger, stock statuses |
| **Accounts** | `accounts@fundsroom.com` | `acc123456` | Challan summary views, financial reporting & inventory valuation |

---

## 🚀 Quick Start (Local Execution)

### Prerequisites
- Node.js v18+ and npm installed

### 1. Backend Setup & Local Database
```bash
cd backend
npm install
npx prisma db push
npx prisma db seed
npm run dev
```
Backend API will start on: `http://localhost:5000`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend Portal will launch on: `http://localhost:3000`

---

## 🐳 Running with Docker

You can run the entire backend containerized using Docker Compose:

```bash
docker-compose up --build
```

---

## 🎯 Guided Demonstration Flow

To experience the complete business workflow:

1. **Login as Sales**: Click the **Sales** preset card or login with `sales@fundsroom.com` / `sales123`.
2. **Navigate to Customers**: Open the **Customers** tab and select **Delhi Machinery Corp** or click **+ Add New Customer**.
3. **Create a Sales Challan**:
   - Click **Create Challan for Customer** or go to **Sales Challans → + Create Sales Challan**.
   - Select product rows (e.g. *Industrial PLC Controller* and *Stainless Steel Ball Valve*).
   - Enter quantities. Observe the real-time available stock indicator.
   - Click **Confirm & Deduct Stock**.
4. **Verify Automated Inventory Reduction**:
   - Click the **Demo Switcher** in the header to switch to **Warehouse** role.
   - Open **Inventory** tab.
   - Verify the `OUT` stock movement transaction record has been created automatically.
   - Open **Products** tab to see updated stock levels and low-stock alerts if thresholds were crossed.
5. **Inspect Customer Timeline**:
   - Return to **Customers → Account Detail Page**.
   - Observe that the Challan creation and follow-up activities appear in the timeline.

---

## 🏗️ Architecture & Core Business Logic

- **ACID Transaction Safety**: When a Sales Challan is confirmed, all product availability checks, inventory decrements, historical product snapshots, and stock movement logs occur inside a single DB transaction (`prisma.$transaction`).
- **Insufficient Stock Handling**: If requested quantity exceeds available stock, the API aborts the operation, rolls back the transaction, and returns a clear error message: `"Insufficient stock for Product XYZ. Available: 4, Requested: 7."`
- **Product Snapshot Preservation**: Each challan item preserves `productName`, `productSku`, `unitPrice`, `quantity`, and `lineTotal` at the time of creation, ensuring historical records remain 100% accurate even if catalog prices change later.

---

## 🌐 Deployment Instructions

### Database (Supabase / Neon / Render PostgreSQL)
1. Provision a PostgreSQL database on Supabase or Neon.
2. Execute [`database/schema.sql`](file:///d:/FUNDSROOM/database/schema.sql) to construct tables and indexes.
3. Execute [`database/seed.sql`](file:///d:/FUNDSROOM/database/seed.sql) to seed initial data.

### Backend (Render / Railway / Fly.io)
1. Deploy `backend/` directory.
2. Set Environment Variables:
   - `PORT=5000`
   - `NODE_ENV=production`
   - `JWT_SECRET=super_secret_jwt_key_mini_erp_crm_2026_fundsroom`
   - `DATABASE_URL=postgresql://user:pass@host:5432/dbname`
3. Build command: `npm run build`
4. Start command: `npm run start`

### Frontend (Vercel / Netlify)
1. Deploy `frontend/` directory.
2. Set Build command: `npm run build`
3. Set Output directory: `dist`

---

## ⚠️ Known Limitations & Future Roadmap

1. **Local SQLite vs PostgreSQL**: Local development runs on zero-config SQLite via Prisma for instant out-of-the-box execution. Full PostgreSQL DDL/DML scripts are provided for cloud hosting.
2. **AWS S3 Image Uploads**: Product image upload is architected for S3; local dev currently uses icon badges.
