# Shopwise — customer app prototype

Interactive prototype of the Shopwise customer app (UXDG 415), built from the Figma Hi-Fi page **06 · Hi-Fi · five workflows**. All five workflows are built: **01 · Onboarding**, **02 · Design a room**, **03 · Select & replace**, **04 · Checkout** and **05 · Return to user**.

## Flow

Welcome → Sign up (Apple / Google / Email) → Email → You're in (name) → Greeting (home type) → Home

From Home: Furniture and Inspiration tabs, Search, and the "A restful bedroom" style detail. Profile has **Start over** to reset between test sessions.

Design a room: Home → Finish setup → 9 questions → Your home brief → Generating → Home with the plan ready. **Save** on any question stores a draft and returns to Home; **Continue** on the setup card resumes at the next unanswered step. Rows in the brief open that question and return to the brief. "Start with this style" on the style detail starts setup with that style picked.

| Route | Figma frame |
| --- | --- |
| `/` | E1 · Welcome |
| `/signup` | E2 · Sign up |
| `/signup/email` | E2 · Email |
| `/signup/name` | E2 · You're in |
| `/greeting` | E3 · Greeting |
| `/home` | H1 · Home · setup skipped |
| `/home?tab=inspiration` | H1 · Home · Inspiration |
| `/search` | H2 · Search |
| `/style/restful-bedroom` | H5 · Style detail |
| `/setup/1` … `/setup/9` | S1·1 Goal … S3·9 Timing |
| `/setup/brief` | S4 · Your brief |
| `/setup/generating` | S5 · Generating |
| `/plan` | R1 · Room plan (R6 · Updated after a swap) |
| `/plan/lamp`, `/plan/lamp/replace` | R2 · Lamp, R3 · Replace lamp |
| `/plan/lamp/browse` | R3 · Browse lamps (no AI) |
| `/plan/lamp/ask` → `/finding` → `/options` | R3 · Ask AI, R4, R5 |
| `/plan/lamp/try/:lampId`, `/plan/saved` | R6 · Try it, R7 · Saved |
| `/checkout` … `/checkout/placed` | C1, C3, C4, C5 · Pay, C6 |
| `/orders/:id/swap`, `/orders/:id/swapped` | C7 · Pick a lamp, C8 · Lamp swapped |
| `/notify`, `/check-in` | F0 · Notification, F1 · Check-in |
| `/orders`, `/orders/:id` | O1 · Your orders, O2 · Order |
| `/return/1` … `/return/approved` | T1–T5 · Return or exchange |

Prices follow one rule everywhere (`src/plan.ts`): furniture + tax at 207/2,480 + $120 delivery, $0 service fee for Plus. That gives $2,850 with the shade lamp, $2,807 with the mini globe and $2,823 after the sold-out swap.

To test the after-delivery flows, use **Profile → Skip to delivery day** once an order is placed.

Everything is simulated: no real accounts, payments or AI. State is saved in `localStorage` under `shopwise-prototype-v1`, so onboarding is not repeated after it's done.

## Run

From the repo root:

```bash
npm install
npm run dev:customer     # local dev server
npm run build:customer   # type-check + production build into apps/customer/dist/
```

GitHub Pages builds this app with hash routing (`VITE_ROUTER=hash`, see `scripts/build-site.mjs` at the repo root). To deploy on Vercel instead, import the repo and set **Root Directory** to `apps/customer`; `vercel.json` handles client-side routes.

## Notes

- Fonts are bundled (Lexend Deca via Fontsource, Material Symbols Rounded subset), so nothing loads from Google at runtime.
- To add an icon: add its name to `scripts/subset-icons.py` and run it.
- On screens wider than 500px the app sits in a 390×844 phone frame; on a phone it fills the screen.
