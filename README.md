# CAMPUSLIFE – Student Journey Platform

**CampusLife** is a unified college student journey platform designed for hackathon challenge **PS4 — Student Journey Platform**.

CampusLife has two core purposes:
1. **Help students manage their current academic life**: Geofenced attendance with expiring session codes & QR codes, subject-wise attendance analytics, automatic <75% attendance warnings, upcoming assignment deadlines, examination date-sheets, event discovery, and urgent notices.
2. **Maintain the student's complete college journey and achievements in one profile ("My Journey")**: A unified, verifiable academic and extracurricular record containing achievements (academic, sports, hackathons), participation history (SIH, cultural, clubs, workshops, NCC/NSS), verified projects, certifications, and an interactive chronological timeline from year 1 to graduation.

## Architecture

```
project-root/
├── backend/
│   ├── src/
│   │   ├── config/          # College geofence & app configs
│   │   ├── controllers/     # Route controllers
│   │   ├── db/              # PostgreSQL client & query helpers
│   │   ├── middleware/      # Authentication & role-based access
│   │   ├── models/          # Data types and interfaces
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # Attendance, Academic, and Journey services
│   │   ├── utils/           # Haversine formula & QR utils
│   │   └── server.ts        # Express entry point
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── assets/          # Brand logos & badges
│   │   ├── components/      # Reusable UI widgets, cards, modals
│   │   ├── context/         # Auth, Session, and Notification context
│   │   ├── hooks/           # Geolocation and countdown timer hooks
│   │   ├── layouts/         # Student and Faculty master layout
│   │   ├── pages/           # Dashboard, Attendance, My Journey, Assignments, etc.
│   │   ├── services/        # Resilient API client with offline/storage fallback
│   │   ├── styles/          # Tailwind styling rules
│   │   └── utils/           # Haversine distance, dates, calculations
│   ├── public/
│   ├── package.json
│   └── README.md
├── database/
│   ├── migrations/          # Incremental migration scripts
│   ├── seed/                # Demo data for students, faculty, subjects
│   └── schema.sql           # Complete PostgreSQL DDL
├── .env.example
├── package.json
└── README.md
```

## Key Capabilities
- **Geofenced Attendance with Haversine Verification**: College sets geofence coordinates and allowed radius (e.g. 200m). Student location is requested only during submission and verified via Haversine distance calculation.
- **Expiring 6-Digit Codes & QR Codes**: Faculty starts temporary 2-5 min session; students submit code or scan QR code. Single mark per session enforced.
- **Attendance Threshold Analytics**: Real-time calculation of overall and subject attendance percentages with alert if <75% plus exact number of consecutive classes required to reach 75%.
- **Verifiable "My Journey" Record**: Student portfolio containing achievements, participations, projects, certifications, and visual milestone timeline with Faculty verification badges.
- **Faculty & Admin Portal**: Session start/end console, verification queue for student-submitted records, assignments manager, exam schedules, and broadcast notices.
