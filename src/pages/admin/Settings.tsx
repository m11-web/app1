import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { changeLocalPassword, saveLocalSession } from '../../lib/auth';
import { Profile } from '../../lib/types';
import Spinner from '../../components/Spinner';

export default function AdminSettings() {
  const nav = useNavigate();
  const { profile, setProfile } = useAuth();

  // ── Change Password ──
  const [curPass, setCurPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // ── Employees ──
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

  // ── Change Admin Password ──
  const handleChangePassword = async () => {
    if (!newPass || !curPass) { setPassMsg({ type: 'err', text: 'Please fill all fields.' }); return; }
    if (newPass !== confirmPass) { setPassMsg({ type: 'err', text: 'New passwords do not match.' }); return; }
    setPassLoading(true); setPassMsg(null);
    const result = await changeLocalPassword(profile!.id, curPass, newPass);
    setPassLoading(false);
    if (result.error) { setPassMsg({ type: 'err', text: result.error }); return; }
    setPassMsg({ type: 'ok', text: 'Password changed successfully!' });
    setCurPass(''); setNewPass(''); setConfirmPass('');
    // Refresh local session
    const { data } = await supabase.from('profiles').select('*').eq('id', profile!.id).single();
    if (data) { saveLocalSession(data); setProfile(data); }
  };

  // ── Employee CRUD ──
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
        // Generate a custom ID for employee
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

  const inp = "w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-primary transition-colors";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-12">
      {/* Header */}
      <div className="bg-primary px-5 pt-12 pb-5 flex items-center gap-4">
        <button onClick={() => nav('/admin')} className="bg-white/20 text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg">←</button>
        <h1 className="text-white font-black text-xl flex-1">Admin Settings</h1>
      </div>

      <div className="p-4 space-y-5">

        {/* ── Change Admin Password ── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">🔐</span>
            <div>
              <h2 className="font-extrabold text-gray-900 dark:text-white text-base">Change Your Password</h2>
              <p className="text-gray-400 text-xs">{profile?.email}</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Current Password</label>
            <input className={inp} type="password" placeholder="Enter current password" value={curPass} onChange={e => setCurPass(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">New Password</label>
            <input className={inp} type="password" placeholder="Min. 6 characters" value={newPass} onChange={e => setNewPass(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Confirm New Password</label>
            <input className={inp} type="password" placeholder="Repeat new password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} />
          </div>

          {passMsg && (
            <div className={`px-4 py-3 rounded-xl text-sm font-semibold ${passMsg.type === 'ok' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
              {passMsg.type === 'ok' ? '✅' : '❌'} {passMsg.text}
            </div>
          )}

          <button onClick={handleChangePassword} disabled={passLoading}
            className="w-full bg-primary text-white font-extrabold py-3.5 rounded-2xl text-sm shadow-lg shadow-primary/30 disabled:opacity-60 flex items-center justify-center gap-2">
            {passLoading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Changing...</> : 'Change Password'}
          </button>
        </div>

        {/* ── Employee Management ── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👥</span>
              <h2 className="font-extrabold text-gray-900 dark:text-white text-base">Employees</h2>
            </div>
            <button onClick={openAddEmp} className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full">+ Add</button>
          </div>

          {empLoading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : employees.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-3xl mb-2">👤</p>
              <p className="text-gray-400 text-sm">No employees yet</p>
            </div>
          ) : (
            <div>
              {employees.map((emp, i) => (
                <div key={emp.id} className={`flex items-center gap-3 px-5 py-4 ${i < employees.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}>
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center font-black text-blue-600 text-sm flex-shrink-0">
                    {emp.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{emp.full_name}</p>
                    <p className="text-gray-400 text-xs truncate">{emp.email}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => openEditEmp(emp)}
                      className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-bold px-3 py-1.5 rounded-full">Edit</button>
                    <button onClick={() => setDeleteConfirm(emp.id)}
                      className="text-xs bg-red-50 dark:bg-red-900/20 text-red-500 font-bold px-3 py-1.5 rounded-full">Del</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Employee Add/Edit Modal */}
      {showEmpModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center" onClick={() => setShowEmpModal(false)}>
          <div className="bg-white dark:bg-gray-900 w-full max-w-[430px] rounded-t-3xl" onClick={e => e.stopPropagation()}>
            <div className="px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="font-black text-gray-900 dark:text-white text-lg">{editEmp ? 'Edit Employee' : 'Add Employee'}</h2>
              <button onClick={() => setShowEmpModal(false)} className="text-gray-400 text-2xl w-8 h-8 flex items-center justify-center">×</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Full Name *</label>
                <input className={inp} placeholder="Employee name" value={empForm.full_name} onChange={e => setEmpForm(f => ({ ...f, full_name: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Email *</label>
                <input className={inp} type="email" placeholder="employee@email.com" value={empForm.email}
                  onChange={e => setEmpForm(f => ({ ...f, email: e.target.value }))}
                  disabled={!!editEmp} />
                {editEmp && <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">{editEmp ? 'New Password' : 'Password *'}</label>
                <input className={inp} type="password" placeholder="Min. 6 characters" value={empForm.local_password} onChange={e => setEmpForm(f => ({ ...f, local_password: e.target.value }))} />
              </div>

              {empMsg && (
                <div className={`px-4 py-3 rounded-xl text-sm font-semibold ${empMsg.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                  {empMsg.text}
                </div>
              )}

              <button onClick={handleSaveEmp} disabled={empSaving}
                className="w-full bg-primary text-white font-extrabold py-4 rounded-2xl text-base shadow-lg shadow-primary/30 disabled:opacity-60 flex items-center justify-center gap-2">
                {empSaving ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> : (editEmp ? 'Save Changes' : 'Add Employee')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-6">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center">
            <p className="text-3xl mb-3">⚠️</p>
            <h3 className="font-black text-gray-900 dark:text-white text-lg mb-2">Delete Employee?</h3>
            <p className="text-gray-500 text-sm mb-6">Yeh employee delete ho jaega.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 dark:border-gray-700 font-bold text-gray-600 dark:text-gray-300">Cancel</button>
              <button onClick={() => handleDeleteEmp(deleteConfirm)} className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-bold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
