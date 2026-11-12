import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { BackButton, Icon, Screen, Toast, useToast } from '../components/ui';
import { money } from '../data';
import { isLamp, lampById, slotById, taxOn } from '../plan';
import { Order, ReturnRequest, saveOrder, useOrder, usePlan } from '../store';
import { TabBar } from './Home';
import { Tracker, lampInOrder, orderSteps } from './Checkout';

/* ---------- F0 · Check-in notification (lock screen) ---------- */

export function CheckInNotification() {
  const navigate = useNavigate();
  const plan = usePlan();
  const hero = lampById(plan?.lampId).hero;
  return (
    <Screen plain className="lock-screen">
      <img className="wallpaper" src={hero} alt="" />
      <div className="lock-shade" />
      <p className="lock-date">Sunday, November 2</p>
      <p className="lock-time">9:41</p>
      <button className="notification" onClick={() => navigate('/check-in', { replace: true })}>
        <span className="app-icon">S</span>
        <span className="text">
          <span className="head"><b>Shopwise</b><small>now</small></span>
          How does it feel at home?
        </span>
      </button>
      <span className="lock-btn left"><Icon name="lightbulb" /></span>
      <span className="lock-btn right"><Icon name="photo_camera" fill /></span>
    </Screen>
  );
}

/* ---------- F1 · Check-in ---------- */

export function CheckIn() {
  const navigate = useNavigate();
  const plan = usePlan();
  const order = useOrder();
  const hero = lampById(plan?.lampId).hero;
  return (
    <Screen plain>
      <div className="checkin-hero"><img src={hero} alt="Alex’s living room after delivery" /></div>
      <div className="body" style={{ gap: 20, paddingTop: 24 }}>
        <h1 className="title">How does it feel at home?</h1>
        <div className="options">
          <button className="option" onClick={() => navigate('/home', { state: { toast: 'Glad it feels like home' } })}>
            <span className="badge"><Icon name="favorite" /></span><span className="label">It feels right</span><Icon name="chevron_right" className="chev" />
          </button>
          <button className="option" onClick={() => navigate('/plan')}>
            <span className="badge"><Icon name="auto_awesome" /></span><span className="label">Adjust my plan</span><Icon name="chevron_right" className="chev" />
          </button>
          <button className="option" onClick={() => { draft = freshDraft(); navigate(order ? '/return/1' : '/orders'); }}>
            <span className="badge"><Icon name="error" /></span><span className="label">Something’s wrong</span><Icon name="chevron_right" className="chev" />
          </button>
        </div>
      </div>
    </Screen>
  );
}

/* ---------- O1 · Your orders ---------- */

function statusTag(order: Order) {
  if (order.status === 'delivered') return <span className="tag-pill good">Delivered {slotById(order.slot).short.split(' · ')[0]}</span>;
  return <span className="tag-pill warn">In progress</span>;
}

export function Orders() {
  const navigate = useNavigate();
  const order = useOrder();
  const [toast, showToast] = useToast();
  return (
    <Screen>
      <nav className="navbar centered">
        <BackButton to="/profile" />
        <span className="nav-title">Your orders</span>
      </nav>
      <div className="body" style={{ paddingTop: 20 }}>
        {order ? (
          <button className="order-card" onClick={() => navigate(`/orders/${order.id}`)}>
            <span className="thumbs">
              {order.lines.slice(0, 4).map((l) => <img key={l.id} src={l.image} alt="" />)}
              {order.lines.length > 4 && <span className="more">+{order.lines.length - 4}</span>}
            </span>
            <span className="head">
              <span><b>{order.id}</b><small>{money(order.total)}</small></span>
              {statusTag(order)}
            </span>
          </button>
        ) : (
          <div className="empty">
            <Icon name="receipt_long" />
            <p>No orders yet</p>
            <button className="btn small" onClick={() => navigate('/plan')}>Open my plan</button>
          </div>
        )}
      </div>
      <TabBar active="profile" onMissing={showToast} />
      <Toast message={toast} />
    </Screen>
  );
}

/* ---------- O2 · Order ---------- */

export function OrderDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const order = useOrder();
  const [toast, showToast] = useToast();

  useEffect(() => {
    const msg = (location.state as { toast?: string } | null)?.toast;
    if (msg) {
      showToast(msg);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!order || order.id !== id) return <Navigate to="/orders" replace />;
  const delivered = order.status === 'delivered';
  const lamp = lampInOrder(order);
  const soldOut = !delivered && !order.swap && lamp;
  const slot = slotById(order.slot).short;

  return (
    <Screen>
      <nav className="navbar centered">
        <BackButton />
        <span className="nav-title">{order.id}</span>
      </nav>
      <div className="scroll">
        <div className="body" style={{ gap: 16, paddingTop: 20, paddingBottom: 24 }}>
          {delivered ? (
            <p className="notice good"><Icon name="check_circle" fill />Delivered and assembled {slot.split(' · ')[0]}</p>
          ) : (
            <p className="notice warm"><Icon name="local_shipping" />Arriving {slot}</p>
          )}

          {soldOut && (
            <button className="alert-card" onClick={() => navigate(`/orders/${order.id}/swap`)}>
              <img src={lamp.image} alt="" />
              <span className="text"><b>{lamp.name} sold out</b><small>Pick a new lamp to keep your delivery date</small></span>
              <Icon name="chevron_right" />
            </button>
          )}

          {order.ret && <ReturnCard order={order} />}

          {!delivered && <Tracker steps={orderSteps(order)} />}

          <div className="lines">
            {order.lines.map((l) => (
              <div key={l.id} className="line-row compact">
                <img src={l.image} alt="" />
                <span className="name">{l.name}</span>
                <span className="price">{money(l.price)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {delivered && !order.ret && (
        <div className="footer" style={{ paddingTop: 12 }}>
          <button className="btn secondary" onClick={() => { draft = freshDraft(); navigate('/return/1'); }}>Return or exchange</button>
        </div>
      )}
      <Toast message={toast} />
    </Screen>
  );
}

function ReturnCard({ order }: { order: Order }) {
  const r = order.ret!;
  const item = order.lines.find((l) => l.id === r.itemId);
  return (
    <div className="return-card">
      <p><b>{r.fix === 'exchange' ? 'Exchange' : 'Refund'} · {item?.name}</b></p>
      <small>Crew visit {r.visit}{r.fix === 'refund' ? ` · ${money(r.amount)} back to your card` : ''}</small>
    </div>
  );
}

/* ---------- T1–T5 · Return or exchange ---------- */

const REASONS = [
  { id: 'damaged', label: 'Arrived damaged', icon: 'error' },
  { id: 'fit', label: 'Doesn’t fit', icon: 'grid_view' },
  { id: 'mind', label: 'Changed my mind', icon: 'refresh' },
  { id: 'other', label: 'Something else', icon: 'info' },
];
const VISITS = ['Tue, Nov 4 · 10–12', 'Wed, Nov 5 · 2–4'];

interface Draft { itemId: string | null; reason: string; photos: string[]; fix: 'exchange' | 'refund'; visit: string }
const freshDraft = (): Draft => ({ itemId: null, reason: 'damaged', photos: [], fix: 'exchange', visit: VISITS[0] });
// Kept in memory only: photos never leave the browser tab.
let draft: Draft = freshDraft();

function ReturnNav({ step }: { step: number }) {
  return (
    <nav className="navbar">
      <BackButton icon={step === 1 ? 'close' : 'chevron_left'} label={step === 1 ? 'Close' : 'Back'} />
      <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={4} aria-valuenow={step}>
        <span style={{ width: `${(step / 4) * 100}%` }} />
      </div>
      <span className="progress-count">{step} / 4</span>
    </nav>
  );
}

const refundFor = (price: number) => price + taxOn(price);

export function ReturnStep() {
  const navigate = useNavigate();
  const { step: raw } = useParams();
  const step = Number(raw);
  const order = useOrder();
  const [d, setD] = useState<Draft>(() => {
    if (!draft.itemId && order) {
      const lamp = lampInOrder(order);
      draft = { ...draft, itemId: lamp?.id ?? order.lines[0].id };
    }
    return draft;
  });
  const fileRef = useRef<HTMLInputElement>(null);
  if (!order) return <Navigate to="/orders" replace />;
  const set = (patch: Partial<Draft>) => setD((prev) => (draft = { ...prev, ...patch }));
  const item = order.lines.find((l) => l.id === d.itemId) ?? order.lines[0];

  const addPhotos = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 4 - d.photos.length);
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => setD((prev) => (draft = { ...prev, photos: [...prev.photos, String(reader.result)].slice(0, 4) }));
      reader.readAsDataURL(f);
    });
    e.target.value = '';
  };

  const next = () => navigate(step < 4 ? `/return/${step + 1}` : '/return/review');

  // Living-room pieces first, as on T1.
  const order1 = [...order.lines].sort((a, b) => rank(a.id) - rank(b.id));

  return (
    <Screen>
      <ReturnNav step={step} />
      <div className="scroll">
        <div className="body" style={{ gap: 22, paddingBottom: 24 }}>
          {step === 1 && (
            <>
              <h1 className="title">Which item?</h1>
              <div className="options" role="radiogroup" aria-label="Item">
                {order1.map((l) => (
                  <button key={l.id} className="option item" role="radio" aria-checked={d.itemId === l.id} onClick={() => set({ itemId: l.id })}>
                    <img src={l.image} alt="" />
                    <span className="label">{l.name}</span>
                    <span className="radio square">{d.itemId === l.id && <Icon name="check" />}</span>
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <h1 className="title">What happened?</h1>
              <div className="options" role="radiogroup" aria-label="Reason">
                {REASONS.map((r) => (
                  <button key={r.id} className="option" role="radio" aria-checked={d.reason === r.id} onClick={() => set({ reason: r.id })}>
                    <span className="badge"><Icon name={r.icon} /></span>
                    <span className="label">{r.label}</span>
                    <span className="radio">{d.reason === r.id && <Icon name="check" />}</span>
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <h1 className="title">Add a photo</h1>
              <div className="photos">
                {d.photos.map((src, i) => (
                  <div key={i} className="photo">
                    <img src={src} alt={`Photo ${i + 1} of the ${item.name}`} />
                    <button aria-label="Remove photo" onClick={() => set({ photos: d.photos.filter((_, j) => j !== i) })}><Icon name="close" /></button>
                  </div>
                ))}
                {d.photos.length < 4 && (
                  <button className="photo add" onClick={() => fileRef.current?.click()}>
                    <Icon name="add" />Add
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={addPhotos} />
              </div>
            </>
          )}
          {step === 4 && (
            <>
              <h1 className="title">How should we fix it?</h1>
              <div className="options" role="radiogroup" aria-label="Fix">
                <button className="option" role="radio" aria-checked={d.fix === 'exchange'} onClick={() => set({ fix: 'exchange' })}>
                  <span className="badge"><Icon name="refresh" /></span><span className="label">Exchange</span>
                  <span className="amount">$0</span>
                  <span className="radio">{d.fix === 'exchange' && <Icon name="check" />}</span>
                </button>
                <button className="option" role="radio" aria-checked={d.fix === 'refund'} onClick={() => set({ fix: 'refund' })}>
                  <span className="badge"><Icon name="credit_card" /></span><span className="label">Refund</span>
                  <span className="amount">{money(refundFor(item.price))}</span>
                  <span className="radio">{d.fix === 'refund' && <Icon name="check" />}</span>
                </button>
              </div>
              <p className="section-label" style={{ marginTop: 4 }}>Crew visit</p>
              <div className="chips">
                {VISITS.map((v) => (
                  <button key={v} className="chip choice" aria-pressed={d.visit === v} onClick={() => set({ visit: v })}>
                    <Icon name="calendar_month" />&nbsp;{v}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="footer" style={{ paddingTop: 12 }}>
        <button className="btn primary" onClick={next}>{step === 4 ? 'Review' : 'Continue'}</button>
      </div>
    </Screen>
  );
}

const rank = (id: string) => (isLamp(id) ? 0 : ['coffee-table', 'linen-sofa', 'desk-chair'].indexOf(id) + 1 || 9);

export function ReturnReview() {
  const navigate = useNavigate();
  const order = useOrder();
  if (!order || !draft.itemId) return <Navigate to="/orders" replace />;
  const item = order.lines.find((l) => l.id === draft.itemId)!;
  const amount = draft.fix === 'refund' ? refundFor(item.price) : 0;

  const submit = () => {
    const ret: ReturnRequest = {
      itemId: item.id,
      reason: REASONS.find((r) => r.id === draft.reason)!.label,
      fix: draft.fix,
      visit: draft.visit,
      amount,
    };
    saveOrder({ ...order, ret });
    navigate('/return/approved', { replace: true });
  };

  return (
    <Screen>
      <nav className="navbar"><BackButton icon="close" label="Close" /></nav>
      <div className="body" style={{ gap: 18, paddingTop: 20 }}>
        <h1 className="title">Review</h1>
        <div className="line-row"><img src={item.image} alt="" /><span className="name">{item.name}</span><span className="price">{money(item.price)}</span></div>
        <div className="list rows">
          <div className="list-row"><span className="label">Issue</span><span className="value">{REASONS.find((r) => r.id === draft.reason)!.label}</span></div>
          <div className="list-row"><span className="label">Fix</span><span className="value">{draft.fix === 'exchange' ? 'Exchange' : 'Refund'}</span></div>
          <div className="list-row"><span className="label">Crew visit</span><span className="value">{draft.visit}</span></div>
          {draft.photos.length > 0 && (
            <div className="list-row"><span className="label">Photos</span><span className="value">{draft.photos.length}</span></div>
          )}
          {draft.fix === 'exchange' ? (
            <div className="list-row total"><span className="label">You pay</span><span className="plus-tag">Plus</span><span className="value">$0</span></div>
          ) : (
            <div className="list-row total"><span className="label">You get back</span><span className="value">{money(amount)}</span></div>
          )}
        </div>
      </div>
      <div style={{ flex: 1 }} />
      <div className="footer"><button className="btn primary" onClick={submit}>Submit</button></div>
    </Screen>
  );
}

export function ReturnApproved() {
  const navigate = useNavigate();
  const order = useOrder();
  if (!order?.ret) return <Navigate to="/orders" replace />;
  const r = order.ret;
  const item = order.lines.find((l) => l.id === r.itemId)!;
  const what = isLamp(item.id) ? 'the lamp' : `the ${item.name.toLowerCase()}`;
  const visitShort = r.visit.replace(/^\w+, /, '');
  return (
    <Screen>
      <div className="done-hero">
        <span className="done-badge"><Icon name="check" /></span>
        <h1 className="title">{r.fix === 'exchange' ? 'Exchange approved' : 'Refund approved'}</h1>
        <Tracker
          steps={[
            { label: 'Request sent', when: 'Nov 2', state: 'done' },
            { label: 'Approved', when: 'Nov 2', state: 'done' },
            { label: r.fix === 'exchange' ? `Crew swaps ${what}` : `Crew picks up ${what}`, when: visitShort, state: 'now' },
            { label: r.fix === 'exchange' ? 'Done' : `${money(r.amount)} back to your card`, state: 'todo' },
          ]}
        />
      </div>
      <div style={{ flex: 1 }} />
      <div className="footer">
        <button className="btn primary" onClick={() => navigate(`/orders/${order.id}`, { replace: true })}>Done</button>
      </div>
    </Screen>
  );
}

/** Prototype control: jump to delivery day so the check-in flow can be tested. */
export function simulateDelivery(order: Order) {
  saveOrder({ ...order, status: 'delivered' });
}

