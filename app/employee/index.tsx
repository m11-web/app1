import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { getProducts, recordSale } from '../../src/lib/store';
import { Product, SaleType, getCurrentPrice } from '../../src/lib/types';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import Spinner from '../../src/components/Spinner';
import { COLORS, getThemeColors } from '../../src/constants/colors';
import { useRouter } from 'expo-router';

const STATUS_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

export default function EmployeeDashboard() {
  const router = useRouter();
  const { profile } = useAuth();
  const { isDark } = useTheme();
  const tc = getThemeColors(isDark);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Product | null>(null);
  const [saleType, setSaleType] = useState<SaleType>('retail');
  const [qty, setQty] = useState(1);
  const [customPrice, setCustomPrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [searchQ, setSearchQ] = useState('');

  useEffect(() => {
    getProducts().then(setProducts).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = products.filter(p =>
    !searchQ ||
    p.name.toLowerCase().includes(searchQ.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(searchQ.toLowerCase())
  );

  const getPrice = () => {
    if (!selected) return 0;
    if (customPrice) return parseFloat(customPrice) || 0;
    return saleType === 'wholesale' ? selected.wholesale_price : getCurrentPrice(selected);
  };

  const handleRecord = async () => {
    if (!selected) return;
    const price = getPrice();
    if (!price || price <= 0) {
      Alert.alert('Error', 'Invalid price');
      return;
    }
    setSaving(true);
    try {
      await recordSale({
        product_id: selected.id,
        product_name: selected.name,
        quantity: qty,
        unit_price: price,
        manufacturing_price: selected.manufacturing_price,
        profit: (price - selected.manufacturing_price) * qty,
        sale_type: saleType,
        sold_by: profile?.id || null,
      });
      setSuccess(`✅ Sale recorded! ${selected.name} × ${qty} @ Rs. ${price}`);
      setSelected(null);
      setQty(1);
      setCustomPrice('');
      setTimeout(() => setSuccess(''), 4000);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to record sale');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = [styles.input, { backgroundColor: tc.inputBg, borderColor: tc.border, color: tc.text }];

  return (
    <View style={[styles.root, { backgroundColor: tc.bg }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: STATUS_TOP + 8 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Employee Dashboard</Text>
          <Text style={styles.headerSub}>Hi, {profile?.full_name || 'Employee'} 👋</Text>
        </View>
      </View>

      {!!success && (
        <View style={[styles.successBanner, { backgroundColor: isDark ? 'rgba(22,163,74,0.15)' : '#f0fdf4', borderColor: isDark ? '#15803d' : '#bbf7d0' }]}>
          <Text style={{ color: '#15803d', fontSize: 14, fontWeight: '600' }}>{success}</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.center}><Spinner /></View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}>
          {/* Search */}
          <View style={styles.searchWrap}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={[inputStyle, styles.searchInput]}
              placeholder="Search products..."
              placeholderTextColor={COLORS.gray400}
              value={searchQ}
              onChangeText={setSearchQ}
            />
          </View>

          <Text style={[styles.sectionTitle, { color: tc.text }]}>Select Product to Record Sale</Text>

          <View style={{ gap: 8 }}>
            {filtered.map(p => {
              const isSelected = selected?.id === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.productRow,
                    { backgroundColor: isSelected ? COLORS.primary : tc.card },
                  ]}
                  onPress={() => { setSelected(p); setQty(1); setCustomPrice(''); setSaleType('retail'); }}
                  activeOpacity={0.85}
                >
                  {p.image_url ? (
                    <Image source={{ uri: p.image_url }} style={styles.productImage} />
                  ) : (
                    <View style={[styles.productImagePlaceholder, { backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : tc.inputBg }]}>
                      <Text style={{ fontSize: 20 }}>📦</Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.productName, { color: isSelected ? '#fff' : tc.text }]} numberOfLines={1}>{p.name}</Text>
                    <Text style={[styles.productCat, { color: isSelected ? 'rgba(255,255,255,0.7)' : tc.textSec }]}>{p.category}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.productPrice, { color: isSelected ? '#fff' : COLORS.primary }]}>
                      Rs. {getCurrentPrice(p)}
                    </Text>
                    <Text style={[styles.productStock, { color: isSelected ? 'rgba(255,255,255,0.6)' : COLORS.gray400 }]}>
                      Stock: {p.stock_quantity}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* Sale Modal */}
      <Modal visible={!!selected} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setSelected(null)} activeOpacity={1} />
          <View style={[styles.modalSheet, { backgroundColor: tc.card }]}>
            <View style={styles.modalTop}>
              <View>
                <Text style={[styles.modalTitle, { color: tc.text }]}>Record Sale</Text>
                <Text style={[styles.modalSub, { color: tc.textSec }]}>{selected?.name}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelected(null)}>
                <Text style={{ fontSize: 22, color: COLORS.gray400 }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }} keyboardShouldPersistTaps="handled">
              {/* Sale Type */}
              <View>
                <Text style={[styles.fieldLabel, { color: tc.textSec }]}>Sale Type</Text>
                <View style={styles.saleTypeGrid}>
                  {(['retail', 'wholesale'] as const).map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.saleTypeBtn, { borderColor: saleType === type ? COLORS.purple500 : tc.border, backgroundColor: saleType === type ? (isDark ? 'rgba(168,85,247,0.1)' : '#faf5ff') : tc.inputBg }]}
                      onPress={() => setSaleType(type)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.saleTypeBtnText, { color: saleType === type ? COLORS.purple500 : tc.textSec }]}>
                        {type === 'retail' ? '🏪 Retail' : '📦 Wholesale'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Quantity */}
              <View>
                <Text style={[styles.fieldLabel, { color: tc.textSec }]}>Quantity</Text>
                <View style={styles.qtyRow}>
                  <TouchableOpacity style={[styles.qtyBtn, { backgroundColor: isDark ? COLORS.gray700 : COLORS.gray100 }]} onPress={() => setQty(q => Math.max(1, q - 1))} activeOpacity={0.7}>
                    <Text style={[styles.qtyBtnText, { color: tc.text }]}>−</Text>
                  </TouchableOpacity>
                  <Text style={[styles.qtyValue, { color: tc.text }]}>{qty}</Text>
                  <TouchableOpacity style={[styles.qtyBtn, { backgroundColor: isDark ? COLORS.gray700 : COLORS.gray100 }]} onPress={() => setQty(q => q + 1)} activeOpacity={0.7}>
                    <Text style={[styles.qtyBtnText, { color: tc.text }]}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Custom Price */}
              <View>
                <Text style={[styles.fieldLabel, { color: tc.textSec }]}>
                  Price per unit (leave empty for default: Rs. {selected ? (saleType === 'wholesale' ? selected.wholesale_price : getCurrentPrice(selected)) : 0})
                </Text>
                <TextInput
                  style={inputStyle}
                  keyboardType="numeric"
                  placeholder={`Default: Rs. ${selected ? (saleType === 'wholesale' ? selected.wholesale_price : getCurrentPrice(selected)) : 0}`}
                  placeholderTextColor={COLORS.gray400}
                  value={customPrice}
                  onChangeText={setCustomPrice}
                />
              </View>

              {/* Summary */}
              <View style={[styles.summaryBox, { backgroundColor: isDark ? COLORS.gray700 : COLORS.gray100 }]}>
                <View style={styles.summaryRow}><Text style={[styles.summaryLabel, { color: tc.textSec }]}>Price</Text><Text style={[styles.summaryValue, { color: tc.text }]}>Rs. {getPrice()}</Text></View>
                <View style={styles.summaryRow}><Text style={[styles.summaryLabel, { color: tc.textSec }]}>Qty</Text><Text style={[styles.summaryValue, { color: tc.text }]}>× {qty}</Text></View>
                <View style={styles.summaryRow}><Text style={[styles.totalLabel, { color: tc.text }]}>Total</Text><Text style={styles.totalValue}>Rs. {(getPrice() * qty).toFixed(0)}</Text></View>
              </View>

              <View style={styles.modalBtns}>
                <TouchableOpacity style={[styles.cancelBtn, { borderColor: tc.border }]} onPress={() => setSelected(null)} activeOpacity={0.8}>
                  <Text style={[{ fontWeight: '700', fontSize: 14 }, { color: tc.textSec }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.recordBtn, saving && { opacity: 0.6 }]} onPress={handleRecord} disabled={saving} activeOpacity={0.85}>
                  {saving ? <Spinner size={18} color="#fff" /> : <Text style={styles.recordBtnText}>Record Sale</Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingBottom: 18, flexDirection: 'row', alignItems: 'center', gap: 14 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  backArrow: { color: '#fff', fontWeight: '700', fontSize: 18 },
  headerTitle: { color: '#fff', fontWeight: '900', fontSize: 20 },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  successBanner: { marginHorizontal: 16, marginTop: 10, borderRadius: 16, padding: 14, borderWidth: 1 },
  searchWrap: { position: 'relative', justifyContent: 'center' },
  searchIcon: { position: 'absolute', left: 14, zIndex: 1, fontSize: 14 },
  searchInput: { paddingLeft: 38 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 11, fontSize: 14 },
  sectionTitle: { fontSize: 15, fontWeight: '800' },
  productRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  productImage: { width: 48, height: 48, borderRadius: 10, resizeMode: 'cover' },
  productImagePlaceholder: { width: 48, height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  productName: { fontWeight: '700', fontSize: 14 },
  productCat: { fontSize: 12 },
  productPrice: { fontWeight: '800', fontSize: 14 },
  productStock: { fontSize: 11 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '88%' },
  modalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 4 },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  modalSub: { fontSize: 13 },
  fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
  saleTypeGrid: { flexDirection: 'row', gap: 10 },
  saleTypeBtn: { flex: 1, borderWidth: 2, borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  saleTypeBtnText: { fontWeight: '700', fontSize: 13 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  qtyBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontSize: 22, fontWeight: '700', lineHeight: 26 },
  qtyValue: { fontSize: 20, fontWeight: '800', minWidth: 36, textAlign: 'center' },
  summaryBox: { borderRadius: 14, padding: 14, gap: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontSize: 13 },
  summaryValue: { fontSize: 13, fontWeight: '600' },
  totalLabel: { fontSize: 14, fontWeight: '800' },
  totalValue: { color: COLORS.purple600, fontWeight: '800', fontSize: 16 },
  modalBtns: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, borderWidth: 2, borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  recordBtn: { flex: 1, backgroundColor: COLORS.purple500, borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  recordBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
