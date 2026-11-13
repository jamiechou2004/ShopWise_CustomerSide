import { asset } from '../asset';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { BackButton, Icon, Screen } from '../components/ui';
import { money } from '../data';
import {
  DEFAULT_ANSWERS,
  PlanAnswers,
  QUESTION_COUNT,
  SETUP_TOTAL,
  StyleId,
  getPlan,
  getProfile,
  savePlan,
} from '../store';

/* ---------- shared pieces ---------- */

function useDraft() {
  const [draft, setDraft] = useState<PlanAnswers>(() => ({ ...DEFAULT_ANSWERS, ...getPlan()?.answers }));
  const set = (patch: Partial<PlanAnswers>) => setDraft((d) => ({ ...d, ...patch }));
  return [draft, set] as const;
}

function SetupNav({ step, onSave }: { step: number; onSave: () => void }) {
  return (
    <nav className="navbar setup-nav">
      <BackButton />
      <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={QUESTION_COUNT} aria-valuenow={step}>
        <span style={{ width: `${(step / QUESTION_COUNT) * 100}%` }} />
      </div>
      <span className="progress-count">{step} / {QUESTION_COUNT}</span>
      <button className="save-link" onClick={onSave}>Save</button>
    </nav>
  );
}

function Choice({ selected, icon, fill, label, onClick }: {
  selected: boolean;
  icon: string;
  fill?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button className="option" role="radio" aria-checked={selected} onClick={onClick}>
      <span className="badge"><Icon name={icon} fill={fill} /></span>
      <span className="label">{label}</span>
      <span className="radio">{selected && <Icon name="check" />}</span>
    </button>
  );
}

function Chip({ on, children, onClick }: { on: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button className="chip choice" aria-pressed={on} onClick={onClick}>
      {children}
    </button>
  );
}

/** Dashed "+ Other" chip that turns into a small text field. */
function AddChip({ label, placeholder, onAdd, inputMode }: {
  label: string;
  placeholder: string;
  onAdd: (value: string) => void;
  inputMode?: 'numeric' | 'text';
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const commit = () => {
    const v = value.trim();
    if (v) onAdd(v);
    setValue('');
    setOpen(false);
  };
  if (!open) {
    return (
      <button className="chip add" onClick={() => setOpen(true)}>
        <Icon name="add" />
        {label}
      </button>
    );
  }
  return (
    <span className="chip input">
      <input
        autoFocus
        inputMode={inputMode}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') setOpen(false);
        }}
        size={Math.max(placeholder.length, value.length, 4)}
      />
    </span>
  );
}

const toggle = (list: string[], item: string) =>
  list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

/* ---------- step content ---------- */

const SIZES = ['< 500 sq ft', '500–799', '800–1,199', '1,200+'];
const WITH = ['Just me', 'Partner', 'Family', 'Roommates', 'Pets'];
const EVERY_DAY = ['Work from home', 'Hosting', 'Storage', 'Reading', 'Plants', 'Gaming'];
const KEEPING = ['Sofa', 'Bed', 'Desk', 'Dining table', 'Lamp', 'Storage'];

export const STYLES: { id: StyleId; label: string; image: string }[] = [
  { id: 'warm', label: 'Warm & natural', image: asset('img/style-warm.png') },
  { id: 'minimal', label: 'Quiet & minimal', image: asset('img/style-minimal.png') },
  { id: 'eclectic', label: 'Personal & eclectic', image: asset('img/style-eclectic.png') },
];

const BUDGET_MIN = 500;
const BUDGET_MAX = 10000;
const BUDGET_RANGES: { label: string; lo: number; hi: number; pick: number }[] = [
  { label: 'Under $1,000', lo: 0, hi: 1000, pick: 1000 },
  { label: '$1,000–2,000', lo: 1000, hi: 2000, pick: 2000 },
  { label: '$2,000–3,000', lo: 2000, hi: 3000, pick: 3000 },
  { label: '$3,000–5,000', lo: 3000, hi: 5000, pick: 5000 },
  { label: '$5,000–8,000', lo: 5000, hi: 8000, pick: 8000 },
  { label: '$8,000+', lo: 8000, hi: Infinity, pick: BUDGET_MAX },
];

const TIMING = [
  { id: 'two-weeks', label: 'Within 2 weeks' },
  { id: 'month', label: 'Within a month' },
  { id: 'flexible', label: 'I’m flexible' },
] as const;

const ROOM_PLANS = [
  { id: 'living-bedroom', label: 'Living room + bedroom', icon: 'home', fill: true },
  { id: 'living', label: 'Living room', icon: 'home', fill: true },
  { id: 'bedroom', label: 'Bedroom', icon: 'bed', fill: true },
  { id: 'custom', label: 'Custom', icon: 'add' },
] as const;

type StepProps = { a: PlanAnswers; set: (p: Partial<PlanAnswers>) => void };

// gap = space under the title, per frame
const STEPS: { title: string; gap?: number; render: (p: StepProps) => ReactNode; valid?: (a: PlanAnswers) => boolean; cta?: string }[] = [
  {
    title: 'What would you like to do?',
    render: ({ a, set }) => (
      <div className="options" role="radiogroup" aria-label="Goal" style={{ gap: 24 }}>
        {([
          { id: 'home', label: 'Furnish a new home', image: asset('img/goal-home.png') },
          { id: 'piece', label: 'Find one piece', image: asset('img/goal-piece.png') },
        ] as const).map((g) => (
          <button key={g.id} className="goal-card" role="radio" aria-checked={a.goal === g.id} onClick={() => set({ goal: g.id })}>
            <img src={g.image} alt="" />
            <span className="goal-label">
              {g.label}
              <span className="radio">{a.goal === g.id && <Icon name="check" />}</span>
            </span>
          </button>
        ))}
      </div>
    ),
  },
  {
    title: 'Tell us about your home',
    gap: 20,
    render: ({ a, set }) => <YourHome a={a} set={set} />,
  },
  {
    title: 'Which rooms are we planning?',
    valid: (a) => a.planRooms !== 'custom' || a.planRoomsCustom.trim().length > 0,
    render: ({ a, set }) => (
      <div className="options" role="radiogroup" aria-label="Rooms">
        {ROOM_PLANS.map((r) => (
          <Choice key={r.id} selected={a.planRooms === r.id} icon={r.icon} fill={'fill' in r} label={r.label} onClick={() => set({ planRooms: r.id })} />
        ))}
        {a.planRooms === 'custom' && (
          <label className="field">
            <input
              autoFocus
              placeholder="Which rooms?"
              value={a.planRoomsCustom}
              onChange={(e) => set({ planRoomsCustom: e.target.value })}
            />
          </label>
        )}
      </div>
    ),
  },
  {
    title: 'Bringing any furniture?',
    render: ({ a, set }) => (
      <div className="options" role="radiogroup" aria-label="Furniture">
        <Choice selected={a.furniture === 'fresh'} icon="auto_awesome" label="Starting fresh" onClick={() => set({ furniture: 'fresh', keeping: [] })} />
        <Choice selected={a.furniture === 'keeping'} icon="inventory_2" label="Keeping a few pieces" onClick={() => set({ furniture: 'keeping' })} />
        {a.furniture === 'keeping' && (
          <div className="chips" style={{ marginTop: 4 }}>
            {KEEPING.map((k) => (
              <Chip key={k} on={a.keeping.includes(k)} onClick={() => set({ keeping: toggle(a.keeping, k) })}>{k}</Chip>
            ))}
          </div>
        )}
      </div>
    ),
  },
  {
    title: 'How will you live here?',
    gap: 18,
    valid: (a) => a.livingWith.length > 0,
    render: ({ a, set }) => {
      const withOptions = [...WITH, ...a.livingWith.filter((x) => !WITH.includes(x))];
      const dayOptions = [...EVERY_DAY, ...a.everyDay.filter((x) => !EVERY_DAY.includes(x))];
      // "Just me" and other people are exclusive; pets go with either.
      const isPerson = (x: string) => x !== 'Just me' && x !== 'Pets';
      const pickWith = (w: string) => {
        if (w === 'Just me') return set({ livingWith: ['Just me', ...a.livingWith.filter((x) => x === 'Pets')] });
        const base = isPerson(w) ? a.livingWith.filter((x) => x !== 'Just me') : a.livingWith;
        set({ livingWith: toggle(base, w) });
      };
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <p className="section-label">With</p>
          <div className="chips">
            {withOptions.map((w) => <Chip key={w} on={a.livingWith.includes(w)} onClick={() => pickWith(w)}>{w}</Chip>)}
            <AddChip label="Other" placeholder="Who else?" onAdd={(v) => set({ livingWith: [...a.livingWith.filter((x) => x !== 'Just me' && x !== v), v] })} />
          </div>
          <p className="section-label" style={{ marginTop: 6 }}>Every day</p>
          <div className="chips">
            {dayOptions.map((d) => <Chip key={d} on={a.everyDay.includes(d)} onClick={() => set({ everyDay: toggle(a.everyDay, d) })}>{d}</Chip>)}
            <AddChip label="Other" placeholder="What else?" onAdd={(v) => set({ everyDay: [...a.everyDay, v] })} />
          </div>
        </div>
      );
    },
  },
  {
    title: 'What feels like you?',
    gap: 16,
    render: ({ a, set }) => (
      <div className="options" role="radiogroup" aria-label="Style">
        {STYLES.map((s) => (
          <button key={s.id} className="style-card" role="radio" aria-checked={a.style === s.id} onClick={() => set({ style: s.id })}>
            <img src={s.image} alt="" />
            <span className="caption">{s.label}</span>
            {a.style === s.id && <span className="check"><Icon name="check" /></span>}
          </button>
        ))}
      </div>
    ),
  },
  {
    title: 'What’s your total budget?',
    gap: 22,
    render: ({ a, set }) => <Budget a={a} set={set} />,
  },
  {
    title: 'Where and when?',
    gap: 18,
    cta: 'Review my brief',
    valid: (a) => a.location.trim().length > 0,
    render: ({ a, set }) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
        <p className="section-label">Where</p>
        <label className="field" style={{ width: '100%' }}>
          <Icon name="location_on" />
          <input
            placeholder="City or ZIP code"
            autoComplete="address-level2"
            value={a.location}
            onChange={(e) => set({ location: e.target.value })}
          />
          {a.location && (
            <button className="clear" aria-label="Clear" onClick={() => set({ location: '' })}>
              <Icon name="close" />
            </button>
          )}
        </label>
        <button className="use-location" onClick={() => set({ location: 'New York, NY' })}>
          <Icon name="near_me" fill />
          Use my location
        </button>
        <p className="section-label" style={{ marginTop: 10 }}>When should it be ready?</p>
        <div className="options" role="radiogroup" aria-label="Timing" style={{ width: '100%' }}>
          {TIMING.map((t) => (
            <Choice key={t.id} selected={a.timing === t.id} icon="calendar_month" label={t.label} onClick={() => set({ timing: t.id })} />
          ))}
          {a.timing === 'flexible' && (
            <label className="field">
              <input
                autoFocus
                placeholder="Anything we should plan around?"
                value={a.timingNote}
                onChange={(e) => set({ timingNote: e.target.value })}
              />
            </label>
          )}
        </div>
      </div>
    ),
  },
];

function YourHome({ a, set }: StepProps) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const customSize = a.size && !SIZES.includes(a.size) ? a.size : null;

  const bump = (i: number, d: number) =>
    set({ rooms: a.rooms.map((r, j) => (j === i ? { ...r, count: Math.min(9, Math.max(0, r.count + d)) } : r)) });

  const addRoom = () => {
    const n = name.trim();
    if (n) set({ rooms: [...a.rooms, { name: n, count: 1 }] });
    setName('');
    setAdding(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <button className="floor-plan" aria-pressed={a.floorPlan} onClick={() => set({ floorPlan: !a.floorPlan })}>
        <span className="plus"><Icon name={a.floorPlan ? 'check' : 'add'} /></span>
        <span className="label">{a.floorPlan ? 'Floor plan added' : 'Add a floor plan'}</span>
        <span className="tag">{a.floorPlan ? 'Remove' : 'Optional'}</span>
      </button>

      {a.rooms.map((r, i) => (
        <div key={r.name} className="stepper">
          <span className="label">{r.name}</span>
          <button aria-label={`Fewer ${r.name}`} disabled={r.count === 0} onClick={() => bump(i, -1)}><Icon name="remove" /></button>
          <span className="value" aria-live="polite">{r.count}</span>
          <button aria-label={`More ${r.name}`} disabled={r.count === 9} onClick={() => bump(i, 1)}><Icon name="add" /></button>
        </div>
      ))}

      <div className="stepper add-room">
        {adding ? (
          <input
            autoFocus
            placeholder="Room name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addRoom()}
            onBlur={addRoom}
          />
        ) : (
          <span className="label">Other room</span>
        )}
        <button className="dark" aria-label="Add room" onMouseDown={(e) => adding && e.preventDefault()} onClick={() => (adding ? addRoom() : setAdding(true))}>
          <Icon name={adding ? 'check' : 'add'} />
        </button>
      </div>

      <p className="section-label">Size</p>
      <div className="chips">
        {SIZES.map((s) => <Chip key={s} on={a.size === s} onClick={() => set({ size: a.size === s ? null : s })}>{s}</Chip>)}
        {customSize ? (
          <Chip on onClick={() => set({ size: null })}>{customSize}</Chip>
        ) : (
          <AddChip label="Exact size" placeholder="sq ft" inputMode="numeric" onAdd={(v) => {
            const n = parseInt(v.replace(/[^\d]/g, ''), 10);
            if (n) set({ size: `${n.toLocaleString('en-US')} sq ft` });
          }} />
        )}
      </div>
    </div>
  );
}

function Budget({ a, set }: StepProps) {
  const [custom, setCustom] = useState(false);
  const value = a.budget ?? 3000;
  const pct = ((Math.min(value, BUDGET_MAX) - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <p className="hint">Furniture, tax and delivery</p>
      <p className={`budget-value${a.budget === null ? ' muted' : ''}`}>
        {a.budget === null ? 'Not sure yet' : a.budget >= BUDGET_MAX ? `${money(BUDGET_MAX)}+` : money(a.budget)}
      </p>
      <div>
        <input
          className="slider"
          type="range"
          min={BUDGET_MIN}
          max={BUDGET_MAX}
          step={100}
          value={value}
          aria-label="Total budget"
          style={{ ['--pct' as string]: `${a.budget === null ? 0 : pct}%` }}
          onChange={(e) => set({ budget: Number(e.target.value) })}
        />
        <div className="scale"><span>{money(BUDGET_MIN)}</span><span>{money(BUDGET_MAX)}+</span></div>
      </div>
      <p className="section-label" style={{ color: 'var(--ink-2)' }}>Quick picks</p>
      <div className="chips">
        {BUDGET_RANGES.map((r) => (
          <Chip key={r.label} on={a.budget !== null && a.budget > r.lo && a.budget <= r.hi} onClick={() => set({ budget: r.pick })}>
            {r.label}
          </Chip>
        ))}
        {custom ? (
          <span className="chip input">
            <span>$</span>
            <input
              autoFocus
              inputMode="numeric"
              placeholder="Amount"
              size={7}
              onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
              onBlur={(e) => {
                const n = parseInt(e.target.value.replace(/[^\d]/g, ''), 10);
                if (n) set({ budget: n });
                setCustom(false);
              }}
            />
          </span>
        ) : (
          <button className="chip add neutral" onClick={() => setCustom(true)}><Icon name="add" />Custom amount</button>
        )}
        <button className="chip outline" aria-pressed={a.budget === null} onClick={() => set({ budget: null })}>Not sure yet</button>
      </div>
    </div>
  );
}

/* ---------- S1–S3 · question screens ---------- */

export function SetupStep() {
  const navigate = useNavigate();
  const { step: raw } = useParams();
  const [params] = useSearchParams();
  const fromBrief = params.get('from') === 'brief';
  const step = Number(raw);
  const [draft, set] = useDraft();

  if (!Number.isInteger(step) || step < 1 || step > QUESTION_COUNT) return <Navigate to="/setup/1" replace />;
  const def = STEPS[step - 1];
  const valid = def.valid ? def.valid(draft) : true;

  const next = () => {
    savePlan({ answers: draft, stepsDone: step, status: getPlan()?.status === 'ready' ? 'ready' : 'draft' });
    if (fromBrief || step === QUESTION_COUNT) navigate('/setup/brief', { replace: fromBrief });
    else navigate(`/setup/${step + 1}`);
  };

  const saveAndExit = () => {
    savePlan({ answers: draft, stepsDone: step - 1 });
    navigate('/home', { state: { toast: 'Saved. Pick up where you left off.' } });
  };

  return (
    <Screen>
      <SetupNav step={step} onSave={saveAndExit} />
      <div className="scroll">
        <div className="body" style={{ gap: def.gap ?? 24, paddingBottom: 24 }}>
          <h1 className="title">{def.title}</h1>
          {def.render({ a: draft, set })}
        </div>
      </div>
      <div className="footer" style={{ paddingTop: 12 }}>
        <button className="btn primary" disabled={!valid} onClick={next}>
          {fromBrief ? 'Done' : def.cta ?? 'Continue'}
        </button>
      </div>
    </Screen>
  );
}

/* ---------- S4 · Your brief ---------- */

const HOME_LABEL = { apartment: 'Apartment', house: 'House', shared: 'Shared home' };

function briefRows(a: PlanAnswers) {
  const homeType = getProfile().homeType;
  const beds = a.rooms.find((r) => r.name === 'Bedrooms')?.count ?? 0;
  const bedText = beds === 0 ? 'Studio' : `${beds} bed`;
  const rooms =
    a.planRooms === 'living-bedroom' ? 'Living + bedroom'
    : a.planRooms === 'living' ? 'Living room'
    : a.planRooms === 'bedroom' ? 'Bedroom'
    : a.planRoomsCustom || 'Custom';
  const short = (s: string) => (s === 'Work from home' ? 'WFH' : s);

  return [
    { label: 'Goal', value: a.goal === 'home' ? 'New home' : 'One piece', step: 1 },
    { label: 'Rooms', value: rooms, step: 3 },
    { label: 'Home', value: homeType ? `${HOME_LABEL[homeType]} · ${bedText}` : bedText, step: 2 },
    { label: 'With', value: a.livingWith.join(' · ') || '—', step: 5 },
    { label: 'Every day', value: a.everyDay.map(short).join(' · ') || '—', step: 5 },
    { label: 'Style', value: STYLES.find((s) => s.id === a.style)?.label ?? '—', step: 6 },
    { label: 'Budget', value: a.budget === null ? 'Not sure yet' : money(a.budget), step: 7 },
    { label: 'Location', value: a.location.split(',')[0] || '—', step: 8 },
    { label: 'Ready', value: TIMING.find((t) => t.id === a.timing)?.label ?? '—', step: 8 },
  ];
}

export function Brief() {
  const navigate = useNavigate();
  const plan = getPlan();
  if (!plan || plan.stepsDone < QUESTION_COUNT) return <Navigate to={`/setup/${(plan?.stepsDone ?? 0) + 1}`} replace />;

  return (
    <Screen>
      <nav className="navbar">
        <BackButton />
      </nav>
      <div className="scroll">
        <div className="body" style={{ gap: 18, paddingTop: 20, paddingBottom: 24 }}>
          <h1 className="title">Your home brief</h1>
          <div className="list brief">
            {briefRows(plan.answers).map((r) => (
              <button key={r.label} className="list-row" onClick={() => navigate(`/setup/${r.step}?from=brief`)}>
                <span className="label">{r.label}</span>
                <span className="value">{r.value}</span>
                <Icon name="chevron_right" />
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="footer" style={{ paddingTop: 12 }}>
        <button
          className="btn primary"
          onClick={() => {
            savePlan({ stepsDone: QUESTION_COUNT + 1 });
            navigate('/setup/generating', { replace: true });
          }}
        >
          <Icon name="auto_awesome" />
          Create my room plan
        </button>
      </div>
    </Screen>
  );
}

/* ---------- S5 · Generating ---------- */

const DURATION = 4200;
const PHASES = ['Layout', 'Furniture', 'Budget'] as const;

export function Generating() {
  const navigate = useNavigate();
  const [p, setP] = useState(0);
  const started = useRef<number | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    const tick = (t: number) => {
      started.current ??= t;
      const k = Math.min(1, (t - started.current) / (reduce ? 1200 : DURATION));
      setP(1 - Math.pow(1 - k, 1.6));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (p < 1) return;
    const t = setTimeout(() => {
      savePlan({ status: 'ready', stepsDone: SETUP_TOTAL });
      navigate('/plan', { replace: true, state: { toast: 'Your room plan is ready' } });
    }, 450);
    return () => clearTimeout(t);
  }, [p, navigate]);

  const pct = Math.round(p * 100);
  const lineY = Math.round(p * 600);
  const phase = p < 0.34 ? 0 : p < 0.8 ? 1 : 2;

  return (
    <Screen plain className="generating">
      <img className="reveal" src={asset('img/room-tall.png')} alt="" />
      <div className="unrevealed" style={{ top: lineY }}>
        <img src={asset('img/room-tall.png')} alt="" style={{ top: -lineY }} />
      </div>
      <div className="scan" style={{ top: lineY - 35 }} />
      <div className="scan-line" style={{ top: lineY - 1 }} />
      <div className="top-shade" />

      <section className="progress-card" aria-live="polite">
        <div className="head">
          <span className="spark"><Icon name="auto_awesome" /></span>
          <span className="name">Designing your room</span>
          <span className="pct">{pct}%</span>
        </div>
        <div className="bar"><span style={{ width: `${pct}%` }} /></div>
        <div className="phases">
          {PHASES.map((label, i) => (
            <span key={label} className={`phase ${i < phase || pct === 100 ? 'done' : i === phase ? 'active' : ''}`}>
              {i < phase || pct === 100 ? <Icon name="check" /> : i === phase ? <i className="dot" /> : null}
              {label}
            </span>
          ))}
        </div>
      </section>
    </Screen>
  );
}

/** Where "Continue" on Home should go for a plan in progress. */
export function resumePath(stepsDone: number) {
  return stepsDone >= QUESTION_COUNT ? '/setup/brief' : `/setup/${stepsDone + 1}`;
}
