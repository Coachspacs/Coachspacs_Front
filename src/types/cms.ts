export interface GlobalBrandingColors {
  primaryMain: string;
  primaryDark: string;
  primaryLight: string;
  secondaryLight: string;
  accentMint: string;
}

export interface GlobalBrandingConfig {
  logoUrl: string;
  faviconUrl: string;
  siteNameAr: string;
  siteNameEn: string;
  colors: GlobalBrandingColors;
  buttonRadius: '6px' | '8px' | '12px' | '9999px';
  updatedAt: string;
  updatedBy: string;
}

export interface HeroSectionData {
  badge_ar: string;
  badge_en: string;
  title_ar: string;
  title_en: string;
  highlighted_text_ar: string;
  highlighted_text_en: string;
  description_ar: string;
  description_en: string;
  cta_primary_text_ar: string;
  cta_primary_text_en: string;
  cta_primary_link: string;
  cta_secondary_text_ar: string;
  cta_secondary_text_en: string;
  cta_secondary_link: string;
  hero_image_url: string;
}

export interface TopCategoriesSectionData {
  title_ar: string;
  title_en: string;
  subtitle_ar: string;
  subtitle_en: string;
  is_visible: boolean;
}

export interface FeatureItem {
  id: string;
  title_ar: string;
  title_en: string;
  desc_ar: string;
  desc_en: string;
  icon?: string;
}

export interface MasterYourCraftSectionData {
  heading_ar: string;
  heading_en: string;
  description_ar: string;
  description_en: string;
  features: FeatureItem[];
}

export interface WhyStandsOutCard {
  id: string;
  title_ar: string;
  title_en: string;
  desc_ar: string;
  desc_en: string;
  icon?: string;
}

export interface WhyCoachSpaceStandsOutSectionData {
  title_ar: string;
  title_en: string;
  subtitle_ar: string;
  subtitle_en: string;
  cards: WhyStandsOutCard[];
}

export interface TestimonialItem {
  id: string;
  name_ar: string;
  name_en: string;
  role_ar: string;
  role_en: string;
  quote_ar: string;
  quote_en: string;
  rating?: number;
  avatar?: string;
}

export interface RealStoriesSectionData {
  title_ar: string;
  title_en: string;
  subtitle_ar: string;
  subtitle_en: string;
  testimonials: TestimonialItem[];
}

export interface FaqItem {
  id: string;
  question_ar: string;
  question_en: string;
  answer_ar: string;
  answer_en: string;
}

export interface FaqSectionData {
  title_ar: string;
  title_en: string;
  subtitle_ar: string;
  subtitle_en: string;
  items: FaqItem[];
}

export interface JoinFutureSectionData {
  title_ar: string;
  title_en: string;
  subtitle_ar: string;
  subtitle_en: string;
  button_text_ar: string;
  button_text_en: string;
  button_link: string;
}

export interface LandingSectionsData {
  hero: HeroSectionData;
  top_categories: TopCategoriesSectionData;
  master_craft: MasterYourCraftSectionData;
  why_stands_out: WhyCoachSpaceStandsOutSectionData;
  real_stories: RealStoriesSectionData;
  faq: FaqSectionData;
  join_future: JoinFutureSectionData;
}

export interface LandingPageDoc {
  status: 'published' | 'draft_only' | 'has_draft_changes';
  publishedAt: string | null;
  updatedAt: string;
  lastUpdatedBy: string;
  published: LandingSectionsData;
  draft: LandingSectionsData;
}
