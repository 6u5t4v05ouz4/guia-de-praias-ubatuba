import { useMemo, useRef, useState } from 'react';
import {
  BEACH_TAGS,
  REGION_LABEL,
  REGIONS,
  type Beach,
  type BeachTag,
  type CetesbStatus,
  type RegionType,
  type TrailDifficulty,
} from '@/types';
import { beachArtDataUrl } from '@/assets/beachArt';
import { beachesRepo } from '@/services/repository';
import { slugify } from '@/services/links';
import { formatBytes } from '@/services/image';
import { uploadImage, UploadError, type UploadFolder } from '@/services/uploads';
import { dataSource } from '@/services/repository';
import './BeachesModule.css';

/**
 * Módulo 5 do painel — CRUD de praia.
 *
 * O catálogo semente (`src/data/beaches.ts`) continua no bundle para garantir o
 * primeiro carregamento offline; o que o admin cria ou edita é gravado como
 * override local e sincronizado no Supabase quando configurado. A capa é
 * opcional: sem `coverImage`, o app usa a arte procedural (`beachArt.ts`).
 */

interface BeachesModuleProps {
  beaches: Beach[];
  onDone: () => Promise<void>;
  notify: (m: string, t?: 'success' | 'error' | 'info') => void;
}

const EMPTY_TAGS: BeachTag[] = [];
const ALL_TAGS = Object.keys(BEACH_TAGS) as BeachTag[];

export function BeachesModule({ beaches, onDone, notify }: BeachesModuleProps) {
  const [editing, setEditing] = useState<Beach | null>(null);
  const [query, setQuery] = useState('');
  const [showInactive, setShowInactive] = useState(true);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return beaches.filter((b) => {
      if (!showInactive && b.isActive === false) return false;
      if (q && !`${b.name} ${b.km} ${b.region}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [beaches, query, showInactive]);

  const inactiveCount = beaches.filter((b) => b.isActive === false).length;

  const save = async (beach: Beach) => {
    const name = beach.name.trim();
    if (name.length < 3) return notify('Informe o nome da praia (mínimo 3 letras).', 'error');
    if (!Number.isFinite(beach.km) || beach.km < 0) {
      return notify('Informe um KM válido para a BR-101.', 'error');
    }
    if (beach.coordinates.lat === 0 && beach.coordinates.lng === 0) {
      return notify('Informe as coordenadas (lat/lng) para o botão de rota.', 'error');
    }

    // Normaliza o id a partir do nome quando o admin cria uma praia nova.
    const id = beach.id.startsWith('novo_') ? slugify(name) || beach.id : beach.id;
    await beachesRepo.save({ ...beach, id, name, isActive: beach.isActive !== false });

    setEditing(null);
    await onDone();
    notify(`Praia "${name}" salva${dataSource === 'local' ? ' neste dispositivo' : ''}.`);
  };

  const remove = async (beach: Beach) => {
    const isSeedOnly = !beach.id.startsWith('novo_');
    const message = isSeedOnly
      ? `Remover "${beach.name}" do app?\n\nEla sai das listagens, mas o registro continua guardado e editável aqui.`
      : `Excluir "${beach.name}" definitivamente? Esta ação não pode ser desfeita.`;
    if (!window.confirm(message)) return;

    await beachesRepo.remove(beach.id);
    if (editing?.id === beach.id) setEditing(null);
    await onDone();
    notify(isSeedOnly ? 'Praia removida do app.' : 'Praia excluída.', 'info');
  };

  return (
    <section className="stack stack-4">
      <div className="card card__body stack stack-3">
        <div className="row row-2 row--between row--wrap">
          <div className="stack">
            <h2 className="section__title">🏖️ Catálogo de praias</h2>
            <span className="subtle">
              {beaches.length} cadastradas · {inactiveCount} fora do app · {list.length} listadas
            </span>
          </div>
          <div className="row row-2 row--wrap">
            <button
              type="button"
              className="btn btn--sm btn--secondary"
              onClick={() => {
                if (
                  window.confirm(
                    'Descartar todas as alterações locais de praia e voltar ao catálogo do código?'
                  )
                ) {
                  beachesRepo.reset();
                  void onDone();
                  notify('Catálogo original restaurado.', 'info');
                }
              }}
              disabled={inactiveCount === 0}
            >
              Restaurar original
            </button>
            <button
              type="button"
              className="btn btn--sm btn--primary"
              onClick={() => setEditing(beachesRepo.newDraft())}
            >
              + Nova praia
            </button>
          </div>
        </div>

        <div className="row row-2 row--wrap">
          <input
            className="input grow"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome, KM ou região…"
            aria-label="Buscar praia"
          />
          <label className="switch">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
            <span className="switch__track" aria-hidden="true">
              <span className="switch__thumb" />
            </span>
            <span className="switch__text">Mostrar fora do app</span>
          </label>
        </div>

        <p className="field__hint">
          {dataSource === 'local'
            ? 'Modo local: as alterações ficam neste navegador (localStorage). Configure o Supabase para sincronizar entre dispositivos.'
            : 'As alterações são gravadas no Supabase e aparecem para todos os usuários.'}{' '}
          Criar uma praia aqui também gera a arte procedural automaticamente quando não houver imagem.
        </p>
      </div>

      {editing && (
        <BeachForm beach={editing} onCancel={() => setEditing(null)} onSave={save} notify={notify} />
      )}

      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Praia</th>
              <th>Região</th>
              <th>KM</th>
              <th>Tags</th>
              <th>CETESB</th>
              <th>Imagem</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {list.map((b) => (
              <tr key={b.id} className={b.isActive === false ? 'is-off' : ''}>
                <td>
                  <strong>{b.name}</strong>
                  <div className="subtle mono">{b.id}</div>
                </td>
                <td>{REGION_LABEL[b.region]}</td>
                <td className="mono">{b.km.toFixed(1)}</td>
                <td className="mono">{b.tags.length}</td>
                <td>
                  <span className={`pill ${b.cetesbStatus === 'propria' ? 'pill--forest' : 'pill--coral'}`}>
                    {b.cetesbStatus === 'propria' ? '💚' : '🔴'}
                  </span>
                </td>
                <td>{b.coverImage ? '📷 Foto' : '🎨 Arte'}</td>
                <td>
                  <div className="row row-1">
                    <button
                      type="button"
                      className="btn btn--sm btn--secondary"
                      onClick={() => setEditing(b)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => void remove(b)}
                      aria-label={`Remover ${b.name}`}
                      title="Remover do app"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ========================================================================== */
/* Formulário                                                                 */
/* ========================================================================== */

function BeachForm({
  beach,
  onCancel,
  onSave,
  notify,
}: {
  beach: Beach;
  onCancel: () => void;
  onSave: (b: Beach) => Promise<void>;
  notify: (m: string, t?: 'success' | 'error' | 'info') => void;
}) {
  const [draft, setDraft] = useState<Beach>(beach);
  const [tags, setTags] = useState<BeachTag[]>(beach.tags ?? EMPTY_TAGS);
  const [tipsText, setTipsText] = useState((beach.tips ?? []).join('\n'));
  const [uploading, setUploading] = useState<null | 'cover' | `gallery-${number}`>(null);
  const [idTouched, setIdTouched] = useState(!beach.id.startsWith('novo_'));
  const coverInput = useRef<HTMLInputElement>(null);

  const set = <K extends keyof Beach>(key: K, value: Beach[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const setFeature = (key: keyof Beach['features'], value: boolean) =>
    setDraft((d) => ({ ...d, features: { ...d.features, [key]: value } }));

  /** Mantém o slug em sincronia com o nome enquanto o admin não editar à mão. */
  const onNameChange = (name: string) => {
    setDraft((d) => (idTouched ? { ...d, name } : { ...d, name, id: slugify(name) || d.id }));
  };

  const toggleTag = (tag: BeachTag) =>
    setTags((t) => (t.includes(tag) ? t.filter((x) => x !== tag) : [...t, tag]));

  const handleUpload = async (file: File | undefined, folder: UploadFolder) => {
    if (!file) return;
    setUploading(folder === 'covers' ? 'cover' : `gallery-${draft.gallery.length}`);
    try {
      const result = await uploadImage(file, folder);
      if (folder === 'covers') {
        set('coverImage', result.url);
        notify(
          result.persisted === 'storage'
            ? `Imagem enviada (${result.width}×${result.height}, ${formatBytes(result.bytes)}).`
            : `Imagem guardada localmente (${formatBytes(result.bytes)}). Configure o Supabase para publicá-la.`,
          'info'
        );
      } else {
        set('gallery', [
          ...draft.gallery,
          { url: result.url, author: draft.coverAuthor || 'Equipe do Guia' },
        ]);
      }
    } catch (err) {
      notify(err instanceof UploadError ? err.message : 'Falha ao enviar a imagem.', 'error');
    } finally {
      setUploading(null);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tips = tipsText
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);
    await onSave({ ...draft, tags, tips });
  };

  const previewBeach: Beach = { ...draft, tags, tips: tipsText.split('\n').filter(Boolean) };

  return (
    <form className="card card__body admin-form" onSubmit={submit}>
      <h2 className="admin-form__title">
        {beach.id.startsWith('novo_') ? 'Nova praia' : `Editar: ${beach.name}`}
      </h2>

      {/* ------------------------- Identificação ------------------------- */}
      <div className="admin-form__grid">
        <div className="field">
          <label className="field__label" htmlFor="bf-name">
            Nome
          </label>
          <input
            id="bf-name"
            className="input"
            value={draft.name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Praia de Itamambuca"
            required
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="bf-id">
            Slug da URL
          </label>
          <input
            id="bf-id"
            className="input mono"
            value={draft.id}
            onChange={(e) => {
              setIdTouched(true);
              set('id', slugify(e.target.value) || e.target.value);
            }}
            placeholder="praia-de-itamambuca"
          />
          <span className="field__hint">Fica em /praia/{draft.id || '…'}</span>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="bf-region">
            Região
          </label>
          <select
            id="bf-region"
            className="select"
            value={draft.region}
            onChange={(e) => set('region', e.target.value as RegionType)}
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {REGION_LABEL[r]}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="bf-km">
            KM da BR-101
          </label>
          <input
            id="bf-km"
            className="input mono"
            type="number"
            step="0.1"
            min="0"
            value={draft.km}
            onChange={(e) => set('km', Number(e.target.value))}
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="bf-dist">
            Distância do centro (km)
          </label>
          <input
            id="bf-dist"
            className="input mono"
            type="number"
            step="0.1"
            min="0"
            value={draft.distanceFromCenterKm}
            onChange={(e) => set('distanceFromCenterKm', Number(e.target.value))}
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="bf-cetesb">
            Balneabilidade
          </label>
          <select
            id="bf-cetesb"
            className="select"
            value={draft.cetesbStatus}
            onChange={(e) => set('cetesbStatus', e.target.value as CetesbStatus)}
          >
            <option value="propria">💚 Água própria</option>
            <option value="impropria">🔴 Água imprópria</option>
          </select>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="bf-cetesbdate">
            Data da aferição CETESB
          </label>
          <input
            id="bf-cetesbdate"
            className="input mono"
            type="date"
            value={draft.cetesbLastUpdate}
            onChange={(e) => set('cetesbLastUpdate', e.target.value)}
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="bf-lat">
            Latitude
          </label>
          <input
            id="bf-lat"
            className="input mono"
            type="number"
            step="0.0001"
            value={draft.coordinates.lat}
            onChange={(e) =>
              set('coordinates', { ...draft.coordinates, lat: Number(e.target.value) })
            }
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="bf-lng">
            Longitude
          </label>
          <input
            id="bf-lng"
            className="input mono"
            type="number"
            step="0.0001"
            value={draft.coordinates.lng}
            onChange={(e) =>
              set('coordinates', { ...draft.coordinates, lng: Number(e.target.value) })
            }
          />
        </div>
      </div>

      {/* ---------------------------- Imagens ----------------------------- */}
      <div className="beaches-form__media">
        <div className="stack stack-2">
          <span className="field__label">Imagem de capa</span>
          <div className="beaches-form__cover">
            {draft.coverImage ? (
              <img src={draft.coverImage} alt="Pré-visualização da capa" />
            ) : (
              <img
                src={beachArtDataUrl(previewBeach)}
                alt="Arte procedural que será usada enquanto não houver foto"
              />
            )}
            {uploading === 'cover' && <span className="spinner" aria-label="Enviando…" />}
          </div>
          <div className="row row-2 row--wrap">
            <button
              type="button"
              className="btn btn--sm btn--secondary"
              onClick={() => coverInput.current?.click()}
              disabled={uploading === 'cover'}
            >
              📷 Enviar foto
            </button>
            {draft.coverImage && (
              <button
                type="button"
                className="btn btn--sm btn--ghost"
                onClick={() => set('coverImage', '')}
              >
                Remover e usar arte
              </button>
            )}
            <input
              ref={coverInput}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                void handleUpload(e.target.files?.[0], 'covers');
                e.target.value = '';
              }}
            />
          </div>
          <span className="field__hint">
            Opcional. Sem foto, o app gera uma arte única para esta praia — sempre disponível
            offline e sem custo de carregamento.
          </span>
        </div>

        <div className="stack stack-2">
          <span className="field__label">Crédito da capa</span>
          <div className="field">
            <label className="field__label" htmlFor="bf-coverauthor" hidden>
              Autor
            </label>
            <input
              id="bf-coverauthor"
              className="input"
              value={draft.coverAuthor ?? ''}
              onChange={(e) => set('coverAuthor', e.target.value || undefined)}
              placeholder="Nome do fotógrafo"
            />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="bf-coverig" hidden>
              Instagram
            </label>
            <input
              id="bf-coverig"
              className="input"
              value={draft.coverAuthorInstagram ?? ''}
              onChange={(e) => set('coverAuthorInstagram', e.target.value || undefined)}
              placeholder="@instagram"
            />
          </div>
          <span className="field__hint">
            Aparece como “📸 Foto por @…” no carrossel.
          </span>
        </div>
      </div>

      {/* -------------------------- Galeria ------------------------------ */}
      <div className="stack stack-2">
        <span className="field__label">Galeria da praia</span>
        {draft.gallery.length > 0 && (
          <ul className="beaches-form__gallery">
            {draft.gallery.map((g, i) => (
              <li key={`${g.url}-${i}`} className="beaches-form__gallery-item">
                <img src={g.url || beachArtDataUrl(previewBeach, { variant: i + 1 })} alt="" />
                <div className="grow stack">
                  <input
                    className="input input--sm"
                    value={g.author}
                    onChange={(e) =>
                      set(
                        'gallery',
                        draft.gallery.map((x, j) =>
                          j === i ? { ...x, author: e.target.value } : x
                        )
                      )
                    }
                    placeholder="Autor"
                  />
                  <input
                    className="input input--sm"
                    value={g.instagram ?? ''}
                    onChange={(e) =>
                      set(
                        'gallery',
                        draft.gallery.map((x, j) =>
                          j === i ? { ...x, instagram: e.target.value || undefined } : x
                        )
                      )
                    }
                    placeholder="@instagram"
                  />
                </div>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => set('gallery', draft.gallery.filter((_, j) => j !== i))}
                  aria-label="Remover foto da galeria"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
        <div>
          <label className="btn btn--sm btn--secondary" htmlFor="bf-gallery">
            {uploading?.startsWith('gallery') ? 'Enviando…' : '+ Adicionar foto'}
          </label>
          <input
            id="bf-gallery"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              void handleUpload(e.target.files?.[0], 'gallery');
              e.target.value = '';
            }}
          />
        </div>
      </div>

      {/* ------------------------- Textos ------------------------------- */}
      <div className="field">
        <label className="field__label" htmlFor="bf-desc">
          Descrição
        </label>
        <textarea
          id="bf-desc"
          className="textarea"
          value={draft.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="O que torna esta praia especial…"
          maxLength={600}
        />
      </div>

      <div className="field">
        <label className="field__label" htmlFor="bf-how">
          Como chegar
        </label>
        <textarea
          id="bf-how"
          className="textarea"
          value={draft.howToGet}
          onChange={(e) => set('howToGet', e.target.value)}
          placeholder="BR-101 km X, sentido sul. Entrada à direita…"
          maxLength={600}
        />
      </div>

      <div className="field">
        <label className="field__label" htmlFor="bf-tips">
          Dicas de ouro (uma por linha)
        </label>
        <textarea
          id="bf-tips"
          className="textarea"
          value={tipsText}
          onChange={(e) => setTipsText(e.target.value)}
          placeholder={'Leve protetor solar.\nEstacionamento lota antes das 9h.'}
        />
        <span className="field__hint">
          {tipsText.split('\n').filter((t) => t.trim()).length} dica(s)
        </span>
      </div>

      {/* -------------------------- Tags --------------------------------- */}
      <div className="field">
        <span className="field__label">Perfil da praia ({tags.length} selecionada(s))</span>
        <div className="filter-chips">
          {ALL_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`chip chip--sm ${tags.includes(tag) ? 'is-active' : ''}`}
              onClick={() => toggleTag(tag)}
              aria-pressed={tags.includes(tag)}
            >
              <span aria-hidden="true">{BEACH_TAGS[tag].emoji}</span> {BEACH_TAGS[tag].label}
            </button>
          ))}
        </div>
      </div>

      {/* ---------------------- Infraestrutura -------------------------- */}
      <div className="field">
        <span className="field__label">Infraestrutura</span>
        <div className="row row-4 row--wrap">
          <label className="switch">
            <input
              type="checkbox"
              checked={draft.features.hasParking}
              onChange={(e) => setFeature('hasParking', e.target.checked)}
            />
            <span className="switch__track" aria-hidden="true">
              <span className="switch__thumb" />
            </span>
            <span className="switch__text">Estacionamento</span>
          </label>
          <label className="switch">
            <input
              type="checkbox"
              checked={draft.features.hasKiosks}
              onChange={(e) => setFeature('hasKiosks', e.target.checked)}
            />
            <span className="switch__track" aria-hidden="true">
              <span className="switch__thumb" />
            </span>
            <span className="switch__text">Quiosques</span>
          </label>
          <label className="switch">
            <input
              type="checkbox"
              checked={draft.features.hasLifeguard}
              onChange={(e) => setFeature('hasLifeguard', e.target.checked)}
            />
            <span className="switch__track" aria-hidden="true">
              <span className="switch__thumb" />
            </span>
            <span className="switch__text">Salva-vidas</span>
          </label>
          <label className="switch">
            <input
              type="checkbox"
              checked={draft.features.hasBoatTours}
              onChange={(e) => setFeature('hasBoatTours', e.target.checked)}
            />
            <span className="switch__track" aria-hidden="true">
              <span className="switch__thumb" />
            </span>
            <span className="switch__text">Passeios de barco</span>
          </label>
        </div>
      </div>

      <div className="admin-form__grid">
        <div className="field">
          <label className="field__label" htmlFor="bf-trail">
            Dificuldade da trilha
          </label>
          <select
            id="bf-trail"
            className="select"
            value={draft.features.trailDifficulty ?? ''}
            onChange={(e) =>
              setDraft((d) => {
                const value = e.target.value as TrailDifficulty | '';
                const features = { ...d.features };
                if (value === '') delete features.trailDifficulty;
                else features.trailDifficulty = value;
                return { ...d, features };
              })
            }
          >
            <option value="">Sem trilha</option>
            <option value="facil">Fácil</option>
            <option value="moderada">Moderada</option>
            <option value="dificil">Difícil</option>
          </select>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="bf-trailtime">
            Tempo de caminhada (minutos)
          </label>
          <input
            id="bf-trailtime"
            className="input mono"
            type="number"
            min="0"
            step="5"
            value={draft.features.trailDurationMinutes ?? ''}
            onChange={(e) =>
              setDraft((d) => {
                const features = { ...d.features };
                if (e.target.value === '') delete features.trailDurationMinutes;
                else features.trailDurationMinutes = Number(e.target.value);
                return { ...d, features };
              })
            }
          />
        </div>
      </div>

      <label className="switch">
        <input
          type="checkbox"
          checked={draft.isActive !== false}
          onChange={(e) => set('isActive', e.target.checked)}
        />
        <span className="switch__track" aria-hidden="true">
          <span className="switch__thumb" />
        </span>
        <span className="switch__text">
          <strong>Visível no app</strong>
          <span className="subtle">Desmarque para tirar das listagens sem perder o registro.</span>
        </span>
      </label>

      <div className="row row-2">
        <button type="button" className="btn btn--secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn btn--primary grow">
          Salvar praia
        </button>
      </div>
    </form>
  );
}
