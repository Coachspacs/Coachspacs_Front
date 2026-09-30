import { apiClient } from "@/api/client";
import { LessonSummaryResponse } from "@/types/course";

/**
 * Service for US-19: AI Lesson Summarization
 * Connects to:
 * GET /api/lessons/{id}/summary?lang=en|ar
 *
 * Supports:
 * - Caching (per lesson & per language)
 * - 'ready', 'unavailable', and 'failed' states
 * - 403 access control for non-enrolled students
 */
export const lessonSummaryService = {
  /**
   * Request or retrieve cached AI summary for a specific lesson.
   *
   * @param lessonId ID of the lesson to summarize
   * @param lang Optional preferred language ('en' | 'ar')
   */
  async getLessonSummary(
    lessonId: string | number,
    lang?: "en" | "ar"
  ): Promise<LessonSummaryResponse> {
    try {
      const res = await apiClient.get<LessonSummaryResponse>(
        `/lessons/${lessonId}/summary`,
        {
          params: lang ? { lang } : undefined,
          headers: lang ? { "Accept-Language": lang } : undefined,
        }
      );

      const data = res.data;
      // Normalize summary content from either `summary` or `content`
      const normalizedSummary = data.summary || data.content || "";
      const status = data.status || (normalizedSummary ? "ready" : "unavailable");

      return {
        ...data,
        status,
        summary: normalizedSummary,
        content: normalizedSummary,
      };
    } catch (error: any) {
      const responseData = error?.response?.data;
      const statusCode = error?.response?.status;

      // Handle 503 (AI generation failure) or explicit status: "failed"
      if (statusCode === 503 || responseData?.status === "failed") {
        return {
          status: "failed",
          message:
            responseData?.message ||
            responseData?.detail ||
            "AI summarization service is temporarily busy. Please retry in a moment.",
          lesson_id: lessonId,
          language: lang,
        };
      }

      // Handle 'unavailable' (no notes or text attachments on lesson)
      if (statusCode === 404 || responseData?.status === "unavailable") {
        return {
          status: "unavailable",
          message:
            responseData?.message ||
            responseData?.detail ||
            "No notes or extractable materials are available for this lesson yet.",
          lesson_id: lessonId,
          language: lang,
        };
      }

      // Handle 403 (unauthorized/not enrolled)
      if (statusCode === 403) {
        return {
          status: "failed",
          message:
            responseData?.detail ||
            responseData?.message ||
            "You must be enrolled in this course to access AI lesson summaries.",
          lesson_id: lessonId,
          language: lang,
        };
      }

      throw error;
    }
  },
};
