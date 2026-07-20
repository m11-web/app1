import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/context/ThemeContext';
import { COLORS, getThemeColors } from '../src/constants/colors';

export default function OrderSuccessScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const tc = getThemeColors(isDark);
  const [count, setCount] = useState(5);
  const bounce = new Animated.Value(1);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: 1.12, duration: 500, useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    ).start();

    const t = setInterval(() => {
      setCount(c => {
        if (c <= 1) { clearInterval(t); router.replace('/'); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: tc.card }]}>
      <Animated.View style={[styles.iconWrap, { transform: [{ scale: bounce }] }]}>
        <Text style={{ fontSize: 52 }}>✅</Text>
      </Animated.View>
      <Text style={[styles.title, { color: tc.text }]}>Order Placed!</Text>
      <Text style={[styles.sub, { color: tc.textSec }]}>
        Thank you for your order! We'll contact you on WhatsApp to confirm delivery.
      </Text>
      <Text style={[styles.redirect, { color: COLORS.gray400 }]}>
        Redirecting in {count}s...
      </Text>

      <View style={styles.btnGroup}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.replace('/')} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>Back to Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.secondaryBtn, { borderColor: COLORS.primary }]}
          onPress={() => router.push('/shop')}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryBtnText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  iconWrap: { width: 96, height: 96, backgroundColor: '#dcfce7', borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  title: { fontSize: 26, fontWeight: '900', marginBottom: 12 },
  sub: { fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 8 },
  redirect: { fontSize: 13, marginBottom: 40 },
  btnGroup: { width: '100%', gap: 12 },
  primaryBtn: { backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 16, alignItems: 'center', shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  secondaryBtn: { borderWidth: 2, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  secondaryBtnText: { color: COLORS.primary, fontWeight: '800', fontSize: 15 },
});
