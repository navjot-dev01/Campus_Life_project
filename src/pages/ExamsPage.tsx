import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Exam, Subject } from '../types';
import { Modal } from '../components/common/Modal';
import {
  FileText,
  Calendar,
  Clock,
  MapPin,
  PlusCircle,
  Trash2,
  Download,
  AlertCircle
} from 'lucide-react';

export const ExamsPage: React.FC = () => {
  const { currentUser, isStudent, isFaculty, isAdmin } = useAuth();
  const { refreshKey, triggerRefresh, showToast } = useApp();

  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');

  // Add Exam Modal
  const [isOpen, setIsOpen] = useState(false);
  const [subjectId, setSubjectId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('01:00 PM');
  const [room, setRoom] = useState('LH-201');
  const [examType, setExamType] = useState<'Mid-Term' | 'Semester End' | 'Practical / Lab'>('Mid-Term');

  useEffect(() => {
    if (isStudent) {
      setExams(api.getExams(currentUser));
      const subjs = api.getSubjects(currentUser);
      setSubjects(subjs);
      if (subjs.length > 0 && !subjectId) {
        setSubjectId(subjs[0].id);
      }
    } else {
      setExams(api.getExams());
      const subjs = api.getSubjects();
      setSubjects(subjs);
      if (subjs.length > 0 && !subjectId) {
        setSubjectId(subjs[0].id);
      }
    }
  }, [currentUser, isStudent, refreshKey]);

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      showToast({ type: 'warning', title: 'Missing Date', message: 'Please select an exam date.' });
      return;
    }

    const sub = subjects.find(s => s.id === subjectId);
    api.createExam({
      subjectId,
      subjectName: sub ? `${sub.code}: ${sub.name}` : 'Computer Science',
      subjectCode: sub ? sub.code : 'CS600',
      date,
      startTime,
      endTime,
      room,
      examType,
      totalMarks: 50,
      instructions: 'Calculators and standard stationary permitted.',
      branch: sub?.branch || (currentUser.department ? currentUser.department : 'CSE'),
      semester: sub?.semester || '6th Semester',
      year: '3rd Year'
    });

    triggerRefresh();
    showToast({
      type: 'success',
      title: 'Exam Scheduled',
      message: `Exam paper added to the official institutional date-sheet.`
    });

    setIsOpen(false);
  };

  const handleDeleteExam = (id: string, name: string) => {
    if (window.confirm(`Delete exam schedule for "${name}"?`)) {
      api.deleteExam(id);
      triggerRefresh();
      showToast({ type: 'info', title: 'Exam Removed', message: 'Exam was deleted from the timetable.' });
    }
  };

  const filteredExams = exams.filter(e => {
    if (selectedType === 'all') return true;
    return e.examType === selectedType;
  });

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
            Examinations
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-1 font-sans">
            Examination Schedule & Date-sheet
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Institutional timetable for Mid-Terms, Semester Ends, and Practical Lab assessments.
          </p>
        </div>

        {(isFaculty || isAdmin) && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all active:scale-98"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Schedule Exam</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {['all', 'Mid-Term', 'Semester End', 'Practical / Lab'].map(t => (
          <button
            key={t}
            onClick={() => setSelectedType(t)}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              selectedType === t
                ? 'bg-purple-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {t === 'all' ? 'All Examinations' : t}
          </button>
        ))}
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExams.map(ex => (
          <div
            key={ex.id}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-purple-200 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200">
                  {ex.examType}
                </span>
                <span className="text-xs font-mono font-bold text-slate-700 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  Room {ex.room}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mt-2.5 leading-snug">
                {ex.subjectName}
              </h3>

              <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                <p className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Date: <strong className="text-slate-800">{ex.date}</strong>
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Timing: <strong className="text-slate-800">{ex.startTime} – {ex.endTime}</strong>
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-emerald-700 font-semibold">
                ✓ Seating Allotted
              </span>
              {(isFaculty || isAdmin) && (
                <button
                  onClick={() => handleDeleteExam(ex.id, ex.subjectName)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Remove exam"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Schedule Exam Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Schedule Institutional Exam"
        subtitle="Add a paper to the university date-sheet timetable."
        maxWidth="md"
      >
        <form onSubmit={handleCreateExam} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Subject
            </label>
            <select
              value={subjectId}
              onChange={e => setSubjectId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-white"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.code}: {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Exam Type
              </label>
              <select
                value={examType}
                onChange={e => setExamType(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-white"
              >
                <option value="Mid-Term">Mid-Term</option>
                <option value="Semester End">Semester End</option>
                <option value="Practical / Lab">Practical / Lab</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Examination Hall / Room
              </label>
              <input
                type="text"
                required
                value={room}
                onChange={e => setRoom(e.target.value)}
                placeholder="e.g. LH-201"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Exam Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Time
              </label>
              <input
                type="text"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                placeholder="10:00 AM"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                End Time
              </label>
              <input
                type="text"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                placeholder="01:00 PM"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Save Schedule</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
