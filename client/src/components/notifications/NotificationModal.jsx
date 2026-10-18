import React, { useState } from 'react';

const initialNotifications = [
  {
    id: 1,
    title: 'New Lead Assigned',
    message: 'Ravi Kumar from ABC Corp has been assigned to you.',
    time: '10m ago',
    read: false,
    type: 'lead',
    iconBg: 'bg-indigo-50 text-[#6366F1]',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    )
  },
  {
    id: 2,
    title: 'Task Due in 1 Hour',
    message: 'Call with ABC Corp scheduled for today at 10:00 AM.',
    time: '45m ago',
    read: false,
    type: 'task',
    iconBg: 'bg-amber-50 text-amber-600',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    id: 3,
    title: 'Status Updated to Qualified',
    message: 'Priya Sharma was marked as Qualified by Sarah Lee.',
    time: '2h ago',
    read: true,
    type: 'status',
    iconBg: 'bg-emerald-50 text-emerald-600',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    id: 4,
    title: 'Pipeline Milestone Reached',
    message: 'Team achieved +12% lead conversion rate this week!',
    time: '1d ago',
    read: true,
    type: 'milestone',
    iconBg: 'bg-purple-50 text-purple-600',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    )
  }
];

const NotificationModal = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeTab, setActiveTab] = useState('all');

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const toggleRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const filtered =
    activeTab === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Popover Card */}
      <div className="absolute right-0 mt-2 w-[360px] sm:w-[400px] bg-white dark:bg-[#1A1C32] rounded-2xl shadow-[0_20px_50px_-12px_rgba(30,27,75,0.2),0_0_1px_1px_rgba(99,102,241,0.08)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)] border border-[#E2E8F0] dark:border-white/10 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
        
        {/* Header */}
        <div className="p-4 px-5 border-b border-[#E2E8F0] dark:border-white/10 flex items-center justify-between bg-gradient-to-r from-white to-slate-50 dark:from-[#1A1C32] dark:to-[#16182E]">
          <div className="flex items-center gap-2.5">
            <h3 className="font-bold text-[0.95rem] text-[#1E293B] dark:text-white">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#6366F1] text-white">
                {unreadCount} New
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-semibold text-[#6366F1] dark:text-indigo-400 hover:text-[#4F46E5] hover:underline cursor-pointer"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="text-[#94A3B8] hover:text-[#1E293B] dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-[#E2E8F0] dark:border-white/10 px-5 bg-slate-50/50 dark:bg-white/5">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-2.5 text-xs font-semibold border-b-2 mr-5 transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'border-[#6366F1] text-[#6366F1] dark:text-indigo-400'
                : 'border-transparent text-[#64748B] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-white'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'unread'
                ? 'border-[#6366F1] text-[#6366F1] dark:text-indigo-400'
                : 'border-transparent text-[#64748B] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-white'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-[#E2E8F0]/60 dark:divide-white/10">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#94A3B8] dark:text-slate-500">
              No notifications in this view.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleRead(item.id)}
                className={`p-4 flex items-start gap-3.5 hover:bg-[#F8FAFC] dark:hover:bg-white/5 transition-colors cursor-pointer ${
                  !item.read ? 'bg-[#EEF2FF]/40 dark:bg-indigo-500/10' : ''
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg}`}
                >
                  {item.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className={`text-xs truncate ${!item.read ? 'font-bold text-[#1E293B] dark:text-white' : 'font-semibold text-[#334155] dark:text-slate-300'}`}>
                      {item.title}
                    </p>
                    <span className="text-[10px] text-[#94A3B8] dark:text-slate-400 shrink-0 font-medium">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748B] dark:text-slate-400 leading-relaxed line-clamp-2">
                    {item.message}
                  </p>
                </div>

                {!item.read && (
                  <span className="w-2 h-2 rounded-full bg-[#6366F1] shrink-0 mt-1.5" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 px-5 border-t border-[#E2E8F0] dark:border-white/10 flex items-center justify-between bg-slate-50/70 dark:bg-white/5">
            <button
              onClick={clearAll}
              className="text-[11px] text-[#94A3B8] dark:text-slate-400 hover:text-red-500 font-medium transition-colors cursor-pointer"
            >
              Clear all
            </button>
            <span className="text-[11px] text-[#64748B] dark:text-slate-400 font-medium">
              LeadFlow Notifications
            </span>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationModal;
