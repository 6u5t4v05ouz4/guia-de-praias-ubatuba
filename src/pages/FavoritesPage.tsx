import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Beach, Partner } from '@/types';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { useApp } from '@/context/AppContext';
import { beachesRepo, beachNameOf, partnersRepo } from '@/services/repository';
import { TopBar } from '@/components/Navigation/TopBar';
import { BeachCard } from '@/components/BeachCard/BeachCard';
import { PartnerCard } from '@/components/PartnerCard/PartnerCard';
import './FavoritesPage.css';

/** Aba 3 — Meus Salvos (SPEC §3.3). 100% offline por construção. */
export function FavoritesPage() {
  const { beachIds, partnerIds, toggleBeach, togglePartner, clearAll, total } = useApp();
  const navigate = useNavigate();

  // O catálogo vem do repositório, mas os ids salvos são resolvidos por ele
  // também: se a praia não existe mais, ela simplesmente não aparece.
  const { data } = useAsyncResource<{ beaches: Beach[]; partners: Partner[] }>(
    async () => {
      const [beachList, partnerList] = await Promise.all([
        beachesRepo.list(),
        partnersRepo.list(),
      ]);
      return {
        beaches: beachList.filter((b) => beachIds.includes(b.id)),
        partners: partnerList.filter((p) => partnerIds.includes(p.id) && p.isActive),
      };
    },
    [beachIds.join(','), partnerIds.join(',')]
  );

  const savedBeaches = data?.beaches ?? [];
  const savedPartners = data?.partners ?? [];

  const missingCount = useMemo(
    () => total - savedBeaches.length - savedPartners.length,
    [total, savedBeaches.length, savedPartners.length]
  );

  return (
    <div className="page">
      <div className="container">
        <TopBar
          title="Meus Salvos"
          subtitle={
            total === 0
              ? 'Nada salvo ainda'
              : `${total} item${total === 1 ? '' : 's'} • disponível offline`
          }
        >
          {total > 0 && (
            <button
              type="button"
              className="btn btn--sm btn--ghost"
              onClick={() => {
                if (window.confirm('Remover todos os salvos deste dispositivo?')) clearAll();
              }}
            >
              Limpar
            </button>
          )}
        </TopBar>

        {total === 0 ? (
          <div className="empty-state">
            <div className="empty-state__emoji">⭐</div>
            <p className="empty-state__title">Você ainda não salvou nada</p>
            <p className="subtle">
              Toque no coração de uma praia ou salve um serviço. Tudo fica guardado no seu
              aparelho e abre instantaneamente, mesmo sem 4G no meio da praia.
            </p>
            <Link className="btn btn--primary" to="/praias" style={{ marginTop: 'var(--space-4)' }}>
              Explorar praias
            </Link>
          </div>
        ) : (
          <>
            {savedBeaches.length > 0 && (
              <section className="section" style={{ marginTop: 0 }}>
                <div className="section__head">
                  <h2 className="section__title">🏖️ Praias salvas</h2>
                  <span className="subtle">{savedBeaches.length}</span>
                </div>
                <div className="beach-grid">
                  {savedBeaches.map((b) => (
                    <BeachCard
                      key={b.id}
                      beach={b}
                      isFavorite
                      onToggleFavorite={toggleBeach}
                      onOpen={(id) => navigate(`/praia/${id}`)}
                    />
                  ))}
                </div>
              </section>
            )}

            {savedPartners.length > 0 && (
              <section className="section">
                <div className="section__head">
                  <h2 className="section__title">🛎️ Serviços salvos</h2>
                  <span className="subtle">{savedPartners.length}</span>
                </div>
                <div className="partner-grid">
                  {savedPartners.map((p) => (
                    <PartnerCard
                      key={p.id}
                      partner={p}
                      beachName={beachNameOf(p.beachId)}
                      isSaved
                      onToggleSave={togglePartner}
                    />                  ))}
                </div>
              </section>
            )}

            {missingCount > 0 && (
              <p className="notice notice--info">
                {missingCount} item(ns) salvo(s) não estão mais disponíveis no catálogo atual.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
