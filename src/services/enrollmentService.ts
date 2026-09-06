import axiosInstance from "@/lib/axios";

export interface LessonCompletionResponse {
  lesson_id: number | string;
  is_completed: boolean;
  progress_percent: number;
  course_completed: boolean;
  certificate: {
    id?: number | string;
    certificate_code?: string;
    issued_at?: string;
    [key: string]: any;
  } | null;
}

export interface EnrollmentItem {
  id: number | string;
  course: any;
  course_id?: number | string;
  progress_percent: number;
  is_completed?: boolean;
  completed_lessons?: Array<number | string>;
  completed_at?: string | null;
  enrolled_at?: string;
  certificate?: any | null;
  [key: string]: any;
}

export const enrollmentService = {
  /**
   * List all enrollments for the authenticated student
   * GET /api/enrollments
   */
  async getMyEnrollments(): Promise<EnrollmentItem[]> {
    const response = await axiosInstance.get<EnrollmentItem[] | { results: EnrollmentItem[] }>("/enrollments");
    const data = response.data;
    if (Array.isArray(data)) {
      return data;
    }
    if (data && Array.isArray((data as any).results)) {
      return (data as any).results;
    }
    return [];
  },

  /**
   * Get single enrollment details by ID
   * GET /api/enrollments/:id
   */
  async getEnrollmentById(enrollmentId: number | string): Promise<EnrollmentItem> {
    const response = await axiosInstance.get<EnrollmentItem>(`/enrollments/${enrollmentId}`);
    return response.data;
  },

  /**
   * Mark a lesson complete (Sprint 8 Delta US-13)
   * POST /api/enrollments/:enrollmentId/lessons/:lessonId/complete
   *
   * Creates/updates LessonProgress, sets is_completed=true, recalculates enrollment progress_percent.
   * If reaching 100% for the first time, returns certificate record.
   */
  async markLessonComplete(
    enrollmentId: number | string,
    lessonId: number | string
  ): Promise<LessonCompletionResponse> {
    const response = await axiosInstance.post<LessonCompletionResponse>(
      `/enrollments/${enrollmentId}/lessons/${lessonId}/complete`
    );
    return response.data;
  },

  /**
   * Mark a lesson incomplete (Sprint 8 Delta US-13)
   * DELETE /api/enrollments/:enrollmentId/lessons/:lessonId/complete
   *
   * Sets is_completed=false, clears completed_at, and recalculates progress_percent downward.
   */
  async markLessonIncomplete(
    enrollmentId: number | string,
    lessonId: number | string
  ): Promise<LessonCompletionResponse> {
    const response = await axiosInstance.delete<LessonCompletionResponse>(
      `/enrollments/${enrollmentId}/lessons/${lessonId}/complete`
    );
    return response.data;
  },
};

export default enrollmentService;
