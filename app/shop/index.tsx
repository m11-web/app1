import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getProducts } from '../../src/lib/store';
import { Product } from '../../src/lib/types';
import ProductCard from '../../src/components/ProductCard';
import BottomNav from '../../src/components/BottomNav';
import Spinner from '../../src/components/Spinner';
import { COLORS, getThemeColors } from '../../src/constants/colors';
import { useTheme } from '../../src/context/ThemeContext';

const STATUS_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

export default function ShopScreen() {
  const { category: queryCategory } = useLocalSearchParams<{ category?: string }>();
  const { isDark } = useTheme();
  const tc = getThemeColors(isDark);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [netError, setNetError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState(queryCategory || '');

  const loadProducts = () => {
    setLoading(true);
    setNetError(false);
    getProducts()
      .then(setProducts)
      .catch(() => setNetError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadProducts(); }, []);

  useEffect(() => { setSelectedCat(queryCategory || ''); }, [queryCategory]);

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  const filtered = products.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q);
    const matchCat = !selectedCat || p.category === selectedCat;
    return matchSearch && matchCat;
  });

  return (
    <View style={[styles.root, { backgroundColor: tc.bg }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: STATUS_TOP + 8 }]}>
        <Text style={styles.headerTitle}>Shop 🛍️</Text>
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: tc.text, backgroundColor: isDark ? COLORS.gray800 : '#fff' }]}
            placeholder="Search products..."
            placeholderTextColor={COLORS.gray400}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Category chips — sticky */}
      <View style={[styles.chipsBar, { backgroundColor: tc.card, borderBottomColor: tc.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContent}>
          <TouchableOpacity
            style={[styles.chip, !selectedCat && styles.chipActive, selectedCat && { borderColor: tc.border, backgroundColor: tc.card }]}
            onPress={() => setSelectedCat('')}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipText, !selectedCat && styles.chipActiveText, !!selectedCat && { color: isDark ? COLORS.gray300 : COLORS.gray600 }]}>All</Text>
          </TouchableOpacity>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, selectedCat === cat && styles.chipActive, selectedCat !== cat && { borderColor: tc.border, backgroundColor: tc.card }]}
              onPress={() => setSelectedCat(cat === selectedCat ? '' : cat)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, selectedCat === cat && styles.chipActiveText, selectedCat !== cat && { color: isDark ? COLORS.gray300 : COLORS.gray600 }]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {loading ? (
          <View style={styles.center}><Spinner /></View>
        ) : netError ? (
          <View style={styles.center}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📡</Text>
            <Text style={[styles.emptyTitle, { color: tc.text }]}>Connection Error</Text>
            <Text style={[styles.emptySub, { color: tc.textSec }]}>Check your internet and try again</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={loadProducts} activeOpacity={0.8}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.center}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>😔</Text>
            <Text style={[styles.emptyTitle, { color: tc.text }]}>No products found</Text>
            <Text style={[styles.emptySub, { color: tc.textSec }]}>Try a different search or category</Text>
          </View>
        ) : (
          <>
            <Text style={[styles.count, { color: COLORS.gray400 }]}>
              {filtered.length} product{filtered.length !== 1 ? 's' : ''}
            </Text>
            <View style={styles.grid}>
              {filtered.map(p => (
                <View key={p.id} style={styles.gridItem}>
                  <ProductCard product={p} />
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingBottom: 18 },
  headerTitle: { color: '#fff', fontWeight: '900', fontSize: 24, marginBottom: 14 },
  searchWrap: { position: 'relative', justifyContent: 'center' },
  searchIcon: { position: 'absolute', left: 12, zIndex: 1, fontSize: 14 },
  searchInput: { borderRadius: 16, paddingLeft: 36, paddingRight: 14, paddingVertical: 11, fontSize: 14 },
  chipsBar: { borderBottomWidth: 1, paddingVertical: 10 },
  chipsContent: { paddingHorizontal: 16, gap: 8 },
  chip: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 12, fontWeight: '700' },
  chipActiveText: { color: '#fff' },
  center: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  emptySub: { fontSize: 13, marginBottom: 16 },
  retryBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 28, paddingVertical: 11, borderRadius: 20 },
  retryBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  count: { fontSize: 12, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: { width: '47%' },
});
