import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StudentJourneyProfile, StudentResumeSettings } from '../types';
import { ResumeDocument } from '../components/resume/ResumeDocument';
import {
  Printer,
  FileDown,
  Share2,
  Check,
  ArrowLeft,
  ShieldCheck,
  ExternalLink,
  GraduationCap
} from 'lucide-react';
import { downloadResumePdf } from '../utils/resumePdf';

interface PublicResumePageProps {
  studentId: string;
  onNavigateHome?: () => void;
}

export const PublicResumePage: React.FC<PublicResumePageProps> = ({
  studentId,
  onNavigateHome
}) => {
  const [profile, setProfile] = useState<StudentJourneyProfile | null>(null);
  const [copied, setCopied] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Retrieve users and match by ID or studentId (e.g. 21CS042 or stu_1)
    const users = api.getAllUsers();
    const targetStudent = users.find(
      u => u.id === studentId || u.studentId === studentId || u.role === 'student'
    );

    if (targetStudent) {
      const fullProfile = api.getStudentJourneyProfile(targetStudent.id);
      
      // Sanitize profile to expose only public, student-selected resume data
      const safeSettings: StudentResumeSettings = fullProfile.resumeSettings || api.getResumeSettings(targetStudent.id);

      const sanitizedProfile: StudentJourneyProfile = {
        student: {
          id: targetStudent.id,
          name: targetStudent.name,
          email: safeSettings.showEmail ? targetStudent.email : '',
          role: 'student',
          studentId: targetStudent.studentId,
          branch: targetStudent.branch,
          year: targetStudent.year,
          semester: targetStudent.semester,
          collegeName: targetStudent.collegeName || 'CampusLife Institute of Technology',
          cgpa: safeSettings.showGpa ? targetStudent.cgpa : undefined,
          phone: safeSettings.showPhone ? (safeSettings.phone || targetStudent.phone) : undefined,
          address: safeSettings.showLocation ? (safeSettings.location || targetStudent.address) : undefined,
          linkedinUrl: safeSettings.showLinkedIn ? (safeSettings.linkedIn || targetStudent.linkedinUrl) : undefined,
          githubUrl: safeSettings.showGithub ? (safeSettings.github || targetStudent.githubUrl) : undefined,
          portfolioUrl: safeSettings.showPortfolio ? (safeSettings.portfolio || targetStudent.portfolioUrl) : undefined
        },
        achievements: (fullProfile.achievements || []).filter(a => a.showOnResume !== false),
        participations: (fullProfile.participations || []).filter(p => p.showOnResume !== false),
        projects: (fullProfile.projects || []).filter(p => p.showOnResume !== false),
        certifications: (fullProfile.certifications || []).filter(c => c.showOnResume !== false),
        internships: (fullProfile.internships || []).filter(i => i.showOnResume !== false),
        resumeSettings: safeSettings,
        timeline: []
      };

      setProfile(sanitizedProfile);
    } else {
      setNotFound(true);
    }
  }, [studentId]);

  const handleExportPDF = () => {
    if (!profile) return;
    const resumeSettings = profile.resumeSettings || api.getResumeSettings(profile.student.id);
    downloadResumePdf(profile, resumeSettings);
  };

  const handlePrint = () => {
    if (!profile) return;
    const studentName = profile?.student?.name ? profile.student.name.replace(/\s+/g, '_') : 'Student';
    const originalTitle = document.title;
    document.title = `${studentName}_Resume`;
    try {
      window.print();
    } finally {
      setTimeout(() => {
        document.title = originalTitle;
      }, 1000);
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center mb-4">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Resume Not Found</h2>
          <p className="text-xs text-slate-500 mt-2">
            The requested student resume link could not be located or the identifier is invalid.
          </p>
          <div className="mt-6">
            <button
              onClick={() => {
                if (onNavigateHome) onNavigateHome();
                else window.location.href = window.location.origin + window.location.pathname;
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors"
            >
              Go to CampusLife Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans">
      {/* Top Banner for Public/Recruiter View (Hidden in Print) */}
      <nav className="no-print bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (onNavigateHome) onNavigateHome();
                else window.location.href = window.location.origin + window.location.pathname;
              }}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Return to Portal"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CampusLife Portal</span>
            </button>
            <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-bold text-slate-800">
                Verified Student Resume
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                <ShieldCheck className="w-3 h-3 text-indigo-600" />
                Institutional Verification Active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Link Copied' : 'Share Link'}</span>
            </button>
            <button
              onClick={handleExportPDF}
              id="public-export-pdf-btn"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Export Resume as PDF"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
            <button
              onClick={handlePrint}
              id="public-print-resume-btn"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Print Resume or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Resume</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Resume Render Area */}
      <main className="max-w-5xl mx-auto py-6 sm:py-10 px-4 sm:px-6">
        <ResumeDocument
          profile={profile}
          settings={profile.resumeSettings || api.getResumeSettings(profile.student.id)}
        />
      </main>

      {/* Footer Info (Hidden in Print) */}
      <footer className="no-print border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p>
          Generated from <strong>CampusLife Student Journey Platform</strong> • Verifiable Academic & Extracurricular Credentials
        </p>
      </footer>
    </div>
  );
};
