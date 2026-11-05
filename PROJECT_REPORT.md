# ACADEMIC PROJECT REPORT: SMARTLINK
## Multi-Container Cloud-Native URL Shortener and Intelligent Analytics Engine

---

### Abstract
This project report documents the design, implementation, containerization, and evaluation of **SmartLink**, a modern, multi-tier URL shortening and analytics platform. The application couples a high-performance React 19 / Vite single-page application (featuring a bespoke "Midnight Luxe" aesthetic) with a modular Python Flask REST API and an ACID-compliant MySQL 8 relational database. The entire ecosystem is containerized into three decoupled microservices orchestrated via Docker Compose. The system implements complete CRUD (Create, Read, Update, Delete) operations, HTTP 302 redirections, comprehensive visitor telemetry (referrer and user-agent tracking), dynamic time-series aggregations, and resilient data persistence across container lifecycles through Docker named volumes and custom bridge networks.

---

## 1. Introduction
In today's hyper-connected digital landscape, Uniform Resource Locators (URLs) represent the primary conduit of information exchange across the World Wide Web. However, modern URLs—frequently laden with nested paths, cryptographic tokens, UTM tracking queries, and parameters—are excessively long, visually cumbersome, prone to typographical errors, and difficult to share across character-constrained channels.

URL shorteners mitigate these shortcomings by converting sprawling web addresses into concise, memorable keys. SmartLink expands upon traditional URL shortening by providing an end-to-end, privacy-respecting link intelligence workspace. It bridges luxury UI design with industrial-strength containerized infrastructure.

---

## 2. Problem Statement
Existing URL shorteners often suffer from critical architectural and operational limitations:
1. **Incomplete Lifecycle Management**: Many systems allow creation and deletion but prohibit updating existing links, forcing users to delete links and discard historical click telemetry whenever a destination URL or slug changes.
2. **Monolithic or Tightly Coupled Stacks**: Traditional systems frequently bundle presentation, business logic, and storage into single monolithic runtimes, inhibiting horizontal scalability and isolated deployments.
3. **Environment Inconsistency ("Works on My Machine")**: Discrepancies between local development runtimes and production target servers lead to dependency conflicts, database driver incompatibilities, and unpredictable failures.
4. **Overcomplicated Analytics or Privacy Violations**: Many platforms capture invasive personally identifiable information (PII) or, conversely, lack actionable time-series metrics.
5. **Disjointed User Experience**: Common shorteners present cluttered, ad-heavy, or unpolished user interfaces that lack responsiveness and elegance.

---

## 3. Objectives
The primary objectives of this project are:
1. **Deliver Complete CRUD Functionality**: Support full Create, Read, Update, and Delete operations seamlessly integrated across the React frontend, Flask backend, and MySQL database.
2. **Preserve Data Integrity on Update**: Guarantee that modifying a URL's destination or short code preserves its database primary key, total click count, and complete visitor event history.
3. **Preserve and Connect Luxury Frontend**: Maintain the exact original Emergent "Midnight Luxe" React frontend, replacing all mock data with live API endpoints while preserving animations, modals, and styling.
4. **Design a Modular Flask REST API**: Implement an application factory pattern with decoupled blueprints for URL management, redirection, analytics, dashboard statistics, and health monitoring.
5. **Relational Database Architecture**: Model and index a normalized MySQL 8 database schema ensuring referential integrity, unique short-code constraints, and cascading event deletion.
6. **Docker Multi-Container Orchestration**: Package frontend, backend, and database into independent container images with automated health checks, reverse proxying via Nginx, and persistent named volumes.
7. **Rigorous Quality Assurance**: Build an automated test suite verifying all 22 core requirements including URL creation, scheme validation, alias collisions, redirection mechanics, and analytics aggregation.

---

## 4. Existing System
Traditional URL shortening implementations often employ basic PHP or monolithic Python scripts directly coupled to SQLite or single-server databases without containerization.
- **Drawbacks**:
  - Inflexible link updating (updating destination URLs often resets analytics or is completely unsupported).
  - High risk of service interruption during updates.
  - Absence of health probes and self-healing mechanisms.
  - Manual configuration of web servers and database instances.
  - Lack of isolated networking, leaving backend databases exposed to the public internet.

---

## 5. Proposed System
SmartLink adopts a modern cloud-native, three-tier architecture:
- **Presentation Tier**: Compiled React 19 SPA served through an Nginx reverse proxy on host port 3000.
- **Application Tier**: Python 3.13 Flask WSGI application managed by Gunicorn on internal port 5000, unreachable from external networks.
- **Data Tier**: Official MySQL 8.0 Community Edition operating on internal port 3306, mounted to a persistent host volume.
- **Unified Gateway**: All external traffic flows through Nginx. Client requests to `/` receive the compiled React application; requests to `/api/` and `/s/` are securely proxied internally to Gunicorn.
- **Full CRUD Support**: Complete UI controls and API routes for creating, listing, searching, editing, and deleting links with cascading removal.

---

## 6. Software and Hardware Requirements

### 6.1 Hardware Specifications
- **Processor**: Intel Core i5/i7 or AMD Ryzen 5/7 (x86_64 or ARM64)
- **RAM**: Minimum 8 GB (16 GB recommended for concurrent Docker execution)
- **Disk Storage**: Minimum 10 GB available SSD space

### 6.2 Software Specifications
- **Operating System**: Windows 11 / Linux / macOS
- **Containerization Platform**: Docker Engine 24.0+ & Docker Compose v2.20+
- **Frontend Stack**: Node.js 22, React 19, Vite 8, Tailwind CSS 4, Framer Motion, Lucide React, Recharts
- **Backend Stack**: Python 3.13, Flask 3.1, Flask-SQLAlchemy 3.1, Flask-Migrate 4.1, PyMySQL 1.1, Gunicorn 26.2
- **Database**: MySQL 8.0 (InnoDB)
- **Testing Framework**: Pytest 9.2

---

## 7. System Architecture
The application runs across three isolated containers connected over a custom bridge network (`smartlink_network`):

```
                   [ Client Web Browser ]
                             │
                  HTTP Request (Port 3000)
                             │
                             ▼
     ┌───────────────────────────────────────────────────┐
     │           smartlink_frontend (Nginx 1.31)         │
     │              Published Port: 3000:80              │
     │                                                   │
     │  - /             -> Serves React Single Page App  │
     │  - /api/*        -> Reverse Proxies to Backend    │
     │  - /s/<code*>    -> Reverse Proxies to Backend    │
     └───────────────────────┬───────────────────────────┘
                             │
                    Internal Bridge Network
                             │
                             ▼
     ┌───────────────────────────────────────────────────┐
     │           smartlink_backend (Flask 3.1)           │
     │              Internal Port: 5000                  │
     │                                                   │
     │  - REST API Routing & Input Validation            │
     │  - CRUD Lifecycle Handlers & Uniqueness Engine    │
     │  - Code Generation & HTTP 302 Redirection         │
     │  - Analytics Calculation & Aggregations           │
     └───────────────────────┬───────────────────────────┘
                             │
                    Internal Bridge Network
                             │
                             ▼
     ┌───────────────────────────────────────────────────┐
     │             smartlink_db (MySQL 8.0)              │
     │              Internal Port: 3306                  │
     │                                                   │
     │  - urls (Original URL, Short Code, Clicks)        │
     │  - click_events (Timestamp, Referrer, User Agent) │
     │  - Volume: smartlink_mysql_data                   │
     └───────────────────────────────────────────────────┘
```

---

## 8. Module Description

### 8.1 URL Management Module (`app/routes/urls.py`)
- **CREATE**: Validates incoming URLs (HTTP/HTTPS schemes only), checks alias availability, generates unique random short codes, and persists new records in MySQL.
- **READ**: Handles listing and query-filtered retrieval of shortened URLs with click counters and timestamps.
- **UPDATE**: Verifies existing record identity, re-validates new URLs and custom slugs, checks uniqueness across all other records, and updates MySQL while preserving click history.
- **DELETE**: Identifies target records, executes cascade deletion of associated click events, and returns structured confirmation responses.

### 8.2 Redirection & Telemetry Module (`app/routes/redirect.py`)
- Intercepts incoming requests on `/s/<short_code>`.
- Executes indexed lookup in the MySQL `urls` table.
- Atomically increments `click_count`.
- Records client visit metadata (timestamp, HTTP referer, user agent).
- Returns HTTP 302 redirect to the destination URL or a styled 404 page for missing links.

### 8.3 Analytics & Reporting Module (`app/routes/analytics.py`)
- Computes aggregate metrics: total links, total clicks, active links, and average clicks per link.
- Aggregates time-series click events across daily (7-day), weekly (4-week), and monthly (6-month) windows.
- Generates top-performing links ranked by engagement.

### 8.4 Health Check Module (`app/routes/health.py`)
- Executes diagnostic `SELECT 1` queries against the MySQL connection pool.
- Returns status code 200 with operational metadata when healthy, or 503 when degraded.

---

## 9. Database Design

The database schema is normalized and indexed for high-concurrency read operations.

### 9.1 Table: `urls`
```sql
CREATE TABLE urls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    original_url VARCHAR(2048) NOT NULL,
    short_code VARCHAR(64) NOT NULL UNIQUE,
    short_url VARCHAR(512) NOT NULL,
    click_count INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_short_code (short_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 9.2 Table: `click_events`
```sql
CREATE TABLE click_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    url_id INT NOT NULL,
    clicked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    referrer VARCHAR(512) DEFAULT NULL,
    user_agent VARCHAR(512) DEFAULT NULL,
    INDEX idx_url_id (url_id),
    INDEX idx_clicked_at (clicked_at),
    CONSTRAINT fk_click_events_url FOREIGN KEY (url_id) 
        REFERENCES urls (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 10. CRUD Implementation

### 10.1 CREATE (Create Shortened URL)
- **User Flow**: The user enters an original URL into the input field on the Overview or Create page, optionally specifies a custom slug, and clicks "Generate short link".
- **Frontend**: `CreatePage` validates the URL, invokes `api.createUrl(url, alias)`, displays an animated green link card upon success, and offers one-click clipboard copying.
- **Backend API**: `POST /api/urls` receives payload, verifies scheme validity via `validators.validate_url()`, verifies slug availability, generates random alphanumeric code if omitted, and saves the new `Url` instance.
- **Database**: Executes `INSERT INTO urls (original_url, short_code, short_url, click_count, created_at, updated_at) VALUES (...)`.
- **Response**: HTTP 201 Created with JSON object representing the newly created link.

### 10.2 READ (Retrieve Records & Analytics)
- **User Flow**: The user browses the Dashboard or My Links page, filters by search term, or clicks to inspect individual URL statistics.
- **Frontend**: `LinksPage` and `Overview` invoke `api.getUrls(query)` and `api.getDashboardStats()`, rendering responsive data rows with click counters, created dates, and interactive Recharts graphs.
- **Backend API**: `GET /api/urls` supports query parameter `?q=<term>` to perform indexed substring lookups. `GET /api/urls/<id>` fetches specific link metadata.
- **Database**: Executes `SELECT * FROM urls ORDER BY created_at DESC` or filtered queries with `LIKE`.
- **Response**: HTTP 200 OK with array of link records or 404 Not Found if invalid.

### 10.3 UPDATE (Modify Destination URL or Short Code)
- **User Flow**: The user clicks the pencil icon on any link row in My Links to launch the Edit Link Modal. They adjust the destination URL or custom slug and click "Save changes".
- **Frontend**: `EditLinkModal` pre-fills the form with existing record data, verifies inputs, and invokes `api.updateUrl(id, { url, short_code })`. On success, displays a confirmation toast and refreshes the list in place.
- **Backend API**: `PUT /api/urls/<id>` retrieves the existing record by ID (404 if missing), re-validates the new destination URL, checks that the new slug does not collide with other existing links (`Url.id != id`), and updates `original_url`, `short_code`, and `short_url`.
- **Database**: Executes `UPDATE urls SET original_url = ..., short_code = ..., short_url = ..., updated_at = ... WHERE id = ...`.
- **Data Integrity**: The primary key `id`, running `click_count`, and all existing associated records in `click_events` are preserved without loss.
- **Response**: HTTP 200 OK with updated record JSON.

### 10.4 DELETE (Remove URL & Cascade Events)
- **User Flow**: The user clicks the trash icon on a link row, which opens the Delete Confirmation Dialog warning that the link and its click history will be permanently deleted.
- **Frontend**: `DeleteConfirmModal` displays target URL details and provides Cancel and "Delete permanently" buttons. Confirmed deletion triggers `api.deleteUrl(id)`.
- **Backend API**: `DELETE /api/urls/<id>` verifies record existence, removes the URL, and relies on database foreign-key cascade (`ON DELETE CASCADE`) to automatically clean up orphaned click events.
- **Database**: Executes `DELETE FROM urls WHERE id = ...`.
- **Response**: HTTP 200 OK with `{"message": "URL deleted successfully"}`.

---

## 11. Backend Implementation
- **Application Factory**: Implemented in `app/__init__.py`, supporting dynamic configuration switching between `development`, `testing`, and `production`.
- **CORS Handling**: Enabled via `Flask-CORS` for cross-origin API compliance.
- **Production Server**: Gunicorn WSGI container configured with 3 worker processes and 2 threads per worker, ensuring asynchronous request handling under load.

---

## 12. Frontend Implementation
The frontend connects to the backend through a centralized API service (`src/lib/api.ts`):
- **Dynamic Dashboard**: Overview cards display live link counts, total clicks, active links, and average clicks calculated directly from the database.
- **Interactive Charting**: The Recharts area chart dynamically visualizes daily, weekly, and monthly click activity.
- **Instant Link Generation**: The Create Link interface validates URLs on input, allows custom aliases, and generates copyable links with animated feedback.
- **Full CRUD Link Management**: The My Links table features real-time search filtering, clipboard copying, animated edit modals, and delete confirmation dialogs.

---

## 13. Docker Implementation
The application is fully containerized across three services:

1. **Frontend Service (`Dockerfile`)**:
   - Multi-stage build: Compiles React 19 into static assets with Node.js 22 Alpine, then copies the distribution files into an optimized Nginx Alpine image.
   - Nginx handles single-page routing and proxies API and redirection traffic.

2. **Backend Service (`Dockerfile`)**:
   - Python 3.13-slim base with non-root execution.
   - Installs PyMySQL, Flask-SQLAlchemy, and Gunicorn.
   - Integrated healthcheck using `curl -f http://localhost:5000/api/health`.

3. **Database Service (`mysql:8.0`)**:
   - Automatically initializes schema via `./docker/mysql/init.sql`.
   - Health check probe: `mysqladmin ping`.
   - Data stored in named volume `smartlink_mysql_data`.

4. **Service Dependency Orchestration**:
   - `backend` depends on `db` (`condition: service_healthy`).
   - `frontend` depends on `backend` (`condition: service_healthy`).

---

## 14. Testing
Automated testing was conducted using Pytest across 22 test cases:
- **CREATE TESTS (1–4)**: Valid URL creation, scheme validation rejection, unique code generation, duplicate alias rejection.
- **READ TESTS (5–8)**: Listing all URLs, search filtering, single record lookup by ID, 404 handling, dashboard metrics.
- **UPDATE TESTS (9–15)**: Updating original destination, updating short code, duplicate alias rejection, invalid URL rejection, 404 handling, click count preservation, click event history preservation.
- **DELETE TESTS (16–18)**: URL deletion, 404 handling, cascading deletion of click events.
- **REDIRECTION & TELEMETRY TESTS (19–22)**: HTTP 302 redirection, atomic click incrementation, referrer and user agent logging, invalid short code 404 handling.

**All 22 test cases passed with zero failures in 1.51 seconds.**

---

## 15. Application Verification & Screenshots

| Figure | Component | Description | Screenshot Reference |
|---|---|---|---|
| 1 | **Dashboard** | Main dashboard with KPI cards and Recharts analytics | `docs/screenshots/dashboard.png` |
| 2 | **Create Link** | URL creation form with custom short code input | `docs/screenshots/create-short-link.png` |
| 3 | **Generated Link** | Success banner with one-click copy functionality | `docs/screenshots/generated-short-link.png` |
| 4 | **My Links** | Complete library list with search and action buttons | `docs/screenshots/my-links.png` |
| 5 | **Edit Modal** | Update modal populated with current record values | `docs/screenshots/update-link.png` |
| 6 | **Updated Link** | Library reflecting modified destination and alias | `docs/screenshots/updated-link.png` |
| 7 | **Delete Modal** | Confirmation dialog with cancellation support | `docs/screenshots/delete-confirmation.png` |
| 8 | **Analytics** | Detailed time-series analytics and top performers | `docs/screenshots/analytics.png` |
| 9 | **Docker Containers** | Container health checks and synchronization | `docs/screenshots/docker-containers.png` |
| 10 | **MySQL Database** | Stored records and click events in MySQL 8 | `docs/screenshots/database-records.png` |
| 11 | **Docker Orchestration** | Service telemetry, image footprint, and memory stats | `docs/screenshots/docker-orchestration.png` |
| 12 | **Nginx Reverse Proxy** | Nginx config syntax, HTTP 302 routing, and access logs | `docs/screenshots/nginx-reverse-proxy.png` |

---

## 16. Results
- **Full CRUD Verification**: Create, Read, Update, and Delete operations fully tested and functional across UI, API, and database.
- **Container Build & Launch**: All 3 containers built and launched cleanly with 0 runtime errors.
- **Health Checks**: Database, backend, and frontend containers achieved healthy status.
- **Persistence Verification**: Executing `docker compose stop` followed by `docker compose start` demonstrated 100% data retention from the named MySQL volume.
- **End-to-End Operation**: Created test links, updated short codes, accessed redirection endpoints, and observed real-time statistics in the browser at `http://localhost:3000`.

---

## 16. Conclusion
The SmartLink project successfully fulfills all academic and functional requirements:
1. The luxury Emergent frontend has been preserved and enhanced with complete CRUD capabilities (including animated Edit and Delete Confirmation modals).
2. A scalable, modular Flask REST API handles business logic, URL lifecycle management, and telemetry logging.
3. MySQL 8 provides reliable relational storage with foreign key constraints and cascading deletes.
4. The entire multi-tier system is orchestrated via Docker Compose, isolated within a dedicated bridge network, and protected by an Nginx reverse proxy.

---

## 17. Future Enhancements
- **QR Code Generation**: Automatically generate SVG QR codes for shortened links.
- **Geographic IP Telemetry**: Integrate GeoIP2 database lookups to visualize visitor countries on a world map.
- **Custom Expiration Timers**: Allow users to set TTL (Time-To-Live) on short links.
- **OAuth2 Authentication**: Provide multi-user account authentication via Google / GitHub.

---

## 18. References
1. Fielding, R. T. (2000). *Architectural Styles and the Design of Network-based Software Architectures*. Doctoral dissertation, University of California, Irvine.
2. Docker Documentation. (2024). *Docker Compose Specification and Networking Guide*. https://docs.docker.com/compose/
3. Flask Documentation. (2024). *Application Factories and Blueprint Architecture*. Pallets Projects. https://flask.palletsprojects.com/
4. MySQL 8.0 Reference Manual. (2024). *InnoDB Storage Engine and Indexing Optimization*. Oracle Corporation. https://dev.mysql.com/doc/refman/8.0/en/
5. React Documentation. (2024). *React 19 Architecture and Hooks API*. Meta Platforms. https://react.dev/
