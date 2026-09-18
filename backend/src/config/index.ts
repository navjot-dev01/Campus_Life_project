export const CONFIG = {
  PORT: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  COLLEGE: {
    NAME: 'CampusLife Institute of Technology',
    // Default campus reference coordinates (e.g., Main Academic Block)
    LATITUDE: 28.5458,
    LONGITUDE: 77.1926,
    ALLOWED_RADIUS_METERS: 250, // 100-300m range
  },
  ATTENDANCE: {
    SESSION_DURATION_SECONDS: 180, // 3 minutes standard
    MIN_ATTENDANCE_PERCENT: 75,
  }
};
