import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { api, DEFAULT_GEOFENCE } from '../services/api';
import { User, GeofenceConfig } from '../types';
import {
  ShieldAlert,
  Server,
  Users,
  MapPin,
  Settings,
  Activity,
  CheckCircle2,
  Lock,
  Database,
  RefreshCw,
  Sliders,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

interface AdminDashboardProps {
  setCurrentTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ setCurrentTab }) => {
  const { currentUser } = useAuth();
  const { showToast, resetAllDemoData } = useApp();

  const [users, setUsers] = useState<User[]>([]);
  const [geofence, setGeofence] = useState<GeofenceConfig>(() => api.getGeofence());
  const [radiusInput, setRadiusInput] = useState(geofence.allowedRadiusMeters);
  const [isSavingGeo, setIsSavingGeo] = useState(false);

  useEffect(() => {
    setUsers(api.getAllUsers());
    setGeofence(api.getGeofence());
    setRadiusInput(api.getGeofence().allowedRadiusMeters);
  }, []);

  const studentsCount = users.filter(u => u.role === 'student').length;
  const facultyCount = users.filter(u => u.role === 'faculty').length;
  const deanCount = users.filter(u => u.role === 'dean').length;
  const adminCount = users.filter(u => u.role === 'admin').length;

  const handleUpdateRadius = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(radiusInput);
    if (isNaN(num) || num < 20) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Minimum allowed campus geofence radius is 20 meters. System cannot enforce values below 20m.'
      });
      return;
    }
    setIsSavingGeo(true);
    const updated: GeofenceConfig = {
      ...geofence,
      allowedRadiusMeters: num
    };
    const persisted = api.updateGeofence(updated);
    setGeofence(persisted);
    setTimeout(() => {
      setIsSavingGeo(false);
      showToast({
        type: 'success',
        title: 'Geofence Updated & Persisted',
        message: `Campus Geofence radius updated to ${persisted.allowedRadiusMeters} meters.`
      });
    }, 300);
  };

  return (
    <div className="space-y-6">
      {/* Admin Executive Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              System Administration • Central IT
            </span>
            <span className="text-xs text-slate-400">• {currentUser.department}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-2 font-sans">
            Welcome, {currentUser.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Central Institutional Administration Console: User Role Provisioning, Campus Geofencing, Security Policies, and System Audit Logs.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              resetAllDemoData();
              setUsers(api.getAllUsers());
              setGeofence(api.getGeofence());
              setRadiusInput(api.getGeofence().allowedRadiusMeters);
              showToast({
                type: 'info',
                title: 'System Reset',
                message: 'System workspace cache refreshed to seed state'
              });
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-all active:scale-98"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Cache</span>
          </button>
        </div>
      </div>

      {/* Admin System KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total User Accounts</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{users.length}</p>
          <p className="text-[11px] text-indigo-600 font-medium mt-1">4 Distinct Role Pools</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Campus Geofence</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{geofence.allowedRadiusMeters}m</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Anchor: 28.5458, 77.1926</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Security & SSO</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">Enforced</p>
          <p className="text-[11px] text-sky-600 font-medium mt-1">Role authorization active</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Database Engine</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">Synchronized</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Local & Cloud Storage</p>
        </div>
      </div>

      {/* Main Admin Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: User Directory & Role Separation Status */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-600" />
                  <span>Institutional User Directory & Role Allocation</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified system records showing strict separation of Student, Faculty, Dean, and Admin accounts.
                </p>
              </div>
              <div className="flex gap-1.5 text-[10px] font-bold">
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800">Students ({studentsCount})</span>
                <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">Faculty ({facultyCount})</span>
                <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800">Dean ({deanCount})</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800">Admin ({adminCount})</span>
              </div>
            </div>

            <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200">
              {users.map(u => {
                const roleBadgeColors: Record<string, string> = {
                  student: 'bg-blue-50 text-blue-700 border-blue-200',
                  faculty: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                  dean: 'bg-purple-50 text-purple-700 border-purple-200',
                  admin: 'bg-slate-900 text-white border-slate-900'
                };

                return (
                  <div key={u.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={u.name}
                        className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{u.name}</span>
                          {u.studentId && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                              {u.studentId}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono">{u.email}</p>
                        <p className="text-[10px] text-slate-400">{u.department || 'CampusLife Department'}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`inline-block text-[11px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${roleBadgeColors[u.role]}`}>
                        {u.role}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Campus Geofence Infrastructure Management */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              <span>Campus Geofence Configuration</span>
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Defines the physical boundaries for mobile student attendance verification across academic blocks.
            </p>

            <form onSubmit={handleUpdateRadius} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Campus Anchor</label>
                  <input
                    type="text"
                    disabled
                    value={geofence.campusName}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Coordinates (Lat, Long)</label>
                  <input
                    type="text"
                    disabled
                    value={`${geofence.latitude}, ${geofence.longitude}`}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Allowed Radius (Meters) • <span className="text-rose-600 font-bold">Min: 20m</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={20}
                      max={1000}
                      step={5}
                      value={radiusInput}
                      onChange={e => setRadiusInput(Number(e.target.value))}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold text-slate-900"
                    />
                    <button
                      type="submit"
                      disabled={isSavingGeo}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shrink-0 cursor-pointer"
                    >
                      {isSavingGeo ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {[20, 50, 100, 200, 300].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setRadiusInput(val)}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                          radiusInput === val
                            ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {val}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right Col: Admin IT Status & Audit Logs */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>System Health & Telemetry</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-600">Single Sign-On (SSO)</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Operational
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-600">Role Boundary Enforcer</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Enforced
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-600">Geospatial Validation API</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 0ms latency
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-600">Storage Persistence</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Local + Cloud Sync
                </span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900 text-white shadow-xs">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold text-indigo-200">Admin Privileges</h3>
            </div>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Administrator privileges are strictly separated from Academic Dean duties. System admins handle IT infrastructure, directory services, and network access parameters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
