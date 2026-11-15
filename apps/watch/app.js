// Shopwise · Apple Watch prototype. Three scenarios from the Figma page
// "Apple Watch · Hi-Fi v3": 3 · Out of stock, 1 · Delivery day, 2 · Rate the delivery.
// Everything is simulated. Choosing a replacement stays on iPhone by design.

const ICON = {
  s: '<svg width="14" height="16" viewBox="0 0 14 16" fill="none" stroke="#d9cebe" stroke-width="2.2" stroke-linecap="round"><path d="M11.5 3.5C10.3 2.2 8.7 1.6 7 1.6c-2.4 0-4.2 1.2-4.2 3.1 0 4 8.6 2 8.6 6.4 0 2-1.9 3.3-4.4 3.3-1.9 0-3.6-.7-4.8-2"/></svg>',
  phone: '<svg width="24" height="41" viewBox="0 0 24 41" fill="none" stroke="currentColor" stroke-width="3"><rect x="2" y="2" width="20" height="37" rx="5"/><path d="M9 7h6" stroke-linecap="round"/></svg>',
  bell: '<svg width="34" height="38" viewBox="0 0 34 38" fill="currentColor"><path d="M17 2c-6.6 0-11 4.8-11 11.4v6.3L2.3 26c-.9 1.5.1 3.4 1.9 3.4h25.6c1.8 0 2.8-1.9 1.9-3.4L28 19.700V13.400C28 6.800 23.600 2 17 2Z"/><path d="M12 32a5 5 0 0 0 10 0Z"/></svg>',
  heart: '<svg width="38" height="34" viewBox="0 0 38 34" fill="currentColor"><path d="M19 33C8 25.500 1.500 19 1.500 11.200 1.500 5.700 5.700 1.500 10.900 1.500c3.300 0 6.300 1.700 8.100 4.400 1.800-2.700 4.800-4.400 8.100-4.400 5.200 0 9.400 4.200 9.400 9.700C36.500 19 30 25.500 19 33Z"/></svg>',
  star: '<svg width="29" height="28" viewBox="0 0 29 28" fill="currentColor"><path d="M14.500 1.200l3.900 8.300 9 1.200-6.600 6.300 1.700 9-8-4.400-8 4.400 1.700-9-6.600-6.300 9-1.200Z"/></svg>',
  list: '<svg width="17" height="13" viewBox="0 0 17 13" fill="currentColor"><circle cx="1.600" cy="1.600" r="1.600"/><circle cx="1.600" cy="6.500" r="1.600"/><circle cx="1.600" cy="11.400" r="1.600"/><rect x="5" y=".7" width="12" height="1.800" rx=".9"/><rect x="5" y="5.600" width="12" height="1.800" rx=".9"/><rect x="5" y="10.500" width="12" height="1.800" rx=".9"/></svg>',
};

const FLOWS = {
  stock: {
    title: 'A piece sells out',
    note: 'The watch only tells Alex and offers two choices. Picking the replacement happens on iPhone.',
    start: 'stock-alert',
  },
  delivery: {
    title: 'Delivery day',
    note: 'A Live Activity follows the crew, then a Long Look when they reach the door.',
    start: 'eta-25',
  },
  rate: {
    title: 'Rate the delivery',
    note: 'One prompt after the job is done. Tap a star, or use the arrow keys as the crown.',
    start: 'rate-prompt',
  },
};

const RATING = ['Bad', 'Poor', 'OK', 'Great', 'Perfect'];
let rating = 4;

const longLook = (time, title, line, primary, a, b) => `
  <span class="time">${time}</span>
  <span class="app-icon">${ICON.s}</span>
  <div class="note"><small>now</small><b>${title}</b><span>${line}</span></div>
  <button class="pill one${primary ? ' primary' : ''}" data-go="${a[1]}">${a[0]}</button>
  <button class="pill two" data-go="${b[1]}">${b[0]}</button>`;

const result = (time, icon, head, sub) => `
  <span class="time">${time}</span><span class="title">Shopwise</span>
  <div class="center icon">${icon}</div>
  <div class="center head">${head}</div>
  <div class="center sub">${sub}</div>`;

const stack = (time, mins, width, tappable) => `
  <span class="date">FRI OCT 31</span><span class="stack-time">${time}</span>
  <${tappable ? 'button data-go="door"' : 'div'} class="widget live">
    <b>Arriving · ${mins} min</b><span>Ken · ~10:05</span>
    <i class="app-icon">${ICON.s}</i>
    <i class="track"><i class="fill" style="width:${width}px"></i><i class="dot" style="left:${width - 8}px"></i></i>
  </${tappable ? 'button' : 'div'}>
  <div class="widget rings"><span class="ring a">50</span><span class="ring b">${time}</span><span class="ring c"></span></div>
  <div class="all-apps">${ICON.list} All Apps</div>`;

// Each view: html, optional auto-advance { after, to }, optional hand-off link.
const VIEWS = {
  'stock-alert': { html: () => longLook('9:41', 'Lamp is out of stock', 'Pick a swap on iPhone', true, ['See details', 'stock-iphone'], ['Remind me later', 'stock-later']) },
  'stock-iphone': { html: () => result('9:41', ICON.phone, 'Open your iPhone', 'Your swap is waiting'), handoff: true },
  'stock-later': { html: () => result('9:41', ICON.bell, 'Reminder set', 'We’ll ask again tonight'), auto: { after: 2000, to: 'face' } },

  'eta-25': { html: () => stack('9:40', 25, 53, false), auto: { after: 1500, to: 'eta-10' } },
  'eta-10': { html: () => stack('9:55', 10, 122, false), auto: { after: 1500, to: 'eta-2' } },
  'eta-2': { html: () => stack('10:03', 2, 166, true) },
  door: { html: () => longLook('10:05', 'Crew is at your door', 'Ken + 1 · 7 pieces', false, ['Call Ken', 'rate-prompt'], ['Dismiss', 'face']) },

  'rate-prompt': { html: () => longLook('10:52', 'How was your delivery?', 'Ken’s crew · 7 pieces', true, ['Rate', 'rate-stars'], ['Not now', 'face']) },
  'rate-stars': {
    html: () => `
      <span class="time">10:52</span><span class="title">Rate delivery</span>
      <div class="stars" role="radiogroup" aria-label="Rating">${RATING.map((l, i) =>
        `<button role="radio" aria-label="${i + 1} of 5, ${l}" aria-checked="${rating === i + 1}" class="${i < rating ? 'on' : ''}" data-star="${i + 1}">${ICON.star}</button>`).join('')}</div>
      <div class="center rate-label">${RATING[rating - 1]}</div>
      <div class="center rate-hint">Turn the crown to adjust</div>
      <button class="pill primary submit" data-go="rate-thanks">Submit</button>`,
  },
  'rate-thanks': { html: () => result('10:53', ICON.heart, 'Thanks, Alex', 'Ken’s crew will see it'), auto: { after: 2000, to: 'face' } },

  face: { html: () => `<button class="face" data-restart><b>${faceTime()}</b><span>Tap to replay</span></button>` },
};

const screen = document.getElementById('screen');
const handoff = document.getElementById('handoff');
let flow = FLOWS[new URLSearchParams(location.search).get('flow')] ? new URLSearchParams(location.search).get('flow') : 'stock';
let current = '';
let timer = 0;

function faceTime() {
  return flow === 'stock' ? '9:41' : flow === 'delivery' ? '10:05' : '10:53';
}

function show(id) {
  clearTimeout(timer);
  current = id;
  const view = VIEWS[id];
  screen.innerHTML = `<div class="view">${view.html()}</div>`;
  handoff.hidden = !view.handoff;
  if (view.auto) timer = setTimeout(() => show(view.auto.to), view.auto.after);
}

function start(name) {
  flow = name;
  rating = 4;
  document.getElementById('flow-title').textContent = FLOWS[name].title;
  document.getElementById('flow-note').textContent = FLOWS[name].note;
  document.querySelectorAll('.flows button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.flow === name)));
  history.replaceState(null, '', `?flow=${name}`);
  show(FLOWS[name].start);
}

function setRating(n) {
  rating = Math.min(5, Math.max(1, n));
  show('rate-stars');
}

screen.addEventListener('click', (e) => {
  const el = e.target.closest('[data-go],[data-star],[data-restart]');
  if (!el) return;
  if (el.dataset.star) return setRating(Number(el.dataset.star));
  if ('restart' in el.dataset) return start(flow);
  // "Call Ken" and the door alert lead into the rating scenario.
  if (el.dataset.go === 'rate-prompt' && flow !== 'rate') return start('rate');
  show(el.dataset.go);
});

document.querySelector('.flows').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-flow]');
  if (b) start(b.dataset.flow);
});

document.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === 'r' || e.key === 'R') start(flow);
  if (current === 'rate-stars' && (e.key === 'ArrowUp' || e.key === 'ArrowRight')) { e.preventDefault(); setRating(rating + 1); }
  if (current === 'rate-stars' && (e.key === 'ArrowDown' || e.key === 'ArrowLeft')) { e.preventDefault(); setRating(rating - 1); }
});

screen.addEventListener('wheel', (e) => {
  if (current !== 'rate-stars') return;
  e.preventDefault();
  setRating(rating + (e.deltaY < 0 ? 1 : -1));
}, { passive: false });

start(flow);
