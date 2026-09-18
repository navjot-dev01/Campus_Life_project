import {
  User,
  UserRole,
  Subject,
  AttendanceSession,
  AttendanceRecord,
  AttendanceAnalytics,
  FacultyAttendanceRecord,
  Assignment,
  AssignmentSubmission,
  Exam,
  Notice,
  EventItem,
  Achievement,
  Participation,
  Project,
  Certification,
  Internship,
  StudentResumeSettings,
  TimelineMilestone,
  StudentJourneyProfile,
  GeofenceConfig,
  LocationVerificationResult,
  ChatMessage,
  DataReport,
  VerificationStatus,
  OrganizationType
} from '../types';
import { verifyGeofence } from '../utils/haversine';
import { matchesStudentAcademicGroup, AcademicTarget } from '../utils/academicFilter';

// Default College Campus Geofence Anchor (Main Engineering Campus)
export const DEFAULT_GEOFENCE: GeofenceConfig = {
  campusName: 'CampusLife Institute of Technology – Academic Complex',
  latitude: 28.5458,
  longitude: 77.1926,
  allowedRadiusMeters: 200 // 200 meters allowed radius
};

// Demo Preset Coordinates for Verification Testing
export const LOCATION_PRESETS = [
  {
    name: 'Lab 3 (Computer Science Block - On Campus)',
    latitude: 28.54585,
    longitude: 77.19265,
    expected: 'Inside Campus (~8m)'
  },
  {
    name: 'Lecture Hall 201 (On Campus)',
    latitude: 28.54592,
    longitude: 77.19278,
    expected: 'Inside Campus (~22m)'
  },
  {
    name: 'Library Reading Hall (On Campus)',
    latitude: 28.5463,
    longitude: 77.1932,
    expected: 'Inside Campus (~85m)'
  },
  {
    name: 'Off-Campus Café / Hostel (1.2 km away)',
    latitude: 28.555,
    longitude: 77.202,
    expected: 'Outside Geofence (~1.3 km)'
  },
  {
    name: 'Home City / Outside College (5.8 km away)',
    latitude: 28.589,
    longitude: 77.23,
    expected: 'Outside Geofence (~6 km)'
  }
];

// Initial Seed Users with strictly separated profile schemas
const INITIAL_USERS: User[] = [
  {
    id: 'fac_1',
    email: 'faculty.dbms@campuslife.edu',
    name: 'Dr. Rajesh Sharma',
    role: 'faculty',
    employeeId: 'FAC-CS-042',
    designation: 'Associate Professor & HOD',
    department: 'Computer Science & Engineering',
    collegeName: 'CampusLife Institute of Technology',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    phone: '+91 98765 11223',
    officeRoom: 'CS Block, Room 304',
    qualifications: 'Ph.D. in Computer Science (IIT Delhi), M.Tech (CSE)',
    specialization: 'Distributed Database Systems, Cloud Infrastructure & Big Data',
    subjectsTaught: [
      'Database Management Systems (CS601)',
      'Advanced Database Architectures (CS702)',
      'AI & Machine Learning (CS605)'
    ],
    responsibilities: [
      'Head of Department & Academic Advisor for CSE 3rd Year',
      'Course Coordinator for Database Systems Curriculum',
      'Member, Campus Academic Integrity & Honor Roll Verification Board'
    ],
    bio: 'Senior academic and researcher with 14+ years in distributed databases, query optimization, and undergraduate academic advising.',
    linkedinUrl: 'https://linkedin.com/in/rajesh-sharma-cse',
    githubUrl: 'https://github.com/dr-rajesh-sharma',
    portfolioUrl: 'https://rajeshsharma.campuslife.edu'
  },
  {
    id: 'dean_1',
    email: 'dean@campuslife.edu',
    name: 'Prof. Sunita Rao',
    role: 'dean',
    employeeId: 'DEAN-ACAD-01',
    designation: 'Dean of Academic Affairs',
    department: 'Office of the Dean • Academic Affairs',
    collegeName: 'CampusLife Institute of Technology',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    phone: '+91 98765 99887',
    officeLocation: 'Academic Senate Wing, Administrative Block, Suite 101',
    qualifications: 'Ph.D. in Systems Engineering (MIT), Senior IEEE Fellow, F.N.A.Sc.',
    areasOfResponsibility: [
      'Institutional Curriculum Standards & Academic Governance',
      'Final Authorization for Honor Roll, Degree Conferrals & Credentials',
      'Faculty Academic Evaluation, Syllabus Modernization & Accreditation',
      'Cross-departmental Cohort Benchmarking & Academic Circulars'
    ],
    bio: 'Senior academic administrator with 22+ years in university leadership, engineering curriculum reform, and institutional credentials governance.',
    linkedinUrl: 'https://linkedin.com/in/prof-sunita-rao',
    portfolioUrl: 'https://dean.campuslife.edu'
  },
  {
    id: 'admin_1',
    email: 'admin@campuslife.edu',
    name: 'Er. Vikram Malhotra',
    role: 'admin',
    employeeId: 'ADM-IT-001',
    designation: 'Chief IT Systems Administrator & Registrar',
    department: 'Central IT & Institutional Administration',
    collegeName: 'CampusLife Institute of Technology',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    phone: '+91 98765 55443',
    officeLocation: 'Central IT Tower, Server Operations Center 2B',
    responsibilities: [
      'Campus-wide Network Infrastructure, ERP & Cloud Platform Administration',
      'Campus Geofence Boundary Calibration & Location Telemetry Maintenance',
      'Identity Management, Role Provisioning & Security Audit Logs',
      'Institutional Data Privacy & Access Policy Enforcement'
    ],
    bio: 'Lead systems administrator managing enterprise campus networks, secure cloud infrastructure, and administrative IT governance.',
    linkedinUrl: 'https://linkedin.com/in/vikram-malhotra-admin',
    githubUrl: 'https://github.com/vmalhotra-admin'
  },
  {
    id: 'stu_1',
    email: 'aarav.sharma@campuslife.edu',
    name: 'Aarav Sharma',
    role: 'student',
    studentId: '21CS042',
    degree: 'B.Tech',
    branch: 'Computer Science & Engineering',
    year: '3rd Year',
    semester: '6th Semester',
    cgpa: 8.92,
    collegeName: 'CampusLife Institute of Technology',
    department: 'Computer Science',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    phone: '+91 98765 43210',
    address: 'Campus Hostel Block B, Room 314, CampusLife Institute',
    bio: 'Junior CSE undergraduate enthusiastic about scalable distributed systems, artificial intelligence algorithms, and verifiable academic credentials.',
    linkedinUrl: 'https://linkedin.com/in/aarav-sharma-cs',
    githubUrl: 'https://github.com/aaravsharma-dev',
    portfolioUrl: 'https://aaravsharma.dev',
    emergencyContact: '+91 98111 22334 (Parent - Mr. R. Sharma)',
    bloodGroup: 'B+',
    advisorName: 'Dr. Rajesh Sharma (HOD CSE)',
    batch: '2023 – 2027',
    interests: ['Distributed Systems', 'Cloud Architecture', 'Web Technologies', 'Machine Learning']
  },
  {
    id: 'stu_2',
    email: 'ananya.patel@campuslife.edu',
    name: 'Ananya Patel',
    role: 'student',
    studentId: '21CS015',
    branch: 'Computer Science & Engineering',
    year: '3rd Year',
    semester: '6th Semester',
    cgpa: 9.15,
    collegeName: 'CampusLife Institute of Technology',
    department: 'Computer Science',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    phone: '+91 98123 45678',
    address: 'Campus Hostel Block A, Room 102',
    bio: 'AI researcher and competitive programmer.',
    linkedinUrl: 'https://linkedin.com/in/ananya-patel',
    githubUrl: 'https://github.com/ananyapatel',
    emergencyContact: '+91 98222 33445',
    bloodGroup: 'O+',
    advisorName: 'Dr. Rajesh Sharma',
    batch: '2023 – 2027'
  },
  {
    id: 'stu_3',
    email: 'rohan.verma@campuslife.edu',
    name: 'Rohan Verma',
    role: 'student',
    studentId: '21CS078',
    branch: 'Computer Science & Engineering',
    year: '3rd Year',
    semester: '6th Semester',
    cgpa: 7.4,
    collegeName: 'CampusLife Institute of Technology',
    department: 'Computer Science',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    phone: '+91 98234 56789',
    address: 'Day Scholar, New Delhi',
    bio: 'Robotics enthusiast and IoT developer.',
    bloodGroup: 'A+',
    advisorName: 'Prof. S. Rao',
    batch: '2023 – 2027'
  }
];

const INITIAL_SUBJECTS: Subject[] = [
  // --- CSE 6th Semester Subjects ---
  {
    id: 'sub_dbms',
    code: 'CS601',
    name: 'Database Management Systems (DBMS)',
    branch: 'CSE',
    semester: '6th Semester',
    facultyId: 'fac_1',
    facultyName: 'Dr. Rajesh Sharma',
    totalClasses: 42
  },
  {
    id: 'sub_os',
    code: 'CS602',
    name: 'Operating Systems',
    branch: 'CSE',
    semester: '6th Semester',
    facultyId: 'fac_1',
    facultyName: 'Prof. S. Rao',
    totalClasses: 38
  },
  {
    id: 'sub_cn',
    code: 'CS603',
    name: 'Computer Networks',
    branch: 'CSE',
    semester: '6th Semester',
    facultyId: 'fac_1',
    facultyName: 'Dr. A. Mehra',
    totalClasses: 40
  },
  {
    id: 'sub_daa',
    code: 'CS604',
    name: 'Design & Analysis of Algorithms (DAA)',
    branch: 'CSE',
    semester: '6th Semester',
    facultyId: 'fac_1',
    facultyName: 'Dr. N. Gupta',
    totalClasses: 36
  },
  {
    id: 'sub_ai',
    code: 'CS605',
    name: 'Artificial Intelligence & Machine Learning',
    branch: 'CSE',
    semester: '6th Semester',
    facultyId: 'fac_1',
    facultyName: 'Dr. Rajesh Sharma',
    totalClasses: 34
  },

  // --- BCA 6th Semester Subjects ---
  {
    id: 'sub_bca_web',
    code: 'BCA601',
    name: 'Full-Stack Web Development & Frameworks',
    branch: 'BCA',
    semester: '6th Semester',
    facultyId: 'fac_1',
    facultyName: 'Dr. Rajesh Sharma',
    totalClasses: 40
  },
  {
    id: 'sub_bca_se',
    code: 'BCA602',
    name: 'Software Engineering & Agile DevOps',
    branch: 'BCA',
    semester: '6th Semester',
    facultyId: 'fac_1',
    facultyName: 'Prof. S. Rao',
    totalClasses: 36
  },
  {
    id: 'sub_bca_py',
    code: 'BCA603',
    name: 'Python for Data Science & Analytics',
    branch: 'BCA',
    semester: '6th Semester',
    facultyId: 'fac_1',
    facultyName: 'Dr. A. Mehra',
    totalClasses: 38
  },
  {
    id: 'sub_bca_cloud',
    code: 'BCA604',
    name: 'Cloud Computing & Microservices Architecture',
    branch: 'BCA',
    semester: '6th Semester',
    facultyId: 'fac_1',
    facultyName: 'Dr. N. Gupta',
    totalClasses: 34
  }
];

// Initial Subject Attendance Map for demo students
const INITIAL_STUDENT_ATTENDANCE: Record<string, Record<string, { present: number; total: number }>> = {
  stu_1: {
    // CSE subjects
    sub_dbms: { present: 36, total: 42 }, // 86%
    sub_os: { present: 28, total: 38 },   // 74% (<75% warning!)
    sub_cn: { present: 33, total: 40 },   // 82%
    sub_daa: { present: 28, total: 36 },  // 78%
    sub_ai: { present: 24, total: 34 },   // 71% (<75% warning!)
    // BCA subjects (in case student changes program to BCA)
    sub_bca_web: { present: 34, total: 40 }, // 85%
    sub_bca_se: { present: 30, total: 36 },  // 83%
    sub_bca_py: { present: 32, total: 38 },  // 84%
    sub_bca_cloud: { present: 26, total: 34 } // 76%
  },
  stu_2: {
    sub_dbms: { present: 40, total: 42 }, // 95%
    sub_os: { present: 36, total: 38 },   // 95%
    sub_cn: { present: 38, total: 40 },   // 95%
    sub_daa: { present: 34, total: 36 },  // 94%
    sub_ai: { present: 32, total: 34 },   // 94%
    sub_bca_web: { present: 38, total: 40 },
    sub_bca_se: { present: 34, total: 36 },
    sub_bca_py: { present: 36, total: 38 },
    sub_bca_cloud: { present: 32, total: 34 }
  },
  stu_3: {
    sub_dbms: { present: 26, total: 42 }, // 62%
    sub_os: { present: 24, total: 38 },   // 63%
    sub_cn: { present: 25, total: 40 },   // 62%
    sub_daa: { present: 23, total: 36 },  // 64%
    sub_ai: { present: 21, total: 34 },   // 62%
    sub_bca_web: { present: 24, total: 40 },
    sub_bca_se: { present: 22, total: 36 },
    sub_bca_py: { present: 23, total: 38 },
    sub_bca_cloud: { present: 20, total: 34 }
  }
};

// Helpers for relative realistic dates
const toDateStr = (offsetDays: number): string => {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return d.toISOString().split('T')[0];
};

const getUpcomingOrThisFridayStr = (): string => {
  const d = new Date();
  const day = d.getDay(); // 0 = Sun, 5 = Fri
  let daysUntilFriday = (5 - day + 7) % 7;
  if (daysUntilFriday === 0 && d.getHours() >= 18) {
    daysUntilFriday = 7;
  }
  const target = new Date(d.getTime() + (daysUntilFriday || 0) * 86400000);
  return target.toISOString().split('T')[0];
};

const getTodayDueISO = (): string => {
  const d = new Date();
  d.setHours(23, 59, 0, 0);
  return d.toISOString();
};

const INITIAL_ASSIGNMENTS: Assignment[] = [
  // --- CSE 3rd Year 6th Semester Assignments ---
  {
    id: 'asg_today',
    subjectId: 'sub_dbms',
    subjectName: 'Database Management Systems (DBMS)',
    title: 'DBMS Lab 5: SQL Query Optimization & Index Benchmarking',
    description: 'Execute query profiling using EXPLAIN ANALYZE on sample relational datasets. Compare sequential scan versus clustered B+ Tree index traversals.',
    dueDate: getTodayDueISO(),
    maxMarks: 50,
    createdBy: 'fac_1',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    branch: 'CSE',
    year: '3rd Year',
    semester: '6th Semester',
    submissionsCount: 34,
    isSubmitted: false,
    submissionStatus: 'pending'
  },
  {
    id: 'asg_1',
    subjectId: 'sub_dbms',
    subjectName: 'Database Management Systems (DBMS)',
    title: 'B+ Tree Indexing & Query Optimization Plan',
    description: 'Implement B+ Tree index traversal simulation and write query plan execution benchmarks for nested-loop and hash joins.',
    dueDate: new Date(Date.now() + 4 * 86400000).toISOString(),
    maxMarks: 100,
    createdBy: 'fac_1',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    branch: 'CSE',
    year: '3rd Year',
    semester: '6th Semester',
    submissionsCount: 42,
    isSubmitted: false,
    submissionStatus: 'pending'
  },
  {
    id: 'asg_2',
    subjectId: 'sub_os',
    subjectName: 'Operating Systems',
    title: 'Custom Shell with Background Job Controller in C/C++',
    description: 'Construct a Unix terminal emulator supporting piped commands, redirection, signal trapping (SIGINT/SIGTSTP), and round-robin CPU scheduler.',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    maxMarks: 100,
    createdBy: 'fac_1',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    branch: 'CSE',
    year: '3rd Year',
    semester: '6th Semester',
    submissionsCount: 38,
    isSubmitted: true,
    submissionStatus: 'submitted'
  },
  {
    id: 'asg_3',
    subjectId: 'sub_cn',
    subjectName: 'Computer Networks',
    title: 'Wireshark TCP 3-Way Handshake & Congestion Trace Analysis',
    description: 'Capture live pcap traces of TCP SYN, SYN-ACK, ACK exchanges. Analyze window scaling and slow-start congestion graphs.',
    dueDate: new Date(Date.now() + 10 * 86400000).toISOString(),
    maxMarks: 50,
    createdBy: 'fac_1',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    branch: 'CSE',
    year: '3rd Year',
    semester: '6th Semester',
    submissionsCount: 29,
    isSubmitted: false,
    submissionStatus: 'pending'
  },
  {
    id: 'asg_4',
    subjectId: 'sub_daa',
    subjectName: 'Design & Analysis of Algorithms (DAA)',
    title: 'Dynamic Programming on Graph Problems & Complexity Profiling',
    description: 'Implement Floyd-Warshall and Bellman-Ford algorithms with negative cycle detection and empirical runtime analysis.',
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
    maxMarks: 100,
    createdBy: 'fac_1',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    branch: 'CSE',
    year: '3rd Year',
    semester: '6th Semester',
    submissionsCount: 15,
    isSubmitted: false,
    submissionStatus: 'pending'
  },

  // --- BCA 3rd Year 6th Semester Assignments ---
  {
    id: 'asg_bca_1',
    subjectId: 'sub_bca_web',
    subjectName: 'Full-Stack Web Development & Frameworks',
    title: 'Full-Stack REST API with React & Express',
    description: 'Construct a responsive CRUD web application with state management, JWT authentication middleware, and input sanitization.',
    dueDate: getTodayDueISO(),
    maxMarks: 50,
    createdBy: 'fac_1',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    branch: 'BCA',
    year: '3rd Year',
    semester: '6th Semester',
    submissionsCount: 28,
    isSubmitted: false,
    submissionStatus: 'pending'
  },
  {
    id: 'asg_bca_2',
    subjectId: 'sub_bca_se',
    subjectName: 'Software Engineering & Agile DevOps',
    title: 'Agile Sprint Backlog & Automated CI/CD Pipeline',
    description: 'Design user stories, sprint velocity charts, and configure a GitHub Actions workflow with automated unit testing.',
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    maxMarks: 100,
    createdBy: 'fac_1',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    branch: 'BCA',
    year: '3rd Year',
    semester: '6th Semester',
    submissionsCount: 31,
    isSubmitted: false,
    submissionStatus: 'pending'
  },
  {
    id: 'asg_bca_3',
    subjectId: 'sub_bca_py',
    subjectName: 'Python for Data Science & Analytics',
    title: 'Exploratory Data Analysis with Pandas & Seaborn',
    description: 'Cleanse raw CSV datasets, compute variance/correlation matrices, and generate interactive distribution plots.',
    dueDate: new Date(Date.now() + 8 * 86400000).toISOString(),
    maxMarks: 50,
    createdBy: 'fac_1',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    branch: 'BCA',
    year: '3rd Year',
    semester: '6th Semester',
    submissionsCount: 22,
    isSubmitted: true,
    submissionStatus: 'submitted'
  },
  {
    id: 'asg_bca_4',
    subjectId: 'sub_bca_cloud',
    subjectName: 'Cloud Computing & Microservices Architecture',
    title: 'Docker Containerization & Cloud Deployment',
    description: 'Dockerize a multi-tier web application, write docker-compose manifests, and deploy on a cloud container engine.',
    dueDate: new Date(Date.now() + 12 * 86400000).toISOString(),
    maxMarks: 100,
    createdBy: 'fac_1',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    branch: 'BCA',
    year: '3rd Year',
    semester: '6th Semester',
    submissionsCount: 19,
    isSubmitted: false,
    submissionStatus: 'pending'
  }
];

const INITIAL_ASSIGNMENT_SUBMISSIONS: AssignmentSubmission[] = [
  {
    id: 'subm_os_aarav',
    assignmentId: 'asg_2',
    studentId: 'stu_1',
    studentName: 'Aarav Sharma',
    studentRoll: '2023CSE042',
    submittedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    fileName: 'Aarav_Sharma_CustomShell_OS_CS602.pdf',
    fileSize: '1.4 MB',
    fileType: 'application/pdf',
    status: 'submitted',
    comment: 'Custom shell implemented in C with signal handling and piping.'
  },
  {
    id: 'subm_bca_priya',
    assignmentId: 'asg_bca_3',
    studentId: 'stu_2',
    studentName: 'Priya Patel',
    studentRoll: '2023BCA018',
    submittedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    fileName: 'Priya_Patel_Python_EDA_Report.pdf',
    fileSize: '2.1 MB',
    fileType: 'application/pdf',
    status: 'submitted',
    comment: 'EDA charts and pandas correlation matrices attached.'
  }
];

const INITIAL_EXAMS: Exam[] = [
  // --- CSE 3rd Year 6th Semester Exams ---
  {
    id: 'ex_1',
    subjectId: 'sub_dbms',
    subjectName: 'Database Management Systems (DBMS)',
    subjectCode: 'CS601',
    examType: 'Mid-Term',
    date: toDateStr(14),
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    room: 'Lecture Hall 201',
    totalMarks: 50,
    instructions: 'Covers Units 1 to 3 (Relational Algebra, SQL, Normalization). Non-programmable scientific calculators permitted.',
    branch: 'CSE',
    year: '3rd Year',
    semester: '6th Semester'
  },
  {
    id: 'ex_2',
    subjectId: 'sub_os',
    subjectName: 'Operating Systems',
    subjectCode: 'CS602',
    examType: 'Mid-Term',
    date: toDateStr(16),
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    room: 'Lecture Hall 204',
    totalMarks: 50,
    instructions: 'Covers Process Scheduling, Synchronization primitives, Semaphores, and Deadlock prevention.',
    branch: 'CSE',
    year: '3rd Year',
    semester: '6th Semester'
  },
  {
    id: 'ex_3',
    subjectId: 'sub_cn',
    subjectName: 'Computer Networks',
    subjectCode: 'CS603',
    examType: 'Lab Practical',
    date: toDateStr(20),
    startTime: '02:00 PM',
    endTime: '05:00 PM',
    room: 'Lab 2 (Systems & Networks)',
    totalMarks: 40,
    instructions: 'Socket programming practical assessment in C/Python and packet inspection viva.',
    branch: 'CSE',
    year: '3rd Year',
    semester: '6th Semester'
  },
  {
    id: 'ex_4',
    subjectId: 'sub_daa',
    subjectName: 'Design & Analysis of Algorithms (DAA)',
    subjectCode: 'CS604',
    examType: 'Mid-Term',
    date: toDateStr(23),
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    room: 'Lecture Hall 102',
    totalMarks: 50,
    instructions: 'Divide & Conquer, Greedy method, and Dynamic Programming master theorem problems.',
    branch: 'CSE',
    year: '3rd Year',
    semester: '6th Semester'
  },

  // --- BCA 3rd Year 6th Semester Exams ---
  {
    id: 'ex_bca_1',
    subjectId: 'sub_bca_web',
    subjectName: 'Full-Stack Web Development & Frameworks',
    subjectCode: 'BCA601',
    examType: 'Mid-Term',
    date: toDateStr(15),
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    room: 'Lab 4 (Web Technologies)',
    totalMarks: 50,
    instructions: 'Hands-on practical coding test and viva on DOM manipulation and asynchronous API consumption.',
    branch: 'BCA',
    year: '3rd Year',
    semester: '6th Semester'
  },
  {
    id: 'ex_bca_2',
    subjectId: 'sub_bca_se',
    subjectName: 'Software Engineering & Agile DevOps',
    subjectCode: 'BCA602',
    examType: 'Mid-Term',
    date: toDateStr(17),
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    room: 'Lecture Hall 104',
    totalMarks: 50,
    instructions: 'Covers SDLC models, Scrum framework, UML Class & Sequence diagrams, and design patterns.',
    branch: 'BCA',
    year: '3rd Year',
    semester: '6th Semester'
  },
  {
    id: 'ex_bca_3',
    subjectId: 'sub_bca_py',
    subjectName: 'Python for Data Science & Analytics',
    subjectCode: 'BCA603',
    examType: 'Lab Practical',
    date: toDateStr(21),
    startTime: '02:00 PM',
    endTime: '05:00 PM',
    room: 'Lab 1 (Data Analytics)',
    totalMarks: 40,
    instructions: 'NumPy, Pandas, and Matplotlib problem sheet. Internet disconnected during assessment.',
    branch: 'BCA',
    year: '3rd Year',
    semester: '6th Semester'
  },
  {
    id: 'ex_bca_4',
    subjectId: 'sub_bca_cloud',
    subjectName: 'Cloud Computing & Microservices Architecture',
    subjectCode: 'BCA604',
    examType: 'Mid-Term',
    date: toDateStr(24),
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    room: 'Lecture Hall 202',
    totalMarks: 50,
    instructions: 'Virtualization, IaaS/PaaS/SaaS architectures, serverless computing, and AWS/GCP services overview.',
    branch: 'BCA',
    year: '3rd Year',
    semester: '6th Semester'
  }
];

const INITIAL_NOTICES: Notice[] = [
  {
    id: 'not_1',
    title: 'End-Term Examination Schedule Released (May 2026)',
    description: 'The Office of the Controller of Examinations has published the comprehensive schedule for 6th-semester regular examinations. Verify your registered elective courses.',
    category: 'exam',
    priority: 'high',
    publishedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    authorName: 'Prof. Sunita Rao (Dean)',
    isPinned: true
  },
  {
    id: 'not_2',
    title: 'Smart India Hackathon (SIH 2026) Internal College Qualifier',
    description: 'Teams of 6 students (minimum 1 female member) can submit innovation pitches. Top 5 shortlisted teams will be nominated as CampusLife official delegates.',
    category: 'event',
    priority: 'high',
    publishedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    authorName: 'Dr. Rajesh Sharma (Faculty Advisor)',
    isPinned: true
  },
  {
    id: 'not_3',
    title: 'Mandatory Minimum 75% Attendance Requirement for Admit Cards',
    description: 'Notice from Academic Council: Students with overall attendance falling below 75% will be detained from appearing in end-semester examinations without Dean-approved medical leaves.',
    category: 'academic',
    priority: 'high',
    publishedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    authorName: 'Academic Affairs Council',
    isPinned: false
  },
  {
    id: 'not_4',
    title: 'Campus Placement & Internship Talk: Google & Microsoft',
    description: 'Pre-final year students are invited to the technical prep sessions and recruitment talk this Friday at the Central Auditorium.',
    category: 'placement',
    priority: 'medium',
    publishedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    authorName: 'Training & Placement Cell',
    isPinned: false
  }
];

const INITIAL_EVENTS: EventItem[] = [
  {
    id: 'evt_today',
    name: 'TechX Industry Expert Seminar & Research Showcase',
    category: 'Seminar',
    date: toDateStr(0),
    time: '03:00 PM – 05:00 PM',
    location: 'Lecture Hall 201 (Academic Complex)',
    description: 'Special guest session by Google & industry research leads on Distributed Systems and High-Scale Cloud Architectures.',
    organizer: 'CSE Department & CampusLife ACM Chapter',
    rsvpCount: 112,
    isRegistered: true
  },
  {
    id: 'evt_friday',
    name: 'Smart India Hackathon (SIH) Internal Pitching Round',
    category: 'Hackathon',
    date: getUpcomingOrThisFridayStr(),
    time: '10:00 AM – 04:30 PM',
    location: 'CampusLife Innovation & Incubation Hub',
    description: 'Live jury evaluation of student hardware and software prototypes for the national nomination qualifier.',
    organizer: 'CampusLife Innovation Cell',
    rsvpCount: 84,
    isRegistered: false
  },
  {
    id: 'evt_2',
    name: 'Cloud Computing & Kubernetes Hands-On Workshop',
    category: 'Workshop',
    date: toDateStr(4),
    time: '02:00 PM – 05:00 PM',
    location: 'Lab 4 (Cloud & Distributed Systems)',
    description: 'Deep dive into container orchestration, cloud-native pipelines, and serverless deployment architectures with industry practitioners.',
    organizer: 'Google Developer Student Clubs (GDSC)',
    rsvpCount: 95,
    isRegistered: false
  },
  {
    id: 'evt_3',
    name: 'PULSE 2026: Annual Inter-College Cultural Fest',
    category: 'Cultural',
    date: toDateStr(12),
    time: '10:00 AM – 10:00 PM',
    location: 'College Open Air Amphitheatre',
    description: 'Three-day cultural festival featuring rock band competitions, classical music, drama productions, and celebrity evening performance.',
    organizer: 'CampusLife Student Council',
    rsvpCount: 420,
    isRegistered: true
  },
  {
    id: 'evt_4',
    name: 'Annual Inter-Branch Sports Tournament',
    category: 'Sports',
    date: toDateStr(18),
    time: '07:30 AM – 06:00 PM',
    location: 'College Sports Pavilion & Grounds',
    description: 'Inter-departmental championship for cricket, football, basketball, table tennis, and track & field.',
    organizer: 'CampusLife Physical Education Board',
    rsvpCount: 235,
    isRegistered: false
  }
];

const INITIAL_DATA_REPORTS: DataReport[] = [
  {
    id: 'rep_1',
    studentId: 'stu_1',
    studentName: 'Aarav Sharma',
    category: 'event',
    reportType: 'outdated_info',
    itemTitle: 'Autonomous Rover Workshop',
    description: 'The timing was updated on the physical department notice board from 2 PM to 3 PM.',
    submittedAt: new Date(Date.now() - 86400000).toISOString(),
    status: 'investigating'
  }
];

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_1',
    studentId: 'stu_1',
    studentName: 'Aarav Sharma',
    title: '1st Runner-Up — Smart India Hackathon (SIH 2025)',
    category: 'Hackathon',
    organization: 'Ministry of Education & AICTE',
    organizationType: 'external_organization',
    date: '2025-12-20',
    year: '2025',
    description: 'Developed an AI-based geospatial disaster response dispatch platform for the Ministry of Earth Sciences. Awarded Rs. 75,000 cash prize.',
    verificationStatus: 'verified_institution',
    verifiedBy: 'Dr. Rajesh Sharma (Faculty Coordinator)',
    verifiedAt: '2025-12-22T10:00:00Z',
    supportingLink: 'https://sih.gov.in/winners-2025',
    showOnResume: true,
    resumeOrder: 1
  },
  {
    id: 'ach_2',
    studentId: 'stu_1',
    studentName: 'Aarav Sharma',
    title: 'Dean’s Academic Excellence Honor Roll (Sem 4 & 5)',
    category: 'Academic',
    organization: 'CampusLife Institute of Technology',
    organizationType: 'college_organized',
    date: '2025-07-15',
    year: '2025',
    description: 'Recognized for achieving top 2% GPA in Computer Science Engineering cohort with 9.20 SGPA.',
    verificationStatus: 'verified_institution',
    verifiedBy: 'Prof. Sunita Rao (Dean)',
    verifiedAt: '2025-07-16T14:30:00Z',
    showOnResume: true,
    resumeOrder: 2
  },
  {
    id: 'ach_3',
    studentId: 'stu_1',
    studentName: 'Aarav Sharma',
    title: 'Gold Medal — Inter-College Badminton Championship',
    category: 'Sports',
    organization: 'CampusLife Institute of Technology',
    organizationType: 'college_organized',
    date: '2024-11-10',
    year: '2024',
    description: 'Captained the college badminton men’s doubles team to university championship victory.',
    verificationStatus: 'verified_institution',
    verifiedBy: 'Prof. V. Kapoor (Sports Director)',
    verifiedAt: '2024-11-12T09:00:00Z',
    showOnResume: false,
    resumeOrder: 3
  },
  {
    id: 'ach_4',
    studentId: 'stu_1',
    studentName: 'Aarav Sharma',
    title: 'Best Research Paper Award — IEEE Student Conference',
    category: 'Competition',
    organization: 'IEEE Computational Intelligence Society',
    organizationType: 'external_organization',
    date: '2026-02-18',
    year: '2026',
    description: 'Paper on "Fault-Tolerant Distributed Consensus in Edge Networks" presented and awarded Best Undergraduate Paper.',
    verificationStatus: 'pending_verification',
    supportingLink: 'https://ieee-conference.org/papers/2026-best-undergrad',
    showOnResume: true,
    resumeOrder: 4
  },
  {
    id: 'ach_5',
    studentId: 'stu_1',
    studentName: 'Aarav Sharma',
    title: 'Global Finalist — HackZurich Virtual Sprint 2025',
    category: 'Hackathon',
    organization: 'ETH Zurich & HackZurich Community',
    organizationType: 'external_organization',
    date: '2025-09-24',
    year: '2025',
    description: 'Built a peer-to-peer resilient emergency mesh protocol over WebRTC for disconnected crisis networks.',
    verificationStatus: 'self_reported',
    supportingLink: 'https://devpost.com/software/mesh-crisis-dispatch',
    showOnResume: true,
    resumeOrder: 5
  }
];

const INITIAL_PARTICIPATIONS: Participation[] = [
  {
    id: 'part_1',
    studentId: 'stu_1',
    studentName: 'Aarav Sharma',
    eventName: 'Smart India Hackathon (SIH 2025) Grand Finale',
    category: 'Smart India Hackathon',
    organization: 'Ministry of Education & AICTE',
    organizationType: 'external_organization',
    date: '2025-12-19',
    year: '2025',
    role: 'Team Lead & Full-Stack Architect',
    result: '1st Runner Up (Rs. 75,000)',
    description: 'Spearheaded the 6-member team build across a 36-hour non-stop national software hackathon.',
    verificationStatus: 'verified_institution',
    verifiedBy: 'Dr. Rajesh Sharma',
    verifiedAt: '2025-12-22T10:00:00Z',
    supportingLink: 'https://sih.gov.in',
    showOnResume: true,
    resumeOrder: 1
  },
  {
    id: 'part_2',
    studentId: 'stu_1',
    studentName: 'Aarav Sharma',
    eventName: 'ACM ICPC Regional Preliminary Contest',
    category: 'Coding',
    organization: 'ICPC Foundation',
    organizationType: 'external_organization',
    date: '2025-10-14',
    year: '2025',
    role: 'Competitive Programmer',
    result: 'Rank 84 (Asia-West Region)',
    description: 'Represented CampusLife Institute solving 5 algorithmic challenges under timed contest constraints.',
    verificationStatus: 'verified_external',
    verifiedBy: 'ICPC Regional Standing Certificate #ICPC-2025-AW-9812',
    verifiedAt: '2025-10-18T11:00:00Z',
    supportingLink: 'https://icpc.global/regionals/asia-west',
    showOnResume: true,
    resumeOrder: 2
  },
  {
    id: 'part_3',
    studentId: 'stu_1',
    studentName: 'Aarav Sharma',
    eventName: 'National Cadet Corps (NCC) Annual Training Camp',
    category: 'NCC/NSS',
    organization: 'National Cadet Corps 4th Delhi Battalion',
    organizationType: 'college_organized',
    date: '2024-06-10',
    year: '2024',
    role: 'Cadet Sergeant',
    result: 'Excellence in Drill & Discipline Badge',
    description: 'Completed 10-day intensive military training camp, rifle marksmanship, and field disaster management drills.',
    verificationStatus: 'verified_institution',
    verifiedBy: 'Capt. M. Rathore (NCC Officer)',
    verifiedAt: '2024-06-21T08:00:00Z',
    showOnResume: true,
    resumeOrder: 3
  },
  {
    id: 'part_4',
    studentId: 'stu_1',
    studentName: 'Aarav Sharma',
    eventName: 'CampusLife TechFest "InnovateX" Web Track',
    category: 'Fest',
    organization: 'CampusLife Institute of Technology',
    organizationType: 'college_organized',
    date: '2024-03-08',
    year: '2024',
    role: 'Event Lead & Technical Coordinator',
    result: 'Organizing Commendation',
    description: 'Led technical workshops on React/Node.js and coordinated 350+ participant submissions.',
    verificationStatus: 'verified_institution',
    verifiedBy: 'Prof. Sunita Rao',
    verifiedAt: '2024-03-12T16:00:00Z',
    showOnResume: true,
    resumeOrder: 4
  },
  {
    id: 'part_5',
    studentId: 'stu_1',
    studentName: 'Aarav Sharma',
    eventName: 'Autonomous Rover & Robotics Workshop',
    category: 'Workshop',
    organization: 'IEEE Student Branch & Robotics Lab',
    organizationType: 'college_organized',
    date: '2026-01-15',
    year: '2026',
    role: 'Participant',
    result: 'Completed Hands-On Training',
    description: 'Built ROS2 embedded controllers and LiDAR path-planning nodes for differential drive rovers.',
    verificationStatus: 'pending_verification',
    showOnResume: true,
    resumeOrder: 5
  },
  {
    id: 'part_6',
    studentId: 'stu_1',
    studentName: 'Aarav Sharma',
    eventName: 'Kubernetes Open Source Documentation & Triaging',
    category: 'Coding',
    organization: 'Cloud Native Computing Foundation (CNCF)',
    organizationType: 'independent_participation',
    date: '2025-05-10',
    year: '2025',
    role: 'Open Source Contributor',
    result: '4 PRs Merged & Docs Reviewer',
    description: 'Refactored container lifecycle architecture docs and submitted CLI bug fixes to the official Kubernetes repository.',
    verificationStatus: 'self_reported',
    supportingLink: 'https://github.com/kubernetes/website',
    showOnResume: true,
    resumeOrder: 6
  }
];

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj_1',
    studentId: 'stu_1',
    name: 'CampusLife Geofenced Attendance & Journey Portal',
    description: 'Unified student journey platform with Haversine geofence verification, expiring QR sessions, and verifiable college milestone portfolios.',
    technologies: ['React 19', 'TypeScript', 'Tailwind CSS', 'Vite', 'Node.js', 'Express'],
    year: '2026',
    organization: 'CampusLife Capstone Project Review',
    organizationType: 'college_organized',
    verificationStatus: 'verified_institution',
    verifiedBy: 'Dr. Rajesh Sharma (Head of Project Review)',
    verifiedAt: '2026-02-10T14:00:00Z',
    githubUrl: 'https://github.com/campuslife/student-journey',
    demoUrl: 'https://campuslife.edu',
    showOnResume: true,
    resumeOrder: 1
  },
  {
    id: 'proj_2',
    studentId: 'stu_1',
    name: 'GeoDisaster: Real-Time Crisis Dispatch Matrix',
    description: 'High-throughput emergency routing system allocating ambulances and rescue teams based on satellite flood maps and geospatial buffers.',
    technologies: ['Node.js', 'PostGIS', 'WebSockets', 'React', 'Docker'],
    year: '2025',
    organization: 'Smart India Hackathon 2025',
    organizationType: 'external_organization',
    verificationStatus: 'verified_external',
    verifiedBy: 'Ministry of Earth Sciences SIH Jury (Award Verified)',
    verifiedAt: '2025-12-22T10:00:00Z',
    githubUrl: 'https://github.com/aarav/geodisaster-matrix',
    demoUrl: 'https://geodisaster.io',
    showOnResume: true,
    resumeOrder: 2
  },
  {
    id: 'proj_3',
    studentId: 'stu_1',
    name: 'Distributed B+ Tree Storage Engine',
    description: 'Lightweight in-memory and disk-persisted relational query engine implementing page eviction, buffer pool management, and write-ahead logging (WAL).',
    technologies: ['C++20', 'Linux POSIX', 'CMake', 'Google Benchmark'],
    year: '2024',
    organization: 'Independent Systems Research',
    organizationType: 'independent_participation',
    verificationStatus: 'self_reported',
    githubUrl: 'https://github.com/aarav/bplus-storage-core',
    showOnResume: true,
    resumeOrder: 3
  }
];

const INITIAL_CERTIFICATIONS: Certification[] = [
  {
    id: 'cert_1',
    studentId: 'stu_1',
    name: 'Google Cloud Certified Associate Cloud Engineer',
    organization: 'Google Cloud',
    organizationType: 'external_organization',
    issueDate: '2025-08-14',
    credentialId: 'GCP-ACE-9823145',
    credentialUrl: 'https://google.accredible.com/cert/9823145',
    verificationStatus: 'verified_external',
    verifiedBy: 'Accredible Official Verification',
    verifiedAt: '2025-08-14T09:00:00Z',
    showOnResume: true,
    resumeOrder: 1
  },
  {
    id: 'cert_2',
    studentId: 'stu_1',
    name: 'AWS Certified Solutions Architect – Associate',
    organization: 'Amazon Web Services',
    organizationType: 'external_organization',
    issueDate: '2025-03-20',
    credentialId: 'AWS-SAA-382910',
    credentialUrl: 'https://aws.amazon.com/verification',
    verificationStatus: 'verified_external',
    verifiedBy: 'AWS Credly Badge Verification',
    verifiedAt: '2025-03-20T11:00:00Z',
    showOnResume: true,
    resumeOrder: 2
  },
  {
    id: 'cert_3',
    studentId: 'stu_1',
    name: 'Data Structures & Algorithms Specialization',
    organization: 'UC San Diego (Coursera)',
    organizationType: 'external_organization',
    issueDate: '2024-05-18',
    credentialId: 'COURSERA-DSA-7712',
    credentialUrl: 'https://coursera.org/verify/COURSERA-DSA-7712',
    verificationStatus: 'verified_external',
    showOnResume: true,
    resumeOrder: 3
  }
];

const INITIAL_INTERNSHIPS: Internship[] = [
  {
    id: 'int_1',
    studentId: 'stu_1',
    studentName: 'Aarav Sharma',
    companyName: 'CloudScale Technologies Ltd.',
    role: 'Software Engineering Intern',
    location: 'Bengaluru / Hybrid',
    startDate: '2025-06-01',
    endDate: '2025-08-31',
    isCurrent: false,
    description: 'Architected high-throughput telemetry ingestion microservices processing 4.2M daily events using Node.js and Redis. Cut cloud compute costs by 22% through query caching.',
    technologies: ['Node.js', 'Redis', 'PostgreSQL', 'Docker', 'Google Cloud Run', 'Jest'],
    organizationType: 'external_organization',
    verificationStatus: 'verified_external',
    verifiedBy: 'HR Verification Letter #CS-INT-2025-8841',
    verifiedAt: '2025-09-02T10:00:00Z',
    supportingLink: 'https://cloudscale.tech/verify/intern-aarav',
    showOnResume: true,
    resumeOrder: 1
  }
];

const DEFAULT_RESUME_SETTINGS: StudentResumeSettings = {
  studentId: 'stu_1',
  summary: 'Detail-oriented Computer Science undergraduate with proven expertise in building distributed web applications, geospatial services, and cloud-native systems. Smart India Hackathon runner-up with production internship experience and active open-source contributions.',
  phone: '+91 98765 43210',
  showPhone: false, // Student privacy by default
  showEmail: true,
  showGpa: true,
  linkedIn: 'https://linkedin.com/in/aarav-sharma-cs',
  showLinkedIn: true,
  github: 'https://github.com/aarav-sharma',
  showGithub: true,
  portfolio: 'https://aaravsharma.dev',
  showPortfolio: true,
  location: 'New Delhi, India',
  showLocation: true,
  skills: [
    { category: 'Languages', items: ['TypeScript', 'JavaScript', 'Python', 'C++20', 'SQL', 'Bash'] },
    { category: 'Frameworks & Libraries', items: ['React 19', 'Next.js', 'Node.js', 'Express', 'Tailwind CSS', 'WebSockets'] },
    { category: 'Cloud, DevOps & Databases', items: ['PostgreSQL', 'Redis', 'Google Cloud (GCP)', 'AWS', 'Docker', 'Git'] },
    { category: 'Core Competencies', items: ['Distributed Systems', 'Data Structures & Algorithms', 'Geospatial Geofencing', 'REST APIs', 'System Architecture'] }
  ],
  visibleSections: {
    summary: true,
    education: true,
    skills: true,
    internships: true,
    projects: true,
    achievements: true,
    participations: true,
    certifications: true,
    leadership: true
  },
  sectionOrder: [
    'summary',
    'education',
    'internships',
    'projects',
    'skills',
    'achievements',
    'certifications',
    'participations',
    'leadership'
  ]
};

// Active Attendance Sessions (Initial default active demo session for instant testing!)
const createInitialSession = (): AttendanceSession => {
  const now = new Date();
  // Active for 3 minutes from load
  const expiry = new Date(now.getTime() + 180 * 1000);
  const code = '583214'; // Matching example in prompt!
  return {
    id: 'sess_dbms_demo',
    subjectId: 'sub_dbms',
    subjectName: 'Database Management Systems (DBMS)',
    subjectCode: 'CS601',
    classSection: 'CSE 3rd Year',
    code,
    qrCodeData: JSON.stringify({
      sessionId: 'sess_dbms_demo',
      code,
      subject: 'DBMS',
      class: 'CSE 3rd Year',
      expiresAt: expiry.toISOString()
    }),
    startTime: now.toISOString(),
    expiryTime: expiry.toISOString(),
    durationSeconds: 180,
    isActive: true,
    collegeLatitude: DEFAULT_GEOFENCE.latitude,
    collegeLongitude: DEFAULT_GEOFENCE.longitude,
    allowedRadiusMeters: DEFAULT_GEOFENCE.allowedRadiusMeters,
    createdBy: 'fac_1'
  };
};

const STORAGE_KEYS = {
  CURRENT_USER: 'campuslife_current_user',
  USERS: 'campuslife_users',
  SUBJECTS: 'campuslife_subjects',
  ATTENDANCE_STATE: 'campuslife_student_attendance',
  ATTENDANCE_SESSIONS: 'campuslife_attendance_sessions',
  ATTENDANCE_RECORDS: 'campuslife_attendance_records',
  ASSIGNMENTS: 'campuslife_assignments',
  EXAMS: 'campuslife_exams',
  NOTICES: 'campuslife_notices',
  EVENTS: 'campuslife_events',
  ACHIEVEMENTS: 'campuslife_achievements',
  PARTICIPATIONS: 'campuslife_participations',
  PROJECTS: 'campuslife_projects',
  CERTIFICATIONS: 'campuslife_certifications',
  INTERNSHIPS: 'campuslife_internships',
  RESUME_SETTINGS: 'campuslife_resume_settings',
  GEOFENCE: 'campuslife_geofence',
  CHAT_MESSAGES: 'campuslife_chat_messages',
  DATA_REPORTS: 'campuslife_data_reports',
  FACULTY_ATTENDANCE: 'campuslife_faculty_attendance',
  ASSIGNMENT_SUBMISSIONS: 'campuslife_assignment_submissions'
};

const INITIAL_FACULTY_ATTENDANCE: FacultyAttendanceRecord[] = [
  {
    id: 'fac_att_1',
    facultyId: 'fac_1',
    facultyName: 'Dr. Rajesh Sharma',
    department: 'Computer Science & Engineering',
    date: new Date().toISOString().split('T')[0],
    checkInTime: '08:45 AM',
    status: 'present',
    dutyLocation: 'CS Block, Room 304 / Lab 3',
    remarks: 'Morning lecture CS601 & academic advising hours completed.',
    verifiedByDean: true
  },
  {
    id: 'fac_att_2',
    facultyId: 'fac_1',
    facultyName: 'Dr. Rajesh Sharma',
    department: 'Computer Science & Engineering',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    checkInTime: '09:00 AM',
    checkOutTime: '05:15 PM',
    status: 'present',
    dutyLocation: 'CS Block, Room 304',
    remarks: 'Department meeting & lab evaluations conducted.',
    verifiedByDean: true
  }
];

class DataService {
  private get<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return fallback;
      return JSON.parse(item);
    } catch {
      return fallback;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage write error:', e);
    }
  }

  constructor() {
    this.initStorage();
  }

  public initStorage(forceReset = false): void {
    if (forceReset || !localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.set(STORAGE_KEYS.USERS, INITIAL_USERS);
      if (forceReset) {
        this.setCurrentUser(null);
      }
      this.set(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
      this.set(STORAGE_KEYS.ATTENDANCE_STATE, INITIAL_STUDENT_ATTENDANCE);
      this.set(STORAGE_KEYS.ATTENDANCE_SESSIONS, [createInitialSession()]);
      this.set(STORAGE_KEYS.ATTENDANCE_RECORDS, [
        {
          id: 'rec_init_1',
          sessionId: 'sess_prev',
          studentId: 'stu_1',
          studentName: 'Aarav Sharma',
          subjectId: 'sub_dbms',
          subjectName: 'Database Management Systems (DBMS)',
          markedAt: new Date(Date.now() - 86400000).toISOString(),
          status: 'present',
          distanceMeters: 45,
          verificationMethod: 'code',
          isVerified: true
        }
      ]);
      this.set(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
      this.set(STORAGE_KEYS.EXAMS, INITIAL_EXAMS);
      this.set(STORAGE_KEYS.NOTICES, INITIAL_NOTICES);
      this.set(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
      this.set(STORAGE_KEYS.ACHIEVEMENTS, INITIAL_ACHIEVEMENTS);
      this.set(STORAGE_KEYS.PARTICIPATIONS, INITIAL_PARTICIPATIONS);
      this.set(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
      this.set(STORAGE_KEYS.CERTIFICATIONS, INITIAL_CERTIFICATIONS);
      this.set(STORAGE_KEYS.INTERNSHIPS, INITIAL_INTERNSHIPS);
      this.set(STORAGE_KEYS.RESUME_SETTINGS, DEFAULT_RESUME_SETTINGS);
      this.set(STORAGE_KEYS.GEOFENCE, DEFAULT_GEOFENCE);
      this.set(STORAGE_KEYS.DATA_REPORTS, INITIAL_DATA_REPORTS);
      this.set(STORAGE_KEYS.FACULTY_ATTENDANCE, INITIAL_FACULTY_ATTENDANCE);
      this.set(STORAGE_KEYS.ASSIGNMENT_SUBMISSIONS, INITIAL_ASSIGNMENT_SUBMISSIONS);
    } else {
      // Ensure current seed updates for chatbot verification are present
      const storedAssignments = this.get<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, []);
      if (!storedAssignments.some(a => a.id === 'asg_today')) {
        this.set(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
      }
      const storedEvents = this.get<EventItem[]>(STORAGE_KEYS.EVENTS, []);
      if (!storedEvents.some(e => e.id === 'evt_today')) {
        this.set(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
      }
      if (!localStorage.getItem(STORAGE_KEYS.DATA_REPORTS)) {
        this.set(STORAGE_KEYS.DATA_REPORTS, INITIAL_DATA_REPORTS);
      }
      if (!localStorage.getItem(STORAGE_KEYS.INTERNSHIPS)) {
        this.set(STORAGE_KEYS.INTERNSHIPS, INITIAL_INTERNSHIPS);
      }
      if (!localStorage.getItem(STORAGE_KEYS.RESUME_SETTINGS)) {
        this.set(STORAGE_KEYS.RESUME_SETTINGS, DEFAULT_RESUME_SETTINGS);
      }
      if (!localStorage.getItem(STORAGE_KEYS.FACULTY_ATTENDANCE)) {
        this.set(STORAGE_KEYS.FACULTY_ATTENDANCE, INITIAL_FACULTY_ATTENDANCE);
      }
      if (!localStorage.getItem(STORAGE_KEYS.ASSIGNMENT_SUBMISSIONS)) {
        this.set(STORAGE_KEYS.ASSIGNMENT_SUBMISSIONS, INITIAL_ASSIGNMENT_SUBMISSIONS);
      }
      // Ensure Dean and Admin roles are properly initialized as separate accounts with enriched profile fields
      const storedUsers = this.get<User[]>(STORAGE_KEYS.USERS, []);
      const hasDean = storedUsers.some(u => u.role === 'dean');
      const hasSeparateAdmin = storedUsers.some(u => u.role === 'admin' && u.id === 'admin_1');
      if (!hasDean || !hasSeparateAdmin) {
        this.set(STORAGE_KEYS.USERS, INITIAL_USERS);
      } else {
        // Merge missing role-specific fields (e.g., employeeId, designation, responsibilities)
        let needsUserUpdate = false;
        const updatedUsers = storedUsers.map(user => {
          const defaultUser = INITIAL_USERS.find(u => u.id === user.id);
          if (defaultUser) {
            let modified = false;
            const merged = { ...user };
            for (const key of Object.keys(defaultUser) as (keyof User)[]) {
              if (merged[key] === undefined) {
                (merged as any)[key] = defaultUser[key];
                modified = true;
              }
            }
            if (modified) {
              needsUserUpdate = true;
              return merged;
            }
          }
          return user;
        });
        if (needsUserUpdate) {
          this.set(STORAGE_KEYS.USERS, updatedUsers);
          const curUser = this.getCurrentUser();
          if (curUser) {
            const updatedCur = updatedUsers.find(u => u.id === curUser.id);
            if (updatedCur) {
              this.setCurrentUser(updatedCur);
            }
          }
        }
      }
    }
  }

  // --- USER / AUTH ---
  public getCurrentUser(): User | null {
    return this.get<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  }

  public setCurrentUser(user: User | null): void {
    if (user) {
      this.set(STORAGE_KEYS.CURRENT_USER, user);
    } else {
      try {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      } catch (e) {
        console.warn(e);
      }
    }
  }

  public getAllUsers(): User[] {
    return this.get<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  public getUserById(id: string): User | undefined {
    return this.getAllUsers().find(u => u.id === id);
  }

  public authenticate(
    identifier: string,
    _password?: string,
    requiredRole?: UserRole
  ): { success: boolean; user?: User; error?: string } {
    const trimmed = identifier.trim().toLowerCase();
    if (!trimmed) {
      return { success: false, error: 'Please enter your institutional credentials.' };
    }
    const users = this.getAllUsers();

    const matched = users.find(u => {
      // Check email match
      if (u.email.toLowerCase() === trimmed) return true;
      // Check studentId match
      if (u.studentId && u.studentId.toLowerCase() === trimmed) return true;
      // Check user ID match
      if (u.id.toLowerCase() === trimmed) return true;
      // Role-specific aliases
      if (u.role === 'faculty' && (trimmed === 'fac-cs-01' || trimmed === 'rajesh.sharma@campuslife.edu' || trimmed === 'rajesh')) return true;
      if (u.role === 'dean' && (trimmed === 'dean' || trimmed === 'dean.academics@campuslife.edu' || trimmed === 'sunita.rao@campuslife.edu')) return true;
      if (u.role === 'admin' && (trimmed === 'admin' || trimmed === 'sysadmin@campuslife.edu' || trimmed === 'vikram.malhotra@campuslife.edu' || trimmed === 'adm-01')) return true;
      // Check email username prefix
      if (u.email.toLowerCase().split('@')[0] === trimmed) return true;
      return false;
    });

    if (!matched) {
      return {
        success: false,
        error: 'No account found matching these credentials. Please check your entered identifier.'
      };
    }

    // STRICT ROLE VERIFICATION:
    // If a user selects DEAN but enters credentials for an ADMIN account (or vice versa), reject with clear error.
    if (requiredRole && matched.role !== requiredRole) {
      const roleNameMap: Record<UserRole, string> = {
        student: 'Student',
        faculty: 'Faculty',
        dean: 'Dean',
        admin: 'Admin'
      };
      const actualRoleName = roleNameMap[matched.role];
      const selectedRoleName = roleNameMap[requiredRole];

      return {
        success: false,
        error: `Role Mismatch: The account for "${matched.name}" is registered as ${actualRoleName}, not ${selectedRoleName}. Please return to the role selection screen and choose "${actualRoleName}".`
      };
    }

    this.setCurrentUser(matched);
    return { success: true, user: matched };
  }

  public logoutUser(): void {
    this.setCurrentUser(null);
  }

  public switchUserById(id: string): User {
    const users = this.getAllUsers();
    const user = users.find(u => u.id === id) || users[0];
    this.setCurrentUser(user);
    return user;
  }

  public updateUserProfile(userId: string, updates: Partial<User>): User {
    const users = this.getAllUsers();
    let updatedUser: User | null = null;
    const nextUsers = users.map(u => {
      if (u.id === userId) {
        updatedUser = { ...u, ...updates };
        return updatedUser;
      }
      return u;
    });

    if (updatedUser) {
      this.set(STORAGE_KEYS.USERS, nextUsers);
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        this.setCurrentUser(updatedUser);
      }
      return updatedUser;
    }
    return updates as User;
  }

  public getGeofence(): GeofenceConfig {
    return this.get<GeofenceConfig>(STORAGE_KEYS.GEOFENCE, DEFAULT_GEOFENCE);
  }

  public updateGeofence(config: GeofenceConfig): GeofenceConfig {
    const validatedRadius = Math.max(20, Number(config.allowedRadiusMeters) || 20);
    const updated: GeofenceConfig = {
      ...config,
      allowedRadiusMeters: validatedRadius
    };
    this.set(STORAGE_KEYS.GEOFENCE, updated);

    // Also update all active sessions so student check-ins immediately inherit the updated geofence radius
    const sessions = this.get<AttendanceSession[]>(STORAGE_KEYS.ATTENDANCE_SESSIONS, []);
    const updatedSessions = sessions.map(s => ({
      ...s,
      allowedRadiusMeters: validatedRadius
    }));
    this.set(STORAGE_KEYS.ATTENDANCE_SESSIONS, updatedSessions);

    return updated;
  }

  // --- ATTENDANCE SYSTEM ---
  public getActiveSessions(): AttendanceSession[] {
    const sessions = this.get<AttendanceSession[]>(STORAGE_KEYS.ATTENDANCE_SESSIONS, []);
    const now = new Date().getTime();
    // Return sessions that haven't expired or marked inactive
    const mapped = sessions.map(s => {
      const isExpired = new Date(s.expiryTime).getTime() < now;
      if (isExpired && s.isActive) {
        s.isActive = false;
      }
      return s;
    });

    // If no active session exists at all on initialization, seed a 10-minute demo session
    const hasActive = mapped.some(s => s.isActive && new Date(s.expiryTime).getTime() > now);
    if (!hasActive && sessions.length === 0) {
      const initial = this.startDemoFacultySession(600);
      return [initial];
    }

    return mapped;
  }

  public startDemoFacultySession(durationSeconds = 600): AttendanceSession {
    const subjects = this.get<Subject[]>(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
    const subject = subjects[0]; // Database Management Systems
    const geofence = this.getGeofence();

    const startTime = new Date();
    const expiryTime = new Date(startTime.getTime() + durationSeconds * 1000);
    const code = '583214';
    const sessionId = 'sess_demo_' + Date.now();

    const session: AttendanceSession = {
      id: sessionId,
      subjectId: subject.id,
      subjectName: subject.name,
      subjectCode: subject.code,
      classSection: 'CSE 3rd Year',
      code,
      qrCodeData: JSON.stringify({
        sessionId,
        code,
        subjectId: subject.id,
        subjectName: subject.name,
        classSection: 'CSE 3rd Year',
        expiresAt: expiryTime.toISOString()
      }),
      startTime: startTime.toISOString(),
      expiryTime: expiryTime.toISOString(),
      durationSeconds,
      isActive: true,
      collegeLatitude: geofence.latitude,
      collegeLongitude: geofence.longitude,
      allowedRadiusMeters: geofence.allowedRadiusMeters,
      createdBy: 'fac_1'
    };

    const sessions = this.get<AttendanceSession[]>(STORAGE_KEYS.ATTENDANCE_SESSIONS, []);
    // Deactivate older sessions
    const updated = sessions.map(s => ({ ...s, isActive: false }));
    updated.unshift(session);
    this.set(STORAGE_KEYS.ATTENDANCE_SESSIONS, updated);
    return session;
  }

  public startAttendanceSession(
    subjectId: string,
    classSection: string,
    durationSeconds = 180
  ): AttendanceSession {
    const subjects = this.get<Subject[]>(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
    const subject = subjects.find(s => s.id === subjectId) || subjects[0];
    const geofence = this.getGeofence();
    const currentUser = this.getCurrentUser();

    // Enforce role isolation: Admin cannot initiate classroom student attendance sessions
    if (currentUser?.role === 'admin') {
      throw new Error('Unauthorized: Admin role does not have permission to initiate or manage student attendance sessions.');
    }

    const startTime = new Date();
    const expiryTime = new Date(startTime.getTime() + durationSeconds * 1000);
    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const sessionId = 'sess_' + Date.now();

    const session: AttendanceSession = {
      id: sessionId,
      subjectId: subject.id,
      subjectName: subject.name,
      subjectCode: subject.code,
      classSection,
      code,
      qrCodeData: JSON.stringify({
        sessionId,
        code,
        subjectId: subject.id,
        subjectName: subject.name,
        classSection,
        expiresAt: expiryTime.toISOString()
      }),
      startTime: startTime.toISOString(),
      expiryTime: expiryTime.toISOString(),
      durationSeconds,
      isActive: true,
      collegeLatitude: geofence.latitude,
      collegeLongitude: geofence.longitude,
      allowedRadiusMeters: geofence.allowedRadiusMeters,
      createdBy: currentUser ? currentUser.id : 'fac_1'
    };

    const sessions = this.get<AttendanceSession[]>(STORAGE_KEYS.ATTENDANCE_SESSIONS, []);
    sessions.unshift(session);
    this.set(STORAGE_KEYS.ATTENDANCE_SESSIONS, sessions);
    return session;
  }

  public endAttendanceSession(sessionId: string): void {
    const sessions = this.get<AttendanceSession[]>(STORAGE_KEYS.ATTENDANCE_SESSIONS, []);
    const updated = sessions.map(s => s.id === sessionId ? { ...s, isActive: false } : s);
    this.set(STORAGE_KEYS.ATTENDANCE_SESSIONS, updated);
  }

  /**
   * Student Marks Attendance:
   * 1. Validates session existence
   * 2. Checks active & non-expired code
   * 3. Checks single submission per student
   * 4. Evaluates Geolocation using Haversine against campus geofence
   * 5. Updates student subject present count, total count, updates percentage
   */
  public markStudentAttendance(
    student: User,
    code: string,
    studentCoords: { latitude: number; longitude: number },
    verificationMethod: 'code' | 'qr' = 'code'
  ): {
    success: boolean;
    locationStatus: 'Location Verified ✓' | 'Outside Allowed Area ✕';
    message: string;
    distanceMeters: number;
    record?: AttendanceRecord;
    updatedPercentage?: number;
  } {
    if (student.role !== 'student') {
      return {
        success: false,
        locationStatus: 'Outside Allowed Area ✕',
        message: 'Unauthorized: Only registered students can submit classroom attendance.',
        distanceMeters: 0
      };
    }

    const cleanCode = code.trim();
    const sessions = this.getActiveSessions();
    const now = new Date().getTime();

    // Find session by 6-digit code
    const session = sessions.find(s => s.code === cleanCode);

    if (!session) {
      return {
        success: false,
        locationStatus: 'Outside Allowed Area ✕',
        message: 'Invalid attendance code. Please check with your faculty.',
        distanceMeters: 0
      };
    }

    // Check expiry
    const expiry = new Date(session.expiryTime).getTime();
    if (now > expiry || !session.isActive) {
      return {
        success: false,
        locationStatus: 'Outside Allowed Area ✕',
        message: 'This attendance session has expired. You cannot mark attendance against an expired or non-existent session.',
        distanceMeters: 0
      };
    }

    // Check duplicate
    const records = this.get<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE_RECORDS, []);
    const alreadyMarked = records.find(r => r.sessionId === session.id && r.studentId === student.id);
    if (alreadyMarked) {
      return {
        success: false,
        locationStatus: 'Location Verified ✓',
        message: 'You have already marked attendance for this session. Duplicate submissions are prevented.',
        distanceMeters: alreadyMarked.distanceMeters
      };
    }

    // Geofence check using Haversine formula
    const { isInside, distanceMeters } = verifyGeofence(
      studentCoords.latitude,
      studentCoords.longitude,
      session.collegeLatitude,
      session.collegeLongitude,
      session.allowedRadiusMeters
    );

    if (!isInside) {
      return {
        success: false,
        locationStatus: 'Outside Allowed Area ✕',
        message: 'Outside Allowed Area ✕: Location verification failed because you are outside the permitted college geofence.',
        distanceMeters
      };
    }

    // Record verified attendance
    const record: AttendanceRecord = {
      id: 'rec_' + Date.now(),
      sessionId: session.id,
      studentId: student.id,
      studentName: student.name,
      subjectId: session.subjectId,
      subjectName: session.subjectName,
      markedAt: new Date().toISOString(),
      status: 'present',
      distanceMeters,
      verificationMethod,
      isVerified: true
    };

    records.unshift(record);
    this.set(STORAGE_KEYS.ATTENDANCE_RECORDS, records);

    // Update student subject attendance metrics
    const attendanceState = this.get<Record<string, Record<string, { present: number; total: number }>>>(
      STORAGE_KEYS.ATTENDANCE_STATE,
      INITIAL_STUDENT_ATTENDANCE
    );

    if (!attendanceState[student.id]) {
      attendanceState[student.id] = {
        sub_dbms: { present: 36, total: 42 },
        sub_os: { present: 28, total: 38 },
        sub_cn: { present: 33, total: 40 },
        sub_daa: { present: 28, total: 36 },
        sub_ai: { present: 24, total: 34 }
      };
    }

    const studentMap = attendanceState[student.id];
    if (!studentMap[session.subjectId]) {
      studentMap[session.subjectId] = { present: 1, total: 1 };
    } else {
      studentMap[session.subjectId].present += 1;
      studentMap[session.subjectId].total += 1;
    }

    this.set(STORAGE_KEYS.ATTENDANCE_STATE, attendanceState);

    const analytics = this.getStudentAttendanceAnalytics(student.id);

    return {
      success: true,
      locationStatus: 'Location Verified ✓',
      message: 'Attendance Marked Successfully ✓',
      distanceMeters,
      record,
      updatedPercentage: analytics.overallPercentage
    };
  }

  // --- ATTENDANCE DASHBOARD ANALYTICS ---
  public getStudentAttendanceAnalytics(studentId: string, callerRole?: string): AttendanceAnalytics {
    // ENFORCE ADMIN ROLE ISOLATION: Admin role has NO access to individual student attendance records/analytics
    if (callerRole === 'admin') {
      return {
        overallPercentage: 0,
        totalPresent: 0,
        totalClasses: 0,
        totalAbsent: 0,
        isWarning: false,
        classesNeededFor75: 0,
        subjectWise: [],
        recentRecords: []
      };
    }

    const student = this.getUserById(studentId);
    // Dynamic academic filtering: retrieve only subjects corresponding to student's program/branch
    const subjects = this.getSubjects(student || undefined);
    const attendanceState = this.get<Record<string, Record<string, { present: number; total: number }>>>(
      STORAGE_KEYS.ATTENDANCE_STATE,
      INITIAL_STUDENT_ATTENDANCE
    );
    const allRecords = this.get<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE_RECORDS, []);
    const studentRecords = allRecords.filter(r => r.studentId === studentId);

    const studentMap = attendanceState[studentId] || INITIAL_STUDENT_ATTENDANCE.stu_1;

    let grandTotalPresent = 0;
    let grandTotalClasses = 0;

    const subjectWise = subjects.map(sub => {
      const stats = studentMap[sub.id] || { present: 0, total: 0 };
      grandTotalPresent += stats.present;
      grandTotalClasses += stats.total;
      const pct = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 100;
      let status: 'good' | 'warning' | 'critical' = 'good';
      if (pct < 65) status = 'critical';
      else if (pct < 75) status = 'warning';

      return {
        subjectId: sub.id,
        subjectCode: sub.code,
        subjectName: sub.name,
        presentClasses: stats.present,
        totalClasses: stats.total,
        percentage: pct,
        status
      };
    });

    const overallPercentage = grandTotalClasses > 0
      ? Math.round((grandTotalPresent / grandTotalClasses) * 100)
      : 100;

    const isWarning = overallPercentage < 75;

    // Formula for classes needed to reach 75%:
    // (present + x) / (total + x) >= 0.75
    // x >= 3 * total - 4 * present
    let classesNeededFor75 = 0;
    if (isWarning) {
      const required = Math.ceil(3 * grandTotalClasses - 4 * grandTotalPresent);
      classesNeededFor75 = Math.max(0, required);
    }

    const totalAbsent = Math.max(0, grandTotalClasses - grandTotalPresent);

    return {
      overallPercentage,
      totalPresent: grandTotalPresent,
      totalClasses: grandTotalClasses,
      totalAbsent,
      isWarning,
      classesNeededFor75,
      subjectWise,
      recentRecords: studentRecords.slice(0, 10)
    };
  }

  public getSessionAttendanceCount(sessionId: string): number {
    const records = this.get<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE_RECORDS, []);
    return records.filter(r => r.sessionId === sessionId).length;
  }

  public getAttendanceRecordsForSession(sessionId: string): AttendanceRecord[] {
    const records = this.get<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE_RECORDS, []);
    return records.filter(r => r.sessionId === sessionId);
  }

  // --- B. FACULTY ATTENDANCE (Completely separate from Student Attendance) ---
  public getFacultyAttendanceRecords(facultyId?: string): FacultyAttendanceRecord[] {
    const records = this.get<FacultyAttendanceRecord[]>(STORAGE_KEYS.FACULTY_ATTENDANCE, INITIAL_FACULTY_ATTENDANCE);
    if (facultyId) {
      return records.filter(r => r.facultyId === facultyId);
    }
    return records;
  }

  public markFacultyAttendance(data: {
    facultyId: string;
    facultyName: string;
    department: string;
    status: 'present' | 'on_duty' | 'leave';
    dutyLocation: string;
    remarks?: string;
  }): FacultyAttendanceRecord {
    const records = this.getFacultyAttendanceRecords();
    const newRecord: FacultyAttendanceRecord = {
      id: `fac_att_${Date.now()}`,
      facultyId: data.facultyId,
      facultyName: data.facultyName,
      department: data.department,
      date: new Date().toISOString().split('T')[0],
      checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: data.status,
      dutyLocation: data.dutyLocation,
      remarks: data.remarks,
      verifiedByDean: false
    };
    const updated = [newRecord, ...records];
    this.set(STORAGE_KEYS.FACULTY_ATTENDANCE, updated);
    return newRecord;
  }

  public verifyFacultyAttendance(recordId: string): void {
    const records = this.getFacultyAttendanceRecords();
    const updated = records.map(r => (r.id === recordId ? { ...r, verifiedByDean: true } : r));
    this.set(STORAGE_KEYS.FACULTY_ATTENDANCE, updated);
  }

  // --- ACADEMICS ---
  public getAssignments(filter?: AcademicTarget | User): Assignment[] {
    const all = this.get<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
    const submissions = this.get<AssignmentSubmission[]>(STORAGE_KEYS.ASSIGNMENT_SUBMISSIONS, INITIAL_ASSIGNMENT_SUBMISSIONS);
    
    // Determine student ID if filter represents a student
    const isStudentUser = filter && 'role' in filter && filter.role === 'student';
    const studentId = isStudentUser ? (filter as User).id : undefined;

    let targetAssignments = all;
    if (filter) {
      targetAssignments = all.filter(a => matchesStudentAcademicGroup(a, filter));
    }

    return targetAssignments.map(a => {
      const assignmentSubmissions = submissions.filter(s => s.assignmentId === a.id);
      const studentSub = studentId ? assignmentSubmissions.find(s => s.studentId === studentId) : undefined;
      
      if (studentId) {
        return {
          ...a,
          submissionsCount: assignmentSubmissions.length,
          isSubmitted: !!studentSub,
          submittedAt: studentSub?.submittedAt,
          submissionStatus: (studentSub ? 'submitted' : 'pending') as any,
          mySubmission: studentSub
        };
      }

      return {
        ...a,
        submissionsCount: assignmentSubmissions.length
      };
    });
  }

  public getAssignmentSubmissions(assignmentId?: string, studentId?: string): AssignmentSubmission[] {
    const all = this.get<AssignmentSubmission[]>(STORAGE_KEYS.ASSIGNMENT_SUBMISSIONS, INITIAL_ASSIGNMENT_SUBMISSIONS);
    return all.filter(s => {
      if (assignmentId && s.assignmentId !== assignmentId) return false;
      if (studentId && s.studentId !== studentId) return false;
      return true;
    });
  }

  public submitAssignmentWithFile(
    assignmentId: string,
    student: User,
    fileDetails: {
      fileName: string;
      fileSize: string;
      fileType?: string;
      fileData?: string;
      comment?: string;
    }
  ): AssignmentSubmission {
    // 5. PDF must be the required submission format.
    // Accept ONLY .pdf files. Reject other formats such as .jpg, .png, .doc, .docx, .zip, etc.
    const lowerName = (fileDetails.fileName || '').trim().toLowerCase();
    const isPdf = lowerName.endsWith('.pdf') || fileDetails.fileType === 'application/pdf';
    if (!isPdf) {
      throw new Error('Invalid file format. Only .pdf files are accepted for assignment submission.');
    }

    const submissions = this.get<AssignmentSubmission[]>(STORAGE_KEYS.ASSIGNMENT_SUBMISSIONS, INITIAL_ASSIGNMENT_SUBMISSIONS);
    const existingIdx = submissions.findIndex(s => s.assignmentId === assignmentId && s.studentId === student.id);

    const submissionRecord: AssignmentSubmission = {
      id: existingIdx >= 0 ? submissions[existingIdx].id : `subm_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      assignmentId,
      studentId: student.id,
      studentName: student.name,
      studentRoll: student.studentId || student.employeeId || student.id,
      submittedAt: new Date().toISOString(),
      fileName: fileDetails.fileName,
      fileSize: fileDetails.fileSize,
      fileType: 'application/pdf',
      fileData: fileDetails.fileData,
      comment: fileDetails.comment?.trim(),
      status: 'submitted'
    };

    if (existingIdx >= 0) {
      submissions[existingIdx] = submissionRecord;
    } else {
      submissions.unshift(submissionRecord);
    }
    this.set(STORAGE_KEYS.ASSIGNMENT_SUBMISSIONS, submissions);

    // Also update assignment record in STORAGE_KEYS.ASSIGNMENTS
    const assignments = this.get<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
    const updatedAssignments = assignments.map(a => {
      if (a.id === assignmentId) {
        const asgSubs = submissions.filter(s => s.assignmentId === a.id);
        return {
          ...a,
          isSubmitted: true,
          submittedAt: submissionRecord.submittedAt,
          submissionStatus: 'submitted' as const,
          submissionsCount: asgSubs.length,
          mySubmission: submissionRecord
        };
      }
      return a;
    });
    this.set(STORAGE_KEYS.ASSIGNMENTS, updatedAssignments);

    return submissionRecord;
  }

  public addAssignment(data: Omit<Assignment, 'id' | 'createdAt' | 'submissionsCount'>): Assignment {
    const assignments = this.getAssignments();
    const newAsg: Assignment = {
      ...data,
      id: 'asg_' + Date.now(),
      createdAt: new Date().toISOString(),
      submissionsCount: 0,
      isSubmitted: false,
      submissionStatus: 'pending'
    };
    assignments.unshift(newAsg);
    this.set(STORAGE_KEYS.ASSIGNMENTS, assignments);
    return newAsg;
  }

  public createAssignment(data: Omit<Assignment, 'id' | 'createdAt' | 'submissionsCount'>): Assignment {
    return this.addAssignment(data);
  }

  public deleteAssignment(id: string): void {
    const assignments = this.getAssignments().filter(a => a.id !== id);
    this.set(STORAGE_KEYS.ASSIGNMENTS, assignments);
    // Also remove any submissions associated with this assignment
    const submissions = this.get<AssignmentSubmission[]>(STORAGE_KEYS.ASSIGNMENT_SUBMISSIONS, INITIAL_ASSIGNMENT_SUBMISSIONS);
    this.set(STORAGE_KEYS.ASSIGNMENT_SUBMISSIONS, submissions.filter(s => s.assignmentId !== id));
  }

  public toggleAssignmentSubmission(assignmentId: string, isSubmitted: boolean, studentId?: string): void {
    const submissions = this.get<AssignmentSubmission[]>(STORAGE_KEYS.ASSIGNMENT_SUBMISSIONS, INITIAL_ASSIGNMENT_SUBMISSIONS);
    if (!isSubmitted) {
      const filteredSubmissions = studentId 
        ? submissions.filter(s => !(s.assignmentId === assignmentId && s.studentId === studentId))
        : submissions.filter(s => s.assignmentId !== assignmentId);
      this.set(STORAGE_KEYS.ASSIGNMENT_SUBMISSIONS, filteredSubmissions);
    }
    const assignments = this.get<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
    const updated = assignments.map(a => {
      if (a.id === assignmentId) {
        const asgSubs = this.get<AssignmentSubmission[]>(STORAGE_KEYS.ASSIGNMENT_SUBMISSIONS, INITIAL_ASSIGNMENT_SUBMISSIONS).filter(s => s.assignmentId === a.id);
        return {
          ...a,
          isSubmitted,
          submittedAt: isSubmitted ? new Date().toISOString() : undefined,
          submissionStatus: (isSubmitted ? 'submitted' : 'pending') as any,
          submissionsCount: asgSubs.length,
          mySubmission: isSubmitted ? a.mySubmission : undefined
        };
      }
      return a;
    });
    this.set(STORAGE_KEYS.ASSIGNMENTS, updated);
  }

  public submitAssignment(assignmentId: string): void {
    this.toggleAssignmentSubmission(assignmentId, true);
  }

  public getExams(filter?: AcademicTarget | User): Exam[] {
    const all = this.get<Exam[]>(STORAGE_KEYS.EXAMS, INITIAL_EXAMS);
    if (!filter) return all;
    return all.filter(e => matchesStudentAcademicGroup(e, filter));
  }

  public addExam(exam: Omit<Exam, 'id'>): Exam {
    const exams = this.getExams();
    const newExam: Exam = { ...exam, id: 'ex_' + Date.now() };
    exams.push(newExam);
    this.set(STORAGE_KEYS.EXAMS, exams);
    return newExam;
  }

  public createExam(exam: Omit<Exam, 'id'>): Exam {
    return this.addExam(exam);
  }

  public deleteExam(id: string): void {
    const exams = this.getExams().filter(e => e.id !== id);
    this.set(STORAGE_KEYS.EXAMS, exams);
  }

  public getNotices(): Notice[] {
    return this.get<Notice[]>(STORAGE_KEYS.NOTICES, INITIAL_NOTICES);
  }

  public addNotice(notice: Omit<Notice, 'id' | 'publishedAt'>): Notice {
    const notices = this.getNotices();
    const newNotice: Notice = {
      ...notice,
      id: 'not_' + Date.now(),
      publishedAt: new Date().toISOString()
    };
    notices.unshift(newNotice);
    this.set(STORAGE_KEYS.NOTICES, notices);
    return newNotice;
  }

  public broadcastNotice(notice: Omit<Notice, 'id' | 'publishedAt'>): Notice {
    return this.addNotice(notice);
  }

  public deleteNotice(id: string): void {
    const notices = this.getNotices().filter(n => n.id !== id);
    this.set(STORAGE_KEYS.NOTICES, notices);
  }

  public getEvents(): EventItem[] {
    return this.get<EventItem[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
  }

  public addEvent(event: Omit<EventItem, 'id' | 'rsvpCount'>): EventItem {
    const events = this.getEvents();
    const newEvent: EventItem = {
      ...event,
      id: 'evt_' + Date.now(),
      rsvpCount: 0,
      isRegistered: false
    };
    events.push(newEvent);
    this.set(STORAGE_KEYS.EVENTS, events);
    return newEvent;
  }

  public createEvent(event: Omit<EventItem, 'id' | 'rsvpCount'>): EventItem {
    return this.addEvent(event);
  }

  public deleteEvent(id: string): void {
    const events = this.getEvents().filter(e => e.id !== id);
    this.set(STORAGE_KEYS.EVENTS, events);
  }

  public toggleEventRSVP(eventId: string): void {
    const events = this.getEvents().map(e => {
      if (e.id === eventId) {
        const next = !e.isRegistered;
        return {
          ...e,
          isRegistered: next,
          rsvpCount: next ? e.rsvpCount + 1 : Math.max(0, e.rsvpCount - 1)
        };
      }
      return e;
    });
    this.set(STORAGE_KEYS.EVENTS, events);
  }

  // --- MY JOURNEY PROFILE & RESUME BUILDER ---
  public getAchievements(studentId?: string): Achievement[] {
    const raw = this.get<Achievement[]>(STORAGE_KEYS.ACHIEVEMENTS, INITIAL_ACHIEVEMENTS);
    const normalized = raw.map((a, idx) => ({
      ...a,
      showOnResume: a.showOnResume !== undefined ? a.showOnResume : true,
      resumeOrder: a.resumeOrder !== undefined ? a.resumeOrder : idx + 1,
      verificationStatus: (a.verificationStatus === 'verified' ? 'verified_institution' : a.verificationStatus === 'pending' ? 'pending_verification' : a.verificationStatus || 'self_reported') as VerificationStatus,
      organizationType: a.organizationType || (a.category === 'Academic' || a.category === 'Sports' ? 'college_organized' : 'external_organization')
    }));
    return studentId ? normalized.filter(a => a.studentId === studentId) : normalized;
  }

  public getParticipations(studentId?: string): Participation[] {
    const raw = this.get<Participation[]>(STORAGE_KEYS.PARTICIPATIONS, INITIAL_PARTICIPATIONS);
    const normalized = raw.map((p, idx) => ({
      ...p,
      showOnResume: p.showOnResume !== undefined ? p.showOnResume : true,
      resumeOrder: p.resumeOrder !== undefined ? p.resumeOrder : idx + 1,
      verificationStatus: (p.verificationStatus === 'verified' ? 'verified_institution' : p.verificationStatus === 'pending' ? 'pending_verification' : p.verificationStatus || 'self_reported') as VerificationStatus,
      organizationType: p.organizationType || (p.category === 'Fest' || p.category === 'NCC/NSS' ? 'college_organized' : 'external_organization')
    }));
    return studentId ? normalized.filter(p => p.studentId === studentId) : normalized;
  }

  public getProjects(studentId?: string): Project[] {
    const raw = this.get<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    const normalized = raw.map((proj, idx) => ({
      ...proj,
      showOnResume: proj.showOnResume !== undefined ? proj.showOnResume : true,
      resumeOrder: proj.resumeOrder !== undefined ? proj.resumeOrder : idx + 1,
      verificationStatus: (proj.verificationStatus === 'verified' ? 'verified_institution' : proj.verificationStatus || 'self_reported') as VerificationStatus,
      organizationType: proj.organizationType || 'independent_participation'
    }));
    return studentId ? normalized.filter(p => p.studentId === studentId) : normalized;
  }

  public getCertifications(studentId?: string): Certification[] {
    const raw = this.get<Certification[]>(STORAGE_KEYS.CERTIFICATIONS, INITIAL_CERTIFICATIONS);
    const normalized = raw.map((cert, idx) => ({
      ...cert,
      showOnResume: cert.showOnResume !== undefined ? cert.showOnResume : true,
      resumeOrder: cert.resumeOrder !== undefined ? cert.resumeOrder : idx + 1,
      verificationStatus: (cert.verificationStatus === 'verified' ? 'verified_external' : cert.verificationStatus || 'verified_external') as VerificationStatus,
      organizationType: cert.organizationType || 'external_organization'
    }));
    return studentId ? normalized.filter(c => c.studentId === studentId) : normalized;
  }

  public getInternships(studentId?: string): Internship[] {
    const raw = this.get<Internship[]>(STORAGE_KEYS.INTERNSHIPS, INITIAL_INTERNSHIPS);
    const normalized = raw.map((intern, idx) => ({
      ...intern,
      showOnResume: intern.showOnResume !== undefined ? intern.showOnResume : true,
      resumeOrder: intern.resumeOrder !== undefined ? intern.resumeOrder : idx + 1,
      verificationStatus: (intern.verificationStatus === 'verified' ? 'verified_external' : intern.verificationStatus || 'self_reported') as VerificationStatus,
      organizationType: intern.organizationType || 'external_organization'
    }));
    return studentId ? normalized.filter(i => i.studentId === studentId) : normalized;
  }

  public getResumeSettings(studentId: string = 'stu_1'): StudentResumeSettings {
    const stored = this.get<Record<string, StudentResumeSettings>>(STORAGE_KEYS.RESUME_SETTINGS, {
      [DEFAULT_RESUME_SETTINGS.studentId]: DEFAULT_RESUME_SETTINGS
    });
    if (stored[studentId]) {
      return stored[studentId];
    }
    // If stored as flat StudentResumeSettings object
    if ((stored as unknown as StudentResumeSettings).studentId === studentId) {
      return stored as unknown as StudentResumeSettings;
    }
    return { ...DEFAULT_RESUME_SETTINGS, studentId };
  }

  public saveResumeSettings(studentId: string, updates: Partial<StudentResumeSettings>): StudentResumeSettings {
    const current = this.getResumeSettings(studentId);
    const updated: StudentResumeSettings = {
      ...current,
      ...updates,
      studentId,
      visibleSections: {
        ...current.visibleSections,
        ...(updates.visibleSections || {})
      }
    };
    const allStored = this.get<Record<string, StudentResumeSettings>>(STORAGE_KEYS.RESUME_SETTINGS, {});
    allStored[studentId] = updated;
    this.set(STORAGE_KEYS.RESUME_SETTINGS, allStored);
    return updated;
  }

  public addAchievement(item: Omit<Achievement, 'id'>): Achievement {
    const list = this.getAchievements();
    const newAch: Achievement = {
      ...item,
      id: 'ach_' + Date.now(),
      showOnResume: item.showOnResume !== undefined ? item.showOnResume : true,
      resumeOrder: item.resumeOrder || list.length + 1,
      verificationStatus: item.verificationStatus || 'self_reported'
    };
    list.unshift(newAch);
    this.set(STORAGE_KEYS.ACHIEVEMENTS, list);
    return newAch;
  }

  public updateAchievement(item: Achievement): void {
    const list = this.getAchievements().map(a => (a.id === item.id ? item : a));
    this.set(STORAGE_KEYS.ACHIEVEMENTS, list);
  }

  public deleteAchievement(id: string): void {
    const list = this.getAchievements().filter(a => a.id !== id);
    this.set(STORAGE_KEYS.ACHIEVEMENTS, list);
  }

  public addParticipation(item: Omit<Participation, 'id'>): Participation {
    const list = this.getParticipations();
    const newPart: Participation = {
      ...item,
      id: 'part_' + Date.now(),
      showOnResume: item.showOnResume !== undefined ? item.showOnResume : true,
      resumeOrder: item.resumeOrder || list.length + 1,
      verificationStatus: item.verificationStatus || 'self_reported'
    };
    list.unshift(newPart);
    this.set(STORAGE_KEYS.PARTICIPATIONS, list);
    return newPart;
  }

  public updateParticipation(item: Participation): void {
    const list = this.getParticipations().map(p => (p.id === item.id ? item : p));
    this.set(STORAGE_KEYS.PARTICIPATIONS, list);
  }

  public deleteParticipation(id: string): void {
    const list = this.getParticipations().filter(p => p.id !== id);
    this.set(STORAGE_KEYS.PARTICIPATIONS, list);
  }

  public addProject(item: Omit<Project, 'id'>): Project {
    const list = this.getProjects();
    const newProj: Project = {
      ...item,
      id: 'proj_' + Date.now(),
      showOnResume: item.showOnResume !== undefined ? item.showOnResume : true,
      resumeOrder: item.resumeOrder || list.length + 1,
      verificationStatus: item.verificationStatus || 'self_reported'
    };
    list.unshift(newProj);
    this.set(STORAGE_KEYS.PROJECTS, list);
    return newProj;
  }

  public updateProject(item: Project): void {
    const list = this.getProjects().map(p => (p.id === item.id ? item : p));
    this.set(STORAGE_KEYS.PROJECTS, list);
  }

  public deleteProject(id: string): void {
    const list = this.getProjects().filter(p => p.id !== id);
    this.set(STORAGE_KEYS.PROJECTS, list);
  }

  public addCertification(item: Omit<Certification, 'id'>): Certification {
    const list = this.getCertifications();
    const newCert: Certification = {
      ...item,
      id: 'cert_' + Date.now(),
      showOnResume: item.showOnResume !== undefined ? item.showOnResume : true,
      resumeOrder: item.resumeOrder || list.length + 1,
      verificationStatus: item.verificationStatus || 'verified_external'
    };
    list.unshift(newCert);
    this.set(STORAGE_KEYS.CERTIFICATIONS, list);
    return newCert;
  }

  public updateCertification(item: Certification): void {
    const list = this.getCertifications().map(c => (c.id === item.id ? item : c));
    this.set(STORAGE_KEYS.CERTIFICATIONS, list);
  }

  public deleteCertification(id: string): void {
    const list = this.getCertifications().filter(c => c.id !== id);
    this.set(STORAGE_KEYS.CERTIFICATIONS, list);
  }

  public addInternship(item: Omit<Internship, 'id'>): Internship {
    const list = this.getInternships();
    const newInt: Internship = {
      ...item,
      id: 'int_' + Date.now(),
      showOnResume: item.showOnResume !== undefined ? item.showOnResume : true,
      resumeOrder: item.resumeOrder || list.length + 1,
      verificationStatus: item.verificationStatus || 'verified_external'
    };
    list.unshift(newInt);
    this.set(STORAGE_KEYS.INTERNSHIPS, list);
    return newInt;
  }

  public updateInternship(item: Internship): void {
    const list = this.getInternships().map(i => (i.id === item.id ? item : i));
    this.set(STORAGE_KEYS.INTERNSHIPS, list);
  }

  public deleteInternship(id: string): void {
    const list = this.getInternships().filter(i => i.id !== id);
    this.set(STORAGE_KEYS.INTERNSHIPS, list);
  }

  public toggleResumeItemVisibility(
    type: 'achievement' | 'participation' | 'project' | 'certification' | 'internship',
    id: string,
    show: boolean
  ): void {
    if (type === 'achievement') {
      const list = this.getAchievements().map(a => (a.id === id ? { ...a, showOnResume: show } : a));
      this.set(STORAGE_KEYS.ACHIEVEMENTS, list);
    } else if (type === 'participation') {
      const list = this.getParticipations().map(p => (p.id === id ? { ...p, showOnResume: show } : p));
      this.set(STORAGE_KEYS.PARTICIPATIONS, list);
    } else if (type === 'project') {
      const list = this.getProjects().map(proj => (proj.id === id ? { ...proj, showOnResume: show } : proj));
      this.set(STORAGE_KEYS.PROJECTS, list);
    } else if (type === 'certification') {
      const list = this.getCertifications().map(c => (c.id === id ? { ...c, showOnResume: show } : c));
      this.set(STORAGE_KEYS.CERTIFICATIONS, list);
    } else if (type === 'internship') {
      const list = this.getInternships().map(i => (i.id === id ? { ...i, showOnResume: show } : i));
      this.set(STORAGE_KEYS.INTERNSHIPS, list);
    }
  }

  public reorderResumeItem(
    type: 'achievement' | 'participation' | 'project' | 'certification' | 'internship',
    id: string,
    direction: 'up' | 'down'
  ): void {
    let items: Array<{ id: string; resumeOrder?: number }> = [];
    let storageKey = '';

    if (type === 'achievement') {
      items = [...this.getAchievements()];
      storageKey = STORAGE_KEYS.ACHIEVEMENTS;
    } else if (type === 'participation') {
      items = [...this.getParticipations()];
      storageKey = STORAGE_KEYS.PARTICIPATIONS;
    } else if (type === 'project') {
      items = [...this.getProjects()];
      storageKey = STORAGE_KEYS.PROJECTS;
    } else if (type === 'certification') {
      items = [...this.getCertifications()];
      storageKey = STORAGE_KEYS.CERTIFICATIONS;
    } else if (type === 'internship') {
      items = [...this.getInternships()];
      storageKey = STORAGE_KEYS.INTERNSHIPS;
    }

    const index = items.findIndex(i => i.id === id);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    // Swap elements
    const temp = items[index];
    items[index] = items[targetIndex];
    items[targetIndex] = temp;

    // Re-assign resumeOrder sequentially
    items.forEach((item, idx) => {
      item.resumeOrder = idx + 1;
    });

    this.set(storageKey, items);
  }

  public requestVerification(
    type: 'achievement' | 'participation' | 'project' | 'certification' | 'internship',
    id: string
  ): void {
    if (type === 'achievement') {
      const list = this.getAchievements().map(a =>
        a.id === id ? { ...a, verificationStatus: 'pending_verification' as VerificationStatus } : a
      );
      this.set(STORAGE_KEYS.ACHIEVEMENTS, list);
    } else if (type === 'participation') {
      const list = this.getParticipations().map(p =>
        p.id === id ? { ...p, verificationStatus: 'pending_verification' as VerificationStatus } : p
      );
      this.set(STORAGE_KEYS.PARTICIPATIONS, list);
    } else if (type === 'project') {
      const list = this.getProjects().map(proj =>
        proj.id === id ? { ...proj, verificationStatus: 'pending_verification' as VerificationStatus } : proj
      );
      this.set(STORAGE_KEYS.PROJECTS, list);
    } else if (type === 'certification') {
      const list = this.getCertifications().map(c =>
        c.id === id ? { ...c, verificationStatus: 'pending_verification' as VerificationStatus } : c
      );
      this.set(STORAGE_KEYS.CERTIFICATIONS, list);
    } else if (type === 'internship') {
      const list = this.getInternships().map(i =>
        i.id === id ? { ...i, verificationStatus: 'pending_verification' as VerificationStatus } : i
      );
      this.set(STORAGE_KEYS.INTERNSHIPS, list);
    }
  }

  /**
   * Faculty / Admin Verifies or Rejects record
   */
  public verifyRecord(
    type: 'achievement' | 'participation' | 'certification' | 'project' | 'internship',
    id: string,
    status: VerificationStatus,
    verifierName: string
  ): void {
    const verifiedAt = new Date().toISOString();

    if (type === 'achievement') {
      const list = this.getAchievements().map(a => {
        if (a.id === id) {
          return {
            ...a,
            verificationStatus: status,
            verifiedBy: verifierName,
            verifiedAt
          };
        }
        return a;
      });
      this.set(STORAGE_KEYS.ACHIEVEMENTS, list);
    } else if (type === 'participation') {
      const list = this.getParticipations().map(p => {
        if (p.id === id) {
          return {
            ...p,
            verificationStatus: status,
            verifiedBy: verifierName,
            verifiedAt
          };
        }
        return p;
      });
      this.set(STORAGE_KEYS.PARTICIPATIONS, list);
    } else if (type === 'certification') {
      const list = this.getCertifications().map(c => {
        if (c.id === id) {
          return {
            ...c,
            verificationStatus: status,
            verifiedBy: verifierName,
            verifiedAt
          };
        }
        return c;
      });
      this.set(STORAGE_KEYS.CERTIFICATIONS, list);
    } else if (type === 'project') {
      const list = this.getProjects().map(proj => {
        if (proj.id === id) {
          return {
            ...proj,
            verificationStatus: status,
            verifiedBy: verifierName,
            verifiedAt
          };
        }
        return proj;
      });
      this.set(STORAGE_KEYS.PROJECTS, list);
    } else if (type === 'internship') {
      const list = this.getInternships().map(i => {
        if (i.id === id) {
          return {
            ...i,
            verificationStatus: status,
            verifiedBy: verifierName,
            verifiedAt
          };
        }
        return i;
      });
      this.set(STORAGE_KEYS.INTERNSHIPS, list);
    }
  }

  public getAllRecentAttendanceLogs(): AttendanceRecord[] {
    const records = this.get<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE_RECORDS, []);
    return records.sort((a, b) => new Date(b.markedAt).getTime() - new Date(a.markedAt).getTime());
  }

  public getAllPendingAchievements(): Achievement[] {
    return this.getAchievements().filter(a => a.verificationStatus === 'pending_verification' || a.verificationStatus === 'pending');
  }

  public getAllPendingParticipations(): Participation[] {
    return this.getParticipations().filter(p => p.verificationStatus === 'pending_verification' || p.verificationStatus === 'pending');
  }

  public verifyAchievement(id: string, verifierName: string): void {
    this.verifyRecord('achievement', id, 'verified_institution', verifierName);
  }

  public rejectAchievement(id: string): void {
    this.verifyRecord('achievement', id, 'rejected', '');
  }

  public verifyParticipation(id: string, verifierName: string): void {
    this.verifyRecord('participation', id, 'verified_institution', verifierName);
  }

  /**
   * Builds the chronological journey timeline from student admissions (2023) through 2027
   */
  public buildStudentTimeline(studentId: string): TimelineMilestone[] {
    const achievements = this.getAchievements(studentId);
    const participations = this.getParticipations(studentId);
    const projects = this.getProjects(studentId);
    const certs = this.getCertifications(studentId);
    const internships = this.getInternships(studentId);

    const milestones: TimelineMilestone[] = [
      {
        id: 'ms_admit',
        year: '2023',
        title: 'Joined CampusLife Institute of Technology',
        type: 'academic',
        category: 'Admissions',
        organization: 'CampusLife Institute of Technology',
        organizationType: 'college_organized',
        date: '2023-08-01',
        description: 'Began Bachelor of Technology (B.Tech) in Computer Science & Engineering. Batch of 2023–2027.',
        status: 'verified_institution',
        badge: 'College Matriculation'
      }
    ];

    achievements.forEach(ach => {
      milestones.push({
        id: 'ms_' + ach.id,
        year: ach.year || (ach.date ? ach.date.split('-')[0] : '2025'),
        title: ach.title,
        type: 'achievement',
        category: ach.category,
        organization: ach.organization,
        organizationType: ach.organizationType,
        date: ach.date,
        description: ach.description,
        status: ach.verificationStatus,
        badge: 'Achievement Award'
      });
    });

    participations.forEach(part => {
      milestones.push({
        id: 'ms_' + part.id,
        year: part.year || (part.date ? part.date.split('-')[0] : '2025'),
        title: `${part.eventName} (${part.role})`,
        type: 'participation',
        category: part.category,
        organization: part.organization,
        organizationType: part.organizationType,
        date: part.date,
        description: `${part.description}${part.result ? ` — Result: ${part.result}` : ''}`,
        status: part.verificationStatus,
        badge: part.result || 'Participant'
      });
    });

    projects.forEach(proj => {
      milestones.push({
        id: 'ms_' + proj.id,
        year: proj.year || '2025',
        title: `Project: ${proj.name}`,
        type: 'project',
        category: 'Software Engineering',
        organization: proj.organization,
        organizationType: proj.organizationType,
        date: `${proj.year}-05-15`,
        description: `${proj.description} Built using ${proj.technologies.join(', ')}.`,
        status: proj.verificationStatus,
        badge: 'Project Launch'
      });
    });

    certs.forEach(cert => {
      milestones.push({
        id: 'ms_' + cert.id,
        year: cert.issueDate ? cert.issueDate.split('-')[0] : '2025',
        title: `Credential: ${cert.name}`,
        type: 'certification',
        category: cert.organization,
        organization: cert.organization,
        organizationType: cert.organizationType,
        date: cert.issueDate,
        description: `Verified professional credential issued by ${cert.organization}. ID: ${cert.credentialId || 'N/A'}.`,
        status: cert.verificationStatus,
        badge: 'Certification'
      });
    });

    internships.forEach(intern => {
      milestones.push({
        id: 'ms_' + intern.id,
        year: intern.startDate ? intern.startDate.split('-')[0] : '2025',
        title: `Internship: ${intern.role} at ${intern.companyName}`,
        type: 'participation',
        category: 'Work Experience',
        organization: intern.companyName,
        organizationType: intern.organizationType,
        date: intern.startDate,
        description: `${intern.description} Technologies: ${intern.technologies.join(', ')}.`,
        status: intern.verificationStatus,
        badge: 'Internship'
      });
    });

    // Sort chronologically (ascending: oldest to newest, so student journeys through college!)
    return milestones.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  public getStudentJourneyProfile(studentId: string): StudentJourneyProfile {
    const users = this.getAllUsers();
    const student = users.find(u => u.id === studentId) || users[2];
    const achievements = this.getAchievements(studentId);
    const participations = this.getParticipations(studentId);
    const projects = this.getProjects(studentId);
    const certifications = this.getCertifications(studentId);
    const internships = this.getInternships(studentId);
    const resumeSettings = this.getResumeSettings(studentId);
    const timeline = this.buildStudentTimeline(studentId);

    return {
      student,
      achievements,
      participations,
      projects,
      certifications,
      internships,
      resumeSettings,
      timeline
    };
  }

  public getSubjects(filter?: AcademicTarget | User): Subject[] {
    const all = this.get<Subject[]>(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
    if (!filter) return all;
    return all.filter(s => matchesStudentAcademicGroup(s, filter));
  }

  // --- CHATBOT MESSAGES & AUDIT REPOSITORY ---
  public getChatMessages(userId: string): ChatMessage[] {
    const all = this.get<Record<string, ChatMessage[]>>(STORAGE_KEYS.CHAT_MESSAGES, {});
    return all[userId] || [];
  }

  public saveChatMessage(userId: string, message: ChatMessage): void {
    const all = this.get<Record<string, ChatMessage[]>>(STORAGE_KEYS.CHAT_MESSAGES, {});
    if (!all[userId]) all[userId] = [];
    all[userId].push(message);
    if (all[userId].length > 100) {
      all[userId] = all[userId].slice(-100);
    }
    this.set(STORAGE_KEYS.CHAT_MESSAGES, all);
  }

  public clearChatMessages(userId: string): void {
    const all = this.get<Record<string, ChatMessage[]>>(STORAGE_KEYS.CHAT_MESSAGES, {});
    delete all[userId];
    this.set(STORAGE_KEYS.CHAT_MESSAGES, all);
  }

  // --- DATA ACCURACY REPORTS ---
  public getDataReports(): DataReport[] {
    return this.get<DataReport[]>(STORAGE_KEYS.DATA_REPORTS, INITIAL_DATA_REPORTS);
  }

  public submitDataReport(report: Omit<DataReport, 'id' | 'submittedAt' | 'status'>): DataReport {
    const reports = this.getDataReports();
    const newReport: DataReport = {
      ...report,
      id: 'rep_' + Date.now(),
      submittedAt: new Date().toISOString(),
      status: 'received'
    };
    reports.unshift(newReport);
    this.set(STORAGE_KEYS.DATA_REPORTS, reports);
    return newReport;
  }
}

export const api = new DataService();
