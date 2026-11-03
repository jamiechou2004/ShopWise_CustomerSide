/* Shopwise GM console · clickable prototype
   Flow: Overview → Orders & sourcing → Order SW-10482 (service chain) → Modify order → Nov 2 → Return or exchange */
(function () {
  const D = window.SW;
  const $app = document.getElementById('app');
  const $guide = document.getElementById('guide');
  const $toast = document.getElementById('toast');
  const money = n => (n < 0 ? '−$' : '$') + Math.abs(n).toLocaleString('en-US');

  const svg = (p, vb = '0 0 24 24') => `<svg viewBox="${vb}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const I = {
    home: svg('<path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>'),
    box: svg('<path d="M3 7.5L12 3l9 4.5v9L12 21l-9-4.5z"/><path d="M3 7.5l9 4.5 9-4.5M12 12v9"/>'),
    truck: svg('<path d="M2 6h12v10H2zM14 10h4l3 3v3h-7"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>'),
    chat: svg('<path d="M4 5h16v11H9l-5 4z"/>'),
    chart: svg('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
    gear: svg('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>'),
    search: svg('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>'),
    bell: svg('<path d="M6 16V11a6 6 0 0112 0v5l1.5 2h-15z"/><path d="M10 21a2 2 0 004 0"/>'),
    chevR: svg('<path d="M9 6l6 6-6 6"/>'),
    back: svg('<path d="M15 6l-6 6 6 6"/>'),
    alert: svg('<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.01"/>'),
    info: svg('<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>'),
    check: svg('<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/>'),
    msg: svg('<path d="M4 5h16v11H9l-5 4z"/>'),
    x: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
    lamp: svg('<path d="M8 3h8l3 8H5z"/><path d="M12 11v9M8 21h8"/>'),
    download: svg('<path d="M12 4v11M7 10l5 5 5-5M4 20h16"/>')
  };

  const initial = () => ({
    view: 'overview', date: 'oct29', win: 'oct30', modified: false, drawer: null, tab: 0, ret: null,
    draftModify: { type: 'window', win: 'oct31am', reason: D.reasons[0], notify: true },
    draftReturn: { item: 'lamp', reason: 'Arrived damaged', mode: 'exchange', pickup: 'Tue, Nov 4 · 10 am–12 pm', notify: true },
    activity: [
      { t: 'Today, 9:12', s: 'Hub checked the Store B lamp' },
      { t: 'Oct 28, 16:40', s: 'Store A sofa and coffee table reached the hub' },
      { t: 'Oct 27, 11:05', s: 'Buyer picked up bed, wardrobe, desk and chair at Store C' },
      { t: 'Oct 26, 18:02', s: 'Alex swapped to the Slim shade lamp on Apple Watch (+$16)' },
      { t: 'Oct 24, 20:31', s: 'Alex paid $2,807 in the app' }
    ],
    fresh: false
  });
  let S = initial();

  const win = () => D.windows.find(w => w.id === S.win);
  const winShort = w => `${w.day.split(', ')[1]}, ${w.time}`;

  // ---------- demo guide ----------
  function step() {
    if (S.ret) return 8;
    if (S.drawer === 'return') return 7;
    if (S.date === 'nov2') return 6;
    if (S.modified) return 5;
    if (S.drawer === 'modify') return 4;
    if (S.view === 'order') return 3;
    if (S.view === 'orders') return 2;
    return 1;
  }
  const guideText = {
    1: 'Open <b>Orders &amp; sourcing</b>',
    2: 'Open Alex’s order <b>SW-10482</b>',
    3: 'Store C’s bed is late. Click <b>Modify order</b>',
    4: 'Keep Fri, Oct 31 selected and click <b>Update order</b>',
    5: 'Switch the demo date to <b>Nov 2</b>',
    6: 'Alex reported a cracked lamp. Click <b>Start return or exchange</b>',
    7: 'Choose exchange or refund, then <b>Approve</b>',
    8: 'Done. The chain, money and activity are all updated.'
  };
  const hint = n => step() === n ? ' hint' : '';
  function renderGuide() {
    const s = step();
    $guide.innerHTML = `<span class="n">${s} / 8</span><span class="bar" aria-hidden="true">${[1,2,3,4,5,6,7,8].map(i => `<i class="${i <= s ? 'on' : ''}"></i>`).join('')}</span>
      <span class="t">${guideText[s]}</span><button type="button" id="restart">Restart demo</button>`;
  }

  // ---------- shell ----------
  function side() {
    const items = [['overview', 'Overview', I.home], ['orders', 'Orders & sourcing', I.box], ['routes', 'Hub & routes', I.truck], ['care', 'Care & returns', I.chat, S.date === 'nov2' && !S.ret ? 13 : 12], ['finance', 'Finance', I.chart], ['settings', 'Settings', I.gear]];
    const active = S.view === 'order' ? 'orders' : S.view;
    return `<nav class="side" aria-label="Main">
      <div class="brand"><span class="mark">S</span><span>Shopwise<small>GM console</small></span></div>
      ${items.map(([id, l, ic, c]) => `<button type="button" class="nav ${active === id ? 'on' : ''}${id === 'orders' ? hint(1) : ''}" data-nav="${id}">${ic}<span>${l}</span>${c ? `<span class="count">${c}</span>` : ''}</button>`).join('')}
      <div class="grow"></div>
      <div class="me"><span class="av">MC</span><span>Maya Chen<small>General manager</small></span></div>
    </nav>`;
  }
  function top() {
    const crumbs = S.view === 'order'
      ? `<button type="button" data-nav="orders">Orders &amp; sourcing</button>${I.chevR.replace('<svg', '<svg width="14" height="14"')}<b>SW-10482</b>`
      : `<b>${{ overview: 'Overview', orders: 'Orders & sourcing', routes: 'Hub & routes', care: 'Care & returns', finance: 'Finance', settings: 'Settings' }[S.view]}</b>`;
    return `<header class="top">
      <div class="crumbs">${crumbs}</div><div class="grow"></div>
      <div class="search">${I.search}<span>Search orders, customers…</span><kbd>⌘K</kbd></div>
      <div class="demo-date"><span>Demo date</span><div class="seg" role="group" aria-label="Demo date">
        <button type="button" class="${S.date === 'oct29' ? 'on' : ''}" data-date="oct29">Oct 29</button>
        <button type="button" class="${S.date === 'nov2' ? 'on' : ''}${hint(5)}" data-date="nov2">Nov 2</button></div></div>
      <button type="button" class="icon-btn" aria-label="Notifications" data-action="soon">${I.bell}</button>
    </header>`;
  }

  // ---------- overview ----------
  function overview() {
    const total = D.revenue.reduce((a, r) => a + r.value, 0);
    const max = Math.max(...D.stages.slice(1).map(s => s.count));
    return `<div class="page">
      <div class="head"><div><h1>Good morning, Maya</h1><p>${S.date === 'oct29' ? 'Thursday, October 29' : 'Monday, November 2'} · all stores</p></div></div>
      <div class="kpis">${D.kpis.map(k => `<div class="kpi"><div class="l">${k.label}</div><div class="v">${k.value}</div><div class="d ${k.trend}">${k.delta}</div></div>`).join('')}</div>
      <div class="ov-grid">
        <div class="stack">
          <section class="panel"><div class="panel-h"><h3>Needs your attention</h3><span class="meta">${D.attention.length} open</span></div>
            <ul class="attn">${D.attention.map(a => `<li><span class="ic ${a.level}">${a.level === 'warn' ? I.alert : I.info}</span><span><b>${a.title}</b><span>${a.body}</span></span>
              <button type="button" class="btn" ${a.nav ? `data-nav="${a.nav}"` : 'data-action="soon"'}>${a.action}</button></li>`).join('')}</ul></section>
          <section class="panel"><div class="panel-h"><h3>Orders by stage</h3><span class="meta">One order ID links every stage</span></div>
            <div class="pipe">${D.stages.map(s => `<div class="st ${s.risk ? 'risk' : ''}"><div class="n">${s.name}</div><div class="c">${s.count.toLocaleString('en-US')}</div><div class="x ${s.risk ? 'risk' : ''}">${s.note}</div></div>`).join('')}</div></section>
        </div>
        <section class="panel rev"><div class="panel-h"><h3>Shopwise revenue</h3><span class="meta">Month to date</span></div>
          <div class="panel-b"><div class="total">${money(total)}</div><div class="sub">Furniture and tax pass through to stores and are not counted</div>
            <div class="bar">${D.revenue.map(r => `<i style="flex:${r.value}"></i>`).join('')}</div>
            ${D.revenue.map((r, i) => `<div class="row"><i style="background:${['var(--accent)', '#d9a27e', 'var(--graphite)'][i]}"></i>${r.name}<span class="amt">${money(r.value)}</span><span class="pct">${Math.round(r.value / total * 100)}%</span></div>`).join('')}
          </div></section>
      </div></div>`;
  }

  // ---------- orders ----------
  const stageNames = ['Plan', 'Order', 'Sourcing', 'At hub', 'Delivery', 'Delivered'];
  function orderRow(o) {
    const [id, name, plus, furn, stores, stage0, date0] = o;
    const isAlex = id === 'SW-10482';
    const stage = isAlex && S.date === 'nov2' ? 5 : stage0;
    const tax = isAlex ? 208 : Math.round(furn * 0.0833);
    const fee = plus ? 0 : Math.round(furn * 0.08);
    const date = isAlex ? win().day.split(', ')[1] : date0;
    const storeCls = s => stage >= 4 ? 'in' : stage === 3 ? (isAlex && s === 'C' && S.date === 'oct29' ? 'late' : 'in') : stage === 2 ? (s === stores[0] ? 'in' : '') : '';
    const status = isAlex && stage === 3 ? '<span class="badge warn">Held for Store C</span>' : stage === 5 ? '<span class="badge ok">Delivered</span>' : '';
    return `<tr class="${isAlex ? 'focus' : ''}${isAlex ? hint(2) : ''}" ${isAlex ? 'data-nav="order"' : 'data-action="soon"'}>
      <td class="oid"><b>${id}</b><span>${name}</span></td>
      <td>${plus ? '<span class="plus">PLUS</span>' : ''}</td>
      <td><div class="prog"><span class="dots">${[1, 2, 3, 4, 5].map(i => `<i class="${i < stage ? 'done' : i === stage ? 'now' : ''}"></i>`).join('')}</span><span>${stageNames[stage]}</span></div></td>
      <td><div class="stores">${stores.map(s => `<i class="${storeCls(s)}" title="Store ${s}">${s}</i>`).join('')}</div></td>
      <td>${status}</td>
      <td class="r">${money(furn + tax + 120 + fee)}</td>
      <td>${date}</td>
      <td>${I.chevR.replace('<svg', '<svg class="chev"')}</td></tr>`;
  }
  function orders() {
    const tabs = [['All active', 104, null], ['Ordered', 46, 1], ['Sourcing', 31, 2], ['At hub', 18, 3], ['Out for delivery', 9, 4]];
    const filter = tabs[S.tab][2];
    const rows = D.orders.filter(o => filter === null || o[5] === filter || (o[0] === 'SW-10482' && filter === 3));
    return `<div class="page">
      <div class="head"><div><h1>Orders &amp; sourcing</h1><p>Every paid order, where it is in the chain, and which stores it comes from.</p></div>
        <div class="actions"><button type="button" class="btn" data-action="soon">${I.download}Export</button></div></div>
      <div class="tabs" role="tablist">${tabs.map(([l, c], i) => `<button type="button" role="tab" aria-selected="${S.tab === i}" class="${S.tab === i ? 'on' : ''}" data-tab="${i}">${l}<span>${c}</span></button>`).join('')}</div>
      <div class="filters"><button type="button" class="chip" data-action="soon">+ Store</button><button type="button" class="chip" data-action="soon">+ Plan</button><button type="button" class="chip" data-action="soon">+ Delivery date</button>
        <span class="grow"></span><span class="count">Showing ${rows.length} of ${tabs[S.tab][1]}</span></div>
      <div class="panel tbl-wrap"><table>
        <thead><tr><th>Order</th><th>Plan</th><th>Stage</th><th>Stores</th><th>Status</th><th class="r">Customer total</th><th>Delivery</th><th></th></tr></thead>
        <tbody>${rows.map(orderRow).join('')}</tbody></table></div>
    </div>`;
  }

  // ---------- order (service chain) ----------
  function ledger() {
    const v = { furn: 2495, tax: 208, del: 120, fee: 0, plus: 12, buyer: 42, hub: 18, crew: 58, refund: 0 };
    if (S.ret) { v.crew = 72; if (S.ret.mode === 'refund') { const it = D.returnItems.find(i => i.id === S.ret.item); v.refund = it.price + it.tax; } }
    v.revenue = v.del + v.plus; v.cost = v.buyer + v.hub + v.crew; v.contrib = v.revenue - v.cost; v.paid = v.furn + v.tax + v.del + v.fee - v.refund;
    return v;
  }
  function order() {
    const nov2 = S.date === 'nov2', w = win(), ret = S.ret, v = ledger();
    const deliveredOn = w.day.split(', ')[1];
    const st = nov2
      ? [['Plan', 'Oct 18'], ['Order', 'Oct 24'], ['Sourcing', 'Oct 25–27'], ['Hub', 'Oct 29'], ['Delivery', deliveredOn], ['Aftercare', ret ? 'Resolved' : 'Today']]
      : [['Plan', 'Oct 18'], ['Order', 'Oct 24'], ['Sourcing', 'Oct 25–27'], ['Hub', 'Today'], ['Delivery', winShort(w)], ['Aftercare', 'From Nov 2']];
    const cur = nov2 ? 5 : 3;
    const status = nov2 ? (ret ? '<span class="badge ok">Resolved</span>' : '<span class="badge bad">Issue reported</span>') : (S.modified ? '<span class="badge ok">Rescheduled</span>' : '<span class="badge warn">Held at hub</span>');

    const notice = ret
      ? `<div class="notice ok">${I.check}<span><b>${ret.mode === 'exchange' ? 'Exchange approved.' : `Refund of ${money(v.refund)} approved.`}</b> ${ret.mode === 'exchange' ? `The crew brings a new lamp and collects the cracked one on ${ret.pickup.replace(' · ', ', ')}.` : `Pickup on ${ret.pickup.replace(' · ', ', ')}.`}${ret.notify ? ' Alex was notified.' : ''}</span></div>`
      : nov2 ? `<div class="notice bad">${I.alert}<span><b>Alex reported the lamp arrived cracked.</b> Return window is open until Nov 29.</span></div>`
      : S.modified ? `<div class="notice ok">${I.check}<span><b>Delivery moved to ${w.day}, ${w.time}.</b>${S.draftModify.notify ? ' Alex was notified on iPhone and Apple Watch.' : ''}</span></div>`
      : `<div class="notice warn">${I.alert}<span><b>Store C’s bed reaches the hub at 3 pm today.</b> The Thu, Oct 30 window is tight. Move delivery so Alex still gets everything in one drop.</span></div>`;

    const primary = ret ? `<button type="button" class="btn dark" data-nav="orders">Back to orders</button>`
      : nov2 ? `<button type="button" class="btn primary${hint(6)}" data-action="return">Start return or exchange</button>`
      : `<button type="button" class="btn primary${hint(3)}" data-action="modify">Modify order</button>`;

    const runs = `<section class="panel"><div class="panel-h"><h3>Store runs</h3><span class="meta">Bought by Shopwise, checked at the hub</span></div>
      <table class="runs"><tbody>${D.storeRuns.map(r => {
        const late = r.late && !nov2 && !S.modified;
        const badge = nov2 || S.modified || !r.late ? '<span class="badge ok">At hub</span>' : '<span class="badge warn">Arrives 3 pm</span>';
        return `<tr><td class="s"><b>${r.store}</b><span>${r.dept}</span></td><td class="it">${r.items}${r.note ? `<span>${r.note}</span>` : ''}</td><td class="r num">${money(r.amount)}</td><td>${badge}</td></tr>`; }).join('')}</tbody></table></section>`;

    const delivery = `<section class="panel"><div class="panel-h"><h3>Delivery &amp; install</h3>${nov2 ? '<span class="badge ok">Delivered</span>' : S.modified ? '<span class="badge accent">Rescheduled</span>' : '<span class="badge plain">Scheduled</span>'}</div>
      <div class="panel-b"><div class="facts">
        <div><small>${nov2 ? 'Delivered' : 'Window'}</small><b>${nov2 ? `${w.day}, 10:48` : `${w.day}, ${w.time}`}</b></div>
        <div><small>Route</small><b>${w.route}${w.plus ? ' · Plus priority' : ''}</b></div>
        <div><small>Crew</small><b>${nov2 ? 'Ken + 1 · signed on Watch' : 'Ken + 1'}</b></div></div>
        <div class="tasks"><span class="badge plain">7 pieces</span><span class="badge plain">Install bed</span><span class="badge plain">Install desk</span><span class="badge plain">Third floor, elevator</span></div></div></section>`;

    const aftercare = nov2 ? `<section class="panel"><div class="panel-h"><h3>Aftercare</h3><span class="meta">Check-in, Nov 2 at 19:34</span></div>
      <div class="panel-b"><div class="quote"><div class="ph">${I.lamp}</div><div><q>The Slim shade lamp arrived cracked.</q><small>Alex · 1 photo · rated the crew <span class="stars" aria-label="5 stars">★★★★★</span></small></div></div>
      ${ret ? `<div class="facts" style="margin-top:16px;padding-top:14px;border-top:1px solid var(--line-2)"><div><small>Resolution</small><b>${ret.mode === 'exchange' ? 'Exchange, new lamp' : `Refund ${money(v.refund)}`}</b></div><div><small>Crew visit</small><b>${ret.pickup.replace(' · ', ', ')}</b></div><div><small>Alex pays</small><b>$0</b></div></div>` : ''}</div></section>` : '';

    const econCls = v.contrib > 0 ? 'pos' : 'zero';
    return `<div class="page">
      <div class="order-head"><div><h1>SW-10482 ${status}</h1>
        <div class="who"><span class="plus">PLUS</span><span>Alex · Studio in New York · budget $3,000</span></div></div>
        <div class="actions"><button type="button" class="btn" data-action="soon">${I.msg}Message Alex</button>${primary}</div></div>
      <div class="route" aria-label="Service chain">${st.map(([k, d], i) => `<div class="stn ${i < cur || (ret && i === 5) ? 'done' : i === cur ? 'now' : 'next'}"><span class="dot"></span><div class="k">${k}</div><div class="d">${d}</div></div>`).join('')}</div>
      ${notice}
      <div class="o-grid">
        <div class="stack">${nov2 ? aftercare + delivery + runs : runs + delivery}</div>
        <div class="stack">
          <section class="panel money"><div class="panel-h"><h3>Customer paid</h3></div><div class="panel-b">
            <div class="big">${money(v.paid)}</div><div class="cap">$2,807 at checkout, +$16 for the lamp swap${v.refund ? `, ${money(-v.refund)} refund` : ''}</div>
            <div class="lines"><div class="l"><span>Furniture</span><span>${money(v.furn)}</span></div><div class="l"><span>Tax</span><span>${money(v.tax)}</span></div>
              <div class="l"><span>Delivery &amp; install</span><span>${money(v.del)}</span></div><div class="l"><span>Service fee</span><span>$0 with Plus</span></div>
              ${v.refund ? `<div class="l chg"><span>Lamp refund</span><span>${money(-v.refund)}</span></div>` : ''}</div></div></section>
          <section class="panel"><div class="panel-h"><h3>What Shopwise earns</h3></div><div class="panel-b">
            <div class="econ"><div><small>Revenue</small><b>${money(v.revenue)}</b></div><div><small>Cost to serve</small><b>${money(v.cost)}</b></div><div class="${econCls}"><small>Contribution</small><b>${v.contrib > 0 ? '+' : ''}${money(v.contrib)}</b></div></div>
            <details class="more"><summary>How it adds up</summary><div class="lines">
              <div class="l"><span>Delivery &amp; install</span><span>${money(v.del)}</span></div><div class="l"><span>Plus, October share</span><span>${money(v.plus)}</span></div>
              <div class="l"><span>Buyer run, 3 stores</span><span>${money(-v.buyer)}</span></div><div class="l"><span>Hub handling</span><span>${money(-v.hub)}</span></div>
              <div class="l ${S.ret ? 'chg' : ''}"><span>${S.ret ? 'Crew, delivery and return visit' : 'Crew, delivery and install'}</span><span>${money(-v.crew)}</span></div></div></details></div></section>
          <section class="panel"><div class="panel-h"><h3>Activity</h3></div><div class="panel-b">
            <ul class="feed">${S.activity.slice(0, 6).map((a, i) => `<li class="${i === 0 && S.fresh ? 'new' : ''}"><small>${a.t}</small>${a.s}</li>`).join('')}</ul></div></section>
        </div></div></div>`;
  }

  // ---------- drawers ----------
  const sw = (id, on, label) => `<label class="toggle"><span>${label}</span><span class="switch"><input type="checkbox" id="${id}" ${on ? 'checked' : ''}><i></i></span></label>`;
  function modifyDrawer() {
    const m = S.draftModify, cur = win(), sel = D.windows.find(w => w.id === m.win);
    const ok = m.type === 'window' && m.win !== S.win;
    return `<div class="scrim" data-action="close"></div><aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="dt">
      <div class="drawer-h"><div><h2 id="dt">Modify order</h2><p>SW-10482 · Alex · paid $2,823</p></div><button type="button" class="icon-btn" data-action="close" aria-label="Close">${I.x}</button></div>
      <div class="drawer-b">
        <div class="field"><span class="lbl">What needs to change?</span><div class="pills">${[['window', 'Delivery window'], ['swap', 'Swap an item'], ['remove', 'Remove an item']].map(([k, l]) => `<button type="button" class="${m.type === k ? 'on' : ''}" data-mtype="${k}">${l}</button>`).join('')}</div></div>
        ${m.type === 'window' ? `
        <div class="current"><span>Current window</span><b>${cur.day}, ${cur.time} · ${cur.route}</b></div>
        <div class="field"><span class="lbl">New window</span><div class="opts">${D.windows.filter(w => w.id !== S.win).map(w => `<button type="button" class="opt ${m.win === w.id ? 'on' : ''}" data-win="${w.id}"><span class="rd"></span><span><b>${w.day}, ${w.time}</b><span>${w.route} · ${w.note}</span></span>${w.rec ? '<span class="badge accent plain">Recommended</span>' : ''}</button>`).join('')}</div></div>
        <div class="field"><label for="mreason">Reason</label><select id="mreason">${D.reasons.map(r => `<option ${m.reason === r ? 'selected' : ''}>${r}</option>`).join('')}</select></div>
        <div class="field"><span class="lbl">What changes</span><div class="impact">
          <div class="r"><span>Price</span><b>No change, $2,823${sel.plus ? ' (Plus priority is free)' : ''}</b></div>
          <div class="r"><span>Crew</span><b>${sel.route}, Ken + 1</b></div>
          <div class="r"><span>Drop</span><b>Still one drop from all three stores</b></div></div></div>
        ${sw('mnotify', m.notify, 'Notify Alex on iPhone and Apple Watch')}`
        : `<div class="current"><span>This prototype covers changing the delivery window.</span></div>`}
      </div>
      <div class="drawer-f"><button type="button" class="btn" data-action="close">Cancel</button><button type="button" class="btn primary${ok ? hint(4) : ''}" data-action="update" ${ok ? '' : 'disabled'}>Update order</button></div></aside>`;
  }
  function returnDrawer() {
    const r = S.draftReturn, it = D.returnItems.find(i => i.id === r.item), refund = it.price + it.tax;
    return `<div class="scrim" data-action="close"></div><aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="rt">
      <div class="drawer-h"><div><h2 id="rt">Return or exchange</h2><p>SW-10482 · Alex · window open until Nov 29</p></div><button type="button" class="icon-btn" data-action="close" aria-label="Close">${I.x}</button></div>
      <div class="drawer-b">
        <div class="field"><span class="lbl">Item</span><div class="opts">${D.returnItems.map(i => `<button type="button" class="opt ${r.item === i.id ? 'on' : ''}" data-item="${i.id}"><span class="rd"></span><span><b>${i.name}</b><span>${i.store}</span></span><span class="right">${money(i.price)}</span></button>`).join('')}</div></div>
        <div class="field"><span class="lbl">Reason</span><div class="pills">${['Arrived damaged', 'Changed mind', 'Doesn’t fit'].map(x => `<button type="button" class="${r.reason === x ? 'on' : ''}" data-reason="${x}">${x}</button>`).join('')}</div></div>
        <div class="field"><span class="lbl">From Alex</span><div class="evidence"><span class="ph">${I.lamp}</span><span>1 photo, Nov 2 at 19:34<br>“The Slim shade lamp arrived cracked.”</span></div></div>
        <div class="field"><span class="lbl">Resolution</span><div class="opts">
          <button type="button" class="opt ${r.mode === 'exchange' ? 'on' : ''}" data-mode="exchange"><span class="rd"></span><span><b>Exchange</b><span>A new ${it.name} on the same visit</span></span><span class="right">$0</span></button>
          <button type="button" class="opt ${r.mode === 'refund' ? 'on' : ''}" data-mode="refund"><span class="rd"></span><span><b>Refund</b><span>${money(it.price)} + ${money(it.tax)} tax to the original card</span></span><span class="right">${money(refund)}</span></button></div></div>
        <div class="field"><label for="rpick">Crew visit</label><select id="rpick">${['Tue, Nov 4 · 10 am–12 pm', 'Wed, Nov 5 · 2–4 pm'].map(p => `<option ${r.pickup === p ? 'selected' : ''}>${p}</option>`).join('')}</select></div>
        <div class="field"><span class="lbl">What changes</span><div class="impact">
          <div class="r"><span>Alex pays</span><b>$0, pickup is free with Plus</b></div>
          <div class="r"><span>${it.store}</span><b>${r.mode === 'exchange' ? `Rebuy today, damage claim opened` : `Return credit ${money(it.price)} to Shopwise`}</b></div>
          <div class="r"><span>Contribution</span><b class="up">+$14 → $0 (extra crew visit)</b></div></div></div>
        ${sw('rnotify', r.notify, 'Notify Alex on iPhone and Apple Watch')}
      </div>
      <div class="drawer-f"><button type="button" class="btn" data-action="close">Cancel</button><button type="button" class="btn primary${hint(7)}" data-action="approve">Approve ${r.mode}</button></div></aside>`;
  }

  function placeholder() {
    return `<div class="page empty"><div><h1>Not in this prototype</h1><p>This walkthrough runs through Overview, Orders &amp; sourcing and one order’s service chain.</p><button type="button" class="btn primary" data-nav="overview">Go to Overview</button></div></div>`;
  }

  function render() {
    const view = { overview, orders, order }[S.view] || placeholder;
    const y = document.getElementById('content')?.scrollTop || 0;
    $app.innerHTML = side() + `<div class="main">${top()}<main class="content" id="content">${view()}</main></div>`
      + (S.drawer === 'modify' ? modifyDrawer() : S.drawer === 'return' ? returnDrawer() : '');
    document.getElementById('content').scrollTop = render.keep ? y : 0; render.keep = false;
    renderGuide();
  }
  const rerender = () => { render.keep = true; render(); };

  function toast(msg) { $toast.innerHTML = I.check + `<span>${msg}</span>`; $toast.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => $toast.classList.remove('show'), 2400); }
  function go(view) { if (view === 'chain') view = 'order'; S.view = view; S.fresh = false; render(); }

  // ---------- events ----------
  document.addEventListener('click', e => {
    if (e.target.closest('#restart')) { S = initial(); render(); toast('Demo restarted'); return; }
    const t = e.target.closest('[data-nav],[data-action],[data-date],[data-tab],[data-mode],[data-win],[data-mtype],[data-item],[data-reason]');
    if (!t) return;
    const d = t.dataset;
    if (d.nav) return go(d.nav);
    if (d.tab) { S.tab = +d.tab; return rerender(); }
    if (d.win) { S.draftModify.win = d.win; return rerender(); }
    if (d.mtype) { S.draftModify.type = d.mtype; return rerender(); }
    if (d.item) { S.draftReturn.item = d.item; return rerender(); }
    if (d.reason) { S.draftReturn.reason = d.reason; return rerender(); }
    if (d.mode) { S.draftReturn.mode = d.mode; return rerender(); }
    if (d.date) {
      if (S.date === d.date) return;
      S.date = d.date; S.fresh = false; S.drawer = null;
      if (S.date === 'nov2') { S.view = 'order'; S.activity.unshift({ t: 'Oct 31, 10:48', s: 'Crew delivered and installed 7 pieces. Alex signed on Apple Watch' }, { t: 'Nov 2, 19:34', s: 'Alex reported the lamp arrived cracked (check-in, 1 photo)' }); S.fresh = true; }
      return render();
    }
    const a = d.action;
    if (a === 'soon') toast('Not part of this prototype');
    else if (a === 'modify') { S.drawer = 'modify'; rerender(); }
    else if (a === 'return') { S.drawer = 'return'; rerender(); }
    else if (a === 'close') { S.drawer = null; rerender(); }
    else if (a === 'update') {
      const m = S.draftModify; if (m.type !== 'window' || m.win === S.win) return;
      S.win = m.win; S.modified = true; S.drawer = null; const w = win();
      S.activity.unshift({ t: 'Just now', s: `Maya moved delivery to ${w.day}, ${w.time}. ${m.reason}${m.notify ? '. Alex notified' : ''}` }); S.fresh = true;
      rerender(); toast('Order updated');
    }
    else if (a === 'approve') {
      const r = S.draftReturn; S.ret = { ...r }; S.drawer = null;
      const it = D.returnItems.find(i => i.id === r.item);
      S.activity.unshift({ t: 'Just now', s: r.mode === 'exchange' ? `Maya approved an exchange for the ${it.name.toLowerCase()}. ${it.store} rebuy today${r.notify ? '. Alex notified' : ''}` : `Maya approved a ${money(it.price + it.tax)} refund for the ${it.name.toLowerCase()}${r.notify ? '. Alex notified' : ''}` }); S.fresh = true;
      rerender(); toast(r.mode === 'exchange' ? 'Exchange approved' : 'Refund approved');
    }
  });
  document.addEventListener('change', e => {
    const id = e.target.id;
    if (id === 'mreason') S.draftModify.reason = e.target.value;
    else if (id === 'mnotify') S.draftModify.notify = e.target.checked;
    else if (id === 'rpick') S.draftReturn.pickup = e.target.value;
    else if (id === 'rnotify') S.draftReturn.notify = e.target.checked;
    else return;
    rerender();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && S.drawer) { S.drawer = null; rerender(); } });

  render();
})();
