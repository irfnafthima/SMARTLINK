# SmartLink - Complete Docker Commands & Operations Guide

This guide provides beginner-friendly explanations and examples for managing the containerized SmartLink system with Docker and Docker Compose.

---

## 1. Quick Reference Commands

| Operation | Command | Purpose |
|---|---|---|
| **Build & Start** | `docker compose up --build -d` | Compiles images, creates network/volume, and starts all 3 services detached |
| **Check Containers** | `docker compose ps` | Displays status, health, and exposed ports of all containers |
| **View All Logs** | `docker compose logs -f` | Streams real-time aggregated logs from all services |
| **Backend Logs** | `docker compose logs -f backend` | Streams logs specifically from Flask / Gunicorn |
| **Frontend Logs** | `docker compose logs -f frontend` | Streams access and error logs from Nginx |
| **Database Logs** | `docker compose logs -f db` | Streams MySQL 8 initialization and query logs |
| **Stop Services** | `docker compose stop` | Gracefully stops containers without removing state |
| **Start Services** | `docker compose start` | Resumes stopped containers |
| **Restart Services** | `docker compose restart` | Reboots all container services |
| **Teardown** | `docker compose down` | Stops and deletes containers and network (preserves volumes) |
| **Teardown & Purge** | `docker compose down -v` | Stops and destroys containers, networks, and persistent database volumes |
| **List Images** | `docker images` | Lists all built and pulled images on your host |
| **List Volumes** | `docker volume ls` | Lists Docker persistent storage volumes |
| **List Networks** | `docker network ls` | Lists Docker virtual networks |
| **Backend Shell** | `docker compose exec backend sh` | Enters an interactive terminal inside the Python backend container |
| **MySQL CLI** | `docker compose exec db mysql -u smartlink_user -p smartlink_db` | Connects directly to the MySQL database prompt |

---

## 2. Detailed Command Walkthrough

### 2.1 Starting the System
```bash
docker compose up --build -d
```
- `--build`: Forces Docker to re-execute Dockerfile instructions (compiling React with Vite and building the Python environment) if files changed.
- `-d` (Detached Mode): Runs containers in the background so your terminal remains free.

### 2.2 Checking Container Health & Status
```bash
docker compose ps
```
Shows the current state of every service:
- `smartlink_frontend`: Port `0.0.0.0:3000->80/tcp` (Up)
- `smartlink_backend`: Internal port `5000/tcp` (Up, healthy)
- `smartlink_db`: Port `3306/tcp` (Up, healthy)

### 2.3 Streaming Live Container Logs
```bash
# Aggregated stream:
docker compose logs -f

# Backend only (API calls, Gunicorn workers):
docker compose logs -f backend

# Frontend only (Nginx reverse proxy access logs):
docker compose logs -f frontend

# Database only (MySQL connections and queries):
docker compose logs -f db
```
Use `Ctrl + C` to exit log streaming without stopping containers.

### 2.4 Stopping, Starting, and Restarting
To pause your environment without losing any data or deleting containers:
```bash
docker compose stop
```
To resume running:
```bash
docker compose start
```
To restart all services:
```bash
docker compose restart
```

### 2.5 Accessing Container Shells
#### Backend Container (Python Environment):
```bash
docker compose exec backend sh
```
Inside the container, you can run:
```sh
python -c "import app; print(app)"
pip list
curl http://localhost:5000/api/health
exit
```

#### MySQL Database Container:
```bash
docker compose exec db mysql -u smartlink_user -psmartlink_password_2024 smartlink_db
```
Inside the MySQL shell, you can inspect actual tables and data:
```sql
SHOW TABLES;
SELECT * FROM urls;
SELECT * FROM click_events;
EXIT;
```

---

## 3. Core Docker Concepts Explained

### 3.1 Docker Images vs. Containers
- **Image**: A read-only template with instructions for creating a Docker container (e.g. `mysql:8.0` or `docker_smart_url_shortener-frontend`). Images are built once and stored locally.
- **Container**: A runnable instance of an image. It includes an isolated filesystem, environment variables, network interfaces, and processes.

### 3.2 Port Mapping (`3000:80`)
- In `docker-compose.yml`, the mapping `"${FRONTEND_PORT:-3000}:80"` connects host port `3000` to container port `80`.
- The user points their browser to `http://localhost:3000`. The host forwards packets into Nginx running on port 80 inside the container.
- Backend port `5000` and MySQL port `3306` are kept internal inside the private Docker network and are **not** exposed directly to the outside world, preventing unauthorized access.

### 3.3 Docker Bridge Network (`smartlink_network`)
- All 3 containers join a dedicated bridge network named `smartlink_network`.
- Containers resolve each other using **Docker service names** as DNS hostnames:
  - Nginx connects to `http://backend:5000`.
  - Flask connects to `mysql+pymysql://... @db:3306/...`.
- `localhost` inside a container refers to *that container itself*, not the host. This is why service names (`db`, `backend`) are used.

### 3.4 Persistent Named Volumes (`smartlink_mysql_data`)
- Containers are ephemeral: destroying a container wipes its internal filesystem.
- To prevent data loss, the MySQL database data directory `/var/lib/mysql` is mapped to the persistent Docker named volume `smartlink_mysql_data`.
- When containers are stopped or recreated with `docker compose down` and `docker compose up`, the database volume remains untouched, ensuring zero data loss.

---

## 4. Troubleshooting Common Issues

### Port 3000 already in use
If another service on your machine uses port 3000, modify `.env`:
```env
FRONTEND_PORT=8080
```
Then restart:
```bash
docker compose up -d
```
Access the application at `http://localhost:8080`.

### Database connection refused
If the backend logs report `Can't connect to MySQL server on 'db'`:
1. Check database health: `docker compose ps`
2. Inspect database logs: `docker compose logs db`
3. Ensure the health check on `db` passed before `backend` starts (managed automatically via `depends_on: { db: { condition: service_healthy } }`).
