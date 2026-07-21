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
  Switch,
} from 'react-native';
import { getAllBanners, upsertBanner, deleteBanner } from '../../src/lib/store';
import { AppBanner } from '../../src/lib/types';
import { useTheme } from '../../src/context/ThemeContext';
import BackHeader from '../../src/components/BackHeader';
import Spinner from '../../src/components/Spinner';
import ImageUploader from '../../src/components/ImageUploader';
import { COLORS, getThemeColors } from '../../src/constants/colors';

export default function BannerManagerScreen() {
  const { isDark } = useTheme();
  const tc = getThemeColors(isDark);
  const [banners, setBanners] = useState<AppBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState({ id: '', title: '', subtitle: '', image_url: '', is_active: true });

  const load = () => getAllBanners().then(setBanners).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const resetForm = () => setForm({ id: '', title: '', subtitle: '', image_url: '', is_active: true });

  const handleSave = async () => {
    if (!form.title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }
    setSaving(true);
    try {
      await upsertBanner({
        ...(form.id ? { id: form.id } : {}),
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        image_url: form.image_url.trim(),
        is_active: form.is_active,
      });
      await load();
      setShowForm(false);
      resetForm();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteBanner(id);
      setConfirmId(null);
      await load();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not delete banner');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (b: AppBanner) => {
    setForm({ id: b.id, title: b.title, subtitle: b.subtitle, image_url: b.image_url, is_active: b.is_active });
    setShowForm(true);
  };

  const inputStyle = [styles.input, { backgroundColor: tc.inputBg, borderColor: tc.border, color: tc.text }];

  return (
    <View style={[styles.root, { backgroundColor: tc.bg }]}>
      <BackHeader
        title="Banners"
        right={
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => { resetForm(); setShowForm(true); }}
            activeOpacity={0.8}
          >
            <Text style={styles.addBtnText}>+ New</Text>
          </TouchableOpacity>
        }
      />

      {loading ? (
        <View style={styles.center}><Spinner /></View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}>
          {banners.length === 0 ? (
            <View style={styles.empty}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>🏷️</Text>
              <Text style={[styles.emptyText, { color: tc.textSec }]}>No banners yet. Create one!</Text>
            </View>
          ) : banners.map(b => (
            <View key={b.id} style={[styles.bannerCard, { backgroundColor: tc.card }]}>
              {!!b.image_url && (
                <Image source={{ uri: b.image_url }} style={styles.bannerImage} />
              )}
              <View style={styles.bannerBody}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.bannerTitle, { color: tc.text }]}>{b.title}</Text>
                  <Text style={[styles.bannerSub, { color: tc.textSec }]} numberOfLines={1}>{b.subtitle}</Text>
                  <View style={[styles.activeBadge, { backgroundColor: b.is_active ? '#f0fdf4' : tc.inputBg }]}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: b.is_active ? '#15803d' : COLORS.gray400 }}>
                      {b.is_active ? '● Active' : '○ Inactive'}
                    </Text>
                  </View>
                </View>
                <View style={styles.actionBtns}>
                  {confirmId === b.id ? (
                    <>
                      <TouchableOpacity
                        style={[styles.iconBtn, { backgroundColor: '#fef2f2', width: 'auto' as any, paddingHorizontal: 10 }]}
                        onPress={() => handleDelete(b.id)}
                        activeOpacity={0.7}
                        disabled={deletingId === b.id}
                      >
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#dc2626' }}>
                          {deletingId === b.id ? '...' : 'Yes'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.iconBtn, { backgroundColor: tc.inputBg, width: 'auto' as any, paddingHorizontal: 10 }]}
                        onPress={() => setConfirmId(null)}
                        activeOpacity={0.7}
                      >
                        <Text style={{ fontSize: 11, fontWeight: '700', color: tc.textSec }}>No</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity style={[styles.iconBtn, { backgroundColor: '#eff6ff' }]} onPress={() => handleEdit(b)} activeOpacity={0.7}>
                        <Text style={{ fontSize: 14 }}>✏️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.iconBtn, { backgroundColor: '#fef2f2' }]} onPress={() => setConfirmId(b.id)} activeOpacity={0.7}>
                        <Text style={{ fontSize: 14 }}>🗑️</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Form Modal */}
      <Modal visible={showForm} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setShowForm(false)} activeOpacity={1} />
          <View style={[styles.modalSheet, { backgroundColor: tc.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: tc.border }]}>
              <Text style={[styles.modalTitle, { color: tc.text }]}>{form.id ? 'Edit Banner' : 'New Banner'}</Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <Text style={{ fontSize: 22, color: COLORS.gray400 }}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
              <View>
                <Text style={[styles.label, { color: tc.textSec }]}>Title *</Text>
                <TextInput style={inputStyle} placeholder="e.g., Weekend Sale!" placeholderTextColor={COLORS.gray400} value={form.title} onChangeText={t => setForm(f => ({ ...f, title: t }))} />
              </View>
              <View>
                <Text style={[styles.label, { color: tc.textSec }]}>Subtitle</Text>
                <TextInput style={inputStyle} placeholder="Short description" placeholderTextColor={COLORS.gray400} value={form.subtitle} onChangeText={t => setForm(f => ({ ...f, subtitle: t }))} />
              </View>
              <ImageUploader
                label="Banner Image"
                value={form.image_url}
                onChange={url => setForm(f => ({ ...f, image_url: url }))}
                height={140}
              />
              <View style={styles.toggleRow}>
                <Text style={[styles.toggleLabel, { color: tc.text }]}>Active</Text>
                <Switch
                  value={form.is_active}
                  onValueChange={v => setForm(f => ({ ...f, is_active: v }))}
                  trackColor={{ false: COLORS.gray300, true: COLORS.primary }}
                  thumbColor="#fff"
                />
              </View>
              <View style={styles.modalBtns}>
                <TouchableOpacity style={[styles.cancelBtn, { borderColor: tc.border }]} onPress={() => setShowForm(false)} activeOpacity={0.8}>
                  <Text style={[styles.cancelBtnText, { color: tc.textSec }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
                  {saving ? <Spinner size={18} color="#fff" /> : <Text style={styles.saveBtnText}>Save</Text>}
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
  addBtn: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  addBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 14 },
  bannerCard: { borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  bannerImage: { width: '100%', height: 120, resizeMode: 'cover' },
  bannerBody: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, gap: 12 },
  bannerTitle: { fontWeight: '700', fontSize: 14, marginBottom: 3 },
  bannerSub: { fontSize: 12, marginBottom: 6 },
  activeBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  actionBtns: { gap: 8 },
  iconBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: '900' },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toggleLabel: { fontSize: 14, fontWeight: '600' },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancelBtn: { flex: 1, borderWidth: 2, borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  cancelBtnText: { fontWeight: '700', fontSize: 14 },
  saveBtn: { flex: 1, backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
