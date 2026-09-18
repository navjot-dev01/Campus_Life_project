import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Modal } from '../common/Modal';
import { Trophy, Sparkles, Link as LinkIcon, ShieldCheck } from 'lucide-react';
import { OrganizationType, VerificationStatus } from '../../types';

interface AddAchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddAchievementModal: React.FC<AddAchievementModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { triggerRefresh, showToast } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Academic' | 'Hackathon' | 'Sports' | 'Competition' | 'Leadership'>('Hackathon');
  const [organization, setOrganization] = useState('');
  const [organizationType, setOrganizationType] = useState<OrganizationType>('external_organization');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [year, setYear] = useState('2026');
  const [description, setDescription] = useState('');
  const [supportingLink, setSupportingLink] = useState('');
  const [verificationPreference, setVerificationPreference] = useState<'self_reported' | 'external' | 'request_institution'>('self_reported');
  const [showOnResume, setShowOnResume] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast({
        type: 'warning',
        title: 'Missing Fields',
        message: 'Please provide both title and description for your achievement.'
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
      verifiedBy = `External Verification Link: ${supportingLink.trim()}`;
      verifiedAt = new Date().toISOString();
    }

    api.addAchievement({
      studentId: currentUser.id,
      studentName: currentUser.name,
      title: title.trim(),
      category,
      organization: organization.trim() || (category === 'Academic' || category === 'Sports' ? 'CampusLife Institute' : 'External Organization'),
      organizationType,
      date,
      year,
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
      title: verificationStatus === 'pending_verification' ? 'Submitted for Faculty Review' : 'Achievement Added',
      message:
        verificationStatus === 'pending_verification'
          ? 'Your achievement is queued for institutional verification by faculty.'
          : 'Your achievement has been added to your journey and resume.'
    });

    setTitle('');
    setOrganization('');
    setDescription('');
    setSupportingLink('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Student Achievement"
      subtitle="Record academic honors, hackathons, and awards. You own your record and choose how it is verified."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 max-h-[75vh] overflow-y-auto pr-1">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Achievement Title *
          </label>
          <input
            id="achievement-title-input"
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. 1st Prize — Smart India Hackathon 2025"
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
              <option value="Hackathon">Hackathon</option>
              <option value="Sports">Sports</option>
              <option value="Competition">Competition</option>
              <option value="Leadership">Leadership</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Year of Achievement
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
              Issuing Organization / Host
            </label>
            <input
              type="text"
              value={organization}
              onChange={e => setOrganization(e.target.value)}
              placeholder="e.g. Ministry of Education, IEEE, ETH Zurich"
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
              <option value="external_organization">External Organization (Hackathon / Industry / NGO)</option>
              <option value="college_organized">College Organized (Department / Campus Fest)</option>
              <option value="independent_participation">Independent Participation / Community</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Award Date
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
            Description & Impact *
          </label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe the achievement, competition scope, prize, rank, or publication..."
            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Proof / Credential Link (Optional)
          </label>
          <div className="relative">
            <input
              type="url"
              value={supportingLink}
              onChange={e => setSupportingLink(e.target.value)}
              placeholder="https://sih.gov.in/winners or certificate URL"
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
            />
            <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Verification Route Selection */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <label className="block text-xs font-bold text-slate-800">
            Verification Preference
          </label>
          <div className="space-y-1.5 text-xs text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="verif-pref"
                value="self_reported"
                checked={verificationPreference === 'self_reported'}
                onChange={() => setVerificationPreference('self_reported')}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span><strong>Self-Reported Activity</strong> (Ready immediately, no faculty approval required)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="verif-pref"
                value="external"
                checked={verificationPreference === 'external'}
                onChange={() => setVerificationPreference('external')}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span><strong>Externally Verified</strong> (Backed by external organization link/certificate)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="verif-pref"
                value="request_institution"
                checked={verificationPreference === 'request_institution'}
                onChange={() => setVerificationPreference('request_institution')}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span><strong>Request Institutional Verification</strong> (Forwarded to college faculty review queue)</span>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showOnResumeAch"
            checked={showOnResume}
            onChange={e => setShowOnResume(e.target.checked)}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="showOnResumeAch" className="text-xs text-slate-700 font-medium select-none">
            Include this achievement on my active Resume
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
            id="submit-achievement-btn"
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all"
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>Save Achievement</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
