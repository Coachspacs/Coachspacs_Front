import { Course, Certificate, InstructorStats, EnrolledStudent } from '@/types';

export const mockCourses: Course[] = [
  {
    id: 'course-1',
    slug: 'nextjs-mastery-lms',
    title: 'Next.js 15 & React 19 Masterclass: Build Modern Fullstack Web Apps',
    description: 'Comprehensive guide to building enterprise-grade Web Apps with Next.js App Router, Tailwind CSS, TypeScript, and RTK Query.',
    shortDescription: 'Master App Router, Server Actions, RTK Query & i18n from ground up.',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1200&auto=format&fit=crop',
    price: 89.99,
    originalPrice: 149.99,
    category: 'Web Development',
    level: 'Intermediate',
    rating: 4.9,
    reviewsCount: 342,
    studentsCount: 2150,
    duration: '18h 45m',
    updatedAt: '2026-06-15',
    isPublished: true,
    instructor: {
      id: 'inst-1',
      name: 'Dr. Tariq Al-Mansoor',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop',
      title: 'Senior Software Architect & Executive Coach',
      bio: 'Over 12 years of experience leading engineering teams and coaching 10,000+ developers worldwide.',
      totalStudents: 14500,
      totalCourses: 6,
      rating: 4.9,
    },
    modules: [
      {
        id: 'mod-1',
        title: 'Module 1: Architecture & Foundations',
        lessons: [
          { id: 'les-1', title: '1.1 Introduction to Next.js 15 & App Router', duration: '12:30', isCompleted: true, isPreview: true, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'les-2', title: '1.2 Setting up i18n with Next-Intl (RTL & LTR)', duration: '18:15', isCompleted: true, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'les-3', title: '1.3 Global State & RTK Query Integration', duration: '22:00', isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ],
      },
      {
        id: 'mod-2',
        title: 'Module 2: Advanced Feature Engineering',
        lessons: [
          { id: 'les-4', title: '2.1 Authentication Flows & Axios Refresh Interceptors', duration: '15:40', isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'les-5', title: '2.2 Building Interactive Course Players', duration: '25:10', isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ],
      },
    ],
  },
  {
    id: 'course-2',
    slug: 'ui-ux-design-systems',
    title: 'UI/UX Design Systems & Glassmorphism: From Figma to Production',
    description: 'Learn to design premium user interfaces, dark mode systems, and micro-interactions for modern web applications.',
    shortDescription: 'Master color harmony, typography scales, glassmorphism & component libraries.',
    thumbnail: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=1200&auto=format&fit=crop',
    price: 69.99,
    originalPrice: 119.99,
    category: 'Design',
    level: 'Beginner',
    rating: 4.8,
    reviewsCount: 189,
    studentsCount: 1420,
    duration: '14h 20m',
    updatedAt: '2026-05-10',
    isPublished: true,
    instructor: {
      id: 'inst-2',
      name: 'Sarah Al-Zahrani',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop',
      title: 'Lead Product Designer at CoachSpace',
      bio: 'Design strategist specializing in accessible, high-converting digital products.',
      totalStudents: 8900,
      totalCourses: 4,
      rating: 4.8,
    },
    modules: [
      {
        id: 'mod-21',
        title: 'Module 1: Color Systems & Dark Mode',
        lessons: [
          { id: 'les-21', title: '1.1 Designing Dark Mode Color Tokens', duration: '14:20', isCompleted: true, isPreview: true, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'les-22', title: '1.2 Glassmorphism & Micro-animations', duration: '19:45', isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ],
      },
    ],
  },
  {
    id: 'course-3',
    slug: 'executive-coaching-leadership',
    title: 'Executive Coaching & High-Performance Team Leadership',
    description: 'Transformative leadership strategies for coaches, tech leads, and founders seeking breakthrough team performance.',
    shortDescription: 'Actionable frameworks for emotional intelligence, feedback loops, and strategic growth.',
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200&auto=format&fit=crop',
    price: 99.99,
    originalPrice: 179.99,
    category: 'Business & Coaching',
    level: 'Advanced',
    rating: 5.0,
    reviewsCount: 95,
    studentsCount: 830,
    duration: '10h 15m',
    updatedAt: '2026-07-01',
    isPublished: true,
    instructor: {
      id: 'inst-1',
      name: 'Dr. Tariq Al-Mansoor',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop',
      title: 'Senior Software Architect & Executive Coach',
      totalStudents: 14500,
      totalCourses: 6,
      rating: 4.9,
    },
    modules: [
      {
        id: 'mod-31',
        title: 'Module 1: Strategic Leadership Principles',
        lessons: [
          { id: 'les-31', title: '1.1 The High-Performance Feedback Model', duration: '16:00', isCompleted: false, isPreview: true, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ],
      },
    ],
  },
];

export const mockCertificate: Certificate = {
  id: 'cert-8849',
  courseTitle: 'Next.js 15 & React 19 Masterclass: Build Modern Fullstack Web Apps',
  studentName: 'Mohammed Katanani',
  issueDate: 'July 29, 2026',
  instructorName: 'Dr. Tariq Al-Mansoor',
  certificateCode: 'CS-2026-8849-NEXT',
};

export const mockInstructorStats: InstructorStats = {
  totalRevenue: 24850,
  totalStudents: 1450,
  activeCourses: 6,
  averageRating: 4.9,
  monthlyEarnings: [
    { month: 'Jan', earnings: 2400 },
    { month: 'Feb', earnings: 3100 },
    { month: 'Mar', earnings: 2800 },
    { month: 'Apr', earnings: 4200 },
    { month: 'May', earnings: 3900 },
    { month: 'Jun', earnings: 4850 },
    { month: 'Jul', earnings: 3600 },
  ],
};

export const mockEnrolledStudents: EnrolledStudent[] = [
  { id: 'st-1', name: 'Ahmad Hassan', email: 'ahmad@example.com', courseTitle: 'Next.js 15 & React 19 Masterclass', enrolledAt: '2026-07-10', progress: 85, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop' },
  { id: 'st-2', name: 'Fatima Al-Sayed', email: 'fatima@example.com', courseTitle: 'UI/UX Design Systems', enrolledAt: '2026-07-14', progress: 40, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop' },
  { id: 'st-3', name: 'Omar Khaled', email: 'omar@example.com', courseTitle: 'Executive Coaching Leadership', enrolledAt: '2026-07-20', progress: 100, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop' },
];

export interface InstructorWorkspaceCourse {
  id: string;
  titleAr: string;
  titleEn: string;
  category: string;
  level: string;
  price: number;
  studentsCount: number;
  rating: number;
  status: "published" | "pending_review" | "rejected" | "archived" | "draft";
  image: string;
  rejectionReasonAr?: string;
  rejectionReasonEn?: string;
  sections?: any[];
}

export const mockInstructorWorkspaceCourses: InstructorWorkspaceCourse[] = [
  {
    id: "c-1",
    titleAr: "دورة احتراف React 19 و Next.js App Router",
    titleEn: "React 19 & Next.js App Router Masterclass",
    category: "Development",
    level: "Intermediate",
    price: 49.99,
    studentsCount: 340,
    rating: 4.9,
    status: "published",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600&auto=format&fit=crop",
    rejectionReasonAr: "",
    rejectionReasonEn: "",
    sections: []
  },
  {
    id: "c-2",
    titleAr: "تطبيقات الذكاء الاصطناعي بلغة Python",
    titleEn: "Applied AI with Python",
    category: "Data Science",
    level: "Advanced",
    price: 79.99,
    studentsCount: 120,
    rating: 4.8,
    status: "pending_review",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop",
    rejectionReasonAr: "",
    rejectionReasonEn: "",
    sections: []
  },
  {
    id: "c-3",
    titleAr: "دليل تصميم أنظمة UI/UX المتكاملة",
    titleEn: "Complete UI/UX Design System Guide",
    category: "Design",
    level: "Beginner",
    price: 39.99,
    studentsCount: 0,
    rating: 0.0,
    status: "rejected",
    image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=600&auto=format&fit=crop",
    rejectionReasonAr: "يرجى إضافة فيديو تعريفي بجودة HD وإضافة 3 دروس مجانية للمعاينة.",
    rejectionReasonEn: "Please upload HD promo video and add at least 3 free preview lessons.",
    sections: []
  },
  {
    id: "c-4",
    titleAr: "أساسيات البرمجة بلغة C++",
    titleEn: "C++ Programming Basics",
    category: "Development",
    level: "Beginner",
    price: 29.99,
    studentsCount: 85,
    rating: 4.5,
    status: "archived",
    image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=600&auto=format&fit=crop",
    rejectionReasonAr: "",
    rejectionReasonEn: "",
    sections: []
  }
];

export interface InstructorWorkspaceStudentData {
  id: string;
  nameAr: string;
  nameEn: string;
  email: string;
  course: string;
  date: string;
  progress: number;
}

export const mockInstructorWorkspaceStudents: InstructorWorkspaceStudentData[] = [
  { id: "s-1", nameAr: "أحمد المحمد", nameEn: "Ahmad Al-Mohammad", email: "ahmad@example.com", course: "React 19 & Next.js Masterclass", date: "2026-02-08", progress: 85 },
  { id: "s-2", nameAr: "سارة خالد", nameEn: "Sarah Khaled", email: "sarah@example.com", course: "React 19 & Next.js Masterclass", date: "2026-02-05", progress: 100 },
  { id: "s-3", nameAr: "عمر الفاروق", nameEn: "Omar Al-Farooq", email: "omar@example.com", course: "Applied AI with Python", date: "2026-01-28", progress: 40 },
  { id: "s-4", nameAr: "ريم السالم", nameEn: "Reem Al-Salem", email: "reem@example.com", course: "C++ Programming Basics", date: "2026-01-20", progress: 60 },
];

export interface InstructorWorkspaceProfileData {
  fullNameAr: string;
  fullNameEn: string;
  email: string;
  phone: string;
  headlineAr: string;
  headlineEn: string;
  specialization: string;
  experienceYears: string;
  hourlyRate: string;
  bioAr: string;
  bioEn: string;
  payoutMethod: string;
  bankIban: string;
  paypalEmail: string;
  autoPayout: boolean;
  introVideoUrl: string;
  website: string;
  linkedin: string;
}

export const mockInstructorWorkspaceProfile: InstructorWorkspaceProfileData = {
  fullNameAr: "د. طارق المنصور",
  fullNameEn: "Dr. Tarek Al-Mansoor",
  email: "tarek.mansoor@example.com",
  phone: "+966 50 987 6543",
  headlineAr: "خبير ذكاء اصطناعي ومدرب معتمد",
  headlineEn: "AI Specialist & Certified Executive Coach",
  specialization: "Data Science & AI",
  experienceYears: "8",
  hourlyRate: "120",
  bioAr: "خبرة أكثر من 8 سنوات في تصميم ونشر نماذج الذكاء الاصطناعي وتدريب أكثر من 15,000 طالب عبر العالم.",
  bioEn: "8+ years designing AI models and training over 15,000 professionals worldwide.",
  payoutMethod: "bank",
  bankIban: "SA03 8000 0000 6080 1010 1000",
  paypalEmail: "tarek.mansoor@example.com",
  autoPayout: true,
  introVideoUrl: "https://youtube.com/watch?v=demo123",
  website: "https://tarekmansoor.ai",
  linkedin: "https://linkedin.com/in/tarekmansoor",
};
