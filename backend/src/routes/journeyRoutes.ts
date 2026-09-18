import { Router } from 'express';
import { JourneyController } from '../controllers/journeyController.js';

const router = Router();

router.get('/student/:studentId', JourneyController.getStudentJourney);
router.post('/achievement', JourneyController.addAchievement);
router.post('/participation', JourneyController.addParticipation);
router.patch('/verify/:type/:id', JourneyController.verifyRecord);

export default router;
