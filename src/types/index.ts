/**
 * Modelos de dados do Guia de Praias & Serviços Ubatuba.
 * Espelham 1:1 as tabelas do PostgreSQL (Supabase) descritas em docs/DATA_SCHEMA.md.
 */

export type RegionType = 'norte' | 'centro' | 'sul';

export const REGIONS: RegionType[] = ['norte', 'centro', 'sul'];

export const REGION_LABEL: Record<RegionType, string> = {
  norte: 'Norte',
  centro: 'Centro',
  sul: 'Sul',
};

/* -------------------------------------------------------------------------- */
/* Praias                                                                     */
/* -------------------------------------------------------------------------- */

export type BeachTag =
  | 'familia' // Mar calmo / crianças
  | 'surf' // Boas ondas
  | 'quiosque' // Infraestrutura completa
  | 'trilha' // Acesso por trilha
  | 'carro' // Acesso direto de carro
  | 'pet_friendly' // Permite animais
  | 'selvagem' // Sem quiosques / preservada
  | 'mergulho'; // Águas cristalinas / snorkel

export const BEACH_TAGS: Record<BeachTag, { label: string; emoji: string }> = {
  familia: { label: 'Família / Mar calmo', emoji: '👨‍👩‍👧' },
  surf: { label: 'Boas Ondas / Surf', emoji: '🏄' },
  quiosque: { label: 'Com Quiosques', emoji: '🍹' },
  trilha: { label: 'Trilha / Selvagem', emoji: '🥾' },
  carro: { label: 'Acesso de Carro', emoji: '🚗' },
  pet_friendly: { label: 'Pet Friendly', emoji: '🐾' },
  selvagem: { label: 'Selvagem', emoji: '🌿' },
  mergulho: { label: 'Mergulho', emoji: '🤿' },
};

export type CetesbStatus = 'propria' | 'impropria';

export type TrailDifficulty = 'facil' | 'moderada' | 'dificil';

export interface BeachGalleryPhoto {
  url: string;
  author: string;
  instagram?: string;
}

export interface Beach {
  id: string; // Slug único (ex: 'praia-de-maranduba')
  name: string;
  region: RegionType;
  km: number; // KM aproximado na Rodovia Rio-Santos (BR-101)
  distanceFromCenterKm: number;
  description: string;
  howToGet: string;
  tips: string[];
  tags: BeachTag[];
  cetesbStatus: CetesbStatus;
  cetesbLastUpdate: string; // ISO date
  coverImage: string; // URL da imagem de capa principal ('' = arte procedural offline)
  coverAuthor?: string;
  coverAuthorInstagram?: string;
  gallery: BeachGalleryPhoto[];
  coordinates: { lat: number; lng: number };
  features: {
    hasLifeguard: boolean; // Salva-vidas
    hasParking: boolean; // Estacionamento (Zona Azul ou particular)
    hasKiosks: boolean; // Quiosques de alimentação
    hasBoatTours: boolean; // Passeios de escuna / barco
    trailDifficulty?: TrailDifficulty;
    trailDurationMinutes?: number;
  };
  /**
   * `false` esconde a praia do app sem apagá-la (o registro continua
   * editável no /admin). Ausente = true. Introduzido com o CRUD do painel.
   */
  isActive?: boolean;
}

/** Uma praia só aparece para o usuário quando está ativa. */
export const isBeachVisible = (beach: Beach): boolean => beach.isActive !== false;

/* -------------------------------------------------------------------------- */
/* Parceiros comerciais                                                       */
/* -------------------------------------------------------------------------- */

export type PartnerCategory =
  | 'restaurante_quiosque'
  | 'pousada_hotel'
  | 'passeio_nautico'
  | 'escola_surf'
  | 'aluguel_equipamentos'
  | 'servicos_locais';

export const PARTNER_CATEGORIES: Record<
  PartnerCategory,
  { label: string; emoji: string; short: string }
> = {
  restaurante_quiosque: {
    label: 'Restaurantes & Quiosques',
    emoji: '🍽️',
    short: 'Comer e beber',
  },
  pousada_hotel: { label: 'Pousadas & Hospedagens', emoji: '🏨', short: 'Hospedar' },
  passeio_nautico: { label: 'Passeios de Barco & Escuna', emoji: '⛵', short: 'Náutico' },
  escola_surf: { label: 'Escolas de Surf', emoji: '🏄', short: 'Surf' },
  aluguel_equipamentos: {
    label: 'Caiaque, SUP & Mergulho',
    emoji: '🚣',
    short: 'Equipamentos',
  },
  servicos_locais: { label: 'Comércio Local & Serviços', emoji: '🛍️', short: 'Serviços' },
};

export const PARTNER_CATEGORY_LIST = Object.keys(PARTNER_CATEGORIES) as PartnerCategory[];

export type PartnerPlan = 'basico' | 'verificado' | 'vip' | 'master';

export const PARTNER_PLAN_LABEL: Record<PartnerPlan, string> = {
  basico: 'Parceiro',
  verificado: 'Parceiro Verificado',
  vip: 'Destaque VIP',
  master: 'Patrocínio Master',
};

export interface Partner {
  id: string;
  name: string;
  category: PartnerCategory;
  beachId?: string;
  region: RegionType;
  shortDescription: string;
  whatsapp: string; // Formato internacional, só dígitos (ex: '5512999999999')
  defaultMessage: string;
  instagram?: string;
  logoUrl: string; // '' = arte procedural offline
  isFeatured: boolean;
  discountInfo?: string;
  isActive: boolean;
  plan?: PartnerPlan;
  rating?: number;
  address?: string;
  highlights?: string[];
}

/* -------------------------------------------------------------------------- */
/* UGC / Moderação                                                            */
/* -------------------------------------------------------------------------- */

export type ModerationStatus = 'pendente' | 'aprovada' | 'rejeitada';

export const MODERATION_LABEL: Record<ModerationStatus, string> = {
  pendente: 'Pendente',
  aprovada: 'Aprovada',
  rejeitada: 'Rejeitada',
};

export interface UGCPhoto {
  id: string;
  beachId: string;
  imageUrl: string;
  authorName: string;
  authorInstagram: string;
  status: ModerationStatus;
  isCoverCandidate: boolean;
  createdAt: string;
  moderatedAt?: string;
  moderatorNotes?: string;
}

/* -------------------------------------------------------------------------- */
/* Banners                                                                    */
/* -------------------------------------------------------------------------- */

export type BannerPosition = 'home_top' | 'beaches_top' | 'services_top';

export const BANNER_POSITION_LABEL: Record<BannerPosition, string> = {
  home_top: 'Home — topo',
  beaches_top: 'Lista de Praias — topo',
  services_top: 'Serviços — topo',
};

export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  position: BannerPosition;
  isActive: boolean;
  clicksCount: number;
  startDate?: string;
  endDate?: string;
  /** Texto exibido sobre a arte gerada quando não há imagem. */
  subtitle?: string;
  /** Paleta da arte procedural (fallback offline). */
  palette?: [string, string];
}

/* -------------------------------------------------------------------------- */
/* Utilidades locais                                                          */
/* -------------------------------------------------------------------------- */

export interface BusLine {
  id: string;
  code: string; // Ex: '10 - Picinguaba'
  route: string; // Ex: 'Centro ➔ Picinguaba Vila'
  region: RegionType;
  departureWeekdays: string[];
  departureWeekends: string[];
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  description: string;
  isEmergency: boolean;
  icon?: string;
}

export interface TpaRate {
  vehicle: string;
  price: string;
  note?: string;
}

export interface UtilitiesData {
  tpa: {
    summary: string;
    howItWorks: string[];
    exemptions: string[];
    whereToPay: string[];
    rates: TpaRate[];
    officialUrl: string;
  };
  busLines: BusLine[];
  emergencyContacts: EmergencyContact[];
  tides: {
    note: string;
    sourceUrl: string;
  };
}
