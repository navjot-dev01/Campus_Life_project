import React from 'react';
import { TimelineMilestone } from '../../types';
import { Badge } from '../common/Badge';
import {
  Trophy,
  Award,
  Code2,
  FileCheck2,
  GraduationCap,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles
} from 'lucide-react';

interface JourneyTimelineProps {
  milestones: TimelineMilestone[];
}

export const JourneyTimeline: React.FC<JourneyTimelineProps> = ({ milestones }) => {
  // Group milestones by Year
  const groupedByYear = milestones.reduce((acc, m) => {
    if (!acc[m.year]) acc[m.year] = [];
    acc[m.year].push(m);
    return acc;
  }, {} as Record<string, TimelineMilestone[]>);

  const years = Object.keys(groupedByYear).sort();

  const getMilestoneIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Trophy className="w-4 h-4 text-amber-500" />;
      case 'participation':
        return <Award className="w-4 h-4 text-indigo-500" />;
      case 'project':
        return <Code2 className="w-4 h-4 text-emerald-500" />;
      case 'certification':
        return <FileCheck2 className="w-4 h-4 text-sky-500" />;
      default:
        return <GraduationCap className="w-4 h-4 text-purple-500" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    if (status === 'verified') {
      return (
        <Badge variant="verified" className="text-[10px]">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Verified
        </Badge>
      );
    }
    if (status === 'pending') {
      return (
        <Badge variant="pending" className="text-[10px]">
          <Clock className="w-3 h-3 text-amber-600" />
          Pending Verification
        </Badge>
      );
    }
    if (status === 'rejected') {
      return (
        <Badge variant="rejected" className="text-[10px]">
          <XCircle className="w-3 h-3 text-rose-600" />
          Rejected
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {years.map(year => (
        <div key={year} className="relative">
          {/* Year Header Pill */}
          <div className="sticky top-16 z-10 flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-white font-mono text-sm font-bold shadow-md">
              <Calendar className="w-3.5 h-3.5 text-indigo-300" />
              <span>Year {year}</span>
            </div>
            <div className="h-0.5 flex-1 bg-gradient-to-r from-slate-200 to-transparent"></div>
          </div>

          {/* Timeline Milestones for this Year */}
          <div className="ml-5 pl-6 border-l-2 border-indigo-100 space-y-4">
            {groupedByYear[year].map(milestone => (
              <div
                key={milestone.id}
                className="relative group p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all"
              >
                {/* Connector Dot */}
                <div className="absolute -left-[31px] top-5 w-4 h-4 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                </div>

                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                      {getMilestoneIcon(milestone.type)}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        {milestone.category}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {milestone.title}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {milestone.badge && (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {milestone.badge}
                      </span>
                    )}
                    {getStatusBadge(milestone.status)}
                  </div>
                </div>

                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  {milestone.description}
                </p>

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Logged Date: {milestone.date}</span>
                  <span className="text-[10px] capitalize text-slate-500">
                    Category: {milestone.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
