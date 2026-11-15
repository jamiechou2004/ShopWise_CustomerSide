# Shopwise prototypes (UXDG 415)

Three connected, clickable prototypes from one story: Alex furnishes a first New York apartment in the **customer app**, the **Apple Watch** keeps up with the order, and the **GM console** runs the same order, SW-10482, behind the scenes.

| Folder | What it is | Stack |
| --- | --- | --- |
| [`apps/customer`](apps/customer) | Customer iPhone app: onboarding, design a room, select & replace, checkout, return to user | React + TypeScript + Vite |
| [`apps/watch`](apps/watch) | Apple Watch companion: out-of-stock alert (hand-off to iPhone), delivery-day ETA, rate the delivery | Plain HTML / CSS / JS |
| [`apps/gm-console`](apps/gm-console) | GM web console: dashboard, orders & sourcing, service chain, modify order, return or exchange | Plain HTML / CSS / JS |

Everything is simulated: no real accounts, payments, stores or deliveries.

## Live site

GitHub Pages publishes all three apps from this repo on every push to `main`:

- Landing page: `https://jamiechou2004.github.io/ShopWise_CustomerSide/`
- Customer app: `…/customer/`
- Apple Watch: `…/watch/`
- GM console: `…/gm-console/`

One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Work locally

```bash
npm install              # installs the customer app's dependencies
npm run dev:customer     # customer app at localhost:5173
npm run build:site       # builds the whole Pages site into ./site
npm run preview:site     # serves ./site at localhost:8080
```

The GM console and the Apple Watch prototype have no build step: open `apps/gm-console/index.html` or `apps/watch/index.html`, or serve that folder.

## Layout

```
apps/
  customer/       Vite app (src/, public/img/, scripts/subset-icons.py)
  watch/          static site (index.html, app.js, styles.css)
  gm-console/     static site (index.html, app.js, data.js, styles.css, figma/)
site-src/         landing page copied to the site root
scripts/          build-site.mjs assembles ./site for GitHub Pages
.github/workflows pages.yml deploys ./site
```

The GM console's commit history came over from [shopwise-gm-console](https://github.com/jamiechou2004/shopwise-gm-console), which stays online as it was.

Design source: Figma file *Shopwise · UXDG 415* (pages 06 · Hi-Fi five workflows, Apple Watch · Hi-Fi v3 and 11 · GM console Hi-Fi workflow).
