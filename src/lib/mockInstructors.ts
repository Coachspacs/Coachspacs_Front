import { PublicInstructor } from "@/types/publicInstructor";

export const MOCK_INSTRUCTORS: PublicInstructor[] = [];

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
    
    // Merge specificData, and only include globalData if it belongs to an actual instructor and matches slug
    const normalizedTarget = normalizeInstructorSlug(slugOrId);
    const globalSlug = normalizeInstructorSlug(globalData.slug || globalData.name || "");
    
    const isGlobalMatch = Boolean(
      (globalSlug && normalizedTarget && (globalSlug === normalizedTarget || globalData.id === slugOrId))
    );

    const merged = isGlobalMatch ? { ...globalData, ...specificData } : { ...specificData };

    // Strict guard: Never allow a student headline or bio to contaminate an instructor profile
    if (merged.headline === "Student & Lifelong Learner" || merged.headline === "طالب ومتعلم شغوف" || merged.headline === "طالب ومتعلم شغوف مدى الحياة") {
      delete merged.headline;
    }
    if (merged.headlineAr === "Student & Lifelong Learner" || merged.headlineAr === "طالب ومتعلم شغوف" || merged.headlineAr === "طالب ومتعلم شغوف مدى الحياة") {
      delete merged.headlineAr;
    }

    return merged;
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
 * Helpers to get and persist course status locally (e.g. pending_review)
 */
export function getSavedCourseStatus(courseId: string | number): string | null {
  if (typeof window === "undefined" || !courseId) return null;
  try {
    return localStorage.getItem(`coachspace_course_status_${courseId}`) || null;
  } catch {
    return null;
  }
}

export function saveCourseStatus(courseId: string | number, status: string): void {
  if (typeof window === "undefined" || !courseId) return;
  try {
    localStorage.setItem(`coachspace_course_status_${courseId}`, status);
  } catch {}
}

export function removeCourseStatus(courseId: string | number): void {
  if (typeof window === "undefined" || !courseId) return;
  try {
    localStorage.removeItem(`coachspace_course_status_${courseId}`);
  } catch {}
}

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

  // 3. Fallback: generate a dynamic instructor profile based on name or slug
  let resolvedInstructor: PublicInstructor;
  if (!foundInstructor) {
    const rawName = idOrSlug.replace(/^inst-/, "").replace(/-/g, " ");
    const displayName =
      rawName
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
    const displayNameAr = displayName;

    resolvedInstructor = {
      id: `inst-${normalized}`,
      slug: normalized || "instructor",
      name: displayName,
      nameAr: displayNameAr,
      headline: "",
      headlineAr: "",
      avatar: undefined,
      coverImage: undefined,
      bio: "",
      bioAr: "",
      aboutParagraphs: [],
      aboutParagraphsAr: [],
      specialization: "",
      specializationAr: "",
      rating: undefined,
      reviewsCount: 0,
      reviewsCountFormatted: undefined,
      totalStudents: undefined,
      totalStudentsFormatted: undefined,
      totalCourses: 0,
      experienceYears: undefined,
      socials: {},
      skills: [],
      skillsAr: [],
      highlights: [],
      ratingBreakdown: undefined,
      reviews: []
    };
  } else {
    resolvedInstructor = foundInstructor;
  }

  // Attach only actual matching courses for this instructor
  const instructorCourses = resolvedInstructor.courses || [];

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

export const BIOS_AR_MAP: Record<string, string> = {
  "Dedicated professional instructor on CoachSpace committed to delivering world-class educational experiences, real-world project skills, and career mentorship.": "مدرب محترف في منصة CoachSpace ملتزم بتقديم برامج تدريبية وتطبيقية عالية الجودة وتوجيه مهني متميز ونقل الخبرات العملية لبناء مهارات تقنية متقدمة.",
  "Dedicated professional instructor on CoachSpace committed to delivering world-class educational experiences and practical career mentorship.": "مدرب محترف في منصة CoachSpace ملتزم بتقديم برامج تدريبية وتطبيقية عالية الجودة وتوجيه مهني متميز.",
  "PhD in Computer Science with 14+ years of industry experience architecting scalable distributed systems and training high-performing engineering teams at top-tier tech companies.": "دكتوراه في علوم الحاسوب وخبرة أكثر من 14 عاماً في هندسة النظم السحابية الموزعة وبناء وتدريب الفرق الهندسية المتميزة في كبرى الشركات التقنية العالمية.",
  "Senior Full-Stack Engineer and instructor specializing in modern web development, scalable cloud backends, and practical real-world engineering.": "كبير مهندسي Full-Stack ومدرب معتمد متخصص في تطوير تطبيقات الويب الحديثة، والأنظمة السحابية المتقدمة، وبناء المشاريع البرمجية العملية.",
};

export function getLocalizedSpecialization(spec?: string, isAr = false): string {
  if (!spec) return "";
  if (!isAr) return spec;
  return SPECIALIZATIONS_AR_MAP[spec] || spec;
}

export function getLocalizedHeadline(headline?: string, isAr = false, isInstructor = false): string {
  if (!headline) {
    return "";
  }
  const trimmed = headline.trim().toLowerCase();
  if (
    trimmed === "certified instructor" ||
    trimmed === "مدرب معتمد" ||
    trimmed === "مدرب وخبير معتمد" ||
    trimmed === "مدرب موثوق" ||
    trimmed === "حساب مدرب معتمد"
  ) {
    return "";
  }
  // Prevent student headline from appearing on instructor pages
  if (isInstructor && (headline === "Student & Lifelong Learner" || headline === "طالب ومتعلم شغوف" || headline === "طالب ومتعلم شغوف مدى الحياة")) {
    return isAr ? "كبير معماريي البرمجيات ومدرب القيادة التقنية التنفيذية" : "Senior Software Architect & Executive Tech Coach";
  }
  if (!isAr) return headline;
  return HEADLINES_AR_MAP[headline] || headline;
}

export function getLocalizedBio(bio?: string, bioAr?: string, isAr = false): string {
  if (!bio && !bioAr) return "";
  if (!isAr) return bio || bioAr || "";
  if (bioAr && bioAr.trim() !== "" && bioAr !== bio) return bioAr;
  if (bio && BIOS_AR_MAP[bio.trim()]) return BIOS_AR_MAP[bio.trim()];
  // Fallback check if bio contains standard text
  if (bio && bio.includes("Dedicated professional instructor on CoachSpace")) {
    return "مدرب محترف في منصة CoachSpace ملتزم بتقديم برامج تدريبية وتطبيقية عالية الجودة وتوجيه مهني متميز ونقل الخبرات العملية لبناء مهارات تقنية متقدمة.";
  }
  return bioAr || bio || "";
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
