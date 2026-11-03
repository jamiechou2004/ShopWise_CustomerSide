# Shopwise — customer app prototype

Interactive prototype of the Shopwise customer app (UXDG 415), built from the Figma Hi-Fi page **06 · Hi-Fi · five workflows**. This first version covers **01 · Onboarding**.

## Flow

Welcome → Sign up (Apple / Google / Email) → Email → You're in (name) → Greeting (home type) → Home

From Home: Furniture and Inspiration tabs, Search, and the "A restful bedroom" style detail. Profile has **Start over** to reset between test sessions.

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

Everything is simulated: no real accounts, payments or AI. State is saved in `localStorage` under `shopwise-prototype-v1`, so onboarding is not repeated after it's done.

## Run

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check + production build into dist/
```

Deploy on Vercel as a Vite project (`vercel.json` handles client-side routes).

## Notes

- Fonts are bundled (Lexend Deca via Fontsource, Material Symbols Rounded subset), so nothing loads from Google at runtime.
- To add an icon: add its name to `scripts/subset-icons.py` and run it.
- On screens wider than 500px the app sits in a 390×844 phone frame; on a phone it fills the screen.
