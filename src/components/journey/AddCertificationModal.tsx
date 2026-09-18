import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Modal } from '../common/Modal';
import { FileCheck2, Link as LinkIcon } from 'lucide-react';
import { OrganizationType, VerificationStatus } from '../../types';

interface AddCertificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddCertificationModal: React.FC<AddCertificationModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { triggerRefresh, showToast } = useApp();

  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState('');
  const [credentialId, setCredentialId] = useState('');
  const [credentialUrl, setCredentialUrl] = useState('');
  const [organizationType, setOrganizationType] = useState<OrganizationType>('external_organization');
  const [showOnResume, setShowOnResume] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !organization.trim()) {
      showToast({
        type: 'warning',
        title: 'Missing Fields',
        message: 'Please provide certificate title and issuing organization.'
      });
      return;
    }

    const verificationStatus: VerificationStatus = credentialUrl.trim()
      ? 'verified_external'
      : 'self_reported';

    api.addCertification({
      studentId: currentUser.id,
      name: name.trim(),
      organization: organization.trim(),
      issueDate,
      expiryDate: expiryDate.trim() || undefined,
      credentialId: credentialId.trim() || undefined,
      credentialUrl: credentialUrl.trim() || undefined,
      organizationType,
      verificationStatus,
      showOnResume,
      resumeOrder: 1
    });

    triggerRefresh();
    showToast({
      type: 'success',
      title: 'Certification Saved',
      message: 'Certification added to your verified student profile and resume.'
    });

    setName('');
    setOrganization('');
    setCredentialId('');
    setCredentialUrl('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Verified Credential / Certification"
      subtitle="Record industry certifications (AWS, Google Cloud, Cisco, Coursera, NPTEL)."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 max-h-[75vh] overflow-y-auto pr-1">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Certification Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. AWS Certified Solutions Architect, Google Professional Cloud Architect"
            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Issuing Organization *</label>
          <input
            type="text"
            required
            value={organization}
            onChange={e => setOrganization(e.target.value)}
            placeholder="e.g. Amazon Web Services, Google Cloud, Meta, NPTEL"
            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Date *</label>
            <input
              type="date"
              required
              value={issueDate}
              onChange={e => setIssueDate(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry Date (Optional)</label>
            <input
              type="date"
              value={expiryDate}
              onChange={e => setExpiryDate(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Credential ID (Optional)</label>
            <input
              type="text"
              value={credentialId}
              onChange={e => setCredentialId(e.target.value)}
              placeholder="e.g. AWS-PSA-948210"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Verification URL (Optional)</label>
            <div className="relative">
              <input
                type="url"
                value={credentialUrl}
                onChange={e => setCredentialUrl(e.target.value)}
                placeholder="https://credly.com/badges/..."
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
              />
              <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <input
            type="checkbox"
            id="showCertResume"
            checked={showOnResume}
            onChange={e => setShowOnResume(e.target.checked)}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="showCertResume" className="text-xs text-slate-700 font-medium select-none">
            Include this credential on my active Resume
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
            <FileCheck2 className="w-4 h-4" />
            <span>Save Certification</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
