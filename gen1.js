const fs = require('fs');
const path = 'frontend/src/components/dashboards/StudentDashboard.jsx';

const part1 = `import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Calendar,
  Clock,
  MessageSquare,
  BookOpen,
  User,
  Building2,
  AlertTriangle,
  CalendarDays,
  MapPin,
  Megaphone,
  Star,
  Award,
  CircleDollarSign,
  FileText,
  Printer,
  Download,
  CheckCircle2,
  RefreshCw,
  X,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import {
  SCHEDULE,
  DEADLINES,
  QUICK_ACTIONS,
  MOCK_GRADES,
  MOCK_PAYMENTS,
} from '../../data/dashboardData';
import { getAnnouncements, getMyGrades, getMyPayments } from '../../services/serviceRequestService';
import { supabase } from '../../services/supabase';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getFormattedDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const ACTION_ICONS = { MessageSquare, CalendarDays, User, Building2 };
`;

fs.writeFileSync(path, part1, 'utf8');
console.log('gen1 done');
