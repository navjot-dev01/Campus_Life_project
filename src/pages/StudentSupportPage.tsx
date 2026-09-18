import React, { useState } from 'react';
import {
  MessageSquare,
  Sparkles,
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Flag,
  ArrowRight,
  Shield,
  HelpCircle,
  FileText,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ChatbotWidget } from '../components/chatbot/ChatbotWidget';
import { ReportIncorrectModal } from '../components/chatbot/ReportIncorrectModal';

interface StudentSupportPageProps {
  setCurrentTab: (tab: string) => void;
}

export const StudentSupportPage: React.FC<StudentSupportPageProps> = ({ setCurrentTab }) => {
  const { currentUser } = useAuth();
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // Verified quick facts for side summary
  const todayStr = new Date().toISOString().split('T')[0];
  const events = api.getEvents();
  const todayEvents = events.filter(e => e.date === todayStr);

  const assignments = api.getAssignments();
  const pendingAssignments = assignments.filter(a => !a.isSubmitted && a.submissionStatus !== 'submitted');
  const dueToday = assignments.filter(a => a.dueDate.startsWith(todayStr));

  const reports = api.getDataReports().filter(r => r.studentId === currentUser?.id);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>CampusLife Student Support</span>
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Data Active</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
            Student Support & Verified Academic Assistant
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Access verified college information regarding events, assignments, deadlines, schedules, or ask for educational guidance.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
          <button
            onClick={() => setReportModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors flex items-center space-x-2 shadow-2xs"
          >
            <Flag className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline">Report Discrepancy</span>
          </button>
          <button
            onClick={() => setCurrentTab('dashboard')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-colors flex items-center space-x-1.5 shadow-2xs"
            title="Close Student Support and return to Dashboard"
          >
            <X className="w-4 h-4 text-slate-600" />
            <span>Close</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Embedded Chatbot + Quick Intelligence Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chatbot Interface (Span 2 cols on large screen) */}
        <div className="lg:col-span-2">
          <ChatbotWidget isEmbedded={true} onNavigateTab={setCurrentTab} onClose={() => setCurrentTab('dashboard')} />
        </div>

        {/* Verified Quick Overview & Contacts Sidebar */}
        <div className="space-y-5">
          {/* Today's Academic Schedule At-A-Glance */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>Today's Verified Records</span>
              </h2>
              <span className="text-[11px] font-semibold text-slate-400">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>

            {/* Event Today */}
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Events Today ({todayEvents.length})
              </div>
              {todayEvents.length > 0 ? (
                todayEvents.map(evt => (
                  <div key={evt.id} className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs">
                    <div className="font-semibold text-slate-900">{evt.name}</div>
                    <div className="text-slate-500 text-[11px] mt-1">⏰ {evt.time}</div>
                    <div className="text-slate-500 text-[11px]">📍 {evt.location}</div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  No events scheduled for today.
                </div>
              )}
            </div>

            {/* Assignment Due Today */}
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Assignments Due Today ({dueToday.length})
              </div>
              {dueToday.length > 0 ? (
                dueToday.map(asg => (
                  <div key={asg.id} className="bg-amber-50/60 rounded-xl p-3 border border-amber-200/80 text-xs">
                    <div className="font-semibold text-slate-900">{asg.title}</div>
                    <div className="text-amber-800 text-[11px] font-medium mt-1">
                      📚 {asg.subjectName} • Due 11:59 PM
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  No assignments due today.
                </div>
              )}
            </div>

            {/* Pending Count */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-600">Total Pending Assignments:</span>
              <span className="font-bold text-indigo-600">{pendingAssignments.length}</span>
            </div>
          </div>

          {/* Official Administrative Contacts (Escalation Directory) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Official Department Contacts</span>
            </h2>
            <p className="text-xs text-slate-500">
              For official grade disputes, fee clearances, and administrative certificates:
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-semibold text-slate-900">Academic Affairs & Dean</div>
                <div className="text-slate-500 text-[11px]">Prof. Sunita Rao • Admin Block Rm 104</div>
                <div className="text-indigo-600 text-[11px]">dean.academic@campuslife.edu</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-semibold text-slate-900">Computer Science HOD</div>
                <div className="text-slate-500 text-[11px]">Dr. Rajesh Sharma • CS Block Rm 201</div>
                <div className="text-indigo-600 text-[11px]">cse.hod@campuslife.edu</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-semibold text-slate-900">IT Helpdesk & Portal Support</div>
                <div className="text-slate-500 text-[11px]">Library Ground Floor • Mon-Fri 9-5</div>
                <div className="text-indigo-600 text-[11px]">itsupport@campuslife.edu (Ext: 401)</div>
              </div>
            </div>
          </div>

          {/* My Submitted Reports History */}
          {reports.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Flag className="w-4 h-4 text-amber-600" />
                <span>Your Data Reports ({reports.length})</span>
              </h2>
              <div className="space-y-2">
                {reports.slice(0, 3).map(rep => (
                  <div key={rep.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-center justify-between font-medium text-slate-900">
                      <span>{rep.itemTitle || rep.category}</span>
                      <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                        {rep.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{rep.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <ReportIncorrectModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />
    </div>
  );
};
