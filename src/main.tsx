import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, MemoryRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Device } from './components/Device';
import { Email, Greeting, SignUp, Welcome, YoureIn } from './screens/Onboarding';
import { Home } from './screens/Home';
import { Profile, Search, StyleDetail } from './screens/Browse';
import { Brief, Generating, SetupStep } from './screens/Setup';
import { useProfile } from './store';
import '@fontsource/lexend-deca/400.css';
import '@fontsource/lexend-deca/500.css';
import '@fontsource/lexend-deca/600.css';
import './styles.css';

/** Welcome and name are not re-run once onboarding is done. */
function Entry() {
  const profile = useProfile();
  return profile.onboardedAt ? <Navigate to="/home" replace /> : <Welcome />;
}

function RequireOnboarded({ children }: { children: JSX.Element }) {
  const profile = useProfile();
  return profile.onboardedAt ? children : <Navigate to="/" replace />;
}

/** Remount per step so each question starts from the saved answers. */
function KeyedStep() {
  const { pathname, search } = useLocation();
  return <SetupStep key={pathname + search} />;
}

function App() {
  return (
    <Device>
      <Routes>
        <Route path="/" element={<Entry />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signup/email" element={<Email />} />
        <Route path="/signup/name" element={<YoureIn />} />
        <Route path="/greeting" element={<Greeting />} />
        <Route path="/home" element={<RequireOnboarded><Home /></RequireOnboarded>} />
        <Route path="/search" element={<RequireOnboarded><Search /></RequireOnboarded>} />
        <Route path="/style/:id" element={<RequireOnboarded><StyleDetail /></RequireOnboarded>} />
        <Route path="/profile" element={<RequireOnboarded><Profile /></RequireOnboarded>} />
        <Route path="/setup/brief" element={<RequireOnboarded><Brief /></RequireOnboarded>} />
        <Route path="/setup/generating" element={<RequireOnboarded><Generating /></RequireOnboarded>} />
        <Route path="/setup/:step" element={<RequireOnboarded><KeyedStep /></RequireOnboarded>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Device>
  );
}

// The hosted preview can't use URL paths, so it routes in memory.
const Router = import.meta.env.VITE_ROUTER === 'memory' ? MemoryRouter : BrowserRouter;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
);
