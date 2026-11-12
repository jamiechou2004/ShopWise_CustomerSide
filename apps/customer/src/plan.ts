import { asset } from './asset';
import { money, pieces } from './data';
import { OrderLine, Plan } from './store';

/* ---------- Lamps: the one piece with a full replace chain ---------- */

export interface Lamp {
  id: string;
  name: string;
  short: string;
  price: number;
  store: string;
  size: string;
  material: string;
  light: string;
  warm: boolean;
  /** Square thumbnail: the lamp in Alex's room. */
  thumb: string;
  /** Close-up used in browse and swap lists. */
  closeup: string;
  /** Room photo with this lamp, for the plan hero and before/after. */
  hero: string;
  /** Where the lamp sits in the hero (top-left of a 76px ring). */
  ring: { x: number; y: number };
}

export const LAMPS: Lamp[] = [
  {
    id: 'shade-floor', name: 'Shade floor lamp', short: 'Shade floor', price: 120, store: 'Store B',
    size: 'H 152 × Ø 30 cm', material: 'Steel + linen', light: '4000 K', warm: false,
    thumb: asset('img/lamp.png'), closeup: asset('img/lamp.png'), hero: asset('img/room.png'), ring: { x: 316, y: 140 },
  },
  {
    id: 'mini-globe', name: 'Mini globe lamp', short: 'Mini globe', price: 80, store: 'Store B',
    size: 'H 140 × Ø 25 cm', material: 'Steel + opal glass', light: '2700 K', warm: true,
    thumb: asset('img/lamp-mini-room.png'), closeup: asset('img/lamp-mini.png'), hero: asset('img/room-mini.png'), ring: { x: 322, y: 112 },
  },
  {
    id: 'slim-shade', name: 'Slim shade lamp', short: 'Slim shade', price: 95, store: 'Store B',
    size: 'H 160 × Ø 35 cm', material: 'Brass + linen', light: '3000 K', warm: true,
    thumb: asset('img/lamp-slim-room.png'), closeup: asset('img/lamp-slim.png'), hero: asset('img/lamp-slim-room.png'), ring: { x: 315, y: 63 },
  },
  {
    id: 'tall-drum', name: 'Tall drum lamp', short: 'Tall drum', price: 110, store: 'Store B',
    size: 'H 165 × Ø 40 cm', material: 'Steel + cotton', light: '3500 K', warm: false,
    thumb: asset('img/lamp-drum.png'), closeup: asset('img/lamp-drum.png'), hero: asset('img/lamp-drum.png'), ring: { x: 216, y: 10 },
  },
  {
    id: 'stone-glow', name: 'Stone glow lamp', short: 'Stone glow', price: 320, store: 'Store B',
    size: 'H 120 × Ø 40 cm', material: 'Travertine + glass', light: '2700 K', warm: true,
    thumb: asset('img/lamp-stone-room.png'), closeup: asset('img/lamp-stone.png'), hero: asset('img/lamp-stone-room.png'), ring: { x: 320, y: 152 },
  },
];

export const DEFAULT_LAMP = 'shade-floor';
export const lampById = (id?: string) => LAMPS.find((l) => l.id === id) ?? LAMPS[0];
export const isLamp = (id: string) => LAMPS.some((l) => l.id === id);

/* ---------- Rooms in the plan ---------- */

export interface Item {
  id: string;
  name: string;
  price: number;
  /** Missing for pieces without a product photo yet; rows show an icon tile instead. */
  image?: string;
  icon: string;
  kind: 'sofa' | 'chair' | 'table' | 'storage' | 'bed' | 'other';
}

// Pieces only the AI flows add. Prices keep Figma's totals: Light & airy $1,420, updated $1,470.
const EXTRA_ITEMS: Item[] = [
  { id: 'sofa-bed', name: 'Sofa bed', price: 890, icon: 'weekend', kind: 'sofa' },
  { id: 'pouf', name: 'Pouf', price: 110, icon: 'chair', kind: 'chair' },
  { id: 'side-table', name: 'Side table', price: 90, icon: 'table_bar', kind: 'table' },
  { id: 'wall-shelf', name: 'Wall shelf', price: 110, icon: 'shelves', kind: 'storage' },
  { id: 'boucle-loveseat', name: 'Bouclé loveseat', price: 520, image: asset('img/my-room-boucle.png'), icon: 'weekend', kind: 'sofa' },
  { id: 'caramel-sofa', name: 'Caramel leather sofa', price: 980, image: asset('img/my-room-caramel.png'), icon: 'weekend', kind: 'sofa' },
];

const KIND: Record<string, Item['kind']> = {
  'linen-sofa': 'sofa', armchair: 'chair', 'desk-chair': 'chair', 'coffee-table': 'table', desk: 'table',
  wardrobe: 'storage', 'queen-bed': 'bed',
};
const ICON: Record<Item['kind'], string> = { sofa: 'weekend', chair: 'chair', table: 'table_bar', storage: 'shelves', bed: 'bed', other: 'chair' };

export function itemById(id: string): Item {
  const extra = EXTRA_ITEMS.find((i) => i.id === id);
  if (extra) return extra;
  const p = pieces.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown item ${id}`);
  const kind = KIND[id] ?? 'other';
  return { id: p.id, name: p.name, price: p.price, image: p.image, icon: ICON[kind], kind };
}

export const isSofa = (id: string) => id !== 'lamp' && !isLamp(id) && itemById(id).kind === 'sofa';

/** 'lamp' is the lamp slot; it resolves to plan.lampId so the lamp swap chain keeps working. */
export const DEFAULT_LIVING = ['linen-sofa', 'lamp', 'coffee-table'];
export const DEFAULT_BEDROOM = ['queen-bed', 'wardrobe', 'desk', 'desk-chair'];

export function planLines(plan: Plan | undefined): { living: OrderLine[]; bedroom: OrderLine[]; all: OrderLine[] } {
  const lamp = lampById(plan?.lampId ?? DEFAULT_LAMP);
  const toLine = (id: string): OrderLine => {
    if (id === 'lamp') return { id: lamp.id, name: lamp.name, price: lamp.price, image: lamp.thumb };
    const i = itemById(id);
    return { id: i.id, name: i.name, price: i.price, image: i.image ?? '' };
  };
  const living = (plan?.living ?? DEFAULT_LIVING).map(toLine);
  const bedroom = (plan?.bedroom ?? DEFAULT_BEDROOM).map(toLine);
  // Checkout order: living room without the lamp, then the lamp, then bedroom (matches C1).
  const lampLines = living.filter((l) => isLamp(l.id));
  const all = [...living.filter((l) => !isLamp(l.id)), ...lampLines, ...bedroom];
  return { living, bedroom, all };
}

/** Icon for a line without a photo. */
export const lineIcon = (id: string) => (isLamp(id) ? 'lightbulb' : itemById(id).icon);

/* ---------- Money: one rule for every screen ---------- */

// Derived from checkout: $207 tax on $2,480 of furniture.
export const TAX_RATE = 207 / 2480;
export const DELIVERY = 120;
export const SERVICE_FEE = 0; // Plus members

export const taxOn = (amount: number) => Math.round(amount * TAX_RATE);

export function totals(lines: { price: number }[]) {
  const furniture = lines.reduce((s, l) => s + l.price, 0);
  const tax = taxOn(furniture);
  return { furniture, tax, delivery: DELIVERY, service: SERVICE_FEE, total: furniture + tax + DELIVERY + SERVICE_FEE };
}

/** Plan total if the lamp were swapped for another. */
export function totalWithLamp(plan: Plan | undefined, lampId: string) {
  return totals(planLines({ ...(plan as Plan), lampId }).all).total;
}

export const signed = (n: number) => (n === 0 ? '$0' : n > 0 ? `+${money(n)}` : `−${money(-n)}`);

/* ---------- Order constants (simulated) ---------- */

export const ORDER_ID = 'SW-10482';
export const PAID_ON = 'Oct 24';
export const BUYING_ON = 'Oct 25–27';
export const SLOTS = [
  { id: 'thu', label: 'Thu, Oct 30 · 2–4 pm', short: 'Oct 30 · 2–4 pm', plus: false },
  { id: 'fri', label: 'Fri, Oct 31 · 10–12', short: 'Oct 31 · 10–12', plus: true },
  { id: 'sat', label: 'Sat, Nov 1 · 9–11 am', short: 'Nov 1 · 9–11 am', plus: false },
];
export const slotById = (id: string) => SLOTS.find((s) => s.id === id) ?? SLOTS[0];
export const STORE_COUNT = 3;
