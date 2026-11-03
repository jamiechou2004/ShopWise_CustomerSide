# Shopwise · GM console prototype

Clickable prototype of the **Shopwise GM console** (UXDG 415, SCAD). Shopwise runs fulfilment itself: buyers purchase at partner stores, the Shopwise hub consolidates, the Shopwise crew delivers and installs. The GM console shows how every service is linked by one order ID.

**Live:** https://jamiechou2004.github.io/shopwise-gm-console/

## The workflow (8 steps)
1. **Dashboard** — KPIs, live service chain, revenue mix, alerts → *Orders & sourcing*
2. **Orders & sourcing** — Alex's order SW-10482 → *Open chain*
3. **Order SW-10482** — the service chain as a route line (Plan → Order → Sourcing → Hub → Delivery → Aftercare), store runs, delivery, money and activity → *Modify order*
4. **Modify order** (drawer) — move delivery to Fri, Oct 31, 10 am–12 pm (Plus priority), impact shown before saving → *Update order*
5. **Order updated** — chain, badge and activity update → switch **Demo date** to *Nov 2*
6. **After delivery** — Alex reported a cracked lamp → *Start return or exchange*
7. **Return or exchange** (drawer) — exchange or $103 refund, crew visit, impact → *Approve*
8. **Approved** — aftercare, money (contribution $0) and activity in sync → *Back to orders*

A guide pill at the bottom shows the current step and highlights what to click. **Restart demo** resets it.

## Story & numbers (sample data)
- Alex checked out at $2,807 with the Mini globe lamp. It sold out at Store B; he chose the Slim shade lamp on Apple Watch (+$16) → total **$2,823**.
- Revenue: delivery & install $120 + Plus share $12 = $132. Cost to serve $118 → contribution +$14 (→ $0 after the exchange pickup).

## Run locally
No build step — open `index.html`, or:
```
python3 -m http.server 8000
```

Design source: Figma page *05d · GM console · Hi-Fi workflow*. Shopwise terracotta is reserved for the current stage and primary actions. Lexend Deca for headings, Inter for data.
