import { Request, Response } from 'express';

export class AcademicController {
  static assignments: any[] = [];
  static exams: any[] = [];
  static notices: any[] = [];
  static events: any[] = [];

  // Assignments
  static getAssignments(req: Request, res: Response): void {
    res.json({ success: true, assignments: AcademicController.assignments });
  }

  static createAssignment(req: Request, res: Response): void {
    const { title, subjectId, subjectName, description, dueDate, maxMarks, createdBy } = req.body;
    const newAssignment = {
      id: 'asg_' + Date.now(),
      title,
      subjectId,
      subjectName: subjectName || 'General Academic',
      description,
      dueDate,
      maxMarks: maxMarks || 100,
      createdBy: createdBy || 'faculty_1',
      createdAt: new Date().toISOString()
    };
    AcademicController.assignments.unshift(newAssignment);
    res.status(201).json({ success: true, assignment: newAssignment });
  }

  static deleteAssignment(req: Request, res: Response): void {
    const { id } = req.params;
    AcademicController.assignments = AcademicController.assignments.filter(a => a.id !== id);
    res.json({ success: true, message: 'Assignment deleted' });
  }

  // Exams
  static getExams(req: Request, res: Response): void {
    res.json({ success: true, exams: AcademicController.exams });
  }

  static createExam(req: Request, res: Response): void {
    const { subjectId, subjectName, examType, date, startTime, endTime, room, totalMarks, instructions } = req.body;
    const newExam = {
      id: 'ex_' + Date.now(),
      subjectId,
      subjectName,
      examType,
      date,
      startTime,
      endTime,
      room,
      totalMarks: totalMarks || 50,
      instructions
    };
    AcademicController.exams.push(newExam);
    res.status(201).json({ success: true, exam: newExam });
  }

  // Notices
  static getNotices(req: Request, res: Response): void {
    res.json({ success: true, notices: AcademicController.notices });
  }

  static createNotice(req: Request, res: Response): void {
    const { title, description, category, priority, authorName, isPinned } = req.body;
    const newNotice = {
      id: 'not_' + Date.now(),
      title,
      description,
      category: category || 'academic',
      priority: priority || 'medium',
      publishedAt: new Date().toISOString(),
      authorName: authorName || 'Campus Administration',
      isPinned: isPinned || false
    };
    AcademicController.notices.unshift(newNotice);
    res.status(201).json({ success: true, notice: newNotice });
  }

  // Events
  static getEvents(req: Request, res: Response): void {
    res.json({ success: true, events: AcademicController.events });
  }

  static createEvent(req: Request, res: Response): void {
    const { name, category, date, time, location, description, organizer } = req.body;
    const newEvent = {
      id: 'evt_' + Date.now(),
      name,
      category,
      date,
      time,
      location,
      description,
      organizer: organizer || 'CampusLife Committee',
      rsvpCount: 0
    };
    AcademicController.events.push(newEvent);
    res.status(201).json({ success: true, event: newEvent });
  }
}
