import { PublicInstructor } from "@/types/publicInstructor";
import { MOCK_COURSES } from "./mockCatalogData";

export const MOCK_INSTRUCTORS: PublicInstructor[] = [
  {
    id: "inst-mohammed-katanani",
    slug: "mohammed-katanani",
    name: "Mohammed Katanani",
    nameAr: "محمد قطناني",
    headline: "Senior Software Architect & Executive Tech Coach",
    headlineAr: "كبير معماريي البرمجيات ومدرب القيادة التقنية التنفيذية",
    avatar: undefined,
    coverImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1600&q=80",
    bio: "Dedicated professional instructor on CoachSpace committed to delivering world-class educational experiences, real-world project skills, and career mentorship.",
    bioAr: "مدرب محترف في منصة CoachSpace ملتزم بتقديم برامج تدريبية وتطبيقية عالية الجودة وتوجيه مهني متميز ونقل الخبرات العملية لبناء مهارات تقنية متقدمة.",
    aboutParagraphs: [],
    aboutParagraphsAr: [],
    specialization: "Software Architecture & Executive Leadership",
    specializationAr: "هندسة البرمجيات والقيادة التنفيذية",
    rating: undefined,
    reviewsCount: 0,
    reviewsCountFormatted: undefined,
    totalStudents: undefined,
    totalStudentsFormatted: undefined,
    totalCourses: 0,
    experienceYears: 8,
    socials: {
      linkedin: "https://linkedin.com",
      email: "instructor@coachspace.com"
    },
    skills: ["System Design", "Next.js", "React.js", "Cloud Architecture", "Clean Code & Architecture"],
    skillsAr: ["تصميم الأنظمة", "Next.js", "React.js", "البنية السحابية", "الكود النظيف والمعمارية المتقدمة"],
    highlights: [],
    reviews: [],
    hourlyRate: undefined,
    hourlyRateAr: undefined,
    location: "Riyadh, Saudi Arabia",
    locationAr: "الرياض، المملكة العربية السعودية",
    successRate: undefined,
  },
  {
    id: "inst-tariq-al-mansoor",
    slug: "tariq-al-mansoor",
    name: "Dr. Tariq Al-Mansoor",
    nameAr: "د. طارق المنصور",
    headline: "Senior Software Architect & Executive Tech Coach",
    headlineAr: "كبير معماريي البرمجيات ومدرب القيادة التقنية التنفيذية",
    avatar: undefined,
    coverImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1600&q=80",
    bio: "PhD in Computer Science with 14+ years of industry experience architecting scalable distributed systems and training high-performing engineering teams at top-tier tech companies.",
    bioAr: "دكتوراه في علوم الحاسوب وخبرة أكثر من 14 عاماً في هندسة النظم السحابية الموزعة وبناء وتدريب الفرق الهندسية المتميزة في كبرى الشركات التقنية العالمية.",
    aboutParagraphs: [
      "Dr. Tariq has led engineering teams at Fortune 500 companies and fast-growing tech scaleups.",
      "His courses focus on hands-on modern full-stack development, distributed architecture, and executive mentorship.",
      "He believes in practical learning through building real-world enterprise applications."
    ],
    aboutParagraphsAr: [
      "يحمل د. طارق درجة الدكتوراه في علوم الحاسب وقاد فرقاً هندسية في كبرى الشركات التقنية العالمية والشركات الناشئة سريعة النمو.",
      "تركز دوراته وبرامجه على أحدث تقنيات الويب (Next.js 15، React 19، TypeScript، والأنظمة الموزعة) بالإضافة إلى التوجيه القيادي لمدراء الهندسة ورؤساء التقنية.",
      "يؤمن بالتعليم التطبيقي المباشر القائم على بناء مشاريع حقيقية جاهزة للإنتاج وبيئات العمل الاحترافية."
    ],
    specialization: "Software Architecture & Executive Leadership",
    specializationAr: "هندسة البرمجيات والقيادة التنفيذية",
    rating: 4.9,
    reviewsCount: 3420,
    reviewsCountFormatted: "3.4k",
    totalStudents: 28400,
    totalStudentsFormatted: "28.4k",
    totalCourses: 4,
    experienceYears: 14,
    socials: {
      website: "https://example.com/dr-tariq",
      linkedin: "https://linkedin.com/in/drtariq",
      twitter: "https://twitter.com/drtariq",
      github: "https://github.com/drtariq",
      email: "tariq@coachspace.com"
    },
    skills: ["Next.js 15", "React 19", "TypeScript", "System Design", "Cloud Architecture", "Engineering Management", "Clean Code"],
    skillsAr: ["Next.js 15", "React 19", "تايب سكريبت", "تصميم الأنظمة", "البنية السحابية", "إدارة الفرق الهندسية", "الكود النظيف"],
    highlights: [
      {
        id: "h1",
        iconName: "Award",
        title: "Top Rated Instructor 2025/2026",
        titleAr: "المدرب الأعلى تقييماً 2025/2026",
        subtitle: "Maintained 4.9+ rating across all programs",
        subtitleAr: "حافظ على تقييم 4.9+ في كافة البرامج التدريبية"
      },
      {
        id: "h2",
        iconName: "Users",
        title: "28,000+ Students Mentored",
        titleAr: "أكثر من 28,000 طالب متدرب",
        subtitle: "Worldwide alumni working in top tech companies",
        subtitleAr: "خريجون يعملون في أكبر الشركات التقنية حول العالم"
      }
    ],
    ratingBreakdown: {
      stars5: 88,
      stars4: 9,
      stars3: 2,
      stars2: 1,
      stars1: 0
    },
    reviews: [
      {
        id: "rev-1",
        studentName: "Omar Al-Farsi",
        studentNameAr: "عمر الفارسي",
        avatar: undefined,
        rating: 5,
        date: "2 weeks ago",
        dateAr: "منذ أسبوعين",
        comment: "Dr. Tariq's Next.js course is the most thorough and well-explained course I have ever taken. The architecture concepts directly helped me pass my Senior Frontend interview.",
        commentAr: "دورة د. طارق في Next.js من أعمق وأشمل الدورات التي درستها. المفاهيم المعمارية والتطبيقية ساعدتني مباشرة في اجتياز مقابلة مهندس أول للواجهات.",
        courseTitle: "Next.js 15 & React 19 Fullstack Masterclass",
        courseTitleAr: "تطوير تطبيقات الويب الحديثة باستخدام Next.js 15"
      },
      {
        id: "rev-2",
        studentName: "Nadine Mansour",
        studentNameAr: "نادين منصور",
        avatar: undefined,
        rating: 5,
        date: "1 month ago",
        dateAr: "منذ شهر",
        comment: "Clear explanations, top-tier video quality, and responsive mentorship in Q&A. Highly recommended for any serious engineer.",
        commentAr: "شرح واضح جداً وجودة إنتاج استثنائية مع تفاعل مستمر في الرد على الاستفسارات. أنصح به بشدة لأي مهندس يرغب في الارتقاء بمستواه.",
        courseTitle: "Corporate Strategy & Competitive Advantage",
        courseTitleAr: "الاستراتيجية المؤسسية والميزة التنافسية"
      }
    ],
  },
  {
    id: "inst-sarah-jenkins",
    slug: "sarah-jenkins",
    name: "Dr. Sarah Jenkins",
    nameAr: "د. سارة جينكينز",
    headline: "Executive Leadership Strategist & Agile Coach",
    headlineAr: "استشارية القيادة التنفيذية ومدربة أساليب الإدارة المرنة",
    avatar: undefined,
    coverImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80",
    bio: "International executive coach with 12+ years of guiding leadership teams, high-growth startups, and Fortune 100 organizations through organizational transformation.",
    bioAr: "مدربة تنفيذية دولية بخبرة تزيد عن 12 عاماً في توجيه الفرق القيادية والشركات سريعة النمو في مجالات التحول المؤسسي وبناء فرق العمل عالية الأداء.",
    aboutParagraphs: [
      "Dr. Sarah Jenkins combines industrial psychology with actionable business frameworks to help managers become inspiring, results-driven leaders.",
      "She has coached leaders at major global organizations and trained over 15,000 executives across North America, Europe, and the MENA region.",
      "Her workshops emphasize psychological safety, high-stakes communication, and agile team empowerment."
    ],
    aboutParagraphsAr: [
      "تدمج د. سارة جينكينز بين علم النفس المؤسسي وأحدث أطر إدارة الأعمال العملية لمساعدة المدراء على التحول إلى قادة ملهمين ومحققين للنتائج.",
      "قدمت استشاراتها وتدريبها لأكثر من 15,000 مدير وتنفيذي في أمريكا الشمالية وأوروبا والشرق الأوسط.",
      "تركز ورشها التدريبية على الأمان النفسي داخل الفرق، وإدارة الحوارات المعقدة، وتمكين فرق العمل الرشيقة."
    ],
    specialization: "Executive Leadership & Team Dynamics",
    specializationAr: "القيادة التنفيذية وإدارة الفرق",
    rating: 4.8,
    reviewsCount: 1200,
    reviewsCountFormatted: "1.2k",
    totalStudents: 16500,
    totalStudentsFormatted: "16.5k",
    totalCourses: 3,
    experienceYears: 12,
    socials: {
      website: "https://example.com/dr-sarah",
      linkedin: "https://linkedin.com/in/drsarahjenkins",
      twitter: "https://twitter.com/drsarahj",
      email: "sarah@coachspace.com"
    },
    skills: ["Team Leadership", "Agile Management", "Emotional Intelligence", "Executive Coaching", "Conflict Resolution", "OKRs & KPIs"],
    skillsAr: ["قيادة الفرق", "الإدارة المرنة Agile", "الذكاء العاطفي", "التدريب التنفيذي", "حل النزاعات المؤسسية", "مؤشرات الأداء OKRs"],
    highlights: [
      {
        id: "h1",
        iconName: "Award",
        title: "Certified Master Coach (ICF)",
        titleAr: "مدربة معتمدة من الاتحاد الدولي للكوتشينج (ICF)",
        subtitle: "PCC Credentialed Executive Coach",
        subtitleAr: "اعتماد تدريبي مهني متقدم للكوتشينج التنفيذي"
      }
    ],
    ratingBreakdown: {
      stars5: 84,
      stars4: 12,
      stars3: 3,
      stars2: 1,
      stars1: 0
    },
    reviews: [],
  },
  {
    id: "inst-sophia-martinez",
    slug: "sophia-martinez",
    name: "Sophia Martinez",
    nameAr: "سوفيا مارتينيز",
    headline: "Principal Product Designer & Design Systems Lead",
    headlineAr: "كبيرة مصممي المنتجات ورئيسة أنظمة التصميم",
    avatar: undefined,
    coverImage: "https://images.unsplash.com/photo-1542744094-24638eff58bb?auto=format&fit=crop&w=1600&q=80",
    bio: "Principal Product Designer with 10+ years shaping design systems and scalable user experiences for hyper-growth platforms.",
    bioAr: "كبيرة مصممي المنتجات الرقمية بخبرة تتجاوز 10 سنوات في بناء أنظمة التصميم المتقدمة وتطوير تجارب مستخدم عالية الكفاءة للمنصات الكبرى.",
    aboutParagraphs: [
      "Sophia has built design systems used by over 50 million active users worldwide.",
      "Her coaching focuses on Figma tokens, design-to-code pipelines, and inclusive accessibility (WCAG)."
    ],
    aboutParagraphsAr: [
      "صممت سوفيا منتجات وتطبيقات حاصلة على جوائز عالمية وتخدم أكثر من 50 مليون مستخدم نشط.",
      "تركز في منهجها على سد الفجوة بين توكنز التصميم في فجما والتطبيق البرمجي في الواجهات الأمامية لتسهيل التعاون بين المصممين والمطورين."
    ],
    specialization: "UI/UX & Design Systems",
    specializationAr: "تصميم واجهات وتجربة المستخدم وأنظمة التصميم",
    rating: 4.9,
    reviewsCount: 3100,
    reviewsCountFormatted: "3.1k",
    totalStudents: 22000,
    totalStudentsFormatted: "22k",
    totalCourses: 3,
    experienceYears: 10,
    socials: {
      website: "https://example.com/sophia",
      linkedin: "https://linkedin.com/in/sophiamartinez",
      twitter: "https://twitter.com/sophiadesign",
      email: "sophia@coachspace.com"
    },
    skills: ["Figma", "Design Systems", "Micro-Interactions", "Accessibility (a11y)", "UX Research", "Design Tokens"],
    skillsAr: ["فجما Figma", "أنظمة التصميم", "التفاعلات الدقيقة", "سهولة الوصول (a11y)", "أبحاث تجربة المستخدم", "رموز التصميم Tokens"],
    highlights: [],
    ratingBreakdown: {
      stars5: 90,
      stars4: 8,
      stars3: 2,
      stars2: 0,
      stars1: 0
    },
    reviews: [],
  },
  {
    id: "inst-alex-rivera",
    slug: "alex-rivera",
    name: "Alex Rivera",
    nameAr: "أليكس ريفيرا",
    headline: "Principal Fullstack Engineer & Cloud Architect",
    headlineAr: "كبير مهندسي Fullstack ومعماري البنية السحابية",
    avatar: undefined,
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1600&q=80",
    bio: "Senior engineer and cloud architect with 13+ years building high-throughput microservices and distributed applications.",
    bioAr: "مهندس برمجيات أول ومعماري سحابي بخبرة تزيد عن 13 عاماً في بناء الخدمات المصغرة عالية الكفاءة والنظم الموزعة.",
    aboutParagraphs: [],
    aboutParagraphsAr: [],
    specialization: "Fullstack Engineering & Distributed Systems",
    specializationAr: "هندسة النظم المتكاملة والأنظمة الموزعة",
    rating: 4.8,
    reviewsCount: 1890,
    reviewsCountFormatted: "1.8k",
    totalStudents: 15400,
    totalStudentsFormatted: "15.4k",
    totalCourses: 2,
    experienceYears: 13,
    socials: {
      github: "https://github.com/alexrivera",
      linkedin: "https://linkedin.com/in/alexrivera",
      email: "alex@coachspace.com"
    },
    skills: ["Fullstack Architecture", "Node.js", "Docker & Kubernetes", "GraphQL", "AWS & GCP"],
    skillsAr: ["البنية المتكاملة Fullstack", "Node.js", "Docker و Kubernetes", "GraphQL", "AWS و Google Cloud"],
    highlights: [],
    ratingBreakdown: {
      stars5: 82,
      stars4: 14,
      stars3: 3,
      stars2: 1,
      stars1: 0
    },
    reviews: [],
  }
];

/**
 * Normalizes an instructor name or ID into a clean URL-friendly slug
 */
export function normalizeInstructorSlug(nameOrId: string): string {
  if (!nameOrId) return "";
  return nameOrId
    .toLowerCase()
    .trim()
    .replace(/^inst-/, "")
    .replace(/^(dr|prof|eng)\.?\s+/i, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Helper to get local override data from browser localStorage if available
 */
export function getSavedInstructorOverrides(slugOrId: string): Partial<PublicInstructor> {
  if (typeof window === "undefined") return {};
  try {
    const rawGlobal = localStorage.getItem("coachspace_active_instructor_profile");
    const rawSpecific = localStorage.getItem(`coachspace_inst_profile_${slugOrId}`);
    const globalData = rawGlobal ? JSON.parse(rawGlobal) : {};
    const specificData = rawSpecific ? JSON.parse(rawSpecific) : {};
    return { ...globalData, ...specificData };
  } catch (e) {
    return {};
  }
}

/**
 * Helper to save local override data into browser localStorage
 */
export function saveInstructorOverrides(
  slugOrId: string,
  data: Partial<PublicInstructor>
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("coachspace_active_instructor_profile", JSON.stringify(data));
    localStorage.setItem(`coachspace_inst_profile_${slugOrId}`, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save instructor override:", e);
  }
}

export const updatePublicInstructorOverrides = saveInstructorOverrides;

/**
 * Get public instructor by ID, slug, or matching name with associated courses
 */
export function getPublicInstructorByIdOrSlug(idOrSlug: string): PublicInstructor {
  const normalized = normalizeInstructorSlug(idOrSlug);
  
  // 1. Direct match by slug or id
  let foundInstructor = MOCK_INSTRUCTORS.find(
    (inst) => inst.slug === normalized || inst.id === idOrSlug || inst.slug === idOrSlug
  );

  // 2. Name fuzzy match
  if (!foundInstructor) {
    const query = idOrSlug.toLowerCase().trim();
    foundInstructor = MOCK_INSTRUCTORS.find((inst) => {
      const nEn = inst.name.toLowerCase();
      const nAr = inst.nameAr.toLowerCase();
      return nEn.includes(query) || nAr.includes(query) || query.includes(inst.slug);
    });
  }

  // 3. Fallback: generate a dynamic instructor profile based on name or first default
  let resolvedInstructor: PublicInstructor;
  if (!foundInstructor) {
    const matchingCourse = MOCK_COURSES.find(
      (c) =>
        normalizeInstructorSlug(c.instructorName || "") === normalized ||
        (c.instructorName && c.instructorName.toLowerCase().includes(idOrSlug.toLowerCase()))
    );

    const rawName = idOrSlug.replace(/^inst-/, "").replace(/-/g, " ");
    const displayName =
      matchingCourse?.instructorName ||
      rawName
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
    const displayNameAr = matchingCourse?.instructorNameAr || displayName;

    resolvedInstructor = {
      id: `inst-${normalized}`,
      slug: normalized || "instructor",
      name: displayName,
      nameAr: displayNameAr,
      headline: "Senior Coach & Subject Matter Expert",
      headlineAr: "خبير ومستشار معتمد في CoachSpace",
      avatar: undefined,
      coverImage:
        "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1600&q=80",
      bio: "Dedicated professional instructor on CoachSpace committed to delivering world-class educational experiences and practical career mentorship.",
      bioAr: "مدرب محترف في منصة CoachSpace ملتزم بتقديم برامج تدريبية وتطبيقية عالية الجودة وتوجيه مهني متميز.",
      aboutParagraphs: [
        "Specializes in interactive, outcomes-oriented coaching with a focus on real-world application."
      ],
      aboutParagraphsAr: [
        "متخصص في التدريب التفاعلي الموجه نحو النتائج وتزويد الطلاب بالمهارات الحقيقية المطلوبة في سوق العمل."
      ],
      specialization: matchingCourse?.category || "Professional Development",
      specializationAr: matchingCourse?.categoryAr || "التطوير المهني",
      rating: matchingCourse?.rating || 4.9,
      reviewsCount: matchingCourse?.reviewsCount || 450,
      reviewsCountFormatted: matchingCourse?.reviewsCountFormatted || "450",
      totalStudents: 5400,
      totalStudentsFormatted: "5.4k",
      totalCourses: 1,
      experienceYears: 8,
      socials: {
        linkedin: "https://linkedin.com",
        email: "contact@coachspace.com"
      },
      skills: [matchingCourse?.category || "Leadership", "Coaching", "Mentorship"],
      skillsAr: [matchingCourse?.categoryAr || "القيادة", "التدريب", "التوجيه المهني"],
      highlights: [
        {
          id: "dh1",
          iconName: "Award",
          title: "Verified CoachSpace Instructor",
          titleAr: "مدرب معتمد في CoachSpace",
          subtitle: "Vetted curriculum and high student satisfaction",
          subtitleAr: "مناهج موثوقة وتقييمات إيجابية مستمرة"
        }
      ],
      ratingBreakdown: {
        stars5: 85,
        stars4: 12,
        stars3: 3,
        stars2: 0,
        stars1: 0
      },
      reviews: []
    };
  } else {
    resolvedInstructor = foundInstructor;
  }

  // Attach only actual matching courses for this instructor
  const instructorCourses = MOCK_COURSES.filter((c) => {
    if (!c.instructorName) return false;
    const courseInstSlug = normalizeInstructorSlug(c.instructorName);
    const courseInstSlugAr = normalizeInstructorSlug(c.instructorNameAr || "");
    const targetSlug = resolvedInstructor.slug;
    const targetName = (resolvedInstructor.name || "").toLowerCase().trim();
    const courseInstName = c.instructorName.toLowerCase().trim();
    return (
      courseInstSlug === targetSlug ||
      courseInstSlugAr === targetSlug ||
      (targetName.length > 3 && courseInstName.includes(targetName)) ||
      (targetName.length > 3 && targetName.includes(courseInstName))
    );
  });

  // Apply any custom runtime/local overrides from profile settings
  const overrides = getSavedInstructorOverrides(resolvedInstructor.id || resolvedInstructor.slug);

  return {
    ...resolvedInstructor,
    ...overrides,
    id: overrides.id || resolvedInstructor.id,
    slug: overrides.slug || resolvedInstructor.slug,
    name: overrides.name || resolvedInstructor.name,
    nameAr: overrides.nameAr || resolvedInstructor.nameAr,
    headline: overrides.headline || resolvedInstructor.headline,
    headlineAr: overrides.headlineAr || resolvedInstructor.headlineAr,
    bio: overrides.bio || resolvedInstructor.bio,
    bioAr: overrides.bioAr || resolvedInstructor.bioAr,
    aboutParagraphs: overrides.aboutParagraphs || resolvedInstructor.aboutParagraphs,
    aboutParagraphsAr: overrides.aboutParagraphsAr || resolvedInstructor.aboutParagraphsAr,
    specialization: overrides.specialization || resolvedInstructor.specialization,
    specializationAr: overrides.specializationAr || resolvedInstructor.specializationAr,
    rating: overrides.rating ?? resolvedInstructor.rating,
    reviewsCount: overrides.reviewsCount ?? resolvedInstructor.reviewsCount,
    reviewsCountFormatted: overrides.reviewsCountFormatted || resolvedInstructor.reviewsCountFormatted,
    totalStudents: overrides.totalStudents ?? resolvedInstructor.totalStudents,
    totalStudentsFormatted: overrides.totalStudentsFormatted || resolvedInstructor.totalStudentsFormatted,
    experienceYears: overrides.experienceYears ?? resolvedInstructor.experienceYears,
    skills: overrides.skills !== undefined ? overrides.skills : resolvedInstructor.skills,
    skillsAr: overrides.skillsAr !== undefined ? overrides.skillsAr : resolvedInstructor.skillsAr,
    highlights: overrides.highlights !== undefined ? overrides.highlights : resolvedInstructor.highlights,
    reviews: overrides.reviews !== undefined ? overrides.reviews : resolvedInstructor.reviews,
    ratingBreakdown: overrides.ratingBreakdown || resolvedInstructor.ratingBreakdown,
    hourlyRate: overrides.hourlyRate !== undefined ? overrides.hourlyRate : resolvedInstructor.hourlyRate,
    hourlyRateAr: overrides.hourlyRateAr !== undefined ? overrides.hourlyRateAr : resolvedInstructor.hourlyRateAr,
    location: overrides.location !== undefined ? overrides.location : resolvedInstructor.location,
    locationAr: overrides.locationAr !== undefined ? overrides.locationAr : resolvedInstructor.locationAr,
    successRate: overrides.successRate ?? resolvedInstructor.successRate ?? 100,
    socials: {
      ...(resolvedInstructor.socials || {}),
      ...(overrides.socials || {}),
    },
    totalCourses: instructorCourses.length,
    courses: instructorCourses
  };
}

export const SPECIALIZATIONS_AR_MAP: Record<string, string> = {
  "Software Architecture & Executive Leadership": "هندسة البرمجيات والقيادة التنفيذية",
  "Executive Leadership Strategist & Agile Coach": "استشارية القيادة التنفيذية والتحول الرشيق",
  "UI/UX & Design Systems Specialist": "تصميم واجهة المستخدم وأنظمة التصميم",
  "Agile Transformation & Scrum Coaching": "التحول الرشيق وتدريب فرق أجايل",
  "Executive Negotiation & Business Communication": "التفاوض التنفيذي والتواصل المؤسسي",
  "Executive Presence & High-Stakes Storytelling": "الحضور القيادي والسرد القصصي الاحترافي",
  "Fullstack Engineering & Distributed Systems": "هندسة النظم المتكاملة والأنظمة الموزعة",
  "Professional Development": "التطوير المهني",
  "Management": "الإدارة",
  "Leadership": "القيادة",
  "Design": "التصميم",
  "Tech & Coding": "البرمجة والتقنية",
  "Tech": "التقنية",
  "Technology": "التقنية",
  "Data & AI": "البيانات والذكاء الاصطناعي",
  "Business": "الأعمال",
};

export const HEADLINES_AR_MAP: Record<string, string> = {
  "Certified Instructor": "مدرب معتمد",
  "Senior Software Architect & Executive Tech Coach": "كبير معماريي البرمجيات ومدرب القيادة التقنية التنفيذية",
  "Executive Leadership Strategist & Agile Coach": "استشارية القيادة التنفيذية ومدربة أساليب الإدارة المرنة",
  "Certified Master Coach & Senior Tech Lead": "مدرب معتمد وخبير تقني أول",
  "Senior Coach & Subject Matter Expert": "خبير ومستشار معتمد في CoachSpace",
  "Principal Product Designer & Design Systems Lead": "كبير مصممي المنتجات ورئيس أنظمة التصميم",
  "Lead Agile Coach & Enterprise Scrum Consultant": "كبير مدربي أجايل ومستشار التحول الرشيق للشركات",
  "Executive Coach & Strategic Communications Advisor": "مدرب تنفيذي ومستشار الاتصال الاستراتيجي",
  "Principal Fullstack Engineer & Cloud Architect": "كبير مهندسي Fullstack ومعماري البنية السحابية",
  "Student & Lifelong Learner": "طالب ومتعلم شغوف",
};

export const NAMES_AR_MAP: Record<string, string> = {
  "Mohammed Katanani": "محمد قطناني",
  "mohammed-katanani": "محمد قطناني",
  "Dr. Tariq Al-Mansoor": "د. طارق المنصور",
  "Dr. Sarah Jenkins": "د. سارة جينكينز",
  "Layla Mahmoud": "ليلى محمود",
  "Kareem Youssef": "كريم يوسف",
  "Farah Al-Khalil": "فرح الخليل",
  "Mousa Ibrahim": "موسى إبراهيم",
  "Nour Al-Hassan": "نور الحسن",
  "Omar Al-Fassi": "عمر الفاسي",
  "Amira Al-Mansoor": "أميرة المنصور",
  "Ahmed Al-Ghamdi": "أحمد الغامدي",
};

export const SKILLS_AR_MAP: Record<string, string> = {
  "Next.js 15": "Next.js 15",
  "React 19": "React 19",
  "Next.js": "Next.js",
  "React.js": "React.js",
  "TypeScript": "تايب سكريبت",
  "JavaScript": "جافا سكريبت",
  "Node.js": "Node.js",
  "Python": "بايثون Python",
  "System Design": "تصميم الأنظمة",
  "Cloud Architecture": "البنية السحابية",
  "Engineering Management": "إدارة الفرق الهندسية",
  "Clean Code": "الكود النظيف",
  "Clean Code & Architecture": "الكود النظيف والمعمارية المتقدمة",
  "Docker & Kubernetes": "Docker و Kubernetes",
  "GraphQL & REST APIs": "واجهات GraphQL و REST",
  "Database Engineering": "هندسة قواعد البيانات",
  "UI/UX Design": "تصميم تجربة المستخدم",
  "Figma": "فجما Figma",
  "Product Management": "إدارة المنتجات",
  "Executive Leadership": "القيادة التنفيذية",
  "Agile & Scrum Coaching": "تدريب فرق أجايل وسكرم",
  "Full-Stack Web Development": "تطوير الويب المتكامل",
  "Mobile App Development": "تطوير تطبيقات الموبايل",
  "Flutter": "فلاتر Flutter",
  "React Native": "رياكت نيتف React Native",
  "PostgreSQL": "PostgreSQL",
  "MongoDB": "MongoDB",
  "Tailwind CSS": "Tailwind CSS",
  "Career Mentorship": "التوجيه المهني",
  "Public Speaking": "الخطابة العامة",
  "Problem Solving & Algorithms": "حل المشكلات والخوارزميات",
  "SEO & Digital Marketing": "التسويق الرقمي",
  "Business Strategy": "استراتيجية الأعمال",
  "Finance & Accounting": "المالية والمحاسبة",
  "DevOps & CI/CD": "DevOps وأتمتة النشر",
  "AWS": "خدمات أمازون السحابية (AWS)",
  "Google Cloud (GCP)": "منصة جوجل السحابية (GCP)",
  "Artificial Intelligence (AI)": "الذكاء الاصطناعي (AI)",
  "Machine Learning": "تعلم الآلة",
  "Data Science & Analytics": "علم البيانات وتحليل الأعمال",
  "Cyber Security": "الأمن السيبراني",
  "Microservices": "الخدمات المصغرة (Microservices)",
};

export function getLocalizedSpecialization(spec?: string, isAr = false): string {
  if (!spec) return "";
  if (!isAr) return spec;
  return SPECIALIZATIONS_AR_MAP[spec] || spec;
}

export function getLocalizedHeadline(headline?: string, isAr = false): string {
  if (!headline) return "";
  if (!isAr) return headline;
  return HEADLINES_AR_MAP[headline] || headline;
}

export function getLocalizedName(name?: string, nameAr?: string, isAr = false): string {
  if (!name && !nameAr) return "";
  if (!isAr) return name || nameAr || "";
  if (nameAr && nameAr.trim() !== "" && nameAr !== name) return nameAr;
  if (name && NAMES_AR_MAP[name]) return NAMES_AR_MAP[name];
  return nameAr || name || "";
}

export function getLocalizedSkill(skill: string, isAr = false): string {
  if (!isAr) return skill;
  return SKILLS_AR_MAP[skill] || skill;
}
