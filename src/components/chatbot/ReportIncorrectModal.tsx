import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2, Flag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { DataReport } from '../../types';

interface ReportIncorrectModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: 'event' | 'assignment' | 'deadline' | 'schedule' | 'policy' | 'other';
  defaultTitle?: string;
  defaultItemId?: string;
}

export const ReportIncorrectModal: React.FC<ReportIncorrectModalProps> = ({
  isOpen,
  onClose,
  defaultCategory = 'other',
  defaultTitle = '',
  defaultItemId
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useApp();

  const [category, setCategory] = useState<DataReport['category']>(defaultCategory);
  const [reportType, setReportType] = useState<DataReport['reportType']>('incorrect_event');
  const [itemTitle, setItemTitle] = useState(defaultTitle);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      showToast({
        type: 'warning',
        title: 'Input Required',
        message: 'Please describe the discrepancy or missing information.'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      api.submitDataReport({
        studentId: currentUser.id,
        studentName: currentUser.name,
        category,
        reportType,
        itemId: defaultItemId,
        itemTitle: itemTitle.trim() || undefined,
        description: description.trim()
      });

      showToast({
        type: 'success',
        title: 'Report Submitted',
        message: 'Report submitted successfully. College records administration will review this promptly.'
      });
      setDescription('');
      onClose();
    } catch {
      showToast({
        type: 'error',
        title: 'Submission Error',
        message: 'Failed to submit report. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Flag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-base">Report Inaccurate College Data</h3>
              <p className="text-xs text-slate-400">Help keep CampusLife records accurate & verified</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start space-x-3 text-amber-900 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Your report will be forwarded directly to the respective Department Head and Academic Cell for verification against physical circulars.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Issue Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'incorrect_event', label: 'Incorrect Event Details' },
                { id: 'incorrect_assignment', label: 'Incorrect Assignment Info' },
                { id: 'outdated_info', label: 'Outdated Record' },
                { id: 'missing_info', label: 'Missing College Record' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setReportType(opt.id as any)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border text-left transition-all ${
                    reportType === opt.id
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="event">Event</option>
                <option value="assignment">Assignment</option>
                <option value="deadline">Deadline / Exam</option>
                <option value="schedule">Schedule / Lecture</option>
                <option value="policy">College Policy</option>
                <option value="other">Other Information</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Record / Title</label>
              <input
                type="text"
                value={itemTitle}
                onChange={e => setItemTitle(e.target.value)}
                placeholder="e.g. DBMS Lab 5 or TechX Seminar"
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Discrepancy Details <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              required
              placeholder="What specifically is inaccurate? (e.g. The venue was changed to Room 302, or the deadline is tomorrow at 5 PM)"
              className="w-full text-xs rounded-lg border border-slate-300 p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-slate-400"
            />
          </div>

          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
            <span>Submitting as: <strong>{currentUser.name}</strong> ({currentUser.email})</span>
            <span className="text-slate-400">ID: {currentUser.id}</span>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-lg shadow-sm transition-all disabled:opacity-50 flex items-center space-x-1.5"
            >
              {isSubmitting ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Audit Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
