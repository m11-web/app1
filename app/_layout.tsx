import 'react-native-url-polyfill/auto';
import React, { useState } from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider } from '../src/context/ThemeContext';
import { AuthProvider } from '../src/context/AuthContext';
import { CartProvider } from '../src/context/CartContext';
import AppSplash from '../src/components/AppSplash';

export default function RootLayout() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Stack screenOptions={{ headerShown: false }} />
          {!splashDone && <AppSplash onDone={() => setSplashDone(true)} />}
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
