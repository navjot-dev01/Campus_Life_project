import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { StudentJourneyProfile } from '../types';
import { ResumeBuilderView } from '../components/resume/ResumeBuilderView';
import { AddAchievementModal } from '../components/journey/AddAchievementModal';
import { AddParticipationModal } from '../components/journey/AddParticipationModal';
import { AddInternshipModal } from '../components/journey/AddInternshipModal';
import { AddProjectModal } from '../components/journey/AddProjectModal';
import { AddCertificationModal } from '../components/journey/AddCertificationModal';
import { FileText, ShieldAlert } from 'lucide-react';

interface ResumeBuilderPageProps {
  setCurrentTab?: (tab: string) => void;
}

export const ResumeBuilderPage: React.FC<ResumeBuilderPageProps> = ({ setCurrentTab }) => {
  const { currentUser, isStudent } = useAuth();
  const { refreshKey, triggerRefresh } = useApp();

  const [profile, setProfile] = useState<StudentJourneyProfile | null>(() => {
    if (!currentUser) return null;
    return api.getStudentJourneyProfile(currentUser.id);
  });

  const [isAddAchievementOpen, setIsAddAchievementOpen] = useState(false);
  const [isAddParticipationOpen, setIsAddParticipationOpen] = useState(false);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [isAddCertificationOpen, setIsAddCertificationOpen] = useState(false);
  const [isAddInternshipOpen, setIsAddInternshipOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setProfile(api.getStudentJourneyProfile(currentUser.id));
    }
  }, [currentUser, refreshKey]);

  if (!currentUser) return null;

  if (!isStudent && !profile) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-xs max-w-xl mx-auto my-12 space-y-4">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl w-fit mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Student Resume Builder</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          The verified resume builder is designed for student profiles. You are currently signed in as faculty. Switch to a student account to view and customize verified resumes.
        </p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <ResumeBuilderView
        profile={profile}
        onOpenAddAchievement={() => setIsAddAchievementOpen(true)}
        onOpenAddParticipation={() => setIsAddParticipationOpen(true)}
        onOpenAddProject={() => setIsAddProjectOpen(true)}
        onOpenAddCertification={() => setIsAddCertificationOpen(true)}
        onOpenAddInternship={() => setIsAddInternshipOpen(true)}
        setCurrentTab={setCurrentTab}
      />

      {/* Record Creation Modals */}
      <AddAchievementModal
        isOpen={isAddAchievementOpen}
        onClose={() => {
          setIsAddAchievementOpen(false);
          triggerRefresh();
        }}
      />
      <AddParticipationModal
        isOpen={isAddParticipationOpen}
        onClose={() => {
          setIsAddParticipationOpen(false);
          triggerRefresh();
        }}
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
        onClose={() => {
          setIsAddProjectOpen(false);
          triggerRefresh();
        }}
      />
      <AddCertificationModal
        isOpen={isAddCertificationOpen}
        onClose={() => {
          setIsAddCertificationOpen(false);
          triggerRefresh();
        }}
      />
    </div>
  );
};
