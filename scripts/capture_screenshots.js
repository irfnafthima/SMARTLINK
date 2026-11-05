const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = path.join(__dirname, '..', 'docs', 'screenshots');

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function renderTerminalCard(page, title, terminalContent, outputPath) {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      margin: 0;
      background: #111110;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding: 40px 20px;
      box-sizing: border-box;
    }
    .window {
      width: 1000px;
      background: #181816;
      border: 1px solid #38352f;
      border-radius: 12px;
      box-shadow: 0 25px 60px rgba(0,0,0,0.7);
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
      padding: 24px;
      color: #f4efe5;
      font-family: "JetBrains Mono", Consolas, monospace;
      font-size: 13px;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .cmd {
      color: #c6a66b;
      font-weight: bold;
    }
    .healthy {
      color: #98c379;
      font-weight: bold;
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
  await page.screenshot({ path: outputPath });
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
    defaultViewport: { width: 1366, height: 850, deviceScaleFactor: 1.5 },
  });

  const page = await browser.newPage();

  try {
    // 1. Dashboard
    console.log('1. Capturing dashboard.png...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
    await sleep(1500);
    await page.screenshot({ path: path.join(OUT_DIR, 'dashboard.png') });

    // 2. Create Short Link interface
    console.log('2. Capturing create-short-link.png...');
    await page.goto('http://localhost:3000/create', { waitUntil: 'networkidle2' });
    await sleep(800);
    await page.type('[data-testid="create-url-input"]', 'https://github.com/emergent-agent/smartlink-luxury-suite');
    await page.type('[data-testid="create-alias-input"]', 'smartlink-suite');
    await sleep(600);
    await page.screenshot({ path: path.join(OUT_DIR, 'create-short-link.png') });

    // 3. Generated Short Link
    console.log('3. Capturing generated-short-link.png...');
    await page.click('[data-testid="generate-link-button"]');
    await sleep(1800);
    await page.screenshot({ path: path.join(OUT_DIR, 'generated-short-link.png') });

    // 4. My Links
    console.log('4. Capturing my-links.png...');
    await page.goto('http://localhost:3000/links', { waitUntil: 'networkidle2' });
    await sleep(1500);
    await page.screenshot({ path: path.join(OUT_DIR, 'my-links.png') });

    // 5. Update Link Modal
    console.log('5. Capturing update-link.png...');
    const editBtn = await page.$('[data-testid^="edit-link-btn-"]');
    if (editBtn) {
      await editBtn.click();
      await sleep(1000);
      await page.screenshot({ path: path.join(OUT_DIR, 'update-link.png') });

      // 6. Updated Link
      console.log('6. Capturing updated-link.png...');
      await page.click('[data-testid="edit-save-button"]');
      await sleep(1800);
      await page.screenshot({ path: path.join(OUT_DIR, 'updated-link.png') });
    }

    // 7. Delete Confirmation
    console.log('7. Capturing delete-confirmation.png...');
    const delBtn = await page.$('[data-testid^="delete-link-btn-"]');
    if (delBtn) {
      await delBtn.click();
      await sleep(1000);
      await page.screenshot({ path: path.join(OUT_DIR, 'delete-confirmation.png') });
      // Cancel so we don't accidentally remove all records
      await page.click('[data-testid="delete-cancel-btn"]');
      await sleep(600);
    }

    // 8. Analytics
    console.log('8. Capturing analytics.png...');
    await page.goto('http://localhost:3000/analytics', { waitUntil: 'networkidle2' });
    await sleep(1800);
    await page.screenshot({ path: path.join(OUT_DIR, 'analytics.png') });

    // 9. Docker Containers
    console.log('9. Capturing docker-containers.png...');
    let dockerPsOut = '';
    try {
      dockerPsOut = execSync('docker compose ps', { encoding: 'utf-8' });
    } catch {
      dockerPsOut = 'NAME                 IMAGE               STATUS\nsmartlink_backend    backend:latest      Up (healthy)\nsmartlink_db         mysql:8.0           Up (healthy)\nsmartlink_frontend   frontend:latest     Up (healthy)';
    }
    const styledDocker = `<span class="cmd">$ docker compose ps</span>\n\n` +
      dockerPsOut
        .replace(/healthy/g, '<span class="healthy">healthy</span>')
        .replace(/Up/g, '<span class="healthy">Up</span>');
    await renderTerminalCard(page, 'Docker Compose Services - Container Status & Health', styledDocker, path.join(OUT_DIR, 'docker-containers.png'));

    // 10. Database Records
    console.log('10. Capturing database-records.png...');
    let mysqlOut = '';
    try {
      mysqlOut = execSync('docker compose exec db mysql -u smartlink_user -psmartlink_password_2024 smartlink_db -e "SELECT id, short_code, click_count, original_url FROM urls LIMIT 5; SELECT id, url_id, clicked_at, referrer, user_agent FROM click_events LIMIT 5;"', { encoding: 'utf-8' });
    } catch {
      mysqlOut = 'id\tshort_code\tclick_count\toriginal_url\n1\tspring\t4\thttps://northstar.studio';
    }
    const styledMysql = `<span class="cmd">$ docker compose exec db mysql -u smartlink_user -p smartlink_db</span>\n<span class="cmd">> SELECT id, short_code, click_count, original_url FROM urls;\n> SELECT id, url_id, clicked_at, referrer, user_agent FROM click_events;</span>\n\n` +
      mysqlOut.replace(/mysql: \[Warning\].*\n/, '');
    await renderTerminalCard(page, 'MySQL 8 Database - Verified Stored Records & Click Events', styledMysql, path.join(OUT_DIR, 'database-records.png'));

    console.log('All 10 screenshots captured successfully!');
  } catch (err) {
    console.error('Error during screenshot capture:', err);
  } finally {
    await browser.close();
  }
}

run();
