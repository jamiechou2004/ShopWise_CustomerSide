import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppleMark, BackButton, Icon, Screen } from '../components/ui';
import { HomeType, getProfile, updateProfile, useProfile } from '../store';

/* E1 · Welcome */
export function Welcome() {
  const navigate = useNavigate();
  const signIn = () => navigate(getProfile().onboardedAt ? '/home' : '/signup/email');
  return (
    <Screen plain>
      <div className="welcome-hero">
        <img src="/img/room.png" alt="A calm living room with a grey linen sofa and light oak coffee table" />
      </div>
      <div className="welcome-copy">
        <p className="eyebrow">SHOPWISE</p>
        <h1 className="display">A home that feels like you.</h1>
      </div>
      <div style={{ flex: 1 }} />
      <div className="footer with-link">
        <button className="btn primary" onClick={() => navigate('/signup')}>
          Get started
        </button>
        <button className="link" onClick={signIn}>
          I already have an account
        </button>
      </div>
    </Screen>
  );
}

function SignupNav({ step }: { step: 1 | 2 }) {
  return (
    <nav className="navbar">
      <BackButton />
      <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={3} aria-valuenow={step}>
        <span style={{ width: `${(step / 3) * 100}%` }} />
      </div>
      <span className="progress-count">{step} / 3</span>
    </nav>
  );
}

/* E2 · Sign up */
export function SignUp() {
  const navigate = useNavigate();
  const social = (method: 'apple' | 'google') => {
    updateProfile({ signUpMethod: method, email: undefined });
    navigate('/signup/name');
  };
  return (
    <Screen>
      <SignupNav step={1} />
      <div className="body" style={{ gap: 28 }}>
        <h1 className="title">Make yourself at home.</h1>
        <div className="options" style={{ gap: 16 }}>
          <button className="btn primary" onClick={() => social('apple')}>
            <AppleMark />
            Continue with Apple
          </button>
          <button className="btn secondary" onClick={() => social('google')}>
            <span style={{ color: '#4285f4', fontWeight: 600, fontSize: 17 }}>G</span>
            Continue with Google
          </button>
          <button className="btn secondary" onClick={() => navigate('/signup/email')}>
            <Icon name="mail" fill />
            Continue with Email
          </button>
        </div>
      </div>
      <div style={{ flex: 1 }} />
      <div className="footer">
        <button className="link lg" onClick={() => navigate('/signup/email')}>
          Log in
        </button>
      </div>
    </Screen>
  );
}

/* E2 · Email */
export function Email() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(getProfile().email ?? '');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [touched, setTouched] = useState(false);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordOk = password.length >= 8;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!emailOk || !passwordOk) return;
    updateProfile({ signUpMethod: 'email', email });
    navigate('/signup/name');
  };

  return (
    <Screen>
      <SignupNav step={2} />
      <form className="body" style={{ gap: 28, flex: 1 }} onSubmit={submit} noValidate>
        <h1 className="title">Create your account</h1>
        <div className="options" style={{ gap: 16 }}>
          <label className="field">
            <Icon name="mail" fill />
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="Email"
              aria-label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </label>
          <label className="field">
            <input
              type={show ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Password"
              aria-label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" className="aside" onClick={() => setShow((s) => !s)}>
              {show ? 'Hide' : 'Show'}
            </button>
          </label>
          {touched && !emailOk && <p className="field-error">Enter an email like name@example.com</p>}
          {touched && emailOk && !passwordOk && <p className="field-error">Use at least 8 characters</p>}
        </div>
        <div style={{ flex: 1 }} />
        <div className="footer" style={{ padding: '0 0 50px' }}>
          <button className="btn primary" type="submit">
            Create account
          </button>
        </div>
      </form>
    </Screen>
  );
}

/* E2 · You're in */
export function YoureIn() {
  const navigate = useNavigate();
  const [name, setName] = useState(getProfile().name ?? '');
  const trimmed = name.trim();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!trimmed) return;
    updateProfile({ name: trimmed });
    navigate('/greeting');
  };

  return (
    <Screen>
      <nav className="navbar">
        <BackButton />
        <div className="segments" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </nav>
      <form className="body" style={{ gap: 24, flex: 1 }} onSubmit={submit}>
        <h1 className="title">You’re in.</h1>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="field-label">What should we call you?</span>
          <span className="field">
            <input
              autoComplete="given-name"
              placeholder="Your first name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </span>
        </label>
        <div className="steps">
          <div className="step">
            <span className="badge"><Icon name="home" fill /></span>
            Your space
          </div>
          <Icon name="chevron_right" />
          <div className="step">
            <span className="badge"><Icon name="auto_awesome" /></span>
            Your style
          </div>
          <Icon name="chevron_right" />
          <div className="step">
            <span className="badge"><Icon name="credit_card" /></span>
            Your budget
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div className="footer" style={{ padding: '0 0 50px' }}>
          <button className="btn primary" type="submit" disabled={!trimmed}>
            Continue
          </button>
        </div>
      </form>
    </Screen>
  );
}

const HOME_TYPES: { id: HomeType; label: string; icon: string; fill?: boolean }[] = [
  { id: 'apartment', label: 'Apartment', icon: 'apartment' },
  { id: 'house', label: 'House', icon: 'home', fill: true },
  { id: 'shared', label: 'Shared home', icon: 'group' },
];

/* E3 · Greeting */
export function Greeting() {
  const navigate = useNavigate();
  const profile = useProfile();
  const [choice, setChoice] = useState<HomeType>(profile.homeType ?? 'apartment');

  const finish = (withChoice: boolean) => {
    updateProfile({
      homeType: withChoice ? choice : undefined,
      setupStepsDone: withChoice ? 1 : 0,
      onboardedAt: profile.onboardedAt ?? new Date().toISOString(),
    });
    navigate('/home', { replace: true });
  };

  return (
    <Screen>
      <nav className="navbar">
        <BackButton />
      </nav>
      <div className="body" style={{ gap: 28 }}>
        <h1 className="title">
          Nice to meet you, {profile.name || 'there'}. What are you furnishing?
        </h1>
        <div className="options" role="radiogroup" aria-label="Home type">
          {HOME_TYPES.map((t) => (
            <button
              key={t.id}
              className="option"
              role="radio"
              aria-checked={choice === t.id}
              onClick={() => setChoice(t.id)}
            >
              <span className="badge"><Icon name={t.icon} fill={t.fill} /></span>
              <span className="label">{t.label}</span>
              <span className="radio">{choice === t.id && <Icon name="check" />}</span>
            </button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1 }} />
      <div className="footer with-link">
        <button className="btn primary" onClick={() => finish(true)}>
          Continue
        </button>
        <button className="link" onClick={() => finish(false)}>
          Skip for now
        </button>
      </div>
    </Screen>
  );
}
