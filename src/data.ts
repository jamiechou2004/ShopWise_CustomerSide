export type Category = 'seating' | 'tables' | 'lighting' | 'beds' | 'storage';

export interface Piece {
  id: string;
  name: string;
  price: number;
  image: string;
  category: Category | 'desks';
}

export const categories: { id: Category; label: string; image: string }[] = [
  { id: 'seating', label: 'Seating', image: '/img/chair.png' },
  { id: 'tables', label: 'Tables', image: '/img/table.png' },
  { id: 'lighting', label: 'Lighting', image: '/img/lamp.png' },
  { id: 'beds', label: 'Beds', image: '/img/bed.png' },
  { id: 'storage', label: 'Storage', image: '/img/wardrobe.png' },
];

// Prices match checkout (C1 · Review furniture): Queen bed $900, Desk $200.
export const pieces: Piece[] = [
  { id: 'linen-sofa', name: 'Linen sofa', price: 700, image: '/img/sofa.png', category: 'seating' },
  { id: 'armchair', name: 'Armchair', price: 250, image: '/img/chair.png', category: 'seating' },
  { id: 'coffee-table', name: 'Coffee table', price: 150, image: '/img/table.png', category: 'tables' },
  { id: 'shade-floor-lamp', name: 'Shade floor lamp', price: 120, image: '/img/lamp.png', category: 'lighting' },
  { id: 'queen-bed', name: 'Queen bed', price: 900, image: '/img/bed.png', category: 'beds' },
  { id: 'desk', name: 'Desk', price: 200, image: '/img/desk.png', category: 'tables' },
  { id: 'wardrobe', name: 'Wardrobe', price: 300, image: '/img/wardrobe.png', category: 'storage' },
  { id: 'desk-chair', name: 'Desk chair', price: 150, image: '/img/chair.png', category: 'seating' },
];

export const styles = [
  {
    id: 'restful-bedroom',
    title: 'A restful bedroom',
    image: '/img/bedroom.png',
    materials: ['Linen', 'Light oak', 'Daylight'],
    seating: [
      { name: 'Sofa', price: 700, image: '/img/sofa.png' },
      { name: 'Armchair', price: 250, image: '/img/chair.png' },
      { name: 'Coffee table', price: 150, image: '/img/table.png' },
    ],
  },
];

export const pairings = [
  { id: 'quiet-everyday', title: 'Quiet, everyday living', image: '/img/room.png' },
  { id: 'reading-corner', title: 'A softer reading corner', image: '/img/chair.png' },
  { id: 'personality', title: 'A little personality', image: '/img/victorian.png' },
  { id: 'clean-minimal', title: 'Clean & minimal', image: '/img/bauhaus.png' },
];

export const money = (n: number) => `$${n.toLocaleString('en-US')}`;
