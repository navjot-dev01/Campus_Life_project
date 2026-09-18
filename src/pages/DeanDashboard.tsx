import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { User, Achievement, Notice } from '../types';
import {
  GraduationCap,
  Award,
  Users,
  CheckCheck,
  FileText,
  Bell,
  CheckCircle2,
  TrendingUp,
  Building2,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Sparkles,
  ClipboardCheck
} from 'lucide-react';

interface DeanDashboardProps {
  setCurrentTab: (tab: string) => void;
}

export const DeanDashboard: React.FC<DeanDashboardProps> = ({ setCurrentTab }) => {
  const { currentUser } = useAuth();
  const { refreshKey, triggerRefresh, showToast } = useApp();

  const [students, setStudents] = useState<User[]>([]);
  const [faculty, setFaculty] = useState<User[]>([]);
  const [pendingAchievements, setPendingAchievements] = useState<Achievement[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    const allUsers = api.getAllUsers();
    setStudents(allUsers.filter(u => u.role === 'student'));
    setFaculty(allUsers.filter(u => u.role === 'faculty'));
    setPendingAchievements(api.getAllPendingAchievements());
    setNotices(api.getNotices());
  }, [refreshKey]);

  const handleApprove = (achId: string, studentName: string) => {
    api.verifyRecord('achievement', achId, 'verified_institution', `${currentUser.name} (Dean of Academic Affairs)`);
    triggerRefresh();
    showToast({
      type: 'success',
      title: 'Achievement Authorized',
      message: `Approved academic honor for ${studentName}`
    });
  };

  return (
    <div className="space-y-6">
      {/* Dean Executive Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider px-3 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              Office of the Dean • Academic Leadership
            </span>
            <span className="text-xs text-indigo-300">• {currentUser.department}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-2 font-sans">
            Welcome, {currentUser.name}
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200/90 mt-1 max-w-2xl">
            Overseeing academic curriculum excellence, accreditation benchmarks, student honors, and faculty governance.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setCurrentTab('achievements')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold shadow-md transition-all active:scale-98"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Review Honor Roll Queue ({pendingAchievements.length})</span>
          </button>
        </div>
      </div>

      {/* Dean Academic KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Student Body</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{students.length * 480 || 1440}</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Across 4 Engineering Cohorts</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Faculty Members</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">64</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Active across 6 departments</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Institutional Attendance</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">83.4%</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">+2.1% above statutory threshold</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Honor Endorsements</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{pendingAchievements.length}</p>
          <p className="text-[11px] text-amber-600 font-medium mt-1">Awaiting Dean signature</p>
        </div>
      </div>

      {/* Main Dean Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Academic Excellence & Honor Roll Approvals */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-600" />
                  <span>Dean's Academic Honors & Credentials Verification</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct student applications for the Dean's List and verified research certifications.
                </p>
              </div>
              <button
                onClick={() => setCurrentTab('achievements')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>View All Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {pendingAchievements.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-800">Honor Roll Queue Up to Date</p>
                <p className="text-xs text-slate-500 mt-1">
                  All submitted student achievements and academic awards have been reviewed.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingAchievements.slice(0, 3).map(ach => (
                  <div
                    key={ach.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-100/70 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                          {ach.category}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{ach.studentName}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-800 mt-1">{ach.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{ach.description}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleApprove(ach.id, ach.studentName)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Authorize</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Department Academic Performance */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>Departmental Course Performance Benchmarks</span>
            </h2>

            <div className="space-y-3">
              {[
                { code: 'CS601', name: 'Database Management Systems (DBMS)', lead: 'Dr. Rajesh Sharma', att: 86, pass: 94 },
                { code: 'CS602', name: 'Operating Systems', lead: 'Prof. S. Rao', att: 74, pass: 88, warn: true },
                { code: 'CS603', name: 'Computer Networks', lead: 'Dr. A. Mehra', att: 82, pass: 91 },
                { code: 'CS604', name: 'Design & Analysis of Algorithms', lead: 'Dr. N. Gupta', att: 78, pass: 89 },
                { code: 'CS605', name: 'Artificial Intelligence & ML', lead: 'Dr. Rajesh Sharma', att: 71, pass: 86, warn: true }
              ].map(course => (
                <div
                  key={course.code}
                  className="p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-700">{course.code}</span>
                      <span className="text-xs font-semibold text-slate-800">{course.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Faculty Lead: {course.lead}</p>
                  </div>

                  <div className="text-right">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      course.warn ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {course.att}% Attendance
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">{course.pass}% Projected Pass</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Dean Directives & Institutional Circulars */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-600" />
                <span>Academic Circulars</span>
              </h2>
              <button
                onClick={() => setCurrentTab('notices')}
                className="text-[11px] font-semibold text-indigo-600 hover:underline"
              >
                Manage
              </button>
            </div>

            <div className="space-y-3">
              {notices.slice(0, 3).map(not => (
                <div key={not.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                    {not.category}
                  </span>
                  <h4 className="text-xs font-semibold text-slate-800 mt-1">{not.title}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{not.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Faculty Duty Attendance Monitoring Quick Card */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                  <ClipboardCheck className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-900">Faculty Duty Attendance</h3>
              </div>
              <button
                onClick={() => setCurrentTab('faculty-duty-monitoring')}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>View Roster</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Monitor daily faculty check-ins, teaching stations, and duty logs separate from student attendance.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-indigo-50/60 border border-indigo-100 text-indigo-950">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <h3 className="text-xs font-bold">Academic Governance Policy</h3>
            </div>
            <p className="text-xs text-indigo-900/80 mt-2 leading-relaxed">
              As Dean of Academic Affairs, your authorizations directly certify student transcripts, honor roll rolls, and SIH nominations with digital institutional signatures.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
