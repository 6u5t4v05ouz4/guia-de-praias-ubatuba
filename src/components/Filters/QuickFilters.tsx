import { BEACH_TAGS, REGION_LABEL, REGIONS, type BeachTag, type RegionType } from '@/types';
import type { BeachFilters } from '../Modals/FilterModal';
import './QuickFilters.css';

interface QuickFiltersProps {
  value: BeachFilters;
  onChange: (value: BeachFilters) => void;
  onOpenAdvanced: () => void;
  resultCount: number;
  totalCount: number;
}

/**
 * Filtros rápidos da aba Praias (SPEC §3.1): região e perfil de experiência
 * logo abaixo da busca, sem obrigar o usuário a abrir um modal.
 */
export function QuickFilters({
  value,
  onChange,
  onOpenAdvanced,
  resultCount,
  totalCount,
}: QuickFiltersProps) {
  const toggleTag = (tag: BeachTag) => {
    onChange({
      ...value,
      tags: value.tags.includes(tag) ? value.tags.filter((t) => t !== tag) : [...value.tags, tag],
    });
  };

  const activeCount =
    (value.region !== 'todas' ? 1 : 0) + value.tags.length + (value.ownWaterOnly ? 1 : 0);

  return (
    <div className="quick-filters">
      <div className="quick-filters__row">
        <div className="quick-filters__scroll" role="group" aria-label="Filtrar por região">
          <button
            type="button"
            className={`chip chip--sm ${value.region === 'todas' ? 'is-active' : ''}`}
            onClick={() => onChange({ ...value, region: 'todas' })}
            aria-pressed={value.region === 'todas'}
          >
            🗺️ Todas
          </button>
          {REGIONS.map((r: RegionType) => (
            <button
              key={r}
              type="button"
              className={`chip chip--sm ${value.region === r ? 'is-active' : ''}`}
              onClick={() => onChange({ ...value, region: r })}
              aria-pressed={value.region === r}
            >
              {REGION_LABEL[r]}
            </button>
          ))}
        </div>

        <button
          type="button"
          className={`quick-filters__more ${activeCount > 0 ? 'has-active' : ''}`}
          onClick={onOpenAdvanced}
          aria-label="Abrir filtros avançados"
        >
          ⚙️ Filtros
          {activeCount > 0 && <span className="quick-filters__count">{activeCount}</span>}
        </button>
      </div>

      <div className="quick-filters__scroll" role="group" aria-label="Filtrar por perfil">
        {(Object.keys(BEACH_TAGS) as BeachTag[]).map((tag) => (
          <button
            key={tag}
            type="button"
            className={`chip chip--sm ${value.tags.includes(tag) ? 'is-active' : ''}`}
            onClick={() => toggleTag(tag)}
            aria-pressed={value.tags.includes(tag)}
          >
            <span aria-hidden="true">{BEACH_TAGS[tag].emoji}</span> {BEACH_TAGS[tag].label}
          </button>
        ))}
      </div>

      {/* `aria-live` sem `role` para preservar o papel de heading na árvore de acessibilidade. */}
      <h2 className="quick-filters__result" aria-live="polite">
        {resultCount === totalCount
          ? `${totalCount} praias no catálogo`
          : `${resultCount} de ${totalCount} praias`}
      </h2>
    </div>
  );
}
