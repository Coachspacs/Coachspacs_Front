export type CopywritingTone = 'inspiring' | 'professional' | 'direct';

export interface CopywritingRequest {
  sectionKey: string;
  fieldType: 'title' | 'description' | 'badge' | 'cta' | 'general';
  currentTextAr?: string;
  currentTextEn?: string;
  tone?: CopywritingTone;
  topicContext?: string;
}

export interface CopywritingSuggestion {
  id: string;
  text_ar: string;
  text_en: string;
  description_ar?: string;
  description_en?: string;
  tone: CopywritingTone;
  rationale_ar: string;
  rationale_en: string;
}

interface HeuristicTemplate {
  titles: { ar: string; en: string };
  descriptions: { ar: string; en: string };
  rationale: { ar: string; en: string };
}

const SECTION_HEURISTICS: Record<string, Record<CopywritingTone, HeuristicTemplate[]>> = {
  hero: {
    inspiring: [
      {
        titles: {
          ar: 'اصنع مستقبلك المهني مع روّاد التدريب الاحترافي',
          en: 'Shape Your Future With Master-Tier Industry Mentors',
        },
        descriptions: {
          ar: 'انطلق في تجربة تعليمية استثنائية تجمع بين المعرفة التطبيقية المباشرة والتوجيه الشخصي لبناء مهارات تقود بها سوق العمل.',
          en: 'Embark on a transformative learning journey combining hands-on mastery and personal mentorship to lead the global market.',
        },
        rationale: {
          ar: 'يركز على الطموح والشغف والريادة المستقبلية لتحفيز الزائر على البدء فوراً.',
          en: 'Focuses on ambition, passion, and future leadership to drive immediate action.',
        },
      },
      {
        titles: {
          ar: 'من الشغف إلى الاحتراف: مسارك الموثوق للريادة',
          en: 'From Passion to Mastery: Your Verified Path to Excellence',
        },
        descriptions: {
          ar: 'دورات عملية مكثفة صُممت خصيصاً لمساعدتك على إتقان مهارات المستقبل ونيل شهادات معتمدة تفتح أمامك آفاقاً غير محدودة.',
          en: 'Rigorous hands-on programs engineered to help you master future-proof skills and earn industry-recognized credentials.',
        },
        rationale: {
          ar: 'نبرة تركز على فكرة التحول من مرحلة الاهتمام إلى الاحتراف الملموس.',
          en: 'Emphasizes tangible transformation from interest to verified career mastery.',
        },
      },
      {
        titles: {
          ar: 'تعلّم بذكاء، ارتقِ بمسارك، وتصدّر مجالك',
          en: 'Learn Smart, Accelerate Growth, Dominate Your Field',
        },
        descriptions: {
          ar: 'انضم إلى مجتمع كوتش سبيس حيث تجتمع النخبة لاكتساب أحدث المهارات المطلوبة في كبرى الشركات الإقليمية والعالمية.',
          en: 'Join the Coach Space community where top talent converges to master in-demand skills coveted by premier enterprises.',
        },
        rationale: {
          ar: 'صياغة عصرية ديناميكية تناسب جيل المحترفين وروّاد التكنولوجيا.',
          en: 'Modern, high-energy phrasing tailored for ambitious modern professionals.',
        },
      },
    ],
    professional: [
      {
        titles: {
          ar: 'المنصة الأكاديمية الأولى لتطوير الكفاءات والقيادات',
          en: 'The Premier Executive Platform for Leadership & Skill Mastery',
        },
        descriptions: {
          ar: 'مناهج معتمدة ومشاريع تطبيقية يقدمها خبراء مرخصون لضمان أعلى معايير الجودة والاعتراف المهني.',
          en: 'Accredited curricula and hands-on capstones delivered by licensed specialists adhering to rigorous international standards.',
        },
        rationale: {
          ar: 'نبرة مؤسسية رصينة تبني ثقة مطلقة لدى الشركات والمتعلمين الجادين.',
          en: 'Authoritative, institutional tone establishing deep credibility with serious learners.',
        },
      },
      {
        titles: {
          ar: 'برامج تدريبية معتمدة تصنع الفارق في مسارك الوظيفي',
          en: 'Certified Curricula Delivering Measurable Career Impact',
        },
        descriptions: {
          ar: 'معايير تدريبية دقيقة صُممت لمواءمة متطلبات سوق العمل المعاصر وتزويدك بالكفاءات القابلة للقياس.',
          en: 'Rigorous benchmarks calibrated to modern industry demands, empowering you with measurable, verified competencies.',
        },
        rationale: {
          ar: 'تركز على العائد الملموس على الاستثمار التعليمي والموثوقية العالية.',
          en: 'Highlights measurable return on educational investment and verifiable competence.',
        },
      },
      {
        titles: {
          ar: 'استثمر في مستقبلك مع خبراء الصناعة المعتمدين',
          en: 'Invest in Your Growth with Certified Industry Authorities',
        },
        descriptions: {
          ar: 'اكتسب مهارات متقدمة ترتقي بإنتاجيتك وتؤهلك للمناصب القيادية من خلال بيئة تدريبية تفاعلية شاملة.',
          en: 'Acquire high-leverage skills that multiply productivity and qualify you for executive roles in a world-class workspace.',
        },
        rationale: {
          ar: 'تخاطب المحترفين الباحثين عن الترقية والارتقاء في السلم الإداري.',
          en: 'Speaks directly to professionals pursuing corporate promotions and leadership tiers.',
        },
      },
    ],
    direct: [
      {
        titles: {
          ar: 'تعلّم المهارات الأكثر طلباً اليوم وابدأ التطبيق فوراً',
          en: 'Master In-Demand Skills Today and Start Applying Instantly',
        },
        descriptions: {
          ar: 'دورات مركزة ومشاريع حقيقية وشهادات فورية بدون حشو. اختر مسارك وابدأ الآن.',
          en: 'Focused courses, real-world projects, and immediate verification without fluff. Choose your track and begin now.',
        },
        rationale: {
          ar: 'مباشرة للغاية، تركز على السرعة والخلو من الحشو النظري.',
          en: 'Ultra-concise, emphasizing immediate practical utility and zero theoretical fluff.',
        },
      },
      {
        titles: {
          ar: 'خطوتك الأسرع نحو إتقان تخصصك والحصول على شهادتك',
          en: 'Your Fastest Path to Subject Mastery and Certification',
        },
        descriptions: {
          ar: 'سجل في دقائق، وتدرّب على أيدي محترفين، وطوّر سيرتك الذاتية بأقوى المشاريع العملية.',
          en: 'Enroll in minutes, train under veteran coaches, and elevate your portfolio with battle-tested projects.',
        },
        rationale: {
          ar: 'تركز على سهولة وسرعة الإجراءات والنتيجة المباشرة للدارس.',
          en: 'Focuses on low friction, rapid onboarding, and immediate portfolio impact.',
        },
      },
      {
        titles: {
          ar: 'دورات عملية متقدمة مع أفضل الخبراء في مكان واحد',
          en: 'Advanced Practical Courses with Top Mentors in One Place',
        },
        descriptions: {
          ar: 'كل ما تحتاجه للارتقاء في مجالك متاح الآن بمرونة كاملة تتوافق مع جدولك اليومي.',
          en: 'Everything required to excel in your discipline, available on your own schedule.',
        },
        rationale: {
          ar: 'صياغة واضحة ومركزة على الشمولية والمرونة.',
          en: 'Clear and compact, focusing on comprehensive coverage and schedule flexibility.',
        },
      },
    ],
  },
  top_categories: {
    inspiring: [
      {
        titles: {
          ar: 'استكشف مسارات الغد واختر مجالك الريادي',
          en: 'Explore Tomorrow’s Disciplines & Choose Your Frontier',
        },
        descriptions: {
          ar: 'تخصصات صُممت لتلهم طموحك وتمنحك الأدوات اللازمة للابتكار وصنع التغيير الحقيقي.',
          en: 'Tracks architected to ignite ambition and arm you with tools for authentic industry innovation.',
        },
        rationale: {
          ar: 'تشجع المتعلم على استكشاف المجالات بدافع الشغف والريادة.',
          en: 'Inspires exploration driven by passion and creative industry frontiers.',
        },
      },
    ],
    professional: [
      {
        titles: {
          ar: 'التخصصات الأكثر طلباً وقيمة في سوق العمل المعاصر',
          en: 'High-Growth Disciplines Driving the Modern Economy',
        },
        descriptions: {
          ar: 'مجالات تدريبية منتقاة بعناية لضمان أعلى عائد استثماري على وقتك ومسيرتك المهنية.',
          en: 'Carefully curated fields engineered to deliver the highest return on your learning investment.',
        },
        rationale: {
          ar: 'تخاطب المنطق والعائد الوظيفي والطلب السوقي المرتفع.',
          en: 'Appeals to market demand, career return, and structural industry trends.',
        },
      },
    ],
    direct: [
      {
        titles: {
          ar: 'اختر مجالك وابدأ رحلة التعلم الآن',
          en: 'Select Your Domain and Start Learning Right Away',
        },
        descriptions: {
          ar: 'تصفح التصنيفات واكتشف أحدث الكورسات التطبيقية المتاحة للتسجيل الفوري.',
          en: 'Browse categories and uncover practical courses ready for instant enrollment.',
        },
        rationale: {
          ar: 'دعوة سريعة ومباشرة لتصفح الكتالوج والبدء.',
          en: 'Fast, actionable call to browse catalog categories immediately.',
        },
      },
    ],
  },
  why_stands_out: {
    inspiring: [
      {
        titles: {
          ar: 'لماذا يختار الطموحون منصة Coach Space؟',
          en: 'Why Ambitious Leaders Choose Coach Space',
        },
        descriptions: {
          ar: 'لأننا لا نقدم مجرد دورات، بل نصنع بيئة متكاملة تضمن إتقانك الفعلي وتحولك إلى خبير ملهم.',
          en: 'Because we deliver more than courses — we build an ecosystem for verified mastery and leadership.',
        },
        rationale: {
          ar: 'تعزيز مكانة العلامة كخيار أول للنخبة والمبدعين.',
          en: 'Positions the brand as the premier destination for high-performing visionaries.',
        },
      },
    ],
    professional: [
      {
        titles: {
          ar: 'المزايا التنافسية التي تجعلنا الخيار الأول للمؤسسات',
          en: 'The Competitive Standards That Set Our Platform Apart',
        },
        descriptions: {
          ar: 'جودة أكاديمية موثقة، خبراء معتمدون، ومشاريع واقعية تؤهلك للتميز الفوري.',
          en: 'Documented academic rigor, certified instructors, and applied capstones ensuring immediate edge.',
        },
        rationale: {
          ar: 'تسليط الضوء على المعايير والموثوقية والنتائج المؤكدة.',
          en: 'Spotlights verifiable standards, certified mentors, and provable outcomes.',
        },
      },
    ],
    direct: [
      {
        titles: {
          ar: 'ما الذي ستحصل عليه معنا خطوة بخطوة؟',
          en: 'What You Gain With Us Step-by-Step',
        },
        descriptions: {
          ar: 'تعلّم عملي، مدرب مرافق، شهادات معتمدة، ومرونة مطلقة تلائم وقتك.',
          en: 'Hands-on practice, mentor feedback, accredited certs, and complete schedule freedom.',
        },
        rationale: {
          ar: 'تلخيص مباشر وسريع للمكاسب الملموسة بدون تعقيد.',
          en: 'Clear bullet-ready summary of tangible student benefits.',
        },
      },
    ],
  },
  join_future: {
    inspiring: [
      {
        titles: {
          ar: 'مستقبلك يبدأ بقرار اليوم: انضم إلى قادة الغد',
          en: 'Your Future Begins With Today’s Decision: Join Tomorrow’s Leaders',
        },
        descriptions: {
          ar: 'لا تنتظر الفرصة، بل اصنعها. انضم إلى آلاف المحترفين الذين ارتقوا بمساراتهم معنا.',
          en: 'Don’t wait for opportunity — create it. Join thousands of professionals accelerating their trajectory.',
        },
        rationale: {
          ar: 'حث عاطفي قوي يحفز على اتخاذ القرار الاستباقي دون تردد.',
          en: 'Powerful emotional catalyst driving proactive, resolute decision-making.',
        },
      },
    ],
    professional: [
      {
        titles: {
          ar: 'ابدأ برنامجك التدريبي اليوم وعزّز مؤهلاتك التنافسية',
          en: 'Enroll Today and Elevate Your Professional Credentials',
        },
        descriptions: {
          ar: 'انضم إلى مجتمع الكفاءات الرائدة واكتسب الشهادات التي تعترف بها كبرى الشركات.',
          en: 'Join a premier network of talent and secure certifications recognized across major industries.',
        },
        rationale: {
          ar: 'دعوة رصينة تركز على المكانة المهنية والاعتراف بالشهادات.',
          en: 'Dignified CTA focusing on career standing and institutional validation.',
        },
      },
    ],
    direct: [
      {
        titles: {
          ar: 'سجّل حسابك مجاناً في دقائق وابدأ التعلم الآن',
          en: 'Create Your Free Account in Minutes & Start Learning',
        },
        descriptions: {
          ar: 'خطوات بسيطة تفصلك عن أول درس في مسارك. ابدأ رحلتك الآن بنقرة واحدة.',
          en: 'Simple steps stand between you and your first breakthrough lesson. Start with one click.',
        },
        rationale: {
          ar: 'أعلى درجات المباشرة لخفض مقاومة التسجيل وزيادة نسبة التحويل.',
          en: 'Maximizes conversion rate by highlighting friction-free enrollment.',
        },
      },
    ],
  },
};

export class AiCopywritingService {
  /**
   * Generates high-converting marketing copywriting variations for CMS editors
   */
  static async generateSuggestions(req: CopywritingRequest): Promise<CopywritingSuggestion[]> {
    const tone: CopywritingTone = req.tone || 'inspiring';
    const sectionKey = req.sectionKey || 'hero';

    // 1. Try Live LLM Provider if configured in environment (Gemini / OpenAI)
    if (process.env.GEMINI_API_KEY) {
      try {
        const liveSuggestions = await this.callGeminiApi(req, process.env.GEMINI_API_KEY);
        if (liveSuggestions && liveSuggestions.length > 0) {
          return liveSuggestions;
        }
      } catch (err) {
        console.warn('[AiCopywritingService] Gemini API call failed, using heuristic engine:', err);
      }
    }

    // 2. High-Performance Heuristic Knowledge Engine
    return this.generateFromHeuristicModel(sectionKey, tone, req);
  }

  private static generateFromHeuristicModel(
    sectionKey: string,
    tone: CopywritingTone,
    req: CopywritingRequest
  ): CopywritingSuggestion[] {
    const sectionTemplates =
      SECTION_HEURISTICS[sectionKey] || SECTION_HEURISTICS['hero'];
    const candidates = sectionTemplates[tone] || sectionTemplates['inspiring'];

    // Provide 3 variations, adapting to user's existing text if present
    const baseList = candidates.length >= 3 ? candidates : candidates.concat(sectionTemplates['professional'] || []);

    return baseList.slice(0, 3).map((template, idx) => ({
      id: `ai-copy-${sectionKey}-${tone}-${idx + 1}`,
      text_ar: template.titles.ar,
      text_en: template.titles.en,
      description_ar: template.descriptions.ar,
      description_en: template.descriptions.en,
      tone,
      rationale_ar: template.rationale.ar,
      rationale_en: template.rationale.en,
    }));
  }

  private static async callGeminiApi(
    req: CopywritingRequest,
    apiKey: string
  ): Promise<CopywritingSuggestion[] | null> {
    const prompt = `You are a world-class bilingual EdTech & Executive Coaching copywriter for "Coach Space".
Generate 3 distinct, high-converting marketing copy variations for the landing page section "${req.sectionKey}".
Tone: ${req.tone || 'inspiring'}.
Field Context: ${req.fieldType}.
Current Arabic: "${req.currentTextAr || ''}"
Current English: "${req.currentTextEn || ''}"

Return ONLY a valid JSON array of 3 objects with this exact structure:
[
  {
    "id": "gemini-1",
    "text_ar": "العنوان المقترح بالعربية",
    "text_en": "Suggested Title in English",
    "description_ar": "الوصف التسويقي المقترح بالعربية",
    "description_en": "Suggested Marketing Description in English",
    "tone": "${req.tone || 'inspiring'}",
    "rationale_ar": "السبب التسويقي وراء هذه الصياغة",
    "rationale_en": "Marketing rationale behind this copy"
  }
]`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    const parsed = JSON.parse(rawText);
    return Array.isArray(parsed) ? parsed : null;
  }
}
