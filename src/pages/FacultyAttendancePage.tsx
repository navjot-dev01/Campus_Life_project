import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { api, DEFAULT_GEOFENCE } from '../services/api';
import { AttendanceSession, Subject } from '../types';
import QRCode from 'qrcode';
import {
  Radio,
  Clock,
  QrCode,
  KeyRound,
  StopCircle,
  Copy,
  Check,
  Users,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertTriangle
} from 'lucide-react';

export const FacultyAttendancePage: React.FC = () => {
  const { isFaculty, isAdmin } = useAuth();
  const { refreshKey, triggerRefresh, openStartSession, showToast } = useApp();

  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [copied, setCopied] = useState(false);
  const [recentRecords, setRecentRecords] = useState<any[]>([]);

  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const sessions = api.getActiveSessions();
    const current = sessions.find(s => s.isActive);
    setActiveSession(current || null);

    // Fetch all recent check-in logs
    const history = api.getAllRecentAttendanceLogs();
    setRecentRecords(history);
  }, [refreshKey]);

  // Countdown timer
  useEffect(() => {
    if (!activeSession || !activeSession.isActive) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = new Date(activeSession.expiryTime).getTime();
      const diff = Math.max(0, Math.floor((expiry - now) / 1000));
      setRemainingSeconds(diff);

      if (diff <= 0 && activeSession.isActive) {
        api.endAttendanceSession(activeSession.id);
        setActiveSession(prev => (prev ? { ...prev, isActive: false } : null));
        triggerRefresh();
        showToast({
          type: 'warning',
          title: 'Session Expired',
          message: 'The attendance broadcast has completed.'
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeSession, triggerRefresh, showToast]);

  // Render QR Code on canvas
  useEffect(() => {
    if (activeSession && qrCanvasRef.current) {
      QRCode.toCanvas(
        qrCanvasRef.current,
        activeSession.qrCodeData || activeSession.code,
        {
          width: 200,
          margin: 1,
          color: {
            dark: '#1e1b4b',
            light: '#ffffff'
          }
        },
        err => {
          if (err) console.error('QR render error:', err);
        }
      );
    }
  }, [activeSession]);

  const handleEndSession = () => {
    if (!activeSession) return;
    api.endAttendanceSession(activeSession.id);
    setActiveSession(prev => (prev ? { ...prev, isActive: false } : null));
    triggerRefresh();
    showToast({
      type: 'info',
      title: 'Session Concluded',
      message: 'Attendance broadcast ended manually.'
    });
  };

  const copyCode = () => {
    if (activeSession) {
      navigator.clipboard.writeText(activeSession.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
            Live Attendance Console
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-1 font-sans">
            Attendance Broadcasting & Verification
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Campus Geofence: {DEFAULT_GEOFENCE.allowedRadiusMeters}m radius • Single submission lock enforced
          </p>
        </div>

        {!activeSession && (
          <button
            id="start-attendance-primary-btn"
            onClick={openStartSession}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all active:scale-98"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Start Attendance Session</span>
          </button>
        )}
      </div>

      {/* ACTIVE BROADCAST CONSOLE (Displayed prominent when session is active) */}
      {activeSession && activeSession.isActive ? (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 text-white shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-xs uppercase tracking-wider font-bold text-emerald-400">
                  Live Broadcast In Progress
                </span>
              </div>
              <h3 className="text-2xl font-black text-white mt-1">
                {activeSession.subjectName}
              </h3>
              <p className="text-xs text-indigo-200 mt-0.5">
                Target Cohort: <strong className="text-white">{activeSession.classSection}</strong> • Geofence: 200m
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 text-center min-w-[120px]">
                <span className="text-[11px] text-indigo-200 block uppercase font-bold tracking-wider">
                  Time Remaining
                </span>
                <span className="text-3xl font-mono font-black text-amber-300">
                  {formatTimer(remainingSeconds)}
                </span>
              </div>
              <button
                onClick={handleEndSession}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition-all"
              >
                <StopCircle className="w-4 h-4" />
                <span>End Session</span>
              </button>
            </div>
          </div>

          {/* Broadcast Output Grid: Large 6-digit Code + Dynamic QR Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* 6-Digit Code Display */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 text-center space-y-3">
              <span className="text-xs text-indigo-200 uppercase font-bold tracking-wider">
                Student Attendance Code
              </span>
              <div className="flex items-center justify-center gap-3">
                <span
                  id="faculty-displayed-big-code"
                  className="text-5xl sm:text-6xl font-mono font-black tracking-[0.25em] text-white bg-white/10 px-6 py-3 rounded-2xl border border-white/20 shadow-inner"
                >
                  {activeSession.code}
                </span>
                <button
                  onClick={copyCode}
                  className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Copy code"
                >
                  {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-indigo-200/80">
                Display this code on classroom projector or announce to students.
              </p>
            </div>

            {/* Dynamic QR Code Canvas */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center text-center">
              <span className="text-xs text-indigo-200 uppercase font-bold tracking-wider mb-3">
                Scan QR Code with CampusLife App
              </span>
              <div className="p-3 bg-white rounded-2xl shadow-xl border border-white/20 inline-block">
                <canvas ref={qrCanvasRef} className="rounded-xl" />
              </div>
              <p className="text-xs text-indigo-200/80 mt-3">
                Students can scan directly using camera or enter the 6-digit code.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-300 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mx-auto">
            <Radio className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">No Active Attendance Session</h3>
            <p className="text-xs text-slate-500 mt-1">
              Select your subject and launch an attendance broadcast. Students in the classroom will be able to verify physical location and log presence.
            </p>
          </div>
          <button
            onClick={openStartSession}
            className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all"
          >
            Launch Attendance Broadcast
          </button>
        </div>
      )}

      {/* Real-time Student Check-in Roster Table */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Live Student Check-In Roster</h3>
            <p className="text-xs text-slate-500">
              Verified submissions with student coordinates & distance calculations
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-500">
            {recentRecords.length} records logged
          </span>
        </div>

        {recentRecords.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No attendance check-ins recorded yet. Start a session to receive student submissions.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase font-semibold text-slate-400">
                  <th className="pb-3">Student Name</th>
                  <th className="pb-3">Subject</th>
                  <th className="pb-3">Check-in Time</th>
                  <th className="pb-3">Input Method</th>
                  <th className="pb-3">Geofence Distance</th>
                  <th className="pb-3">Integrity Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentRecords.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 font-bold text-slate-900">
                      {rec.studentName}
                    </td>
                    <td className="py-3 text-slate-600">{rec.subjectName}</td>
                    <td className="py-3 font-mono text-slate-500">
                      {new Date(rec.markedAt).toLocaleTimeString()}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono uppercase text-[10px]">
                        {rec.verificationMethod}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-slate-600">
                      {rec.distanceMeters}m (Inside 200m)
                    </td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-semibold text-[10px] border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Location Verified ✓
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
