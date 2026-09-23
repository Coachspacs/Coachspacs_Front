import {
  MyPathPreferences,
  GeneratedRoadmap,
  RoadmapMilestone,
} from '@/types/mypath';

export function generateRoadmapFromPreferences(
  prefs: MyPathPreferences
): GeneratedRoadmap {
  const { track, level, hoursPerWeek, targetMonths } = prefs;

  const hoursNum = parseInt(hoursPerWeek, 10) || 8;
  const targetMonthsNum = parseInt(targetMonths, 10) || 3;
  const totalWeeks = targetMonthsNum * 4;

  const milestones = getMilestonesByTrack(track, level, totalWeeks);

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
  totalWeeks: number
): RoadmapMilestone[] {
  const weeksPerMilestone = Math.max(1, Math.round(totalWeeks / 4));

  switch (track) {
    case 'ai':
      return [
        {
          id: 'ms-1',
          stepNumber: 1,
          title: 'Python for AI & Mathematical Foundations',
          titleAr: 'أساسيات بايثون والرياضيات للذكاء الاصطناعي',
          description:
            'Core Python programming, NumPy, Pandas, vectors, and matrices for machine learning.',
          descriptionAr:
            'إتقان لغة بايثون، مكتبات NumPy و Pandas، ومفاهيم المتجهات والمصفوفات الرياضية.',
          durationWeeks: weeksPerMilestone,
          status: 'in_progress',
          skills: ['Python 3', 'NumPy', 'Pandas', 'Linear Algebra'],
          skillsAr: ['بايثون 3', 'NumPy', 'Pandas', 'الجبر الخطي'],
          projectTitle: 'Exploratory Data Analysis & Feature Pipeline',
          projectTitleAr: 'مشروع تحليل البيانات وهندسة الميزات الاستكشافية',
          courses: [
            {
              id: 'c-ai-101',
              title: 'Complete Python & Data Structures for AI',
              titleAr: 'الدورة الشاملة في بايثون وهياكل البيانات للذكاء الاصطناعي',
              instructor: 'Dr. Tariq Al-Mansoor',
              durationHours: 18,
              level: 'beginner',
            },
          ],
        },
        {
          id: 'ms-2',
          stepNumber: 2,
          title: 'Classical Machine Learning & Scikit-Learn',
          titleAr: 'تعلّم الآلة الكلاسيكي ومكتبة Scikit-Learn',
          description:
            'Supervised and unsupervised learning, regression, classification, and cross-validation.',
          descriptionAr:
            'التعلم الموجه وغير الموجه، خوارزميات الانحدار والتصنيف وتقييم النماذج بدقة.',
          durationWeeks: weeksPerMilestone,
          status: 'planned',
          skills: ['Scikit-Learn', 'Feature Engineering', 'Model Evaluation'],
          skillsAr: ['Scikit-Learn', 'هندسة الميزات', 'تقييم النماذج'],
          projectTitle: 'Predictive Modeling & Customer Churn Classifier',
          projectTitleAr: 'نموذج تنبؤي لتصنيف سلوك العملاء والتسرب',
          courses: [
            {
              id: 'c-ai-201',
              title: 'Hands-on Machine Learning Algorithms with Real Data',
              titleAr: 'التطبيق العملي لخوارزميات تعلم الآلة مع بيانات واقعية',
              instructor: 'Sara Khalil',
              durationHours: 24,
              level: 'intermediate',
            },
          ],
        },
        {
          id: 'ms-3',
          stepNumber: 3,
          title: 'Deep Learning, PyTorch & Neural Architectures',
          titleAr: 'التعلّم العميق، PyTorch، وبنيات الشبكات العصبية',
          description:
            'Neural networks, CNNs for computer vision, RNNs/Transformers for NLP, and PyTorch.',
          descriptionAr:
            'الشبكات العصبية، الرؤية الحاسوبية (CNNs)، ونماذج معالجة اللغات الطبيعية (Transformers).',
          durationWeeks: weeksPerMilestone,
          status: 'planned',
          skills: ['PyTorch', 'Deep Learning', 'Transformers', 'HuggingFace'],
          skillsAr: ['PyTorch', 'التعلم العميق', 'Transformers', 'HuggingFace'],
          projectTitle: 'End-to-End Multimodal Neural Classifier',
          projectTitleAr: 'بناء نموذج ذكاء اصطناعي متعدد الوسائط وتصنيف متقدم',
          courses: [
            {
              id: 'c-ai-301',
              title: 'Mastering PyTorch and Modern Transformers',
              titleAr: 'احتراف PyTorch ونماذج التحويل العصبي الحديثة',
              instructor: 'Eng. Omar Farooq',
              durationHours: 32,
              level: 'advanced',
            },
          ],
        },
        {
          id: 'ms-4',
          stepNumber: 4,
          title: 'LLMs, RAG & Generative AI Production Deployment',
          titleAr: 'النماذج اللغوية الكبيرة (LLMs)، الـ RAG، ونشر الأنظمة',
          description:
            'LangChain, LlamaIndex, Vector Databases (Pinecone/Chroma), and deploying scalable AI APIs.',
          descriptionAr:
            'تقنيات RAG، قواعد البيانات المتجهية، استدعاء الوكلاء الذكاء ونشر النماذج سحابياً.',
          durationWeeks: weeksPerMilestone,
          status: 'planned',
          skills: ['LLMs', 'RAG', 'LangChain', 'FastAPI', 'Vector DBs'],
          skillsAr: ['LLMs', 'RAG', 'LangChain', 'FastAPI', 'قواعد المتجهات'],
          projectTitle: 'Production AI Study Companion & Knowledge Assistant',
          projectTitleAr: 'بناء مساعد ذكي متكامل للمذاكرة وقواعد المعرفة الخاصة',
          courses: [
            {
              id: 'c-ai-401',
              title: 'Building Enterprise Generative AI Applications',
              titleAr: 'بناء تطبيقات الذكاء الاصطناعي التوليدي للمؤسسات',
              instructor: 'Dr. Tariq Al-Mansoor',
              durationHours: 28,
              level: 'advanced',
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
          title: 'Modern Web Foundations & React 19 Core',
          titleAr: 'أساسيات الويب الحديثة ونواة React 19',
          description:
            'Master semantic HTML5, modern Tailwind CSS architecture, TypeScript types, and React 19 hooks.',
          descriptionAr:
            'إتقان HTML5 الدلالي، معمارية Tailwind CSS، أنواع TypeScript، والـ Hooks الحديثة في React 19.',
          durationWeeks: weeksPerMilestone,
          status: 'in_progress',
          skills: ['TypeScript', 'React 19', 'Tailwind CSS', 'Responsive UI'],
          skillsAr: ['TypeScript', 'React 19', 'Tailwind CSS', 'تصميم متجاوب'],
          projectTitle: 'Interactive Component Library & Design System',
          projectTitleAr: 'مكتبة مكونات تفاعلية ونظام تصميم متكامل',
          courses: [
            {
              id: 'c-fe-101',
              title: 'Modern TypeScript & React 19 Masterclass',
              titleAr: 'دورة الاحتراف في TypeScript و React 19 الحديثة',
              instructor: 'Kareem Adel',
              durationHours: 20,
              level: 'beginner',
            },
          ],
        },
        {
          id: 'ms-2',
          stepNumber: 2,
          title: 'Next.js App Router, SSR & State Architecture',
          titleAr: 'معمارية Next.js App Router، الـ SSR، وإدارة الحالة',
          description:
            'Server Components, streaming, Redux Toolkit, caching strategies, and SEO optimization.',
          descriptionAr:
            'مكونات الخادم (RSC)، البث، Redux Toolkit، استراتيجيات الكاش، وتحسين محركات البحث.',
          durationWeeks: weeksPerMilestone,
          status: 'planned',
          skills: ['Next.js 15', 'Redux Toolkit', 'App Router', 'Performance'],
          skillsAr: ['Next.js 15', 'Redux Toolkit', 'App Router', 'الأداء العالي'],
          projectTitle: 'High-Performance E-Learning Portal & Cart Flow',
          projectTitleAr: 'بوابة تعليمية متكاملة وسريعة مع نظام سلة وطلب',
          courses: [
            {
              id: 'c-fe-201',
              title: 'Next.js 15 Full Architecture & Server Components',
              titleAr: 'معمارية Next.js 15 المتقدمة ومكونات الخادم',
              instructor: 'Laila Mostafa',
              durationHours: 26,
              level: 'intermediate',
            },
          ],
        },
        {
          id: 'ms-3',
          stepNumber: 3,
          title: 'Animations, Micro-interactions & A11y',
          titleAr: 'الحركات التفاعلية، Micro-interactions، وتجربة الوصول (A11y)',
          description:
            'Framer Motion, glassmorphism, responsive navigation drawers, and WCAG accessibility standards.',
          descriptionAr:
            'مكتبة Framer Motion، تأثيرات الزجاج والتفاعل الحي، ومعايير إمكانية الوصول العالمية.',
          durationWeeks: weeksPerMilestone,
          status: 'planned',
          skills: ['Framer Motion', 'Micro-interactions', 'WCAG A11y', 'Tailwind'],
          skillsAr: ['Framer Motion', 'تفاعلات دقيقة', 'إمكانية الوصول', 'Tailwind'],
          projectTitle: 'Luxury Fintech Dashboard with Real-time Charting',
          projectTitleAr: 'لوحة تحكم مالية فاخرة مع رسوم بيانية وتفاعلات حية',
          courses: [
            {
              id: 'c-fe-301',
              title: 'Advanced UI Animation & Motion with Framer',
              titleAr: 'التحريك المتقدم وتصميم التجارب الفاخرة بـ Framer Motion',
              instructor: 'Kareem Adel',
              durationHours: 16,
              level: 'intermediate',
            },
          ],
        },
        {
          id: 'ms-4',
          stepNumber: 4,
          title: 'Automated Testing, CI/CD & Production Hardening',
          titleAr: 'الاختبارات الآلية (Vitest & E2E)، والنشر السحابي المستمر',
          description:
            'Unit testing with Vitest, React Testing Library, Cypress E2E flows, and Docker deployments.',
          descriptionAr:
            'اختبارات الوحدة بـ Vitest، واختبارات E2E بـ Cypress، والنشر السحابي المحمي.',
          durationWeeks: weeksPerMilestone,
          status: 'planned',
          skills: ['Vitest', 'Cypress', 'CI/CD', 'Security & Production'],
          skillsAr: ['Vitest', 'Cypress', 'CI/CD', 'الحماية والإنتاج'],
          projectTitle: 'Enterprise Production-Ready SaaS Application',
          projectTitleAr: 'تطبيق SaaS مؤسسي متكامل جاهز للإنتاج',
          courses: [
            {
              id: 'c-fe-401',
              title: 'Automated Testing & Production Deployment Masterclass',
              titleAr: 'احتراف الاختبارات الآلية والنشر الإنتاجي المتقدم',
              instructor: 'Ahmad Al-Hassan',
              durationHours: 22,
              level: 'advanced',
            },
          ],
        },
      ];
  }
}
