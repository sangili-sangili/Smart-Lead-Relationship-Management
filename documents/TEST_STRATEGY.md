# LeadFlow CRM — Quality Assurance & Test Strategy

## 1. Testing Philosophy
The **LeadFlow CRM** testing strategy focuses on high-confidence, high-ROI automated tests targeting:
1. **Critical Security Boundaries**: Server-side JWT authentication and strict assignee-only task status authorization.
2. **Data Isolation**: Verifying that soft-deleted leads never leak into normal queries, associated lists, or dashboard aggregations.
3. **Core CRUD & Aggregation Logic**: Accurate database pipeline computation and input validation.

---

## 2. Test Pyramid & Technology Stack

| Level | Scope | Tools | Target Execution |
| :--- | :--- | :--- | :--- |
| **Backend Integration** | API endpoints, routes, middleware, Mongoose models, DB queries | Jest, Supertest, MongoDB In-Memory Server | `npm test` in `server/` |
| **Backend Unit** | Middleware guards, password utilities, token helpers | Jest | `npm test` in `server/` |
| **Frontend Component & Integration** | Login form validation, Task status UI permissions, Lead modals | React Testing Library, Vitest / Jest | `npm test` in `client/` |
| **Manual Workflow Verification** | End-to-end happy path and negative path walkthroughs | Developer evaluation checklist | Pre-release gate |

---

## 3. Backend Test Suites (Detailed Specifications)

### 3.1 Authentication & Authorization Test Suite (`server/src/tests/auth.test.js`)
- [ ] **TC-AUTH-01**: `POST /api/auth/login` with valid email & password returns `200 OK`, valid JWT token, and user profile (excluding password).
- [ ] **TC-AUTH-02**: `POST /api/auth/login` with wrong password returns `401 Unauthorized` with safe message.
- [ ] **TC-AUTH-03**: `POST /api/auth/login` with unregistered email returns `401 Unauthorized`.
- [ ] **TC-AUTH-04**: `POST /api/auth/login` with missing email or password returns `400 Bad Request` with field validation errors.
- [ ] **TC-AUTH-05**: `GET /api/auth/me` with valid `Bearer <token>` returns current user data.
- [ ] **TC-AUTH-06**: `GET /api/auth/me` without `Authorization` header returns `401 Unauthorized`.
- [ ] **TC-AUTH-07**: `GET /api/auth/me` with invalid/tampered token returns `401 Unauthorized`.

### 3.2 Task Assignee Authorization Test Suite (`server/src/tests/taskAuth.test.js`)
- [ ] **TC-TASK-01**: Assigned user updates task status to `In Progress` via `PATCH /api/tasks/:id/status` -> returns `200 OK` and updated document.
- [ ] **TC-TASK-02**: Non-assigned user attempts to update task status via `PATCH /api/tasks/:id/status` -> strictly returns `403 Forbidden` with `"Only the assigned user can update this task status"`.
- [ ] **TC-TASK-03**: Unauthenticated request to `PATCH /api/tasks/:id/status` -> returns `401 Unauthorized`.
- [ ] **TC-TASK-04**: Status update with invalid enum value (e.g. `status: "Archived"`) -> returns `400 Bad Request`.
- [ ] **TC-TASK-05**: Status update on non-existent task ID -> returns `404 Not Found`.

### 3.3 Leads & Soft Deletion Test Suite (`server/src/tests/lead.test.js`)
- [ ] **TC-LEAD-01**: `POST /api/leads` creates lead with `isDeleted: false`.
- [ ] **TC-LEAD-02**: `DELETE /api/leads/:id` marks lead as `isDeleted: true` and sets `deletedAt`.
- [ ] **TC-LEAD-03**: `GET /api/leads` returns only active leads; soft-deleted lead is omitted from list.
- [ ] **TC-LEAD-04**: `GET /api/leads?search=<name>` searches only active leads.
- [ ] **TC-LEAD-05**: `GET /api/companies/:id/leads` lists associated leads, strictly excluding soft-deleted leads.
- [ ] **TC-LEAD-06**: Attempting to soft-delete an already deleted lead or non-existent lead returns proper response.

### 3.4 Dashboard Aggregation Test Suite (`server/src/tests/dashboard.test.js`)
- [ ] **TC-DASH-01**: `GET /api/dashboard/stats` calculates correct `totalLeads` excluding soft-deleted leads.
- [ ] **TC-DASH-02**: `GET /api/dashboard/stats` calculates correct `qualifiedLeads` (status === 'Qualified' and `isDeleted: false`).
- [ ] **TC-DASH-03**: `GET /api/dashboard/stats` calculates `tasksDueToday` based on calendar start/end of day.
- [ ] **TC-DASH-04**: `GET /api/dashboard/stats` calculates `completedTasks` (status === 'Completed').
- [ ] **TC-DASH-05**: Donut chart distribution totals match sum of individual status groups.

---

## 4. Frontend Verification & Accessibility Checklist

### 4.1 Component & Form Validation Tests
- **LoginForm**:
  - Validates email format before submission.
  - Requires non-empty password.
  - Disables submit button while submission is in-flight.
  - Displays error alert upon receiving 401 response.
- **LeadModal**:
  - Enforces required fields (Name, Email, Company, Status).
  - Validates email syntax.
  - Disables duplicate clicks during pending state.
- **TaskTable**:
  - Renders status dropdown as active for assigned user.
  - Renders status dropdown as disabled with tooltip for unassigned users.

### 4.2 Keyboard Navigation & Accessibility (a11y)
- All interactive controls (buttons, inputs, dropdowns, pagination links) must be navigable via `Tab` key.
- Visible focus rings styled using the primary indigo color (`#6366F1`).
- Modal dialogs trap focus and can be dismissed via `Escape` key.
- Color contrast for text against lavender background (`#F7F8FF`) and cards (`#FFFFFF`) exceeds WCAG AA standard (contrast ratio $\ge 4.5:1$).

---

## 5. Test Execution Protocol

```powershell
# Run backend test suite
cd server
npm test

# Run backend tests with coverage report
npm run test:coverage

# Run frontend tests
cd ../client
npm test
```
