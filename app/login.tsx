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
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { signIn } from '../src/lib/auth';
import { COLORS, getThemeColors } from '../src/constants/colors';
import { useTheme } from '../src/context/ThemeContext';
import Spinner from '../src/components/Spinner';

const STATUS_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

export default function LoginScreen() {
  const router = useRouter();
  const { setProfile } = useAuth();
  const { isDark } = useTheme();
  const tc = getThemeColors(isDark);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill all fields.'); return; }
    setError(''); setLoading(true);
    const result = await signIn(email.trim(), password);
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    setProfile(result.profile);
    if (result.profile?.role === 'admin') router.replace('/admin' as any);
    else if (result.profile?.role === 'employee') router.replace('/employee' as any);
    else router.replace('/');
  };

  const inputStyle = [styles.input, { backgroundColor: tc.inputBg, borderColor: tc.border, color: tc.text }];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.root, { backgroundColor: tc.card }]}>
        {/* Hero */}
        <View style={[styles.hero, { paddingTop: STATUS_TOP + 20 }]}>
          <View style={styles.bubble1} />
          <View style={styles.bubble2} />
          <View style={styles.iconCircle}>
            <Text style={{ fontSize: 36 }}>🌿</Text>
          </View>
          <Text style={styles.heroTitle}>Welcome Back</Text>
          <Text style={styles.heroSub}>Sign in to your Rena Henna account</Text>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <View>
            <Text style={[styles.label, { color: tc.textSec }]}>Email Address</Text>
            <TextInput
              style={inputStyle}
              placeholder="your@email.com"
              placeholderTextColor={COLORS.gray400}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View>
            <Text style={[styles.label, { color: tc.textSec }]}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[inputStyle, { flex: 1 }]}
                placeholder="••••••••"
                placeholderTextColor={COLORS.gray400}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(s => !s)}>
                <Text style={{ fontSize: 18 }}>{showPass ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <Spinner size={20} color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={[styles.divLine, { backgroundColor: tc.border }]} />
            <Text style={[styles.divText, { color: COLORS.gray400 }]}>OR</Text>
            <View style={[styles.divLine, { backgroundColor: tc.border }]} />
          </View>

          <TouchableOpacity
            style={[styles.secondaryBtn, { borderColor: tc.border }]}
            onPress={() => router.push('/signup')}
            activeOpacity={0.85}
          >
            <Text style={[styles.secondaryBtnText, { color: tc.text }]}>Create New Account</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/')} style={styles.guestBtn}>
            <Text style={styles.guestBtnText}>Continue as Guest</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingBottom: 36,
    alignItems: 'center',
    overflow: 'hidden',
  },
  bubble1: { position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.1)' },
  bubble2: { position: 'absolute', bottom: -30, left: -30, width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.1)' },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  heroTitle: { color: '#fff', fontWeight: '900', fontSize: 24, marginBottom: 4 },
  heroSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  form: { padding: 24, gap: 16, paddingBottom: 40 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14 },
  passwordRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeBtn: { position: 'absolute', right: 12, top: 12 },
  errorBox: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 12, padding: 12 },
  errorText: { color: COLORS.red500, fontSize: 13 },
  primaryBtn: { backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 16, alignItems: 'center', shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  divLine: { flex: 1, height: 1 },
  divText: { fontSize: 12 },
  secondaryBtn: { borderWidth: 2, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  secondaryBtnText: { fontWeight: '700', fontSize: 15 },
  guestBtn: { alignItems: 'center', paddingVertical: 8 },
  guestBtnText: { color: COLORS.gray400, fontSize: 13 },
});
