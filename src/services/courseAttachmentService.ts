import axios from "axios";
import { apiClient } from "@/api/client";
import {
  AttachmentUploadSignatureResponse,
  CloudinaryUploadResponse,
  AttachmentItem,
  CreateAttachmentRequest,
  UpdateAttachmentRequest,
} from "@/types/course";

/**
 * Service for Course and Lesson Attachments (Sprint 11 / US-21)
 * Handles:
 * - Scoped Cloudinary raw-upload signatures
 * - Direct-to-Cloudinary raw file uploads
 * - Course-level attachments (Course Materials)
 * - Lesson-level attachments
 * - Attachment file replacement / renaming (PATCH)
 * - Attachment deletion (DELETE)
 * - Student/Catalog authenticated attachment downloads
 */
export const courseAttachmentService = {
  /**
   * 1. Get attachment upload signature from backend for a specific course.
   * POST /api/instructor/courses/{courseId}/attachment-upload-signature
   */
  async getAttachmentUploadSignature(
    courseId: string | number
  ): Promise<AttachmentUploadSignatureResponse> {
    const res = await apiClient.post<AttachmentUploadSignatureResponse>(
      `/instructor/courses/${courseId}/attachment-upload-signature`
    );
    return res.data;
  },

  /**
   * 2. Direct-to-Cloudinary authenticated raw upload.
   * POST https://api.cloudinary.com/v1_1/{cloud_name}/raw/upload
   */
  async uploadAttachmentToCloudinary(
    file: File,
    signatureData: AttachmentUploadSignatureResponse,
    onProgress?: (percent: number) => void,
    signal?: AbortSignal
  ): Promise<CloudinaryUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signatureData.api_key);
    formData.append("timestamp", String(signatureData.timestamp));
    formData.append("signature", signatureData.signature);
    formData.append("folder", signatureData.folder);
    if (signatureData.type) {
      formData.append("type", signatureData.type);
    }

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${signatureData.cloud_name}/raw/upload`;

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
   * 3a. Create COURSE-level attachment (Course Materials)
   * POST /api/instructor/courses/{courseId}/attachments
   */
  async createCourseAttachment(
    courseId: string | number,
    payload: CreateAttachmentRequest
  ): Promise<AttachmentItem> {
    const res = await apiClient.post<AttachmentItem>(
      `/instructor/courses/${courseId}/attachments`,
      payload
    );
    return res.data;
  },

  /**
   * 3b. Create LESSON-level attachment
   * POST /api/instructor/lessons/{lessonId}/attachments
   */
  async createLessonAttachment(
    lessonId: string | number,
    payload: CreateAttachmentRequest
  ): Promise<AttachmentItem> {
    const res = await apiClient.post<AttachmentItem>(
      `/instructor/lessons/${lessonId}/attachments`,
      payload
    );
    return res.data;
  },

  /**
   * 4a. List course-level attachments (Course Materials)
   * GET /api/instructor/courses/{courseId}/attachments
   */
  async listCourseAttachments(
    courseId: string | number
  ): Promise<AttachmentItem[]> {
    const res = await apiClient.get<AttachmentItem[]>(
      `/instructor/courses/${courseId}/attachments`
    );
    return Array.isArray(res.data) ? res.data : [];
  },

  /**
   * 4b. List a lesson's attachments
   * GET /api/instructor/lessons/{lessonId}/attachments
   */
  async listLessonAttachments(
    lessonId: string | number
  ): Promise<AttachmentItem[]> {
    const res = await apiClient.get<AttachmentItem[]>(
      `/instructor/lessons/${lessonId}/attachments`
    );
    return Array.isArray(res.data) ? res.data : [];
  },

  /**
   * 5. Replace an attachment's file or rename it
   * PATCH /api/instructor/attachments/{attachmentId}
   */
  async updateAttachment(
    attachmentId: string | number,
    payload: UpdateAttachmentRequest
  ): Promise<AttachmentItem> {
    const res = await apiClient.patch<AttachmentItem>(
      `/instructor/attachments/${attachmentId}`,
      payload
    );
    return res.data;
  },

  /**
   * 6. Delete an attachment
   * DELETE /api/instructor/attachments/{attachmentId}
   */
  async deleteAttachment(attachmentId: string | number): Promise<void> {
    await apiClient.delete(`/instructor/attachments/${attachmentId}`);
  },

  /**
   * 7. Download an attachment
   * GET /api/catalog/attachments/{attachmentId}/download
   * Authenticated request that triggers file download in browser
   */
  async downloadAttachment(
    attachmentId: string | number,
    suggestedFileName?: string
  ): Promise<void> {
    const res = await apiClient.get(`/catalog/attachments/${attachmentId}/download`, {
      responseType: "blob",
    });

    const blob = new Blob([res.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", suggestedFileName || "attachment");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  },
};

export default courseAttachmentService;
