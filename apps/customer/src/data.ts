import { asset } from './asset';
export type Category = 'seating' | 'tables' | 'lighting' | 'beds' | 'storage';

export interface Piece {
  id: string;
  name: string;
  price: number;
  image: string;
  category: Category | 'desks';
  /** Shown on the piece page. Simulated, like the stores. */
  store: string;
  size: string;
  material: string;
  note: string;
}

export const categories: { id: Category; label: string; image: string }[] = [
  { id: 'seating', label: 'Seating', image: asset('img/chair.png') },
  { id: 'tables', label: 'Tables', image: asset('img/table.png') },
  { id: 'lighting', label: 'Lighting', image: asset('img/lamp.png') },
  { id: 'beds', label: 'Beds', image: asset('img/bed.png') },
  { id: 'storage', label: 'Storage', image: asset('img/wardrobe.png') },
];

// Prices match checkout (C1 · Review furniture): Queen bed $900, Desk $200.
export const pieces: Piece[] = [
  { id: 'linen-sofa', name: 'Linen sofa', price: 700, image: asset('img/sofa.png'), category: 'seating', store: 'Store A', size: 'W 208 × D 90 × H 82 cm', material: 'Linen blend + oak', note: 'Seats three. The cover comes off to wash.' },
  { id: 'armchair', name: 'Armchair', price: 250, image: asset('img/chair.png'), category: 'seating', store: 'Store A', size: 'W 68 × D 72 × H 80 cm', material: 'Wool blend + oak', note: 'A compact chair for a reading corner.' },
  { id: 'coffee-table', name: 'Coffee table', price: 150, image: asset('img/table.png'), category: 'tables', store: 'Store A', size: 'W 110 × D 60 × H 40 cm', material: 'Solid oak', note: 'Low and wide, with rounded corners.' },
  { id: 'shade-floor-lamp', name: 'Shade floor lamp', price: 120, image: asset('img/lamp.png'), category: 'lighting', store: 'Store B', size: 'H 152 × Ø 30 cm', material: 'Steel + linen', note: 'Soft, even light beside a sofa.' },
  { id: 'queen-bed', name: 'Queen bed', price: 900, image: asset('img/bed.png'), category: 'beds', store: 'Store A', size: 'W 160 × L 210 × H 95 cm', material: 'Oak + linen headboard', note: 'Fits a queen mattress. Slats included.' },
  { id: 'desk', name: 'Desk', price: 200, image: asset('img/desk.png'), category: 'tables', store: 'Store B', size: 'W 120 × D 60 × H 74 cm', material: 'Oak veneer + steel', note: 'Room for a laptop and a monitor.' },
  { id: 'wardrobe', name: 'Wardrobe', price: 300, image: asset('img/wardrobe.png'), category: 'storage', store: 'Store A', size: 'W 100 × D 58 × H 200 cm', material: 'Painted wood', note: 'Two doors, one rail and a top shelf.' },
  { id: 'desk-chair', name: 'Desk chair', price: 150, image: asset('img/chair.png'), category: 'seating', store: 'Store B', size: 'W 62 × D 60 × H 82 cm', material: 'Wool blend + oak', note: 'Upright and padded for long days.' },
];

export const pieceById = (id?: string) => pieces.find((p) => p.id === id);

export const styles = [
  {
    id: 'restful-bedroom',
    title: 'A restful bedroom',
    image: asset('img/bedroom.png'),
    materials: ['Linen', 'Light oak', 'Daylight'],
    seating: [
      { id: 'linen-sofa', name: 'Sofa', price: 700, image: asset('img/sofa.png') },
      { id: 'armchair', name: 'Armchair', price: 250, image: asset('img/chair.png') },
      { id: 'coffee-table', name: 'Coffee table', price: 150, image: asset('img/table.png') },
    ],
  },
];

export const pairings = [
  { id: 'quiet-everyday', title: 'Quiet, everyday living', image: asset('img/room.png') },
  { id: 'reading-corner', title: 'A softer reading corner', image: asset('img/chair.png') },
  { id: 'personality', title: 'A little personality', image: asset('img/victorian.png') },
  { id: 'clean-minimal', title: 'Clean & minimal', image: asset('img/bauhaus.png') },
];

export const money = (n: number) => `$${n.toLocaleString('en-US')}`;
