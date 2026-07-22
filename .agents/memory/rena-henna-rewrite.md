---
name: Rena Henna stack & deployment
description: Stack, package versions, deployment config, and known quirks for the Rena Henna Expo app.
---

## Stack
- Expo SDK 54 (expo@54.0.36), React Native 0.81.5, React 19, TypeScript
- expo-router 6.0.24, Supabase backend, AsyncStorage auth
- expo-av for video (expo-video 57.0.1 installed but incompatible — use expo-av)
- @expo/vector-icons for icons (Ionicons used for back arrows)

## Package alignment
SDK 54 requires: react-native@0.81.5, react@19.1.0, expo-router@~6.0.24, expo-notifications@~0.32.17, expo-splash-screen@~31.0.13, etc.
Project arrived with SDK 52 packages — had to upgrade with --legacy-peer-deps.

**Why:** expo@54 and expo-router@4 are incompatible (entry-classic missing). All packages must match SDK 54 levels.

## expo-notifications in Expo Go
Push notifications removed from Expo Go in SDK 53+. The package calls console.error (not throws) during init.
Fix: suppress console.error containing "expo-notifications" during the dynamic import in src/lib/notifications.ts.

**How to apply:** Any time expo-notifications is statically or dynamically imported, wrap the import with a console.error suppressor.

## Deployment config
- Type: autoscale (user's deployment pane is set to autoscale)
- Build: `npx expo export --platform web` → outputs to `dist/`
- Run: `npx serve dist --listen 3000`
- Static deployment type also configured in .replit but UI shows autoscale — keep autoscale with serve.

## Metro config
Added metro.config.js with blockList for /\.local\/.*/ to prevent Metro from watching non-existent .local/skills paths (causes ENOENT crash).

## Tunnel for Expo Go
Workflow runs: `npx expo start --tunnel --port 5000`
Requires @expo/ngrok installed as devDependency.
