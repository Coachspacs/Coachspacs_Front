import axios from "axios";
import { apiClient } from "@/api/client";
import {
  VideoUploadSignatureResponse,
  CloudinaryUploadResponse,
  CreateLessonRequest,
  UpdateLessonRequest,
  CreateSectionRequest,
  ReorderCurriculumRequest,
} from "@/types/course";

/**
 * Service handling Instructor Course operations, Curriculum management,
 * and Direct-to-Cloudinary Lesson Video Uploads.
 */
export const instructorCourseService = {
  /**
   * 1. Get video upload signature from backend for a specific course.
   * POST /api/instructor/courses/{courseId}/video-upload-signature
   */
  async getVideoUploadSignature(courseId: string | number): Promise<VideoUploadSignatureResponse> {
    const res = await apiClient.post<VideoUploadSignatureResponse>(
      `/instructor/courses/${courseId}/video-upload-signature`
    );
    return res.data;
  },

  /**
   * 2. Direct-to-Cloudinary upload:
   */
  async uploadVideoToCloudinary(
    file: File,
    signatureData: VideoUploadSignatureResponse,
    onProgress?: (percent: number) => void,
    signal?: AbortSignal
  ): Promise<CloudinaryUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signatureData.api_key);
    formData.append("timestamp", String(signatureData.timestamp));
    formData.append("folder", signatureData.folder);
    formData.append("signature", signatureData.signature);

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${signatureData.cloud_name}/video/upload`;

    // Pure axios call without backend auth headers
    const res = await axios.post<CloudinaryUploadResponse>(cloudinaryUrl, formData, {
      signal,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && progressEvent.total > 0) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress?.(Math.min(100, Math.max(0, percent)));
        }
      },
    });

    return res.data;
  },

  /**
   * 3a. Create new lesson in a section.
   * POST /api/instructor/sections/{sectionId}/lessons
   */
  async createLesson(sectionId: string | number, payload: CreateLessonRequest): Promise<any> {
    const res = await apiClient.post(`/instructor/sections/${sectionId}/lessons`, payload);
    return res.data;
  },

  /**
   * 3b. Update an existing lesson.
   * PATCH /api/instructor/lessons/{lessonId}
   */
  async updateLesson(lessonId: string | number, payload: UpdateLessonRequest): Promise<any> {
    const res = await apiClient.patch(`/instructor/lessons/${lessonId}`, payload);
    return res.data;
  },

  /**
   * 3c. Delete a lesson.
   * DELETE /api/instructor/lessons/{lessonId}
   */
  async deleteLesson(lessonId: string | number): Promise<void> {
    await apiClient.delete(`/instructor/lessons/${lessonId}`);
  },

  /**
   * 4. Upload course cover image (proxied through backend).
   * POST /api/instructor/courses/{courseId}/cover-image
   */
  async uploadCourseCoverImage(
    courseId: string | number,
    file: File
  ): Promise<{ cover_image: string }> {
    const formData = new FormData();
    formData.append("cover_image", file);

    const res = await apiClient.post<{ cover_image: string }>(
      `/instructor/courses/${courseId}/cover-image`,
      formData
    );
    return res.data;
  },

  /**
   * 5. Add section to course.
   * POST /api/instructor/courses/{courseId}/sections
   */
  async createSection(courseId: string | number, payload: CreateSectionRequest): Promise<any> {
    const res = await apiClient.post(`/instructor/courses/${courseId}/sections`, payload);
    return res.data;
  },

  /**
   * 6. Delete a section.
   * DELETE /api/instructor/sections/{sectionId}
   */
  async deleteSection(sectionId: string | number): Promise<void> {
    await apiClient.delete(`/instructor/sections/${sectionId}`);
  },

  /**
   * 7. Reorder sections and/or lessons.
   * PUT /api/instructor/courses/{courseId}/reorder
   */
  async reorderCurriculum(
    courseId: string | number,
    payload: ReorderCurriculumRequest
  ): Promise<any> {
    const res = await apiClient.put(`/instructor/courses/${courseId}/reorder`, payload);
    return res.data;
  },

  /**
   * 8. List all courses owned by current instructor.
   * GET /api/instructor/courses
   */
  async getMyCourses(): Promise<any> {
    const res = await apiClient.get("/instructor/courses");
    return res.data;
  },

  /**
   * 9. Get specific course details with full curriculum.
   * GET /api/instructor/courses/{courseId}
   */
  async getInstructorCourse(courseId: string | number): Promise<any> {
    const res = await apiClient.get(`/instructor/courses/${courseId}`);
    return res.data;
  },

  /**
   * 10. Create new course draft.
   * POST /api/instructor/courses
   */
  async createCourse(payload: any): Promise<any> {
    const res = await apiClient.post("/instructor/courses", payload);
    return res.data;
  },

  /**
   * 11. Update course draft / published details.
   * PATCH /api/instructor/courses/{courseId}
   */
  async updateCourse(courseId: string | number, payload: any): Promise<any> {
    const res = await apiClient.patch(`/instructor/courses/${courseId}`, payload);
    return res.data;
  },

  /**
   * 12. Delete or archive course.
   * DELETE /api/instructor/courses/{courseId}
   * Returns { status, data, archived }
   * - 204 No Content: Permanently deleted (no enrollments).
   * - 200 OK: Automatically archived (has enrollments).
   */
  async deleteCourse(courseId: string | number): Promise<{ status: number; data?: any; archived: boolean }> {
    const res = await apiClient.delete(`/instructor/courses/${courseId}`);
    const isArchived = res.status === 200 && (res.data?.archived === true || res.data?.course?.status === "archived");
    return {
      status: res.status,
      data: res.data,
      archived: isArchived,
    };
  },

  /**
   * 13. Submit course for admin review.
   * POST /api/instructor/courses/{courseId}/submit or PATCH with status: "pending_review"
   */
  async submitForReview(courseId: string | number): Promise<any> {
    try {
      const res = await apiClient.post(`/instructor/courses/${courseId}/submit/`, {
        status: "pending_review",
      });
      return res.data;
    } catch {
      const res = await apiClient.patch(`/instructor/courses/${courseId}`, {
        status: "pending_review",
      });
      return res.data;
    }
  },
};

export default instructorCourseService;
