-- ==============================================================================
-- CAMPUSLIFE: Seed Data (PostgreSQL)
-- ==============================================================================

-- Faculty & Students
INSERT INTO users (id, email, name, role, student_id, branch, year, semester, cgpa, avatar_url, department) VALUES
('fac_1', 'faculty.dbms@campuslife.edu', 'Dr. Rajesh Sharma', 'faculty', NULL, 'Computer Science & Engineering', 'Faculty', 'N/A', 0.0, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'Computer Science'),
('fac_admin', 'admin@campuslife.edu', 'Prof. Sunita Rao (Dean)', 'admin', NULL, 'Computer Science & Engineering', 'Admin', 'N/A', 0.0, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'Academic Affairs'),
('stu_1', 'aarav.sharma@campuslife.edu', 'Aarav Sharma', 'student', '21CS042', 'Computer Science & Engineering', '3rd Year', '6th Semester', 8.92, 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', 'Computer Science'),
('stu_2', 'ananya.patel@campuslife.edu', 'Ananya Patel', 'student', '21CS015', 'Computer Science & Engineering', '3rd Year', '6th Semester', 9.15, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'Computer Science'),
('stu_3', 'rohan.verma@campuslife.edu', 'Rohan Verma', 'student', '21CS078', 'Computer Science & Engineering', '3rd Year', '6th Semester', 7.40, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'Computer Science'),
('stu_4', 'priya.nair@campuslife.edu', 'Priya Nair', 'student', '21CS091', 'Computer Science & Engineering', '3rd Year', '6th Semester', 8.65, 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', 'Computer Science'),
('stu_5', 'kabir.singh@campuslife.edu', 'Kabir Singh', 'student', '21CS110', 'Computer Science & Engineering', '3rd Year', '6th Semester', 6.80, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'Computer Science')
ON CONFLICT (id) DO NOTHING;

-- Subjects
INSERT INTO subjects (id, code, name, branch, semester, faculty_id, total_classes) VALUES
('sub_dbms', 'CS601', 'Database Management Systems (DBMS)', 'CSE', '6th', 'fac_1', 42),
('sub_os', 'CS602', 'Operating Systems', 'CSE', '6th', 'fac_1', 38),
('sub_cn', 'CS603', 'Computer Networks', 'CSE', '6th', 'fac_1', 40),
('sub_daa', 'CS604', 'Design & Analysis of Algorithms (DAA)', 'CSE', '6th', 'fac_1', 36),
('sub_ai', 'CS605', 'Artificial Intelligence & Machine Learning', 'CSE', '6th', 'fac_1', 34)
ON CONFLICT (id) DO NOTHING;

-- Notices
INSERT INTO notices (id, title, description, category, priority, author_name, is_pinned) VALUES
('not_1', 'End-Term Examination Schedule Released (May 2026)', 'The controller of examinations has published the detailed date-sheet for 6th-semester regular examinations. All students are advised to download their admit cards from the portal.', 'exam', 'high', 'Prof. Sunita Rao', TRUE),
('not_2', 'Smart India Hackathon (SIH 2026) Internal College Round', 'Teams of 6 students with at least 1 female member can register for the internal college qualifiers for SIH 2026. Top 5 teams will represent CampusLife at the national level.', 'event', 'high', 'Dr. Rajesh Sharma', TRUE),
('not_3', 'Mandatory Minimum 75% Attendance Requirement for Hall Tickets', 'Notice from the Academic Council: Students with attendance below 75% will not be issued admit cards without prior medical/approved leave documentation.', 'academic', 'high', 'Academic Affairs', FALSE),
('not_4', 'Campus Placement Drive: Google & Microsoft Pre-Placement Talks', 'Pre-final and final year CSE/IT students are invited to the upcoming technical sessions and pre-placement talks on April 10 at the Central Auditorium.', 'placement', 'medium', 'Training & Placement Cell', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Events
INSERT INTO events (id, name, category, date, time, location, description, organizer, rsvp_count) VALUES
('evt_1', 'HackFest 2026: 36-Hour National Hackathon', 'Hackathon', '2026-04-18', '09:00 AM', 'CampusLife Innovation Hub & Labs', '36-hour continuous hackathon focused on AI for Social Good, FinTech, and Green Tech. Cash prizes worth 2.5 Lakhs.', 'CSE Department & ACM Club', 148),
('evt_2', 'Cloud Computing & Kubernetes Hands-On Workshop', 'Workshop', '2026-04-05', '02:00 PM', 'Lab 4 (Systems & Networking)', 'Industry workshop by Google Cloud Architects on microservices deployment and orchestration.', 'Google Developer Student Clubs', 94),
('evt_3', 'PULSE 2026: Annual Inter-College Cultural Fest', 'Cultural', '2026-04-24', '10:00 AM', 'College Open Air Amphitheatre', 'Annual celebration featuring battle of the bands, classical dance, drama, and celebrity concert night.', 'Student Council', 412),
('evt_4', 'CampusLife Sports Meet 2026', 'Sports', '2026-04-12', '07:30 AM', 'Sports Complex & Athletic Grounds', 'Inter-departmental cricket, football, basketball, badminton, and track-and-field tournament.', 'Sports Department', 230)
ON CONFLICT (id) DO NOTHING;

-- Exams
INSERT INTO exams (id, subject_id, exam_type, date, start_time, end_time, room, total_marks, instructions) VALUES
('ex_1', 'sub_dbms', 'Mid-Term', '2026-04-08', '10:00 AM', '12:00 PM', 'LH-201', 50, 'Covers Modules 1-3 (Relational Algebra, SQL, Normalization). Calculators permitted.'),
('ex_2', 'sub_os', 'Mid-Term', '2026-04-10', '10:00 AM', '12:00 PM', 'LH-204', 50, 'Process scheduling, Deadlocks, Memory management.'),
('ex_3', 'sub_cn', 'Lab Practical', '2026-04-14', '02:00 PM', '05:00 PM', 'Lab 2', 40, 'Socket programming in C/Python and Wireshark packet inspection.'),
('ex_4', 'sub_daa', 'Mid-Term', '2026-04-16', '10:00 AM', '12:00 PM', 'LH-102', 50, 'Divide & Conquer, Dynamic Programming, Greedy approaches.')
ON CONFLICT (id) DO NOTHING;

-- Assignments
INSERT INTO assignments (id, subject_id, title, description, due_date, max_marks, created_by) VALUES
('asg_1', 'sub_dbms', 'B+ Tree Indexing & Query Optimization Analysis', 'Implement B+ Tree index traversal simulation and write query plan explanations for complex multi-table joins.', '2026-04-06 23:59:00+00', 100, 'fac_1'),
('asg_2', 'sub_os', 'Custom Shell & Process Scheduling Simulation', 'Build a mini Unix shell supporting pipes, background processes, and round-robin scheduling algorithms in C/C++.', '2026-04-11 23:59:00+00', 100, 'fac_1'),
('asg_3', 'sub_cn', 'Packet Sniffer & TCP Handshake Analyzer', 'Capture Wireshark pcap logs of TCP 3-way handshakes and summarize latency and window size dynamics.', '2026-04-15 23:59:00+00', 50, 'fac_1'),
('asg_4', 'sub_daa', 'Dynamic Programming on Graph Problems', 'Solve Bellman-Ford, Floyd-Warshall and Travelling Salesperson Problem with complexity benchmark graphs.', '2026-04-20 23:59:00+00', 100, 'fac_1')
ON CONFLICT (id) DO NOTHING;
