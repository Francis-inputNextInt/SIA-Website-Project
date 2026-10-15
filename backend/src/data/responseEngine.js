/**
 * AI Response Engine
 *
 * Keyword-based campus response system. This is the server-side brain
 * for the AI Campus Assistant chat. Exposed via the POST /api/chat endpoint.
 *
 * NOTE: This is the canonical copy. The frontend retains a minimal local
 * fallback for offline resilience, but all normal requests should flow
 * through the backend API.
 */

export const MOCK_RESPONSES = [
  {
    category: 'greeting',
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy', 'sup'],
    responses: [
      "Hello! How can I help you today? You can ask me about admissions, campus buildings, academic programs, scholarships, or library hours.",
      "Hi there! Welcome to the AI Campus Assistant. Feel free to ask any question regarding enrollment, facilities, or student services.",
      "Greetings! I'm here to guide you with campus information, course offerings, registrar services, and school guidelines. What would you like to know?"
    ]
  },
  {
    category: 'enrollment',
    keywords: ['how do i enroll', 'enroll', 'enrollment', 'admission', 'apply', 'application', 'register for classes', 'how to register'],
    responses: [
      "Here is the step-by-step enrollment process:\n\n1. **Online Pre-Registration**: Visit the student admissions portal and complete the online application form.\n2. **Document Submission**: Upload or present your original Form 137/138, Good Moral Certificate, PSA Birth Certificate, and recent 2x2 ID photos.\n3. **Assessment & Advising**: Meet with your academic advisor at the Admissions Office (Admin Building, 1st Floor) to select your curriculum block.\n4. **Payment of Fees**: Proceed to the Cashier or pay online via the Student Portal payment gateway.\n5. **Confirmation & ID Issuance**: Receive your Certificate of Matriculation (COM) and claim your official Student ID at the Student Affairs Center.\n\nWould you like to know more about the required documents or tuition fees?"
    ]
  },
  {
    category: 'requirements',
    keywords: ['requirement', 'requirements', 'documents', 'what do i need to enroll', 'enrollment requirements', 'credentials', 'form 138', 'birth certificate'],
    responses: [
      "Here are the standard enrollment requirements for incoming students:\n\n**For Freshmen / New Students:**\n\u2022 Original Senior High School Report Card (Form 138 / SF9)\n\u2022 Official Transcript of Records / Certificate of Graduation\n\u2022 Original PSA-authenticated Birth Certificate + 2 photocopies\n\u2022 Certificate of Good Moral Character from previous school\n\u2022 2x2 and 1x1 ID pictures (white background, recent)\n\u2022 Completed Online Application Form\n\n**For Transferees:**\n\u2022 Honorable Dismissal / Transfer Credentials\n\u2022 Official Transcript of Records (TOR)\n\u2022 Course description / syllabus of completed subjects\n\nVisit the Admissions Office (Admin Building, 1st Floor) if you have questions about specific programs."
    ]
  },
  {
    category: 'programs',
    keywords: ['program', 'programs', 'course', 'courses', 'degree', 'degrees', 'major', 'majors', 'offered', 'what can i study', 'what programs', 'what courses'],
    responses: [
      "**Available Academic Programs:**\n\n\ud83c\udf93 **College of Computer Studies:**\n\u2022 BS Computer Science\n\u2022 BS Information Technology\n\u2022 BS Information Systems\n\n\ud83c\udfd7\ufe0f **College of Engineering:**\n\u2022 BS Civil Engineering\n\u2022 BS Mechanical Engineering\n\u2022 BS Electrical Engineering\n\u2022 BS Computer Engineering\n\n\ud83d\udcda **College of Education:**\n\u2022 Bachelor of Secondary Education (Major in Math & Science)\n\u2022 Bachelor of Elementary Education\n\n\ud83d\udcbc **College of Business Administration:**\n\u2022 BS Accountancy\n\u2022 BS Business Administration (Major in Marketing Management)\n\u2022 BS Hospitality Management\n\nFor the full list of programs and specializations, visit the Registrar's Office or check the Admissions website."
    ]
  },
  {
    category: 'registrar',
    keywords: ['registrar', 'records', 'transcript', 'tor', 'grades', 'diploma', 'clearance', 'where is the registrar', 'registrar office', 'registrar location'],
    responses: [
      "**Registrar's Office**\n\n\ud83d\udccd **Location:** Admin Building, 2nd Floor\n\ud83d\udd50 **Office Hours:** Monday \u2013 Friday, 8:00 AM \u2013 5:00 PM\n\ud83d\udcde **Contact:** (02) 8888-7777 or registrar@campus.edu.ph\n\n**Available Services:**\n\u2022 Transcript of Records (TOR) \u2014 \u20b150 per copy\n\u2022 Diploma Re-issuance \u2014 \u20b1200 per copy\n\u2022 True Copy of Grades\n\u2022 Certificate of Enrollment\n\u2022 Transfer Credentials\n\u2022 Student Clearance Processing\n\n\ud83d\udca1 **Tip:** For TOR requests, allow 3\u20135 working days for processing. Online requests are available through the Student Portal."
    ]
  },
  {
    category: 'library',
    keywords: ['library', 'librarian', 'book', 'books', 'study', 'study area', 'reading', 'borrow', 'borrowing', 'where is the library'],
    responses: [
      "**University Library & Learning Commons**\n\n\ud83d\udccd **Location:** Library Building, 1st & 2nd Floor\n\ud83d\udd50 **Operating Hours:**\n\u2022 Monday \u2013 Friday: 7:30 AM \u2013 8:00 PM\n\u2022 Saturday: 8:00 AM \u2013 5:00 PM\n\u2022 Sunday: Closed\n\n**Facilities:**\n\ud83d\udcda **1st Floor** \u2014 Circulation desk, book shelves, periodicals section\n\ud83d\udcbb **2nd Floor** \u2014 Computer lab, study rooms, digital resources center\n\ud83d\udcd6 **Reading Area** \u2014 Quiet study zones with individual carrels\n\n**Borrowing Policy:**\n\u2022 Students: Max 3 books, 2-week loan period\n\u2022 Faculty: Max 5 books, 1-month loan period\n\nWiFi is available throughout the library. Use your student credentials to log in."
    ]
  },
  {
    category: 'tuition',
    keywords: ['tuition', 'fee', 'fees', 'payment', 'pay', 'cost', 'how much', 'installment', 'scholarship', 'discount'],
    responses: [
      "**Tuition Fees & Payment Information**\n\n\ud83d\udcb3 **General Fee Information:**\n\u2022 **Undergraduate Tuition:** Approx. $45 \u2013 $75 per credit unit.\n\u2022 **Estimated Semester Cost:** Approx. $750 \u2013 $1,300 per term for a standard load (18\u201324 units).\n\u2022 **Flexible Payment Plans:**\n  - *Full Cash Payment:* 5% discount.\n  - *Installment Scheme:* 30% down payment upon enrollment, balance in 3 equal monthly terms.\n\n**Payment Channels:** Campus Cashier (Admin Building), Online Banking & Student Portal payment gateway."
    ]
  },
  {
    category: 'student_services',
    keywords: ['student services', 'clinic', 'medical', 'guidance', 'counseling', 'scholarship', 'financial aid', 'housing', 'dorm'],
    responses: [
      "**Campus Student Services & Welfare Offices:**\n\n\ud83c\udfe5 **University Health & Dental Clinic:**\n\u2022 *Location:* Student Center, 1st Floor (24/7 medical assistance)\n\n\ud83e\udde0 **Guidance & Counseling Center:**\n\u2022 *Location:* Student Center, Room 205\n\u2022 *Services:* Career coaching, mental health support & peer counseling.\n\n\ud83c\udf1f **Scholarships & Financial Assistance Office:**\n\u2022 *Location:* Admin Building, Room 108\n\u2022 Academic Merit, Athletic Grants, and Government Subsidies (UniFAST / CHED).\n\n\ud83c\udfe2 **Student Housing & Dorms:**\n\u2022 *Location:* North Campus Dormitory Block A"
    ]
  },
  {
    category: 'help',
    keywords: ['help', 'what can you help me with', 'what can you do', 'features', 'guide', 'menu', 'options', 'assistance'],
    responses: [
      "I can help you with a wide range of campus topics:\n\n1. \ud83c\udf93 **Enrollment & Admissions** \u2014 Application steps, deadlines, and requirements.\n2. \ud83d\udcd6 **Academic Programs** \u2014 Degrees, majors, and curriculum details.\n3. \ud83c\udfdb\ufe0f **Registrar & Records** \u2014 Transcripts (TOR), grades, diplomas, and clearances.\n4. \ud83d\udcda **Library & Study Areas** \u2014 Opening hours, locations, and book borrowing.\n5. \ud83d\udcb3 **Tuition & Payment** \u2014 Fee breakdowns, installment plans, and cashier hours.\n6. \ud83c\udfe5 **Student Services** \u2014 Clinic, guidance counseling, and scholarships.\n\nFeel free to type your question below or click any suggested prompt!"
    ]
  }
];

export const FALLBACK_RESPONSES = [
  "I'm not quite sure about that specific detail, but I can help you with **enrollment**, **academic programs**, **registrar services**, **library hours**, **tuition fees**, and **student services**.\n\nYou can also contact the University Helpdesk directly at **helpdesk@campus.edu.ph** or visit the Information Desk at the Main Admin Building.",
  "I don't have information on that particular topic in my current campus guide. Would you like to know about our **admissions requirements**, **degree programs**, **registrar records**, or **library facilities**?",
  "That question is outside my current campus knowledge base. Try asking about **how to enroll**, **programs offered**, **where the registrar is**, or **library facilities**!"
];

/**
 * Match user input with the best response.
 *
 * @param {string} userInput  The user's message text.
 * @returns {{ content: string, category: string } | null}
 */
export function getMockResponse(userInput) {
  if (!userInput || !userInput.trim()) {
    return null;
  }

  const normalizedInput = userInput.toLowerCase().trim();

  // 1. Direct check against categories
  for (const item of MOCK_RESPONSES) {
    for (const keyword of item.keywords) {
      if (normalizedInput.includes(keyword)) {
        const randomIndex = Math.floor(Math.random() * item.responses.length);
        return {
          content: item.responses[randomIndex],
          category: item.category
        };
      }
    }
  }

  // 2. Return fallback response
  const randomFallback = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
  return {
    content: randomFallback,
    category: 'fallback'
  };
}