import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../context/AuthContext';

const ProfileModal = ({ isOpen, onClose, onUserUpdated, initialTab = 'profile' }) => {
  const navigate = useNavigate();
  const { user: authUser, updateUser, changePassword, logout } = useAuth();
  
  const currentUser = authUser || {};

  const [activeTab, setActiveTab] = useState(initialTab || 'profile');
  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [role, setRole] = useState(currentUser.role || '');
  const [saving, setSaving] = useState(false);
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  
  // Status feedback
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Sync activeTab whenever modal opens with initialTab
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab || 'profile');
      setErrorMsg('');
      setSuccessMsg('');
      if (authUser) {
        setName(authUser.name || '');
        setEmail(authUser.email || '');
        setRole(authUser.role || 'Admin');
      }
    }
  }, [isOpen, initialTab, authUser]);

  if (!isOpen) return null;

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setErrorMsg('Name and email are required.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    try {
      const updated = await updateUser({ name: name.trim(), email: email.trim() });
      setSuccessMsg('Profile updated successfully!');
      if (onUserUpdated) onUserUpdated(updated);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      setErrorMsg('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    try {
      await changePassword({ currentPassword, newPassword });
      setSuccessMsg('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop: NOTE per user requirement, clicking background does NOT close modal */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
        /* Background click explicitly disabled to prevent closing per user requirement */
      />

      {/* Modal Dialog Card */}
      <div
        className="relative w-full max-w-[620px] bg-white dark:bg-[#15172A] rounded-[24px] shadow-[0_25px_60px_-15px_rgba(30,27,75,0.25)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] border border-[#E2E8F0] dark:border-[#222543] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 px-8 border-b border-[#E2E8F0] dark:border-[#222543] flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-indigo-50/40 dark:from-[#15172A] dark:via-[#1A1C32] dark:to-[#15172A]">
          <div>
            <h2 className="text-xl font-bold text-[#1E293B] dark:text-white">
              Account Settings
            </h2>
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              Manage your personal information, security, and session
            </p>
          </div>

          {/* Close button with tooltip */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-[#64748B] dark:text-slate-300 hover:text-[#1E293B] dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close modal"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E2E8F0] dark:border-[#222543] px-8 bg-slate-50/60 dark:bg-white/5">
          <button
            type="button"
            onClick={() => { setActiveTab('profile'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-3.5 text-xs font-semibold border-b-2 mr-6 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'border-[#6366F1] text-[#6366F1]'
                : 'border-transparent text-[#64748B] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile Information
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('security'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-3.5 text-xs font-semibold border-b-2 mr-6 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'security'
                ? 'border-[#6366F1] text-[#6366F1]'
                : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Change Password
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('session'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-3.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'session'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-[#64748B] hover:text-red-500'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 px-8 max-h-[460px] overflow-y-auto">
          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errorMsg}
            </div>
          )}

          {/* TAB 1: Profile Information */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSave} className="space-y-5">
              <div className="flex items-center gap-5 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/30 dark:from-[#1A1C32] dark:to-[#20233D] border border-[#E2E8F0] dark:border-white/10">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#A5B4FC] flex items-center justify-center text-white font-bold text-xl border-2 border-white dark:border-white/20 shadow-md">
                  {name ? name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h4 className="font-bold text-[#1E293B] dark:text-white text-base">{name}</h4>
                  <p className="text-xs text-[#64748B] dark:text-slate-400 mb-1.5">{email}</p>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#6366F1]/15 text-[#6366F1] dark:text-indigo-400 border border-[#6366F1]/20">
                    {role}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1E293B] dark:text-slate-200 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full h-11 px-3.5 rounded-xl border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-[#1A1C32] text-sm text-[#1E293B] dark:text-white focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/15 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E293B] dark:text-slate-200 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-11 px-3.5 rounded-xl border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-[#1A1C32] text-sm text-[#1E293B] dark:text-white focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/15 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E293B] dark:text-slate-200 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-[#1A1C32] text-sm text-[#1E293B] dark:text-white focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/15 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E293B] dark:text-slate-200 mb-1.5">
                    Role / Position
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-[#1A1C32] text-sm text-[#1E293B] dark:text-white focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/15 transition-all cursor-pointer"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Sales Rep">Sales Rep</option>
                    <option value="Team Lead">Team Lead</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 h-11 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 text-xs font-semibold text-[#475569] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 h-11 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold text-xs shadow-[0_4px_14px_rgba(99,102,241,0.35)] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {saving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Change Password */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1E293B] dark:text-slate-200 mb-1.5">
                  Current Password
                </label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-[#1A1C32] text-sm text-[#1E293B] dark:text-white focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/15 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E293B] dark:text-slate-200 mb-1.5">
                  New Password
                </label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-[#1A1C32] text-sm text-[#1E293B] dark:text-white focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/15 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E293B] dark:text-slate-200 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-[#1A1C32] text-sm text-[#1E293B] dark:text-white focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/15 transition-all"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="show-pass-toggle"
                  checked={showPass}
                  onChange={(e) => setShowPass(e.target.checked)}
                  className="rounded text-[#6366F1] focus:ring-[#6366F1]/20 accent-[#6366F1] cursor-pointer"
                />
                <label htmlFor="show-pass-toggle" className="text-xs text-[#64748B] dark:text-slate-400 cursor-pointer select-none">
                  Show passwords
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 h-11 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 text-xs font-semibold text-[#475569] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 h-11 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold text-xs shadow-[0_4px_14px_rgba(99,102,241,0.35)] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {saving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Logout */}
          {activeTab === 'session' && (
            <div className="p-6 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/80 dark:border-red-900/40 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>

              <div>
                <h3 className="font-bold text-[#1E293B] dark:text-white text-base">
                  Sign out of your session?
                </h3>
                <p className="text-xs text-[#64748B] dark:text-slate-400 max-w-sm mx-auto mt-1">
                  You will need to sign in again with your email and password to access LeadFlow CRM.
                </p>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 h-10 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 text-xs font-semibold text-[#475569] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-6 h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
