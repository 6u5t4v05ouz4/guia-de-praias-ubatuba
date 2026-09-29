import { BEACH_TAGS, REGION_LABEL, type Beach } from '@/types';
import { BeachImage } from './BeachImage';
import './BeachCard.css';

interface BeachCardProps {
  beach: Beach;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onOpen: (id: string) => void;
}

/** Card da praia na listagem: capa, região + KM, pílulas de perfil e balneabilidade. */
export function BeachCard({ beach, isFavorite, onToggleFavorite, onOpen }: BeachCardProps) {
  const own = beach.cetesbStatus === 'propria';

  return (
    <article className="beach-card">
      <button
        type="button"
        className="beach-card__hit"
        onClick={() => onOpen(beach.id)}
        aria-label={`Ver detalhes de ${beach.name}`}
      />

      <div className="beach-card__media">
        <BeachImage beach={beach} />
        <div className="beach-card__badges">
          <span className={`pill beach-card__cetesb ${own ? 'pill--forest' : 'pill--coral'}`}>
            {own ? '💚 Própria' : '🔴 Imprópria'}
          </span>
        </div>
        <button
          type="button"
          className={`icon-btn icon-btn--on-glass beach-card__fav ${isFavorite ? 'is-active' : ''}`}
          onClick={() => onToggleFavorite(beach.id)}
          aria-pressed={isFavorite}
          aria-label={
            isFavorite
              ? `Remover ${beach.name} dos salvos`
              : `Salvar ${beach.name} para ver depois`
          }
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
      </div>

      <div className="beach-card__body">
        <div className="row row-2 row--wrap">
          <h3 className="beach-card__title truncate">{beach.name}</h3>
        </div>
        <p className="beach-card__meta">
          <span className="pill pill--sand">{REGION_LABEL[beach.region]}</span>
          <span className="subtle">
            BR-101 km {beach.km.toFixed(1)} · {beach.distanceFromCenterKm.toFixed(1)} km do centro
          </span>
        </p>
        <ul className="pill-row">
          {beach.tags.slice(0, 3).map((tag) => (
            <li key={tag} className="pill">
              <span aria-hidden="true">{BEACH_TAGS[tag].emoji}</span>
              {BEACH_TAGS[tag].label}
            </li>
          ))}
          {beach.tags.length > 3 && <li className="pill pill--muted">+{beach.tags.length - 3}</li>}
        </ul>
      </div>
    </article>
  );
}

/** Placeholder usado enquanto a lista carrega — evita layout saltando. */
export function BeachCardSkeleton() {
  return (
    <div className="beach-card" aria-hidden="true">
      <div className="beach-card__media skeleton" />
      <div className="beach-card__body stack stack-2">
        <div className="skeleton" style={{ height: 18, width: '65%' }} />
        <div className="skeleton" style={{ height: 12, width: '90%' }} />
        <div className="skeleton" style={{ height: 22, width: '45%' }} />
      </div>
    </div>
  );
}
