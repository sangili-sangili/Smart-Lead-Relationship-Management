import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

const stats = [
  {
    id: 'total_leads',
    label: 'Total Leads',
    value: '120',
    trend: '12%',
    gradient: 'from-indigo-50/90 via-white to-purple-50/70',
    borderColor: 'border-indigo-100/90 hover:border-indigo-300/80',
    shadowColor: 'hover:shadow-[0_20px_35px_-10px_rgba(99,102,241,0.22)]',
    iconBg: 'bg-gradient-to-br from-[#818CF8] to-[#6366F1] shadow-indigo-500/25',
    accentDot: 'bg-indigo-500',
    circleColor1: 'bg-indigo-500/10',
    circleColor2: 'bg-purple-400/20',
    circleColor3: 'bg-indigo-300/15',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  },
  {
    id: 'qualified_leads',
    label: 'Qualified Leads',
    value: '45',
    trend: '8%',
    gradient: 'from-emerald-50/90 via-white to-teal-50/70',
    borderColor: 'border-emerald-100/90 hover:border-emerald-300/80',
    shadowColor: 'hover:shadow-[0_20px_35px_-10px_rgba(16,185,129,0.22)]',
    iconBg: 'bg-gradient-to-br from-[#34D399] to-[#10B981] shadow-emerald-500/25',
    accentDot: 'bg-emerald-500',
    circleColor1: 'bg-emerald-500/10',
    circleColor2: 'bg-teal-400/20',
    circleColor3: 'bg-emerald-300/15',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    id: 'tasks_due',
    label: 'Tasks Due Today',
    value: '8',
    trend: '2%',
    gradient: 'from-amber-50/90 via-white to-orange-50/70',
    borderColor: 'border-amber-100/90 hover:border-amber-300/80',
    shadowColor: 'hover:shadow-[0_20px_35px_-10px_rgba(245,158,11,0.22)]',
    iconBg: 'bg-gradient-to-br from-[#FBBF24] to-[#F59E0B] shadow-amber-500/25',
    accentDot: 'bg-amber-500',
    circleColor1: 'bg-amber-500/10',
    circleColor2: 'bg-orange-400/20',
    circleColor3: 'bg-yellow-300/15',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    id: 'completed_tasks',
    label: 'Completed Tasks',
    value: '30',
    trend: '15%',
    gradient: 'from-blue-50/90 via-white to-sky-50/70',
    borderColor: 'border-blue-100/90 hover:border-blue-300/80',
    shadowColor: 'hover:shadow-[0_20px_35px_-10px_rgba(59,130,246,0.22)]',
    iconBg: 'bg-gradient-to-br from-[#60A5FA] to-[#3B82F6] shadow-blue-500/25',
    accentDot: 'bg-blue-500',
    circleColor1: 'bg-blue-500/10',
    circleColor2: 'bg-sky-400/20',
    circleColor3: 'bg-blue-300/15',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 13l4 4L19 7" />
      </svg>
    )
  }
];

// Leads by Status configuration
// Circumference = 2 * Math.PI * 44 = 276.46
// Proportional distribution across 105 leads (normalized to 276.46 circumference)
const statusData = [
  {
    label: 'New',
    count: 32,
    percentage: '27%',
    color: '#3B82F6',
    dashLength: 84.25,
    dashOffset: 0,
    lightBg: 'bg-blue-50 text-blue-700'
  },
  {
    label: 'Contacted',
    count: 28,
    percentage: '23%',
    color: '#06B6D4',
    dashLength: 73.72,
    dashOffset: -84.25,
    lightBg: 'bg-cyan-50 text-cyan-700'
  },
  {
    label: 'Qualified',
    count: 25,
    percentage: '21%',
    color: '#10B981',
    dashLength: 65.82,
    dashOffset: -157.97,
    lightBg: 'bg-emerald-50 text-emerald-700'
  },
  {
    label: 'Lost',
    count: 12,
    percentage: '10%',
    color: '#F97316',
    dashLength: 31.60,
    dashOffset: -223.79,
    lightBg: 'bg-orange-50 text-orange-700'
  },
  {
    label: 'Converted',
    count: 8,
    percentage: '7%',
    color: '#8B5CF6',
    dashLength: 21.07,
    dashOffset: -255.39,
    lightBg: 'bg-purple-50 text-purple-700'
  }
];

const upcomingTasks = [
  {
    id: 1,
    title: 'Call with ABC Corp',
    time: 'Today, 10:00 AM',
    priority: 'High',
    badgeClass: 'bg-red-50 text-red-600 border border-red-200/80',
    iconBg: 'bg-red-50 text-red-500',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    )
  },
  {
    id: 2,
    title: 'Send proposal to Acme Corp',
    time: 'Today, 2:00 PM',
    priority: 'Medium',
    badgeClass: 'bg-amber-50 text-amber-600 border border-amber-200/80',
    iconBg: 'bg-purple-50 text-purple-600',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    )
  },
  {
    id: 3,
    title: 'Follow up with Priya',
    time: 'Tomorrow, 11:00 AM',
    priority: 'Medium',
    badgeClass: 'bg-amber-50 text-amber-600 border border-amber-200/80',
    iconBg: 'bg-cyan-50 text-cyan-600',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    )
  },
  {
    id: 4,
    title: 'Demo for Globex',
    time: 'Tomorrow, 4:00 PM',
    priority: 'Low',
    badgeClass: 'bg-slate-100 text-slate-600 border border-slate-200/90',
    iconBg: 'bg-orange-50 text-orange-500',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )
  }
];

const DashboardPage = () => {
  const [hoveredStatus, setHoveredStatus] = useState(null);

  return (
    <div className="space-y-7 animate-fade-in-up">
      {/* Title & Greeting with Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-[1.85rem] font-bold text-[#1E293B] tracking-tight mb-1">
            Dashboard
          </h1>
          <p className="text-sm text-[#64748B]">
            Welcome back, here's what's happening with your CRM.
          </p>
        </div>

        {/* Quick Date & Refresh Indicator */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-[#64748B] bg-white/70 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-slate-200/60 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Data updated just now</span>
        </div>
      </div>

      {/* Top 4 KPI Summary Cards with Gradient, Multiple Circles & Hover Lift */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <div
            key={stat.id}
            className={`group relative overflow-hidden bg-gradient-to-br ${stat.gradient} rounded-[24px] p-6 border ${stat.borderColor} ${stat.shadowColor} shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:-translate-y-2 transition-all duration-300 cursor-pointer flex flex-col justify-between`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {/* Multiple Background Decorative Circle Shapes */}
            {/* Shape 1: Large blurred glow in bottom right corner */}
            <div
              className={`absolute -right-7 -bottom-7 w-32 h-32 rounded-full ${stat.circleColor1} blur-2xl group-hover:scale-135 group-hover:opacity-90 transition-all duration-500 pointer-events-none`}
            />
            {/* Shape 2: Medium soft geometric circle top right */}
            <div
              className={`absolute top-2 right-6 w-16 h-16 rounded-full ${stat.circleColor2} blur-lg group-hover:-translate-y-1.5 group-hover:translate-x-1.5 group-hover:scale-110 transition-all duration-500 pointer-events-none`}
            />
            {/* Shape 3: Subtle accent circle bottom left */}
            <div
              className={`absolute -left-4 -bottom-4 w-16 h-16 rounded-full ${stat.circleColor3} blur-md group-hover:scale-110 transition-all duration-500 pointer-events-none`}
            />
            {/* Shape 4: Small sharp floating circle */}
            <div
              className={`absolute top-10 right-20 w-3 h-3 rounded-full ${stat.accentDot} opacity-20 group-hover:opacity-40 group-hover:scale-125 transition-all duration-300 pointer-events-none`}
            />

            {/* Card Content (Elevated above background circles) */}
            <div className="relative z-10">
              {/* Top Row: Icon + Label */}
              <div className="flex items-center gap-3.5 mb-5">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-md ${stat.iconBg} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}
                >
                  {stat.icon}
                </div>
                <span className="text-[0.85rem] font-semibold text-[#475569] group-hover:text-[#1E293B] transition-colors">
                  {stat.label}
                </span>
              </div>

              {/* Bottom Row: Metric Value + Trend Badge */}
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-[2.25rem] font-black text-[#1E293B] tracking-tight leading-none group-hover:scale-105 origin-left transition-transform duration-300">
                  {stat.value}
                </span>
                <span className="text-xs font-bold text-[#10B981] bg-emerald-50/90 border border-emerald-200/60 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  {stat.trend}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Section: Leads by Status (Enlarged Graph) & Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: Leads by Status with ENLARGED Donut Graph */}
        <div className="bg-white rounded-[26px] p-6 sm:p-7 lg:p-8 border border-[#E2E8F0]/80 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
          
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50/40 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6 relative z-10">
            <div>
              <h2 className="text-[1.15rem] font-bold text-[#1E293B] tracking-tight">
                Leads by Status
              </h2>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Distribution across 120 active pipeline leads
              </p>
            </div>
            <div className="text-xs font-medium text-[#64748B] bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200/60 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1]" />
              <span>Pipeline Stage</span>
            </div>
          </div>

          {/* Donut Chart & Legend Section */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8 py-2 relative z-10">
            
            {/* ENLARGED Donut Chart SVG matching Figma (Size increased to w-64 h-64 sm:w-72 sm:h-72) */}
            <div className="relative w-60 h-60 sm:w-72 sm:h-72 shrink-0 flex items-center justify-center">
              <svg
                className="w-full h-full -rotate-90 filter drop-shadow-xs"
                viewBox="0 0 120 120"
              >
                {/* 
                  Radius r = 44, Circumference C = 2 * PI * 44 = 276.46
                  StrokeWidth = 22 for thick, prominent Figma donut graph
                */}
                {/* Base subtle track ring */}
                <circle
                  cx="60"
                  cy="60"
                  r="44"
                  fill="transparent"
                  stroke="#F1F5F9"
                  strokeWidth="22"
                />

                {/* Render status segments */}
                {statusData.map((item) => {
                  const isHovered = hoveredStatus?.label === item.label;
                  return (
                    <circle
                      key={item.label}
                      cx="60"
                      cy="60"
                      r="44"
                      fill="transparent"
                      stroke={item.color}
                      strokeWidth={isHovered ? 24 : 22}
                      strokeDasharray={`${item.dashLength} 276.46`}
                      strokeDashoffset={item.dashOffset}
                      className="transition-all duration-300 cursor-pointer"
                      style={{
                        opacity: hoveredStatus ? (isHovered ? 1 : 0.45) : 1
                      }}
                      onMouseEnter={() => setHoveredStatus(item)}
                      onMouseLeave={() => setHoveredStatus(null)}
                    />
                  );
                })}
              </svg>

              {/* Central Donut Typography Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-all duration-200">
                <span className="text-4xl sm:text-[2.75rem] font-black text-[#1E293B] leading-none mb-1 tracking-tight">
                  {hoveredStatus ? hoveredStatus.count : '120'}
                </span>
                <span className="text-xs sm:text-[0.825rem] font-semibold text-[#64748B] tracking-wide">
                  {hoveredStatus ? hoveredStatus.label : 'Total Leads'}
                </span>
                {hoveredStatus && (
                  <span className="text-[11px] font-bold text-[#6366F1] mt-0.5 animate-pulse">
                    {hoveredStatus.percentage} of pipeline
                  </span>
                )}
              </div>
            </div>

            {/* Legend Breakdown with Interactive Hover */}
            <div className="w-full sm:w-auto flex-1 space-y-2.5">
              {statusData.map((item) => {
                const isHovered = hoveredStatus?.label === item.label;
                return (
                  <div
                    key={item.label}
                    onMouseEnter={() => setHoveredStatus(item)}
                    onMouseLeave={() => setHoveredStatus(null)}
                    className={`flex items-center justify-between p-2.5 rounded-xl transition-all duration-200 cursor-pointer border ${
                      isHovered
                        ? 'bg-slate-50 border-slate-300 shadow-xs translate-x-1'
                        : 'border-transparent hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 ring-2 ring-white shadow-xs transition-transform duration-200"
                        style={{
                          backgroundColor: item.color,
                          transform: isHovered ? 'scale(1.25)' : 'scale(1)'
                        }}
                      />
                      <span className={`text-xs sm:text-sm font-semibold transition-colors ${
                        isHovered ? 'text-[#1E293B]' : 'text-[#475569]'
                      }`}>
                        {item.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-[#1E293B]">
                        {item.count}
                      </span>
                      <span className="text-xs font-medium text-[#94A3B8]">
                        ({item.percentage})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Card 2: Upcoming Tasks */}
        <div className="bg-white rounded-[26px] p-6 sm:p-7 lg:p-8 border border-[#E2E8F0]/80 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
          
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-50/40 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-[1.15rem] font-bold text-[#1E293B] tracking-tight">
                  Upcoming Tasks
                </h2>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  High-priority customer milestones for today
                </p>
              </div>
              <Link
                to={ROUTES.TASKS}
                className="text-xs font-bold text-[#6366F1] hover:text-[#4F46E5] hover:underline transition-colors flex items-center gap-1 group"
              >
                <span>View All</span>
                <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Task Items List with Smooth Hover Effects */}
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl hover:bg-[#F8FAFC] border border-transparent hover:border-slate-200/80 transition-all duration-200 group cursor-pointer hover:shadow-xs hover:translate-x-1"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${task.iconBg} group-hover:scale-105 transition-transform`}
                    >
                      {task.icon}
                    </div>
                    <div className="truncate">
                      <p className="text-xs sm:text-sm font-semibold text-[#1E293B] group-hover:text-[#6366F1] transition-colors truncate">
                        {task.title}
                      </p>
                      <p className="text-[11px] text-[#94A3B8] flex items-center gap-1.5 mt-0.5">
                        <svg className="w-3 h-3 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{task.time}</span>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-3 py-1 rounded-full shrink-0 shadow-xs ${task.badgeClass}`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Bottom Action inside Tasks card */}
          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between relative z-10">
            <span className="text-xs text-[#94A3B8]">
              4 pending activities for this week
            </span>
            <Link
              to={ROUTES.TASKS}
              className="text-xs font-semibold text-[#475569] hover:text-[#1E293B] flex items-center gap-1"
            >
              + Create task
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
