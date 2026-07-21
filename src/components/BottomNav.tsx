import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useCart } from '../context/CartContext';
import { COLORS } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';

const tabs = [
  { path: '/', emoji: '🏠', label: 'Home' },
  { path: '/shop', emoji: '🛍️', label: 'Shop' },
  { path: '/cart', emoji: '🛒', label: 'Cart', hasBadge: true },
  { path: '/profile', emoji: '👤', label: 'Profile' },
] as const;

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { totalItems } = useCart();
  const { isDark } = useTheme();

  const bg = isDark ? COLORS.cardDark : COLORS.cardLight;
  const borderColor = isDark ? COLORS.borderDark : COLORS.borderLight;

  return (
    <View style={[styles.container, { backgroundColor: bg, borderTopColor: borderColor }]}>
      {tabs.map(tab => {
        const active =
          pathname === tab.path ||
          (tab.path === '/shop' && pathname.startsWith('/shop'));
        const badge = tab.hasBadge ? totalItems : 0;

        return (
          <TouchableOpacity
            key={tab.path}
            onPress={() => router.push(tab.path as any)}
            style={styles.tab}
            activeOpacity={0.7}
          >
            {/* Icon container with fixed height so badge never overlaps siblings */}
            <View style={styles.iconWrap}>
              <Text style={styles.emoji}>{tab.emoji}</Text>
              {!!badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.label, { color: active ? COLORS.primary : (isDark ? COLORS.textSecDark : COLORS.gray400) }]}>
              {tab.label}
            </Text>
            {active && <View style={[styles.activeLine, { backgroundColor: COLORS.primary }]} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    // Ensure the nav always sits on top and nothing clips it
    overflow: 'visible',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
    position: 'relative',
  },
  // Fixed-size box so the badge floats inside without affecting layout
  iconWrap: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    // overflow visible so badge shows above
    overflow: 'visible',
  },
  emoji: {
    fontSize: 20,
    lineHeight: 24,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: COLORS.primary,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.cardDark,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
  },
  activeLine: {
    position: 'absolute',
    bottom: 0,
    width: 24,
    height: 3,
    borderRadius: 2,
  },
});
