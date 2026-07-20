---
name: Rena Henna stack rewrite
description: Full rewrite from Expo/React Native to Vite+React+TypeScript+TailwindCSS; key decisions and constraints.
---

## The rule
This project was completely rewritten from Expo SDK 51 / React Native to a plain Vite + React + TypeScript + TailwindCSS web app. The `src/lib/` files (`auth.ts`, `store.ts`, `types.ts`) are pure TypeScript with no React Native deps and must stay that way. `supabase.ts` uses `createClient` with default browser storage (no AsyncStorage).

**Why:** The Expo/React Native web renderer had broken click/scroll interactions that couldn't be reliably fixed; a clean web stack was the only reliable path.

**How to apply:** Never re-introduce `react-native`, `expo-*`, `@react-navigation`, or `AsyncStorage`. If push notifications are needed in future, use the web Push API or a third-party web push service — not `expo-notifications`.

## Layout convention
- All pages use `max-w-[430px] mx-auto` phone-width container inside a pink background.
- Bottom nav (`BottomNav.tsx`) is `fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px]` — always matches the container width.
- Pages with bottom nav add `pb-24` to their scroll container.

## Auth credentials (hardcoded — from auth.ts)
Admin and employee accounts use local credential checks, NOT Supabase auth. Only `customer` role uses Supabase sign-up/sign-in. Credentials are in `src/lib/auth.ts` — do not move them to env vars without user approval.

## Supabase tables used
`profiles`, `products`, `orders`, `order_items`, `app_banners`, `sales`, `push_tokens`
