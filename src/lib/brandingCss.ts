import { GlobalBrandingConfig, GlobalBrandingColors } from "@/types/cms";
import { DEFAULT_BRANDING } from "@/lib/cmsDefaults";

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  let r = 0, g = 0, b = 0;
  const cleanHex = (hex || "#0F5244").replace("#", "");
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16) / 255;
    g = parseInt(cleanHex[1] + cleanHex[1], 16) / 255;
    b = parseInt(cleanHex[2] + cleanHex[2], 16) / 255;
  } else if (cleanHex.length >= 6) {
    r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    b = parseInt(cleanHex.substring(4, 6), 16) / 255;
  }
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
    h = Math.round(h * 360);
  }
  return { h, s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToHex(h: number, s: number, l: number): string {
  const normH = (h % 360 + 360) % 360;
  const normS = Math.max(0, Math.min(100, s)) / 100;
  const normL = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * normL - 1)) * normS;
  const x = c * (1 - Math.abs(((normH / 60) % 2) - 1));
  const m = normL - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= normH && normH < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= normH && normH < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= normH && normH < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= normH && normH < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= normH && normH < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= normH && normH < 360) {
    r = c; g = 0; b = x;
  }

  const toHex = (val: number) => {
    const hex = Math.round((val + m) * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Intelligent Auto-Harmonization:
 * Computes a luxury, cohesive 5-color palette given any primary hex color.
 */
export function autoHarmonizePalette(primaryHex: string): GlobalBrandingColors {
  const { h, s, l } = hexToHsl(primaryHex);

  // 1. Primary Dark: deeper tone with rich saturation
  const primaryDark = hslToHex(h, Math.min(95, s + 10), Math.max(8, l - 18));

  // 2. Primary Light: vibrant, readable highlight
  const primaryLight = hslToHex(h, Math.min(95, Math.max(65, s)), Math.min(68, Math.max(45, l + 22)));

  // 3. Secondary Light: soft pastel background tint (light mint / wash)
  const secondaryLight = hslToHex(h, Math.min(65, Math.max(30, s - 15)), 94);

  // 4. Accent Mint / Pop: analogous harmonic shift (+28 degrees) with high vibrancy
  const accentMint = hslToHex((h + 28) % 360, Math.min(95, Math.max(75, s + 5)), Math.min(65, Math.max(48, l + 14)));

  return {
    primaryMain: primaryHex.toUpperCase(),
    primaryDark,
    primaryLight,
    secondaryLight,
    accentMint,
  };
}

export interface BrandingPreset {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  colors: GlobalBrandingColors;
  buttonRadius: '6px' | '8px' | '12px' | '9999px';
}

export const BRANDING_PRESETS: BrandingPreset[] = [
  {
    id: 'emerald',
    nameAr: 'الزمردي الكوتشينغ (الافتراضي)',
    nameEn: 'Coach Space Emerald (Default)',
    descriptionAr: 'الأخضر الزمردي الراقي المعتمد لكوتش سبيس مع درجات النعناع الفاخرة',
    descriptionEn: 'The flagship luxury deep emerald & mint palette of Coach Space',
    colors: {
      primaryMain: '#0F5244',
      primaryDark: '#07382E',
      primaryLight: '#10B981',
      secondaryLight: '#D1FAE5',
      accentMint: '#34D399',
    },
    buttonRadius: '12px',
  },
  {
    id: 'sapphire',
    nameAr: 'الياقوت الأزرق الملكي',
    nameEn: 'Royal Sapphire',
    descriptionAr: 'طابع أكاديمي موثوق يجمع بين الأزرق الملكي العميق ولمسات السيان المضيئة',
    descriptionEn: 'Prestigious academic deep blue with luminous cyan highlights',
    colors: {
      primaryMain: '#1E3A8A',
      primaryDark: '#0F172A',
      primaryLight: '#2563EB',
      secondaryLight: '#DBEAFE',
      accentMint: '#38BDF8',
    },
    buttonRadius: '12px',
  },
  {
    id: 'indigo',
    nameAr: 'البنفسجي الإمبراطوري',
    nameEn: 'Imperial Indigo & Violet',
    descriptionAr: 'مظهر إبداعي عصري للمنصات الرقمية المتطورة ومجالات التكنولوجيا والتصميم',
    descriptionEn: 'Creative and avant-garde deep purple & violet for modern creators',
    colors: {
      primaryMain: '#4C1D95',
      primaryDark: '#2E1065',
      primaryLight: '#7C3AED',
      secondaryLight: '#EDE9FE',
      accentMint: '#A78BFA',
    },
    buttonRadius: '12px',
  },
  {
    id: 'amber',
    nameAr: 'العنبر الذهبي الفاخر',
    nameEn: 'Golden Amber & Bronze',
    descriptionAr: 'درجات ذهبية ونحاسية غنية تمنح المنصة طابعاً تنفيذياً فاخراً ونخبوياً',
    descriptionEn: 'Warm executive luxury with rich bronze and golden accents',
    colors: {
      primaryMain: '#78350F',
      primaryDark: '#451A03',
      primaryLight: '#D97706',
      secondaryLight: '#FEF3C7',
      accentMint: '#FBBF24',
    },
    buttonRadius: '12px',
  },
  {
    id: 'teal-slate',
    nameAr: 'السليت والأوشن تيل',
    nameEn: 'Modern Ocean Teal',
    descriptionAr: 'أزرق محيطي هادئ مع خلفيات ثلجية مريحة للعين في جلسات التعلم الطويلة',
    descriptionEn: 'Serene ocean teal paired with clean, refreshing slate undertones',
    colors: {
      primaryMain: '#0F766E',
      primaryDark: '#134E4A',
      primaryLight: '#14B8A6',
      secondaryLight: '#CCFBF1',
      accentMint: '#2DD4BF',
    },
    buttonRadius: '12px',
  },
];

export const POPULAR_GOOGLE_FONTS_ARABIC = [
  'Cairo',
  'Tajawal',
  'Almarai',
  'Readex Pro',
  'IBM Plex Sans Arabic',
  'Alexandria',
  'Noto Sans Arabic',
  'Changa',
];

export const POPULAR_GOOGLE_FONTS_ENGLISH = [
  'Plus Jakarta Sans',
  'Inter',
  'Roboto',
  'Poppins',
  'Outfit',
  'Montserrat',
  'Open Sans',
];

export function generateBrandingCss(branding?: GlobalBrandingConfig | null): string {
  const safeBranding = branding || DEFAULT_BRANDING;
  const colors = safeBranding.colors || DEFAULT_BRANDING.colors;
  const primaryMain = colors.primaryMain || DEFAULT_BRANDING.colors.primaryMain;
  const primaryDark = colors.primaryDark || DEFAULT_BRANDING.colors.primaryDark;
  const primaryLight = colors.primaryLight || DEFAULT_BRANDING.colors.primaryLight;
  const secondaryLight = colors.secondaryLight || DEFAULT_BRANDING.colors.secondaryLight;
  const accentMint = colors.accentMint || DEFAULT_BRANDING.colors.accentMint;
  const radius = safeBranding.buttonRadius || DEFAULT_BRANDING.buttonRadius;

  const fontAr = safeBranding.fontFamilyAr || 'Cairo';
  const fontEn = safeBranding.fontFamilyEn || 'Plus Jakarta Sans';
  const customFont = safeBranding.customGoogleFontName?.trim();

  let hueDiff = 0;
  try {
    const defaultH = 168; // Base hue of #0F5244
    const newHsl = hexToHsl(primaryMain);
    hueDiff = newHsl.h - defaultH;
  } catch {}

  const activeFontAr = customFont || fontAr;
  const activeFontEn = customFont || fontEn;

  return `
    :root {
      --color-primary-main: ${primaryMain};
      --color-primary-dark: ${primaryDark};
      --color-primary-light: ${primaryLight};
      --color-secondary-light: ${secondaryLight};
      --color-accent-mint: ${accentMint};
      --button-radius-custom: ${radius};
      --brand-hue-rotate: ${hueDiff}deg;
      --font-custom-ar: '${activeFontAr}', var(--font-cairo), system-ui, sans-serif;
      --font-custom-en: '${activeFontEn}', var(--font-jakarta), system-ui, sans-serif;
    }

    /* Dynamic Platform Typography */
    body, [dir="rtl"], [dir="rtl"] body {
      font-family: var(--font-custom-ar) !important;
    }

    [dir="ltr"], [dir="ltr"] body {
      font-family: var(--font-custom-en) !important;
    }

    .font-sans {
      font-family: var(--font-custom-ar), var(--font-custom-en), system-ui, sans-serif !important;
    }

    /* 1. Primary Solid Backgrounds */
    .bg-\\[\\#0F5244\\],
    [class~="bg-brand-dark"],
    .bg-brand,
    .bg-brand-DEFAULT,
    .bg-brand-600 {
      background-color: var(--color-primary-main) !important;
    }

    /* Text Selection */
    ::selection,
    [class*="selection:bg-"]::selection {
      background-color: var(--color-primary-main) !important;
      color: #ffffff !important;
    }

    /* 2. Primary Text Overrides */
    .text-\\[\\#0F5244\\],
    .text-\\[\\#0D7A66\\],
    .text-\\[\\#0d7a66\\],
    .text-\\[\\#0B4F3A\\],
    .text-\\[\\#0b4f3a\\],
    .text-\\[\\#148767\\],
    [class~="text-brand-dark"],
    [class~="text-[#0D7A66]"],
    [class~="text-[#0d7a66]"],
    [class~="text-brand-dark"],
    [class~="text-[#0b4f3a]"],
    [class~="text-[var(--color-primary-main)]"],
    .text-brand,
    .text-brand-DEFAULT,
    .text-brand-600 {
      color: var(--color-primary-main) !important;
    }

    /* 3. Primary Border Overrides */
    .border-\\[\\#0F5244\\],
    [class~="border-brand-dark"],
    .border-brand,
    .border-brand-DEFAULT {
      border-color: var(--color-primary-main) !important;
    }

    /* 4. Primary Dark / Hover Backgrounds */
    .bg-\\[\\#07382E\\],
    .bg-\\[\\#08382E\\],
    .bg-\\[\\#0c4337\\],
    .bg-\\[\\#0A3D32\\],
    .bg-\\[\\#004442\\],
    [class~="bg-[#07382E]"],
    [class~="bg-[#08382E]"],
    [class~="bg-[#0c4337]"],
    [class~="bg-[#0A3D32]"],
    [class~="bg-[#004442]"],
    .hover\\:bg-\\[\\#07382E\\]:hover,
    .hover\\:bg-\\[\\#08382E\\]:hover,
    .hover\\:bg-\\[\\#0c4337\\]:hover,
    .hover\\:bg-\\[\\#0A3D32\\]:hover,
    [class~="hover:bg-[#07382E]"]:hover,
    [class~="hover:bg-[#08382E]"]:hover,
    [class~="hover:bg-[#0c4337]"]:hover,
    [class~="hover:bg-[#0A3D32]"]:hover,
    .hover\\:bg-brand-700:hover {
      background-color: var(--color-primary-dark) !important;
    }

    .border-\\[\\#07382E\\],
    .border-\\[\\#08382E\\],
    [class~="border-[#07382E]"],
    [class~="border-[#08382E]"] {
      border-color: var(--color-primary-dark) !important;
    }

    /* 5. Primary Hover Text & Border */
    .hover\\:text-\\[\\#0F5244\\]:hover,
    [class~="hover:text-brand-dark"]:hover,
    .group:hover .group-hover\\:text-\\[\\#0F5244\\],
    .group:hover [class~="group-hover:text-brand-dark"] {
      color: var(--color-primary-main) !important;
    }

    .hover\\:border-\\[\\#0F5244\\]:hover,
    [class~="hover:border-brand-dark"]:hover,
    .group:hover .group-hover\\:border-\\[\\#0F5244\\],
    .group:hover [class~="group-hover:border-brand-dark"] {
      border-color: var(--color-primary-main) !important;
    }

    .hover\\:bg-\\[\\#0F5244\\]:hover,
    [class~="hover:bg-brand-dark"]:hover,
    .group:hover .group-hover\\:bg-\\[\\#0F5244\\],
    .group:hover [class~="group-hover:bg-brand-dark"] {
      background-color: var(--color-primary-main) !important;
    }

    /* 6. Soft Tint Backgrounds - Light Mode Adaptation */
    html:not(.dark) .bg-\\[\\#E6F9F3\\],
    html:not(.dark) .bg-\\[\\#e2f3f0\\],
    html:not(.dark) .bg-\\[\\#EBF5F3\\],
    html:not(.dark) .bg-\\[\\#E8F3F1\\],
    html:not(.dark) .bg-\\[\\#E5F1EC\\],
    html:not(.dark) .bg-\\[\\#E6F3EF\\],
    html:not(.dark) .bg-slate-50,
    html:not(.dark) .bg-teal-50,
    html:not(.dark) [class~="bg-[#E6F9F3]"],
    html:not(.dark) [class~="bg-[#e2f3f0]"],
    html:not(.dark) [class~="bg-[#EBF5F3]"],
    html:not(.dark) [class~="bg-[#E8F3F1]"],
    html:not(.dark) [class~="bg-[#E5F1EC]"],
    html:not(.dark) [class~="bg-[#E6F3EF]"],
    html:not(.dark) [class~="bg-slate-50"],
    html:not(.dark) [class~="bg-teal-50"] {
      background-color: color-mix(in srgb, var(--color-primary-main) 10%, white) !important;
    }

    /* 6B. Soft Tint Backgrounds - Dark Mode Adaptation (Never blinding white!) */
    .dark .bg-slate-50,
    .dark .bg-teal-50,
    .dark [class~="bg-slate-50"],
    .dark [class~="bg-teal-50"] {
      background-color: color-mix(in srgb, var(--color-primary-main) 16%, #0f172a) !important;
    }

    /* 7. Soft Border Overrides */
    .border-slate-100,
    .border-slate-200,
    .border-slate-300,
    .border-teal-200,
    [class~="border-slate-100"],
    [class~="border-slate-200"],
    [class~="border-slate-300"],
    [class~="border-teal-200"] {
      border-color: color-mix(in srgb, var(--color-primary-main) 22%, transparent) !important;
    }

    /* 8. Soft Gradient Containers */
    html:not(.dark) [class*="from-[#E5F1EC]"],
    html:not(.dark) [class*="from-[#EBF5F3]"],
    html:not(.dark) [class*="from-[#E6F3EF]"] {
      --tw-gradient-from: color-mix(in srgb, var(--color-primary-main) 14%, white) var(--tw-gradient-from-position) !important;
      --tw-gradient-to: color-mix(in srgb, var(--color-primary-main) 4%, white) var(--tw-gradient-to-position) !important;
      --tw-gradient-stops: var(--tw-gradient-from), color-mix(in srgb, var(--color-primary-main) 7%, white) 50%, var(--tw-gradient-to) !important;
    }

    html:not(.dark) [class*="to-[#DAECE5]"],
    html:not(.dark) [class*="to-[#E2F1EE]"],
    html:not(.dark) [class*="to-[#D5EDE6]"] {
      --tw-gradient-to: color-mix(in srgb, var(--color-primary-main) 5%, white) var(--tw-gradient-to-position) !important;
    }

    /* Dark mode gradient adaptation */
    .dark [class*="from-[#E5F1EC]"],
    .dark [class*="from-[#EBF5F3]"],
    .dark [class*="from-[#E6F3EF]"] {
      --tw-gradient-from: color-mix(in srgb, var(--color-primary-main) 22%, #0f172a) var(--tw-gradient-from-position) !important;
      --tw-gradient-to: color-mix(in srgb, var(--color-primary-main) 8%, #0f172a) var(--tw-gradient-to-position) !important;
      --tw-gradient-stops: var(--tw-gradient-from), color-mix(in srgb, var(--color-primary-main) 14%, #0f172a) 50%, var(--tw-gradient-to) !important;
    }

    /* Darker Gradient Containers (Badges, Buttons) */
    [class*="from-[#004442]"],
    [class*="from-brand-dark"] {
      --tw-gradient-from: var(--color-primary-dark) var(--tw-gradient-from-position) !important;
      --tw-gradient-to: var(--color-primary-main) var(--tw-gradient-to-position) !important;
      --tw-gradient-stops: var(--tw-gradient-from), var(--color-primary-main), var(--tw-gradient-to) !important;
    }

    /* 9. Accent Mint / Light Highlights */
    .text-\\[\\#6CF8BB\\],
    [class*="text-[#6CF8BB]"],
    .text-\\[\\#45D1B4\\],
    [class*="text-[#45D1B4]"],
    .text-slate-300,
    .text-brand-light {
      color: var(--color-accent-mint) !important;
    }

    .bg-\\[\\#6CF8BB\\],
    [class*="bg-[#6CF8BB]"]:not([class*="/"]),
    .bg-\\[\\#45D1B4\\],
    [class*="bg-[#45D1B4]"]:not([class*="/"]) {
      background-color: var(--color-accent-mint) !important;
    }

    /* 10. Aurora Glows with Opacity */
    [class*="bg-[#6CF8BB]/15"],
    [class*="bg-[#6CF8BB]/20"],
    [class*="bg-[#6CF8BB]/25"] {
      background-color: color-mix(in srgb, var(--color-accent-mint) 22%, transparent) !important;
    }
    [class*="bg-brand-dark/8"] {
      background-color: color-mix(in srgb, var(--color-primary-main) 10%, transparent) !important;
    }
    [class*="bg-brand-dark/15"],
    [class*="bg-brand-dark/20"] {
      background-color: color-mix(in srgb, var(--color-primary-main) 20%, transparent) !important;
    }

    /* 11. Emerald / Teal Text Overrides */
    .text-brand-dark,
    .text-brand-dark,
    .text-brand-dark,
    .text-teal-700,
    [class*="text-brand-dark"],
    [class*="text-brand-dark"],
    [class*="text-brand-dark"],
    [class*="text-teal-700"] {
      color: var(--color-primary-main) !important;
    }

    /* 12. Focus & Form Rings */
    .focus\\:border-\\[\\#0F5244\\]:focus,
    [class*="focus:border-brand-dark"]:focus,
    .focus-within\\:border-\\[\\#0F5244\\]:focus-within,
    [class*="focus-within:border-brand-dark"]:focus-within {
      border-color: var(--color-primary-main) !important;
    }

    .focus\\:ring-\\[\\#0F5244\\]:focus,
    [class*="focus:ring-brand-dark"]:focus,
    .focus-within\\:ring-\\[\\#0F5244\\]:focus-within,
    [class*="focus-within:ring-brand-dark"]:focus-within {
      --tw-ring-color: var(--color-primary-main) !important;
    }

    /* 13. SVG icons & badge fills */
    svg [fill="#0F5244"],
    [fill="#0F5244"] {
      fill: var(--color-primary-main) !important;
    }

    /* 14. Shadow Tints */
    [class*="shadow-brand-dark"],
    [class*="shadow-brand-dark"] {
      --tw-shadow-color: var(--color-primary-main) !important;
    }

    /* 15. Dynamic Brand Logo Hue Tinting */
    .brand-logo-img {
      filter: hue-rotate(var(--brand-hue-rotate, 0deg));
      transition: filter 0.3s ease;
    }

    /* 16. Dynamic Button Radius */
    ${
      radius
        ? `
    a[class*="px-"][class*="py-"][class*="rounded-full"],
    button[class*="px-"][class*="py-"][class*="rounded-full"],
    a.rounded-full.px-6,
    a.rounded-full.px-7,
    a.rounded-full.px-8,
    button.rounded-full.px-6,
    button.rounded-full.px-7,
    button.rounded-full.px-8,
    .btn-dynamic-radius {
      border-radius: var(--button-radius-custom) !important;
    }
    `
        : ""
    }
  `;
}
