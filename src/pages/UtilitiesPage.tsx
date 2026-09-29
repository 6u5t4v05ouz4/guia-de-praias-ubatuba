import { useState } from 'react';
import { Link } from 'react-router-dom';
import { REGION_LABEL, type BusLine } from '@/types';
import { utilities } from '@/data/utilities';
import { openExternal } from '@/services/links';
import { TopBar } from '@/components/Navigation/TopBar';
import './UtilitiesPage.css';

type Tab = 'tpa' | 'onibus' | 'emergencia' | 'mares';

const TABS: Array<{ id: Tab; label: string; emoji: string }> = [
  { id: 'tpa', label: 'TPA', emoji: '🎫' },
  { id: 'onibus', label: 'VerdeBus', emoji: '🚌' },
  { id: 'emergencia', label: 'Emergência', emoji: '🚨' },
  { id: 'mares', label: 'Marés', emoji: '🌊' },
];

/** Aba 4 — Guia Ubatuba: TPA, ônibus, telefones úteis e marés (SPEC §3.4). */
export function UtilitiesPage() {
  const [tab, setTab] = useState<Tab>('tpa');
  const { tpa, busLines, emergencyContacts, tides } = utilities;

  return (
    <div className="page">
      <div className="container">
        <TopBar title="Guia da Cidade" subtitle="TPA, ônibus, emergência e marés de Ubatuba" />

        <div className="tab-bar" role="tablist" aria-label="Seções do guia da cidade">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={tab === t.id}
              className={`tab-bar__item ${tab === t.id ? 'is-active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <span aria-hidden="true">{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* ------------------------------- TPA ------------------------------ */}
        {tab === 'tpa' && (
          <div className="stack stack-4" role="tabpanel">
            <p className="lead">{tpa.summary}</p>

            <section className="card card__body stack stack-3">
              <h2 className="section__title">💰 Valores por veículo</h2>
              <ul className="rate-list">
                {tpa.rates.map((r) => (
                  <li key={r.vehicle} className="rate-list__row">
                    <span>{r.vehicle}</span>
                    <strong>{r.price}</strong>
                  </li>
                ))}
              </ul>
              <p className="field__hint">
                Valores de referência — confirme a tabela vigente no site da prefeitura.
              </p>
            </section>

            <section className="card card__body stack stack-3">
              <h2 className="section__title">📝 Como funciona</h2>
              <ol className="steps">
                {tpa.howItWorks.map((s, i) => (
                  <li key={s} className="steps__item">
                    <span className="steps__num">{i + 1}</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="card card__body stack stack-3">
              <h2 className="section__title">✅ Isenções</h2>
              <ul className="bullet-list">
                {tpa.exemptions.map((e) => (
                  <li key={e}>
                    <span aria-hidden="true">✓</span> {e}
                  </li>
                ))}
              </ul>
            </section>

            <section className="card card__body stack stack-3">
              <h2 className="section__title">💳 Onde pagar</h2>
              <ul className="bullet-list">
                {tpa.whereToPay.map((w) => (
                  <li key={w}>
                    <span aria-hidden="true">▸</span> {w}
                  </li>
                ))}
              </ul>
              <a
                className="btn btn--primary btn--block"
                href={tpa.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Abrir site oficial da prefeitura ↗
              </a>
            </section>
          </div>
        )}

        {/* ---------------------------- VerdeBus ---------------------------- */}
        {tab === 'onibus' && (
          <div className="stack stack-4" role="tabpanel">
            <p className="lead">
              A VerdeBus liga o centro aos bairros do Norte e do Sul. Os horários abaixo são de
              referência e mudam com frequência — confirme no terminal do Centro.
            </p>
            <ul className="bus-list">
              {busLines.map((line) => (
                <BusCard key={line.id} line={line} />
              ))}
            </ul>
          </div>
        )}

        {/* --------------------------- Emergência --------------------------- */}
        {tab === 'emergencia' && (
          <div className="stack stack-4" role="tabpanel">
            <p className="lead">
              Em emergência, ligue <strong>192</strong> ou <strong>193</strong>. O sinal na
              praia pode falhar: a sua localização precisa é mais útil para o resgate do que o
              endereço escrito.
            </p>
            <ul className="contact-grid">
              {emergencyContacts.map((c) => (
                <li key={c.id} className={`contact ${c.isEmergency ? 'contact--urgent' : ''}`}>
                  <span className="contact__icon" aria-hidden="true">
                    {c.icon ?? '📞'}
                  </span>
                  <div className="stack">
                    <strong className="contact__name">{c.name}</strong>
                    <span className="contact__desc">{c.description}</span>
                  </div>
                  <a className="contact__phone" href={`tel:${c.phone.replace(/\D/g, '')}`}>
                    {c.phone}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ----------------------------- Marés ------------------------------ */}
        {tab === 'mares' && (
          <div className="stack stack-4" role="tabpanel">
            <p className="lead">{tides.note}</p>
            <div className="card card__body stack stack-3">
              <h2 className="section__title">🌊 Por que a tábua importa</h2>
              <ul className="bullet-list">
                <li>
                  <span aria-hidden="true">▸</span> A preamar isola a praia e pode prender quem
                  entrou por trilha no lado errado.
                </li>
                <li>
                  <span aria-hidden="true">▸</span> Na maré baixa, a laje de pedra da Gruta e do
                  Bonete vira piscina natural — mas a volta precisa ser cronometrada.
                </li>
                <li>
                  <span aria-hidden="true">▸</span> Correnteza de retorno é mais forte na
                  lua cheia e no swell de sudeste.
                </li>
              </ul>
              <a
                className="btn btn--secondary btn--block"
                href={tides.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  openExternal(tides.sourceUrl);
                }}
              >
                Consultar tábua de marés da Marinha ↗
              </a>
            </div>
            <div className="card card__body text-center">
              <p className="muted">
                Precisa de ajuda com a rota até a praia?{' '}
                <Link to="/servicos">Veja os parceiros de passeios e equipamentos</Link>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BusCard({ line }: { line: BusLine }) {
  const [showWeekend, setShowWeekend] = useState(false);
  const times = showWeekend ? line.departureWeekends : line.departureWeekdays;

  return (
    <li className="bus">
      <div className="row row-2 row--between">
        <div className="row row-2">
          <span className="bus__code">{line.code}</span>
          <div className="stack">
            <strong className="bus__route">{line.route}</strong>
            <span className="pill pill--muted">{REGION_LABEL[line.region]}</span>
          </div>
        </div>
        <div className="bus__toggle" role="group" aria-label="Tipo de dia">
          <button
            type="button"
            className={!showWeekend ? 'is-active' : ''}
            onClick={() => setShowWeekend(false)}
          >
            Dia útil
          </button>
          <button
            type="button"
            className={showWeekend ? 'is-active' : ''}
            onClick={() => setShowWeekend(true)}
          >
            Fim de semana
          </button>
        </div>
      </div>
      <ul className="bus__times">
        {times.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </li>
  );
}
