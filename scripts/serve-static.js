'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT || process.argv[2] || 8101);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  if (urlPath.length > 1 && urlPath.endsWith('/')) urlPath = urlPath.slice(0, -1);
  let file = path.join(ROOT, urlPath);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end('forbidden'); return; }

  const tryPaths = [];
  if (urlPath === '/' || urlPath === '') tryPaths.push(path.join(ROOT, 'index.html'));
  tryPaths.push(file);
  tryPaths.push(file + '.html');
  tryPaths.push(path.join(file, 'index.html'));

  let found = null;
  for (const p of tryPaths) {
    try { if (fs.statSync(p).isFile()) { found = p; break; } } catch (e) { /* keep looking */ }
  }
  if (!found) {
    const nf = path.join(ROOT, '404.html');
    res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
    res.end(fs.existsSync(nf) ? fs.readFileSync(nf) : 'not found');
    return;
  }
  const ext = path.extname(found).toLowerCase();
  res.writeHead(200, { 'content-type': MIME[ext] || 'application/octet-stream' });
  fs.createReadStream(found).pipe(res);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('serving ' + ROOT + ' on http://127.0.0.1:' + PORT);
});
