import { useCallback, useSyncExternalStore } from 'react';

// Same key as the earlier Shopwise prototype. Fields are merged in, never wiped.
const KEY = 'shopwise-prototype-v1';

export type HomeType = 'apartment' | 'house' | 'shared';

export interface Profile {
  signUpMethod?: 'apple' | 'google' | 'email';
  email?: string;
  name?: string;
  homeType?: HomeType;
  onboardedAt?: string;
  setupStepsDone?: number;
  favorites?: string[];
}

type Store = { profile?: Profile } & Record<string, unknown>;

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

/** Clears only what onboarding wrote, so other saved data stays. */
export function resetOnboarding() {
  const { profile: _drop, ...rest } = read();
  void _drop;
  write(rest);
}

export function useProfile(): Profile {
  const subscribe = useCallback((cb: () => void) => {
    listeners.add(cb);
    return () => listeners.delete(cb);
  }, []);
  return useSyncExternalStore(subscribe, getProfile, getProfile);
}

export const SETUP_TOTAL = 11;
