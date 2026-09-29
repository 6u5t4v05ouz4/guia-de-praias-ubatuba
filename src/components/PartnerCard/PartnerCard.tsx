import { useState } from 'react';
import { PARTNER_CATEGORIES, PARTNER_PLAN_LABEL, type Partner } from '@/types';
import { partnerArtDataUrl } from '@/assets/partnerArt';
import { whatsappLink } from '@/services/links';
import './PartnerCard.css';

interface PartnerCardProps {
  partner: Partner;
  /** Nome da praia onde o parceiro atua, para contextualizar o card. */
  beachName?: string;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
  compact?: boolean;
}

/**
 * Card do parceiro. O botão de WhatsApp é a peça central do modelo de negócio
 * (docs/BUSINESS_MODEL.md §2): é ele que converte visita em lead rastreável.
 */
export function PartnerCard({
  partner,
  beachName,
  isSaved = false,
  onToggleSave,
  compact = false,
}: PartnerCardProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const cat = PARTNER_CATEGORIES[partner.category];
  const logo = partner.logoUrl && !imgFailed ? partner.logoUrl : partnerArtDataUrl(partner);
  const href = whatsappLink(partner.whatsapp, partner.defaultMessage);
  const verified = partner.plan && partner.plan !== 'basico';

  return (
    <article className={`partner-card ${compact ? 'partner-card--compact' : ''}`}>
      <div className="partner-card__logo">
        <img
          src={logo}
          alt={`Logo de ${partner.name}`}
          loading="lazy"
          decoding="async"
          onError={() => setImgFailed(true)}
        />
      </div>

      <div className="partner-card__body">
        <div className="row row-2 row--wrap">
          <h3 className="partner-card__name">{partner.name}</h3>
          {verified && (
            <span className="pill partner-card__verified" title={PARTNER_PLAN_LABEL[partner.plan!]}>
              ✓ {PARTNER_PLAN_LABEL[partner.plan!]}
            </span>
          )}
        </div>

        <p className="partner-card__cat">
          <span aria-hidden="true">{cat.emoji}</span> {cat.label}
          {beachName && (
            <>
              {' '}
              · <span className="muted">{beachName}</span>
            </>
          )}
        </p>

        <p className="partner-card__desc clamp-2">{partner.shortDescription}</p>

        {!compact && partner.discountInfo && (
          <p className="partner-card__discount">🎁 {partner.discountInfo}</p>
        )}

        {partner.highlights && partner.highlights.length > 0 && !compact && (
          <ul className="pill-row partner-card__highlights">
            {partner.highlights.slice(0, 3).map((h) => (
              <li key={h} className="pill pill--muted">
                {h}
              </li>
            ))}
          </ul>
        )}

        <div className="partner-card__actions">
          <a
            className="btn btn--whatsapp grow"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Chamar no WhatsApp — ${partner.name}`}
          >
            <span aria-hidden="true">💬</span> Chamar no WhatsApp
          </a>
          {onToggleSave && (
            <button
              type="button"
              className={`icon-btn ${isSaved ? 'is-active' : ''}`}
              onClick={() => onToggleSave(partner.id)}
              aria-pressed={isSaved}
              aria-label={isSaved ? `Remover ${partner.name} dos salvos` : `Salvar ${partner.name}`}
            >
              {isSaved ? '⭐' : '☆'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
