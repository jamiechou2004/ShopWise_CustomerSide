import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Device } from './components/Device';
import { Email, Greeting, SignUp, Welcome, YoureIn } from './screens/Onboarding';
import { Home } from './screens/Home';
import { Profile, Search, StyleDetail } from './screens/Browse';
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Device>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
