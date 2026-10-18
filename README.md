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

# Start in development mode (with nodemon)
npm run dev

# Run automated tests
npm test
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

## 🧪 Testing & Quality Assurance

```bash
# Run server test suite with Supertest
npm run test:server
```

---

## 📋 Implementation Roadmap

- [x] **Phase 1: Project Planning & Requirements Analysis** (Prompt 1)
- [x] **Phase 2: Architecture & Project Structure** (Prompt 2)
- [ ] **Phase 2: Design System & Application Shell** (Prompt 3)
- [ ] **Phase 2: Database Models, Authentication & Server Authorization** (Prompt 4)
- [ ] **Phase 3: Leads Module & Integration** (Prompt 5)
- [ ] **Phase 3: Companies Module** (Prompt 6)
- [ ] **Phase 3: Tasks Module & Aggregated Dashboard** (Prompt 7)
- [ ] **Phase 4: Final QA, Hardening & Deployment Readiness** (Prompt 8)
