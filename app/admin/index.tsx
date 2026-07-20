import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getProducts, getOrders } from '../../src/lib/store';
import { Product, Order } from '../../src/lib/types';
import { useTheme } from '../../src/context/ThemeContext';
import Spinner from '../../src/components/Spinner';
import { COLORS, getThemeColors } from '../../src/constants/colors';

const STATUS_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

const statusColors: Record<string, { bg: string; text: string }> = {
  pending:   { bg: '#fefce8', text: '#a16207' },
  confirmed: { bg: '#eff6ff', text: '#1d4ed8' },
  shipped:   { bg: '#faf5ff', text: '#7e22ce' },
  delivered: { bg: '#f0fdf4', text: '#15803d' },
  cancelled: { bg: '#fef2f2', text: '#b91c1c' },
};

export default function AdminDashboard() {
  const router = useRouter();
  const { isDark } = useTheme();
  const tc = getThemeColors(isDark);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProducts(), getOrders()])
      .then(([p, o]) => { setProducts(p); setOrders(o); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const pending = orders.filter(o => o.status === 'pending').length;
  const lowStock = products.filter(p => p.stock_quantity <= 5).length;

  const stats = [
    { emoji: '📦', label: 'Products', value: String(products.length), color: COLORS.primary },
    { emoji: '🛒', label: 'Orders', value: String(orders.length), color: COLORS.purple500 },
    { emoji: '⏳', label: 'Pending', value: String(pending), color: COLORS.yellow400 },
    { emoji: '💰', label: 'Revenue', value: `Rs.${(totalRevenue / 1000).toFixed(1)}k`, color: COLORS.green500 },
    { emoji: '⚠️', label: 'Low Stock', value: String(lowStock), color: COLORS.red500 },
    { emoji: '✅', label: 'Delivered', value: String(orders.filter(o => o.status === 'delivered').length), color: '#16a34a' },
  ];

  const quickActions = [
    { emoji: '📦', label: 'Manage Products', path: '/admin/products' },
    { emoji: '🏷️', label: 'Manage Banners', path: '/admin/banners' },
    { emoji: '🔔', label: 'Send Notification', path: '/admin/notifications' },
    { emoji: '⚙️', label: 'Settings & Employees', path: '/admin/settings' },
  ];

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
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity
          style={styles.storeBtn}
          onPress={() => router.replace('/')}
          activeOpacity={0.8}
        >
          <Text style={styles.storeBtnText}>🛍️ Store</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}><Spinner /></View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 20, paddingBottom: 40 }}>
          {/* Stats grid */}
          <View style={styles.statsGrid}>
            {stats.map((s, i) => (
              <View key={i} style={[styles.statCard, { backgroundColor: tc.card }]}>
                <Text style={{ fontSize: 22, marginBottom: 4 }}>{s.emoji}</Text>
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: tc.textSec }]}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Quick actions */}
          <View>
            <Text style={[styles.sectionTitle, { color: tc.text }]}>Quick Actions</Text>
            <View style={{ gap: 10, marginTop: 12 }}>
              {quickActions.map(a => (
                <TouchableOpacity
                  key={a.path}
                  style={[styles.actionRow, { backgroundColor: tc.card }]}
                  onPress={() => router.push(a.path as any)}
                  activeOpacity={0.85}
                >
                  <Text style={{ fontSize: 24 }}>{a.emoji}</Text>
                  <Text style={[styles.actionLabel, { color: tc.text }]}>{a.label}</Text>
                  <Text style={{ color: tc.textSec, fontSize: 20 }}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recent orders */}
          <View>
            <Text style={[styles.sectionTitle, { color: tc.text }]}>Recent Orders</Text>
            {orders.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: tc.card }]}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>📋</Text>
                <Text style={[styles.emptyText, { color: tc.textSec }]}>No orders yet</Text>
              </View>
            ) : (
              <View style={{ gap: 8, marginTop: 12 }}>
                {orders.slice(0, 8).map(order => {
                  const sc = statusColors[order.status] || statusColors.pending;
                  return (
                    <View key={order.id} style={[styles.orderRow, { backgroundColor: tc.card }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.orderName, { color: tc.text }]} numberOfLines={1}>
                          {order.customer_name}
                        </Text>
                        <Text style={[styles.orderDate, { color: tc.textSec }]}>
                          {new Date(order.created_at).toLocaleDateString('en-PK')}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.orderTotal}>Rs. {order.total.toFixed(0)}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                          <Text style={[styles.statusText, { color: sc.text }]}>{order.status}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingBottom: 18, flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  backArrow: { color: '#fff', fontWeight: '700', fontSize: 18 },
  headerTitle: { flex: 1, color: '#fff', fontWeight: '900', fontSize: 20 },
  storeBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  storeBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { width: '30%', flexGrow: 1, borderRadius: 16, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  statValue: { fontSize: 18, fontWeight: '900', marginBottom: 2 },
  statLabel: { fontSize: 11, textAlign: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '800' },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  actionLabel: { flex: 1, fontWeight: '700', fontSize: 14 },
  emptyCard: { borderRadius: 16, padding: 28, alignItems: 'center', marginTop: 12 },
  emptyText: { fontSize: 13 },
  orderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 3, elevation: 1 },
  orderName: { fontWeight: '700', fontSize: 13, marginBottom: 2 },
  orderDate: { fontSize: 12 },
  orderTotal: { color: COLORS.primary, fontWeight: '800', fontSize: 13, marginBottom: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  statusText: { fontSize: 10, fontWeight: '700' },
});
