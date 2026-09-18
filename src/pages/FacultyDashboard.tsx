import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { AttendanceSession, User } from '../types';
import {
  Radio,
  Users,
  CheckCheck,
  Percent,
  BookOpen,
  Bell,
  ArrowRight,
  ShieldCheck,
  Clock,
  MapPin,
  CalendarCheck2
} from 'lucide-react';

interface FacultyDashboardProps {
  setCurrentTab: (tab: string) => void;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({ setCurrentTab }) => {
  const { currentUser } = useAuth();
  const { refreshKey, openStartSession, activeSessions } = useApp();

  const [students, setStudents] = useState<User[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const list = api.getAllUsers().filter(u => u.role === 'student');
    setStudents(list);
    const pendingAch = api.getAllPendingAchievements().length;
    const pendingPart = api.getAllPendingParticipations().length;
    setPendingCount(pendingAch + pendingPart);
  }, [refreshKey]);

  const active = activeSessions.find(s => s.isActive);

  // Compute average student attendance in department
  const avgAttendance = 78;

  return (
    <div className="space-y-6">
      {/* Faculty Hero Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              Faculty Administration Console
            </span>
            <span className="text-xs text-indigo-300">• {currentUser.department}</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight mt-1.5 font-sans">
            Welcome, {currentUser.name}
          </h1>
          <p className="text-xs text-indigo-200 mt-1 max-w-xl">
            Computer Science & Engineering • Department Academic Lead • CampusLife Portal
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="faculty-quick-start-session-cta"
            onClick={openStartSession}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold shadow-md transition-all active:scale-98"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>{active ? 'Manage Live Attendance' : 'Start Attendance Session'}</span>
          </button>
        </div>
      </div>

      {/* Active Session Alert if running */}
      {active && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div>
              <p className="text-xs font-bold">
                Live Attendance Broadcasting: {active.subjectName} ({active.classSection})
              </p>
              <p className="text-[11px] text-emerald-700">
                Attendance Code: <strong className="font-mono text-xs">{active.code}</strong> • Geofence verification active
              </p>
            </div>
          </div>
          <button
            onClick={() => setCurrentTab('attendance')}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
          >
            View Live Session →
          </button>
        </div>
      )}

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Active Broadcasts */}
        <div
          onClick={() => setCurrentTab('attendance')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-indigo-200 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Live Attendance</span>
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {active ? '1 Active' : 'Idle'}
          </p>
          <span className="text-[11px] text-slate-500 block mt-1">
            {active ? `${active.subjectName.split(' ')[0]}` : 'Ready for class broadcast'}
          </span>
        </div>

        {/* 2. Department Students */}
        <div
          onClick={() => setCurrentTab('students')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-indigo-200 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Enrolled Students</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {students.length} Registered
          </p>
          <span className="text-[11px] text-slate-500 block mt-1">
            CSE 3rd Year Cohort
          </span>
        </div>

        {/* 3. Pending Verifications */}
        <div
          onClick={() => setCurrentTab('achievements')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-indigo-200 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Verification Queue</span>
            <CheckCheck className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {pendingCount} Pending
          </p>
          <span className="text-[11px] text-amber-700 font-medium block mt-1">
            Achievements & Participations
          </span>
        </div>

        {/* 4. Cohort Attendance */}
        <div
          onClick={() => setCurrentTab('students')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-indigo-200 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Cohort Avg Attendance</span>
            <Percent className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {avgAttendance}%
          </p>
          <span className="text-[11px] text-slate-500 block mt-1">
            2 students below 75% warning
          </span>
        </div>
      </div>

      {/* Quick Access Faculty Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={openStartSession}
          className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 hover:bg-indigo-50 transition-all cursor-pointer flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Broadcast Class Attendance</h4>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Generate 6-digit code, QR code & start geofence lock.
            </p>
          </div>
        </div>

        <div
          onClick={() => setCurrentTab('assignments')}
          className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 hover:bg-purple-50 transition-all cursor-pointer flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Post Coursework Assignment</h4>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Create homework or lab tasks for enrolled batches.
            </p>
          </div>
        </div>

        <div
          onClick={() => setCurrentTab('achievements')}
          className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 hover:bg-amber-50 transition-all cursor-pointer flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
            <CheckCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Review Student Portfolios</h4>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Verify hackathon prizes, sports, and certifications.
            </p>
          </div>
        </div>
      </div>

      {/* Student Directory Snapshot */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Student Attendance Directory Snapshot</h3>
            <p className="text-xs text-slate-500">Real-time attendance percentages and status indicators</p>
          </div>
          <button
            onClick={() => setCurrentTab('students')}
            className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1"
          >
            View all students <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] uppercase font-semibold text-slate-400">
                <th className="pb-3">Student Name</th>
                <th className="pb-3">Roll ID</th>
                <th className="pb-3">Branch & Year</th>
                <th className="pb-3">Cumulative Attendance</th>
                <th className="pb-3">Standing Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map(student => {
                const analytics = api.getStudentAttendanceAnalytics(student.id);
                return (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 flex items-center gap-2.5 font-bold text-slate-900">
                      <img
                        src={student.avatarUrl}
                        alt={student.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <span>{student.name}</span>
                    </td>
                    <td className="py-3 font-mono text-slate-500">{student.studentId}</td>
                    <td className="py-3 text-slate-600">{student.branch} • {student.year}</td>
                    <td className="py-3 font-mono font-bold text-slate-900">
                      <span className={analytics.isWarning ? 'text-rose-600' : 'text-emerald-700'}>
                        {analytics.overallPercentage}%
                      </span>
                    </td>
                    <td className="py-3">
                      {analytics.isWarning ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          ⚠️ Below 75% Warning
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ✓ Good Standing
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
