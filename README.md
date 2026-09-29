# 🌊 Guia de Praias & Serviços Ubatuba

> Progressive Web App (PWA) moderna, mobile-first e offline-first desenvolvida para conectar turistas às mais belas praias e aos melhores serviços de Ubatuba, Capital do Surfe.

---

## 🚀 Destaques da Aplicação

- **🏖️ Catálogo Completo das Praias:** 36 praias mapeadas com instruções detalhadas de acesso (KM da Rio-Santos, tipo de estrada), infraestrutura e dicas de ouro.
- **🔍 Filtros Inteligentes:** Busque por nome, KM ou perfil de experiência (*Família / Mar Calmo, Boas Ondas / Surf, Com Quiosque, Trilha / Selvagem, Acesso de Carro, Pet Friendly*).
- **📴 Offline-First Real:** O catálogo, os favoritos e o guia da cidade ficam salvos no aparelho, funcionando perfeitamente mesmo sem sinal 4G/5G no meio da praia ou da serra.
- **🛎️ Ecossistema de Serviços & Parceiros:** Encontre quiosques, restaurantes, passeios de barco e escolas de surf com botão direto de contato pelo WhatsApp.
- **📸 Envio Colaborativo de Fotos (UGC):** Turistas e fotógrafos podem enviar fotos das beaches com seus respectivos créditos do Instagram.
- **🛡️ Painel Administrativo Embutido (`/admin`):** CRUD completo de praia (criar, editar, desativar e excluir), moderação de fotos enviadas, cadastro de anunciantes parceiros, banners rotativos e atualização semanal do boletim da CETESB.
- **ℹ️ Guia da Cidade:** Taxa TPA Ubatuba, telefones úteis de emergência e horários dos ônibus VerdeBus.

---

## 🛠️ Como Rodar

Requisitos: **Node 20+**.

```bash
npm install          # instala as dependências
npm run dev          # http://localhost:5173
```

Outros comandos:

| Comando | O que faz |
| :--- | :--- |
| `npm run dev` | Servidor de desenvolvimento com HMR. |
| `npm run typecheck` | Checagem de tipos (sem emitir arquivos). |
| `npm run build` | Gera `sitemap.xml`, valida tipos e builda em `dist/`. |
| `npm run preview` | Serve o `dist/` em `http://localhost:4173`. |
| `npm run icons` | Regera os ícones PNG do PWA em `public/icons/`. |
| `npm run sitemap` | Regera `public/sitemap.xml` e `public/robots.txt`. |

> **Rotas profundas:** o app usa URLs como `/praia/praia-da-burguesa` (essencial para o SEO local descrito em `docs/BUSINESS_MODEL.md`). Ao publicar em hospedagem estática, configure o rewrite de todas as rotas para `index.html` — em Netlify, `_redirects`; na Vercel, `vercel.json`; no Cloudflare Pages, o Pages já faz isso por padrão.

### Configuração (opcional)

Copie `.env.example` para `.env.local`. **Nada é obrigatório** — sem variáveis, o app roda 100% com o catálogo embutido e `localStorage`.

```bash
VITE_SUPABASE_URL=            # liga a sincronização com o banco
VITE_SUPABASE_ANON_KEY=
VITE_ADMIN_PASSWORD=          # senha do /admin (padrão dev: "ubatuba")
```

Para ativar o backend, execute [`supabase/schema.sql`](file:///d:/Users/n4r1g4/Desktop/GUIADEPRAIAS/supabase/schema.sql) no SQL Editor do seu projeto. Ele cria as tabelas, as políticas de RLS e o bucket de Storage das fotos.

---

## 🔐 Acesso ao Painel

Acesse `/admin`. Sem `VITE_ADMIN_PASSWORD` configurada, a senha de desenvolvimento é **`ubatuba`**.

> ⚠️ Em produção, mova a autenticação para o servidor (Supabase Auth com RLS ou uma Edge Function). A checagem no cliente existe para que o painel seja utilizável já no primeiro deploy, sem configuração extra.

---

## 🧱 Estrutura

```text
GUIADEPRAIAS/
├── docs/                     # Especificação, arquitetura, dados e negócio
├── public/                   # Manifesto PWA, ícones, favicon, robots/sitemap
├── scripts/                  # Geradores de ícones e sitemap (sem dependências)
├── supabase/schema.sql       # Schema PostgreSQL + RLS + bucket de Storage
└── src/
    ├── assets/               # Artes procedurais SVG (capa, logo, banner)
    ├── components/
    │   └── admin/            # Módulo de CRUD de praia do painel
    ├── components/           # Navigation, BeachCard, PartnerCard, PhotoCarousel, …
    ├── context/              # Estado compartilhado (favoritos e avisos)
    ├── data/                 # Catálogo de beaches, parceiros e utilidades
    ├── hooks/                # useFavorites, useOfflineStatus, useAsyncResource, …
    ├── pages/                # As 6 telas do aplicativo
    ├── services/             # storage, supabase, repository, auth, image, links
    ├── styles/               # Design tokens (variables.css) e estilos globais
    ├── types/                # Interfaces TypeScript (Beach, Partner, UGCPhoto, …)
    ├── App.tsx               # Raiz com roteador e provedores
    └── main.tsx              # Entrada e registro do Service Worker
```

### Decisões que valem explicar

- **Artes geradas por código.** Cada praia tem uma capa SVG determinística derivada do seu id (`src/assets/beachArt.ts`). Sem fotos no repositório, sem custo de rede e sem banco de imagens — e assim que a foto real for cadastrada no admin ou no Supabase, ela substitui a arte automaticamente.
- **CRUD de praia sem quebrar o offline.** O catálogo semente (`src/data/beaches.ts`) continua no bundle para o primeiro carregamento instantâneo; o que o admin cria ou edita vira um *override* em `localStorage` e é sincronizado no Supabase quando configurado. `beachesRepo` mescla os dois, e o app só exibe as praia com `isActive !== false`.
- **Upload de imagem opcional e tolerante.** `src/services/uploads.ts` manda a imagem (já comprimida no cliente) para o bucket `uploads` do Supabase; se o Storage falhar, ele degrada para um data URL local em vez de perder o envio. A capa da praia continua válida mesmo sem imagem alguma.
- **Repository Pattern.** `src/services/repository.ts` tenta o Supabase e cai no `MockDataService` local em qualquer falha. É isso que garante que o app abra no meio de uma praia sem sinal.
- **Cache em duas camadas.** App Shell em Cache-First via Workbox; imagens em Stale-While-Revalidate; dados do usuário (favoritos, fotos, alterações do admin) em `localStorage`.

---

## 📚 Documentação Técnica & de Negócios

Toda a especificação e arquitetura do projeto está documentada em [`/docs`](file:///d:/Users/n4r1g4/Desktop/GUIADEPRAIAS/docs):

- 📄 [**`docs/SPEC.md`**](file:///d:/Users/n4r1g4/Desktop/GUIADEPRAIAS/docs/SPEC.md): Especificação completa de produto, telas e requisitos funcionais.
- 🏗️ [**`docs/ARCHITECTURE.md`**](file:///d:/Users/n4r1g4/Desktop/GUIADEPRAIAS/docs/ARCHITECTURE.md): Arquitetura de software, PWA, estratégia de cache offline e stack técnica.
- 🗄️ [**`docs/DATA_SCHEMA.md`**](file:///d:/Users/n4r1g4/Desktop/GUIADEPRAIAS/docs/DATA_SCHEMA.md): Modelos de dados TypeScript e schemas do Supabase.
- 💼 [**`docs/BUSINESS_MODEL.md`**](file:///d:/Users/n4r1g4/Desktop/GUIADEPRAIAS/docs/BUSINESS_MODEL.md): Estratégia de monetização, planos para parceiros e captação de leads via WhatsApp.

---

## 🛠️ Stack Tecnológica

- **Frontend:** React 18+ com TypeScript e Vite.
- **Estilização:** CSS Moderno com Design Tokens temáticos (Azul Oceano, Areia Dourada, Transições Nativas).
- **PWA:** Vite PWA Plugin + Workbox + Cache Local / IndexedDB.
- **Backend (Opcional):** Supabase (PostgreSQL, Storage e Auth) + Fallback local nativo de desenvolvimento.

---

## ✅ Status Atual

- `npm run typecheck` e `npm run build` passam sem erros.
- Lighthouse (mobile): **100** em Acessibilidade, Boas Práticas, SEO e Agentic Browsing.
- Fluxo de envio de foto → moderação → galeria pública validado ponta a ponta.
- Favoritos, catálogo e navegação testados com a rede desligada via Service Worker.
