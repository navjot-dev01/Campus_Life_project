import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { FacultyAttendanceRecord } from '../types';
import {
  ClipboardCheck,
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Building,
  UserCheck,
  Shield,
  FileSpreadsheet,
  PlusCircle,
  Briefcase
} from 'lucide-react';

export const FacultyDutyAttendancePage: React.FC = () => {
  const { currentUser, isFaculty, isDean } = useAuth();
  const { showToast } = useApp();

  const [records, setRecords] = useState<FacultyAttendanceRecord[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<'present' | 'on_duty' | 'leave'>('present');
  const [dutyLocation, setDutyLocation] = useState(
    currentUser?.officeRoom || 'CS Block, Room 304'
  );
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadRecords = () => {
    if (isDean) {
      setRecords(api.getFacultyAttendanceRecords());
    } else if (isFaculty && currentUser) {
      setRecords(api.getFacultyAttendanceRecords(currentUser.id));
    }
  };

  useEffect(() => {
    loadRecords();
  }, [currentUser, isDean, isFaculty]);

  // Check if current faculty already checked in today
  const todayStr = new Date().toISOString().split('T')[0];
  const alreadyCheckedInToday = isFaculty && currentUser
    ? records.some(r => r.facultyId === currentUser.id && r.date === todayStr)
    : false;

  const handleMarkDutyAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsSubmitting(true);
    try {
      api.markFacultyAttendance({
        facultyId: currentUser.id,
        facultyName: currentUser.name,
        department: currentUser.department || 'Computer Science & Engineering',
        status: selectedStatus,
        dutyLocation: dutyLocation.trim() || 'Campus Academic Block',
        remarks: remarks.trim() || undefined
      });

      showToast({
        type: 'success',
        title: 'Faculty Duty Check-In Recorded',
        message: 'Your official duty attendance for today has been logged and submitted to the Academic Dean.'
      });

      setRemarks('');
      loadRecords();
    } catch {
      showToast({
        type: 'error',
        title: 'Submission Error',
        message: 'Failed to record duty attendance. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeanVerify = (recordId: string) => {
    api.verifyFacultyAttendance(recordId);
    showToast({
      type: 'success',
      title: 'Duty Log Verified',
      message: 'Faculty duty attendance has been verified under Dean of Academic Affairs authority.'
    });
    loadRecords();
  };

  if (!isFaculty && !isDean) {
    return (
      <div className="p-8 bg-rose-50 border border-rose-200 rounded-3xl text-rose-800 text-center space-y-2">
        <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
        <h3 className="font-black text-lg">Restricted Access</h3>
        <p className="text-xs text-rose-700 max-w-md mx-auto">
          Faculty Duty Attendance logs are exclusively available to Faculty members and the Dean of Academic Affairs. Students and IT Administrators do not have access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl">
            <ClipboardCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                INSTITUTIONAL DUTY LOGS
              </span>
              <span className="text-xs text-slate-500 font-mono">Separate from Student Attendance</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">
              {isDean ? 'Faculty Duty Attendance Monitoring' : 'Faculty Daily Duty Attendance'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {isDean
                ? 'Review and verify daily faculty check-ins and academic duty records across departments.'
                : 'Log your daily on-campus academic presence, lecture delivery hours, and duty station.'}
            </p>
          </div>
        </div>
      </div>

      {/* Faculty Daily Check-In Form (Faculty only) */}
      {isFaculty && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-black text-slate-900">Today's Daily Duty Check-In</h3>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
              Date: {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          {alreadyCheckedInToday ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-900">
                    Checked In for Today
                  </h4>
                  <p className="text-[11px] text-emerald-700">
                    Your duty attendance has been recorded for today ({todayStr}).
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-800 bg-white/80 px-3 py-1 rounded-xl border border-emerald-200">
                Status: Recorded
              </span>
            </div>
          ) : (
            <form onSubmit={handleMarkDutyAttendance} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duty Status</label>
                  <select
                    value={selectedStatus}
                    onChange={e => setSelectedStatus(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 bg-white font-medium"
                  >
                    <option value="present">Present (On Campus Teaching / Advising)</option>
                    <option value="on_duty">On Duty (OD - Conference / External Evaluation)</option>
                    <option value="leave">Academic / Approved Leave</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duty Location / Room</label>
                  <input
                    type="text"
                    required
                    value={dutyLocation}
                    onChange={e => setDutyLocation(e.target.value)}
                    placeholder="e.g. CS Block Room 304 / Lab 3"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lecture / Advising Remarks</label>
                  <input
                    type="text"
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                    placeholder="e.g. CS601 Lecture & lab supervision"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-all hover:scale-102"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Submit Today's Duty Log</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Attendance Logs Table */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-black text-slate-900">
              {isDean ? 'Institutional Faculty Duty Roster' : 'My Past Duty Attendance Logs'}
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Total records: <strong className="text-slate-800 font-mono">{records.length}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="pb-3 pl-2">Faculty Member</th>
                <th className="pb-3">Department</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Check-In Time</th>
                <th className="pb-3">Location</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Remarks</th>
                <th className="pb-3 text-right pr-2">Dean Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No duty attendance logs found.
                  </td>
                </tr>
              ) : (
                records.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 pl-2 font-bold text-slate-900">
                      {record.facultyName}
                    </td>
                    <td className="py-3 text-slate-600">
                      {record.department}
                    </td>
                    <td className="py-3 font-mono">
                      {record.date}
                    </td>
                    <td className="py-3 font-mono font-semibold">
                      {record.checkInTime}
                    </td>
                    <td className="py-3 text-slate-600">
                      {record.dutyLocation}
                    </td>
                    <td className="py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          record.status === 'present'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : record.status === 'on_duty'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {record.status === 'present' ? 'Present' : record.status === 'on_duty' ? 'On Duty (OD)' : 'Leave'}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 max-w-[200px] truncate">
                      {record.remarks || '—'}
                    </td>
                    <td className="py-3 text-right pr-2">
                      {record.verifiedByDean ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Verified by Dean
                        </span>
                      ) : isDean ? (
                        <button
                          onClick={() => handleDeanVerify(record.id)}
                          className="px-2.5 py-1 text-[11px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
                        >
                          Verify Record
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          Pending Dean Review
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
