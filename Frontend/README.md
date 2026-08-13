# Oyster Mushroom Disease Detection — Mobile App

A production-ready **Expo / React Native** app that photographs oyster-mushroom
bags, detects fungal disease (**Healthy / Green Mold / Black Mold**) via a
YOLOv8 FastAPI backend, and tracks results per rack with history and reports.

<p>
  <b>Stack:</b> Expo · TypeScript · React Navigation v7 · React Native Paper ·
  NativeWind · Zustand · TanStack Query · Axios · React Hook Form + Zod ·
  Expo Camera / Image Picker / FileSystem / Sharing · FlashList · Reanimated ·
  @gorhom/bottom-sheet.
</p>

---

## 1. Prerequisites

- Node 18+ and npm
- The **backend running** (see the repo root `app.py`) — the app is fully wired to real APIs.
- Expo Go on a device, or an Android/iOS emulator.

## 2. Run the backend first

From the repository root (one level up from `Frontend/`):

```bash
pip install -r requirements.txt
python app.py            # or: uvicorn app:app --host 0.0.0.0 --port 8000
```

The API serves on `http://0.0.0.0:8000`. It creates `oyster.db` (SQLite) and
seeds a few racks on first launch. Confirm it's up: open `http://localhost:8000/health`.

## 3. Configure the API URL

Copy the example env file and set the URL the **device** can reach:

```bash
cp .env.example .env
```

| Where the app runs        | `EXPO_PUBLIC_API_URL`                     |
| ------------------------- | ----------------------------------------- |
| iOS simulator             | `http://localhost:8000`                   |
| Android emulator (AVD)    | `http://10.0.2.2:8000`                    |
| **Physical device**       | `http://<YOUR-COMPUTER-LAN-IP>:8000`      |

> A physical device **cannot** reach `localhost`. Find your machine's LAN IP
> (`ipconfig` on Windows, `ifconfig`/`ip addr` on macOS/Linux) and make sure the
> phone is on the same Wi‑Fi. The backend already allows all CORS origins.

## 4. Install & start

```bash
npm install
npm start          # then press a / i, or scan the QR with Expo Go
```

Other scripts: `npm run typecheck`, `npm run lint`, `npm run format`.

### Run on Android / iOS

The app targets real devices — this is where the **camera** works. Pick one path.

#### A. Physical phone with Expo Go (easiest, recommended for dev)

1. Install **Expo Go** (Android: Play Store · iOS: App Store).
2. Put the **phone and computer on the same Wi‑Fi**.
3. In `.env`, set `EXPO_PUBLIC_API_URL=http://<YOUR-COMPUTER-LAN-IP>:8000` (see §3 — `localhost` will **not** work from a phone).
4. Start the backend (repo root: `python app.py`), then start the app:
   ```bash
   npm start
   ```
5. Open it on the phone:
   - **Android** → open **Expo Go** → *Scan QR code* → scan the QR in the terminal.
   - **iOS** → open the built‑in **Camera** app → point at the QR → tap the banner.
   - If your network blocks LAN discovery, run `npx expo start --tunnel` instead (slower, but works across networks).

#### B. Android emulator (Android Studio)

1. Install **Android Studio**, create a device in **Device Manager**, and start it (or plug in a physical device with USB debugging on).
2. Set `EXPO_PUBLIC_API_URL=http://10.0.2.2:8000` (the emulator's alias for your machine's `localhost`).
3. Run:
   ```bash
   npm run android      # or: npm start, then press "a"
   ```

#### C. iOS simulator (macOS only)

1. Install **Xcode** + Command Line Tools (the Simulator ships with it).
2. Set `EXPO_PUBLIC_API_URL=http://localhost:8000`.
3. Run:
   ```bash
   npm run ios          # or: npm start, then press "i"
   ```
   > iOS development requires a Mac. On Windows/Linux, use Expo Go on a physical iPhone (path A).

#### Standalone build (optional, no Expo Go)

To produce an installable APK/IPA, use EAS:
```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview   # or -p ios
```
This builds in the cloud and returns a download link. (Some native modules — camera, gesture handler — are already config‑plugin ready in `app.json`.)

### Running day-to-day (and when to clear the cache)

For normal work just start the dev server — Metro reuses its cache, so it's fast:

```bash
npm start            # device / emulator (press a / i, or scan the QR)
npm run web          # browser
```

- **First build after a cache clear** is slow (a cold build transforms ~1,500 modules; the web bundle is a single ~3 MB file with no native pre-compilation).
- **Every start afterwards** is much faster — only changed files are re-transformed.
- **While the server is running**, edits hot-reload in ~1s. Keep it running and just refresh the browser instead of restarting — you don't re-pay the build cost.

Only add `-c` (**clear Metro cache**, forces a full cold rebuild) when something is stale or you changed build config:

```bash
npx expo start --tunnel
npx expo start -c --web
```

Use `-c` after: editing `babel.config.js`, `metro.config.js`, `tailwind.config.js`, or `app.json`; installing/removing/updating a dependency; or when old code/errors won't go away. Otherwise you do **not** need it every run.

> Tip: Android/iOS via Expo Go bundle faster than web here (and the camera works there) — web is best for quick checks with **Upload from Gallery**.

---

## 5. Architecture

```
src/
├── api/          Axios instance + interceptors, one module per resource,
│                 React Query client & key factory
├── components/   Reusable UI kit (buttons, inputs, cards, grid, chips, states…)
├── constants/    API config, disease metadata
├── hooks/        Data hooks (racks, history, summary, mutations), image picker, debounce
├── navigation/   Root stack (Tabs + Camera modal + Detail) & bottom tabs
├── screens/      Capture · Camera · Tracking · History · Detail
├── services/     File download+share, offline queue (scaffold)
├── store/        Zustand: prediction, history filters, selected rack, theme
├── theme/        Palette (light + dark), typography, spacing, ThemeProvider
├── types/        Zod schemas + inferred types (mirror the real API)
└── utils/        Error normalization, date/number formatting
```

**State split:** TanStack Query owns all **server** state (with cache
invalidation after every capture/delete). Zustand holds only **UI/session**
state. This avoids the common "store the server response in a global store"
duplication.

**Theming:** a token-based `useAppTheme()` drives light/dark (organic warm-green
dark palette) and feeds React Native Paper + React Navigation themes. NativeWind
is configured for utility styling; color-critical surfaces use the theme tokens
so dark mode is always correct.

## 6. Screens & flow

- **Capture** → camera (take → preview → retake/use) or gallery → enter Rack/Bag/Notes →
  `POST /predict` → result card → auto `POST /bag` (saved to history + tracking).
- **Tracking** → pick a rack → stat cards + color-coded bag grid (latest detection wins
  per bag) → tap a bag for a bottom-sheet detail → full report.
- **History** → search + disease filter chips + infinite scroll (`GET /history`) →
  summary + **Export Report** (backend PDF) → tap a card for Detail.
- **Detail** → annotated image, full data, **Export PDF / Share / Delete**.

## 7. Backend endpoints used

`POST /predict` · `GET /racks` · `GET /rack/{id}` · `POST /bag` · `GET /history` ·
`GET /history/{id}` · `DELETE /history/{id}` · `GET /reports/summary` ·
`GET /reports/pdf` · `GET /reports/excel` · static `GET /outputs/<file>`.

## 8. Scope notes (v1)

- **No authentication** — the Axios layer has a token slot ready (`setAuthToken`) for future auth.
- **Reports are backend-generated** (PDF fully; Excel exposed as CSV — full XLSX deferred).
- **Offline queue is scaffolded** (`services/offlineQueue.ts`): failed saves persist and
  can be flushed manually; automatic NetInfo-triggered sync is a documented TODO.
- **Bounding-box overlay** is deferred — the Detail image already shows the server-drawn boxes.

## 9. Troubleshooting

- **Network errors / spinner forever** → wrong `EXPO_PUBLIC_API_URL`. Use the LAN IP for devices and restart with `npx expo start -c`.
- **Version mismatch warnings** → run `npx expo install --fix`.
- **Fonts/styles not applied** → clear the Metro cache: `npx expo start -c`.
