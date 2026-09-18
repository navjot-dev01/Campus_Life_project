export type UserRole = 'student' | 'faculty' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  studentId?: string;
  branch?: string;
  year?: string;
  semester?: string;
  cgpa?: number;
  avatarUrl?: string;
  collegeName?: string;
  department?: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  branch: string;
  semester: string;
  facultyId: string;
  facultyName?: string;
  totalClasses: number;
}

export interface AttendanceSession {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  classSection: string;
  code: string; // 6-digit code
  qrCodeData: string;
  startTime: string; // ISO string
  expiryTime: string; // ISO string
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
}

export interface AttendanceDashboardData {
  overallPercentage: number;
  totalPresent: number;
  totalClasses: number;
  subjectWise: SubjectAttendanceSummary[];
  recentAttendance: AttendanceRecord[];
  isWarning: boolean;
  classesNeededFor75: number;
}

export interface Assignment {
  id: string;
  subjectId: string;
  subjectName?: string;
  title: string;
  description: string;
  dueDate: string;
  maxMarks: number;
  createdBy: string;
  createdAt: string;
  submissionsCount?: number;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName?: string;
  submittedAt: string;
  submissionText: string;
  fileUrl?: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: string;
  feedback?: string;
}

export interface Exam {
  id: string;
  subjectId: string;
  subjectName?: string;
  subjectCode?: string;
  examType: 'Mid-Term' | 'End-Term' | 'Lab Practical' | 'Internal Assessment' | 'Quiz';
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  totalMarks: number;
  instructions?: string;
}

export interface Notice {
  id: string;
  title: string;
  description: string;
  category: 'academic' | 'exam' | 'placement' | 'event' | 'general';
  priority: 'high' | 'medium' | 'low';
  publishedAt: string;
  authorName: string;
  isPinned?: boolean;
}

export interface EventItem {
  id: string;
  name: string;
  category: string;
  date: string;
  time: string;
  location: string;
  description: string;
  organizer: string;
  rsvpCount: number;
  isRegistered?: boolean;
}

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export interface Achievement {
  id: string;
  studentId: string;
  studentName?: string;
  title: string;
  category: 'Academic' | 'Hackathon' | 'Sports' | 'Competition' | 'Leadership';
  date: string;
  year: string;
  description: string;
  verificationStatus: VerificationStatus;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface Participation {
  id: string;
  studentId: string;
  studentName?: string;
  eventName: string;
  category: string;
  date: string;
  year: string;
  role: string;
  result?: string;
  description: string;
  verificationStatus: VerificationStatus;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface Project {
  id: string;
  studentId: string;
  name: string;
  description: string;
  technologies: string[];
  year: string;
  githubUrl?: string;
  demoUrl?: string;
}

export interface Certification {
  id: string;
  studentId: string;
  name: string;
  organization: string;
  issueDate: string;
  credentialId?: string;
  credentialUrl?: string;
  verificationStatus: VerificationStatus;
}

export interface TimelineMilestone {
  year: string;
  title: string;
  type: 'achievement' | 'participation' | 'project' | 'certification' | 'academic';
  category: string;
  date: string;
  description: string;
  status?: VerificationStatus;
  badge?: string;
}

export interface StudentJourneyProfile {
  student: User;
  achievements: Achievement[];
  participations: Participation[];
  projects: Project[];
  certifications: Certification[];
  timeline: TimelineMilestone[];
}
