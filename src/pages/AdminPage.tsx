import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BANNER_POSITION_LABEL,
  MODERATION_LABEL,
  PARTNER_CATEGORIES,
  PARTNER_CATEGORY_LIST,
  REGIONS,
  REGION_LABEL,
  type Banner,
  type BannerPosition,
  type Beach,
  type CetesbStatus,
  type ModerationStatus,
  type Partner,
  type PartnerCategory,
  type RegionType,
  type UGCPhoto,
} from '@/types';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { useApp } from '@/context/AppContext';
import { beachesRepo, bannersRepo, cetesbRepo, partnersRepo, photosRepo } from '@/services/repository';
import { auth, isDevPassword } from '@/services/auth';
import { dataSource } from '@/services/repository';
import { BeachesModule } from '@/components/admin/BeachesModule';
import { uid } from '@/services/storage';
import { normalizePhone } from '@/services/links';
import './AdminPage.css';

type Module = 'moderacao' | 'praias' | 'parceiros' | 'banners' | 'cetesb';

const MODULES: Array<{ id: Module; label: string; emoji: string }> = [
  { id: 'moderacao', label: 'Fotos', emoji: '📸' },
  { id: 'praias', label: 'Praias', emoji: '🏖️' },
  { id: 'parceiros', label: 'Parceiros', emoji: '🤝' },
  { id: 'banners', label: 'Banners', emoji: '🎞️' },
  { id: 'cetesb', label: 'CETESB', emoji: '💧' },
];

interface AdminData {
  beaches: Beach[];
  partners: Partner[];
  photos: UGCPhoto[];
  banners: Banner[];
}

export function AdminPage() {
  const navigate = useNavigate();
  const { notify } = useApp();
  const [authed, setAuthed] = useState(() => auth.isAuthenticated());
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [module, setModule] = useState<Module>('moderacao');

  const { data, loading, reload } = useAsyncResource<AdminData>(async () => {
    const [beachList, partnerList, photoList, bannerList] = await Promise.all([
      // `listAll` para o painel também enxergar as praia desativadas.
      beachesRepo.listAll(),
      partnersRepo.list(),
      photosRepo.listAll(),
      bannersRepo.list(),
    ]);
    return {
      beaches: beachList,
      partners: partnerList,
      photos: photoList,
      banners: bannerList,
    };
  }, []);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (auth.signIn(password)) {
      setAuthed(true);
      setAuthError('');
      setPassword('');
      notify('Sessão de administrador iniciada.');
    } else {
      setAuthError('Senha incorreta.');
    }
  };

  if (!authed) {
    return (
      <div className="page">
        <div className="container admin-login">
          <div className="card card__body admin-login__card">
            <h1 className="admin-login__title">🛡️ Painel do Guia</h1>
            <p className="subtle">
              Área restrita para moderação de fotos, parceiros, banners e boletim da CETESB.
            </p>

            <form className="stack stack-3" onSubmit={handleSignIn}>
              <div className="field">
                <label className="field__label" htmlFor="admin-pass">
                  Senha de administrador
                </label>
                <input
                  id="admin-pass"
                  className="input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  autoFocus
                  required
                />
              </div>
              {authError && <p className="field__error">{authError}</p>}
              <button type="submit" className="btn btn--primary btn--block">
                Entrar
              </button>
            </form>

            {isDevPassword && (
              <p className="admin-login__hint">
                Ambiente de desenvolvimento — senha padrão: <code>ubatuba</code>. Defina
                <code> VITE_ADMIN_PASSWORD</code> antes de publicar.
              </p>
            )}

            <button
              type="button"
              className="btn btn--ghost btn--block"
              onClick={() => navigate('/')}
            >
              ← Voltar ao app
            </button>
          </div>
        </div>
      </div>
    );
  }

  const photos = data?.photos ?? [];
  const pending = photos.filter((p) => p.status === 'pendente');
  const partners = data?.partners ?? [];
  const banners = data?.banners ?? [];
  const beaches = data?.beaches ?? [];

  return (
    <div className="page">
      <div className="container">
        <header className="admin-head">
          <div className="stack">
            <h1>🛡️ Painel do Guia</h1>
            <span className="subtle">
              Fonte de dados: <strong>{dataSource === 'supabase' ? 'Supabase' : 'localStorage'}</strong>
              {pending.length > 0 && ` · ${pending.length} foto(s) aguardando moderação`}
            </span>
          </div>
          <div className="row row-2">
            <button type="button" className="btn btn--sm btn--secondary" onClick={() => void reload()}>
              ↻ Atualizar
            </button>
            <button
              type="button"
              className="btn btn--sm btn--ghost"
              onClick={() => {
                auth.signOut();
                setAuthed(false);
              }}
            >
              Sair
            </button>
          </div>
        </header>

        <div className="admin-nav" role="tablist" aria-label="Módulos do painel">
          {MODULES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={module === m.id}
              className={`admin-nav__item ${module === m.id ? 'is-active' : ''}`}
              onClick={() => setModule(m.id)}
            >
              <span aria-hidden="true">{m.emoji}</span> {m.label}
              {m.id === 'moderacao' && pending.length > 0 && (
                <span className="admin-nav__count">{pending.length}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="skeleton" style={{ height: 300, borderRadius: 20 }} />
        ) : (
          <>
            {module === 'moderacao' && (
              <ModerationModule photos={photos} beaches={beaches} onDone={reload} notify={notify} />
            )}
            {module === 'praias' && (
              <BeachesModule beaches={beaches} onDone={reload} notify={notify} />
            )}
            {module === 'parceiros' && (
              <PartnersModule partners={partners} beaches={beaches} onDone={reload} notify={notify} />
            )}
            {module === 'banners' && (
              <BannersModule banners={banners} onDone={reload} notify={notify} />
            )}
            {module === 'cetesb' && (
              <CetesbModule beaches={beaches} onDone={reload} notify={notify} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ========================================================================== */
/* Módulo 1 — Moderação de fotos                                             */
/* ========================================================================== */

function ModerationModule({
  photos,
  beaches,
  onDone,
  notify,
}: {
  photos: UGCPhoto[];
  beaches: Beach[];
  onDone: () => Promise<void>;
  notify: (m: string, t?: 'success' | 'error' | 'info') => void;
}) {
  const [filter, setFilter] = useState<ModerationStatus | 'todas'>('pendente');
  const beachName = useMemo(
    () => Object.fromEntries(beaches.map((b) => [b.id, b.name])),
    [beaches]
  );

  const list = filter === 'todas' ? photos : photos.filter((p) => p.status === filter);

  const moderate = async (id: string, status: ModerationStatus, cover?: boolean) => {
    await photosRepo.moderate(id, status, { isCoverCandidate: cover });
    await onDone();
    notify(status === 'aprovada' ? 'Foto aprovada ✅' : 'Foto rejeitada.', 'info');
  };

  const remove = async (id: string) => {
    if (!window.confirm('Remover esta foto definitivamente?')) return;
    await photosRepo.remove(id);
    await onDone();
    notify('Foto removida.', 'info');
  };

  return (
    <section className="stack stack-4">
      <div className="row row-2 row--wrap">
        {(['pendente', 'aprovada', 'rejeitada', 'todas'] as const).map((f) => (
          <button
            key={f}
            type="button"
            className={`chip chip--sm ${filter === f ? 'is-active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'todas' ? 'Todas' : MODERATION_LABEL[f]}
            <span className="count">
              {f === 'todas' ? photos.length : photos.filter((p) => p.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__emoji">✨</div>
          <p className="empty-state__title">Nada por aqui</p>
          <p className="subtle">Nenhuma foto com esse status.</p>
        </div>
      ) : (
        <ul className="mod-grid">
          {list.map((p) => (
            <li key={p.id} className="mod-card">
              <div className="mod-card__media">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={`Foto de ${p.authorName}`} />
                ) : (
                  <div className="mod-card__placeholder">🖼️ sem imagem</div>
                )}
                <span
                  className={`pill mod-card__status ${
                    p.status === 'aprovada'
                      ? 'pill--forest'
                      : p.status === 'rejeitada'
                        ? 'pill--coral'
                        : 'pill--sand'
                  }`}
                >
                  {MODERATION_LABEL[p.status]}
                </span>
              </div>
              <div className="mod-card__body">
                <strong className="truncate">{p.authorName}</strong>
                <span className="subtle truncate">{p.authorInstagram}</span>
                <span className="subtle">📍 {beachName[p.beachId] ?? p.beachId}</span>
                <span className="subtle">
                  {new Date(p.createdAt).toLocaleString('pt-BR', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
              <div className="mod-card__actions">
                {p.status !== 'aprovada' && (
                  <button
                    type="button"
                    className="btn btn--sm btn--primary"
                    onClick={() => void moderate(p.id, 'aprovada')}
                  >
                    ✓ Aprovar
                  </button>
                )}
                <button
                  type="button"
                  className={`btn btn--sm ${p.isCoverCandidate ? 'btn--primary' : 'btn--secondary'}`}
                  onClick={() => void moderate(p.id, 'aprovada', !p.isCoverCandidate)}
                  title="Define como candidata a foto de capa da semana"
                >
                  ⭐ Capa
                </button>
                {p.status !== 'rejeitada' && (
                  <button
                    type="button"
                    className="btn btn--sm btn--danger"
                    onClick={() => void moderate(p.id, 'rejeitada')}
                  >
                    ✕ Rejeitar
                  </button>
                )}
                <button
                  type="button"
                  className="icon-btn mod-card__delete"
                  onClick={() => void remove(p.id)}
                  aria-label="Remover foto"
                >
                  🗑️
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ========================================================================== */
/* Módulo 2 — Gerenciamento de parceiros                                     */
/* ========================================================================== */

function PartnersModule({
  partners,
  beaches,
  onDone,
  notify,
}: {
  partners: Partner[];
  beaches: Beach[];
  onDone: () => Promise<void>;
  notify: (m: string, t?: 'success' | 'error' | 'info') => void;
}) {
  const [editing, setEditing] = useState<Partner | null>(null);

  const save = async (p: Partner) => {
    if (!p.name.trim()) return notify('Informe o nome do parceiro.', 'error');
    if (normalizePhone(p.whatsapp).length < 10) return notify('WhatsApp inválido.', 'error');
    await partnersRepo.save({
      ...p,
      name: p.name.trim(),
      shortDescription: p.shortDescription.trim(),
      whatsapp: normalizePhone(p.whatsapp),
      defaultMessage:
        p.defaultMessage.trim() ||
        `Olá! Vi o ${p.name} no Guia de Praias Ubatuba e gostaria de mais informações.`,
    });
    setEditing(null);
    await onDone();
    notify('Parceiro salvo.');
  };

  const toggleActive = async (p: Partner) => {
    await partnersRepo.save({ ...p, isActive: !p.isActive });
    await onDone();
    notify(p.isActive ? 'Parceiro desativado.' : 'Parceiro reativado.', 'info');
  };

  const toggleFeatured = async (p: Partner) => {
    await partnersRepo.save({ ...p, isFeatured: !p.isFeatured });
    await onDone();
    notify(p.isFeatured ? 'Destaque removido.' : 'Parceiro marcado como destaque.', 'info');
  };

  return (
    <section className="stack stack-4">
      <div className="row row-2 row--between row--wrap">
        <span className="subtle">
          {partners.length} parceiros · {partners.filter((p) => p.isActive).length} ativos
        </span>
        <button
          type="button"
          className="btn btn--sm btn--primary"
          onClick={() => setEditing(partnersRepo.newDraft())}
        >
          + Novo parceiro
        </button>
      </div>

      {editing && (
        <PartnerForm
          partner={editing}
          beaches={beaches}
          onCancel={() => setEditing(null)}
          onSave={save}
        />
      )}

      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Parceiro</th>
              <th>Categoria</th>
              <th>Região</th>
              <th>WhatsApp</th>
              <th>Plano</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((p) => (
              <tr key={p.id} className={p.isActive ? '' : 'is-off'}>
                <td>
                  <strong>{p.name}</strong>
                  <div className="subtle truncate" style={{ maxWidth: 260 }}>
                    {p.shortDescription}
                  </div>
                </td>
                <td>
                  <span aria-hidden="true">{PARTNER_CATEGORIES[p.category].emoji}</span>{' '}
                  {PARTNER_CATEGORIES[p.category].short}
                </td>
                <td>{REGION_LABEL[p.region]}</td>
                <td className="mono">{p.whatsapp}</td>
                <td>
                  <span className={`pill ${p.isFeatured ? 'pill--coral' : 'pill--muted'}`}>
                    {p.isFeatured ? '⭐ Destaque' : (p.plan ?? 'basico')}
                  </span>
                </td>
                <td>
                  <div className="row row-1">
                    <button
                      type="button"
                      className="btn btn--sm btn--secondary"
                      onClick={() => setEditing(p)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => void toggleFeatured(p)}
                      title="Alternar destaque"
                      aria-label="Alternar destaque"
                    >
                      ⭐
                    </button>
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => void toggleActive(p)}
                      title={p.isActive ? 'Desativar' : 'Ativar'}
                      aria-label={p.isActive ? 'Desativar parceiro' : 'Ativar parceiro'}
                    >
                      {p.isActive ? '🚫' : '✅'}
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

function PartnerForm({
  partner,
  beaches,
  onCancel,
  onSave,
}: {
  partner: Partner;
  beaches: Beach[];
  onCancel: () => void;
  onSave: (p: Partner) => Promise<void>;
}) {
  const [draft, setDraft] = useState<Partner>(partner);
  const set = <K extends keyof Partner>(key: K, value: Partner[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  return (
    <div className="card card__body admin-form">
      <h2 className="admin-form__title">
        {partner.name ? `Editar: ${partner.name}` : 'Novo parceiro'}
      </h2>

      <div className="admin-form__grid">
        <div className="field">
          <label className="field__label" htmlFor="pf-name">
            Nome
          </label>
          <input
            id="pf-name"
            className="input"
            value={draft.name}
            onChange={(e) => set('name', e.target.value)}
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="pf-cat">
            Categoria
          </label>
          <select
            id="pf-cat"
            className="select"
            value={draft.category}
            onChange={(e) => set('category', e.target.value as PartnerCategory)}
          >
            {PARTNER_CATEGORY_LIST.map((c) => (
              <option key={c} value={c}>
                {PARTNER_CATEGORIES[c].label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="pf-region">
            Região
          </label>
          <select
            id="pf-region"
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
          <label className="field__label" htmlFor="pf-beach">
            Praia vinculada (opcional)
          </label>
          <select
            id="pf-beach"
            className="select"
            value={draft.beachId ?? ''}
            onChange={(e) => set('beachId', e.target.value || undefined)}
          >
            <option value="">Nenhuma</option>
            {beaches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="pf-wa">
            WhatsApp (com DDI)
          </label>
          <input
            id="pf-wa"
            className="input"
            value={draft.whatsapp}
            onChange={(e) => set('whatsapp', e.target.value)}
            inputMode="tel"
            placeholder="5512999999999"
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="pf-plan">
            Plano
          </label>
          <select
            id="pf-plan"
            className="select"
            value={draft.plan ?? 'basico'}
            onChange={(e) => set('plan', e.target.value as Partner['plan'])}
          >
            <option value="basico">Básico (gratuito)</option>
            <option value="verificado">Parceiro Verificado — R$ 69/mês</option>
            <option value="vip">Destaque VIP — R$ 149/mês</option>
            <option value="master">Patrocínio Master — R$ 290/mês</option>
          </select>
        </div>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="pf-desc">
          Descrição curta
        </label>
        <textarea
          id="pf-desc"
          className="textarea"
          value={draft.shortDescription}
          onChange={(e) => set('shortDescription', e.target.value)}
          maxLength={220}
        />
      </div>

      <div className="field">
        <label className="field__label" htmlFor="pf-msg">
          Mensagem padrão do lead
        </label>
        <input
          id="pf-msg"
          className="input"
          value={draft.defaultMessage}
          onChange={(e) => set('defaultMessage', e.target.value)}
        />
        <span className="field__hint">
          É essa frase que faz o comércio saber que a venda veio do Guia.
        </span>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="pf-disc">
          Benefício para o cliente (opcional)
        </label>
        <input
          id="pf-disc"
          className="input"
          value={draft.discountInfo ?? ''}
          onChange={(e) => set('discountInfo', e.target.value || undefined)}
          placeholder="10% de desconto mencionando o Guia"
        />
      </div>

      <div className="row row-2">
        <label className="switch">
          <input
            type="checkbox"
            checked={draft.isFeatured}
            onChange={(e) => set('isFeatured', e.target.checked)}
          />
          <span className="switch__track" aria-hidden="true">
            <span className="switch__thumb" />
          </span>
          <span className="switch__text">Destaque VIP</span>
        </label>

        <label className="switch">
          <input
            type="checkbox"
            checked={draft.isActive}
            onChange={(e) => set('isActive', e.target.checked)}
          />
          <span className="switch__track" aria-hidden="true">
            <span className="switch__thumb" />
          </span>
          <span className="switch__text">Ativo no app</span>
        </label>
      </div>

      <div className="row row-2">
        <button type="button" className="btn btn--secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button
          type="button"
          className="btn btn--primary grow"
          onClick={() => void onSave(draft)}
        >
          Salvar parceiro
        </button>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* Módulo 3 — Banners                                                        */
/* ========================================================================== */

function BannersModule({
  banners,
  onDone,
  notify,
}: {
  banners: Banner[];
  onDone: () => Promise<void>;
  notify: (m: string, t?: 'success' | 'error' | 'info') => void;
}) {
  const [draft, setDraft] = useState<Banner | null>(null);

  const create = () =>
    setDraft({
      id: uid('novo'),
      title: '',
      subtitle: '',
      imageUrl: '',
      targetUrl: '',
      position: 'home_top',
      isActive: true,
      clicksCount: 0,
      palette: ['#0b5c92', '#1b8ec9'],
    });

  const save = async (b: Banner) => {
    if (!b.title.trim()) return notify('Informe o título do banner.', 'error');
    if (!/^https?:\/\//i.test(b.targetUrl.trim())) {
      return notify('Informe uma URL válida (https://…) para o destino.', 'error');
    }
    await bannersRepo.save({ ...b, title: b.title.trim(), targetUrl: b.targetUrl.trim() });
    setDraft(null);
    await onDone();
    notify('Banner salvo.');
  };

  const toggle = async (b: Banner) => {
    await bannersRepo.save({ ...b, isActive: !b.isActive });
    await onDone();
  };

  const remove = async (b: Banner) => {
    if (!window.confirm(`Desativar o banner "${b.title}"?`)) return;
    await bannersRepo.remove(b.id);
    await onDone();
    notify('Banner desativado.', 'info');
  };

  return (
    <section className="stack stack-4">
      <div className="row row-2 row--between row--wrap">
        <span className="subtle">{banners.length} banner(s) configurado(s)</span>
        <button type="button" className="btn btn--sm btn--primary" onClick={create}>
          + Novo banner
        </button>
      </div>

      {draft && (
        <div className="card card__body admin-form">
          <h2 className="admin-form__title">Novo banner</h2>
          <div className="admin-form__grid">
            <div className="field">
              <label className="field__label" htmlFor="bf-title">
                Título
              </label>
              <input
                id="bf-title"
                className="input"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="bf-sub">
                Subtítulo
              </label>
              <input
                id="bf-sub"
                className="input"
                value={draft.subtitle ?? ''}
                onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
              />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="bf-pos">
                Posição
              </label>
              <select
                id="bf-pos"
                className="select"
                value={draft.position}
                onChange={(e) => setDraft({ ...draft, position: e.target.value as BannerPosition })}
              >
                {(Object.keys(BANNER_POSITION_LABEL) as BannerPosition[]).map((p) => (
                  <option key={p} value={p}>
                    {BANNER_POSITION_LABEL[p]}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="field__label" htmlFor="bf-url">
                URL de destino
              </label>
              <input
                id="bf-url"
                className="input"
                value={draft.targetUrl}
                onChange={(e) => setDraft({ ...draft, targetUrl: e.target.value })}
                placeholder="https://wa.me/55…"
              />
            </div>
          </div>
          <p className="field__hint">
            Sem imagem, o guia gera uma arte com o título e subtítulo — mantém o banner bonito
            mesmo offline.
          </p>
          <div className="row row-2">
            <button type="button" className="btn btn--secondary" onClick={() => setDraft(null)}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn--primary grow"
              onClick={() => void save(draft)}
            >
              Salvar banner
            </button>
          </div>
        </div>
      )}

      <ul className="stack stack-3">
        {banners.map((b) => (
          <li key={b.id} className={`banner-row ${b.isActive ? '' : 'is-off'}`}>
            <div className="stack grow">
              <strong>{b.title}</strong>
              <span className="subtle">
                {BANNER_POSITION_LABEL[b.position]} · {b.clicksCount} clique(s)
              </span>
              <span className="subtle truncate">{b.targetUrl}</span>
            </div>
            <div className="row row-1">
              <button
                type="button"
                className="btn btn--sm btn--secondary"
                onClick={() => setDraft({ ...b })}
              >
                Editar
              </button>
              <button
                type="button"
                className="icon-btn"
                onClick={() => void toggle(b)}
                aria-label={b.isActive ? 'Desativar banner' : 'Ativar banner'}
              >
                {b.isActive ? '🚫' : '✅'}
              </button>
              <button
                type="button"
                className="icon-btn"
                onClick={() => void remove(b)}
                aria-label="Remover banner"
              >
                🗑️
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ========================================================================== */
/* Módulo 4 — Boletim CETESB                                                 */
/* ========================================================================== */

function CetesbModule({
  beaches,
  onDone,
  notify,
}: {
  beaches: Beach[];
  onDone: () => Promise<void>;
  notify: (m: string, t?: 'success' | 'error' | 'info') => void;
}) {
  const [query, setQuery] = useState('');
  const [onlyImpróprias, setOnlyImpróprias] = useState(false);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return beaches.filter((b) => {
      if (onlyImpróprias && b.cetesbStatus !== 'impropria') return false;
      if (q && !`${b.name} ${b.km}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [beaches, query, onlyImpróprias]);

  const toggle = async (beach: Beach) => {
    const next = await cetesbRepo.toggle(beach.id);
    await onDone();
    notify(
      `${beach.name}: ${next === 'propria' ? '💚 água própria' : '🔴 água imprópria'}`,
      'info'
    );
  };

  const setStatus = async (beach: Beach, status: CetesbStatus) => {
    await cetesbRepo.set(beach.id, status);
    await onDone();
    notify(`${beach.name} atualizada.`, 'info');
  };

  const improprias = beaches.filter((b) => b.cetesbStatus === 'impropria').length;

  return (
    <section className="stack stack-4">
      <div className="card card__body stack stack-3">
        <div className="row row-2 row--between row--wrap">
          <div className="stack">
            <h2 className="section__title">Boletim semanal de balneabilidade</h2>
            <span className="subtle">
              {improprias} praia(s) imprópria(s) de {beaches.length} — atualize toda semana com o
              boletim da CETESB.
            </span>
          </div>
          <button
            type="button"
            className="btn btn--sm btn--secondary"
            onClick={() => {
              if (window.confirm('Descartar as alterações locais e voltar ao catálogo original?')) {
                cetesbRepo.reset();
                void onDone();
                notify('Catálogo CETESB restaurado.', 'info');
              }
            }}
          >
            Restaurar original
          </button>
        </div>

        <div className="row row-2 row--wrap">
          <input
            className="input grow"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar praia ou KM…"
            aria-label="Buscar praia"
          />
          <label className="switch">
            <input
              type="checkbox"
              checked={onlyImpróprias}
              onChange={(e) => setOnlyImpróprias(e.target.checked)}
            />
            <span className="switch__track" aria-hidden="true">
              <span className="switch__thumb" />
            </span>
            <span className="switch__text">Só impróprias</span>
          </label>
        </div>
      </div>

      <ul className="cetesb-list">
        {list.map((b) => (
          <li key={b.id} className="cetesb-row">
            <div className="stack grow">
              <strong className="truncate">{b.name}</strong>
              <span className="subtle">
                {REGION_LABEL[b.region]} · BR-101 km {b.km.toFixed(1)} ·{' '}
                {b.cetesbLastUpdate.split('-').reverse().join('/')}
              </span>
            </div>
            <div className="cetesb-row__actions">
              <button
                type="button"
                className={`btn btn--sm ${
                  b.cetesbStatus === 'propria' ? 'btn--primary' : 'btn--secondary'
                }`}
                onClick={() => void setStatus(b, 'propria')}
              >
                💚 Própria
              </button>
              <button
                type="button"
                className={`btn btn--sm ${
                  b.cetesbStatus === 'impropria' ? 'btn--danger' : 'btn--secondary'
                }`}
                onClick={() => void setStatus(b, 'impropria')}
              >
                🔴 Imprópria
              </button>
              <button
                type="button"
                className="icon-btn"
                onClick={() => void toggle(b)}
                aria-label={`Alternar balneabilidade de ${b.name}`}
                title="Alternar rapidamente"
              >
                🔄
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
