#!/usr/bin/env node
/* DecideCalc — deterministic favicon generator (no external binaries).
   Renders the DecideCalc brand mark ("D" on a rounded brand-color square)
   as PNGs at multiple sizes and a multi-resolution ICO. Pure JS PNG encoder
   + CRC; ICO container shims PNGs per size. Output is antialiased via
   simple supersampling (render at 4x then box-average down).

   Outputs:
     assets/img/favicon-16x16.png
     assets/img/favicon-32x32.png
     assets/img/favicon-48x48.png
     assets/img/apple-touch-icon.png   (180x180, opaque bg)
     assets/img/icon-192.png
     assets/img/icon-512.png
     assets/img/logo.png               (1200x1200 transparent — Rich Results logo)
     favicon.ico                        (multi-res 16/32/48)
     assets/img/decidecalc-favicon.svg  (single SVG favicon source)
*/
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'assets', 'img');

/* Brand: dark navy rounded square, accent-blue "D"
   Tuned to match assets/img/decidecalc-mark.svg visually. */
const BG_BASE = [15, 21, 51];     // #0F1533 navy
const BG_TOP = [27, 58, 107];     // #1B3A6B (used for gradient hint)
const ACCENT = [0, 194, 168];    // #00C2A8 teal accent (matches calculator favicons)
const ACCENT2 = [59, 130, 246];  // #3B82F6 alt accent

const join = p => path.join(OUT, p);
const mkdirOut = () => fs.mkdirSync(OUT, { recursive: true });

/* ---------- minimal PNG encoder (RGBA, 8-bit, no filters) ---------- */
function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xEDB88320 & -(c & 1));
  }
  return (~c) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const body = Buffer.concat([t, data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}
// Encode RGBA pixels -> PNG bytes
function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // color type RGBA
  ihdr[10] = 0;  // compression
  ihdr[11] = 0;  // filter
  ihdr[12] = 0;  // interlace
  // raw: per scanline filter byte 0 + RGBA row
  const row = width * 4;
  const raw = Buffer.alloc((row + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (row + 1)] = 0;
    rgba.copy(raw, y * (row + 1) + 1, y * row, y * row + row);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ---------- renderer ---------- */
// Alpha-blend src onto dst (RGBA), back-to-front
function blend(dst, di, src, si, alpha) {
  const a = (src[si + 3] / 255) * alpha;
  const ia = 1 - a;
  dst[di]     = Math.round(src[si]     * a + dst[di]     * ia);
  dst[di + 1] = Math.round(src[si + 1] * a + dst[di + 1] * ia);
  dst[di + 2] = Math.round(src[si + 2] * a + dst[di + 2] * ia);
  dst[di + 3] = Math.min(255, Math.round(src[si + 3] * a + dst[di + 3] * ia));
}
function setPx(buf, w, x, y, r, g, b, a) {
  const i = (y * w + x) * 4;
  buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = a;
}
// distance to rounded-rect corner influences bg anti-alias
function inRoundedRect(x, y, w, h, r) {
  // returns 0..1 coverage
  const rx = Math.min(r, w / 2), ry = Math.min(r, h / 2);
  if (x < rx && y < ry) {
    const dx = rx - x, dy = ry - y; const d = Math.hypot(dx, dy);
    return d > rx + 0.5 ? 0 : d < rx - 0.5 ? 1 : rx + 0.5 - d;
  }
  if (x > w - 1 - rx && y < ry) {
    const dx = x - (w - 1 - rx), dy = ry - y; const d = Math.hypot(dx, dy);
    return d > rx + 0.5 ? 0 : d < rx - 0.5 ? 1 : rx + 0.5 - d;
  }
  if (x < rx && y > h - 1 - ry) {
    const dx = rx - x, dy = y - (h - 1 - ry); const d = Math.hypot(dx, dy);
    return d > rx + 0.5 ? 0 : d < rx - 0.5 ? 1 : rx + 0.5 - d;
  }
  if (x > w - 1 - rx && y > h - 1 - ry) {
    const dx = x - (w - 1 - rx), dy = y - (h - 1 - ry); const d = Math.hypot(dx, dy);
    return d > rx + 0.5 ? 0 : d < rx - 0.5 ? 1 : rx + 0.5 - d;
  }
  return 1;
}

// SDF-ish "D" letter obstacle: returns true if a normalized (0..1) u,v point
// is inside a bold uppercase D glyph occupying the inner safe-area.
function insideD(u, v) {
  // Safe area: u 0.18..0.78, v 0.14..0.86 (canvas y-down)
  if (u < 0.18 || u > 0.78 || v < 0.14 || v > 0.86) return false;
  // backstroke: u in [0.18,0.34]
  if (u <= 0.34) return true;
  // curve starts at u=0.34, builds bowl to the right down to u=0.78
  // Use outer+inner ellipse to make thickness consistent.
  const cu = (0.34 + 0.78) / 2; // 0.56
  const aOuter = (0.78 - 0.34) / 2; // 0.22
  const cvTop = 0.32, cvBot = 0.68;
  // outer ellipse center u=cu, vertical middle 0.5
  const outerV = ((u - cu) / aOuter) ** 2 + ((v - 0.5) / 0.36) ** 2 <= 1.06;
  const innerV = ((u - cu) / aOuter) ** 2 + ((v - 0.5) / 0.36) ** 2 >= 0.62;
  // only valid for u > 0.34
  return outerV && innerV && v >= cvTop - 0.02 && v <= cvBot + 0.02;
}

// render at high res (4x supersample target) and return RGBA buffer for the requested size
function render(size, opts) {
  const opaque = !!(opts && opts.opaque);
  const accent = (opts && opts.accent) || ACCENT;
  const bg = (opts && opts.bg) || BG_BASE;
  const top = (opts && opts.top) || BG_TOP; // gradient hint
  const SS = size <= 64 ? 4 : size <= 256 ? 2 : 1;
  const H = size * SS;
  const buf = Buffer.alloc(H * H * 4);
  const radius = H * 0.22;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < H; x++) {
      const cov = inRoundedRect(x, y, H, H, radius);
      const u = x / H, v = y / H;
      // gradient bg top->bot
      const t = v;
      const bR = Math.round(bg[0] * (1 - t) + top[0] * t * 0.55 + bg[0] * 0.45);
      const bG = Math.round(bg[1] * (1 - t) + top[1] * t * 0.55 + bg[1] * 0.45);
      const bB = Math.round(bg[2] * (1 - t) + top[2] * t * 0.55 + bg[2] * 0.45);
      const inside = insideD(u, v);
      let r, g, b, a;
      if (cov > 0) {
        if (inside) {
          r = accent[0]; g = accent[1]; b = accent[2]; a = 255 * cov;
        } else {
          r = bR; g = bG; b = bB; a = 255 * cov;
        }
        if (opaque) a = 255;
      } else { r = 0; g = 0; b = 0; a = opaque ? 255 : 0; }
      const i = (y * H + x) * 4;
      buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = a;
    }
  }
  if (SS === 1) return { size, rgba: buf };
  // box-average down to size
  const out = Buffer.alloc(size * size * 4);
  for (let oy = 0; oy < size; oy++) {
    for (let ox = 0; ox < size; ox++) {
      let r = 0, g = 0, b = 0, a = 0, n = 0;
      for (let dy = 0; dy < SS; dy++) {
        for (let dx = 0; dx < SS; dx++) {
          const sx = ox * SS + dx, sy = oy * SS + dy;
          const i = (sy * H + sx) * 4;
          r += buf[i] * buf[i + 3]; g += buf[i + 1] * buf[i + 3]; b += buf[i + 2] * buf[i + 3]; a += buf[i + 3]; n++;
        }
      }
      const o = (oy * size + ox) * 4;
      const aa = a / n;
      out[o] = aa ? Math.round(r / aa) : 0;
      out[o + 1] = aa ? Math.round(g / aa) : 0;
      out[o + 2] = aa ? Math.round(b / aa) : 0;
      out[o + 3] = opaque ? 255 : Math.round(aa);
    }
  }
  return { size, rgba: out };
}

function png(size, opts) {
  const { rgba } = render(size, opts);
  return encodePNG(size, size, rgba);
}

/* ---------- ICO writer (multi-res PNG entries) ---------- */
// ICO with PNG-encoded images inside (works on modern browsers).
function ico(entries) {
  // entries: [{size, png:Buffer}]
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type ICO
  header.writeUInt16LE(entries.length, 4);
  const dir = Buffer.alloc(entries.length * 16);
  let dirOff = 6 + entries.length * 16;
  const parts = [];
  entries.forEach((e, i) => {
    dir[i * 16 + 0] = e.size >= 256 ? 0 : e.size & 255;
    dir[i * 16 + 1] = e.size >= 256 ? 0 : e.size & 255;
    dir[i * 16 + 2] = 0; dir[i * 16 + 3] = 0; // palette/reserved
    dir.writeUInt16LE(1, i * 16 + 4); // planes
    dir.writeUInt16LE(32, i * 16 + 6); // bpp
    dir.writeUInt32LE(e.png.length, i * 16 + 8);
    dir.writeUInt32LE(dirOff, i * 16 + 12);
    parts.push(e.png);
    dirOff += e.png.length;
  });
  return Buffer.concat([header, dir, ...parts]);
}

/* ---------- SVG favicon (single source for rel="icon" svg) ---------- */
const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-label="DecideCalc">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1B3A6B"/>
      <stop offset="1" stop-color="#0F1533"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="22" fill="url(#bg)"/>
  <path d="M34 22 L34 78 L52 78 C70 78 76 66 76 50 C76 34 70 22 52 22 Z M44 32 L54 32 C64 32 66 40 66 50 C66 60 64 68 54 68 L44 68 Z"
        fill="#00C2A8"/>
</svg>`;

/* ---------- generate ---------- */
function run() {
  mkdirOut();
  const writes = [
    { p: join('favicon-16x16.png'), b: png(16, { opaque: true }) },
    { p: join('favicon-32x32.png'), b: png(32, { opaque: true }) },
    { p: join('favicon-48x48.png'), b: png(48, { opaque: true }) },
    { p: join('apple-touch-icon.png'), b: png(180, { opaque: true, accent: ACCENT, bg: BG_BASE, top: BG_TOP }) },
    { p: join('icon-192.png'), b: png(192, { opaque: false }) },
    { p: join('icon-512.png'), b: png(512, { opaque: false }) },
    { p: join('logo.png'), b: png(1200, { opaque: false }) },
    { p: join('decidecalc-favicon.svg'), b: Buffer.from(SVG, 'utf8') },
    { p: path.join(ROOT, 'favicon.ico'), b: ico([
      { size: 16, png: png(16, { opaque: true }) },
      { size: 32, png: png(32, { opaque: true }) },
      { size: 48, png: png(48, { opaque: true }) },
    ]) },
  ];
  for (const w of writes) fs.writeFileSync(w.p, w.b);
  console.log('Wrote', writes.length, 'favicon assets.');
}
run();
