import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  StyleSheet,
} from 'react-native';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { changeLocalPassword, saveLocalSession } from '../../src/lib/auth';
import { Profile } from '../../src/lib/types';
import BackHeader from '../../src/components/BackHeader';
import Spinner from '../../src/components/Spinner';
import { COLORS, getThemeColors } from '../../src/constants/colors';

export default function AdminSettingsScreen() {
  const { profile, setProfile } = useAuth();
  const { isDark } = useTheme();
  const tc = getThemeColors(isDark);

  const [curPass, setCurPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [employees, setEmployees] = useState<Profile[]>([]);
  const [empLoading, setEmpLoading] = useState(true);
  const [showEmpModal, setShowEmpModal] = useState(false);
  const [editEmp, setEditEmp] = useState<Profile | null>(null);
  const [empForm, setEmpForm] = useState({ full_name: '', email: '', local_password: '' });
  const [empSaving, setEmpSaving] = useState(false);
  const [empMsg, setEmpMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchEmployees = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'employee').order('created_at', { ascending: false });
    setEmployees(data ?? []);
    setEmpLoading(false);
  };
  useEffect(() => { fetchEmployees(); }, []);

  const handleChangePassword = async () => {
    if (!newPass || !curPass) { setPassMsg({ type: 'err', text: 'Please fill all fields.' }); return; }
    if (newPass !== confirmPass) { setPassMsg({ type: 'err', text: 'New passwords do not match.' }); return; }
    setPassLoading(true); setPassMsg(null);
    const result = await changeLocalPassword(profile!.id, curPass, newPass);
    setPassLoading(false);
    if (result.error) { setPassMsg({ type: 'err', text: result.error }); return; }
    setPassMsg({ type: 'ok', text: 'Password changed successfully!' });
    setCurPass(''); setNewPass(''); setConfirmPass('');
    const { data } = await supabase.from('profiles').select('*').eq('id', profile!.id).single();
    if (data) { await saveLocalSession(data); setProfile(data); }
  };

  const openAddEmp = () => {
    setEditEmp(null);
    setEmpForm({ full_name: '', email: '', local_password: '' });
    setEmpMsg(null);
    setShowEmpModal(true);
  };

  const openEditEmp = (emp: Profile) => {
    setEditEmp(emp);
    setEmpForm({ full_name: emp.full_name, email: emp.email, local_password: (emp as any).local_password || '' });
    setEmpMsg(null);
    setShowEmpModal(true);
  };

  const handleSaveEmp = async () => {
    if (!empForm.full_name.trim() || !empForm.email.trim() || !empForm.local_password.trim()) {
      setEmpMsg({ type: 'err', text: 'All fields are required.' }); return;
    }
    if (empForm.local_password.length < 6) {
      setEmpMsg({ type: 'err', text: 'Password must be at least 6 characters.' }); return;
    }
    setEmpSaving(true); setEmpMsg(null);
    try {
      if (editEmp) {
        const { error } = await supabase.from('profiles').update({
          full_name: empForm.full_name.trim(),
          email: empForm.email.trim().toLowerCase(),
          local_password: empForm.local_password,
        }).eq('id', editEmp.id);
        if (error) throw error;
      } else {
        const empId = 'emp-' + empForm.email.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
        const { error } = await supabase.from('profiles').insert({
          id: empId,
          full_name: empForm.full_name.trim(),
          email: empForm.email.trim().toLowerCase(),
          local_password: empForm.local_password,
          role: 'employee',
        });
        if (error) throw error;
      }
      setShowEmpModal(false);
      await fetchEmployees();
    } catch (e: any) {
      setEmpMsg({ type: 'err', text: e.message || 'Failed to save.' });
    } finally {
      setEmpSaving(false);
    }
  };

  const handleDeleteEmp = async (id: string) => {
    await supabase.from('profiles').delete().eq('id', id);
    setDeleteConfirm(null);
    fetchEmployees();
  };

  const inputStyle = [styles.input, { backgroundColor: tc.inputBg, borderColor: tc.border, color: tc.text }];

  return (
    <View style={[styles.root, { backgroundColor: tc.bg }]}>
      <BackHeader title="Admin Settings" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }}>

        {/* Change Password */}
        <View style={[styles.card, { backgroundColor: tc.card }]}>
          <View style={styles.cardHeader}>
            <Text style={{ fontSize: 24 }}>🔐</Text>
            <View>
              <Text style={[styles.cardTitle, { color: tc.text }]}>Change Your Password</Text>
              <Text style={[styles.cardSub, { color: tc.textSec }]}>{profile?.email}</Text>
            </View>
          </View>
          <View style={{ gap: 12, marginTop: 14 }}>
            <View>
              <Text style={[styles.label, { color: tc.textSec }]}>Current Password</Text>
              <TextInput style={inputStyle} secureTextEntry placeholder="Enter current password" placeholderTextColor={COLORS.gray400} value={curPass} onChangeText={setCurPass} />
            </View>
            <View>
              <Text style={[styles.label, { color: tc.textSec }]}>New Password</Text>
              <TextInput style={inputStyle} secureTextEntry placeholder="Min. 6 characters" placeholderTextColor={COLORS.gray400} value={newPass} onChangeText={setNewPass} />
            </View>
            <View>
              <Text style={[styles.label, { color: tc.textSec }]}>Confirm New Password</Text>
              <TextInput style={inputStyle} secureTextEntry placeholder="Repeat new password" placeholderTextColor={COLORS.gray400} value={confirmPass} onChangeText={setConfirmPass} />
            </View>
            {!!passMsg && (
              <View style={[styles.msgBox, { backgroundColor: passMsg.type === 'ok' ? '#f0fdf4' : '#fef2f2' }]}>
                <Text style={{ color: passMsg.type === 'ok' ? '#15803d' : COLORS.red500, fontSize: 13, fontWeight: '600' }}>
                  {passMsg.type === 'ok' ? '✅' : '❌'} {passMsg.text}
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={[styles.primaryBtn, passLoading && { opacity: 0.6 }]}
              onPress={handleChangePassword}
              disabled={passLoading}
              activeOpacity={0.85}
            >
              {passLoading ? <Spinner size={18} color="#fff" /> : <Text style={styles.primaryBtnText}>Change Password</Text>}
            </TouchableOpacity>
          </View>
        </View>

        {/* Employee Management */}
        <View style={[styles.card, { backgroundColor: tc.card }]}>
          <View style={[styles.empHeader, { borderBottomColor: tc.border }]}>
            <View style={styles.cardHeader}>
              <Text style={{ fontSize: 24 }}>👥</Text>
              <Text style={[styles.cardTitle, { color: tc.text }]}>Employees</Text>
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={openAddEmp} activeOpacity={0.8}>
              <Text style={styles.addBtnText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {empLoading ? (
            <View style={{ paddingVertical: 24, alignItems: 'center' }}><Spinner size={24} /></View>
          ) : employees.length === 0 ? (
            <View style={{ paddingVertical: 28, alignItems: 'center' }}>
              <Text style={{ fontSize: 30, marginBottom: 6 }}>👤</Text>
              <Text style={[styles.emptyText, { color: tc.textSec }]}>No employees yet</Text>
            </View>
          ) : employees.map((emp, i) => (
            <View key={emp.id} style={[styles.empRow, i < employees.length - 1 && { borderBottomWidth: 1, borderBottomColor: tc.border }]}>
              <View style={styles.empAvatar}>
                <Text style={styles.empAvatarText}>{emp.full_name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.empName, { color: tc.text }]} numberOfLines={1}>{emp.full_name}</Text>
                <Text style={[styles.empEmail, { color: tc.textSec }]} numberOfLines={1}>{emp.email}</Text>
              </View>
              <View style={styles.empBtns}>
                <TouchableOpacity style={styles.editEmpBtn} onPress={() => openEditEmp(emp)} activeOpacity={0.7}>
                  <Text style={styles.editEmpText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.delEmpBtn} onPress={() => setDeleteConfirm(emp.id)} activeOpacity={0.7}>
                  <Text style={styles.delEmpText}>Del</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Employee Modal */}
      <Modal visible={showEmpModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setShowEmpModal(false)} activeOpacity={1} />
          <View style={[styles.modalSheet, { backgroundColor: tc.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: tc.border }]}>
              <Text style={[styles.modalTitle, { color: tc.text }]}>{editEmp ? 'Edit Employee' : 'Add Employee'}</Text>
              <TouchableOpacity onPress={() => setShowEmpModal(false)}>
                <Text style={{ fontSize: 22, color: COLORS.gray400 }}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }} keyboardShouldPersistTaps="handled">
              <View>
                <Text style={[styles.label, { color: tc.textSec }]}>Full Name *</Text>
                <TextInput style={inputStyle} placeholder="Employee name" placeholderTextColor={COLORS.gray400} value={empForm.full_name} onChangeText={t => setEmpForm(f => ({ ...f, full_name: t }))} />
              </View>
              <View>
                <Text style={[styles.label, { color: tc.textSec }]}>Email *</Text>
                <TextInput
                  style={[inputStyle, editEmp && { opacity: 0.6 }]}
                  placeholder="employee@email.com"
                  placeholderTextColor={COLORS.gray400}
                  value={empForm.email}
                  onChangeText={t => setEmpForm(f => ({ ...f, email: t }))}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!editEmp}
                />
                {!!editEmp && <Text style={[styles.hint, { color: COLORS.gray400 }]}>Email cannot be changed.</Text>}
              </View>
              <View>
                <Text style={[styles.label, { color: tc.textSec }]}>{editEmp ? 'New Password' : 'Password *'}</Text>
                <TextInput style={inputStyle} secureTextEntry placeholder="Min. 6 characters" placeholderTextColor={COLORS.gray400} value={empForm.local_password} onChangeText={t => setEmpForm(f => ({ ...f, local_password: t }))} />
              </View>
              {!!empMsg && (
                <View style={[styles.msgBox, { backgroundColor: empMsg.type === 'ok' ? '#f0fdf4' : '#fef2f2' }]}>
                  <Text style={{ color: empMsg.type === 'ok' ? '#15803d' : COLORS.red500, fontSize: 13, fontWeight: '600' }}>{empMsg.text}</Text>
                </View>
              )}
              <View style={styles.modalBtns}>
                <TouchableOpacity style={[styles.cancelBtn, { borderColor: tc.border }]} onPress={() => setShowEmpModal(false)} activeOpacity={0.8}>
                  <Text style={[{ fontWeight: '700', fontSize: 14 }, { color: tc.textSec }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.saveModalBtn, empSaving && { opacity: 0.6 }]} onPress={handleSaveEmp} disabled={empSaving} activeOpacity={0.85}>
                  {empSaving ? <Spinner size={18} color="#fff" /> : <Text style={styles.saveBtnText}>{editEmp ? 'Save Changes' : 'Add Employee'}</Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Delete Confirm */}
      <Modal visible={!!deleteConfirm} transparent animationType="fade">
        <View style={styles.confirmOverlay}>
          <View style={[styles.confirmBox, { backgroundColor: tc.card }]}>
            <Text style={{ fontSize: 32, textAlign: 'center', marginBottom: 10 }}>⚠️</Text>
            <Text style={[styles.confirmTitle, { color: tc.text }]}>Delete Employee?</Text>
            <Text style={[styles.confirmSub, { color: tc.textSec }]}>Yeh employee delete ho jaega.</Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={[styles.cancelBtn, { borderColor: tc.border }]} onPress={() => setDeleteConfirm(null)} activeOpacity={0.8}>
                <Text style={[{ fontWeight: '700', fontSize: 14 }, { color: tc.textSec }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteConfirm && handleDeleteEmp(deleteConfirm)} activeOpacity={0.85}>
                <Text style={styles.deleteBtnText}>Delete</Text>
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
  card: { borderRadius: 20, padding: 18, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardTitle: { fontSize: 15, fontWeight: '800' },
  cardSub: { fontSize: 12 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 11, fontSize: 14 },
  msgBox: { borderRadius: 10, padding: 12 },
  primaryBtn: { backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 14, alignItems: 'center', shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  empHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 14, borderBottomWidth: 1, marginBottom: 6 },
  addBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  emptyText: { fontSize: 13 },
  empRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  empAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
  empAvatarText: { color: COLORS.blue600, fontWeight: '900', fontSize: 14 },
  empName: { fontWeight: '700', fontSize: 14 },
  empEmail: { fontSize: 12 },
  empBtns: { flexDirection: 'row', gap: 8 },
  editEmpBtn: { backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  editEmpText: { color: COLORS.blue600, fontWeight: '700', fontSize: 12 },
  delEmpBtn: { backgroundColor: '#fef2f2', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  delEmpText: { color: COLORS.red500, fontWeight: '700', fontSize: 12 },
  hint: { fontSize: 11, marginTop: 4 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: '900' },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancelBtn: { flex: 1, borderWidth: 2, borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  saveModalBtn: { flex: 1, backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  confirmOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  confirmBox: { borderRadius: 24, padding: 24, width: '100%', maxWidth: 360 },
  confirmTitle: { fontSize: 18, fontWeight: '900', textAlign: 'center', marginBottom: 6 },
  confirmSub: { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  deleteBtn: { flex: 1, backgroundColor: COLORS.red500, borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  deleteBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
