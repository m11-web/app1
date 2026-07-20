# Rena Henna — Mobile App

A henna products e-commerce app built with **Expo SDK 54 + React Native + expo-router**, connected to **Supabase**.

## Tech Stack
- **Framework:** Expo SDK 54, React Native 0.76
- **Routing:** expo-router v4 (file-based, Stack navigator)
- **Styling:** StyleSheet.create (no NativeWind/Tailwind)
- **Backend/DB:** Supabase (PostgreSQL)
- **Auth:** Custom local auth (admin/employee) + Supabase auth (customers)
- **Storage:** AsyncStorage (replaces localStorage)
- **Run:** `npx expo start --web --port 5000`

## App Structure

```
app/                    # expo-router screens
  _layout.tsx           # Root Stack + all providers
  index.tsx             # Home
  login.tsx             # Login
  signup.tsx            # Signup
  profile.tsx           # Profile
  cart.tsx              # Cart
  checkout.tsx          # Checkout
  order-success.tsx     # Order confirmation
  shop/
    index.tsx           # Products list
    [id].tsx            # Product detail
  admin/
    index.tsx           # Admin dashboard
    banners.tsx         # Banner manager
    notifications.tsx   # Push notification sender
    products.tsx        # Product manager (CRUD)
    settings.tsx        # Password change + employee management
  employee/
    index.tsx           # Employee POS (record sales)

src/
  lib/          # Pure TS — supabase.ts, auth.ts, store.ts, types.ts
  context/      # AuthContext, CartContext, ThemeContext
  components/   # BottomNav, ProductCard, BackHeader, Spinner
  constants/
    colors.ts   # COLORS object + getThemeColors(isDark) helper
```

## Key Business Rules
- Brand color: `#E75480` (pink)
- Friday Sale: Rs. 10 off every product on Fridays (`isFriday()` in types.ts)
- Shipping: free over Rs. 2000, else Rs. 150
- Roles: `customer` (Supabase auth), `admin` / `employee` (local creds via `profiles` table)
- Supabase tables: `profiles`, `products`, `orders`, `order_items`, `app_banners`, `sales`, `push_tokens`

## Navigation Patterns
- `useNavigate` → `useRouter()` from expo-router; `router.push('/path')`; `router.back()`
- `useParams` → `useLocalSearchParams<{ id: string }>()`
- `confirm()` / `alert()` → `Alert.alert()` from react-native

## User Preferences
- Keep all Supabase logic (auth, store, types) in `src/lib/`
- Phone-width layout using RN StyleSheet — no Tailwind
- All theme colors centralized in `src/constants/colors.ts`
