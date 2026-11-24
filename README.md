# Vue Auth · Playwright UI Test

Vue 3 + TypeScript demo app (login / profile / logout) with an end-to-end UI
test suite written in Playwright.

- Default credential: **`vue` / `vue`**
- Session is kept in `localStorage` under the key `vue-auth`
- `/profile` is protected by a Vue Router navigation guard
- `e2e/auth.spec.ts` covers 9 UI scenarios (chromium)

## Requirements

- Node.js 20+ (tested with Node 26)
- npm 10+

## Install

```bash
npm install
npx playwright install chromium
```

## Run the app

```bash
npm run dev        # http://localhost:5173
```

## Run the UI tests

```bash
npx playwright test        # headless, starts the dev server automatically
npm run test:e2e           # same as above
npm run test:e2e:ui        # Playwright UI mode (watch / debug)
```

Useful variants:

```bash
npx playwright test --headed        # see the browser
npx playwright test --debug         # step through with Inspector
npx playwright show-report          # open the last HTML report
```

## Other scripts

```bash
npm run typecheck   # vue-tsc project build check
npm run build       # typecheck + production build into dist/
npm run preview     # serve the production build
```

## Project layout

```
src/
  main.ts               app bootstrap (pinia + router)
  App.vue               layout shell with <RouterView>
  stores/auth.ts        credential check, session persistence, logout
  router/index.ts       routes + auth guard
  views/LoginView.vue   login form + inline error
  views/ProfileView.vue profile data + logout button
  views/NotFoundView.vue
e2e/auth.spec.ts        Playwright UI tests
playwright.config.ts    chromium project + webServer config
docs/superpowers/...    design doc and implementation plan
```

## Test scenarios

1. Login page renders the form.
2. Empty submit is blocked by native validation.
3. Wrong password shows an error and stores no session.
4. Unknown username shows an error.
5. `vue` / `vue` signs in and shows the profile.
6. Guests are redirected from `/profile` to `/login?redirect=/profile`.
7. Logout returns to `/login` and clears `localStorage`.
8. Session survives a page reload.
9. Authenticated users visiting `/login` are sent to `/profile`.
