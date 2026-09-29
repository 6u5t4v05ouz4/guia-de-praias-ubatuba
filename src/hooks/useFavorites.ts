import { useCallback, useEffect, useState } from 'react';
import { STORAGE_KEYS, readJSON, writeJSON } from '@/services/storage';

/**
 * Favoritos (praias e parceiros) — o coração do modo offline.
 *
 * Regra do SPEC §3.3: salvar precisa ser instantâneo e funcionar sem sinal.
 * Por isso a escrita é síncrona no `localStorage` e a UI já reflete a mudança
 * antes de qualquer chamada de rede.
 */

function readSet(key: string): string[] {
  return readJSON<string[]>(key, []);
}

export interface FavoritesApi {
  beachIds: string[];
  partnerIds: string[];
  isBeachFavorite: (id: string) => boolean;
  isPartnerFavorite: (id: string) => boolean;
  toggleBeach: (id: string) => boolean;
  togglePartner: (id: string) => boolean;
  clearAll: () => void;
  total: number;
}

export function useFavorites(): FavoritesApi {
  const [beachIds, setBeachIds] = useState<string[]>(() => readSet(STORAGE_KEYS.favorites));
  const [partnerIds, setPartnerIds] = useState<string[]>(() =>
    readSet(STORAGE_KEYS.savedPartners)
  );

  // Mantém múltiplas abas em sincronia.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.favorites) setBeachIds(readSet(STORAGE_KEYS.favorites));
      if (e.key === STORAGE_KEYS.savedPartners) {
        setPartnerIds(readSet(STORAGE_KEYS.savedPartners));
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggle = useCallback(
    (id: string, ids: string[], set: (v: string[]) => void, key: string) => {
      const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
      set(next);
      writeJSON(key, next);
      return next.length > ids.length;
    },
    []
  );

  const toggleBeach = useCallback(
    (id: string) => toggle(id, beachIds, setBeachIds, STORAGE_KEYS.favorites),
    [beachIds, toggle]
  );

  const togglePartner = useCallback(
    (id: string) => toggle(id, partnerIds, setPartnerIds, STORAGE_KEYS.savedPartners),
    [partnerIds, toggle]
  );

  const clearAll = useCallback(() => {
    setBeachIds([]);
    setPartnerIds([]);
    writeJSON(STORAGE_KEYS.favorites, []);
    writeJSON(STORAGE_KEYS.savedPartners, []);
  }, []);

  return {
    beachIds,
    partnerIds,
    isBeachFavorite: useCallback((id: string) => beachIds.includes(id), [beachIds]),
    isPartnerFavorite: useCallback((id: string) => partnerIds.includes(id), [partnerIds]),
    toggleBeach,
    togglePartner,
    clearAll,
    total: beachIds.length + partnerIds.length,
  };
}
