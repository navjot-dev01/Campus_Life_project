import { Request, Response } from 'express';
import { JourneyService } from '../services/journeyService.js';

export class JourneyController {
  static achievements: any[] = [];
  static participations: any[] = [];
  static projects: any[] = [];
  static certifications: any[] = [];

  /**
   * Get student journey data with computed chronological timeline
   */
  static getStudentJourney(req: Request, res: Response): void {
    const { studentId } = req.params;

    const studentAchievements = JourneyController.achievements.filter(a => a.studentId === studentId);
    const studentParticipations = JourneyController.participations.filter(p => p.studentId === studentId);
    const studentProjects = JourneyController.projects.filter(p => p.studentId === studentId);
    const studentCerts = JourneyController.certifications.filter(c => c.studentId === studentId);

    const timeline = JourneyService.buildTimeline(
      studentAchievements,
      studentParticipations,
      studentProjects,
      studentCerts
    );

    res.json({
      success: true,
      achievements: studentAchievements,
      participations: studentParticipations,
      projects: studentProjects,
      certifications: studentCerts,
      timeline
    });
  }

  /**
   * Add student achievement
   */
  static addAchievement(req: Request, res: Response): void {
    const { studentId, studentName, title, category, date, year, description } = req.body;
    const newAchievement = {
      id: 'ach_' + Date.now(),
      studentId,
      studentName: studentName || 'Student',
      title,
      category,
      date,
      year: year || (date ? date.split('-')[0] : '2026'),
      description,
      verificationStatus: 'pending' // Defaults to pending until faculty verifies
    };
    JourneyController.achievements.unshift(newAchievement);
    res.status(201).json({ success: true, achievement: newAchievement });
  }

  /**
   * Add student participation record
   */
  static addParticipation(req: Request, res: Response): void {
    const { studentId, studentName, eventName, category, date, year, role, result, description } = req.body;
    const newParticipation = {
      id: 'part_' + Date.now(),
      studentId,
      studentName: studentName || 'Student',
      eventName,
      category,
      date,
      year: year || (date ? date.split('-')[0] : '2026'),
      role,
      result: result || 'Participant',
      description,
      verificationStatus: 'pending'
    };
    JourneyController.participations.unshift(newParticipation);
    res.status(201).json({ success: true, participation: newParticipation });
  }

  /**
   * Faculty / Admin verifies or rejects student record
   */
  static verifyRecord(req: Request, res: Response): void {
    const { type, id } = req.params;
    const { status, verifiedBy } = req.body; // 'verified' | 'rejected'

    if (type === 'achievement') {
      const item = JourneyController.achievements.find(a => a.id === id);
      if (item) {
        item.verificationStatus = status;
        item.verifiedBy = verifiedBy || 'Faculty Verification Board';
        item.verifiedAt = new Date().toISOString();
        res.json({ success: true, item });
        return;
      }
    } else if (type === 'participation') {
      const item = JourneyController.participations.find(p => p.id === id);
      if (item) {
        item.verificationStatus = status;
        item.verifiedBy = verifiedBy || 'Faculty Verification Board';
        item.verifiedAt = new Date().toISOString();
        res.json({ success: true, item });
        return;
      }
    }

    res.status(404).json({ success: false, error: 'Record not found' });
  }
}
