# 📹 Video Script & Recording Guide: Mini ERP + CRM Operations Portal

This guide provides a structured breakdown of files to feature in VS Code, UI flows to capture in the browser, and a timed, word-for-word spoken presentation script for recording the project submission video.

---

## 📋 Part 1: Files & UI Screens to Record

### A. Codebase Files to Record in VS Code
Open the following files in your editor (VS Code) before recording. Switch to these files during the code architecture walkthrough section:

| # | File Path & Link | Purpose / Code Highlight to Show on Screen |
|---|---|---|
| 1 | [`backend/src/controllers/challan.controller.ts`](file:///d:/FUNDSROOM/backend/src/controllers/challan.controller.ts#L116-L209) | **ACID Transaction & Stock Guard**: Lines 116–209 showing `prisma.$transaction`, negative stock validation (`product.currentStock < qty`), product snapshot generation, stock auto-decrement (`currentStock: { decrement: qty }`), and `OUT` stock movement creation. |
| 2 | [`backend/src/middleware/role.ts`](file:///d:/FUNDSROOM/backend/src/middleware/role.ts#L1-L18) | **Role Authorization Middleware**: Lines 1–18 showing `checkRole(['ADMIN', 'SALES'])` enforcement. |
| 3 | [`database/schema.sql`](file:///d:/FUNDSROOM/database/schema.sql#L85-L136) | **Production Database Schema**: Lines 85–136 highlighting check constraints (`CHECK (current_stock >= 0)`), Challan tables, and `challan_items` snapshot fields. |
| 4 | [`backend/src/controllers/customer.controller.ts`](file:///d:/FUNDSROOM/backend/src/controllers/customer.controller.ts#L1-L60) | **Customer CRM Backend Logic**: Search/filter logic, pagination, and follow-up relationship updates. |
| 5 | [`docs/API_DOCUMENTATION.md`](file:///d:/FUNDSROOM/docs/API_DOCUMENTATION.md) | **API Contract**: Detailed endpoint reference with request/response specs. |
| 6 | [`docker-compose.yml`](file:///d:/FUNDSROOM/docker-compose.yml) & [`.github/workflows/ci.yml`](file:///d:/FUNDSROOM/.github/workflows/ci.yml) | **DevOps & Bonus**: Container setup and CI build pipeline. |

---

### B. UI Screens & Live Workflows to Record in Browser
Ensure both backend (`npm run dev` on port `5000`) and frontend (`npm run dev` on port `3000`) are running locally, or record the deployed production application.

1. **Header Preset Role Switcher & Login Screen**: Switch between Admin, Sales, Warehouse, and Accounts presets.
2. **Customer CRM Module**:
   - Customer Directory (Search, Filter by Lead/Active, Pagination).
   - Customer Detail Modal / Page (Timeline notes & "+ Add Follow-Up Note").
   - "+ Add Customer" form modal.
3. **Product & Inventory Module**:
   - Product Catalog (Stock level badges, minimum stock alert indicators).
   - Stock Movements Ledger (Filter by IN / OUT movements, timestamps, audit details).
   - Manual Stock Adjustment Modal.
4. **Sales Challan Module (Core Flow)**:
   - Sales Challan Table (Draft, Confirmed, Cancelled filter tags).
   - Create Sales Challan form (Customer selection, multi-item picker, real-time stock indicator).
   - Stock Guard Error Demo: Attempting to order quantity > available stock (triggers toast error: `"Insufficient stock for Product..."`).
   - Successful Confirmation: Create and confirm a Challan -> Observe stock auto-deduction in Inventory.
5. **Postman API Collection**: Postman showing organized requests for Auth, Customers, Inventory, and Challans with passing responses.

---

## 🎙️ Part 2: Complete Word-for-Word Video Script

> **Suggested Duration**: 4 to 5 minutes  
> **Tone**: Professional, confident, clear, and focused on business value & technical precision.

---

### 🟢 SECTION 1: Intro & Executive Summary (00:00 – 00:35)

**[VISUAL CUE]**: Full screen on the **Mini ERP + CRM Operations Portal** dashboard showing the light-glassmorphic UI, KPI stat cards, and header.

**[SPOKEN SCRIPT]**:
> *"Hello everyone! Welcome to the demonstration of the **Mini ERP + CRM Operations Portal**, a full-stack, enterprise-grade application built for wholesale and distribution businesses.*
> 
> *In wholesale distribution, real-time inventory synchronization, strict role delegation, and transaction accuracy are non-negotiable. This portal bridges sales CRM workflows directly with warehouse stock management and accounting audit trails. Today, I'll walk you through the end-to-end architecture, role-based security, CRM follow-ups, inventory movements, and our atomic transaction handling."*

---

### 🟢 SECTION 2: Tech Stack & Architecture (00:35 – 01:15)

**[VISUAL CUE]**: Switch VS Code to show `backend/src/` folder tree, `schema.sql` database file, and `package.json`.

**[SPOKEN SCRIPT]**:
> *"Let me walk you through our tech stack and architectural design:*
> - **Backend**: Built with **Node.js, Express, and TypeScript** for robust, type-safe REST APIs.
> - **Database Layer**: Powered by **Prisma ORM** with **PostgreSQL** schema definitions incorporating check constraints, foreign key cascades, and database indexes for fast query execution.
> - **Frontend**: A high-performance **React + TypeScript SPA** engineered with Vite, featuring custom light glassmorphism CSS components, dynamic stats cards, and zero heavy UI library clutter.
> - **DevOps**: Complete with **Docker Compose**, **GitHub Actions CI**, and automated seed scripts for instant deployment."*

---

### 🟢 SECTION 3: Authentication & Role-Based Access Control (01:15 – 01:55)

**[VISUAL CUE]**: In the browser, click through the **Demo Switcher Bar** in the header (`Admin` ➔ `Sales` ➔ `Warehouse` ➔ `Accounts`). Show how menu navigation tabs adapt dynamically based on active role.

**[SPOKEN SCRIPT]**:
> *"The system implements strict **Role-Based Access Control (RBAC)** backed by JWT tokens. We support four distinct enterprise roles:*
> 1. **Admin**: Full read-write privileges, user management, and system-wide audit logs.
> 2. **Sales**: Access to Customer CRM, follow-up scheduling, and Sales Challan creation.
> 3. **Warehouse**: Dedicated stock movement ledger, manual IN/OUT stock adjustments, and low-stock alerts.
> 4. **Accounts**: Financial challan summary views and stock valuation reports.
> 
> *For easy review, our header includes a one-click **Role Preset Switcher** that contextually switches permissions and UI views in real time."*

---

### 🟢 SECTION 4: Customer CRM Module (01:55 – 02:40)

**[VISUAL CUE]**: Navigate to **Customers** tab. Search for a customer (e.g. *"Delhi Machinery"*), filter by status `Lead`/`Active`, open Customer Detail Modal, add a new follow-up note, and save.

**[SPOKEN SCRIPT]**:
> *"Now let's explore the **Customer CRM Module**. 
> Distribution businesses thrive on customer relationships. Here, sales representatives can manage leads, active clients, and distributors.
> 
> Each customer profile maintains full business metrics including GST numbers, contact info, address details, and structured status tags. 
> Notice our **Follow-Up & Activity Timeline**: sales agents can schedule upcoming follow-up dates and attach meeting notes directly to customer accounts. Everything is paginated and searchable across name, business entity, and phone numbers via optimized backend queries."*

---

### 🟢 SECTION 5: Product & Inventory Tracking (02:40 – 03:25)

**[VISUAL CUE]**: Click on **Products** tab. Show low-stock alert badges (`MIN STOCK ALERT`). Then click on **Inventory Ledger** tab to show historical IN/OUT entries. Perform a manual stock adjustment (+20 units IN).

**[SPOKEN SCRIPT]**:
> *"Moving over to the **Product & Inventory Module**:
> Products track current stock, SKU codes, categories, unit pricing, and warehouse locations.
> 
> If stock falls below specified threshold limits, the system triggers real-time visual **Low Stock Alerts**. 
> Furthermore, every single stock change is recorded in an immutable **Stock Movement Log** tracking quantity changes, movement type (`IN` or `OUT`), created timestamp, user ID, and business reason—providing 100% auditability for warehouse managers."*

---

### 🟢 SECTION 6: Core Business Flow — Sales Challans & Transaction Safety (03:25 – 04:30)

**[VISUAL CUE]**: 
1. Go to **Sales Challans** ➔ Click **+ Create Sales Challan**.
2. Select Customer, pick products (e.g. *Industrial PLC Controller*).
3. **Demonstrate Negative Stock Prevention**: Input a quantity higher than available stock (e.g. 500 units) ➔ Click Confirm ➔ Show red toast error message (`"Insufficient stock for Product..."`).
4. Correct the quantity (e.g. 2 units) ➔ Click **Confirm & Deduct Stock**.
5. Switch to **Warehouse** role ➔ Show that stock decreased and an `OUT` movement log was automatically logged!

**[SPOKEN SCRIPT]**:
> *"Now, let's look at the core business module: **Sales Challan Generation and Atomic Stock Fulfillment**.
> 
> When a sales representative creates a challan:
> 1. **Negative Stock Guard**: If requested stock exceeds available quantity, the backend immediately aborts execution and returns a descriptive HTTP 400 error preventing negative inventory.
> 2. **Product Snapshots**: Challans store frozen product snapshot data (name, SKU, unit price, line totals) rather than volatile foreign keys. Even if product prices change in the catalog tomorrow, historical challans remain accurate.
> 3. **ACID Transaction Security**: When a Challan status changes to `CONFIRMED`, Prisma executes an atomic database transaction (`prisma.$transaction`). It decrements product stock, generates an `OUT` movement record, updates challan status, and appends an audit log entry simultaneously. If any step fails, the entire transaction rolls back."*

---

### 🟢 SECTION 7: Code Deep-Dive & API Documentation (04:30 – 05:10)

**[VISUAL CUE]**: Switch back to VS Code to show `challan.controller.ts` (lines 116–195), then display **Postman Collection** in Postman or `API_DOCUMENTATION.md`.

**[SPOKEN SCRIPT]**:
> *"Here in `challan.controller.ts`, you can see the transaction logic in action. The atomic callback guarantees data consistency under concurrent traffic.
> 
> The application includes comprehensive documentation in `API_DOCUMENTATION.md` along with a ready-to-import **Postman Collection** covering all REST endpoints with automated JWT bearer authentication."*

---

### 🟢 SECTION 8: Deployment & Conclusion (05:10 – 05:45)

**[VISUAL CUE]**: Show `docker-compose.yml`, `README.md`, live Vercel/Render URLs (if deployed), and project submission summary table.

**[SPOKEN SCRIPT]**:
> *"To summarize submission requirements:
> - Full GitHub repository with structured commits and clean code separation.
> - Docker Compose setup for one-command containerized local execution.
> - Pre-seeded demo credentials for Admin, Sales, Warehouse, and Accounts.
> - Complete deployment instructions for PostgreSQL, Express backend, and React frontend.
> 
> Thank you for your time and review! I welcome your feedback."*

---

## 💡 Pro-Tips for Recording:
1. **Screen Resolution**: Set your monitor resolution to **1080p (1920x1080)** and browser zoom to 100-110% so code and UI elements are crisp.
2. **Audio**: Use a noise-canceling microphone or quiet room.
3. **Cursor Highlights**: Use mouse pointer highlight in recording tools (like Loom, OBS, or ScreenFlow) when clicking UI buttons or showing code lines.
4. **Local Execution Command**: Run `npx prisma db seed` in the backend before starting so your DB starts with rich sample data!
