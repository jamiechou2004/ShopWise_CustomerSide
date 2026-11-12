# Shopwise prototypes (UXDG 415)

Two connected, clickable prototypes from one story: Alex furnishes a first New York apartment in the **customer app**, and the **GM console** runs the same order, SW-10482, behind the scenes.

| Folder | What it is | Stack |
| --- | --- | --- |
| [`apps/customer`](apps/customer) | Customer iPhone app: onboarding, design a room, select & replace, checkout, return to user | React + TypeScript + Vite |
| [`apps/gm-console`](apps/gm-console) | GM web console: dashboard, orders & sourcing, service chain, modify order, return or exchange | Plain HTML / CSS / JS |

Everything is simulated: no real accounts, payments, stores or deliveries.

## Live site

GitHub Pages publishes both apps from this repo on every push to `main`:

- Landing page: `https://jamiechou2004.github.io/ShopWise_CustomerSide/`
- Customer app: `…/customer/`
- GM console: `…/gm-console/`

One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Work locally

```bash
npm install              # installs the customer app's dependencies
npm run dev:customer     # customer app at localhost:5173
npm run build:site       # builds the whole Pages site into ./site
npm run preview:site     # serves ./site at localhost:8080
```

The GM console has no build step: open `apps/gm-console/index.html` or serve that folder.

## Layout

```
apps/
  customer/       Vite app (src/, public/img/, scripts/subset-icons.py)
  gm-console/     static site (index.html, app.js, data.js, styles.css, figma/)
site-src/         landing page copied to the site root
scripts/          build-site.mjs assembles ./site for GitHub Pages
.github/workflows pages.yml deploys ./site
```

The GM console's commit history came over from [shopwise-gm-console](https://github.com/jamiechou2004/shopwise-gm-console), which stays online as it was.

Design source: Figma file *Shopwise · UXDG 415* (pages 06 · Hi-Fi five workflows and 11 · GM console Hi-Fi workflow).
