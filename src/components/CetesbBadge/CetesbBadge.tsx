import { cetesbBadgeDataUrl } from '@/assets/beachArt';
import type { CetesbStatus } from '@/types';
import './CetesbBadge.css';

interface CetesbBadgeProps {
  status: CetesbStatus;
  lastUpdate: string;
  size?: 'sm' | 'md';
}

/** Indicador visual de balneabilidade (SPEC §3.1) com a data da última aferição. */
export function CetesbBadge({ status, lastUpdate, size = 'md' }: CetesbBadgeProps) {
  const own = status === 'propria';
  const formatted = new Date(`${lastUpdate}T12:00:00`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className={`cetesb cetesb--${size} ${own ? 'is-own' : 'is-bad'}`}>
      <img
        className="cetesb__mark"
        src={cetesbBadgeDataUrl(status, size === 'sm' ? 24 : 32)}
        alt=""
        aria-hidden="true"
      />
      <div className="cetesb__text">
        <strong className="cetesb__label">
          {own ? 'Água própria para banho' : 'Água imprópria para banho'}
        </strong>
        <span className="cetesb__date">CETESB · {formatted}</span>
      </div>
    </div>
  );
}
