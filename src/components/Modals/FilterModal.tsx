import { BEACH_TAGS, REGION_LABEL, REGIONS, type BeachTag, type RegionType } from '@/types';
import { Modal } from './Modal';
import './FilterModal.css';

export interface BeachFilters {
  region: RegionType | 'todas';
  tags: BeachTag[];
  ownWaterOnly: boolean;
}

interface FilterModalProps {
  open: boolean;
  onClose: () => void;
  value: BeachFilters;
  onApply: (value: BeachFilters) => void;
  resultCount: number;
}

const TAG_LIST = Object.keys(BEACH_TAGS) as BeachTag[];

/** Filtros avançados, acessíveis pelo botão "Filtros" da aba Praias. */
export function FilterModal({ open, onClose, value, onApply, resultCount }: FilterModalProps) {
  const toggleTag = (tag: BeachTag) => {
    const next = value.tags.includes(tag)
      ? value.tags.filter((t) => t !== tag)
      : [...value.tags, tag];
    onApply({ ...value, tags: next });
  };

  const activeCount =
    (value.region !== 'todas' ? 1 : 0) + value.tags.length + (value.ownWaterOnly ? 1 : 0);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Filtros"
      subtitle={`${resultCount} praia${resultCount === 1 ? '' : 's'} encontrada${resultCount === 1 ? '' : 's'}`}
      footer={
        <>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => onApply({ region: 'todas', tags: [], ownWaterOnly: false })}
            disabled={activeCount === 0}
          >
            Limpar
          </button>
          <button type="button" className="btn btn--primary" onClick={onClose}>
            Ver resultados
          </button>
        </>
      }
    >
      <fieldset className="filter-group">
        <legend className="field__label">Região</legend>
        <div className="filter-chips">
          <button
            type="button"
            className={`chip ${value.region === 'todas' ? 'is-active' : ''}`}
            onClick={() => onApply({ ...value, region: 'todas' })}
            aria-pressed={value.region === 'todas'}
          >
            🗺️ Todas
          </button>
          {REGIONS.map((r) => (
            <button
              key={r}
              type="button"
              className={`chip ${value.region === r ? 'is-active' : ''}`}
              onClick={() => onApply({ ...value, region: r })}
              aria-pressed={value.region === r}
            >
              {REGION_LABEL[r]}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="filter-group">
        <legend className="field__label">Perfil da viagem</legend>
        <div className="filter-chips">
          {TAG_LIST.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`chip ${value.tags.includes(tag) ? 'is-active' : ''}`}
              onClick={() => toggleTag(tag)}
              aria-pressed={value.tags.includes(tag)}
            >
              <span aria-hidden="true">{BEACH_TAGS[tag].emoji}</span> {BEACH_TAGS[tag].label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="filter-group">
        <legend className="field__label">Balneabilidade</legend>
        <label className="switch">
          <input
            type="checkbox"
            checked={value.ownWaterOnly}
            onChange={(e) => onApply({ ...value, ownWaterOnly: e.target.checked })}
          />
          <span className="switch__track" aria-hidden="true">
            <span className="switch__thumb" />
          </span>
          <span className="switch__text">
            <strong>Só beaches com água própria</strong>
            <span className="subtle">Última aferição da CETESB</span>
          </span>
        </label>
      </fieldset>
    </Modal>
  );
}
