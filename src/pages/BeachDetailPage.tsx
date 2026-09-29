import { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  BEACH_TAGS,
  REGION_LABEL,
  type Beach,
  type Partner,
  type UGCPhoto,
} from '@/types';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { useApp } from '@/context/AppContext';
import { beachesRepo, beachNameOf, partnersRepo, photosRepo } from '@/services/repository';
import { googleMapsLink, openExternal, wazeLink } from '@/services/links';
import { TRAIL_LABEL } from '@/assets/beachArt';
import { TopBar } from '@/components/Navigation/TopBar';
import { BeachImage } from '@/components/BeachCard/BeachImage';
import { PhotoCarousel, type CarouselSlide } from '@/components/PhotoCarousel/PhotoCarousel';
import { CetesbBadge } from '@/components/CetesbBadge/CetesbBadge';
import { PartnerCard } from '@/components/PartnerCard/PartnerCard';
import { PhotoUploadModal } from '@/components/Modals/PhotoUploadModal';
import './BeachDetailPage.css';

interface BeachBundle {
  beach: Beach | null;
  partners: Partner[];
  photos: UGCPhoto[];
}

export function BeachDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isBeachFavorite, toggleBeach, isPartnerFavorite, togglePartner, notify } = useApp();
  const [uploadOpen, setUploadOpen] = useState(false);

  const { data, loading } = useAsyncResource<BeachBundle>(
    async () => {
      const beach = (await beachesRepo.getById(id)) ?? null;
      if (!beach) return { beach: null, partners: [], photos: [] };
      const [allPartners, photos] = await Promise.all([
        partnersRepo.list(),
        photosRepo.listApprovedByBeach(id),
      ]);
      return {
        beach,
        partners: allPartners.filter(
          (p) => p.isActive && (p.beachId === id || p.region === beach.region)
        ),
        photos,
      };
    },
    [id]
  );

  const beach = data?.beach ?? null;
  const favorite = beach ? isBeachFavorite(beach.id) : false;

  const slides = useMemo<CarouselSlide[]>(() => {
    if (!beach) return [];
    const list: CarouselSlide[] = [
      {
        id: `cover-${beach.id}`,
        beach,
        url: beach.coverImage,
        variant: 0,
        author: beach.coverAuthor ?? 'Equipe do Guia',
        instagram: beach.coverAuthorInstagram,
      },
      ...beach.gallery.map((g, i) => ({
        id: `gal-${beach.id}-${i}`,
        beach,
        url: g.url,
        variant: i + 1,
        author: g.author,
        instagram: g.instagram,
      })),
      ...(data?.photos ?? []).map((p) => ({
        id: `ugc-${p.id}`,
        beach,
        url: p.imageUrl,
        variant: 3,
        author: p.authorName,
        instagram: p.authorInstagram,
      })),
    ];
    return list;
  }, [beach, data?.photos]);

  const onToggleFavorite = useCallback(() => {
    if (!beach) return;
    const added = toggleBeach(beach.id);
    notify(
      added ? `${beach.name} salva — disponível mesmo sem sinal.` : `${beach.name} removida dos salvos.`,
      'info'
    );
  }, [beach, toggleBeach, notify]);

  if (loading) {
    return (
      <div className="page">
        <div className="container stack stack-4">
          <div className="skeleton" style={{ height: 48, borderRadius: 14 }} />
          <div className="skeleton" style={{ height: 320, borderRadius: 20 }} />
          <div className="skeleton" style={{ height: 90, borderRadius: 16 }} />
        </div>
      </div>
    );
  }

  if (!beach) {
    return (
      <div className="page">
        <div className="container">
          <TopBar title="Praia não encontrada" backTo="/praias" backLabel="Voltar às praias" />
          <div className="empty-state">
            <div className="empty-state__emoji">🧭</div>
            <p className="empty-state__title">Não achamos essa praia no catálogo</p>
            <p className="subtle">Ela pode ter sido removida ou o link está errado.</p>
            <Link className="btn btn--primary" to="/praias" style={{ marginTop: 'var(--space-4)' }}>
              Ver todas as praias
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const mapTarget = { lat: beach.coordinates.lat, lng: beach.coordinates.lng, name: beach.name };
  const f = beach.features;

  return (
    <div className="page beach-detail">
      <div className="container">
        <TopBar title={beach.name} backTo="/praias" backLabel="Voltar às praias">
          <button
            type="button"
            className="icon-btn"
            onClick={onToggleFavorite}
            aria-pressed={favorite}
            aria-label={favorite ? 'Remover dos salvos' : 'Salvar para ver depois'}
          >
            {favorite ? '❤️' : '🤍'}
          </button>
        </TopBar>
      </div>

      <div className="container beach-detail__hero">
        <PhotoCarousel slides={slides} community={data?.photos} />
      </div>

      <div className="container stack stack-4 beach-detail__body">
        {/* Identificação */}
        <header className="stack stack-2">
          <div className="row row-2 row--wrap">
            <span className="pill pill--sand">{REGION_LABEL[beach.region]}</span>
            <span className="pill pill--muted">BR-101 km {beach.km.toFixed(1)}</span>
            <span className="pill pill--muted">{beach.distanceFromCenterKm.toFixed(1)} km do centro</span>
          </div>
          <p className="lead">{beach.description}</p>
        </header>

        {/* Ações rápidas (SPEC §4.2) */}
        <div className="action-bar">
          <button
            type="button"
            className={`action-bar__item ${favorite ? 'is-active' : ''}`}
            onClick={onToggleFavorite}
          >
            <span aria-hidden="true">{favorite ? '❤️' : '🤍'}</span>
            {favorite ? 'Salva' : 'Salvar'}
          </button>
          <button
            type="button"
            className="action-bar__item"
            onClick={() => openExternal(googleMapsLink(mapTarget))}
          >
            <span aria-hidden="true">🗺️</span>
            Google Maps
          </button>
          <button
            type="button"
            className="action-bar__item"
            onClick={() => openExternal(wazeLink(mapTarget))}
          >
            <span aria-hidden="true">🚗</span>
            Waze
          </button>
          <button
            type="button"
            className="action-bar__item"
            onClick={() => setUploadOpen(true)}
          >
            <span aria-hidden="true">📸</span>
            Enviar foto
          </button>
        </div>

        {/* Balneabilidade + perfil do mar */}
        <section className="section">
          <div className="section__head">
            <h2 className="section__title">💧 Água e condições</h2>
          </div>
          <div className="stack stack-3">
            <CetesbBadge status={beach.cetesbStatus} lastUpdate={beach.cetesbLastUpdate} />
            <ul className="pill-row">
              {beach.tags.map((tag) => (
                <li key={tag} className="pill">
                  <span aria-hidden="true">{BEACH_TAGS[tag].emoji}</span>
                  {BEACH_TAGS[tag].label}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Como chegar (SPEC §4.4) */}
        <section className="section">
          <div className="section__head">
            <h2 className="section__title">🚗 Como chegar</h2>
          </div>
          <div className="card card__body prose">
            <p>{beach.howToGet}</p>
          </div>
          <ul className="feature-grid">
            <li className={`feature ${f.hasParking ? 'is-on' : ''}`}>
              <span aria-hidden="true">🅿️</span> Estacionamento
            </li>
            <li className={`feature ${f.hasKiosks ? 'is-on' : ''}`}>
              <span aria-hidden="true">🍹</span> Quiosques
            </li>
            <li className={`feature ${f.hasLifeguard ? 'is-on' : ''}`}>
              <span aria-hidden="true">🏊</span> Salva-vidas
            </li>
            <li className={`feature ${f.hasBoatTours ? 'is-on' : ''}`}>
              <span aria-hidden="true">⛵</span> Passeios de barco
            </li>
          </ul>
          {f.trailDifficulty && (
            <p className="trail-note">
              🥾 {TRAIL_LABEL[f.trailDifficulty]}
              {f.trailDurationMinutes ? ` · cerca de ${f.trailDurationMinutes} min de caminhada` : ''}
            </p>
          )}
        </section>

        {/* Dicas de ouro (SPEC §4.4) */}
        <section className="section">
          <div className="section__head">
            <h2 className="section__title">💡 Dicas de ouro</h2>
          </div>
          <ul className="tips">
            {beach.tips.map((tip) => (
              <li key={tip} className="tips__item">
                <span aria-hidden="true">✦</span>
                {tip}
              </li>
            ))}
          </ul>
        </section>

        {/* Parceiros na praia (SPEC §4.5) */}
        <section className="section">
          <div className="section__head">
            <h2 className="section__title">🛎️ Parceiros nesta praia</h2>
            <Link className="section__link" to={`/servicos?praia=${beach.id}`}>
              Ver todos →
            </Link>
          </div>
          {data?.partners.length ? (
            <div className="stack stack-3">
              {data.partners.slice(0, 4).map((p) => (
                <PartnerCard
                  key={p.id}
                  partner={p}
                  beachName={
                    p.beachId
                      ? beachNameOf(p.beachId)
                      : `Atende ${REGION_LABEL[beach.region]}`
                  }
                  isSaved={isPartnerFavorite(p.id)}
                  onToggleSave={togglePartner}
                />
              ))}
            </div>
          ) : (
            <p className="card card__body muted">
              Ainda não há parceiros cadastrados aqui. Enquanto isso, veja a aba de serviços.
            </p>
          )}
        </section>

        {/* Galeria colaborativa (SPEC §4.6) */}
        <section className="section">
          <div className="section__head">
            <h2 className="section__title">📸 Galeria da comunidade</h2>
            <button type="button" className="section__link" onClick={() => setUploadOpen(true)}>
              Enviar a minha →
            </button>
          </div>
          {data?.photos.length ? (
            <ul className="ugc-grid">
              {data.photos.map((p) => (
                <li key={p.id} className="ugc-grid__item">
                  <BeachImage beach={beach} src={p.imageUrl} variant={3} alt={`Foto de ${p.authorName}`} />
                  <span className="ugc-grid__credit">
                    {p.authorInstagram || p.authorName}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="card card__body text-center">
              <p className="muted">
                Seja o primeiro a enviar uma foto de {beach.name}. Sua foto aparece aqui com o
                crédito do seu Instagram.
              </p>
              <button
                type="button"
                className="btn btn--primary"
                style={{ marginTop: 'var(--space-3)' }}
                onClick={() => setUploadOpen(true)}
              >
                📸 Enviar foto
              </button>
            </div>
          )}
        </section>

        {/* CTA de navegação */}
        <div className="stack stack-2 beach-detail__cta">
          <a
            className="btn btn--primary btn--block"
            href={googleMapsLink(mapTarget)}
            target="_blank"
            rel="noopener noreferrer"
          >
            🗺️ Abrir rota para {beach.name}
          </a>
          <button type="button" className="btn btn--ghost btn--block" onClick={() => navigate('/praias')}>
            ← Ver outras praias
          </button>
        </div>
      </div>

      <PhotoUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        beachId={beach.id}
        onSubmitted={notify}
      />
    </div>
  );
}
