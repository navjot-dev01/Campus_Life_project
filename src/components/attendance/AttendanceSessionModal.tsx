import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { AttendanceSession, Subject } from '../../types';
import { Modal } from '../common/Modal';
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
  ShieldAlert,
  AlertCircle
} from 'lucide-react';

export const AttendanceSessionModal: React.FC = () => {
  const { currentUser } = useAuth();
  const { isStartSessionOpen, closeStartSession, triggerRefresh, showToast } = useApp();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [classSection, setClassSection] = useState('CSE 3rd Year');
  const [durationMinutes, setDurationMinutes] = useState(5);
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [copied, setCopied] = useState(false);

  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const list = api.getSubjects();
    setSubjects(list);
    if (list.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(list[0].id); // DBMS by default
    }

    // Check if an existing session is active
    const sessions = api.getActiveSessions();
    const current = sessions.find(s => s.isActive);
    if (current) {
      setActiveSession(current);
    }
  }, [isStartSessionOpen]);

  // QR Code Renderer
  useEffect(() => {
    if (activeSession && qrCanvasRef.current) {
      QRCode.toCanvas(
        qrCanvasRef.current,
        activeSession.qrCodeData || activeSession.code,
        {
          width: 180,
          margin: 1,
          color: {
            dark: '#1e1b4b',
            light: '#ffffff'
          }
        },
        err => {
          if (err) console.error('QR rendering error:', err);
        }
      );
    }
  }, [activeSession]);

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
        setActiveSession(prev => prev ? { ...prev, isActive: false } : null);
        triggerRefresh();
        showToast({
          type: 'warning',
          title: 'Session Expired',
          message: `Attendance session for ${activeSession.subjectName} has automatically concluded.`
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeSession, triggerRefresh, showToast]);

  const handleStartSession = () => {
    const session = api.startAttendanceSession(
      selectedSubjectId,
      classSection,
      durationMinutes * 60
    );
    setActiveSession(session);
    triggerRefresh();
    showToast({
      type: 'success',
      title: 'Attendance Session Live',
      message: `Session started for ${session.subjectName}. Code: ${session.code}`
    });
  };

  const handleEndSession = () => {
    if (!activeSession) return;
    api.endAttendanceSession(activeSession.id);
    setActiveSession(prev => prev ? { ...prev, isActive: false } : null);
    triggerRefresh();
    showToast({
      type: 'info',
      title: 'Session Ended',
      message: 'The attendance session has been closed manually.'
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
    <Modal
      isOpen={isStartSessionOpen}
      onClose={closeStartSession}
      title={activeSession && activeSession.isActive ? 'Live Attendance Console' : 'Start Attendance Session'}
      subtitle="CampusLife Faculty Portal"
      maxWidth="md"
    >
      {activeSession && activeSession.isActive ? (
        <div className="space-y-4 text-center">
          {/* Active Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Broadcasting Active Session</span>
          </div>

          {/* Session Overview Card */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-left space-y-1">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-indigo-700 font-semibold tracking-wide uppercase">
                  Subject & Class
                </p>
                <h4 className="text-base font-bold text-slate-900 mt-0.5">
                  {activeSession.subjectName}
                </h4>
                <p className="text-xs text-slate-600">
                  Class: <span className="font-semibold text-slate-800">{activeSession.classSection}</span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-semibold text-slate-500 block">Time Remaining</span>
                <span className="text-2xl font-mono font-bold text-indigo-700">
                  {formatTimer(remainingSeconds)}
                </span>
              </div>
            </div>
          </div>

          {/* 6-Digit Code Presentation */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-medium block mb-1">
              Temporary 6-Digit Attendance Code
            </span>
            <div className="flex items-center justify-center gap-3">
              <span
                id="faculty-displayed-code"
                className="text-4xl font-mono font-extrabold tracking-[0.25em] text-indigo-900 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200"
              >
                {activeSession.code}
              </span>
              <button
                onClick={copyCode}
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                title="Copy code"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Code expires automatically when the timer reaches 00:00.
            </p>
          </div>

          {/* QR Code Canvas */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center">
            <p className="text-xs font-semibold text-slate-700 mb-2">
              Scan QR Code to Mark Attendance
            </p>
            <div className="p-2.5 bg-white rounded-xl shadow-xs border border-slate-200 inline-block">
              <canvas ref={qrCanvasRef} className="rounded-lg" />
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
              Students within 200m campus boundary can scan or type the code.
            </p>
          </div>

          {/* Controls */}
          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={handleEndSession}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors"
            >
              <StopCircle className="w-4 h-4" />
              <span>End Session Now</span>
            </button>
            <button
              onClick={closeStartSession}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
            >
              Done / Keep Running
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Launch a time-limited attendance broadcast. The system automatically creates a unique 6-digit code, dynamic QR code, and enforces student geofencing.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Subject
            </label>
            <select
              id="faculty-subject-select"
              value={selectedSubjectId}
              onChange={e => setSelectedSubjectId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-white"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.code}: {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Class / Section
            </label>
            <input
              id="faculty-class-input"
              type="text"
              value={classSection}
              onChange={e => setClassSection(e.target.value)}
              placeholder="e.g. CSE 3rd Year"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Session Expiry Duration
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[5, 10, 15].map(min => (
                <button
                  key={min}
                  type="button"
                  onClick={() => setDurationMinutes(min)}
                  className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
                    durationMinutes === min
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  {min} Minutes
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Short expiry windows prevent out-of-classroom proxy check-ins.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeStartSession}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              id="faculty-confirm-start-btn"
              onClick={handleStartSession}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Start Attendance</span>
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
