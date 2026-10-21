const fs = require('fs');
const filePath = 'frontend/src/components/dashboards/StudentDashboard.jsx';

const part1 = `import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  BookOpen,
  Award,
  CircleDollarSign,
  CheckCircle2,
  Clock,
  Calendar,
  MapPin,
  Megaphone,
  Download,
  FileText,
  Printer,
  X,
  MessageSquare,
  User,
  Layers,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  Building2,
  CalendarDays
} from 'lucide-react';
import {
  getAnnouncements,
  getMyGrades,
  getMyPayments,
  supabase
} from '../../services/serviceRequestService';

const MOCK_GRADES = [
  { id: 1, subject_code: 'CS 101', subject_title: 'Introduction to Computing', units: 3, grade: '1.25', letter_grade: 'A', grading_period: 'Midterm', faculty_name: 'Dr. Alan Turing' },
  { id: 2, subject_code: 'IT 211', subject_title: 'Data Structures & Algorithms', units: 3, grade: '1.50', letter_grade: 'A-', grading_period: 'Midterm', faculty_name: 'Prof. Ada Lovelace' },
  { id: 3, subject_code: 'GE 5', subject_title: 'Art Appreciation', units: 3, grade: '1.00', letter_grade: 'A+', grading_period: 'Midterm', faculty_name: 'Dr. Leonardo Vinci' },
  { id: 4, subject_code: 'MATH 1', subject_title: 'Calculus I for IT', units: 4, grade: '1.75', letter_grade: 'B+', grading_period: 'Midterm', faculty_name: 'Dr. Isaac Newton' },
  { id: 5, subject_code: 'SIA 101', subject_title: 'Systems Integration & Architecture', units: 3, grade: '1.25', letter_grade: 'A', grading_period: 'Midterm', faculty_name: 'Prof. Grace Hopper' }
];

const MOCK_PAYMENTS = [
  {
    id: 1,
    fee_type: 'Tuition Fee (1st Semester)',
    total_amount: 32500,
    amount_paid: 22500,
    remaining_balance: 10000,
    status: 'Partial',
    academic_year: '2026-2027',
    semester: '1st Semester',
    due_date: 'Nov 15, 2026',
    payment_history: [
      { date: 'Aug 10, 2026', amount: 15000, channel: 'Bank Transfer (BDO)', reference_no: 'TRX-982341' },
      { date: 'Sep 12, 2026', amount: 7500, channel: 'GCash', reference_no: 'GCASH-441290' }
    ]
  },
  {
    id: 2,
    fee_type: 'Laboratory & Computer Fee',
    total_amount: 6200,
    amount_paid: 6200,
    remaining_balance: 0,
    status: 'Paid',
    academic_year: '2026-2027',
    semester: '1st Semester',
    due_date: 'Sep 30, 2026',
    payment_history: [
      { date: 'Aug 15, 2026', amount: 6200, channel: 'Over-the-Counter (Cashier)', reference_no: 'OR-110294' }
    ]
  },
  {
    id: 3,
    fee_type: 'Miscellaneous & Library Fee',
    total_amount: 5000,
    amount_paid: 1800,
    remaining_balance: 3200,
    status: 'Partial',
    academic_year: '2026-2027',
    semester: '1st Semester',
    due_date: 'Nov 15, 2026',
    payment_history: [
      { date: 'Aug 12, 2026', amount: 1800, channel: 'Maya', reference_no: 'MAYA-883492' }
    ]
  }
];

const SCHEDULE = [
  { id: 1, code: 'SIA 101', subject: 'Systems Integration & Architecture', time: '08:00 AM - 11:00 AM', room: 'Lab 402', instructor: 'Prof. Grace Hopper', type: 'Lecture / Lab' },
  { id: 2, code: 'IT 211', subject: 'Data Structures & Algorithms', time: '01:00 PM - 04:00 PM', room: 'Room 301', instructor: 'Prof. Ada Lovelace', type: 'Lecture' },
  { id: 3, code: 'MATH 1', subject: 'Calculus I for IT', time: '09:00 AM - 10:30 AM', room: 'Room 204', instructor: 'Dr. Isaac Newton', type: 'Lecture' }
];

const DEADLINES = [
  { id: 1, title: 'Midterm Project Submission: Cloud Architecture', course: 'SIA 101', date: 'Oct 28, 2026', type: 'project', urgent: true },
  { id: 2, title: 'Database Normalization Assignment', course: 'IT 211', date: 'Nov 02, 2026', type: 'assignment', urgent: false },
  { id: 3, title: 'Tuition Balance 2nd Installment Due', course: 'Accounting Office', date: 'Nov 15, 2026', type: 'registration', urgent: true }
];

const QUICK_ACTIONS = [
  { id: 'chat', title: 'AI Campus Assistant', description: 'Ask questions about enrollment, schedules, and campus services 24/7.', icon: 'MessageSquare', color: 'blue' },
  { id: 'services', title: 'Service Requests', description: 'File requests for clearance, transcripts, ID replacement, or certificates.', icon: 'Layers', color: 'emerald' },
  { id: 'calendar', title: 'Academic Calendar', description: 'View enrollment dates, examination weeks, holidays, and campus events.', icon: 'Calendar', color: 'violet' },
  { id: 'profile', title: 'Student Profile', description: 'Manage your personal details, emergency contacts, and account security.', icon: 'User', color: 'amber' }
];

const ACTION_ICONS = { MessageSquare, Layers, Calendar, User };

const ACTION_COLORS = {
  blue:    { bg: 'bg-blue-50',    border: 'border-blue-200',    icon: 'bg-blue-600 text-white',    hover: 'hover:border-blue-400' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'bg-emerald-600 text-white', hover: 'hover:border-emerald-400' },
  violet:  { bg: 'bg-violet-50',  border: 'border-violet-200',  icon: 'bg-violet-600 text-white',  hover: 'hover:border-violet-400' },
  amber:   { bg: 'bg-amber-50',   border: 'border-amber-200',   icon: 'bg-amber-500 text-white',   hover: 'hover:border-amber-400' },
};

const PRIORITY_STYLES = {
  high:   'bg-rose-50 text-rose-700 border border-rose-200',
  medium: 'bg-amber-50 text-amber-700 border border-amber-200',
  low:    'bg-blue-50 text-blue-700 border border-blue-200',
};

const TYPE_STYLES = {
  assignment:   'bg-blue-100 text-blue-700',
  exam:         'bg-rose-100 text-rose-700',
  project:      'bg-violet-100 text-violet-700',
  registration: 'bg-emerald-100 text-emerald-700',
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getFormattedDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
`;

fs.writeFileSync(filePath, part1, 'utf8');
console.log('part1 done');
