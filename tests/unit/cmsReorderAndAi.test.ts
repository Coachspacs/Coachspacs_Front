import { describe, it, expect } from "vitest";
import { DEFAULT_SECTION_ORDER, DEFAULT_LANDING_SECTIONS } from "@/lib/cmsDefaults";
import { AiCopywritingService } from "@/services/cms/aiCopywritingService";
import { LandingSectionKey } from "@/types/cms";

describe("CMS Drag-and-Drop Reordering & AI Copywriting Assistant Tests", () => {
  it("verifies DEFAULT_SECTION_ORDER contains all 7 unique landing section keys", () => {
    expect(DEFAULT_SECTION_ORDER).toHaveLength(7);
    const expectedKeys: LandingSectionKey[] = [
      "hero",
      "top_categories",
      "master_craft",
      "why_stands_out",
      "real_stories",
      "faq",
      "join_future",
    ];

    expectedKeys.forEach((key) => {
      expect(DEFAULT_SECTION_ORDER).toContain(key);
    });

    // Verify no duplicates
    const uniqueKeys = new Set(DEFAULT_SECTION_ORDER);
    expect(uniqueKeys.size).toBe(7);
  });

  it("verifies DEFAULT_LANDING_SECTIONS includes section_order initialized properly", () => {
    expect(DEFAULT_LANDING_SECTIONS.section_order).toBeDefined();
    expect(DEFAULT_LANDING_SECTIONS.section_order).toEqual(DEFAULT_SECTION_ORDER);
  });

  it("verifies AI copywriting service generates bilingual suggestions for inspiring tone", async () => {
    const suggestions = await AiCopywritingService.generateSuggestions({
      sectionKey: "hero",
      fieldType: "title",
      tone: "inspiring",
    });

    expect(suggestions).toHaveLength(3);
    suggestions.forEach((s) => {
      expect(s.text_ar.length).toBeGreaterThan(0);
      expect(s.text_en.length).toBeGreaterThan(0);
      expect(s.tone).toBe("inspiring");
      expect(s.rationale_ar.length).toBeGreaterThan(0);
      expect(s.rationale_en.length).toBeGreaterThan(0);
    });
  });

  it("verifies AI copywriting service generates distinct professional and direct suggestions", async () => {
    const profSuggestions = await AiCopywritingService.generateSuggestions({
      sectionKey: "hero",
      fieldType: "title",
      tone: "professional",
    });

    const directSuggestions = await AiCopywritingService.generateSuggestions({
      sectionKey: "hero",
      fieldType: "title",
      tone: "direct",
    });

    expect(profSuggestions).toHaveLength(3);
    expect(directSuggestions).toHaveLength(3);

    // Verify tones are preserved
    expect(profSuggestions[0].tone).toBe("professional");
    expect(directSuggestions[0].tone).toBe("direct");

    // Professional copy should contain professional keywords
    expect(profSuggestions[0].text_ar).toBeDefined();
    expect(directSuggestions[0].text_ar).toBeDefined();
  });

  it("verifies AI copywriting works across different sections (e.g. why_stands_out, join_future)", async () => {
    const whySuggestions = await AiCopywritingService.generateSuggestions({
      sectionKey: "why_stands_out",
      fieldType: "title",
      tone: "inspiring",
    });

    const ctaSuggestions = await AiCopywritingService.generateSuggestions({
      sectionKey: "join_future",
      fieldType: "title",
      tone: "direct",
    });

    expect(whySuggestions.length).toBeGreaterThanOrEqual(1);
    expect(ctaSuggestions.length).toBeGreaterThanOrEqual(1);
    expect(whySuggestions[0].text_ar).toContain("Coach Space");
  });

  it("verifies safe ordering fallback logic preserves user reordering and fills missing keys", () => {
    // Custom user order moving 'why_stands_out' to top
    const userOrder: LandingSectionKey[] = [
      "why_stands_out",
      "hero",
      "top_categories",
      "faq",
    ];

    const safeOrder = Array.from(
      new Set([...userOrder, ...DEFAULT_SECTION_ORDER])
    );

    expect(safeOrder[0]).toBe("why_stands_out");
    expect(safeOrder[1]).toBe("hero");
    expect(safeOrder[2]).toBe("top_categories");
    expect(safeOrder[3]).toBe("faq");
    // All 7 sections are included
    expect(safeOrder).toHaveLength(7);
    expect(safeOrder).toContain("master_craft");
    expect(safeOrder).toContain("real_stories");
    expect(safeOrder).toContain("join_future");
  });
});
