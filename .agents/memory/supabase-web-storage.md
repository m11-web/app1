---
name: Supabase storage adapter on web
description: AsyncStorage as Supabase auth storage hangs on Expo web, blocking all queries
---

# Supabase auth storage on Expo web

## Rule
Do NOT pass `storage: AsyncStorage` to the Supabase client unconditionally. Use platform detection:

```ts
import { Platform } from 'react-native';
...(Platform.OS !== 'web' && { storage: AsyncStorage }),
```

## Why
When Supabase initializes with `AsyncStorage` on web (Expo web / Metro bundler), the GoTrueClient tries to `getItem` from AsyncStorage during startup. The web shim wraps localStorage but can hang or block query resolution — all `supabase.from(...).select()` calls return Promises that never settle, leaving every screen stuck on its loading spinner.

## How to apply
Applies to `src/lib/supabase.ts`. On native (iOS/Android), keep AsyncStorage as the storage adapter so sessions persist across app restarts. On web, omit `storage` and let Supabase use its built-in localStorage adapter.
