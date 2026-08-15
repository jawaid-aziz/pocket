# Pocket — Mobile App (React Native / Expo)

The client for **Pocket**, a closed-loop digital wallet. PKR-denominated wallet with Stripe card top-ups, OTP + PIN authentication, instant P2P transfers, and a transaction history. Built as a Final Year Project at COMSATS University Islamabad, Abbottabad Campus.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Project Structure](#project-structure)
- [Navigation & Screens](#navigation--screens)
- [Authentication Flow](#authentication-flow)
- [Data & State Management](#data--state-management)
- [Key User Flows](#key-user-flows)
- [Theming](#theming)
- [Team](#team)

---

## Overview

- **Load money** — add funds via Stripe card payment (test mode); the backend charges the same numeric value in `usd` since Stripe doesn't settle PKR, while the wallet ledger stays PKR-denominated.
- **Send money** — instant, closed-loop transfers between Pocket users by phone number (no card/fees — a pure ledger move on the backend).
- **History** — cursor-paginated ledger entries grouped by day, with pull-to-refresh and infinite scroll.
- **Security** — 6-digit PIN (Argon2-hashed server-side) unlocks the app on return visits; refresh tokens stored in the OS keychain (Expo SecureStore); automatic re-login on expired/revoked sessions.

---

## Tech Stack

| Concern | Technology |
|---|---|
| Framework | React Native + Expo (SDK 54) |
| Navigation | Expo Router (file-based routing) |
| Data fetching | TanStack Query v5 |
| Global state | Zustand v5 |
| Payments | `@stripe/stripe-react-native` (CardField + confirmPayment) |
| Secure storage | `expo-secure-store` (refresh token) |
| Styling | NativeWind v4 + a shared token file (`src/theme/tokens.ts`) |
| Language | TypeScript (strict) |

---

## Getting Started

```bash
cd pocket-frontend
npm install
```

Create a `.env` file with the two public variables (see below), then run:

```bash
npm run start        # Expo dev server → scan QR with Expo Go / dev build
# or
npm run android      # Android emulator / device
npm run ios          # iOS simulator
```

The backend must be running (see `pocket-backend/README.md`) and reachable at `EXPO_PUBLIC_API_URL`.

---

## Environment Variables

All are **public** (inlined at build time by Expo — never put secrets here). Create `.env` in `pocket-frontend/`.

| Variable | Required | Description |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | ✅ | Backend base URL, e.g. `http://localhost:4000` (or your LAN/ngrok URL for a physical device) |
| `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | Stripe **publishable** key for the Stripe SDK (test mode for development) |

> Physical devices can't reach `localhost` — use your machine's LAN IP or an ngrok URL to the backend.

---

## Scripts

| Command | Purpose |
|---|---|
| `npm run start` | Start the Expo dev server |
| `npm run android` | Launch on Android emulator/device |
| `npm run ios` | Launch on iOS simulator |
| `npm run web` | Run in the browser |
| `npm run lint` | ESLint (Expo config) |
| `npm run reset-project` | Reset the Expo project (use carefully) |

---

## Project Structure

```
pocket-frontend/
├── app/                        # Expo Router routes
│   ├── _layout.tsx             # Root: StripeProvider + QueryClient + theme + Stack
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx           # Splash — decides /pin or /login from stored refresh token
│   │   ├── login.tsx           # Phone + email → request OTP
│   │   ├── otp.tsx             # Enter 6-digit code → otpToken
│   │   ├── set-pin.tsx         # Create / enter PIN on a new device
│   │   └── pin.tsx             # Unlock with PIN on return visits
│   └── (tabs)/
│       ├── _layout.tsx         # 5-tab bar (Home, Load, Send, History, Settings)
│       ├── index.tsx           # Dashboard: balance, quick actions, recent activity
│       ├── load.tsx            # Stripe card top-up
│       ├── send.tsx            # P2P transfer by phone number
│       ├── transactions.tsx    # Full transaction history
│       └── settings.tsx        # Profile, soundbox status, logout
├── src/
│   ├── api/
│   │   ├── client.ts           # Fetch wrapper: auth header, 401→single-flight refresh→retry, forceLogout
│   │   ├── auth.ts             # requestOtp / verifyOtp / signup / loginNewDevice / verifyPinUnlock / logout
│   │   ├── account.ts          # fetchMe / updateProfile / topUp
│   │   ├── transactions.ts     # sendMoney / fetchTransactions (paginated)
│   │   ├── queryClient.ts      # React Query client (cleared on logout)
│   │   └── hooks/              # useAuth / useAccount / useTransactions / useTransactionsFeed
│   ├── store/
│   │   ├── authStore.ts        # user, accessToken, isAuthenticated, isUnlocked
│   │   ├── walletStore.ts      # live balance
│   │   └── toastStore.ts       # transient toast messages
│   ├── components/             # Button, Card, PinPad, PinDots, BalanceCard, TransactionItem,
│   │                           # PressableScale, Skeleton, EmptyState, Toast, etc.
│   ├── theme/
│   │   └── tokens.ts           # colors / radius / spacing / typography / txColors
│   └── utils/
│       ├── secureStorage.ts    # SecureStore wrapper for the refresh token
│       ├── phone.ts            # E.164 normalization + Pakistani-number validation
│       ├── format.ts           # formatPKR currency formatter
│       └── haptics.ts          # haptic feedback helpers (web no-op)
└── app.json                    # Expo config (light-only UI, Stripe plugin, splash)
```

---

## Navigation & Screens

Two route groups, gated by `app/(auth)/index.tsx`:

```
App start
   │
   ▼
Splash ((auth)/index)
   │  refresh token in SecureStore?
   ├── yes → /pin   (unlock)          │
   └── no  → /login (signup / login)  │  → otp → set-pin
                                        ▼
                              (tabs)  Home · Load · Send · History · Settings
```

- **`(auth)`** — one-off onboarding/lock screens (no tab bar).
- **`(tabs)`** — the main app: Dashboard, Load, Send, History, Settings.

The root layout wraps everything in `<StripeProvider>`, `<QueryClientProvider>`, and a light `<ThemeProvider>`.

---

## Authentication Flow

1. **Splash** — reads the refresh token from SecureStore. Present → `router.replace("/pin")`; absent → `/login`.
2. **Login** (`login.tsx`) — phone + email. `requestOtp("SIGNUP")`. On `409` (phone already registered) it retries with `LOGIN_NEW_DEVICE`. `409` on email → inline error.
3. **OTP** (`otp.tsx`) — 6-digit code → `verifyOtp` → `{ otpToken }` → `/set-pin` (passing `phone`, `purpose`, `email`, `otpToken`).
4. **Set PIN** (`set-pin.tsx`) — enter + confirm a 6-digit PIN → `signup` (new account) or `loginNewDevice` (existing account). On success: save `refreshToken` to SecureStore, `setSession(user, accessToken)`.
5. **Return visits** — `/pin` calls `verifyPinUnlock({ refreshToken, pin })` → on success `setAuthenticated(true)` + `setUnlocked(true)`.

**Token lifecycle** (`src/api/client.ts`):

- Every request attaches `Authorization: Bearer <accessToken>`.
- On `401`, a **single-flight** `POST /api/auth/refresh` runs once (concurrent 401s share it), the rotated refresh token is persisted, and the original request retries once.
- If refresh fails or no refresh token exists → `forceLogout()` clears stores + SecureStore and `router.replace("/login")`.

**Logout** (`settings.tsx`) — calls `POST /api/auth/logout` with the refresh token (revokes the device server-side), clears React Query cache + stores, navigates to `/login`.

---

## Data & State Management

- **TanStack Query** handles server state: `["me", userId]`, `["transactions", userId]` (keys scoped per user so switching accounts never leaks data). Mutations invalidate and refetch on success.
  - The history screen uses `useTransactionsFeed` — a cursor-paginated **infinite query** (`/transactions?limit=20&cursor=…`) with automatic "load more" on scroll end.
  - Sending money **optimistically prepends** the returned ledger entry to the cached history and updates the balance instantly, so the UI never waits on a refetch.
- **Zustand** holds client state:
  - `authStore` — `user`, `accessToken`, `isAuthenticated`, `isUnlocked`, plus `setSession` / `setAccessToken` / `setAuthenticated` / `setUnlocked` / `clearSession`.
  - `walletStore` — the live `balance`, updated after sends and top-up credit.
  - `toastStore` — transient success/error/info toasts rendered by `ToastHost` (mounted in the root layout).
- **queryClient.clear()** on logout wipes all cached data.

## Interaction & Motion

- **Haptics** (`src/utils/haptics.ts`) — light tap feedback on buttons, quick actions, PIN keys and contact chips; success/error notification feedback on load-complete and failed sends (web is a no-op).
- **Scale press feedback** (`PressableScale`) — interactive elements scale down ~4% while held and spring back, for a tactile, responsive feel.
- **Skeletons** (`Skeleton.tsx`) — the dashboard and history show pulsing placeholders instead of a bare spinner, keeping layout stable while data loads.
- **Staggered entrances** — dashboard sections and history rows fade/slide in with small delays so content doesn't pop.
- **Animated balance** (`BalanceCard`) — the amount count-up transitions smoothly on refresh.
- **Pull-to-refresh** on the dashboard and history screens; the dashboard also shows a dated greeting.

---

## Key User Flows

### Top-up (Load)

1. User enters an amount (defaults to Rs., capped at 50,000) → `topUp(amount)`.
2. Backend creates a `PENDING` ledger row + Stripe PaymentIntent → `{ clientSecret, paymentIntentId, currency }`.
3. Stripe `CardField` → `confirmPayment(clientSecret)` wrapped in try/catch.
4. On confirmation, the screen **polls `fetchMe`** until the wallet balance reflects the credit (Stripe's `payment_intent.succeeded` webhook flips the ledger + credits the wallet), then shows success. An error page is shown if the payment fails.

### Send money

1. Enter recipient phone (normalized to E.164, validated as a Pakistani number) + amount (≤ 50,000, ≤ 2 decimals, optional note).
2. `sendMoney(...)` → backend debits atomically and credits the recipient → `{ balance, recipient, amount, transaction }`.
3. On success the balance store updates, the returned transaction is prepended to history optimistically, a success toast fires, and the form resets; errors (e.g. insufficient balance, unknown recipient) are surfaced inline.

### Settings

- Edit name/email (`updateProfile`), see soundbox status, and **logout** (revokes the device server-side).

---

## Theming

The app is **light-mode only** by design: `app.json` sets `userInterfaceStyle: "light"` and the root layout pins `DefaultTheme` (React Navigation). All screens use tokens from `src/theme/tokens.ts` (colors, `radius`, `spacing(n)`, `typography`, `txColors` for transaction rows). There is intentionally no dark theme yet — remove the pin if one is added.

---

## Team

| Name | Registration | Role |
|---|---|---|
| Jawaid Aziz | CIIT/SP23-BCS-043/ATD | Authentication, Transactions, Backend, Payload Verification |
| Noman Mazari | CIIT/SP23-BCS-015/ATD | Stripe Integration, ESP32 Firmware, Network Connectivity, Testing |
| Sania Zehra | CIIT/SP23-BCS-077/ATD | UI/UX, Frontend Development, Account Management, Audio Playback, Documentation |

**Supervisor:** Bushra Mushtaq · **Degree:** BS Computer Science (2023–2027) · **Institution:** COMSATS University Islamabad, Abbottabad Campus

> Academic project — not licensed for commercial use without permission.