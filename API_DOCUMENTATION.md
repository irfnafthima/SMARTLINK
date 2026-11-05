# SmartLink API Documentation

SmartLink provides a RESTful API for URL shortening, redirection, real-time analytics, and dashboard metrics.

Base URL: `http://localhost:3000/api` (proxied via Nginx) or `http://localhost:5000/api` (direct backend).  
Redirect URL Prefix: `http://localhost:3000/s/<short_code>`.

---

## 1. URL Management Endpoints

### 1.1 Create Shortened URL
Creates a new shortened URL with either a randomly generated alphanumeric short code or a custom alias.

- **Endpoint**: `POST /api/urls`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "url": "https://www.northstar.studio/notes/spring-collection",
    "custom_alias": "spring-notes"
  }
  ```
  *(Note: `custom_alias` is optional. If omitted, a secure 7-character alphanumeric code is automatically generated).*

- **Success Response (`201 Created`)**:
  ```json
  {
    "id": 1,
    "original_url": "https://www.northstar.studio/notes/spring-collection",
    "short_code": "spring-notes",
    "short_url": "http://localhost:3000/s/spring-notes",
    "click_count": 0,
    "created_at": "2026-11-04T02:07:45",
    "updated_at": "2026-11-04T02:07:45"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: When URL is missing, invalid, or unsupported scheme (e.g., `ftp://` or `javascript:`):
    ```json
    { "error": "Only HTTP and HTTPS URL schemes are permitted" }
    ```
  - `409 Conflict`: When requested custom alias is already assigned to another URL:
    ```json
    { "error": "Custom alias is already in use" }
    ```

---

### 1.2 List All URLs
Retrieves all shortened URLs ordered by creation timestamp descending.

- **Endpoint**: `GET /api/urls`
- **Query Parameters**:
  - `q` (optional): Filter by URL destination or short code keyword (e.g. `?q=northstar`).
- **Success Response (`200 OK`)**:
  ```json
  [
    {
      "id": 1,
      "original_url": "https://www.northstar.studio/notes/spring-collection",
      "short_code": "spring-notes",
      "short_url": "http://localhost:3000/s/spring-notes",
      "click_count": 14,
      "created_at": "2026-11-04T02:07:45",
      "updated_at": "2026-11-04T02:08:17"
    }
  ]
  ```

---

### 1.3 Get URL by ID
Retrieves details for a specific shortened URL.

- **Endpoint**: `GET /api/urls/<id>`
- **Success Response (`200 OK`)**:
  ```json
  {
    "id": 1,
    "original_url": "https://www.northstar.studio/notes/spring-collection",
    "short_code": "spring-notes",
    "short_url": "http://localhost:3000/s/spring-notes",
    "click_count": 14,
    "created_at": "2026-11-04T02:07:45",
    "updated_at": "2026-11-04T02:08:17"
  }
  ```
- **Error Response (`404 Not Found`)**:
  ```json
  { "error": "URL not found" }
  ```

---

### 1.4 Update Shortened URL (UPDATE Operation)
Modifies the destination URL, custom short code, or both, while strictly preserving the record ID, click count, and full historical click events.

- **Endpoint**: `PUT /api/urls/<id>`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "url": "https://www.northstar.studio/notes/summer-collection",
    "short_code": "summer-notes"
  }
  ```
  *(Either `url`, `short_code`, or both may be provided).*

- **Success Response (`200 OK`)**:
  ```json
  {
    "id": 1,
    "original_url": "https://www.northstar.studio/notes/summer-collection",
    "short_code": "summer-notes",
    "short_url": "http://localhost:3000/s/summer-notes",
    "click_count": 14,
    "created_at": "2026-11-04T02:07:45",
    "updated_at": "2026-11-04T17:09:09"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: If neither field is provided, or if the updated destination URL has an invalid scheme.
  - `404 Not Found`: If the URL record ID does not exist in MySQL.
  - `409 Conflict`: If the requested new short code is already assigned to a different URL.

---

### 1.5 Delete Shortened URL (DELETE Operation)
Removes a shortened URL along with all associated click events (cascaded).

- **Endpoint**: `DELETE /api/urls/<id>`
- **Success Response (`200 OK`)**:
  ```json
  { "message": "URL deleted successfully" }
  ```
- **Error Response (`404 Not Found`)**:
  ```json
  { "error": "URL not found" }
  ```

---

### 1.6 Regenerate Short Code
Generates a new random unique short code for an existing URL.

- **Endpoint**: `POST /api/urls/<id>/regenerate`
- **Success Response (`200 OK`)**:
  ```json
  {
    "id": 1,
    "original_url": "https://www.northstar.studio/notes/spring-collection",
    "short_code": "kP9xL2q",
    "short_url": "http://localhost:3000/s/kP9xL2q",
    "click_count": 14,
    "created_at": "2026-11-04T02:07:45",
    "updated_at": "2026-11-04T02:10:00"
  }
  ```

---

## 2. Redirection Endpoint

### 2.1 URL Redirection & Click Event Logging
Looks up destination URL, increments click count, records visitor metadata (referrer and user agent), and performs an HTTP 302 redirection.

- **Endpoint**: `GET /s/<short_code>`
- **Success Response (`302 Found`)**:
  - `Location: https://destination-url.com`
- **Not Found Response (`404 Not Found`)**:
  - Returns formatted Midnight Luxe 404 HTML page (or JSON if `Accept: application/json` is provided).

---

## 3. Dashboard Endpoints

### 3.1 Get Dashboard Statistics
Returns aggregated metrics for the overview dashboard.

- **Endpoint**: `GET /api/dashboard/stats`
- **Success Response (`200 OK`)**:
  ```json
  {
    "total_links": 3,
    "total_clicks": 28,
    "active_links": 3,
    "avg_clicks": 9.3,
    "active_percentage": 100.0,
    "trends": {
      "total_links": "12% from last month",
      "total_clicks": "18.4% from last month",
      "active_links": "100.0% of your links",
      "avg_clicks": "8.2% from last month"
    }
  }
  ```

---

### 3.2 Get Recent Links
Returns the 5 most recently created links for quick access.

- **Endpoint**: `GET /api/dashboard/recent`
- **Success Response (`200 OK`)**:
  ```json
  [
    {
      "id": 3,
      "original_url": "https://news.ycombinator.com",
      "short_code": "hacker-news",
      "short_url": "http://localhost:3000/s/hacker-news",
      "click_count": 0,
      "created_at": "2026-11-04T02:07:58",
      "updated_at": "2026-11-04T02:07:58"
    }
  ]
  ```

---

## 4. Analytics Endpoints

### 4.1 Analytics Overview
Returns macro-level analytics including total clicks, estimated unique visitors, and CTR.

- **Endpoint**: `GET /api/analytics/overview`
- **Success Response (`200 OK`)**:
  ```json
  {
    "total_clicks": 28,
    "unique_visitors": 19,
    "click_through_rate": "18.67%",
    "total_links": 3,
    "trends": {
      "clicks": "18.4% from last month",
      "visitors": "14.1% from last month",
      "ctr": "2.8% from last month"
    }
  }
  ```

---

### 4.2 Clicks Time-Series Statistics
Returns grouped click counts over a specific time window for chart visualization.

- **Endpoint**: `GET /api/analytics/clicks`
- **Query Parameters**:
  - `period`: `daily` (last 7 days), `weekly` (last 4 weeks), or `monthly` (last 6 months). Default: `weekly`.
- **Success Response (`200 OK`)**:
  ```json
  [
    { "day": "Thu", "clicks": 4 },
    { "day": "Fri", "clicks": 2 },
    { "day": "Sat", "clicks": 8 },
    { "day": "Sun", "clicks": 1 },
    { "day": "Mon", "clicks": 5 },
    { "day": "Tue", "clicks": 3 },
    { "day": "Wed", "clicks": 5 }
  ]
  ```

---

### 4.3 Top Performing Links
Returns highest-traffic shortened links.

- **Endpoint**: `GET /api/analytics/top-links?limit=5`
- **Success Response (`200 OK`)**:
  ```json
  [
    {
      "id": 2,
      "original_url": "https://github.com/emergent-agent/smartlink",
      "short_code": "github-smartlink",
      "short_url": "http://localhost:3000/s/github-smartlink",
      "click_count": 18,
      "created_at": "2026-11-04T02:07:53",
      "updated_at": "2026-11-04T02:08:17"
    }
  ]
  ```

---

### 4.4 Individual Link Analytics
Returns detailed click event history and metadata for a specific URL ID.

- **Endpoint**: `GET /api/analytics/<id>`
- **Success Response (`200 OK`)**:
  ```json
  {
    "url": {
      "id": 2,
      "original_url": "https://github.com/emergent-agent/smartlink",
      "short_code": "github-smartlink",
      "short_url": "http://localhost:3000/s/github-smartlink",
      "click_count": 18
    },
    "total_clicks": 18,
    "recent_events": [
      {
        "id": 1,
        "url_id": 2,
        "clicked_at": "2026-11-04T02:08:17",
        "referrer": "https://twitter.com",
        "user_agent": "Mozilla/5.0 Chrome/120.0"
      }
    ]
  }
  ```

---

## 5. System Health Endpoint

### 5.1 Health Check
Verifies Flask application lifecycle and database query execution.

- **Endpoint**: `GET /api/health`
- **Success Response (`200 OK`)**:
  ```json
  {
    "status": "healthy",
    "database": "connected",
    "service": "SmartLink REST API",
    "timestamp": "2026-11-04T02:07:12.671589+00:00"
  }
  ```
- **Degraded Response (`503 Service Unavailable`)**:
  ```json
  {
    "status": "degraded",
    "database": "disconnected: (error detail)",
    "service": "SmartLink REST API",
    "timestamp": "2026-11-04T02:07:12.671589+00:00"
  }
  ```
