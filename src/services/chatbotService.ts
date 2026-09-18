import { api } from './api';
import { User, ChatMessage, ChatBadgeType, ChatVerifiedData, ChatIntent, EventItem, Assignment, Exam } from '../types';

export interface QueryResolutionResult {
  text: string;
  badgeType: ChatBadgeType;
  intent: ChatIntent;
  verifiedData?: ChatVerifiedData;
  followUpContext?: {
    intent?: ChatIntent | string;
    subject?: string;
    subjectName?: string;
    subjectCode?: string;
    items?: any[];
    referencedItem?: any;
    lastTopic?: string;
  };
  suggestedFollowUps?: string[];
}

// Known subjects in CampusLife with codes and recognition aliases
export interface SubjectInfo {
  key: string;
  name: string;
  code: string;
  aliases: string[];
}

const KNOWN_SUBJECTS: SubjectInfo[] = [
  {
    key: 'DBMS',
    name: 'Database Management Systems (DBMS)',
    code: 'CS601',
    aliases: ['dbms', 'database management systems', 'database management system', 'database systems', 'database', 'databases', 'sql']
  },
  {
    key: 'OS',
    name: 'Operating Systems',
    code: 'CS602',
    aliases: ['operating systems', 'operating system', 'os', 'linux', 'unix', 'processes', 'scheduling']
  },
  {
    key: 'CN',
    name: 'Computer Networks',
    code: 'CS603',
    aliases: ['computer networks', 'computer network', 'networking', 'networks', 'cn', 'tcp', 'udp', 'ip']
  },
  {
    key: 'DAA',
    name: 'Design & Analysis of Algorithms (DAA)',
    code: 'CS604',
    aliases: ['design and analysis of algorithms', 'design & analysis of algorithms', 'algorithms', 'algorithm', 'daa', 'data structures']
  },
  {
    key: 'AI',
    name: 'Artificial Intelligence & Machine Learning',
    code: 'CS605',
    aliases: ['artificial intelligence', 'machine learning', 'ai & ml', 'ai/ml', 'ai', 'ml']
  }
];

// Date calculation helpers
const isSameDay = (date1Str: string, date2: Date): boolean => {
  try {
    const d1 = new Date(date1Str);
    return (
      d1.getFullYear() === date2.getFullYear() &&
      d1.getMonth() === date2.getMonth() &&
      d1.getDate() === date2.getDate()
    );
  } catch {
    return false;
  }
};

const formatTimeReadable = (isoOrTime: string): string => {
  if (!isoOrTime) return '';
  if (isoOrTime.includes('AM') || isoOrTime.includes('PM')) return isoOrTime;
  try {
    const d = new Date(isoOrTime);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return isoOrTime;
  }
};

const formatDateReadable = (isoOrDate: string): string => {
  if (!isoOrDate) return '';
  try {
    const d = new Date(isoOrDate);
    const today = new Date();
    if (isSameDay(isoOrDate, today)) {
      return `Today (${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})`;
    }
    const tomorrow = new Date(today.getTime() + 86400000);
    if (isSameDay(isoOrDate, tomorrow)) {
      return `Tomorrow (${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})`;
    }
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return isoOrDate;
  }
};

const getWeekdayName = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'long' });
  } catch {
    return '';
  }
};

/**
 * Intelligent Chatbot Service for CampusLife
 * Intent-First Engine:
 * - Understands user's INTENT, not just isolated keywords.
 * - GENERAL_ACADEMIC_GUIDANCE -> LLM study guidance and preparation strategies (no exam schedule).
 * - EXAM_SCHEDULE -> Verified CampusLife exam calendar records.
 * - ASSIGNMENT_QUERY -> Student's verified assignments and pending deadlines.
 * - EVENT_QUERY -> Verified CampusLife events and venues.
 * - NOTICE_QUERY -> Verified college administration circulars.
 * - STUDENT_RECORD_QUERY -> Verified student attendance and achievements.
 * - GENERAL_INFORMATION -> LLM conceptual explanations.
 * - ACCOUNT/SUPPORT -> Administrative escalation directory.
 */
export class ChatbotService {

  /**
   * Helper to extract which subject is being referenced (either directly or via context pronoun "it")
   */
  public extractSubject(text: string, prevContext?: any): SubjectInfo | null {
    const lower = text.toLowerCase();

    // 1. Check direct subject keywords in text with regex boundaries
    for (const sub of KNOWN_SUBJECTS) {
      for (const alias of sub.aliases) {
        const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escaped}\\b`, 'i');
        if (regex.test(lower)) {
          return sub;
        }
      }
    }

    // 2. Resolve pronouns ("it", "for it", "about it", "this exam", "the exam", "this course", "the test")
    const hasPronoun = /\b(it|for it|about it|this exam|that exam|the exam|this course|the course|this subject|the subject|that subject|this test|the test)\b/i.test(lower);
    if (hasPronoun && prevContext) {
      if (prevContext.subject) {
        const match = KNOWN_SUBJECTS.find(s => s.key.toLowerCase() === String(prevContext.subject).toLowerCase());
        if (match) return match;
      }
      if (prevContext.subjectName) {
        const match = KNOWN_SUBJECTS.find(s =>
          prevContext.subjectName.toLowerCase().includes(s.key.toLowerCase()) ||
          prevContext.subjectName.toLowerCase().includes(s.name.toLowerCase())
        );
        if (match) return match;
      }
      if (prevContext.referencedItem?.subjectName) {
        const match = KNOWN_SUBJECTS.find(s =>
          prevContext.referencedItem.subjectName.toLowerCase().includes(s.key.toLowerCase()) ||
          prevContext.referencedItem.subjectName.toLowerCase().includes(s.name.toLowerCase())
        );
        if (match) return match;
      }
    }

    return null;
  }

  /**
   * Intent Classification Engine:
   * Analyzes requested ACTION and QUESTION FORM rather than just isolated nouns.
   */
  public classifyIntent(rawQuery: string, prevContext?: any): {
    intent: ChatIntent;
    subject: SubjectInfo | null;
    isSyllabus?: boolean;
    followUpType?: string;
  } {
    const lower = rawQuery.trim().toLowerCase();
    const subject = this.extractSubject(rawQuery, prevContext);

    // 1. ACCOUNT/SUPPORT (Security, credentials, official fee/administrative escalation)
    if (
      lower.includes('reset password') ||
      lower.includes('change password') ||
      lower.includes('forgot password') ||
      lower.includes('account locked') ||
      lower.includes('cannot login') ||
      lower.includes('cant login') ||
      lower.includes('pay fee') ||
      lower.includes('fee payment') ||
      lower.includes('fee dispute') ||
      lower.includes('hostel fee') ||
      lower.includes('grade dispute') ||
      lower.includes('appeal detention') ||
      lower.includes('official transcript')
    ) {
      return { intent: 'ACCOUNT/SUPPORT', subject };
    }

    // 2. Specific Event Follow-up queries when previous context was an event or event list
    if (prevContext && (prevContext.intent === 'EVENT_QUERY' || prevContext.intent === 'event_today' || prevContext.intent === 'events_week')) {
      if (
        (lower.includes('which one') || lower.includes('what event') || lower.includes('which')) &&
        (lower.includes('friday') || lower.includes('monday') || lower.includes('tuesday') || lower.includes('wednesday') || lower.includes('thursday') || lower.includes('saturday') || lower.includes('sunday'))
      ) {
        return { intent: 'EVENT_QUERY', subject, followUpType: 'weekday' };
      }
      if (lower.includes('who is organizing') || lower.includes('who is the organizer') || lower.includes('who organizes') || lower.includes('organizer')) {
        return { intent: 'EVENT_QUERY', subject, followUpType: 'organizer' };
      }
      if (lower.includes('where is it') || lower.includes('what is the venue') || lower.includes('venue') || lower.includes('location of')) {
        return { intent: 'EVENT_QUERY', subject, followUpType: 'venue' };
      }
    }

    // 3. Syllabus Inquiry
    // (e.g. "Give me the DBMS syllabus", "What is the syllabus for OS?")
    if (lower.includes('syllabus') || lower.includes('curriculum') || lower.includes('course outline')) {
      return { intent: 'GENERAL_ACADEMIC_GUIDANCE', subject, isSyllabus: true };
    }

    // 4. GENERAL_ACADEMIC_GUIDANCE (Preparation, study strategy, topics to study, revision, how to study)
    // Priority: If the student is asking HOW or WHAT to study, it is ACADEMIC GUIDANCE, NOT an exam date query!
    const isAcademicGuidanceQuestion =
      // Preparation questions
      lower.includes('how should i prepare') ||
      lower.includes('how to prepare') ||
      lower.includes('how do i prepare') ||
      lower.includes('how can i prepare') ||
      lower.includes('prepare for') ||
      lower.includes('preparation for') ||
      lower.includes('preparation tips') ||
      lower.includes('preparation strategy') ||
      // Topics to study
      lower.includes('what topics should i study') ||
      lower.includes('what topics to study') ||
      lower.includes('what should i study') ||
      lower.includes('what to study') ||
      lower.includes('topics should i study') ||
      lower.includes('topics to study') ||
      lower.includes('important topics') ||
      lower.includes('key topics') ||
      lower.includes('high weightage') ||
      lower.includes('important concepts') ||
      // Study & revision methodology
      lower.includes('how should i study') ||
      lower.includes('how to study') ||
      lower.includes('study plan') ||
      lower.includes('study tips') ||
      lower.includes('study guide') ||
      lower.includes('study roadmap') ||
      lower.includes('how to revise') ||
      lower.includes('revision strategy') ||
      lower.includes('revision tips') ||
      lower.includes('revision plan') ||
      lower.includes('last minute revision') ||
      lower.includes('how to score') ||
      lower.includes('how to ace') ||
      lower.includes('how to pass') ||
      lower.includes('how to clear') ||
      lower.includes('practice questions') ||
      lower.includes('sample questions') ||
      lower.includes('important questions') ||
      lower.includes('what should i focus on');

    if (isAcademicGuidanceQuestion) {
      return { intent: 'GENERAL_ACADEMIC_GUIDANCE', subject };
    }

    // 5. EXAM_SCHEDULE (College-specific calendar dates, times, rooms, schedules)
    // Must explicitly request date, time, when, schedule, or timetable of an exam!
    const isExamScheduleQuestion =
      lower.includes('what is the date of') ||
      lower.includes('date of my') ||
      lower.includes('date of the') ||
      lower.includes('exam date') ||
      lower.includes('when is my') ||
      lower.includes('when is the') ||
      lower.includes('when are my') ||
      lower.includes('when do exams start') ||
      lower.includes('what time is my exam') ||
      lower.includes('what time is the exam') ||
      lower.includes('which room is my exam') ||
      lower.includes('exam schedule') ||
      lower.includes('exam timetable') ||
      lower.includes('exam routine') ||
      lower.includes('mid-term schedule') ||
      lower.includes('practical schedule') ||
      lower.includes('next exam') ||
      lower.includes('upcoming exams') ||
      // Short queries like "When is my DBMS exam?" or "When is it?" (if prev was exam)
      ((lower.includes('when') || lower.includes('date') || lower.includes('time') || lower.includes('room') || lower.includes('schedule')) &&
        (lower.includes('exam') || lower.includes('test') || lower.includes('mid-term') || lower.includes('practical') || prevContext?.intent === 'EXAM_SCHEDULE' || prevContext?.intent === 'GENERAL_ACADEMIC_GUIDANCE'));

    if (isExamScheduleQuestion) {
      return { intent: 'EXAM_SCHEDULE', subject };
    }

    // 6. ASSIGNMENT_QUERY (Student-specific verified assignments, deadlines, pending work)
    const isAssignmentQuestion =
      lower.includes('assignment due') ||
      lower.includes('due today') ||
      lower.includes('have an assignment due') ||
      lower.includes('do i have an assignment') ||
      lower.includes('is any assignment due') ||
      lower.includes('pending assignment') ||
      lower.includes('unsubmitted assignment') ||
      lower.includes('what assignments are pending') ||
      lower.includes('which assignments are pending') ||
      lower.includes('assignments pending') ||
      lower.includes('assignment deadline') ||
      lower.includes('assignment due date') ||
      lower.includes('deadline for my assignment') ||
      lower.includes('when is my next deadline') ||
      lower.includes('next deadline') ||
      lower.includes('upcoming deadline') ||
      (lower.includes('assignment') && (lower.includes('due') || lower.includes('pending') || lower.includes('submit') || lower.includes('status') || !!subject));

    if (isAssignmentQuestion) {
      return { intent: 'ASSIGNMENT_QUERY', subject };
    }

    // 7. EVENT_QUERY (College-specific events, workshops, fests, hackathons)
    const isEventQuestion =
      lower.includes('is there any event today') ||
      lower.includes('event today') ||
      lower.includes('events today') ||
      lower.includes('any event today') ||
      lower.includes('events are happening this week') ||
      lower.includes('events this week') ||
      lower.includes('what events are happening') ||
      lower.includes('what is my next event') ||
      lower.includes('next event') ||
      lower.includes('upcoming event') ||
      lower.includes('upcoming events') ||
      lower.includes('hackathon') ||
      lower.includes('workshop') ||
      lower.includes('sports tournament') ||
      lower.includes('cultural fest') ||
      (lower.includes('event') && !lower.includes('assignment') && !lower.includes('exam'));

    if (isEventQuestion) {
      return { intent: 'EVENT_QUERY', subject };
    }

    // 8. NOTICE_QUERY (Official administrative circulars, announcements)
    if (
      lower.includes('notice') ||
      lower.includes('notices') ||
      lower.includes('announcement') ||
      lower.includes('announcements') ||
      lower.includes('circular') ||
      lower.includes('circulars')
    ) {
      return { intent: 'NOTICE_QUERY', subject };
    }

    // 9. STUDENT_RECORD_QUERY (Attendance, detention risk, marks, achievements)
    if (
      lower.includes('attendance') ||
      lower.includes('detained') ||
      lower.includes('detention') ||
      lower.includes('classes missed') ||
      lower.includes('classes needed') ||
      lower.includes('my cgpa') ||
      lower.includes('my achievements') ||
      lower.includes('my profile') ||
      lower.includes('my journey')
    ) {
      return { intent: 'STUDENT_RECORD_QUERY', subject };
    }

    // 10. GENERAL_INFORMATION (Concepts, definitions, educational explanations: e.g. "What is DBMS?", "Difference between TCP and UDP")
    const isConceptualQuestion =
      lower.startsWith('what is') ||
      lower.startsWith('what are') ||
      lower.startsWith('define') ||
      lower.startsWith('explain') ||
      lower.startsWith('why do we use') ||
      lower.startsWith('difference between') ||
      lower.startsWith('how does') ||
      lower.includes('difference between') ||
      lower.includes('vs') ||
      lower.includes('versus');

    if (isConceptualQuestion || subject) {
      return { intent: 'GENERAL_INFORMATION', subject };
    }

    // Default fallback
    return { intent: 'GENERAL_INFORMATION', subject: null };
  }

  /**
   * Main query processor
   */
  public async processUserQuery(
    rawQuery: string,
    currentUser: User,
    lastBotMessage?: ChatMessage
  ): Promise<QueryResolutionResult> {
    const query = rawQuery.trim();
    const prevContext = lastBotMessage?.followUpContext;

    // Detect Intent and Subject
    const classification = this.classifyIntent(query, prevContext);
    const { intent, subject, isSyllabus, followUpType } = classification;

    // Route based on INTENT:

    // 1. ACCOUNT/SUPPORT
    if (intent === 'ACCOUNT/SUPPORT') {
      return this.handleEscalation(currentUser, query);
    }

    // 2. Syllabus Inquiry (Special handling under Academic records)
    if (isSyllabus) {
      return this.handleSyllabus(subject, currentUser);
    }

    // 3. GENERAL_ACADEMIC_GUIDANCE (Preparation, study advice, topics to study, tips)
    if (intent === 'GENERAL_ACADEMIC_GUIDANCE') {
      return await this.handleGeneralAcademicGuidance(query, subject, currentUser, prevContext);
    }

    // 4. EXAM_SCHEDULE (College-specific exam timetable, dates, venues)
    if (intent === 'EXAM_SCHEDULE') {
      return this.handleExams(subject);
    }

    // 5. ASSIGNMENT_QUERY (College-specific student assignments, deadlines, pending work)
    if (intent === 'ASSIGNMENT_QUERY') {
      return this.handleAssignmentQuery(query, subject, currentUser);
    }

    // 6. EVENT_QUERY (College events, workshops, fests, follow-ups)
    if (intent === 'EVENT_QUERY') {
      return this.handleEventQuery(query, prevContext, followUpType);
    }

    // 7. NOTICE_QUERY (Official notices and circulars)
    if (intent === 'NOTICE_QUERY') {
      return this.handleNotices();
    }

    // 8. STUDENT_RECORD_QUERY (Attendance, detention risk, achievements)
    if (intent === 'STUDENT_RECORD_QUERY') {
      return this.handleStudentRecord(query, currentUser);
    }

    // 9. GENERAL_INFORMATION (Educational definitions and concept explanations)
    return await this.handleGeneralInformation(query, currentUser);
  }

  // =========================================================================
  // INTENT HANDLERS
  // =========================================================================

  /**
   * GENERAL_ACADEMIC_GUIDANCE:
   * Provides exam preparation advice, study roadmaps, and revision plans using the LLM.
   * STRICT RULE: Never returns the exam date unless specifically requested.
   */
  private async handleGeneralAcademicGuidance(
    rawQuery: string,
    subject: SubjectInfo | null,
    currentUser: User,
    prevContext?: any
  ): Promise<QueryResolutionResult> {
    const subjectName = subject?.name || (prevContext?.subjectName ? prevContext.subjectName : undefined);
    const subjectKey = subject?.key || prevContext?.subject || 'general';

    // Construct enriched prompt for LLM
    const enrichedPrompt = subjectName
      ? `The student is asking for academic study guidance for the course "${subjectName}". Query: "${rawQuery}". Please provide comprehensive, structured study guidance, high-yield conceptual focus areas, practical revision advice, and exam tips. Do NOT invent specific college examination dates.`
      : rawQuery;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: enrichedPrompt,
          studentContext: {
            studentName: currentUser.name,
            department: currentUser.department || 'Computer Science & Engineering',
            semester: (currentUser as any).semester || '6th Semester'
          },
          intent: 'GENERAL_ACADEMIC_GUIDANCE'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.text) {
          return {
            text: data.text,
            badgeType: 'ai_guidance',
            intent: 'GENERAL_ACADEMIC_GUIDANCE',
            followUpContext: {
              intent: 'GENERAL_ACADEMIC_GUIDANCE',
              subject: subjectKey,
              subjectName: subjectName || 'Computer Science',
              subjectCode: subject?.code
            },
            suggestedFollowUps: subject
              ? [
                  `What is the date of my ${subject.key} exam?`,
                  `What topics should I study for ${subject.key}?`,
                  `Do I have an assignment due for ${subject.key}?`
                ]
              : [
                  "What assignments are pending?",
                  "When is my next deadline?",
                  "Is there any event today?"
                ]
          };
        }
      }
    } catch {
      // Local fallback in case server endpoint is unavailable
    }

    // High-quality local academic guidance fallbacks
    return this.getLocalAcademicGuidanceFallback(rawQuery, subject);
  }

  /**
   * EXAM_SCHEDULE:
   * Queries verified CampusLife examination records.
   * If a specific subject is requested (e.g. DBMS), returns the exact verified exam date and details.
   */
  private handleExams(subject: SubjectInfo | null): QueryResolutionResult {
    const allExams = api.getExams();

    // If a specific subject is queried (e.g. DBMS, OS, CN, DAA, AI)
    if (subject) {
      const matched = allExams.find(
        e =>
          e.subjectCode.toLowerCase() === subject.code.toLowerCase() ||
          e.subjectName.toLowerCase().includes(subject.key.toLowerCase()) ||
          e.subjectName.toLowerCase().includes(subject.name.toLowerCase())
      );

      if (matched) {
        return {
          text: `Your verified examination date for **${matched.subjectName}** (${matched.subjectCode}) is scheduled on **${formatDateReadable(matched.date)}** from **${matched.startTime} – ${matched.endTime}** in **${matched.room}**.`,
          badgeType: 'verified',
          intent: 'EXAM_SCHEDULE',
          verifiedData: {
            type: 'exam',
            headline: `${matched.subjectName} — Verified Examination Schedule`,
            items: [
              { label: 'Course', value: `${matched.subjectName} (${matched.subjectCode})` },
              { label: 'Exam Type', value: matched.examType },
              { label: 'Verified Date', value: formatDateReadable(matched.date) },
              { label: 'Time & Duration', value: `${matched.startTime} – ${matched.endTime} (2 Hours)` },
              { label: 'Venue / Hall', value: matched.room },
              { label: 'Maximum Marks', value: `${matched.totalMarks} Marks` },
              { label: 'Instructions', value: matched.instructions }
            ],
            action: { tab: 'exams', label: 'Open Exams & Admit Instructions' }
          },
          followUpContext: {
            intent: 'EXAM_SCHEDULE',
            subject: subject.key,
            subjectName: matched.subjectName,
            subjectCode: matched.subjectCode,
            referencedItem: matched
          },
          suggestedFollowUps: [
            `How should I prepare for it?`,
            `What topics should I study for ${subject.key}?`,
            `Do I have an assignment due for ${subject.key}?`
          ]
        };
      }
    }

    // General upcoming exams list
    return {
      text: `Here is your verified upcoming examination schedule:`,
      badgeType: 'verified',
      intent: 'EXAM_SCHEDULE',
      verifiedData: {
        type: 'exams_list',
        headline: `Mid-Term & Practical Examination Schedule`,
        items: allExams.map(e => ({
          id: e.id,
          subject: e.subjectName,
          code: e.subjectCode,
          type: e.examType,
          date: formatDateReadable(e.date),
          time: `${e.startTime} – ${e.endTime}`,
          room: e.room,
          marks: `${e.totalMarks} Marks`,
          instructions: e.instructions
        })),
        action: { tab: 'exams', label: 'View Exams & Admit Instructions' }
      },
      followUpContext: {
        intent: 'EXAM_SCHEDULE',
        items: allExams
      },
      suggestedFollowUps: [
        "How should I prepare for my DBMS exam?",
        "When is my next deadline?",
        "What is my attendance?"
      ]
    };
  }

  /**
   * ASSIGNMENT_QUERY:
   * Handles student assignment queries: due today, pending, next deadline, or subject-specific.
   */
  private handleAssignmentQuery(
    rawQuery: string,
    subject: SubjectInfo | null,
    currentUser: User
  ): QueryResolutionResult {
    const lower = rawQuery.toLowerCase();
    const allAssignments = api.getAssignments();
    const today = new Date();

    // 1. Next deadline query
    if (lower.includes('next deadline') || lower.includes('upcoming deadline') || lower.includes('next due date')) {
      return this.handleNextDeadline(currentUser);
    }

    // 2. Subject-specific assignment query (e.g. "Do I have an assignment due for DBMS?")
    if (subject) {
      const subjectAssignments = allAssignments.filter(
        a =>
          a.subjectName.toLowerCase().includes(subject.key.toLowerCase()) ||
          a.subjectName.toLowerCase().includes(subject.name.toLowerCase()) ||
          a.subjectId.toLowerCase().includes(subject.key.toLowerCase())
      );

      if (subjectAssignments.length > 0) {
        const pending = subjectAssignments.filter(a => !a.isSubmitted && a.submissionStatus !== 'submitted');
        const countStr = pending.length > 0 ? `${pending.length} pending` : `all submitted`;

        return {
          text: pending.length > 0
            ? `You have **${pending.length} pending assignment${pending.length > 1 ? 's' : ''}** due for **${subject.name}**:`
            : `All assignments for **${subject.name}** are currently submitted and up to date.`,
          badgeType: 'verified',
          intent: 'ASSIGNMENT_QUERY',
          verifiedData: {
            type: 'assignments_list',
            headline: `${subject.key} Assignments (${countStr})`,
            items: subjectAssignments.map(a => ({
              id: a.id,
              title: a.title,
              course: a.subjectName,
              dueDate: formatDateReadable(a.dueDate),
              dueTime: formatTimeReadable(a.dueDate) || '11:59 PM',
              maxMarks: a.maxMarks,
              status: a.isSubmitted || a.submissionStatus === 'submitted' ? 'Submitted ✓' : 'Pending Submission ⚠️',
              description: a.description
            })),
            action: { tab: 'assignments', label: 'Submit in CampusLife' }
          },
          followUpContext: {
            intent: 'ASSIGNMENT_QUERY',
            subject: subject.key,
            subjectName: subject.name,
            referencedItem: subjectAssignments[0]
          },
          suggestedFollowUps: [
            `What is the date of my ${subject.key} exam?`,
            `How should I prepare for my ${subject.key} exam?`,
            "When is my next deadline?"
          ]
        };
      }

      return {
        text: `There are currently no assignments recorded for **${subject.name}** in your verified CampusLife course records.`,
        badgeType: 'verified',
        intent: 'ASSIGNMENT_QUERY',
        suggestedFollowUps: [
          `What is the date of my ${subject.key} exam?`,
          "What assignments are pending?",
          "When is my next deadline?"
        ]
      };
    }

    // 3. Due today
    if (lower.includes('due today') || (lower.includes('today') && lower.includes('assignment'))) {
      return this.handleAssignmentDueToday(currentUser);
    }

    // 4. Pending assignments (general)
    return this.handlePendingAssignments(currentUser);
  }

  /**
   * Syllabus Inquiry:
   * Checks official portal records. If formal syllabus document is absent, states clearly and offers curriculum outline.
   */
  private handleSyllabus(subject: SubjectInfo | null, currentUser: User): QueryResolutionResult {
    const subjects = api.getSubjects();
    const targetSub = subject
      ? subjects.find(s => s.code.toLowerCase() === subject.code.toLowerCase() || s.name.toLowerCase().includes(subject.key.toLowerCase()))
      : subjects[0];

    const courseName = targetSub ? targetSub.name : 'Database Management Systems (CS601)';
    const faculty = targetSub ? targetSub.facultyName : 'Dr. Rajesh Sharma';

    return {
      text: `The official complete syllabus PDF for **${courseName}** is not uploaded to digital repository records. For the signed departmental syllabus handout, please consult course coordinator **${faculty}**.\n\nBased on curriculum guidelines and active mid-term examination units, here is the standard academic syllabus outline:`,
      badgeType: 'verified',
      intent: 'GENERAL_ACADEMIC_GUIDANCE',
      verifiedData: {
        type: 'schedule',
        headline: `${courseName} — Core Curriculum Units`,
        items: [
          { label: 'Unit 1', value: 'Relational Model & Relational Algebra (Tuple & Domain Calculus, ER to Relational Mapping)' },
          { label: 'Unit 2', value: 'SQL & Query Optimization (Advanced Joins, Subqueries, EXPLAIN ANALYZE, Cost Estimation)' },
          { label: 'Unit 3', value: 'Functional Dependencies & Normalization (1NF, 2NF, 3NF, BCNF proofs, Minimal Cover)' },
          { label: 'Unit 4', value: 'Transaction Processing & Concurrency (ACID Properties, Conflict Serializability, 2PL)' },
          { label: 'Unit 5', value: 'Storage Structures & Indexing (Clustered Indexes, B+ Trees, Hashing techniques)' }
        ],
        action: { tab: 'academics', label: 'View Course in Academics' }
      },
      followUpContext: {
        intent: 'GENERAL_ACADEMIC_GUIDANCE',
        subject: subject?.key || 'DBMS',
        subjectName: courseName,
        subjectCode: targetSub?.code
      },
      suggestedFollowUps: [
        `How should I prepare for my ${subject?.key || 'DBMS'} exam?`,
        `What is the date of my ${subject?.key || 'DBMS'} exam?`,
        `Do I have an assignment due for ${subject?.key || 'DBMS'}?`
      ]
    };
  }

  /**
   * GENERAL_INFORMATION:
   * Explains academic and technical concepts (e.g. "What is DBMS?", "Difference between TCP and UDP").
   */
  private async handleGeneralInformation(rawQuery: string, currentUser: User): Promise<QueryResolutionResult> {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: rawQuery,
          studentContext: {
            studentName: currentUser.name,
            department: currentUser.department || 'Computer Science & Engineering',
            semester: (currentUser as any).semester || '6th Semester'
          },
          intent: 'GENERAL_INFORMATION'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.text) {
          return {
            text: data.text,
            badgeType: 'ai_guidance',
            intent: 'GENERAL_INFORMATION',
            suggestedFollowUps: [
              "How should I prepare for my DBMS exam?",
              "What is the date of my DBMS exam?",
              "What assignments are pending?"
            ]
          };
        }
      }
    } catch {
      // Local fallback
    }

    return this.getLocalGeneralConceptFallback(rawQuery);
  }

  // --- SPECIFIC VERIFIED DATA SUB-HANDLERS ---

  private handleEventToday(): QueryResolutionResult {
    const today = new Date();
    const events = api.getEvents();
    const todayEvents = events.filter(e => isSameDay(e.date, today));

    if (todayEvents.length > 0) {
      const evt = todayEvents[0];
      return {
        text: `Yes, there is a college event scheduled for today:`,
        badgeType: 'verified',
        intent: 'EVENT_QUERY',
        verifiedData: {
          type: 'event',
          headline: evt.name,
          items: [
            { label: 'Event Title', value: evt.name },
            { label: 'Date', value: formatDateReadable(evt.date) },
            { label: 'Time', value: evt.time },
            { label: 'Location', value: evt.location },
            { label: 'Organizer', value: evt.organizer },
            { label: 'Category', value: evt.category },
            { label: 'Description', value: evt.description }
          ],
          action: { tab: 'events', label: 'View Event in CampusLife' }
        },
        followUpContext: {
          intent: 'EVENT_QUERY',
          referencedItem: evt,
          items: todayEvents
        },
        suggestedFollowUps: [
          "Who is organizing it?",
          "What is the venue?",
          "What events are happening this week?",
          "Do I have an assignment due today?"
        ]
      };
    }

    return {
      text: "No college events are scheduled for today.",
      badgeType: 'verified',
      intent: 'EVENT_QUERY',
      suggestedFollowUps: [
        "What events are happening this week?",
        "What is my next event?",
        "Do I have an assignment due today?"
      ]
    };
  }

  private handleEventsThisWeek(): QueryResolutionResult {
    const events = api.getEvents();
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 86400000);

    const weekEvents = events.filter(e => {
      const d = new Date(e.date);
      return d >= new Date(now.getFullYear(), now.getMonth(), now.getDate()) && d <= in7Days;
    });

    if (weekEvents.length === 0) {
      return {
        text: "There are no college events scheduled in the upcoming 7 days.",
        badgeType: 'verified',
        intent: 'EVENT_QUERY',
        suggestedFollowUps: [
          "What is my next event?",
          "What assignments are pending?",
          "When is my next deadline?"
        ]
      };
    }

    return {
      text: `Here are the verified events happening this week (${weekEvents.length} event${weekEvents.length > 1 ? 's' : ''}):`,
      badgeType: 'verified',
      intent: 'EVENT_QUERY',
      verifiedData: {
        type: 'events_list',
        headline: `College Events Schedule (This Week)`,
        items: weekEvents.map(e => ({
          id: e.id,
          name: e.name,
          date: formatDateReadable(e.date),
          time: e.time,
          location: e.location,
          organizer: e.organizer,
          category: e.category,
          weekday: getWeekdayName(e.date)
        })),
        action: { tab: 'events', label: 'Browse All Events' }
      },
      followUpContext: {
        intent: 'EVENT_QUERY',
        items: weekEvents,
        referencedItem: weekEvents[0]
      },
      suggestedFollowUps: [
        "Which one is on Friday?",
        "Who is organizing it?",
        "Where is it?",
        "Do I have an assignment due today?"
      ]
    };
  }

  private handleNextEvent(): QueryResolutionResult {
    const events = api.getEvents();
    const now = new Date();
    const upcoming = events
      .filter(e => new Date(e.date) >= new Date(now.getFullYear(), now.getMonth(), now.getDate()))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (upcoming.length > 0) {
      const nextEvt = upcoming[0];
      return {
        text: `Your next upcoming college event is:`,
        badgeType: 'verified',
        intent: 'EVENT_QUERY',
        verifiedData: {
          type: 'event',
          headline: nextEvt.name,
          items: [
            { label: 'Event Title', value: nextEvt.name },
            { label: 'Date', value: `${formatDateReadable(nextEvt.date)} (${getWeekdayName(nextEvt.date)})` },
            { label: 'Time', value: nextEvt.time },
            { label: 'Location', value: nextEvt.location },
            { label: 'Organizer', value: nextEvt.organizer },
            { label: 'Category', value: nextEvt.category },
            { label: 'Description', value: nextEvt.description }
          ],
          action: { tab: 'events', label: 'View in Campus Events' }
        },
        followUpContext: {
          intent: 'EVENT_QUERY',
          referencedItem: nextEvt,
          items: upcoming
        },
        suggestedFollowUps: [
          "Who is organizing it?",
          "What is the venue?",
          "What events are happening this week?",
          "When is my next deadline?"
        ]
      };
    }

    return {
      text: "No upcoming college events found in verified records.",
      badgeType: 'verified',
      intent: 'EVENT_QUERY',
      suggestedFollowUps: [
        "What assignments are pending?",
        "When is my next deadline?"
      ]
    };
  }

  private handleEventQuery(rawQuery: string, prevContext?: any, followUpType?: string): QueryResolutionResult {
    const lower = rawQuery.toLowerCase();

    if (followUpType === 'weekday' && prevContext) {
      return this.handleFollowUpWeekday(lower, prevContext);
    }
    if (followUpType === 'organizer' && prevContext) {
      return this.handleFollowUpOrganizer(prevContext);
    }
    if (followUpType === 'venue' && prevContext) {
      return this.handleFollowUpLocation(prevContext);
    }

    if (lower.includes('today')) {
      return this.handleEventToday();
    }
    if (lower.includes('this week') || lower.includes('happening this week')) {
      return this.handleEventsThisWeek();
    }
    return this.handleNextEvent();
  }

  private handleFollowUpWeekday(lower: string, prevContext: any): QueryResolutionResult {
    const items: EventItem[] = prevContext.items || [];
    const weekdayMatch = ['friday', 'monday', 'tuesday', 'wednesday', 'thursday', 'saturday', 'sunday'].find(day =>
      lower.includes(day)
    );

    if (!weekdayMatch) {
      return {
        text: "Could you specify which day or event you would like more information on?",
        badgeType: 'verified',
        intent: 'EVENT_QUERY'
      };
    }

    const matchedEvt = items.find(e => getWeekdayName(e.date).toLowerCase() === weekdayMatch);

    if (matchedEvt) {
      return {
        text: `The event on **${weekdayMatch.charAt(0).toUpperCase() + weekdayMatch.slice(1)}** is:`,
        badgeType: 'verified',
        intent: 'EVENT_QUERY',
        verifiedData: {
          type: 'event',
          headline: matchedEvt.name,
          items: [
            { label: 'Event Title', value: matchedEvt.name },
            { label: 'Date', value: `${formatDateReadable(matchedEvt.date)} (${getWeekdayName(matchedEvt.date)})` },
            { label: 'Time', value: matchedEvt.time },
            { label: 'Location', value: matchedEvt.location },
            { label: 'Organizer', value: matchedEvt.organizer },
            { label: 'Description', value: matchedEvt.description }
          ],
          action: { tab: 'events', label: 'Open in Events' }
        },
        followUpContext: {
          intent: 'EVENT_QUERY',
          referencedItem: matchedEvt,
          items
        },
        suggestedFollowUps: [
          "Who is organizing it?",
          "What is the venue?",
          "Do I have an assignment due today?"
        ]
      };
    }

    return {
      text: `I couldn't find an official event scheduled for this ${weekdayMatch.charAt(0).toUpperCase() + weekdayMatch.slice(1)} in the current calendar.`,
      badgeType: 'verified',
      intent: 'EVENT_QUERY',
      suggestedFollowUps: [
        "What events are happening this week?",
        "What is my next event?"
      ]
    };
  }

  private handleFollowUpOrganizer(prevContext: any): QueryResolutionResult {
    const item = prevContext.referencedItem || (prevContext.items && prevContext.items[0]);
    if (item && item.organizer) {
      return {
        text: `**${item.name || item.title}** is organized by **${item.organizer}**.`,
        badgeType: 'verified',
        intent: 'EVENT_QUERY',
        verifiedData: {
          type: 'event',
          headline: item.name || item.title,
          items: [
            { label: 'Organizer', value: item.organizer },
            { label: 'Location', value: item.location || 'Campus Academic Complex' },
            { label: 'Time', value: item.time || 'Check schedule' }
          ]
        },
        followUpContext: {
          ...prevContext,
          referencedItem: item
        },
        suggestedFollowUps: [
          "Where is it?",
          "What events are happening this week?",
          "What assignments are pending?"
        ]
      };
    }

    return {
      text: "Which event are you inquiring about the organizer for? Please mention the event name or day.",
      badgeType: 'verified',
      intent: 'EVENT_QUERY'
    };
  }

  private handleFollowUpLocation(prevContext: any): QueryResolutionResult {
    const item = prevContext.referencedItem || (prevContext.items && prevContext.items[0]);
    if (item && item.location) {
      return {
        text: `The venue for **${item.name || item.title}** is **${item.location}**.`,
        badgeType: 'verified',
        intent: 'EVENT_QUERY',
        followUpContext: prevContext,
        suggestedFollowUps: [
          "Who is organizing it?",
          "What events are happening this week?"
        ]
      };
    }

    return {
      text: "Which event's venue would you like to know? Please mention the event name.",
      badgeType: 'verified',
      intent: 'EVENT_QUERY'
    };
  }

  private handleAssignmentDueToday(currentUser: User): QueryResolutionResult {
    const today = new Date();
    const assignments = api.getAssignments();
    const dueToday = assignments.filter(a => isSameDay(a.dueDate, today));

    if (dueToday.length > 0) {
      const asg = dueToday[0];
      const isSubmitted = asg.isSubmitted || asg.submissionStatus === 'submitted';
      return {
        text: isSubmitted
          ? `Yes, you have an assignment due today (already submitted):`
          : `Yes, you have an assignment due today:`,
        badgeType: 'verified',
        intent: 'ASSIGNMENT_QUERY',
        verifiedData: {
          type: 'assignment',
          headline: asg.title,
          items: [
            { label: 'Assignment Title', value: asg.title },
            { label: 'Course / Subject', value: asg.subjectName },
            { label: 'Instructor', value: 'Dr. Rajesh Sharma (Faculty Coordinator)' },
            { label: 'Deadline', value: `Today, ${formatTimeReadable(asg.dueDate) || '11:59 PM'}` },
            { label: 'Status', value: isSubmitted ? 'Submitted' : 'Pending Submission' },
            { label: 'Max Marks', value: `${asg.maxMarks} Marks` },
            { label: 'Instructions', value: asg.description }
          ],
          action: { tab: 'assignments', label: 'Submit in CampusLife' }
        },
        followUpContext: {
          intent: 'ASSIGNMENT_QUERY',
          subject: 'DBMS',
          referencedItem: asg,
          items: dueToday
        },
        suggestedFollowUps: [
          "What assignments are pending?",
          "When is my next deadline?",
          "When is my DBMS exam?"
        ]
      };
    }

    return {
      text: "You have no assignments due today. Your academic submissions are on schedule.",
      badgeType: 'verified',
      intent: 'ASSIGNMENT_QUERY',
      suggestedFollowUps: [
        "What assignments are pending?",
        "When is my next deadline?",
        "Is there any event today?"
      ]
    };
  }

  private handlePendingAssignments(currentUser: User): QueryResolutionResult {
    const assignments = api.getAssignments();
    const pending = assignments.filter(a => !a.isSubmitted && a.submissionStatus !== 'submitted');

    if (pending.length === 0) {
      return {
        text: "Great news! You have no pending assignments right now. All submissions are up to date.",
        badgeType: 'verified',
        intent: 'ASSIGNMENT_QUERY',
        suggestedFollowUps: [
          "When is my next deadline?",
          "When is my next exam?",
          "Is there any event today?"
        ]
      };
    }

    return {
      text: `You have ${pending.length} pending assignment${pending.length > 1 ? 's' : ''}:`,
      badgeType: 'verified',
      intent: 'ASSIGNMENT_QUERY',
      verifiedData: {
        type: 'assignments_list',
        headline: `Pending Assignments (${pending.length})`,
        items: pending.map(a => ({
          id: a.id,
          title: a.title,
          course: a.subjectName,
          dueDate: formatDateReadable(a.dueDate),
          dueTime: formatTimeReadable(a.dueDate),
          maxMarks: a.maxMarks,
          instructor: 'Dr. Rajesh Sharma'
        })),
        action: { tab: 'assignments', label: 'Open Assignments Page' }
      },
      followUpContext: {
        intent: 'ASSIGNMENT_QUERY',
        items: pending,
        referencedItem: pending[0]
      },
      suggestedFollowUps: [
        "When is my next deadline?",
        "Do I have an assignment due today?",
        "How should I prepare for my DBMS exam?"
      ]
    };
  }

  private handleNextDeadline(currentUser: User): QueryResolutionResult {
    const assignments = api.getAssignments();
    const pending = assignments.filter(a => !a.isSubmitted && a.submissionStatus !== 'submitted');
    const exams = api.getExams();
    const now = new Date();

    const deadlines: { title: string; date: string; type: string; subject: string; detail: string; tab: string }[] = [];

    for (const a of pending) {
      deadlines.push({
        title: a.title,
        date: a.dueDate,
        type: 'Assignment',
        subject: a.subjectName,
        detail: `Max Marks: ${a.maxMarks}`,
        tab: 'assignments'
      });
    }

    for (const e of exams) {
      deadlines.push({
        title: `${e.subjectName} (${e.examType})`,
        date: e.date,
        type: 'Examination',
        subject: e.subjectCode,
        detail: `Room: ${e.room} | Time: ${e.startTime}`,
        tab: 'exams'
      });
    }

    deadlines.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const upcoming = deadlines.filter(d => new Date(d.date) >= now);

    if (upcoming.length === 0) {
      return {
        text: "You have no upcoming deadlines in verified records.",
        badgeType: 'verified',
        intent: 'ASSIGNMENT_QUERY',
        suggestedFollowUps: [
          "Is there any event today?",
          "What is my attendance?"
        ]
      };
    }

    const nextOne = upcoming[0];

    return {
      text: `Your next academic deadline is:`,
      badgeType: 'verified',
      intent: 'ASSIGNMENT_QUERY',
      verifiedData: {
        type: 'assignment',
        headline: nextOne.title,
        items: [
          { label: 'Item', value: nextOne.title },
          { label: 'Category', value: nextOne.type },
          { label: 'Subject / Code', value: nextOne.subject },
          { label: 'Deadline Date', value: formatDateReadable(nextOne.date) },
          { label: 'Details', value: nextOne.detail }
        ],
        action: { tab: nextOne.tab, label: `Go to ${nextOne.type}s` }
      },
      followUpContext: {
        intent: 'ASSIGNMENT_QUERY',
        referencedItem: nextOne
      },
      suggestedFollowUps: [
        "What assignments are pending?",
        "When is my next exam?",
        "Is there any event today?"
      ]
    };
  }

  private handleStudentRecord(rawQuery: string, currentUser: User): QueryResolutionResult {
    const analytics = api.getStudentAttendanceAnalytics(currentUser.id);
    const isDetained = analytics.overallPercentage < 75;

    return {
      text: `Here is your verified real-time attendance report:`,
      badgeType: 'verified',
      intent: 'STUDENT_RECORD_QUERY',
      verifiedData: {
        type: 'attendance',
        headline: `Attendance: ${analytics.overallPercentage}% ${isDetained ? '(⚠️ Below 75% Detention Threshold)' : '(✓ Good Standing)'}`,
        items: analytics.subjectWise.map(s => ({
          subject: s.subjectName,
          code: s.subjectCode,
          percentage: `${s.percentage}%`,
          ratio: `${s.presentClasses}/${s.totalClasses} classes attended`,
          status: s.status
        })),
        action: { tab: 'attendance', label: 'Open Geofenced Attendance' }
      },
      suggestedFollowUps: [
        "What assignments are pending?",
        "When is my next deadline?",
        "Is there any event today?"
      ]
    };
  }

  private handleNotices(): QueryResolutionResult {
    const notices = api.getNotices();

    return {
      text: `Here are the latest official notices from the College Administration:`,
      badgeType: 'verified',
      intent: 'NOTICE_QUERY',
      verifiedData: {
        type: 'notices',
        headline: `CampusLife Circulars & Notices (${notices.length})`,
        items: notices.map(n => ({
          id: n.id,
          title: n.title,
          author: n.authorName,
          published: formatDateReadable(n.publishedAt),
          priority: n.priority.toUpperCase(),
          description: n.description
        })),
        action: { tab: 'notices', label: 'View Official Circulars' }
      },
      suggestedFollowUps: [
        "What assignments are pending?",
        "When is my next deadline?",
        "Is there any event today?"
      ]
    };
  }

  private handleEscalation(currentUser: User, userQuery: string): QueryResolutionResult {
    return {
      text: `For your security and compliance with official college bylaws, requests regarding credentials, official fee disputes, or formal administrative appeals cannot be resolved automatically. Please contact the appropriate college office:`,
      badgeType: 'verified',
      intent: 'ACCOUNT/SUPPORT',
      verifiedData: {
        type: 'escalation',
        headline: 'CampusLife Official Administrative Directory',
        items: [
          { title: 'Dean of Academic Affairs', desc: 'Prof. Sunita Rao • Admin Block, Room 104 • Hours: 10 AM - 4 PM (dean.academic@campuslife.edu)' },
          { title: 'Department HOD Office', desc: 'Dr. Rajesh Sharma • CSE Department, Room 201 • Hours: 2 PM - 5 PM' },
          { title: 'IT Services & Portal Support', desc: 'Campus Helpdesk • Library Ground Floor • itsupport@campuslife.edu (Ext: 401)' },
          { title: 'Examination Cell', desc: 'Controller of Examinations • Room 112 • exam.cell@campuslife.edu' }
        ]
      },
      suggestedFollowUps: [
        "What assignments are pending?",
        "When is my next deadline?",
        "Is there any event today?"
      ]
    };
  }

  // --- LOCAL FALLBACKS FOR OFFLINE / RESILIENCE ---

  private getLocalAcademicGuidanceFallback(rawQuery: string, subject: SubjectInfo | null): QueryResolutionResult {
    const subKey = subject?.key || 'DBMS';

    if (subKey === 'DBMS') {
      return {
        text: `### Database Management Systems (CS601) — Exam Preparation Guide

#### 1. High-Yield Conceptual Units
- **Unit 1: Relational Algebra & ER Modeling**: Practice conversion from English business constraints into Relational Algebra operators $(\\sigma, \\pi, \\bowtie, \\div)$ and Tuple Relational Calculus.
- **Unit 2: SQL Mastery & Execution Optimization**: Review subqueries, correlated subqueries, \`HAVING\` vs \`WHERE\`, and query plans (\`EXPLAIN ANALYZE\`).
- **Unit 3: Functional Dependencies & Normalization (Crucial)**:
  - Attribute closure algorithm $(X^+)$
  - Canonical covers and minimal basis
  - 3NF vs. BCNF decomposition proofs (lossless-join property, dependency preservation)
- **Unit 4: Transaction Processing & Concurrency Control**:
  - ACID properties and write-ahead logging (WAL)
  - Conflict serializability with precedence graphs
  - Two-Phase Locking (2PL) vs. Strict 2PL and Deadlock detection
- **Unit 5: Storage & Indexing**: B-Tree and B+ Tree structures, block I/O calculations.

#### 2. Recommended Revision Strategy
1. **Proofs by Hand**: Solve at least 3 attribute closures and Normal Form decompositions step-by-step.
2. **Query Practice**: Write SQL queries on sample schemas (e.g. Student-Course, Employee-Department).
3. **Lab Alignment**: Review your CampusLife **DBMS Lab 5 (SQL Optimization & Indexing)** code.`,
        badgeType: 'ai_guidance',
        intent: 'GENERAL_ACADEMIC_GUIDANCE',
        followUpContext: {
          intent: 'GENERAL_ACADEMIC_GUIDANCE',
          subject: 'DBMS',
          subjectName: 'Database Management Systems (DBMS)',
          subjectCode: 'CS601'
        },
        suggestedFollowUps: [
          "What is the date of my DBMS exam?",
          "What topics should I study for DBMS?",
          "Do I have an assignment due for DBMS?"
        ]
      };
    }

    if (subKey === 'OS') {
      return {
        text: `### Operating Systems (CS602) — Exam Preparation Guide

#### 1. Core High-Yield Topics
- **Process Scheduling**: FCFS, SJF, Round Robin, Multi-Level Feedback Queues (calculate turnaround & waiting times).
- **Process Synchronization**: Critical Section problem, Peterson's algorithm, Counting vs. Binary Semaphores, Producer-Consumer problem.
- **Deadlocks**: Necessary conditions, Resource Allocation Graphs, Banker's Algorithm for avoidance, and detection mechanisms.
- **Memory Management**: Paging, Segmentation, TLB hit/miss calculations, Page Replacement algorithms (FIFO, LRU, Optimal).
- **Virtual Memory**: Demand paging, Thrashing, Working Set Model.`,
        badgeType: 'ai_guidance',
        intent: 'GENERAL_ACADEMIC_GUIDANCE',
        followUpContext: {
          intent: 'GENERAL_ACADEMIC_GUIDANCE',
          subject: 'OS',
          subjectName: 'Operating Systems',
          subjectCode: 'CS602'
        },
        suggestedFollowUps: [
          "What is the date of my OS exam?",
          "When is my next deadline?",
          "What assignments are pending?"
        ]
      };
    }

    return {
      text: `### Academic Preparation & Study Plan for ${subject ? subject.name : rawQuery}

1. **Understand Core Principles**: Focus on foundational algorithms, proofs, and mathematical invariants before attempting complex problems.
2. **Active Problem Solving**: Work through previous semester questions and practice end-to-end numericals and implementations.
3. **Time-Blocked Revision**: Allocate dedicated sessions for high-weightage chapters and create one-page revision cheat sheets.
4. **Lab Integration**: Verify theory using your assignments and practical exercises submitted on the portal.`,
      badgeType: 'ai_guidance',
      intent: 'GENERAL_ACADEMIC_GUIDANCE',
      suggestedFollowUps: [
        "When is my next exam?",
        "What assignments are pending?",
        "When is my next deadline?"
      ]
    };
  }

  private getLocalGeneralConceptFallback(rawQuery: string): QueryResolutionResult {
    const lower = rawQuery.toLowerCase();

    if (lower.includes('tcp') && lower.includes('udp')) {
      return {
        text: `### Difference Between TCP and UDP

**TCP (Transmission Control Protocol)**:
- **Connection-Oriented**: Requires a 3-way handshake (SYN, SYN-ACK, ACK) before data transfer begins.
- **Reliable Delivery**: Uses sequence numbers, positive acknowledgments (ACKs), and automatic retransmissions for lost packets.
- **Flow & Congestion Control**: Dynamically adjusts transmission rate using sliding window algorithms (Slow Start, Congestion Avoidance).
- **Common Protocols**: HTTP/HTTPS, SSH, FTP, SMTP, PostgreSQL/MySQL client connections.

**UDP (User Datagram Protocol)**:
- **Connectionless**: Datagrams are transmitted immediately without initial connection establishment.
- **Unreliable / Best-Effort**: No delivery guarantees, reordering checks, or retransmissions.
- **Low Overhead**: Lightweight 8-byte header (compared to 20–60 bytes in TCP), providing minimal transmission latency.
- **Common Protocols**: DNS queries, VoIP, live video streaming, multiplayer game state synchronization.`,
        badgeType: 'ai_guidance',
        intent: 'GENERAL_INFORMATION',
        suggestedFollowUps: [
          "How should I prepare for my DBMS exam?",
          "What is the date of my DBMS exam?",
          "What assignments are pending?"
        ]
      };
    }

    if (lower.includes('what is dbms') || (lower.includes('dbms') && lower.includes('what'))) {
      return {
        text: `### Database Management Systems (DBMS)

A **Database Management System (DBMS)** is system software that enables users and applications to create, organize, store, query, and manage structured databases securely and efficiently.

#### Core Pillars:
- **Data Abstraction & Independence**: Separates physical storage structures (B+ trees, disk blocks) from logical user views.
- **ACID Transaction Guarantees**: Atomicity, Consistency, Isolation, and Durability ensure system reliability even during hardware failures or concurrent writes.
- **Declarative Querying**: Allows querying via standard languages like SQL without procedural file-access code.
- **Concurrency & Security**: Implements multi-user locking, isolation levels, and role-based permissions (RBAC).`,
        badgeType: 'ai_guidance',
        intent: 'GENERAL_INFORMATION',
        followUpContext: {
          intent: 'GENERAL_INFORMATION',
          subject: 'DBMS',
          subjectName: 'Database Management Systems (DBMS)',
          subjectCode: 'CS601'
        },
        suggestedFollowUps: [
          "How should I prepare for my DBMS exam?",
          "What is the date of my DBMS exam?",
          "Do I have an assignment due for DBMS?"
        ]
      };
    }

    return {
      text: `### Academic Guidance: "${rawQuery}"

When studying this subject:
- Review core theoretical definitions and mathematical models.
- Trace algorithms and proofs step-by-step on paper.
- Connect concepts to your practical lab assignments and active coursework in CampusLife.`,
      badgeType: 'ai_guidance',
      intent: 'GENERAL_INFORMATION',
      suggestedFollowUps: [
        "How should I prepare for my DBMS exam?",
        "What is the date of my DBMS exam?",
        "What assignments are pending?"
      ]
    };
  }
}

export const chatbotService = new ChatbotService();
