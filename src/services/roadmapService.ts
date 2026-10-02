import { apiClient } from "@/api/client";
import {
  RoadmapApiResponse,
  GenerateRoadmapPayload,
  RegenerateRoadmapPayload,
  BackendRoadmapPath,
} from "@/types/mypath";

/**
 * Service for US-18: AI Learning Roadmap
 * Communicates with backend endpoints:
 * - GET   /api/ai/roadmap
 * - POST  /api/ai/roadmap/generate
 * - POST  /api/ai/roadmap/regenerate
 * - PATCH /api/ai/roadmap/steps/:stepId
 */
export const roadmapService = {
  /**
   * 1. Get the current active roadmap for the authenticated student.
   * Responds with { path: null } if no roadmap was generated yet.
   * Switching Accept-Language between ar/en returns localized course titles & AI reasons.
   */
  async getMyRoadmap(locale?: string): Promise<RoadmapApiResponse> {
    try {
      const res = await apiClient.get<RoadmapApiResponse>("/ai/roadmap", {
        headers: locale ? { "Accept-Language": locale } : undefined,
      });
      return res.data;
    } catch (err: any) {
      if (err?.response?.status === 404) {
        return { path: null, status: "unavailable" };
      }
      throw err;
    }
  },

  /**
   * 2. Generate a new roadmap for the student.
   * Returns 201 + { status: 'ready', path } on success.
   * Returns 200 + { status: 'unavailable' } if no published course fits.
   * If 409 Conflict occurs (active path already exists), falls back to regenerate.
   */
  async generateRoadmap(
    payload: GenerateRoadmapPayload,
    locale?: string
  ): Promise<RoadmapApiResponse> {
    const headers = locale ? { "Accept-Language": locale } : undefined;

    try {
      const res = await apiClient.post<RoadmapApiResponse>(
        "/ai/roadmap/generate",
        payload,
        { headers }
      );
      return res.data;
    } catch (err: any) {
      // 409 Conflict: Student already has an active path -> automatically regenerate
      if (err?.response?.status === 409) {
        return this.regenerateRoadmap(
          {
            category: payload.category,
            goal_text: payload.goal_text,
            current_level: payload.current_level,
            weekly_hours: payload.weekly_hours,
          },
          locale
        );
      }
      throw err;
    }
  },

  /**
   * 3. Regenerate roadmap (e.g. changed goal or pace) -- archives old path as history.
   * Send only what changed; omitted fields are carried over by backend.
   */
  async regenerateRoadmap(
    payload: RegenerateRoadmapPayload,
    locale?: string
  ): Promise<RoadmapApiResponse> {
    const headers = locale ? { "Accept-Language": locale } : undefined;
    const res = await apiClient.post<RoadmapApiResponse>(
      "/ai/roadmap/regenerate",
      payload,
      { headers }
    );
    return res.data;
  },

  /**
   * 4. Skip or Un-skip a step in the roadmap.
   * - status = 'skipped': Re-plans remaining pending steps around it.
   * - status = 'pending': Un-skips a previously skipped step.
   */
  async updateStepStatus(
    stepId: string | number,
    status: "skipped" | "pending",
    locale?: string
  ): Promise<any> {
    const headers = locale ? { "Accept-Language": locale } : undefined;
    const res = await apiClient.patch(
      `/ai/roadmap/steps/${stepId}`,
      { status },
      { headers }
    );
    return res.data;
  },

  /**
   * 5. Reorder a step to a new 1-based position in the whole path.
   * Step cannot be moved above an already completed step.
   */
  async reorderStep(
    stepId: string | number,
    order: number,
    locale?: string
  ): Promise<any> {
    const headers = locale ? { "Accept-Language": locale } : undefined;
    const res = await apiClient.patch(
      `/ai/roadmap/steps/${stepId}`,
      { order },
      { headers }
    );
    return res.data;
  },
};

export default roadmapService;
