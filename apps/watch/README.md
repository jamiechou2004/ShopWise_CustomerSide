# Shopwise · Apple Watch prototype

Static, clickable prototype of the watch companion (46mm, 208 × 248 pt, tint `#CF8B61`). No build step: open `index.html`.

| Scenario | Screens | Link |
| --- | --- | --- |
| Out of stock | Alert → "See details" hands off to iPhone, or "Remind me later" | `?flow=stock` |
| Delivery day | Live Activity 25 → 10 → 2 min, then "Crew is at your door" | `?flow=delivery` |
| Rate the delivery | Prompt → stars (tap, arrow keys or scroll as the crown) → thanks | `?flow=rate` |

The watch never picks a replacement: that stays in the customer app (`/orders/:id/swap`). Press R to restart a scenario. Everything is simulated.
