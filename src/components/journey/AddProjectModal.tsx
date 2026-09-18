import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Modal } from '../common/Modal';
import { Code2, Github, ExternalLink } from 'lucide-react';
import { OrganizationType, VerificationStatus } from '../../types';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddProjectModal: React.FC<AddProjectModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { triggerRefresh, showToast } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [year, setYear] = useState('2026');
  const [organization, setOrganization] = useState('');
  const [organizationType, setOrganizationType] = useState<OrganizationType>('independent_participation');
  const [requestVerification, setRequestVerification] = useState(false);
  const [showOnResume, setShowOnResume] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      showToast({
        type: 'warning',
        title: 'Missing Fields',
        message: 'Please provide project title and description.'
      });
      return;
    }

    const techList = technologies
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    let verificationStatus: VerificationStatus = 'self_reported';
    if (requestVerification) {
      verificationStatus = 'pending_verification';
    } else if (githubUrl.trim()) {
      verificationStatus = 'verified_external';
    }

    api.addProject({
      studentId: currentUser.id,
      name: name.trim(),
      description: description.trim(),
      technologies: techList,
      githubUrl: githubUrl.trim() || undefined,
      demoUrl: demoUrl.trim() || undefined,
      year,
      organization: organization.trim() || undefined,
      organizationType,
      verificationStatus,
      showOnResume,
      resumeOrder: 1
    });

    triggerRefresh();
    showToast({
      type: 'success',
      title: 'Project Saved',
      message: 'Project successfully added to your journey profile and resume builder.'
    });

    setName('');
    setDescription('');
    setTechnologies('');
    setGithubUrl('');
    setDemoUrl('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Project Record"
      subtitle="Showcase technical, academic, or open-source software engineering projects."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 max-h-[75vh] overflow-y-auto pr-1">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Project Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Distributed Cache Engine, IoT Sensor Hub"
            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Year</label>
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
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Context / Org</label>
            <input
              type="text"
              value={organization}
              onChange={e => setOrganization(e.target.value)}
              placeholder="e.g. Capstone Lab, Open Source"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Technologies Used *</label>
          <input
            type="text"
            required
            value={technologies}
            onChange={e => setTechnologies(e.target.value)}
            placeholder="e.g. TypeScript, React, Go, Docker, PostgreSQL (comma separated)"
            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Project Description *</label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Architecture, key technical challenges solved, benchmarking results..."
            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">GitHub / Code URL</label>
            <div className="relative">
              <input
                type="url"
                value={githubUrl}
                onChange={e => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username/repo"
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
              />
              <Github className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Live Demo URL</label>
            <div className="relative">
              <input
                type="url"
                value={demoUrl}
                onChange={e => setDemoUrl(e.target.value)}
                placeholder="https://myproject.demo.app"
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
              />
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="reqProjVerif"
              checked={requestVerification}
              onChange={e => setRequestVerification(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="reqProjVerif" className="text-xs text-slate-700 font-medium select-none">
              Request College Faculty Verification (For Academic Capstone / Lab Projects)
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showProjResume"
              checked={showOnResume}
              onChange={e => setShowOnResume(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="showProjResume" className="text-xs text-slate-700 font-medium select-none">
              Include this project on my active Resume
            </label>
          </div>
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
            <Code2 className="w-4 h-4" />
            <span>Save Project</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
