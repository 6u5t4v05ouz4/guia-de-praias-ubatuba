import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  PARTNER_CATEGORIES,
  PARTNER_CATEGORY_LIST,
  REGION_LABEL,
  REGIONS,
  type Partner,
  type PartnerCategory,
  type RegionType,
} from '@/types';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { useApp } from '@/context/AppContext';
import { beachNameOf, beachesRepo, partnersRepo } from '@/services/repository';
import type { Beach } from '@/types';
import { TopBar } from '@/components/Navigation/TopBar';
import { BannerCarousel } from '@/components/BannerCarousel/BannerCarousel';
import { PartnerCard } from '@/components/PartnerCard/PartnerCard';
import './ServicesPage.css';

type CategoryFilter = PartnerCategory | 'todas';

/** Aba 2 — Serviços & Onde Ir (SPEC §3.2). */
export function ServicesPage() {
  const { isPartnerFavorite, togglePartner } = useApp();
  const { data, loading } = useAsyncResource<Partner[]>(() => partnersRepo.list(), []);

  const [params, setParams] = useSearchParams();
  const beachParam = params.get('praia') ?? '';

  const [category, setCategory] = useState<CategoryFilter>('todas');
  const [region, setRegion] = useState<RegionType | 'todas'>('todas');
  const [query, setQuery] = useState('');

  const all = (data ?? []).filter((p) => p.isActive);
  // Contexto `?praia=<id>`: resolve a praia pelo repositório para que beaches
  // criadas no /admin também funcionem aqui.
  const { data: beachFilter } = useAsyncResource<Beach | null>(
    async () => (beachParam ? ((await beachesRepo.getById(beachParam)) ?? null) : null),
    [beachParam]
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all
      .filter((p) => {
        if (beachFilter) {
          // Foco na praia: parceiros da própria praia + destaque regional.
          if (p.beachId !== beachFilter.id && p.region !== beachFilter.region) return false;
        }
        if (category !== 'todas' && p.category !== category) return false;
        if (region !== 'todas' && p.region !== region) return false;
        if (q) {
          const hay = `${p.name} ${p.shortDescription} ${p.highlights?.join(' ')}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      // Destaques VIP primeiro — é o que o plano VIP promete (BUSINESS_MODEL §2).
      .sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || a.name.localeCompare(b.name));
  }, [all, category, region, query, beachFilter]);

  const featured = all.filter((p) => p.isFeatured);

  return (
    <div className="page">
      <div className="container">
        <TopBar
          title="Serviços & Onde Ir"
          subtitle={`${all.length} parceiros verificados em Ubatuba`}
        />

        {beachFilter ? (
          <div className="context-banner">
            <div className="stack">
              <span className="eyebrow">Mostrando em</span>
              <strong>{beachFilter.name}</strong>
            </div>
            <button
              type="button"
              className="btn btn--sm btn--secondary"
              onClick={() => {
                params.delete('praia');
                setParams(params, { replace: true });
              }}
            >
              Ver tudo
            </button>
          </div>
        ) : (
          <BannerCarousel position="services_top" />
        )}

        <div className="search search--compact">
          <span className="search__icon" aria-hidden="true">
            🔍
          </span>
          <input
            className="search__input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar quiosque, pousada, escolinha de surf…"
            aria-label="Buscar parceiro"
          />
        </div>

        {!beachFilter && (
          <>
            <div className="section__head" style={{ marginTop: 'var(--space-5)' }}>
              <h2 className="section__title">⭐ Destaques do Guia</h2>
            </div>
            <div className="featured-strip">
              {featured.map((p) => (
                <PartnerCard
                  key={p.id}
                  partner={p}
                beachName={
                  p.beachId
                    ? beachNameOf(p.beachId)
                    : `Atende ${REGION_LABEL[p.region]}`
                }
                  isSaved={isPartnerFavorite(p.id)}
                  onToggleSave={togglePartner}
                  compact
                />
              ))}
            </div>
          </>
        )}

        <nav className="cat-nav" aria-label="Categorias de serviços">
          <button
            type="button"
            className={`cat-nav__item ${category === 'todas' ? 'is-active' : ''}`}
            onClick={() => setCategory('todas')}
          >
            <span aria-hidden="true">✨</span> Todos
          </button>
          {PARTNER_CATEGORY_LIST.map((c) => (
            <button
              key={c}
              type="button"
              className={`cat-nav__item ${category === c ? 'is-active' : ''}`}
              onClick={() => setCategory(category === c ? 'todas' : c)}
              aria-pressed={category === c}
            >
              <span aria-hidden="true">{PARTNER_CATEGORIES[c].emoji}</span>
              {PARTNER_CATEGORIES[c].short}
            </button>
          ))}
        </nav>

        <div className="region-tabs" role="group" aria-label="Filtrar por região">
          {(['todas', ...REGIONS] as const).map((r) => (
            <button
              key={r}
              type="button"
              className={`chip chip--sm ${region === r ? 'is-active' : ''}`}
              onClick={() => setRegion(r)}
              aria-pressed={region === r}
            >
              {r === 'todas' ? '🗺️ Todas' : REGION_LABEL[r]}
            </button>
          ))}
        </div>

        <p className="quick-filters__result" role="status" aria-live="polite">
          {results.length} parceiro{results.length === 1 ? '' : 's'} encontrado
          {results.length === 1 ? '' : 's'}
        </p>

        {loading ? (
          <div className="partner-grid" style={{ marginTop: 'var(--space-4)' }}>
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="skeleton" style={{ height: 160, borderRadius: 20 }} />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__emoji">🏪</div>
            <p className="empty-state__title">Nenhum parceiro com esses filtros</p>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => {
                setCategory('todas');
                setRegion('todas');
                setQuery('');
              }}
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="partner-grid" style={{ marginTop: 'var(--space-4)' }}>
            {results.map((p) => (
              <PartnerCard
                key={p.id}
                partner={p}
                beachName={p.beachId ? beachNameOf(p.beachId) : undefined}
                isSaved={isPartnerFavorite(p.id)}
                onToggleSave={togglePartner}
              />
            ))}
          </div>
        )}

        <section className="card card__body business-cta">
          <h3>É parceiro e quer aparecer aqui?</h3>
          <p>
            Listagem básica gratuita, perfil verificado com botão de WhatsApp por R$ 69/mês e
            destaque VIP na praia que você atua.
          </p>
          <a
            className="btn btn--whatsapp"
            href="https://wa.me/5512000000000?text=Ol%C3%A1!%20Quero%20ser%20parceiro%20do%20Guia%20de%20Praias%20Ubatuba"
            target="_blank"
            rel="noopener noreferrer"
          >
            💬 Quero ser parceiro
          </a>
        </section>
      </div>
    </div>
  );
}
