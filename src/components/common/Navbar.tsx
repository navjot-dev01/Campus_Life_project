import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  GraduationCap,
  Radio,
  ChevronDown,
  MapPin,
  LogOut,
  User as UserIcon,
  RotateCcw,
  ArrowLeftRight,
  Users
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { currentUser, logout, isStudent, isFaculty, isDean, isAdmin } = useAuth();
  const { activeSessions, openMarkAttendance, openStartSession, resetAllDemoData } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);

  if (!currentUser) return null;

  const activeSessionCount = activeSessions.filter(s => s.isActive).length;

  const roleBadgeText = isStudent
    ? 'Student Portal'
    : isFaculty
    ? 'Faculty Console'
    : isDean
    ? 'Dean Office'
    : 'Admin Console';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-sm">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">
                  Campus<span className="text-indigo-600">Life</span>
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {roleBadgeText}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                CampusLife – Student Journey Platform
              </p>
            </div>
          </div>

          {/* Quick Action Center */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Active Attendance Indicator */}
            {activeSessionCount > 0 && (
              <div
                onClick={() => isStudent ? openMarkAttendance() : setCurrentTab('attendance')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium cursor-pointer hover:bg-emerald-100 transition-colors"
                title="Active attendance session is currently open!"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="font-semibold">{activeSessionCount} Session Active</span>
              </div>
            )}

            {isStudent && (
              <button
                id="navbar-mark-attendance-btn"
                onClick={openMarkAttendance}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs font-semibold shadow-xs transition-all"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Mark Attendance</span>
              </button>
            )}

            {isFaculty && (
              <button
                id="navbar-start-session-btn"
                onClick={openStartSession}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs font-semibold shadow-xs transition-all"
              >
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>Start Attendance</span>
              </button>
            )}

            {/* Authenticated User Profile Menu */}
            <div className="relative">
              <button
                id="user-account-menu-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-slate-100/70 transition-colors"
                aria-label="User Account Menu"
              >
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-300"
                />
                <div className="text-left hidden md:block">
                  <p className="text-xs font-semibold text-slate-800 leading-tight">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-500">
                    {currentUser.role === 'student'
                      ? `${currentUser.studentId} • ${currentUser.year}`
                      : currentUser.department || currentUser.role}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 p-2 text-xs">
                    {/* User Profile Info */}
                    <div className="p-3 bg-slate-50 rounded-xl mb-2 border border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={currentUser.name}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-100"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{currentUser.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                          <span className="inline-block text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded mt-0.5 capitalize">
                            {currentUser.role} {currentUser.studentId ? `(${currentUser.studentId})` : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setCurrentTab('profile');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-slate-700 hover:bg-slate-100 transition-colors font-medium"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <span>View Profile & Institutional Records</span>
                      </button>

                      <button
                        onClick={() => {
                          resetAllDemoData();
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        <RotateCcw className="w-4 h-4 text-slate-400" />
                        <span>Reset Workspace Data</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-100 mt-2 pt-2">
                      <button
                        id="user-logout-btn"
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors font-semibold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out of Portal</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

