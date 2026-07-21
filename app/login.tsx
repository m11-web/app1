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
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { signIn } from '../src/lib/auth';
import { COLORS, getThemeColors } from '../src/constants/colors';
import { useTheme } from '../src/context/ThemeContext';
import Spinner from '../src/components/Spinner';

const STATUS_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

// Supabase errors that mean "no account exists"
const NO_ACCOUNT_ERRORS = [
  'invalid login credentials',
  'invalid credentials',
  'user not found',
  'no user found',
  'email not found',
];

function isNoAccountError(msg: string): boolean {
  const lower = msg.toLowerCase();
  return NO_ACCOUNT_ERRORS.some(e => lower.includes(e));
}

export default function LoginScreen() {
  const router = useRouter();
  const { setProfile } = useAuth();
  const { isDark } = useTheme();
  const tc = getThemeColors(isDark);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [noAccount, setNoAccount] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    if (!email || !password) { setErrorMsg('Please fill all fields.'); return; }
    setErrorMsg(''); setNoAccount(false); setLoading(true);
    const result = await signIn(email.trim(), password);
    setLoading(false);
    if (result.error) {
      if (isNoAccountError(result.error)) {
        setNoAccount(true);
        setErrorMsg('');
      } else {
        setErrorMsg(result.error);
      }
      return;
    }
    setProfile(result.profile);
    if (result.profile?.role === 'admin') router.replace('/admin' as any);
    else if (result.profile?.role === 'employee') router.replace('/employee' as any);
    else router.replace('/');
  };

  const inputStyle = [
    styles.input,
    { backgroundColor: tc.inputBg, borderColor: tc.border, color: tc.text },
  ];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.root, { backgroundColor: tc.bg }]}>
        {/* Hero */}
        <View style={[styles.hero, { paddingTop: STATUS_TOP + 20 }]}>
          <View style={styles.bubble1} />
          <View style={styles.bubble2} />
          <View style={styles.iconCircle}>
            <Text style={{ fontSize: 36 }}>🛍️</Text>
          </View>
          <Text style={styles.heroTitle}>Welcome Back</Text>
          <Text style={styles.heroSub}>Sign in to your Rena Henna account</Text>
        </View>

        <ScrollView
          style={{ flex: 1, backgroundColor: tc.card }}
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            <Text style={[styles.label, { color: tc.textSec }]}>Email Address</Text>
            <TextInput
              style={inputStyle}
              placeholder="your@email.com"
              placeholderTextColor={isDark ? COLORS.textSecDark : COLORS.gray400}
              value={email}
              onChangeText={t => { setEmail(t); setNoAccount(false); setErrorMsg(''); }}
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
                placeholderTextColor={isDark ? COLORS.textSecDark : COLORS.gray400}
                value={password}
                onChangeText={t => { setPassword(t); setNoAccount(false); setErrorMsg(''); }}
                secureTextEntry={!showPass}
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(s => !s)}>
                <Text style={{ fontSize: 18 }}>{showPass ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Generic error */}
          {!!errorMsg && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️  {errorMsg}</Text>
            </View>
          )}

          {/* No-account notice */}
          {noAccount && (
            <View style={styles.noAccountBox}>
              <Text style={styles.noAccountIcon}>👋</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.noAccountTitle}>No account found</Text>
                <Text style={styles.noAccountSub}>
                  This email isn't registered yet. Create your account to get started!
                </Text>
              </View>
            </View>
          )}

          {/* Sign In button — disabled when no account */}
          <TouchableOpacity
            style={[
              styles.primaryBtn,
              (loading || noAccount) && styles.btnDisabled,
            ]}
            onPress={handleLogin}
            disabled={loading || noAccount}
            activeOpacity={0.85}
          >
            {loading ? (
              <Spinner size={20} color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>
                {noAccount ? 'Login Disabled' : 'Sign In'}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={[styles.divLine, { backgroundColor: tc.border }]} />
            <Text style={[styles.divText, { color: tc.textSec }]}>OR</Text>
            <View style={[styles.divLine, { backgroundColor: tc.border }]} />
          </View>

          {/* Create account — highlighted when no account */}
          <TouchableOpacity
            style={[
              styles.secondaryBtn,
              noAccount
                ? styles.secondaryBtnActive
                : { borderColor: tc.border },
            ]}
            onPress={() => router.push('/signup')}
            activeOpacity={0.85}
          >
            <Text style={[
              styles.secondaryBtnText,
              noAccount ? { color: '#fff' } : { color: tc.text },
            ]}>
              {noAccount ? '✨  Create Your Account' : 'Create New Account'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/')} style={styles.guestBtn}>
            <Text style={[styles.guestBtnText, { color: tc.textSec }]}>Continue as Guest</Text>
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
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heroTitle: { color: '#fff', fontWeight: '900', fontSize: 24, marginBottom: 4 },
  heroSub: { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
  form: { padding: 24, gap: 16, paddingBottom: 40 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 6, letterSpacing: 0.3 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 14,
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  eyeBtn: { position: 'absolute', right: 14, top: 13 },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    borderRadius: 12,
    padding: 12,
  },
  errorText: { color: COLORS.red500, fontSize: 13 },
  // No-account notice
  noAccountBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: 'rgba(200,89,26,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(200,89,26,0.35)',
    borderRadius: 14,
    padding: 14,
  },
  noAccountIcon: { fontSize: 22, marginTop: 2 },
  noAccountTitle: { color: COLORS.primary, fontWeight: '800', fontSize: 14, marginBottom: 3 },
  noAccountSub: { color: COLORS.textSecDark, fontSize: 12, lineHeight: 18 },
  // Buttons
  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  btnDisabled: { opacity: 0.35 },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  divLine: { flex: 1, height: 1 },
  divText: { fontSize: 12, fontWeight: '600' },
  secondaryBtn: {
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 5,
  },
  secondaryBtnText: { fontWeight: '700', fontSize: 15 },
  guestBtn: { alignItems: 'center', paddingVertical: 8 },
  guestBtnText: { fontSize: 13 },
});
