import { CONFIG } from '../config/index.js';
import { calculateHaversineDistance } from '../utils/haversine.js';
import { AttendanceSession, AttendanceRecord, SubjectAttendanceSummary, AttendanceDashboardData } from '../models/types.js';

export class AttendanceService {
  /**
   * Generates a 6-digit random temporary attendance code (e.g. 583214)
   */
  static generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Checks if an attendance session is valid and active
   */
  static isSessionActive(session: AttendanceSession): boolean {
    if (!session.isActive) return false;
    const now = new Date().getTime();
    const expiry = new Date(session.expiryTime).getTime();
    return now <= expiry;
  }

  /**
   * Verifies whether the student's coordinates fall within the allowed campus geofence radius.
   */
  static verifyLocation(
    studentLat: number,
    studentLng: number,
    collegeLat: number = CONFIG.COLLEGE.LATITUDE,
    collegeLng: number = CONFIG.COLLEGE.LONGITUDE,
    allowedRadiusMeters: number = CONFIG.COLLEGE.ALLOWED_RADIUS_METERS
  ): { isVerified: boolean; distanceMeters: number; message: string } {
    const distance = calculateHaversineDistance(studentLat, studentLng, collegeLat, collegeLng);
    const isVerified = distance <= allowedRadiusMeters;

    return {
      isVerified,
      distanceMeters: Math.round(distance),
      message: isVerified
        ? 'Location Verified ✓'
        : 'Attendance could not be marked because you are outside the allowed attendance area.'
    };
  }

  /**
   * Calculates attendance metrics and classes needed to reach 75%
   * Formula:
   * Current % = (present / total) * 100
   * To reach 75% (0.75):
   * (present + x) / (total + x) >= 0.75
   * present + x >= 0.75 * total + 0.75 * x
   * 0.25 * x >= 0.75 * total - present
   * x >= (0.75 * total - present) / 0.25
   * x = ceil(3 * total - 4 * present)
   */
  static calculateAttendanceStatus(
    totalPresent: number,
    totalClasses: number
  ): { percentage: number; isWarning: boolean; classesNeededFor75: number } {
    if (totalClasses === 0) {
      return { percentage: 100, isWarning: false, classesNeededFor75: 0 };
    }

    const percentage = Math.round((totalPresent / totalClasses) * 100);
    const isWarning = percentage < CONFIG.ATTENDANCE.MIN_ATTENDANCE_PERCENT;

    let classesNeeded = 0;
    if (isWarning) {
      const required = Math.ceil(3 * totalClasses - 4 * totalPresent);
      classesNeeded = Math.max(0, required);
    }

    return { percentage, isWarning, classesNeededFor75: classesNeeded };
  }
}
