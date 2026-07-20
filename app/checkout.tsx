import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCart } from '../src/context/CartContext';
import { useAuth } from '../src/context/AuthContext';
import { placeOrder } from '../src/lib/store';
import { getCurrentPrice } from '../src/lib/types';
import { useTheme } from '../src/context/ThemeContext';
import BackHeader from '../src/components/BackHeader';
import Spinner from '../src/components/Spinner';
import { COLORS, getThemeColors } from '../src/constants/colors';

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, clearCart, totalPrice } = useCart();
  const { profile } = useAuth();
  const { isDark } = useTheme();
  const tc = getThemeColors(isDark);

  const [name, setName] = useState(profile?.full_name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [payMethod, setPayMethod] = useState<'cod' | 'bank'>('cod');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const shipping = totalPrice >= 2000 ? 0 : 150;
  const total = totalPrice + shipping;

  if (items.length === 0) {
    router.replace('/cart');
    return null;
  }

  const handleOrder = async () => {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError('Please fill all required fields.'); return;
    }
    setError('');
    setLoading(true);
    try {
      await placeOrder(
        {
          customer_name: name.trim(),
          customer_email: profile?.email || email.trim() || 'guest',
          whatsapp_number: phone.trim(),
          address: address.trim(),
          payment_method: payMethod,
          shipping_type: 'Standard',
          shipping_fee: shipping,
          subtotal: totalPrice,
          total,
          status: 'pending',
        },
        items.map(i => ({
          product_id: i.product.id,
          product_name: i.product.name,
          quantity: i.quantity,
          unit_price: getCurrentPrice(i.product),
          manufacturing_price: i.product.manufacturing_price,
        }))
      );
      clearCart();
      router.replace('/order-success');
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = [styles.input, { backgroundColor: tc.inputBg, borderColor: tc.border, color: tc.text }];
  const cardStyle = [styles.card, { backgroundColor: tc.card }];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.root, { backgroundColor: tc.bg }]}>
        <BackHeader title="Checkout" />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

          {/* Guest notice */}
          {!profile && (
            <View style={[styles.notice, { borderColor: '#fde68a' }]}>
              <Text style={{ color: '#a16207', fontSize: 13 }}>
                💡 <Text style={{ fontWeight: '700' }} onPress={() => router.push('/login')}>Sign in</Text> to save your order history.
              </Text>
            </View>
          )}

          {/* Delivery details */}
          <View style={cardStyle}>
            <Text style={[styles.sectionTitle, { color: tc.text }]}>Delivery Details</Text>
            <View style={{ gap: 14, marginTop: 14 }}>
              <View>
                <Text style={[styles.label, { color: tc.textSec }]}>Full Name *</Text>
                <TextInput style={inputStyle} placeholder="Your full name" placeholderTextColor={COLORS.gray400} value={name} onChangeText={setName} />
              </View>
              {!profile && (
                <View>
                  <Text style={[styles.label, { color: tc.textSec }]}>Email Address</Text>
                  <TextInput style={inputStyle} placeholder="your@email.com" placeholderTextColor={COLORS.gray400} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                </View>
              )}
              <View>
                <Text style={[styles.label, { color: tc.textSec }]}>WhatsApp Number *</Text>
                <TextInput style={inputStyle} placeholder="03XX-XXXXXXX" placeholderTextColor={COLORS.gray400} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              </View>
              <View>
                <Text style={[styles.label, { color: tc.textSec }]}>Full Address *</Text>
                <TextInput style={[inputStyle, { height: 80, textAlignVertical: 'top' }]} placeholder="Street, city, province" placeholderTextColor={COLORS.gray400} value={address} onChangeText={setAddress} multiline numberOfLines={3} />
              </View>
            </View>
          </View>

          {/* Payment method */}
          <View style={cardStyle}>
            <Text style={[styles.sectionTitle, { color: tc.text }]}>Payment Method</Text>
            <View style={styles.payGrid}>
              {(['cod', 'bank'] as const).map(method => (
                <TouchableOpacity
                  key={method}
                  onPress={() => setPayMethod(method)}
                  style={[styles.payOption, { borderColor: payMethod === method ? COLORS.primary : tc.border, backgroundColor: payMethod === method ? 'rgba(231,84,128,0.05)' : tc.inputBg }]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.payText, { color: payMethod === method ? COLORS.primary : tc.textSec }]}>
                    {method === 'cod' ? '💵 Cash on Delivery' : '🏦 Bank Transfer'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {payMethod === 'bank' && (
              <View style={[styles.bankInfo, { backgroundColor: isDark ? 'rgba(59,130,246,0.1)' : '#eff6ff' }]}>
                <Text style={[styles.bankTitle, { color: isDark ? '#93c5fd' : '#1d4ed8' }]}>Bank Details</Text>
                <Text style={[styles.bankText, { color: isDark ? '#93c5fd' : '#1d4ed8' }]}>Account: Rena Henna</Text>
                <Text style={[styles.bankText, { color: isDark ? '#93c5fd' : '#1d4ed8' }]}>Please send screenshot on WhatsApp after transfer.</Text>
              </View>
            )}
          </View>

          {/* Order summary */}
          <View style={cardStyle}>
            <Text style={[styles.sectionTitle, { color: tc.text }]}>Order Summary</Text>
            <View style={{ gap: 8, marginTop: 12 }}>
              {items.map(item => (
                <View key={item.product.id} style={styles.summaryRow}>
                  <Text style={[styles.summaryItemName, { color: tc.textSec }]} numberOfLines={1}>
                    {item.product.name} × {item.quantity}
                  </Text>
                  <Text style={[styles.summaryItemPrice, { color: tc.text }]}>
                    Rs. {(getCurrentPrice(item.product) * item.quantity).toFixed(0)}
                  </Text>
                </View>
              ))}
            </View>
            <View style={[styles.divider, { borderTopColor: tc.border }]}>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: tc.textSec }]}>Subtotal</Text>
                <Text style={[styles.summaryValue, { color: tc.text }]}>Rs. {totalPrice.toFixed(0)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: tc.textSec }]}>Shipping</Text>
                <Text style={[styles.summaryValue, { color: shipping === 0 ? COLORS.green500 : tc.text }]}>
                  {shipping === 0 ? 'FREE' : `Rs. ${shipping}`}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.totalLabel, { color: tc.text }]}>Total</Text>
                <Text style={styles.totalValue}>Rs. {total.toFixed(0)}</Text>
              </View>
            </View>
          </View>

          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.placeOrderBtn, loading && { opacity: 0.6 }]}
            onPress={handleOrder}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <Spinner size={20} color="#fff" />
              : <Text style={styles.placeOrderBtnText}>Place Order • Rs. {total.toFixed(0)}</Text>
            }
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  notice: { backgroundColor: '#fefce8', borderWidth: 1, borderRadius: 12, padding: 14 },
  card: { borderRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  sectionTitle: { fontSize: 15, fontWeight: '800' },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14 },
  payGrid: { flexDirection: 'row', gap: 12, marginTop: 14 },
  payOption: { flex: 1, borderWidth: 2, borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  payText: { fontWeight: '700', fontSize: 13, textAlign: 'center' },
  bankInfo: { marginTop: 12, borderRadius: 12, padding: 14 },
  bankTitle: { fontWeight: '700', fontSize: 14, marginBottom: 4 },
  bankText: { fontSize: 13 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryItemName: { flex: 1, fontSize: 13, marginRight: 12 },
  summaryItemPrice: { fontSize: 13, fontWeight: '600' },
  summaryLabel: { fontSize: 13 },
  summaryValue: { fontSize: 13, fontWeight: '600' },
  totalLabel: { fontSize: 15, fontWeight: '800' },
  totalValue: { fontSize: 15, fontWeight: '800', color: COLORS.primary },
  divider: { borderTopWidth: 1, marginTop: 10, paddingTop: 10, gap: 8 },
  errorBox: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 12, padding: 14 },
  errorText: { color: COLORS.red500, fontSize: 13 },
  placeOrderBtn: { backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 18, alignItems: 'center', shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  placeOrderBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
