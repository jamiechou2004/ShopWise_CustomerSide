// Sample data for the Shopwise GM console prototype. All numbers are fictional and internally consistent.
window.SW = {
  kpis: [
    { label: 'Active orders', value: '104', delta: '+12 this week', trend: 'up' },
    { label: 'On-time delivery', value: '94%', delta: 'Target 95%', trend: 'flat' },
    { label: 'Shopwise revenue', value: '$58,944', delta: 'Month to date', trend: 'up' },
    { label: 'Plus members', value: '937', delta: '+41 this month', trend: 'up' }
  ],
  stages: [
    { name: 'Plan', count: 1240, note: 'saved plans' },
    { name: 'Order', count: 46, note: 'paid, not yet bought' },
    { name: 'Sourcing', count: 31, note: '3 at risk', risk: 3 },
    { name: 'Hub', count: 18, note: '2 waiting on a store', risk: 2 },
    { name: 'Delivery', count: 9, note: 'on the road today' },
    { name: 'Aftercare', count: 27, note: 'open check-ins' }
  ],
  revenue: [
    { name: 'Delivery & install', value: 26400 },
    { name: 'Service fee', value: 21300 },
    { name: 'Shopwise Plus', value: 11244 }
  ],
  attention: [
    { level: 'warn', title: 'SW-10482 is held at the hub', body: 'Store C bed arrives 3 pm. Delivery waits so Alex gets one drop.', action: 'Open order', nav: 'chain' },
    { level: 'info', title: 'Store B is out of 2 lamps', body: 'Substitute offers were sent to both customers.', action: 'Review' },
    { level: 'warn', title: 'Route 3 is 40 min late', body: '4 homes affected. Customers were notified.', action: 'View route' },
    { level: 'info', title: 'Refund over $200 needs approval', body: 'Case #2207 · Jordan P.', action: 'Review' }
  ],
  // id, customer, plus, furniture, stores, stage index (1 Order · 2 Sourcing · 3 Hub · 4 Delivery), delivery date
  orders: [
    ['SW-10482', 'Alex', true, 2495, ['A', 'B', 'C'], 3, 'Oct 30'],
    ['SW-10481', 'Jordan P.', false, 1320, ['B', 'D'], 2, 'Nov 1'],
    ['SW-10479', 'Hana K.', true, 890, ['A'], 1, 'Nov 2'],
    ['SW-10477', 'Priya S.', false, 2150, ['A', 'D'], 3, 'Oct 29'],
    ['SW-10476', 'Diego M.', false, 640, ['B'], 4, 'Oct 29'],
    ['SW-10474', 'Chloe R.', true, 3100, ['A', 'C', 'D'], 2, 'Nov 1'],
    ['SW-10471', 'Marcus T.', true, 410, ['B'], 3, 'Oct 29'],
    ['SW-10469', 'Lena W.', false, 1980, ['A', 'B', 'C', 'D'], 3, 'Oct 31'],
    ['SW-10466', 'Omar F.', false, 760, ['C'], 4, 'Oct 29'],
    ['SW-10465', 'Sam R.', false, 1540, ['C', 'D'], 3, 'Oct 30']
  ],
  storeRuns: [
    { store: 'Store A', dept: 'Living', items: 'Sofa, coffee table', amount: 850, bought: 'Oct 25', hub: 'Oct 27' },
    { store: 'Store B', dept: 'Lighting', items: 'Slim shade lamp', note: 'Swapped from Mini globe on Apple Watch', amount: 95, bought: 'Oct 25', hub: 'Oct 28' },
    { store: 'Store C', dept: 'Bedroom', items: 'Bed, wardrobe, desk, chair', amount: 1550, bought: 'Oct 27', hub: 'Oct 29', late: true }
  ],
  windows: [
    { id: 'oct30', day: 'Thu, Oct 30', time: '2–4 pm', route: 'Route 2', note: 'Original window' },
    { id: 'oct31am', day: 'Fri, Oct 31', time: '10 am–12 pm', route: 'Route 1', plus: true, rec: true, note: 'Plus priority · bed is in by then' },
    { id: 'oct31pm', day: 'Fri, Oct 31', time: '4–6 pm', route: 'Route 3', note: 'Route 3 is running late this week' }
  ],
  reasons: ['Store C bed arrives late', 'Customer asked to reschedule', 'Crew capacity'],
  returnItems: [
    { id: 'lamp', name: 'Slim shade lamp', price: 95, tax: 8, store: 'Store B' },
    { id: 'table', name: 'Coffee table', price: 150, tax: 13, store: 'Store A' }
  ]
};
