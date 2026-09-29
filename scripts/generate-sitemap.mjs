/**
 * Gera `public/sitemap.xml` a partir do catálogo de src/data/beaches.ts.
 *
 * Existe por causa da estratégia de SEO local (docs/BUSINESS_MODEL.md §3):
 * cada praia precisa de uma URL própria e rastreável.
 *
 * Uso: npm run sitemap  (executado automaticamente no prebuild)
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SOURCE = resolve(ROOT, 'src', 'data', 'beaches.ts');
const OUT = resolve(ROOT, 'public', 'sitemap.xml');

const SITE = (process.env.SITE_URL || 'https://guiadepraiasubatuba.com.br').replace(/\/$/, '');

const src = readFileSync(SOURCE, 'utf8');

// Cada entrada do catálogo começa com `id: '<slug>',` seguido de `name: '<nome>'`.
const entries = [];
const re = /id:\s*'([^']+)',\s*\n\s*name:\s*'([^']+)'/g;
let m;
while ((m = re.exec(src)) !== null) {
  entries.push({ id: m[1], name: m[2] });
}

if (entries.length === 0) {
  console.error('[sitemap] Nenhuma praia encontrada em src/data/beaches.ts — abortando.');
  process.exit(1);
}

const staticPaths = [
  { loc: '/', priority: '1.0', changefreq: 'daily' },
  { loc: '/praias', priority: '0.9', changefreq: 'weekly' },
  { loc: '/servicos', priority: '0.9', changefreq: 'weekly' },
  { loc: '/salvos', priority: '0.4', changefreq: 'monthly' },
  { loc: '/guia', priority: '0.8', changefreq: 'monthly' },
];

const url = ({ loc, priority, changefreq }) => `  <url>
    <loc>${SITE}${loc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Gerado por scripts/generate-sitemap.mjs. Nao editar a mao. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPaths.map(url).join('\n')}
${entries
  .map(
    (e) => `  <url>
    <loc>${SITE}/praia/${e.id}</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

if (!existsSync(resolve(ROOT, 'public'))) {
  console.error('[sitemap] diretório public/ não encontrado.');
  process.exit(1);
}

writeFileSync(OUT, xml, 'utf8');

// robots.txt é gerado junto para que a referência do sitemap seja absoluta
// (o Lighthouse rejeita caminhos relativos em robots.txt).
writeFileSync(
  resolve(ROOT, 'public', 'robots.txt'),
  `User-agent: *
Allow: /

# O guia e um PWA: o app shell e servido do Service Worker e cada praia tem
# uma URL propria para indexacao (ver docs/BUSINESS_MODEL.md secao 3).
Disallow: /admin

Sitemap: ${SITE}/sitemap.xml
`,
  'utf8'
);

console.log(`[sitemap] ${entries.length + staticPaths.length} URLs geradas em public/sitemap.xml`);
