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
   * Check if the authenticated student is already enrolled in a specific course
   */
  async checkIfEnrolled(courseId: number | string): Promise<boolean> {
    try {
      const enrollments = await this.getMyEnrollments();
      return enrollments.some(
        (e) => String(e.course?.id || e.course_id || e.id) === String(courseId)
      );
    } catch {
      return false;
    }
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
   * Get single lesson player data (US-12)
   * GET /api/enrollments/:enrollmentId/lessons/:lessonId
   */
  async getLesson(
    enrollmentId: number | string,
    lessonId: number | string
  ): Promise<any> {
    const numEnr = Number(enrollmentId);
    const numLes = Number(lessonId);
    if (!numEnr || isNaN(numEnr) || !numLes || isNaN(numLes)) {
      return null;
    }
    const response = await axiosInstance.get(
      `/enrollments/${numEnr}/lessons/${numLes}`
    );
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
    const numEnr = Number(enrollmentId);
    const numLes = Number(lessonId);
    if (!numEnr || isNaN(numEnr) || !numLes || isNaN(numLes)) {
      return {
        lesson_id: lessonId,
        is_completed: true,
        progress_percent: 100,
        course_completed: false,
        certificate: null,
      };
    }
    const response = await axiosInstance.post<LessonCompletionResponse>(
      `/enrollments/${numEnr}/lessons/${numLes}/complete`
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
    const numEnr = Number(enrollmentId);
    const numLes = Number(lessonId);
    if (!numEnr || isNaN(numEnr) || !numLes || isNaN(numLes)) {
      return {
        lesson_id: lessonId,
        is_completed: false,
        progress_percent: 0,
        course_completed: false,
        certificate: null,
      };
    }
    const response = await axiosInstance.delete<LessonCompletionResponse>(
      `/enrollments/${numEnr}/lessons/${numLes}/complete`
    );
    return response.data;
  },

  /**
   * Enroll in a free course directly (US-15 scenario 2)
   * POST /api/enrollments/free
   * Body: { "course_id": <id> }
   */
  async enrollFree(courseId: number | string): Promise<any> {
    const numericId = Number(courseId);
    if (!numericId || isNaN(numericId)) {
      return { success: true, isMock: true };
    }
    try {
      const response = await axiosInstance.post("/enrollments/free", {
        course_id: numericId,
      });
      return response.data;
    } catch (err: any) {
      const detail = String(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        ""
      ).toLowerCase();

      if (
        err?.response?.data?.already_enrolled ||
        detail.includes("already enrolled") ||
        detail.includes("already_enrolled")
      ) {
        return { already_enrolled: true, ...err.response?.data };
      }
      if (detail.includes("not free") || detail.includes("isn't free")) {
        return { not_free: true, ...err.response?.data };
      }
      throw err;
    }
  },
};

export default enrollmentService;
