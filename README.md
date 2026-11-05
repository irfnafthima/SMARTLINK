# SmartLink – Intelligent URL Shortener & Analytics Platform

[![Docker](https://img.shields.io/badge/Docker-3%20Containers%20(Healthy)-blue.svg)](https://www.docker.com/)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite%208-blueviolet.svg)](https://react.dev/)
[![Flask](https://img.shields.io/badge/Backend-Flask%203.1%20%7C%20SQLAlchemy-green.svg)](https://flask.palletsprojects.com/)
[![MySQL](https://img.shields.io/badge/Database-MySQL%208.0-orange.svg)](https://www.mysql.com/)
[![Tests](https://img.shields.io/badge/Tests-22%2F22%20Passed-brightgreen.svg)](backend/tests/)

SmartLink is an enterprise-grade, containerized URL management platform featuring complete CRUD workflows, real-time click tracking, intelligent telemetry analytics, custom alias generation, and a luxury aesthetic ("Midnight Luxe" palette with rich gold accents and dark slate backgrounds).

---

## 1. Project Title
**SmartLink: Complete Multi-Container Cloud-Native URL Shortener and Intelligent Analytics Engine**

---

## 2. Introduction
In modern digital communications, URLs form the universal backbone of information exchange across the internet. However, raw URLs frequently contain lengthy paths, query strings, and tracking tokens that make them unreadable and difficult to share. **SmartLink** solves this challenge by transforming long, unwieldy links into concise, memorable keys, while providing high-resolution analytics and complete lifecycle management (Create, Read, Update, Delete) across an isolated three-tier Docker architecture.

---

## 3. Project Overview
SmartLink couples a high-performance single-page application built on React 19 and Vite with a modular Python Flask REST API running on Gunicorn, backed by a persistent MySQL 8 relational database. Nginx functions as the unified reverse proxy, serving the compiled frontend and intelligently forwarding `/api/` endpoints and `/s/` short link redirections.

---

## 4. Problem Statement
1. **Unwieldy Web Links**: Raw URLs are visually cluttered and prone to transcription errors.
2. **Lack of Lifecycle Flexibility (Incomplete CRUD)**: Many shorteners do not allow updating destination URLs or aliases once created, forcing users to delete links and lose existing click analytics.
3. **Monolithic or Inconsistent Environments**: Manual server setups suffer from "works on my machine" defects, lack process isolation, and leave databases exposed to the public internet.
4. **Unreliable Analytics or Privacy Violations**: Conventional systems either lack historical time-series analytics or collect invasive personally identifiable information.

---

## 5. Objectives
1. **Complete CRUD Operations**: Deliver fully functional Create, Read, Update, and Delete workflows across the React UI, Flask backend, and MySQL database.
2. **Data Integrity & History Preservation**: Ensure that updating a short URL preserves its unique ID, total click count, and full click event history.
3. **Decoupled 3-Tier Docker Orchestration**: Deploy independent containers for the frontend (Nginx), backend (Flask/Gunicorn), and database (MySQL 8) orchestrated by Docker Compose.
4. **Unified Gateway Architecture**: Route all client traffic through a single entrypoint on host port 3000, isolating internal backend and database ports.
5. **Rigorous Automated Quality Assurance**: Validate all application behaviors with a comprehensive 22-test automated suite.

---

## 6. Features
- **Instant URL Shortening**: Generates cryptographically secure 7-character alphanumeric short codes.
- **Custom Alias Support**: Custom slugs with uniqueness verification and reserved-word validation.
- **Full CRUD Management**: View, search, edit destination/slug, copy, and safely delete URLs.
- **Animated Modals**: Framer Motion powered Edit Modal and Delete Confirmation Dialog.
- **HTTP 302 Redirection**: High-speed lookup with automatic visitor telemetry logging (Referrer, User-Agent, Timestamp).
- **Time-Series Analytics**: Interactive Recharts area chart dynamically displaying daily, weekly, and monthly click trends.
- **Live Dashboard**: Aggregate statistics (Total Links, Total Clicks, Active Links, Avg. Clicks).
- **Midnight Luxe Visual Identity**: Obsidian dark theme (`#121210`), Champagne Gold accents (`#c6a66b`), and Sonner toast notifications.

---

## 7. Technology Stack
- **Frontend**: React 19, Vite 8, TypeScript, Tailwind CSS 4, Framer Motion (`motion/react`), Lucide React, Recharts, Sonner.
- **Backend**: Python 3.13, Flask 3.1, Flask-SQLAlchemy 3.1, Flask-Migrate 4.1, Flask-CORS 6.0, PyMySQL 1.1, Gunicorn 26.2.
- **Database**: MySQL 8.0 Community Edition (InnoDB, `utf8mb4`).
- **DevOps & Infrastructure**: Docker 29+, Docker Compose v5+, Nginx 1.31 Alpine, Docker Named Volumes, Docker Bridge Networking.
- **Testing**: Pytest 9.2 with SQLite in-memory test fixtures.

---

## 8. System Architecture

```
                    ┌─────────────────────────────────────────┐
                    │               USER BROWSER              │
                    │         http://localhost:3000           │
                    └────────────────────┬────────────────────┘
                                         │
                                         ▼
         ┌───────────────────────────────────────────────────────────────┐
         │             CONTAINER 1: smartlink_frontend                   │
         │                    Nginx Web Server                           │
         │                 Exposed Host Port: 3000                       │
         ├───────────────────────────────┬───────────────────────────────┤
         │ Static SPA Assets (React/Vite)│ Proxy /api/* and /s/*         │
         │   /usr/share/nginx/html       │ http://backend:5000           │
         └───────────────────────────────┼───────────────────────────────┘
                                         │ (Docker Bridge: smartlink_network)
                                         ▼
         ┌───────────────────────────────────────────────────────────────┐
         │             CONTAINER 2: smartlink_backend                    │
         │             Flask REST API + Gunicorn                         │
         │                 Internal Port: 5000                           │
         ├───────────────────────────────────────────────────────────────┤
         │ • CRUD URL Lifecycle Engine                                   │
         │ • HTTP 302 Redirection & Telemetry Logging                    │
         │ • Aggregated Statistics & Time-Series Engine                  │
         └───────────────────────────────┬───────────────────────────────┘
                                         │ (Docker Bridge: smartlink_network)
                                         ▼
         ┌───────────────────────────────────────────────────────────────┐
         │             CONTAINER 3: smartlink_db                         │
         │                     MySQL 8.0                                 │
         │                 Internal Port: 3306                           │
         ├───────────────────────────────────────────────────────────────┤
         │ Tables: urls, click_events                                    │
         │ Storage: Persistent Volume 'smartlink_mysql_data'             │
         └───────────────────────────────────────────────────────────────┘
```

---

## 9. Project Folder Structure

```
DOCKER_SMART_URL_SHORTENER/
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   │   ├── urls.py           # CRUD endpoints: POST, GET, PUT, DELETE
│   │   │   ├── redirect.py       # /s/<short_code> redirection & tracking
│   │   │   ├── dashboard.py      # /api/dashboard metrics
│   │   │   ├── analytics.py      # /api/analytics endpoints
│   │   │   └── health.py         # /api/health monitoring
│   │   ├── services/
│   │   │   ├── url_service.py    # URL generation, update & cascade logic
│   │   │   └── analytics_service.py # Database aggregations & time-series
│   │   ├── utils/
│   │   │   └── validators.py     # Scheme & alias sanitization
│   │   ├── __init__.py           # Application factory
│   │   ├── config.py             # Environment configurations
│   │   └── models.py             # SQLAlchemy models (Url, ClickEvent)
│   ├── tests/
│   │   ├── conftest.py           # Pytest fixtures & in-memory test DB
│   │   └── test_app.py           # Comprehensive 22-test CRUD test suite
│   ├── Dockerfile                # Production backend container (Python + Gunicorn)
│   ├── requirements.txt          # Python dependencies
│   └── wsgi.py                   # Gunicorn WSGI entrypoint
├── frontend/
│   ├── public/                   # Static favicon assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/               # Reusable UI primitives
│   │   │   └── SmartLinkShell.tsx # Midnight Luxe sidebar & layout
│   │   ├── lib/
│   │   │   ├── api.ts            # Centralized API service layer
│   │   │   └── utils.ts          # Styling utilities
│   │   ├── App.tsx               # Full CRUD views (Dashboard, Create, Links, Edit/Delete modals, Analytics)
│   │   ├── index.css             # Tailwind v4 theme styling
│   │   └── main.tsx              # React mounting root
│   ├── Dockerfile                # Multi-stage production build (Node -> Nginx)
│   ├── nginx.conf                # Nginx reverse proxy configuration
│   ├── package.json              # Frontend dependencies
│   └── vite.config.ts            # Vite build configuration
├── docker/
│   └── mysql/
│       └── init.sql              # MySQL 8 initial schema creation script
├── docs/
│   └── screenshots/              # Genuine application screenshots
├── .env.example                  # Environment configuration template
├── .gitignore
├── API_DOCUMENTATION.md          # Comprehensive REST API specifications
├── DOCKER_COMMANDS.md            # Docker operations reference manual
├── docker-compose.yml            # Multi-service composition definition
├── PROJECT_REPORT.md             # In-depth academic project documentation
└── README.md                     # Main project overview
```

---

## 10. CRUD Operations

| Operation | User Interaction | Frontend Implementation | Flask API Endpoint | Database Operation | Expected Result |
|---|---|---|---|---|---|
| **CREATE** | User pastes long URL and optional custom slug, clicks "Generate short link" | Form submission in `CreatePage` or `Overview`, triggers `api.createUrl()` | `POST /api/urls` | Validates scheme, verifies slug uniqueness, inserts new record into `urls` | `201 Created` with new URL object; shows green link card and copy button |
| **READ** | User navigates to "My Links" or "Dashboard", searches via input | `LinksPage` loads records with `api.getUrls(query)` and displays responsive table | `GET /api/urls` and `GET /api/urls/<id>` | Queries `urls` table with optional `LIKE` filtering, orders by `created_at DESC` | `200 OK` with JSON array of links, click counts, and timestamps |
| **UPDATE** | User clicks the "Edit" pencil icon on any link row | `EditLinkModal` pops up, pre-populates existing URL and slug, submits with `api.updateUrl()` | `PUT /api/urls/<id>` | Verifies ID, validates new URL/slug, checks uniqueness against other records, updates row | `200 OK` with updated record; preserves record ID, click count, and click events |
| **DELETE** | User clicks "Delete" trash icon on any link row | `DeleteConfirmModal` displays warning prompt with link details, confirms with `api.deleteUrl()` | `DELETE /api/urls/<id>` | Deletes record from `urls`; cascades and deletes associated `click_events` | `200 OK` with success message; link disappears from table, toast confirms deletion |

---

## 11. Business Logic

### URL Validation
- Strict validation restricts schemes exclusively to `http://` and `https://`.
- Rejects malformed strings, unsupported protocols (`ftp://`, `file://`), and script injections (`javascript:`).

### Short Code Generation & Uniqueness
- If no alias is provided, generates a cryptographically secure 7-character string using `secrets.choice`.
- Retries automatically if a collision occurs.
- Rejects system-reserved slugs (e.g., `api`, `s`, `health`, `dashboard`, `analytics`).

### Redirection & Telemetry Logging
- When `/s/<short_code>` is accessed, the backend atomically increments `click_count` on `urls`.
- A telemetry record is created in `click_events` capturing `url_id`, `clicked_at`, `referrer`, and `user_agent`.
- Returns an HTTP `302 Found` with the target `Location` header.

### Update Data Integrity
- When modifying an existing link, the record ID (`urls.id`), total click count (`click_count`), and all existing historical click events in `click_events` are strictly preserved.
- If the short code is changed, the old code is released and the new code resolves immediately.

---

## 12. Database Design

### Table: `urls`
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

### Table: `click_events`
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

## 13. API Endpoints

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `POST` | `/api/urls` | Create a shortened URL | `201 Created`, `400 Bad Request`, `409 Conflict` |
| `GET` | `/api/urls` | Retrieve all shortened URLs (supports `?q=search`) | `200 OK` |
| `GET` | `/api/urls/<id>` | Retrieve single URL record by ID | `200 OK`, `404 Not Found` |
| `PUT` | `/api/urls/<id>` | Update original destination or custom short code | `200 OK`, `400 Bad Request`, `404 Not Found`, `409 Conflict` |
| `DELETE` | `/api/urls/<id>` | Delete shortened URL and cascade remove click events | `200 OK`, `404 Not Found` |
| `POST` | `/api/urls/<id>/regenerate` | Regenerate a new random short code for link | `200 OK`, `404 Not Found` |
| `GET` | `/s/<short_code>` | Redirect to destination and record click event | `302 Found`, `404 Not Found` |
| `GET` | `/api/dashboard/stats` | Aggregated dashboard metrics | `200 OK` |
| `GET` | `/api/dashboard/recent` | Recent shortened URLs | `200 OK` |
| `GET` | `/api/analytics/overview` | Macro-level analytics summary | `200 OK` |
| `GET` | `/api/analytics/clicks` | Time-series click activity (`?period=daily\|weekly\|monthly`) | `200 OK` |
| `GET` | `/api/analytics/top-links` | Top-performing links ranked by clicks | `200 OK` |
| `GET` | `/api/analytics/<id>` | Individual URL click history and telemetry | `200 OK`, `404 Not Found` |
| `GET` | `/api/health` | Service and database connectivity health probe | `200 OK`, `503 Service Unavailable` |

---

## 14. Docker Architecture

The system utilizes Docker Compose to orchestrate three containerized microservices:
1. **Frontend Service (`smartlink_frontend`)**:
   - Multi-stage build compiles React assets using Node.js 22 Alpine, copying production bundles to Nginx Alpine.
   - Listens on container port 80, mapped to host port 3000.
   - Proxies `/api/` and `/s/` to `backend:5000`.
2. **Backend Service (`smartlink_backend`)**:
   - Python 3.13-slim image running Gunicorn with 3 workers and 2 threads.
   - Exposes internal port 5000.
3. **Database Service (`smartlink_db`)**:
   - MySQL 8.0 Community Edition initialized via `docker/mysql/init.sql`.
   - Data stored in named volume `smartlink_mysql_data`.
4. **Networking**:
   - All services communicate over custom bridge network `smartlink_network` using container DNS names (`db`, `backend`).

---

## 15. Docker Implementation
The application is fully configured via [`docker-compose.yml`](docker-compose.yml):
- **Health Checks**: Automated probes verify container readiness before dependent services start.
- **Service Dependency**: `backend` waits for `db` to be healthy; `frontend` waits for `backend` to be healthy.
- **Port Isolation**: Database port 3306 and backend port 5000 remain unexposed to the host, protecting them from unauthorized external access.

---

## 16. Installation Requirements
- **Docker Desktop** (Engine 24.0+ and Docker Compose v2.20+)
- **Operating System**: Windows 10/11, macOS, or Linux
- **RAM**: Minimum 8 GB
- **Disk Space**: Minimum 10 GB

---

## 17. Environment Configuration
Configuration is managed through environment variables. Copy `.env.example` to `.env`:

```env
# MySQL Database Configuration
MYSQL_DATABASE=smartlink_db
MYSQL_USER=smartlink_user
MYSQL_PASSWORD=smartlink_password_2024
MYSQL_ROOT_PASSWORD=root_secure_password_2024
DB_HOST=db
DB_PORT=3306

# Flask Backend Configuration
SECRET_KEY=smartlink-ultra-secure-random-jwt-token-key-2024
FLASK_ENV=production
BASE_URL=http://localhost:3000

# Frontend & Reverse Proxy Configuration
FRONTEND_PORT=3000
VITE_API_BASE_URL=/api
```

---

## 18. Execution Instructions

### Step 1: Start All Services
```bash
docker compose up --build -d
```

### Step 2: Verify Status
```bash
docker compose ps
```

### Step 3: Open in Browser
Visit **[http://localhost:3000](http://localhost:3000)** to access the live SmartLink workspace.

---

## 19. Docker Commands

| Command | Description |
|---|---|
| `docker compose up --build -d` | Build and start all 3 services in the background |
| `docker compose ps` | Check container health, status, and port bindings |
| `docker compose logs -f` | Stream live aggregated logs from all services |
| `docker compose logs -f backend` | View Flask API and Gunicorn logs |
| `docker compose logs -f frontend` | View Nginx access and error logs |
| `docker compose logs -f db` | View MySQL 8 database query logs |
| `docker compose stop` | Pause running containers without removing data |
| `docker compose start` | Resume paused containers |
| `docker compose restart` | Restart all container services |
| `docker compose down` | Stop and tear down containers and network (preserves volumes) |
| `docker compose exec backend sh` | Open a shell inside the backend container |
| `docker compose exec db mysql -u smartlink_user -p smartlink_db` | Open an interactive MySQL terminal prompt |

---

## 20. Testing

Automated testing is implemented using Pytest with 22 comprehensive test cases:

```bash
$env:PYTHONPATH="backend"; pytest backend/tests -v
```

### Test Results Breakdown:
- **CREATE TESTS (1–4)**:
  - `test_01_create_valid_url`: Creates valid shortened URL with HTTP/HTTPS schemes. **(PASSED)**
  - `test_02_reject_invalid_url_schemes`: Rejects `ftp://`, `javascript:`, and malformed URLs. **(PASSED)**
  - `test_03_generate_unique_short_code`: Automatically generates unique random short codes. **(PASSED)**
  - `test_04_reject_duplicate_custom_alias`: Rejects duplicate custom aliases with HTTP 409 Conflict. **(PASSED)**
- **READ TESTS (5–8)**:
  - `test_05_read_all_urls`: Retrieves all records and verifies search filtering. **(PASSED)**
  - `test_06_read_single_url_by_id`: Retrieves an individual URL record by ID. **(PASSED)**
  - `test_07_read_nonexistent_url`: Handles nonexistent record lookup with HTTP 404. **(PASSED)**
  - `test_08_verify_accurate_dashboard_statistics`: Verifies accurate database metrics and averages. **(PASSED)**
- **UPDATE TESTS (9–15)**:
  - `test_09_update_original_url`: Updates original destination URL. **(PASSED)**
  - `test_10_update_custom_short_code`: Updates custom short code and verifies redirection routing. **(PASSED)**
  - `test_11_update_reject_duplicate_short_code`: Rejects updating short code to an existing alias held by another link. **(PASSED)**
  - `test_12_update_reject_invalid_url`: Rejects invalid destination URLs during update. **(PASSED)**
  - `test_13_update_nonexistent_url`: Returns HTTP 404 for nonexistent link updates. **(PASSED)**
  - `test_14_update_preserves_click_count`: Verifies click count is preserved upon updating. **(PASSED)**
  - `test_15_update_preserves_click_history`: Verifies individual click event records remain intact upon updating. **(PASSED)**
- **DELETE TESTS (16–18)**:
  - `test_16_delete_existing_url`: Deletes an existing URL record. **(PASSED)**
  - `test_17_delete_nonexistent_url`: Returns HTTP 404 when deleting a nonexistent record. **(PASSED)**
  - `test_18_delete_cascades_click_events`: Verifies cascade deletion removes associated click events. **(PASSED)**
- **ADDITIONAL TESTS (19–22)**:
  - `test_19_url_redirection_workflow`: Verifies HTTP 302 redirection to destination. **(PASSED)**
  - `test_20_redirection_increments_click_count`: Confirms click count increments atomically on each redirect. **(PASSED)**
  - `test_21_redirection_stores_click_event_metadata`: Confirms Referrer and User-Agent are saved to database. **(PASSED)**
  - `test_22_invalid_short_code_returns_404`: Confirms invalid or expired short codes return HTTP 404. **(PASSED)**

**Result: 22 passed in 1.51s.**

---

## 21. Application Screenshots

### 1. Main Dashboard
![SmartLink Dashboard](docs/screenshots/dashboard.png)
*Figure 1: Main Dashboard displaying live metrics, quick shorten bar, real-time Recharts area chart, and recent links.*

### 2. URL Creation Interface
![Create Short Link](docs/screenshots/create-short-link.png)
*Figure 2: URL creation form with destination URL and optional custom alias fields.*

### 3. Generated Short Link
![Generated Short Link](docs/screenshots/generated-short-link.png)
*Figure 3: Animated success banner with generated short link and one-click copy button.*

### 4. My Links Library (Read Operation)
![My Links](docs/screenshots/my-links.png)
*Figure 4: Complete list of stored URLs showing destination, short link, click counts, creation dates, and action controls.*

### 5. Edit Link Modal (Update Operation)
![Update Link Modal](docs/screenshots/update-link.png)
*Figure 5: Animated Edit Link modal populated with existing record values, allowing modification while preserving history.*

### 6. Updated Link Record
![Updated Link](docs/screenshots/updated-link.png)
*Figure 6: Link library reflecting successfully updated destination and custom alias.*

### 7. Delete Confirmation Dialog (Delete Operation)
![Delete Confirmation](docs/screenshots/delete-confirmation.png)
*Figure 7: Delete Confirmation Dialog prompting the user before permanently removing a URL and cascading click events.*

### 8. Analytics Overview
![Analytics](docs/screenshots/analytics.png)
*Figure 8: Performance Analytics displaying total clicks, unique visitors, CTR, time-series chart, and top performing links.*

### 9. Docker Container Status
![Docker Containers](docs/screenshots/docker-containers.png)
*Figure 9: Terminal verification showing all three containers (frontend, backend, database) healthy and synchronized.*

### 10. MySQL Database Records
![Database Records](docs/screenshots/database-records.png)
*Figure 10: Verified MySQL records inside `smartlink_db` demonstrating referential integrity across `urls` and `click_events`.*

---

## 22. Results
- **Full CRUD Verification**: Create, Read, Update, and Delete operations fully tested and functional across UI, API, and database.
- **Zero Data Loss**: Database records and click counts remain intact across container restarts.
- **Performance**: High-speed redirect response times (< 20ms) and lightweight container images.
- **Production Architecture**: Nginx successfully proxies frontend, backend API, and redirect requests through a single domain.

---

## 23. Future Enhancements
1. **Dynamic QR Codes**: Generate downloadable vector QR codes for every shortened URL.
2. **GeoIP Country Telemetry**: Map visitor IP addresses to countries with a world heat map.
3. **Link Expiration & TTL**: Allow links to expire after a specified date or total visit threshold.
4. **Password-Protected Links**: Support passcodes for sensitive shortened URLs.

---

## 24. Conclusion
SmartLink fulfills all academic and industrial requirements for a multi-container full-stack application. It combines a sophisticated luxury React frontend with a modular Flask REST API, an ACID-compliant MySQL database, and production-grade Docker containerization, proving that microservices can be both aesthetically refined and architecturally robust.

---

## 25. References
1. Fielding, R. T. (2000). *Architectural Styles and the Design of Network-based Software Architectures*. Doctoral dissertation, University of California, Irvine.
2. Docker Documentation. (2024). *Docker Compose Specification and Networking Guide*. https://docs.docker.com/compose/
3. Flask Documentation. (2024). *Application Factories and Blueprint Architecture*. Pallets Projects. https://flask.palletsprojects.com/
4. MySQL 8.0 Reference Manual. (2024). *InnoDB Storage Engine and Indexing Optimization*. Oracle Corporation. https://dev.mysql.com/doc/refman/8.0/en/
5. React Documentation. (2024). *React 19 Architecture and Hooks API*. Meta Platforms. https://react.dev/
