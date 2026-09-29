import type { Beach, CetesbStatus, TrailDifficulty } from '@/types';

/**
 * Artes procedurais (SVG) para capas e galerias.
 *
 * Por que isso existe: o app precisa ser bonito e 100% funcional na primeira
 * visita, mesmo sem rede e sem um banco de fotos no repositório. Em vez de
 * carregar dezenas de MB de fotos no bundle, cada praia recebe uma arte
 * determinística derivada do seu id — mesma praia, mesma arte, em qualquer
 * dispositivo.
 *
 * Quando existir uma foto real (`coverImage` preenchida), ela tem precedência:
 * o componente <BeachImage> tenta a URL antes de recorrer a esta arte.
 */

/* --------------------------- Paletas por bioma ---------------------------- */

interface Palette {
  sky: [string, string];
  sea: [string, string];
  sand: string;
  accent: string;
}

const PALETTES: Palette[] = [
  { sky: ['#8fe3f7', '#1b8ec9'], sea: ['#0b5c92', '#0b3c5d'], sand: '#f3ddb6', accent: '#ffd166' },
  { sky: ['#b6ecf5', '#3aa6d8'], sea: ['#0d6fa5', '#083a5c'], sand: '#f7e6c4', accent: '#ffc542' },
  { sky: ['#9fe0d4', '#2a9d8f'], sea: ['#0e7f88', '#0a4b52'], sand: '#f5e3c0', accent: '#ffd166' },
  { sky: ['#ffe0b8', '#f0a868'], sea: ['#1b8ec9', '#0b5c92'], sand: '#fdf0d5', accent: '#ef6f53' },
  { sky: ['#cfe4f7', '#5b8fd6'], sea: ['#0b5c92', '#06283c'], sand: '#efe0c4', accent: '#ffd166' },
  { sky: ['#ffd9c0', '#ef8a72'], sea: ['#1b8ec9', '#0b3c5d'], sand: '#fdf2dd', accent: '#ffd166' },
];

/** Hash estável (FNV-1a de 32 bits) → índice de paleta e variantes. */
function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

const pick = <T,>(list: T[], seed: number, salt = 0): T => list[(seed + salt) % list.length];

/* ------------------------------ Primitivas ------------------------------- */

/**
 * Borda superior suave e periódica — usada para a linha d'água, a espuma e as
 * ondulações. many segmentos curtos ficam mais naturais que dois cubics longos.
 */
function edgePath(
  width: number,
  y: number,
  amp: number,
  periods: number,
  phase = 0
): string {
  const steps = Math.max(24, Math.round(periods * 8));
  const step = width / steps;
  const pts: string[] = [`M0 ${(y + Math.sin(phase) * amp).toFixed(2)}`];
  for (let i = 0; i < steps; i++) {
    const x0 = i * step;
    const x1 = x0 + step;
    const y0 = y + Math.sin(phase + (i / steps) * periods * Math.PI * 2) * amp;
    const y1 = y + Math.sin(phase + ((i + 1) / steps) * periods * Math.PI * 2) * amp;
    const cx = (x0 + x1) / 2;
    pts.push(`Q ${cx.toFixed(2)} ${(y0 + y1) / 2 < y ? y0 - amp * 0.35 : y1 + amp * 0.35} ${x1.toFixed(2)} ${y1.toFixed(2)}`);
  }
  return pts.join(' ');
}

/** Faixa preenchida até o fim do quadro a partir de uma borda ondulada. */
function band(edge: string, bottom: number, width: number, fill: string, opacity = 1): string {
  return `<path d="${edge} L ${width} ${bottom} L 0 ${bottom} Z" fill="${fill}" opacity="${opacity}"/>`;
}

function foamLine(width: number, y: number, amp = 6, periods = 3.2): string {
  return `<path d="${edgePath(width, y, amp, periods, 1.1)}" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.9"/>`;
}


function palmTree(x: number, y: number, scale: number, color: string): string {
  const h = 60 * scale;
  return [
    `<g transform="translate(${x} ${y})" fill="${color}">`,
    // Tronco com leve curvatura
    `<path d="M-3 0 C -5 ${-h * 0.45} 1 ${-h * 0.72} 0 ${-h} L5 ${-h} C7 ${-h * 0.68} 2 ${-h * 0.42} 4 0 Z" opacity="0.9"/>`,
    // Cúpula
    `<path d="M1 ${-h} C -18 ${-h - 5} -30 ${-h + 1} -42 ${-h + 9} C -28 ${-h - 3} -14 ${-h - 2} 1 ${-h + 4} Z"/>`,
    `<path d="M1 ${-h} C 20 ${-h - 6} 33 ${-h + 1} 45 ${-h + 8} C 31 ${-h - 4} 16 ${-h - 2} 1 ${-h + 4} Z"/>`,
    `<path d="M1 ${-h} C -12 ${-h - 15} -10 ${-h - 24} 0 ${-h - 30} C 5 ${-h - 23} 7 ${-h - 14} 1 ${-h} Z"/>`,
    `<path d="M1 ${-h} C 12 ${-h - 12} 20 ${-h - 20} 32 ${-h - 22} C 22 ${-h - 14} 12 ${-h - 8} 1 ${-h} Z" opacity="0.9"/>`,
    '</g>',
  ].join('');
}

function surfboard(x: number, y: number, scale: number, angle: number, fill: string): string {
  return `<g transform="translate(${x} ${y}) rotate(${angle})">
    <rect x="${-6 * scale}" y="${-30 * scale}" width="${12 * scale}" height="${60 * scale}" rx="${6 * scale}" fill="${fill}"/>
    <rect x="${-1.2 * scale}" y="${-22 * scale}" width="${2.4 * scale}" height="${40 * scale}" rx="${1.2 * scale}" fill="#fff" opacity="0.75"/>
  </g>`;
}

function boat(x: number, y: number, scale: number): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <path d="M-26 0 L26 0 L18 12 L-18 12 Z" fill="#fff"/>
    <rect x="-1.5" y="-30" width="3" height="30" fill="#fff"/>
    <path d="M1 -28 L22 -4 L1 -4 Z" fill="#fff" opacity="0.85"/>
  </g>`;
}

function birds(x: number, y: number, scale: number): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})" fill="none" stroke="rgba(13,33,48,0.35)" stroke-width="2" stroke-linecap="round">
    <path d="M0 0 q6 -6 12 0 q6 -6 12 0"/>
    <path d="M28 8 q5 -5 10 0 q5 -5 10 0" opacity="0.7"/>
  </g>`;
}

function person(x: number, y: number, scale: number, color: string): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})" fill="${color}">
    <circle cx="0" cy="-11" r="3.4"/>
    <path d="M-4.5 -6.5 h9 l1.2 10 h-3.4 l-1 11 h-2.6 l-1 -11 h-3.4 Z"/>
  </g>`;
}

function toDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/* -------------------------------------------------------------------------- */

export interface BeachArtOptions {
  /** 0 = capa; 1..n = variantes da galeria. */
  variant?: number;
  width?: number;
  height?: number;
}

export function beachArtDataUrl(beach: Beach, options: BeachArtOptions = {}): string {
  const { variant = 0, width = 1200, height = 800 } = options;
  const seed = hash(`${beach.id}#${variant}`);
  const p = pick(PALETTES, seed);
  const w = width;
  const h = height;

  const sandY = h * (0.76 + ((seed >> 3) % 5) * 0.012);
  const seaTop = h * (0.5 + ((seed >> 5) % 4) * 0.02);

  const hasCliffs = beach.tags.includes('selvagem') || beach.tags.includes('trilha');
  const hasSurf = beach.tags.includes('surf');
  const hasFamily = beach.tags.includes('familia');
  const hasBoat = beach.features.hasBoatTours;
  const hasKiosks = beach.features.hasKiosks;

  const layers: string[] = [];

  layers.push(
    `<defs>
      <linearGradient id="sky${seed}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${p.sky[0]}"/><stop offset="1" stop-color="${p.sky[1]}"/>
      </linearGradient>
      <linearGradient id="sea${seed}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${p.sea[0]}"/><stop offset="1" stop-color="${p.sea[1]}"/>
      </linearGradient>
      <linearGradient id="sand${seed}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${p.sand}"/><stop offset="1" stop-color="#e2c48d"/>
      </linearGradient>
      <linearGradient id="glow${seed}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${p.accent}" stop-opacity="0.30"/>
        <stop offset="1" stop-color="${p.accent}" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="veil${seed}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#06283c" stop-opacity="0"/>
        <stop offset="1" stop-color="#06283c" stop-opacity="0.42"/>
      </linearGradient>
    </defs>`
  );

  // Céu
  layers.push(`<rect width="${w}" height="${h}" fill="url(#sky${seed})"/>`);

  // Sol com halo
  const sunX = w * (0.18 + ((seed >> 2) % 5) * 0.15);
  layers.push(
    `<circle cx="${sunX}" cy="${h * 0.2}" r="${h * 0.19}" fill="${p.accent}" opacity="0.16"/>` +
      `<circle cx="${sunX}" cy="${h * 0.2}" r="${h * 0.125}" fill="${p.accent}" opacity="0.28"/>` +
      `<circle cx="${sunX}" cy="${h * 0.2}" r="${h * 0.075}" fill="${p.accent}"/>`
  );

  // Nuvens
  if (seed % 3 === 0) {
    layers.push(
      `<g fill="#fff" opacity="0.5">
        <ellipse cx="${w * 0.6}" cy="${h * 0.16}" rx="${w * 0.11}" ry="${h * 0.035}"/>
        <ellipse cx="${w * 0.66}" cy="${h * 0.14}" rx="${w * 0.07}" ry="${h * 0.028}"/>
        <ellipse cx="${w * 0.55}" cy="${h * 0.18}" rx="${w * 0.06}" ry="${h * 0.022}"/>
      </g>`
    );
  }

  layers.push(birds(w * 0.72, h * 0.26, w / 900));

  // Cabeceiras / morros da Mata Atlântica
  if (hasCliffs) {
    layers.push(
      `<g fill="#1f5e46">
        <path d="M0 ${h * 0.06} C ${w * 0.18} ${h * 0.18}, ${w * 0.28} ${h * 0.14}, ${w * 0.44} ${h * 0.4} L 0 ${h} Z" opacity="0.55"/>
        <path d="M${w} ${h * 0.02} C ${w * 0.78} ${h * 0.18}, ${w * 0.68} ${h * 0.46}, ${w * 0.58} ${h} L ${w} ${h} Z" opacity="0.45"/>
      </g>`
    );
  }

  // Mar: uma única massa d'água com borda ondulada + faixas de tonalidade
  const waterTop = edgePath(w, seaTop, h * 0.014, 1.6, seed % 3);
  layers.push(band(waterTop, sandY + 4, w, `url(#sea${seed})`));

  // Faixa mais clara perto da linha d'água
  const shallow = edgePath(w, sandY - h * 0.075, h * 0.012, 2.4, (seed >> 3) % 3);
  layers.push(band(shallow, sandY + 4, w, p.sea[0], 0.45));

  // Brilho do sol refletido na água: leque que alarga em direção à areia
  const glowTop = w * 0.018;
  const glowBottom = w * 0.075;
  layers.push(
    `<path d="M${(sunX - glowTop).toFixed(0)} ${seaTop.toFixed(0)} H${(sunX + glowTop).toFixed(0)} L${(sunX + glowBottom).toFixed(0)} ${sandY.toFixed(0)} H${(sunX - glowBottom).toFixed(0)} Z" fill="url(#glow${seed})"/>`
  );

  // Ondulações
  for (let i = 0; i < 3; i++) {
    const y = seaTop + h * (0.07 + i * 0.09);
    layers.push(
      `<path d="${edgePath(w, y, h * 0.008, 3 + i, (seed >> i) % 4)}" fill="none" stroke="#fff" stroke-width="2" opacity="${(0.3 - i * 0.07).toFixed(2)}"/>`
    );
  }

  // Espuma da rebentação
  layers.push(foamLine(w, sandY - 6, h * 0.008, 3.2));
  layers.push(
    `<path d="${edgePath(w, sandY - 1, h * 0.006, 2.6, 2.2)} L ${w} ${sandY + 16} L 0 ${sandY + 16} Z" fill="#fff" opacity="0.75"/>`
  );

  // Areia
  layers.push(`<rect y="${sandY}" width="${w}" height="${h - sandY}" fill="url(#sand${seed})"/>`);
  layers.push(
    `<path d="${edgePath(w, sandY + 2, h * 0.004, 2.2, 0.4)}" fill="none" stroke="#fff" stroke-width="2.5" opacity="0.5"/>`
  );


  // Palmeiras
  if (hasKiosks || hasFamily) {
    const n = 1 + (seed % 3);
    for (let i = 0; i < n; i++) {
      const x = w * (0.06 + ((seed >> (i * 3)) % 60) / 100);
      layers.push(palmTree(x, sandY + h * 0.16, w / 620, '#1c6b4f'));
    }
  }

  // Surf
  if (hasSurf) {
    layers.push(
      `<g transform="translate(${w * 0.58} ${seaTop + h * 0.1})">
        <path d="M0 0 q 24 -28 48 0 q -24 9 -48 0 Z" fill="#fff" opacity="0.85"/>
        <path d="M10 -4 q 18 -20 36 0" fill="none" stroke="#fff" stroke-width="2.5" opacity="0.9"/>
      </g>`
    );
    layers.push(surfboard(w * 0.52, seaTop + h * 0.085, w / 620, -34, '#ef6f53'));
    layers.push(person(w * 0.47, seaTop + h * 0.115, w / 620, 'rgba(13,33,48,0.6)'));
  }

  // Escuna
  if (hasBoat && seed % 2 === 0) {
    layers.push(boat(w * 0.28, seaTop - h * 0.03, w / 700));
  }

  // Banhistas
  if (hasFamily || beach.tags.includes('pet_friendly')) {
    const n = 2 + (seed % 3);
    for (let i = 0; i < n; i++) {
      const x = w * (0.2 + ((seed >> (i * 2)) % 55) / 100);
      const y = sandY + h * (0.09 + ((seed >> (i * 2 + 1)) % 9) / 100);
      layers.push(person(x, y, w / 520, i % 2 === 0 ? '#d9543c' : '#0b3c5d'));
    }
  }

  // Véu inferior (legibilidade do texto sobreposto)
  layers.push(`<rect y="${h * 0.62}" width="${w}" height="${h * 0.38}" fill="url(#veil${seed})"/>`);

  return toDataUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice">${layers.join('')}</svg>`
  );
}

/* ========================================================================== */
/* Emblema de balneabilidade                                                   */
/* ========================================================================== */

export function cetesbBadgeDataUrl(status: CetesbStatus, size = 44): string {
  const own = status === 'propria';
  const bg = own ? '#1f9d6b' : '#d64545';
  return toDataUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 1}" fill="${bg}"/>
      <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="${size * 0.5}" fill="#fff" font-family="system-ui, sans-serif">${own ? '✓' : '!'}</text>
    </svg>`
  );
}

/* ========================================================================== */
/* Rótulos                                                                   */
/* ========================================================================== */

export const TRAIL_LABEL: Record<TrailDifficulty, string> = {
  facil: 'Trilha fácil',
  moderada: 'Trilha moderada',
  dificil: 'Trilha difícil',
};
