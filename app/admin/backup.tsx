import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { supabase } from '../../src/lib/supabase';
import { useTheme } from '../../src/context/ThemeContext';
import BackHeader from '../../src/components/BackHeader';
import Spinner from '../../src/components/Spinner';
import { COLORS, getThemeColors } from '../../src/constants/colors';

interface BackupMeta {
  table: string;
  emoji: string;
  label: string;
  count: number;
}

type BackupStatus = 'idle' | 'loading' | 'done' | 'error';

export default function BackupScreen() {
  const { isDark } = useTheme();
  const tc = getThemeColors(isDark);
  const [status, setStatus] = useState<BackupStatus>('idle');
  const [meta, setMeta] = useState<BackupMeta[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [lastBackup, setLastBackup] = useState('');

  const tables: { name: string; emoji: string; label: string }[] = [
    { name: 'products',    emoji: '📦', label: 'Products' },
    { name: 'orders',      emoji: '🛒', label: 'Orders' },
    { name: 'order_items', emoji: '📋', label: 'Order Items' },
    { name: 'app_banners', emoji: '🏷️', label: 'Banners' },
    { name: 'profiles',    emoji: '👤', label: 'Profiles' },
    { name: 'sales',       emoji: '💰', label: 'Sales' },
  ];

  const downloadBackup = async () => {
    setStatus('loading');
    setErrorMsg('');
    setMeta([]);

    try {
      const backup: Record<string, any[]> = {};
      const newMeta: BackupMeta[] = [];

      for (const t of tables) {
        const { data, error } = await supabase.from(t.name).select('*').order('created_at', { ascending: false });
        if (error) {
          // Skip tables that don't exist or have no access
          backup[t.name] = [];
          newMeta.push({ ...t, table: t.name, count: 0 });
        } else {
          backup[t.name] = data ?? [];
          newMeta.push({ ...t, table: t.name, count: (data ?? []).length });
        }
      }

      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().slice(0, 5).replace(':', '-');
      const filename = `rena-henna-backup-${dateStr}-${timeStr}.json`;

      const payload = {
        exported_at: now.toISOString(),
        app: 'Rena Henna',
        version: '1.0',
        data: backup,
      };

      if (Platform.OS === 'web') {
        // Web: trigger browser download
        const blob = new Blob([JSON.stringify(payload, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        Alert.alert(
          'Backup Ready',
          'Web pe download hoga. App version mein file sharing coming soon.'
        );
      }

      setMeta(newMeta);
      setLastBackup(now.toLocaleString('en-PK'));
      setStatus('done');
    } catch (e: any) {
      setErrorMsg(e.message || 'Backup failed.');
      setStatus('error');
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: tc.bg }]}>
      <BackHeader title="Backup & Export" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }}
      >
        {/* Info card */}
        <View style={[styles.infoCard, { backgroundColor: tc.card, borderColor: COLORS.primary + '40' }]}>
          <Text style={styles.infoEmoji}>💾</Text>
          <Text style={[styles.infoTitle, { color: tc.text }]}>Data Backup</Text>
          <Text style={[styles.infoSub, { color: tc.textSec }]}>
            Poora database (products, orders, banners, profiles) ek JSON file mein download ho jaye ga.
            Safe jagah rakhna — restore ke liye kaam aaye ga.
          </Text>
        </View>

        {/* What's included */}
        <View style={[styles.section, { backgroundColor: tc.card }]}>
          <Text style={[styles.sectionTitle, { color: tc.text }]}>Backup mein kya hoga</Text>
          {tables.map(t => (
            <View key={t.name} style={[styles.tableRow, { borderBottomColor: tc.border }]}>
              <Text style={{ fontSize: 18, marginRight: 10 }}>{t.emoji}</Text>
              <Text style={[styles.tableLabel, { color: tc.text }]}>{t.label}</Text>
              {meta.find(m => m.table === t.name) && (
                <View style={[styles.countBadge, { backgroundColor: COLORS.primary + '20' }]}>
                  <Text style={[styles.countText, { color: COLORS.primary }]}>
                    {meta.find(m => m.table === t.name)?.count} rows
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Last backup info */}
        {!!lastBackup && (
          <View style={[styles.successBox, { backgroundColor: COLORS.green500 + '15', borderColor: COLORS.green500 + '40' }]}>
            <Text style={styles.successIcon}>✅</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.successTitle, { color: COLORS.green500 }]}>Backup Complete!</Text>
              <Text style={[styles.successSub, { color: tc.textSec }]}>Downloaded: {lastBackup}</Text>
            </View>
          </View>
        )}

        {/* Error box */}
        {status === 'error' && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️  {errorMsg}</Text>
          </View>
        )}

        {/* Download button */}
        <TouchableOpacity
          style={[styles.downloadBtn, status === 'loading' && { opacity: 0.65 }]}
          onPress={downloadBackup}
          disabled={status === 'loading'}
          activeOpacity={0.85}
        >
          {status === 'loading' ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Spinner size={20} color="#fff" />
              <Text style={styles.downloadBtnTxt}>Fetching data…</Text>
            </View>
          ) : (
            <Text style={styles.downloadBtnTxt}>
              {status === 'done' ? '⬇️  Download Again' : '⬇️  Download Backup (JSON)'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Note */}
        <Text style={[styles.note, { color: tc.textSec }]}>
          💡 Backup file automatically download folder mein save ho gi. Regularly backup lena data loss se bachata hai.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  infoCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    gap: 8,
  },
  infoEmoji: { fontSize: 48, marginBottom: 4 },
  infoTitle: { fontSize: 20, fontWeight: '900', textAlign: 'center' },
  infoSub: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  section: { borderRadius: 16, overflow: 'hidden' },
  sectionTitle: { fontWeight: '800', fontSize: 14, padding: 16, paddingBottom: 8 },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  tableLabel: { flex: 1, fontWeight: '600', fontSize: 14 },
  countBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  countText: { fontSize: 12, fontWeight: '700' },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  successIcon: { fontSize: 24 },
  successTitle: { fontWeight: '800', fontSize: 14 },
  successSub: { fontSize: 12, marginTop: 2 },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  errorText: { color: COLORS.red500, fontSize: 13 },
  downloadBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 5,
  },
  downloadBtnTxt: { color: '#fff', fontWeight: '800', fontSize: 16 },
  note: { fontSize: 12, textAlign: 'center', lineHeight: 18 },
});
