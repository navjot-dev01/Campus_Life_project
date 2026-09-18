# CampusLife – Backend API

RESTful API backend for CampusLife – Student Journey Platform (PS4).

## Responsibilities
- Geofenced real-time attendance verification (Haversine formula, 2-5 min expiring sessions, single-submission lock)
- Student journey management (Achievements, Participation history, Projects, Certifications)
- Faculty and Admin verification workflow (Approve / Reject student credentials)
- Academic management (Assignments, Exams, Notices, Events, Deadlines)
- PostgreSQL database persistence and schema migrations

## Architecture
- `src/config/`: App and college geofence configuration
- `src/controllers/`: Route handlers for auth, attendance, academics, journey
- `src/services/`: Business logic, distance computations, attendance formulas
- `src/routes/`: Express endpoint declarations
- `src/db/`: Database connection pooling and query abstractions
- `src/utils/`: Haversine distance calculator and security helpers
