// ─────────────────────────────────────────────────────────────────────────────
//  Fridos AI — Development Web Server  v2.0
//  Serves:  ./public/   →   http://localhost:3000
//  Usage:   npm start
// ─────────────────────────────────────────────────────────────────────────────

const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT   = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, 'public'); // ← webroot

// ── ANSI colors ──────────────────────────────────────────────────────────────
const C = {
  reset: '\x1b[0m', dim: '\x1b[2m', bold: '\x1b[1m',
  green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m',
  cyan:  '\x1b[36m', white: '\x1b[37m', blue: '\x1b[34m',
};

// ── MIME types ────────────────────────────────────────────────────────────────
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
};

// ── Request logger ────────────────────────────────────────────────────────────
function log(status, method, url, ms) {
  const time  = new Date().toLocaleTimeString('fr-FR');
  const color = status >= 500 ? C.red : status >= 400 ? C.yellow : C.green;
  const s     = `${color}${C.bold}${status}${C.reset}`;
  const t     = `${C.dim}${ms}ms${C.reset}`;
  const u     = `${C.white}${url.padEnd(45)}${C.reset}`;
  console.log(`  ${C.dim}${time}${C.reset}  ${s}  ${method.padEnd(4)}  ${u} ${t}`);
}

// ── HTTP Server ───────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  const t0  = Date.now();
  let   url = req.url.split('?')[0].split('#')[0];
  if (url === '/' || url === '') url = '/index.html';

  const filePath = path.normalize(path.join(PUBLIC, url));

  // Security: block path traversal
  if (!filePath.startsWith(PUBLIC)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    log(403, req.method, url, Date.now() - t0);
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>404</title></head><body style="font-family:sans-serif;text-align:center;padding:80px"><h1 style="font-size:64px;color:#ccc">404</h1><p>Page introuvable</p><a href="/">← Accueil</a></body></html>`);
      log(404, req.method, url, Date.now() - t0);
      return;
    }

    const ext  = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type':  mime,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
    stream.on('close', () => log(200, req.method, url, Date.now() - t0));
    stream.on('error', () => log(500, req.method, url, Date.now() - t0));
  });
});

// ── Startup ───────────────────────────────────────────────────────────────────
server.listen(PORT, '0.0.0.0', () => {
  const tree = [
    '  public/',
    '  ├── index.html',
    '  ├── privacy.html',
    '  ├── terms.html',
    '  ├── delete-account.html',
    '  ├── css/  (tokens · base · components · sections · animations · responsive · legal)',
    '  ├── js/   (main · translations)',
    '  └── assets/  (icons/ · images/)',
  ];
  console.log('');
  console.log(`  ${C.bold}${C.green}🥗  Fridos AI — Website  v2.0${C.reset}`);
  console.log(`  ${'─'.repeat(55)}`);
  console.log(`  ${C.cyan}🌐  Local   →  http://localhost:${PORT}${C.reset}`);
  console.log(`  ${C.dim}📂  Webroot →  ${PUBLIC}${C.reset}`);
  console.log(`  ${'─'.repeat(55)}`);
  tree.forEach(l => console.log(`  ${C.dim}${l}${C.reset}`));
  console.log(`  ${'─'.repeat(55)}`);
  console.log(`  ${C.dim}Heure       Statut  Méth  Route                                         Durée${C.reset}`);
  console.log(`  ${'─'.repeat(55)}`);
  console.log('');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n  ${C.red}❌  Port ${PORT} déjà utilisé.${C.reset}`);
    console.error(`  ${C.yellow}👉  Essayez: PORT=${Number(PORT)+1} npm start${C.reset}\n`);
  } else {
    console.error(`\n  ${C.red}❌  Erreur:${C.reset}`, err.message, '\n');
  }
  process.exit(1);
});
