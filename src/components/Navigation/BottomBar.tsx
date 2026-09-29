import { NavLink } from 'react-router-dom';
import './BottomBar.css';

const TABS = [
  { to: '/praias', label: 'Praias', emoji: '🏖️' },
  { to: '/servicos', label: 'Serviços', emoji: '🛎️' },
  { to: '/salvos', label: 'Salvos', emoji: '⭐' },
  { to: '/guia', label: 'Guia', emoji: 'ℹ️' },
] as const;

interface BottomBarProps {
  savedCount: number;
}

/** Barra de navegação inferior (SPEC §3) — o alvo de polegar do app mobile. */
export function BottomBar({ savedCount }: BottomBarProps) {
  return (
    <nav className="bottom-bar" aria-label="Navegação principal">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) => `bottom-bar__tab ${isActive ? 'is-active' : ''}`}
        >
          <span className="bottom-bar__icon" aria-hidden="true">
            {tab.emoji}
            {tab.to === '/salvos' && savedCount > 0 && (
              <span className="bottom-bar__badge">{savedCount > 99 ? '99+' : savedCount}</span>
            )}
          </span>
          <span className="bottom-bar__label">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
