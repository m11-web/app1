import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCart } from '../src/context/CartContext';
import { getCurrentPrice } from '../src/lib/types';
import { useTheme } from '../src/context/ThemeContext';
import BottomNav from '../src/components/BottomNav';
import { COLORS, getThemeColors } from '../src/constants/colors';

const STATUS_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

export default function CartScreen() {
  const router = useRouter();
  const { items, removeItem, updateQty, clearCart, totalPrice } = useCart();
  const { isDark } = useTheme();
  const tc = getThemeColors(isDark);
  const shipping = totalPrice >= 2000 ? 0 : 150;
  const total = totalPrice + shipping;

  if (items.length === 0) {
    return (
      <View style={[styles.emptyRoot, { backgroundColor: tc.card }]}>
        <Text style={{ fontSize: 72, marginBottom: 16 }}>🛒</Text>
        <Text style={[styles.emptyTitle, { color: tc.text }]}>Your cart is empty</Text>
        <Text style={[styles.emptySub, { color: tc.textSec }]}>Add products to get started</Text>
        <TouchableOpacity style={styles.browseBtn} onPress={() => router.push('/shop')} activeOpacity={0.85}>
          <Text style={styles.browseBtnText}>Browse Products</Text>
        </TouchableOpacity>
        <BottomNav />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: tc.bg }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: STATUS_TOP + 8, backgroundColor: tc.card, borderBottomColor: tc.border }]}>
        <Text style={[styles.headerTitle, { color: tc.text }]}>My Cart 🛒</Text>
        <TouchableOpacity
          onPress={() => Alert.alert('Clear Cart', 'Remove all items?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Clear', style: 'destructive', onPress: clearCart },
          ])}
          activeOpacity={0.7}
        >
          <Text style={{ color: COLORS.red500, fontSize: 14, fontWeight: '600' }}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {/* Items */}
        <View style={{ gap: 12, marginBottom: 16 }}>
          {items.map(item => {
            const price = getCurrentPrice(item.product);
            return (
              <View key={item.product.id} style={[styles.itemCard, { backgroundColor: tc.card }]}>
                <Image
                  source={{ uri: item.product.image_url || 'https://placehold.co/80x80/E75480/white?text=🌿' }}
                  style={styles.itemImage}
                  defaultSource={{ uri: 'https://placehold.co/80x80/E75480/white?text=🌿' }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.itemName, { color: tc.text }]} numberOfLines={2}>
                    {item.product.name}
                  </Text>
                  <Text style={styles.itemPrice}>Rs. {price}</Text>
                  <View style={styles.qtyRow}>
                    <TouchableOpacity
                      style={[styles.qtyBtn, { backgroundColor: isDark ? COLORS.gray700 : COLORS.gray100 }]}
                      onPress={() => updateQty(item.product.id, item.quantity - 1)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.qtyBtnText, { color: tc.text }]}>−</Text>
                    </TouchableOpacity>
                    <Text style={[styles.qtyValue, { color: tc.text }]}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={[styles.qtyBtn, { backgroundColor: isDark ? COLORS.gray700 : COLORS.gray100 }]}
                      onPress={() => updateQty(item.product.id, item.quantity + 1)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.qtyBtnText, { color: tc.text }]}>+</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ marginLeft: 'auto' }}
                      onPress={() => removeItem(item.product.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={{ fontSize: 20 }}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={[styles.lineTotal, { color: tc.text }]}>
                  Rs. {(price * item.quantity).toFixed(0)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Summary */}
        <View style={[styles.summary, { backgroundColor: tc.card }]}>
          <Text style={[styles.summaryTitle, { color: tc.text }]}>Order Summary</Text>
          <View style={{ gap: 10 }}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: tc.textSec }]}>Subtotal</Text>
              <Text style={[styles.summaryValue, { color: tc.text }]}>Rs. {totalPrice.toFixed(0)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: tc.textSec }]}>Shipping</Text>
              <Text style={[styles.summaryValue, { color: shipping === 0 ? COLORS.green500 : tc.text }]}>
                {shipping === 0 ? 'FREE 🎉' : `Rs. ${shipping}`}
              </Text>
            </View>
            {shipping > 0 && (
              <Text style={{ fontSize: 12, color: COLORS.gray400 }}>Free shipping on orders over Rs. 2000</Text>
            )}
            <View style={[styles.summaryRow, styles.totalRow, { borderTopColor: tc.border }]}>
              <Text style={[styles.totalLabel, { color: tc.text }]}>Total</Text>
              <Text style={styles.totalValue}>Rs. {total.toFixed(0)}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.checkoutBtn}
            onPress={() => router.push('/checkout')}
            activeOpacity={0.85}
          >
            <Text style={styles.checkoutBtnText}>Proceed to Checkout →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  emptyRoot: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, paddingBottom: 100 },
  emptyTitle: { fontSize: 20, fontWeight: '800', marginBottom: 6 },
  emptySub: { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  browseBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 16 },
  browseBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  itemCard: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  itemImage: { width: 80, height: 80, borderRadius: 12, resizeMode: 'cover', backgroundColor: COLORS.gray100 },
  itemName: { fontWeight: '700', fontSize: 13, lineHeight: 18, marginBottom: 4 },
  itemPrice: { color: COLORS.primary, fontWeight: '800', fontSize: 15, marginBottom: 8 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontWeight: '700', fontSize: 16, lineHeight: 20 },
  qtyValue: { fontWeight: '700', fontSize: 14, minWidth: 24, textAlign: 'center' },
  lineTotal: { fontWeight: '800', fontSize: 13, alignSelf: 'flex-start' },
  summary: { borderRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  summaryTitle: { fontSize: 16, fontWeight: '800', marginBottom: 14 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontSize: 13 },
  summaryValue: { fontSize: 13, fontWeight: '600' },
  totalRow: { borderTopWidth: 1, paddingTop: 12, marginTop: 4 },
  totalLabel: { fontSize: 16, fontWeight: '800' },
  totalValue: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  checkoutBtn: { marginTop: 18, backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 16, alignItems: 'center', shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  checkoutBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
