import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getProductById } from '../../src/lib/store';
import { Product, getCurrentPrice, getDiscountedPrice, isFriday } from '../../src/lib/types';
import { useCart } from '../../src/context/CartContext';
import { useTheme } from '../../src/context/ThemeContext';
import Spinner from '../../src/components/Spinner';
import { COLORS, getThemeColors } from '../../src/constants/colors';

const PLACEHOLDER = 'https://placehold.co/400x400/E75480/white?text=🌿';
const STATUS_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addItem, items } = useCart();
  const { isDark } = useTheme();
  const tc = getThemeColors(isDark);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState('');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!id) return;
    getProductById(id)
      .then(p => { setProduct(p); if (p) setSelectedImg(p.image_url); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <View style={[styles.center, { backgroundColor: tc.bg }]}><Spinner /></View>;
  }

  if (!product) {
    return (
      <View style={[styles.center, { backgroundColor: tc.bg, gap: 12 }]}>
        <Text style={{ fontSize: 48 }}>😔</Text>
        <Text style={[styles.notFoundText, { color: tc.text }]}>Product not found</Text>
        <TouchableOpacity onPress={() => router.push('/shop')} activeOpacity={0.7}>
          <Text style={{ color: COLORS.primary, fontWeight: '600', fontSize: 14 }}>← Back to Shop</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const price = getCurrentPrice(product);
  const hasDiscount = product.discount_percent > 0;
  const friday = isFriday();
  const outOfStock = product.stock_quantity === 0;
  const allImages = [product.image_url, ...(product.images || [])].filter(Boolean);
  const cartItem = items.find(i => i.product.id === product.id);

  const handleAdd = () => {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const stockStatus = outOfStock
    ? { bg: '#fef2f2', text: '#ef4444', label: 'Out of Stock' }
    : product.stock_quantity <= 5
    ? { bg: '#fff7ed', text: '#f97316', label: `Only ${product.stock_quantity} left!` }
    : { bg: '#f0fdf4', text: '#16a34a', label: 'In Stock' };

  return (
    <View style={[styles.root, { backgroundColor: tc.card }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: selectedImg || product.image_url || PLACEHOLDER }}
            style={styles.mainImage}
            defaultSource={{ uri: PLACEHOLDER }}
          />
          {/* Back btn */}
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(31,41,55,0.9)' : 'rgba(255,255,255,0.9)' }]}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={[{ fontSize: 18, fontWeight: '700' }, { color: tc.text }]}>←</Text>
          </TouchableOpacity>
          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{friday ? '🌟 FRIDAY' : `-${product.discount_percent}%`}</Text>
            </View>
          )}
        </View>

        {/* Thumbnail strip */}
        {allImages.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={[styles.thumbStrip, { backgroundColor: tc.card }]}
            contentContainerStyle={styles.thumbContent}
          >
            {allImages.map((img, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setSelectedImg(img)}
                style={[styles.thumb, { borderColor: selectedImg === img ? COLORS.primary : 'transparent' }]}
                activeOpacity={0.8}
              >
                <Image source={{ uri: img }} style={styles.thumbImg} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Info */}
        <View style={styles.infoSection}>
          {friday && (
            <View style={styles.fridayBanner}>
              <Text style={{ color: '#a16207', fontSize: 13, fontWeight: '700' }}>🌟 Friday Sale Active!</Text>
            </View>
          )}

          <Text style={[styles.category, { color: tc.textSec }]}>{product.category}</Text>
          <Text style={[styles.productName, { color: tc.text }]}>{product.name}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>Rs. {price}</Text>
            {hasDiscount && (
              <>
                <Text style={styles.originalPrice}>Rs. {product.retail_price}</Text>
                <View style={styles.discountPill}>
                  <Text style={styles.discountPillText}>{product.discount_percent}% OFF</Text>
                </View>
              </>
            )}
          </View>

          <View style={[styles.stockBadge, { backgroundColor: stockStatus.bg }]}>
            <View style={[styles.stockDot, { backgroundColor: stockStatus.text }]} />
            <Text style={[styles.stockText, { color: stockStatus.text }]}>{stockStatus.label}</Text>
          </View>

          {!!product.description && (
            <View style={{ marginTop: 12 }}>
              <Text style={[styles.descTitle, { color: tc.text }]}>Description</Text>
              <Text style={[styles.desc, { color: tc.textSec }]}>{product.description}</Text>
            </View>
          )}

          {!outOfStock && (
            <View style={styles.qtyRow}>
              <Text style={[styles.qtyLabel, { color: tc.textSec }]}>Quantity</Text>
              <View style={styles.qtyControls}>
                <TouchableOpacity
                  style={[styles.qtyBtn, { backgroundColor: isDark ? COLORS.gray800 : COLORS.gray100 }]}
                  onPress={() => setQty(q => Math.max(1, q - 1))}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.qtyBtnText, { color: tc.text }]}>−</Text>
                </TouchableOpacity>
                <Text style={[styles.qtyValue, { color: tc.text }]}>{qty}</Text>
                <TouchableOpacity
                  style={[styles.qtyBtn, { backgroundColor: isDark ? COLORS.gray800 : COLORS.gray100 }]}
                  onPress={() => setQty(q => Math.min(product.stock_quantity, q + 1))}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.qtyBtnText, { color: tc.text }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {!!cartItem && (
            <Text style={{ color: COLORS.primary, fontSize: 12, fontWeight: '600', marginTop: 4 }}>
              ✓ {cartItem.quantity} already in cart
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Bottom action */}
      <View style={[styles.bottomBar, { backgroundColor: tc.card, borderTopColor: tc.border }]}>
        <TouchableOpacity
          style={[styles.viewCartBtn, { borderColor: COLORS.primary }]}
          onPress={() => router.push('/cart')}
          activeOpacity={0.85}
        >
          <Text style={styles.viewCartText}>
            View Cart {items.length > 0 && `(${items.reduce((s, i) => s + i.quantity, 0)})`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.addCartBtn,
            outOfStock && { backgroundColor: isDark ? COLORS.gray700 : COLORS.gray200 },
            added && { backgroundColor: COLORS.green500 },
          ]}
          onPress={handleAdd}
          disabled={outOfStock}
          activeOpacity={0.85}
        >
          <Text style={[styles.addCartText, outOfStock && { color: COLORS.gray400 }]}>
            {outOfStock ? 'Out of Stock' : added ? '✓ Added!' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontSize: 16, fontWeight: '700' },
  imageContainer: { position: 'relative' },
  mainImage: { width: '100%', aspectRatio: 1, resizeMode: 'cover' },
  backBtn: {
    position: 'absolute',
    top: STATUS_TOP + 8,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  discountBadge: {
    position: 'absolute',
    top: STATUS_TOP + 8,
    right: 16,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  discountText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  thumbStrip: { borderBottomWidth: 0 },
  thumbContent: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  thumb: { width: 56, height: 56, borderRadius: 12, overflow: 'hidden', borderWidth: 2 },
  thumbImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  infoSection: { paddingHorizontal: 20, paddingTop: 16, gap: 8 },
  fridayBanner: { backgroundColor: '#fefce8', borderWidth: 1, borderColor: '#fde68a', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  category: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8 },
  productName: { fontSize: 20, fontWeight: '800', lineHeight: 27 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  price: { color: COLORS.primary, fontWeight: '900', fontSize: 28 },
  originalPrice: { color: COLORS.gray400, fontSize: 15, textDecorationLine: 'line-through' },
  discountPill: { backgroundColor: 'rgba(231,84,128,0.1)', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  discountPillText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  stockBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  stockDot: { width: 6, height: 6, borderRadius: 3 },
  stockText: { fontSize: 12, fontWeight: '700' },
  descTitle: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  desc: { fontSize: 13, lineHeight: 20 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 4 },
  qtyLabel: { fontSize: 14, fontWeight: '600' },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  qtyBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontSize: 20, fontWeight: '700', lineHeight: 24 },
  qtyValue: { fontSize: 18, fontWeight: '800', minWidth: 30, textAlign: 'center' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 16, borderTopWidth: 1 },
  viewCartBtn: { flex: 1, paddingVertical: 14, borderRadius: 16, borderWidth: 2, alignItems: 'center' },
  viewCartText: { color: COLORS.primary, fontWeight: '800', fontSize: 14 },
  addCartBtn: { flex: 1, backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 16, alignItems: 'center', shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 },
  addCartText: { color: '#fff', fontWeight: '800', fontSize: 14 },
});
