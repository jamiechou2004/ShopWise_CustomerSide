import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { BackButton, Icon, Screen, Toast, useToast } from '../components/ui';
import { money, styles } from '../data';
import { resetOnboarding, savePlan, useOrder, useProfile } from '../store';
import { simulateDelivery } from './Orders';
import { TabBar } from './Home';

type Scope = 'styles' | 'furniture' | 'rooms';

const SUGGESTIONS = [
  { icon: 'auto_awesome', label: 'Your home plan' },
  { icon: 'favorite', label: 'A restful bedroom', to: '/style/restful-bedroom' },
  { icon: 'grid_view', label: 'Linen sofas' },
  { icon: 'credit_card', label: 'Under $500' },
];

/* H2 · Search */
export function Search() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initial = (params.get('scope') as Scope) || 'styles';
  const [scope, setScope] = useState<Scope>(initial);
  const [query, setQuery] = useState('');
  const [toast, showToast] = useToast();

  const tabs: { id: Scope; label: string; icon: string; fill?: boolean }[] = [
    { id: 'styles', label: 'Styles', icon: 'auto_awesome' },
    { id: 'furniture', label: 'Furniture', icon: 'grid_view' },
    { id: 'rooms', label: 'Rooms', icon: 'home', fill: true },
  ];

  const run = () => {
    if (query.trim().toLowerCase().includes('bed')) return navigate('/style/restful-bedroom');
    showToast('Search results are part of a later flow');
  };

  return (
    <Screen>
      <nav className="navbar" style={{ gap: 24 }}>
        <BackButton icon="close" label="Close" />
        <div className="seg" role="tablist">
          {tabs.map((t) => (
            <button key={t.id} role="tab" aria-selected={scope === t.id} onClick={() => setScope(t.id)}>
              <Icon name={t.icon} fill={t.fill} />
              {t.label}
            </button>
          ))}
        </div>
      </nav>
      <div className="scroll">
        <form className="body" style={{ gap: 16, paddingTop: 20 }} onSubmit={(e) => { e.preventDefault(); run(); }}>
          <h1 className="title">What are you looking for?</h1>
          <label className="field">
            <Icon name="search" />
            <input
              type="search"
              placeholder="Search styles or furniture"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </label>
          <p className="section-label">Suggested</p>
          <div className="list">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                type="button"
                className="list-row"
                onClick={() => (s.to ? navigate(s.to) : showToast(`“${s.label}” is part of a later flow`))}
              >
                <span className="badge"><Icon name={s.icon} /></span>
                <span className="label">{s.label}</span>
                <Icon name="chevron_right" />
              </button>
            ))}
          </div>
          <div className="filters">
            <button type="button" className="filter-card"><small>Room</small><span>Any room</span></button>
            <button type="button" className="filter-card"><small>Budget</small><span>Add budget</span></button>
          </div>
        </form>
      </div>
      <div className="footer" style={{ paddingTop: 16 }}>
        <div className="row">
          <button className="btn secondary" onClick={() => setQuery('')}>Clear all</button>
          <button className="btn primary" onClick={run}>
            <Icon name="search" />
            Search
          </button>
        </div>
      </div>
      <Toast message={toast} />
    </Screen>
  );
}

/* H5 · Style detail */
export function StyleDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const style = styles.find((s) => s.id === id) ?? styles[0];
  const [saved, setSaved] = useState(false);
  const [toast, showToast] = useToast();

  return (
    <Screen plain>
      <div className="scroll">
        <div className="detail-hero">
          <img src={style.image} alt={style.title} />
          <div style={{ position: 'absolute', top: 0, left: 16 }}>
            <BackButton onImage />
          </div>
          <button
            className="icon-btn on-image right"
            aria-label="Save style"
            aria-pressed={saved}
            onClick={() => setSaved((s) => !s)}
            style={{ color: saved ? 'var(--accent)' : undefined }}
          >
            <Icon name="favorite" fill={saved} />
          </button>
        </div>
        <div className="body" style={{ gap: 16, paddingTop: 20, paddingBottom: 130 }}>
          <h1 className="title" style={{ fontSize: 30, lineHeight: '36px' }}>{style.title}</h1>
          <div className="chips">
            {style.materials.map((m) => <span key={m} className="chip">{m}</span>)}
          </div>
          <div className="section-head">
            <h2>Seating</h2>
            <button onClick={() => showToast('The full list opens in a later flow')}>See all</button>
          </div>
          <div className="rail">
            {style.seating.map((p) => (
              <article key={p.name} className="piece">
                <div className="media"><img src={p.image} alt={p.name} /></div>
                <span className="name">{p.name}</span>
                <span className="price">{money(p.price)}</span>
              </article>
            ))}
          </div>
        </div>
      </div>
      <div className="footer" style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
        <button
          className="btn primary"
          onClick={() => {
            savePlan({ answers: { style: 'warm' } });
            navigate('/setup/1');
          }}
        >
          Start with this style
        </button>
      </div>
      <Toast message={toast} />
    </Screen>
  );
}

/* Profile — minimal, so the prototype can be reset for each test session */
export function Profile() {
  const navigate = useNavigate();
  const profile = useProfile();
  const order = useOrder();
  const [toast, showToast] = useToast();
  const homeLabel = { apartment: 'Apartment', house: 'House', shared: 'Shared home' };

  return (
    <Screen>
      <div className="home-top">
        <header className="home-header">
          <h1 className="title">Profile</h1>
          <span className="avatar">{(profile.name || 'S').charAt(0).toUpperCase()}</span>
        </header>
        <div className="list">
          <div className="list-row"><span className="label">Name</span><span>{profile.name ?? '—'}</span></div>
          <div className="list-row">
            <span className="label">Signed up with</span>
            <span style={{ textTransform: 'capitalize' }}>{profile.signUpMethod ?? '—'}</span>
          </div>
          <div className="list-row">
            <span className="label">Home</span>
            <span>{profile.homeType ? homeLabel[profile.homeType] : 'Not set'}</span>
          </div>
        </div>
        <button className="list nav-row" onClick={() => navigate('/orders')}>
          <span className="list-row">
            <span className="badge plain"><Icon name="receipt_long" /></span>
            <span className="label">Your orders</span>
            {order && <span className="value muted">{order.id}</span>}
            <Icon name="chevron_right" />
          </span>
        </button>

        <p className="section-label" style={{ marginTop: 8 }}>Prototype controls</p>
        <div className="list">
          {order && order.status === 'buying' && (
            <button className="list-row" onClick={() => { simulateDelivery(order); navigate('/notify'); }}>
              <span className="label">Skip to delivery day</span>
              <Icon name="chevron_right" />
            </button>
          )}
          <button
            className="list-row"
            onClick={() => {
              resetOnboarding();
              navigate('/', { replace: true });
            }}
          >
            <span className="label">Start over</span>
            <Icon name="chevron_right" />
          </button>
        </div>
      </div>
      <TabBar active="profile" onMissing={showToast} />
      <Toast message={toast} />
    </Screen>
  );
}
