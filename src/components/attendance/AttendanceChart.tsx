import React from 'react';
import { SubjectAttendanceSummary } from '../../types';

interface AttendanceChartProps {
  subjectWise: SubjectAttendanceSummary[];
}

export const AttendanceChart: React.FC<AttendanceChartProps> = ({ subjectWise }) => {
  // 6 weekly historical trend milestones for demo visualization
  const weeklyTrends = [
    { week: 'W1', pct: 88 },
    { week: 'W2', pct: 85 },
    { week: 'W3', pct: 82 },
    { week: 'W4', pct: 76 },
    { week: 'W5', pct: 75 },
    { week: 'W6', pct: 79 },
    { week: 'Current', pct: Math.round(subjectWise.reduce((acc, s) => acc + s.percentage, 0) / (subjectWise.length || 1)) }
  ];

  const chartHeight = 130;
  const chartWidth = 460;
  const padding = 30;

  // Map to SVG coordinates
  const minPct = 50;
  const maxPct = 100;
  const range = maxPct - minPct;

  const points = weeklyTrends.map((t, idx) => {
    const x = padding + (idx * (chartWidth - padding * 2)) / (weeklyTrends.length - 1);
    const y = chartHeight - padding - ((t.pct - minPct) / range) * (chartHeight - padding * 2);
    return { x, y, ...t };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return `${acc} ${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
  }, '');

  // 75% threshold line Y position
  const y75 = chartHeight - padding - ((75 - minPct) / range) * (chartHeight - padding * 2);

  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Attendance Trend History</h4>
          <p className="text-[11px] text-slate-500">Weekly semester percentage tracking</p>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-indigo-700 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
            Actual Attendance
          </span>
          <span className="flex items-center gap-1.5 text-rose-600 font-semibold">
            <span className="w-2.5 h-0.5 bg-rose-500"></span>
            75% Mandatory Line
          </span>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-36">
          {/* Grid lines */}
          <line
            x1={padding}
            y1={y75}
            x2={chartWidth - padding}
            y2={y75}
            stroke="#f43f5e"
            strokeDasharray="4 3"
            strokeWidth="1.5"
          />
          <text
            x={chartWidth - padding + 4}
            y={y75 + 3}
            fill="#f43f5e"
            fontSize="9"
            fontWeight="bold"
          >
            75%
          </text>

          {/* Trend Area Gradient */}
          <defs>
            <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path
            d={`${pathD} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`}
            fill="url(#attendanceGradient)"
          />

          {/* Trend Line */}
          <path d={pathD} fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" />

          {/* Data Points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r="4.5"
                fill="#ffffff"
                stroke="#4f46e5"
                strokeWidth="2.5"
              />
              <text
                x={p.x}
                y={p.y - 8}
                textAnchor="middle"
                fill="#1e1b4b"
                fontSize="9"
                fontWeight="bold"
              >
                {p.pct}%
              </text>
              <text
                x={p.x}
                y={chartHeight - 12}
                textAnchor="middle"
                fill="#64748b"
                fontSize="9"
              >
                {p.week}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};
