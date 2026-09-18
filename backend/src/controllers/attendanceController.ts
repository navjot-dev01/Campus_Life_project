import { Request, Response } from 'express';
import { AttendanceService } from '../services/attendanceService.js';
import { CONFIG } from '../config/index.js';

export class AttendanceController {
  // In-memory / DB store reference for sessions and records
  static activeSessions: Map<string, any> = new Map();
  static attendanceRecords: any[] = [];

  /**
   * Faculty starts an attendance session
   */
  static startSession(req: Request, res: Response): void {
    const { subjectId, subjectName, subjectCode, classSection, durationSeconds, latitude, longitude, radiusMeters, facultyId } = req.body;

    if (!subjectId || !classSection) {
      res.status(400).json({ success: false, error: 'Subject and class section are required' });
      return;
    }

    const sessionId = 'sess_' + Date.now();
    const code = AttendanceService.generateCode();
    const duration = durationSeconds || CONFIG.ATTENDANCE.SESSION_DURATION_SECONDS;
    const startTime = new Date();
    const expiryTime = new Date(startTime.getTime() + duration * 1000);

    const session = {
      id: sessionId,
      subjectId,
      subjectName: subjectName || 'Database Management Systems',
      subjectCode: subjectCode || 'CS601',
      classSection,
      code,
      qrCodeData: JSON.stringify({
        sessionId,
        code,
        subjectId,
        subjectName,
        expiresAt: expiryTime.toISOString()
      }),
      startTime: startTime.toISOString(),
      expiryTime: expiryTime.toISOString(),
      isActive: true,
      collegeLatitude: latitude || CONFIG.COLLEGE.LATITUDE,
      collegeLongitude: longitude || CONFIG.COLLEGE.LONGITUDE,
      allowedRadiusMeters: radiusMeters || CONFIG.COLLEGE.ALLOWED_RADIUS_METERS,
      createdBy: facultyId || 'faculty_1'
    };

    AttendanceController.activeSessions.set(sessionId, session);

    res.status(201).json({
      success: true,
      message: 'Attendance session started successfully',
      session
    });
  }

  /**
   * Faculty ends an active session
   */
  static endSession(req: Request, res: Response): void {
    const { sessionId } = req.params;
    const session = AttendanceController.activeSessions.get(sessionId);

    if (!session) {
      res.status(404).json({ success: false, error: 'Session not found' });
      return;
    }

    session.isActive = false;
    AttendanceController.activeSessions.set(sessionId, session);

    res.json({
      success: true,
      message: 'Attendance session ended',
      session
    });
  }

  /**
   * Student marks attendance using 6-digit code or QR data
   */
  static markAttendance(req: Request, res: Response): void {
    const { studentId, studentName, code, sessionId, studentLat, studentLng, verificationMethod } = req.body;

    if (!studentId || !code) {
      res.status(400).json({ success: false, error: 'Student ID and code are required' });
      return;
    }

    // Find session by id or code
    let session = sessionId ? AttendanceController.activeSessions.get(sessionId) : null;
    if (!session) {
      for (const s of AttendanceController.activeSessions.values()) {
        if (s.code === code.trim() && s.isActive) {
          session = s;
          break;
        }
      }
    }

    if (!session) {
      res.status(404).json({ success: false, error: 'Invalid attendance code or session not found' });
      return;
    }

    // 1. Check if session is expired
    if (!AttendanceService.isSessionActive(session)) {
      res.status(400).json({
        success: false,
        error: 'This attendance session has expired. You cannot mark attendance using an expired code.'
      });
      return;
    }

    // 2. Check if student already marked
    const existing = AttendanceController.attendanceRecords.find(
      (r) => r.sessionId === session.id && r.studentId === studentId
    );
    if (existing) {
      res.status(400).json({
        success: false,
        error: 'You have already marked attendance for this session.'
      });
      return;
    }

    // 3. Location Verification using Haversine
    if (typeof studentLat !== 'number' || typeof studentLng !== 'number') {
      res.status(400).json({
        success: false,
        error: 'Student GPS coordinates required for geofence verification.'
      });
      return;
    }

    const verification = AttendanceService.verifyLocation(
      studentLat,
      studentLng,
      session.collegeLatitude,
      session.collegeLongitude,
      session.allowedRadiusMeters
    );

    if (!verification.isVerified) {
      res.status(403).json({
        success: false,
        locationStatus: 'Outside Allowed Area ✕',
        distanceMeters: verification.distanceMeters,
        error: 'Attendance could not be marked because you are outside the allowed attendance area.'
      });
      return;
    }

    // 4. Record attendance
    const record = {
      id: 'rec_' + Date.now(),
      sessionId: session.id,
      studentId,
      studentName: studentName || 'Student',
      subjectId: session.subjectId,
      subjectName: session.subjectName,
      markedAt: new Date().toISOString(),
      status: 'present',
      distanceMeters: verification.distanceMeters,
      verificationMethod: verificationMethod || 'code',
      isVerified: true
    };

    AttendanceController.attendanceRecords.push(record);

    res.status(200).json({
      success: true,
      locationStatus: 'Location Verified ✓',
      message: 'Attendance Marked Successfully ✓',
      record
    });
  }

  /**
   * Get student attendance analytics
   */
  static getStudentDashboard(req: Request, res: Response): void {
    const { studentId } = req.params;
    // Computed based on student records
    res.json({
      success: true,
      studentId
    });
  }
}
