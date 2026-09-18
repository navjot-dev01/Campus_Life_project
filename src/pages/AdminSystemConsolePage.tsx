import React, { useState } from 'react';
import { api } from '../services/api';
import { GeofenceConfig } from '../types';
import { useApp } from '../context/AppContext';
import {
  Settings,
  MapPin,
  ShieldCheck,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Database,
  Lock,
  Compass,
  Radio
} from 'lucide-react';

interface AdminSystemConsolePageProps {
  setCurrentTab?: (tab: string) => void;
}

export const AdminSystemConsolePage: React.FC<AdminSystemConsolePageProps> = ({ setCurrentTab }) => {
  const { showToast, resetAllDemoData } = useApp();
  const [geofence, setGeofence] = useState<GeofenceConfig>(() => api.getGeofence());
  const [radiusInput, setRadiusInput] = useState<number>(() => api.getGeofence().allowedRadiusMeters);
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Preset values for convenience
  const radiusPresets = [20, 50, 100, 200, 300, 500];

  // Test locations with distance relative to campus center (28.5458, 77.1926)
  const campusTestZones = [
    { name: 'Campus Center / Quad', distanceMeters: 5, description: 'Core administrative hub' },
    { name: 'Lab 3 (Computer Science)', distanceMeters: 14, description: 'Academic Block B' },
    { name: 'Lecture Hall 101', distanceMeters: 28, description: 'Main Academic Wing' },
    { name: 'Central Library', distanceMeters: 85, description: 'Knowledge Center' },
    { name: 'Student Cafeteria', distanceMeters: 140, description: 'Student Amenities' },
    { name: 'Sports Complex & Grounds', distanceMeters: 260, description: 'Outer campus perimeter' },
    { name: 'Metro Station Gate', distanceMeters: 850, description: 'External transit zone' }
  ];

  const handleRadiusChange = (val: number) => {
    setRadiusInput(val);
    if (val < 20) {
      setValidationError('Minimum allowed radius is 20 meters. System cannot enforce values below 20m.');
    } else {
      setValidationError(null);
    }
  };

  const handleSaveGeofence = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(radiusInput);
    if (isNaN(num) || num < 20) {
      setValidationError('Minimum allowed radius is 20 meters. The system does not allow values below 20m.');
      showToast({
        type: 'error',
        title: 'Invalid Radius',
        message: 'Campus Geofence radius cannot be less than 20 meters.'
      });
      return;
    }

    setIsSaving(true);
    const updated: GeofenceConfig = {
      ...geofence,
      allowedRadiusMeters: num
    };

    const persisted = api.updateGeofence(updated);
    setGeofence(persisted);
    setValidationError(null);

    setTimeout(() => {
      setIsSaving(false);
      showToast({
        type: 'success',
        title: 'Geofence Updated & Active',
        message: `Campus geofence radius set to ${persisted.allowedRadiusMeters} meters. Applied to all student attendance sessions.`
      });
    }, 250);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all institutional demo data and reload fresh seed records?')) {
      resetAllDemoData();
      showToast({
        type: 'info',
        title: 'System Cache Reset',
        message: 'Institutional records reloaded successfully.'
      });
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
              CENTRAL IT OPERATIONS
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Policy Revision v3.2
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-2 flex items-center gap-2">
            <Settings className="w-6 h-6 text-rose-600" />
            <span>Admin System Console</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Institutional infrastructure parameters, geofence radius configuration, and enterprise security boundary enforcement.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetData}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Demo Cache</span>
          </button>
        </div>
      </div>

      {/* CORE REQUIRED SETTING: Campus Geofence Radius */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              <span>Campus / Institute Geofence Radius</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configures the permitted perimeter for mobile student attendance verification. Values below 20 meters are strictly prohibited.
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shrink-0">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-600" />
            <span>Live System Geofence: {geofence.allowedRadiusMeters}m</span>
          </div>
        </div>

        <form onSubmit={handleSaveGeofence} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Campus Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Campus Anchor Location</label>
              <input
                type="text"
                disabled
                value={geofence.campusName}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-medium"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Campus center anchor point</span>
            </div>

            {/* Coordinates */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">GPS Anchor Coordinates</label>
              <input
                type="text"
                disabled
                value={`${geofence.latitude.toFixed(4)}° N, ${geofence.longitude.toFixed(4)}° E`}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-600 font-medium"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Haversine spherical validation base</span>
            </div>

            {/* Configurable Radius with >=20m validation */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Allowed Attendance Radius <span className="text-indigo-600 font-mono">(Meters)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="20"
                  max="5000"
                  step="5"
                  value={radiusInput}
                  onChange={e => handleRadiusChange(Number(e.target.value))}
                  className={`w-full text-xs p-3 rounded-xl border font-mono font-bold ${
                    validationError
                      ? 'border-rose-300 bg-rose-50 text-rose-900 focus:ring-rose-500'
                      : 'border-slate-300 focus:ring-2 focus:ring-indigo-500 text-slate-900'
                  }`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold font-mono">
                  meters
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 mt-1 block">
                Minimum permitted: <strong className="text-rose-600">20 m</strong>
              </span>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Quick Preset Geofence Radius
            </label>
            <div className="flex flex-wrap gap-2">
              {radiusPresets.map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleRadiusChange(preset)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                    radiusInput === preset
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {preset} m
                </button>
              ))}
            </div>
          </div>

          {/* Validation Warning Alert */}
          {validationError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Save Action */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-slate-500">
              Changes persist immediately to local storage and govern active student check-in geofence validation.
            </p>
            <button
              type="submit"
              disabled={isSaving || !!validationError}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
            >
              {isSaving ? 'Persisting Configuration...' : 'Save Geofence Configuration'}
            </button>
          </div>
        </form>

        {/* Live Boundary Testing Simulator */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
              <Compass className="w-4 h-4 text-indigo-600" />
              <span>Live Geofence Boundary Simulator (Active Radius: {geofence.allowedRadiusMeters}m)</span>
            </h3>
            <span className="text-[11px] text-slate-400">
              Evaluated against active radius
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {campusTestZones.map((zone, idx) => {
              const isAllowed = zone.distanceMeters <= geofence.allowedRadiusMeters;
              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isAllowed
                      ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                      : 'bg-slate-50 border-slate-200 text-slate-600 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{zone.name}</span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isAllowed
                          ? 'bg-emerald-200/80 text-emerald-900'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {isAllowed ? 'Within Range ✓' : 'Outside ✕'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[11px]">
                    <span className="text-slate-500">{zone.description}</span>
                    <span className="font-mono font-bold">~{zone.distanceMeters}m</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Role Authorization & Security Boundaries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Isolation Matrix */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Role Boundary Isolation Policy</span>
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
              Strict RBAC
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between">
              <div>
                <p className="font-bold text-slate-900">1. Student Role</p>
                <p className="text-[11px] text-slate-500">Marks attendance with Geofence + Code/QR. Cannot take or administer attendance.</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">Enforced</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between">
              <div>
                <p className="font-bold text-slate-900">2. Faculty Role</p>
                <p className="text-[11px] text-slate-500">Creates student attendance sessions; marks faculty duty check-in.</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">Enforced</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between">
              <div>
                <p className="font-bold text-slate-900">3. Dean Role</p>
                <p className="text-[11px] text-slate-500">Monitors faculty duty attendance and institutional academic integrity. No system admin controls.</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">Enforced</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 text-white flex items-start justify-between">
              <div>
                <p className="font-bold text-white flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  4. Admin Role (Student Attendance Isolation)
                </p>
                <p className="text-[11px] text-slate-300">
                  Admins manage IT infrastructure, user directories, and geofence parameters. Admin has ZERO access to student attendance records or session controls.
                </p>
              </div>
              <span className="text-[10px] font-bold text-sky-300 bg-sky-900/80 px-2 py-0.5 rounded">Isolated</span>
            </div>
          </div>
        </div>

        {/* System Telemetry & Maintenance */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>System Telemetry & Operational Health</span>
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
              Operational
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold text-slate-800">Local State Persistence</span>
              </div>
              <span className="font-mono text-emerald-600 font-bold">Synchronized</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                <span className="font-semibold text-slate-800">Single Sign-On (SSO) Simulation</span>
              </div>
              <span className="font-mono text-emerald-600 font-bold">Active (4 Pools)</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-slate-800">Geospatial Validation Engine</span>
              </div>
              <span className="font-mono text-emerald-600 font-bold">Haversine (±0.01m)</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-900">
              <p className="font-bold text-xs">Administrative Notice</p>
              <p className="text-[11px] text-indigo-700 mt-0.5">
                All changes made in the Admin System Console are strictly audited and reflected in real-time across student check-in clients.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
