import { Router } from 'express';
import { AttendanceController } from '../controllers/attendanceController.js';

const router = Router();

router.post('/session/start', AttendanceController.startSession);
router.post('/session/:sessionId/end', AttendanceController.endSession);
router.post('/mark', AttendanceController.markAttendance);
router.get('/student/:studentId', AttendanceController.getStudentDashboard);

export default router;
