import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { EventItem } from '../types';
import { Modal } from '../components/common/Modal';
import {
  Calendar,
  MapPin,
  Users,
  PlusCircle,
  Sparkles,
  CheckCircle2,
  Trash2
} from 'lucide-react';

export const EventsPage: React.FC = () => {
  const { isFaculty, isAdmin, isStudent } = useAuth();
  const { refreshKey, triggerRefresh, showToast } = useApp();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [rsvps, setRsvps] = useState<Record<string, boolean>>({});

  // Add Event Modal
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'Hackathon' | 'Technical Fest' | 'Cultural' | 'Sports' | 'Seminar' | 'Workshop'>('Hackathon');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('Campus Auditorium');
  const [description, setDescription] = useState('');

  useEffect(() => {
    setEvents(api.getEvents());
  }, [refreshKey]);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || !date) {
      showToast({ type: 'warning', title: 'Incomplete Event', message: 'Please provide all event details.' });
      return;
    }

    api.createEvent({
      name: name.trim(),
      category,
      date,
      time: '10:00 AM – 04:00 PM',
      location: location.trim(),
      description: description.trim(),
      organizer: 'CampusLife Student Council'
    });

    triggerRefresh();
    showToast({ type: 'success', title: 'Event Published', message: `Event "${name}" published to campus calendar.` });
    setName('');
    setDescription('');
    setIsOpen(false);
  };

  const handleDelete = (id: string, eventName: string) => {
    if (window.confirm(`Delete event "${eventName}"?`)) {
      api.deleteEvent(id);
      triggerRefresh();
      showToast({ type: 'info', title: 'Event Deleted', message: 'The event has been removed.' });
    }
  };

  const toggleRSVP = (eventId: string, eventName: string) => {
    setRsvps(prev => {
      const updated = !prev[eventId];
      showToast({
        type: updated ? 'success' : 'info',
        title: updated ? 'RSVP Confirmed' : 'RSVP Cancelled',
        message: updated
          ? `You have registered for ${eventName}. It has been saved to your campus calendar.`
          : `Registration for ${eventName} cancelled.`
      });
      return { ...prev, [eventId]: updated };
    });
  };

  const filteredEvents = events.filter(evt => {
    if (selectedCategory === 'all') return true;
    return evt.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-50 text-sky-700">
            Student Life
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-1 font-sans">
            Campus Events, Fests & Hackathons
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Discover workshops, college hackathons, inter-university tournaments, and cultural nights.
          </p>
        </div>

        {(isFaculty || isAdmin) && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all active:scale-98"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Host New Event</span>
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {['all', 'Hackathon', 'Technical Fest', 'Cultural', 'Sports', 'Seminar', 'Workshop'].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-sky-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat === 'all' ? 'All Events' : cat}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEvents.map(evt => {
          const isRegistered = !!rsvps[evt.id];
          return (
            <div
              key={evt.id}
              className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200">
                    {evt.category}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {evt.date}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-2.5 leading-snug">
                  {evt.name}
                </h3>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-3">
                  {evt.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {evt.location}
                  </span>
                  <span className="text-slate-400 font-mono">
                    {evt.registeredCount} going
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 flex items-center justify-between">
                {isStudent && (
                  <button
                    onClick={() => toggleRSVP(evt.id, evt.name)}
                    className={`w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                      isRegistered
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                    }`}
                  >
                    {isRegistered ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Registered ✓</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Register / RSVP</span>
                      </>
                    )}
                  </button>
                )}

                {(isFaculty || isAdmin) && (
                  <div className="w-full flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Organized by Department
                    </span>
                    <button
                      onClick={() => handleDelete(evt.id, evt.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Host Event Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Host Campus Event"
        subtitle="Broadcast an extracurricular competition, workshop, or fest to students."
        maxWidth="md"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Event Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Smart India Internal Hackathon 2026"
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
                <option value="Hackathon">Hackathon</option>
                <option value="Technical Fest">Technical Fest</option>
                <option value="Cultural">Cultural</option>
                <option value="Sports">Sports</option>
                <option value="Seminar">Seminar</option>
                <option value="Workshop">Workshop</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Event Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Venue / Location
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Main Auditorium / Sports Complex"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Event Details & Guidelines
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Eligibility, team size, prize pool, registration deadline..."
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
              <Calendar className="w-4 h-4" />
              <span>Publish Event</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
