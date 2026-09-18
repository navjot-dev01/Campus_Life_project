import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { api, DEFAULT_GEOFENCE } from '../services/api';
import { AttendanceAnalytics } from '../types';
import { SubjectAttendanceCard } from '../components/attendance/SubjectAttendanceCard';
import { AttendanceChart } from '../components/attendance/AttendanceChart';
import {
  CalendarCheck2,
  AlertTriangle,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  History,
  Info
} from 'lucide-react';

export const StudentAttendance: React.FC = () => {
  const { currentUser } = useAuth();
  const { refreshKey, openMarkAttendance, activeSessions } = useApp();

  const [analytics, setAnalytics] = useState<AttendanceAnalytics>(() =>
    api.getStudentAttendanceAnalytics(currentUser.id)
  );

  useEffect(() => {
    setAnalytics(api.getStudentAttendanceAnalytics(currentUser.id));
  }, [currentUser.id, refreshKey]);

  const activeFacultySession = activeSessions.find(s => s.isActive);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
              Attendance Portal
            </span>
            <span className="text-xs text-slate-500">
              Campus Geofence: {DEFAULT_GEOFENCE.allowedRadiusMeters}m radius
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1 font-sans">
            Academic Attendance & Geofence Log
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Student: <strong className="text-slate-800">{currentUser.name}</strong> ({currentUser.studentId}) • {currentUser.branch}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-slate-500 block">Overall Cumulative</span>
            <span
              className={`text-3xl font-black font-mono ${
                analytics.isWarning ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              {analytics.overallPercentage}%
            </span>
          </div>
          <button
            onClick={openMarkAttendance}
            id="student-mark-attendance-page-btn"
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs font-bold shadow-md transition-all"
          >
            <MapPin className="w-4 h-4" />
            <span>Mark Attendance</span>
          </button>
        </div>
      </div>

      {/* FACULTY ATTENDANCE SESSION STATUS */}
      {activeFacultySession ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-2 border-emerald-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <span className="w-3 h-3 rounded-full bg-white animate-pulse"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Faculty Attendance Session Active
                </span>
                <span className="text-xs text-slate-500">Live now</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                {activeFacultySession.subjectName} ({activeFacultySession.subjectCode})
              </h3>
              <p className="text-xs text-slate-600">
                Class / Section: <strong>{activeFacultySession.classSection}</strong> • Code: <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">{activeFacultySession.code}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openMarkAttendance}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 self-start sm:self-auto shrink-0"
            >
              <MapPin className="w-4 h-4" />
              <span>Mark with Code {activeFacultySession.code}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">
                No faculty attendance session is currently active.
              </h4>
              <p className="text-xs text-slate-500">
                Ask your faculty to start an attendance session, or initialize a demo broadcast below.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              api.startDemoFacultySession(600);
              openMarkAttendance();
            }}
            className="px-3.5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all shrink-0"
          >
            Start Demo Faculty Session (Code: 583214)
          </button>
        </div>
      )}

      {/* CURRENT ATTENDANCE METRICS DASHBOARD (Requirement 5) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Overall Attendance</span>
          <span
            className={`text-2xl sm:text-3xl font-black font-mono mt-1 block ${
              analytics.isWarning ? 'text-rose-600' : 'text-emerald-600'
            }`}
          >
            {analytics.overallPercentage}%
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {analytics.isWarning ? 'Requires attention (<75%)' : 'Good Standing (≥75%)'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Total Classes</span>
          <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-1 block">
            {analytics.totalClasses}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Recorded this semester</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Present Classes</span>
          <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-700 mt-1 block">
            {analytics.totalPresent}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Verified on campus</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Absent Classes</span>
          <span className="text-2xl sm:text-3xl font-black font-mono text-rose-600 mt-1 block">
            {analytics.totalAbsent ?? Math.max(0, analytics.totalClasses - analytics.totalPresent)}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Missed sessions</span>
        </div>
      </div>

      {/* ATTENDANCE WARNING ALERT (Critical Requirement) */}
      {analytics.isWarning && (
        <div className="p-5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 shadow-xs flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-rose-700 bg-rose-200/80 px-2 py-0.5 rounded-md">
                Attendance Warning
              </span>
              <span className="font-bold text-rose-900">
                Current: {analytics.overallPercentage}% (Minimum 75% Required)
              </span>
            </div>
            <p className="mt-1 font-medium text-rose-900 leading-relaxed">
              Your overall attendance is below the institutional threshold. Under university guidelines, students falling below 75% are ineligible for semester end examinations without sanctioned leave.
            </p>
            <p className="mt-1.5 font-bold text-rose-950">
              Action Required: You approximately need to attend <u>{analytics.classesNeededFor75}</u> consecutive classes to elevate your attendance back to 75%.
            </p>
          </div>
        </div>
      )}

      {/* Subject-wise Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900">Subject-wise Attendance Breakdown</h3>
          <span className="text-xs text-slate-500">
            Total Classes Recorded: {analytics.totalClasses}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analytics.subjectWise.map(subj => (
            <SubjectAttendanceCard key={subj.subjectId} summary={subj} />
          ))}
        </div>
      </div>

      {/* Attendance Chart & Geofence Policy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AttendanceChart subjectWise={analytics.subjectWise} />
        </div>

        {/* Geofence & Integrity Guidelines */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between text-xs space-y-3">
          <div>
            <div className="flex items-center gap-2 text-indigo-700 font-bold mb-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Geofence & Integrity Policy</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Attendance sessions broadcast by professors expire after 2–5 minutes. CampusLife performs a location handshake using the spherical Haversine formula against the college campus coordinates.
            </p>
            <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-[11px] text-slate-600">
              <p>📍 <strong>College Coordinates:</strong> {DEFAULT_GEOFENCE.latitude}, {DEFAULT_GEOFENCE.longitude}</p>
              <p>🎯 <strong>Allowed Boundary:</strong> {DEFAULT_GEOFENCE.allowedRadiusMeters} meters</p>
              <p>🔒 <strong>Lock:</strong> 1 submission per student per session</p>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 italic">
            *Location verification confirms physical presence on campus at time of submission.
          </p>
        </div>
      </div>

      {/* Recent Attendance Log Table */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-900">Recent Attendance Logs</h3>
          </div>
          <span className="text-xs text-slate-500">
            {analytics.recentRecords.length} recorded sessions
          </span>
        </div>

        {analytics.recentRecords.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No recent attendance check-in records found. Click "Mark Attendance" above to mark today's class.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase font-semibold text-slate-400">
                  <th className="pb-3 font-semibold">Subject</th>
                  <th className="pb-3 font-semibold">Timestamp</th>
                  <th className="pb-3 font-semibold">Method</th>
                  <th className="pb-3 font-semibold">Distance</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics.recentRecords.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 font-bold text-slate-900">
                      {rec.subjectName}
                    </td>
                    <td className="py-3 text-slate-500 font-mono">
                      {new Date(rec.markedAt).toLocaleString()}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono uppercase text-[10px]">
                        {rec.verificationMethod}
                      </span>
                    </td>
                    <td className="py-3 text-slate-600 font-mono">
                      ~{rec.distanceMeters}m from anchor
                    </td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold text-[10px] border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified Present
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
