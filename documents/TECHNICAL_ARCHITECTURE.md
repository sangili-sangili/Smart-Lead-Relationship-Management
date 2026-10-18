# LeadFlow CRM — Technical Architecture Blueprint

## 1. Architecture Overview
**LeadFlow CRM** is architected as a clean, decoupled monorepo containing two core applications:
1. **Frontend Client (`client/`)**: Single-page application built with React, React Router, Vite, Material UI (MUI), and an Axios HTTP client.
2. **Backend Server (`server/`)**: Modular REST API built with Node.js, Express.js, and MongoDB with Mongoose ODM.

```
+----------------------------------------------------------------------------------------------------+
|                                    CLIENT (React SPA / Vite)                                       |
|  +--------------------+  +--------------------+  +----------------------+  +--------------------+  |
|  |     Auth Page      |  |  Persistent Shell  |  |   MUI Design System  |  |   Axios Interceptor|  |
|  |   (Login / Form)   |  | (Sidebar, Top Bar) |  |   (Indigo Palette)   |  |   (JWT Auto-Attach)|  |
|  +--------------------+  +--------------------+  +----------------------+  +--------------------+  |
+-------------------------------------------------+--------------------------------------------------+
                                                  | HTTPS / REST (JSON)
                                                  v
+----------------------------------------------------------------------------------------------------+
|                                    SERVER (Express REST API)                                       |
|  +-----------------------------------------------------------------------------------------------+ |
|  |                                Express Routing & Global Middlewares                           | |
|  |             (CORS, Helmet, RateLimiter, Morgan Logger, JSON BodyParser)                        | |
|  +----------------------------------------------+------------------------------------------------+ |
|                                                 |                                                  |
|         +---------------------------------------+---------------------------------------+          |
|         v                                                                               v          |
|  +------------------------------+                                     +--------------------------+ |
|  |   Authentication Layer       |                                     |  Authorization Layer     | |
|  |   - verifyToken (JWT)        |                                     |  - checkTaskAssignee     | |
|  |   - bcrypt comparison        |                                     |  - ownership validation  | |
|  +--------------+---------------+                                     +-------------+------------+ |
|                 |                                                                   |              |
|                 +-------------------------------+-----------------------------------+              |
|                                                 v                                                  |
|                                    +--------------------------+                                    |
|                                    |    Controllers Layer     |                                    |
|                                    | (Req validation, HTTP)   |                                    |
|                                    +------------+-------------+                                    |
|                                                 v                                                  |
|                                    +--------------------------+                                    |
|                                    |      Services Layer      |                                    |
|                                    | (Business logic, queries)|                                    |
|                                    +------------+-------------+                                    |
|                                                 v                                                  |
|                                    +--------------------------+                                    |
|                                    |   Data Layer (Mongoose)  |                                    |
|                                    | (Schema, Indexes, Hooks) |                                    |
|                                    +------------+-------------+                                    |
+-------------------------------------------------+--------------------------------------------------+
                                                  |
                                                  v
                                      +------------------------+
                                      |    MongoDB Database    |
                                      | (Users, Leads,         |
                                      |  Companies, Tasks)     |
                                      +------------------------+
```

---

## 2. Directory Structure

```
Smart-Lead-Relationship-Management/
├── client/
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── app/                      # App root providers (Theme, AuthProvider, Router)
│   │   ├── assets/                   # Static branding, illustration graphics, icons
│   │   ├── components/               # Reusable UI primitives (Buttons, Badges, Modals, Tables)
│   │   ├── layouts/                  # AppLayout (Persistent Sidebar, Header, Page Container)
│   │   ├── pages/                    # Route views (Login, Dashboard, Leads, Companies, Tasks)
│   │   ├── features/                 # Domain-specific feature modules
│   │   │   ├── auth/                 # LoginForm, auth state logic
│   │   │   ├── leads/                # LeadTable, LeadModal, LeadFilter
│   │   │   ├── companies/            # CompanyTable, CompanyDetail, CompanyModal
│   │   │   ├── tasks/                # TaskTable, TaskModal, StatusDropdown
│   │   │   └── dashboard/            # StatCard, LeadsDonutChart, UpcomingTasksWidget
│   │   ├── hooks/                    # Custom React hooks (useAuth, usePagination, useToast)
│   │   ├── services/                 # Axios API instances & endpoint functions
│   │   │   ├── api.js                # Base axios instance with interceptors
│   │   │   ├── authService.js
│   │   │   ├── leadService.js
│   │   │   ├── companyService.js
│   │   │   ├── taskService.js
│   │   │   └── dashboardService.js
│   │   ├── utils/                    # Formatters (dates, currency, phone numbers)
│   │   ├── constants/                # Enums, navigation routes, status colors
│   │   ├── routes/                   # React Router route tree with PrivateRoute wrapper
│   │   ├── theme/                    # MUI theme configuration, palette tokens, typography
│   │   └── tests/                    # Frontend component & integration tests
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   ├── config/                   # Database (db.js), environment validator (env.js)
│   │   ├── controllers/              # Request handling & HTTP response mapping
│   │   │   ├── authController.js
│   │   │   ├── leadController.js
│   │   │   ├── companyController.js
│   │   │   ├── taskController.js
│   │   │   └── dashboardController.js
│   │   ├── services/                 # Business logic and database operations
│   │   │   ├── authService.js
│   │   │   ├── leadService.js
│   │   │   ├── companyService.js
│   │   │   ├── taskService.js
│   │   │   └── dashboardService.js
│   │   ├── models/                   # Mongoose schemas & indexes
│   │   │   ├── User.js
│   │   │   ├── Lead.js
│   │   │   ├── Company.js
│   │   │   └── Task.js
│   │   ├── routes/                   # Express router definitions
│   │   │   ├── authRoutes.js
│   │   │   ├── leadRoutes.js
│   │   │   ├── companyRoutes.js
│   │   │   ├── taskRoutes.js
│   │   │   └── dashboardRoutes.js
│   │   ├── middleware/               # Auth, Authorization, Error Handling, Logging
│   │   │   ├── authMiddleware.js     # JWT extraction & verification
│   │   │   ├── authorizeTask.js      # Enforce assignee-only status updates
│   │   │   ├── errorMiddleware.js    # Global centralized error handler
│   │   │   └── validateRequest.js    # Schema validation runner
│   │   ├── validators/               # Input validation schemas (Joi/Zod/custom)
│   │   ├── utils/                    # APIResponse wrapper, AppError class, logger
│   │   ├── constants/                # System enums, error codes, HTTP statuses
│   │   ├── scripts/                  # Database seed script for initial testing/demo
│   │   └── tests/                    # Unit and integration tests (Jest + Supertest)
│   ├── .env.example
│   ├── app.js                        # Express application instance setup
│   ├── server.js                     # HTTP server startup & MongoDB connection listener
│   └── package.json
│
├── documents/                        # System documentation & architectural blueprints
├── .gitignore
└── README.md
```

---

## 3. Frontend Architecture

### 3.1 Component & UI Hierarchy
- **`App`**: Main entrypoint wrapped with `ThemeProvider`, `CssBaseline`, `SnackbarProvider`, and `AuthProvider`.
- **`AppLayout`**: Persistent container structure:
  - **Sidebar / Navigation Drawer**: Fixed left drawer (260px desktop, collapsible on mobile) showing Brand Logo, nav links (Dashboard, Leads, Companies, Tasks), and bottom current user card with logout button.
  - **Top Navigation Bar**: Search bar, notification icon, profile avatar, mobile menu trigger.
  - **Content Canvas**: Fluid main container hosting route children with lazy loading.
- **`Design System & Theme`**:
  - Implements the approved Indigo/Purple design tokens:
    - Primary: `#6366F1`, Primary Hover: `#4F46E5`
    - Deep Navy: `#1E293B`
    - Light Lavender Background: `#F7F8FF`
    - Surface: `#FFFFFF`
    - Text: `#172554` / `#1E293B`
    - Border: `#E2E8F0`
  - Overrides MUI components: `MuiButton` (rounded-lg, uppercase: false), `MuiPaper` (border, subtle box shadow), `MuiChip` (custom status badges), `MuiTableCell` (clean borders, Inter font).

### 3.2 State Management & Network Strategy
- **Authentication State**: Global React Context (`AuthContext`) managing current user, token storage in `localStorage`, and login/logout handlers.
- **HTTP / Data Fetching**: Standardized Axios client (`services/api.js`):
  - Request Interceptor: Automatically attaches `Authorization: Bearer <token>` from local storage.
  - Response Interceptor: Unwraps standard success envelope; catches `401 Unauthorized` to trigger session expiry cleanup.
- **Form State**: Lightweight controlled components with custom validation hooks or `react-hook-form` to ensure zero-lag typing and immediate feedback.

---

## 4. Backend Architecture

### 4.1 Request Lifecycle Flow
```
Client Request
      │
      ▼
Helmet, CORS & BodyParser Middlewares
      │
      ▼
Express Router (e.g. /api/tasks)
      │
      ▼
authMiddleware (Verifies JWT, attaches req.user)
      │
      ▼
validateRequest (Validates request schema)
      │
      ▼
authorizeTask (For task status updates: checks req.user._id === task.assignedTo)
      │
      ▼
Controller (Extracts params, invokes Service)
      │
      ▼
Service (Executes business logic & Mongoose queries)
      │
      ▼
ApiResponse (Returns formatted JSON envelope)
      │ (If error thrown)
      ▼
errorMiddleware (Maps error to uniform status code & message)
```

### 4.2 Standard API Response Envelope
- **Success (`200 OK`, `201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Lead created successfully",
    "data": {
      "id": "6710fa53a8192b0012e8b91a",
      "name": "Ravi Kumar",
      "email": "ravi@mail.com",
      "status": "New"
    }
  }
  ```
- **Paginated Success**:
  ```json
  {
    "success": true,
    "message": "Leads fetched successfully",
    "data": {
      "items": [ ... ],
      "pagination": {
        "total": 34,
        "page": 1,
        "limit": 10,
        "pages": 4
      }
    }
  }
  ```
- **Error Response (`400`, `401`, `403`, `404`, `500`)**:
  ```json
  {
    "success": false,
    "error": {
      "code": "FORBIDDEN",
      "message": "Only the assigned user can update this task status"
    }
  }
  ```

---

## 5. REST API Endpoint Specifications

### 5.1 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public / Admin | Create user account with hashed password. |
| `POST` | `/api/auth/login` | Public | Validate credentials, return JWT and user profile. |
| `GET` | `/api/auth/me` | Private | Return current authenticated user profile. |

### 5.2 Dashboard (`/api/dashboard`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | Private | Aggregated metrics (Total Leads, Qualified Leads, Tasks Due Today, Completed Tasks, Status counts). |

### 5.3 Leads (`/api/leads`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/leads` | Private | Paginated leads with search (`?search=`), status filter (`?status=`), assigned filter (`?assignedTo=`), page and limit. Excludes `isDeleted: true`. |
| `POST` | `/api/leads` | Private | Create lead. Validates name, email, company, status. |
| `GET` | `/api/leads/:id` | Private | Get single active lead by ID. |
| `PUT` | `/api/leads/:id` | Private | Update lead details. |
| `PATCH` | `/api/leads/:id/status`| Private | Update lead status only. |
| `DELETE`| `/api/leads/:id` | Private | Soft delete lead (`isDeleted: true`, `deletedAt: Date.now()`). |

### 5.4 Companies (`/api/companies`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/companies` | Private | List all companies with pagination and search. |
| `POST` | `/api/companies` | Private | Create new company (name, industry, location, website). |
| `GET` | `/api/companies/:id` | Private | Get company details. |
| `GET` | `/api/companies/:id/leads` | Private | Get active, non-deleted leads associated with this company. |

### 5.5 Tasks (`/api/tasks`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tasks` | Private | List all tasks with populated lead and assignee details. |
| `POST` | `/api/tasks` | Private | Create task for a lead and assign to a user. |
| `GET` | `/api/tasks/:id` | Private | Get task details. |
| `PATCH` | `/api/tasks/:id/status`| Private | **Assignee-only**: Update task status (`Pending`, `In Progress`, `Completed`). Returns 403 if `req.user._id` != `task.assignedTo`. |
| `DELETE`| `/api/tasks/:id` | Private | Delete task. |

---

## 6. Security & Infrastructure Boundaries
1. **No Sensitive Leaks**: User passwords (`password` hash field) must be marked `{ select: false }` on the Mongoose schema to prevent accidental return in queries.
2. **CORS Whitelisting**: Strict origin check matching `CLIENT_URL` env variable.
3. **Environment Isolation**:
   - `PORT`: Server listening port (default 5000).
   - `MONGO_URI`: MongoDB connection string.
   - `JWT_SECRET`: High-entropy secret key.
   - `JWT_EXPIRES_IN`: Token TTL (default `24h`).
   - `CLIENT_URL`: Client frontend URL for CORS.

---

## 7. Actual Implemented Dependencies & Justifications

### 7.1 Backend Dependencies (`server/package.json`)
| Dependency | Version | Type | Justification / Architectural Role |
| :--- | :---: | :---: | :--- |
| **`express`** | `^4.21.2` | Production | Core HTTP web framework for routing, middlewares, and request processing. |
| **`mongoose`** | `^8.8.4` | Production | MongoDB ODM providing structured schemas, validation, indexes, and aggregation query builders. |
| **`dotenv`** | `^16.4.7` | Production | Loads environment variables from `.env` into `process.env`. |
| **`cors`** | `^2.8.5` | Production | Configures Cross-Origin Resource Sharing with the React SPA client. |
| **`helmet`** | `^8.0.0` | Production | Enhances security by setting HTTP headers to prevent XSS and clickjacking. |
| **`bcryptjs`** | `^2.4.3` | Production | Secure cryptographic hashing and salt generation for user passwords. |
| **`jsonwebtoken`** | `^9.0.2` | Production | Generates and verifies HMAC-SHA256 JWT access tokens for stateless authentication. |
| **`morgan`** | `^1.10.0` | Production | HTTP request logging for development monitoring and debugging. |
| **`nodemon`** | `^3.1.9` | Dev | Auto-restarts server process upon file modifications during development. |
| **`jest`** | `^29.7.0` | Dev | Automated test framework for unit and integration testing. |
| **`supertest`** | `^7.0.0` | Dev | High-level HTTP testing abstraction for validating Express endpoints. |

### 7.2 Frontend Dependencies (`client/package.json`)
| Dependency | Version | Type | Justification / Architectural Role |
| :--- | :---: | :---: | :--- |
| **`react`** | `^18.3.1` | Production | Core UI rendering library for building declarative, component-based interfaces. |
| **`react-dom`** | `^18.3.1` | Production | DOM renderer for React. |
| **`react-router-dom`** | `^6.28.0` | Production | Declarative client-side routing, route guard wrappers (`PrivateRoute`), and layout nesting. |
| **`@mui/material`** | `^6.1.10` | Production | Comprehensive component design system adhering to the approved Indigo/Purple theme. |
| **`@emotion/react`** | `^11.13.5` | Production | CSS-in-JS style engine required by Material UI. |
| **`@emotion/styled`** | `^11.13.5` | Production | Styled component API required by Material UI. |
| **`@mui/icons-material`** | `^6.1.10` | Production | Standard icon library for CRM navigation, actions, search, and badges. |
| **`axios`** | `^1.7.9` | Production | Promise-based HTTP client with request and response interceptors for JWT injection and uniform error handling. |
| **`vite`** | `^6.0.3` | Dev | Next-generation fast frontend bundler and local development server. |
| **`@vitejs/plugin-react`** | `^4.3.4` | Dev | Fast refresh and JSX compilation plugin for Vite. |

