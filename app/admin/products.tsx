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
} from 'react-native';
import { supabase } from '../../src/lib/supabase';
import { Product } from '../../src/lib/types';
import { useTheme } from '../../src/context/ThemeContext';
import BackHeader from '../../src/components/BackHeader';
import Spinner from '../../src/components/Spinner';
import ImageUploader from '../../src/components/ImageUploader';
import { COLORS, getThemeColors } from '../../src/constants/colors';

const EMPTY_FORM = {
  name: '',
  description: '',
  category: '',
  retail_price: 0,
  wholesale_price: 0,
  manufacturing_price: 0,
  stock_quantity: 0,
  discount_percent: 0,
  image_url: '',
  image2: '',
  image3: '',
  video_url: '',
  is_active: true,
};

export default function ProductManagerScreen() {
  const { isDark } = useTheme();
  const tc = getThemeColors(isDark);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setProducts(data ?? []);
    setLoading(false);
  };
  useEffect(() => { fetchProducts(); }, []);

  const openAdd = () => {
    setEditProduct(null);
    setForm({ ...EMPTY_FORM });
    setError('');
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    const extraImgs = (p.images || []).filter(img => img !== p.image_url);
    setForm({
      name: p.name,
      description: p.description || '',
      category: p.category || '',
      retail_price: p.retail_price,
      wholesale_price: p.wholesale_price,
      manufacturing_price: p.manufacturing_price,
      stock_quantity: p.stock_quantity,
      discount_percent: p.discount_percent ?? 0,
      image_url: p.image_url || '',
      image2: extraImgs[0] || '',
      image3: extraImgs[1] || '',
      video_url: p.video_url || '',
      is_active: p.is_active,
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Product name required.'); return; }
    if (form.retail_price <= 0) { setError('Retail price must be greater than 0.'); return; }
    setSaving(true); setError('');
    // Build images array (extra images beyond the main image_url)
    const extraImages = [form.image2, form.image3].filter(Boolean);
    const payload = {
      name: form.name,
      description: form.description,
      category: form.category,
      retail_price: form.retail_price,
      wholesale_price: form.wholesale_price,
      manufacturing_price: form.manufacturing_price,
      stock_quantity: form.stock_quantity,
      discount_percent: form.discount_percent,
      image_url: form.image_url,
      images: extraImages.length > 0 ? extraImages : null,
      video_url: form.video_url.trim() || null,
      is_active: form.is_active,
    };
    try {
      if (editProduct) {
        const { error } = await supabase.from('products').update(payload).eq('id', editProduct.id);
        if (error) throw error;
        setSuccess('Product updated!');
      } else {
        const { error } = await supabase.from('products').insert(payload);
        if (error) throw error;
        setSuccess('Product added!');
      }
      setShowModal(false);
      await fetchProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: any) {
      setError(e.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    const { error } = await supabase.from('products').delete().eq('id', id);
    setSaving(false);
    setDeleteConfirm(null);
    if (!error) { setSuccess('Product deleted.'); fetchProducts(); setTimeout(() => setSuccess(''), 3000); }
    else setError(error.message);
  };

  const toggleActive = async (p: Product) => {
    await supabase.from('products').update({ is_active: !p.is_active }).eq('id', p.id);
    fetchProducts();
  };

  const inputStyle = [styles.input, { backgroundColor: tc.inputBg, borderColor: tc.border, color: tc.text }];

  const NumField = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
    <View style={styles.halfField}>
      <Text style={[styles.label, { color: tc.textSec }]}>{label}</Text>
      <TextInput
        style={inputStyle}
        value={String(value)}
        onChangeText={t => onChange(Number(t) || 0)}
        keyboardType="numeric"
        placeholderTextColor={COLORS.gray400}
      />
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: tc.bg }]}>
      <BackHeader
        title="Manage Products"
        right={
          <TouchableOpacity style={styles.addBtn} onPress={openAdd} activeOpacity={0.8}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        }
      />

      {!!success && (
        <View style={[styles.successBanner, { backgroundColor: isDark ? 'rgba(22,163,74,0.15)' : '#f0fdf4' }]}>
          <Text style={{ color: '#15803d', fontSize: 14, fontWeight: '600' }}>✅ {success}</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.center}><Spinner /></View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 40 }}>
          {products.length === 0 && (
            <View style={[styles.emptyCard, { backgroundColor: tc.card }]}>
              <Text style={{ fontSize: 40, marginBottom: 10 }}>📦</Text>
              <Text style={[styles.emptyText, { color: tc.textSec }]}>No products yet. Add one!</Text>
            </View>
          )}
          {products.map(p => (
            <View key={p.id} style={[styles.productCard, { backgroundColor: tc.card, opacity: p.is_active ? 1 : 0.6 }]}>
              <View style={styles.productTop}>
                {p.image_url ? (
                  <Image source={{ uri: p.image_url }} style={styles.productImage} />
                ) : (
                  <View style={[styles.productImagePlaceholder, { backgroundColor: isDark ? COLORS.gray700 : COLORS.gray100 }]}>
                    <Text style={{ fontSize: 22 }}>📦</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <View style={styles.productNameRow}>
                    <Text style={[styles.productName, { color: tc.text }]} numberOfLines={1}>{p.name}</Text>
                    {!p.is_active && (
                      <View style={styles.hiddenBadge}><Text style={styles.hiddenText}>Hidden</Text></View>
                    )}
                    {(p.discount_percent ?? 0) > 0 && (
                      <View style={styles.saleBadge}><Text style={styles.saleText}>-{p.discount_percent}% Sale</Text></View>
                    )}
                  </View>
                  <Text style={[styles.productCat, { color: tc.textSec }]}>{p.category || 'No category'}</Text>
                  <View style={styles.productPriceRow}>
                    <Text style={styles.productPrice}>Rs. {p.retail_price}</Text>
                    <Text style={[styles.productStock, { color: tc.textSec }]}>Stock: {p.stock_quantity}</Text>
                  </View>
                </View>
              </View>
              <View style={[styles.productActions, { borderTopColor: tc.border }]}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => toggleActive(p)} activeOpacity={0.7}>
                  <Text style={[styles.actionBtnText, { color: tc.textSec }]}>{p.is_active ? '👁️ Hide' : '👁️ Show'}</Text>
                </TouchableOpacity>
                <View style={[styles.actionDivider, { backgroundColor: tc.border }]} />
                <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(p)} activeOpacity={0.7}>
                  <Text style={[styles.actionBtnText, { color: COLORS.blue500 }]}>✏️ Edit</Text>
                </TouchableOpacity>
                <View style={[styles.actionDivider, { backgroundColor: tc.border }]} />
                <TouchableOpacity style={styles.actionBtn} onPress={() => setDeleteConfirm(p.id)} activeOpacity={0.7}>
                  <Text style={[styles.actionBtnText, { color: COLORS.red500 }]}>🗑️ Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Add / Edit Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setShowModal(false)} activeOpacity={1} />
          <View style={[styles.modalSheet, { backgroundColor: tc.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: tc.border }]}>
              <Text style={[styles.modalTitle, { color: tc.text }]}>{editProduct ? 'Edit Product' : 'Add Product'}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={{ fontSize: 22, color: COLORS.gray400 }}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }} keyboardShouldPersistTaps="handled">
              <View>
                <Text style={[styles.label, { color: tc.textSec }]}>Product Name *</Text>
                <TextInput style={inputStyle} placeholder="e.g. Rena Henna Stencil W11" placeholderTextColor={COLORS.gray400} value={form.name} onChangeText={t => setForm(f => ({ ...f, name: t }))} />
              </View>
              <View>
                <Text style={[styles.label, { color: tc.textSec }]}>Category</Text>
                <TextInput style={inputStyle} placeholder="e.g. Stencils, Heavy Stencil" placeholderTextColor={COLORS.gray400} value={form.category} onChangeText={t => setForm(f => ({ ...f, category: t }))} />
              </View>
              <View>
                <Text style={[styles.label, { color: tc.textSec }]}>Description</Text>
                <TextInput style={[inputStyle, { height: 60, textAlignVertical: 'top' }]} placeholder="Product description..." placeholderTextColor={COLORS.gray400} value={form.description} onChangeText={t => setForm(f => ({ ...f, description: t }))} multiline numberOfLines={2} />
              </View>
              <ImageUploader
                label="Main Image *"
                value={form.image_url}
                onChange={url => setForm(f => ({ ...f, image_url: url }))}
                height={150}
              />
              <View style={styles.twoCol}>
                <View style={{ flex: 1 }}>
                  <ImageUploader
                    label="Image 2"
                    value={form.image2}
                    onChange={url => setForm(f => ({ ...f, image2: url }))}
                    height={100}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <ImageUploader
                    label="Image 3"
                    value={form.image3}
                    onChange={url => setForm(f => ({ ...f, image3: url }))}
                    height={100}
                  />
                </View>
              </View>
              <View>
                <Text style={[styles.label, { color: tc.textSec }]}>Video URL (optional)</Text>
                <TextInput
                  style={inputStyle}
                  placeholder="https://..."
                  placeholderTextColor={COLORS.gray400}
                  value={form.video_url}
                  onChangeText={t => setForm(f => ({ ...f, video_url: t }))}
                  autoCapitalize="none"
                  keyboardType="url"
                />
              </View>
              <View style={styles.twoCol}>
                <NumField label="Retail Price (Rs.) *" value={form.retail_price} onChange={v => setForm(f => ({ ...f, retail_price: v }))} />
                <NumField label="Wholesale Price (Rs.)" value={form.wholesale_price} onChange={v => setForm(f => ({ ...f, wholesale_price: v }))} />
              </View>
              <View style={styles.twoCol}>
                <NumField label="Mfg. Price (Rs.)" value={form.manufacturing_price} onChange={v => setForm(f => ({ ...f, manufacturing_price: v }))} />
                <NumField label="Stock Qty" value={form.stock_quantity} onChange={v => setForm(f => ({ ...f, stock_quantity: v }))} />
              </View>
              <View style={styles.twoCol}>
                <NumField label="Discount %" value={form.discount_percent} onChange={v => setForm(f => ({ ...f, discount_percent: v }))} />
                <View style={styles.halfField}>
                  <Text style={[styles.label, { color: tc.textSec }]}>Status</Text>
                  <TouchableOpacity
                    style={[styles.statusToggle, { borderColor: form.is_active ? COLORS.green500 : COLORS.gray300 }]}
                    onPress={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                    activeOpacity={0.8}
                  >
                    <Text style={{ color: form.is_active ? '#16a34a' : COLORS.gray400, fontWeight: '700', fontSize: 13 }}>
                      {form.is_active ? '✅ Active' : '❌ Hidden'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {!!error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
                {saving ? <Spinner size={20} color="#fff" /> : <Text style={styles.saveBtnText}>{editProduct ? 'Save Changes' : 'Add Product'}</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Delete Confirm */}
      <Modal visible={!!deleteConfirm} transparent animationType="fade">
        <View style={styles.confirmOverlay}>
          <View style={[styles.confirmBox, { backgroundColor: tc.card }]}>
            <Text style={{ fontSize: 36, textAlign: 'center', marginBottom: 10 }}>⚠️</Text>
            <Text style={[styles.confirmTitle, { color: tc.text }]}>Delete Product?</Text>
            <Text style={[styles.confirmSub, { color: tc.textSec }]}>Yeh action undo nahi ho sakti.</Text>
            <View style={styles.confirmBtns}>
              <TouchableOpacity style={[styles.cancelBtn, { borderColor: tc.border }]} onPress={() => setDeleteConfirm(null)} activeOpacity={0.8}>
                <Text style={[{ fontWeight: '700', fontSize: 14 }, { color: tc.textSec }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteConfirm && handleDelete(deleteConfirm)} disabled={saving} activeOpacity={0.85}>
                <Text style={styles.deleteBtnText}>{saving ? 'Deleting...' : 'Delete'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  addBtn: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  addBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
  successBanner: { marginHorizontal: 16, marginTop: 10, padding: 12, borderRadius: 12 },
  emptyCard: { borderRadius: 16, padding: 32, alignItems: 'center' },
  emptyText: { fontSize: 14 },
  productCard: { borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  productTop: { flexDirection: 'row', gap: 12, padding: 14 },
  productImage: { width: 64, height: 64, borderRadius: 12, resizeMode: 'cover' },
  productImagePlaceholder: { width: 64, height: 64, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  productNameRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginBottom: 4 },
  productName: { fontWeight: '700', fontSize: 13 },
  hiddenBadge: { backgroundColor: '#fef2f2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  hiddenText: { color: COLORS.red500, fontSize: 10, fontWeight: '700' },
  saleBadge: { backgroundColor: '#f0fdf4', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  saleText: { color: '#15803d', fontSize: 10, fontWeight: '700' },
  productCat: { fontSize: 12, marginBottom: 4 },
  productPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  productPrice: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
  productStock: { fontSize: 12 },
  productActions: { flexDirection: 'row', borderTopWidth: 1 },
  actionBtn: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  actionBtnText: { fontSize: 12, fontWeight: '700' },
  actionDivider: { width: 1 },
  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '92%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: '900' },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 11, fontSize: 14 },
  twoCol: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },
  statusToggle: { borderWidth: 2, borderRadius: 12, paddingVertical: 11, paddingHorizontal: 14, alignItems: 'center', backgroundColor: 'transparent' },
  errorBox: { backgroundColor: '#fef2f2', borderRadius: 10, padding: 12 },
  errorText: { color: COLORS.red500, fontSize: 13 },
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 16, alignItems: 'center', shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  confirmOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  confirmBox: { borderRadius: 24, padding: 24, width: '100%', maxWidth: 360 },
  confirmTitle: { fontSize: 18, fontWeight: '900', textAlign: 'center', marginBottom: 6 },
  confirmSub: { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  confirmBtns: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, borderWidth: 2, borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  deleteBtn: { flex: 1, backgroundColor: COLORS.red500, borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  deleteBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
