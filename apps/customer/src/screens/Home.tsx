import { asset } from '../asset';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Icon, Screen, Toast, useToast } from '../components/ui';
import { Category, categories, money, pairings, pieces } from '../data';
import { SETUP_TOTAL, updateProfile, usePlan, useProfile } from '../store';
import { resumePath } from './Setup';
import { AskShopwiseCard } from './Assistant';

export function TabBar({ active }: { active: 'home' | 'plan' | 'profile'; onMissing?: (m: string) => void }) {
  const navigate = useNavigate();
  const plan = usePlan();
  const items = [
    { id: 'home', label: 'Home', icon: 'home', go: () => navigate('/home') },
    {
      id: 'plan', label: 'My Plan', icon: 'auto_awesome',
      go: () => navigate(plan?.status === 'ready' ? '/plan' : resumePath(plan?.stepsDone ?? 0)),
    },
    { id: 'profile', label: 'Profile', icon: 'person', go: () => navigate('/profile') },
  ] as const;
  return (
    <nav className="tabbar" aria-label="Main">
      {items.map((t) => (
        <button
          key={t.id}
          className="tabbar-item"
          aria-current={active === t.id ? 'page' : undefined}
          onClick={t.go}
        >
          <Icon name={t.icon} />
          {t.label}
        </button>
      ))}
    </nav>
  );
}

/* H1 · Home — Furniture / Inspiration */
export function Home() {
  const navigate = useNavigate();
  const profile = useProfile();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'inspiration' ? 'inspiration' : 'furniture';
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [toast, showToast] = useToast();
  const plan = usePlan();
  const location = useLocation();

  // A toast handed over by the previous screen (save & exit, plan ready).
  useEffect(() => {
    const msg = (location.state as { toast?: string } | null)?.toast;
    if (msg) {
      showToast(msg);
      navigate(location.pathname + location.search, { replace: true, state: null });
    }
  }, [location.state]); // eslint-disable-line react-hooks/exhaustive-deps

  const done = plan?.stepsDone ?? 0;
  const setupComplete = plan?.status === 'ready';
  const favorites = new Set(profile.favorites ?? []);
  const shown = category === 'all' ? pieces : pieces.filter((p) => p.category === category);

  const toggleFavorite = (id: string) => {
    const next = new Set(favorites);
    next.has(id) ? next.delete(id) : next.add(id);
    updateProfile({ favorites: [...next] });
  };

  return (
    <Screen>
      <div className="scroll">
        <div className="home-top" style={{ paddingBottom: 140 }}>
          <header className="home-header">
            <h1 className="title">Hi, {profile.name || 'there'}</h1>
            <button className="avatar" aria-label="Profile" onClick={() => navigate('/profile')}>
              {(profile.name || 'S').charAt(0).toUpperCase()}
            </button>
          </header>

          <AskShopwiseCard />

          <div className="tabs" role="tablist">
            {(['furniture', 'inspiration'] as const).map((t) => (
              <button
                key={t}
                role="tab"
                className="tab"
                aria-selected={tab === t}
                onClick={() => setParams(t === 'furniture' ? {} : { tab: t }, { replace: true })}
              >
                {t === 'furniture' ? 'Furniture' : 'Inspiration'}
              </button>
            ))}
          </div>

          <button className="searchbar" onClick={() => navigate(`/search?scope=${tab === 'furniture' ? 'furniture' : 'styles'}`)}>
            <Icon name="search" />
            <span className="placeholder">{tab === 'furniture' ? 'Search furniture' : 'Search styles or rooms'}</span>
            <span className="filter"><Icon name="tune" /></span>
          </button>

          {tab === 'furniture' ? (
            <>
              {!setupComplete && (
                <section className="setup-card" aria-label="Finish setup">
                  <div className="text">
                    <div className="row">
                      Finish setup <span className="count">{done}/{SETUP_TOTAL}</span>
                    </div>
                    <div className="bar">
                      <span style={{ width: `${(done / SETUP_TOTAL) * 100}%` }} />
                    </div>
                  </div>
                  <button className="btn small white" onClick={() => navigate(resumePath(done))}>
                    Continue
                  </button>
                </section>
              )}

              <div className="categories" role="group" aria-label="Categories">
                <button className="category all" aria-pressed={category === 'all'} onClick={() => setCategory('all')}>
                  <span className="disc"><Icon name="grid_view" /></span>
                  All
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    className="category"
                    aria-pressed={category === c.id}
                    onClick={() => setCategory(category === c.id ? 'all' : c.id)}
                  >
                    <span className="disc"><img src={c.image} alt="" /></span>
                    {c.label}
                  </button>
                ))}
              </div>

              <div className="count-row">
                <span>{shown.length} {shown.length === 1 ? 'piece' : 'pieces'}</span>
                <button className="sort">Curated <Icon name="keyboard_arrow_down" /></button>
              </div>

              <div className="grid">
                {shown.map((p) => (
                  <article key={p.id} className="piece">
                    <div className="media">
                      <img src={p.image} alt={p.name} />
                      <button
                        className="heart"
                        aria-label={`Save ${p.name}`}
                        aria-pressed={favorites.has(p.id)}
                        onClick={() => toggleFavorite(p.id)}
                      >
                        <Icon name="favorite" />
                      </button>
                    </div>
                    <span className="name">{p.name}</span>
                    <span className="price">{money(p.price)}</span>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <>
              <button className="feature" onClick={() => navigate('/style/restful-bedroom')}>
                <img src={asset('img/bedroom.png')} alt="" />
                <span className="tag">Most loved</span>
                <span className="caption">A restful bedroom</span>
              </button>
              <div className="grid">
                {pairings.map((p) => (
                  <button key={p.id} className="pair" onClick={() => showToast('Only “A restful bedroom” is built so far')}>
                    <img src={p.image} alt="" />
                    {p.title}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="bottom-fade" />
      <TabBar active="home" onMissing={showToast} />
      <Toast message={toast} />
    </Screen>
  );
}
