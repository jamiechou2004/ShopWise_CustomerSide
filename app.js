/* Shopwise GM console · clickable prototype
   Flow: Dashboard → Orders & sourcing → Service chain (SW-10482) → Modify order → Nov 2 → Return or exchange */
(function () {
  const D = window.SW;
  const $app = document.getElementById('app');
  const $guide = document.getElementById('guide');
  const $toast = document.getElementById('toast');
  const money = n => '$' + n.toLocaleString('en-US');

  const icon = {
    grid: '<svg viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg>',
    link: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6.5 9.5l3-3"/><path d="M7 4.5l1.2-1.2a2.8 2.8 0 014 4L11 8.5"/><path d="M9 11.5l-1.2 1.2a2.8 2.8 0 01-4-4L5 7.5"/></svg>',
    cart: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M1.5 2h2l1.6 8.2h7.4L14 4.5H4.2"/><circle cx="6.2" cy="13.2" r="1.1" fill="currentColor"/><circle cx="11.6" cy="13.2" r="1.1" fill="currentColor"/></svg>',
    bubble: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M2 3.5h8v5.5H5l-3 2.5z"/><path d="M10 6h4v5.5l-2.2-1.8H7.5V9"/></svg>',
    dollar: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="8" cy="8" r="6.5"/><path d="M10 5.8c-.4-.6-1.1-.9-2-.9-1.2 0-2 .6-2 1.5 0 2 4 1.1 4 3.2 0 .9-.8 1.5-2 1.5-.9 0-1.7-.4-2.1-1M8 3.6v1.3M8 11.1v1.3"/></svg>',
    gear: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="2.3"/><path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4"/></svg>',
    search: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg>',
    bell: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M4 11.5V7a4 4 0 018 0v4.5l1 1H3z"/><path d="M6.5 14a1.6 1.6 0 003 0"/></svg>',
    chevD: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M5 6.5L8 9.5l3-3"/></svg>',
    warn: '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 2.5l8 14H2z"/><path d="M10 8v4M10 14.2v.3" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>',
    info: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="10" cy="10" r="7.5"/><path d="M10 9v4.5M10 6.3v.2" stroke-linecap="round"/></svg>',
    check: '<svg viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="10" r="8.5"/><path d="M6.3 10.2l2.4 2.4 5-5" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    lamp: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M14 6h12l4 12H10z"/><path d="M20 18v14M13 34h14"/><path d="M23 9l-3 6" stroke-width="1.2"/></svg>'
  };

  const initial = () => ({
    view: 'overview', date: 'oct29', win: 'oct30', modified: false, sheet: null, menu: false,
    ret: null, banner: null, seg: 0,
    draftModify: { type: 'window', win: 'oct31am', reason: D.reasons[0], notify: true },
    draftReturn: { item: 'lamp', reason: 'Damaged on arrival', mode: 'exchange', pickup: 'Nov 4 · 10–12 · swap on the same visit', notify: true },
    activity: [
      { t: 'Today 9:12', s: 'Hub received Store B lamp · checked' },
      { t: 'Oct 28 16:40', s: 'Store A sofa and table received' },
      { t: 'Oct 27 11:05', s: 'Buyer bought bed, desk & chair at Store C' },
      { t: 'Oct 26 18:02', s: 'Alex chose Slim shade lamp on Apple Watch (+$16)' },
      { t: 'Oct 24 20:31', s: 'Alex paid $2,807 in the app' }
    ],
    fresh: -1
  });
  let S = initial();

  const win = () => D.windows.find(w => w.id === S.win);
  const winDate = () => win().label.split(' · ')[0];

  function step() {
    if (S.ret) return 8;
    if (S.sheet === 'return') return 7;
    if (S.date === 'nov2') return 6;
    if (S.modified) return 5;
    if (S.sheet === 'modify') return 4;
    if (S.view === 'chain') return 3;
    if (S.view === 'orders') return 2;
    return 1;
  }
  const guideText = {
    1: 'Dashboard · click <b>Orders &amp; sourcing</b> in the sidebar',
    2: 'Orders &amp; sourcing · open Alex’s order <b>SW-10482</b>',
    3: 'Service chain · click <b>Modify order</b>',
    4: 'Modify order · pick a new window, then <b>Update order</b>',
    5: 'Order updated · click the <b>date in the toolbar</b> and jump to Nov 2 (after delivery)',
    6: 'Nov 2 · Alex reported a cracked lamp · click <b>Start return or exchange</b>',
    7: 'Return or exchange · choose a resolution, then <b>Approve</b>',
    8: 'Done · every record updated. <b>Back to orders</b> or Restart'
  };

  function renderGuide() {
    const s = step();
    $guide.innerHTML = `<span class="step-pill">Step ${s} of 8</span><span class="step-text">${guideText[s]}</span>
      <span class="step-dots">${[1,2,3,4,5,6,7,8].map(i => `<i class="${i <= s ? 'on' : ''}"></i>`).join('')}</span>`;
  }

  // ---------- shell ----------
  function sidebar() {
    const items = [['overview', 'Overview', icon.grid], ['chain', 'Service chain', icon.link], ['orders', 'Orders & sourcing', icon.cart],
      ['care', 'Care & returns', icon.bubble, '12'], ['finance', 'Finance', icon.dollar], ['settings', 'Settings', icon.gear]];
    return `<nav class="sidebar" aria-label="Sections">
      <div class="traffic" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="side-title">Shopwise GM</div>
      ${items.map(([id, label, ic, badge]) => `<button class="side-item ${S.view === id ? 'on' : ''}" data-nav="${id}" type="button">${ic}<span>${label}</span>${badge ? `<span class="badge">${badge}</span>` : ''}</button>`).join('')}
      <div class="side-account"><span class="avatar">MC</span><span>Maya Chen · GM</span></div>
    </nav>`;
  }
  function toolbar() {
    const dateLabel = S.date === 'oct29' ? 'Oct 29, 2026' : 'Nov 2, 2026';
    return `<div class="toolbar">
      <div class="search">${icon.search}<span>Search orders, customers, stores</span></div>
      <div class="spacer"></div>
      <span class="muted">Sample data</span>
      <button class="glass-btn date-btn ${step() === 5 ? 'pulse' : ''}" data-action="menu" type="button" aria-haspopup="menu">${dateLabel}${icon.chevD}</button>
      <button class="glass-btn round" type="button" aria-label="Alerts" data-action="soon">${icon.bell}</button>
      ${S.menu ? `<div class="menu" role="menu">
        <button role="menuitem" data-date="oct29"><span class="check">${S.date === 'oct29' ? '✓' : ''}</span>Oct 29, 2026 · today</button>
        <button role="menuitem" data-date="nov2"><span class="check">${S.date === 'nov2' ? '✓' : ''}</span>Nov 2, 2026 · after delivery</button>
      </div>` : ''}
    </div>`;
  }

  // ---------- views ----------
  function overview() {
    const total = D.revenue.reduce((a, r) => a + r.value, 0);
    return `<div class="page-head"><div><h1>Overview</h1><div class="sub">${S.date === 'oct29' ? 'Thursday, Oct 29' : 'Monday, Nov 2'} · all stores · month to date</div></div>
      <div class="head-actions"><button class="btn" data-nav="orders" type="button">Open orders</button></div></div>
      <div class="grid4">${D.kpis.map(k => `<div class="card kpi"><div class="label">${k.label}</div><div class="value">${k.value}</div><div class="note">${k.note}</div></div>`).join('')}</div>
      <div class="card" style="margin-top:14px">
        <div class="card-head"><h3>Service chain · live</h3><button class="action" data-nav="chain" type="button">Open Alex’s chain</button></div>
        <div class="card-sub">Orders in each stage right now. One order ID links every stage.</div>
        <div class="stages">${D.stages.map((s, i) => `<div class="stage ${i === 3 ? 'hot' : ''}"><div class="n">${String(i + 1).padStart(2, '0')} · ${s.name}</div><div class="c">${s.count}</div><div class="x">${s.note}</div></div>`).join('')}</div>
      </div>
      <div class="row2">
        <div class="card"><div class="card-head"><h3>Revenue by stream · MTD</h3></div>
          <div style="font-family:var(--brand);font-weight:300;font-size:30px;margin-top:6px">${money(total)}</div>
          <div class="card-sub">of $412,600 GMV · furniture and tax are pass-through</div>
          <div class="bars">${D.revenue.map(r => `<div class="${r.cls}" style="flex:${r.value}"></div>`).join('')}</div>
          ${D.revenue.map(r => `<div class="legend-row"><i class="${r.cls}"></i>${r.name}<b>${money(r.value)} · ${Math.round(r.value / total * 100)}%</b></div>`).join('')}
        </div>
        <div class="card"><div class="card-head"><h3>Needs attention</h3><span class="muted" style="margin-left:auto">4</span></div>
          ${D.alerts.map((a, i) => `<button class="alert ${a.order ? 'link' : ''}" type="button" ${a.order ? 'data-nav="chain"' : 'data-action="soon"'}><span class="ic ${i === 0 ? 'hot' : ''}">${i === 0 ? icon.warn : icon.info}</span><span><b>${a.title}</b><span>${a.body}</span></span></button>`).join('')}
        </div>
      </div>`;
  }

  function orders() {
    const segs = ['All active · 104', 'Ordered · 46', 'Sourcing · 31', 'Hub · 18', 'Delivery · 9'];
    const rows = D.orders.map(o => {
      const [id, name, plus, furn, stores, stage, date] = o;
      const isAlex = id === 'SW-10482';
      const f = isAlex ? 2495 : furn;
      const tax = isAlex ? 208 : Math.round(f * 0.0833);
      const fee = plus ? 0 : Math.round(f * 0.08);
      const st = isAlex ? (S.date === 'nov2' ? 'Delivered' : 'Hub') : stage;
      const d = isAlex ? (S.date === 'nov2' ? winDate() : winDate()) : date;
      return `<tr class="click ${isAlex ? 'alex' : ''}" ${isAlex ? 'data-nav="chain"' : 'data-action="soon"'}>
        <td><b>${id}</b></td><td>${name}</td><td>${plus ? '<span class="chip plus">Plus</span>' : '<span class="muted">—</span>'}</td><td>${stores}</td>
        <td><span class="chip ${st === 'Delivered' ? 'ok' : st === 'Hub' || st === 'Sourcing' ? 'now' : ''}">${st}</span></td>
        <td class="mono">${money(f)}</td><td class="mono">${money(fee)}</td><td class="mono">${money(f + tax + 120 + fee)}</td><td>${d}</td>
        <td>${isAlex ? '<button class="open-link" data-nav="chain" type="button">Open chain ›</button>' : '<span class="muted">Open chain ›</span>'}</td></tr>`;
    }).join('');
    return `<div class="page-head"><div><h1>Orders &amp; sourcing</h1><div class="sub">Every customer order, its stage and its store runs.</div></div>
      <div class="head-actions"><button class="btn" data-action="soon" type="button">Export CSV</button></div></div>
      <div class="filters"><div class="seg">${segs.map((s, i) => `<button class="${S.seg === i ? 'on' : ''}" data-seg="${i}" type="button">${s}</button>`).join('')}</div>
        <div class="spacer"></div><select aria-label="Store"><option>All stores</option></select><select aria-label="Plan"><option>Plus · all</option></select></div>
      <div class="card" style="padding:6px 8px">
        <table><thead><tr><th>Order</th><th>Customer</th><th>Plan</th><th>Stores</th><th>Stage</th><th class="mono">Furniture</th><th class="mono">Service fee</th><th class="mono">Customer total</th><th>Delivery</th><th></th></tr></thead><tbody>${rows}</tbody></table>
      </div>
      <div class="foot-note">Customer total = furniture + tax + delivery &amp; install $120 + service fee (8% of furniture, $0 for Plus).</div>`;
  }

  function ledgerVals() {
    const v = { furn: 2495, tax: 208, del: 120, fee: 0, plus: 12, buyer: 42, hub: 18, crew: 58, refund: 0 };
    if (S.ret) {
      v.crew = 72;
      if (S.ret.mode === 'refund') { const it = D.returnItems.find(i => i.id === S.ret.item); v.refund = it.price + it.tax; v.furnBack = it.price; v.taxBack = it.tax; }
    }
    return v;
  }

  function chain() {
    const nov2 = S.date === 'nov2';
    const w = win();
    const ret = S.ret;
    const items = [
      { k: 'Plan', st: 'done', chip: 'Done', date: 'Oct 18', body: 'Plan v3 saved · 5 items · Mini globe lamp chosen ($2,807 at checkout)', link: 'Customer app · R7 Your plan is saved' },
      { k: 'Order', st: 'done', chip: 'Done', date: 'Oct 24', body: 'One payment · 3 store runs · service fee waived (Plus) · Mini globe sold out → Alex chose Slim shade on Apple Watch (+$16)', link: 'Apple Watch · out-of-stock alert' },
      { k: 'Sourcing', st: 'done', chip: '3 store runs', date: 'Oct 25 – 27', runs: true, link: 'Orders & sourcing · sourcing board' },
      nov2 ? { k: 'Hub', st: 'done', chip: 'Done', date: 'Oct 30', body: 'All three stores’ items received and checked · left as one drop', link: 'Hub & routes' }
           : { k: 'Hub', st: 'current', chip: 'Now', date: 'Oct 29', body: 'Received A and B, checked, no damage · Store C bed arrives today 3 pm · held so everything leaves as one drop', link: 'Hub & routes' },
      nov2 ? { k: 'Delivery & install', st: 'done', chip: 'Done', date: winDate(), body: `Delivered and installed ${winDate()}, 10:48 · Alex signed on Apple Watch`, link: 'Customer app · D1 Delivery overview' }
           : { k: 'Delivery & install', st: 'next', chip: 'Scheduled', date: winDate(), body: `${w.route} · ${w.label.split(' · ').slice(1).join(' · ')}${w.plus ? '' : ''} · install bed and desk · 2-person crew`, link: 'Customer app · D1 Delivery overview' },
      nov2 ? { k: 'Aftercare', st: 'current', chip: ret ? (ret.mode === 'exchange' ? 'Exchange' : 'Refund') : 'Now', date: 'Nov 2',
               body: ret ? (ret.mode === 'exchange' ? `Exchange approved · new lamp and pickup ${ret.pickup.split(' · ').slice(0, 2).join(', ')} · ${D.returnItems.find(i => i.id === ret.item).store} rebuy today` : `Refund approved · ${money(ledgerVals().refund)} back to Alex · pickup ${ret.pickup.split(' · ').slice(0, 2).join(', ')}`)
                         : 'Check-in Nov 2 · Alex reported a cracked lamp base · 1 photo · rated the crew 4 stars', link: 'Customer app · F1 Check-in' }
           : { k: 'Aftercare', st: 'next', chip: 'Planned', date: 'Nov 2', body: 'Check-in “How does it feel at home?” · return window open until Nov 29', link: 'Customer app · F1 Check-in' }
    ];
    const v = ledgerVals();
    const revenue = v.del + v.plus, cost = v.buyer + v.hub + v.crew, contrib = revenue - cost;
    const paid = v.furn + v.tax + v.del + v.fee - v.refund;
    const banner = S.banner ? `<div class="banner ${S.banner.kind}">${S.banner.kind === 'ok' ? icon.check : icon.info}<span>${S.banner.text}</span></div>`
      : nov2 && !ret ? `<div class="banner info">${icon.info}<span>Nov 2 · check-in from Alex: “The Slim shade lamp arrived cracked.” · return window open until Nov 29</span></div>` : '';
    const primary = !nov2 ? `<button class="btn primary ${step() === 3 ? 'hint' : ''}" data-action="modify" type="button">Modify order</button>`
      : !ret ? `<button class="btn primary ${step() === 6 ? 'hint' : ''}" data-action="return" type="button">Start return or exchange</button>`
      : `<button class="btn primary" data-nav="orders" type="button">Back to orders</button>`;
    return `<div class="crumb">Service chain / ${nov2 ? 'Aftercare' : 'Hub'} / SW-10482</div>
      <div class="page-head"><div><h1>SW-10482 · Alex</h1>
        <div class="sub" style="display:flex;gap:14px;align-items:center;flex-wrap:wrap"><span class="chip plus">Plus</span>
          <span class="chip ${nov2 ? 'ok' : 'now'}">${nov2 ? 'Delivered ' + winDate() : 'At hub · 2 of 3 stores in'}</span>
          <span>Studio · New York · Budget $3,000 · Paid ${money(paid)} · ${nov2 ? 'Delivered and installed ' + winDate() : 'Delivery ' + w.label.replace(' · Plus priority', '')}</span></div></div>
        <div class="head-actions">${primary}<button class="btn" data-action="soon" type="button">Message Alex</button></div></div>
      ${banner}
      <div class="chain-grid">
        <div class="card"><h3>Chain timeline</h3><div class="card-sub">Every record this order touches, in order.</div>
          <div class="timeline">${items.map(it => `<div class="tl-item ${it.st}">
            <span class="dot"></span>
            <div class="tl-top"><h4>${it.k}</h4><span class="chip ${it.st === 'done' ? 'ok' : it.st === 'current' ? 'now' : ''}">${it.chip}</span><span class="date">${it.date}</span></div>
            ${it.runs ? `<div class="runs">${D.storeRuns.map(r => `<div class="run"><b>${r[0]}</b><span>${r[1]}</span><span class="p">${r[2]}</span><span class="s">${r[3]}</span></div>`).join('')}</div>` : `<div class="tl-body">${it.body}</div>`}
            <div class="tl-link">↗ ${it.link}</div></div>`).join('')}</div>
        </div>
        <div style="display:grid;gap:16px">
          <div class="card ledger"><h3>Money ledger</h3><div class="card-sub" style="margin-bottom:0">What the customer paid, what passes through, and what Shopwise earns.</div>
            <div class="sec-t">CUSTOMER PAID</div>
            <div class="l"><span>Furniture</span><span>${money(v.furn)}</span></div>
            <div class="l"><span>Tax</span><span>${money(v.tax)}</span></div>
            <div class="l"><span>Delivery &amp; install</span><span>${money(v.del)}</span></div>
            <div class="l"><span>Service fee · Plus</span><span>$0</span></div>
            ${v.refund ? `<div class="l changed"><span>Refund · lamp</span><span>−${money(v.refund)}</span></div>` : ''}
            <div class="l tot"><span>Total</span><span>${money(paid)}</span></div>
            <div class="sec-t">PASS-THROUGH</div>
            <div class="l ${v.refund ? 'changed' : ''}"><span>Bought at stores A · B · C</span><span>${money(v.furn - (v.furnBack || 0))}</span></div>
            <div class="l ${v.refund ? 'changed' : ''}"><span>Tax remitted</span><span>${money(v.tax - (v.taxBack || 0))}</span></div>
            <div class="sec-t">SHOPWISE REVENUE</div>
            <div class="l"><span>Delivery &amp; install</span><span>${money(v.del)}</span></div>
            <div class="l"><span>Plus · October share</span><span>${money(v.plus)}</span></div>
            <div class="l tot"><span>Revenue</span><span>${money(revenue)}</span></div>
            <div class="sec-t">COST TO SERVE</div>
            <div class="l"><span>Buyer run · 3 stores</span><span>${money(v.buyer)}</span></div>
            <div class="l"><span>Hub handling</span><span>${money(v.hub)}</span></div>
            <div class="l ${S.ret ? 'changed' : ''}"><span>${S.ret ? 'Crew · delivery + return pickup' : 'Crew · delivery &amp; install'}</span><span>${money(v.crew)}</span></div>
            <div class="l tot"><span>Cost</span><span>${money(cost)}</span></div>
            <div class="contrib"><span>Contribution</span><span>${contrib > 0 ? '+' : ''}${money(contrib)}</span></div>
          </div>
          <div class="card activity"><h3>Activity</h3>
            ${S.activity.slice(0, 5).map((a, i) => `<div class="a ${i === S.fresh ? 'new' : ''}"><small>${a.t}</small>${a.s}</div>`).join('')}
          </div>
        </div>
      </div>`;
  }

  function modifySheet() {
    const m = S.draftModify;
    const sel = D.windows.find(w => w.id === m.win);
    const disabled = m.type !== 'window' || m.win === S.win;
    return `<div class="dim" data-action="dim"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="mtitle" data-stop>
      <h2 id="mtitle">Modify order · SW-10482</h2><div class="s-sub">Alex · 3 stores · paid $2,823 · Plus member</div>
      <div class="form-row"><span class="lbl">What needs to change?</span><div class="radios">
        ${[['window', 'Delivery window'], ['swap', 'Swap an item'], ['remove', 'Remove an item']].map(([v, l]) => `<label><input type="radio" name="mtype" value="${v}" ${m.type === v ? 'checked' : ''}> ${l}</label>`).join('')}
      </div></div>
      <div class="divider"></div>
      ${m.type === 'window' ? `
        <div class="form-row"><span class="lbl">Current</span><b>${win().label.replace(' · Plus priority', '')} · ${win().route}</b></div>
        <div class="form-row"><label for="mwin">New window</label><select id="mwin">${D.windows.filter(w => w.id !== S.win).map(w => `<option value="${w.id}" ${m.win === w.id ? 'selected' : ''}>${w.label}</option>`).join('')}</select></div>
        <div class="form-row"><label for="mreason">Reason</label><select id="mreason">${D.reasons.map(r => `<option ${m.reason === r ? 'selected' : ''}>${r}</option>`).join('')}</select></div>
        <div class="impact"><b>Impact</b>
          <div>Price · no change ($2,823)${sel && sel.plus ? ' · Plus priority window, no extra fee' : ''}</div>
          <div>Crew · ${sel ? sel.route : ''} · 2-person · install bed and desk</div>
          <div>Still one drop — all three stores’ items are at the hub by Oct 30</div></div>`
      : `<div class="impact"><b>Not in this prototype</b><div>The demo covers changing the delivery window. Item swaps follow the same sheet with a price-difference line.</div></div>`}
      <label style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="mnotify" ${m.notify ? 'checked' : ''}> Notify Alex on iPhone and Apple Watch</label>
      <div class="sheet-foot"><span class="grow"></span><button class="btn" data-action="close" type="button">Cancel</button>
        <button class="btn primary" data-action="update" type="button" ${disabled ? 'disabled style="opacity:.5;cursor:default"' : ''}>Update order</button></div>
    </div></div>`;
  }

  function returnSheet() {
    const r = S.draftReturn; const it = D.returnItems.find(i => i.id === r.item);
    const refundAmt = it.price + it.tax;
    return `<div class="dim" data-action="dim"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="rtitle" data-stop>
      <h2 id="rtitle">Return or exchange · SW-10482</h2><div class="s-sub">Alex · Plus member · return window open until Nov 29</div>
      <div class="form-row"><label for="ritem">Item</label><select id="ritem">${D.returnItems.map(i => `<option value="${i.id}" ${r.item === i.id ? 'selected' : ''}>${i.label}</option>`).join('')}</select></div>
      <div class="form-row"><span class="lbl">Reason</span><div class="radios">${['Damaged on arrival', 'Changed mind', 'Doesn’t fit'].map(x => `<label><input type="radio" name="rreason" value="${x}" ${r.reason === x ? 'checked' : ''}> ${x}</label>`).join('')}</div></div>
      <div class="form-row"><span class="lbl">Evidence</span><div style="display:flex;gap:12px;align-items:center"><div class="photo">${icon.lamp}</div><span>1 photo from Alex · Nov 2, 19:34</span></div></div>
      <div class="form-row"><span class="lbl">Resolution</span><div class="seg"><button class="${r.mode === 'exchange' ? 'on' : ''}" data-mode="exchange" type="button">Exchange</button><button class="${r.mode === 'refund' ? 'on' : ''}" data-mode="refund" type="button">Refund ${money(refundAmt)}</button></div></div>
      <div class="form-row"><label for="rpick">Pickup</label><select id="rpick">${['Nov 4 · 10–12 · swap on the same visit', 'Nov 5 · 2–4 pm'].map(p => `<option ${r.pickup === p ? 'selected' : ''}>${p}</option>`).join('')}</select></div>
      <div class="impact"><b>Impact</b>
        ${r.mode === 'exchange'
          ? `<div>Alex pays $0 · pickup is free with Plus</div><div>${it.store} · rebuy ${it.label.split(' · ')[0]} (${money(it.price)}) today · damage claim opened</div>`
          : `<div>Alex gets ${money(refundAmt)} back (${money(it.price)} + ${money(it.tax)} tax) · pickup is free with Plus</div><div>${it.store} · return credit ${money(it.price)} to Shopwise</div>`}
        <div>Cost to serve +$14 (return pickup) · this order’s contribution goes to $0</div></div>
      <label style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="rnotify" ${r.notify ? 'checked' : ''}> Notify Alex on iPhone and Apple Watch</label>
      <div class="sheet-foot"><span class="grow"></span><button class="btn" data-action="close" type="button">Cancel</button>
        <button class="btn primary" data-action="approve" type="button">Approve ${r.mode}</button></div>
    </div></div>`;
  }

  function placeholder(name) {
    return `<div class="placeholder"><div><h1>${name}</h1><p>Not part of this prototype. The workflow runs through Overview → Orders &amp; sourcing → Service chain.</p>
      <button class="btn primary" data-nav="overview" type="button">Back to Overview</button></div></div>`;
  }

  function render() {
    const view = { overview, orders, chain }[S.view];
    const names = { care: 'Care & returns', finance: 'Finance', settings: 'Settings' };
    $app.innerHTML = sidebar() + `<section class="main">${toolbar()}<div class="content" id="content">${view ? view() : placeholder(names[S.view])}</div></section>`
      + (S.sheet === 'modify' ? modifySheet() : S.sheet === 'return' ? returnSheet() : '');
    renderGuide();
  }

  function toast(msg) { $toast.textContent = msg; $toast.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => $toast.classList.remove('show'), 2200); }
  function go(view) { S.view = view; S.menu = false; S.fresh = -1; render(); const c = document.getElementById('content'); if (c) c.scrollTop = 0; }

  // ---------- events ----------
  $app.addEventListener('click', e => {
    const t = e.target.closest('[data-nav],[data-action],[data-date],[data-seg],[data-mode]');
    if (e.target.closest('[data-stop]') && !t) return;
    if (!t) { if (S.menu) { S.menu = false; render(); } return; }
    if (t.dataset.nav) { go(t.dataset.nav); return; }
    if (t.dataset.seg) { S.seg = +t.dataset.seg; render(); return; }
    if (t.dataset.mode) { S.draftReturn.mode = t.dataset.mode; render(); return; }
    if (t.dataset.date) {
      S.date = t.dataset.date; S.menu = false; S.banner = null; S.fresh = -1;
      if (S.date === 'nov2') { S.view = 'chain'; if (!S.modified) S.win = 'oct30'; toast('Jumped to Nov 2 · after delivery'); }
      render(); return;
    }
    const a = t.dataset.action;
    if (a === 'menu') { S.menu = !S.menu; render(); }
    else if (a === 'soon') toast('Not part of this prototype');
    else if (a === 'modify') { S.sheet = 'modify'; render(); }
    else if (a === 'return') { S.sheet = 'return'; render(); }
    else if (a === 'close' || (a === 'dim' && e.target === t)) { S.sheet = null; render(); }
    else if (a === 'update') {
      const m = S.draftModify; if (m.type !== 'window') return;
      S.win = m.win; S.modified = true; S.sheet = null;
      const w = win();
      S.activity.unshift({ t: 'Now', s: `Maya moved delivery to ${w.label.replace(' · Plus priority', '')} · ${m.reason}${m.notify ? ' · Alex notified' : ''}` }); S.fresh = 0;
      S.banner = { kind: 'ok', text: `Order updated · delivery moved to ${w.label.replace(' · Plus priority', '')}${m.notify ? ' · Alex was notified on iPhone and Apple Watch' : ''}` };
      render(); toast('Order updated');
    }
    else if (a === 'approve') {
      const r = S.draftReturn; S.ret = { ...r }; S.sheet = null;
      const it = D.returnItems.find(i => i.id === r.item); const name = it.label.split(' · ')[0];
      S.activity.unshift({ t: 'Now', s: r.mode === 'exchange' ? `Maya approved an exchange for the ${name.toLowerCase()} · ${it.store} rebuy${r.notify ? ' · Alex notified' : ''}` : `Maya approved a ${money(it.price + it.tax)} refund for the ${name.toLowerCase()}${r.notify ? ' · Alex notified' : ''}` }); S.fresh = 0;
      S.banner = { kind: 'ok', text: r.mode === 'exchange' ? `Exchange approved · pickup and new ${name.toLowerCase()} ${r.pickup.split(' · ').slice(0, 2).join(', ')}${r.notify ? ' · Alex notified' : ''}` : `Refund approved · ${money(it.price + it.tax)} back to Alex · pickup ${r.pickup.split(' · ').slice(0, 2).join(', ')}` };
      render(); toast(r.mode === 'exchange' ? 'Exchange approved' : 'Refund approved');
    }
  });
  $app.addEventListener('change', e => {
    const id = e.target.id, n = e.target.name;
    if (n === 'mtype') S.draftModify.type = e.target.value;
    else if (id === 'mwin') S.draftModify.win = e.target.value;
    else if (id === 'mreason') S.draftModify.reason = e.target.value;
    else if (id === 'mnotify') S.draftModify.notify = e.target.checked;
    else if (id === 'ritem') S.draftReturn.item = e.target.value;
    else if (n === 'rreason') S.draftReturn.reason = e.target.value;
    else if (id === 'rpick') S.draftReturn.pickup = e.target.value;
    else if (id === 'rnotify') S.draftReturn.notify = e.target.checked;
    else return;
    render();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && (S.sheet || S.menu)) { S.sheet = null; S.menu = false; render(); } });
  document.getElementById('resetBtn').addEventListener('click', () => { S = initial(); render(); toast('Restarted'); });

  render();
})();
