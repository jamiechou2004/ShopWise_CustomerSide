import { FormEvent, ReactNode, useEffect, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { asset } from '../asset';
import { BackButton, Icon, Screen, Thumb, Toast, useToast } from '../components/ui';
import { money } from '../data';
import { DEFAULT_BEDROOM, DEFAULT_LIVING, isSofa, itemById, planLines } from '../plan';
import { getPlan, savePlan } from '../store';
import { STYLES } from './Setup';

/*
 * Shopwise AI (simulated). Two scripted conversations from the Figma page
 * "Class exercise · AI assistant for Shopwise", merged into the main plan:
 *   /ai/plan  Plan with AI: brief → size → combinations → change of mind → Add to plan
 *   /ai/sofa  Sofa from your photo: photo → wall size → 3 sofas in your room → decide → Add to plan
 * Both write to the same plan the setup flow builds, so My Plan and checkout keep one set of numbers.
 */

const ROOM = asset('img/my-room.png');
const DEFAULT_PLAN_PROMPT = 'I’m decorating a small apartment. I love Scandinavian design and have $1,500 to spend on my living room.';
const DEFAULT_SOFA_PROMPT = 'Find me a sofa that fits this room, under $900.';

const dollars = (text: string, fallback: number) => {
  const m = text.replace(/,/g, '').match(/\$\s?(\d{3,5})/);
  return m ? Number(m[1]) : fallback;
};
const wholeBudget = () => getPlan()?.answers.budget ?? 3000;

/* ---------- Attach menu (the "+" left of every prompt field) ---------- */

function AttachMenu({ onClose, prompt }: { onClose: () => void; prompt: string }) {
  const navigate = useNavigate();
  const [toast, showToast] = useToast();
  return (
    <>
      <div className="attach-dim" onClick={onClose} />
      <div className="attach-menu" role="menu">
        <button role="menuitem" onClick={() => navigate('/ai/photos', { state: { prompt } })}>
          <Icon name="photo_library" />Upload photo
        </button>
        <button role="menuitem" onClick={() => showToast('The camera isn’t part of this prototype. Pick a photo instead')}>
          <Icon name="photo_camera" />Take photo
        </button>
        <button role="menuitem" onClick={() => showToast('Floor plans come later. Pick a photo or type the size')}>
          <Icon name="square_foot" />Add floor plan
        </button>
      </div>
      <Toast message={toast} />
    </>
  );
}

/* ---------- Home entry card ---------- */

const HOME_CHIPS = ['Sofa for my living room', 'Scandinavian', 'Under $900'];

export function AskShopwiseCard() {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [menu, setMenu] = useState(false);

  const send = (e?: FormEvent) => {
    e?.preventDefault();
    const prompt = text.trim() || DEFAULT_PLAN_PROMPT;
    navigate('/ai/plan', { state: { prompt } });
  };
  const addChip = (c: string) => setText((t) => (t.includes(c) ? t : t ? `${t}, ${c.toLowerCase()}` : c));

  return (
    <section className={`ask-card${menu ? ' menu-open' : ''}`} aria-label="Ask Shopwise">
      <div className="ask-head">
        <span className="ai-avatar"><Icon name="auto_awesome" /></span>
        <p>Planning a room? Tell me the style and budget.</p>
      </div>
      <form className="prompt-field" onSubmit={send}>
        <button type="button" className={`add-btn${menu ? ' open' : ''}`} aria-label={menu ? 'Close menu' : 'Add a photo or floor plan'} aria-expanded={menu} onClick={() => setMenu((m) => !m)}>
          <Icon name={menu ? 'close' : 'add'} />
        </button>
        <input placeholder="Describe your room…" value={text} onChange={(e) => setText(e.target.value)} aria-label="Describe your room" />
        <button className="send" aria-label="Send"><Icon name="arrow_upward" /></button>
      </form>
      <div className="chips">
        {HOME_CHIPS.map((c) => (
          <button key={c} className="chip" onClick={() => addChip(c)}>{c}</button>
        ))}
      </div>
      {menu && <AttachMenu onClose={() => setMenu(false)} prompt={text.trim()} />}
    </section>
  );
}

/* ---------- D2 · Pick a photo ---------- */

const RECENTS = [
  { src: ROOM, alt: 'Your empty living room' },
  { src: asset('img/room.png'), alt: 'A living room with a grey sofa' },
  { src: asset('img/chair.png'), alt: 'Grey armchair' },
  { src: asset('img/sofa.png'), alt: 'Grey sofa' },
  { src: asset('img/chair.png'), alt: 'Grey armchair, side view' },
  { src: asset('img/lamp.png'), alt: 'Floor lamp' },
];

export function PickPhoto() {
  const navigate = useNavigate();
  const location = useLocation();
  const prompt = (location.state as { prompt?: string } | null)?.prompt ?? '';
  const [pick, setPick] = useState(0);
  const [toast, showToast] = useToast();

  return (
    <Screen plain className="picker">
      <nav className="navbar centered">
        <BackButton icon="close" label="Close" />
        <span className="nav-title">Plan with AI</span>
      </nav>
      <div className="picker-dim" />
      <section className="picker-sheet" aria-label="Recents">
        <span className="handle" />
        <div className="picker-head">
          <b>Recents</b>
          <button onClick={() => showToast('The camera isn’t part of this prototype. Pick a photo instead')}><Icon name="photo_camera" />Camera</button>
        </div>
        <div className="picker-grid" role="radiogroup" aria-label="Photos">
          {RECENTS.map((r, i) => (
            <button key={i} role="radio" aria-checked={pick === i} aria-label={r.alt} onClick={() => setPick(i)}>
              <img src={r.src} alt="" />
              {pick === i && <span className="check"><Icon name="check" /></span>}
            </button>
          ))}
        </div>
        <button
          className="btn primary"
          onClick={() => navigate('/ai/sofa', { replace: true, state: { photo: RECENTS[pick].src, prompt: prompt || DEFAULT_SOFA_PROMPT } })}
        >
          Add photo
        </button>
      </section>
      <Toast message={toast} />
    </Screen>
  );
}

/* ---------- Chat building blocks ---------- */

type Msg =
  | { who: 'me'; text?: string; photo?: string }
  | { who: 'ai'; text?: string; card?: ReactNode }
  | { who: 'steps'; steps: string[]; done: number }
  | { who: 'replies'; options: { label: string; onPick: () => void }[] }
  | { who: 'note'; text: string }
  | { who: 'block'; node: ReactNode };

function useChat(initial: Msg[]) {
  const [msgs, setMsgs] = useState<Msg[]>(initial);
  const [typing, setTyping] = useState(false);
  // Timers are not cleared on unmount: StrictMode's test unmount would cancel the first reply,
  // and a late setState after leaving the chat is a no-op in React 18.
  const later = (ms: number, fn: () => void) => {
    window.setTimeout(fn, ms);
  };
  const clearReplies = (list: Msg[]) => list.filter((m) => m.who !== 'replies');

  /** Alex says something, then the AI answers after a short pause. */
  const say = (me: Msg | null, reply: Msg[], delay = 700) => {
    setMsgs((m) => (me ? [...clearReplies(m), me] : clearReplies(m)));
    setTyping(true);
    later(delay, () => {
      setTyping(false);
      setMsgs((m) => [...m, ...reply]);
    });
  };

  /** Thinking steps tick one by one, then the reply lands. */
  const think = (me: Msg, steps: string[], extra: Msg[], reply: Msg[], stepMs = 650) => {
    setMsgs((m) => [...clearReplies(m), me, { who: 'steps', steps, done: 0 }, ...extra]);
    steps.forEach((_, i) =>
      later(stepMs * (i + 1), () =>
        setMsgs((m) => m.map((x) => (x.who === 'steps' && x.steps === steps ? { ...x, done: i + 1 } : x))),
      ),
    );
    later(stepMs * (steps.length + 1), () => setMsgs((m) => [...m.filter((x) => !extra.includes(x)), ...reply]));
  };

  return { msgs, typing, say, think, setMsgs };
}

function ChatView({ msgs, typing, onFreeText }: { msgs: Msg[]; typing: boolean; onFreeText: (t: string) => void }) {
  const end = useRef<HTMLDivElement>(null);
  const [text, setText] = useState('');
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [msgs, typing]);

  return (
    <Screen>
      <nav className="navbar centered">
        <BackButton to="/home" icon="close" label="Close" />
        <span className="nav-title">Plan with AI</span>
      </nav>
      <div className="scroll chat" aria-live="polite">
        <div className="chat-list">
          {msgs.map((m, i) => <MsgView key={i} m={m} />)}
          {typing && (
            <div className="ai-msg"><span className="ai-avatar"><Icon name="auto_awesome" /></span><p className="bubble ai typing"><i /><i /><i /></p></div>
          )}
          <div ref={end} />
        </div>
      </div>
      <form
        className="composer chat-composer"
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          onFreeText(text.trim());
          setText('');
        }}
      >
        <button type="button" className={`add-btn${menu ? ' open' : ''}`} aria-label="Add a photo or floor plan" aria-expanded={menu} onClick={() => setMenu((x) => !x)}>
          <Icon name={menu ? 'close' : 'add'} />
        </button>
        <input placeholder="Ask Shopwise" value={text} onChange={(e) => setText(e.target.value)} aria-label="Message" />
        <button className="send" aria-label="Send" disabled={!text.trim()}><Icon name="arrow_upward" /></button>
      </form>
      {menu && <div className="chat-attach"><AttachMenu onClose={() => setMenu(false)} prompt="" /></div>}
    </Screen>
  );
}

function MsgView({ m }: { m: Msg }) {
  if (m.who === 'me')
    return (
      <div className="me-msg">
        {m.photo && <img className="me-photo" src={m.photo} alt="Photo you added" />}
        {m.text && <p className="bubble me">{m.text}</p>}
      </div>
    );
  if (m.who === 'ai')
    return (
      <div className="ai-msg">
        <span className="ai-avatar"><Icon name="auto_awesome" /></span>
        <div className="ai-body">
          {m.text && <p className="bubble ai">{m.text}</p>}
          {m.card}
        </div>
      </div>
    );
  if (m.who === 'steps')
    return (
      <ul className="steps-list">
        {m.steps.map((s, i) => (
          <li key={s} className={i < m.done ? 'done' : i === m.done ? 'now' : ''}>
            <Icon name={i < m.done ? 'check' : 'more_horiz'} />{s}
          </li>
        ))}
      </ul>
    );
  if (m.who === 'replies')
    return (
      <div className="chips quick">
        {m.options.map((o) => <button key={o.label} className="chip" onClick={o.onPick}>{o.label}</button>)}
      </div>
    );
  if (m.who === 'note') return <p className="chat-note">{m.text}</p>;
  return <>{m.node}</>;
}

function InfoCard({ title, rows }: { title: ReactNode; rows: [string, ReactNode][] }) {
  return (
    <div className="info-card">
      <p className="info-title">{title}</p>
      {rows.map(([k, v]) => (
        <div key={k} className="info-row"><span>{k}</span><b>{v}</b></div>
      ))}
    </div>
  );
}

const Tag = ({ tone, children }: { tone: 'warn' | 'good' | 'plain'; children: ReactNode }) => (
  <span className={`tag-pill ${tone}`}>{children}</span>
);

function Feedback() {
  const [answer, setAnswer] = useState<string | null>(null);
  return (
    <div className="feedback">
      {answer ? <span>Thanks for telling us.</span> : (
        <>
          <span>Was this right?</span>
          <button onClick={() => setAnswer('yes')}>Yes</button>
          <button onClick={() => setAnswer('no')}>Not quite</button>
        </>
      )}
    </div>
  );
}

/* ---------- Plan with AI ---------- */

const LIGHT_AIRY = ['linen-sofa', 'armchair', 'coffee-table', 'lamp', 'side-table', 'wall-shelf'];
const sum = (ids: string[]) => ids.reduce((s, id) => s + (id === 'lamp' ? 120 : itemById(id).price), 0);

const COMBOS = [
  {
    id: 'light', name: 'Light & airy', tag: 'Best match', image: asset('img/room.png'), ids: LIGHT_AIRY,
    thumbs: [asset('img/sofa.png'), asset('img/chair.png'), asset('img/table.png')],
    summary: '6 pieces · sofa, armchair, coffee table, floor lamp, side table, wall shelf',
    why: 'Pale oak and linen, the look you saved. Keeps your rug as the centre.',
  },
  {
    id: 'cozy', name: 'Cozy reading corner', tag: 'Most room to spare', image: asset('img/chair.png'),
    ids: ['linen-sofa', 'armchair', 'lamp', 'side-table', 'pouf'],
    thumbs: [asset('img/sofa.png'), asset('img/chair.png'), asset('img/lamp.png')],
    summary: '5 pieces · fits 12 × 14 ft',
    why: 'Builds a reading spot by the window with an armchair and floor lamp.',
  },
  {
    id: 'minimal', name: 'Quiet & minimal', tag: 'Fewest pieces', image: asset('img/style-minimal.png'),
    ids: ['linen-sofa', 'coffee-table', 'lamp', 'wall-shelf'],
    thumbs: [asset('img/sofa.png'), asset('img/table.png'), asset('img/lamp.png')],
    summary: '4 pieces · the most open floor',
    why: 'Just the essentials, so the room stays open around your rug.',
  },
];

export function PlanWithAI() {
  const navigate = useNavigate();
  const location = useLocation();
  const prompt = (location.state as { prompt?: string } | null)?.prompt ?? DEFAULT_PLAN_PROMPT;
  const budget = dollars(prompt, 1500);
  const styleWord = /scandi/i.test(prompt) ? 'Scandinavian' : STYLES.find((s) => s.id === getPlan()?.answers.style)?.label ?? 'Warm & natural';
  const [toast, showToast] = useToast();
  const [ids, setIds] = useState<string[]>(LIGHT_AIRY);

  const chat = useChat([
    { who: 'ai', text: 'Hi Alex. Tell me about the room you’re furnishing: style, budget, anything you already own.' },
  ]);

  // Kick off with Alex's prompt once.
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    askSize({ who: 'me', text: prompt });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function askSize(me: Msg | null) {
    chat.say(me, [
      {
        who: 'ai',
        text: 'Got it. One thing I need before I suggest anything: how big is the room?',
        card: (
          <InfoCard
            title="Your living room"
            rows={[
              ['Room', 'Living room'],
              ['Style', styleWord],
              ['Budget', `${money(budget)} · furniture only`],
              ['Size', <Tag tone="warn">Needed</Tag>],
            ]}
          />
        ),
      },
      {
        who: 'replies',
        options: [
          { label: 'Under 120 sq ft', onPick: () => size('Under 120 sq ft.', 'under 120 sq ft') },
          { label: '120–200 sq ft', onPick: () => size('About 12 × 14 ft. I already have a rug.', '12 × 14 ft') },
          { label: 'Over 200 sq ft', onPick: () => size('Over 200 sq ft.', 'over 200 sq ft') },
          { label: 'Can someone measure it?', onPick: humanHelp },
        ],
      },
      { who: 'note', text: 'Or type the exact size below.' },
    ]);
  }

  function humanHelp() {
    chat.say({ who: 'me', text: 'Can someone come and measure the room for me?' }, [
      {
        who: 'ai',
        text: 'I can’t measure your room myself. You can type the size, or ask a Shopwise designer to come and measure.',
        card: (
          <div className="info-card">
            <p className="info-title">Options</p>
            <button className="btn primary sm" onClick={() => askSize(null)}>Enter the size myself</button>
            <button className="btn soft sm" onClick={() => showToast('Quote requested. Nothing is booked until you agree to it')}>Get a designer quote</button>
            <p className="fine">In-home measuring is a separate service, quoted separately and only booked if you agree.</p>
          </div>
        ),
      },
      { who: 'block', node: <Feedback /> },
    ]);
  }

  function size(text: string, label: string) {
    const fits = COMBOS.map((c) => ({ ...c, total: sum(c.ids) }));
    chat.think(
      { who: 'me', text },
      ['Checked 320 pieces', `41 fit ${label} with a walkway`, `3 under ${money(budget)} that suit your rug`],
      [],
      [
        { who: 'ai', text: `Here are 3 combinations for your ${label} room. Light & airy leaves ${money(budget - fits[0].total)} to spare.` },
        {
          who: 'block',
          node: (
            <div className="carousel" role="list">
              {fits.map((c) => (
                <article key={c.id} className="combo-card" role="listitem">
                  <img className="preview" src={c.image} alt="" />
                  <span className={`tag-pill ${c.id === 'light' ? 'warn' : 'plain'}`}>{c.tag}</span>
                  <h3>{c.name}</h3>
                  <p className="price-line"><b>{money(c.total)}</b><span className={c.total <= budget ? 'good' : 'bad'}>{c.total <= budget ? `${money(budget - c.total)} to spare` : `${money(c.total - budget)} over`}</span></p>
                  <div className="mini-thumbs">
                    {c.thumbs.map((t, i) => <img key={i} src={t} alt="" />)}
                    <span>+{c.ids.length - 3}</span>
                  </div>
                  <p className="summary">{c.summary}</p>
                  <div className="why"><b>Why it fits you</b><span>{c.why}</span></div>
                  <button className="btn primary sm" onClick={() => tryCombo(c.name, c.ids, c.image)}>Try in my room</button>
                </article>
              ))}
            </div>
          ),
        },
        {
          who: 'replies',
          options: [
            { label: 'Show 3 others', onPick: () => showToast('More combinations come later in this prototype') },
            { label: 'Compare two', onPick: () => showToast('Comparing combinations comes later in this prototype') },
            { label: 'Only sofas', onPick: () => navigate('/ai/photos', { state: { prompt: DEFAULT_SOFA_PROMPT } }) },
          ],
        },
        { who: 'note', text: 'Furniture only. Tax and delivery are added at checkout.' },
      ],
    );
  }

  function tryCombo(name: string, comboIds: string[], image: string) {
    setIds(comboIds);
    const total = sum(comboIds);
    chat.say({ who: 'me', text: `${name} looks right.` }, [
      {
        who: 'ai',
        text: `Here it is in your room: ${comboIds.length} pieces, ${money(total)}.`,
        card: <img className="ai-photo" src={image} alt={`${name} in your living room`} />,
      },
      {
        who: 'replies',
        options: [
          { label: 'Add to plan', onPick: () => addToPlan(comboIds) },
          ...(comboIds.includes('linen-sofa') ? [{ label: 'I need a sofa bed', onPick: () => sofaBed(comboIds) }] : []),
        ],
      },
    ]);
  }

  function sofaBed(base: string[]) {
    const withBed = base.map((id) => (id === 'linen-sofa' ? 'sofa-bed' : id));
    const before = sum(base);
    const after = sum(withBed);
    const over = after - budget;
    const pouf = withBed.includes('armchair') ? withBed.map((id) => (id === 'armchair' ? 'pouf' : id)) : null;
    chat.say({ who: 'me', text: 'Actually, I need a sofa bed — friends stay over sometimes.' }, [
      {
        who: 'ai',
        text: over > 0
          ? `A sofa bed adds ${money(after - before)}, which puts it ${money(over)} over your ${money(budget)}. Here’s what I can do:`
          : `A sofa bed adds ${money(after - before)} and still fits your ${money(budget)}.`,
        card: (
          <div className="info-card">
            {over > 0 ? <Tag tone="warn">{money(over)} over budget</Tag> : <Tag tone="good">{money(-over)} under</Tag>}
            <div className="info-row"><span>Linen sofa → Sofa bed</span><b>+{money(after - before)}</b></div>
            <div className="info-row"><span>Total</span><b>{money(after)} of {money(budget)}</b></div>
            {over > 0 && <p className="info-title sm">What should I do instead?</p>}
            {pouf && over > 0 && (
              <button className="choice-row" onClick={() => updated(pouf, 'Swap the armchair for a pouf.')}>
                <span><b>Swap the armchair for a pouf</b><small>−{money(250 - 110)} · total {money(sum(pouf))}</small></span><Icon name="chevron_right" />
              </button>
            )}
            <button className="choice-row" onClick={() => updated(withBed, over > 0 ? 'Keep everything.' : 'Keep the sofa bed.')}>
              <span><b>{over > 0 ? 'Keep everything' : 'Keep the sofa bed'}</b><small>{over > 0 ? `${money(over)} over budget` : `${money(after)} total`}</small></span><Icon name="chevron_right" />
            </button>
            {over > 0 && (
              <button
                className="choice-row"
                onClick={() =>
                  chat.say({ who: 'me', text: 'Show sofa beds under $700.' }, [
                    { who: 'ai', text: `None in stock under $700 fit your room right now. Swapping the armchair keeps you closest to ${money(budget)}.` },
                    {
                      who: 'replies',
                      options: [
                        ...(pouf ? [{ label: 'Swap the armchair', onPick: () => updated(pouf, 'Swap the armchair for a pouf.') }] : []),
                        { label: 'Keep everything', onPick: () => updated(withBed, 'Keep everything.') },
                      ],
                    },
                  ])
                }
              >
                <span><b>Show sofa beds under $700</b><small>Stay at {money(before)} or less</small></span><Icon name="chevron_right" />
              </button>
            )}
          </div>
        ),
      },
    ]);
  }

  function updated(next: string[], said: string) {
    setIds(next);
    const total = sum(next);
    const diff = budget - total;
    const rows = next.filter((id) => id === 'sofa-bed' || id === 'pouf');
    const rest = next.filter((id) => id !== 'sofa-bed' && id !== 'pouf');
    const restNames = rest.map((id) => (id === 'lamp' ? 'floor lamp' : itemById(id).name.toLowerCase()));
    chat.say({ who: 'me', text: said }, [
      {
        who: 'ai',
        text: diff >= 0 ? `Done — ${money(total)}, ${money(diff)} under your budget.` : `Okay, keeping all ${next.length} pieces at ${money(total)}, ${money(-diff)} over your budget.`,
        card: (
          <div className="info-card">
            <div className="info-head"><b>Light &amp; airy · updated</b>{diff >= 0 ? <Tag tone="good">{money(diff)} under</Tag> : <Tag tone="warn">{money(-diff)} over</Tag>}</div>
            {rows.map((id) => (
              <div key={id} className="info-row">
                <span>{itemById(id).name}</span>
                <b><s>{money(id === 'sofa-bed' ? 700 : 250)}</s> {money(itemById(id).price)}</b>
              </div>
            ))}
            <div className="info-row"><span>{capital(restNames.join(', '))}</span><b>{money(sum(rest))}</b></div>
            <div className="info-row total"><span>Total</span><b>{money(total)} of {money(budget)}</b></div>
            <div className="btn-pair">
              <button className="btn soft sm" onClick={() => showToast('The room preview updates when you open My Plan')}>Try in my room</button>
              <button className="btn primary sm" onClick={() => addToPlan(next)}>Add to plan</button>
            </div>
          </div>
        ),
      },
    ]);
  }

  function addToPlan(next: string[]) {
    const plan = getPlan();
    const hadPlan = plan?.status === 'ready';
    savePlan({
      status: 'ready',
      living: next,
      bedroom: hadPlan ? plan?.bedroom ?? DEFAULT_BEDROOM : [],
      livingBudget: budget,
      lampId: plan?.lampId ?? 'shade-floor',
    });
    const after = planLines(getPlan());
    const living = after.living.reduce((s, l) => s + l.price, 0);
    const whole = after.all.reduce((s, l) => s + l.price, 0);
    const total = wholeBudget();
    chat.say({ who: 'me', text: 'Add to plan' }, [
      {
        who: 'ai',
        text: hadPlan
          ? 'Added. Your living room is updated; the bedroom stays as it was.'
          : `Added. Your living room is planned; the rest of your ${money(total)} is free for the other rooms.`,
        card: (
          <div className="info-card">
            <p className="info-title ok"><Icon name="check" />Added to your plan</p>
            <div className="info-row"><span>Living room</span><b>{next.length} pieces · {money(living)}</b></div>
            <div className="info-row"><span>Whole home</span><b>{money(whole)} of {money(total)}</b></div>
            <button className="btn primary sm" onClick={() => navigate('/plan')}>Review in My Plan</button>
            <p className="fine">Nothing is bought yet. You check out from My Plan when you’re ready.</p>
          </div>
        ),
      },
    ]);
  }

  const onFreeText = (t: string) => {
    if (/measure|someone/i.test(t)) return humanHelp();
    const sqft = t.match(/(\d{1,2})\s*[x×]\s*(\d{1,2})/);
    if (sqft) return size(t, `${sqft[1]} × ${sqft[2]} ft`);
    chat.say({ who: 'me', text: t }, [
      { who: 'ai', text: 'I’m a prototype, so I can only follow this one plan for now. Pick one of the options above to keep going.' },
    ]);
  };

  void ids;
  return (
    <>
      <ChatView msgs={chat.msgs} typing={chat.typing} onFreeText={onFreeText} />
      <Toast message={toast} />
    </>
  );
}

const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/* ---------- Sofa from your photo ---------- */

const SOFAS = [
  { id: 'linen-sofa', name: 'Linen sofa', short: 'Linen', width: 84, seats: 3, arrives: 'Oct 30', care: 'Washable', tag: 'Best fit', render: asset('img/my-room-linen.png') },
  { id: 'boucle-loveseat', name: 'Bouclé loveseat', short: 'Bouclé', width: 62, seats: 2, arrives: 'Oct 28', care: 'Spot clean', tag: 'Lowest price', render: asset('img/my-room-boucle.png') },
  { id: 'caramel-sofa', name: 'Caramel leather sofa', short: 'Caramel', width: 80, seats: 3, arrives: 'Dec 3', care: 'Wipe', tag: 'Most durable', render: asset('img/my-room-caramel.png') },
];
const priceOf = (id: string) => itemById(id).price;

function SofaCard({ s, budget, wall, onChoose }: { s: (typeof SOFAS)[number]; budget: number; wall: number; onChoose: () => void }) {
  const [after, setAfter] = useState(true);
  const price = priceOf(s.id);
  const clear = Math.round((wall * 12 - s.width) / 2);
  return (
    <article className="combo-card sofa" role="listitem">
      <div className="preview-wrap">
        <img className="preview" src={after ? s.render : ROOM} alt={after ? `${s.name} in your room` : 'Your room now'} />
        <div className="ba" role="tablist">
          <button role="tab" aria-selected={!after} onClick={() => setAfter(false)}>Before</button>
          <button role="tab" aria-selected={after} onClick={() => setAfter(true)}>After</button>
        </div>
      </div>
      <span className={`tag-pill ${s.tag === 'Best fit' ? 'warn' : price > budget ? 'warn' : 'good'}`}>{price > budget ? 'Over budget' : s.tag}</span>
      <h3>{s.name}</h3>
      <p className="price-line"><b>{money(price)}</b><span className={price <= budget ? 'good' : 'bad'}>{price <= budget ? `${money(budget - price)} under` : `${money(price - budget)} over`}</span></p>
      <p className="summary">{s.width} in · {clear} in clear each side</p>
      <button className="btn primary sm" onClick={onChoose}>Choose</button>
    </article>
  );
}

export function SofaFromPhoto() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { photo?: string; prompt?: string } | null;
  const photo = state?.photo ?? ROOM;
  const prompt = state?.prompt || DEFAULT_SOFA_PROMPT;
  const budget = dollars(prompt, 900);
  const [toast, showToast] = useToast();
  const wall = useRef(10);

  const chat = useChat([]);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    chat.say({ who: 'me', photo, text: prompt }, [
      {
        who: 'ai',
        text: 'Here’s what I can see. Is the wall size right?',
        card: (
          <InfoCard
            title="Your living room"
            rows={[
              ['Back wall', <Tag tone="warn">About 10 ft · estimated</Tag>],
              ['Style', STYLES.find((s) => s.id === getPlan()?.answers.style)?.label ?? 'Warm & natural'],
              ['Keeping', 'Rug, coffee table, plant'],
              ['Budget', `Under ${money(budget)}`],
            ]}
          />
        ),
      },
      { who: 'replies', options: [{ label: 'Edit wall size', onPick: editWall }, { label: 'Looks right', onPick: () => place('Looks right') }] },
      { who: 'note', text: 'Your photo is only used for this suggestion and isn’t saved.' },
    ]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function editWall() {
    chat.say({ who: 'me', text: 'Edit wall size' }, [
      { who: 'ai', text: 'How wide is the back wall?' },
      {
        who: 'replies',
        options: [9, 11, 12].map((ft) => ({ label: `Closer to ${ft} ft`, onPick: () => setWall(ft) })),
      },
    ]);
  }

  function setWall(ft: number) {
    wall.current = ft;
    chat.say({ who: 'me', text: `It’s closer to ${ft} ft.` }, [
      {
        who: 'ai',
        text: `Thanks — I’ll use ${ft} ft. Photos can be off by a foot, so I’ll leave a little room either side.`,
        card: <InfoCard title="Your living room" rows={[['Back wall', <Tag tone="good">{ft} ft · you set it</Tag>], ['Budget', `Under ${money(budget)}`]]} />,
      },
      { who: 'replies', options: [{ label: 'Show sofas', onPick: () => place('Show sofas') }] },
    ]);
  }

  function place(said: string) {
    const ft = wall.current;
    const placing: Msg = {
      who: 'block',
      node: (
        <div className="placing">
          <img src={photo} alt="" />
          <span className="placing-pill"><Icon name="more_horiz" />Placing sofas</span>
        </div>
      ),
    };
    chat.think(
      { who: 'me', text: said },
      ['Measured the back wall from your photo', `14 sofas in stock fit ${ft} ft`, 'Placing 3 in your room…'],
      [placing],
      [
        { who: 'ai', text: 'Here’s your room with 3 sofas that fit the wall.' },
        {
          who: 'block',
          node: (
            <div className="carousel" role="list">
              {SOFAS.map((s) => <SofaCard key={s.id} s={s} budget={budget} wall={ft} onChoose={() => recommend(s.id, `Go with the ${s.short.toLowerCase()} one.`)} />)}
            </div>
          ),
        },
        {
          who: 'replies',
          options: [
            { label: 'Show 3 others', onPick: () => showToast('More sofas come later in this prototype') },
            { label: 'Help me decide', onPick: compare },
            { label: 'Cheaper', onPick: () => recommend('boucle-loveseat', 'Something cheaper?') },
          ],
        },
      ],
      700,
    );
  }

  function compare() {
    chat.say({ who: 'me', text: 'Help me decide' }, [
      { who: 'ai', text: 'Here’s how they compare in your room.' },
      {
        who: 'block',
        node: (
          <div className="compare-card">
            <table>
              <thead>
                <tr><th />{SOFAS.map((s) => <th key={s.id}><img src={s.render} alt="" /><span>{s.short}</span></th>)}</tr>
              </thead>
              <tbody>
                <tr><th>Price</th>{SOFAS.map((s) => <td key={s.id} className={priceOf(s.id) > budget ? 'bad' : ''}>{money(priceOf(s.id))}</td>)}</tr>
                <tr><th>Seats</th>{SOFAS.map((s) => <td key={s.id}>{s.seats}</td>)}</tr>
                <tr><th>Width</th>{SOFAS.map((s) => <td key={s.id}>{s.width} in</td>)}</tr>
                <tr><th>Arrives</th>{SOFAS.map((s) => <td key={s.id}>{s.arrives}</td>)}</tr>
                <tr><th>Care</th>{SOFAS.map((s) => <td key={s.id}>{s.care}</td>)}</tr>
              </tbody>
            </table>
          </div>
        ),
      },
      { who: 'ai', text: 'One thing decides it: do friends come over often?' },
      {
        who: 'replies',
        options: [
          { label: 'Just me', onPick: () => recommend('boucle-loveseat', 'Just me') },
          { label: 'Yes, often', onPick: () => recommend('linen-sofa', 'Yes, often') },
        ],
      },
    ]);
  }

  function recommend(id: string, said: string) {
    const s = SOFAS.find((x) => x.id === id)!;
    const price = priceOf(id);
    const clear = Math.round((wall.current * 12 - s.width) / 2);
    const other = id === 'linen-sofa' ? SOFAS[1] : SOFAS[0];
    const diff = priceOf(other.id) - price;
    const intro = id === 'linen-sofa' ? 'Then go with the Linen sofa.' : id === 'boucle-loveseat' && said === 'Just me' ? 'Then the Bouclé loveseat is enough.' : `The ${s.name} it is.`;
    chat.say({ who: 'me', text: said }, [
      {
        who: 'ai',
        text: id === 'boucle-loveseat' && said.startsWith('Something') ? `The Bouclé loveseat is the cheapest that fits: ${money(price)}.` : intro,
        card: (
          <div className="info-card pick">
            <img className="ai-photo" src={s.render} alt={`${s.name} in your room`} />
            <div className="info-head"><b className="lg">{s.name}</b><Tag tone="warn">Best for you</Tag></div>
            <p className="pick-price">{money(price)}</p>
            <ul className="checks">
              <li><Icon name="check" />Seats {s.seats}{s.seats === 3 ? ' when friends come over' : ''}</li>
              <li><Icon name="check" />{clear} in clear on each side of the wall</li>
              <li><Icon name="check" />{price <= budget ? `${money(budget - price)} under your ${money(budget)}` : `${money(price - budget)} over your ${money(budget)}`}</li>
            </ul>
            <div className="why"><b>Trade-off</b><span>
              {diff < 0
                ? `The ${other.name.toLowerCase()} is ${money(-diff)} less and arrives sooner, but seats ${other.seats}.`
                : `The ${other.name.toLowerCase()} seats ${other.seats} for ${money(diff)} more.`}
            </span></div>
            <div className="btn-pair">
              <button className="btn soft sm" onClick={compare}>Compare again</button>
              <button className="btn primary sm" onClick={() => add(id)}>Add to plan</button>
            </div>
          </div>
        ),
      },
    ]);
  }

  function add(id: string) {
    const s = SOFAS.find((x) => x.id === id)!;
    const plan = getPlan();
    const hadPlan = plan?.status === 'ready';
    const living = hadPlan ? plan?.living ?? DEFAULT_LIVING : [];
    const nextLiving = living.some(isSofa) ? living.map((x) => (isSofa(x) ? id : x)) : [id, ...living];
    savePlan({ status: 'ready', living: nextLiving, bedroom: hadPlan ? plan?.bedroom ?? DEFAULT_BEDROOM : [], lampId: plan?.lampId ?? 'shade-floor' });
    chat.say({ who: 'me', text: 'Add to plan' }, [
      {
        who: 'ai',
        text: 'Done. Nothing is bought yet — you can still change your mind in My Plan.',
        card: (
          <div className="info-card">
            <p className="info-title ok"><Icon name="check" />Added to your plan</p>
            <div className="added-row">
              <Thumb src={s.render} icon="weekend" />
              <span><b>{s.name}</b><small>Living room · back wall</small></span>
              <b>{money(priceOf(id))}</b>
            </div>
            <button className="btn primary sm" onClick={() => navigate('/plan')}>Review in My Plan</button>
          </div>
        ),
      },
      {
        who: 'replies',
        options: [
          { label: 'Find a rug to match', onPick: () => chat.say({ who: 'me', text: 'Find a rug to match' }, [{ who: 'ai', text: 'You said you’re keeping your rug, so I left rugs out. Rugs come in a later version of this prototype.' }]) },
          { label: 'Done', onPick: () => navigate('/home') },
        ],
      },
    ]);
  }

  const onFreeText = (t: string) =>
    chat.say({ who: 'me', text: t }, [{ who: 'ai', text: 'I’m a prototype, so I can only follow this one sofa search for now. Pick one of the options above to keep going.' }]);

  if (!photo) return <Navigate to="/home" replace />;
  return (
    <>
      <ChatView msgs={chat.msgs} typing={chat.typing} onFreeText={onFreeText} />
      <Toast message={toast} />
    </>
  );
}
