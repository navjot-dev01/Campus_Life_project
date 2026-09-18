import React from 'react';
import { User, AdminProfile } from '../../types';
import {
  Shield,
  Mail,
  Phone,
  Building,
  CheckCircle2,
  MapPin,
  Edit3,
  Server,
  Key,
  Camera,
  Layers,
  Settings,
  Users
} from 'lucide-react';

interface AdminProfileViewProps {
  profile: AdminProfile | User;
  onOpenEdit?: () => void;
  setCurrentTab?: (tab: string) => void;
  isReadOnly?: boolean;
}

export const AdminProfileView: React.FC<AdminProfileViewProps> = ({
  profile,
  onOpenEdit,
  setCurrentTab,
  isReadOnly = false
}) => {
  const responsibilities = profile.responsibilities || [
    'Campus-wide Network Infrastructure, ERP & Cloud Platform Administration',
    'Campus Geofence Boundary Calibration & Location Telemetry Maintenance',
    'Identity Management, Role Provisioning & Security Audit Logs',
    'Institutional Data Privacy & Access Policy Enforcement'
  ];

  return (
    <div className="space-y-6">
      {/* 1. ADMIN PROFILE HERO BANNER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative group">
              <img
                src={profile.avatarUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200'}
                alt={profile.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-rose-50 shadow-md"
              />
              {!isReadOnly && onOpenEdit && (
                <button
                  onClick={onOpenEdit}
                  className="absolute -bottom-2 -right-2 p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-md transition-transform hover:scale-105"
                  title="Update Profile Photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
                  ADMIN PROFILE
                </span>
                <span className="text-xs text-slate-600 font-mono bg-slate-100 px-2.5 py-0.5 rounded-md font-semibold">
                  Admin ID: {profile.employeeId || 'ADM-IT-001'}
                </span>
                <span className="text-xs text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-md font-bold">
                  Institutional IT & Systems Authority
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mt-2">
                {profile.name}
              </h2>
              <p className="text-xs text-slate-600 font-semibold mt-0.5">
                {profile.designation || 'Chief IT Systems Administrator'} • {profile.department || 'Central IT & Institutional Administration'}
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
                id="admin-edit-profile-btn"
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 text-xs font-bold transition-all shadow-2xs hover:bg-slate-50"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit Admin Profile</span>
              </button>
            )}
            {setCurrentTab && (
              <>
                <button
                  onClick={() => setCurrentTab('users')}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>User Directory</span>
                </button>
                <button
                  onClick={() => setCurrentTab('settings')}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>System Console</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Short Bio Statement */}
        {profile.bio && (
          <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3.5 rounded-2xl">
            <span className="font-bold text-slate-800 block mb-0.5">Systems Operations & Role Bio:</span>
            {profile.bio}
          </div>
        )}
      </div>

      {/* 2. ADMIN SPECIFIC DETAILS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Systems Administration Role Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Server className="w-4 h-4 text-rose-600" />
              <span>Systems Operations & Authority</span>
            </div>
            <span className="text-[11px] text-rose-700 font-semibold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Key className="w-3 h-3" /> Root IT Administration
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Admin ID:</span>
              <strong className="text-slate-800 font-mono">{profile.employeeId || 'ADM-IT-001'}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Official Title:</span>
              <strong className="text-slate-800">{profile.designation || 'Chief IT Systems Administrator'}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Department / Division:</span>
              <strong className="text-slate-800">{profile.department || 'Central IT & Institutional Administration'}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Operations Center:</span>
              <strong className="text-slate-800">{profile.officeLocation || 'Central IT Tower, Server Operations Center 2B'}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Infrastructure Scope:</span>
              <strong className="text-slate-800">Campus Cloud, ERP, Geofence Telemetry & Identity Services</strong>
            </div>
          </div>
        </div>

        {/* Contact & Administrative Office Directory */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Building className="w-4 h-4 text-rose-600" />
              <span>Administrative Contact Directory</span>
            </div>
            <button
              onClick={onOpenEdit}
              className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold"
            >
              Update IT Contact
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50 items-center">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Administrator Email:
              </span>
              <strong className="text-slate-800 font-mono">{profile.email}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50 items-center">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Direct Desk Phone:
              </span>
              <strong className="text-slate-800 font-mono">{profile.phone || '+91 98765 55443'}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50 items-center">
              <span className="text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Office Location:
              </span>
              <strong className="text-slate-800 text-right">{profile.officeLocation || 'Central IT Tower 2B'}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50 items-center">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                Security Clearance:
              </span>
              <span className="text-[11px] font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                Institutional Super-Admin (Level 4)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ADMINISTRATIVE RESPONSIBILITIES */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Shield className="w-4 h-4 text-rose-600" />
            <span>Administrative & Technical Responsibilities</span>
          </div>
          <span className="text-[11px] text-rose-700 font-medium">Core IT Operations</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {responsibilities.map((resp, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-50/40 border border-rose-100/70"
            >
              <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="text-slate-700 leading-snug font-medium">{resp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
