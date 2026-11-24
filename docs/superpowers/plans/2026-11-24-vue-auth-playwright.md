# Vue Auth App + Playwright UI Tests — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Vue 3 + TypeScript SPA with login/profile/logout (`vue`/`vue`) and an automated Playwright UI test suite.

**Architecture:** Vite SPA. Pinia store owns credential check + session hydration from `localStorage`; Vue Router guards `/profile`; views are thin SFCs rendering store state. Playwright drives a real chromium browser against the Vite dev server started by `webServer`.

**Tech Stack:** Vue 3, TypeScript, Vite, Vue Router 4, Pinia, Playwright (`@playwright/test`).

**Spec:** `docs/superpowers/specs/2026-11-24-vue-auth-playwright-design.md`

## Global Constraints

- Credential is exactly `vue` / `vue` (case-sensitive), no backend.
- Session key in `localStorage` is exactly `vue-auth`, value `{"username":"vue"}`.
- Styling: plain CSS only, no CSS framework.
- All test selectors use `data-testid`, never CSS classes or UI copy.
- `npx playwright test` must pass after `npm install` + browser install only.
- TypeScript strict mode; `npm run typecheck` must exit 0.

## File Structure

| File | Responsibility |
| --- | --- |
| `package.json` | scripts: `dev`, `build`, `preview`, `typecheck`, `test:e2e`, `test:e2e:ui` |
| `vite.config.ts` | Vue plugin, port 5173, `strictPort` |
| `tsconfig.json`, `tsconfig.node.json` | strict TS for app + node configs |
| `playwright.config.ts` | chromium project, baseURL `http://localhost:5173`, `webServer` |
| `src/main.ts` | create app, pinia, router, mount |
| `src/App.vue` | `<RouterView />` shell |
| `src/stores/auth.ts` | `DEFAULT_USERNAME`, `DEFAULT_PASSWORD`, `login`, `logout`, `isAuthenticated`, hydration |
| `src/router/index.ts` | routes `/login`, `/profile`, `/`, NotFound + guard |
| `src/views/LoginView.vue` | form, error alert, redirect after login |
| `src/views/ProfileView.vue` | profile card + logout button |
| `src/views/NotFoundView.vue` | 404 + link home |
| `src/assets/main.css` | base layout/form styles |
| `e2e/auth.spec.ts` | 9 UI test cases from spec |

## Interfaces

```ts
// src/stores/auth.ts
export const DEFAULT_USERNAME = 'vue'
export const DEFAULT_PASSWORD = 'vue'
export const AUTH_STORAGE_KEY = 'vue-auth'
useAuthStore(): {
  username: Ref<string | null>
  isAuthenticated: ComputedRef<boolean>
  login(username: string, password: string): boolean
  logout(): void
}
```

Router meta: `{ requiresAuth: true }` on `/profile`; guard redirects with
`/login?redirect=<to.fullPath>`.

## Task 1: Project scaffold + toolchain

**Files:** `package.json`, `vite.config.ts`, `tsconfig*.json`, `index.html`, `src/main.ts`, `src/App.vue`, `src/assets/main.css`, `.gitignore`

- [x] Create `package.json` with scripts `dev: vite --port 5173 --strictPort`, `build: vue-tsc -b && vite build`, `typecheck: vue-tsc -b`, `test:e2e: playwright test`, `test:e2e:ui: playwright test --ui`.
- [x] Install deps: `vue`, `vue-router`, `pinia`; dev: `vite`, `@vitejs/plugin-vue`, `typescript`, `vue-tsc`, `@playwright/test`, `@types/node`.
- [x] Verify: `npm run dev` serves `index.html`; `curl -s localhost:5173 | grep -q '<div id="app">'`.

**Interfaces:** app mounts `#app`; `src/main.ts` installs pinia before router.

## Task 2: Auth store

**Files:** `src/stores/auth.ts`

- [x] Implement constants, `localStorage` hydration in a guarded `loadSession()`, `login`, `logout` per Interfaces block.
- [x] Verify: `npm run typecheck` exits 0.

## Task 3: Router + guard

**Files:** `src/router/index.ts`

- [x] Routes `/login`, `/profile` (`meta.requiresAuth`), `/` → redirect, `/:pathMatch(.*)*` → NotFound.
- [x] `beforeEach`: guest → `requiresAuth` route gets `/login?redirect=...`; authenticated on `/login` → `/profile`.
- [x] Verify: `npm run typecheck` exits 0.


## Task 4: Views (login, profile, not-found)

**Files:** `src/views/*.vue`, `src/App.vue`, `src/assets/main.css`

`data-testid` contract (tests depend on these exact values):

| testid | element |
| --- | --- |
| `login-form` | `<form>` |
| `username-input` | username input |
| `password-input` | password input |
| `login-submit` | submit button |
| `login-error` | `role="alert"` error paragraph |
| `profile-username` | span with username |
| `logout-button` | logout button |

- [x] `LoginView`: bind store, show error when `login()` returns false, push `redirect` query (fallback `/profile`) on success; inputs `required`.
- [x] `ProfileView`: show username, logout button → `logout()` + `router.push('/login')`.
- [x] Verify: `npm run typecheck` exits 0 and dev server renders `/login`.

## Task 5: Playwright config + browser

**Files:** `playwright.config.ts`

- [x] `testDir: './e2e'`, `use: { baseURL: 'http://localhost:5173', trace: 'on-first-retry' }`, `projects: [{ name: 'chromium', use: devices['Desktop Chrome'] }]`, `webServer: { command: 'npm run dev', url: 'http://localhost:5173', reuseExistingServer: !process.env.CI, timeout: 120_000 }`.
- [x] Verify: `npx playwright install chromium`, then `npx playwright test --list` lists the spec.

## Task 6: UI test suite (9 cases)

**Files:** `e2e/auth.spec.ts`

- [x] Tests 1–9 from the spec, each with `goto('/login')` and its own context (default).
- [x] Verify: `npx playwright test` → `9 passed`.

## Task 7: Full verification

- [x] `npm run typecheck` → exit 0.
- [x] `npm run build` → `dist/` created.
- [x] `npx playwright test` → 9 passed; capture final output.

## Review Focus

1. Guard must not create a redirect loop when already authenticated (`/login` → `/profile`).
2. `localStorage` hydration must tolerate malformed/empty JSON without crashing the app.
3. Logout must clear storage, otherwise case 7 passes visually while leaking session.
4. Native `required` validation must keep test 2 on `/login` (no submit handler bypass).
5. `redirect` query must not allow redirect outside the app's own routes.
