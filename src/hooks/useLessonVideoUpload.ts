"use client";

import { useState, useCallback, useRef } from "react";
import { instructorCourseService } from "@/services/instructorCourseService";
import {
  VideoUploadSignatureResponse,
  CloudinaryUploadResponse,
  CreateLessonRequest,
  UpdateLessonRequest,
} from "@/types/course";

export const MAX_VIDEO_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB
export const INVALID_VIDEO_ERROR_MSG = "Invalid video. Only MP4 files up to 500 MB are allowed.";

export type UploadStatus =
  | "idle"
  | "validating"
  | "signing"
  | "uploading"
  | "saving"
  | "success"
  | "error";

export interface UploadOptions {
  sectionId?: string | number;
  lessonId?: string | number;
  lessonData?: {
    title_ar?: string;
    title_en?: string;
    duration_minutes?: number;
    is_preview?: boolean;
  };
}

export interface UploadResult {
  public_id: string;
  video_url: string;
  secure_url?: string;
  lesson?: any;
  format?: string;
  bytes?: number;
  duration?: number;
}

/**
 * Validates a video file client-side before upload.
 * Reject non-.mp4 files and files > 500MB immediately.
 */
export function validateVideoFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: "No file selected." };
  }

  // Validate format (.mp4)
  const isMp4 =
    file.type === "video/mp4" ||
    file.name.toLowerCase().endsWith(".mp4");

  if (!isMp4) {
    return { valid: false, error: INVALID_VIDEO_ERROR_MSG };
  }

  // Validate size (max 500MB)
  if (file.size > MAX_VIDEO_SIZE_BYTES) {
    return { valid: false, error: INVALID_VIDEO_ERROR_MSG };
  }

  return { valid: true };
}

/**
 * Custom hook for the complete 3-step direct-to-Cloudinary lesson video upload flow.
 *
 * @param courseId - The active instructor course ID
 */
export function useLessonVideoUpload(courseId?: string | number) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [publicId, setPublicId] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Resets hook state to idle.
   */
  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsUploading(false);
    setProgress(0);
    setError(null);
    setVideoUrl(null);
    setPublicId(null);
    setUploadStatus("idle");
  }, []);

  /**
   * Cancels any in-flight upload.
   */
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsUploading(false);
    setUploadStatus("idle");
  }, []);

  /**
   * Executes the full 3-step upload pipeline:
   * 1. Fast-fail validation & signature request
   * 2. Direct-to-Cloudinary upload with determinate progress
   * 3. Lesson creation / update with 400 rollback
   */
  const upload = useCallback(
    async (file: File, options?: UploadOptions): Promise<UploadResult> => {
      // 0. Reset previous errors and abort any previous upload
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setError(null);
      setProgress(0);
      setIsUploading(true);
      setUploadStatus("validating");

      // 1. Client-side Fast-fail validation
      const validation = validateVideoFile(file);
      if (!validation.valid) {
        const errMsg = validation.error || INVALID_VIDEO_ERROR_MSG;
        setError(errMsg);
        setIsUploading(false);
        setUploadStatus("error");
        throw new Error(errMsg);
      }

      const activeCourseId = courseId;
      if (!activeCourseId) {
        const errMsg = "Course ID is required to start video upload.";
        setError(errMsg);
        setIsUploading(false);
        setUploadStatus("error");
        throw new Error(errMsg);
      }

      try {
        // Step 1: Request signature from backend
        setUploadStatus("signing");
        let signatureData: VideoUploadSignatureResponse;
        try {
          signatureData = await instructorCourseService.getVideoUploadSignature(activeCourseId);
        } catch (sigErr: any) {
          if (sigErr?.response?.status === 404) {
            const notFoundMsg = "Couldn't start the upload. Please verify you own this course.";
            setError(notFoundMsg);
            setUploadStatus("error");
            throw new Error(notFoundMsg);
          }
          const genericMsg =
            sigErr?.response?.data?.detail ||
            sigErr?.response?.data?.message ||
            "Could not get video upload signature.";
          setError(genericMsg);
          setUploadStatus("error");
          throw new Error(genericMsg);
        }

        // Step 2: Upload directly to Cloudinary
        setUploadStatus("uploading");
        let cloudinaryRes: CloudinaryUploadResponse;
        try {
          cloudinaryRes = await instructorCourseService.uploadVideoToCloudinary(
            file,
            signatureData,
            (percent) => setProgress(percent),
            abortControllerRef.current.signal
          );
        } catch (cloudErr: any) {
          if (axiosIsCancel(cloudErr)) {
            setUploadStatus("idle");
            throw new Error("Upload canceled by user.");
          }
          const cloudMsg =
            cloudErr?.response?.data?.error?.message ||
            cloudErr?.response?.data?.message ||
            cloudErr?.message ||
            "Cloudinary video upload failed.";
          setError(cloudMsg);
          setUploadStatus("error");
          throw new Error(cloudMsg);
        }

        const uploadedPublicId = cloudinaryRes.public_id;
        const uploadedUrl = cloudinaryRes.secure_url || cloudinaryRes.url;
        setPublicId(uploadedPublicId);

        // Step 3: Create or update lesson on backend (if sectionId or lessonId provided)
        let resolvedLesson: any = null;
        let finalVideoUrl: string = uploadedUrl || "";

        if (options?.sectionId || options?.lessonId) {
          setUploadStatus("saving");
          try {
            if (options.lessonId) {
              // Update existing lesson's video
              const payload: UpdateLessonRequest = {
                ...(options.lessonData?.title_ar ? { title_ar: options.lessonData.title_ar } : {}),
                ...(options.lessonData?.title_en ? { title_en: options.lessonData.title_en } : {}),
                ...(options.lessonData?.duration_minutes !== undefined
                  ? { duration_minutes: options.lessonData.duration_minutes }
                  : {}),
                ...(options.lessonData?.is_preview !== undefined
                  ? { is_preview: options.lessonData.is_preview }
                  : {}),
                video_public_id: uploadedPublicId,
              };
              resolvedLesson = await instructorCourseService.updateLesson(
                options.lessonId,
                payload
              );
            } else if (options.sectionId) {
              // Create new lesson
              const payload: CreateLessonRequest = {
                title_ar: options.lessonData?.title_ar || "درس جديد",
                title_en: options.lessonData?.title_en || "New Lesson",
                duration_minutes:
                  options.lessonData?.duration_minutes ||
                  (cloudinaryRes.duration ? Math.round(cloudinaryRes.duration / 60) : 5),
                is_preview: options.lessonData?.is_preview ?? false,
                video_public_id: uploadedPublicId,
              };
              resolvedLesson = await instructorCourseService.createLesson(
                options.sectionId,
                payload
              );
            }

            if (resolvedLesson?.video_url) {
              finalVideoUrl = resolvedLesson.video_url;
            }
          } catch (backErr: any) {
            // Revert state on 400 rejection
            setVideoUrl(null);
            setPublicId(null);
            setUploadStatus("error");

            const backendDetail =
              backErr?.response?.data?.detail ||
              backErr?.response?.data?.video_public_id?.[0] ||
              backErr?.response?.data?.message ||
              backErr?.response?.data?.non_field_errors?.[0] ||
              "Failed to save lesson video. Please try again.";

            setError(backendDetail);
            throw new Error(backendDetail);
          }
        }

        // Success
        setVideoUrl(finalVideoUrl || null);
        setProgress(100);
        setUploadStatus("success");

        return {
          public_id: uploadedPublicId,
          video_url: finalVideoUrl,
          secure_url: uploadedUrl,
          lesson: resolvedLesson,
          format: cloudinaryRes.format,
          bytes: cloudinaryRes.bytes,
          duration: cloudinaryRes.duration,
        };
      } catch (err: any) {
        setIsUploading(false);
        throw err;
      } finally {
        setIsUploading(false);
        abortControllerRef.current = null;
      }
    },
    [courseId]
  );

  return {
    upload,
    isUploading,
    progress,
    error,
    videoUrl,
    publicId,
    uploadStatus,
    reset,
    cancel,
    validateFile: validateVideoFile,
  };
}

function axiosIsCancel(value: any): boolean {
  return value && (value.__CANCEL__ || value.name === "CanceledError" || value.name === "AbortError");
}

export default useLessonVideoUpload;
