import React from 'react';
import { VerificationStatus, OrganizationType } from '../../types';
import { CheckCircle2, Globe, Clock, XCircle, AlertCircle, Building2, User } from 'lucide-react';

interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | 'verified'
    | 'verified_institution'
    | 'verified_external'
    | 'self_reported'
    | 'pending_verification'
    | 'pending'
    | 'rejected'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'neutral';
  className?: string;
  size?: 'xs' | 'sm';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '', size = 'sm' }) => {
  const styles: Record<string, string> = {
    verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    verified_institution: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    verified_external: 'bg-sky-50 text-sky-800 border-sky-200',
    self_reported: 'bg-slate-100 text-slate-700 border-slate-200',
    pending_verification: 'bg-amber-50 text-amber-800 border-amber-200',
    pending: 'bg-amber-50 text-amber-800 border-amber-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200'
  };

  const sizeClasses = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border whitespace-nowrap ${sizeClasses} ${styles[variant] || styles.neutral} ${className}`}
    >
      {children}
    </span>
  );
};

export const VerificationStatusBadge: React.FC<{
  status?: VerificationStatus;
  size?: 'xs' | 'sm';
  showIcon?: boolean;
  className?: string;
}> = ({ status = 'self_reported', size = 'sm', showIcon = true, className = '' }) => {
  // Normalize legacy values
  const normalized = status === 'verified' ? 'verified_institution' : status === 'pending' ? 'pending_verification' : status;

  switch (normalized) {
    case 'verified_institution':
      return (
        <Badge variant="verified_institution" size={size} className={className}>
          {showIcon && <CheckCircle2 className={size === 'xs' ? 'w-2.5 h-2.5 text-emerald-600' : 'w-3 h-3 text-emerald-600'} />}
          <span>Verified by Institution</span>
        </Badge>
      );
    case 'verified_external':
      return (
        <Badge variant="verified_external" size={size} className={className}>
          {showIcon && <Globe className={size === 'xs' ? 'w-2.5 h-2.5 text-sky-600' : 'w-3 h-3 text-sky-600'} />}
          <span>Verified by External Organization</span>
        </Badge>
      );
    case 'pending_verification':
      return (
        <Badge variant="pending_verification" size={size} className={className}>
          {showIcon && <Clock className={size === 'xs' ? 'w-2.5 h-2.5 text-amber-600' : 'w-3 h-3 text-amber-600'} />}
          <span>Pending Verification</span>
        </Badge>
      );
    case 'rejected':
      return (
        <Badge variant="rejected" size={size} className={className}>
          {showIcon && <XCircle className={size === 'xs' ? 'w-2.5 h-2.5 text-rose-600' : 'w-3 h-3 text-rose-600'} />}
          <span>Verification Declined</span>
        </Badge>
      );
    case 'self_reported':
    default:
      return (
        <Badge variant="self_reported" size={size} className={className}>
          {showIcon && <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />}
          <span>Self-Reported</span>
        </Badge>
      );
  }
};

export const OrganizationTypeBadge: React.FC<{
  type?: OrganizationType;
  size?: 'xs' | 'sm';
  className?: string;
}> = ({ type, size = 'xs', className = '' }) => {
  if (!type) return null;

  switch (type) {
    case 'college_organized':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-md px-1.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 ${size === 'xs' ? 'text-[10px]' : 'text-xs'} ${className}`}
        >
          <Building2 className="w-2.5 h-2.5" />
          <span>College Organized</span>
        </span>
      );
    case 'external_organization':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-md px-1.5 py-0.5 bg-sky-50 text-sky-700 border border-sky-200 ${size === 'xs' ? 'text-[10px]' : 'text-xs'} ${className}`}
        >
          <Globe className="w-2.5 h-2.5" />
          <span>External Organization</span>
        </span>
      );
    case 'independent_participation':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-md px-1.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 ${size === 'xs' ? 'text-[10px]' : 'text-xs'} ${className}`}
        >
          <User className="w-2.5 h-2.5" />
          <span>Independent Participation</span>
        </span>
      );
    default:
      return null;
  }
};
