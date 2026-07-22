import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Product, getCurrentPrice, isFriday } from '../lib/types';
import { useCart } from '../context/CartContext';
import { COLORS } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';

const PLACEHOLDER = 'https://placehold.co/300x200/E75480/white?text=🌿';

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();
  const { isDark } = useTheme();
  const price = getCurrentPrice(product);
  const hasDiscount = product.discount_percent > 0;
  const outOfStock = product.stock_quantity === 0;
  const friday = isFriday();

  const cardBg = isDark ? COLORS.cardDark : COLORS.cardLight;
  const borderColor = isDark ? COLORS.borderDark : COLORS.borderLight;
  const textColor = isDark ? COLORS.textDark : COLORS.textLight;
  const catColor = isDark ? COLORS.gray500 : COLORS.gray400;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: cardBg, borderColor }]}
      onPress={() => router.push(`/shop/${product.id}` as any)}
      activeOpacity={0.92}
    >
      <View style={[styles.imageWrap, { backgroundColor: isDark ? '#1f2937' : '#f5f5f5' }]}>
        <Image
          source={{ uri: product.image_url || PLACEHOLDER }}
          style={styles.image}
          defaultSource={{ uri: PLACEHOLDER }}
        />
        {hasDiscount && !outOfStock && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              {friday ? '🌟 FRI' : `-${product.discount_percent}%`}
            </Text>
          </View>
        )}
        {outOfStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={[styles.category, { color: catColor }]}>{product.category}</Text>
        <Text style={[styles.name, { color: textColor }]} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>Rs. {price}</Text>
          {hasDiscount && (
            <Text style={styles.originalPrice}>Rs. {product.retail_price}</Text>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.addBtn,
            outOfStock && styles.addBtnDisabled,
          ]}
          onPress={() => { if (!outOfStock) addItem(product); }}
          disabled={outOfStock}
          activeOpacity={0.8}
        >
          <Text style={[styles.addBtnText, outOfStock && styles.addBtnTextDisabled]}>
            {outOfStock ? 'Out of Stock' : '+ Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  imageWrap: {
    position: 'relative',
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    resizeMode: 'contain',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  outOfStockOverlay: {
    position: 'absolute',
    inset: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  info: {
    padding: 12,
  },
  category: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  name: {
    fontWeight: '700',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  price: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 15,
  },
  originalPrice: {
    color: COLORS.gray400,
    fontSize: 11,
    textDecorationLine: 'line-through',
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  addBtnDisabled: {
    backgroundColor: COLORS.gray100,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  addBtnTextDisabled: {
    color: COLORS.gray400,
  },
});
