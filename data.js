// Sample data for the Shopwise GM console prototype. All numbers are fictional and internally consistent.
window.SW = {
  kpis: [
    { label: 'Active orders', value: '104', note: '+12 vs last week' },
    { label: 'On-time delivery', value: '94%', note: 'Target 95%' },
    { label: 'Revenue · MTD', value: '$58,944', note: '3 streams' },
    { label: 'Shopwise Plus members', value: '937', note: '+41 this month' }
  ],
  stages: [
    { name: 'Plan', count: '1,240', note: 'saved plans' },
    { name: 'Order', count: '46', note: 'paid, not yet bought' },
    { name: 'Sourcing', count: '31', note: '3 at risk' },
    { name: 'Hub', count: '18', note: '2 waiting on a store' },
    { name: 'Delivery & install', count: '9', note: 'on route today' },
    { name: 'Aftercare', count: '27', note: 'open check-ins' }
  ],
  revenue: [
    { name: 'Delivery & install', value: 26400, cls: 'r1' },
    { name: 'Service fee', value: 21300, cls: 'r2' },
    { name: 'Shopwise Plus', value: 11244, cls: 'r3' }
  ],
  alerts: [
    { title: 'SW-10482 · Alex', body: 'Bed from Store C reaches the hub today · delivery held for one drop', order: true },
    { title: 'Store B · Lighting', body: '2 lamps out of stock · substitute offers sent to customers' },
    { title: 'Route 3', body: 'Running 40 min late · 4 homes affected · customers notified' },
    { title: 'Case #2207', body: 'Refund over $200 needs GM approval' }
  ],
  orders: [
    ['SW-10482', 'Alex', true, 2495, 'A · B · C', 'Hub', 'Oct 30'],
    ['SW-10481', 'Jordan P.', false, 1320, 'B · D', 'Sourcing', 'Nov 1'],
    ['SW-10479', 'Hana K.', true, 890, 'A', 'Ordered', 'Nov 2'],
    ['SW-10477', 'Priya S.', false, 2150, 'A · D', 'Hub', 'Oct 29'],
    ['SW-10476', 'Diego M.', false, 640, 'B', 'Delivery', 'Oct 29'],
    ['SW-10474', 'Chloe R.', true, 3100, 'A · C · D', 'Sourcing', 'Nov 1'],
    ['SW-10471', 'Marcus T.', true, 410, 'B', 'Hub', 'Oct 29'],
    ['SW-10469', 'Lena W.', false, 1980, 'A · B · C · D', 'Hub', 'Oct 31'],
    ['SW-10466', 'Omar F.', false, 760, 'C', 'Delivery', 'Oct 29'],
    ['SW-10465', 'Sam R.', false, 1540, 'C · D', 'Hub', 'Oct 30']
  ],
  storeRuns: [
    ['Store A · Living', 'Sofa, coffee table', '$850', 'Bought Oct 25'],
    ['Store B · Lighting', 'Slim shade lamp (swap)', '$95', 'Bought Oct 25'],
    ['Store C · Bedroom', 'Bed, wardrobe, desk & chair', '$1,550', 'Bought Oct 27']
  ],
  windows: [
    { id: 'oct30', label: 'Oct 30 · 2–4 pm', route: 'Route 2', plus: false, current: true },
    { id: 'oct31am', label: 'Oct 31 · 10–12 · Plus priority', route: 'Route 1', plus: true },
    { id: 'oct31pm', label: 'Oct 31 · 4–6 pm', route: 'Route 3', plus: false }
  ],
  reasons: ['Store C bed arrives late', 'Customer asked to reschedule', 'Crew capacity'],
  returnItems: [
    { id: 'lamp', label: 'Slim shade lamp · $95 · Store B', price: 95, tax: 8, store: 'Store B' },
    { id: 'table', label: 'Coffee table · $150 · Store A', price: 150, tax: 13, store: 'Store A' }
  ]
};
