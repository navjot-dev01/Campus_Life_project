import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { AttendanceAnalytics, Assignment, Exam, EventItem } from '../types';
import {
  CalendarCheck2,
  BookOpen,
  FileText,
  Calendar,
  Trophy,
  Award,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  BellRing
} from 'lucide-react';

interface StudentDashboardProps {
  setCurrentTab: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ setCurrentTab }) => {
  const { currentUser } = useAuth();
  const { refreshKey, openMarkAttendance, pinnedNotices } = useApp();

  const [analytics, setAnalytics] = useState<AttendanceAnalytics>(() =>
    api.getStudentAttendanceAnalytics(currentUser.id)
  );
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [achievementsCount, setAchievementsCount] = useState(0);
  const [participationsCount, setParticipationsCount] = useState(0);

  useEffect(() => {
    setAnalytics(api.getStudentAttendanceAnalytics(currentUser.id));
    setAssignments(api.getAssignments(currentUser));
    setExams(api.getExams(currentUser));
    setEvents(api.getEvents());
    setAchievementsCount(api.getAchievements(currentUser.id).length);
    setParticipationsCount(api.getParticipations(currentUser.id).length);
  }, [currentUser.id, currentUser.branch, currentUser.department, currentUser.year, currentUser.semester, refreshKey]);

  const pendingAssignments = assignments.filter(a => !a.isSubmitted);
  const upcomingExams = exams.slice(0, 3);
  const upcomingEvents = events.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 text-indigo-200 backdrop-blur-xs">
              CampusLife Portal
            </span>
            <span className="text-xs text-indigo-300">• {currentUser.branch}</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight mt-1.5 font-sans">
            Welcome back, {currentUser.name}!
          </h1>
          <p className="text-xs text-indigo-200 mt-1 max-w-xl">
            {currentUser.studentId} • {currentUser.year} ({currentUser.semester}) • CGPA: {currentUser.cgpa}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentTab('my-journey')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>View My Journey</span>
          </button>
          <button
            id="dashboard-mark-attendance-cta"
            onClick={openMarkAttendance}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold shadow-md transition-all active:scale-98"
          >
            <MapPin className="w-4 h-4" />
            <span>Mark Attendance</span>
          </button>
        </div>
      </div>

      {/* Pinned Urgent Notices Banner */}
      {pinnedNotices.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 flex items-start gap-3">
          <BellRing className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <span className="font-bold uppercase tracking-wider text-[10px] text-amber-800">
              Campus Urgent Notice
            </span>
            <p className="font-bold text-slate-900 mt-0.5">{pinnedNotices[0].title}</p>
            <p className="text-slate-600 mt-0.5 leading-relaxed line-clamp-2">
              {pinnedNotices[0].description}
            </p>
          </div>
          <button
            onClick={() => setCurrentTab('notices')}
            className="text-xs font-semibold text-amber-800 hover:underline shrink-0 self-center"
          >
            View all ({pinnedNotices.length}) →
          </button>
        </div>
      )}

      {/* ATTENDANCE WARNING ALERT (Critical Requirement) */}
      {analytics.isWarning && (
        <div className="p-5 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-950 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-300 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-rose-700 bg-rose-200/60 px-2 py-0.5 rounded-md">
                  Attendance Warning
                </span>
                <span className="text-xs font-semibold text-rose-900">
                  Overall: {analytics.overallPercentage}% (Required: 75%)
                </span>
              </div>
              <p className="text-xs text-rose-900 mt-1 font-medium leading-relaxed">
                Your cumulative attendance has fallen below the mandatory 75% threshold.
                You approximately need to attend <strong>{analytics.classesNeededFor75}</strong> more consecutive classes without absence to restore your standing.
              </p>
            </div>
          </div>
          <button
            onClick={() => setCurrentTab('attendance')}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shrink-0 shadow-xs transition-colors self-start sm:self-auto"
          >
            View Subject Breakdown
          </button>
        </div>
      )}

      {/* 6 OVERVIEW CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* 1. Overall Attendance */}
        <div
          onClick={() => setCurrentTab('attendance')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${
            analytics.isWarning
              ? 'bg-rose-50/40 border-rose-200'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Attendance</span>
            <CalendarCheck2 className={`w-4 h-4 ${analytics.isWarning ? 'text-rose-600' : 'text-emerald-600'}`} />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {analytics.overallPercentage}%
          </p>
          <span className="text-[11px] text-slate-500 block mt-1">
            {analytics.totalPresent} / {analytics.totalClasses} classes
          </span>
        </div>

        {/* 2. Pending Assignments */}
        <div
          onClick={() => setCurrentTab('assignments')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Tasks</span>
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {pendingAssignments.length}
          </p>
          <span className="text-[11px] text-slate-500 block mt-1">Assignments due</span>
        </div>

        {/* 3. Upcoming Exams */}
        <div
          onClick={() => setCurrentTab('exams')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Upcoming Exams</span>
            <FileText className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {exams.length}
          </p>
          <span className="text-[11px] text-slate-500 block mt-1">Scheduled papers</span>
        </div>

        {/* 4. Upcoming Events */}
        <div
          onClick={() => setCurrentTab('events')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Events & Fests</span>
            <Calendar className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {events.length}
          </p>
          <span className="text-[11px] text-slate-500 block mt-1">Hackathons & fests</span>
        </div>

        {/* 5. Achievements */}
        <div
          onClick={() => setCurrentTab('my-journey')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Achievements</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {achievementsCount}
          </p>
          <span className="text-[11px] text-slate-500 block mt-1">Awards in journey</span>
        </div>

        {/* 6. Participation Count */}
        <div
          onClick={() => setCurrentTab('my-journey')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Participations</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {participationsCount}
          </p>
          <span className="text-[11px] text-slate-500 block mt-1">Co-curricular activities</span>
        </div>
      </div>

      {/* UPCOMING SECTIONS: Deadlines, Exams, Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Assignment Deadlines */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Assignment Deadlines</h3>
              </div>
              <button
                onClick={() => setCurrentTab('assignments')}
                className="text-xs text-indigo-600 font-semibold hover:underline"
              >
                View all
              </button>
            </div>

            <div className="space-y-3">
              {assignments.slice(0, 3).map(asg => (
                <div
                  key={asg.id}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold text-indigo-700 font-mono">
                      {asg.subjectName.split(' ')[0]}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        asg.isSubmitted
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {asg.isSubmitted ? 'Submitted ✓' : 'Pending'}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
                    {asg.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Due: {new Date(asg.dueDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <button
              onClick={() => setCurrentTab('assignments')}
              className="text-xs font-semibold text-slate-600 hover:text-indigo-600 inline-flex items-center gap-1"
            >
              Open Assignments Board <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. Upcoming Examination Date-sheet */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">Upcoming Exams</h3>
              </div>
              <button
                onClick={() => setCurrentTab('exams')}
                className="text-xs text-indigo-600 font-semibold hover:underline"
              >
                View all
              </button>
            </div>

            <div className="space-y-3">
              {upcomingExams.map(ex => (
                <div
                  key={ex.id}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-800">
                      {ex.examType}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">
                      Room {ex.room}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
                    {ex.subjectName}
                  </h4>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Date: {ex.date}</span>
                    <span>{ex.startTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <button
              onClick={() => setCurrentTab('exams')}
              className="text-xs font-semibold text-slate-600 hover:text-indigo-600 inline-flex items-center gap-1"
            >
              Download Exam Date-sheet <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3. Upcoming Campus Events */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900">Events & Hackathons</h3>
              </div>
              <button
                onClick={() => setCurrentTab('events')}
                className="text-xs text-indigo-600 font-semibold hover:underline"
              >
                View all
              </button>
            </div>

            <div className="space-y-3">
              {upcomingEvents.map(evt => (
                <div
                  key={evt.id}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-50 text-sky-800">
                      {evt.category}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">
                      {evt.date}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
                    {evt.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                    📍 {evt.location}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <button
              onClick={() => setCurrentTab('events')}
              className="text-xs font-semibold text-slate-600 hover:text-indigo-600 inline-flex items-center gap-1"
            >
              Explore Campus Events <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
