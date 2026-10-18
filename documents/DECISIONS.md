# LeadFlow CRM — Architectural Decisions Log (ADR)

## 1. Purpose
This document records key architectural decisions, tradeoffs, assumptions, and explicit deviations for **LeadFlow CRM**. Recording these decisions ensures consistency throughout development and provides a transparent audit trail for technical reviewers.

---

## 2. Architectural Decisions Log

### ADR-001: Monorepo Structure (`client/` and `server/`)
- **Status**: Accepted
- **Context**: The project requires separate frontend and backend applications with independent dependencies, scripts, and deployment targets.
- **Decision**: Scaffolding two distinct subdirectories at the root: `client/` (React + Vite) and `server/` (Node.js + Express).
- **Consequences**:
  - Positive: Clean separation of concerns; client and server can be deployed independently (e.g. Vercel for client, Render/Railway for server).
  - Positive: Prevents dependency pollution between Node backend and React frontend.
  - Tradeoff: Two terminals or a root script (e.g. `npm run dev` with `concurrently`) needed during local development.

---

### ADR-002: Language Selection (JavaScript vs TypeScript)
- **Status**: Accepted
- **Context**: The assignment states: *"Use JavaScript unless the assignment or existing repository requires otherwise."*
- **Decision**: Use modern JavaScript (ES6+ with ESModules on the frontend and CommonJS/ESModules on the backend).
- **Consequences**:
  - Positive: Rapid setup with zero build-transpilation friction, matching interview evaluation criteria directly.
  - Mitigation: Strict validation schemas (Mongoose models and request validation) compensate for runtime type safety.

---

### ADR-003: UI Library & Design Tokens (Material UI with Custom Theme)
- **Status**: Accepted
- **Context**: The assignment specifies Material UI (MUI) and the visual reference dictates a distinctive Indigo/Purple palette (`#6366F1`) with deep navy text (`#1E293B`) and lavender canvas (`#F7F8FF`).
- **Decision**: Centralize all design tokens in `client/src/theme/index.js` using MUI's `createTheme`. Override component defaults (`MuiButton`, `MuiCard`, `MuiTableCell`, `MuiChip`) to achieve the custom look without writing ad-hoc utility classes.
- **Consequences**:
  - Positive: 100% visual consistency with the approved design sheet; accessible contrast ratios; native responsive grid system.
  - Positive: Prevents color fragmentation or reuse of the legacy green/teal theme.

---

### ADR-004: Strict Task Status Authorization Rule & Role Model
- **Status**: Accepted
- **Context**: The assignment explicitly dictates: *"Only the user assigned to a task may update that task's status. Enforce this rule on the server, not only in the UI."* However, the assignment document does not specify a complex enterprise multi-role permission matrix (e.g. Admin, Manager, Sales Rep, Auditor).
- **Decision**:
  1. We do **not** invent a speculative role permission hierarchy.
  2. All authenticated users can create tasks, leads, and companies.
  3. For `PATCH /api/tasks/:id/status`, the backend compares `req.user._id.toString() === task.assignedTo.toString()`. If they do not match, the server strictly returns `403 Forbidden`.
  4. Even if a user has `role: 'Admin'`, the server enforces this strict ownership check on the status update endpoint to remain faithful to the explicit assignment requirement. If an Admin needs to reassign the task, a separate task update endpoint (`PUT /api/tasks/:id`) handles task reassignment.
- **Consequences**:
  - Positive: 100% adherence to the explicit assignment specification with zero ambiguity.
  - Positive: High testability via automated Supertest assertions.

---

### ADR-005: Soft Deletion Mechanism for Leads
- **Status**: Accepted
- **Context**: The assignment requires soft deletion for leads: *"Soft-deleted leads must not appear in normal queries"* and *"Exclude soft-deleted leads from all normal list, search, count and dashboard queries."*
- **Decision**:
  - Implement an explicit `isDeleted: { type: Boolean, default: false, index: true }` and `deletedAt: { type: Date, default: null }` on `LeadSchema`.
  - Implement Mongoose pre-query middleware on `find`, `findOne`, `countDocuments` to automatically filter `{ isDeleted: { $ne: true } }`.
  - Explicitly include `{ isDeleted: false }` in all MongoDB aggregation pipelines and `Company` associated lead lookups.
- **Consequences**:
  - Positive: Deleted leads are never permanently wiped from the database, preserving audit history while completely isolating them from active operational workflows.

---

### ADR-006: Backend Aggregation Pipeline for Dashboard Metrics
- **Status**: Accepted
- **Context**: Dashboard statistics must originate from backend aggregation APIs rather than client-side calculations or mock data.
- **Decision**: Use MongoDB's `$facet` operator to compute:
  - `totalLeads`: `{ $match: { isDeleted: false } }, { $count: "count" }`
  - `qualifiedLeads`: `{ $match: { isDeleted: false, status: "Qualified" } }, { $count: "count" }`
  - `tasksDueToday`: Match `dueDate` within today's calendar window `[startOfDay, endOfDay]`.
  - `completedTasks`: `{ $match: { status: "Completed" } }, { $count: "count" }`
  - `statusBreakdown`: `$group` by status with counts for the donut chart.
- **Consequences**:
  - Positive: Single database round-trip delivers all dashboard widgets with sub-50ms latency.
  - Positive: 100% accurate database-driven reporting.

---

### ADR-007: Timezone Handling for "Tasks Due Today"
- **Status**: Accepted
- **Context**: "Tasks Due Today" depends on what time boundary constitutes "Today".
- **Decision**: By default, the server calculates "Today" from `00:00:00.000` to `23:59:59.999` in UTC. The dashboard endpoint will also accept an optional client timezone offset query param (`?tz=Asia/Kolkata` or `?offset=-330`) to dynamically adjust the query window to match the user's local day.
- **Consequences**:
  - Positive: Eliminates edge-case discrepancies where a task due today at 9:00 PM local time falls into tomorrow UTC.

---

## 3. Open Questions Requiring Reviewer Confirmation

The following questions do not block Phase 2 foundation work, but represent deliberate decision points for Phase 3:

| # | Topic | Current Architectural Decision | Alternative Option | Impact |
| :-: | :--- | :--- | :--- | :--- |
| **Q1** | **Admin Override on Task Status** | Enforce strict assignee check for all users (including Admin). | Allow users with `role === 'Admin'` to override task status even if not assigned. | If the interviewer tests whether an Admin can update any task, Option B might be preferred; however, the prompt explicitly says: *"only the user assigned to a task may update that task's status"*. |
| **Q2** | **Default User Registration** | System provides an initial seed script with preset users (`admin@leadflow.com`, `sarah.lee@leadflow.com`, `mike.ross@leadflow.com`) plus a public `POST /api/auth/register` endpoint. | Restrict user creation solely to Admin or seed script (closed organization model). | A public register endpoint simplifies local testing and evaluation by interviewers. |
| **Q3** | **Company Deletion Behavior** | Soft deletion is explicitly required for Leads, but not specified for Companies. We implement standard delete with check: cannot delete company if it has active leads. | Implement soft-delete for companies as well. | Prevents orphaned leads while keeping company management intuitive. |
