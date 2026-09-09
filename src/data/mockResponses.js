/**
 * Mock Response System for AI Campus Assistant
 * 
 * This temporary mock system simulates intelligent campus responses
 * based on keyword pattern matching. It will be seamlessly replaced
 * by the real OpenAI API service in the future phase.
 */

export const INITIAL_ASSISTANT_MESSAGE = {
  id: 'welcome-msg',
  role: 'assistant',
  content: "Hello! I'm your AI Campus Assistant. I can help you with campus information, enrollment, academic programs, student services, and other school-related questions.",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  category: 'welcome'
};

export const SUGGESTED_QUESTIONS = [
  {
    id: 'sq-1',
    text: 'How do I enroll?',
    category: 'enrollment',
    icon: 'GraduationCap'
  },
  {
    id: 'sq-2',
    text: 'What programs are offered?',
    category: 'programs',
    icon: 'BookOpen'
  },
  {
    id: 'sq-3',
    text: 'What are the enrollment requirements?',
    category: 'requirements',
    icon: 'FileCheck'
  },
  {
    id: 'sq-4',
    text: 'Where is the registrar?',
    category: 'registrar',
    icon: 'Building2'
  },
  {
    id: 'sq-5',
    text: 'Where is the library?',
    category: 'library',
    icon: 'Library'
  },
  {
    id: 'sq-6',
    text: 'What can you help me with?',
    category: 'help',
    icon: 'HelpCircle'
  }
];

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
      `Here is the step-by-step enrollment process:\n\n1. **Online Pre-Registration**: Visit the student admissions portal and complete the online application form.\n2. **Document Submission**: Upload or present your original Form 137/138, Good Moral Certificate, PSA Birth Certificate, and recent 2x2 ID photos.\n3. **Assessment & Advising**: Meet with your academic advisor at the Admissions Office (Admin Building, 1st Floor) to select your curriculum block.\n4. **Payment of Fees**: Proceed to the Cashier or pay online via the Student Portal payment gateway.\n5. **Confirmation & ID Issuance**: Receive your Certificate of Matriculation (COM) and claim your official Student ID at the Student Affairs Center.\n\nWould you like to know more about the required documents or tuition fees?`
    ]
  },
  {
    category: 'requirements',
    keywords: ['requirement', 'requirements', 'documents', 'what do i need to enroll', 'enrollment requirements', 'credentials', 'form 138', 'birth certificate'],
    responses: [
      `Here are the standard enrollment requirements for incoming students:\n\n**For Freshmen / New Students:**\n• Original Senior High School Report Card (Form 138 / SF9)\n• Official Transcript of Records / Certificate of Graduation\n• Original PSA-authenticated Birth Certificate + 2 photocopies\n• Certificate of Good Moral Character from previous school principal/counselor\n• 4 pieces of recent 2x2 ID pictures with white background\n• Barangay Clearance or Certificate of Residency\n\n**For Transferees:**\n• Honorable Dismissal / Certificate of Transfer Credential\n• Certified True Copy of Grades / Transcript of Records for evaluation\n• Certificate of Good Moral Character\n• PSA Birth Certificate\n\nAll documents should be submitted to the **Admissions Office, Room 102, Main Administration Building**.`
    ]
  },
  {
    category: 'programs',
    keywords: ['programs', 'courses', 'degrees', 'majors', 'curriculum', 'academics', 'what programs', 'what courses', 'offer'],
    responses: [
      `Our campus offers a comprehensive range of accredited undergraduate programs:\n\n**🏛️ College of Computer Studies:**\n• BS in Computer Science (BSCS) — AI & Data Science Track\n• BS in Information Technology (BSIT) — Cyber Security & Cloud\n• BS in Information Systems (BSIS)\n\n**💼 College of Business & Accountancy:**\n• BS in Accountancy (BSA)\n• BS in Business Administration (Marketing & Finance)\n• BS in Hospitality Management (BSHM)\n\n**⚙️ College of Engineering:**\n• BS in Civil Engineering (BSCE)\n• BS in Computer Engineering (BSCpE)\n• BS in Industrial Engineering (BSIE)\n\n**📚 College of Arts & Sciences:**\n• Bachelor of Secondary Education\n• BA in Communication\n• BS in Psychology\n\nDetailed curriculum guides are available at the Admissions Office or online portal.`
    ]
  },
  {
    category: 'registrar',
    keywords: ['registrar', 'records', 'transcript', 'tor', 'grades', 'diploma', 'clearance', 'where is the registrar'],
    responses: [
      `**Office of the University Registrar**\n\n📍 **Location:** Administration Building, Ground Floor (East Wing, Room 104)\n🕒 **Office Hours:** Monday to Friday, 8:00 AM – 5:00 PM | Saturday 8:00 AM – 12:00 NN\n📧 **Email:** registrar@campus.edu.ph\n📞 **Contact:** (02) 8876-5432 loc. 104\n\n**Services Provided:**\n• Official Transcript of Records (TOR) requests\n• Issuance of Diplomas & Certificates of Graduation\n• True Copy of Grades (TCG) & Grade Inquiries\n• Clearances & Honorable Dismissals\n\n*You can also submit document requests online via the Student Portal.*`
    ]
  },
  {
    category: 'library',
    keywords: ['library', 'books', 'study area', 'research', 'where is the library', 'library hours', 'borrow'],
    responses: [
      `**University Central Learning Commons & Library**\n\n📍 **Location:** Knowledge Hub Building (3rd & 4th Floors, West Campus)\n🕒 **Operating Hours:**\n• Monday – Friday: 7:30 AM – 7:00 PM\n• Saturday: 8:00 AM – 5:00 PM\n• Sunday & Holidays: Closed (24/7 Digital Library accessible online)\n\n**Amenities:**\n• Quiet Study Zones & Reservable Discussion Rooms\n• High-speed Wi-Fi & Computer Terminals\n• Access to IEEE Xplore, ScienceDirect, and JSTOR databases\n\nStudents can borrow up to 5 physical books with a valid RFID Student ID.`
    ]
  },
  {
    category: 'tuition',
    keywords: ['tuition', 'fee', 'fees', 'cost', 'payment', 'installment', 'cashier', 'how much'],
    responses: [
      `**Tuition & Fee Information:**\n\n• **Undergraduate Tuition:** Approx. $45 – $75 per credit unit.\n• **Estimated Semester Cost:** Approx. $750 – $1,300 per term for a standard load (18–24 units).\n• **Flexible Payment Plans:**\n  - *Full Cash Payment:* 5% discount.\n  - *Installment Scheme:* 30% down payment upon enrollment, balance in 3 equal monthly terms.\n\n**Payment Channels:** Campus Cashier (Admin Building), Online Banking & Student Portal payment gateway.`
    ]
  },
  {
    category: 'student_services',
    keywords: ['student services', 'clinic', 'medical', 'guidance', 'counseling', 'scholarship', 'financial aid', 'housing', 'dorm'],
    responses: [
      `**Campus Student Services & Welfare Offices:**\n\n🏥 **University Health & Dental Clinic:**\n• *Location:* Student Center, 1st Floor (24/7 medical assistance)\n\n🧠 **Guidance & Counseling Center:**\n• *Location:* Student Center, Room 205\n• *Services:* Career coaching, mental health support & peer counseling.\n\n🌟 **Scholarships & Financial Assistance Office:**\n• *Location:* Admin Building, Room 108\n• Academic Merit, Athletic Grants, and Government Subsidies (UniFAST / CHED).\n\n🏢 **Student Housing & Dorms:**\n• *Location:* North Campus Dormitory Block A`
    ]
  },
  {
    category: 'help',
    keywords: ['help', 'what can you help me with', 'what can you do', 'features', 'guide', 'menu', 'options', 'assistance'],
    responses: [
      `I can help you with a wide range of campus topics:\n\n1. 🎓 **Enrollment & Admissions** — Application steps, deadlines, and requirements.\n2. 📖 **Academic Programs** — Degrees, majors, and curriculum details.\n3. 🏛️ **Registrar & Records** — Transcripts (TOR), grades, diplomas, and clearances.\n4. 📚 **Library & Study Areas** — Opening hours, locations, and book borrowing.\n5. 💳 **Tuition & Payment** — Fee breakdowns, installment plans, and cashier hours.\n6. 🏥 **Student Services** — Clinic, guidance counseling, and scholarships.\n\nFeel free to type your question below or click any suggested prompt!`
    ]
  }
];

export const FALLBACK_RESPONSES = [
  "I'm not quite sure about that specific detail, but I can help you with **enrollment**, **academic programs**, **registrar services**, **library hours**, **tuition fees**, and **student services**.\n\nYou can also contact the University Helpdesk directly at **helpdesk@campus.edu.ph** or visit the Information Desk at the Main Admin Building.",
  "I don't have information on that particular topic in my current campus guide. Would you like to know about our **admissions requirements**, **degree programs**, **registrar records**, or **library facilities**?",
  "That question is outside my current campus knowledge base. Try asking about **how to enroll**, **programs offered**, **where the registrar is**, or **library facilities**!"
];

/**
 * Helper function to match user input with the best mock response
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


