# LeadFlow CRM — Smart Lead & Relationship Management

[![Node.js Version](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248.svg)](https://www.mongodb.com/)
[![Vite](https://img.shields.io/badge/Bundler-Vite-646CFF.svg)](https://vitejs.dev/)
[![License: ISC](https://img.shields.io/badge/License-ISC-purple.svg)](https://opensource.org/licenses/ISC)

> **LeadFlow CRM** is a production-grade, full-stack Customer Relationship Management (CRM) application built on the MERN stack (MongoDB, Express.js, React, Node.js) with Tailwind CSS, Vite, and JWT-secured REST APIs.

---

## 🌐 Live Deployments

- **Frontend Web App**: [https://smart-lead-relationship-management-1.onrender.com](https://smart-lead-relationship-management-1.onrender.com)
- **Backend REST API**: [https://smart-lead-relationship-management.onrender.com/api](https://smart-lead-relationship-management.onrender.com/api)
- **API Health Check**: [https://smart-lead-relationship-management.onrender.com/api/health](https://smart-lead-relationship-management.onrender.com/api/health)

---

## 🖥️ Application Showcase

![LeadFlow CRM UI Dashboard Showcase](./Mini%20CRM%20UI%20Dashboard%20Showcase.png)

---

## 🔐 Default Demo Accounts

For immediate evaluation and live testing, the database is pre-seeded with the following credentials:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@mini.crm` | `password123` | Full access: create, edit, delete leads, companies, and all tasks |
| **Sales Rep** | `sarah.lee@mini.crm` | `password123` | Pipeline access: create leads, update assigned tasks |
| **Sales Rep** | `mike.ross@mini.crm` | `password123` | Pipeline access: create leads, update assigned tasks |

---

## 🌟 Key Architectural Highlights

1. **Strict Assignee-Only Task Status Updates (ABAC)**:
   - Server-level authorization enforced via [`authorizeTask.js`](./server/src/middleware/authorizeTask.js) and [`taskController.js`](./server/src/controllers/taskController.js).
   - Only the assigned user or an Admin can advance a task's status (`Pending` $\rightarrow$ `In Progress` $\rightarrow$ `Completed`). Attempts by unassigned users are rejected with `403 Forbidden`.

2. **Bulletproof Soft Deletion & Recovery**:
   - Leads support soft deletion (`isDeleted: true`, `deletedAt`).
   - Mongoose pre-query hooks and explicit aggregation stages guarantee soft-deleted leads never appear in active lists, searches, company associations, or dashboard statistics, while allowing instant restoration.

3. **100% Backend-Aggregated Dashboard (`$facet`)**:
   - Pipeline KPI summaries (*Total Leads*, *Qualified Leads*, *Tasks Due Today*, *Completed Tasks*) and lead status distributions are calculated in a single-pass MongoDB `$facet` aggregation pipeline, eliminating N+1 queries.

4. **Portal-Based Floating Dropdowns**:
   - All dropdowns render outside modal and card scroll containers via React Portals (`createPortal(..., document.body)`), completely eliminating clipping or overflow issues.
   - Includes automatic viewport detection (auto-flips upward if space below is limited) and integrated search filtering.

5. **Smart Pagination & Debounced Search**:
   - Server-side bounded pagination with compact pagination navigation (`1 2 3 ... 10 11`), preventing button overlap at 30+ pages.
   - 350ms input debouncing on all search inputs to prevent server API spam while maintaining instant typing responsiveness.

6. **Fully Responsive Design & Dark/Light Mode**:
   - Seamlessly responsive from 320px mobile screens (iPhone SE) to 768px tablets, 1024px laptops, and 4K displays.
   - Built-in Dark and Light themes with local storage persistence and instantaneous toggle.

---

## 📂 Repository Structure

```
Smart-Lead-Relationship-Management/
├── client/                     # React 18 SPA (Vite + Tailwind CSS v4 + Axios)
│   ├── src/
│   │   ├── components/         # Common UI primitives, Modals, Forms, Dropdowns
│   │   ├── constants/          # Routes, status definitions, dropdown options
│   │   ├── context/            # AuthContext, ThemeContext, ToastContext, ConfirmContext
│   │   ├── layouts/            # Persistent AppLayout shell (Sidebar, Header, Drawer)
│   │   ├── pages/              # Dashboard, Leads, Companies, Tasks, Details, Login
│   │   ├── routes/             # AppRoutes & PrivateRoute auth guard
│   │   └── services/           # Axios client instance & domain API services
│   ├── public/                 # Static assets & _redirects for SPA routing
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Node.js + Express REST API
│   ├── src/
│   │   ├── config/             # Database connection, env validation, auto-seed
│   │   ├── constants/          # HTTP status codes & system enums
│   │   ├── controllers/        # Auth, Lead, Company, Task, Notification controllers
│   │   ├── middleware/         # Auth, Task Authorization & Error Handling
│   │   ├── migrations/         # Database migrations and seed datasets
│   │   ├── models/             # Mongoose schemas (User, Lead, Company, Task, Notification)
│   │   ├── routes/             # Express route routers
│   │   ├── utils/              # ApiResponse wrapper, AppError, logger, query helpers
│   │   └── tests/              # Jest + Supertest integration tests & benchmarks
│   ├── .env.example
│   ├── app.js                  # Express application setup & CORS configuration
│   ├── server.js               # Server entrypoint with lifecycle listeners
│   └── package.json
│
├── documents/                  # Technical specifications & architecture blueprints
│   ├── TECHNICAL_ARCHITECTURE.md
│   ├── DATABASE_DESIGN.md
│   ├── AUTHORIZATION_DESIGN.md
│   └── TEST_STRATEGY.md
│
├── package.json                # Root monorepo execution scripts
└── README.md
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher
- **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

---

### 2. Backend Setup
```bash
cd server

# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env

# 3. Seed initial users, leads, companies, and tasks
npm run seed

# 4. Start the backend development server
npm run dev
```
The server will start on `http://localhost:5000` (Health Check: `http://localhost:5000/api/health`).

---

### 3. Frontend Setup
```bash
cd client

# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev
```
The client application will start on `http://localhost:5173`. Open your browser and log in with `admin@mini.crm` / `password123`.

---

## 📡 REST API Reference

All protected endpoints require an `Authorization: Bearer <token>` header.

### Authentication & Users
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/api/auth/me` | Protected | Get authenticated user profile |
| `PUT` | `/api/auth/profile` | Protected | Update profile (name, email, phone) |
| `PUT` | `/api/auth/change-password` | Protected | Update user password |
| `GET` | `/api/users` | Protected | List team members for task/lead assignments |

### Leads
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/leads` | Protected | List leads with debounced search, status/user filter, and pagination |
| `POST` | `/api/leads` | Protected | Create a new lead |
| `GET` | `/api/leads/:id` | Protected | Get lead details |
| `PUT` | `/api/leads/:id` | Protected | Update lead information |
| `DELETE` | `/api/leads/:id` | Protected | Soft-delete a lead (`isDeleted: true`) |
| `POST` | `/api/leads/:id/restore` | Protected | Restore a soft-deleted lead |

### Companies
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/companies` | Protected | List companies with lead counts and industry filters |
| `POST` | `/api/companies` | Protected | Create a new company account |
| `GET` | `/api/companies/:id` | Protected | Get company profile and associated active leads |
| `PUT` | `/api/companies/:id` | Protected | Update company information |
| `DELETE` | `/api/companies/:id` | Protected | Delete company |

### Tasks
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tasks` | Protected | List tasks with filters (Status, Priority, User) |
| `POST` | `/api/tasks` | Protected | Create a new task assigned to a lead and user |
| `GET` | `/api/tasks/:id` | Protected | Get task details |
| `PUT` | `/api/tasks/:id` | Protected | Update task details |
| `PATCH` | `/api/tasks/:id/status` | Assignee/Admin | Update task status (Pending $\rightarrow$ In Progress $\rightarrow$ Completed) |
| `DELETE` | `/api/tasks/:id` | Protected | Delete task |

### Dashboard & Notifications
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | Protected | Single-pass `$facet` aggregation of live pipeline metrics |
| `GET` | `/api/notifications` | Protected | Fetch system audit notifications |
| `PATCH` | `/api/notifications/read-all` | Protected | Mark all unread notifications as read |
| `DELETE` | `/api/notifications` | Protected | Clear audit notifications |
| `GET` | `/api/health` | Public | Server uptime and MongoDB connection health check |

---

## ⚙️ Environment Variables

### Backend (`server/.env`)
| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port on which the Express server listens |
| `NODE_ENV` | `development` | Environment mode (`development` or `production`) |
| `MONGO_URI` | `mongodb://localhost:27017/leadflow_crm` | MongoDB connection URI |
| `JWT_SECRET` | `leadflow_crm_super_secret_jwt_key_min_32_chars` | Secret key used to sign and verify JWT tokens |
| `JWT_EXPIRES_IN` | `7d` | JWT token validity duration |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin for frontend requests |

### Frontend (`client/.env`)
| Variable | Default | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `/api` | Base URL for API calls (auto-proxies in dev, targets Render in prod) |

---

## ⚡ Server-Side Query Optimizations & Hardening

1. **Production-Tuned Connection Pool**:
   - `maxPoolSize: 50`, `minPoolSize: 10`, `maxIdleTimeMS: 30000`, `socketTimeoutMS: 45000` in `db.js`.
2. **ReDoS-Safe Input Sanitization**:
   - All text searches are sanitized via `escapeRegex()` in `queryHelper.js` to prevent regex injection and catastrophic backtracking.
3. **Hard-Capped Pagination Bounds**:
   - `sanitizePagination()` strictly enforces `MAX_PAGE_SIZE = 100` and validates page/limit inputs to eliminate unbounded memory exposure.
4. **Lean Memory Footprint & Projections**:
   - All read queries utilize `.lean()` and targeted `.select()` projections, eliminating Mongoose document hydration overhead and shrinking payload sizes.
5. **Deterministic Stable Sorting**:
   - Compound sorting with unique tie-breaker (`_id: -1`) eliminates pagination drift across pages.
6. **Consolidated Single-Pass Aggregation Pipelines**:
   - Dashboard statistics consolidated from 9 sequential queries down to single-pass `$facet` aggregation pipelines, cutting dashboard latency by ~50%.
7. **Covered Compound Indexes (ESR Pattern)**:
   - Evaluated and verified via `explain("executionStats")` to guarantee `IXSCAN` index scans and eliminate in-memory `SORT` stages.

---

## 🧪 Testing & Quality Assurance

```bash
cd server

# Run Jest automated test suites with Supertest & executionStats
npm test

# Run MVC REST API verification
node src/tests/mvcVerification.js

# Run Notification & Audit Trigger verification
node src/tests/notificationVerification.js

# Run Query Performance Benchmark Suite
node src/tests/benchmark.js
```

---

## 📄 License

This project is licensed under the **ISC License**.
