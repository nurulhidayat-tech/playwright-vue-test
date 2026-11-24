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

## Watch the tests in a real browser

Playwright runs headless by default. To actually see the clicks and typing:

```bash
npm run test:e2e:headed   # opens Chromium, runs one test at a time
npm run test:e2e:slow     # same + 1s pause before every action (SLOW_MO=1000)
npm run test:e2e:debug    # Playwright Inspector: step through with "Step over"
```

Change the speed with any value in milliseconds:

```bash
SLOW_MO=250  npm run test:e2e:headed   # brisk
SLOW_MO=2000 npm run test:e2e:headed   # very slow
SLOW_MO=0    npm run test:e2e:headed   # no artificial delay
```

Run a single scenario while watching (the `-g` filter matches the test title):

```bash
SLOW_MO=1000 npx playwright test --headed --workers=1 -g "5. signs in"
SLOW_MO=1000 npx playwright test --headed --workers=1 -g "7. logs out"
```

Notes:

- `--workers=1` keeps a single browser window; without it 9 windows open at once.
- `--headed` needs a desktop session (this machine has Wayland/X11).
- Interactive pause/timeline without slowing the run: `npm run test:e2e:ui`, then
  click a test and use the timeline scrubber.
- Windows PowerShell cannot use `SLOW_MO=1000 cmd`; set it first with
  `$env:SLOW_MO=1000` (the `npm run test:e2e:slow` script is POSIX-shell only).

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
