import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

const ProfileModal = ({ isOpen, onClose, onUserUpdated, initialTab = 'profile' }) => {
  const navigate = useNavigate();
  const storedUser = JSON.parse(
    localStorage.getItem('leadflow_user') || '{"name":"John Doe","email":"admin@mini.crm","role":"Admin"}'
  );

  const [activeTab, setActiveTab] = useState(initialTab || 'profile');
  const [name, setName] = useState(storedUser.name || 'John Doe');
  const [email, setEmail] = useState(storedUser.email || 'admin@mini.crm');
  const [phone, setPhone] = useState(storedUser.phone || '+1 (555) 234-5678');
  const [role, setRole] = useState(storedUser.role || 'Admin');
  
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
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleProfileSave = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setErrorMsg('Name and email are required.');
      return;
    }

    const updated = { ...storedUser, name, email, phone, role };
    localStorage.setItem('leadflow_user', JSON.stringify(updated));
    setSuccessMsg('Profile updated successfully!');
    setErrorMsg('');
    if (onUserUpdated) onUserUpdated(updated);

    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handlePasswordChange = (e) => {
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

    setSuccessMsg('Password changed successfully!');
    setErrorMsg('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('leadflow_token');
    localStorage.removeItem('leadflow_user');
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
        className="relative w-full max-w-[620px] bg-white rounded-[24px] shadow-[0_25px_60px_-15px_rgba(30,27,75,0.25)] border border-[#E2E8F0] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 px-8 border-b border-[#E2E8F0] flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-indigo-50/40">
          <div>
            <h2 className="text-xl font-bold text-[#1E293B]">
              Account Settings
            </h2>
            <p className="text-xs text-[#64748B]">
              Manage your personal information, security, and session
            </p>
          </div>

          {/* Close button with tooltip */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-[#64748B] hover:text-[#1E293B] flex items-center justify-center transition-colors cursor-pointer"
            title="Close modal"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E2E8F0] px-8 bg-slate-50/60">
          <button
            type="button"
            onClick={() => { setActiveTab('profile'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-3.5 text-xs font-semibold border-b-2 mr-6 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'border-[#6366F1] text-[#6366F1]'
                : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
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
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errorMsg}
            </div>
          )}

          {/* TAB 1: Profile Information */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSave} className="space-y-5">
              <div className="flex items-center gap-5 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/30 border border-[#E2E8F0]">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#A5B4FC] flex items-center justify-center text-white font-bold text-xl border-2 border-white shadow-md">
                  {name ? name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h4 className="font-bold text-[#1E293B] text-base">{name}</h4>
                  <p className="text-xs text-[#64748B] mb-1.5">{email}</p>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#6366F1]/15 text-[#6366F1] border border-[#6366F1]/20">
                    {role}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full h-11 px-3.5 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#1E293B] focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/15 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-11 px-3.5 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#1E293B] focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/15 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#1E293B] focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/15 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                    Role / Position
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#1E293B] focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/15 transition-all cursor-pointer"
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
                  className="px-5 h-11 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-[#475569] hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 h-11 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold text-xs shadow-[0_4px_14px_rgba(99,102,241,0.35)] transition-all cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Change Password */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                  Current Password
                </label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#1E293B] focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/15 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                  New Password
                </label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#1E293B] focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/15 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#1E293B] focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/15 transition-all"
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
                <label htmlFor="show-pass-toggle" className="text-xs text-[#64748B] cursor-pointer select-none">
                  Show passwords
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 h-11 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-[#475569] hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 h-11 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold text-xs shadow-[0_4px_14px_rgba(99,102,241,0.35)] transition-all cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Logout */}
          {activeTab === 'session' && (
            <div className="p-6 rounded-2xl bg-red-50/50 border border-red-200/80 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>

              <div>
                <h3 className="font-bold text-[#1E293B] text-base">
                  Sign out of your session?
                </h3>
                <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1">
                  You will need to sign in again with your email and password to access LeadFlow CRM.
                </p>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 h-10 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-[#475569] hover:bg-slate-50 transition-colors cursor-pointer"
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
