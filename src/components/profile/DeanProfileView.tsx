import React from 'react';
import { User, DeanProfile } from '../../types';
import {
  Award,
  Mail,
  Phone,
  Building,
  CheckCircle2,
  MapPin,
  Edit3,
  ShieldCheck,
  BookOpen,
  Camera,
  Layers,
  Scroll,
  Users
} from 'lucide-react';

interface DeanProfileViewProps {
  profile: DeanProfile | User;
  onOpenEdit?: () => void;
  setCurrentTab?: (tab: string) => void;
  isReadOnly?: boolean;
}

export const DeanProfileView: React.FC<DeanProfileViewProps> = ({
  profile,
  onOpenEdit,
  setCurrentTab,
  isReadOnly = false
}) => {
  const areas = profile.areasOfResponsibility || [
    'Institutional Curriculum Standards & Academic Governance',
    'Final Authorization for Honor Roll, Degree Conferrals & Credentials',
    'Faculty Academic Evaluation, Syllabus Modernization & Accreditation',
    'Cross-departmental Cohort Benchmarking & Academic Circulars'
  ];

  return (
    <div className="space-y-6">
      {/* 1. DEAN PROFILE HERO BANNER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative group">
              <img
                src={profile.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200'}
                alt={profile.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-purple-50 shadow-md"
              />
              {!isReadOnly && onOpenEdit && (
                <button
                  onClick={onOpenEdit}
                  className="absolute -bottom-2 -right-2 p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-md transition-transform hover:scale-105"
                  title="Update Profile Photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                  DEAN PROFILE
                </span>
                <span className="text-xs text-slate-600 font-mono bg-slate-100 px-2.5 py-0.5 rounded-md font-semibold">
                  Employee ID: {profile.employeeId || 'DEAN-ACAD-01'}
                </span>
                <span className="text-xs text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-md font-bold">
                  Academic Executive Leadership
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mt-2">
                {profile.name}
              </h2>
              <p className="text-xs text-slate-600 font-semibold mt-0.5">
                {profile.designation || 'Dean of Academic Affairs'} • {profile.department || 'Office of the Dean • Academic Affairs'}
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
                id="dean-edit-profile-btn"
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 text-xs font-bold transition-all shadow-2xs hover:bg-slate-50"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit Dean Profile</span>
              </button>
            )}
            {setCurrentTab && (
              <>
                <button
                  onClick={() => setCurrentTab('honor-roll')}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Honor Roll Authorizations</span>
                </button>
                <button
                  onClick={() => setCurrentTab('faculty-duty-monitoring')}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Faculty Duty Logs</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Executive Bio */}
        {profile.bio && (
          <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3.5 rounded-2xl">
            <span className="font-bold text-slate-800 block mb-0.5">Dean's Executive & Academic Bio:</span>
            {profile.bio}
          </div>
        )}
      </div>

      {/* 2. DEAN SPECIFIC DETAILS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Executive Qualifications Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Scroll className="w-4 h-4 text-purple-600" />
              <span>Academic Credentials & Executive Governance</span>
            </div>
            <span className="text-[11px] text-purple-700 font-semibold bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Highest Academic Authority
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Employee ID:</span>
              <strong className="text-slate-800 font-mono">{profile.employeeId || 'DEAN-ACAD-01'}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Official Title:</span>
              <strong className="text-slate-800">{profile.designation || 'Dean of Academic Affairs'}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Office / Division:</span>
              <strong className="text-slate-800">{profile.department || 'Office of the Dean • Academic Affairs'}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Executive Office Suite:</span>
              <strong className="text-slate-800">{profile.officeLocation || 'Academic Senate Wing, Administrative Block, Suite 101'}</strong>
            </div>
            <div className="flex flex-col py-1 border-b border-slate-50 gap-1">
              <span className="text-slate-500">Academic Qualifications:</span>
              <strong className="text-slate-800 leading-snug">
                {profile.qualifications || 'Ph.D. in Systems Engineering (MIT), Senior IEEE Fellow, F.N.A.Sc.'}
              </strong>
            </div>
          </div>
        </div>

        {/* Contact & Senate Office Info */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Building className="w-4 h-4 text-purple-600" />
              <span>Office Directory & Executive Contact</span>
            </div>
            <button
              onClick={onOpenEdit}
              className="text-[11px] text-purple-600 hover:text-purple-700 font-semibold"
            >
              Update Office Info
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50 items-center">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Dean's Official Email:
              </span>
              <strong className="text-slate-800 font-mono">{profile.email}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50 items-center">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Executive Phone:
              </span>
              <strong className="text-slate-800 font-mono">{profile.phone || '+91 98765 99887'}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50 items-center">
              <span className="text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Office Location:
              </span>
              <strong className="text-slate-800 text-right">{profile.officeLocation || 'Suite 101, Admin Block'}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50 items-center">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                Academic Scope:
              </span>
              <span className="text-[11px] font-semibold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                All Engineering & Sciences Departments
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. AREAS OF RESPONSIBILITY */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Award className="w-4 h-4 text-purple-600" />
            <span>Key Institutional Areas of Responsibility</span>
          </div>
          <span className="text-[11px] text-purple-700 font-medium">Academic Senate Mandate</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {areas.map((area, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-purple-50/40 border border-purple-100/70"
            >
              <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <span className="text-slate-700 leading-snug font-medium">{area}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
