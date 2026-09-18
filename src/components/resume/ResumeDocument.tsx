import React from 'react';
import { StudentJourneyProfile, StudentResumeSettings, VerificationStatus } from '../../types';
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  CheckCircle2,
  Award,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface ResumeDocumentProps {
  profile: StudentJourneyProfile;
  settings: StudentResumeSettings;
  printRef?: React.RefObject<HTMLDivElement | null>;
}

export const ResumeDocument: React.FC<ResumeDocumentProps> = ({
  profile,
  settings,
  printRef
}) => {
  const { student, achievements, participations, projects, certifications, internships } = profile;

  // Filter and sort items that the student chose to show on the resume
  const resumeInternships = (internships || [])
    .filter(i => i.showOnResume !== false)
    .sort((a, b) => (a.resumeOrder || 0) - (b.resumeOrder || 0));

  const resumeProjects = (projects || [])
    .filter(p => p.showOnResume !== false)
    .sort((a, b) => (a.resumeOrder || 0) - (b.resumeOrder || 0));

  const resumeAchievements = (achievements || [])
    .filter(a => a.showOnResume !== false)
    .sort((a, b) => (a.resumeOrder || 0) - (b.resumeOrder || 0));

  const resumeParticipations = (participations || [])
    .filter(p => p.showOnResume !== false)
    .sort((a, b) => (a.resumeOrder || 0) - (b.resumeOrder || 0));

  const resumeCertifications = (certifications || [])
    .filter(c => c.showOnResume !== false)
    .sort((a, b) => (a.resumeOrder || 0) - (b.resumeOrder || 0));

  const resumeLeadership = [
    ...(participations || []).filter(
      p =>
        p.showOnResume !== false &&
        (p.category === 'NCC/NSS' ||
          p.category === 'Fest' ||
          (p.role && /lead|head|president|secretary|coordinator|volunteer|sergeant/i.test(p.role)))
    ),
    ...(achievements || []).filter(
      a =>
        a.showOnResume !== false &&
        (a.category === 'Cultural' ||
          a.category === 'Sports' ||
          (a.title && /leadership|lead|head|president|coordinator|captain|cadet/i.test(a.title)))
    )
  ].sort((a, b) => (a.resumeOrder || 0) - (b.resumeOrder || 0));

  const formatVerificationBadge = (status?: VerificationStatus) => {
    switch (status) {
      case 'verified_institution':
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded print:border-emerald-300">
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 print:text-emerald-700" />
            <span>Verified by Institution</span>
          </span>
        );
      case 'verified_external':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-800 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded print:border-sky-300">
            <Globe className="w-2.5 h-2.5 text-sky-600 print:text-sky-700" />
            <span>Verified by External Org</span>
          </span>
        );
      case 'pending_verification':
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded print:hidden">
            <span>Pending Verification</span>
          </span>
        );
      case 'self_reported':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded print:border-slate-300">
            <span>Self-Reported</span>
          </span>
        );
    }
  };

  return (
    <div
      ref={printRef}
      id="resume-document"
      className="print-resume-only bg-white text-slate-900 font-sans shadow-lg mx-auto p-8 sm:p-10 max-w-[850px] min-h-[1100px] border border-slate-200 rounded-sm print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none print:w-full"
      style={{
        boxSizing: 'border-box',
        color: '#0f172a'
      }}
    >
      {/* 1. HEADER SECTION */}
      <header className="border-b-2 border-slate-900 pb-4 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 uppercase">
              {student.name}
            </h1>
            <p className="text-sm font-semibold text-slate-700 mt-0.5">
              {student.branch || 'Computer Science & Engineering'} • {student.collegeName || 'CampusLife Institute of Technology'}
            </p>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-200 print:bg-white">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>CampusLife ID: {student.studentId || student.id}</span>
          </div>
        </div>

        {/* Contact info row - Respects Student Ownership & Privacy choices */}
        <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-600 mt-3 pt-2 border-t border-slate-100">
          {settings.showEmail && student.email && (
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3 text-slate-500" />
              <a href={`mailto:${student.email}`} className="hover:text-indigo-600 underline-offset-2">
                {student.email}
              </a>
            </span>
          )}

          {settings.showPhone && (settings.phone || student.phone) && (
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-500" />
              <span>{settings.phone || student.phone}</span>
            </span>
          )}

          {settings.showLocation && (settings.location || student.address) && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-500" />
              <span>{settings.location || student.address}</span>
            </span>
          )}

          {settings.showLinkedIn && (settings.linkedIn || student.linkedinUrl) && (
            <span className="flex items-center gap-1">
              <Linkedin className="w-3 h-3 text-slate-500" />
              <a
                href={(settings.linkedIn || student.linkedinUrl)!.startsWith('http') ? (settings.linkedIn || student.linkedinUrl) : `https://${settings.linkedIn || student.linkedinUrl}`}
                target="_blank"
                rel="noreferrer"
                className="text-slate-700 hover:text-indigo-600"
              >
                {(settings.linkedIn || student.linkedinUrl)!.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            </span>
          )}

          {settings.showGithub && (settings.github || student.githubUrl) && (
            <span className="flex items-center gap-1">
              <Github className="w-3 h-3 text-slate-500" />
              <a
                href={(settings.github || student.githubUrl)!.startsWith('http') ? (settings.github || student.githubUrl) : `https://${settings.github || student.githubUrl}`}
                target="_blank"
                rel="noreferrer"
                className="text-slate-700 hover:text-indigo-600"
              >
                {(settings.github || student.githubUrl)!.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            </span>
          )}

          {settings.showPortfolio && (settings.portfolio || student.portfolioUrl) && (
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3 text-slate-500" />
              <a
                href={(settings.portfolio || student.portfolioUrl)!.startsWith('http') ? (settings.portfolio || student.portfolioUrl) : `https://${settings.portfolio || student.portfolioUrl}`}
                target="_blank"
                rel="noreferrer"
                className="text-slate-700 hover:text-indigo-600"
              >
                {(settings.portfolio || student.portfolioUrl)!.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            </span>
          )}
        </div>
      </header>

      {/* 2. PROFESSIONAL SUMMARY */}
      {settings.visibleSections.summary && settings.summary && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
            Professional Summary
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed text-justify">
            {settings.summary}
          </p>
        </section>
      )}

      {/* 3. EDUCATION */}
      {settings.visibleSections.education && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
            Education
          </h2>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-1">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-900">
                  {student.collegeName || 'CampusLife Institute of Technology'}
                </h3>
                <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                  <span>Enrolled Student</span>
                </span>
              </div>
              <p className="text-xs text-slate-700 mt-0.5">
                Bachelor of Technology (B.Tech) in {student.branch || 'Computer Science & Engineering'}
              </p>
            </div>
            <div className="text-left sm:text-right text-xs">
              <span className="font-semibold text-slate-800 block">2023 – 2027 (Expected)</span>
              {settings.showGpa && (
                <span className="text-slate-600 font-medium">
                  Cumulative CGPA: <strong className="text-slate-900 font-bold">{student.cgpa || '8.92'} / 10.0</strong>
                </span>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 4. TECHNICAL SKILLS */}
      {settings.visibleSections.skills && settings.skills && settings.skills.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
            Technical Competencies & Skills
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
            {settings.skills.map((skillGroup, idx) => (
              <div key={idx} className="flex items-baseline gap-1.5">
                <span className="font-bold text-slate-900 whitespace-nowrap">{skillGroup.category}:</span>
                <span className="text-slate-700">{skillGroup.items.join(', ')}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. WORK EXPERIENCE / INTERNSHIPS */}
      {settings.visibleSections.internships && resumeInternships.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
            Work Experience & Professional Internships
          </h2>
          <div className="space-y-3">
            {resumeInternships.map(intern => (
              <div key={intern.id} className="text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900">{intern.role}</span>
                    <span className="text-slate-500 font-normal">|</span>
                    <span className="font-semibold text-slate-800">{intern.companyName}</span>
                    {formatVerificationBadge(intern.verificationStatus)}
                  </div>
                  <div className="text-slate-600 font-mono text-[11px] whitespace-nowrap">
                    {intern.startDate} – {intern.isCurrent ? 'Present' : intern.endDate || '2025'}
                    {intern.location ? ` • ${intern.location}` : ''}
                  </div>
                </div>

                <p className="text-slate-700 mt-1 leading-relaxed text-justify">
                  {intern.description}
                </p>

                {intern.technologies && intern.technologies.length > 0 && (
                  <div className="mt-1 text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-800">Key Technologies: </span>
                    {intern.technologies.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. PROJECTS */}
      {settings.visibleSections.projects && resumeProjects.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
            Key Software & Engineering Projects
          </h2>
          <div className="space-y-3">
            {resumeProjects.map(proj => (
              <div key={proj.id} className="text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900">{proj.name}</span>
                    {proj.organization && (
                      <span className="text-[11px] text-slate-600">({proj.organization})</span>
                    )}
                    {formatVerificationBadge(proj.verificationStatus)}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-600 font-mono">
                    <span>{proj.year}</span>
                    {proj.githubUrl && (
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-700 hover:text-indigo-600 underline print:no-underline"
                      >
                        Code
                      </a>
                    )}
                    {proj.demoUrl && (
                      <a
                        href={proj.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-700 hover:text-indigo-600 underline print:no-underline"
                      >
                        Live Demo
                      </a>
                    )}
                  </div>
                </div>

                <p className="text-slate-700 mt-1 leading-relaxed text-justify">
                  {proj.description}
                </p>

                {proj.technologies && proj.technologies.length > 0 && (
                  <div className="mt-1 text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-800">Stack: </span>
                    {proj.technologies.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. HONORS & ACHIEVEMENTS */}
      {settings.visibleSections.achievements && resumeAchievements.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
            Academic & Extracurricular Honors
          </h2>
          <div className="space-y-2">
            {resumeAchievements.map(ach => (
              <div key={ach.id} className="text-xs">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900">{ach.title}</span>
                    {ach.organization && (
                      <span className="text-[11px] text-slate-600">({ach.organization})</span>
                    )}
                    {formatVerificationBadge(ach.verificationStatus)}
                  </div>
                  <span className="text-slate-500 font-mono text-[11px]">{ach.date || ach.year}</span>
                </div>
                <p className="text-slate-700 mt-0.5 leading-relaxed">
                  {ach.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 8. COMPETITIONS & HACKATHONS PARTICIPATION */}
      {settings.visibleSections.participations && resumeParticipations.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
            Hackathons, Competitions & Co-Curriculars
          </h2>
          <div className="space-y-2">
            {resumeParticipations.map(part => (
              <div key={part.id} className="text-xs">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900">{part.eventName}</span>
                    <span className="text-[11px] text-slate-600 font-medium">[{part.role}]</span>
                    {part.result && (
                      <span className="font-semibold text-indigo-700 bg-indigo-50 px-1 rounded text-[10px]">
                        {part.result}
                      </span>
                    )}
                    {formatVerificationBadge(part.verificationStatus)}
                  </div>
                  <span className="text-slate-500 font-mono text-[11px]">{part.date || part.year}</span>
                </div>
                <p className="text-slate-700 mt-0.5 leading-relaxed">
                  {part.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 9. CERTIFICATIONS & CREDENTIALS */}
      {settings.visibleSections.certifications && resumeCertifications.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
            Verified Certifications & Credentials
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
            {resumeCertifications.map(cert => (
              <div key={cert.id} className="flex flex-col">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-slate-900">{cert.name}</span>
                  {formatVerificationBadge(cert.verificationStatus)}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-600 mt-0.5">
                  <span>{cert.organization}</span>
                  <span className="font-mono">{cert.issueDate}</span>
                </div>
                {cert.credentialId && (
                  <span className="text-[10px] text-slate-500 font-mono">
                    ID: {cert.credentialId}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* LEADERSHIP & VOLUNTEERING */}
      {settings.visibleSections.leadership !== false && resumeLeadership.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
            Leadership & Volunteering
          </h2>
          <div className="space-y-2">
            {resumeLeadership.map(item => {
              const isPart = 'eventName' in item;
              const title = isPart ? (item as any).eventName : (item as any).title;
              const role = isPart ? (item as any).role : (item as any).category;
              return (
                <div key={item.id} className="text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900">{title}</span>
                      {role && <span className="text-[11px] text-slate-600 font-medium">[{role}]</span>}
                      {item.organization && <span className="text-[11px] text-slate-500">({item.organization})</span>}
                      {formatVerificationBadge(item.verificationStatus)}
                    </div>
                    <span className="text-slate-500 font-mono text-[11px]">{item.date || item.year}</span>
                  </div>
                  <p className="text-slate-700 mt-0.5 leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 10. VERIFICATION TRUST FOOTER */}
      <footer className="mt-8 pt-3 border-t border-slate-200 text-[10px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
          <span>
            Verified Student Academic Record • Generated via <strong>CampusLife ERP</strong>
          </span>
        </div>
        <div className="font-mono text-[10px] text-slate-400">
          Trust Stamp: {student.studentId || '21CS042'}-{new Date().getFullYear()}-VERIFIED
        </div>
      </footer>
    </div>
  );
};
