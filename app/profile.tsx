import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import BottomNav from '../src/components/BottomNav';
import Spinner from '../src/components/Spinner';
import { COLORS, getThemeColors } from '../src/constants/colors';

const STATUS_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, signOut, loading } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const tc = getThemeColors(isDark);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await signOut(); router.replace('/'); } },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: tc.card }]}>
        <Spinner />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.root, { backgroundColor: tc.card }]}>
        <View style={[styles.header, { paddingTop: STATUS_TOP + 8 }]}>
          <Text style={styles.headerTitle}>Profile 👤</Text>
        </View>
        <View style={styles.guestContainer}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>👤</Text>
          <Text style={[styles.guestTitle, { color: tc.text }]}>Sign In to Continue</Text>
          <Text style={[styles.guestSub, { color: tc.textSec }]}>View your orders and manage your account</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/login')} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.secondaryBtn, { borderColor: tc.border }]} onPress={() => router.push('/signup')} activeOpacity={0.85}>
            <Text style={[styles.secondaryBtnText, { color: tc.text }]}>Create Account</Text>
          </TouchableOpacity>
        </View>
        <BottomNav />
      </View>
    );
  }

  const roleColors: Record<string, object> = {
    admin: { backgroundColor: '#f3e8ff', borderColor: '#d8b4fe' },
    employee: { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' },
    customer: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  };
  const roleTextColors: Record<string, string> = {
    admin: '#7e22ce',
    employee: '#1d4ed8',
    customer: '#15803d',
  };

  const menuItems = [
    ...(profile.role === 'admin' ? [
      { emoji: '📊', label: 'Admin Dashboard', action: () => router.push('/admin' as any) },
      { emoji: '📦', label: 'Manage Products', action: () => router.push('/admin/products' as any) },
      { emoji: '🏷️', label: 'Manage Banners', action: () => router.push('/admin/banners' as any) },
      { emoji: '⚙️', label: 'Settings & Employees', action: () => router.push('/admin/settings' as any) },
    ] : []),
    ...(profile.role === 'employee' ? [
      { emoji: '📦', label: 'Employee Dashboard', action: () => router.push('/employee' as any) },
    ] : []),
    { emoji: theme === 'dark' ? '☀️' : '🌙', label: theme === 'dark' ? 'Light Mode' : 'Dark Mode', action: toggleTheme },
    { emoji: '🛍️', label: 'Continue Shopping', action: () => router.push('/shop') },
    { emoji: '🚪', label: 'Sign Out', action: handleSignOut, danger: true },
  ];

  return (
    <View style={[styles.root, { backgroundColor: tc.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={[styles.header, { paddingTop: STATUS_TOP + 8 }]}>
          <Text style={styles.headerTitle}>Profile 👤</Text>
        </View>

        {/* Profile card */}
        <View style={[styles.profileCard, { backgroundColor: tc.card, marginTop: -12 }]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile.full_name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={[styles.name, { color: tc.text }]}>{profile.full_name}</Text>
          <Text style={[styles.email, { color: tc.textSec }]}>{profile.email}</Text>
          <View style={[styles.roleBadge, roleColors[profile.role] || roleColors.customer]}>
            <Text style={[styles.roleText, { color: roleTextColors[profile.role] || roleTextColors.customer }]}>
              {profile.role.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Menu */}
        <View style={[styles.menu, { backgroundColor: tc.card }]}>
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={i}
              onPress={item.action}
              style={[styles.menuItem, i < menuItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: tc.border }]}
              activeOpacity={0.7}
            >
              <Text style={styles.menuEmoji}>{item.emoji}</Text>
              <Text style={[styles.menuLabel, { color: item.danger ? COLORS.red500 : tc.text }]}>{item.label}</Text>
              <Text style={{ color: tc.border, fontSize: 18 }}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.version}>Rena Henna v1.0 • Natural Beauty</Text>
      </ScrollView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingBottom: 24 },
  headerTitle: { color: '#fff', fontWeight: '900', fontSize: 24 },
  guestContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  guestTitle: { fontSize: 20, fontWeight: '800' },
  guestSub: { fontSize: 14, textAlign: 'center', marginBottom: 8 },
  profileCard: { marginHorizontal: 16, borderRadius: 20, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, marginBottom: 16 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { color: '#fff', fontWeight: '900', fontSize: 32 },
  name: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  email: { fontSize: 13, marginBottom: 12 },
  roleBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  roleText: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  menu: { marginHorizontal: 16, borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 14 },
  menuEmoji: { fontSize: 20, width: 28, textAlign: 'center' },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '600' },
  version: { textAlign: 'center', color: COLORS.gray400, fontSize: 12, marginTop: 20, marginBottom: 8 },
  primaryBtn: { width: '100%', backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 16, alignItems: 'center', shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  secondaryBtn: { width: '100%', borderWidth: 2, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  secondaryBtnText: { fontWeight: '700', fontSize: 15 },
});
