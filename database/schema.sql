-- ==============================================================================
-- CAMPUSLIFE: Database Schema (PostgreSQL)
-- Platform: Student Journey Platform (PS4)
-- Description: Complete schema for academic management, attendance geofencing,
--              assessments, events, notices, and verifiable student journeys.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL CHECK (role IN ('student', 'faculty', 'admin')),
    student_id VARCHAR(64),
    branch VARCHAR(128),
    year VARCHAR(32),
    semester VARCHAR(32),
    cgpa NUMERIC(3, 2) DEFAULT 0.00,
    avatar_url TEXT,
    college_name VARCHAR(255) DEFAULT 'CampusLife Institute of Technology',
    department VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS subjects (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    branch VARCHAR(128) NOT NULL,
    semester VARCHAR(32) NOT NULL,
    faculty_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    total_classes INTEGER DEFAULT 0
);

-- 3. ATTENDANCE SESSIONS TABLE
CREATE TABLE IF NOT EXISTS attendance_sessions (
    id VARCHAR(64) PRIMARY KEY,
    subject_id VARCHAR(64) NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    class_section VARCHAR(64) NOT NULL,
    code VARCHAR(6) NOT NULL,
    qr_code_data TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    expiry_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    college_latitude NUMERIC(10, 7) NOT NULL,
    college_longitude NUMERIC(10, 7) NOT NULL,
    allowed_radius_meters INTEGER DEFAULT 200,
    created_by VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. ATTENDANCE RECORDS TABLE
CREATE TABLE IF NOT EXISTS attendance_records (
    id VARCHAR(64) PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    student_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id VARCHAR(64) NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    marked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(32) DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late')),
    distance_meters NUMERIC(8, 2),
    verification_method VARCHAR(32) CHECK (verification_method IN ('code', 'qr')),
    is_verified BOOLEAN DEFAULT TRUE,
    CONSTRAINT unique_student_session UNIQUE (session_id, student_id)
);

-- 5. ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS assignments (
    id VARCHAR(64) PRIMARY KEY,
    subject_id VARCHAR(64) NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    max_marks INTEGER DEFAULT 100,
    created_by VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. ASSIGNMENT SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id VARCHAR(64) PRIMARY KEY,
    assignment_id VARCHAR(64) NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    submission_text TEXT,
    file_url TEXT,
    status VARCHAR(32) DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'late', 'pending')),
    grade VARCHAR(32),
    feedback TEXT,
    CONSTRAINT unique_student_assignment UNIQUE (assignment_id, student_id)
);

-- 7. EXAMINATIONS TABLE
CREATE TABLE IF NOT EXISTS exams (
    id VARCHAR(64) PRIMARY KEY,
    subject_id VARCHAR(64) NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    exam_type VARCHAR(64) NOT NULL, -- e.g. Mid-Term, End-Term, Lab Practical
    date DATE NOT NULL,
    start_time VARCHAR(32) NOT NULL,
    end_time VARCHAR(32) NOT NULL,
    room VARCHAR(64) NOT NULL,
    total_marks INTEGER DEFAULT 100,
    instructions TEXT,
    created_by VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL
);

-- 8. NOTICES TABLE
CREATE TABLE IF NOT EXISTS notices (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(64) NOT NULL CHECK (category IN ('academic', 'exam', 'placement', 'event', 'general')),
    priority VARCHAR(32) NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
    published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    author_name VARCHAR(128) NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE
);

-- 9. EVENTS TABLE
CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL, -- Hackathon, Workshop, Cultural, Sports, Fest
    date DATE NOT NULL,
    time VARCHAR(64) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    organizer VARCHAR(128) NOT NULL,
    rsvp_count INTEGER DEFAULT 0
);

-- 10. ACHIEVEMENTS TABLE (Student Journey)
CREATE TABLE IF NOT EXISTS achievements (
    id VARCHAR(64) PRIMARY KEY,
    student_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL, -- Academic, Hackathon, Sports, Competition, Leadership
    date DATE NOT NULL,
    year VARCHAR(16) NOT NULL,
    description TEXT NOT NULL,
    verification_status VARCHAR(32) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    verified_by VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE
);

-- 11. PARTICIPATION TABLE (Student Journey)
CREATE TABLE IF NOT EXISTS participations (
    id VARCHAR(64) PRIMARY KEY,
    student_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL, -- Smart India Hackathon, Coding, Sports, Cultural, NCC/NSS, Club
    date DATE NOT NULL,
    year VARCHAR(16) NOT NULL,
    role VARCHAR(128) NOT NULL,
    result VARCHAR(128),
    description TEXT NOT NULL,
    verification_status VARCHAR(32) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    verified_by VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE
);

-- 12. PROJECTS TABLE (Student Journey)
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(64) PRIMARY KEY,
    student_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    technologies TEXT[] NOT NULL,
    year VARCHAR(16) NOT NULL,
    github_url TEXT,
    demo_url TEXT
);

-- 13. CERTIFICATIONS TABLE (Student Journey)
CREATE TABLE IF NOT EXISTS certifications (
    id VARCHAR(64) PRIMARY KEY,
    student_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    organization VARCHAR(255) NOT NULL,
    issue_date DATE NOT NULL,
    credential_id VARCHAR(128),
    credential_url TEXT,
    verification_status VARCHAR(32) DEFAULT 'verified' CHECK (verification_status IN ('pending', 'verified', 'rejected'))
);

-- INDEXES FOR HIGH-PERFORMANCE QUERYING
CREATE INDEX IF NOT EXISTS idx_attendance_records_student ON attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_subject ON attendance_records(subject_id);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_active ON attendance_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_assignments_subject ON assignments(subject_id);
CREATE INDEX IF NOT EXISTS idx_achievements_student ON achievements(student_id);
CREATE INDEX IF NOT EXISTS idx_participations_student ON participations(student_id);
