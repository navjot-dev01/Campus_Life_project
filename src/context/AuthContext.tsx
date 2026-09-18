import React, { createContext, useContext, useState } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (identifier: string, password?: string, requiredRole?: UserRole) => { success: boolean; error?: string };
  logout: () => void;
  switchUser: (userIdOrRole: string) => void;
  updateCurrentUser: (updates: Partial<User>) => void;
  isStudent: boolean;
  isFaculty: boolean;
  isDean: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => api.getCurrentUser());

  const login = (
    identifier: string,
    password?: string,
    requiredRole?: UserRole
  ): { success: boolean; error?: string } => {
    const res = api.authenticate(identifier, password, requiredRole);
    if (res.success && res.user) {
      setCurrentUser({ ...res.user });
      return { success: true };
    }
    return {
      success: false,
      error: res.error || 'Authentication failed. Please check your institutional credentials.'
    };
  };

  const logout = () => {
    api.logoutUser();
    setCurrentUser(null);
  };

  const switchUser = (userIdOrRole: string) => {
    const users = api.getAllUsers();
    const user = users.find(u => u.id === userIdOrRole || u.role === userIdOrRole);
    if (user) {
      api.setCurrentUser(user);
      setCurrentUser({ ...user });
    }
  };

  const updateCurrentUser = (updates: Partial<User>) => {
    if (!currentUser) return;
    const updated = api.updateUserProfile(currentUser.id, updates);
    setCurrentUser({ ...updated });
  };

  const isStudent = currentUser?.role === 'student';
  const isFaculty = currentUser?.role === 'faculty';
  const isDean = currentUser?.role === 'dean';
  const isAdmin = currentUser?.role === 'admin';
  const isAuthenticated = currentUser !== null;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        login,
        logout,
        switchUser,
        updateCurrentUser,
        isStudent,
        isFaculty,
        isDean,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

