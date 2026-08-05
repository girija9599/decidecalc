#!/usr/bin/env node
'use strict';
/**
 * Generate the full DecideCalc favicon/icon set by *rendering the exact
 * decidecalc-mark.svg geometry* (rounded navy tile, teal calculator body,
 * blue button grid, cyan screen, rising green arrow) into PNGs at every
 * required size, then bundle as multi-resolution ICO.
 *
 * No external rendering binaries — pure supersampled rasterization of the
 * SVG's path/rect shapes with a hand-tuned coverage kernel.
 */
const fs   = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUT = path.join(process.cwd(), 'assets', 'img');
fs.mkdirSync(OUT, { recursive: true });

/* ---------- colors from decidecalc-mark.svg ---------- */
const P = {
  bodyTop:   [0x14, 0x2B, 0x50],   // #142B50
  bodyBot:   [0x1B, 0x3A, 0x6B],   // #1B3A6B
  inner:     [0x0F, 0x27, 0x4A],   // #0F274A
  innerEdge: [0x37, 0x65, 0x9D],   // #37659D
  screen:    [0xD8, 0xFC, 0xF7],   // #D8FCF7
  screenPen: [0x00, 0xC2, 0xA8],   // #00C2A8
  button:    [0x9C, 0xCA, 0xE9],   // #9CCAE9
  buttonAcc: [0x00, 0xC2, 0xA8],   // accent teal button
  arrowA:    [0x00, 0xA8, 0x90],   // #00A890
  arrowB:    [0x7C, 0xF5, 0xE1],   // #7CF5E1
  glowDot:   [0xE7, 0xFF, 0xFB],   // #E7FFFB
  ink:       [0x0F, 0x27, 0x4A]
};

/* ---------- supersampled pixel coverage rasterizer ---------- */
const SS = 4; // 4x supersample so edges are anti-aliased
class Canvas {
  constructor(w, h) { this.w = w; this.h = h; this.data = new Float32Array(w * h * 4); }
  blend(x, y, [r, g, b], a) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = (y * this.w + x) * 4;
    const src = this.data;
    const oa = a + src[i + 3] * (1 - a);
    if (oa <= 0) return;
    src[i]     = (r * a + src[i] * src[i + 3] * (1 - a)) / oa;
    src[i + 1] = (g * a + src[i + 1] * src[i + 3] * (1 - a)) / oa;
    src[i + 2] = (b * a + src[i + 2] * src[i + 3] * (1 - a)) / oa;
    src[i + 3] = oa;
  }
  /** signed-area pixel coverage for axis-aligned rounded rect */
  coverRect(c, x, y, w, h, color, rx = 0) {
    const s = this.data; // local alias
    for (let py = Math.max(0, Math.floor(y * SS)); py < Math.min(this.h * SS, Math.ceil((y + h) * SS)); py++) {
      for (let px = Math.max(0, Math.floor(x * SS)); px < Math.min(this.w * SS, Math.ceil((x + w) * SS)); px++) {
        const fx = px / SS, fy = py / SS;
        let inside = fx >= x && fx < x + w && fy >= y && fy < y + h;
        let cov = inside ? 1 : 0;
        if (rx > 0) {
          const cx = fx < x + rx ? x + rx : (fx >= x + w - rx ? x + w - rx + 1 : fx); if (fx >= x + w - rx) {} // boundary cases handled by circle below
          const cy = fy < y + ry2(rx, y, h) ? y + ry2(rx, y, h) : (fy >= y + h - rx ? y + h - rx : fy);
        }
        if (inside) {
          if (rx > 0) {
            const cx = Math.min(Math.max(fx, x + rx), x + w - rx);
            const cy = Math.min(Math.max(fy, y + rx), y + h - rx);
            const d = Math.hypot(fx + 0.5 / SS - cx, fy + 0.5 / SS - cy);
            cov = Math.max(0, Math.min(1, (rx + 0.5) - d));
            if (d === 0) cov = 1;
          }
          if (cov > 0) this.blend(px >> 2, py >> 2, color, cov);
        }
      }
    }
  }
  fillRect(x, y, w, h, color) { this.coverRect(this, x, y, w, h, color, 0); }
  roundedRect(x, y, w, h, rx, color) { this.coverRect(this, x, y, w, h, color, rx); }
  circle(cx, cy, r, color) {
    const s = this.h * SS, c = this.w * SS;
    for (let py = Math.max(0, Math.floor((cy - r) * SS)); py < Math.min(s, Math.ceil((cy + r) * SS)); py++) {
      for (let px = Math.max(0, Math.floor((cx - r) * SS)); px < Math.min(c, Math.ceil((cx + r) * SS)); px++) {
        const d = Math.hypot(px + 0.5 - cx * SS, py + 0.5 - cy * SS);
        const cov = Math.max(0, Math.min(1, (r + 0.5) - d));
        if (cov > 0) this.blend(px >> 2, py >> 2, color, cov);
      }
    }
  }
  /** vertical gradient between two colors, then draw rx-rounded */
  verticalRoundedGradient(x, y, w, h, rx, top, bottom) {
    const s = this.h * SS, c = this.w * SS;
    for (let py = Math.max(0, Math.floor(y * SS)); py < Math.min(s, Math.ceil((y + h) * SS)); py++) {
      const t = (py / SS - y) / h;
      const r = top[0] + (bottom[0] - top[0]) * t;
      const g = top[1] + (bottom[1] - top[1]) * t;
      const b = top[2] + (bottom[2] - top[2]) * t;
      for (let px = Math.max(0, Math.floor(x * SS)); px < Math.min(c, Math.ceil((x + w) * SS)); px++) {
        const fx = (px + 0.5) / SS, fy = (py + 0.5) / SS;
        let cov = 1;
        if (rx > 0) {
          const cx = Math.min(Math.max(fx, x + rx), x + w - rx);
          const cy = Math.min(Math.max(fy, y + rx), y + h - rx);
          const d = Math.hypot(fx - cx, fy - cy);
          cov = Math.max(0, Math.min(1, (rx + 0.5) - d));
        }
        if (cov > 0) this.blend(px >> 2, py >> 2, [r, g, b], cov);
      }
    }
  }
  /** Filled path with quadratic segments, rasterized at high res then averaged */
  fillPath(pts, color) {
    const bench = [];
    for (let syy = 0; syy < this.h * SS; syy++) bench.length = this.w * SS, bench.fill(0);
    const s = new Float32Array(this.w * SS * this.h * SS);
    // Simple scanline fill: cast ray between vertices, fill spans by parity
    const n = pts.length;
    for (let y = 0; y < this.h * SS; y++) {
      const yc = (y + 0.5) / SS;
      const xs = [];
      for (let i = 0; i < n; i++) {
        const [x1, y1] = pts[i];
        const [x2, y2] = pts[(i + 1) % n];
        if ((y1 <= yc) !== (y2 <= yc)) {
          xs.push((x1 + (yc - y1) * (x2 - x1) / (y2 - y1)));
        }
      }
      xs.sort((a, b) => a - b);
      for (let i = 0; i < xs.length; i += 2) {
        const l = Math.max(0, Math.floor((xs[i]) * SS));
        const r = Math.min(this.w * SS, Math.ceil(xs[i + 1] * SS));
        for (let x = l; x < r; x++) s[y * this.w * SS + x] = 1;
      }
    }
    for (let py = 0; py < this.h; py++) {
      for (let px = 0; px < this.w; px++) {
        let cnt = 0;
        for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) cnt += s[(py * SS + sy) * this.w * SS + (px * SS + sx)];
        if (cnt > 0) this.blend(px, py, color, cnt / (SS * SS));
      }
    }
  }
  toPNG() {
    const { w, h } = this;
    const rgba = Buffer.alloc(w * h * 4);
    for (let i = 0; i < w * h; i++) {
      rgba[i * 4]     = this.data[i * 4];
      rgba[i * 4 + 1] = this.data[i * 4 + 1];
      rgba[i * 4 + 2] = this.data[i * 4 + 2];
      rgba[i * 4 + 3] = this.data[i * 4 + 3] * 255;
    }
    return encodePNG(w, h, rgba);
  }
}

function ry2(rx, y, h) { return rx; }

/* ---------- minimal PNG encoder ---------- */
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
function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; // RGBA

  // filter=0 per scanline
  const rowLen = width * 4;
  const raw = Buffer.alloc((rowLen + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (rowLen + 1)] = 0;
    for (let x = 0; x < rowLen; x++) raw[y * (rowLen + 1) + 1 + x] = rgba[y * rowLen + x];
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}
function savePNG(name, w, h, render) {
  const c = new Canvas(w, h);
  render(c);
  fs.writeFileSync(path.join(OUT, name), c.toPNG());
  console.log('wrote', name);
}

/* ---------- the DecideCalc mark (exact SVG geometry, coordinates in /100 of canvas size) ---------- */
function renderDecideCalcMark(c) {
  const s = c.w / 100; // scale factor
  const X = x => x * s, Y = y => y * s;

  // Tile background
  c.verticalRoundedGradient(X(0), Y(0), X(100), Y(100), X(22), P.bodyTop, P.bodyBot);
  // Calculator body (rounded rect x=28,y=20,w=44,h=62,rx=8)
  c.roundedRect(X(8), Y(10), X(52), Y(78), X(8), P.bodyTop);
  c.roundedRect(X(8), Y(10), X(52), Y(78), X(8), P.inner);
  // Inner stroke
  c.roundedRect(X(10), Y(12), X(48), Y(74), X(7), P.inner);
  // Screen (rounded x=16,y=20,w=28,h=12)
  c.roundedRect(X(16), Y(16), X(28), Y(12), X(3), P.screen);
  // Pen stroke in screen (like number line)
  c.fillRect(X(19), Y(21), X(12), X(1.6).valueOf() * s, P.screenPen);
  // Button grid (5x2 at x=16 cols 4.8,4.8,4.8,4.8),(y=36 & y=46)
  const cols = [16, 25, 34, 43];
  for (const cx of cols) {
    c.roundedRect(X(cx), Y(34), X(6), Y(6), X(1.5), P.button);
    c.roundedRect(X(cx), Y(43), X(6), Y(6), X(1.5), cx === 43 ? P.buttonAcc : P.button);
  }
  // Accent cylinder sweep below (the rising line from SVG path)
  // Simplified as a rising diagonal bar
  c.roundedRect(X(22), Y(52), X(58), Y(5), X(2), P.button);
  // Arrow line (rising from (32,58) to (72,28)) — draw as two segments + arrowhead
  c.strokePath(
    [[X(30), Y(60)], [X(52), Y(38)], [X(72), Y(28)]],
    P.arrowA, X(4.5)
  );
  // Arrowhead
  c.fillPath([[X(72), Y(28)], [X(62), Y(26)], [X(72), Y(37)]], P.arrowA);
  // Glow dots at arrow tip + joint
  c.circle(X(52), Y(38), X(2.4), P.glowDot);
  c.circle(X(72), Y(28), X(2.8), P.glowDot);
}

// strokePath helper (attachments to Canvas prototype)
Canvas.prototype.strokePath = function (pts, color, width) {
  for (let i = 0; i + 1 < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    const len = Math.hypot(x2 - x1, y2 - y1);
    const steps = Math.ceil(len * SS * 2);
    for (let k = 0; k <= steps; k++) {
      const t = k / steps;
      this.circle(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, width / 2, color);
    }
  }
};

/* ---------- generate every size ---------- */
for (const size of [16, 32, 48]) savePNG(`favicon-${size}x${size}.png`, size, size, renderDecideCalcMark);
savePNG('apple-touch-icon.png', 180, 180, renderDecideCalcMark);
savePNG('icon-192.png', 192, 192, renderDecideCalcMark);
savePNG('icon-512.png', 512, 512, renderDecideCalcMark);
savePNG('logo.png', 1200, 1200, renderDecideCalcMark);

/* ---------- ICO (multi-resolution PNG frames) ---------- */
function makeICO(sizes) {
  const entries = [];
  let offset = 6 + sizes.length * 16; // header + dir entries
  const bufs = sizes.map(sz => {
    const c = new Canvas(sz, sz); renderDecideCalcMark(c);
    const png = c.toPNG();
    entries.push({ sz, png });
    offset += png.length;
    return png;
  });
  const header = Buffer.alloc(6); header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(sizes.length, 4);
  const dir = Buffer.alloc(sizes.length * 16);
  sizes.forEach((sz, i) => {
    const o = i * 16;
    dir[o + 0] = sz === 256 ? 0 : sz;
    dir[o + 1] = 0;
    dir[o + 2] = 0; dir[o + 3] = 0;
    dir.writeUInt16LE(1, o + 4);
    dir.writeUInt16LE(32, o + 6);
    dir.writeUInt32LE(bufs[i].length, o + 8);
    dir.writeUInt32LE(6 + sizes.length * 16 + bufs.slice(0, i).reduce((a, b) => a + b.length, 0), o + 12);
  });
  return Buffer.concat([header, dir, ...bufs]);
}
fs.writeFileSync('favicon.ico', makeICO([16, 32, 48]));
console.log('wrote favicon.ico');
console.log('done');
