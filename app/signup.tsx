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
import { signUp } from '../src/lib/auth';
import { COLORS, getThemeColors } from '../src/constants/colors';
import { useTheme } from '../src/context/ThemeContext';
import Spinner from '../src/components/Spinner';

const STATUS_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

export default function SignupScreen() {
  const router = useRouter();
  const { setProfile } = useAuth();
  const { isDark } = useTheme();
  const tc = getThemeColors(isDark);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const handleSignup = async () => {
    if (!fullName || !email || !password) { setError('Please fill all fields.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError(''); setLoading(true);
    const result = await signUp(email.trim(), password, fullName.trim());
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    if ((result as any).needsConfirmation) { setConfirmed(true); return; }
    if (result.profile) { setProfile(result.profile); router.replace('/'); }
  };

  const inputStyle = [styles.input, { backgroundColor: tc.inputBg, borderColor: tc.border, color: tc.text }];

  if (confirmed) {
    return (
      <View style={[styles.root, { backgroundColor: tc.card, alignItems: 'center', justifyContent: 'center', padding: 32 }]}>
        <View style={styles.confirmIcon}>
          <Text style={{ fontSize: 48 }}>📧</Text>
        </View>
        <Text style={[styles.confirmTitle, { color: tc.text }]}>Email Check Karo!</Text>
        <Text style={[styles.confirmSub, { color: tc.textSec }]}>
          <Text style={{ fontWeight: '700', color: tc.text }}>{email}</Text> pe confirmation link bheja gaya hai.
        </Text>
        <Text style={[styles.confirmSub2, { color: COLORS.gray400 }]}>Link pe click karo — phir login ho jaoge.</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.replace('/login')} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>Sign In Page</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => { setConfirmed(false); setEmail(''); setPassword(''); setFullName(''); }}
        >
          <Text style={styles.retryBtnText}>Dobara try karo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.root, { backgroundColor: tc.card }]}>
        <View style={[styles.hero, { paddingTop: STATUS_TOP + 20 }]}>
          <View style={styles.bubble1} />
          <View style={styles.bubble2} />
          <View style={styles.iconCircle}>
            <Text style={{ fontSize: 36 }}>✨</Text>
          </View>
          <Text style={styles.heroTitle}>Create Account</Text>
          <Text style={styles.heroSub}>Join the Rena Henna family</Text>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <View>
            <Text style={[styles.label, { color: tc.textSec }]}>Full Name</Text>
            <TextInput style={inputStyle} placeholder="Your full name" placeholderTextColor={COLORS.gray400} value={fullName} onChangeText={setFullName} />
          </View>
          <View>
            <Text style={[styles.label, { color: tc.textSec }]}>Email Address</Text>
            <TextInput style={inputStyle} placeholder="your@email.com" placeholderTextColor={COLORS.gray400} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
          </View>
          <View>
            <Text style={[styles.label, { color: tc.textSec }]}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput style={[inputStyle, { flex: 1 }]} placeholder="Min. 6 characters" placeholderTextColor={COLORS.gray400} value={password} onChangeText={setPassword} secureTextEntry={!showPass} />
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

          <TouchableOpacity style={[styles.primaryBtn, loading && { opacity: 0.6 }]} onPress={handleSignup} disabled={loading} activeOpacity={0.85}>
            {loading ? <Spinner size={20} color="#fff" /> : <Text style={styles.primaryBtnText}>Create Account</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/login')} style={styles.loginLink}>
            <Text style={{ color: tc.textSec, fontSize: 14 }}>Already have an account? </Text>
            <Text style={{ color: COLORS.primary, fontWeight: '700', fontSize: 14 }}>Sign In</Text>
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
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  loginLink: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 4 },
  // Confirmation screen
  confirmIcon: { width: 96, height: 96, backgroundColor: '#dcfce7', borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  confirmTitle: { fontWeight: '900', fontSize: 22, marginBottom: 10 },
  confirmSub: { fontSize: 14, textAlign: 'center', marginBottom: 6 },
  confirmSub2: { fontSize: 13, textAlign: 'center', marginBottom: 28 },
  retryBtn: { paddingVertical: 8 },
  retryBtnText: { color: COLORS.gray400, fontSize: 13 },
});
