import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  CalendarCheck2,
  BookOpen,
  FileText,
  Calendar,
  Bell,
  Sparkles,
  User,
  Users,
  CheckCheck,
  Radio,
  Clock,
  LogOut,
  Bot,
  MessageSquare,
  FileCheck2,
  Award,
  ShieldCheck,
  Settings,
  ClipboardList,
  ClipboardCheck
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
  highlight?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const { isStudent, isFaculty, isDean, isAdmin, logout, currentUser } = useAuth();
  const { activeSessions } = useApp();

  const activeCount = activeSessions.filter(s => s.isActive).length;

  const studentNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: CalendarCheck2,
      badge: activeCount > 0 ? `${activeCount} Live` : undefined,
      badgeColor: 'bg-emerald-500 text-white'
    },
    { id: 'assignments', label: 'Assignments', icon: BookOpen },
    { id: 'exams', label: 'Exams', icon: FileText },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'notices', label: 'Notices', icon: Bell },
    {
      id: 'support',
      label: 'Student Support',
      icon: Bot
    },
    {
      id: 'my-journey',
      label: 'My Journey',
      icon: Sparkles
    },
    {
      id: 'profile',
      label: 'My Profile',
      icon: User
    },
    {
      id: 'resume-builder',
      label: 'Resume Builder',
      icon: FileCheck2,
      highlight: true
    }
  ];

  const facultyNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Faculty Dashboard', icon: LayoutDashboard },
    {
      id: 'attendance',
      label: 'Take Student Attendance',
      icon: Radio,
      badge: activeCount > 0 ? `${activeCount} Live` : undefined,
      badgeColor: 'bg-emerald-500 text-white'
    },
    {
      id: 'faculty-attendance',
      label: 'Faculty Duty Attendance',
      icon: ClipboardList
    },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'assignments', label: 'Assignments', icon: BookOpen },
    { id: 'exams', label: 'Exams', icon: FileText },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'notices', label: 'Notices', icon: Bell },
    {
      id: 'support',
      label: 'Faculty Assistance',
      icon: Bot
    },
    {
      id: 'achievements',
      label: 'Achievements Queue',
      icon: CheckCheck,
      highlight: true
    },
    {
      id: 'profile',
      label: 'Faculty Profile',
      icon: User
    }
  ];

  const deanNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dean Dashboard', icon: LayoutDashboard },
    {
      id: 'achievements',
      label: 'Honor Roll Verifications',
      icon: Award,
      highlight: true
    },
    { id: 'students', label: 'Student Cohorts', icon: Users },
    {
      id: 'faculty-duty-monitoring',
      label: 'Faculty Duty Logs',
      icon: ClipboardCheck
    },
    { id: 'notices', label: 'Academic Circulars', icon: Bell },
    { id: 'events', label: 'Academic Events', icon: Calendar },
    { id: 'support', label: 'Academic Helpdesk', icon: Bot },
    { id: 'profile', label: 'Dean Profile', icon: User }
  ];

  const adminNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'User Directory', icon: Users },
    { id: 'system-console', label: 'System Console', icon: Settings },
    { id: 'notices', label: 'Institutional Notices', icon: Bell },
    { id: 'events', label: 'Campus Events', icon: Calendar },
    { id: 'support', label: 'System Helpdesk', icon: Bot },
    { id: 'profile', label: 'Admin Profile', icon: User }
  ];

  const items = isStudent
    ? studentNavItems
    : isFaculty
    ? facultyNavItems
    : isDean
    ? deanNavItems
    : adminNavItems;

  const sectionLabel = isStudent
    ? 'Student Menu'
    : isFaculty
    ? 'Faculty Console'
    : isDean
    ? 'Dean of Academic Affairs'
    : 'System Administration';

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200 shrink-0 md:min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          {sectionLabel}
        </div>

        <nav className="space-y-1">
          {items.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                } ${item.highlight && !isActive ? 'text-indigo-900 font-semibold' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive
                        ? 'text-indigo-600'
                        : item.highlight
                        ? 'text-indigo-500'
                        : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* College Info Card & Logout in Sidebar */}
      <div className="mt-8 space-y-3">
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
          <p className="font-semibold text-slate-800">CampusLife Institute</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Academic Session 2025–2026</p>
          <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
            <span>Geofence Radius:</span>
            <span className="font-semibold text-slate-700">200 meters</span>
          </div>
        </div>

        <button
          id="sidebar-logout-btn"
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
