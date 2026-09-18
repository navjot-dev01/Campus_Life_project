import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import {
  X,
  Save,
  User as UserIcon,
  Mail,
  Phone,
  Building,
  GraduationCap,
  Briefcase,
  Shield,
  Award,
  BookOpen,
  MapPin,
  HeartPulse,
  PhoneCall,
  Link as LinkIcon,
  Camera
} from 'lucide-react';

interface EditProfileModalProps {
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedData: Partial<User>) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onSave
}) => {
  if (!isOpen) return null;

  const role = currentUser.role;

  // Form State
  const [formData, setFormData] = useState({
    name: currentUser.name || '',
    phone: currentUser.phone || '',
    avatarUrl: currentUser.avatarUrl || '',
    bio: currentUser.bio || '',
    // Student specific
    degree: currentUser.degree || 'B.Tech',
    branch: currentUser.branch || 'Computer Science & Engineering',
    year: currentUser.year || '3rd Year',
    semester: currentUser.semester || '6th Semester',
    cgpa: currentUser.cgpa ? String(currentUser.cgpa) : '8.92',
    advisorName: currentUser.advisorName || '',
    address: currentUser.address || '',
    emergencyContact: currentUser.emergencyContact || '',
    bloodGroup: currentUser.bloodGroup || 'B+',
    linkedinUrl: currentUser.linkedinUrl || '',
    githubUrl: currentUser.githubUrl || '',
    portfolioUrl: currentUser.portfolioUrl || '',
    // Faculty / Dean / Admin specific
    employeeId: currentUser.employeeId || '',
    designation: currentUser.designation || '',
    department: currentUser.department || '',
    officeRoom: currentUser.officeRoom || '',
    officeLocation: currentUser.officeLocation || '',
    qualifications: currentUser.qualifications || '',
    specialization: currentUser.specialization || '',
    subjectsTaught: (currentUser.subjectsTaught || []).join(', '),
    responsibilities: (currentUser.responsibilities || []).join('\n'),
    areasOfResponsibility: (currentUser.areasOfResponsibility || []).join('\n')
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: Partial<User> = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      avatarUrl: formData.avatarUrl.trim() || undefined,
      bio: formData.bio.trim()
    };

    if (role === 'student') {
      updated.degree = formData.degree.trim();
      updated.branch = formData.branch.trim();
      updated.year = formData.year.trim();
      updated.semester = formData.semester.trim();
      updated.cgpa = parseFloat(formData.cgpa) || 8.0;
      updated.advisorName = formData.advisorName.trim();
      updated.address = formData.address.trim();
      updated.emergencyContact = formData.emergencyContact.trim();
      updated.bloodGroup = formData.bloodGroup.trim();
      updated.linkedinUrl = formData.linkedinUrl.trim();
      updated.githubUrl = formData.githubUrl.trim();
      updated.portfolioUrl = formData.portfolioUrl.trim();
    } else if (role === 'faculty') {
      updated.employeeId = formData.employeeId.trim();
      updated.designation = formData.designation.trim();
      updated.department = formData.department.trim();
      updated.officeRoom = formData.officeRoom.trim();
      updated.qualifications = formData.qualifications.trim();
      updated.specialization = formData.specialization.trim();
      updated.subjectsTaught = formData.subjectsTaught
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      updated.responsibilities = formData.responsibilities
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);
    } else if (role === 'dean') {
      updated.employeeId = formData.employeeId.trim();
      updated.designation = formData.designation.trim();
      updated.department = formData.department.trim();
      updated.officeLocation = formData.officeLocation.trim();
      updated.qualifications = formData.qualifications.trim();
      updated.areasOfResponsibility = formData.areasOfResponsibility
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);
    } else if (role === 'admin') {
      updated.employeeId = formData.employeeId.trim();
      updated.designation = formData.designation.trim();
      updated.department = formData.department.trim();
      updated.officeLocation = formData.officeLocation.trim();
      updated.responsibilities = formData.responsibilities
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);
    }

    onSave(updated);
    onClose();
  };

  const getRoleTitle = (r: UserRole) => {
    switch (r) {
      case 'student':
        return 'Edit Student Profile';
      case 'faculty':
        return 'Edit Faculty Profile';
      case 'dean':
        return 'Edit Dean Profile';
      case 'admin':
        return 'Edit Admin Profile';
    }
  };

  const getBadgeColor = (r: UserRole) => {
    switch (r) {
      case 'student':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'faculty':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'dean':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'admin':
        return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${getBadgeColor(role)}`}>
              {role === 'student' && <GraduationCap className="w-5 h-5" />}
              {role === 'faculty' && <Briefcase className="w-5 h-5" />}
              {role === 'dean' && <Award className="w-5 h-5" />}
              {role === 'admin' && <Shield className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">{getRoleTitle(role)}</h3>
              <p className="text-xs text-slate-500 font-medium">
                Update verified credentials and institutional records
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Shared Basic Identity Fields */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Basic Identification
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="Enter full legal name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Avatar / Photo URL</label>
              <div className="relative">
                <Camera className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="url"
                  value={formData.avatarUrl}
                  onChange={e => setFormData({ ...formData, avatarUrl: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-600 font-mono"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {role === 'student'
                  ? 'Student Bio / Summary'
                  : role === 'faculty'
                  ? 'Faculty Academic & Research Bio'
                  : role === 'dean'
                  ? 'Executive & Governance Bio'
                  : 'Systems & Administrative Bio'}
              </label>
              <textarea
                rows={2}
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed"
                placeholder="Brief professional or academic statement..."
              />
            </div>
          </div>

          {/* ======================= 1. STUDENT FIELDS ONLY ======================= */}
          {role === 'student' && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" /> Student Academic & Residential Records
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Degree / Program</label>
                  <select
                    value={formData.degree}
                    onChange={e => {
                      const deg = e.target.value;
                      let br = formData.branch;
                      if (deg === 'BCA') br = 'BCA';
                      else if (deg === 'B.Tech' && br === 'BCA') br = 'Computer Science & Engineering';
                      setFormData({ ...formData, degree: deg, branch: br });
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    <option value="B.Tech">B.Tech</option>
                    <option value="BCA">BCA (Bachelor of Computer Applications)</option>
                    <option value="M.Tech">M.Tech</option>
                    <option value="MCA">MCA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Branch / Major</label>
                  <select
                    value={formData.branch}
                    onChange={e => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering (CSE)</option>
                    <option value="BCA">BCA</option>
                    <option value="Information Technology">Information Technology (IT)</option>
                    <option value="Electronics & Communication">Electronics & Communication (ECE)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Year of Study</label>
                  <select
                    value={formData.year}
                    onChange={e => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Semester</label>
                  <select
                    value={formData.semester}
                    onChange={e => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    <option value="1st Semester">1st Semester</option>
                    <option value="2nd Semester">2nd Semester</option>
                    <option value="3rd Semester">3rd Semester</option>
                    <option value="4th Semester">4th Semester</option>
                    <option value="5th Semester">5th Semester</option>
                    <option value="6th Semester">6th Semester</option>
                    <option value="7th Semester">7th Semester</option>
                    <option value="8th Semester">8th Semester</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cumulative CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={formData.cgpa}
                    onChange={e => setFormData({ ...formData, cgpa: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    placeholder="8.92"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Faculty Academic Advisor</label>
                  <input
                    type="text"
                    value={formData.advisorName}
                    onChange={e => setFormData({ ...formData, advisorName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                    placeholder="Dr. Rajesh Sharma (HOD CSE)"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hostel / Residence Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                  placeholder="Campus Hostel Block B, Room 314"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Contact</label>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={e => setFormData({ ...formData, emergencyContact: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                  placeholder="+91 98111 22334 (Parent - Mr. R. Sharma)"
                />
              </div>

              <div className="space-y-3 pt-2">
                <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Social & Portfolio Links (Resume Builder Sourcing)
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={e => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    placeholder="https://linkedin.com/in/..."
                  />
                  <input
                    type="url"
                    value={formData.githubUrl}
                    onChange={e => setFormData({ ...formData, githubUrl: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    placeholder="https://github.com/..."
                  />
                  <input
                    type="url"
                    value={formData.portfolioUrl}
                    onChange={e => setFormData({ ...formData, portfolioUrl: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    placeholder="https://portfolio.dev"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ======================= 2. FACULTY FIELDS ONLY ======================= */}
          {role === 'faculty' && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4" /> Faculty Appointment & Academic Credentials
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Employee ID</label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                    placeholder="FAC-CS-042"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Academic Designation</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={e => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                    placeholder="Associate Professor & HOD"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                    placeholder="Computer Science & Engineering"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Faculty Office / Room</label>
                  <input
                    type="text"
                    value={formData.officeRoom}
                    onChange={e => setFormData({ ...formData, officeRoom: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                    placeholder="CS Block, Room 304"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Academic Qualifications</label>
                <input
                  type="text"
                  value={formData.qualifications}
                  onChange={e => setFormData({ ...formData, qualifications: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                  placeholder="Ph.D. in Computer Science (IIT Delhi), M.Tech"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Specialization / Research Area</label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                  placeholder="Distributed Database Systems, Big Data Architectures"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subjects Taught (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.subjectsTaught}
                  onChange={e => setFormData({ ...formData, subjectsTaught: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                  placeholder="Database Management Systems (CS601), Advanced DB (CS702)"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Faculty Responsibilities (one per line)
                </label>
                <textarea
                  rows={3}
                  value={formData.responsibilities}
                  onChange={e => setFormData({ ...formData, responsibilities: e.target.value })}
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 leading-relaxed font-mono"
                  placeholder="Head of Department & Academic Advisor&#10;Course Coordinator for DBMS"
                />
              </div>
            </div>
          )}

          {/* ======================= 3. DEAN FIELDS ONLY ======================= */}
          {role === 'dean' && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 flex items-center gap-1.5">
                <Award className="w-4 h-4" /> Dean Governance & Senate Office Details
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Employee ID</label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 font-mono"
                    placeholder="DEAN-ACAD-01"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Official Designation</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={e => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
                    placeholder="Dean of Academic Affairs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Division / Office</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
                    placeholder="Office of the Dean • Academic Affairs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Executive Suite Location</label>
                  <input
                    type="text"
                    value={formData.officeLocation}
                    onChange={e => setFormData({ ...formData, officeLocation: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
                    placeholder="Academic Senate Wing, Administrative Block, Suite 101"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Academic Credentials & Qualifications</label>
                <input
                  type="text"
                  value={formData.qualifications}
                  onChange={e => setFormData({ ...formData, qualifications: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
                  placeholder="Ph.D. in Systems Engineering (MIT), Senior IEEE Fellow"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Areas of Responsibility (one per line)
                </label>
                <textarea
                  rows={4}
                  value={formData.areasOfResponsibility}
                  onChange={e => setFormData({ ...formData, areasOfResponsibility: e.target.value })}
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 leading-relaxed font-mono"
                  placeholder="Institutional Curriculum Standards & Academic Governance&#10;Final Authorization for Honor Roll, Degree Conferrals&#10;Faculty Academic Evaluation & Accreditation"
                />
              </div>
            </div>
          )}

          {/* ======================= 4. ADMIN FIELDS ONLY ======================= */}
          {role === 'admin' && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
                <Shield className="w-4 h-4" /> Systems Administration & IT Operations Details
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Admin / Employee ID</label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 font-mono"
                    placeholder="ADM-IT-001"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Administrative Designation</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={e => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500"
                    placeholder="Chief IT Systems Administrator & Registrar"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500"
                    placeholder="Central IT & Institutional Administration"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Operations Center / Office</label>
                  <input
                    type="text"
                    value={formData.officeLocation}
                    onChange={e => setFormData({ ...formData, officeLocation: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500"
                    placeholder="Central IT Tower, Server Operations Center 2B"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Administrative Responsibilities (one per line)
                </label>
                <textarea
                  rows={4}
                  value={formData.responsibilities}
                  onChange={e => setFormData({ ...formData, responsibilities: e.target.value })}
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 leading-relaxed font-mono"
                  placeholder="Campus-wide Network Infrastructure, ERP & Cloud Platform Administration&#10;Campus Geofence Boundary Calibration & Location Telemetry Maintenance&#10;Identity Management, Role Provisioning & Security Audit Logs"
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-profile-modal-btn"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-all hover:scale-102"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
