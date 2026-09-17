import { describe, it, expect } from "vitest";
import { DEFAULT_BRANDING, DEFAULT_LANDING_SECTIONS } from "@/lib/cmsDefaults";
import { CmsServerService } from "@/services/cms/cmsServerService";
import { LandingSectionsData } from "@/types/cms";

describe("CMS & Global Branding Architecture Tests (US-23)", () => {
  it("verifies DEFAULT_BRANDING contains all mandatory CSS design tokens", () => {
    expect(DEFAULT_BRANDING.colors.primaryMain).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(DEFAULT_BRANDING.colors.primaryDark).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(DEFAULT_BRANDING.colors.primaryLight).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(DEFAULT_BRANDING.colors.secondaryLight).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(DEFAULT_BRANDING.colors.accentMint).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(["6px", "8px", "12px", "9999px"]).toContain(DEFAULT_BRANDING.buttonRadius);
  });

  it("verifies all 7 landing sections have complete Arabic and English defaults", () => {
    const sections = DEFAULT_LANDING_SECTIONS;

    // 1. Hero
    expect(sections.hero.title_ar.length).toBeGreaterThan(0);
    expect(sections.hero.title_en.length).toBeGreaterThan(0);
    expect(sections.hero.cta_primary_link).toBe("/courses");

    // 2. Top Categories
    expect(sections.top_categories.title_ar.length).toBeGreaterThan(0);
    expect(sections.top_categories.title_en.length).toBeGreaterThan(0);
    expect(sections.top_categories.is_visible).toBe(true);

    // 3. Master Craft
    expect(sections.master_craft.heading_ar.length).toBeGreaterThan(0);
    expect(sections.master_craft.heading_en.length).toBeGreaterThan(0);
    expect(sections.master_craft.features.length).toBeGreaterThanOrEqual(3);

    // 4. Why Stands Out
    expect(sections.why_stands_out.title_ar.length).toBeGreaterThan(0);
    expect(sections.why_stands_out.title_en.length).toBeGreaterThan(0);
    expect(sections.why_stands_out.cards.length).toBeGreaterThanOrEqual(3);

    // 5. Real Stories
    expect(sections.real_stories.testimonials.length).toBeGreaterThanOrEqual(3);
    sections.real_stories.testimonials.forEach((t) => {
      expect(t.name_ar.length).toBeGreaterThan(0);
      expect(t.name_en.length).toBeGreaterThan(0);
      expect(t.quote_ar.length).toBeGreaterThan(0);
      expect(t.quote_en.length).toBeGreaterThan(0);
    });

    // 6. FAQ
    expect(sections.faq.items.length).toBeGreaterThanOrEqual(4);
    sections.faq.items.forEach((f) => {
      expect(f.question_ar.length).toBeGreaterThan(0);
      expect(f.question_en.length).toBeGreaterThan(0);
      expect(f.answer_ar.length).toBeGreaterThan(0);
      expect(f.answer_en.length).toBeGreaterThan(0);
    });

    // 7. Join Future (CTA)
    expect(sections.join_future.title_ar.length).toBeGreaterThan(0);
    expect(sections.join_future.button_link).toBe("/register");
  });

  it("guarantees safe fallback when Firestore is unconfigured or offline", async () => {
    // When environment variables are absent, CmsServerService must never throw
    const branding = await CmsServerService.getPublishedBranding();
    expect(branding).toBeDefined();
    expect(branding.colors.primaryMain).toBe(DEFAULT_BRANDING.colors.primaryMain);

    const landingSections = await CmsServerService.getLandingSections(false);
    expect(landingSections).toBeDefined();
    expect(landingSections.hero.title_ar).toBe(DEFAULT_LANDING_SECTIONS.hero.title_ar);
  });

  it("handles Draft vs Published lifecycle safely", async () => {
    const updatedDraft: Partial<LandingSectionsData> = {
      hero: {
        ...DEFAULT_LANDING_SECTIONS.hero,
        title_ar: "عنوان مسودة تجريبي",
        title_en: "Experimental Draft Title",
      },
    };

    const draftDoc = await CmsServerService.saveLandingDraft(updatedDraft, "test-editor@coachspace.com");
    expect(draftDoc.status).toBe("has_draft_changes");
    expect(draftDoc.draft.hero.title_ar).toBe("عنوان مسودة تجريبي");

    // In non-preview mode, published content remains untouched
    const published = await CmsServerService.getLandingSections(false);
    expect(published.hero.title_ar).not.toBe("عنوان مسودة تجريبي");

    // In preview mode, draft content is returned
    const preview = await CmsServerService.getLandingSections(true);
    expect(preview.hero.title_ar).toBe("عنوان مسودة تجريبي");
  });

  it("verifies bilingual text resolution logic", () => {
    function resolveBilingualField(fieldAr?: string, fieldEn?: string, locale = "ar"): string {
      const isAr = locale === "ar";
      return (isAr ? fieldAr : fieldEn) || fieldAr || fieldEn || "";
    }

    expect(resolveBilingualField("أهلاً", "Hello", "ar")).toBe("أهلاً");
    expect(resolveBilingualField("أهلاً", "Hello", "en")).toBe("Hello");
    expect(resolveBilingualField("أهلاً", undefined, "en")).toBe("أهلاً"); // Graceful fallback
    expect(resolveBilingualField(undefined, "Hello", "ar")).toBe("Hello"); // Graceful fallback
  });
});
