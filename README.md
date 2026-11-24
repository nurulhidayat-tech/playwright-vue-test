# Vue Auth · Playwright UI Test

Aplikasi demo **Vue 3 + TypeScript** dengan alur login → profile → logout, lengkap
dengan **9 test UI end-to-end** memakai **Playwright** (Chromium).

Project ini dibuat sebagai bahan latihan UI testing: aplikasinya sengaja kecil,
tetapi seluruh alur autentikasi diuji dari sisi browser — klik tombol, isi form,
baca pesan error, cek URL, dan cek `localStorage`.

## Fitur

- Halaman **Login** dengan validasi native (`required`) + pesan error inline.
- Halaman **Profile** yang dilindungi route guard (`/profile`).
- **Logout** yang menghapus sesi.
- Sesi bertahan setelah refresh (`localStorage`, key `vue-auth`).
- Redirect otomatis: tamu yang membuka `/profile` dikirim ke
  `/login?redirect=/profile`, lalu kembali ke `/profile` setelah login.
- Halaman 404 untuk URL yang tidak dikenal.
- Styling CSS murni (tanpa framework) + TypeScript strict mode.

## Kredensial demo

| Field | Nilai |
| --- | --- |
| Username | `vue` |
| Password | `vue` |

Username/password bersifat **case-sensitive** dan dicek di sisi client (tanpa backend).

## Kebutuhan

- **Node.js 20.19+** atau **22.12+** (Vite 7). Sudah diuji di Node 26 / npm 11.
- npm 10+
- Desktop session (Wayland/X11) hanya jika ingin memakai mode `--headed`.
  Test headless tetap bisa jalan tanpa display.

## Instalasi

```bash
npm install
npx playwright install chromium
```

`install chromium` mengunduh browser Chromium + headless shell ke
`~/.cache/ms-playwright`.

## Menjalankan aplikasi

```bash
npm run dev        # http://localhost:5173
```

Buka browser, login dengan `vue` / `vue`, lalu coba refresh di `/profile`
(sesi tetap) dan klik **Log out** (kembali ke `/login`).

## Menjalankan test

| Perintah | Fungsi |
| --- | --- |
| `npm run test:e2e` | Jalankan 9 test headless (dev server otomatis dinyalakan) |
| `npm run test:e2e:ui` | Mode UI Playwright: pilih test, lihat timeline, time-travel |
| `npm run test:e2e:ui:web` | Mode UI di `http://127.0.0.1:9412`, buka manual di browser |
| `npm run test:e2e:headed` | Browser terlihat, **1 worker** (satu jendela) |
| `npm run test:e2e:slow` | Seperti headed + jeda **1000 ms** tiap aksi |
| `npm run test:e2e:debug` | Playwright Inspector: pause & tombol *Step over* |
| `npm run test:e2e:debug:cli` | Debugger berbasis terminal (tanpa jendela Inspector) |

Perintah manual yang sering dipakai:

```bash
npx playwright test                    # semua test headless
npx playwright test --list             # daftar test tanpa menjalankannya
npx playwright test e2e/auth.spec.ts   # satu file
npx playwright test -g "logs out"      # filter berdasarkan judul test
npx playwright test --repeat-each=3    # ulangi tiap test 3x (deteksi flaky)
npx playwright show-report             # buka laporan HTML terakhir
```

Catatan teknis dari `playwright.config.ts`:

- Dev server dijalankan otomatis (`webServer`) di `http://localhost:5173`,
  dan dipakai ulang jika sudah menyala (`reuseExistingServer` di luar CI).
- `fullyParallel: true` → tiap file/test boleh berjalan paralel; jumlah worker
  default 50% core CPU (di CI dipaksa 1).
- Di CI: `retries: 2`, `workers: 1`, `forbidOnly: true`.
- Artefak: `screenshot` hanya saat gagal, `trace` disimpan saat retry pertama.
- Laporan HTML ditulis ke `playwright-report/` (diabaikan git).

## Melihat test berjalan langsung di browser

Playwright berjalan headless secara default. Supaya bisa melihat klik dan
pengetikan secara langsung:

```bash
npm run test:e2e:headed   # Chromium terbuka, satu test pada satu waktu
npm run test:e2e:slow     # sama + jeda 1 detik sebelum setiap aksi
npm run test:e2e:debug    # Inspector: jalankan per langkah
```

Atur kecepatan sendiri (milidetik) lewat environment variable `SLOW_MO`, yang
dibaca config sebagai `launchOptions.slowMo`:

```bash
SLOW_MO=250  npm run test:e2e:headed   # agak cepat
SLOW_MO=2000 npm run test:e2e:headed   # sangat lambat
SLOW_MO=0    npm run test:e2e:headed   # tanpa jeda buatan
```

Jalankan satu skenario saja sambil menonton:

```bash
SLOW_MO=1500 npx playwright test --headed --workers=1 -g "5. signs in"
SLOW_MO=1500 npx playwright test --headed --workers=1 -g "7. logs out"
SLOW_MO=1500 npx playwright test --headed --workers=1 -g "2. blocks"
```

Tips:

- `--workers=1` penting saat menonton; tanpa itu 9 jendela browser terbuka sekaligus.
- Ingin bisa pause dan mundur? Pakai `npm run test:e2e:ui`, klik satu test, lalu
  gunakan timeline di bawah.
- `--headed` butuh display. Di server/SSH tanpa GUI, gunakan `xvfb-run npx playwright test --headed`.
- Di Windows PowerShell, `SLOW_MO=1000 cmd` tidak berlaku. Set dulu:
  `$env:SLOW_MO=1000` lalu `npm run test:e2e:headed`
  (script `test:e2e:slow` memakai sintaks shell POSIX).

### Debug per langkah: kenapa `--debug` terlihat "berhenti"?

Itu memang perilakunya, bukan hang. `--debug` setara dengan:

```bash
PWDEBUG=1 playwright test --timeout=0 --max-failures=1 --headed --workers=1
```

- `--timeout=0` → tidak ada batas waktu, jadi test menunggu Anda tanpa batas.
- Test **pause sebelum setiap aksi** (klik, isi form, navigasi) dan menunggu perintah.

Cara melanjutkan di **Playwright Inspector** (jendela terpisah dari browser):

| Tombol | Shortcut | Fungsi |
| --- | --- | --- |
| Resume | `F8` | Jalankan terus sampai selesai atau pause berikutnya |
| Pause | `F8` | Hentikan lagi saat test sedang berjalan |
| Step over | `F10` | Maju satu aksi, lalu pause lagi |

Kalau jendela Inspector tidak terlihat, tekan `Alt+Tab` — di Wayland jendela ini
kadang terbuka di belakang VS Code atau di workspace lain. Judul jendelanya
**Playwright Inspector**.

### Kalau Inspector tidak muncul (hanya halaman blank)

Kasus ini sudah direproduksi di mesin ini (Playwright 1.65 + Chromium 159 di
Ubuntu Wayland):

- Browser terbuka menampilkan `about:blank`. Itu **normal**: test di-pause
  sebelum aksi pertama, jadi `page.goto('/login')` belum dijalankan.
- Tetapi window **Playwright Inspector tidak pernah muncul**. Sudah diuji dengan
  Chromium bawaan Playwright, Chrome sistem (`channel: chrome`), dan XWayland
  (`--ozone-platform=x11`) — hasilnya sama: hanya window `about:blank`.

Penyebabnya: Playwright membuka Inspector sebagai window "app" terpisah
(`--app=data:text/html,`). Pada kombinasi desktop/Chromium ini window tersebut
tidak ter-render, sehingga test menunggu tanpa batas.

Gunakan salah satu jalur berikut (keduanya sudah diverifikasi):

**A. UI Mode lewat browser biasa — paling nyaman**

```bash
npm run test:e2e:ui:web
# → Listening on http://127.0.0.1:9412
```

Buka `http://127.0.0.1:9412` di Chrome/Firefox Anda: ada daftar test, tombol
play per test, timeline time-travel, trace, dan source code.

**B. Debugger terminal `--debug=cli`** — lihat bagian di bawah.

**C. VS Code Playwright extension** — sidebar **Testing** → klik kanan test →
*Debug Test*. Breakpoint langsung di editor, tanpa window Inspector.

Catatan: `F8`/`F10` **tidak berpengaruh** kalau window Inspector tidak ada,
karena shortcut itu ditangkap oleh window Inspector, bukan oleh browser.

### Kalau Inspector tidak muncul: mode terminal (`--debug=cli`)

```bash
npm run test:e2e:debug:cli
```

Output-nya memberi ID sesi:

```
### The test is currently paused at the start
### Debugging Instructions
- Run "playwright-cli attach tw-846bfb" to attach to this test
```

Buka **terminal kedua** di folder project, lalu:

```bash
# masuk ke sesi debug (REPL — ketik perintah di bawahnya)
npm run playwright:cli -- attach tw-846bfb

# atau perintah sekali jalan tanpa REPL
npm run playwright:cli -- -s=tw-846bfb step-over
npm run playwright:cli -- -s=tw-846bfb resume
npm run playwright:cli -- -s=tw-846bfb snapshot
npm run playwright:cli -- -s=tw-846bfb pause-at e2e/auth.spec.ts:59
```

Perintah yang tersedia antara lain: `resume`, `step-over`, `pause-at <file>:<line>`,
`snapshot`, `click`, `fill`, `goto`, `eval`. Ganti `tw-846bfb` dengan ID sesi Anda.

**Sudah diverifikasi di project ini:** `--debug=cli` → `attach tw-846bfb` → `resume`
menghasilkan `✓ 1 renders the login form (179ms)` dan `1 passed`.

### Mau berhenti hanya di satu titik?

Tambahkan `await page.pause()` di test, lalu jalankan `npm run test:e2e:headed`.
Test berjalan normal sampai baris itu, lalu pause; tekan `F8`/Resume untuk lanjut.

```ts
await page.getByTestId('password-input').fill('vue')
await page.pause() // <- browser berhenti di sini
await page.getByTestId('login-submit').click()
```

### Ringkasan pilihan

| Kebutuhan | Perintah |
| --- | --- |
| Lihat otomatis, pelan | `npm run test:e2e:slow` (`SLOW_MO=1000`) |
| Lihat otomatis, lebih pelan | `SLOW_MO=2000 npm run test:e2e:headed` |
| Pause & maju per aksi (GUI) | `npm run test:e2e:debug` lalu `F10` |
| Pause & maju per aksi (terminal) | `npm run test:e2e:debug:cli` + `playwright:cli` |
| Pause di baris tertentu | `await page.pause()` di dalam test |
| Replay tiap langkah tanpa pause | `npm run test:e2e:ui` |

## Skenario test (9 kasus)

Semua test ada di `e2e/auth.spec.ts`, dijalankan dari browser sungguhan
(Chromium), dan setiap test mendapat konteks browser baru (storage bersih).

| # | Judul test | Yang diverifikasi |
| --- | --- | --- |
| 1 | renders the login form | Heading, form, input username/password, tombol submit, URL `/login` |
| 2 | blocks submit while fields are empty | Validasi native menolak submit; tetap di `/login`, tidak ada error custom |
| 3 | shows an error for a wrong password | Alert `Invalid username or password.` tampil; `localStorage` tetap kosong |
| 4 | shows an error for an unknown username | Username selain `vue` ditolak |
| 5 | signs in with vue/vue | Redirect ke `/profile`, username tampil, tombol logout ada |
| 6 | redirects guests away from the protected profile | Guest ke `/profile` → `/login` dengan `?redirect=/profile`, lalu login mengembalikan ke `/profile` |
| 7 | logs out and clears the stored session | Kembali ke `/login` dan key `vue-auth` terhapus |
| 8 | keeps the session after a page reload | Refresh di `/profile` tidak melempar ke login |
| 9 | sends an authenticated user from /login to /profile | User yang sudah login tidak bisa membuka halaman login |

Menambah test baru: buat file `e2e/*.spec.ts`, pakai `test` dan `expect` dari
`@playwright/test`, dan pilih elemen lewat `page.getByTestId(...)`.

## Struktur project

```
.
├── index.html                  entry HTML (mount #app)
├── vite.config.ts              plugin Vue, port 5173 strictPort
├── playwright.config.ts        project chromium, baseURL, webServer, slowMo
├── tsconfig*.json              TS strict untuk app dan config/test
├── e2e/
│   └── auth.spec.ts            9 test UI autentikasi
├── src/
│   ├── main.ts                 bootstrap: Pinia → Router → mount
│   ├── App.vue                 shell layout + <RouterView>
│   ├── assets/main.css         styling CSS murni
│   ├── stores/auth.ts          kredensial, sesi localStorage, login/logout
│   ├── router/index.ts         route + navigation guard
│   └── views/
│       ├── LoginView.vue       form login + error inline
│       ├── ProfileView.vue     data user + tombol logout
│       └── NotFoundView.vue    halaman 404
├── docs/superpowers/
│   ├── specs/                  design doc (disetujui)
│   └── plans/                  implementation plan
└── README.md
```

## Cara kerja autentikasi

1. `LoginView` mengirim `username`/`password` ke `authStore.login()`.
2. Store membandingkan dengan konstanta `DEFAULT_USERNAME`/`DEFAULT_PASSWORD`
   (`vue`/`vue`). Gagal → return `false` dan form menampilkan alert.
3. Berhasil → store menyimpan `username` di state dan menulis
   `localStorage["vue-auth"] = {"username":"vue"}`.
4. `router.beforeEach` mengecek `meta.requiresAuth`: jika belum login, arahkan
   ke `/login?redirect=<path asal>`; jika sudah login dan membuka `/login`,
   arahkan ke `/profile`.
5. Saat aplikasi dimuat ulang, store melakukan hidrasi dari `localStorage`
   (dibungkus `try/catch`, jadi data rusak tidak membuat app crash).
6. `logout()` mengosongkan state dan menghapus key `vue-auth`.

## Selector `data-testid`

Test tidak bergantung pada teks atau class CSS. Kontrak yang dipakai:

| `data-testid` | Elemen |
| --- | --- |
| `login-page` / `profile-page` / `not-found-page` | Root section tiap halaman |
| `login-form` | `<form>` login |
| `username-input` / `password-input` | Input form |
| `login-submit` | Tombol submit |
| `login-error` | Paragraf error (`role="alert"`) |
| `profile-username` | Span berisi username |
| `logout-button` | Tombol logout |

Jika Anda mengubah nama `data-testid`, ubah juga test yang memakainya.

## Script lain

```bash
npm run typecheck   # vue-tsc -b (cek tipe app + config/test)
npm run build       # typecheck + build produksi ke dist/
npm run preview     # serve hasil build
```

## Troubleshooting

| Masalah | Solusi |
| --- | --- |
| `Error: Port 5173 is already in use` | Port dipaksa `strictPort`. Hentikan proses lama: `pkill -f 'vite --port 5173'`, lalu jalankan lagi |
| `Executable doesn't exist at .../chrome-linux64/chrome` | `npx playwright install chromium` |
| Browser gagal start karena library sistem kurang (Linux/CI) | `npx playwright install --with-deps chromium` (butuh sudo) |
| `--headed` tidak membuka jendela | Butuh sesi desktop. Di SSH/headless: `xvfb-run npx playwright test --headed` |
| Test jalan terlalu cepat untuk diamati | `SLOW_MO=2000 npm run test:e2e:headed` |
| Ingin melihat langkah per langkah | `npm run test:e2e:debug`, lalu tekan *Step over* |
| Test gagal dan ingin bukti | `npx playwright show-report` (screenshot + trace) |
| `vite` error setelah `npm install` di npm baru | `npm rebuild esbuild`, lalu ulangi |

## Catatan keamanan

Ini **aplikasi demo untuk latihan testing**, bukan contoh autentikasi produksi:

- Kredensial `vue`/`vue` di-hardcode di bundle client dan bisa dibaca siapa pun.
- Sesi hanya berupa entri `localStorage` yang bisa diedit manual dari DevTools.
- Tidak ada backend, hash password, token, refresh, atau expiry.

Untuk aplikasi nyata, validasi harus dilakukan di server, gunakan cookie
`HttpOnly`/token dengan expiry, dan jangan pernah menyimpan password di client.

