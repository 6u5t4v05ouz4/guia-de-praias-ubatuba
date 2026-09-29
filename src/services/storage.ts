/**
 * Abstração de persistência local (cache e estado do usuário).
 *
 * Estratégia (docs/ARCHITECTURE.md §3.2):
 *  - O catálogo de beaches/utilities vem embutido no bundle (ver `src/data`).
 *  - O que o *usuário* produz — favoritos, fotos enviadas, banners do admin,
 *    alterações de balneabilidade — é gravado em `localStorage`, para que o app
 *    funcione 100% offline mesmo sem backend.
 *
 * Quando o Supabase está configurado, o `repository.ts` usa o banco como fonte
 * da verdade e replica as escritas do usuário aqui como espelho local.
 */

const PREFIX = 'guia-ubatuba:';

export const STORAGE_KEYS = {
  favorites: `${PREFIX}favorites`,
  savedPartners: `${PREFIX}saved-partners`,
  photos: `${PREFIX}ugc-photos`,
  beaches: `${PREFIX}beaches-override`,
  partners: `${PREFIX}partners-override`,
  banners: `${PREFIX}banners-override`,
  cetesb: `${PREFIX}cetesb-override`,
  adminSession: `${PREFIX}admin-session`,
  onboarding: `${PREFIX}onboarding-done`,
  bannerClicks: `${PREFIX}banner-clicks`,
  lastSync: `${PREFIX}last-sync`,
} as const;

function available(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const probe = `${PREFIX}__probe`;
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    // Modo privado do Safari / cota estourada / iframe bloqueado.
    return false;
  }
}

/** Espelho em memória para quando o localStorage não estiver disponível. */
const memory = new Map<string, string>();

const backend = {
  get(key: string): string | null {
    if (available()) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        /* cai no espelho */
      }
    }
    return memory.get(key) ?? null;
  },
  set(key: string, value: string): void {
    if (available()) {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch {
        /* cota estourada: cai no espelho */
      }
    }
    memory.set(key, value);
  },
  remove(key: string): void {
    if (available()) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        /* noop */
      }
    }
    memory.delete(key);
  },
};

/* -------------------------------------------------------------------------- */

export function readJSON<T>(key: string, fallback: T): T {
  const raw = backend.get(key);
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    // Dado corrompido: descarta em vez de derrubar a aplicação.
    backend.remove(key);
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): void {
  try {
    backend.set(key, JSON.stringify(value));
  } catch {
    // Valor não serializável — nunca deve acontecer com nossos modelos.
    console.warn('[storage] falha ao serializar', key);
  }
}

export function removeKey(key: string): void {
  backend.remove(key);
}

/** Remove todas as chaves do app (usado pelo botão "limpar dados" do /admin). */
export function clearAppStorage(): void {
  for (const key of Object.values(STORAGE_KEYS)) backend.remove(key);
  memory.clear();
}

export const storage = {
  get: backend.get,
  set: backend.set,
  remove: backend.remove,
  isPersistent: available,
};

/* -------------------------------------------------------------------------- */
/* ID e datas                                                                 */
/* -------------------------------------------------------------------------- */

export function uid(prefix = 'id'): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}${rand}`;
}

export function nowISO(): string {
  return new Date().toISOString();
}
