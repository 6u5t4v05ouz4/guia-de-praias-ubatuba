/**
 * Gera os ícones do PWA (PNG) sem nenhuma dependência externa,
 * usando apenas `zlib` do Node para comprimir os pixels.
 *
 * Uso: npm run icons
 */
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, '..', 'public', 'icons');

/* -------------------------------------------------------------------------- */
/* Codificador PNG                                                            */
/* -------------------------------------------------------------------------- */

function crc32(buf) {
  let c;
  const table = crc32.table ?? (crc32.table = buildCrcTable());
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = (crc ^ buf[i]) & 0xff;
    crc = (crc >>> 8) ^ table[c];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function buildCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

/** @param {Uint8Array} rgba pixels RGBA */
function encodePng(rgba, width, height) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    Buffer.from(rgba.buffer, rgba.byteOffset + y * stride, stride).copy(
      raw,
      y * (stride + 1) + 1
    );
  }

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* -------------------------------------------------------------------------- */
/* Canvas minimalista                                                        */
/* -------------------------------------------------------------------------- */

const hex = (h) => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];

const mix = (a, b, t) => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

class Canvas {
  constructor(size) {
    this.size = size;
    this.data = new Uint8Array(size * size * 4);
  }

  blend(x, y, color, alpha = 1) {
    if (alpha <= 0 || x < 0 || y < 0 || x >= this.size || y >= this.size) return;
    const i = (y * this.size + x) * 4;
    const a = Math.min(1, alpha);
    const dstA = this.data[i + 3] / 255;
    const outA = a + dstA * (1 - a);
    if (outA === 0) return;
    for (let k = 0; k < 3; k++) {
      this.data[i + k] = Math.round(
        (color[k] * a + this.data[i + k] * dstA * (1 - a)) / outA
      );
    }
    this.data[i + 3] = Math.round(outA * 255);
  }

  /** Cobertura antisserrada de 0..1 de um pixel por um retângulo. */
  static rectCoverage(px, py, x0, y0, x1, y1) {
    const ix0 = Math.floor(x0),
      ix1 = Math.ceil(x1),
      iy0 = Math.floor(y0),
      iy1 = Math.ceil(y1);
    if (px < ix0 || px >= ix1 || py < iy0 || py >= iy1) return 0;
    const cx = Math.min(px + 1, x1) - Math.max(px, x0);
    const cy = Math.min(py + 1, y1) - Math.max(py, y0);
    return Math.max(0, Math.min(1, cx)) * Math.max(0, Math.min(1, cy));
  }

  fillRect(x0, y0, x1, y1, color, alpha = 1) {
    for (let y = Math.max(0, Math.floor(y0)); y < Math.min(this.size, Math.ceil(y1)); y++) {
      for (let x = Math.max(0, Math.floor(x0)); x < Math.min(this.size, Math.ceil(x1)); x++) {
        this.blend(x, y, color, alpha * Canvas.rectCoverage(x, y, x0, y0, x1, y1));
      }
    }
  }

  fillCircle(cx, cy, r, color, alpha = 1) {
    for (let y = Math.max(0, Math.floor(cy - r - 1)); y <= Math.min(this.size - 1, Math.ceil(cy + r + 1)); y++) {
      for (let x = Math.max(0, Math.floor(cx - r - 1)); x <= Math.min(this.size - 1, Math.ceil(cx + r + 1)); x++) {
        const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
        const cov = Math.max(0, Math.min(1, r + 0.5 - d));
        if (cov > 0) this.blend(x, y, color, alpha * cov);
      }
    }
  }

  /** Preenche a região abaixo de y = f(x). */
  fillBelow(f, color, alpha = 1, feather = 1.2) {
    for (let x = 0; x < this.size; x++) {
      const top = f(x + 0.5);
      for (let y = Math.max(0, Math.floor(top - feather)); y < this.size; y++) {
        const cov = Math.max(0, Math.min(1, y + 0.5 - (top - feather / 2))) * Math.min(1, feather);
        this.blend(x, y, color, alpha * Math.min(1, cov));
      }
    }
  }

  strokeBelow(f, thickness, color, alpha = 1) {
    for (let x = 0; x < this.size; x++) {
      const top = f(x + 0.5);
      for (let y = Math.max(0, Math.floor(top - thickness)); y < Math.min(this.size, Math.ceil(top + thickness)); y++) {
        const d = Math.abs(y + 0.5 - top);
        const cov = Math.max(0, Math.min(1, thickness + 0.5 - d));
        if (cov > 0) this.blend(x, y, color, alpha * cov);
      }
    }
  }

  /** Cápsula orientada (surfboard). */
  capsule(cx, cy, halfLen, halfWidth, angle, color, alpha = 1) {
    const ca = Math.cos(-angle),
      sa = Math.sin(-angle);
    const reach = halfLen + halfWidth + 2;
    for (let y = Math.max(0, Math.floor(cy - reach)); y <= Math.min(this.size - 1, Math.ceil(cy + reach)); y++) {
      for (let x = Math.max(0, Math.floor(cx - reach)); x <= Math.min(this.size - 1, Math.ceil(cx + reach)); x++) {
        const dx = x + 0.5 - cx,
          dy = y + 0.5 - cy;
        const u = dx * ca - dy * sa;
        const v = dx * sa + dy * ca;
        // Retângulo com cantos arredondados.
        const rx = halfLen - halfWidth;
        const qx = Math.max(Math.abs(u) - rx, 0);
        const qy = Math.max(Math.abs(v) - halfWidth, 0);
        const d = Math.hypot(qx, qy);
        const cov = Math.max(0, Math.min(1, halfWidth + 0.5 - d));
        if (cov > 0) this.blend(x, y, color, alpha * cov);
      }
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Arte do ícone                                                              */
/* -------------------------------------------------------------------------- */

const SKY_TOP = hex('#8fe3f7');
const SKY_MID = hex('#1b8ec9');
const SEA_DEEP = hex('#0b5c92');
const SAND = hex('#f3ddb6');
const SAND_DARK = hex('#e2c48d');
const SUN = hex('#ffd166');
const FOAM = hex('#ffffff');
const BOARD = hex('#ef6f53');
const BOARD_STRIPE = hex('#fff4ec');
const INK = hex('#0b3c5d');

function drawIcon(size, { scale = 1, bleed = false } = {}) {
  const c = new Canvas(size);
  const S = size;
  // Conteúdo desenhado num quadrado central de `scale` (safe zone p/ maskable).
  const off = (S * (1 - scale)) / 2;
  const u = (v) => off + v * S * scale; // coordenada normalizada -> pixels
  const r = (v) => v * S * scale; // comprimento normalizado -> pixels

  // Céu
  for (let y = 0; y < S; y++) {
    const t = y / S;
    const col = t < 0.5 ? mix(SKY_TOP, SKY_MID, t / 0.5) : mix(SKY_MID, SEA_DEEP, (t - 0.5) / 0.4);
    c.fillRect(0, y, S, y + 1, col);
  }

  // Sol com halo (gradiente suave em várias camadas)
  const haloSteps = 14;
  for (let i = haloSteps; i >= 1; i--) {
    const t = i / haloSteps;
    c.fillCircle(u(0.755), u(0.215), r(0.088 + 0.155 * t), SUN, 0.1 * (1 - t) + 0.02);
  }
  c.fillCircle(u(0.755), u(0.215), r(0.088), SUN, 1);

  // Faixa de areia no horizonte
  c.fillBelow(
    (x) => u(0.665) + Math.sin((x / S) * Math.PI * 3 + 0.6) * r(0.005),
    SAND_DARK,
    1,
    1.4
  );
  c.fillBelow(
    (x) => u(0.681) + Math.sin((x / S) * Math.PI * 4 + 1.4) * r(0.004),
    SAND,
    1,
    1.4
  );

  // Mar: superfície em duas ondas
  const waveTop = (x) =>
    u(0.6) +
    Math.sin((x / S) * Math.PI * 2.1 + 0.4) * r(0.028) +
    Math.sin((x / S) * Math.PI * 5.3 + 1.1) * r(0.009);
  c.fillBelow(waveTop, SEA_DEEP, 1, 1.5);
  c.strokeBelow(waveTop, r(0.012), FOAM, 0.95);

  const waveTop2 = (x) =>
    u(0.79) +
    Math.sin((x / S) * Math.PI * 1.7 + 2.2) * r(0.022) +
    Math.sin((x / S) * Math.PI * 4.1) * r(0.008);
  c.fillBelow(waveTop2, mix(SEA_DEEP, INK, 0.28), 0.85, 1.5);
  c.strokeBelow(waveTop2, r(0.01), FOAM, 0.8);

  // Espuma na base
  c.fillBelow((x) => u(0.915) + Math.sin((x / S) * Math.PI * 6) * r(0.006), FOAM, 0.92, 1.5);

  // Surfboard inclinada
  c.capsule(u(0.4), u(0.47), r(0.3), r(0.062), -0.62, mix(INK, [0, 0, 0], 0.25), 0.18);
  c.capsule(u(0.4), u(0.47), r(0.3), r(0.055), -0.62, BOARD, 1);
  c.capsule(u(0.4), u(0.47), r(0.24), r(0.012), -0.62, BOARD_STRIPE, 0.95);

  if (!bleed) {
    // Cantos arredondados (ícone não-maskable)
    roundCorners(c, S, r(0.2));
  }
  return c;
}

function roundCorners(c, S, radius) {
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const cx = Math.min(x + 0.5, S - x - 0.5);
      const cy = Math.min(y + 0.5, S - y - 0.5);
      if (cx < radius && cy < radius) {
        const d = Math.hypot(radius - cx, radius - cy);
        const outside = Math.max(0, d - radius);
        if (outside > 0) {
          const i = (y * S + x) * 4 + 3;
          c.data[i] = Math.max(0, c.data[i] - outside);
        }
      }
    }
  }
}

/* -------------------------------------------------------------------------- */

function write(name, canvas) {
  const png = encodePng(canvas.data, canvas.size, canvas.size);
  writeFileSync(resolve(OUT_DIR, name), png);
  console.log(`  ✓ ${name} (${canvas.size}x${canvas.size}, ${(png.length / 1024).toFixed(1)} kB)`);
}

mkdirSync(OUT_DIR, { recursive: true });
console.log('Gerando ícones do PWA…');

write('pwa-192x192.png', drawIcon(192));
write('pwa-512x512.png', drawIcon(512));
write('apple-touch-icon.png', drawIcon(180));
write('pwa-maskable-512x512.png', drawIcon(512, { scale: 0.72, bleed: true }));
write('favicon-64x64.png', drawIcon(64));

console.log('Pronto!');
