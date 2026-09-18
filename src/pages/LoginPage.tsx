import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import {
  GraduationCap,
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
  Building2,
  KeyRound,
  Eye,
  EyeOff,
  BookOpen,
  Award,
  Settings,
  CheckCircle2
} from 'lucide-react';

interface RoleConfig {
  role: UserRole;
  title: string;
  badge: string;
  description: string;
  icon: React.ElementType;
  colorClass: string;
  inputLabel: string;
  placeholder: string;
  defaultEmail: string;
}

const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  student: {
    role: 'student',
    title: 'Student',
    badge: 'Student Portal',
    description: 'Course attendance, assignments, exam schedules, and academic journey portfolio.',
    icon: GraduationCap,
    colorClass: 'from-blue-600 to-indigo-600 text-blue-600 bg-blue-50 border-blue-200 ring-blue-100',
    inputLabel: 'Roll Number or Institutional Email',
    placeholder: 'e.g. 21CS042 or student email',
    defaultEmail: 'aarav.sharma@campuslife.edu'
  },
  faculty: {
    role: 'faculty',
    title: 'Faculty',
    badge: 'Faculty Console',
    description: 'Start live geo-attendance, course management, student grading, and verifications.',
    icon: BookOpen,
    colorClass: 'from-indigo-600 to-violet-600 text-indigo-600 bg-indigo-50 border-indigo-200 ring-indigo-100',
    inputLabel: 'Faculty Institutional Email',
    placeholder: 'e.g. faculty.dbms@campuslife.edu',
    defaultEmail: 'faculty.dbms@campuslife.edu'
  },
  dean: {
    role: 'dean',
    title: 'Dean',
    badge: 'Office of the Dean',
    description: 'Academic affairs oversight, Dean’s List endorsements, and faculty governance.',
    icon: Award,
    colorClass: 'from-purple-600 to-fuchsia-600 text-purple-600 bg-purple-50 border-purple-200 ring-purple-100',
    inputLabel: 'Dean Institutional Email',
    placeholder: 'e.g. dean@campuslife.edu',
    defaultEmail: 'dean@campuslife.edu'
  },
  admin: {
    role: 'admin',
    title: 'Admin',
    badge: 'Central Administration',
    description: 'Central IT administration, campus geofencing boundaries, user provisioning, and security.',
    icon: Settings,
    colorClass: 'from-slate-800 to-slate-950 text-slate-800 bg-slate-100 border-slate-300 ring-slate-200',
    inputLabel: 'Administrator Email',
    placeholder: 'e.g. admin@campuslife.edu',
    defaultEmail: 'admin@campuslife.edu'
  }
};

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setIdentifier('');
    setPassword('');
    setError(null);
  };

  const handleBackToRoleSelection = () => {
    setSelectedRole(null);
    setIdentifier('');
    setPassword('');
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedRole) {
      setError('Please select a role first.');
      return;
    }

    if (!identifier.trim()) {
      setError(`Please enter your ${ROLE_CONFIGS[selectedRole].inputLabel}.`);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      // Validate credentials against the SELECTED role
      const result = login(identifier.trim(), password, selectedRole);
      setIsLoading(false);
      if (!result.success) {
        setError(result.error || 'Authentication failed. Please verify your credentials.');
      }
    }, 350);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-indigo-50/30 flex flex-col justify-between font-sans antialiased text-slate-800">
      {/* Top Header */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 py-4 px-6 sm:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-xs">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">
              Campus<span className="text-indigo-600">Life</span>
            </span>
            <p className="text-[11px] text-slate-500 font-medium">
              CampusLife – Student Journey Platform
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Institutional Single Sign-On (SSO)</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        {/* SCREEN 1: ROLE SELECTION (The FIRST screen) */}
        {!selectedRole ? (
          <div className="w-full max-w-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Identity & Access Management</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 font-sans">
                Select Your Role
              </h1>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Choose your institutional role to continue to your dedicated login portal and dashboard.
              </p>
            </div>

            {/* Exactly 4 Separate Roles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(Object.keys(ROLE_CONFIGS) as UserRole[]).map(roleKey => {
                const config = ROLE_CONFIGS[roleKey];
                const Icon = config.icon;

                return (
                  <button
                    key={roleKey}
                    id={`role-select-${roleKey}-btn`}
                    onClick={() => handleSelectRole(roleKey)}
                    className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all text-left group cursor-pointer relative overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${config.colorClass}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                          {config.badge}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors font-sans">
                        {config.title}
                      </h2>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                        {config.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 group-hover:text-indigo-600">
                      <span>Continue to {config.title} Login</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="text-center text-xs text-slate-400 pt-2">
              <p>CampusLife Institute of Technology • Department of Computer Science & Engineering</p>
            </div>
          </div>
        ) : (
          /* SCREEN 2: ROLE-SPECIFIC LOGIN SCREEN */
          <div className="w-full max-w-md space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
              {/* Back to Role Selection Button */}
              <button
                type="button"
                id="back-to-role-selection-btn"
                onClick={handleBackToRoleSelection}
                className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer py-1 px-2.5 rounded-xl hover:bg-indigo-50/70"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to role selection</span>
              </button>

              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mb-3 ring-8 ring-indigo-50/50">
                  {React.createElement(ROLE_CONFIGS[selectedRole].icon, { className: 'w-6 h-6' })}
                </div>
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold uppercase tracking-wider mb-1">
                  {ROLE_CONFIGS[selectedRole].badge}
                </div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 font-sans">
                  {ROLE_CONFIGS[selectedRole].title} Login
                </h1>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Enter your official credentials. Authorization strictly enforces your {ROLE_CONFIGS[selectedRole].title} account.
                </p>
              </div>

              {/* Error Banner with Role-Verification Messages */}
              {error && (
                <div className="mb-5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{error}</span>
                </div>
              )}

              {/* Role-Specific Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {ROLE_CONFIGS[selectedRole].inputLabel}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="login-identifier-input"
                      type="text"
                      value={identifier}
                      onChange={e => setIdentifier(e.target.value)}
                      placeholder={ROLE_CONFIGS[selectedRole].placeholder}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400 text-slate-800"
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="login-password-input"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400 text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Remember on this device</span>
                  </label>
                  <span className="text-indigo-600 hover:underline cursor-pointer">
                    Forgot password?
                  </span>
                </div>

                <button
                  type="submit"
                  id="submit-role-login-btn"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-99 text-white text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <span>Sign In as {ROLE_CONFIGS[selectedRole].title}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Security Badge */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Protected by Institutional Role Authorization</span>
              </div>
            </div>

            {/* Institutional Note */}
            <div className="text-center text-xs text-slate-500 space-y-1">
              <p className="flex items-center justify-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>CampusLife Institute of Technology</span>
              </p>
              <p className="text-[11px] text-slate-400">
                Academic Session 2025–2026 • Department of Computer Science & Engineering
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200/50">
        CampusLife – Student Journey Platform &copy; {new Date().getFullYear()} • Secure Institutional Portal
      </footer>
    </div>
  );
};
