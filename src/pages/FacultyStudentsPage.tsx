import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User, StudentJourneyProfile } from '../types';
import { Modal } from '../components/common/Modal';
import { JourneyTimeline } from '../components/journey/JourneyTimeline';
import {
  Users,
  Search,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  GraduationCap,
  CalendarCheck2,
  Mail,
  Phone
} from 'lucide-react';

export const FacultyStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'good' | 'warning'>('all');
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [studentJourney, setStudentJourney] = useState<StudentJourneyProfile | null>(null);

  useEffect(() => {
    const list = api.getAllUsers().filter(u => u.role === 'student');
    setStudents(list);
  }, []);

  const openStudentJourney = (student: User) => {
    setSelectedStudent(student);
    const profile = api.getStudentJourneyProfile(student.id);
    setStudentJourney(profile);
  };

  const filteredStudents = students.filter(student => {
    const analytics = api.getStudentAttendanceAnalytics(student.id);
    if (filter === 'good' && analytics.isWarning) return false;
    if (filter === 'warning' && !analytics.isWarning) return false;
    if (search && !student.name.toLowerCase().includes(search.toLowerCase()) && !student.studentId?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
            Cohort Roster
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-1 font-sans">
            Student Academic Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor student attendance levels, warning alerts, and inspect complete verifiable portfolios.
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-3 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              filter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Students ({students.length})
          </button>
          <button
            onClick={() => setFilter('good')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              filter === 'good' ? 'bg-emerald-100 text-emerald-900' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Good Standing (&gt;75%)
          </button>
          <button
            onClick={() => setFilter('warning')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              filter === 'warning' ? 'bg-rose-100 text-rose-900' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Below 75% Warning
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search by name or roll no..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50 outline-none"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map(student => {
          const analytics = api.getStudentAttendanceAnalytics(student.id);
          const journey = api.getStudentJourneyProfile(student.id);

          return (
            <div
              key={student.id}
              className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={student.avatarUrl}
                      alt={student.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{student.name}</h4>
                      <p className="text-xs text-slate-500 font-mono">
                        {student.studentId} • {student.year}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-xl font-black font-mono ${
                      analytics.isWarning ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {analytics.overallPercentage}%
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <p className="flex justify-between">
                    <span>Department & Branch:</span>
                    <strong className="text-slate-800">{student.branch}</strong>
                  </p>
                  <p className="flex justify-between">
                    <span>Current CGPA:</span>
                    <strong className="text-slate-800 font-mono">{student.cgpa || '8.5'}</strong>
                  </p>
                  <p className="flex justify-between">
                    <span>Journey Milestones:</span>
                    <strong className="text-slate-800">{journey.timeline.length} logged</strong>
                  </p>
                </div>

                {analytics.isWarning && (
                  <div className="mt-3 p-2 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>
                      Attendance Warning: Needs ~{analytics.classesNeededFor75} classes to reach 75%.
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  CampusLife Portfolio
                </span>
                <button
                  onClick={() => openStudentJourney(student)}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Inspect Journey</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Student Journey Inspector Modal */}
      {selectedStudent && studentJourney && (
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title={`${selectedStudent.name}'s Verifiable Journey`}
          subtitle={`Roll No: ${selectedStudent.studentId} • ${selectedStudent.branch}`}
          maxWidth="2xl"
        >
          <div className="space-y-6 max-h-[75vh] overflow-y-auto p-1">
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-indigo-950">Academic Health & Metrics</p>
                <p className="text-indigo-700 mt-0.5">
                  CGPA: <strong>{selectedStudent.cgpa}</strong> • Overall Attendance:{' '}
                  <strong>{api.getStudentAttendanceAnalytics(selectedStudent.id).overallPercentage}%</strong>
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-indigo-600 text-white font-bold text-[11px]">
                {studentJourney.timeline.length} Milestones
              </span>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Chronological Timeline
              </h4>
              <JourneyTimeline milestones={studentJourney.timeline} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
