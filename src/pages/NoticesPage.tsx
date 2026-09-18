import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Notice } from '../types';
import { Modal } from '../components/common/Modal';
import {
  Bell,
  Pin,
  PlusCircle,
  AlertTriangle,
  Calendar,
  User,
  Trash2,
  Bookmark
} from 'lucide-react';

export const NoticesPage: React.FC = () => {
  const { currentUser, isFaculty, isAdmin } = useAuth();
  const { refreshKey, triggerRefresh, showToast } = useApp();

  const [notices, setNotices] = useState<Notice[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Broadcast Modal
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Academic' | 'Urgent' | 'Examination' | 'Events' | 'Hostel' | 'Placement'>('Academic');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [isPinned, setIsPinned] = useState(false);
  const [description, setDescription] = useState('');

  useEffect(() => {
    setNotices(api.getNotices());
  }, [refreshKey]);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast({ type: 'warning', title: 'Missing Information', message: 'Please provide both notice title and text.' });
      return;
    }

    api.broadcastNotice({
      title: title.trim(),
      category,
      priority,
      isPinned,
      description: description.trim(),
      authorName: currentUser ? currentUser.name : 'Department Coordinator'
    });

    triggerRefresh();
    showToast({
      type: 'success',
      title: 'Notice Broadcasted',
      message: `Notice "${title}" has been published to the student notice board.`
    });

    setTitle('');
    setDescription('');
    setIsPinned(false);
    setIsOpen(false);
  };

  const handleDelete = (id: string, noticeTitle: string) => {
    if (window.confirm(`Delete notice "${noticeTitle}"?`)) {
      api.deleteNotice(id);
      triggerRefresh();
      showToast({ type: 'info', title: 'Notice Deleted', message: 'Notice was removed from the board.' });
    }
  };

  const filteredNotices = notices.filter(n => {
    if (selectedCategory === 'all') return true;
    return n.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
            Announcements
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-1 font-sans">
            Campus Notices & Circulars
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Official communications from the Registrar, Examination Cell, and Department Heads.
          </p>
        </div>

        {(isFaculty || isAdmin) && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all active:scale-98"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Broadcast Notice</span>
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {['all', 'Urgent', 'Academic', 'Examination', 'Events', 'Hostel', 'Placement'].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-amber-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat === 'all' ? 'All Notices' : cat}
          </button>
        ))}
      </div>

      {/* Notices List */}
      <div className="space-y-4">
        {filteredNotices.map(notice => {
          const isUrgent = notice.priority === 'urgent' || notice.category === 'Urgent';
          return (
            <div
              key={notice.id}
              className={`p-5 rounded-3xl border shadow-xs transition-all ${
                notice.isPinned
                  ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {notice.isPinned && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-200/70 text-amber-900">
                        <Pin className="w-3 h-3 text-amber-800 rotate-45" />
                        Pinned Notice
                      </span>
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {notice.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {notice.publishedAt ? new Date(notice.publishedAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {notice.title}
                  </h3>

                  <p className="text-xs text-slate-700 leading-relaxed max-w-4xl whitespace-pre-line">
                    {notice.description}
                  </p>

                  <div className="pt-2 flex items-center gap-4 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-slate-600 font-medium">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Issued by: {notice.authorName || 'Campus Administration'}
                    </span>
                  </div>
                </div>

                {(isFaculty || isAdmin) && (
                  <button
                    onClick={() => handleDelete(notice.id, notice.title)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Remove notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Broadcast Notice Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Broadcast Institutional Notice"
        subtitle="Publish announcements to student and faculty portals."
        maxWidth="md"
      >
        <form onSubmit={handleBroadcast} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notice Headline
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. End Semester Lab Assessment Timetable Released"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-white"
              >
                <option value="Academic">Academic</option>
                <option value="Urgent">Urgent</option>
                <option value="Examination">Examination</option>
                <option value="Events">Events</option>
                <option value="Hostel">Hostel</option>
                <option value="Placement">Placement</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-white"
              >
                <option value="low">Standard</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={e => setIsPinned(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Pin to top banner on all student dashboards</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notice Content
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Write the complete text, guidelines, dates, and instructions..."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none resize-none"
            />
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
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all"
            >
              <Bell className="w-4 h-4" />
              <span>Broadcast Notice</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
