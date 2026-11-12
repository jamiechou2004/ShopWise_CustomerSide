import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AppleMark, BackButton, Icon, Screen } from '../components/ui';
import { money } from '../data';
import {
  BUYING_ON,
  LAMPS,
  ORDER_ID,
  PAID_ON,
  SLOTS,
  STORE_COUNT,
  lampById,
  planLines,
  signed,
  slotById,
  totals,
} from '../plan';
import { Order, saveOrder, useOrder, usePlan, useProfile } from '../store';

/* ---------- shared ---------- */

function CheckoutNav({ step }: { step: number }) {
  return (
    <nav className="navbar">
      <BackButton />
      <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={4} aria-valuenow={step}>
        <span style={{ width: `${(step / 4) * 100}%` }} />
      </div>
      <span className="progress-count">{step} / 4</span>
    </nav>
  );
}

// The slot picked on the delivery step, kept while checkout is open.
let pickedSlot = SLOTS[0].id;

function useCheckout() {
  const plan = usePlan();
  if (!plan || plan.status !== 'ready') return null;
  const lines = planLines(plan).all;
  return { plan, lines, t: totals(lines) };
}

export function Tracker({ steps }: { steps: { label: string; when?: string; state: 'done' | 'now' | 'todo' }[] }) {
  return (
    <ol className="tracker">
      {steps.map((s) => (
        <li key={s.label} className={s.state}>
          <span className="state">{s.state === 'done' ? <Icon name="check" /> : s.state === 'now' ? <i /> : null}</span>
          <span className="label">{s.label}</span>
          {s.when && <span className="when">{s.when}</span>}
        </li>
      ))}
    </ol>
  );
}

export function orderSteps(order: Order) {
  const slot = slotById(order.slot).short;
  const delivered = order.status === 'delivered';
  return [
    { label: 'Paid', when: PAID_ON, state: 'done' as const },
    { label: `Buying from ${STORE_COUNT} stores`, when: BUYING_ON, state: delivered ? ('done' as const) : ('now' as const) },
    { label: 'Checked at the hub', state: delivered ? ('done' as const) : ('todo' as const) },
    { label: 'Delivered & assembled', when: slot, state: delivered ? ('done' as const) : ('todo' as const) },
  ];
}

/* ---------- C1 · Review furniture ---------- */

export function ReviewFurniture() {
  const navigate = useNavigate();
  const c = useCheckout();
  if (!c) return <Navigate to="/home" replace />;
  return (
    <Screen>
      <CheckoutNav step={1} />
      <div className="scroll">
        <div className="body" style={{ gap: 16, paddingTop: 20, paddingBottom: 24 }}>
          <h1 className="title">Your furniture</h1>
          <div className="lines">
            {c.lines.map((l) => (
              <div key={l.id} className="line-row compact">
                <img src={l.image} alt="" />
                <span className="name">{l.name}</span>
                <span className="price">{money(l.price)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="footer" style={{ paddingTop: 12 }}>
        <button className="btn primary" onClick={() => navigate('/checkout/delivery')}>Continue · {money(c.t.total)}</button>
      </div>
    </Screen>
  );
}

/* ---------- C3 · Delivery ---------- */

export function Delivery() {
  const navigate = useNavigate();
  const [slot, setSlot] = useState(pickedSlot);
  const c = useCheckout();
  if (!c) return <Navigate to="/home" replace />;
  return (
    <Screen>
      <CheckoutNav step={2} />
      <div className="body" style={{ gap: 22 }}>
        <h1 className="title">When should we deliver?</h1>
        <div className="options" role="radiogroup" aria-label="Delivery window">
          {SLOTS.map((s) => (
            <button key={s.id} className="option" role="radio" aria-checked={slot === s.id} onClick={() => setSlot(s.id)}>
              <span className="badge"><Icon name="calendar_month" /></span>
              <span className="label">{s.label}</span>
              {s.plus && <span className="plus-tag">Plus</span>}
              <span className="radio">{slot === s.id && <Icon name="check" />}</span>
            </button>
          ))}
        </div>
        <p className="notice good"><Icon name="check_circle" fill />One delivery, assembly included</p>
      </div>
      <div style={{ flex: 1 }} />
      <div className="footer">
        <button className="btn primary" onClick={() => { pickedSlot = slot; navigate('/checkout/costs'); }}>Continue</button>
      </div>
    </Screen>
  );
}

/* ---------- C4 · Costs (and C5 · Pay over it) ---------- */

function CostRows({ t }: { t: ReturnType<typeof totals> }) {
  return (
    <div className="list rows">
      <div className="list-row"><span className="label">Furniture</span><span className="value">{money(t.furniture)}</span></div>
      <div className="list-row"><span className="label">Tax</span><span className="value">{money(t.tax)}</span></div>
      <div className="list-row"><span className="label">Delivery &amp; assembly</span><span className="value">{money(t.delivery)}</span></div>
      <div className="list-row"><span className="label">Service fee</span><span className="plus-tag">Plus</span><span className="value">{money(t.service)}</span></div>
      <div className="list-row total"><span className="label">Total</span><span className="value">{money(t.total)}</span></div>
    </div>
  );
}

export function Costs({ paying = false }: { paying?: boolean }) {
  const navigate = useNavigate();
  const profile = useProfile();
  const [stage, setStage] = useState<'idle' | 'working' | 'done'>('idle');
  const c = useCheckout();
  if (!c) return <Navigate to="/home" replace />;
  const budget = c.plan.answers.budget;
  const under = budget !== null ? budget - c.t.total : null;

  const pay = () => {
    if (stage !== 'idle') return;
    setStage('working');
    setTimeout(() => {
      setStage('done');
      const order: Order = { id: ORDER_ID, lines: c.lines, total: c.t.total, slot: pickedSlot, status: 'buying' };
      saveOrder(order);
      setTimeout(() => navigate('/checkout/placed', { replace: true }), 600);
    }, 1100);
  };

  return (
    <Screen>
      <CheckoutNav step={paying ? 4 : 3} />
      <div className="scroll">
        <div className="body" style={{ gap: 18, paddingBottom: 24 }}>
          <h1 className="title">Review costs</h1>
          <div className="budget-card">
            <div className="budget-total">
              <div className="amount"><span style={{ fontSize: 34 }}>{money(c.t.total)}</span>{budget !== null && <small>of {money(budget)}</small>}</div>
              {budget !== null && (
                <div className={`budget-bar${c.t.total > budget ? ' over' : ''}`}>
                  <span style={{ width: `${Math.min(100, (c.t.total / budget) * 100)}%` }} />
                </div>
              )}
            </div>
            {under !== null && (
              <span className={`tag-pill ${under >= 0 ? 'good' : 'warn'}`}>
                {under >= 0 ? `${money(under)} under budget` : `${money(-under)} over budget`}
              </span>
            )}
          </div>
          <CostRows t={c.t} />
        </div>
      </div>
      <div className="footer" style={{ paddingTop: 12 }}>
        <button className="btn primary" onClick={() => navigate('/checkout/pay')}>Continue to pay</button>
      </div>

      {paying && (
        <>
          <div className="dim-overlay" onClick={() => stage === 'idle' && navigate(-1)} />
          <section className="pay-sheet" role="dialog" aria-label="Apple Pay">
            <div className="top">
              <span className="logo"><AppleMark />Pay</span>
              <button className="close" aria-label="Cancel" onClick={() => navigate(-1)} disabled={stage !== 'idle'}><Icon name="close" /></button>
            </div>
            <div className="group">
              <div className="row"><Icon name="credit_card" /><span>Apple Card •• 1234</span><Icon name="chevron_right" /></div>
              <div className="row"><Icon name="location_on" /><span>{profile.name || 'Alex'} · {c.plan.answers.location || 'New York, NY'}</span><Icon name="chevron_right" /></div>
              <div className="row"><Icon name="mail" fill /><span>{profile.email ?? 'Hide My Email'}</span><Icon name="chevron_right" /></div>
            </div>
            <div className="pay-row"><span>Pay Shopwise</span><b>{money(c.t.total)}.00</b></div>
            <button className="confirm" onClick={pay} onDoubleClick={pay} disabled={stage !== 'idle'}>
              {stage === 'idle' && (<><span className="side-hint" aria-hidden="true" /><Icon name="refresh" />Double-click to pay</>)}
              {stage === 'working' && (<><span className="spinner" />Processing</>)}
              {stage === 'done' && (<><Icon name="check_circle" fill />Done</>)}
            </button>
          </section>
        </>
      )}
    </Screen>
  );
}

/* ---------- C6 · Order placed ---------- */

export function OrderPlaced() {
  const navigate = useNavigate();
  const order = useOrder();
  if (!order) return <Navigate to="/home" replace />;
  return (
    <Screen>
      <div className="done-hero">
        <span className="done-badge"><Icon name="check" /></span>
        <h1 className="title">Order placed</h1>
        <p className="sub">{order.id} · {money(order.total)}</p>
        <Tracker steps={orderSteps(order)} />
      </div>
      <div style={{ flex: 1 }} />
      <div className="footer with-link">
        <button className="btn primary" onClick={() => navigate(`/orders/${order.id}`)}>Track order</button>
        <button className="link" onClick={() => navigate('/home')}>Back to Home</button>
      </div>
    </Screen>
  );
}

/* ---------- C7 · Pick a lamp (the ordered lamp sold out) ---------- */

/** The two closest-priced lamps, leaving out the over-budget one. */
function swapChoices(soldOutId: string) {
  const base = lampById(soldOutId).price;
  return LAMPS.filter((l) => l.id !== soldOutId && l.id !== 'stone-glow')
    .sort((a, b) => Math.abs(a.price - base) - Math.abs(b.price - base))
    .slice(0, 2)
    .sort((a, b) => a.price - b.price);
}

export function lampInOrder(order: Order) {
  return order.lines.find((l) => LAMPS.some((x) => x.id === l.id));
}

function totalWithSwap(order: Order, toId: string) {
  const to = lampById(toId);
  const lines = order.lines.map((l) => (LAMPS.some((x) => x.id === l.id) ? { ...l, id: to.id, name: to.name, price: to.price, image: to.thumb } : l));
  return { lines, total: totals(lines).total };
}

export function PickLamp() {
  const navigate = useNavigate();
  const order = useOrder();
  const current = order ? lampInOrder(order) : undefined;
  const choices = current ? swapChoices(current.id) : [];
  const [pick, setPick] = useState<string>(choices[0]?.id ?? 'wait');
  if (!order || !current) return <Navigate to="/home" replace />;
  const sold = lampById(current.id);
  const diffFor = (id: string) => totalWithSwap(order, id).total - order.total;
  const slot = slotById(order.slot).short;

  const confirm = () => {
    if (pick === 'wait') {
      saveOrder({ ...order, swap: { from: sold.id, to: 'wait', diff: 0 } });
      navigate(`/orders/${order.id}`, { replace: true, state: { toast: 'We’ll ship the lamp when it’s back' } });
      return;
    }
    const { lines, total } = totalWithSwap(order, pick);
    saveOrder({ ...order, lines, total, swap: { from: sold.id, to: pick, diff: total - order.total } });
    navigate(`/orders/${order.id}/swapped`, { replace: true });
  };

  return (
    <Screen>
      <nav className="navbar"><BackButton icon="close" label="Close" /></nav>
      <div className="scroll">
        <div className="body" style={{ gap: 16, paddingTop: 20, paddingBottom: 24 }}>
          <div className="sold-out">
            <img src={sold.closeup} alt="" />
            <div>
              <span className="tag-pill warn">Sold out</span>
              <p>{sold.name} · {money(sold.price)}</p>
            </div>
          </div>
          <h1 className="title">Pick a new lamp</h1>
          <div className="options" role="radiogroup" aria-label="Replacement lamp">
            {choices.map((l) => (
              <button key={l.id} className="swap-option" role="radio" aria-checked={pick === l.id} onClick={() => setPick(l.id)}>
                <img src={l.closeup} alt="" />
                <span className="text"><b>{l.name}</b><small>{money(l.price)} · {l.store}</small></span>
                <span className="diff">{signed(diffFor(l.id))}</span>
                <span className="radio">{pick === l.id && <Icon name="check" />}</span>
              </button>
            ))}
            <button className="swap-option" role="radio" aria-checked={pick === 'wait'} onClick={() => setPick('wait')}>
              <span className="icon-tile"><Icon name="hourglass_empty" /></span>
              <span className="text"><b>Wait for restock</b><small>Back by Nov 6 · ships later</small></span>
              <span className="radio">{pick === 'wait' && <Icon name="check" />}</span>
            </button>
          </div>
          <p className="inline-ok"><Icon name="check_circle" fill />Delivery stays {pick === 'wait' ? `${slot}, lamp ships later` : slot}</p>
        </div>
      </div>
      <div className="footer" style={{ paddingTop: 12 }}>
        <button className="btn primary" onClick={confirm}>
          {pick === 'wait' ? 'Wait for restock' : `Swap lamp · ${signed(diffFor(pick))}`}
        </button>
      </div>
    </Screen>
  );
}

/* ---------- C8 · Lamp swapped ---------- */

export function LampSwapped() {
  const navigate = useNavigate();
  const order = useOrder();
  if (!order?.swap || order.swap.to === 'wait') return <Navigate to="/home" replace />;
  const from = lampById(order.swap.from);
  const to = lampById(order.swap.to);
  return (
    <Screen>
      <nav className="navbar"><BackButton to={`/orders/${order.id}`} icon="close" label="Close" /></nav>
      <div className="body" style={{ gap: 20, paddingTop: 34 }}>
        <span className="done-badge small"><Icon name="check" /></span>
        <h1 className="title">Lamp swapped</h1>
        <p className="sub left">{order.id} · {money(order.total)}</p>
        <div className="swap-visual">
          <figure className="from"><img src={from.closeup} alt={from.name} /><figcaption>{money(from.price)}</figcaption></figure>
          <Icon name="chevron_right" />
          <figure><img src={to.closeup} alt={to.name} /><figcaption><b>{money(to.price)}</b></figcaption></figure>
        </div>
        <div className="list rows">
          <div className="list-row"><span className="label dark">{order.swap.diff >= 0 ? 'Charged' : 'Refunded'}</span><span className="value">{signed(order.swap.diff)}</span></div>
          <div className="list-row total"><span className="label">New total</span><span className="value">{money(order.total)}</span></div>
          <div className="list-row"><span className="label dark">Delivery</span><span className="value">{slotById(order.slot).short}</span></div>
        </div>
      </div>
      <div style={{ flex: 1 }} />
      <div className="footer">
        <button className="btn primary" onClick={() => navigate(`/orders/${order.id}`, { replace: true })}>Track order</button>
      </div>
    </Screen>
  );
}

