import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import Logo from '../components/common/Logo';
import NotificationModal from '../components/notifications/NotificationModal';
import ProfileModal from '../components/profile/ProfileModal';

const navItems = [
  {
    label: 'Dashboard',
    path: ROUTES.DASHBOARD,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )
  },
  {
    label: 'Leads',
    path: ROUTES.LEADS,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )
  },
  {
    label: 'Companies',
    path: ROUTES.COMPANIES,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  },
  {
    label: 'Tasks',
    path: ROUTES.TASKS,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    )
  }
];

const AppLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  // Profile dropdown vs modal state
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState('profile');
  
  const profileDropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem('leadflow_user') || '{"name":"John Doe","role":"Admin","email":"admin@mini.crm"}')
  );

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleUserUpdated = (updatedUser) => {
    setUser(updatedUser);
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen flex bg-[#F4F6FD] font-['Inter',sans-serif]">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-[230px] bg-[#1A1C32] bg-gradient-to-b from-[#1F213D] via-[#1A1C32] to-[#141528] text-white shrink-0 sticky top-0 h-screen z-30 select-none border-r border-[#1E2042]">
        
        {/* Top Brand Logo */}
        <div className="px-6 pt-6 pb-8">
          <Logo size={36} textColor="text-white" />
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-white font-semibold shadow-md shadow-indigo-600/20'
                    : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom User Profile */}
        <div className="p-4 pb-6">
          <div
            onClick={() => {
              setProfileModalTab('profile');
              setProfileModalOpen(true);
            }}
            className="flex items-center gap-3 px-2 py-2 cursor-pointer hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10"
            title="Open Profile Settings"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#A5B4FC] flex items-center justify-center text-white font-bold text-sm shrink-0 border border-white/20 shadow-sm">
              <span className="uppercase">{user.name ? user.name.charAt(0) : 'J'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate leading-tight">
                {user.name || 'John Doe'}
              </p>
              <p className="text-xs text-[#94A3B8] truncate">
                {user.role || 'Admin'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Mobile Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-[260px] bg-[#1A1C32] bg-gradient-to-b from-[#1F213D] via-[#1A1C32] to-[#141528] text-white flex flex-col z-50 transform transition-transform duration-300 md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-8">
          <Logo size={34} textColor="text-white" />
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="text-[#94A3B8] hover:text-white p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-white font-semibold'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Area (Top Bar + Page Content) */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Bar Header with Live Widget and Quick Actions */}
        <header className="h-[70px] bg-white border-b border-[#E2E8F0] px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20">
          
          {/* Left Area: Mobile Trigger + Live Status / Quick Action instead of search */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-[#64748B] hover:text-[#1E293B] p-1.5"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Live Pipeline Status & Date Badge */}
            <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-50 border border-[#E2E8F0] shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-[#1E293B]">Live Pipeline</span>
              <span className="text-[#CBD5E1]">•</span>
              <span className="text-xs text-[#64748B] font-medium">{todayFormatted}</span>
            </div>

            {/* Quick Action Button */}
            <Link
              to={ROUTES.LEADS}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50/80 hover:bg-indigo-100/80 text-[#6366F1] font-semibold text-xs transition-colors border border-indigo-200/50"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              <span>+ Quick Lead</span>
            </Link>
          </div>

          {/* Right Actions: Notifications & Profile Dropdown */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Notification Bell Button */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-xl text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                title="Notifications"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {/* Notification Unread Dot */}
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#6366F1] ring-2 ring-white"></span>
              </button>

              {/* Notification Popover Modal */}
              <NotificationModal
                isOpen={notificationsOpen}
                onClose={() => setNotificationsOpen(false)}
              />
            </div>

            {/* User Profile Dropdown Anchor */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-[#F8FAFC] border border-transparent hover:border-[#E2E8F0] transition-all cursor-pointer select-none"
                title="User Menu"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#A5B4FC] flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-sm shrink-0">
                  <span className="uppercase">{user.name ? user.name.charAt(0) : 'J'}</span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-[#1E293B] leading-tight">
                    {user.name || 'John Doe'}
                  </p>
                  <p className="text-[11px] text-[#64748B]">
                    {user.role || 'Admin'}
                  </p>
                </div>
                <svg
                  className={`w-3.5 h-3.5 text-[#94A3B8] transition-transform duration-200 ${
                    profileDropdownOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Profile Dropdown Menu (Shows Profile, Change Password, Logout) */}
              {profileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-[0_20px_45px_-10px_rgba(27,25,60,0.18)] border border-slate-200/90 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* User Header Summary */}
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                    <p className="text-xs font-bold text-[#1E293B] truncate">{user.name || 'John Doe'}</p>
                    <p className="text-[11px] text-[#64748B] truncate">{user.email || 'admin@mini.crm'}</p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-[#6366F1] bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                        {user.role || 'Admin'}
                      </span>
                    </div>
                  </div>

                  {/* Dropdown Options */}
                  <div className="p-1 space-y-0.5">
                    {/* Option 1: Profile */}
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setProfileModalTab('profile');
                        setProfileModalOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F8FAFC] text-left transition-colors cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#6366F1] flex items-center justify-center shrink-0 group-hover:bg-[#6366F1] group-hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#1E293B] group-hover:text-[#6366F1] transition-colors">
                          Profile
                        </p>
                        <p className="text-[10px] text-[#94A3B8]">
                          Update personal information
                        </p>
                      </div>
                    </button>

                    {/* Option 2: Change Password */}
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setProfileModalTab('security');
                        setProfileModalOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F8FAFC] text-left transition-colors cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#1E293B] group-hover:text-amber-600 transition-colors">
                          Change Password
                        </p>
                        <p className="text-[10px] text-[#94A3B8]">
                          Manage security & credentials
                        </p>
                      </div>
                    </button>

                    {/* Divider */}
                    <div className="my-1 border-t border-slate-100" />

                    {/* Option 3: Logout */}
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setProfileModalTab('session');
                        setProfileModalOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-50/80 text-left transition-colors cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0 group-hover:bg-red-600 group-hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-red-600">
                          Logout
                        </p>
                        <p className="text-[10px] text-red-400">
                          Sign out of your session
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content View */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Profile Modal (Opens after choosing an option from dropdown; does NOT close on background click) */}
      <ProfileModal
        isOpen={profileModalOpen}
        initialTab={profileModalTab}
        onClose={() => setProfileModalOpen(false)}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  );
};

export default AppLayout;
