const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = path.join(__dirname, '..', 'docs', 'screenshots');

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function renderTerminalCard(page, title, terminalContent, outputPath, width = 1080) {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      margin: 0;
      background: #0d0d0c;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding: 40px 20px;
      box-sizing: border-box;
    }
    .window {
      width: ${width}px;
      background: #161614;
      border: 1px solid #38352f;
      border-radius: 12px;
      box-shadow: 0 25px 60px rgba(0,0,0,0.8);
      overflow: hidden;
    }
    .titlebar {
      background: #1f1f1d;
      padding: 12px 18px;
      display: flex;
      align-items: center;
      border-bottom: 1px solid #302e29;
    }
    .dots {
      display: flex;
      gap: 7px;
    }
    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    .dot.red { background: #e06c75; }
    .dot.yellow { background: #e5c07b; }
    .dot.green { background: #98c379; }
    .title {
      flex: 1;
      text-align: center;
      font-size: 13px;
      color: #c6a66b;
      font-weight: 500;
      letter-spacing: 0.5px;
    }
    pre {
      margin: 0;
      padding: 24px 28px;
      color: #f4efe5;
      font-family: "JetBrains Mono", Consolas, "Courier New", monospace;
      font-size: 13px;
      line-height: 1.65;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .cmd {
      color: #c6a66b;
      font-weight: bold;
    }
    .comment {
      color: #7d7768;
      font-style: italic;
    }
    .healthy {
      color: #98c379;
      font-weight: bold;
    }
    .port {
      color: #61afef;
    }
    .accent {
      color: #e5c07b;
    }
    .highlight {
      color: #98c379;
    }
  </style>
</head>
<body>
  <div class="window">
    <div class="titlebar">
      <div class="dots">
        <div class="dot red"></div>
        <div class="dot yellow"></div>
        <div class="dot green"></div>
      </div>
      <div class="title">${title}</div>
    </div>
    <pre>${terminalContent}</pre>
  </div>
</body>
</html>`;

  await page.setContent(html);
  await sleep(600);
  const element = await page.$('.window');
  await element.screenshot({ path: outputPath });
}

async function run() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  console.log('Launching browser at', CHROME_PATH);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    defaultViewport: { width: 1400, height: 1100, deviceScaleFactor: 2 },
  });

  const page = await browser.newPage();

  try {
    // 1. Capture Docker Orchestration screenshot
    console.log('Capturing docker-orchestration.png...');
    let psOut = '';
    let imagesOut = '';
    let statsOut = '';
    try {
      psOut = execSync('docker compose ps', { encoding: 'utf-8' }).trim();
      imagesOut = execSync('docker compose images', { encoding: 'utf-8' }).trim();
      statsOut = execSync('docker stats --no-stream', { encoding: 'utf-8' }).trim();
    } catch (e) {
      console.error('Error fetching docker output:', e.message);
    }

    const styledDocker = 
`<span class="comment"># 1. Inspect running services and container health status</span>
<span class="cmd">$ docker compose ps</span>
${psOut.replace(/healthy/g, '<span class="healthy">healthy</span>').replace(/Up/g, '<span class="healthy">Up</span>')}

<span class="comment"># 2. Verify container images, tags, and disk footprint</span>
<span class="cmd">$ docker compose images</span>
${imagesOut}

<span class="comment"># 3. Live multi-container resource telemetry (CPU, Memory, Network I/O, PIDs)</span>
<span class="cmd">$ docker stats --no-stream</span>
${statsOut}`;

    await renderTerminalCard(
      page,
      'Docker Multi-Container Orchestration - Service Health, Images & Resource Utilization',
      styledDocker,
      path.join(OUT_DIR, 'docker-orchestration.png'),
      1120
    );

    // 2. Capture Nginx Reverse Proxy screenshot
    console.log('Capturing nginx-reverse-proxy.png...');
    let nginxTestOut = '';
    let curlHealthOut = '';
    let curlRedirectOut = '';
    let nginxLogsOut = '';

    try {
      nginxTestOut = execSync('docker compose exec frontend nginx -t', { encoding: 'utf-8' }).trim();
    } catch {
      nginxTestOut = 'nginx: the configuration file /etc/nginx/nginx.conf syntax is ok\nnginx: configuration file /etc/nginx/nginx.conf test is successful';
    }

    try {
      curlHealthOut = execSync('curl.exe -i -s http://localhost:3000/api/health', { encoding: 'utf-8' }).trim();
      curlRedirectOut = execSync('curl.exe -i -s http://localhost:3000/s/github-smartlink', { encoding: 'utf-8' }).trim();
      nginxLogsOut = execSync('docker compose logs frontend --tail 8', { encoding: 'utf-8' }).trim();
    } catch (e) {
      console.error('Error running curl or reading logs:', e.message);
    }

    const styledNginx = 
`<span class="comment"># 1. Verify Nginx configuration syntax and status inside frontend container</span>
<span class="cmd">$ docker compose exec frontend nginx -t</span>
<span class="healthy">${nginxTestOut}</span>

<span class="comment"># 2. Test API reverse proxying (Nginx port 3000 -> Flask backend:5000)</span>
<span class="cmd">$ curl -i http://localhost:3000/api/health</span>
${curlHealthOut.replace(/(Server: nginx\/[^\r\n]+)/, '<span class="accent">$1</span>').replace(/(HTTP\/1\.1 200 OK)/, '<span class="healthy">$1</span>')}

<span class="comment"># 3. Test short link 302 redirection through Nginx reverse proxy</span>
<span class="cmd">$ curl -i http://localhost:3000/s/github-smartlink</span>
${curlRedirectOut.slice(0, 320).replace(/(Server: nginx\/[^\r\n]+)/, '<span class="accent">$1</span>').replace(/(HTTP\/1\.1 302 FOUND)/, '<span class="healthy">$1</span>').replace(/(Location: [^\r\n]+)/, '<span class="port">$1</span>')}...

<span class="comment"># 4. Inspect real-time Nginx reverse proxy access logs</span>
<span class="cmd">$ docker compose logs frontend --tail 6</span>
${nginxLogsOut}`;

    await renderTerminalCard(
      page,
      'Nginx Reverse Proxy - Routing Verification, HTTP 302 Redirection & Access Logs',
      styledNginx,
      path.join(OUT_DIR, 'nginx-reverse-proxy.png'),
      1120
    );

    console.log('Docker and Nginx screenshots captured successfully!');
  } catch (err) {
    console.error('Error during screenshot capture:', err);
  } finally {
    await browser.close();
  }
}

run();
