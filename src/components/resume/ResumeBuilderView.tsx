import React, { useState } from 'react';
import {
  StudentJourneyProfile,
  StudentResumeSettings,
  VerificationStatus,
  Achievement,
  Participation,
  Project,
  Certification,
  Internship
} from '../../types';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { ResumeDocument } from './ResumeDocument';
import { downloadResumePdf } from '../../utils/resumePdf';
import { VerificationStatusBadge } from '../common/Badge';
import {
  FileDown,
  Share2,
  Eye,
  Sliders,
  Check,
  ChevronUp,
  ChevronDown,
  Plus,
  ShieldCheck,
  Building2,
  GraduationCap,
  Sparkles,
  Lock,
  EyeOff,
  Briefcase,
  Trophy,
  Award,
  Code2,
  FileCheck2,
  HelpCircle,
  CheckCircle2,
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';

interface ResumeBuilderViewProps {
  profile: StudentJourneyProfile;
  onOpenAddAchievement: () => void;
  onOpenAddParticipation: () => void;
  onOpenAddProject: () => void;
  onOpenAddCertification: () => void;
  onOpenAddInternship: () => void;
  setCurrentTab?: (tab: string) => void;
}

export const ResumeBuilderView: React.FC<ResumeBuilderViewProps> = ({
  profile,
  onOpenAddAchievement,
  onOpenAddParticipation,
  onOpenAddProject,
  onOpenAddCertification,
  onOpenAddInternship,
  setCurrentTab
}) => {
  const { showToast, triggerRefresh } = useApp();
  const [activeMode, setActiveMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [copiedLink, setCopiedLink] = useState(false);

  const [settings, setSettings] = useState<StudentResumeSettings>(() =>
    profile.resumeSettings || api.getResumeSettings(profile.student.id)
  );

  const handleUpdateSettings = (updates: Partial<StudentResumeSettings>) => {
    const updated = api.saveResumeSettings(profile.student.id, updates);
    setSettings(updated);
    triggerRefresh();
  };

  const handleToggleItem = (
    type: 'achievement' | 'participation' | 'project' | 'certification' | 'internship',
    id: string,
    currentShow: boolean
  ) => {
    api.toggleResumeItemVisibility(type, id, !currentShow);
    triggerRefresh();
  };

  const handleReorder = (
    type: 'achievement' | 'participation' | 'project' | 'certification' | 'internship',
    id: string,
    direction: 'up' | 'down'
  ) => {
    api.reorderResumeItem(type, id, direction);
    triggerRefresh();
  };

  const handleRequestVerification = (
    type: 'achievement' | 'participation' | 'project' | 'certification' | 'internship',
    id: string
  ) => {
    api.requestVerification(type, id);
    triggerRefresh();
    showToast({
      type: 'info',
      title: 'Verification Requested',
      message: 'Request submitted to faculty for institutional review.'
    });
  };

  const handleExportPDF = () => {
    try {
      const studentName = profile?.student?.name ? profile.student.name.replace(/\s+/g, '_') : 'Student';
      downloadResumePdf(profile, settings);
      showToast({
        type: 'success',
        title: 'Resume PDF Generated',
        message: `${studentName}_Resume.pdf downloaded successfully.`
      });
    } catch (err) {
      console.error('Direct PDF export error:', err);
      showToast({
        type: 'error',
        title: 'Export Failed',
        message: 'Could not export resume PDF. Please try again.'
      });
    }
  };

  const handleCopyShareLink = () => {
    const shareUrl = `${window.location.origin}/#profile/${profile.student.studentId || profile.student.id}`;
    navigator.clipboard?.writeText(shareUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
      showToast({
        type: 'success',
        title: 'Verifiable Profile Link Copied',
        message: 'Share this link with recruiters to view your verified student profile.'
      });
    }).catch(() => {
      showToast({
        type: 'info',
        title: 'Link Ready',
        message: shareUrl
      });
    });
  };

  // Calculate ATS Readiness Score
  const calculateAtsScore = () => {
    let score = 50; // Base score
    if (settings.summary && settings.summary.length > 50) score += 10;
    if (profile.internships && profile.internships.length > 0) score += 15;
    if (profile.projects && profile.projects.length > 0) score += 10;
    if (settings.skills && settings.skills.length >= 3) score += 10;
    if (profile.achievements && profile.achievements.length > 0) score += 5;
    return Math.min(score, 100);
  };

  const atsScore = calculateAtsScore();

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Resume Builder
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                ATS-Optimized
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Create and manage your professional resume with verified college journey records.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setActiveMode('edit')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeMode === 'edit'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Controls
            </button>
            <button
              onClick={() => setActiveMode('split')}
              className={`hidden lg:block px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeMode === 'split'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Split View
            </button>
            <button
              onClick={() => setActiveMode('preview')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeMode === 'preview'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Full Preview
            </button>
          </div>

          <button
            onClick={handleCopyShareLink}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-all"
            title="Share verified student credentials"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied' : 'Share Link'}</span>
          </button>

          <button
            onClick={handleExportPDF}
            id="export-pdf-btn"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Export One-Page A4 PDF Resume"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Trust & Ownership Notice Banner */}
      <div className="p-3.5 rounded-xl bg-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-100">Student Ownership & Privacy Guarantee: </span>
            <span className="text-slate-300">
              You decide which contact details and activities appear on your resume. External achievements don't require faculty approval unless institutional verification is requested.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] bg-white/10 px-2.5 py-1 rounded-lg shrink-0">
          <span className="text-slate-300">ATS Readiness:</span>
          <span className="text-emerald-400 font-bold">{atsScore}%</span>
        </div>
      </div>

      {/* Main Container (Split or Focused) */}
      <div className={`grid gap-6 ${activeMode === 'split' ? 'lg:grid-cols-12' : 'grid-cols-1'}`}>
        {/* LEFT COLUMN: CONTROLS & RECORD SELECTION */}
        {(activeMode === 'edit' || activeMode === 'split') && (
          <div className={`space-y-6 ${activeMode === 'split' ? 'lg:col-span-6' : 'max-w-4xl mx-auto w-full'}`}>
            {/* Sourced from My Profile Integration Banner */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-indigo-950 block">Profile Data Integration</span>
                  <span className="text-indigo-700 text-[11px]">
                    Basic profile data (Name, Degree, Department, CGPA, Phone, Social Links) is retrieved from <strong>My Profile</strong>. Changes there update your resume information.
                  </span>
                </div>
              </div>
              {setCurrentTab && (
                <button
                  type="button"
                  onClick={() => setCurrentTab('profile')}
                  className="px-3 py-1.5 rounded-xl bg-white border border-indigo-200 text-indigo-700 font-bold text-[11px] hover:bg-indigo-100 transition-colors shrink-0 shadow-2xs self-start sm:self-auto"
                >
                  Edit My Profile →
                </button>
              )}
            </div>

            {/* Resume Section Visibility Controls */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">Show / Hide Resume Sections</h3>
                </div>
                <span className="text-[11px] text-slate-500">Toggle sections</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  { key: 'summary', label: 'Summary' },
                  { key: 'education', label: 'Education' },
                  { key: 'skills', label: 'Skills' },
                  { key: 'projects', label: 'Projects' },
                  { key: 'achievements', label: 'Achievements' },
                  { key: 'participations', label: 'Extracurriculars' },
                  { key: 'certifications', label: 'Certifications' },
                  { key: 'internships', label: 'Internships' },
                  { key: 'leadership', label: 'Leadership' }
                ].map((sec) => (
                  <label key={sec.key} className="flex items-center justify-between p-2 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                    <span className="font-semibold text-slate-800 text-[11px] truncate">{sec.label}</span>
                    <input
                      type="checkbox"
                      checked={settings.visibleSections[sec.key as keyof typeof settings.visibleSections] !== false}
                      onChange={(e) => handleUpdateSettings({
                        visibleSections: {
                          ...settings.visibleSections,
                          [sec.key]: e.target.checked
                        }
                      })}
                      className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer ml-1"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* 1. Contact Info & Privacy Controls */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">Personal Info & Privacy Controls</h3>
                </div>
                <span className="text-[11px] text-slate-500">Toggle public visibility on resume</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Email toggle */}
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 block">Email Address</span>
                    <span className="text-slate-500 text-[11px] font-mono">{profile.student.email}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showEmail}
                    onChange={e => handleUpdateSettings({ showEmail: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                {/* Phone toggle & input */}
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 block">Phone Number</span>
                    <span className="text-slate-500 text-[11px] font-mono">{settings.phone || '+91 98765 43210'}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showPhone}
                    onChange={e => handleUpdateSettings({ showPhone: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                {/* CGPA / Grades */}
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 block">College CGPA</span>
                    <span className="text-slate-500 text-[11px]">{profile.student.cgpa || '8.92'} / 10.0 (Verified)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showGpa}
                    onChange={e => handleUpdateSettings({ showGpa: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                {/* Location */}
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 block">Location</span>
                    <span className="text-slate-500 text-[11px]">{settings.location || 'Bengaluru, India'}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showLocation}
                    onChange={e => handleUpdateSettings({ showLocation: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Social links row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
                <label className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-white">
                  <span className="font-semibold text-slate-700">LinkedIn</span>
                  <input
                    type="checkbox"
                    checked={settings.showLinkedIn}
                    onChange={e => handleUpdateSettings({ showLinkedIn: e.target.checked })}
                    className="w-3.5 h-3.5 text-indigo-600 rounded"
                  />
                </label>
                <label className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-white">
                  <span className="font-semibold text-slate-700">GitHub</span>
                  <input
                    type="checkbox"
                    checked={settings.showGithub}
                    onChange={e => handleUpdateSettings({ showGithub: e.target.checked })}
                    className="w-3.5 h-3.5 text-indigo-600 rounded"
                  />
                </label>
                <label className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-white">
                  <span className="font-semibold text-slate-700">Portfolio</span>
                  <input
                    type="checkbox"
                    checked={settings.showPortfolio}
                    onChange={e => handleUpdateSettings({ showPortfolio: e.target.checked })}
                    className="w-3.5 h-3.5 text-indigo-600 rounded"
                  />
                </label>
              </div>

              {/* Professional Summary Editor */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">Professional Summary</label>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.visibleSections.summary}
                      onChange={e =>
                        handleUpdateSettings({
                          visibleSections: { ...settings.visibleSections, summary: e.target.checked }
                        })
                      }
                      className="w-3.5 h-3.5 text-indigo-600 rounded"
                    />
                    <span>Show on Resume</span>
                  </label>
                </div>
                <textarea
                  rows={2}
                  value={settings.summary}
                  onChange={e => handleUpdateSettings({ summary: e.target.value })}
                  placeholder="Senior Computer Science student with proven hands-on experience in full-stack architecture, distributed systems..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* 2. Work Experience / Internships Section */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">Work Experience & Internships</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 font-bold text-slate-600">
                    {(profile.internships || []).length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onOpenAddInternship}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Internship
                  </button>
                </div>
              </div>

              {(!profile.internships || profile.internships.length === 0) ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No internships recorded yet. Add your industry work experience.
                </div>
              ) : (
                <div className="space-y-2">
                  {profile.internships.map((intern, idx) => (
                    <div
                      key={intern.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={intern.showOnResume !== false}
                          onChange={() => handleToggleItem('internship', intern.id, intern.showOnResume !== false)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
                          title="Toggle visibility on resume"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-900 truncate">{intern.role}</span>
                            <span className="text-xs text-slate-600 font-medium truncate">@ {intern.companyName}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <VerificationStatusBadge status={intern.verificationStatus} />
                            <span className="text-[10px] text-slate-400 font-mono">
                              {intern.startDate} – {intern.isCurrent ? 'Present' : intern.endDate}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {(intern.verificationStatus === 'self_reported' || !intern.verificationStatus) && (
                          <button
                            onClick={() => handleRequestVerification('internship', intern.id)}
                            className="px-2 py-1 text-[10px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                            title="Request faculty verification"
                          >
                            Verify
                          </button>
                        )}
                        <button
                          onClick={() => handleReorder('internship', intern.id, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleReorder('internship', intern.id, 'down')}
                          disabled={idx === profile.internships.length - 1}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Projects Section */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">Key Projects</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 font-bold text-slate-600">
                    {profile.projects.length}
                  </span>
                </div>
                <button
                  onClick={onOpenAddProject}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Project
                </button>
              </div>

              <div className="space-y-2">
                {profile.projects.map((proj, idx) => (
                  <div
                    key={proj.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={proj.showOnResume !== false}
                        onChange={() => handleToggleItem('project', proj.id, proj.showOnResume !== false)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
                        title="Toggle visibility on resume"
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 block truncate">{proj.name}</span>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <VerificationStatusBadge status={proj.verificationStatus} />
                          <span className="text-[10px] text-slate-500 font-mono">
                            {proj.technologies.slice(0, 3).join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {(proj.verificationStatus === 'self_reported' || !proj.verificationStatus) && (
                        <button
                          onClick={() => handleRequestVerification('project', proj.id)}
                          className="px-2 py-1 text-[10px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                        >
                          Verify
                        </button>
                      )}
                      <button
                        onClick={() => handleReorder('project', proj.id, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleReorder('project', proj.id, 'down')}
                        disabled={idx === profile.projects.length - 1}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Honors & Achievements Section */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-900">Achievements & Honors</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 font-bold text-slate-600">
                    {profile.achievements.length}
                  </span>
                </div>
                <button
                  onClick={onOpenAddAchievement}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Achievement
                </button>
              </div>

              <div className="space-y-2">
                {profile.achievements.map((ach, idx) => (
                  <div
                    key={ach.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={ach.showOnResume !== false}
                        onChange={() => handleToggleItem('achievement', ach.id, ach.showOnResume !== false)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
                        title="Toggle visibility on resume"
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 block truncate">{ach.title}</span>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <VerificationStatusBadge status={ach.verificationStatus} />
                          <span className="text-[10px] text-slate-500">{ach.organization || ach.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {(ach.verificationStatus === 'self_reported' || !ach.verificationStatus) && (
                        <button
                          onClick={() => handleRequestVerification('achievement', ach.id)}
                          className="px-2 py-1 text-[10px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                        >
                          Request Review
                        </button>
                      )}
                      <button
                        onClick={() => handleReorder('achievement', ach.id, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleReorder('achievement', ach.id, 'down')}
                        disabled={idx === profile.achievements.length - 1}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Hackathons & Participations */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">Participations & Competitions</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 font-bold text-slate-600">
                    {profile.participations.length}
                  </span>
                </div>
                <button
                  onClick={onOpenAddParticipation}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Participation
                </button>
              </div>

              <div className="space-y-2">
                {profile.participations.map((part, idx) => (
                  <div
                    key={part.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={part.showOnResume !== false}
                        onChange={() => handleToggleItem('participation', part.id, part.showOnResume !== false)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
                        title="Toggle visibility on resume"
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 block truncate">{part.eventName}</span>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <VerificationStatusBadge status={part.verificationStatus} />
                          <span className="text-[10px] text-slate-500 font-medium">Role: {part.role}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {(part.verificationStatus === 'self_reported' || !part.verificationStatus) && (
                        <button
                          onClick={() => handleRequestVerification('participation', part.id)}
                          className="px-2 py-1 text-[10px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                        >
                          Request Review
                        </button>
                      )}
                      <button
                        onClick={() => handleReorder('participation', part.id, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleReorder('participation', part.id, 'down')}
                        disabled={idx === profile.participations.length - 1}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. Certifications */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">Verified Certifications</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 font-bold text-slate-600">
                    {profile.certifications.length}
                  </span>
                </div>
                <button
                  onClick={onOpenAddCertification}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Certification
                </button>
              </div>

              <div className="space-y-2">
                {profile.certifications.map((cert, idx) => (
                  <div
                    key={cert.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={cert.showOnResume !== false}
                        onChange={() => handleToggleItem('certification', cert.id, cert.showOnResume !== false)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
                        title="Toggle visibility on resume"
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 block truncate">{cert.name}</span>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <VerificationStatusBadge status={cert.verificationStatus} />
                          <span className="text-[10px] text-slate-500">{cert.organization}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleReorder('certification', cert.id, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleReorder('certification', cert.id, 'down')}
                        disabled={idx === profile.certifications.length - 1}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RIGHT COLUMN: LIVE ATS-FRIENDLY A4 RESUME PREVIEW */}
        <div className={`${activeMode === 'edit' ? 'hidden print:block' : (activeMode === 'split' ? 'lg:col-span-6' : 'w-full')} space-y-4`}>
          <div className="flex items-center justify-between px-2 text-xs text-slate-500 no-print">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-indigo-600" />
              Live ATS Resume Preview (A4 Page)
            </span>
            <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
              100% Print Compatible
            </span>
          </div>

          <div className="bg-slate-100/80 p-4 sm:p-6 rounded-2xl border border-slate-200 overflow-x-auto print:p-0 print:border-none print:bg-transparent">
            <ResumeDocument profile={profile} settings={settings} />
          </div>
        </div>
      </div>
    </div>
  );
};
