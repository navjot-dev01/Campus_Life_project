import React from 'react';
import { SubjectAttendanceSummary } from '../../types';
import { AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';

interface SubjectAttendanceCardProps {
  summary: SubjectAttendanceSummary;
}

export const SubjectAttendanceCard: React.FC<SubjectAttendanceCardProps> = ({ summary }) => {
  const isWarning = summary.percentage < 75;
  const isCritical = summary.percentage < 65;

  let progressColor = 'bg-emerald-500';
  let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let badgeLabel = 'Good Standing';

  if (isCritical) {
    progressColor = 'bg-rose-500';
    badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
    badgeLabel = 'Critical Detained';
  } else if (isWarning) {
    progressColor = 'bg-amber-500';
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
    badgeLabel = 'Below 75% Warning';
  }

  // Calculate classes needed for this subject if <75%
  let needed = 0;
  if (isWarning) {
    needed = Math.max(0, Math.ceil(3 * summary.totalClasses - 4 * summary.presentClasses));
  }

  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
            {summary.subjectCode}
          </span>
          <h4 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">
            {summary.subjectName}
          </h4>
        </div>
        <span className="text-xl font-black text-slate-900 font-mono">
          {summary.percentage}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mt-3">
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
            style={{ width: `${Math.min(100, summary.percentage)}%` }}
          />
        </div>
      </div>

      {/* Details Row */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
        <div>
          <span className="text-slate-500">Present: </span>
          <strong className="text-slate-900 font-semibold">{summary.presentClasses} / {summary.totalClasses}</strong>
        </div>
        <div>
          <span className="text-slate-500">Attendance: </span>
          <strong className={`font-mono font-bold ${isWarning ? 'text-rose-600' : 'text-emerald-600'}`}>
            {summary.percentage}%
          </strong>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
        <span>Status</span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeColor}`}>
          {badgeLabel}
        </span>
      </div>

      {/* Warning Notice if below 75% */}
      {isWarning && (
        <div className="mt-2.5 p-2 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>
            Needs approx. <strong>{needed}</strong> more consecutive classes to reach 75%.
          </span>
        </div>
      )}
    </div>
  );
};
