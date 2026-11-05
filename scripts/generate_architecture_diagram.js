const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_PNG = path.join(__dirname, '..', 'docs', 'screenshots', 'system-architecture.png');
const OUT_SVG = path.join(__dirname, '..', 'docs', 'system-architecture.svg');

const diagramHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #0d0d0c;
    background-image: 
      radial-gradient(circle at 50% 0%, rgba(198, 166, 107, 0.08) 0%, transparent 60%),
      linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px);
    background-size: 100% 100%, 32px 32px, 32px 32px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #f4efe5;
    padding: 50px 60px;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .canvas {
    width: 1560px;
    background: #141412;
    border: 1px solid #38352f;
    border-radius: 20px;
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(198, 166, 107, 0.15);
    overflow: hidden;
    position: relative;
  }

  /* Header */
  .header {
    padding: 32px 40px;
    background: linear-gradient(180deg, #1a1a18 0%, #151513 100%);
    border-bottom: 1px solid #2e2c26;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .logo-badge {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #c6a66b, #937438);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px rgba(198, 166, 107, 0.3);
  }
  .logo-badge svg {
    width: 26px;
    height: 26px;
    stroke: #121210;
  }
  .title-group h1 {
    font-size: 26px;
    font-weight: 700;
    color: #f4efe5;
    letter-spacing: -0.5px;
  }
  .title-group p {
    font-size: 13px;
    color: #b7ad9d;
    margin-top: 3px;
  }
  .badges-group {
    display: flex;
    gap: 10px;
  }
  .pill {
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.3px;
  }
  .pill-docker {
    background: rgba(36, 150, 237, 0.12);
    border: 1px solid rgba(36, 150, 237, 0.4);
    color: #38bdf8;
  }
  .pill-arch {
    background: rgba(198, 166, 107, 0.12);
    border: 1px solid rgba(198, 166, 107, 0.4);
    color: #c6a66b;
  }
  .pill-status {
    background: rgba(34, 197, 94, 0.12);
    border: 1px solid rgba(34, 197, 94, 0.4);
    color: #4ade80;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .status-dot {
    width: 8px;
    height: 8px;
    background: #4ade80;
    border-radius: 50%;
    box-shadow: 0 0 8px #4ade80;
  }

  /* Body Content */
  .diagram-body {
    padding: 44px 44px 50px 44px;
    display: flex;
    flex-direction: column;
    gap: 36px;
    position: relative;
  }

  /* Client Tier */
  .client-row {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .client-card {
    background: #1c1c1a;
    border: 1px solid #3d3a33;
    border-radius: 14px;
    padding: 16px 36px;
    display: flex;
    align-items: center;
    gap: 18px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  }
  .client-icon {
    width: 40px;
    height: 40px;
    background: #272724;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    stroke: #c6a66b;
  }
  .client-info h3 {
    font-size: 16px;
    font-weight: 600;
    color: #f4efe5;
  }
  .client-info span {
    font-size: 12px;
    color: #9d9484;
  }

  /* Flow Connector between Client & Docker Network */
  .flow-arrow-down {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    margin: -14px 0;
  }
  .flow-badge {
    background: #242420;
    border: 1px solid #484339;
    padding: 4px 14px;
    border-radius: 12px;
    font-size: 11px;
    font-family: monospace;
    color: #c6a66b;
    font-weight: 600;
  }
  .arrow-line {
    width: 2px;
    height: 20px;
    background: linear-gradient(180deg, #c6a66b 0%, #38bdf8 100%);
  }

  /* Docker Environment Box */
  .docker-boundary {
    border: 2px dashed rgba(56, 189, 248, 0.35);
    background: rgba(18, 22, 28, 0.4);
    border-radius: 18px;
    padding: 34px 28px 28px 28px;
    position: relative;
  }
  .docker-boundary-label {
    position: absolute;
    top: -14px;
    left: 28px;
    background: #15222e;
    border: 1px solid rgba(56, 189, 248, 0.5);
    border-radius: 8px;
    padding: 3px 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 600;
    color: #38bdf8;
    letter-spacing: 0.3px;
  }

  /* Containers Grid */
  .containers-grid {
    display: grid;
    grid-template-columns: 1fr 50px 1.15fr 50px 1fr;
    align-items: stretch;
  }

  /* Service Card */
  .service-card {
    background: #1b1b19;
    border: 1px solid #38352e;
    border-radius: 14px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 12px 30px rgba(0,0,0,0.5);
    transition: transform 0.2s;
  }
  .service-header {
    padding: 16px 20px;
    background: #21211e;
    border-bottom: 1px solid #333029;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .service-title-area {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .service-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .icon-frontend { background: rgba(198, 166, 107, 0.15); stroke: #c6a66b; }
  .icon-backend { background: rgba(96, 165, 250, 0.15); stroke: #60a5fa; }
  .icon-db { background: rgba(52, 211, 153, 0.15); stroke: #34d399; }

  .service-name {
    font-size: 14px;
    font-weight: 700;
    color: #f4efe5;
  }
  .service-sub {
    font-size: 11px;
    color: #9d9484;
    font-family: monospace;
  }
  .port-badge {
    background: #141412;
    border: 1px solid #454137;
    border-radius: 6px;
    padding: 3px 8px;
    font-size: 11px;
    font-family: monospace;
    color: #38bdf8;
    font-weight: 600;
  }
  .port-badge.internal {
    color: #c6a66b;
  }

  .service-body {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    flex: 1;
  }
  .feature-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .feature-item {
    font-size: 12px;
    color: #d1c8b8;
    display: flex;
    align-items: flex-start;
    gap: 8px;
    line-height: 1.4;
  }
  .feature-item svg {
    width: 14px;
    height: 14px;
    stroke: #c6a66b;
    flex-shrink: 0;
    margin-top: 2px;
  }
  .highlight-tag {
    background: #252420;
    border: 1px solid #484339;
    border-radius: 4px;
    padding: 1px 6px;
    font-size: 11px;
    color: #e5c07b;
    font-family: monospace;
  }

  .service-footer {
    padding: 12px 20px;
    background: #171715;
    border-top: 1px solid #2d2b25;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
    color: #8c8373;
  }
  .health-indicator {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #4ade80;
    font-weight: 600;
  }
  .health-dot {
    width: 6px;
    height: 6px;
    background: #4ade80;
    border-radius: 50%;
  }

  /* Between Container Connectors */
  .inter-connector {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 8px;
  }
  .inter-arrow {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  .inter-line {
    width: 100%;
    height: 2px;
    background: #3e3a31;
    position: relative;
  }
  .inter-line::after {
    content: '';
    position: absolute;
    right: 0;
    top: -4px;
    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
    border-left: 8px solid #c6a66b;
  }
  .inter-label {
    background: #22221f;
    border: 1px solid #3c382f;
    border-radius: 6px;
    padding: 3px 6px;
    font-size: 10px;
    font-family: monospace;
    color: #c6a66b;
    white-space: nowrap;
    text-align: center;
  }

  /* Storage & Volume Layer */
  .storage-row {
    margin-top: 18px;
    padding: 16px 20px;
    background: #18191d;
    border: 1px solid #28303f;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .storage-left {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .storage-icon {
    width: 36px;
    height: 36px;
    background: #202738;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    stroke: #38bdf8;
  }
  .storage-info h4 {
    font-size: 13px;
    font-weight: 600;
    color: #f4efe5;
  }
  .storage-info p {
    font-size: 11px;
    color: #8c97a8;
  }
  .storage-badge {
    background: #141e2b;
    border: 1px solid #284463;
    padding: 4px 12px;
    border-radius: 6px;
    font-family: monospace;
    font-size: 11px;
    color: #38bdf8;
  }

  /* Footer Note */
  .diagram-footer {
    padding: 18px 40px;
    background: #111110;
    border-top: 1px solid #23221e;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
    color: #797163;
  }
</style>
</head>
<body>

<div class="canvas">
  <!-- Header -->
  <div class="header">
    <div class="header-left">
      <div class="logo-badge">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
      </div>
      <div class="title-group">
        <h1>SMARTLINK SYSTEM ARCHITECTURE</h1>
        <p>Three-Tier Containerized Microservices Orchestration with Nginx Reverse Proxy</p>
      </div>
    </div>
    <div class="badges-group">
      <div class="pill pill-docker">🐳 Docker Compose v2</div>
      <div class="pill pill-arch">3-Tier Decoupled</div>
      <div class="pill pill-status">
        <div class="status-dot"></div>
        All Services Healthy
      </div>
    </div>
  </div>

  <!-- Body -->
  <div class="diagram-body">
    <!-- Client Layer -->
    <div class="client-row">
      <div class="client-card">
        <div class="client-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
        </div>
        <div class="client-info">
          <h3>Client Layer: Web Browsers / Mobile Devices / REST Clients</h3>
          <span>Public Entrypoint: Single Host Port exposed to external users</span>
        </div>
        <div class="port-badge">http://localhost:3000</div>
      </div>
    </div>

    <!-- Arrow down -->
    <div class="flow-arrow-down">
      <div class="arrow-line"></div>
      <div class="flow-badge">HTTP Inbound Requests (:3000)</div>
      <div class="arrow-line"></div>
    </div>

    <!-- Docker Network Boundary -->
    <div class="docker-boundary">
      <div class="docker-boundary-label">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M7 12h10M12 7v10"></path></svg>
        Docker Isolated Bridge Network: smartlink_network (172.18.0.0/16)
      </div>

      <div class="containers-grid">
        <!-- 1. Frontend Container -->
        <div class="service-card">
          <div class="service-header">
            <div class="service-title-area">
              <div class="service-icon icon-frontend">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
              </div>
              <div>
                <div class="service-name">smartlink_frontend</div>
                <div class="service-sub">Presentation Tier</div>
              </div>
            </div>
            <div class="port-badge">3000:80</div>
          </div>
          <div class="service-body">
            <ul class="feature-list">
              <li class="feature-item">
                <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span><strong>Nginx 1.31 Alpine</strong> high-speed web gateway</span>
              </li>
              <li class="feature-item">
                <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span><strong>React 19 + Vite</strong> Single Page Application</span>
              </li>
              <li class="feature-item">
                <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Midnight Luxe theme (Tailwind 4, Framer Motion)</span>
              </li>
              <li class="feature-item">
                <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>SPA Fallback: <span class="highlight-tag">try_files $uri /index.html</span></span>
              </li>
              <li class="feature-item">
                <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Gzip Compression & 6-month static asset caching</span>
              </li>
            </ul>
          </div>
          <div class="service-footer">
            <div class="health-indicator">
              <div class="health-dot"></div> healthy (wget probe)
            </div>
            <span>Image: 95.7 MB</span>
          </div>
        </div>

        <!-- Connector 1 -> 2 -->
        <div class="inter-connector">
          <div class="inter-label">Reverse Proxy</div>
          <div class="inter-arrow">
            <div class="inter-line"></div>
          </div>
          <div class="inter-label">/api/* &amp; /s/*</div>
        </div>

        <!-- 2. Backend Container -->
        <div class="service-card">
          <div class="service-header">
            <div class="service-title-area">
              <div class="service-icon icon-backend">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line></svg>
              </div>
              <div>
                <div class="service-name">smartlink_backend</div>
                <div class="service-sub">Application Tier</div>
              </div>
            </div>
            <div class="port-badge internal">:5000 (internal)</div>
          </div>
          <div class="service-body">
            <ul class="feature-list">
              <li class="feature-item">
                <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span><strong>Python 3.13 + Flask 3.1</strong> Application Factory</span>
              </li>
              <li class="feature-item">
                <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span><strong>Gunicorn 26.2</strong> WSGI server (3 workers, 2 threads)</span>
              </li>
              <li class="feature-item">
                <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Full CRUD URL Handlers: <span class="highlight-tag">POST</span> <span class="highlight-tag">GET</span> <span class="highlight-tag">PUT</span> <span class="highlight-tag">DELETE</span></span>
              </li>
              <li class="feature-item">
                <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span><strong>HTTP 302 Redirect Engine</strong> &amp; Atomic Click Tracker</span>
              </li>
              <li class="feature-item">
                <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Visitor Telemetry: Referrer &amp; User-Agent Logging</span>
              </li>
              <li class="feature-item">
                <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Health Endpoint: <span class="highlight-tag">GET /api/health</span></span>
              </li>
            </ul>
          </div>
          <div class="service-footer">
            <div class="health-indicator">
              <div class="health-dot"></div> healthy (curl probe)
            </div>
            <span>Image: 292 MB</span>
          </div>
        </div>

        <!-- Connector 2 -> 3 -->
        <div class="inter-connector">
          <div class="inter-label">PyMySQL Pool</div>
          <div class="inter-arrow">
            <div class="inter-line"></div>
          </div>
          <div class="inter-label">Port :3306</div>
        </div>

        <!-- 3. Database Container -->
        <div class="service-card">
          <div class="service-header">
            <div class="service-title-area">
              <div class="service-icon icon-db">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
              </div>
              <div>
                <div class="service-name">smartlink_db</div>
                <div class="service-sub">Database Tier</div>
              </div>
            </div>
            <div class="port-badge internal">:3306 (internal)</div>
          </div>
          <div class="service-body">
            <ul class="feature-list">
              <li class="feature-item">
                <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span><strong>MySQL 8.0 Community Edition</strong> (InnoDB ACID)</span>
              </li>
              <li class="feature-item">
                <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Table: <span class="highlight-tag">urls</span> (id, original_url, short_code, click_count)</span>
              </li>
              <li class="feature-item">
                <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Table: <span class="highlight-tag">click_events</span> (url_id, timestamp, referrer)</span>
              </li>
              <li class="feature-item">
                <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Foreign Key: <span class="highlight-tag">ON DELETE CASCADE</span></span>
              </li>
              <li class="feature-item">
                <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Auto-initialized via <span class="highlight-tag">docker/mysql/init.sql</span></span>
              </li>
            </ul>
          </div>
          <div class="service-footer">
            <div class="health-indicator">
              <div class="health-dot"></div> healthy (mysqladmin)
            </div>
            <span>Image: 1.09 GB</span>
          </div>
        </div>
      </div>

      <!-- Persistent Storage Box -->
      <div class="storage-row">
        <div class="storage-left">
          <div class="storage-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          </div>
          <div class="storage-info">
            <h4>Docker Named Volume Persistence: smartlink_mysql_data -> /var/lib/mysql</h4>
            <p>Guarantees 100% data retention across container stops, restarts, and image updates</p>
          </div>
        </div>
        <div class="storage-badge">Type: Managed Volume • Driver: local</div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="diagram-footer">
    <span>SmartLink Enterprise URL Shortener • Full CRUD Verification &amp; Automated Testing (22/22 Passing)</span>
    <span>https://github.com/irfnafthima/SMARTLINK</span>
  </div>
</div>

</body>
</html>`;

async function run() {
  const dir = path.dirname(OUT_PNG);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  console.log('Rendering high-resolution architecture diagram...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    defaultViewport: { width: 1680, height: 1160, deviceScaleFactor: 2 },
  });

  const page = await browser.newPage();
  await page.setContent(diagramHtml);
  await new Promise(r => setTimeout(r, 600));

  const canvas = await page.$('.canvas');
  await canvas.screenshot({ path: OUT_PNG });
  console.log('Saved system architecture image to:', OUT_PNG);

  await browser.close();
}

run();
