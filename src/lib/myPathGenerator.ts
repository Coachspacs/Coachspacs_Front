import {
  MyPathPreferences,
  GeneratedRoadmap,
  RoadmapMilestone,
} from '@/types/mypath';

export function generateRoadmapFromPreferences(
  prefs: MyPathPreferences
): GeneratedRoadmap {
  const { track, level, hoursPerWeek, targetMonths, customTrackName } = prefs;

  let hoursNum = 8;
  if (hoursPerWeek === '1-2') hoursNum = 2;
  else if (hoursPerWeek === '3-5' || hoursPerWeek === '3') hoursNum = 5;
  else if (hoursPerWeek === '6-10' || hoursPerWeek === '8') hoursNum = 8;
  else if (hoursPerWeek === '10+' || hoursPerWeek === '15') hoursNum = 15;
  else hoursNum = parseInt(hoursPerWeek, 10) || 8;

  const targetMonthsNum = parseInt(targetMonths || '3', 10) || 3;
  const totalWeeks = targetMonthsNum * 4;

  let rawMilestones = getMilestonesByTrack(track, level, totalWeeks, customTrackName);

  // Dynamically tailor the milestones count based on duration commitment:
  // - 1 month sprint: 2 high-impact milestones (stations)
  // - 3 months: 3 core milestones (stations)
  // - 6 months: 4 comprehensive milestones (stations)
  // - 9+ months / Mastery: 5 milestones (stations)
  let targetCount = 3;
  if (targetMonths === '1') {
    targetCount = 2;
  } else if (targetMonths === '3') {
    targetCount = 3;
  } else if (targetMonths === '6') {
    targetCount = 4;
  } else {
    targetCount = Math.min(Math.max(2, rawMilestones.length), 5);
  }

  // Slice or wrap to requested dynamic count
  if (targetCount <= rawMilestones.length) {
    rawMilestones = rawMilestones.slice(0, targetCount);
  } else {
    // If more requested than raw, preserve all available
    rawMilestones = rawMilestones.slice(0, Math.min(rawMilestones.length, 5));
  }

  const weeksPerMilestone = Math.max(1, Math.round(totalWeeks / Math.max(1, rawMilestones.length)));

  const milestones: RoadmapMilestone[] = rawMilestones.map((m, idx) => ({
    ...m,
    stepNumber: idx + 1,
    durationWeeks: weeksPerMilestone,
    aiReason:
      m.aiReason ||
      (idx === 0
        ? `Essential foundation required to master core fundamentals and practical concepts before advancing.`
        : idx === rawMilestones.length - 1
        ? `Culminating capstone milestone to synthesize all previous skills into portfolio-ready architecture.`
        : `Progressive bridge applying previous knowledge to advanced industry architectural patterns.`),
    aiReasonAr:
      m.aiReasonAr ||
      (idx === 0
        ? `ركيزة أساسية لا غنى عنها لبناء المعارف التقنية الجوهرية قبل الانتقال للتطبيقات المتقدمة.`
        : idx === rawMilestones.length - 1
        ? `المحطة الختامية لدمج وتتويج كافة الخبرات المكتسبة وبناء مشروع تخرج متكامل يؤهلك لسوق العمل.`
        : `محطة تطويرية تطبيقية لربط المهارات السابقة بنماذج المعمارية الاحترافية المعتمدة عالمياً.`),
  }));

  return {
    id: `roadmap-${track}-${Date.now()}`,
    createdAt: new Date().toISOString(),
    preferences: prefs,
    estimatedWeeks: totalWeeks,
    hoursPerWeek: hoursNum,
    milestones,
  };
}

function getMilestonesByTrack(
  track: string,
  level: string,
  totalWeeks: number,
  customTrackName?: string
): RoadmapMilestone[] {
  const weeksPerMilestone = Math.max(1, Math.round(totalWeeks / 4));

  switch (track) {
    case 'mobile':
      return [
        {
          id: 'ms-mob-1',
          stepNumber: 1,
          title: 'Dart & Flutter Fundamentals',
          titleAr: 'أساسيات Flutter ولغة Dart',
          description: 'Dart basics, widget trees, and responsive mobile layouts.',
          descriptionAr: 'أساسيات لغة Dart وهيكلية الودجات والواجهات المتجاوبة.',
          durationWeeks: weeksPerMilestone,
          status: 'in_progress',
          skills: ['Dart', 'Flutter', 'Mobile UI'],
          skillsAr: ['Dart', 'Flutter', 'واجهات الموبايل'],
          projectTitle: 'E-Commerce Mobile App',
          projectTitleAr: 'تطبيق متجر إلكتروني',
          courses: [
            {
              id: 'c-mob-101',
              slug: 'flutter-bootcamp',
              title: 'Flutter & Dart Bootcamp',
              titleAr: 'معسكر Flutter و Dart للمبتدئين',
              instructor: 'Omar Farooq',
              durationHours: 20,
              level: 'beginner',
              image: '/images/courses/course-react.png',
            },
          ],
        },
        {
          id: 'ms-mob-2',
          stepNumber: 2,
          title: 'State Management & REST APIs',
          titleAr: 'إدارة الحالة والربط مع الخوادم (APIs)',
          description: 'State management with BLoC/Riverpod, APIs, and caching.',
          descriptionAr: 'إدارة حالة التطبيق الاحترافية والربط بالخوادم.',
          durationWeeks: weeksPerMilestone,
          status: 'planned',
          skills: ['BLoC', 'REST APIs', 'Offline Cache'],
          skillsAr: ['BLoC', 'APIs', 'تخزين محلي'],
          projectTitle: 'Real-time News & Social App',
          projectTitleAr: 'تطبيق إخباري وتواصل فوري',
          courses: [
            {
              id: 'c-mob-201',
              slug: 'mobile-state-management',
              title: 'State Management & APIs in Mobile Apps',
              titleAr: 'إدارة الحالة والربط مع الخوادم',
              instructor: 'Lina Al-Masri',
              durationHours: 22,
              level: 'intermediate',
              image: '/images/courses/course-react.png',
            },
          ],
        },
        {
          id: 'ms-mob-3',
          stepNumber: 3,
          title: 'Device Features & Firebase',
          titleAr: 'ميزات الجهاز والإشعارات الفورية',
          description: 'Camera, location, push notifications, and biometric auth.',
          descriptionAr: 'الكاميرا والموقع الجغرافي والإشعارات والمصادقة.',
          durationWeeks: weeksPerMilestone,
          status: 'planned',
          skills: ['FCM Notifications', 'Location & GPS', 'Security'],
          skillsAr: ['إشعارات Firebase', 'الموقع الجغرافي', 'الأمان'],
          projectTitle: 'Delivery & Tracking App',
          projectTitleAr: 'تطبيق توصيل وتتبع جغرافي',
          courses: [
            {
              id: 'c-mob-301',
              slug: 'mobile-device-integrations',
              title: 'Device Integrations & Firebase for Flutter',
              titleAr: 'تكاملات الجهاز وخدمات Firebase',
              instructor: 'Tariq Nabil',
              durationHours: 18,
              level: 'intermediate',
              image: '/images/courses/course-react.png',
            },
          ],
        },
        {
          id: 'ms-mob-4',
          stepNumber: 4,
          title: 'Store Deployment & CI/CD',
          titleAr: 'نشر التطبيقات على المتاجر والأتمتة',
          description: 'App Store and Google Play publishing and CI/CD pipelines.',
          descriptionAr: 'رفع التطبيقات للمتاجر وأتمتة النشر والتحديثات.',
          durationWeeks: weeksPerMilestone,
          status: 'planned',
          skills: ['App Store', 'Google Play', 'Fastlane'],
          skillsAr: ['App Store', 'Google Play', 'أتمتة النشر'],
          projectTitle: 'FinTech Mobile Wallet App',
          projectTitleAr: 'محفظة مالية رقمية متكاملة',
          courses: [
            {
              id: 'c-mob-401',
              slug: 'mobile-publishing-cicd',
              title: 'Publishing & Production for Mobile',
              titleAr: 'النشر والإنتاج لتطبيقات الموبايل',
              instructor: 'Omar Farooq',
              durationHours: 16,
              level: 'advanced',
              image: '/images/courses/course-react.png',
            },
          ],
        },
      ];

    case 'cloud':
      return [
        {
          id: 'ms-cld-1',
          stepNumber: 1,
          title: 'Linux & Cloud Fundamentals',
          titleAr: 'أساسيات خوادم لينكس والأنظمة السحابية',
          description: 'Linux systems administration, networking, and cloud compute.',
          descriptionAr: 'إدارة أنظمة لينكس وبروتوكولات الشبكات والسحابة.',
          durationWeeks: weeksPerMilestone,
          status: 'in_progress',
          skills: ['Linux', 'Networking', 'Cloud Basics'],
          skillsAr: ['لينكس', 'الشبكات', 'السحابة'],
          projectTitle: 'High-Availability Web Server Setup',
          projectTitleAr: 'إعداد خادم ويب عالي الاستقرار',
          courses: [
            {
              id: 'c-cld-101',
              slug: 'linux-cloud-engineering',
              title: 'Linux & Cloud Fundamentals',
              titleAr: 'أساسيات إدارة لينكس وهندسة السحابة',
              instructor: 'Hassan Mahmoud',
              durationHours: 18,
              level: 'beginner',
              image: '/images/courses/course-react.png',
            },
          ],
        },
        {
          id: 'ms-cld-2',
          stepNumber: 2,
          title: 'Docker & Microservices',
          titleAr: 'الحاويات مع Docker والخدمات المصغرة',
          description: 'Container lifecycles, Docker Compose, and microservices.',
          descriptionAr: 'إنشاء الحاويات والربط بين الخدمات المصغرة.',
          durationWeeks: weeksPerMilestone,
          status: 'planned',
          skills: ['Docker', 'Docker Compose', 'Microservices'],
          skillsAr: ['Docker', 'Compose', 'خدمات مصغرة'],
          projectTitle: 'Scalable Microservices Architecture',
          projectTitleAr: 'بنية تطبيق مصغر قابل للتوسع',
          courses: [
            {
              id: 'c-cld-201',
              slug: 'docker-masterclass',
              title: 'Docker & Containerization Masterclass',
              titleAr: 'الدورة العملية لاحتراف Docker',
              instructor: 'Zaid Al-Khateeb',
              durationHours: 20,
              level: 'intermediate',
              image: '/images/courses/course-react.png',
            },
          ],
        },
        {
          id: 'ms-cld-3',
          stepNumber: 3,
          title: 'Kubernetes & Helm',
          titleAr: 'إدارة الحاويات مع Kubernetes ومخططات Helm',
          description: 'Pods, Services, Ingress, and automated scaling.',
          descriptionAr: 'نشر التطبيقات وموازنة الأحمال والتوسع التلقائي.',
          durationWeeks: weeksPerMilestone,
          status: 'planned',
          skills: ['Kubernetes', 'Helm', 'Auto-scaling'],
          skillsAr: ['Kubernetes', 'Helm', 'التوسع الذاتي'],
          projectTitle: 'Production Kubernetes Cluster',
          projectTitleAr: 'عنقود Kubernetes إنتاجي متكامل',
          courses: [
            {
              id: 'c-cld-301',
              slug: 'kubernetes-cka',
              title: 'Certified Kubernetes Administrator Training',
              titleAr: 'التدريب العملي لإدارة Kubernetes',
              instructor: 'Hassan Mahmoud',
              durationHours: 26,
              level: 'advanced',
              image: '/images/courses/course-react.png',
            },
          ],
        },
        {
          id: 'ms-cld-4',
          stepNumber: 4,
          title: 'CI/CD & Terraform IaC',
          titleAr: 'خطوط النشر الآلي والبنية ككود بـ Terraform',
          description: 'Automated CI/CD pipelines and infrastructure provisioning.',
          descriptionAr: 'أتمتة النشر وإدارة البنية التحتية البرمجية ككود.',
          durationWeeks: weeksPerMilestone,
          status: 'planned',
          skills: ['Terraform', 'GitHub Actions', 'AWS / GCP'],
          skillsAr: ['Terraform', 'GitHub Actions', 'السحابة'],
          projectTitle: 'GitOps Cloud Pipeline',
          projectTitleAr: 'خط إنتاج سحابي مؤتمت بالكامل',
          courses: [
            {
              id: 'c-cld-401',
              slug: 'devops-terraform-gitops',
              title: 'Advanced DevOps & Terraform',
              titleAr: 'احتراف DevOps المتقدم و Terraform',
              instructor: 'Zaid Al-Khateeb',
              durationHours: 24,
              level: 'advanced',
              image: '/images/courses/course-react.png',
            },
          ],
        },
      ];

    case 'uiux':
      return [
        {
          id: 'ms-ux-1',
          stepNumber: 1,
          title: 'User Research & Wireframing',
          titleAr: 'أبحاث المستخدم والمخططات الهيكلية',
          description: 'User personas, journey mapping, empathy maps, and low-fi wireframes.',
          descriptionAr: 'دراسة سلوك وتفضيلات المستخدم ورسم المخططات الأولية (Wireframes).',
          durationWeeks: weeksPerMilestone,
          status: 'in_progress',
          skills: ['UX Research', 'Personas', 'Wireframes'],
          skillsAr: ['أبحاث UX', 'شخصيات المستخدمين', 'Wireframes'],
          projectTitle: 'HealthTech App UX Research & Strategy',
          projectTitleAr: 'دراسة بحثية ومخططات لتطبيق صحي',
          courses: [
            {
              id: 'c-ux-101',
              slug: 'ux-research-foundations',
              title: 'UX Research & Design Foundations',
              titleAr: 'أساسيات أبحاث تجربة المستخدم والتصميم',
              instructor: 'Layla Al-Mansour',
              durationHours: 16,
              level: 'beginner',
              image: '/images/courses/course-uiux.png',
            },
          ],
        },
        {
          id: 'ms-ux-2',
          stepNumber: 2,
          title: 'Figma Mastery & Design Systems',
          titleAr: 'احتراف Figma وبناء أنظمة التصميم (Design Systems)',
          description: 'Auto-layout, reusable components, variables, and typography.',
          descriptionAr: 'إتقان Auto-Layout والمكونات المتقدمة وتوحيد الهوية البصرية.',
          durationWeeks: weeksPerMilestone,
          status: 'planned',
          skills: ['Figma', 'Auto-Layout', 'Design Systems'],
          skillsAr: ['Figma', 'Auto-Layout', 'أنظمة التصميم'],
          projectTitle: 'Scalable SaaS Design System',
          projectTitleAr: 'نظام تصميم شامل لمنصة رقمية',
          courses: [
            {
              id: 'c-ux-201',
              slug: 'advanced-figma-design-systems',
              title: 'Advanced Figma & Design Systems',
              titleAr: 'احتراف Figma وأنظمة التصميم المؤسسية',
              instructor: 'Noor Hamdan',
              durationHours: 20,
              level: 'intermediate',
              image: '/images/courses/course-uiux.png',
            },
          ],
        },
        {
          id: 'ms-ux-3',
          stepNumber: 3,
          title: 'Interactive Prototyping & Usability',
          titleAr: 'النماذج التفاعلية واختبارات قابلية الاستخدام',
          description: 'Smart animate, micro-interactions, and usability testing.',
          descriptionAr: 'بناء نماذج تفاعلية حية وقياس سهولة الاستخدام.',
          durationWeeks: weeksPerMilestone,
          status: 'planned',
          skills: ['Prototyping', 'Micro-interactions', 'Usability'],
          skillsAr: ['نماذج تفاعلية', 'تفاعلات دقيقة', 'اختبار الاستخدام'],
          projectTitle: 'High-Fidelity Interactive App Prototype',
          projectTitleAr: 'نموذج تفاعلي عالي الدقة لتطبيق رقمي',
          courses: [
            {
              id: 'c-ux-301',
              slug: 'prototyping-motion-figma',
              title: 'Interactive Prototyping in Figma',
              titleAr: 'النماذج التفاعلية المتقدمة في Figma',
              instructor: 'Layla Al-Mansour',
              durationHours: 18,
              level: 'intermediate',
              image: '/images/courses/course-uiux.png',
            },
          ],
        },
        {
          id: 'ms-ux-4',
          stepNumber: 4,
          title: 'Developer Handoff & Portfolio Case Studies',
          titleAr: 'تسليم التصاميم وبناء دراسات الحالة لمعرض الأعمال',
          description: 'Developer specs, accessibility (WCAG), and case study creation.',
          descriptionAr: 'معايير الوصول (WCAG) وتجهيز دراسات حالة احترافية لملفك.',
          durationWeeks: weeksPerMilestone,
          status: 'planned',
          skills: ['Dev Handoff', 'WCAG', 'Portfolio'],
          skillsAr: ['تسليم المطورين', 'معايير WCAG', 'معرض الأعمال'],
          projectTitle: 'Complete Professional UX/UI Portfolio',
          projectTitleAr: 'معرض أعمال احترافي مع دراسات حالة',
          courses: [
            {
              id: 'c-ux-401',
              slug: 'ux-career-case-studies',
              title: 'UX Career & Winning Case Studies',
              titleAr: 'بناء دراسات حالة احترافية لمعرض الأعمال',
              instructor: 'Noor Hamdan',
              durationHours: 20,
              level: 'advanced',
              image: '/images/courses/course-uiux.png',
            },
          ],
        },
      ];

    case 'ai':
    case 'data':
      return [
        {
          id: 'ms-1',
          stepNumber: 1,
          title: 'Python for AI & Math',
          titleAr: 'أساسيات بايثون والرياضيات للذكاء الاصطناعي',
          description: 'Python programming, NumPy, and linear algebra fundamentals.',
          descriptionAr: 'لغة بايثون ومكتبات NumPy و Pandas والمصفوفات.',
          durationWeeks: weeksPerMilestone,
          status: 'in_progress',
          skills: ['Python 3', 'NumPy', 'Pandas'],
          skillsAr: ['بايثون 3', 'NumPy', 'Pandas'],
          projectTitle: 'Exploratory Data Analysis Project',
          projectTitleAr: 'مشروع تحليل البيانات واستكشافها',
          courses: [
            {
              id: 'c-ai-101',
              slug: 'python-data-science',
              title: 'Python & Data Structures for AI',
              titleAr: 'بايثون وهياكل البيانات للذكاء الاصطناعي',
              instructor: 'Dr. Tariq Al-Mansoor',
              durationHours: 18,
              level: 'beginner',
              image: '/images/courses/course-react.png',
            },
          ],
        },
        {
          id: 'ms-2',
          stepNumber: 2,
          title: 'Machine Learning & Scikit-Learn',
          titleAr: 'تعلّم الآلة ومكتبة Scikit-Learn',
          description: 'Regression, classification algorithms, and model evaluation.',
          descriptionAr: 'خوارزميات الانحدار والتصنيف وتقييم النماذج.',
          durationWeeks: weeksPerMilestone,
          status: 'planned',
          skills: ['Scikit-Learn', 'ML Algorithms', 'Evaluation'],
          skillsAr: ['Scikit-Learn', 'خوارزميات ML', 'تقييم النماذج'],
          projectTitle: 'Customer Churn Predictor',
          projectTitleAr: 'نموذج تنبؤي لتصنيف العملاء',
          courses: [
            {
              id: 'c-ai-201',
              slug: 'machine-learning-masterclass',
              title: 'Hands-on Machine Learning',
              titleAr: 'التطبيق العملي لخوارزميات تعلم الآلة',
              instructor: 'Sara Khalil',
              durationHours: 24,
              level: 'intermediate',
              image: '/images/courses/course-react.png',
            },
          ],
        },
        {
          id: 'ms-3',
          stepNumber: 3,
          title: 'Deep Learning & PyTorch',
          titleAr: 'التعلّم العميق وشبكات PyTorch',
          description: 'Neural networks, CNNs, and NLP transformers.',
          descriptionAr: 'الشبكات العصبية ونماذج الرؤية الحاسوبية ومعالجة اللغات.',
          durationWeeks: weeksPerMilestone,
          status: 'planned',
          skills: ['PyTorch', 'Neural Networks', 'Transformers'],
          skillsAr: ['PyTorch', 'شبكات عصبية', 'Transformers'],
          projectTitle: 'Multimodal Neural Classifier',
          projectTitleAr: 'نموذج تصنيف متعدد الوسائط',
          courses: [
            {
              id: 'c-ai-301',
              slug: 'deep-learning-pytorch',
              title: 'PyTorch & Modern Transformers',
              titleAr: 'احتراف PyTorch والشبكات العصبية',
              instructor: 'Eng. Omar Farooq',
              durationHours: 32,
              level: 'advanced',
              image: '/images/courses/course-react.png',
            },
          ],
        },
        {
          id: 'ms-4',
          stepNumber: 4,
          title: 'LLMs, RAG & AI Deployment',
          titleAr: 'النماذج اللغوية (LLMs) والـ RAG ونشر التطبيقات',
          description: 'RAG pipelines, vector databases, and scalable AI APIs.',
          descriptionAr: 'تقنيات RAG وقواعد المتجهات ونشر الوكلاء سحابياً.',
          durationWeeks: weeksPerMilestone,
          status: 'planned',
          skills: ['LLMs', 'RAG', 'Vector DBs'],
          skillsAr: ['LLMs', 'RAG', 'قواعد المتجهات'],
          projectTitle: 'AI Study Assistant App',
          projectTitleAr: 'مساعد ذكي وقاعدة معرفية متكاملة',
          courses: [
            {
              id: 'c-ai-401',
              slug: 'generative-ai-production',
              title: 'Enterprise Generative AI',
              titleAr: 'بناء تطبيقات الذكاء الاصطناعي التوليدي',
              instructor: 'Dr. Tariq Al-Mansoor',
              durationHours: 28,
              level: 'advanced',
              image: '/images/courses/course-react.png',
            },
          ],
        },
      ];

    case 'backend':
      return [
        {
          id: 'ms-be-1',
          stepNumber: 1,
          title: 'Node.js & Database Architecture',
          titleAr: 'أساسيات Node.js وقواعد البيانات PostgreSQL',
          description: 'REST APIs, asynchronous flows, PostgreSQL, and Prisma.',
          descriptionAr: 'بناء واجهات برمجية RESTful ونمذجة البيانات بـ PostgreSQL.',
          durationWeeks: weeksPerMilestone,
          status: 'in_progress',
          skills: ['Node.js', 'Express', 'PostgreSQL'],
          skillsAr: ['Node.js', 'Express', 'PostgreSQL'],
          projectTitle: 'RESTful API Backend Engine',
          projectTitleAr: 'محرك واجهات برمجة مع نظام صلاحيات',
          courses: [
            {
              id: 'c-be-101',
              slug: 'nodejs-postgresql-mastery',
              title: 'Node.js & PostgreSQL Masterclass',
              titleAr: 'معمارية البنية الخلفية بـ Node.js',
              instructor: 'Khaled Mansoor',
              durationHours: 24,
              level: 'beginner',
              image: '/images/courses/course-leadership.png',
            },
          ],
        },
        {
          id: 'ms-be-2',
          stepNumber: 2,
          title: 'Security, JWT & Caching',
          titleAr: 'الحماية والمصادقة وتخزين Redis السريع',
          description: 'Role-based auth, JWT tokens, Redis cache, and security.',
          descriptionAr: 'الصلاحيات والمصادقة وجلسات Redis وتأمين الخوادم.',
          durationWeeks: weeksPerMilestone,
          status: 'planned',
          skills: ['JWT & Auth', 'Redis', 'API Security'],
          skillsAr: ['JWT والصلاحيات', 'Redis', 'حماية الخوادم'],
          projectTitle: 'Enterprise Authentication Service',
          projectTitleAr: 'خدمة مصادقة موحدة وحماية متقدمة',
          courses: [
            {
              id: 'c-be-201',
              slug: 'backend-security-auth',
              title: 'API Security & OAuth Architecture',
              titleAr: 'تأمين الخوادم ومصادقة OAuth',
              instructor: 'Khaled Mansoor',
              durationHours: 20,
              level: 'intermediate',
              image: '/images/courses/course-leadership.png',
            },
          ],
        },
        {
          id: 'ms-be-3',
          stepNumber: 3,
          title: 'Microservices & Message Queues',
          titleAr: 'الخدمات المصغرة وطوابير Kafka / RabbitMQ',
          description: 'Event-driven systems, WebSockets, and asynchronous queues.',
          descriptionAr: 'المعمارية الموجهة بالأحداث والتواصل الفوري والرسائل.',
          durationWeeks: weeksPerMilestone,
          status: 'planned',
          skills: ['Microservices', 'Kafka', 'WebSockets'],
          skillsAr: ['خدمات مصغرة', 'Kafka', 'WebSockets'],
          projectTitle: 'Real-Time Notification Microservice',
          projectTitleAr: 'نظام إشعارات وتواصل فوري موزع',
          courses: [
            {
              id: 'c-be-301',
              slug: 'microservices-kafka',
              title: 'Event-Driven Microservices with Kafka',
              titleAr: 'بناء الخدمات المصغرة مع Kafka',
              instructor: 'Yousef Al-Qadi',
              durationHours: 28,
              level: 'advanced',
              image: '/images/courses/course-leadership.png',
            },
          ],
        },
        {
          id: 'ms-be-4',
          stepNumber: 4,
          title: 'GraphQL & Production Performance',
          titleAr: 'واجهات GraphQL وتحسين الأداء للإنتاج',
          description: 'GraphQL APIs, query optimization, Docker, and monitoring.',
          descriptionAr: 'بناء خوادم GraphQL وتحسين الاستعلامات والجاهزية للإنتاج.',
          durationWeeks: weeksPerMilestone,
          status: 'planned',
          skills: ['GraphQL', 'Optimization', 'Docker'],
          skillsAr: ['GraphQL', 'تحسين الأداء', 'Docker'],
          projectTitle: 'High-Throughput E-Commerce Backend',
          projectTitleAr: 'بنية خلفية فائقة السرعة للمنصات',
          courses: [
            {
              id: 'c-be-401',
              slug: 'graphql-production-tuning',
              title: 'GraphQL & Backend Scaling in Production',
              titleAr: 'احتراف GraphQL وتوسيع البنى التحتية',
              instructor: 'Yousef Al-Qadi',
              durationHours: 22,
              level: 'advanced',
              image: '/images/courses/course-leadership.png',
            },
          ],
        },
      ];

    case 'frontend':
    default:
      return [
        {
          id: 'ms-1',
          stepNumber: 1,
          title: 'Modern Web Foundations & React 19',
          titleAr: 'أساسيات الويب الحديثة ونواة React 19',
          description: 'Semantic HTML5, Tailwind CSS, TypeScript, and React hooks.',
          descriptionAr: 'إتقان HTML5 و Tailwind CSS و TypeScript ومفاهيم React 19.',
          durationWeeks: weeksPerMilestone,
          status: 'in_progress',
          skills: ['TypeScript', 'React 19', 'Tailwind CSS'],
          skillsAr: ['TypeScript', 'React 19', 'Tailwind CSS'],
          projectTitle: 'Component Library & Design System',
          projectTitleAr: 'مكتبة مكونات تفاعلية ونظام تصميم',
          courses: [
            {
              id: 'c-fe-101',
              slug: 'react-typescript-masterclass',
              title: 'TypeScript & React 19 Masterclass',
              titleAr: 'دورة الاحتراف في TypeScript و React 19',
              instructor: 'Kareem Adel',
              durationHours: 20,
              level: 'beginner',
              image: '/images/courses/course-react.png',
            },
          ],
        },
        {
          id: 'ms-2',
          stepNumber: 2,
          title: 'Next.js App Router & State Management',
          titleAr: 'معمارية Next.js App Router وإدارة الحالة',
          description: 'Server Components, Redux Toolkit, caching, and performance.',
          descriptionAr: 'مكونات الخادم (RSC) و Redux Toolkit واستراتيجيات الكاش.',
          durationWeeks: weeksPerMilestone,
          status: 'planned',
          skills: ['Next.js 15', 'Redux Toolkit', 'App Router'],
          skillsAr: ['Next.js 15', 'Redux Toolkit', 'App Router'],
          projectTitle: 'High-Performance Learning Portal',
          projectTitleAr: 'بوابة تعليمية سريعة مع نظام تفاعلي',
          courses: [
            {
              id: 'c-fe-201',
              slug: 'nextjs-full-architecture',
              title: 'Next.js 15 Full Architecture',
              titleAr: 'معمارية Next.js 15 المتقدمة',
              instructor: 'Laila Mostafa',
              durationHours: 26,
              level: 'intermediate',
              image: '/images/courses/course-react.png',
            },
          ],
        },
        {
          id: 'ms-3',
          stepNumber: 3,
          title: 'Animations & Micro-interactions',
          titleAr: 'الحركات التفاعلية وتجربة الوصول (A11y)',
          description: 'Framer Motion animations, smooth UX, and accessibility.',
          descriptionAr: 'مكتبة Framer Motion والتفاعلات السلسة ومعايير الوصول.',
          durationWeeks: weeksPerMilestone,
          status: 'planned',
          skills: ['Framer Motion', 'Micro-interactions', 'WCAG'],
          skillsAr: ['Framer Motion', 'تفاعلات دقيقة', 'إمكانية الوصول'],
          projectTitle: 'Fintech Dashboard with Live Charts',
          projectTitleAr: 'لوحة تحكم تفاعلية مع رسوم بيانية',
          courses: [
            {
              id: 'c-fe-301',
              slug: 'framer-motion-mastery',
              title: 'Advanced UI Animation with Framer',
              titleAr: 'التحريك وتصميم التجارب بـ Framer Motion',
              instructor: 'Kareem Adel',
              durationHours: 16,
              level: 'intermediate',
              image: '/images/courses/course-react.png',
            },
          ],
        },
        {
          id: 'ms-4',
          stepNumber: 4,
          title: 'Testing, CI/CD & Production',
          titleAr: 'الاختبارات الآلية والنشر السحابي المستمر',
          description: 'Unit testing with Vitest, Cypress E2E, and production CI/CD.',
          descriptionAr: 'اختبارات Vitest و Cypress والنشر السحابي المؤتمت.',
          durationWeeks: weeksPerMilestone,
          status: 'planned',
          skills: ['Vitest', 'Cypress', 'CI/CD'],
          skillsAr: ['Vitest', 'Cypress', 'CI/CD'],
          projectTitle: 'Production-Ready SaaS Application',
          projectTitleAr: 'تطبيق ويب متكامل جاهز للإنتاج',
          courses: [
            {
              id: 'c-fe-401',
              slug: 'testing-cicd-production',
              title: 'Automated Testing & Production Deployment',
              titleAr: 'احتراف الاختبارات والنشر الإنتاجي',
              instructor: 'Ahmad Al-Hassan',
              durationHours: 22,
              level: 'advanced',
              image: '/images/courses/course-react.png',
            },
          ],
        },
      ];
  }
}
