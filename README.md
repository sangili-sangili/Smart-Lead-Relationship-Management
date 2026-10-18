# LeadFlow CRM — Smart Lead & Relationship Management

[![Node.js Version](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Material UI](https://img.shields.io/badge/MUI-v6-007FFF.svg)](https://mui.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248.svg)](https://www.mongodb.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-purple.svg)](https://opensource.org/licenses/ISC)

> **LeadFlow CRM** is a production-grade, full-stack Mini Customer Relationship Management (CRM) web application built using the MERN stack (MongoDB, Express.js, React, Node.js) with Material UI (MUI).

---

## 🌟 Key Architectural Highlights

1. **Strict Assignee-Only Task Status Updates**:
   - Enforced directly at the server level via dedicated authorization middleware (`authorizeTask.js`).
   - Returns `403 Forbidden` if any unassigned user attempts a status update.

2. **Bulletproof Soft Deletion**:
   - Leads support soft deletion (`isDeleted: true`, `deletedAt`).
   - Mongoose pre-query middleware and explicit aggregation stages guarantee soft-deleted records never appear in lists, searches, company associations, or dashboard statistics.

3. **100% Backend-Aggregated Dashboard**:
   - Real-time KPI summary cards (*Total Leads*, *Qualified Leads*, *Tasks Due Today*, *Completed Tasks*) and donut status distribution are calculated via MongoDB `$facet` aggregation pipelines.

4. **Curated Indigo/Purple Design System**:
   - Built with Material UI (MUI) using a curated Indigo/Purple palette (`#6366F1`, `#4F46E5`, `#1E293B`, `#F7F8FF`), persistent responsive sidebar, and WCAG AA accessible contrast.

---

## 📂 Repository Structure

```
Smart-Lead-Relationship-Management/
├── client/                     # React SPA (Vite + React Router + MUI + Axios)
│   ├── src/
│   │   ├── app/                # Application root providers
│   │   ├── components/         # Reusable UI primitives
│   │   ├── layouts/            # Persistent AppLayout shell
│   │   ├── pages/              # Route pages (Login, Dashboard, Leads, Companies, Tasks)
│   │   ├── routes/             # AppRoutes & PrivateRoute guard
│   │   ├── services/           # Centralized Axios client & API services
│   │   ├── theme/              # MUI theme tokens & component overrides
│   │   └── constants/          # Status colors, routes, enums
│   ├── index.html
│   └── vite.config.js
│
├── server/                     # Node.js + Express REST API
│   ├── src/
│   │   ├── config/             # Database connection & env validation
│   │   ├── constants/          # HTTP status codes & system enums
│   │   ├── middleware/         # Auth, Task Authorization & centralized Error Handling
│   │   ├── models/             # Mongoose schemas (User, Lead, Company, Task)
│   │   ├── routes/             # Express route endpoints
│   │   ├── utils/              # ApiResponse wrapper & AppError class
│   │   └── tests/              # Jest + Supertest API integration tests
│   ├── .env.example
│   ├── app.js                  # Express application setup
│   └── server.js               # Server entrypoint with DB lifecycle listeners
│
├── documents/                  # Architectural blueprints & planning documentation
│   ├── PROJECT_PLAN.md
│   ├── REQUIREMENTS.md
│   ├── TECHNICAL_ARCHITECTURE.md
│   ├── DATABASE_DESIGN.md
│   ├── AUTHORIZATION_DESIGN.md
│   ├── TEST_STRATEGY.md
│   ├── IMPLEMENTATION_CHECKLIST.md
│   └── DECISIONS.md
│
├── package.json                # Monorepo execution scripts
└── .gitignore
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017`) or MongoDB Atlas URI

### 2. Backend Setup
```bash
cd server

# Install backend dependencies
npm install

# Copy environment template
cp .env.example .env

# Run database migrations (creates collections, validators & ESR compound indexes)
npm run migrate:up

# Check migration status table
npm run migrate:status

# Seed initial dummy data matching Figma UI
npm run seed

# Start in development mode (with nodemon)
npm run dev

# Run automated tests
npm test

# Run query performance benchmark suite
node src/tests/benchmark.js
```
The server will start on `http://localhost:5000` (Health Check: `http://localhost:5000/api/health`).

### 3. Frontend Setup
```bash
cd client

# Install frontend dependencies
npm install

# Start Vite development server
npm run dev
```
The client application will open on `http://localhost:5173`.

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
   - Dashboard statistics consolidated from 9 sequential/parallel queries down to single-pass `$facet` aggregation pipelines for leads and tasks, cutting dashboard latency by ~50%.
7. **Covered Compound Indexes (ESR Pattern)**:
   - Evaluated and verified via `explain("executionStats")` to guarantee `IXSCAN` index scans and eliminate in-memory `SORT` stages.

---

## 🧪 Testing & Quality Assurance

```bash
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

## 📋 Implementation Roadmap

- [x] **Phase 1: Project Planning & Requirements Analysis**
- [x] **Phase 2: Architecture & Project Structure**
- [x] **Phase 2: Design System & Application Shell**
- [x] **Phase 2: Database Models, Authentication & Server Authorization**
- [x] **Phase 3: Database Migrations & MVC Architecture**
- [x] **Phase 3: Automated Notifications & Activity Auditing**
- [x] **Phase 4: Node.js Server-Side Query Optimization & Benchmarking**
- [x] **Phase 5: Final QA, Hardening & Deployment Readiness**
