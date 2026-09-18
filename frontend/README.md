# CampusLife – Frontend Application

Modern React 19 + Vite + Tailwind CSS single page web application for **CampusLife – Student Journey Platform**.

## Key Sections
- **Login & Demo Account Switcher**: Fast role toggling between Student accounts (Aarav Sharma, Ananya Patel) and Faculty/Dean accounts (Dr. Rajesh Sharma, Prof. Sunita Rao).
- **Student Dashboard**: Live overall attendance meter with <75% attendance warnings, classes required to restore 75%, pending assignments, exam schedules, and upcoming events.
- **Geofenced Attendance System**:
  - Live session code input or simulated QR scanner
  - Browser Geolocation API permission request
  - Client-side and server-side Haversine distance computation against college campus boundary
  - Distinct "Location Verified ✓" and "Outside Allowed Area ✕" states
  - Test location simulator allowing testing of both "On Campus (Lab 3)" and "Outside Campus (Home/Hostel)" modes directly inside preview!
- **My Journey Profile**:
  - Academic & extracurricular achievements
  - Participations in Hackathons, SIH, cultural fests, sports, clubs
  - Projects with live demo & GitHub links
  - Certifications with credential IDs
  - Chronological interactive Journey Timeline from admissions (2023) to graduation (2027)
  - Student self-submission with verification badges (Verified ✓, Pending ⏳, Rejected ✕)
- **Faculty / Admin Management Suite**:
  - Launch 6-digit temporary attendance session with countdown clock & high-contrast QR code
  - Verification Queue for approving/rejecting student journey submissions
  - Academic resource manager: Create/Edit assignments, exams, events, notices
