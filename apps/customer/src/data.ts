import { asset } from './asset';
export type Category = 'seating' | 'tables' | 'lighting' | 'beds' | 'storage';

export interface Piece {
  id: string;
  name: string;
  price: number;
  image: string;
  category: Category | 'desks';
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
  { id: 'linen-sofa', name: 'Linen sofa', price: 700, image: asset('img/sofa.png'), category: 'seating' },
  { id: 'armchair', name: 'Armchair', price: 250, image: asset('img/chair.png'), category: 'seating' },
  { id: 'coffee-table', name: 'Coffee table', price: 150, image: asset('img/table.png'), category: 'tables' },
  { id: 'shade-floor-lamp', name: 'Shade floor lamp', price: 120, image: asset('img/lamp.png'), category: 'lighting' },
  { id: 'queen-bed', name: 'Queen bed', price: 900, image: asset('img/bed.png'), category: 'beds' },
  { id: 'desk', name: 'Desk', price: 200, image: asset('img/desk.png'), category: 'tables' },
  { id: 'wardrobe', name: 'Wardrobe', price: 300, image: asset('img/wardrobe.png'), category: 'storage' },
  { id: 'desk-chair', name: 'Desk chair', price: 150, image: asset('img/chair.png'), category: 'seating' },
];

export const styles = [
  {
    id: 'restful-bedroom',
    title: 'A restful bedroom',
    image: asset('img/bedroom.png'),
    materials: ['Linen', 'Light oak', 'Daylight'],
    seating: [
      { name: 'Sofa', price: 700, image: asset('img/sofa.png') },
      { name: 'Armchair', price: 250, image: asset('img/chair.png') },
      { name: 'Coffee table', price: 150, image: asset('img/table.png') },
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
