import type {
  Banner,
  BannerPosition,
  Beach,
  CetesbStatus,
  ModerationStatus,
  Partner,
  UGCPhoto,
} from '@/types';
import { isBeachVisible } from '@/types';
import { beaches as seedBeaches, beachesById } from '@/data/beaches';
import { partners as seedPartners } from '@/data/partners';
import { banners as seedBanners } from '@/data/utilities';
import { STORAGE_KEYS, nowISO, readJSON, uid, writeJSON, removeKey } from './storage';
import { isSupabaseConfigured, tryQuery } from './supabase';

/**
 * Repository Pattern (docs/ARCHITECTURE.md §4).
 *
 * Cada repositório tenta o Supabase; se ele não estiver configurado, a consulta
 * falhar (sem sinal) ou devolver vazio, usa o `MockDataService` local. O contrato
 * com a UI é sempre o mesmo: `Promise<T>`, nunca lança.
 */

/* ========================================================================== */
/* Balneabilidade (CETESB)                                                    */
/* ========================================================================== */

type CetesbOverride = Record<string, { status: CetesbStatus; lastUpdate: string }>;

const cetesbOverride = (): CetesbOverride =>
  readJSON<CetesbOverride>(STORAGE_KEYS.cetesb, {});

export const cetesbRepo = {
  /** Aplica as sobrescritas locais (admin) sobre o catálogo semente. */
  apply(beach: Beach): Beach {
    const o = cetesbOverride()[beach.id];
    if (!o) return beach;
    return { ...beach, cetesbStatus: o.status, cetesbLastUpdate: o.lastUpdate };
  },

  listAll(): Beach[] {
    const map = cetesbOverride();
    return seedBeaches.map((b) => {
      const o = map[b.id];
      return o ? { ...b, cetesbStatus: o.status, cetesbLastUpdate: o.lastUpdate } : b;
    });
  },

  get(beachId: string): CetesbStatus | undefined {
    return cetesbOverride()[beachId]?.status ?? beachesById[beachId]?.cetesbStatus;
  },

  async set(beachId: string, status: CetesbStatus): Promise<void> {
    const local = cetesbOverride();
    local[beachId] = { status, lastUpdate: nowISO().slice(0, 10) };
    writeJSON(STORAGE_KEYS.cetesb, local);

    void tryQuery(async (c) =>
      c.from('beaches').update({ cetesb_status: status, cetesb_last_update: local[beachId].lastUpdate }).eq('id', beachId)
    );
  },

  async toggle(beachId: string): Promise<CetesbStatus> {
    const current = cetesbRepo.get(beachId) ?? 'propria';
    const next: CetesbStatus = current === 'propria' ? 'impropria' : 'propria';
    await cetesbRepo.set(beachId, next);
    return next;
  },

  /** Restaura o catálogo semente (descarta sobrescritas do admin). */
  reset(): void {
    removeKey(STORAGE_KEYS.cetesb);
  },
};

/* ========================================================================== */
/* Praias                                                                     */
/* ========================================================================== */

/** Slugs que o /admin já criou ou sobrescreveu (mudam o catálogo do semente). */
function beachOverrides(): Beach[] {
  return readJSON<Beach[]>(STORAGE_KEYS.beaches, []);
}

/** Catálogo efetivo = semente + overrides, ordenado por KM da BR-101. */
function mergeBeaches(seedList: Beach[], override: Beach[]): Beach[] {
  const byId = new Map(seedList.map((b) => [b.id, b]));
  for (const b of override) byId.set(b.id, b);
  return [...byId.values()].sort((a, b) => a.km - b.km);
}

export const beachesRepo = {
  /** Catálogo efetivo, incluindo as desativadas (uso do /admin). */
  async listAll(): Promise<Beach[]> {
    const remote = await tryQuery<Beach[]>(async (c) => {
      const { data, error } = await c.from('beaches').select('*').order('km');
      return { data: (data as Beach[] | null) ?? null, error };
    });
    const base = remote && remote.length > 0 ? remote : seedBeaches;
    return mergeBeaches(base, beachOverrides()).map(cetesbRepo.apply);
  },

  /** Catálogo que o usuário vê: só as praias ativas. */
  async list(): Promise<Beach[]> {
    return (await beachesRepo.listAll()).filter(isBeachVisible);
  },

  async getById(id: string): Promise<Beach | undefined> {
    const remote = await tryQuery<Beach | null>(async (c) => {
      const { data, error } = await c.from('beaches').select('*').eq('id', id).maybeSingle();
      return { data: (data as Beach | null) ?? null, error };
    });
    const merged = remote
      ? remote
      : mergeBeaches(seedBeaches, beachOverrides()).find((b) => b.id === id) ?? beachesById[id];
    return merged ? cetesbRepo.apply(merged) : undefined;
  },

  /**
   * Cria ou atualiza uma praia. O registro completo é gravado no override local
   * (para funcionar sem backend) e sincronizado no Supabase quando configurado.
   */
  async save(beach: Beach): Promise<Beach> {
    const record: Beach = { ...beach, isActive: beach.isActive !== false };
    const override = beachOverrides();
    const idx = override.findIndex((b) => b.id === record.id);
    if (idx >= 0) override[idx] = record;
    else override.push(record);
    writeJSON(STORAGE_KEYS.beaches, override);

    void tryQuery(async (c) => {
      const row = toBeachRow(record);
      if (record.id.startsWith('novo_')) {
        const { id, ...rest } = row;
        return c.from('beaches').insert(rest);
      }
      return c.from('beaches').upsert(row);
    });
    return record;
  },

  /**
   * Remove do app. Praias do catálogo semente viram lápide (`isActive: false`)
   * para não ressuscitarem no próximo build; praia criada no painel é apagada.
   */
  async remove(id: string): Promise<void> {
    const override = beachOverrides();
    const isSeed = seedBeaches.some((b) => b.id === id);
    const current = override.find((b) => b.id === id) ?? seedBeaches.find((b) => b.id === id);

    if (isSeed && current) {
      writeJSON(
        STORAGE_KEYS.beaches,
        [...override.filter((b) => b.id !== id), { ...current, isActive: false }]
      );
    } else {
      writeJSON(
        STORAGE_KEYS.beaches,
        override.filter((b) => b.id !== id)
      );
    }
    void tryQuery(async (c) => c.from('beaches').delete().eq('id', id));
  },

  /** Restaura o catálogo semente (descarta todo o CRUD do painel). */
  reset(): void {
    removeKey(STORAGE_KEYS.beaches);
  },

  newDraft(): Beach {
    return {
      id: uid('novo'),
      name: '',
      region: 'centro',
      km: 0,
      distanceFromCenterKm: 0,
      description: '',
      howToGet: '',
      tips: [],
      tags: ['familia'],
      cetesbStatus: 'propria',
      cetesbLastUpdate: new Date().toISOString().slice(0, 10),
      coverImage: '',
      gallery: [],
      coordinates: { lat: -23.55, lng: -45.24 },
      features: {
        hasLifeguard: false,
        hasParking: false,
        hasKiosks: false,
        hasBoatTours: false,
      },
      isActive: true,
    };
  },
};

/** Converte o modelo da UI para o formato de linha do PostgreSQL. */
function toBeachRow(b: Beach): Record<string, unknown> {
  return {
    id: b.id,
    name: b.name,
    region: b.region,
    km: b.km,
    distance_from_center_km: b.distanceFromCenterKm,
    description: b.description,
    how_to_get: b.howToGet,
    tips: b.tips,
    tags: b.tags,
    cetesb_status: b.cetesbStatus,
    cetesb_last_update: b.cetesbLastUpdate,
    cover_image: b.coverImage,
    cover_author: b.coverAuthor ?? null,
    cover_author_instagram: b.coverAuthorInstagram ?? null,
    gallery: b.gallery,
    latitude: b.coordinates.lat,
    longitude: b.coordinates.lng,
    features: b.features,
    is_active: b.isActive !== false,
  };
}

/**
 * Nome de uma praia resolvendo tanto o catálogo semente quanto o que foi
 * cadastrado no /admin. Usado nos cards de parceiro, que não carregam a lista
 * de beaches inteira.
 */
export function beachNameOf(id: string | undefined): string | undefined {
  if (!id) return undefined;
  const fromOverride = beachOverrides().find((b) => b.id === id);
  return (fromOverride ?? beachesById[id])?.name;
}

/* ========================================================================== */
/* Parceiros                                                                  */
/* ========================================================================== */

/** Parceiros cadastrados/alterados pelo admin têm prioridade sobre o catálogo semente. */
function mergePartners(seedList: Partner[], override: Partner[]): Partner[] {
  const byId = new Map(seedList.map((p) => [p.id, p]));
  for (const p of override) byId.set(p.id, p);
  // Parceiros do catálogo semente que foram removidos no admin somem daqui.
  const removed = override.filter((p) => p.isActive === false && !p.id.startsWith('novo_'));
  if (removed.length === 0) return [...byId.values()];
  const removedIds = new Set(removed.map((p) => p.id));
  return [...byId.values()].filter((p) => !removedIds.has(p.id));
}

export const partnersRepo = {
  async list(): Promise<Partner[]> {
    const override = readJSON<Partner[]>(STORAGE_KEYS.partners, []);
    const remote = await tryQuery<Partner[]>(async (c) => {
      const { data, error } = await c.from('partners').select('*').order('name');
      return { data: (data as Partner[] | null) ?? null, error };
    });
    if (remote && remote.length > 0) {
      // Preserva alterações locais ainda não sincronizadas.
      const localOnly = override.filter((o) => !remote.some((r) => r.id === o.id));
      return [...remote, ...localOnly];
    }
    return mergePartners(seedPartners, override);
  },

  async save(partner: Partner): Promise<Partner> {
    const override = readJSON<Partner[]>(STORAGE_KEYS.partners, []);
    const idx = override.findIndex((p) => p.id === partner.id);
    const record = { ...partner, logoUrl: partner.logoUrl || '' };
    if (idx >= 0) override[idx] = record;
    else override.unshift(record);
    writeJSON(STORAGE_KEYS.partners, override);

    void tryQuery(async (c) => {
      if (partner.id.startsWith('novo_')) {
        const { id, ...rest } = record;
        return c.from('partners').insert(rest as Record<string, unknown>);
      }
      return c.from('partners').upsert(record as unknown as Record<string, unknown>);
    });
    return record;
  },

  async remove(id: string): Promise<void> {
    const override = readJSON<Partner[]>(STORAGE_KEYS.partners, []);
    const existing = override.find((p) => p.id === id);
    if (existing) {
      writeJSON(
        STORAGE_KEYS.partners,
        override.map((p) => (p.id === id ? { ...p, isActive: false } : p))
      );
    } else {
      // Parceiro do catálogo semente: registra a desativação como override.
      const target =
        seedPartners.find((p) => p.id === id) ?? partnersRepo.fallbackFromSeed(id);
      if (target) writeJSON(STORAGE_KEYS.partners, [{ ...target, isActive: false }, ...override]);
    }
    void tryQuery(async (c) => c.from('partners').update({ is_active: false }).eq('id', id));
  },

  fallbackFromSeed(id: string): Partner | undefined {
    return seedPartners.find((p) => p.id === id);
  },

  newDraft(): Partner {
    return {
      id: uid('novo'),
      name: '',
      category: 'restaurante_quiosque',
      region: 'centro',
      shortDescription: '',
      whatsapp: '55',
      defaultMessage: 'Olá! Gostaria de mais informações.',
      logoUrl: '',
      isFeatured: false,
      isActive: true,
      plan: 'basico',
    };
  },
};

/* ========================================================================== */
/* Fotos da comunidade (UGC)                                                  */
/* ========================================================================== */

const seedPhotos: UGCPhoto[] = [
  {
    id: 'ugc_seed_1',
    beachId: 'praia-de-itamambuca',
    imageUrl: '',
    authorName: 'Marina Prado',
    authorInstagram: '@marinaprado.ubatuba',
    status: 'aprovada',
    isCoverCandidate: true,
    createdAt: '2026-08-30T12:00:00.000Z',
    moderatedAt: '2026-08-31T09:00:00.000Z',
  },
  {
    id: 'ugc_seed_2',
    beachId: 'praia-da-burguesa',
    imageUrl: '',
    authorName: 'Rafael Torres',
    authorInstagram: '@rafaeltorres.fotos',
    status: 'aprovada',
    isCoverCandidate: false,
    createdAt: '2026-09-02T15:30:00.000Z',
    moderatedAt: '2026-09-03T10:15:00.000Z',
  },
  {
    id: 'ugc_seed_3',
    beachId: 'praia-de-paranambuco',
    imageUrl: '',
    authorName: 'Juliana Menezes',
    authorInstagram: '@ju.trails',
    status: 'pendente',
    isCoverCandidate: true,
    createdAt: '2026-09-11T08:20:00.000Z',
  },
];

export const photosRepo = {
  async listAll(): Promise<UGCPhoto[]> {
    const local = readJSON<UGCPhoto[]>(STORAGE_KEYS.photos, []);
    const remote = await tryQuery<UGCPhoto[]>(async (c) => {
      const { data, error } = await c
        .from('ugc_photos')
        .select('*')
        .order('created_at', { ascending: false });
      return { data: (data as UGCPhoto[] | null) ?? null, error };
    });
    if (remote && remote.length > 0) {
      const localOnly = local.filter((l) => !remote.some((r) => r.id === l.id));
      return [...remote, ...localOnly];
    }
    return [...local, ...seedPhotos].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  /** Fotos aprovadas de uma praia (galeria colaborativa). */
  async listApprovedByBeach(beachId: string): Promise<UGCPhoto[]> {
    const all = await photosRepo.listAll();
    return all.filter((p) => p.beachId === beachId && p.status === 'aprovada');
  },

  async submit(input: {
    beachId: string;
    imageUrl: string;
    authorName: string;
    authorInstagram: string;
  }): Promise<UGCPhoto> {
    const photo: UGCPhoto = {
      id: uid('ugc'),
      beachId: input.beachId,
      imageUrl: input.imageUrl,
      authorName: input.authorName.trim(),
      authorInstagram: input.authorInstagram.trim(),
      status: 'pendente',
      isCoverCandidate: true,
      createdAt: nowISO(),
    };
    const local = readJSON<UGCPhoto[]>(STORAGE_KEYS.photos, []);
    writeJSON(STORAGE_KEYS.photos, [photo, ...local]);

    void tryQuery(async (c) => {
      const { id, ...rest } = photo;
      return c.from('ugc_photos').insert(rest as Record<string, unknown>);
    });
    return photo;
  },

  async moderate(
    id: string,
    status: ModerationStatus,
    options: { isCoverCandidate?: boolean; notes?: string } = {}
  ): Promise<void> {
    const local = readJSON<UGCPhoto[]>(STORAGE_KEYS.photos, []);
    writeJSON(
      STORAGE_KEYS.photos,
      local.map((p) =>
        p.id === id
          ? {
              ...p,
              status,
              moderatedAt: nowISO(),
              isCoverCandidate: options.isCoverCandidate ?? p.isCoverCandidate,
              moderatorNotes: options.notes,
            }
          : p
      )
    );
    void tryQuery(async (c) =>
      c
        .from('ugc_photos')
        .update({
          status,
          moderated_at: nowISO(),
          is_cover_candidate: options.isCoverCandidate ?? null,
          moderator_notes: options.notes ?? null,
        })
        .eq('id', id)
    );
  },

  async remove(id: string): Promise<void> {
    const local = readJSON<UGCPhoto[]>(STORAGE_KEYS.photos, []);
    writeJSON(
      STORAGE_KEYS.photos,
      local.filter((p) => p.id !== id)
    );
    void tryQuery(async (c) => c.from('ugc_photos').delete().eq('id', id));
  },
};

/* ========================================================================== */
/* Banners                                                                    */
/* ========================================================================== */

export const bannersRepo = {
  async list(position?: BannerPosition): Promise<Banner[]> {
    const override = readJSON<Banner[]>(STORAGE_KEYS.banners, []);
    const today = new Date().toISOString().slice(0, 10);
    const byId = new Map(seedBanners.map((b) => [b.id, b]));
    for (const b of override) byId.set(b.id, b);

    let list = [...byId.values()].filter((b) => {
      if (!b.isActive) return false;
      if (b.startDate && b.startDate > today) return false;
      if (b.endDate && b.endDate < today) return false;
      return true;
    });
    if (position) list = list.filter((b) => b.position === position);
    return list;
  },

  async save(banner: Banner): Promise<Banner> {
    const override = readJSON<Banner[]>(STORAGE_KEYS.banners, []);
    const idx = override.findIndex((b) => b.id === banner.id);
    if (idx >= 0) override[idx] = banner;
    else override.unshift(banner);
    writeJSON(STORAGE_KEYS.banners, override);

    void tryQuery(async (c) => {
      if (banner.id.startsWith('novo_')) {
        const { id, ...rest } = banner;
        return c.from('banners').insert(rest as Record<string, unknown>);
      }
      return c.from('banners').upsert(banner as unknown as Record<string, unknown>);
    });
    return banner;
  },

  async remove(id: string): Promise<void> {
    const override = readJSON<Banner[]>(STORAGE_KEYS.banners, []);
    writeJSON(
      STORAGE_KEYS.banners,
      override.filter((b) => b.id !== id)
    );
    void tryQuery(async (c) => c.from('banners').update({ is_active: false }).eq('id', id));
  },

  /** Registra o clique localmente e no banco (métrica de retorno do plano Master). */
  trackClick(id: string): void {
    const clicks = readJSON<Record<string, number>>(STORAGE_KEYS.bannerClicks, {});
    clicks[id] = (clicks[id] ?? 0) + 1;
    writeJSON(STORAGE_KEYS.bannerClicks, clicks);
    void tryQuery(async (c) =>
      c.from('banners').update({ clicks_count: (clicks[id] ?? 1) }).eq('id', id)
    );
  },
};

/* ========================================================================== */

export const dataSource: 'supabase' | 'local' = isSupabaseConfigured ? 'supabase' : 'local';
