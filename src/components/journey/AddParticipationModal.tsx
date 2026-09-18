import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Modal } from '../common/Modal';
import { Award, Link as LinkIcon } from 'lucide-react';
import { OrganizationType, VerificationStatus } from '../../types';

interface AddParticipationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddParticipationModal: React.FC<AddParticipationModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { triggerRefresh, showToast } = useApp();

  const [eventName, setEventName] = useState('');
  const [category, setCategory] = useState<any>('Smart India Hackathon');
  const [organization, setOrganization] = useState('');
  const [organizationType, setOrganizationType] = useState<OrganizationType>('external_organization');
  const [role, setRole] = useState('Team Lead');
  const [result, setResult] = useState('Finalist');
  const [year, setYear] = useState('2026');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [supportingLink, setSupportingLink] = useState('');
  const [verificationPreference, setVerificationPreference] = useState<'self_reported' | 'external' | 'request_institution'>('self_reported');
  const [showOnResume, setShowOnResume] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim() || !description.trim()) {
      showToast({
        type: 'warning',
        title: 'Missing Fields',
        message: 'Please provide event name and description.'
      });
      return;
    }

    let verificationStatus: VerificationStatus = 'self_reported';
    let verifiedBy: string | undefined = undefined;
    let verifiedAt: string | undefined = undefined;

    if (verificationPreference === 'request_institution') {
      verificationStatus = 'pending_verification';
    } else if (verificationPreference === 'external' && supportingLink.trim()) {
      verificationStatus = 'verified_external';
      verifiedBy = `External Link: ${supportingLink.trim()}`;
      verifiedAt = new Date().toISOString();
    }

    api.addParticipation({
      studentId: currentUser.id,
      studentName: currentUser.name,
      eventName: eventName.trim(),
      category,
      organization: organization.trim() || (category === 'Fest' || category === 'NCC/NSS' ? 'CampusLife College' : 'External Org'),
      organizationType,
      role: role.trim(),
      result: result.trim(),
      year,
      date,
      description: description.trim(),
      supportingLink: supportingLink.trim() || undefined,
      verificationStatus,
      verifiedBy,
      verifiedAt,
      showOnResume,
      resumeOrder: 1
    });

    triggerRefresh();
    showToast({
      type: 'success',
      title: verificationStatus === 'pending_verification' ? 'Submitted for Faculty Review' : 'Participation Recorded',
      message:
        verificationStatus === 'pending_verification'
          ? 'Event participation record submitted for faculty review.'
          : 'Participation record added to your journey and resume.'
    });

    setEventName('');
    setOrganization('');
    setDescription('');
    setSupportingLink('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Participation Record"
      subtitle="Log your involvement in hackathons, clubs, cultural fests, sports, or workshops."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 max-h-[75vh] overflow-y-auto pr-1">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Event Name *
          </label>
          <input
            type="text"
            required
            value={eventName}
            onChange={e => setEventName(e.target.value)}
            placeholder="e.g. Smart India Hackathon 2026 or Inter-College Cultural Fest"
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
              onChange={e => setCategory(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-white"
            >
              <option value="Smart India Hackathon">Smart India Hackathon</option>
              <option value="Hackathon">Hackathon</option>
              <option value="Coding">Coding Competition</option>
              <option value="Sports">Sports</option>
              <option value="Cultural">Cultural Event</option>
              <option value="Workshop">Workshop</option>
              <option value="Seminar">Seminar</option>
              <option value="Club">College Club</option>
              <option value="NCC/NSS">NCC / NSS</option>
              <option value="Fest">College Fest</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Year
            </label>
            <select
              value={year}
              onChange={e => setYear(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-white"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Organizing Body
            </label>
            <input
              type="text"
              value={organization}
              onChange={e => setOrganization(e.target.value)}
              placeholder="e.g. AICTE, ACM Chapter, IIT Bombay"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Organization Scope
            </label>
            <select
              value={organizationType}
              onChange={e => setOrganizationType(e.target.value as OrganizationType)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-white"
            >
              <option value="external_organization">External Organization (National / Global / Other College)</option>
              <option value="college_organized">College Organized (Our Campus)</option>
              <option value="independent_participation">Independent Participation / Community</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Your Role *
            </label>
            <input
              type="text"
              required
              value={role}
              onChange={e => setRole(e.target.value)}
              placeholder="e.g. Team Lead, Performer, Cadet"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Result / Standing
            </label>
            <input
              type="text"
              value={result}
              onChange={e => setResult(e.target.value)}
              placeholder="e.g. 1st Runner Up, Finalist, Certificate"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Participation Date
          </label>
          <input
            type="date"
            required
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Description *
          </label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Brief overview of the activity, team structure, contributions, deliverables..."
            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Certificate or Event URL (Optional)
          </label>
          <div className="relative">
            <input
              type="url"
              value={supportingLink}
              onChange={e => setSupportingLink(e.target.value)}
              placeholder="https://devpost.com/software/my-team or certificate URL"
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
            />
            <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Verification Option */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <label className="block text-xs font-bold text-slate-800">
            Verification Preference
          </label>
          <div className="space-y-1.5 text-xs text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="verif-part-pref"
                value="self_reported"
                checked={verificationPreference === 'self_reported'}
                onChange={() => setVerificationPreference('self_reported')}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span><strong>Self-Reported</strong> (Self-owned student record, immediately visible)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="verif-part-pref"
                value="external"
                checked={verificationPreference === 'external'}
                onChange={() => setVerificationPreference('external')}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span><strong>Externally Verified</strong> (Validated through external certificate or link)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="verif-part-pref"
                value="request_institution"
                checked={verificationPreference === 'request_institution'}
                onChange={() => setVerificationPreference('request_institution')}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span><strong>Request Institutional Faculty Verification</strong></span>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showOnResumePart"
            checked={showOnResume}
            onChange={e => setShowOnResume(e.target.checked)}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="showOnResumePart" className="text-xs text-slate-700 font-medium select-none">
            Include this participation on my active Resume
          </label>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all"
          >
            <Award className="w-4 h-4" />
            <span>Save Participation</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
