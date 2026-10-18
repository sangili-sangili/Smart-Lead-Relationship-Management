# LeadFlow CRM — Database Query Optimization Audit & Strategy

## Executive Summary
This audit analyzes the performance, scalability, memory consumption, and query execution characteristics of the LeadFlow CRM backend (Node.js, Express.js, MongoDB, Mongoose ODM). The goal is to eliminate query bottlenecks, reduce response times, optimize database index coverage, and enforce production-grade security and pagination without altering existing API response contracts.

---

## 1. Identified Bottlenecks & Optimization Priorities

### Priority 1: High — Missing `.lean()` and Heavy Mongoose Hydration
- **Current Issue**: Read-heavy endpoints (`GET /api/leads`, `GET /api/tasks`, `GET /api/notifications`) instantiate full Mongoose Model instances with change tracking, virtuals, getters/setters, and internal state.
- **Impact**: Severe memory allocation overhead and increased Garbage Collection (GC) pauses during high-concurrency requests.
- **Remediation**: Use `.lean()` across all read-only listing and lookup endpoints, reducing memory footprint by up to 60-70% and accelerating JSON serialization.

### Priority 2: High — Unbounded Pagination Limits & Missing Parameter Bounds
- **Current Issue**: List endpoints (`/api/leads`, `/api/companies`, `/api/tasks`, `/api/notifications`) accept user-supplied `limit` without an upper bound. A malicious or erroneous client query like `?limit=50000` could trigger out-of-memory (OOM) crashes.
- **Impact**: Denial of Service (DoS) vulnerability and unbounded memory consumption.
- **Remediation**: Enforce `MAX_PAGE_SIZE = 100` and sanitized integer parsing: `Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(limit, 10) || 10))`.

### Priority 3: High — Unescaped User Regex in Search Filters (ReDoS Vulnerability)
- **Current Issue**: Search queries pass raw strings directly into MongoDB `$regex`: `{ name: { $regex: q, $options: 'i' } }`.
- **Impact**: If `q` contains special characters (e.g. `(`, `[`, `*`, `+`, `?`) or complex backreference patterns, queries either error out or cause catastrophic backtracking (Regular Expression Denial of Service).
- **Remediation**: Implement a centralized `escapeRegex` utility that sanitizes all input strings before building `$regex` operators.

### Priority 4: High — Dashboard Aggregation Redundancy (9 Separate Database Round-Trips)
- **Current Issue**: `getDashboardMetrics` executes 9 independent database operations:
  - `Lead.countDocuments({ isDeleted: false })`
  - `Lead.countDocuments({ isDeleted: false, status: 'Qualified' })`
  - `Lead.aggregate(...)` for status breakdown
  - 3 separate `Task.countDocuments(...)`
- **Impact**: Excessive network round trips between Node.js and MongoDB. The status breakdown already contains both total leads and qualified lead counts.
- **Remediation**: Consolidate lead calculations into a single `$facet` aggregation pipeline and optimize task metrics, eliminating 4 redundant queries per dashboard load.

### Priority 5: Medium — Field Projections (`.select()`)
- **Current Issue**: Collections and populated documents return full schemas including unnecessary internal attributes.
- **Impact**: Increased wire transfer payload between MongoDB and Node.js.
- **Remediation**: Add explicit `.select()` projections to only fetch fields required by the UI/client.

### Priority 6: Medium — Compound Index Gaps & Stable Sorting
- **Current Issue**:
  - Sorting by `{ createdAt: -1 }` without a secondary unique tie-breaker (`_id: -1`) can cause pagination drift where documents with identical timestamps shift between pages.
  - Querying by `{ isDeleted: false, status: '...', createdAt: -1 }` currently triggers an in-memory sort stage in MongoDB because no compound index covers both the filter and sort.
- **Remediation**: Add compound index `{ isDeleted: 1, status: 1, createdAt: -1, _id: -1 }` on `leads` and `{ assignedTo: 1, status: 1, dueDate: 1, _id: -1 }` on `tasks`.

### Priority 7: Low — MongoDB Connection Pool Tuning
- **Current Issue**: Mongoose uses default connection pooling without explicit min/max pool size, idle timeouts, or socket timeouts.
- **Remediation**: Configure `maxPoolSize: 50`, `minPoolSize: 10`, `maxIdleTimeMS: 30000`, and `socketTimeoutMS: 45000` in `db.js`.

---

## 2. Query Index Plan Matrix

| Collection | Existing Indexes | Recommended Optimized Indexes | Rationale / Query Pattern |
| :--- | :--- | :--- | :--- |
| **`leads`** | `{ isDeleted: 1, status: 1 }`<br>`{ isDeleted: 1, company: 1 }`<br>`{ isDeleted: 1, assignedTo: 1 }`<br>`{ createdAt: -1 }` | Add `{ isDeleted: 1, status: 1, createdAt: -1, _id: -1 }`<br>Add `{ isDeleted: 1, assignedTo: 1, createdAt: -1, _id: -1 }`<br>Add `{ company: 1, isDeleted: 1 }` | Covers filtered lead listings sorted by date without in-memory `SORT` step. Optimizes company lead count aggregation. |
| **`tasks`** | `{ assignedTo: 1, status: 1 }`<br>`{ dueDate: 1 }`<br>`{ lead: 1 }`<br>`{ status: 1 }` | Add `{ assignedTo: 1, status: 1, dueDate: 1, _id: -1 }`<br>Add `{ status: 1, dueDate: 1, _id: -1 }` | Covers task filtering by rep/status sorted by due date. Eliminates memory sort. |
| **`companies`** | `{ name: 1 }` (UK)<br>`{ industry: 1 }` | Add `{ industry: 1, createdAt: -1, _id: -1 }` | Supports industry filtering with stable creation date sorting. |
| **`notifications`** | `{ recipient: 1, isRead: 1, createdAt: -1 }` | Preserved (already optimal) | Covers user notification badge counts and feed queries. |

---

## 3. Implementation Phasing

1. **Utilities & Connection Pool**: Implement `escapeRegex` and update connection pool settings in `db.js`.
2. **Schema & Migration Update**: Add new compound indexes to Mongoose models and create migration `006_optimize_indexes.js`.
3. **Controller Refactoring**:
   - `leadController.js`: Apply regex escaping, `.lean()`, `.select()`, stable sorting, and max limit.
   - `companyController.js`: Apply regex escaping, `.lean()`, `.select()`, stable sorting, and max limit.
   - `taskController.js`: Apply regex escaping, `.lean()`, `.select()`, stable sorting, and max limit.
   - `dashboardController.js`: Consolidate into optimized `$facet` aggregation pipelines.
   - `notificationController.js`: Apply `.lean()`, `.select()`, and max limit.
4. **Benchmarking & Validation**:
   - Run `explain("executionStats")` benchmarks on representative queries.
   - Compare documents examined vs returned (`totalDocsExamined` vs `nReturned`).
   - Run existing integration suites to ensure 0 regressions.
5. **Documentation**: Document results in `documents/QUERY_OPTIMIZATION_REPORT.md` and update `README.md`.
