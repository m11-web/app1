import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { supabase } from '../../src/lib/supabase';
import { useTheme } from '../../src/context/ThemeContext';
import BackHeader from '../../src/components/BackHeader';
import Spinner from '../../src/components/Spinner';
import { COLORS, getThemeColors } from '../../src/constants/colors';

async function sendPushNotification(title: string, body: string, tokens: string[]) {
  const messages = tokens.map(to => ({ to, sound: 'default', title, body }));
  const res = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(messages),
  });
  if (!res.ok) throw new Error('Failed to send notifications');
}

export default function NotificationSenderScreen() {
  const { isDark } = useTheme();
  const tc = getThemeColors(isDark);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const templates = [
    { label: '🔥 New Arrival', title: 'New Products Just Added! 🌿', body: 'Check out our latest Rena Henna collection now!' },
    { label: '🎉 Weekend Sale', title: '🎉 Weekend Sale is Live!', body: 'Grab amazing deals on all products. Limited time only!' },
    { label: '📦 Order Update', title: 'Order Status Update', body: 'Your order has been confirmed and is being processed.' },
  ];

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      setResult({ success: false, message: 'Please fill title and message.' });
      return;
    }
    setSending(true);
    setResult(null);
    try {
      const { data: tokens } = await supabase.from('push_tokens').select('token');
      const tokenList = (tokens ?? []).map((t: any) => t.token).filter(Boolean);
      if (tokenList.length === 0) {
        setResult({ success: false, message: 'No users have enabled push notifications yet.' });
        setSending(false);
        return;
      }
      await sendPushNotification(title.trim(), body.trim(), tokenList);
      setResult({ success: true, message: `Notification sent to ${tokenList.length} user(s)! ✅` });
      setTitle('');
      setBody('');
    } catch (e: any) {
      setResult({ success: false, message: e.message || 'Failed to send.' });
    } finally {
      setSending(false);
    }
  };

  const inputStyle = [styles.input, { backgroundColor: tc.inputBg, borderColor: tc.border, color: tc.text }];

  return (
    <View style={[styles.root, { backgroundColor: tc.bg }]}>
      <BackHeader title="Send Notification" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }}>

        {/* Templates */}
        <View>
          <Text style={[styles.sectionTitle, { color: tc.text }]}>Quick Templates</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }} contentContainerStyle={{ gap: 8 }}>
            {templates.map((t, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.templateChip, { backgroundColor: tc.card, borderColor: tc.border }]}
                onPress={() => { setTitle(t.title); setBody(t.body); }}
                activeOpacity={0.8}
              >
                <Text style={[styles.templateText, { color: isDark ? COLORS.gray300 : COLORS.gray700 }]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={[styles.card, { backgroundColor: tc.card }]}>
          <View>
            <Text style={[styles.label, { color: tc.textSec }]}>
              Notification Title * <Text style={{ fontWeight: '400', color: COLORS.gray400 }}>({title.length}/60)</Text>
            </Text>
            <TextInput
              style={inputStyle}
              placeholder="e.g., New Products Available! 🌿"
              placeholderTextColor={COLORS.gray400}
              value={title}
              onChangeText={t => setTitle(t.slice(0, 60))}
              maxLength={60}
            />
          </View>
          <View style={{ marginTop: 14 }}>
            <Text style={[styles.label, { color: tc.textSec }]}>
              Message * <Text style={{ fontWeight: '400', color: COLORS.gray400 }}>({body.length}/200)</Text>
            </Text>
            <TextInput
              style={[inputStyle, { height: 90, textAlignVertical: 'top' }]}
              placeholder="Write your message here..."
              placeholderTextColor={COLORS.gray400}
              value={body}
              onChangeText={b => setBody(b.slice(0, 200))}
              multiline
              numberOfLines={4}
              maxLength={200}
            />
          </View>
        </View>

        {/* Preview */}
        {(!!title || !!body) && (
          <View style={[styles.preview, { backgroundColor: isDark ? COLORS.gray700 : COLORS.gray900 }]}>
            <Text style={styles.previewLabel}>PREVIEW</Text>
            <View style={styles.previewBox}>
              <Text style={styles.previewTitle}>{title || 'Notification Title'}</Text>
              <Text style={styles.previewBody}>{body || 'Message body...'}</Text>
            </View>
          </View>
        )}

        {!!result && (
          <View style={[styles.resultBox, { backgroundColor: result.success ? '#f0fdf4' : '#fef2f2', borderColor: result.success ? '#bbf7d0' : '#fecaca' }]}>
            <Text style={{ color: result.success ? '#15803d' : COLORS.red500, fontSize: 14, fontWeight: '600' }}>
              {result.message}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.sendBtn, sending && { opacity: 0.6 }]}
          onPress={handleSend}
          disabled={sending}
          activeOpacity={0.85}
        >
          {sending ? (
            <Spinner size={20} color="#fff" />
          ) : (
            <Text style={styles.sendBtnText}>🔔 Send to All Users</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  sectionTitle: { fontSize: 15, fontWeight: '800' },
  templateChip: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  templateText: { fontSize: 12, fontWeight: '600' },
  card: { borderRadius: 20, padding: 18, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14 },
  preview: { borderRadius: 16, padding: 16 },
  previewLabel: { color: COLORS.gray400, fontSize: 11, letterSpacing: 1, marginBottom: 8, fontWeight: '700' },
  previewBox: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 12 },
  previewTitle: { color: '#fff', fontWeight: '700', fontSize: 14 },
  previewBody: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4 },
  resultBox: { borderWidth: 1, borderRadius: 16, padding: 14 },
  sendBtn: { backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 18, alignItems: 'center', shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  sendBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
