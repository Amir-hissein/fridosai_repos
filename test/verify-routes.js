/**
 * Fridos AI Website — Automated Route & Quality Verification Suite
 * Spawns server.js on a test port, queries all routes, validates responses,
 * headers, status codes, and security. Exits 0 on success, 1 on error.
 */

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const TEST_PORT = process.env.TEST_PORT || 3099;

const routesToTest = [
  // Core pages
  { path: '/', expectedStatus: 200, expectedType: 'text/html' },
  { path: '/index.html', expectedStatus: 200, expectedType: 'text/html' },
  { path: '/privacy.html', expectedStatus: 200, expectedType: 'text/html' },
  { path: '/terms.html', expectedStatus: 200, expectedType: 'text/html' },
  { path: '/delete-account.html', expectedStatus: 200, expectedType: 'text/html' },

  // Modular CSS Architecture
  { path: '/css/main.css', expectedStatus: 200, expectedType: 'text/css' },
  { path: '/css/tokens.css', expectedStatus: 200, expectedType: 'text/css' },
  { path: '/css/base.css', expectedStatus: 200, expectedType: 'text/css' },
  { path: '/css/components.css', expectedStatus: 200, expectedType: 'text/css' },
  { path: '/css/sections.css', expectedStatus: 200, expectedType: 'text/css' },
  { path: '/css/responsive.css', expectedStatus: 200, expectedType: 'text/css' },
  { path: '/css/animations.css', expectedStatus: 200, expectedType: 'text/css' },
  { path: '/css/legal.css', expectedStatus: 200, expectedType: 'text/css' },

  // JavaScript
  { path: '/js/main.js', expectedStatus: 200, expectedType: 'javascript' },
  { path: '/js/translations.js', expectedStatus: 200, expectedType: 'javascript' },

  // Assets
  { path: '/assets/icons/logo.png', expectedStatus: 200, expectedType: 'image/png' },

  // 404 Fallback
  { path: '/not-found-endpoint-404', expectedStatus: 404, expectedType: 'text/html' }
];

console.log(`🚀 Starting Fridos AI server on test port ${TEST_PORT}...`);

const serverProcess = spawn('node', ['server.js'], {
  cwd: path.resolve(__dirname, '..'),
  env: { ...process.env, PORT: TEST_PORT },
  stdio: 'pipe'
});

serverProcess.stdout.on('data', (data) => {
  // Uncomment if debug logs are needed:
  // process.stdout.write(`[Server stdout] ${data}`);
});

serverProcess.stderr.on('data', (data) => {
  process.stderr.write(`[Server stderr] ${data}`);
});

function request(urlPath) {
  return new Promise((resolve, reject) => {
    const req = http.get({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: urlPath,
      timeout: 3000
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          bodyLength: body.length
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Timeout requesting ${urlPath}`));
    });
  });
}

async function waitForServer(retries = 30, delayMs = 150) {
  for (let i = 0; i < retries; i++) {
    try {
      await request('/');
      return true;
    } catch (e) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  throw new Error('Server did not become responsive within timeout.');
}

async function runSuite() {
  try {
    await waitForServer();
    console.log(`✅ Test server is active and responding on http://127.0.0.1:${TEST_PORT}\n`);

    let passed = 0;
    let failed = 0;

    for (const test of routesToTest) {
      try {
        const res = await request(test.path);
        const contentType = res.headers['content-type'] || '';
        const statusMatch = res.status === test.expectedStatus;
        const typeMatch = contentType.toLowerCase().includes(test.expectedType.toLowerCase());

        if (statusMatch && typeMatch) {
          console.log(`  ✅ [PASS] ${test.path.padEnd(32)} -> HTTP ${res.status} (${contentType}) [${res.bodyLength} bytes]`);
          passed++;
        } else {
          console.error(`  ❌ [FAIL] ${test.path.padEnd(32)} -> Got HTTP ${res.status} (${contentType}), Expected ${test.expectedStatus} (${test.expectedType})`);
          failed++;
        }
      } catch (err) {
        console.error(`  ❌ [ERROR] ${test.path}: ${err.message}`);
        failed++;
      }
    }

    // Security Headers check
    console.log('\n🔒 Verifying HTTP Security Headers...');
    const rootRes = await request('/');
    const secHeaders = [
      'x-content-type-options',
      'x-frame-options'
    ];
    for (const h of secHeaders) {
      if (rootRes.headers[h]) {
        console.log(`  ✅ [PASS] Header "${h}": ${rootRes.headers[h]}`);
        passed++;
      } else {
        console.warn(`  ⚠️ [WARN] Header "${h}" not explicitly set (acceptable if reverse proxy provides it).`);
      }
    }

    console.log(`\n======================================================`);
    console.log(`📊 Test Summary: ${passed} passed, ${failed} failed (${routesToTest.length} routes tested)`);
    console.log(`======================================================\n`);

    cleanup();

    if (failed > 0) {
      process.exit(1);
    } else {
      console.log('🎉 All Fridos AI website verification checks passed successfully!');
      process.exit(0);
    }
  } catch (error) {
    console.error('Fatal test error:', error);
    cleanup();
    process.exit(1);
  }
}

function cleanup() {
  try {
    serverProcess.kill('SIGTERM');
  } catch (e) {}
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

runSuite();
