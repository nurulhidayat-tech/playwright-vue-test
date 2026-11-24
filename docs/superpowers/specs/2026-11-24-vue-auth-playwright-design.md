# Design: Vue Auth App + Playwright UI Tests

**Date:** 2026-11-24
**Status:** Approved by user (TypeScript variant)

## Intent

Greenfield app to practice **UI testing with Playwright** on a Vue.js application.
The app itself is deliberately small: login, protected profile, logout.

## Goals

- Vue 3 SPA with Login, Profile (protected) and Logout.
- Default credential: `vue` / `vue`, validated client-side (no backend).
- Session persists across page reload (`localStorage`).
- Playwright UI test suite covering the full auth journey.

## Non-goals

- No real backend, database, JWT, or password hashing.
- No registration page, no multi-user support.
- No component/unit test runner (Vitest) — UI tests only, as requested.

## Constraints

- Node 26 / npm 11 in workspace.
- Styling with plain CSS (scoped in SFCs), no CSS framework.
- Tests must run headless via `npx playwright test` and start the dev server
  automatically (`webServer` in `playwright.config.ts`).

## Stack

| Concern | Decision |
| --- | --- |
| Build | Vite 7 + `@vitejs/plugin-vue` |
| Framework | Vue 3 (Composition API, `<script setup lang="ts">`) |
| Language | TypeScript (`vue-tsc` typecheck) |
| Routing | Vue Router 4, `createWebHistory` |
| State | Pinia `auth` store |
| Tests | `@playwright/test`, chromium project |

## Structure

```
index.html
package.json
tsconfig.json / tsconfig.node.json
vite.config.ts
playwright.config.ts
e2e/
  auth.spec.ts
src/
  main.ts
  App.vue
  router/index.ts
  stores/auth.ts
  views/LoginView.vue
  views/ProfileView.vue
  views/NotFoundView.vue
  assets/main.css
```

## Auth design

`src/stores/auth.ts`

- `DEFAULT_USERNAME = 'vue'`, `DEFAULT_PASSWORD = 'vue'`.
- State: `username: string | null`, derived `isAuthenticated`.
- `login(username, password): boolean` — succeeds only on exact match,
  then writes `{ username }` to `localStorage` key `vue-auth`.
- `logout()` — clears state + `localStorage`.
- Hydrates from `localStorage` on store creation.

`src/router/index.ts`

- `/login` → `LoginView` (public)
- `/profile` → `ProfileView` with `meta.requiresAuth`
- `/` → redirect `/profile`
- Global `beforeEach`: unauthenticated + `requiresAuth` → `/login?redirect=<path>`;
  authenticated visiting `/login` → `/profile`.
- Unknown path → `NotFoundView`.

Login form uses associated `<label for>` + `data-testid` for stable selectors,
`required` attributes for native validation, and renders an inline
`role="alert"` error on wrong credential.

## UI test cases (`e2e/auth.spec.ts`)

1. Login page renders heading, username and password fields.
2. Empty submit is blocked by native validation (stays on `/login`).
3. Wrong password shows error alert, stays on `/login`.
4. Wrong username shows error alert, stays on `/login`.
5. `vue` / `vue` redirects to `/profile` and shows username.
6. Visiting `/profile` while logged out redirects to `/login`.
7. Logout returns to `/login` and removes the persisted session.
8. Session persists after reload (no redirect away from `/profile`).
9. Logged-in user visiting `/login` is redirected to `/profile`.

Each test starts from a clean browser context (Playwright default), so no
shared storage leakage between tests.
