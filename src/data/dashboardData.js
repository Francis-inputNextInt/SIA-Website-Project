/**
 * Dashboard Mock Data
 * Static data for the Student Dashboard — schedule, deadlines, announcements.
 * Follows the same mock-data pattern used in mockResponses.js.
 */

export const SCHEDULE = [
  {
    id: 'sch-1',
    subject: 'Data Structures & Algorithms',
    code: 'CS 301',
    time: '8:00 AM – 9:30 AM',
    room: 'Room 301, CS Building',
    instructor: 'Dr. Eleanor Vance',
    type: 'Lecture',
  },
  {
    id: 'sch-2',
    subject: 'Operating Systems',
    code: 'CS 302',
    time: '10:00 AM – 11:30 AM',
    room: 'Lab 204, Engineering Wing',
    instructor: 'Prof. Michael Torres',
    type: 'Lab',
  },
  {
    id: 'sch-3',
    subject: 'Technical Writing',
    code: 'ENG 201',
    time: '1:00 PM – 2:30 PM',
    room: 'Room 105, Humanities Block',
    instructor: 'Ms. Sarah Lin',
    type: 'Lecture',
  },
  {
    id: 'sch-4',
    subject: 'Discrete Mathematics',
    code: 'MATH 210',
    time: '3:00 PM – 4:30 PM',
    room: 'Room 402, Math Building',
    instructor: 'Dr. Rachel Kim',
    type: 'Tutorial',
  },
];

export const DEADLINES = [
  {
    id: 'dl-1',
    title: 'Problem Set 4 — Binary Trees',
    course: 'CS 301 · Data Structures & Algorithms',
    date: 'Sep 12, 2026',
    type: 'assignment',
    urgent: true,
  },
  {
    id: 'dl-2',
    title: 'Midterm Exam',
    course: 'CS 302 · Operating Systems',
    date: 'Sep 18, 2026',
    type: 'exam',
    urgent: false,
  },
  {
    id: 'dl-3',
    title: 'Research Paper Draft',
    course: 'ENG 201 · Technical Writing',
    date: 'Sep 22, 2026',
    type: 'project',
    urgent: false,
  },
  {
    id: 'dl-4',
    title: 'Midterm Registration Deadline',
    course: 'General — Registrar',
    date: 'Sep 30, 2026',
    type: 'registration',
    urgent: false,
  },
];

export const ANNOUNCEMENTS = [
  {
    id: 'ann-1',
    title: 'Midterm Examination Schedule Released',
    body: 'The midterm examination schedule for the current semester has been posted. Check the registrar\'s portal for your individual exam timetable.',
    date: 'Sep 8, 2026',
    priority: 'high',
    category: 'Academic',
  },
  {
    id: 'ann-2',
    title: 'Campus Wi-Fi Maintenance — Sept 10',
    body: 'Network services will undergo scheduled maintenance from 12:00 AM to 4:00 AM. Expect intermittent connectivity during this window.',
    date: 'Sep 7, 2026',
    priority: 'medium',
    category: 'IT Services',
  },
  {
    id: 'ann-3',
    title: 'Student Council Election Nominations Open',
    body: 'Nominations for the Student Council 2026–2027 term are now open. Submit your candidacy at the Student Affairs Office before Sept 20.',
    date: 'Sep 5, 2026',
    priority: 'low',
    category: 'Campus Life',
  },
];

export const QUICK_ACTIONS = [
  {
    id: 'qa-1',
    title: 'AI Assistant',
    description: 'Ask questions about campus, enrollment, and services.',
    icon: 'MessageSquare',
    color: 'blue',
  },
  {
    id: 'qa-2',
    title: 'Academic Calendar',
    description: 'View important academic dates and holidays.',
    icon: 'CalendarDays',
    color: 'emerald',
  },
  {
    id: 'qa-3',
    title: 'Student Profile',
    description: 'View and update your personal information.',
    icon: 'User',
    color: 'violet',
  },
  {
    id: 'qa-4',
    title: 'Student Services',
    description: 'Access clinic, guidance, and scholarship offices.',
    icon: 'Building2',
    color: 'amber',
  },
];
