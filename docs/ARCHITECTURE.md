# Arquitetura Técnica & Engenharia de Software

## 1. Visão Geral da Stack Tecnológica

| Camada | Tecnologia | Motivação & Benefício |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18+ com TypeScript & Vite | Performance extrema, tipagem estrita e inicialização rápida |
| **Estilização** | CSS Moderno (Vanilla CSS com Design System de Variáveis CSS) | Controle total de transições fluidas e estética litorânea sem inchaço |
| **PWA & Offline** | Vite PWA Plugin + Workbox + IndexedDB / LocalStorage | Cache do catálogo de praias e dados offline instantâneos sem internet |
| **Roteamento** | React Router v6 | Navegação suave por abas e páginas dedicadas com deep links compartilháveis |
| **Backend & Banco de Dados** | Supabase (PostgreSQL + Auth + Storage) | Custo inicial zero, painel administrativo robusto e API REST automática |
| **Fallback Híbrido** | Mock Data Store Local | Permite rodar e testar 100% da aplicação localmente mesmo sem internet ou chaves de API |

---

## 2. Estrutura de Diretórios Proposta

```text
GUIADEPRAIAS/
├── docs/                     # Documentação de Especificação, Arquitetura e Negócios
│   ├── SPEC.md
│   ├── ARCHITECTURE.md
│   ├── DATA_SCHEMA.md
│   └── BUSINESS_MODEL.md
├── public/                   # Manifest PWA, ícones, splash screen e favicon
│   ├── favicon.ico
│   ├── manifest.json
│   ├── icons/
│   └── images/
├── src/
│   ├── assets/               # Imagens locais, ícones SVG e logomarca de Ubatuba
│   ├── components/           # Componentes reutilizáveis
│   │   ├── Navigation/       # Header superior, Barra de Navegação Inferior (BottomBar)
│   │   ├── BeachCard/        # Card da praia na lista com tags e botão favoritar
│   │   ├── PartnerCard/      # Card do parceiro com botão WhatsApp
│   │   ├── PhotoCarousel/    # Carrossel de imagens com indicador de autor
│   │   ├── BannerCarousel/   # Banners rotativos de anunciantes
│   │   ├── CetesbBadge/      # Indicador visual de balneabilidade
│   │   └── Modals/           # Modal de envio de fotos e filtros avançados
│   ├── data/                 # Catálogo das Top 30 praias e semente inicial rica
│   │   ├── beaches.ts        # Dados estruturados de praias (como chegar, tags, GPS)
│   │   ├── partners.ts       # Parceiros comerciais iniciais
│   │   └── utilities.ts      # Dados de TPA, telefones e ônibus VerdeBus
│   ├── hooks/                # Hooks customizados (useFavorites, useOfflineStatus, etc.)
│   ├── pages/                # Telas da aplicação
│   │   ├── BeachesPage.tsx   # Aba 1: Catálogo e busca de praias
│   │   ├── BeachDetailPage.tsx # Tela de detalhes da praia
│   │   ├── ServicesPage.tsx  # Aba 2: Guia de serviços e parceiros
│   │   ├── FavoritesPage.tsx # Aba 3: Meus Salvos (Offline)
│   │   ├── UtilitiesPage.tsx # Aba 4: Guia Ubatuba (TPA, ônibus, telefones)
│   │   └── AdminPage.tsx     # Painel de controle e moderação (/admin)
│   ├── services/             # Clientes de API, Supabase e IndexedDB
│   │   ├── supabase.ts       # Inicialização e queries do Supabase
│   │   └── storage.ts        # Abstração de persistência local (cache)
│   ├── styles/               # Design System, tokens e reset
│   │   ├── variables.css     # Paleta costeira, tipografia, espaçamentos
│   │   └── global.css        # Estilos globais e utilitários
│   ├── types/                # Interfaces TypeScript (Beach, Partner, Photo, Banner)
│   ├── App.tsx               # Componente raiz com roteador e provedores
│   └── main.tsx              # Ponto de entrada com registro do Service Worker
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 3. Estratégia Offline-First (Resiliência nas Praias)

Nas praias remotas de Ubatuba, a conectividade celular 4G/5G oscila ou é inexistente. O sistema implementa uma camada dupla de resiliência:

1. **Service Worker (Workbox via vite-plugin-pwa):**
   - **App Shell (Cache-First):** HTML, CSS, JavaScript, ícones e fontes são cacheados no primeiro acesso.
   - **Imagens (Stale-While-Revalidate):** Fotos de praias visitadas ficam no cache do navegador (limite de 100MB em cache LRU).
2. **Camada de Dados (IndexedDB / LocalStorage):**
   - O catálogo completo das praias e utilidades fica embutido no bundle inicial da aplicação.
   - Os favoritos e praias salvas ficam gravados no `localStorage` do celular do usuário.
   - Se o usuário estiver offline, a aplicação detecta o evento `window.addEventListener('offline')` e exibe um indicador amigável sem bloquear a navegação.

---

## 4. Integração com Backend (Supabase + Fallback Local)

Para garantir que o projeto funcione **instantaneamente sem exigir configuração prévia complexa**:
- A aplicação utiliza um padrão **Repository Pattern**:
  - Se as variáveis de ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estiverem preenchidas, o app sincroniza com o banco em nuvem.
  - Caso contrário, o app utiliza automaticamente o `MockDataService` gravado localmente, permitindo testes, navegação e até moderação simulada no `localStorage`.
