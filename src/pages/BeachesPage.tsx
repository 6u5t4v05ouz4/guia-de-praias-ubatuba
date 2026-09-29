import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { useApp } from '@/context/AppContext';
import { beachesRepo } from '@/services/repository';
import type { Beach } from '@/types';
import { TopBar } from '@/components/Navigation/TopBar';
import { BannerCarousel } from '@/components/BannerCarousel/BannerCarousel';
import { BeachCard, BeachCardSkeleton } from '@/components/BeachCard/BeachCard';
import { QuickFilters } from '@/components/Filters/QuickFilters';
import { FilterModal, type BeachFilters } from '@/components/Modals/FilterModal';
import './BeachesPage.css';

const INITIAL: BeachFilters = { region: 'todas', tags: [], ownWaterOnly: false };

/** Aba 1 — Catálogo de praias com busca, filtros e favoritos offline. */
export function BeachesPage() {
  const navigate = useNavigate();
  const { isBeachFavorite, toggleBeach, notify } = useApp();
  const { data, loading, error } = useAsyncResource<Beach[]>(() => beachesRepo.list(), []);

  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<BeachFilters>(INITIAL);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const all = data ?? [];

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((b) => {
      if (filters.region !== 'todas' && b.region !== filters.region) return false;
      if (filters.ownWaterOnly && b.cetesbStatus !== 'propria') return false;
      if (filters.tags.length > 0 && !filters.tags.every((t) => b.tags.includes(t))) return false;
      if (q) {
        const haystack = `${b.name} ${b.description} ${b.tags.join(' ')} ${b.km}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [all, query, filters]);

  const openBeach = (id: string) => navigate(`/praia/${id}`);

  const onToggleFavorite = (id: string) => {
    const added = toggleBeach(id);
    const beach = all.find((b) => b.id === id);
    notify(
      added
        ? `${beach?.name ?? 'Praia'} salva para ver depois — disponível offline.`
        : `${beach?.name ?? 'Praia'} removida dos salvos.`,
      'info'
    );
  };

  return (
    <div className="page">
      <div className="container">
        <TopBar
          title="Praias de Ubatuba"
          subtitle={`${all.length || '…'} beaches catalogadas • Capital do Surfe`}
        >
          <a className="icon-btn" href="/guia" aria-label="Guia da cidade">
            ℹ️
          </a>
        </TopBar>

        <div className="search">
          <span className="search__icon" aria-hidden="true">
            🔍
          </span>
          <input
            className="search__input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar praia, bairro ou KM…"
            aria-label="Buscar praia"
            enterKeyHint="search"
          />
          {query && (
            <button
              type="button"
              className="search__clear"
              onClick={() => setQuery('')}
              aria-label="Limpar busca"
            >
              ×
            </button>
          )}
        </div>

        <BannerCarousel position="home_top" />

        <QuickFilters
          value={filters}
          onChange={setFilters}
          onOpenAdvanced={() => setFiltersOpen(true)}
          resultCount={results.length}
          totalCount={all.length}
        />

        {error && (
          <p className="notice notice--error">
            Não foi possível carregar o catálogo agora. Os dados salvos continuam acessíveis.
          </p>
        )}

        {loading ? (
          <div className="beach-grid">
            {Array.from({ length: 6 }, (_, i) => (
              <BeachCardSkeleton key={i} />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__emoji">🏝️</div>
            <p className="empty-state__title">Nenhuma praia com esses filtros</p>
            <p className="subtle">
              Tente remover algum filtro ou buscar por outro termo.
            </p>
            <button
              type="button"
              className="btn btn--secondary"
              style={{ marginTop: 'var(--space-4)' }}
              onClick={() => {
                setQuery('');
                setFilters(INITIAL);
              }}
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="beach-grid">
            {results.map((b) => (
              <BeachCard
                key={b.id}
                beach={b}
                isFavorite={isBeachFavorite(b.id)}
                onToggleFavorite={onToggleFavorite}
                onOpen={openBeach}
              />
            ))}
          </div>
        )}
      </div>

      <FilterModal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        value={filters}
        onApply={setFilters}
        resultCount={results.length}
      />
    </div>
  );
}
