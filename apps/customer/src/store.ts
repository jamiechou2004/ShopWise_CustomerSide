import { useSyncExternalStore } from 'react';

// Same key as the earlier Shopwise prototype. Fields are merged in, never wiped.
const KEY = 'shopwise-prototype-v1';

export type HomeType = 'apartment' | 'house' | 'shared';

export interface Profile {
  signUpMethod?: 'apple' | 'google' | 'email';
  email?: string;
  name?: string;
  homeType?: HomeType;
  onboardedAt?: string;
  favorites?: string[];
}

export type StyleId = 'warm' | 'minimal' | 'eclectic';

export interface PlanAnswers {
  goal: 'home' | 'piece';
  floorPlan: boolean;
  rooms: { name: string; count: number }[];
  size: string | null;
  planRooms: 'living-bedroom' | 'living' | 'bedroom' | 'custom';
  planRoomsCustom: string;
  furniture: 'fresh' | 'keeping';
  keeping: string[];
  livingWith: string[];
  everyDay: string[];
  style: StyleId;
  budget: number | null;
  location: string;
  timing: 'two-weeks' | 'month' | 'flexible';
  timingNote: string;
}

export interface Plan {
  status: 'draft' | 'ready';
  /** Which lamp is in the living room (the one piece with a full replace chain). */
  lampId?: string;
  /** Living room and bedroom pieces; unset means the default plan. 'lamp' is the lamp slot. */
  living?: string[];
  bedroom?: string[];
  /** Set when the living room came from Plan with AI. */
  livingBudget?: number;
  /** Screens finished, out of SETUP_TOTAL (9 questions + brief + generate). */
  stepsDone: number;
  answers: PlanAnswers;
  updatedAt: string;
}

export const DEFAULT_ANSWERS: PlanAnswers = {
  goal: 'home',
  floorPlan: false,
  rooms: [
    { name: 'Bedrooms', count: 1 },
    { name: 'Living rooms', count: 1 },
    { name: 'Bathrooms', count: 1 },
  ],
  size: '800–1,199',
  planRooms: 'living-bedroom',
  planRoomsCustom: '',
  furniture: 'fresh',
  keeping: [],
  livingWith: ['Just me'],
  everyDay: ['Work from home', 'Hosting', 'Storage'],
  style: 'warm',
  budget: 3000,
  location: 'New York, NY',
  timing: 'two-weeks',
  timingNote: '',
};

export interface OrderLine {
  id: string;
  name: string;
  price: number;
  image: string;
}

export interface ReturnRequest {
  itemId: string;
  reason: string;
  fix: 'exchange' | 'refund';
  visit: string;
  amount: number;
}

/** Orders are snapshots: editing the plan later never changes them. */
export interface Order {
  id: string;
  lines: OrderLine[];
  total: number;
  slot: string;
  status: 'buying' | 'delivered';
  /** Set once the sold-out lamp is resolved. */
  swap?: { from: string; to: string; diff: number };
  ret?: ReturnRequest;
}

type Store = { profile?: Profile; plan?: Plan; order?: Order } & Record<string, unknown>;

let cache: Store | null = null;
const listeners = new Set<() => void>();

function read(): Store {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) || '{}') as Store;
  } catch {
    cache = {};
  }
  return cache;
}

function write(next: Store) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — keep in memory */
  }
  listeners.forEach((l) => l());
}

export function updateProfile(patch: Partial<Profile>) {
  const store = read();
  write({ ...store, profile: { ...store.profile, ...patch } });
}

const EMPTY: Profile = Object.freeze({});

// Must return a stable reference for useSyncExternalStore.
export function getProfile(): Profile {
  return read().profile ?? EMPTY;
}

export function getPlan(): Plan | undefined {
  return read().plan;
}

/** Merge answers into the plan; never lowers stepsDone. */
export function savePlan(patch: {
  answers?: Partial<PlanAnswers>;
  stepsDone?: number;
  status?: Plan['status'];
  lampId?: string;
  living?: string[];
  bedroom?: string[];
  livingBudget?: number;
}) {
  const store = read();
  const prev = store.plan;
  const plan: Plan = {
    status: patch.status ?? prev?.status ?? 'draft',
    lampId: patch.lampId ?? prev?.lampId,
    living: patch.living ?? prev?.living,
    bedroom: patch.bedroom ?? prev?.bedroom,
    livingBudget: patch.livingBudget ?? prev?.livingBudget,
    stepsDone: Math.max(prev?.stepsDone ?? 0, patch.stepsDone ?? 0),
    answers: { ...DEFAULT_ANSWERS, ...prev?.answers, ...patch.answers },
    updatedAt: new Date().toISOString(),
  };
  write({ ...store, plan });
}

export function getOrder(): Order | undefined {
  return read().order;
}

export function saveOrder(order: Order | undefined) {
  write({ ...read(), order });
}

/** Clears only what this prototype's flows wrote, so other saved data stays. */
export function resetOnboarding() {
  const { profile: _p, plan: _q, order: _o, ...rest } = read();
  void _p;
  void _q;
  void _o;
  write(rest);
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useProfile(): Profile {
  return useSyncExternalStore(subscribe, getProfile, getProfile);
}

export function usePlan(): Plan | undefined {
  return useSyncExternalStore(subscribe, getPlan, getPlan);
}

export function useOrder(): Order | undefined {
  return useSyncExternalStore(subscribe, getOrder, getOrder);
}

export const SETUP_TOTAL = 10;
export const QUESTION_COUNT = 8;
