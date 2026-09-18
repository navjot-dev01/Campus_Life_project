import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Achievement, Participation, Project, Internship, Certification } from '../types';
import { VerificationStatusBadge, OrganizationTypeBadge } from '../components/common/Badge';
import {
  CheckCheck,
  CheckCircle2,
  XCircle,
  Trophy,
  Award,
  Clock,
  User,
  ShieldCheck,
  Sparkles,
  Briefcase,
  Code2,
  FileCheck2,
  ExternalLink
} from 'lucide-react';

export const FacultyVerificationPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { refreshKey, triggerRefresh, showToast } = useApp();

  const [pendingAchievements, setPendingAchievements] = useState<Achievement[]>([]);
  const [pendingParticipations, setPendingParticipations] = useState<Participation[]>([]);
  const [pendingInternships, setPendingInternships] = useState<Internship[]>([]);
  const [pendingProjects, setPendingProjects] = useState<Project[]>([]);
  const [activeQueueTab, setActiveQueueTab] = useState<'all' | 'achievements' | 'participations' | 'internships' | 'projects'>('all');

  useEffect(() => {
    setPendingAchievements(api.getAllPendingAchievements());
    setPendingParticipations(api.getAllPendingParticipations());
    setPendingInternships(
      api.getInternships().filter(i => i.verificationStatus === 'pending_verification' || (i.verificationStatus as any) === 'pending')
    );
    setPendingProjects(
      api.getProjects().filter(p => p.verificationStatus === 'pending_verification' || (p.verificationStatus as any) === 'pending')
    );
  }, [refreshKey]);

  const handleVerify = (
    type: 'achievement' | 'participation' | 'internship' | 'project',
    id: string,
    title: string
  ) => {
    api.verifyRecord(type, id, 'verified_institution', currentUser.name);
    triggerRefresh();
    showToast({
      type: 'success',
      title: 'Record Verified & Certified',
      message: `"${title}" has been stamped with institutional verification by ${currentUser.name}.`
    });
  };

  const handleReject = (
    type: 'achievement' | 'participation' | 'internship' | 'project',
    id: string,
    title: string
  ) => {
    api.verifyRecord(type, id, 'rejected', currentUser.name);
    triggerRefresh();
    showToast({
      type: 'info',
      title: 'Verification Declined',
      message: `Verification request for "${title}" was declined.`
    });
  };

  const totalPending =
    pendingAchievements.length +
    pendingParticipations.length +
    pendingInternships.length +
    pendingProjects.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              Institutional Trust & Verification
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Queue: {totalPending} submissions
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1 font-sans">
            Student Journey Institutional Verification Queue
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Faculty and dean certification for student-requested achievements, hackathons, and capstone milestones.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs flex-wrap">
        <button
          onClick={() => setActiveQueueTab('all')}
          className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
            activeQueueTab === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Pending ({totalPending})
        </button>
        <button
          onClick={() => setActiveQueueTab('achievements')}
          className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
            activeQueueTab === 'achievements'
              ? 'bg-amber-100 text-amber-900 shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Achievements ({pendingAchievements.length})
        </button>
        <button
          onClick={() => setActiveQueueTab('participations')}
          className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
            activeQueueTab === 'participations'
              ? 'bg-indigo-100 text-indigo-900 shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Participations ({pendingParticipations.length})
        </button>
        <button
          onClick={() => setActiveQueueTab('internships')}
          className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
            activeQueueTab === 'internships'
              ? 'bg-sky-100 text-sky-900 shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Internships ({pendingInternships.length})
        </button>
        <button
          onClick={() => setActiveQueueTab('projects')}
          className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
            activeQueueTab === 'projects'
              ? 'bg-emerald-100 text-emerald-900 shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Projects ({pendingProjects.length})
        </button>
      </div>

      {/* Queue Items */}
      {totalPending === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Verification Queue is Clear</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            All submitted student achievements, hackathons, and journey records have been certified.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 1. Pending Achievements */}
          {(activeQueueTab === 'all' || activeQueueTab === 'achievements') &&
            pendingAchievements.map(ach => (
              <div
                key={ach.id}
                className="p-5 rounded-3xl bg-white border border-amber-200 shadow-xs hover:border-amber-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                      <Trophy className="w-3 h-3 text-amber-600" />
                      Achievement • {ach.category}
                    </span>
                    <VerificationStatusBadge status={ach.verificationStatus} />
                    <span className="text-xs text-slate-400 font-mono">
                      Year: {ach.year} ({ach.date})
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {ach.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                    {ach.description}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-indigo-700 font-medium pt-1">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-indigo-500" />
                      Submitted by: <strong>{ach.studentName}</strong>
                    </span>
                    {ach.supportingLink && (
                      <a
                        href={ach.supportingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <ExternalLink className="w-3 h-3" /> View Proof Link
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    onClick={() => handleReject('achievement', ach.id, ach.title)}
                    className="flex items-center gap-1 px-3.5 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-semibold transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                  <button
                    id={`verify-ach-${ach.id}`}
                    onClick={() => handleVerify('achievement', ach.id, ach.title)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Certify</span>
                  </button>
                </div>
              </div>
            ))}

          {/* 2. Pending Participations */}
          {(activeQueueTab === 'all' || activeQueueTab === 'participations') &&
            pendingParticipations.map(part => (
              <div
                key={part.id}
                className="p-5 rounded-3xl bg-white border border-indigo-200 shadow-xs hover:border-indigo-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200">
                      <Award className="w-3 h-3 text-indigo-600" />
                      Participation • {part.category}
                    </span>
                    <VerificationStatusBadge status={part.verificationStatus} />
                    <span className="text-xs text-slate-400 font-mono">
                      {part.date}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {part.eventName}
                  </h3>

                  <p className="text-xs font-semibold text-slate-700">
                    Role: {part.role} {part.result ? `• Result: ${part.result}` : ''}
                  </p>

                  <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                    {part.description}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-indigo-700 font-medium pt-1">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-indigo-500" />
                      Submitted by: <strong>{part.studentName}</strong>
                    </span>
                    {part.supportingLink && (
                      <a
                        href={part.supportingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <ExternalLink className="w-3 h-3" /> View Proof Link
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    onClick={() => handleReject('participation', part.id, part.eventName)}
                    className="flex items-center gap-1 px-3.5 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-semibold transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => handleVerify('participation', part.id, part.eventName)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Certify</span>
                  </button>
                </div>
              </div>
            ))}

          {/* 3. Pending Internships */}
          {(activeQueueTab === 'all' || activeQueueTab === 'internships') &&
            pendingInternships.map(intern => (
              <div
                key={intern.id}
                className="p-5 rounded-3xl bg-white border border-sky-200 shadow-xs hover:border-sky-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200">
                      <Briefcase className="w-3 h-3 text-sky-600" />
                      Internship • {intern.companyName}
                    </span>
                    <VerificationStatusBadge status={intern.verificationStatus} />
                    <span className="text-xs text-slate-400 font-mono">
                      {intern.startDate} – {intern.isCurrent ? 'Present' : intern.endDate}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {intern.role}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                    {intern.description}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-indigo-700 font-medium pt-1">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-indigo-500" />
                      Submitted by: <strong>{intern.studentName}</strong>
                    </span>
                    {intern.supportingLink && (
                      <a
                        href={intern.supportingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <ExternalLink className="w-3 h-3" /> View Offer/Completion Letter
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    onClick={() => handleReject('internship', intern.id, intern.role)}
                    className="flex items-center gap-1 px-3.5 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-semibold transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => handleVerify('internship', intern.id, intern.role)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Certify</span>
                  </button>
                </div>
              </div>
            ))}

          {/* 4. Pending Projects */}
          {(activeQueueTab === 'all' || activeQueueTab === 'projects') &&
            pendingProjects.map(proj => (
              <div
                key={proj.id}
                className="p-5 rounded-3xl bg-white border border-emerald-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <Code2 className="w-3 h-3 text-emerald-600" />
                      Capstone Project
                    </span>
                    <VerificationStatusBadge status={proj.verificationStatus} />
                    <span className="text-xs text-slate-400 font-mono">
                      Year: {proj.year}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {proj.name}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                    {proj.description}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-indigo-700 font-medium pt-1">
                    {proj.githubUrl && (
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-700 hover:text-indigo-600 flex items-center gap-1 font-semibold"
                      >
                        <ExternalLink className="w-3 h-3" /> GitHub Repo
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    onClick={() => handleReject('project', proj.id, proj.name)}
                    className="flex items-center gap-1 px-3.5 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-semibold transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => handleVerify('project', proj.id, proj.name)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Certify</span>
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
