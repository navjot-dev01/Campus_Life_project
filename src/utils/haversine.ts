/**
 * Haversine formula implementation for geodesic distance calculation.
 * Accurately measures spherical surface distance between student's GPS coordinate
 * and the configured college campus anchor point.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's mean radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const deltaPhi = toRad(lat2 - lat1);
  const deltaLambda = toRad(lon2 - lon1);

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // In meters
}

/**
 * Validates distance against allowed radius
 */
export function verifyGeofence(
  studentLat: number,
  studentLng: number,
  campusLat: number,
  campusLng: number,
  allowedRadiusMeters: number
): { isInside: boolean; distanceMeters: number } {
  const distance = calculateHaversineDistance(studentLat, studentLng, campusLat, campusLng);
  return {
    isInside: distance <= allowedRadiusMeters,
    distanceMeters: Math.round(distance)
  };
}
