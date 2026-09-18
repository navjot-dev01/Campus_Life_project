import React from 'react';
import { User, StudentProfile } from '../../types';
import { api } from '../../services/api';
import {
  GraduationCap,
  Mail,
  Phone,
  Building,
  CheckCircle2,
  Sparkles,
  MapPin,
  Edit3,
  FileText,
  Linkedin,
  Github,
  Globe,
  HeartPulse,
  PhoneCall,
  UserCheck,
  Camera,
  ExternalLink,
  ShieldCheck,
  Trophy
} from 'lucide-react';

interface StudentProfileViewProps {
  profile: StudentProfile | User;
  onOpenEdit?: () => void;
  setCurrentTab?: (tab: string) => void;
  isReadOnly?: boolean;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  profile,
  onOpenEdit,
  setCurrentTab,
  isReadOnly = false
}) => {
  const journey = api.getStudentJourneyProfile(profile.id);
  const attendanceAnalytics = api.getStudentAttendanceAnalytics(profile.id);

  return (
    <div className="space-y-6">
      {/* Read-only Directory Notice */}
      {isReadOnly && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold text-amber-950">Read-Only Student Profile Record</p>
              <p className="text-[11px] text-amber-800">
                Viewing official institutional profile for <strong>{profile.name}</strong> ({profile.studentId || profile.id}). Modification of academic fields is restricted to registrar governance.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-amber-200/70 text-amber-900 text-[10px] font-bold uppercase tracking-wider shrink-0">
            Read-Only Mode
          </span>
        </div>
      )}

      {/* 1. STUDENT PROFILE HERO BANNER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative group">
              <img
                src={profile.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200'}
                alt={profile.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-indigo-50 shadow-md"
              />
              {!isReadOnly && onOpenEdit && (
                <button
                  onClick={onOpenEdit}
                  className="absolute -bottom-2 -right-2 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-md transition-transform hover:scale-105"
                  title="Update Profile Photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  STUDENT PROFILE
                </span>
                <span className="text-xs text-slate-600 font-mono bg-slate-100 px-2.5 py-0.5 rounded-md font-semibold">
                  Roll No: {profile.studentId || profile.id}
                </span>
                {profile.cgpa && (
                  <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md font-bold font-mono">
                    CGPA: {profile.cgpa} / 10.0
                  </span>
                )}
                {isReadOnly && (
                  <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-semibold">
                    Directory Record
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-black text-slate-900 mt-2">
                {profile.name}
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                {profile.degree || 'B.Tech'} in {profile.branch || 'Computer Science & Engineering'} • {profile.year || '3rd Year'}, {profile.semester || '6th Semester'}
              </p>
              <p className="text-xs text-slate-500 font-medium">
                {profile.collegeName || 'CampusLife Institute of Technology'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {!isReadOnly && onOpenEdit && (
              <button
                onClick={onOpenEdit}
                id="student-edit-profile-btn"
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 text-xs font-bold transition-all shadow-2xs hover:bg-slate-50"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit Profile</span>
              </button>
            )}

            {!isReadOnly && setCurrentTab && (
              <>
                <button
                  onClick={() => setCurrentTab('resume-builder')}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Resume Builder</span>
                </button>
                <button
                  onClick={() => setCurrentTab('my-journey')}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>My Journey</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Short Bio Statement */}
        {profile.bio && (
          <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3.5 rounded-2xl">
            <span className="font-bold text-slate-800 block mb-0.5">Bio / Professional Statement:</span>
            {profile.bio}
          </div>
        )}
      </div>

      {/* 2. STUDENT SPECIFIC DETAILS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic Information Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>Student Academic Record</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Official College Record
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Degree & Branch:</span>
              <strong className="text-slate-800">{profile.degree || 'B.Tech'} - {profile.branch || 'Computer Science & Engineering'}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Current Standing:</span>
              <strong className="text-slate-800">{profile.year || '3rd Year'} • {profile.semester || '6th Semester'}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Cumulative CGPA:</span>
              <strong className="text-slate-800 font-mono">{profile.cgpa || '8.92'} / 10.0 (Verified)</strong>
            </div>
            {attendanceAnalytics && (
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Overall Attendance:</span>
                <strong className={`font-mono ${attendanceAnalytics.overallPercentage >= 75 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {attendanceAnalytics.overallPercentage}% {attendanceAnalytics.overallPercentage >= 75 ? '(Eligible)' : '(Warning <75%)'}
                </strong>
              </div>
            )}
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Faculty Academic Advisor:</span>
              <strong className="text-slate-800">{profile.advisorName || 'Dr. Rajesh Sharma (HOD CSE)'}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Academic Batch:</span>
              <strong className="text-slate-800 font-mono">{profile.batch || '2023 – 2027'}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Host College:</span>
              <strong className="text-slate-800">{profile.collegeName || 'CampusLife Institute'}</strong>
            </div>
          </div>
        </div>

        {/* Contact & Residential Information Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Building className="w-4 h-4 text-indigo-600" />
              <span>Contact & Residential Information</span>
            </div>
            <button
              onClick={onOpenEdit}
              className="text-[11px] text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              Edit Details
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50 items-center">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                College Email:
              </span>
              <strong className="text-slate-800 font-mono">{profile.email}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50 items-center">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Phone Number:
              </span>
              <strong className="text-slate-800 font-mono">{profile.phone || '+91 98765 43210'}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50 items-center">
              <span className="text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Hostel / Residence:
              </span>
              <strong className="text-slate-800 text-right">{profile.address || 'Campus Hostel Block B, Room 314'}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50 items-center">
              <span className="text-slate-500 flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                Emergency Contact:
              </span>
              <strong className="text-slate-800 text-right">{profile.emergencyContact || '+91 98111 22334 (Parent)'}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50 items-center">
              <span className="text-slate-500 flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5 text-slate-400" />
                Blood Group:
              </span>
              <strong className="text-slate-800 font-bold">{profile.bloodGroup || 'B+'}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50 items-center">
              <span className="text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                Geofence Eligibility:
              </span>
              <strong className="text-emerald-700 font-semibold">Campus Radius (200m) Active</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 3. STUDENT ONLINE PRESENCE & JOURNEY SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Online Profiles Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <UserCheck className="w-4 h-4 text-indigo-600" />
              <span>Online Profiles & Resume Links</span>
            </div>
            <span className="text-[11px] text-slate-400">Synced to Resume</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2">
                <Linkedin className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-slate-800">LinkedIn</span>
              </div>
              {profile.linkedinUrl ? (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 truncate max-w-[200px]"
                >
                  <span className="truncate">{profile.linkedinUrl.replace(/^https?:\/\/(www\.)?/, '')}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              ) : (
                <span className="text-slate-400 italic">Not specified</span>
              )}
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2">
                <Github className="w-4 h-4 text-slate-900" />
                <span className="font-semibold text-slate-800">GitHub</span>
              </div>
              {profile.githubUrl ? (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 truncate max-w-[200px]"
                >
                  <span className="truncate">{profile.githubUrl.replace(/^https?:\/\/(www\.)?/, '')}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              ) : (
                <span className="text-slate-400 italic">Not specified</span>
              )}
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-slate-800">Portfolio</span>
              </div>
              {profile.portfolioUrl ? (
                <a
                  href={profile.portfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 truncate max-w-[200px]"
                >
                  <span className="truncate">{profile.portfolioUrl.replace(/^https?:\/\/(www\.)?/, '')}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              ) : (
                <span className="text-slate-400 italic">Not specified</span>
              )}
            </div>
          </div>
        </div>

        {/* Student Achievements & Journey Snapshot */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Student Journey & Credentials</span>
            </div>
            {setCurrentTab && (
              <button
                onClick={() => setCurrentTab('my-journey')}
                className="text-[11px] text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                View Full Timeline
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-2xl">
              <span className="text-2xl font-black text-indigo-900 block font-mono">
                {journey.achievements.length}
              </span>
              <span className="text-[11px] text-indigo-700 font-medium">Achievements</span>
            </div>
            <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-2xl">
              <span className="text-2xl font-black text-emerald-900 block font-mono">
                {journey.projects.length}
              </span>
              <span className="text-[11px] text-emerald-700 font-medium">Projects Built</span>
            </div>
            <div className="p-3 bg-sky-50/60 border border-sky-100 rounded-2xl">
              <span className="text-2xl font-black text-sky-900 block font-mono">
                {journey.certifications.length}
              </span>
              <span className="text-[11px] text-sky-700 font-medium">Certifications</span>
            </div>
            <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-2xl">
              <span className="text-2xl font-black text-purple-900 block font-mono">
                {journey.internships.length}
              </span>
              <span className="text-[11px] text-purple-700 font-medium">Internships</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
