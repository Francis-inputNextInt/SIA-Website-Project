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


// ── Staff Dashboard Data ───────────────────────────────────────
export const STAFF_METRICS = {
  pendingRequests: 14,
  processingRequests: 8,
  completedToday: 23,
  urgentEscalations: 2,
};

export const STAFF_TICKETS = [
  { id: 'tkt-101', student: 'Alex Johnson', studentId: '2024-00842', type: 'Transcript Request (TOR)', status: 'Pending', date: 'Oct 19, 2026', priority: 'High' },
  { id: 'tkt-102', student: 'Maria Clara Santos', studentId: '2024-01105', type: 'Enrollment / Subject Add-Drop', status: 'Processing', date: 'Oct 18, 2026', priority: 'Medium' },
  { id: 'tkt-103', student: 'Juan Miguel Cruz', studentId: '2024-02311', type: 'Certificate of Enrollment', status: 'Pending', date: 'Oct 19, 2026', priority: 'Low' },
  { id: 'tkt-104', student: 'Bea Alonzo', studentId: '2023-00412', type: 'Student Clearance Processing', status: 'Processing', date: 'Oct 17, 2026', priority: 'High' },
];

export const STAFF_ANNOUNCEMENTS = [
  { id: 's-ann-1', title: 'Advising Queue Open for Q3', body: 'Please ensure all student clearance forms are endorsed by 4:00 PM today.', date: 'Oct 19, 2026', category: 'Advising' },
  { id: 's-ann-2', title: 'Staff Meeting at Conference Room B', body: 'Weekly department alignment on scholarship disbursement and ID renewals.', date: 'Oct 18, 2026', category: 'Department' },
];

// ── Admin Dashboard Data ───────────────────────────────────────
export const ADMIN_METRICS = {
  totalStudents: 3420,
  totalStaff: 184,
  pendingServiceTickets: 22,
  systemHealth: '99.98% Operational',
};

export const ADMIN_USERS = [
  { id: 'u-1', name: 'Alex Johnson', email: 'student@campus.edu', role: 'Student', department: 'Computer Science & IT', status: 'Active' },
  { id: 'u-2', name: 'Dr. Eleanor Vance', email: 'faculty@campus.edu', role: 'Faculty', department: 'Department of Computer Science', status: 'Active' },
  { id: 'u-3', name: 'Marcus Thorne', email: 'staff@campus.edu', role: 'Staff', department: 'Student Affairs & Admissions', status: 'Active' },
  { id: 'u-4', name: 'Dean Victoria Sterling', email: 'admin@campus.edu', role: 'Admin', department: 'Office of the University President', status: 'Active' },
  { id: 'u-5', name: 'Jordan Smith', email: 'applicant@gmail.com', role: 'Applicant', department: 'Prospective Student', status: 'Pending Review' },
];

export const ADMIN_SYSTEM_LOGS = [
  { id: 'log-1', timestamp: 'Oct 19, 2026 14:22', event: 'Database backup successfully completed', type: 'system', user: 'System Cron' },
  { id: 'log-2', timestamp: 'Oct 19, 2026 12:05', event: 'Role updated for staff@campus.edu to Staff', type: 'security', user: 'admin@campus.edu' },
  { id: 'log-3', timestamp: 'Oct 19, 2026 10:14', event: 'New student account created (student@campus.edu)', type: 'auth', user: 'Self-Registration' },
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

export const FACULTY_METRICS = {
  assignedClasses: 4,
  studentInquiries: 7,
  pendingTasks: 3,
  departmentAnnouncements: 2,
};

export const FACULTY_CLASSES = [
  { id: 'cls-1', subject: 'Data Structures & Algorithms', code: 'CS 301', schedule: 'Mon, Wed 8:00 AM – 9:30 AM', room: 'Room 301, CS Building', studentsEnrolled: 42 },
  { id: 'cls-2', subject: 'Advanced Algorithms & Complexity', code: 'CS 401', schedule: 'Tue, Thu 10:00 AM – 11:30 AM', room: 'Lab 204, Engineering Wing', studentsEnrolled: 35 },
  { id: 'cls-3', subject: 'Software Engineering Principles', code: 'CS 350', schedule: 'Fri 1:00 PM – 4:00 PM', room: 'Room 105, CS Building', studentsEnrolled: 38 },
  { id: 'cls-4', subject: 'Senior Thesis Advising', code: 'CS 499', schedule: 'By Appointment', room: 'Faculty Office 402', studentsEnrolled: 12 },
];

export const FACULTY_INQUIRIES = [
  { id: 'inq-201', student: 'Alex Johnson', studentId: '2024-00842', subject: 'Grade Consultation — Midterm Exam', status: 'Pending', date: 'Oct 19, 2026', priority: 'High' },
  { id: 'inq-202', student: 'Maria Clara Santos', studentId: '2024-01105', subject: 'Prerequisite Waiver Request for CS 402', status: 'In Review', date: 'Oct 18, 2026', priority: 'Medium' },
  { id: 'inq-203', student: 'Juan Miguel Cruz', studentId: '2024-02311', subject: 'Absence Excuse Slip (Oct 16)', status: 'Pending', date: 'Oct 19, 2026', priority: 'Low' },
  { id: 'inq-204', student: 'Bea Alonzo', studentId: '2023-00412', subject: 'Research Project Topic Approval', status: 'Approved', date: 'Oct 17, 2026', priority: 'Medium' },
];

export const FACULTY_ANNOUNCEMENTS = [
  { id: 'f-ann-1', title: 'Department Faculty Meeting — Q4 Curriculum Review', body: 'All faculty members are requested to attend the quarterly curriculum alignment meeting at Conference Room A.', date: 'Oct 19, 2026', category: 'Academic' },
  { id: 'f-ann-2', title: 'Midterm Grade Submission Deadline', body: 'Please submit all midterm grades into the faculty portal by Friday, October 24 at 5:00 PM.', date: 'Oct 17, 2026', category: 'Registrar' },
];

