import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { getProducts } from '../src/lib/store';
import { Product, isFriday } from '../src/lib/types';
import ProductCard from '../src/components/ProductCard';
import BottomNav from '../src/components/BottomNav';
import Spinner from '../src/components/Spinner';
import { COLORS, getThemeColors } from '../src/constants/colors';

const STATUS_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const tc = getThemeColors(isDark);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const friday = isFriday();

  useEffect(() => {
    getProducts()
      .then(prods => setProducts(prods))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const featured = products.slice(0, 6);
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  return (
    <View style={[styles.root, { backgroundColor: tc.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 90 }}>
        {/* Hero */}
        <View style={[styles.hero, { paddingTop: STATUS_TOP + 16 }]}>
          <View style={styles.heroBubble1} />
          <View style={styles.heroBubble2} />
          <View style={styles.heroBubble3} />
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroGreet}>
                {profile ? `Salam, ${profile.full_name.split(' ')[0]}! 👋` : 'Welcome to'}
              </Text>
              <Text style={styles.heroTitle}>Rena Henna 🌿</Text>
              <Text style={styles.heroSub}>Natural Beauty • Pure Henna Products</Text>
            </View>
            <TouchableOpacity onPress={toggleTheme} activeOpacity={0.7}>
              <Text style={{ fontSize: 24 }}>{theme === 'dark' ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => router.push('/shop')}
            activeOpacity={0.85}
          >
            <Text style={styles.shopBtnText}>Shop Now →</Text>
          </TouchableOpacity>
          {friday && (
            <View style={styles.fridayBanner}>
              <Text style={styles.fridayText}>🌟 Friday Special — Rs. 10 off on every product!</Text>
            </View>
          )}
        </View>

        <View style={styles.body}>
          {/* Categories */}
          {categories.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: tc.text }]}>Categories</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
                <TouchableOpacity
                  style={[styles.chip, styles.chipActive]}
                  onPress={() => router.push('/shop')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.chipActiveText}>All</Text>
                </TouchableOpacity>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.chip, { borderColor: isDark ? COLORS.borderDark : COLORS.borderLight, backgroundColor: tc.card }]}
                    onPress={() => router.push({ pathname: '/shop', params: { category: cat } } as any)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.chipText, { color: isDark ? COLORS.gray300 : COLORS.gray700 }]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Featured Products */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: tc.text }]}>Featured Products</Text>
              <TouchableOpacity onPress={() => router.push('/shop')} activeOpacity={0.7}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            {loading ? (
              <View style={styles.center}><Spinner /></View>
            ) : featured.length === 0 ? (
              <View style={styles.center}>
                <Text style={{ fontSize: 40, marginBottom: 8 }}>🌿</Text>
                <Text style={[styles.emptyText, { color: tc.textSec }]}>No products yet. Check back soon!</Text>
              </View>
            ) : (
              <View style={styles.grid}>
                {featured.map(p => (
                  <View key={p.id} style={styles.gridItem}>
                    <ProductCard product={p} />
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Bottom banner */}
          <TouchableOpacity
            style={[styles.bottomBanner, { backgroundColor: isDark ? COLORS.gray800 : COLORS.gray900 }]}
            onPress={() => router.push('/shop')}
            activeOpacity={0.9}
          >
            <Text style={styles.bottomBannerTitle}>🌟 Natural Henna • Premium Quality</Text>
            <Text style={styles.bottomBannerSub}>Explore all products →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingBottom: 28,
    overflow: 'hidden',
    position: 'relative',
  },
  heroBubble1: { position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.1)' },
  heroBubble2: { position: 'absolute', bottom: -40, left: -40, width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.1)' },
  heroBubble3: { position: 'absolute', top: 30, right: 60, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.1)' },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroGreet: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 4 },
  heroTitle: { color: '#fff', fontWeight: '900', fontSize: 30, fontStyle: 'italic', marginBottom: 4 },
  heroSub: { color: 'rgba(255,255,255,0.7)', fontSize: 11, letterSpacing: 0.5 },
  shopBtn: {
    marginTop: 18,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  shopBtnText: { color: COLORS.primary, fontWeight: '800', fontSize: 13 },
  fridayBanner: { marginTop: 12, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  fridayText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  body: { paddingHorizontal: 16, paddingTop: 20, gap: 24 },
  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 17, fontWeight: '800' },
  seeAll: { color: COLORS.primary, fontSize: 13, fontWeight: '700' },
  hScroll: { marginHorizontal: -2 },
  chip: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginRight: 8 },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 12, fontWeight: '600' },
  chipActiveText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  center: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 13 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: { width: '47%' },
  bottomBanner: { borderRadius: 16, padding: 20, alignItems: 'center' },
  bottomBannerTitle: { color: COLORS.yellow400, fontWeight: '800', fontSize: 14, marginBottom: 4 },
  bottomBannerSub: { color: 'rgba(255,255,255,0.6)', fontSize: 13 },
});
