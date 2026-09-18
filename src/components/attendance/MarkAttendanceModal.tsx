import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { api, DEFAULT_GEOFENCE } from '../../services/api';
import { Modal } from '../common/Modal';
import {
  MapPin,
  KeyRound,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ShieldCheck,
  Radio
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const MarkAttendanceModal: React.FC = () => {
  const { currentUser } = useAuth();
  const { isMarkAttendanceOpen, closeMarkAttendance, activeSessions, triggerRefresh, showToast } = useApp();

  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [locationMode, setLocationMode] = useState<'campus' | 'outside' | 'gps'>('campus');

  const [result, setResult] = useState<{
    status: 'idle' | 'success' | 'failed';
    locationStatus: string;
    message: string;
    distanceMeters?: number;
    updatedPercentage?: number;
  }>({
    status: 'idle',
    locationStatus: '',
    message: ''
  });

  const active = activeSessions.find(s => s.isActive);

  // Pre-fill active session code if available
  useEffect(() => {
    if (isMarkAttendanceOpen && active) {
      if (!code) {
        setCode(active.code);
      }
    }
    if (!isMarkAttendanceOpen) {
      setResult({ status: 'idle', locationStatus: '', message: '' });
      setIsVerifying(false);
      setCode('');
    }
  }, [isMarkAttendanceOpen, active]);

  const handleStartDemoSession = () => {
    const demo = api.startDemoFacultySession(600);
    setCode(demo.code);
    triggerRefresh();
    showToast({
      type: 'success',
      title: 'Demo Session Broadcasted',
      message: `Active session started for ${demo.subjectName}. Code: ${demo.code}`
    });
  };

  const handleMarkAttendance = () => {
    if (!code || code.trim().length !== 6) {
      showToast({
        type: 'warning',
        title: 'Invalid Code',
        message: 'Please enter a valid 6-digit attendance code.'
      });
      return;
    }

    if (!active) {
      showToast({
        type: 'error',
        title: 'No Active Session',
        message: 'No faculty attendance session is currently active. Ask your faculty to start an attendance session.'
      });
      return;
    }

    setIsVerifying(true);
    setResult({ status: 'idle', locationStatus: '', message: '' });

    const submitWithCoords = (coords: { latitude: number; longitude: number }) => {
      const res = api.markStudentAttendance(currentUser, code, coords, 'code');
      setIsVerifying(false);

      if (res.success) {
        setResult({
          status: 'success',
          locationStatus: 'Location Verified ✓',
          message: res.message,
          distanceMeters: res.distanceMeters,
          updatedPercentage: res.updatedPercentage
        });

        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 }
          });
        } catch {}

        triggerRefresh();
        showToast({
          type: 'success',
          title: 'Attendance Marked',
          message: `${res.message} (Location Verified ✓)`
        });
      } else {
        const displayStatus =
          res.locationStatus === 'Location Verified ✓'
            ? 'Location Verified ✓'
            : 'Outside Allowed Area ✕';

        setResult({
          status: 'failed',
          locationStatus: displayStatus,
          message: res.message,
          distanceMeters: res.distanceMeters
        });

        showToast({
          type: 'error',
          title: 'Verification Failed',
          message: res.message
        });
      }
    };

    // Evaluate device location ONLY when submitting attendance (no continuous tracking)
    if (locationMode === 'campus') {
      submitWithCoords({
        latitude: DEFAULT_GEOFENCE.latitude,
        longitude: DEFAULT_GEOFENCE.longitude
      });
    } else if (locationMode === 'outside') {
      // Offset by ~2.5km to simulate being outside the allowed area
      submitWithCoords({
        latitude: DEFAULT_GEOFENCE.latitude + 0.02,
        longitude: DEFAULT_GEOFENCE.longitude + 0.02
      });
    } else if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          submitWithCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
        },
        () => {
          submitWithCoords({
            latitude: DEFAULT_GEOFENCE.latitude,
            longitude: DEFAULT_GEOFENCE.longitude
          });
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      submitWithCoords({
        latitude: DEFAULT_GEOFENCE.latitude,
        longitude: DEFAULT_GEOFENCE.longitude
      });
    }
  };

  return (
    <Modal
      isOpen={isMarkAttendanceOpen}
      onClose={closeMarkAttendance}
      title="Mark Attendance"
      subtitle="Geofenced Verification System • CampusLife"
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Active Faculty Session Check */}
        {!active ? (
          <div className="p-6 rounded-2xl bg-amber-50/90 border border-amber-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                No faculty attendance session is currently active.
              </h3>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                Ask your faculty to start an attendance session, or initialize a demo broadcast below.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleStartDemoSession}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Broadcast Demo Faculty Session (Code: 583214)</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <div>
                <p className="font-bold text-slate-900">{active.subjectName} ({active.subjectCode})</p>
                <p className="text-[11px] text-slate-600">
                  Section: {active.classSection} • Faculty broadcast is live
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                Code: {active.code}
              </span>
              <button
                type="button"
                onClick={() => setCode(active.code)}
                className="text-[10px] text-indigo-700 hover:underline font-semibold"
              >
                Auto-fill
              </button>
            </div>
          </div>
        )}

        {/* 6-Digit Code Input (Only active when faculty session exists) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Enter 6-Digit Attendance Code
          </label>
          <div className="relative">
            <input
              id="student-attendance-code-input"
              type="text"
              maxLength={6}
              disabled={!active || isVerifying}
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder={active ? 'e.g. ' + active.code : 'Waiting for faculty session...'}
              className="w-full text-center tracking-[0.3em] font-mono text-2xl font-bold py-3 px-4 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-900 bg-slate-50/50 disabled:bg-slate-100 disabled:cursor-not-allowed"
            />
            <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-4.5" />
          </div>
        </div>

        {/* Location Verification & Geofence Notice */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span className="font-semibold text-slate-800">Campus Geofence Location Check</span>
            </div>
            <span className="text-[11px] font-medium text-slate-500">
              Allowed Radius: {DEFAULT_GEOFENCE.allowedRadiusMeters}m
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Your location will be read only upon clicking submit to verify physical presence within campus. No continuous background tracking is performed.
          </p>
          <div className="pt-1 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setLocationMode('campus')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                locationMode === 'campus'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Inside Campus (Verified ✓)
            </button>
            <button
              type="button"
              onClick={() => setLocationMode('outside')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                locationMode === 'outside'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Outside Campus (Outside Allowed Area ✕)
            </button>
            <button
              type="button"
              onClick={() => setLocationMode('gps')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                locationMode === 'gps'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Device GPS (Browser API)
            </button>
          </div>
        </div>

        {/* Verification Result Status */}
        {result.status !== 'idle' && (
          <div
            className={`p-4 rounded-xl border text-xs animate-in fade-in duration-200 ${
              result.status === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-rose-50 border-rose-200 text-rose-950'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              {result.status === 'success' ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{result.locationStatus}</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{result.locationStatus || 'Outside Allowed Area ✕'}</span>
                </>
              )}
            </div>

            <p className="mt-1.5 text-xs opacity-90 leading-relaxed">{result.message}</p>

            {result.updatedPercentage !== undefined && (
              <p className="mt-2 pt-2 border-t border-emerald-200 text-xs font-semibold text-emerald-800">
                New Overall Attendance: {result.updatedPercentage}%
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={closeMarkAttendance}
            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            id="submit-attendance-btn"
            disabled={!active || isVerifying || !code || code.length !== 6}
            onClick={handleMarkAttendance}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-xs transition-all"
          >
            {isVerifying ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                <span>Verifying GPS & Geofence...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Verify & Mark Attendance</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
