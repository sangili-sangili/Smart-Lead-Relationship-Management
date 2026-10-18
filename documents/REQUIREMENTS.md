# LeadFlow CRM — System Requirements Specification

## 1. Introduction & Source of Truth
This document defines the functional and non-functional requirements for **LeadFlow CRM**, extracted directly from the assignment prompt and the provided visual UI design specification.

- **Source of Truth**:
  1. Project prompt specifications (`prompt.md`)
  2. Approved UI Design Reference Sheet (Design direction: Indigo/Purple palette, persistent sidebar, cohesive data tables, cards, dialogs, and responsive layouts).

---

## 2. Requirement Classification

To maintain architectural integrity, requirements are strictly categorized into:
- **[EXPLICIT]**: Hard requirements mandated directly by the assignment.
- **[INFERRED/DESIGN]**: Requirements derived directly from the approved design sheet wireframe.
- **[ASSUMPTION/DECISION]**: Standard engineering choices made to fulfill explicit goals (fully documented in `documents/DECISIONS.md`).

---

## 3. Module-by-Module Functional Requirements

### 3.1 Module 1: Authentication & Session Management
- **[EXPLICIT]** Users authenticate using email and password via JWT access tokens.
- **[EXPLICIT]** Passwords must be hashed using `bcrypt` (never stored in plaintext).
- **[EXPLICIT]** Login must validate required fields on the client and server.
- **[EXPLICIT]** Clear, user-friendly API errors must be displayed on invalid credentials.
- **[EXPLICIT]** Private routes and APIs must require valid JWT verification.
- **[INFERRED/DESIGN]** Login screen features a branded split layout:
  - Left panel: Branded marketing card ("Smarter Leads Bigger Opportunities", vector artwork, badge "Mini CRM").
  - Right panel: Authentication form with fields for Email Address, Password (with toggle visibility), "Remember me" checkbox, "Forgot password?" placeholder link, "Login" button, and "Don't have an account? Contact admin" note.
- **[INFERRED/DESIGN]** User profile (Name, Role/Avatar) displayed in the sidebar footer and top bar.
- **[EXPLICIT]** Safe client-side logout clearing stored tokens and resetting application state.

### 3.2 Module 2: Dashboard & Aggregated Analytics
- **[EXPLICIT]** Dashboard metrics must be computed strictly via backend MongoDB aggregation pipelines (no hardcoded metrics; no frontend-only calculations).
- **[EXPLICIT]** Mandatory 4 KPI summary metrics:
  1. **Total Leads**: Count of all active leads (excluding soft-deleted leads).
  2. **Qualified Leads**: Count of leads currently in `Qualified` status (excluding soft-deleted leads).
  3. **Tasks Due Today**: Count of tasks with a `dueDate` matching the current calendar day (00:00:00 to 23:59:59 UTC/Local).
  4. **Completed Tasks**: Count of tasks with status `Completed`.
- **[EXPLICIT]** Soft-deleted leads must be strictly excluded from all dashboard counts.
- **[INFERRED/DESIGN]** Visual widgets:
  - **Leads by Status**: Donut chart breakdown showing counts and percentages for each status (`New`, `Contacted`, `Qualified`, `Lost`, `Converted`).
  - **Upcoming Tasks**: List preview showing Title, Lead, Due Date/Time, and Priority badge (`High`, `Medium`, `Low`), with a "View All" link directing to the Tasks module.
  - KPI trend indicators (e.g. `+12%`, `+8%`, `-2%`, `+15%`) displayed as badge chips.

### 3.3 Module 3: Leads Management
- **[EXPLICIT]** Create new lead with validation for required fields.
- **[EXPLICIT]** Retrieve paginated list of leads.
- **[EXPLICIT]** Update existing lead details.
- **[EXPLICIT]** Update lead status directly or via edit modal.
- **[EXPLICIT]** Full-text or regex search across name and email.
- **[EXPLICIT]** Filter leads by status (`New`, `Contacted`, `Qualified`, `Lost`, `Converted`).
- **[EXPLICIT]** Associate leads with a Company and an Assigned User.
- **[EXPLICIT]** **Soft Deletion**: Leads must support soft deletion via an explicit flag (`isDeleted: true`, `deletedAt`).
- **[EXPLICIT]** **Query Isolation**: Soft-deleted leads must be permanently excluded from all normal lists, searches, counts, and dropdowns.
- **[INFERRED/DESIGN]** Data fields:
  - Name (Required)
  - Email (Required, validated email format)
  - Phone (Optional/Standard string)
  - Status (Required: `New` | `Contacted` | `Qualified` | `Lost` | `Converted`)
  - Company (Required reference to Company document)
  - Assigned To (Optional/Recommended reference to User document)
- **[INFERRED/DESIGN]** UI components:
  - Responsive table with columns: Name (with avatar initials), Email, Status badge, Assigned User, Company, Actions (Edit icon, Delete icon).
  - Search input, Status filter dropdown, User filter dropdown, Clear filters button, "+ Add Lead" primary button.
  - Server-side pagination controls ("Showing X-Y of Z leads", page buttons).
  - Add/Edit Lead modal dialog with form validation and submit disable state.
  - Delete confirmation modal dialog: *"Are you sure you want to delete this lead? This action cannot be undone."*

### 3.4 Module 4: Companies Management
- **[EXPLICIT]** Create a new company.
- **[EXPLICIT]** Retrieve list of companies.
- **[EXPLICIT]** Retrieve company details by unique ID.
- **[EXPLICIT]** Retrieve associated non-deleted leads for a company.
- **[EXPLICIT]** Non-deleted leads isolation: Never include soft-deleted leads in associated lead counts or lists.
- **[INFERRED/DESIGN]** Data fields:
  - Company Name (Required, unique or trimmed string)
  - Industry (e.g., IT, Software, Manufacturing, Healthcare, Finance)
  - Location (e.g., Chennai, Bangalore, Coimbatore, Madurai, Trichy)
  - Website (e.g., `www.company.com`)
- **[INFERRED/DESIGN]** UI components:
  - Companies table: Company Name, Industry, Location, Actions (View/Edit, Delete).
  - Search filter by company name/industry.
  - Company Detail view:
    - Back button navigation.
    - Header card with Company Name, Industry, Location badge.
    - "Company Details" summary card (Website, Total Associated Leads count).
    - "Associated Leads" table/card displaying lead avatar, name, email, and status badge with direct drill-down links.

### 3.5 Module 5: Tasks Management & Authorization Rules
- **[EXPLICIT]** Create tasks linked to a Lead.
- **[EXPLICIT]** Assign tasks to a specific User.
- **[EXPLICIT]** Retrieve list of tasks with populated Lead and Assigned User details.
- **[EXPLICIT]** Task status update workflow (`Pending`, `In Progress`, `Completed`).
- **[EXPLICIT]** **Mandatory Security Rule**: **Only the user assigned to a task may update its status**.
- **[EXPLICIT]** **Server-Side Enforcement**: The rule must be enforced on the backend (`403 Forbidden` response if authenticated `req.user._id` !== `task.assignedTo`). The frontend must not be solely relied upon to hide buttons.
- **[INFERRED/DESIGN]** Data fields:
  - Title (Required, string)
  - Lead (Required reference to Lead)
  - Assigned To (Required reference to User)
  - Due Date (Required date/time)
  - Status (Enum: `Pending` | `In Progress` | `Completed`; Default: `Pending`)
  - Priority (Enum: `High` | `Medium` | `Low`; Default: `Medium`)
- **[INFERRED/DESIGN]** UI components:
  - Tasks table: Title, Lead, Due Date, Status badge/dropdown, Assigned To, Actions.
  - Create Task modal with Lead dropdown, Assignee dropdown, Due Date picker, Priority selector.
  - Client-side status update handling: Disabled or tooltip explaining permission if the logged-in user is not the assignee.

---

## 4. Non-Functional Requirements (NFRs)

### 4.1 UI Design System & Aesthetics
- **Theme Identity**: Indigo & Violet/Purple theme (Distinct from legacy green/teal).
- **Core Color Palette**:
  - Primary Indigo: `#6366F1`
  - Primary Hover: `#4F46E5`
  - Primary Light: `#EDE7FF`
  - Deep Navy / Dark Surface: `#1E293B`
  - Background Canvas: `#F7F8FF`
  - Card & Surface: `#FFFFFF`
  - Primary Text: `#172554` / `#1E293B`
  - Secondary Text: `#64748B`
  - Border Lines: `#E2E8F0`
  - Status Colors:
    - Success: `#10B981`
    - Warning: `#F59E0B`
    - Error: `#EF4444`
    - Information: `#3B82F6`
- **Typography**: `Inter`, sans-serif. Modern font hierarchy (H1 32px, H2 24px, H3 18px, Body 14px, Caption 12px).
- **Persistent App Shell**: Sidebar navigation remains rendered across all authenticated views (Dashboard, Leads, Companies, Tasks).
- **Responsive Breakpoints**:
  - Desktop: $\ge 1280\text{px}$ (Expanded sidebar, dense data tables)
  - Tablet: $768\text{px} - 1024\text{px}$ (Collapsible drawer, scrollable tables)
  - Mobile: $320\text{px} - 767\text{px}$ (Temporary overlay drawer, stacked cards)

### 4.2 Security Architecture
- Password hashing with `bcrypt` (salt rounds $\ge 10$).
- Signed JWTs with standard expiration (e.g. 24h) and secret key stored in environment variables.
- Standard Bearer token authentication via `Authorization: Bearer <token>` HTTP header.
- CORS restricted to configured frontend origins (`CLIENT_URL`).
- Strict schema validation with sanitized inputs to prevent NoSQL query injections.
- Zero secrets committed to version control.

### 4.3 Data Integrity & Error Handling
- Standard JSON envelope for all API responses:
  ```json
  {
    "success": true,
    "data": { ... },
    "message": "Operation successful"
  }
  ```
- Standardized error envelope:
  ```json
  {
    "success": false,
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Human readable description",
      "details": []
    }
  }
  ```
- Client-side toast notifications for all network responses (Success, Info, Warning, Error).

---

## 5. Acceptance Criteria

| Feature | Acceptance Criteria |
| :--- | :--- |
| **Auth** | User can log in with valid credentials; invalid email/password displays descriptive error toast; unauthenticated access to `/leads` redirects to `/login`. |
| **Dashboard** | Total Leads, Qualified Leads, Due Today, and Completed Tasks accurately reflect database documents; soft-deleted leads do not increment totals. |
| **Leads Search** | Typing in search bar debounces and returns matching records by name or email; filter by status updates table; soft-deleted records never show. |
| **Soft Delete** | Clicking delete opens modal; upon confirm, record is marked `isDeleted: true`; page updates immediately; refreshing page still hides record. |
| **Companies** | Creating company shows in table; clicking company opens detail page; associated leads tab shows only non-deleted leads linked to that company. |
| **Task Ownership** | Logged-in User A can change status of Task assigned to User A; Logged-in User B attempting to change status of Task assigned to User A receives `403 Forbidden`. |
| **UI Shell** | Sidebar persists across page transitions without unmounting; active navigation tab is visually highlighted in indigo; responsive toggle functions on mobile. |
