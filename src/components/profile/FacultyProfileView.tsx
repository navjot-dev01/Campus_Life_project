import React from 'react';
import { User, FacultyProfile } from '../../types';
import {
  Briefcase,
  Mail,
  Phone,
  Building,
  CheckCircle2,
  MapPin,
  Edit3,
  BookOpen,
  Award,
  Layers,
  Sparkles,
  Camera,
  ClipboardList,
  GraduationCap
} from 'lucide-react';

interface FacultyProfileViewProps {
  profile: FacultyProfile | User;
  onOpenEdit?: () => void;
  setCurrentTab?: (tab: string) => void;
  isReadOnly?: boolean;
}

export const FacultyProfileView: React.FC<FacultyProfileViewProps> = ({
  profile,
  onOpenEdit,
  setCurrentTab,
  isReadOnly = false
}) => {
  const subjects = profile.subjectsTaught || [
    'Database Management Systems (CS601)',
    'Advanced Database Architectures (CS702)',
    'AI & Machine Learning (CS605)'
  ];

  const responsibilities = profile.responsibilities || [
    'Head of Department & Academic Advisor for CSE 3rd Year',
    'Course Coordinator for Database Systems Curriculum',
    'Member, Campus Academic Integrity & Honor Roll Verification Board'
  ];

  return (
    <div className="space-y-6">
      {/* 1. FACULTY PROFILE HERO BANNER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative group">
              <img
                src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                alt={profile.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-emerald-50 shadow-md"
              />
              {!isReadOnly && onOpenEdit && (
                <button
                  onClick={onOpenEdit}
                  className="absolute -bottom-2 -right-2 p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-md transition-transform hover:scale-105"
                  title="Update Profile Photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                  FACULTY PROFILE
                </span>
                <span className="text-xs text-slate-600 font-mono bg-slate-100 px-2.5 py-0.5 rounded-md font-semibold">
                  Employee ID: {profile.employeeId || 'FAC-CS-042'}
                </span>
                <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md font-bold">
                  Active Faculty Member
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mt-2">
                {profile.name}
              </h2>
              <p className="text-xs text-slate-600 font-semibold mt-0.5">
                {profile.designation || 'Associate Professor & HOD'} • {profile.department || 'Computer Science & Engineering'}
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
                id="faculty-edit-profile-btn"
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 text-xs font-bold transition-all shadow-2xs hover:bg-slate-50"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit Faculty Profile</span>
              </button>
            )}
            {setCurrentTab && (
              <button
                onClick={() => setCurrentTab('faculty-attendance')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Faculty Daily Duty Log</span>
              </button>
            )}
          </div>
        </div>

        {/* Short Bio Statement */}
        {profile.bio && (
          <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3.5 rounded-2xl">
            <span className="font-bold text-slate-800 block mb-0.5">Academic & Research Bio:</span>
            {profile.bio}
          </div>
        )}
      </div>

      {/* 2. FACULTY SPECIFIC DETAILS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic Qualifications & Department Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Briefcase className="w-4 h-4 text-emerald-600" />
              <span>Academic Appointment & Credentials</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Verified Faculty
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Employee ID:</span>
              <strong className="text-slate-800 font-mono">{profile.employeeId || 'FAC-CS-042'}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Academic Designation:</span>
              <strong className="text-slate-800">{profile.designation || 'Associate Professor & HOD'}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Department:</span>
              <strong className="text-slate-800">{profile.department || 'Computer Science & Engineering'}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Faculty Office / Room:</span>
              <strong className="text-slate-800">{profile.officeRoom || 'CS Block, Room 304'}</strong>
            </div>
            <div className="flex flex-col py-1 border-b border-slate-50 gap-1">
              <span className="text-slate-500">Academic Qualifications:</span>
              <strong className="text-slate-800 leading-snug">
                {profile.qualifications || 'Ph.D. in Computer Science (IIT Delhi), M.Tech (CSE)'}
              </strong>
            </div>
            <div className="flex flex-col py-1 border-b border-slate-50 gap-1">
              <span className="text-slate-500">Specialization / Research:</span>
              <strong className="text-slate-800 leading-snug">
                {profile.specialization || 'Distributed Database Systems, Cloud Infrastructure & Big Data'}
              </strong>
            </div>
          </div>
        </div>

        {/* Contact & Faculty Office Information */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Building className="w-4 h-4 text-emerald-600" />
              <span>Office & Contact Directory</span>
            </div>
            <button
              onClick={onOpenEdit}
              className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              Update Contact
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
                Contact Phone:
              </span>
              <strong className="text-slate-800 font-mono">{profile.phone || '+91 98765 11223'}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50 items-center">
              <span className="text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Office Location:
              </span>
              <strong className="text-slate-800 text-right">{profile.officeRoom || 'CS Block, Room 304'}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50 items-center">
              <span className="text-slate-500 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                Affiliation:
              </span>
              <strong className="text-slate-800 text-right">{profile.collegeName || 'CampusLife Institute'}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50 items-center">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                Access Privileges:
              </span>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Attendance Broadcast & Course Evaluation
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SUBJECTS TAUGHT & FACULTY RESPONSIBILITIES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subjects Taught Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Courses & Subjects Taught</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">{subjects.length} active courses</span>
          </div>

          <div className="space-y-2">
            {subjects.map((sub, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  {idx + 1}
                </div>
                <span className="font-semibold text-slate-800">{sub}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Faculty Responsibilities Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Faculty Responsibilities & Committees</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-medium">Departmental Role</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {responsibilities.map((resp, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-2xl bg-emerald-50/40 border border-emerald-100/70"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-slate-700 leading-snug font-medium">{resp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
