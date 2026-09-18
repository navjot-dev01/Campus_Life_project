import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '../services/api';
import { AttendanceSession, Notice } from '../types';

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

interface AppContextType {
  refreshKey: number;
  triggerRefresh: () => void;
  activeSessions: AttendanceSession[];
  pinnedNotices: Notice[];
  isMarkAttendanceOpen: boolean;
  openMarkAttendance: () => void;
  closeMarkAttendance: () => void;
  isStartSessionOpen: boolean;
  openStartSession: () => void;
  closeStartSession: () => void;
  toasts: ToastNotification[];
  showToast: (toast: Omit<ToastNotification, 'id'>) => void;
  removeToast: (id: string) => void;
  resetAllDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeSessions, setActiveSessions] = useState<AttendanceSession[]>([]);
  const [pinnedNotices, setPinnedNotices] = useState<Notice[]>([]);
  const [isMarkAttendanceOpen, setIsMarkAttendanceOpen] = useState(false);
  const [isStartSessionOpen, setIsStartSessionOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const triggerRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    setActiveSessions(api.getActiveSessions());
    const notices = api.getNotices();
    setPinnedNotices(notices.filter(n => n.isPinned));
  }, [refreshKey]);

  // Periodic check for expired sessions (every 3 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSessions(api.getActiveSessions());
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const openMarkAttendance = () => setIsMarkAttendanceOpen(true);
  const closeMarkAttendance = () => setIsMarkAttendanceOpen(false);

  const openStartSession = () => setIsStartSessionOpen(true);
  const closeStartSession = () => setIsStartSessionOpen(false);

  const showToast = (toast: Omit<ToastNotification, 'id'>) => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const resetAllDemoData = () => {
    api.initStorage(true);
    triggerRefresh();
    showToast({
      type: 'info',
      title: 'Demo Data Restored',
      message: 'CampusLife demo accounts, sessions, and academic records have been reset.'
    });
  };

  return (
    <AppContext.Provider
      value={{
        refreshKey,
        triggerRefresh,
        activeSessions,
        pinnedNotices,
        isMarkAttendanceOpen,
        openMarkAttendance,
        closeMarkAttendance,
        isStartSessionOpen,
        openStartSession,
        closeStartSession,
        toasts,
        showToast,
        removeToast,
        resetAllDemoData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
