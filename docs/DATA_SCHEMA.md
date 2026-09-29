# Modelagem de Dados & Schemas (DATA_SCHEMA)

Este documento define os modelos de dados utilizados no TypeScript e correspondentes às tabelas do PostgreSQL (Supabase).

---

## 1. Modelo de Praias (`beaches`)

```typescript
export type RegionType = 'norte' | 'centro' | 'sul';

export type BeachTag = 
  | 'familia'        // Mar calmo / crianças
  | 'surf'           // Boas ondas
  | 'quiosque'       // Infraestrutura completa
  | 'trilha'         // Acesso por trilha
  | 'carro'          // Acesso direto de carro
  | 'pet_friendly'   // Permite animais
  | 'selvagem'       // Sem quiosques / preservada
  | 'mergulho';      // Águas cristalinas / snorkel

export interface Beach {
  id: string;                      // Slug único (ex: 'praia-de-maranduba')
  name: string;                    // Nome de exibição (ex: 'Praia de Maranduba')
  region: RegionType;              // 'norte' | 'centro' | 'sul'
  km: number;                      // KM aproximado na Rodovia Rio-Santos (BR-101)
  distanceFromCenterKm: number;    // Distância em KM a partir do Centro de Ubatuba
  description: string;             // Texto descritivo e atrativo
  howToGet: string;                // Instruções detalhadas de acesso e estrada
  tips: string[];                  // Dicas práticas locais (sombra, maré, borrachudos)
  tags: BeachTag[];                // Tags de perfil para filtro rápido
  cetesbStatus: 'propria' | 'impropria'; // Balneabilidade
  cetesbLastUpdate: string;        // Data da última medição CETESB
  coverImage: string;              // URL da imagem de capa principal
  coverAuthor?: string;            // Nome do autor da foto principal
  coverAuthorInstagram?: string;   // @Instagram do fotógrafo
  gallery: Array<{
    url: string;
    author: string;
    instagram?: string;
  }>;
  coordinates: {
    lat: number;
    lng: number;
  };
  features: {
    hasLifeguard: boolean;         // Salva-vidas
    hasParking: boolean;           // Estacionamento (Zona Azul ou particular)
    hasKiosks: boolean;            // Quiosques de alimentação
    hasBoatTours: boolean;         // Passeios de escuna / barco
    trailDifficulty?: 'facil' | 'moderada' | 'dificil';
    trailDurationMinutes?: number;
  };
  isActive?: boolean;              // false = fora do app, mas editável no /admin
}
```

> **Origem dos dados.** O catálogo semente fica em `src/data/beaches.ts` (dentro do
> bundle, para o primeiro carregamento offline). O que o administrador cria ou
> edita no `/admin` entra como *override* em `localStorage` e, quando o Supabase
> está configurado, na tabela `beaches`. O repositório mescla os dois
> (`beachesRepo.listAll`) e o app só exibe as praias com `isActive !== false`.
>
> **`coverImage` é opcional.** Vazio significa que o app gera uma arte
> procedural determinística a partir do id (`src/assets/beachArt.ts`). O
> `<BeachImage>` sempre tenta a URL real primeiro e só então cai na arte.

---

## 2. Modelo de Parceiros Comerciais (`partners`)

```typescript
export type PartnerCategory = 
  | 'restaurante_quiosque'
  | 'pousada_hotel'
  | 'passeio_nautico'
  | 'escola_surf'
  | 'aluguel_equipamentos'
  | 'servicos_locais';

export interface Partner {
  id: string;
  name: string;                    // Ex: 'Quiosque Estrela do Mar'
  category: PartnerCategory;
  beachId?: string;                // Opcional: praia associada (contextual)
  region: RegionType;              // 'norte' | 'centro' | 'sul'
  shortDescription: string;        // Ex: 'Melhor porção de camarão e chopp artesanal à beira-mar'
  whatsapp: string;                // Formato internacional (ex: '5512999999999')
  defaultMessage: string;          // Ex: 'Olá! Vi vocês no Guia de Praias Ubatuba e gostaria de...'
  instagram?: string;              // Link para Instagram do parceiro
  logoUrl: string;                 // URL do logo ou foto do estabelecimento
  isFeatured: boolean;             // Destaque VIP no topo
  discountInfo?: string;           // Ex: 'Ganhe 10% de desconto mencionando o Guia'
  isActive: boolean;
}
```

---

## 3. Modelo de Fotos da Comunidade / UGC (`ugc_photos`)

```typescript
export type ModerationStatus = 'pendente' | 'aprovada' | 'rejeitada';

export interface UGCPhoto {
  id: string;
  beachId: string;                 // Praia vinculada
  imageUrl: string;                // URL da foto armazenada no Storage
  authorName: string;              // Nome completo do autor
  authorInstagram: string;         // Ex: '@fotografo_ubatuba'
  status: ModerationStatus;
  isCoverCandidate: boolean;       // Marcada para concorrer a foto de capa
  createdAt: string;
  moderatedAt?: string;
  moderatorNotes?: string;
}
```

---

## 4. Modelo de Banners Promocionais (`banners`)

```typescript
export interface Banner {
  id: string;
  title: string;                   // Título interno (ex: 'Passeio Ilha das Couves Verão')
  imageUrl: string;                // Imagem responsiva (1200x400 para desktop / 600x300 mobile)
  targetUrl: string;               // Link de destino (WhatsApp ou URL externa)
  position: 'home_top' | 'beaches_top' | 'services_top';
  isActive: boolean;
  clicksCount: number;             // Contador de cliques para relatório
  startDate?: string;
  endDate?: string;
}
```

---

## 5. Modelo de Utilidades Locais (`utilities`)

```typescript
export interface BusLine {
  id: string;
  code: string;                    // Ex: '10 - Picinguaba'
  route: string;                   // Ex: 'Centro ➔ Picinguaba Vila'
  region: RegionType;
  departureWeekdays: string[];     // Horários de dias úteis
  departureWeekends: string[];     // Horários de sábados e domingos
}

export interface EmergencyContact {
  id: string;
  name: string;                    // Ex: 'Grupamento de Bombeiros Marítimo (GBMar)'
  phone: string;                   // Ex: '193' ou '(12) 3832-1234'
  description: string;
  isEmergency: boolean;
}
```
