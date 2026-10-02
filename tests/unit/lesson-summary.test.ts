import { describe, it, expect, vi, beforeEach } from "vitest";
import { lessonSummaryService, cleanExtractedText } from "@/services/lessonSummaryService";
import { apiClient } from "@/api/client";

vi.mock("@/api/client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("US-19: AI Lesson Summarization Service & Utilities Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getLessonSummary", () => {
    it("fetches and normalizes ready AI summary successfully", async () => {
      (apiClient.get as any).mockResolvedValueOnce({
        data: {
          summary: "This lesson covers the fundamentals of TypeScript and React hooks.",
          status: "ready",
          model_version: "gpt-4o-mini",
          lesson_id: 101,
          language: "en",
        },
      });

      const result = await lessonSummaryService.getLessonSummary(101, "en");

      expect(apiClient.get).toHaveBeenCalledWith("/lessons/101/summary", {
        params: { lang: "en" },
        headers: { "Accept-Language": "en" },
      });
      expect(result.status).toBe("ready");
      expect(result.summary).toContain("fundamentals of TypeScript");
      expect(result.content).toBe(result.summary);
    });

    it("handles alternative 'content' field in response and normalizes to summary", async () => {
      (apiClient.get as any).mockResolvedValueOnce({
        data: {
          content: "ملخص الدرس يشرح المفاهيم الأساسية والخطوات العملية.",
          lesson_id: 102,
          language: "ar",
        },
      });

      const result = await lessonSummaryService.getLessonSummary(102, "ar");

      expect(result.status).toBe("ready");
      expect(result.summary).toContain("ملخص الدرس يشرح");
      expect(result.content).toContain("ملخص الدرس يشرح");
    });

    it("handles 503 AI service busy or generation failure gracefully", async () => {
      (apiClient.get as any).mockRejectedValueOnce({
        response: {
          status: 503,
          data: {
            message: "AI summarization service is temporarily busy. Please retry in a moment.",
          },
        },
      });

      const result = await lessonSummaryService.getLessonSummary(103, "en");

      expect(result.status).toBe("failed");
      expect(result.message).toContain("temporarily busy");
    });

    it("handles 404 / unavailable when lesson has no readable text notes", async () => {
      (apiClient.get as any).mockRejectedValueOnce({
        response: {
          status: 404,
          data: {
            detail: "No notes or extractable materials are available for this lesson yet.",
          },
        },
      });

      const result = await lessonSummaryService.getLessonSummary(104, "en");

      expect(result.status).toBe("unavailable");
      expect(result.message).toContain("No notes or extractable materials");
    });

    it("handles 403 unauthorized access when student is not enrolled", async () => {
      (apiClient.get as any).mockRejectedValueOnce({
        response: {
          status: 403,
          data: {
            message: "You must be enrolled in this course to access AI lesson summaries.",
          },
        },
      });

      const result = await lessonSummaryService.getLessonSummary(105, "en");

      expect(result.status).toBe("failed");
      expect(result.message).toContain("enrolled in this course");
    });

    it("rethrows unhandled network or server errors", async () => {
      (apiClient.get as any).mockRejectedValueOnce(new Error("Network connection dropped"));

      await expect(lessonSummaryService.getLessonSummary(106, "en")).rejects.toThrow("Network connection dropped");
    });
  });

  describe("cleanExtractedText", () => {
    it("strips PDF binary dictionaries, streams, and garbage tokens", () => {
      const dirtyPdfRaw = `
        << /Type /Catalog /Pages 2 0 R >>
        obj 1 0
        stream
        xœ+T04\x00\x02\x04
        endstream
        endobj
        هذا النص يحتوي على شرح مفصل لبنية قواعد البيانات والعلاقات بين الجداول.
        xref
        trailer
        << /Size 10 >>
        startxref
        500
        %%EOF
        يتناول الدرس أيضاً كيفية تحسين أداء الاستعلامات المعقدة في التطبيق العملي.
      `;

      const segments = cleanExtractedText(dirtyPdfRaw);

      expect(segments.length).toBeGreaterThanOrEqual(2);
      expect(segments.some((s) => s.includes("شرح مفصل لبنية قواعد البيانات"))).toBe(true);
      expect(segments.some((s) => s.includes("تحسين أداء الاستعلامات"))).toBe(true);
      expect(segments.some((s) => s.includes("stream") || s.includes("endobj"))).toBe(false);
    });

    it("filters out short, symbol-only, or code-like noise", () => {
      const noisyText = `
        %PDF-1.7
        /F1 12 Tf
        >>> << >>
        a
        12345
        Valid meaningful sentence explaining core concepts of the module clearly.
      `;

      const segments = cleanExtractedText(noisyText);

      expect(segments.length).toBe(1);
      expect(segments[0]).toContain("Valid meaningful sentence explaining core concepts");
    });
  });

  describe("summarizeCustomContent", () => {
    it("returns error status when given empty text or whitespace", async () => {
      const resAr = await lessonSummaryService.summarizeCustomContent("   ", "ar");
      expect(resAr.status).toBe("failed");
      expect(resAr.message).toContain("المحتوى فارغ");

      const resEn = await lessonSummaryService.summarizeCustomContent("", "en");
      expect(resEn.status).toBe("failed");
      expect(resEn.message).toContain("Content is empty");
    });

    it("uses backend /ai/summarize endpoint when available and successful", async () => {
      (apiClient.post as any).mockResolvedValueOnce({
        data: {
          summary: "### 📌 Backend Generated AI Summary\n\n• Key Point 1\n• Key Point 2",
          status: "ready",
          model_version: "gemini-1.5-flash",
        },
      });

      const res = await lessonSummaryService.summarizeCustomContent(
        "Some detailed lesson lecture text.",
        "en",
        "React Architecture"
      );

      expect(apiClient.post).toHaveBeenCalledWith("/ai/summarize", {
        text: "Some detailed lesson lecture text.",
        language: "en",
        title: "React Architecture",
      });
      expect(res.status).toBe("ready");
      expect(res.summary).toContain("Backend Generated AI Summary");
    });

    it("falls back to smart client-side summary when backend endpoint fails (Arabic)", async () => {
      (apiClient.post as any).mockRejectedValueOnce(new Error("Endpoint not implemented"));

      const res = await lessonSummaryService.summarizeCustomContent(
        "شرح مفصل لمفاهيم البرمجة كائنية التوجه وأهميتها في بناء تطبيقات قابلة للتوسع. يركز الدرس على مبادئ الوراثة وتعدد الأشكال والتغليف.",
        "ar",
        "OOP-Concepts.pdf"
      );

      expect(res.status).toBe("ready");
      expect(res.title).toBe("OOP-Concepts");
      expect(res.summary).toContain("### 📌 ملخص المستند: OOP-Concepts");
      expect(res.summary).toContain("الهدف العام:");
      expect(res.summary).toContain("أهم النقاط والمفاهيم المستخلصة:");
      expect(res.summary).toContain("💡 الخلاصة والتطبيق العملي:");
      expect(res.model_version).toBe("gemini-1.5-flash");
    });

    it("falls back to smart client-side summary in English when backend endpoint fails", async () => {
      (apiClient.post as any).mockRejectedValueOnce(new Error("500 Server Error"));

      const res = await lessonSummaryService.summarizeCustomContent(
        "Understanding asynchronous JavaScript execution using Event Loop and Promises. Mastering async/await syntax and error handling patterns.",
        "en",
        "Async-JS.docx"
      );

      expect(res.status).toBe("ready");
      expect(res.title).toBe("Async-JS");
      expect(res.summary).toContain("### 📌 Summary: Async-JS");
      expect(res.summary).toContain("Overview & Core Purpose:");
      expect(res.summary).toContain("Key Takeaways & Highlights:");
      expect(res.summary).toContain("💡 Actionable Insight:");
    });
  });
});

