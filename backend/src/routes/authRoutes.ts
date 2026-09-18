import { Router, Request, Response } from 'express';

const router = Router();

// Demo users database
const USERS = [
  {
    id: 'fac_1',
    email: 'faculty.dbms@campuslife.edu',
    name: 'Dr. Rajesh Sharma',
    role: 'faculty',
    department: 'Computer Science & Engineering',
    collegeName: 'CampusLife Institute of Technology',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  },
  {
    id: 'fac_admin',
    email: 'admin@campuslife.edu',
    name: 'Prof. Sunita Rao (Dean)',
    role: 'admin',
    department: 'Academic Affairs & Quality',
    collegeName: 'CampusLife Institute of Technology',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
  },
  {
    id: 'stu_1',
    email: 'aarav.sharma@campuslife.edu',
    name: 'Aarav Sharma',
    role: 'student',
    studentId: '21CS042',
    branch: 'Computer Science & Engineering',
    year: '3rd Year',
    semester: '6th Semester',
    cgpa: 8.92,
    collegeName: 'CampusLife Institute of Technology',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'
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
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
  }
];

router.post('/login', (req: Request, res: Response) => {
  const { email } = req.body;
  const user = USERS.find(u => u.email.toLowerCase() === (email || '').toLowerCase()) || USERS[2]; // Default to student
  res.json({
    success: true,
    user,
    token: 'jwt_campuslife_demo_token'
  });
});

router.get('/users', (req: Request, res: Response) => {
  res.json({ success: true, users: USERS });
});

export default router;
