/**
 * POST /api/chat
 * Receives a user message and optional conversation history,
 * queries Groq API (llama-3.3-70b-versatile), uses Supabase context for authorized users,
 * and falls back gracefully to responseEngine.
 */
import { Router } from 'express';
import Groq from 'groq-sdk';
import { getMockResponse } from '../data/responseEngine.js';
import { getAdminClient } from '../config/supabase.js';

const router = Router();
const limits = new Map();

function checkRate(ip) {
  const now = Date.now();
  let r = limits.get(ip);
  if (!r || now - r.time > 60000) { r = { time: now, count: 1 }; limits.set(ip, r); return true; }
  if (r.count >= 25) return false;
  r.count++; return true;
}

function getGroq() {
  const k = process.env.GROQ_API_KEY;
  if (!k || k === 'gsk_your_groq_api_key_here' || !k.trim()) return null;
  return new Groq({ apiKey: k });
}

const tools = [
  {
    type: 'function',
    function: {
      name: 'get_student_profile',
      description: 'Get the authenticated student profile including name, student ID, department, year level, and email.',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_student_grades',
      description: 'Get the authenticated student academic grades, subject codes, titles, units, grades, and letter grades.',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_student_payments',
      description: 'Get the authenticated student tuition fee balance, total amount, amount paid, remaining balance, status, and payment history.',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_announcements',
      description: 'Get recent university announcements and notices.',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_service_requests',
      description: 'Get the authenticated student campus service requests and status.',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_assignments',
      description: 'Get student assignments, homework, and deadlines. (Note: assignments table does not exist in the database).',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_schedule',
      description: 'Get student class schedules and timetable. (Note: schedules table does not exist in the database).',
      parameters: { type: 'object', properties: {} }
    }
  }
];

async function execTool(name, user) {
  if (!user || !user.id) {
    console.warn('[chat-tool] Unauthorized tool execution attempt for tool:', name);
    return { error: 'Authentication required. Please log in with a valid student account to access personal records.' };
  }

  const db = getAdminClient();
  if (!db) {
    console.error('[chat-tool] Database unconfigured.');
    return { error: 'Database unconfigured.' };
  }

  console.log('[chat-tool] Executing tool:', name, 'for user id:', user.id.substring(0, 8) + '...');

  try {
    switch (name) {
      case 'get_student_profile': {
        const { data, error } = await db.from('profiles').select('*').eq('id', user.id).single();
        if (error) {
          console.warn('[chat-tool] profiles query error:', error.message);
          return { error: error.message };
        }
        console.log('[chat-tool] profiles fetched successfully for user:', user.id.substring(0, 8) + '...');
        return { profile: data || null };
      }
      case 'get_student_grades': {
        const { data, error } = await db.from('grades').select('*').eq('user_id', user.id);
        if (error) {
          console.warn('[chat-tool] grades query error:', error.message);
          return { error: error.message };
        }
        console.log('[chat-tool] grades count fetched:', data?.length || 0);
        return { grades: data || [], count: data?.length || 0 };
      }
      case 'get_student_payments': {
        const { data, error } = await db.from('payments').select('*').eq('user_id', user.id);
        if (error) {
          console.warn('[chat-tool] payments query error:', error.message);
          return { error: error.message };
        }
        console.log('[chat-tool] payments count fetched:', data?.length || 0);
        return { payments: data || [], count: data?.length || 0 };
      }
      case 'get_announcements': {
        const { data, error } = await db.from('announcements').select('*').order('created_at', { ascending: false }).limit(10);
        if (error) {
          console.warn('[chat-tool] announcements query error:', error.message);
          return { error: error.message };
        }
        console.log('[chat-tool] announcements count fetched:', data?.length || 0);
        return { announcements: data || [], count: data?.length || 0 };
      }
      case 'get_service_requests': {
        const { data, error } = await db.from('service_requests').select('*').eq('user_id', user.id);
        if (error) {
          console.warn('[chat-tool] service_requests query error:', error.message);
          return { error: error.message };
        }
        console.log('[chat-tool] service_requests count fetched:', data?.length || 0);
        return { service_requests: data || [], count: data?.length || 0 };
      }
      case 'get_assignments': {
        console.log('[chat-tool] assignments table requested but missing in schema.');
        return {
          error: 'Table assignments does not exist in the database.',
          table_missing: 'assignments',
          message: 'Assignments, homeworks, and deadlines are not currently stored in the university database.'
        };
      }
      case 'get_schedule': {
        console.log('[chat-tool] schedules table requested but missing in schema.');
        return {
          error: 'Table schedules does not exist in the database.',
          table_missing: 'schedules',
          message: 'Class schedules and timetables are not currently stored in the university database.'
        };
      }
      default:
        return { error: `Unknown tool function: ${name}` };
    }
  } catch (err) {
    console.error('[chat-tool] Exception during tool execution:', err.message);
    return { error: err.message };
  }
}

function isPersonalQuestion(msg) {
  const m = msg.toLowerCase();
  const keywords = [
    'my name', 'who am i', 'profile', 'my account', 'my id',
    'balance', 'tuition', 'payment', 'fee', 'bill', 'how much do i owe', 'remaining balance',
    'grade', 'grades', 'score', 'gpa', 'subject',
    'assignment', 'homework', 'deadline', 'task',
    'schedule', 'timetable', 'class schedule', 'my schedule',
    'announcement', 'service request', 'my requests'
  ];
  return keywords.some(k => m.includes(k));
}

async function fetchStudentRecords(userId) {
  const db = getAdminClient();
  if (!db || !userId) return null;

  try {
    const [profileRes, gradesRes, paymentsRes, requestsRes] = await Promise.all([
      db.from('profiles').select('*').eq('id', userId).single(),
      db.from('grades').select('*').eq('user_id', userId),
      db.from('payments').select('*').eq('user_id', userId),
      db.from('service_requests').select('*').eq('user_id', userId)
    ]);

    console.log('[chat-db] Pre-fetched student records successfully for user ID prefix:', userId.substring(0, 8) + '...');
    return {
      profile: profileRes.data || null,
      grades: gradesRes.data || [],
      payments: paymentsRes.data || [],
      serviceRequests: requestsRes.data || []
    };
  } catch (err) {
    console.warn('[chat-db] Error pre-fetching student records:', err.message);
    return null;
  }
}

function formatStudentContext(records) {
  if (!records) return '';
  let ctx = '\n\n=== VERIFIED STUDENT DATABASE RECORDS (SOURCE OF TRUTH) ===\n';
  
  if (records.profile) {
    const p = records.profile;
    ctx += `- Name: ${p.full_name}\n`;
    ctx += `- Student ID: ${p.student_id || 'Not specified'}\n`;
    ctx += `- Email: ${p.email}\n`;
    ctx += `- Role: ${p.role}\n`;
    ctx += `- Department: ${p.department || 'Not specified'}\n`;
    ctx += `- Year Level: ${p.year_level || 'Not specified'}\n`;
    ctx += `- Enrolled Status: ${p.enrolled ? 'Enrolled' : 'Not Enrolled'}\n`;
  } else {
    ctx += `- Profile: None found in database.\n`;
  }

  if (records.grades && records.grades.length > 0) {
    ctx += `- Grades (${records.grades.length} recorded):\n`;
    records.grades.forEach(g => {
      ctx += `  * ${g.subject_code} (${g.subject_title}): Grade = ${g.grade ?? 'Pending'}, Letter = ${g.letter_grade}, Period = ${g.grading_period}, Semester = ${g.semester} (${g.academic_year})\n`;
    });
  } else {
    ctx += `- Grades: No grade records found in database.\n`;
  }

  if (records.payments && records.payments.length > 0) {
    ctx += `- Tuition & Payments (${records.payments.length} record):\n`;
    records.payments.forEach(pay => {
      ctx += `  * ${pay.fee_type}: Total ₱${pay.total_amount}, Paid ₱${pay.amount_paid}, Remaining Balance ₱${pay.remaining_balance}, Status = ${pay.status}\n`;
      if (pay.payment_history && pay.payment_history.length > 0) {
        ctx += `    Payment History: ${pay.payment_history.map(h => `₱${h.amount} via ${h.channel} on ${h.date}`).join('; ')}\n`;
      }
    });
  } else {
    ctx += `- Tuition & Payments: No payment records found in database.\n`;
  }

  if (records.serviceRequests && records.serviceRequests.length > 0) {
    ctx += `- Service Requests (${records.serviceRequests.length}):\n`;
    records.serviceRequests.forEach(sr => {
      ctx += `  * ${sr.service_type}: Status = ${sr.status} (${sr.description || ''})\n`;
    });
  } else {
    ctx += `- Service Requests: None found.\n`;
  }

  ctx += `- Assignments & Deadlines: NOT STORED IN DATABASE (Table assignments does not exist).\n`;
  ctx += `- Class Schedule: NOT STORED IN DATABASE (Table schedules does not exist).\n`;
  ctx += '===========================================================\n';
  return ctx;
}

function generateDeterministicPersonalResponse(message, records) {
  if (!records || !records.profile) {
    return "I found your authenticated session, but your student profile record could not be located in the database.";
  }

  const m = message.toLowerCase();
  const p = records.profile;

  if (m.includes('name') || m.includes('who am i') || m.includes('profile')) {
    return `Your student profile details from the verified university database:\n\n- **Full Name:** ${p.full_name}\n- **Student ID:** ${p.student_id || 'N/A'}\n- **Email:** ${p.email}\n- **Department:** ${p.department || 'N/A'}\n- **Year Level:** ${p.year_level || 'N/A'}\n- **Status:** ${p.enrolled ? 'Enrolled' : 'Not Enrolled'}`;
  }

  if (m.includes('balance') || m.includes('tuition') || m.includes('payment') || m.includes('fee') || m.includes('owe') || m.includes('bill')) {
    if (!records.payments || records.payments.length === 0) {
      return `Hello ${p.full_name}, no tuition fee or payment records were found for your account in the database.`;
    }
    let resp = `Here is your tuition balance and payment summary from the verified database:\n\n`;
    records.payments.forEach(pay => {
      resp += `- **Fee Type:** ${pay.fee_type}\n`;
      resp += `- **Total Amount:** ₱${pay.total_amount}\n`;
      resp += `- **Amount Paid:** ₱${pay.amount_paid}\n`;
      resp += `- **Remaining Balance:** ₱${pay.remaining_balance}\n`;
      resp += `- **Status:** ${pay.status}\n`;
      if (pay.due_date) {
        resp += `- **Due Date:** ${new Date(pay.due_date).toLocaleDateString()}\n`;
      }
      if (pay.payment_history && pay.payment_history.length > 0) {
        resp += `\n**Payment History:**\n`;
        pay.payment_history.forEach(h => {
          resp += `• ₱${h.amount} paid on ${h.date} via ${h.channel} (Ref: ${h.reference_no})\n`;
        });
      }
    });
    return resp;
  }

  if (m.includes('grade') || m.includes('score') || m.includes('gpa')) {
    if (!records.grades || records.grades.length === 0) {
      return `Hello ${p.full_name}, no academic grades have been posted to your account yet in the database.`;
    }
    let resp = `Here are your official academic grades from the verified database:\n\n`;
    records.grades.forEach(g => {
      resp += `• **${g.subject_code}** (${g.subject_title}): **${g.grade ?? 'Pending'}** (Letter: ${g.letter_grade}) — ${g.grading_period}, ${g.semester} (${g.academic_year})\n`;
    });
    return resp;
  }

  if (m.includes('assignment') || m.includes('deadline') || m.includes('homework') || m.includes('task')) {
    return `Note on Assignments & Deadlines: Assignments, homeworks, and class deadlines are not currently stored or tracked in the university database.`;
  }

  if (m.includes('schedule') || m.includes('timetable') || m.includes('class')) {
    return `Note on Class Schedule: Class schedules and timetables are not currently stored in the university database.`;
  }

  let resp = `Hello ${p.full_name}! Here is a summary of your account records from the verified database:\n\n`;
  resp += `- **Student ID:** ${p.student_id || 'N/A'}\n`;
  resp += `- **Department:** ${p.department || 'N/A'}\n`;
  if (records.payments && records.payments.length > 0) {
    const bal = records.payments[0].remaining_balance;
    resp += `- **Tuition Balance:** ₱${bal}\n`;
  }
  if (records.grades && records.grades.length > 0) {
    resp += `- **Grades Recorded:** ${records.grades.length} subject(s)\n`;
  }
  return resp;
}

router.post('/chat', async (req, res, next) => {
  try {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    if (!checkRate(ip)) {
      return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
    }

    const { message, history } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const trimmed = message.trim();
    if (trimmed.length > 2000) {
      return res.status(400).json({ error: 'Message exceeds 2000-character limit.' });
    }

    const sanitizedHistory = Array.isArray(history)
      ? history
          .filter(h => h && (h.role === 'user' || h.role === 'assistant') && typeof h.content === 'string')
          .slice(-10)
          .map(h => ({ role: h.role, content: h.content.trim().substring(0, 2000) }))
      : [];

    let authUser = null;
    let studentRecords = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const db = getAdminClient();
      if (db && token) {
        try {
          const { data: { user }, error: authErr } = await db.auth.getUser(token);
          if (user && !authErr) {
            authUser = user;
            console.log('[chat] Authenticated user verified, ID prefix:', user.id.substring(0, 8) + '...');
            studentRecords = await fetchStudentRecords(user.id);
          } else {
            console.warn('[chat] Invalid bearer token or user not found.');
          }
        } catch (e) {
          console.warn('[chat] Auth verification exception:', e.message);
        }
      }
    } else {
      console.log('[chat] Request received without Authorization header (unauthenticated).');
    }

    const studentContextStr = formatStudentContext(studentRecords);

    const systemPrompt = `You are the official AI Campus Assistant for the University.
Rules:
1. Student Identity & Security: Identity is derived exclusively from the verified backend Supabase auth token. Never trust frontend IDs or user claims. Enforce RLS: only access records belonging to the authenticated user.
2. Verified Database Records as Source of Truth: For grades, tuition balance, payment history, student profile, announcements, or service requests, ALWAYS use the provided database records and tool functions. Never guess, assume, or fabricate personal data.
3. Missing Tables / Records: For assignments, homeworks, schedules, or deadlines, if the database records or tool report that the table does not exist, honestly and clearly explain that those records are not stored in the database instead of fabricating mock data.
4. General Campus Info: For general inquiries (library hours, admissions process, registrar location, programs), answer accurately and politely.
5. Tone: Be concise, polite, professional, and helpful.${studentContextStr}`;

    const groq = getGroq();
    let content = '';
    let category = 'ai';
    let usedGroq = false;

    if (groq) {
      try {
        const messages = [
          { role: 'system', content: systemPrompt },
          ...sanitizedHistory,
          { role: 'user', content: trimmed }
        ];

        console.log('[chat] Sending request to Groq with tool definitions...');
        let completion = await groq.chat.completions.create({
          model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
          messages,
          tools,
          tool_choice: 'auto',
          temperature: 0.7,
          max_tokens: 1024
        });

        const responseMessage = completion.choices?.[0]?.message;
        console.log('[chat] Groq response received. Tool calls requested:', responseMessage?.tool_calls?.length || 0);

        if (responseMessage?.tool_calls && responseMessage.tool_calls.length > 0) {
          messages.push(responseMessage);
          for (const tc of responseMessage.tool_calls) {
            console.log('[chat] Executing tool call requested by Groq:', tc.function.name);
            const toolResult = await execTool(tc.function.name, authUser);
            messages.push({
              role: 'tool',
              tool_call_id: tc.id,
              content: JSON.stringify(toolResult)
            });
          }

          console.log('[chat] Sending follow-up request to Groq with tool results...');
          const completion2 = await groq.chat.completions.create({
            model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
            messages,
            temperature: 0.7,
            max_tokens: 1024
          });
          content = completion2.choices?.[0]?.message?.content || '';
          console.log('[chat] Groq final response generated with tools. Length:', content.length);
        } else {
          content = responseMessage?.content || '';
          console.log('[chat] Groq direct text response generated. Length:', content.length);
        }

        if (content.trim()) {
          usedGroq = true;
        } else {
          throw new Error('Empty response from Groq');
        }
      } catch (err) {
        console.warn('[chat] Groq / tool execution failed:', err.message);
      }
    } else {
      console.log('[chat] Groq client not configured or missing API key.');
    }

    if (!usedGroq) {
      if (authUser && studentRecords && isPersonalQuestion(trimmed)) {
        console.log('[chat] Groq unavailable/failed for authenticated personal query. Using deterministic Supabase data handler.');
        content = generateDeterministicPersonalResponse(trimmed, studentRecords);
        category = 'personal';
      } else {
        console.log('[chat] Using responseEngine fallback.');
        const fb = getMockResponse(trimmed);
        content = fb.content;
        category = fb.category;
      }
    }

    res.json({
      id: `ai-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      role: 'assistant',
      content,
      category,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  } catch (err) {
    console.error('[chat] Unhandled error in POST /api/chat:', err.message);
    next(err);
  }
});

export default router;


