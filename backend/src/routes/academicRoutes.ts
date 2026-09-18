import { Router } from 'express';
import { AcademicController } from '../controllers/academicController.js';

const router = Router();

// Assignments
router.get('/assignments', AcademicController.getAssignments);
router.post('/assignments', AcademicController.createAssignment);
router.delete('/assignments/:id', AcademicController.deleteAssignment);

// Exams
router.get('/exams', AcademicController.getExams);
router.post('/exams', AcademicController.createExam);

// Notices
router.get('/notices', AcademicController.getNotices);
router.post('/notices', AcademicController.createNotice);

// Events
router.get('/events', AcademicController.getEvents);
router.post('/events', AcademicController.createEvent);

export default router;
