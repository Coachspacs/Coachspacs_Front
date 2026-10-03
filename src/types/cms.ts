export interface GlobalBrandingColors {
  primaryMain: string;
  primaryDark: string;
  primaryLight: string;
  secondaryLight: string;
  accentMint: string;
}

export type SectionRolePermission =
  | 'all'
  | 'guest'
  | 'student'
  | 'instructor'
  | 'admin'
  | 'authenticated';

export interface GlobalBrandingConfig {
  logoUrl: string;
  footerLogoUrl?: string;
  faviconUrl: string;
  siteNameAr: string;
  siteNameEn: string;
  colors: GlobalBrandingColors;
  buttonRadius: '6px' | '8px' | '12px' | '9999px';
  ogImageUrl?: string;
  fontFamilyAr?: string;
  fontFamilyEn?: string;
  customGoogleFontName?: string;
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
  is_visible?: boolean;
  allowed_roles?: SectionRolePermission[];
}

export interface TopCategoriesSectionData {
  title_ar: string;
  title_en: string;
  subtitle_ar: string;
  subtitle_en: string;
  is_visible: boolean;
  allowed_roles?: SectionRolePermission[];
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
  is_visible?: boolean;
  allowed_roles?: SectionRolePermission[];
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
  is_visible?: boolean;
  allowed_roles?: SectionRolePermission[];
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
  is_visible?: boolean;
  allowed_roles?: SectionRolePermission[];
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
  is_visible?: boolean;
  allowed_roles?: SectionRolePermission[];
}

export interface JoinFutureSectionData {
  title_ar: string;
  title_en: string;
  subtitle_ar: string;
  subtitle_en: string;
  button_text_ar: string;
  button_text_en: string;
  button_link: string;
  is_visible?: boolean;
  allowed_roles?: SectionRolePermission[];
}

export type LandingSectionKey =
  | 'hero'
  | 'top_categories'
  | 'master_craft'
  | 'why_stands_out'
  | 'real_stories'
  | 'faq'
  | 'join_future';

export interface LandingSectionsData {
  hero: HeroSectionData;
  top_categories: TopCategoriesSectionData;
  master_craft: MasterYourCraftSectionData;
  why_stands_out: WhyCoachSpaceStandsOutSectionData;
  real_stories: RealStoriesSectionData;
  faq: FaqSectionData;
  join_future: JoinFutureSectionData;
  section_order?: LandingSectionKey[];
}

export interface LandingPageDoc {
  status: 'published' | 'draft_only' | 'has_draft_changes';
  publishedAt: string | null;
  updatedAt: string;
  lastUpdatedBy: string;
  published: LandingSectionsData;
  draft: LandingSectionsData;
}

export interface LegalSectionData {
  id: string;
  icon?: string;
  title_ar: string;
  title_en: string;
  content_ar: string;
  content_en: string;
}

export interface LegalPageData {
  badge_ar: string;
  badge_en: string;
  title_ar: string;
  title_en: string;
  subtitle_ar: string;
  subtitle_en: string;
  lastUpdatedDate_ar: string;
  lastUpdatedDate_en: string;
  contactTitle_ar: string;
  contactTitle_en: string;
  contactDescription_ar: string;
  contactDescription_en: string;
  contactEmail: string;
  sections: LegalSectionData[];
}

export interface LegalPagesContent {
  privacy: LegalPageData;
  terms: LegalPageData;
}

export interface LegalPageSnapshot {
  id: string;
  savedAt: string;
  savedBy: string;
  data: LegalPagesContent;
}

export interface LegalPagesDoc {
  status: 'published' | 'draft_only' | 'has_draft_changes';
  publishedAt: string | null;
  updatedAt: string;
  lastUpdatedBy: string;
  published: LegalPagesContent;
  draft: LegalPagesContent;
  history?: LegalPageSnapshot[];
}

