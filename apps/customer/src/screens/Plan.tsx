import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { BackButton, Icon, Screen, Toast, useToast } from '../components/ui';
import { money } from '../data';
import { LAMPS, Lamp, lampById, planLines, signed, totalWithLamp, totals } from '../plan';
import { Plan, getPlan, savePlan, usePlan } from '../store';
import { TabBar } from './Home';

/* ---------- shared ---------- */

function useReadyPlan(): Plan | null {
  const plan = usePlan();
  return plan && plan.status === 'ready' ? plan : null;
}

function BudgetTotal({ total, budget, size = 30 }: { total: number; budget: number | null; size?: number }) {
  const pct = budget ? Math.min(100, (total / budget) * 100) : 0;
  return (
    <div className="budget-total">
      <div className="amount">
        <span style={{ fontSize: size }}>{money(total)}</span>
        {budget ? <small>of {money(budget)}</small> : <small>No budget set</small>}
      </div>
      {budget ? (
        <div className={`budget-bar${total > budget ? ' over' : ''}`}>
          <span style={{ width: `${pct}%` }} />
        </div>
      ) : null}
    </div>
  );
}

function LineRow({ name, price, image, highlight, onClick }: {
  name: string;
  price: number;
  image: string;
  highlight?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <>
      <img src={image} alt="" />
      <span className="name">{name}</span>
      <span className="price">{money(price)}</span>
    </>
  );
  return onClick ? (
    <button className={`line-row${highlight ? ' highlight' : ''}`} onClick={onClick}>{content}</button>
  ) : (
    <div className={`line-row${highlight ? ' highlight' : ''}`}>{content}</div>
  );
}

function PriceTag({ diff, over }: { diff: number; over?: boolean }) {
  if (over) return <span className="tag-pill warn">Over budget</span>;
  if (diff === 0) return null;
  return <span className={`tag-pill ${diff < 0 ? 'good' : 'warn'}`}>{signed(diff)}</span>;
}

/* ---------- R1 · Room plan (and R6 · Updated) ---------- */

export function RoomPlan() {
  const navigate = useNavigate();
  const location = useLocation();
  const plan = useReadyPlan();
  const [room, setRoom] = useState<'living' | 'bedroom'>('living');
  const [toast, showToast] = useToast();
  const state = location.state as { toast?: string; updated?: boolean; prevLampId?: string } | null;
  const [updated, setUpdated] = useState(Boolean(state?.updated));
  const [undo, setUndo] = useState<string | null>(state?.prevLampId ?? null);

  useEffect(() => {
    if (state?.toast) showToast(state.toast);
    if (state) navigate(location.pathname, { replace: true, state: null });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!undo) return;
    const t = setTimeout(() => setUndo(null), 5000);
    return () => clearTimeout(t);
  }, [undo]);

  if (!plan) return <Navigate to="/home" replace />;
  const lamp = lampById(plan.lampId);
  const lines = planLines(plan);
  const { total } = totals(lines.all);
  const budget = plan.answers.budget;
  const shown = room === 'living' ? lines.living : lines.bedroom;

  return (
    <Screen plain className="room-plan">
      <div className="plan-hero">
        <img src={lamp.hero} alt="Your living room with the planned furniture" />
        <div className="hero-shade" />
        <h1 className="hero-title">Your room plan</h1>
        <button className="icon-btn on-image hero-action" aria-label="Edit home brief" onClick={() => navigate('/setup/brief')}>
          <Icon name="tune" />
        </button>
        <button className="pin dark" style={{ left: lamp.ring.x - 80, top: lamp.ring.y + 70 }} onClick={() => navigate('/plan/lamp')}>
          <i />Lamp · {money(lamp.price)}
        </button>
        <button className="pin" style={{ left: 70, top: 300 }} onClick={() => showToast('Only the lamp can be swapped in this prototype')}>
          <i />Sofa · $700
        </button>
        {!undo && (
          <button className="pin" style={{ left: 200, top: 370 }} onClick={() => showToast('Only the lamp can be swapped in this prototype')}>
            <i />Table · $150
          </button>
        )}
      </div>

      {undo && (
        <div className="undo-toast" role="status">
          <Icon name="check_circle" fill />
          Lamp updated
          <button
            onClick={() => {
              savePlan({ lampId: undo });
              setUndo(null);
              setUpdated(false);
            }}
          >
            Undo
          </button>
        </div>
      )}

      <section className={`plan-sheet${updated ? ' updated' : ''}`}>
        <span className="handle" />
        {!updated && (
          <div className="seg wide" role="tablist">
            <button role="tab" aria-selected={room === 'living'} onClick={() => setRoom('living')}>Living room</button>
            <button role="tab" aria-selected={room === 'bedroom'} onClick={() => setRoom('bedroom')}>Bedroom</button>
          </div>
        )}
        <BudgetTotal total={total} budget={budget} />
        <div className="lines">
          {(updated ? lines.living.slice(0, 2) : shown).map((l) => (
            <LineRow
              key={l.id}
              {...l}
              highlight={l.id === lamp.id}
              onClick={l.id === lamp.id ? () => navigate('/plan/lamp') : undefined}
            />
          ))}
        </div>
      </section>

      {updated ? (
        <div className="footer floating">
          <button className="btn primary" onClick={() => navigate('/plan/saved')}>Save plan</button>
        </div>
      ) : (
        <>
          <div className="bottom-fade short" />
          <TabBar active="plan" onMissing={showToast} />
        </>
      )}
      <Toast message={toast} />
    </Screen>
  );
}

/* ---------- R2 · Lamp / R3 · Replace lamp ---------- */

function DimmedHero({ lamp }: { lamp: Lamp }) {
  return (
    <div className="plan-hero dim">
      <img src={lamp.hero} alt="" />
      <div className="dim-layer" />
      <span className="ring" style={{ left: lamp.ring.x, top: lamp.ring.y }} />
      <div style={{ position: 'absolute', top: 66, left: 16 }}>
        <BackButton to="/plan" icon="close" label="Close" onImage />
      </div>
    </div>
  );
}

export function LampDetail() {
  const navigate = useNavigate();
  const plan = useReadyPlan();
  const [toast, showToast] = useToast();
  if (!plan) return <Navigate to="/home" replace />;
  const lamp = lampById(plan.lampId);

  return (
    <Screen plain>
      <DimmedHero lamp={lamp} />
      <section className="sheet" style={{ top: 420 }}>
        <span className="handle abs" />
        <div className="item-head">
          <img src={lamp.closeup} alt="" />
          <div>
            <p className="name">{lamp.name}</p>
            <p className="meta">{lamp.store}</p>
          </div>
          <span className="price">{money(lamp.price)}</span>
        </div>
        <div className="list specs">
          <div className="list-row"><span className="label">Size</span><span className="value">{lamp.size}</span></div>
          <div className="list-row"><span className="label">Material</span><span className="value">{lamp.material}</span></div>
          <div className="list-row"><span className="label">Light</span><span className="value">{lamp.light}</span></div>
        </div>
        <button className="text-link" onClick={() => showToast(`${lamp.store}’s page opens here in the real app`)}>
          View at {lamp.store} <Icon name="chevron_right" />
        </button>
      </section>
      <div className="footer floating">
        <div className="row" style={{ gap: 16 }}>
          <button className="btn secondary" onClick={() => navigate('/plan')}>Keep</button>
          <button className="btn primary" onClick={() => navigate('/plan/lamp/replace')}>
            <Icon name="refresh" />Replace
          </button>
        </div>
      </div>
      <Toast message={toast} />
    </Screen>
  );
}

export function ReplaceLamp() {
  const navigate = useNavigate();
  const plan = useReadyPlan();
  if (!plan) return <Navigate to="/home" replace />;
  const lamp = lampById(plan.lampId);
  const matches = LAMPS.filter((l) => l.id !== lamp.id).length;

  return (
    <Screen plain>
      <DimmedHero lamp={lamp} />
      <section className="sheet" style={{ top: 470, gap: 12 }}>
        <span className="handle abs" />
        <h1 className="sheet-title">Replace lamp</h1>
        <button className="way" onClick={() => navigate('/plan/lamp/browse')}>
          <span className="badge"><Icon name="grid_view" /></span>
          <span className="text"><b>Browse similar lamps</b><small>Pick it yourself · {matches} matches</small></span>
          <Icon name="chevron_right" />
        </button>
        <button className="way dark" onClick={() => navigate('/plan/lamp/ask')}>
          <span className="badge"><Icon name="auto_awesome" /></span>
          <span className="text"><b>Ask Shopwise AI</b><small>Say what to change</small></span>
          <Icon name="chevron_right" />
        </button>
        <button className="btn secondary" style={{ height: 48 }} onClick={() => navigate('/plan')}>Keep this lamp</button>
      </section>
    </Screen>
  );
}

/* ---------- R3 · Browse lamps (no AI) ---------- */

export function BrowseLamps() {
  const navigate = useNavigate();
  const plan = useReadyPlan();
  const [warmOnly, setWarmOnly] = useState(false);
  const [desc, setDesc] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  const [toast, showToast] = useToast();
  if (!plan) return <Navigate to="/home" replace />;
  const current = lampById(plan.lampId);
  const list = LAMPS.filter((l) => l.id !== current.id && (!warmOnly || l.warm)).sort((a, b) =>
    desc ? b.price - a.price : 0,
  );

  return (
    <Screen plain>
      <nav className="navbar"><BackButton /></nav>
      <div className="scroll">
        <div className="body" style={{ gap: 16, paddingTop: 14, paddingBottom: 40 }}>
          <h1 className="title">Similar lamps</h1>
          <div className="chips">
            <button className="chip" onClick={() => showToast('More filters come later')}><Icon name="tune" />&nbsp;Filters</button>
            <span className="chip choice" aria-pressed="true">Floor lamps</span>
            <button className="chip choice" aria-pressed={warmOnly} onClick={() => setWarmOnly((w) => !w)}>Warm light</button>
          </div>
          <div className="count-row">
            <span>{list.length} {list.length === 1 ? 'lamp' : 'lamps'}</span>
            <button className="sort" onClick={() => setDesc((d) => !d)}>
              Price <Icon name="keyboard_arrow_down" className={desc ? 'flip' : ''} />
            </button>
          </div>
          <div className="grid">
            {list.map((l) => {
              return (
                <article key={l.id} className="piece tall">
                  <button className="media" onClick={() => navigate(`/plan/lamp/try/${l.id}`)} aria-label={`Try ${l.name}`}>
                    <img src={l.closeup} alt="" />
                  </button>
                  <button
                    className="heart"
                    aria-label={`Save ${l.name}`}
                    aria-pressed={saved.includes(l.id)}
                    onClick={() => setSaved((s) => (s.includes(l.id) ? s.filter((x) => x !== l.id) : [...s, l.id]))}
                  >
                    <Icon name="favorite" />
                  </button>
                  <span className="name">{l.name}</span>
                  <span className="price-row">
                    <b>{money(l.price)}</b>
                    <PriceTag diff={l.price - current.price} />
                  </span>
                </article>
              );
            })}
          </div>
        </div>
      </div>
      <Toast message={toast} />
    </Screen>
  );
}

/* ---------- R3 · Ask AI → R4 Finding → R5 Options ---------- */

const ASK_CHIPS = ['Smaller', 'Lower price', 'Warmer light', 'New look'];

// What Alex asked for, carried between the AI screens.
let lastAsk: { wants: string[]; text: string } = { wants: [], text: '' };

export function AskAI() {
  const navigate = useNavigate();
  const plan = useReadyPlan();
  const [wants, setWants] = useState<string[]>(['Smaller', 'Warmer light']);
  const [text, setText] = useState('');
  const [sent, setSent] = useState<string | null>(null);
  if (!plan) return <Navigate to="/home" replace />;
  const lamp = lampById(plan.lampId);

  const phrase = () => {
    if (text.trim()) return text.trim();
    if (!wants.length) return '';
    const [first, ...rest] = wants;
    return rest.length ? `${first}, with ${rest.map((w) => w.toLowerCase()).join(' and ')}` : first;
  };

  const send = (e?: FormEvent) => {
    e?.preventDefault();
    const msg = phrase();
    if (!msg) return;
    setSent(msg);
    lastAsk = { wants, text: msg };
    setTimeout(() => navigate('/plan/lamp/finding', { replace: true }), 700);
  };

  return (
    <Screen>
      <nav className="navbar centered">
        <BackButton icon="close" label="Close" />
        <span className="nav-title">Replace lamp</span>
      </nav>
      <div className="attached">
        <img src={lamp.closeup} alt="" />
        <div><b>{lamp.name}</b><small>{money(lamp.price)}</small></div>
      </div>
      <div className="conversation">
        <div className="ai-line">
          <span className="ai-avatar"><Icon name="auto_awesome" /></span>
          <p className="bubble ai">What should change?</p>
        </div>
        <div className="chips" style={{ paddingLeft: 42 }}>
          {ASK_CHIPS.map((c) => (
            <button
              key={c}
              className="chip choice"
              aria-pressed={wants.includes(c)}
              disabled={!!sent}
              onClick={() => setWants((w) => (w.includes(c) ? w.filter((x) => x !== c) : [...w, c]))}
            >
              {c}
            </button>
          ))}
        </div>
        {(sent || phrase()) && (
          <div className="me-line">
            <p className={`bubble me${sent ? '' : ' draft'}`}>{sent ?? phrase()}</p>
          </div>
        )}
      </div>
      <form className="composer" onSubmit={send}>
        <input placeholder="Message" value={text} onChange={(e) => setText(e.target.value)} disabled={!!sent} aria-label="Message" />
        <button className="send" aria-label="Send" disabled={!phrase() || !!sent}><Icon name="arrow_upward" /></button>
      </form>
    </Screen>
  );
}

export function FindingOptions() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => navigate('/plan/lamp/options', { replace: true }), 1600);
    return () => clearTimeout(t);
  }, [navigate]);
  return (
    <Screen>
      <nav className="navbar centered">
        <BackButton to="/plan" icon="close" label="Close" />
        <span className="nav-title">Replace lamp</span>
      </nav>
      <div className="body" style={{ gap: 16, paddingTop: 22 }}>
        <div className="ai-line" style={{ alignItems: 'center' }}>
          <span className="ai-avatar"><Icon name="auto_awesome" /></span>
          <p style={{ fontSize: 18 }}>Finding a better fit…</p>
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton" style={{ animationDelay: `${i * 120}ms` }}>
            <span /><i />
          </div>
        ))}
      </div>
    </Screen>
  );
}

export function LampOptions() {
  const navigate = useNavigate();
  const plan = useReadyPlan();
  const options = useMemo(() => {
    if (!plan) return [];
    const current = lampById(plan.lampId);
    let list = ['mini-globe', 'slim-shade', 'stone-glow'].map((id) => lampById(id));
    if (list.some((l) => l.id === current.id)) list = LAMPS.filter((l) => l.id !== current.id).slice(0, 3);
    if (lastAsk.wants.includes('Lower price')) list = [...list].sort((a, b) => a.price - b.price);
    return list;
  }, [plan]);
  const [pick, setPick] = useState(options[0]?.id);
  const [toast, showToast] = useToast();
  if (!plan) return <Navigate to="/home" replace />;
  const current = lampById(plan.lampId);
  const chosen = lampById(pick);

  return (
    <Screen>
      <nav className="navbar centered">
        <BackButton />
        <span className="nav-title">{options.length} options</span>
        <button className="icon-btn" style={{ marginLeft: 'auto' }} aria-label="Refine" onClick={() => showToast('Ask for something else from the previous screen')}>
          <Icon name="tune" />
        </button>
      </nav>
      <div className="scroll">
        <div className="body" style={{ gap: 16, paddingTop: 16 }} role="radiogroup" aria-label="Lamp options">
          {options.map((l) => {
            const over = plan.answers.budget !== null && totalWithLamp(plan, l.id) > plan.answers.budget;
            return (
              <button key={l.id} className="option-card" role="radio" aria-checked={pick === l.id} onClick={() => setPick(l.id)}>
                <img src={l.thumb} alt="" />
                <span className="text">
                  <b>{l.name}</b>
                  <span className="price-row">
                    <span>{money(l.price)}</span>
                    <PriceTag diff={l.price - current.price} over={over} />
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="footer" style={{ paddingTop: 12 }}>
        <button className="btn primary" onClick={() => navigate(`/plan/lamp/try/${chosen.id}`)}>
          Try {chosen.short} in my room
        </button>
      </div>
      <Toast message={toast} />
    </Screen>
  );
}

/* ---------- R6 · Try it (nothing is committed until Keep this change) ---------- */

export function TryLamp() {
  const navigate = useNavigate();
  const { lampId } = useParams();
  const plan = useReadyPlan();
  const [view, setView] = useState<'before' | 'after'>('after');
  if (!plan) return <Navigate to="/home" replace />;
  const current = lampById(plan.lampId);
  const next = lampById(lampId);
  const total = totalWithLamp(plan, next.id);

  return (
    <Screen plain>
      <div className="plan-hero tall">
        <img key={view} className="fade-in" src={view === 'after' ? next.hero : current.hero} alt={view === 'after' ? `Room with ${next.name}` : `Room with ${current.name}`} />
        <div style={{ position: 'absolute', top: 66, left: 16 }}>
          <BackButton icon="close" label="Close" onImage />
        </div>
        <div className="seg compare" role="tablist">
          <button role="tab" aria-selected={view === 'before'} onClick={() => setView('before')}>Before</button>
          <button role="tab" aria-selected={view === 'after'} onClick={() => setView('after')}>After</button>
        </div>
      </div>
      <section className="sheet" style={{ top: 430, bottom: 'auto', paddingBottom: 24, gap: 16 }}>
        <span className="handle" />
        <LineRow name={next.name} price={next.price} image={next.thumb} />
        <BudgetTotal total={total} budget={plan.answers.budget} />
      </section>
      <div className="footer floating">
        <div className="row" style={{ gap: 16 }}>
          <button className="btn secondary" onClick={() => navigate('/plan')}>Keep original</button>
          <button
            className="btn primary"
            onClick={() => {
              const prev = getPlan()?.lampId ?? current.id;
              savePlan({ lampId: next.id });
              navigate('/plan', { state: { updated: true, prevLampId: prev } });
            }}
          >
            Keep this change
          </button>
        </div>
      </div>
    </Screen>
  );
}

/* ---------- R7 · Saved ---------- */

export function PlanSaved() {
  const navigate = useNavigate();
  const plan = useReadyPlan();
  if (!plan) return <Navigate to="/home" replace />;
  const lamp = lampById(plan.lampId);
  const { total } = totals(planLines(plan).all);

  return (
    <Screen>
      <div className="done-hero">
        <span className="done-badge"><Icon name="check" /></span>
        <h1 className="title">Your plan is saved</h1>
        <div className="plan-card">
          <img src={lamp.id === 'mini-globe' ? `${lamp.hero.replace('room-mini', 'plan-card')}` : lamp.hero} alt="" />
          <div className="body-pad"><BudgetTotal total={total} budget={plan.answers.budget} /></div>
        </div>
      </div>
      <div style={{ flex: 1 }} />
      <div className="footer with-link">
        <button className="btn primary" onClick={() => navigate('/checkout')}>
          <Icon name="shopping_cart" />Checkout
        </button>
        <button className="link" onClick={() => navigate('/home')}>Back to Home</button>
      </div>
    </Screen>
  );
}
