import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';
import { StudentProfileView } from '../components/profile/StudentProfileView';
import { FacultyProfileView } from '../components/profile/FacultyProfileView';
import { DeanProfileView } from '../components/profile/DeanProfileView';
import { AdminProfileView } from '../components/profile/AdminProfileView';
import {
  Users,
  Search,
  Filter,
  GraduationCap,
  Briefcase,
  Award,
  Shield,
  ArrowLeft,
  Eye,
  Building,
  Mail,
  Phone,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';

interface AdminUserDirectoryPageProps {
  setCurrentTab?: (tab: string) => void;
}

export const AdminUserDirectoryPage: React.FC<AdminUserDirectoryPageProps> = ({ setCurrentTab }) => {
  const [users, setUsers] = useState<User[]>(() => api.getAllUsers());
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Filter users based on role and search query
  const filteredUsers = users.filter(user => {
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesRole;

    const matchesName = user.name.toLowerCase().includes(q);
    const matchesEmail = user.email.toLowerCase().includes(q);
    const matchesId = (user.studentId || user.employeeId || '').toLowerCase().includes(q);
    const matchesDept = (user.department || user.branch || '').toLowerCase().includes(q);

    return matchesRole && (matchesName || matchesEmail || matchesId || matchesDept);
  });

  const studentsCount = users.filter(u => u.role === 'student').length;
  const facultyCount = users.filter(u => u.role === 'faculty').length;
  const deanCount = users.filter(u => u.role === 'dean').length;
  const adminCount = users.filter(u => u.role === 'admin').length;

  const roleBadges: Record<UserRole, { label: string; color: string; icon: any }> = {
    student: {
      label: 'Student',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: GraduationCap
    },
    faculty: {
      label: 'Faculty',
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: Briefcase
    },
    dean: {
      label: 'Dean',
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: Award
    },
    admin: {
      label: 'Admin',
      color: 'bg-slate-900 text-white border-slate-900',
      icon: Shield
    }
  };

  // If a user profile is being inspected in Read-Only mode
  if (selectedUser) {
    return (
      <div className="space-y-6">
        {/* Back navigation header */}
        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <button
            onClick={() => setSelectedUser(null)}
            className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-indigo-600 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to User Directory</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Viewing User Record:</span>
            <span className="text-xs font-bold text-slate-900">{selectedUser.name}</span>
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${roleBadges[selectedUser.role].color}`}>
              {selectedUser.role}
            </span>
          </div>
        </div>

        {/* Render role-appropriate profile in READ-ONLY mode */}
        {selectedUser.role === 'student' && (
          <StudentProfileView
            profile={selectedUser}
            isReadOnly={true}
            onOpenEdit={undefined}
            setCurrentTab={setCurrentTab}
          />
        )}

        {selectedUser.role === 'faculty' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5 shadow-2xs">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Read-Only Faculty Record:</strong> Viewing official institutional dossier for {selectedUser.name}.
              </span>
            </div>
            <FacultyProfileView
              profile={selectedUser as any}
              isReadOnly={true}
              setCurrentTab={setCurrentTab}
            />
          </div>
        )}

        {selectedUser.role === 'dean' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5 shadow-2xs">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Read-Only Dean Record:</strong> Viewing official executive academic leadership profile for {selectedUser.name}.
              </span>
            </div>
            <DeanProfileView
              profile={selectedUser as any}
              isReadOnly={true}
              setCurrentTab={setCurrentTab}
            />
          </div>
        )}

        {selectedUser.role === 'admin' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-100 border border-slate-300 text-slate-900 text-xs flex items-center gap-2.5 shadow-2xs">
              <ShieldAlert className="w-4 h-4 text-slate-600 shrink-0" />
              <span>
                <strong>Read-Only Administrator Record:</strong> Viewing system governance profile for {selectedUser.name}.
              </span>
            </div>
            <AdminProfileView
              profile={selectedUser as any}
              isReadOnly={true}
              setCurrentTab={setCurrentTab}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Directory Page Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              CENTRAL IT DIRECTORY
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {users.length} Registered Accounts
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-2 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>Institutional User Directory</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Centralized institutional account directory. Inspect student, faculty, dean, and admin profiles in read-only administrative mode with protected academic fields.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block text-[10px] font-semibold">ROLE ISOLATION</span>
            <span className="font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 4 Distinct Roles
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, student ID, employee ID, branch..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Role Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                roleFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({users.length})
            </button>
            <button
              onClick={() => setRoleFilter('student')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                roleFilter === 'student'
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Students ({studentsCount})
            </button>
            <button
              onClick={() => setRoleFilter('faculty')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                roleFilter === 'faculty'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Faculty ({facultyCount})
            </button>
            <button
              onClick={() => setRoleFilter('dean')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                roleFilter === 'dean'
                  ? 'bg-white text-purple-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dean ({deanCount})
            </button>
            <button
              onClick={() => setRoleFilter('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                roleFilter === 'admin'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Admin ({adminCount})
            </button>
          </div>
        </div>
      </div>

      {/* Users Table / Directory List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No users found</p>
            <p className="text-xs text-slate-400">
              Try adjusting your search criteria or role filters.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredUsers.map(u => {
              const badge = roleBadges[u.role];
              const Icon = badge.icon;
              const identifier = u.studentId || u.employeeId || u.id;

              return (
                <div
                  key={u.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={u.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100 shadow-2xs"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900">{u.name}</span>
                        <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${badge.color}`}>
                          <Icon className="w-3 h-3" />
                          {badge.label}
                        </span>
                        {identifier && (
                          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {identifier}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {u.email}
                        </span>
                        {(u.department || u.branch) && (
                          <span className="flex items-center gap-1">
                            <Building className="w-3 h-3 text-slate-400" />
                            {u.department || u.branch}
                          </span>
                        )}
                        {u.role === 'student' && u.year && (
                          <span className="text-slate-400 font-medium">
                            {u.year} • {u.semester || ''}
                          </span>
                        )}
                        {u.role === 'student' && u.cgpa && (
                          <span className="text-emerald-600 font-bold font-mono">
                            CGPA: {u.cgpa}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => setSelectedUser(u)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{u.role === 'student' ? 'View Student Profile' : 'Inspect Profile'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
