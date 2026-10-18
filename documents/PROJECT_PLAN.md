# LeadFlow CRM — Project Plan

## 1. Executive Summary & Project Overview
**LeadFlow CRM** is a production-grade, full-stack Mini Customer Relationship Management (CRM) web application built using the MERN stack (MongoDB, Express.js, React, Node.js) with Material UI (MUI). The application is designed to streamline sales pipeline workflows, contact organization, task management, and executive performance monitoring through real-time aggregation metrics.

This project follows an iterative 4-phase engineering lifecycle:
- **Phase 1: Planning & Requirements Analysis** (Current Phase)
- **Phase 2: Core Foundation & Infrastructure** (Architecture, UI Shell, Database & Auth)
- **Phase 3: Core Feature Modules** (Leads, Companies, Tasks, and Aggregated Dashboard)
- **Phase 4: Quality Assurance, Hardening, Documentation & Deployment**

---

## 2. Project Delivery Roadmap & Phases

```
+---------------------------------------------------------------------------------------+
| PHASE 1: Plan & Requirements Analysis (Prompt 1)                                      |
| - Requirements extraction, database schema design, authorization specification,       |
|   architecture blueprint, test strategy, implementation checklist, decision log.      |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            v
+---------------------------------------------------------------------------------------+
| PHASE 2: Core Foundation & System Shell (Prompts 2 - 4)                               |
| - Prompt 2: Clean monorepo structure (client/ & server/), shared tooling & configs.   |
| - Prompt 3: Design system tokens (Indigo/Purple #6366F1), persistent responsive shell. |
| - Prompt 4: MongoDB models, bcrypt password hashing, JWT auth, ownership middleware.   |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            v
+---------------------------------------------------------------------------------------+
| PHASE 3: Feature Implementation & Integrations (Prompts 5 - 7)                        |
| - Prompt 5: Leads Module (CRUD, search, filtering, pagination, soft-delete safety).   |
| - Prompt 6: Companies Module (CRUD, details view, associated active leads).           |
| - Prompt 7: Tasks & Dashboard (Task assignments, assignee-only status updates,        |
|             MongoDB aggregation pipeline for 4 KPI cards & donut breakdown).          |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            v
+---------------------------------------------------------------------------------------+
| PHASE 4: Hardening, Review & Deployment Readiness (Prompt 8)                          |
| - End-to-end integration verification, regression test runs, security audit.          |
| - Production build optimization, environment isolation, zero-secret verification.     |
| - Final documentation, API references, demo data seed scripts, deployment setup.      |
+---------------------------------------------------------------------------------------+
```

---

## 3. Work Breakdown Structure (WBS)

### Phase 1: Planning (Sprint 0)
- **WBS 1.1**: Requirements extraction from prompt and visual wireframe references.
- **WBS 1.2**: Data modeling & relational mapping for MongoDB/Mongoose.
- **WBS 1.3**: Security and authorization contract drafting (strict assignee rule).
- **WBS 1.4**: Technical architecture design for client/server monorepo.
- **WBS 1.5**: Test strategy formulation (unit, integration, route authorization, UI).
- **WBS 1.6**: Implementation checklist & architectural decisions log creation.

### Phase 2: System Foundation (Sprint 1)
- **WBS 2.1**: Monorepo scaffolding (`client/` and `server/` root folders).
- **WBS 2.2**: Server bootstrap (Express 4/5, error middleware, environment validation, Winston/Morgan logging).
- **WBS 2.3**: Client bootstrap (Vite + React, MUI theme tokens, Axios API interceptor client, React Router 6/7).
- **WBS 2.4**: Application Shell (Responsive drawer/sidebar, app bar, user menu, toast/notification manager).
- **WBS 2.5**: Authentication module (Register/Login endpoints, JWT generation, bcrypt salting, `authMiddleware`).

### Phase 3: Core Business Modules (Sprint 2 & 3)
- **WBS 3.1**: Leads module (Mongoose model with `isDeleted` flag, compound search index, REST endpoints, MUI table with pagination, debounced search, status filter, Add/Edit modal, soft-delete confirmation dialog).
- **WBS 3.2**: Companies module (Company model, relational link to Leads, Company list, detail view with associated non-deleted leads).
- **WBS 3.3**: Tasks module (Task model with lead and user references, server-side assignee check enforcing 403 Forbidden for non-assignees, task list, creation dialog, status update dropdown).
- **WBS 3.4**: Analytics & Dashboard (Backend MongoDB aggregation pipelines: Total Leads, Qualified Leads, Tasks Due Today, Completed Tasks, status breakdown counts; frontend KPI cards and donut chart).

### Phase 4: Hardening & Release (Sprint 4)
- **WBS 4.1**: Backend automated testing suite execution (Jest/Supertest).
- **WBS 4.2**: Frontend test and accessibility check (axe-core, keyboard focus navigation).
- **WBS 4.3**: Seed data script for presentation readiness (realistic demo accounts, companies, leads, tasks).
- **WBS 4.4**: Production builds, cross-origin security audit, clean `.env.example`.
- **WBS 4.5**: Final deployment documentation and GitHub repository synchronization.

---

## 4. Milestone Schedule & Deliverables

| Milestone | Target Deliverable | Exit Criteria |
| :--- | :--- | :--- |
| **M1: Specification Sign-off** | 8 Planning documents in `documents/` | All requirements clarified, zero assumptions undocumented. |
| **M2: Architecture & Shell** | Monorepo layout, MUI theme, App Shell, Auth API | Protected routes redirect, login issues JWT, UI matches purple palette. |
| **M3: Leads & Companies** | End-to-end Leads & Companies features | Soft-delete strictly excludes records from normal queries and counts. |
| **M4: Tasks & Dashboard** | Tasks workflow & Aggregated Dashboard | Only assignees can change task status; Dashboard reflects real MongoDB aggregation data. |
| **M5: QA & Release Ready** | Full test pass, seed data script, deploy config | All test suites green, zero console errors, complete README. |

---

## 5. Risk Assessment & Mitigation Matrix

| Risk / Failure Mode | Likelihood | Impact | Mitigation Strategy |
| :--- | :---: | :---: | :--- |
| **Data Leakage via Soft Delete**: Soft-deleted leads accidentally returned in lists, counts, or company relations. | High | Critical | Implement Mongoose pre-find/pre-aggregate query middleware or explicit service-level query filters (`{ isDeleted: { $ne: true } }`) across all controllers and aggregation stages. |
| **Authorization Bypass**: Frontend hides disabled status dropdown, but malicious client calls `PATCH /api/tasks/:id/status` directly. | Medium | Critical | Strictly enforce ownership validation in the backend controller/middleware. Compare `req.user._id` with `task.assignedTo._id` before saving. Return `403 Forbidden` if mismatched. |
| **Dashboard Timezone Inconsistencies**: "Tasks Due Today" discrepancy depending on server vs. user local timezone. | Medium | Moderate | Use UTC start-of-day (`00:00:00.000Z`) to end-of-day (`23:59:59.999Z`) query boundaries or accept optional client timezone query parameter (`?tz=...`). |
| **Token Expiry Desynchronization**: Token expires while user is editing a lead, causing data loss. | Low | Moderate | Axios response interceptor intercepts 401 Unauthorized, displays a friendly session expiration toast, and saves unsaved form draft in local session or prompts re-login. |
| **MongoDB Atlas Connection Latency**: Server cold starts or flaky database connection during demos. | Low | High | Implement retry logic on initial Mongoose connection and cache Mongoose connection instance. |

---

## 6. Project Governance & Boundary Principles
1. **Explicit Rules Over Assumptions**: No feature or role model is invented without documentation in `documents/DECISIONS.md`.
2. **Backend is Source of Truth**: UI disables buttons for UX, but backend strictly validates permissions and inputs.
3. **Zero Hardcoded Data**: Dashboard numbers, table rows, and dropdown selections must originate from MongoDB database queries.
4. **Documentation Integrity**: Every architectural decision, schema modification, and API endpoint must be reflected across corresponding planning files.
