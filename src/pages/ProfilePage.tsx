import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { StudentProfileView } from '../components/profile/StudentProfileView';
import { FacultyProfileView } from '../components/profile/FacultyProfileView';
import { DeanProfileView } from '../components/profile/DeanProfileView';
import { AdminProfileView } from '../components/profile/AdminProfileView';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { LogOut, RotateCcw, ShieldCheck } from 'lucide-react';

interface ProfilePageProps {
  setCurrentTab: (tab: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ setCurrentTab }) => {
  const { currentUser, logout, updateCurrentUser } = useAuth();
  const { resetAllDemoData, showToast } = useApp();
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (!currentUser) return null;

  const handleSaveProfile = (updatedData: Partial<typeof currentUser>) => {
    updateCurrentUser(updatedData);
    showToast({
      type: 'success',
      title: 'Profile Updated',
      message: 'Your profile details and verified records have been securely saved.'
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* 1. DYNAMIC ROLE-BASED PROFILE VIEW (Student, Faculty, Dean, Admin strictly separated) */}
      {currentUser.role === 'student' && (
        <StudentProfileView
          profile={currentUser}
          onOpenEdit={() => setIsEditOpen(true)}
          setCurrentTab={setCurrentTab}
        />
      )}

      {currentUser.role === 'faculty' && (
        <FacultyProfileView
          profile={currentUser}
          onOpenEdit={() => setIsEditOpen(true)}
          setCurrentTab={setCurrentTab}
        />
      )}

      {currentUser.role === 'dean' && (
        <DeanProfileView
          profile={currentUser}
          onOpenEdit={() => setIsEditOpen(true)}
          setCurrentTab={setCurrentTab}
        />
      )}

      {currentUser.role === 'admin' && (
        <AdminProfileView
          profile={currentUser}
          onOpenEdit={() => setIsEditOpen(true)}
          setCurrentTab={setCurrentTab}
        />
      )}

      {/* 2. ACCOUNT SECURITY & SESSION MANAGEMENT SECTION */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Session & Account Management</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Active authenticated session as{' '}
              <strong className="text-slate-800 uppercase tracking-wide">
                {currentUser.role}
              </strong>{' '}
              ({currentUser.email})
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                if (
                  window.confirm(
                    'Reset all demo attendance, assignments, and records to initial defaults?'
                  )
                ) {
                  resetAllDemoData();
                }
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Demo Data</span>
            </button>

            <button
              id="profile-sign-out-btn"
              onClick={logout}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. ROLE-SPECIFIC EDIT PROFILE MODAL */}
      <EditProfileModal
        currentUser={currentUser}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSaveProfile}
      />
    </div>
  );
};
