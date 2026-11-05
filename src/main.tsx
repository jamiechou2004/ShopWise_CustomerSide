import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, MemoryRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Device } from './components/Device';
import { Email, Greeting, SignUp, Welcome, YoureIn } from './screens/Onboarding';
import { Home } from './screens/Home';
import { Profile, Search, StyleDetail } from './screens/Browse';
import { Brief, Generating, SetupStep } from './screens/Setup';
import { AskAI, BrowseLamps, FindingOptions, LampDetail, LampOptions, PlanSaved, ReplaceLamp, RoomPlan, TryLamp } from './screens/Plan';
import { Costs, Delivery, LampSwapped, OrderPlaced, PickLamp, ReviewFurniture } from './screens/Checkout';
import { CheckIn, CheckInNotification, OrderDetail, Orders, ReturnApproved, ReturnReview, ReturnStep } from './screens/Orders';
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
        <Route path="/plan" element={<RequireOnboarded><RoomPlan /></RequireOnboarded>} />
        <Route path="/plan/lamp" element={<RequireOnboarded><LampDetail /></RequireOnboarded>} />
        <Route path="/plan/lamp/replace" element={<RequireOnboarded><ReplaceLamp /></RequireOnboarded>} />
        <Route path="/plan/lamp/browse" element={<RequireOnboarded><BrowseLamps /></RequireOnboarded>} />
        <Route path="/plan/lamp/ask" element={<RequireOnboarded><AskAI /></RequireOnboarded>} />
        <Route path="/plan/lamp/finding" element={<RequireOnboarded><FindingOptions /></RequireOnboarded>} />
        <Route path="/plan/lamp/options" element={<RequireOnboarded><LampOptions /></RequireOnboarded>} />
        <Route path="/plan/lamp/try/:lampId" element={<RequireOnboarded><TryLamp /></RequireOnboarded>} />
        <Route path="/plan/saved" element={<RequireOnboarded><PlanSaved /></RequireOnboarded>} />
        <Route path="/checkout" element={<RequireOnboarded><ReviewFurniture /></RequireOnboarded>} />
        <Route path="/checkout/delivery" element={<RequireOnboarded><Delivery /></RequireOnboarded>} />
        <Route path="/checkout/costs" element={<RequireOnboarded><Costs /></RequireOnboarded>} />
        <Route path="/checkout/pay" element={<RequireOnboarded><Costs paying /></RequireOnboarded>} />
        <Route path="/checkout/placed" element={<RequireOnboarded><OrderPlaced /></RequireOnboarded>} />
        <Route path="/orders" element={<RequireOnboarded><Orders /></RequireOnboarded>} />
        <Route path="/orders/:id" element={<RequireOnboarded><OrderDetail /></RequireOnboarded>} />
        <Route path="/orders/:id/swap" element={<RequireOnboarded><PickLamp /></RequireOnboarded>} />
        <Route path="/orders/:id/swapped" element={<RequireOnboarded><LampSwapped /></RequireOnboarded>} />
        <Route path="/notify" element={<RequireOnboarded><CheckInNotification /></RequireOnboarded>} />
        <Route path="/check-in" element={<RequireOnboarded><CheckIn /></RequireOnboarded>} />
        <Route path="/return/review" element={<RequireOnboarded><ReturnReview /></RequireOnboarded>} />
        <Route path="/return/approved" element={<RequireOnboarded><ReturnApproved /></RequireOnboarded>} />
        <Route path="/return/:step" element={<RequireOnboarded><ReturnStep /></RequireOnboarded>} />
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
