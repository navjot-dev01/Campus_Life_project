export type UserRole = 'student' | 'faculty' | 'dean' | 'admin';

// Base User Profile with shared personal fields
export interface BaseUserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  collegeName?: string;
  phone?: string;
  bio?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
}

// 1. STUDENT PROFILE SCHEMA
export interface StudentProfile extends BaseUserProfile {
  role: 'student';
  studentId: string; // e.g., '21CS042'
  degree?: string; // e.g., 'B.Tech'
  branch: string; // e.g., 'Computer Science & Engineering'
  department?: string;
  year: string; // e.g., '3rd Year'
  semester: string; // e.g., '6th Semester'
  cgpa: number; // e.g., 8.92
  advisorName?: string; // Faculty Academic Advisor
  address?: string; // Hostel / Residence
  emergencyContact?: string;
  bloodGroup?: string;
  batch?: string;
  interests?: string[];
}

// 2. FACULTY PROFILE SCHEMA
export interface FacultyProfile extends BaseUserProfile {
  role: 'faculty';
  employeeId: string; // e.g., 'FAC-CS-042'
  designation: string; // e.g., 'Associate Professor & HOD'
  department: string; // e.g., 'Computer Science & Engineering'
  officeRoom?: string; // e.g., 'CS Block, Room 304'
  qualifications?: string; // e.g., 'Ph.D. in Computer Science (IIT Delhi), M.Tech'
  specialization?: string; // e.g., 'Distributed Database Systems, Cloud Computing'
  subjectsTaught?: string[]; // e.g., ['Database Management Systems', 'AI & Machine Learning']
  responsibilities?: string[]; // e.g., ['Course Coordinator CSE-6th Sem', 'Academic Integrity Board']
}

// 3. DEAN PROFILE SCHEMA
export interface DeanProfile extends BaseUserProfile {
  role: 'dean';
  employeeId: string; // e.g., 'DEAN-ACAD-01'
  designation: string; // e.g., 'Dean of Academic Affairs'
  department: string; // e.g., 'Office of the Dean • Academic Affairs'
  officeLocation?: string; // e.g., 'Administrative Block, Suite 101'
  qualifications?: string; // e.g., 'Ph.D. (Systems Eng, MIT), Senior IEEE Fellow'
  areasOfResponsibility?: string[]; // e.g., ['Institutional Curriculum Standards', 'Honor Roll Authorization']
}

// 4. ADMIN PROFILE SCHEMA
export interface AdminProfile extends BaseUserProfile {
  role: 'admin';
  employeeId: string; // e.g., 'ADM-IT-001'
  designation: string; // e.g., 'Chief IT Systems Administrator'
  department: string; // e.g., 'Central IT & Institutional Administration'
  officeLocation?: string; // e.g., 'Central IT Tower, Server Operations 2B'
  responsibilities?: string[]; // e.g., ['Campus Network Infrastructure', 'Identity & Access Governance']
}

export type AnyProfile = StudentProfile | FacultyProfile | DeanProfile | AdminProfile;

// Unified User interface accommodating all profiles
export interface User extends BaseUserProfile {
  // Student-specific fields
  studentId?: string;
  degree?: string;
  branch?: string;
  year?: string;
  semester?: string;
  cgpa?: number;
  advisorName?: string;
  address?: string;
  emergencyContact?: string;
  bloodGroup?: string;
  batch?: string;
  interests?: string[];

  // Faculty/Dean/Admin specific fields
  employeeId?: string;
  designation?: string;
  department?: string;
  officeRoom?: string;
  officeLocation?: string;
  qualifications?: string;
  specialization?: string;
  subjectsTaught?: string[];
  responsibilities?: string[];
  areasOfResponsibility?: string[];
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  branch: string;
  semester: string;
  facultyId: string;
  facultyName: string;
  totalClasses: number;
}

export interface AttendanceSession {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  classSection: string; // e.g. 'CSE 3rd Year'
  code: string; // 6-digit code
  qrCodeData: string;
  startTime: string; // ISO string
  expiryTime: string; // ISO string
  durationSeconds: number;
  isActive: boolean;
  collegeLatitude: number;
  collegeLongitude: number;
  allowedRadiusMeters: number;
  createdBy: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  subjectId: string;
  subjectName: string;
  markedAt: string;
  status: 'present' | 'absent' | 'late';
  distanceMeters: number;
  verificationMethod: 'code' | 'qr';
  isVerified: boolean;
}

export interface SubjectAttendanceSummary {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  presentClasses: number;
  totalClasses: number;
  percentage: number;
  status: 'good' | 'warning' | 'critical';
}

export interface AttendanceAnalytics {
  overallPercentage: number;
  totalPresent: number;
  totalClasses: number;
  totalAbsent: number;
  isWarning: boolean; // < 75%
  classesNeededFor75: number;
  subjectWise: SubjectAttendanceSummary[];
  recentRecords: AttendanceRecord[];
}

// B. FACULTY ATTENDANCE SCHEMA (Completely separate from Student Attendance)
export interface FacultyAttendanceRecord {
  id: string;
  facultyId: string;
  facultyName: string;
  department: string;
  date: string; // YYYY-MM-DD
  checkInTime: string; // HH:mm AM/PM or ISO
  checkOutTime?: string;
  status: 'present' | 'on_duty' | 'leave';
  dutyLocation: string; // e.g., 'CS Block Room 304 / Lab 2'
  remarks?: string;
  verifiedByDean?: boolean;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentRoll?: string;
  submittedAt: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  fileData?: string; // Data URL / base64 string for download and viewing
  comment?: string;
  status: 'submitted' | 'late' | 'graded';
  grade?: string;
  feedback?: string;
}

export interface Assignment {
  id: string;
  subjectId: string;
  subjectName: string;
  title: string;
  description: string;
  dueDate: string;
  maxMarks: number;
  createdBy: string;
  createdAt: string;
  branch?: string;   // e.g. 'CSE', 'BCA', 'ECE', 'All'
  year?: string;     // e.g. '1st Year', '2nd Year', '3rd Year', '4th Year', 'All'
  semester?: string; // e.g. '6th Semester', 'All'
  section?: string;  // e.g. 'A', 'B', 'All'
  submissionsCount?: number;
  isSubmitted?: boolean;
  submissionStatus?: 'pending' | 'submitted' | 'late' | 'graded';
  submissionGrade?: string;
  submittedAt?: string;
  mySubmission?: AssignmentSubmission;
}

export interface Exam {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  examType: 'Mid-Term' | 'End-Term' | 'Semester End' | 'Lab Practical' | 'Internal Assessment' | 'Quiz';
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  totalMarks: number;
  instructions?: string;
  branch?: string;   // e.g. 'CSE', 'BCA', 'ECE', 'All'
  year?: string;     // e.g. '3rd Year', 'All'
  semester?: string; // e.g. '6th Semester', 'All'
  section?: string;
}

export interface Notice {
  id: string;
  title: string;
  description: string;
  category: 'academic' | 'exam' | 'placement' | 'event' | 'general' | 'Academic' | 'Urgent' | 'Examination' | 'Events' | 'Hostel' | 'Placement';
  priority: 'high' | 'medium' | 'low' | 'urgent';
  publishedAt: string;
  authorName: string;
  isPinned?: boolean;
}

export interface EventItem {
  id: string;
  name: string;
  category: 'Hackathon' | 'Workshop' | 'Cultural' | 'Sports' | 'Seminar' | 'Fest';
  date: string;
  time: string;
  location: string;
  description: string;
  organizer: string;
  rsvpCount: number;
  isRegistered?: boolean;
}

export type VerificationStatus =
  | 'verified_institution'
  | 'verified_external'
  | 'self_reported'
  | 'pending_verification'
  | 'verified' // backward compat, treated as verified_institution
  | 'pending'  // backward compat, treated as pending_verification
  | 'rejected';

export type OrganizationType =
  | 'college_organized'
  | 'external_organization'
  | 'independent_participation';

export interface Achievement {
  id: string;
  studentId: string;
  studentName?: string;
  title: string;
  category: 'Academic' | 'Hackathon' | 'Sports' | 'Competition' | 'Leadership' | 'Cultural' | 'Research' | 'Other';
  organization?: string;
  organizationType?: OrganizationType;
  date: string;
  year: string;
  description: string;
  verificationStatus: VerificationStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  supportingLink?: string;
  supportingDocument?: string;
  showOnResume?: boolean;
  resumeOrder?: number;
}

export interface Participation {
  id: string;
  studentId: string;
  studentName?: string;
  eventName: string;
  category:
    | 'Smart India Hackathon'
    | 'Hackathon'
    | 'Coding'
    | 'Sports'
    | 'Cultural'
    | 'Workshop'
    | 'Seminar'
    | 'Conference'
    | 'Club'
    | 'NCC/NSS'
    | 'Volunteering'
    | 'Leadership'
    | 'Fest'
    | 'Other';
  organization?: string;
  organizationType?: OrganizationType;
  date: string;
  year: string;
  role: string;
  result?: string;
  description: string;
  verificationStatus: VerificationStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  supportingLink?: string;
  supportingDocument?: string;
  showOnResume?: boolean;
  resumeOrder?: number;
}

export interface Project {
  id: string;
  studentId: string;
  name: string;
  description: string;
  technologies: string[];
  year: string;
  organization?: string;
  organizationType?: OrganizationType;
  verificationStatus?: VerificationStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  githubUrl?: string;
  demoUrl?: string;
  supportingLink?: string;
  supportingDocument?: string;
  showOnResume?: boolean;
  resumeOrder?: number;
}

export interface Certification {
  id: string;
  studentId: string;
  name: string;
  organization: string;
  organizationType?: OrganizationType;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  verificationStatus: VerificationStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  supportingLink?: string;
  supportingDocument?: string;
  showOnResume?: boolean;
  resumeOrder?: number;
}

export interface Internship {
  id: string;
  studentId: string;
  studentName?: string;
  companyName: string;
  role: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  description: string;
  technologies?: string[];
  organizationType?: OrganizationType;
  verificationStatus: VerificationStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  supportingLink?: string;
  supportingDocument?: string;
  showOnResume?: boolean;
  resumeOrder?: number;
}

export interface TimelineMilestone {
  id: string;
  year: string;
  title: string;
  type: 'achievement' | 'participation' | 'project' | 'certification' | 'internship' | 'academic';
  category: string;
  date: string;
  description: string;
  status?: VerificationStatus;
  badge?: string;
  organization?: string;
  organizationType?: OrganizationType;
}

export interface StudentResumeSettings {
  studentId: string;
  summary: string;
  phone?: string;
  showPhone: boolean;
  showEmail: boolean;
  showGpa: boolean;
  linkedIn?: string;
  showLinkedIn: boolean;
  github?: string;
  showGithub: boolean;
  portfolio?: string;
  showPortfolio: boolean;
  location?: string;
  showLocation: boolean;
  skills: {
    category: string;
    items: string[];
  }[];
  visibleSections: {
    summary: boolean;
    education: boolean;
    skills: boolean;
    internships: boolean;
    projects: boolean;
    achievements: boolean;
    participations: boolean;
    certifications: boolean;
    leadership?: boolean;
  };
  sectionOrder?: string[];
}

export interface StudentJourneyProfile {
  student: User;
  achievements: Achievement[];
  participations: Participation[];
  projects: Project[];
  certifications: Certification[];
  internships: Internship[];
  timeline: TimelineMilestone[];
  resumeSettings?: StudentResumeSettings;
}

export interface GeofenceConfig {
  latitude: number;
  longitude: number;
  allowedRadiusMeters: number;
  campusName: string;
}

export interface LocationVerificationResult {
  isVerified: boolean;
  distanceMeters: number;
  allowedRadiusMeters: number;
  statusMessage: string;
  studentCoordinates?: { latitude: number; longitude: number };
}

export type ChatBadgeType = 'verified' | 'ai_guidance' | 'system';

export type ChatIntent =
  | 'GENERAL_ACADEMIC_GUIDANCE'
  | 'EXAM_SCHEDULE'
  | 'ASSIGNMENT_QUERY'
  | 'EVENT_QUERY'
  | 'NOTICE_QUERY'
  | 'STUDENT_RECORD_QUERY'
  | 'GENERAL_INFORMATION'
  | 'ACCOUNT/SUPPORT';

export interface ChatVerifiedData {
  type: 'event' | 'events_list' | 'assignment' | 'assignments_list' | 'exam' | 'exams_list' | 'notices' | 'attendance' | 'schedule' | 'escalation';
  headline?: string;
  items?: any[];
  action?: { tab: string; label: string; payload?: any };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  badgeType?: ChatBadgeType;
  intent?: ChatIntent;
  verifiedData?: ChatVerifiedData;
  followUpContext?: {
    intent?: ChatIntent | string;
    subject?: string;
    subjectName?: string;
    subjectCode?: string;
    items?: any[];
    referencedItem?: any;
    lastTopic?: string;
  };
  canReport?: boolean;
  suggestedFollowUps?: string[];
}

export interface DataReport {
  id: string;
  studentId: string;
  studentName: string;
  category: 'event' | 'assignment' | 'deadline' | 'schedule' | 'policy' | 'other';
  reportType: 'incorrect_event' | 'incorrect_assignment' | 'outdated_info' | 'missing_info';
  itemId?: string;
  itemTitle?: string;
  description: string;
  submittedAt: string;
  status: 'received' | 'investigating' | 'resolved';
}
