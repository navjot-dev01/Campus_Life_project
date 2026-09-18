/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { MarkAttendanceModal } from './components/attendance/MarkAttendanceModal';
import { AttendanceSessionModal } from './components/attendance/AttendanceSessionModal';
import { LoginPage } from './pages/LoginPage';

// Role-Specific Dashboards
import { StudentDashboard } from './pages/StudentDashboard';
import { FacultyDashboard } from './pages/FacultyDashboard';
import { DeanDashboard } from './pages/DeanDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminUserDirectoryPage } from './pages/AdminUserDirectoryPage';
import { AdminSystemConsolePage } from './pages/AdminSystemConsolePage';

// Shared Academic & Institutional Modules
import { StudentAttendance } from './pages/StudentAttendance';
import { MyJourneyPage } from './pages/MyJourneyPage';
import { ResumeBuilderPage } from './pages/ResumeBuilderPage';
import { AssignmentsPage } from './pages/AssignmentsPage';
import { ExamsPage } from './pages/ExamsPage';
import { EventsPage } from './pages/EventsPage';
import { NoticesPage } from './pages/NoticesPage';
import { ProfilePage } from './pages/ProfilePage';
import { FacultyAttendancePage } from './pages/FacultyAttendancePage';
import { FacultyDutyAttendancePage } from './pages/FacultyDutyAttendancePage';
import { FacultyStudentsPage } from './pages/FacultyStudentsPage';
import { FacultyVerificationPage } from './pages/FacultyVerificationPage';
import { StudentSupportPage } from './pages/StudentSupportPage';

const MainLayout: React.FC = () => {
  const { currentUser, isStudent, isFaculty, isDean, isAdmin } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');

  // Reset to dashboard if active tab is invalid for role
  useEffect(() => {
    if (isStudent && (currentTab === 'students' || currentTab === 'achievements' || currentTab === 'faculty-attendance' || currentTab === 'faculty-duty-monitoring')) {
      setCurrentTab('dashboard');
    } else if (!isStudent && (currentTab === 'my-journey' || currentTab === 'resume-builder')) {
      setCurrentTab('dashboard');
    } else if ((isDean || isAdmin) && currentTab === 'attendance') {
      setCurrentTab('dashboard');
    } else if (isAdmin && (currentTab === 'faculty-attendance' || currentTab === 'faculty-duty-monitoring')) {
      setCurrentTab('dashboard');
    }
  }, [currentUser?.role, currentTab, isStudent, isFaculty, isDean, isAdmin]);

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Primary App Navigation */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {/* 1. STUDENT FLOW & VIEWS */}
          {isStudent && (
            <>
              {currentTab === 'dashboard' && <StudentDashboard setCurrentTab={setCurrentTab} />}
              {currentTab === 'attendance' && <StudentAttendance />}
              {currentTab === 'my-journey' && <MyJourneyPage initialTab="timeline" setCurrentTab={setCurrentTab} />}
              {currentTab === 'resume-builder' && <ResumeBuilderPage setCurrentTab={setCurrentTab} />}
              {currentTab === 'assignments' && <AssignmentsPage />}
              {currentTab === 'exams' && <ExamsPage />}
              {currentTab === 'events' && <EventsPage />}
              {currentTab === 'notices' && <NoticesPage />}
              {currentTab === 'support' && <StudentSupportPage setCurrentTab={setCurrentTab} />}
              {currentTab === 'profile' && <ProfilePage setCurrentTab={setCurrentTab} />}
            </>
          )}

          {/* 2. FACULTY FLOW & VIEWS */}
          {isFaculty && (
            <>
              {currentTab === 'dashboard' && <FacultyDashboard setCurrentTab={setCurrentTab} />}
              {currentTab === 'attendance' && <FacultyAttendancePage />}
              {currentTab === 'faculty-attendance' && <FacultyDutyAttendancePage />}
              {currentTab === 'students' && <FacultyStudentsPage />}
              {currentTab === 'assignments' && <AssignmentsPage />}
              {currentTab === 'exams' && <ExamsPage />}
              {currentTab === 'events' && <EventsPage />}
              {currentTab === 'notices' && <NoticesPage />}
              {currentTab === 'support' && <StudentSupportPage setCurrentTab={setCurrentTab} />}
              {currentTab === 'achievements' && <FacultyVerificationPage />}
              {currentTab === 'profile' && <ProfilePage setCurrentTab={setCurrentTab} />}
            </>
          )}

          {/* 3. DEAN FLOW & VIEWS */}
          {isDean && (
            <>
              {currentTab === 'dashboard' && <DeanDashboard setCurrentTab={setCurrentTab} />}
              {currentTab === 'achievements' && <FacultyVerificationPage />}
              {currentTab === 'faculty-duty-monitoring' && <FacultyDutyAttendancePage />}
              {currentTab === 'students' && <FacultyStudentsPage />}
              {currentTab === 'notices' && <NoticesPage />}
              {currentTab === 'events' && <EventsPage />}
              {currentTab === 'support' && <StudentSupportPage setCurrentTab={setCurrentTab} />}
              {currentTab === 'profile' && <ProfilePage setCurrentTab={setCurrentTab} />}
            </>
          )}

          {/* 4. ADMIN FLOW & VIEWS */}
          {isAdmin && (
            <>
              {currentTab === 'dashboard' && <AdminDashboard setCurrentTab={setCurrentTab} />}
              {(currentTab === 'users' || currentTab === 'directory' || currentTab === 'students') && (
                <AdminUserDirectoryPage setCurrentTab={setCurrentTab} />
              )}
              {(currentTab === 'system-console' || currentTab === 'settings' || currentTab === 'console') && (
                <AdminSystemConsolePage setCurrentTab={setCurrentTab} />
              )}
              {currentTab === 'notices' && <NoticesPage />}
              {currentTab === 'events' && <EventsPage />}
              {currentTab === 'support' && <StudentSupportPage setCurrentTab={setCurrentTab} />}
              {currentTab === 'profile' && <ProfilePage setCurrentTab={setCurrentTab} />}
            </>
          )}
        </main>
      </div>

      {/* Global Interactive Attendance Modals */}
      <MarkAttendanceModal />
      <AttendanceSessionModal />

      {/* Global Notification Toasts */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </AuthProvider>
  );
}
