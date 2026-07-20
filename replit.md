# Rena Henna — Web App

A mobile-style henna products e-commerce web app built with **Vite + React + TypeScript + TailwindCSS**, connected to **Supabase**.

## Tech Stack
- **Frontend:** Vite 5, React 18, TypeScript, TailwindCSS 3
- **Routing:** React Router v6
- **Backend/DB:** Supabase (PostgreSQL)
- **Run:** `npm run dev` → port 5000

## App Structure

```
src/
  lib/          # Pure TS — supabase.ts, auth.ts, store.ts, types.ts
  context/      # AuthContext, CartContext, ThemeContext
  components/   # BottomNav, ProductCard, BackHeader, Spinner
  pages/
    Home.tsx
    Products.tsx
    ProductDetail.tsx
    Cart.tsx
    Checkout.tsx
    OrderSuccess.tsx
    Login.tsx
    Signup.tsx
    Profile.tsx
    admin/      # Dashboard, BannerManager, NotificationSender
    employee/   # Dashboard (POS sale recorder)
```

## Key Business Rules
- Brand color: `#E75480` (pink)
- Friday Sale: Rs. 10 off every product on Fridays (`isFriday()` in types.ts)
- Shipping: free over Rs. 2000, else Rs. 150
- Roles: `customer` (Supabase auth), `admin` / `employee` (hardcoded local creds in auth.ts)
- Only `@gmail.com` emails allowed for sign-up
- Supabase tables: `profiles`, `products`, `orders`, `order_items`, `app_banners`, `sales`, `push_tokens`

## User Preferences
- Keep all Supabase logic (auth, store, types) in `src/lib/`
- Phone-width layout: `max-w-[430px] mx-auto` centered on desktop
- No Expo / React Native — pure web stack
