Prompt 1 — Project planning and requirement analysis

Act as a Senior Software Architect with 10+ years of experience building production-quality MERN stack applications.

Project name: LeadFlow CRM
Project type: MERN Stack Mini CRM interview assignment.

Before writing any code, inspect the uploaded assignment document and extract its exact requirements. The assignment document is the source of truth.

Mandatory stack:
- Frontend: React, React Router, Axios or Fetch or TanStack Query, Material UI (MUI)
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose
- Authentication: JWT access tokens and bcrypt

Required modules:
1. Authentication and login
2. Dashboard with aggregation API data
3. Leads management: create, update, list, status update, search, filtering, pagination, soft deletion
4. Companies: create, list, details, associated leads
5. Tasks: create tasks for leads, assign tasks to users, update task status

Mandatory rules:
- Soft-deleted leads must not appear in normal queries.
- Only users assigned to a task can update its status.
- The sidebar must persist across application pages.
- Login must validate required fields and display API errors.
- Dashboard statistics must come from backend aggregation APIs.
- Authorization logic must be clearly explained in the final documentation.
- The finished project must be deployable and include frontend/backend GitHub source code.

Create these documents before implementing code:
- documents/PROJECT_PLAN.md
- documents/REQUIREMENTS.md
- documents/TECHNICAL_ARCHITECTURE.md
- documents/DATABASE_DESIGN.md
- documents/AUTHORIZATION_DESIGN.md
- documents/TEST_STRATEGY.md
- documents/IMPLEMENTATION_CHECKLIST.md
- documents/DECISIONS.md

For every document:
- Use clear headings and practical details.
- Separate explicit assignment requirements from assumptions and decisions.
- Identify unclear requirements without silently inventing rules.
- Define acceptance criteria for each module.
- Include risks, dependencies, edge cases and error states.
- Explain the intended frontend/backend/database boundaries.

Do not implement components, APIs, database models or business logic yet. Do not install dependencies yet.

At the end, summarize the documents created and list any unresolved questions that require a deliberate project decision.

Prompt 2 — Architecture and project structure

Continue the LeadFlow CRM project using the approved planning documents.

Act as a senior MERN engineer. First inspect the current repository, planning documents and assignment requirements.

Create a clean monorepo structure with separate frontend and backend applications.

Suggested structure:

leadflow-crm/
  client/
    src/
      app/
      assets/
      components/
      layouts/
      pages/
      features/
      hooks/
      services/
      utils/
      constants/
      routes/
      theme/
      tests/
  server/
    src/
      config/
      controllers/
      services/
      models/
      routes/
      middleware/
      validators/
      utils/
      constants/
      tests/
    app.js
    server.js
  documents/
  README.md
  .gitignore

Adjust this structure only when there is a clear architectural reason. Avoid unnecessary abstraction.

Requirements:
- Use JavaScript unless the assignment or existing repository requires otherwise.
- Use React Router for frontend routing.
- Use MUI for the component system.
- Use one consistent HTTP/data-fetching approach.
- Use Express routers, controllers, services, models, validation and middleware with clear responsibilities.
- Use environment variables for secrets and configuration.
- Add centralized API error handling.
- Define a consistent API response and error format.
- Separate authentication and authorization middleware.
- Create a reusable frontend API client and shared error-handling approach.
- Prepare a reusable theme using the approved LeadFlow CRM design.
- Configure appropriate development scripts.
- Configure linting and testing only with dependencies that will actually be used.
- Do not add redundant libraries or unnecessary boilerplate.

Do not implement all module functionality yet. Establish the structure, essential configuration, routing foundations and reusable infrastructure only.

Update documents/TECHNICAL_ARCHITECTURE.md to match the actual implementation. Report every dependency added and explain why it is needed. Do not claim any feature is complete unless it works.



Prompt 3 — Design system and application shell

Implement the LeadFlow CRM design system and shared application layout based on the approved indigo/purple UI reference.

IMPORTANT: Do not reuse the previous project's teal/green color theme. The new CRM must have its own distinct visual identity.

Design direction:
- Primary indigo: #6366F1
- Primary hover: #4F46E5
- Deep navy: #1E293B
- Light lavender background: #F7F8FF
- White surfaces: #FFFFFF
- Main text: #172554
- Secondary text: #64748B
- Border: #E2E8F0
- Success: #10B981
- Warning: #F59E0B
- Error: #EF4444
- Information: #3B82F6
- Use Inter or a similar clean sans-serif font.
- Use rounded cards, subtle shadows, consistent spacing and restrained gradients.
- Keep data tables readable and professional.
- Use clear status badges and consistent form validation.
- Use accessible contrast, visible keyboard focus and sensible loading states.

Implement only the shared design foundation and application shell:
1. MUI theme and design tokens.
2. Shared buttons, inputs, cards, status badges and loading indicators.
3. Sidebar navigation for Dashboard, Leads, Companies and Tasks.
4. Persistent sidebar across authenticated pages.
5. Responsive top bar with user information and logout action.
6. Responsive desktop, tablet and mobile layout.
7. Shared empty, error and loading states.
8. Login page visual structure based on the assignment's wireframe, using the new purple theme.
9. Reusable modal and toast patterns.

Use the generated design image as a visual reference, not as a literal screenshot to reproduce. Create real React components using MUI. Do not embed the image as the application UI.

Do not implement business APIs or fake working CRUD functionality at this stage. Avoid decorative controls that appear interactive but do nothing.

Verify layout consistency, responsive behavior and keyboard accessibility. Update the implementation checklist with completed items and remaining work.

Prompt 4 — Database models, authentication and authorization

Implement the LeadFlow CRM backend foundation using Node.js, Express.js, MongoDB and Mongoose, following the approved architecture and original assignment.

Start by inspecting the existing code and planning documents. Do not overwrite existing work unnecessarily.

Implement:
1. MongoDB connection configuration.
2. User model and password hashing with bcrypt.
3. JWT access-token authentication.
4. Login endpoint with required-field validation and safe error responses.
5. Authentication middleware that verifies JWTs.
6. Authorization middleware and ownership checks.
7. Centralized error-handling middleware.
8. Request validation for incoming data.
9. Environment variable validation and an .env.example file with placeholders only.
10. Initial test setup and authentication tests.

Create appropriate Mongoose models for:
- Users
- Leads
- Companies
- Tasks

Follow DATABASE_DESIGN.md. Use references and indexes where justified. Include createdAt/updatedAt timestamps where appropriate.

Security requirements:
- Never store plaintext passwords.
- Never return password hashes or secrets in API responses.
- Never trust user IDs, role values or ownership claims supplied by the client.
- Verify the authenticated identity on the server.
- Protect private endpoints.
- Validate IDs, request bodies and query parameters.
- Use safe error messages without exposing stack traces in production.
- Configure CORS from environment-based trusted origins.
- Do not commit real credentials.

The assignment specifically states that only the user assigned to a task may update that task's status. Enforce this rule on the server, not only in the UI.

Do not invent a complex role hierarchy unless justified by the assignment. Record any additional role or authorization decisions in documents/AUTHORIZATION_DESIGN.md and documents/DECISIONS.md.

Write tests for successful login, invalid credentials, missing fields, invalid/expired tokens, unauthorized access and forbidden task-status updates.

Run the tests and report actual results. Do not proceed to frontend CRUD integration until the authentication and authorization foundation is stable.

Prompt 5 — Leads module and backend integration

Implement the LeadFlow CRM Leads module end to end, following the original assignment and approved design.

Before coding, inspect the current architecture, models, authentication middleware, theme and requirements.

Backend requirements:
- Create a lead.
- Retrieve leads using pagination.
- Update a lead.
- Update lead status.
- Search leads.
- Filter leads by status.
- Support company and assigned-user references where appropriate.
- Implement soft deletion.
- Exclude soft-deleted leads from all normal list, search, count and dashboard queries.
- Protect endpoints with authentication and appropriate authorization.
- Validate all input and return consistent errors.

Use an explicit soft-delete field or timestamp, consistent with the database design. Normal queries must exclude deleted records by default. Avoid permanently deleting a lead when the user chooses Delete.

Frontend requirements:
- Leads list page matching the approved purple design.
- Search and status filters.
- Pagination with correct total counts.
- Add/Edit Lead form with field validation.
- Status badges.
- Delete confirmation dialog.
- Loading, empty, success and error states.
- Accessible controls and responsive layout.
- Real API integration through the shared API client.
- Prevent duplicate submissions while a request is pending.

Use the fields supported by the assignment: name, email, phone, status, assigned user and company. Follow the approved model for exact validation and optionality.

Keep business logic out of presentation components where practical. Avoid duplicating validation or API logic.

Add tests for:
- Lead creation and validation.
- Lead updates and status changes.
- Search, filtering and pagination.
- Soft deletion and exclusion from normal queries.
- Authentication and authorization.
- API failures and empty results.
- Frontend form behavior and user feedback.

Run the tests and manually verify the full lead workflow. Update the implementation checklist and create documents/SCREEN_NOTES/leads.md describing components, hooks, API functions, business rules, tests and remaining issues.

Do not move on to the next module until this module passes its tests and code review.

Prompt 6 — Companies module

    Implement the LeadFlow CRM Companies module end to end using the existing architecture, approved purple theme, shared API client and assignment requirements.

Backend:
- Create a company.
- Retrieve the company list.
- Retrieve company details by ID.
- Retrieve associated non-deleted leads.
- Validate input and company IDs.
- Protect endpoints with authentication and appropriate authorization.
- Return consistent response formats and errors.

Frontend:
- Companies list page with company name, industry and location.
- Add Company form or modal.
- Company detail page showing company information and associated leads.
- Loading, empty, error and success states.
- Navigation from a company to its details.
- Responsive layouts consistent with the approved design.

Data requirements:
- Use MongoDB data through real APIs.
- Do not hardcode production-facing table data.
- Handle companies with no associated leads.
- Handle missing or invalid company IDs.
- Follow the approved database schema and validation decisions.
- Do not accidentally include soft-deleted leads in associated-lead lists.

Testing:
- Company creation and validation.
- Company listing and detail retrieval.
- Associated-lead retrieval.
- Empty and invalid states.
- Authorization and API error handling.
- Frontend forms and navigation.

Run the tests and verify the complete workflow. Create documents/SCREEN_NOTES/companies.md documenting components, hooks, services, API endpoints, tests and remaining issues. Update the implementation checklist.

Do not implement unrelated modules in this step.

Prompt 7 — Tasks module and dashboard
Implement the LeadFlow CRM Tasks module and Dashboard using the existing project architecture.

PART A — Tasks

Backend:
- Create tasks linked to leads.
- Assign tasks to users.
- List tasks with relevant lead and assigned-user details.
- Support task status updates.
- Validate task titles, lead references, assignees, due dates and status values according to the approved requirements.
- Enforce authentication and authorization.
- Only the user assigned to a task may update its status. Verify this against the authenticated user on the server.
- Return a forbidden response when another user attempts a task-status update.
- Do not rely on hiding buttons as an authorization mechanism.

Frontend:
- Tasks table with title, lead, due date, status, assignee and actions.
- Create-task form.
- Clear status badges.
- Allow status updates only when permitted.
- Show loading, empty, success, validation and API error states.
- Ensure dates are displayed consistently.

PART B — Dashboard

Implement backend aggregation endpoints for:
- Total leads.
- Qualified leads.
- Tasks due today.
- Completed tasks.

Dashboard figures must be calculated from MongoDB data using backend aggregation or database queries. Do not hardcode figures or calculate them only from the current frontend page.

Define the meaning of each metric consistently in the backend and document it. Exclude soft-deleted leads from lead statistics. Use a consistent timezone/date strategy for tasks due today.

Frontend:
- Summary cards.
- Lead status overview if supported by available API data.
- Upcoming tasks section if supported by the implemented APIs.
- Responsive charts or visualizations only when they communicate real API data.
- Loading, error and empty states.

Testing:
- Task creation and assignment.
- Successful status update by the assigned user.
- Rejected status update by another user.
- Invalid references and validation failures.
- Dashboard aggregation correctness.
- Soft-deleted lead exclusion.
- Date-boundary behavior for tasks due today.

Run the tests and verify the complete workflows. Create documents/SCREEN_NOTES/tasks.md and documents/SCREEN_NOTES/dashboard.md. Update the implementation checklist and record any unresolved decisions.


Prompt 8 — Final QA, documentation and deployment readiness

Perform a complete senior-engineer review of the LeadFlow CRM repository. Do not assume the application is complete just because the pages render.

First inspect the original assignment, all planning documents, frontend and backend code, environment configuration, tests and implementation checklist.

Verify every requirement:

AUTHENTICATION
- Required-field validation.
- Correct password verification.
- JWT verification on private endpoints.
- Safe logout and client-side route protection.
- Useful API error messages.

DASHBOARD
- Real backend aggregation API data.
- Correct totals and date handling.
- Exclusion of soft-deleted leads where relevant.

LEADS
- Create, update, status update, list, search, filtering and pagination.
- Soft-deleted leads excluded from normal queries and counts.

COMPANIES
- Create and list companies.
- Company details and associated leads.
- Empty and invalid states.

TASKS
- Create tasks for leads.
- Assign tasks to users.
- Only the assigned user can update task status.
- Server-side authorization tests prove this rule.

UI AND QUALITY
- Approved indigo/purple theme is used consistently.
- Responsive layout on desktop, tablet and mobile.
- Sidebar persists across authenticated pages.
- Forms, modals, notifications, loading states and empty states behave correctly.
- No broken navigation, nonfunctional controls or accidental placeholder features.
- No obvious console errors, leaking secrets or unnecessary dependencies.
- No unnecessary re-renders or duplicated business logic.

TESTING
- Run all frontend and backend tests.
- Run lint/build checks if configured.
- Fix failures and rerun relevant tests.
- Do not fabricate test results or claim untested features work.
- Identify any gaps that cannot be fixed within the assignment.

DOCUMENTATION
- Complete README.md with prerequisites, installation, environment variables, frontend/backend commands, test commands, API overview, demo setup and deployment instructions.
- Include .env.example files with placeholders only.
- Explain the authorization logic clearly.
- Complete documents/DECISIONS.md with assumptions and implementation choices.
- Add documents/FINAL_REVIEW.md with requirement-by-requirement pass/fail status, test results, known limitations and deployment checklist.

DEPLOYMENT
- Prepare frontend and backend for deployment to appropriate hosting providers.
- Document MongoDB configuration, environment variables, CORS and production start commands.
- Do not claim the application is deployed unless a live deployment has actually been verified.
- Do not expose secrets or commit .env files.

GIT
- Check .gitignore and remove generated files or secrets from the proposed commit.
- Provide recommended commit messages and a final submission checklist.
- Do not push or publish anything without explicit authorization.

Finish with a concise report of completed requirements, failed tests, known limitations and exact next steps. Do not hide failures or make unsupported claims.