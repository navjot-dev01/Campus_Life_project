import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { StudentJourneyProfile, Achievement, Participation, Project, Certification, Internship } from '../types';
import { JourneyTimeline } from '../components/journey/JourneyTimeline';
import { AddAchievementModal } from '../components/journey/AddAchievementModal';
import { AddParticipationModal } from '../components/journey/AddParticipationModal';
import { AddInternshipModal } from '../components/journey/AddInternshipModal';
import { AddProjectModal } from '../components/journey/AddProjectModal';
import { AddCertificationModal } from '../components/journey/AddCertificationModal';
import { VerificationStatusBadge, OrganizationTypeBadge } from '../components/common/Badge';
import {
  Sparkles,
  Trophy,
  Award,
  Code2,
  FileCheck2,
  Calendar,
  PlusCircle,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Github,
  GraduationCap,
  Download,
  Share2,
  Layers,
  Briefcase,
  FileText,
  Printer,
  ShieldCheck,
  Check
} from 'lucide-react';

interface MyJourneyPageProps {
  initialTab?: 'timeline' | 'internships' | 'achievements' | 'participations' | 'projects' | 'certifications';
  setCurrentTab?: (tab: string) => void;
}

export const MyJourneyPage: React.FC<MyJourneyPageProps> = ({ initialTab = 'timeline', setCurrentTab }) => {
  const { currentUser } = useAuth();
  const { refreshKey, showToast, triggerRefresh } = useApp();

  const [profile, setProfile] = useState<StudentJourneyProfile>(() =>
    api.getStudentJourneyProfile(currentUser.id)
  );

  const [activeTab, setActiveTab] = useState<
    'timeline' | 'internships' | 'achievements' | 'participations' | 'projects' | 'certifications'
  >(initialTab === ('resume' as any) ? 'timeline' : initialTab);

  useEffect(() => {
    if (initialTab && initialTab !== ('resume' as any)) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [isAddAchievementOpen, setIsAddAchievementOpen] = useState(false);
  const [isAddParticipationOpen, setIsAddParticipationOpen] = useState(false);
  const [isAddInternshipOpen, setIsAddInternshipOpen] = useState(false);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [isAddCertificationOpen, setIsAddCertificationOpen] = useState(false);

  useEffect(() => {
    setProfile(api.getStudentJourneyProfile(currentUser.id));
  }, [currentUser.id, refreshKey]);

  const verifiedCount =
    profile.achievements.filter(a => a.verificationStatus === 'verified_institution' || a.verificationStatus === 'verified_external' || (a.verificationStatus as any) === 'verified').length +
    profile.participations.filter(p => p.verificationStatus === 'verified_institution' || p.verificationStatus === 'verified_external' || (p.verificationStatus as any) === 'verified').length +
    profile.certifications.filter(c => c.verificationStatus === 'verified_institution' || c.verificationStatus === 'verified_external' || (c.verificationStatus as any) === 'verified').length +
    (profile.internships || []).filter(i => i.verificationStatus === 'verified_institution' || i.verificationStatus === 'verified_external').length;

  const resumeItemsCount =
    profile.achievements.filter(a => a.showOnResume !== false).length +
    profile.participations.filter(p => p.showOnResume !== false).length +
    profile.projects.filter(p => p.showOnResume !== false).length +
    profile.certifications.filter(c => c.showOnResume !== false).length +
    (profile.internships || []).filter(i => i.showOnResume !== false).length;

  const handleToggleResume = (
    type: 'achievement' | 'participation' | 'project' | 'certification' | 'internship',
    id: string,
    current: boolean
  ) => {
    api.toggleResumeItemVisibility(type, id, !current);
    triggerRefresh();
    showToast({
      type: 'info',
      title: !current ? 'Added to Resume' : 'Hidden from Resume',
      message: !current ? 'Record will appear on your ATS resume.' : 'Record hidden from your resume.'
    });
  };

  const handleRequestVerification = (
    type: 'achievement' | 'participation' | 'project' | 'certification' | 'internship',
    id: string
  ) => {
    api.requestVerification(type, id);
    triggerRefresh();
    showToast({
      type: 'success',
      title: 'Verification Request Submitted',
      message: 'Request forwarded to faculty and department deans for review.'
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. BASIC PROFILE HEADER (Dignified, Verified & Student-Owned) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative">
              <img
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200'}
                alt={currentUser.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-indigo-500/30 shadow-xl"
              />
              <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold border-2 border-slate-900 flex items-center gap-1 shadow-sm">
                <CheckCircle2 className="w-3 h-3" />
                Verified
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                  CampusLife Student Portfolio
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  ID: {currentUser.studentId || '21CS042'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
                {currentUser.name}
              </h1>

              <p className="text-xs sm:text-sm text-indigo-200 mt-1">
                {currentUser.branch} • {currentUser.year} ({currentUser.semester})
              </p>

              <div className="flex items-center gap-3 mt-3 text-xs text-slate-300 flex-wrap">
                <span>Institution: <strong className="text-white">{currentUser.collegeName || 'CampusLife Institute'}</strong></span>
                <span>•</span>
                <span>CGPA: <strong className="text-white font-mono">{currentUser.cgpa || '8.92'}</strong></span>
                <span>•</span>
                <span className="text-indigo-300">Degree: B.Tech (2023–2027)</span>
              </div>
            </div>
          </div>

          {/* Quick Stats & Journey Actions */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end gap-3 w-full md:w-auto">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 text-center min-w-[75px]">
                <span className="text-xs text-indigo-200 block">Milestones</span>
                <span className="text-lg font-black font-mono">{profile.timeline.length}</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 text-center min-w-[75px]">
                <span className="text-xs text-emerald-300 block">Verified</span>
                <span className="text-lg font-black font-mono text-emerald-400">{verifiedCount}</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 text-center min-w-[75px]">
                <span className="text-xs text-indigo-200 block">On Resume</span>
                <span className="text-lg font-black font-mono text-indigo-300">{resumeItemsCount}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto mt-1 flex-wrap">
              <button
                id="journey-add-achievement-btn"
                onClick={() => setIsAddAchievementOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Record</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { id: 'timeline', label: 'Journey Timeline', count: profile.timeline.length, icon: Sparkles },
          { id: 'internships', label: 'Internships & Experience', count: (profile.internships || []).length, icon: Briefcase },
          { id: 'achievements', label: 'Honors & Awards', count: profile.achievements.length, icon: Trophy },
          { id: 'participations', label: 'Participations', count: profile.participations.length, icon: Award },
          { id: 'projects', label: 'Projects', count: profile.projects.length, icon: Code2 },
          { id: 'certifications', label: 'Certifications', count: profile.certifications.length, icon: FileCheck2 }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-300' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT 1: VISUAL CHRONOLOGICAL TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="p-6 rounded-3xl bg-slate-50/50 border border-slate-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Four-Year College Journey Timeline (2023–2027)
              </h3>
              <p className="text-xs text-slate-500">
                Verifiable chronological progression of academic admissions, hackathons, internships, projects, and credentials.
              </p>
            </div>
          </div>

          <JourneyTimeline milestones={profile.timeline} />
        </div>
      )}

      {/* TAB CONTENT: INTERNSHIPS & EXPERIENCE */}
      {activeTab === 'internships' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Industry Experience & Professional Internships</h3>
              <p className="text-xs text-slate-500">Off-campus and institutional internships, verified work records</p>
            </div>
            <button
              onClick={() => setIsAddInternshipOpen(true)}
              className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Add Internship
            </button>
          </div>

          {(!profile.internships || profile.internships.length === 0) ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
              <Briefcase className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              No internships logged yet. Add your work experience to highlight on your resume.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.internships.map(intern => (
                <div
                  key={intern.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <OrganizationTypeBadge type={intern.organizationType} />
                      <div className="flex items-center gap-2">
                        <VerificationStatusBadge status={intern.verificationStatus} />
                        <button
                          onClick={() => handleToggleResume('internship', intern.id, intern.showOnResume !== false)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all ${
                            intern.showOnResume !== false
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : 'bg-slate-100 text-slate-400 border-slate-200'
                          }`}
                        >
                          {intern.showOnResume !== false ? 'On Resume' : 'Hidden'}
                        </button>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mt-2.5">
                      {intern.role} <span className="text-slate-600 font-medium">@ {intern.companyName}</span>
                    </h4>

                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      {intern.startDate} – {intern.isCurrent ? 'Present' : intern.endDate} {intern.location ? `• ${intern.location}` : ''}
                    </p>

                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {intern.description}
                    </p>

                    {intern.technologies && intern.technologies.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {intern.technologies.map((t, idx) => (
                          <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <div>
                      {intern.supportingLink && (
                        <a
                          href={intern.supportingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <ExternalLink className="w-3 h-3" /> External Proof
                        </a>
                      )}
                    </div>
                    {(intern.verificationStatus === 'self_reported' || intern.verificationStatus === 'pending_verification') && (
                      <button
                        onClick={() => handleRequestVerification('internship', intern.id)}
                        className="text-indigo-700 hover:underline font-semibold"
                      >
                        Request Review
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: ACHIEVEMENTS */}
      {activeTab === 'achievements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Academic & Extracurricular Honors</h3>
              <p className="text-xs text-slate-500">Hackathon awards, rank certificates, and institutional recognitions</p>
            </div>
            <button
              onClick={() => setIsAddAchievementOpen(true)}
              className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Add New Achievement
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.achievements.map(ach => (
              <div
                key={ach.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                      {ach.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <VerificationStatusBadge status={ach.verificationStatus} />
                      <button
                        onClick={() => handleToggleResume('achievement', ach.id, ach.showOnResume !== false)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all ${
                          ach.showOnResume !== false
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}
                      >
                        {ach.showOnResume !== false ? 'On Resume' : 'Hidden'}
                      </button>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 mt-2 leading-snug">
                    {ach.title}
                  </h4>
                  {ach.organization && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      Host / Issuer: {ach.organization}
                    </p>
                  )}
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {ach.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Year: {ach.year} ({ach.date})</span>
                  {(ach.verificationStatus === 'self_reported' || ach.verificationStatus === 'pending_verification') ? (
                    <button
                      onClick={() => handleRequestVerification('achievement', ach.id)}
                      className="text-indigo-600 hover:underline font-semibold"
                    >
                      Request Review
                    </button>
                  ) : (
                    <span className="text-emerald-700 font-medium">
                      ✓ {ach.verifiedBy || 'Institution Verified'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: PARTICIPATIONS */}
      {activeTab === 'participations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Co-Curricular Participation, Competitions & Clubs
              </h3>
              <p className="text-xs text-slate-500">Hackathons, sports, NSS, leadership, cultural festivals</p>
            </div>
            <button
              onClick={() => setIsAddParticipationOpen(true)}
              className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Add Participation
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.participations.map(part => (
              <div
                key={part.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200">
                      {part.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <VerificationStatusBadge status={part.verificationStatus} />
                      <button
                        onClick={() => handleToggleResume('participation', part.id, part.showOnResume !== false)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all ${
                          part.showOnResume !== false
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}
                      >
                        {part.showOnResume !== false ? 'On Resume' : 'Hidden'}
                      </button>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 mt-2">
                    {part.eventName}
                  </h4>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5">
                    Role: {part.role} {part.result ? `• Result: ${part.result}` : ''}
                  </p>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {part.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Date: {part.date}</span>
                  {(part.verificationStatus === 'self_reported' || part.verificationStatus === 'pending_verification') ? (
                    <button
                      onClick={() => handleRequestVerification('participation', part.id)}
                      className="text-indigo-600 hover:underline font-semibold"
                    >
                      Request Review
                    </button>
                  ) : (
                    <span className="text-emerald-700 font-medium">
                      Verified by {part.verifiedBy || 'Institution'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: PROJECTS */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Technical Projects & Engineering Showcase</h3>
              <p className="text-xs text-slate-500">Self-driven open-source projects, lab capstones, and deployed prototypes</p>
            </div>
            <button
              onClick={() => setIsAddProjectOpen(true)}
              className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Add Project
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.projects.map(proj => (
              <div
                key={proj.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-mono font-semibold">Year {proj.year}</span>
                    <div className="flex items-center gap-2">
                      <VerificationStatusBadge status={proj.verificationStatus} />
                      <button
                        onClick={() => handleToggleResume('project', proj.id, proj.showOnResume !== false)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all ${
                          proj.showOnResume !== false
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}
                      >
                        {proj.showOnResume !== false ? 'On Resume' : 'Hidden'}
                      </button>
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-2">
                    {proj.name}
                  </h4>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-3">
                    {proj.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {proj.technologies.map((tech, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    {proj.githubUrl && (
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-700 hover:text-indigo-600 flex items-center gap-1 font-semibold"
                      >
                        <Github className="w-3.5 h-3.5" /> Code
                      </a>
                    )}
                    {proj.demoUrl && (
                      <a
                        href={proj.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Demo
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: CERTIFICATIONS */}
      {activeTab === 'certifications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Verified Industry Certifications</h3>
              <p className="text-xs text-slate-500">Cloud certifications, professional credentials, and accredited coursework</p>
            </div>
            <button
              onClick={() => setIsAddCertificationOpen(true)}
              className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Add Certification
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.certifications.map(cert => (
              <div
                key={cert.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200">
                      {cert.organization}
                    </span>
                    <div className="flex items-center gap-2">
                      <VerificationStatusBadge status={cert.verificationStatus} />
                      <button
                        onClick={() => handleToggleResume('certification', cert.id, cert.showOnResume !== false)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all ${
                          cert.showOnResume !== false
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}
                      >
                        {cert.showOnResume !== false ? 'On Resume' : 'Hidden'}
                      </button>
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-2">
                    {cert.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Issued Date: {cert.issueDate}
                  </p>
                  {cert.credentialId && (
                    <p className="text-[11px] font-mono text-slate-500 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100 truncate">
                      ID: {cert.credentialId}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-emerald-700 font-semibold">
                    Accredited
                  </span>
                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Verify Link
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals for all five student journey categories */}
      <AddAchievementModal
        isOpen={isAddAchievementOpen}
        onClose={() => setIsAddAchievementOpen(false)}
      />
      <AddParticipationModal
        isOpen={isAddParticipationOpen}
        onClose={() => setIsAddParticipationOpen(false)}
      />
      <AddInternshipModal
        isOpen={isAddInternshipOpen}
        onClose={() => setIsAddInternshipOpen(false)}
        studentId={currentUser.id}
        studentName={currentUser.name}
        onSave={(internship) => {
          api.addInternship(internship);
          triggerRefresh();
        }}
      />
      <AddProjectModal
        isOpen={isAddProjectOpen}
        onClose={() => setIsAddProjectOpen(false)}
      />
      <AddCertificationModal
        isOpen={isAddCertificationOpen}
        onClose={() => setIsAddCertificationOpen(false)}
      />
    </div>
  );
};
