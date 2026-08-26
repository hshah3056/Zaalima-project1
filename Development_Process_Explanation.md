# E-Commerce Project: Development Process & Technical Architecture Report

## 1. Project Overview & Objectives
- **Project Name**: Zaalima E-Commerce Multi-Tenant Platform
- **Primary Goal**: Build a modern, multi-tenant e-commerce web application featuring store tenant isolation, customer shopping, vendor onboardings, and secure Role-Based Access Control (RBAC).
- **Core Technology Stack**:
  - **Frontend**: React 19, Redux Toolkit, Tailwind CSS v4, Lucide Icons, Vite
  - **Backend**: Node.js, Express 5, JWT (`jsonwebtoken`), Password Security (`bcryptjs`), CORS
  - **Database**: MongoDB with Mongoose ORM, inspectable via MongoDB Compass

---

## 2. Week 1 Development Milestones & Implementation Breakdown

### Phase 1: Database Schema Modeling (Day 1 – 2)
We designed and implemented 4 core Mongoose schemas in `server/models/`:
1. **User Schema (`User.js`)**:
   - Stores `name`, `email` (unique), `password` (hashed via `bcryptjs`), `role` (`'customer'`, `'vendor'`, `'admin'`), and `storeId`.
   - Features an automated `pre('save')` hashing hook and password verification methods.
2. **Store Schema (`Store.js`)**:
   - Multi-tenant configuration containing `tenantId` (e.g. `tenant-megastore`), `name`, `tagline`, `themeColor`, `bannerTitle`, and `owner` (ref User).
3. **Product Schema (`Product.js`)**:
   - Stores catalog items partitioned by `tenantId`, including `name`, `brand`, `price`, `originalPrice`, `discount`, `category`, `image`, `isDealOfTheDay`, `stock`, and `createdBy`.
4. **Order Schema (`Order.js`)**:
   - Captures order history partitioned by `tenantId`, referencing `customer`, `items`, `totalAmount`, `status`, and `shippingAddress`.

### Phase 2: Node/Express Server & JWT RBAC (Day 3 – 5)
1. **JWT Auth Middleware (`authMiddleware.js`)**:
   - Intercepts requests, validates `Authorization: Bearer <token>`, and attaches authenticated user context.
2. **Role-Based Access Control (`roleMiddleware.js`)**:
   - Enforces RBAC permissions (`authorizeRoles('vendor', 'admin')`). Rejects unauthorized role access with `403 Forbidden`.
3. **Tenant Isolation Middleware (`tenantMiddleware.js`)**:
   - Reads `x-tenant-id` HTTP header to partition data queries across store tenants.
4. **REST API Routes (`server/routes/`)**:
   - `POST /api/auth/register`: Account registration for Customers and Vendors.
   - `POST /api/auth/login`: Credential verification & 7-day JWT token issuance.
   - `GET /api/auth/me`: Authenticated profile retrieval.
   - `GET /api/stores` & `POST /api/stores`: Multi-tenant store catalog and vendor creation.
   - `GET /api/products` & `POST /api/products`: Tenant-isolated product query and vendor uploads.
   - `POST /api/orders`: Order placement and summary tracking.

### Phase 3: React Scaffolding & Auth UI Integration (Day 6 – 7)
1. **Redux State Management (`src/store/`)**:
   - `authSlice.js`: JWT token storage in `localStorage`, user role tracking.
   - `productSlice.js`: Product dataset management and client-side filtering.
   - `tenantSlice.js`: Multi-tenant store selections.
   - `cartSlice.js`: Slide-over cart drawer with total calculations.
2. **User Interface Components**:
   - `AuthModal.jsx`: Interactive modal for Login & Account Creation with Customer vs. Vendor role selector.
   - `Header.jsx`: Navigation bar featuring store switcher, search bar, user role badge, and sign-in controls.
   - `HomePage.jsx` & `App.jsx`: Full-width responsive storefront layout.
   - **Static Storefront Mode**: Configured static product catalog so team members can inspect and test the full UI without requiring an active database server connection.

---

## 3. System Architecture & Flow Diagram

```
[ Customer / Vendor / Admin ]
             │
   (HTTP / JSON REST API)
             ▼
   [ React Frontend App ] ◄──────► [ Redux Store ] (auth, products, tenant, cart)
             │
    (Header: x-tenant-id)
             ▼
   [ Node.js / Express Server ]
             │
   ┌────────────────────────────────────────┐
   │ Middleware Layer:                       │
   │ 1. authMiddleware (JWT Validation)     │
   │ 2. roleMiddleware (RBAC Access Check)  │
   │ 3. tenantMiddleware (x-tenant-id Scope)│
   └─────────┬──────────────────────────────┘
             ▼
   [ MongoDB Database ] (zaalima_ecommerce)
   ├── Users Collection
   ├── Stores Collection
   ├── Products Collection
   └── Orders Collection
```

---

## 4. How to Run & Test the Project

### A. Express Backend Server
```bash
cd server
npm start
# Express Server running on http://127.0.0.1:5001
```

### B. React Frontend App
```bash
cd my-react-app
npm run dev
# Vite Dev Server running on http://localhost:5173/
```

### C. MongoDB Compass Data Inspection
- **Connection URI**: `mongodb://127.0.0.1:27017/zaalima_ecommerce`
- **Database Name**: `zaalima_ecommerce`
- **Default Seed Test Credentials**:
  - **Customer Account**: `customer@example.com` / `password123`
  - **Vendor Account**: `vendor@example.com` / `password123`
  - **Admin Account**: `admin@example.com` / `password123`
