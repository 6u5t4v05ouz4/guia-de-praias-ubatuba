import type { Banner, Partner, PartnerCategory } from '@/types';

/**
 * Artes procedurais para logos de parceiros e banners promocionais.
 *
 * Mesmo princípio de `beachArt.ts`: o app precisa parecer completo no primeiro
 * deploy, sem depender de um servidor de imagens. Um parceiro com `logoUrl`
 * preenchido exibe o logo real; caso contrário, cai no monograma here.
 */

function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

const CATEGORY_PALETTE: Record<PartnerCategory, [string, string, string]> = {
  // [início do gradiente, fim do gradiente, cor do monograma]
  restaurante_quiosque: ['#ef6f53', '#b5651d', '#fff3ee'],
  pousada_hotel: ['#2a9d8f', '#1f7a6c', '#e8fbf7'],
  passeio_nautico: ['#1b8ec9', '#0b5c92', '#e6f6ff'],
  escola_surf: ['#ffb703', '#ef6f53', '#fff8e6'],
  aluguel_equipamentos: ['#6d597a', '#4a3f66', '#f2eefa'],
  servicos_locais: ['#5b8fd6', '#0b3c5d', '#eaf1fb'],
};

const CATEGORY_GLYPH: Record<PartnerCategory, string> = {
  restaurante_quiosque: '🍽️',
  pousada_hotel: '🏨',
  passeio_nautico: '⛵',
  escola_surf: '🏄',
  aluguel_equipamentos: '🚣',
  servicos_locais: '🛍️',
};

function initials(name: string): string {
  const words = name
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .filter((w) => !['de', 'da', 'do', 'das', 'dos', 'e'].includes(w.toLowerCase()));
  if (words.length === 0) return name.slice(0, 2).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function toDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/* -------------------------------------------------------------------------- */

export function partnerArtDataUrl(partner: Partner, size = 160): string {
  const seed = hash(partner.id);
  const [from, to, glyphColor] = CATEGORY_PALETTE[partner.category];
  const s = size;
  const r = s * 0.24;

  return toDataUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}" width="${s}" height="${s}">
      <defs>
        <linearGradient id="g${seed}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>
        </linearGradient>
      </defs>
      <rect width="${s}" height="${s}" rx="${r}" fill="url(#g${seed})"/>
      <circle cx="${s * 0.78}" cy="${s * 0.2}" r="${s * 0.22}" fill="#fff" opacity="0.12"/>
      <circle cx="${s * 0.2}" cy="${s * 0.86}" r="${s * 0.26}" fill="#fff" opacity="0.08"/>
      <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle"
            font-size="${s * 0.36}" font-weight="700" font-family="system-ui, sans-serif"
            fill="${glyphColor}">${initials(partner.name)}</text>
      <text x="${s * 0.5}" y="${s * 0.84}" dominant-baseline="middle" text-anchor="middle"
            font-size="${s * 0.2}" font-family="system-ui, sans-serif"
            fill="${glyphColor}" opacity="0.9">${CATEGORY_GLYPH[partner.category]}</text>
    </svg>`
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Ajusta o corpo da fonte ao texto para que ele sempre caiba na faixa útil
 * (90% da largura) sem precisar truncar o nome do anunciante.
 */
function fitFontSize(
  text: string,
  maxWidth: number,
  maxSize: number,
  minSize: number,
  weightFactor = 0.56
): number {
  const perChar = Math.max(1, text.length);
  const size = maxWidth / (perChar * weightFactor);
  return Math.round(Math.max(minSize, Math.min(maxSize, size)) * 10) / 10;
}

export function bannerArtDataUrl(banner: Banner, width = 1200, height = 400): string {
  const [from, to] = banner.palette ?? ['#0b5c92', '#1b8ec9'];
  const w = width;
  const h = height;
  const seed = hash(banner.id);
  const pad = w * 0.05;
  const usable = w - pad * 2;

  const bubbles = Array.from({ length: 6 }, (_, i) => {
    const x = ((seed >> (i * 2)) % 100) / 100;
    const y = ((seed >> (i * 2 + 1)) % 100) / 100;
    const rad = 0.1 + (((seed >> i) % 30) / 100);
    return `<circle cx="${(x * w).toFixed(0)}" cy="${(y * h).toFixed(0)}" r="${(rad * h).toFixed(0)}" fill="#fff" opacity="${(0.05 + (i % 3) * 0.04).toFixed(2)}"/>`;
  }).join('');

  const titleSize = fitFontSize(banner.title, usable, h * 0.2, h * 0.1, 0.58);
  const subtitleSize = banner.subtitle
    ? fitFontSize(banner.subtitle, usable, h * 0.11, h * 0.06, 0.5)
    : 0;

  return toDataUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="bg${seed}" x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#bg${seed})"/>
      ${bubbles}
      <path d="M0 ${h * 0.78} q ${w * 0.12} -26 ${w * 0.25} 0 t ${w * 0.25} 0 t ${w * 0.25} 0 t ${w * 0.25} 0 L ${w} ${h} L 0 ${h} Z" fill="#fff" opacity="0.14"/>
      <path d="M0 ${h * 0.88} q ${w * 0.12} -22 ${w * 0.25} 0 t ${w * 0.25} 0 t ${w * 0.25} 0 t ${w * 0.25} 0 L ${w} ${h} L 0 ${h} Z" fill="#fff" opacity="0.2"/>
      <text x="${pad}" y="${h * 0.42}" dominant-baseline="middle"
            font-size="${titleSize}" font-weight="800" font-family="system-ui, sans-serif" fill="#fff">${escapeXml(banner.title)}</text>
      ${
        banner.subtitle
          ? `<text x="${pad}" y="${h * 0.63}" dominant-baseline="middle"
              font-size="${subtitleSize}" font-weight="500" font-family="system-ui, sans-serif" fill="#fff" opacity="0.88">${escapeXml(banner.subtitle)}</text>`
          : ''
      }
    </svg>`
  );
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
