# GoDutch

A small offline-first PWA for splitting shared expenses on trips. Add people,
log who paid for what and how it's shared, and GoDutch computes each person's
balance and the minimal set of payments to settle up.

## Stack

- **Vue 3** + `<script setup>` + **TypeScript**
- **Vite** build + **vite-plugin-pwa** (offline / installable)
- **Pinia** state, persisted to `localStorage`
- **Vuetify 3** UI
- **Vitest** for the money/settlement domain logic

## Architecture

- `src/domain/` — pure, framework-free, fully unit-tested logic:
  - `money.ts` — integer minor-unit splitting (no floats; parts always sum to the whole)
  - `settle.ts` — net balances + greedy minimal-transaction settle-up
- `src/stores/trips.ts` — Pinia store: multiple trips, each with its own people, expenses, and currency
- `src/views/`, `src/components/` — Vuetify UI

## Develop

```
pnpm install
pnpm dev         # dev server with HMR
pnpm test        # run unit tests
pnpm typecheck   # vue-tsc
pnpm lint        # eslint --fix
pnpm build       # production build + PWA service worker
pnpm preview     # preview the production build
```
