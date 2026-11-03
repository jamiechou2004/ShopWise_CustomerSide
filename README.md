# Shopwise · GM console prototype

Clickable prototype of the **Shopwise GM console** (UXDG 415, SCAD). Shopwise runs fulfilment itself: buyers purchase at partner stores, the Shopwise hub consolidates, the Shopwise crew delivers and installs. The GM console shows how every service is linked by one order ID.

**Live:** https://jamiechou2004.github.io/shopwise-gm-console/

## The workflow (8 steps)
1. **Dashboard** — KPIs, live service chain, revenue mix, alerts → *Orders & sourcing*
2. **Orders & sourcing** — Alex's order SW-10482 → *Open chain*
3. **Service chain** — Plan → Order → Sourcing → Hub → Delivery → Aftercare, with the money ledger → *Modify order*
4. **Modify order** (sheet) — move delivery to Oct 31, 10–12 (Plus priority), impact shown before saving → *Update order*
5. **Order updated** — chain, header and activity log update → click the **toolbar date** → *Nov 2*
6. **After delivery** — Aftercare is current; Alex reported a cracked lamp → *Start return or exchange*
7. **Return or exchange** (sheet) — exchange or refund $103, pickup, cost impact → *Approve*
8. **Approved** — aftercare, ledger (cost $132, contribution $0) and log in sync → *Back to orders*

A guide bar above the window shows the current step. **Restart** resets the demo.

## Story & numbers (sample data)
- Alex checked out at $2,807 with the Mini globe lamp. It sold out at Store B; he chose the Slim shade lamp on Apple Watch (+$16) → total **$2,823**.
- Revenue: delivery & install $120 + Plus share $12 = $132. Cost to serve $118 → contribution +$14 (→ $0 after the exchange pickup).

## Run locally
No build step — open `index.html`, or:
```
python3 -m http.server 8000
```

Design source: Figma page *05d · GM console · Hi-Fi workflow*. UI follows macOS conventions with Shopwise design-system colours.
