import React, { useState } from 'react';
import { Internship, OrganizationType, VerificationStatus } from '../../types';
import { Briefcase, Building2, Calendar, Link as LinkIcon, Sparkles, X } from 'lucide-react';

interface AddInternshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (internship: Omit<Internship, 'id'>) => void;
  studentId: string;
  studentName: string;
}

export const AddInternshipModal: React.FC<AddInternshipModalProps> = ({
  isOpen,
  onClose,
  onSave,
  studentId,
  studentName
}) => {
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [description, setDescription] = useState('');
  const [techInput, setTechInput] = useState('');
  const [organizationType, setOrganizationType] = useState<OrganizationType>('external_organization');
  const [supportingLink, setSupportingLink] = useState('');
  const [requestFacultyVerification, setRequestFacultyVerification] = useState(false);
  const [showOnResume, setShowOnResume] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !role.trim()) return;

    const technologies = techInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    let verificationStatus: VerificationStatus = 'self_reported';
    if (requestFacultyVerification) {
      verificationStatus = 'pending_verification';
    } else if (supportingLink.trim()) {
      verificationStatus = 'verified_external';
    }

    onSave({
      studentId,
      studentName,
      companyName: companyName.trim(),
      role: role.trim(),
      location: location.trim() || 'Remote',
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: isCurrent ? undefined : endDate || undefined,
      isCurrent,
      description: description.trim(),
      technologies,
      organizationType,
      verificationStatus,
      supportingLink: supportingLink.trim() || undefined,
      verifiedBy: supportingLink.trim() ? `External Verification: ${supportingLink.trim()}` : undefined,
      verifiedAt: supportingLink.trim() ? new Date().toISOString() : undefined,
      showOnResume,
      resumeOrder: 1
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Add Work Experience / Internship</h2>
              <p className="text-xs text-slate-500">Record industry experience on your verifiable journey and resume</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Company / Organization *</label>
            <input
              type="text"
              required
              placeholder="e.g. CloudScale Technologies, Microsoft, Infosys"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Role / Job Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Software Engineering Intern"
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
              <input
                type="text"
                placeholder="e.g. Bengaluru, Remote, Hybrid"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                disabled={isCurrent}
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isCurrent"
              checked={isCurrent}
              onChange={e => setIsCurrent(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="isCurrent" className="text-xs text-slate-700 select-none">
              I currently work here
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Key Responsibilities & Impact</label>
            <textarea
              rows={3}
              placeholder="Describe deliverables, features developed, metrics improved, or problems solved..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Technologies Used</label>
            <input
              type="text"
              placeholder="e.g. Node.js, React, Docker, Redis, GCP (comma separated)"
              value={techInput}
              onChange={e => setTechInput(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Organization Type</label>
            <select
              value={organizationType}
              onChange={e => setOrganizationType(e.target.value as OrganizationType)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="external_organization">External Organization (Company / Startup / NGO)</option>
              <option value="college_organized">College Organized (Department Lab / Campus Incubator)</option>
              <option value="independent_participation">Independent / Freelance Project</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Certificate URL / Verification Proof Link
            </label>
            <div className="relative">
              <input
                type="url"
                placeholder="https://cloudscale.tech/verify/intern-aarav or Google Drive link"
                value={supportingLink}
                onChange={e => setSupportingLink(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Providing an external verification link automatically marks this as "Verified by External Organization".
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="reqFaculty"
                checked={requestFacultyVerification}
                onChange={e => setRequestFacultyVerification(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="reqFaculty" className="text-xs text-slate-700 font-medium select-none">
                Request Institutional Faculty Verification (Optional)
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showResume"
                checked={showOnResume}
                onChange={e => setShowOnResume(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="showResume" className="text-xs text-slate-700 font-medium select-none">
                Include this experience on my active Resume
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Save Internship
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
