/**
 * Academic Scope Matching Utility
 * Dynamically correlates assignments, exams, schedules, and subjects to the student's
 * specific Program/Branch, Year, Semester, and Section.
 */

export interface AcademicTarget {
  branch?: string;
  department?: string;
  year?: string;
  semester?: string;
  section?: string;
}

export interface StudentAcademicProfile {
  branch?: string;
  department?: string;
  degree?: string;
  year?: string;
  semester?: string;
  section?: string;
}

/**
 * Normalizes branch name to canonical code (e.g., 'CSE', 'BCA', 'ECE', 'IT', 'MECH')
 */
export function normalizeBranch(branchStr?: string): string {
  if (!branchStr) return '';
  const s = branchStr.toLowerCase().trim();
  if (s.includes('bca') || s.includes('computer application')) return 'BCA';
  if (s.includes('cse') || s.includes('computer science') || s.includes('comp sci') || s.includes('b.tech cs')) return 'CSE';
  if (s.includes('ece') || s.includes('electronics') || s.includes('communication')) return 'ECE';
  if (s.includes('it') || s.includes('information technology')) return 'IT';
  if (s.includes('mech') || s.includes('mechanical')) return 'MECH';
  if (s.includes('civil')) return 'CIVIL';
  if (s.includes('mca')) return 'MCA';
  return branchStr.toUpperCase().trim();
}

/**
 * Normalizes semester string to digit ('1'..'8')
 */
export function normalizeSemester(semStr?: string): string {
  if (!semStr) return '';
  const match = semStr.match(/\d+/);
  return match ? match[0] : semStr.trim().toLowerCase();
}

/**
 * Normalizes year string to digit ('1'..'4')
 */
export function normalizeYear(yearStr?: string): string {
  if (!yearStr) return '';
  const match = yearStr.match(/\d+/);
  return match ? match[0] : yearStr.trim().toLowerCase();
}

/**
 * Evaluates whether an academic record matches the student's academic group.
 */
export function matchesStudentAcademicGroup(
  record: AcademicTarget,
  student?: StudentAcademicProfile | null
): boolean {
  if (!student) return true;

  // 1. Check Branch / Program
  if (record.branch && record.branch !== 'All' && record.branch !== 'ALL') {
    const recordNormBranch = normalizeBranch(record.branch);
    const studentNormBranch = normalizeBranch(student.branch || student.department);

    if (recordNormBranch && studentNormBranch) {
      if (recordNormBranch !== studentNormBranch) {
        return false;
      }
    }
  }

  // 2. Check Year of Study
  if (record.year && record.year !== 'All' && record.year !== 'ALL') {
    const recordNormYear = normalizeYear(record.year);
    const studentNormYear = normalizeYear(student.year);

    if (recordNormYear && studentNormYear) {
      if (recordNormYear !== studentNormYear) {
        return false;
      }
    }
  }

  // 3. Check Semester
  if (record.semester && record.semester !== 'All' && record.semester !== 'ALL') {
    const recordNormSem = normalizeSemester(record.semester);
    const studentNormSem = normalizeSemester(student.semester);

    if (recordNormSem && studentNormSem) {
      if (recordNormSem !== studentNormSem) {
        return false;
      }
    }
  }

  // 4. Check Section (if specified)
  if (record.section && record.section !== 'All' && record.section !== 'ALL' && student.section) {
    if (record.section.trim().toLowerCase() !== student.section.trim().toLowerCase()) {
      return false;
    }
  }

  return true;
}
