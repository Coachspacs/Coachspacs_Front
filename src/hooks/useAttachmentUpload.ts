"use client";

import { useState, useCallback, useRef } from "react";
import axios from "axios";
import { courseAttachmentService } from "@/services/courseAttachmentService";
import {
  AttachmentUploadSignatureResponse,
  CloudinaryUploadResponse,
  AttachmentItem,
} from "@/types/course";

export const MAX_ATTACHMENT_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
  ".xls",
  ".xlsx",
  ".zip",
  ".rar",
  ".7z",
  ".txt",
  ".csv",
];

export type AttachmentUploadStatus =
  | "idle"
  | "validating"
  | "signing"
  | "uploading"
  | "saving"
  | "success"
  | "error";

export interface AttachmentUploadOptions {
  courseId: string | number;
  lessonId?: string | number;
  isCourseMaterial?: boolean;
  replaceAttachmentId?: string | number;
  customFileName?: string;
}

export function validateAttachmentFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: "No file selected." };
  }

  // Validate size (max 50MB)
  if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds the 50 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`,
    };
  }

  // Validate extension if available
  const fileName = file.name.toLowerCase();
  const hasAllowedExt = ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));
  if (!hasAllowedExt) {
    return {
      valid: false,
      error: "Unsupported file format. Please upload a PDF, Office document (Word, Excel, PowerPoint), or Archive (ZIP/RAR).",
    };
  }

  return { valid: true };
}

export function useAttachmentUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<AttachmentUploadStatus>("idle");
  const [uploadedAttachment, setUploadedAttachment] = useState<AttachmentItem | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsUploading(false);
    setProgress(0);
    setError(null);
    setUploadStatus("idle");
    setUploadedAttachment(null);
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsUploading(false);
    setUploadStatus("idle");
  }, []);

  const upload = useCallback(
    async (file: File, options: AttachmentUploadOptions): Promise<AttachmentItem> => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setError(null);
      setProgress(0);
      setIsUploading(true);
      setUploadStatus("validating");
      setUploadedAttachment(null);

      // 1. Validation
      const validation = validateAttachmentFile(file);
      if (!validation.valid) {
        const errMsg = validation.error || "Invalid file.";
        setError(errMsg);
        setIsUploading(false);
        setUploadStatus("error");
        throw new Error(errMsg);
      }

      if (!options.courseId) {
        const errMsg = "Course ID is required to request attachment upload signature.";
        setError(errMsg);
        setIsUploading(false);
        setUploadStatus("error");
        throw new Error(errMsg);
      }

      try {
        // Step 1: Request signature from backend
        setUploadStatus("signing");
        let signatureData: AttachmentUploadSignatureResponse;
        try {
          signatureData = await courseAttachmentService.getAttachmentUploadSignature(
            options.courseId
          );
        } catch (sigErr: any) {
          const msg =
            sigErr?.response?.data?.detail ||
            sigErr?.response?.data?.message ||
            "Could not get attachment upload signature.";
          setError(msg);
          setUploadStatus("error");
          throw new Error(msg);
        }

        // Step 2: Upload to Cloudinary (raw, authenticated)
        setUploadStatus("uploading");
        let cloudinaryRes: CloudinaryUploadResponse;
        try {
          cloudinaryRes = await courseAttachmentService.uploadAttachmentToCloudinary(
            file,
            signatureData,
            (percent) => setProgress(percent),
            abortControllerRef.current.signal
          );
        } catch (cloudErr: any) {
          if (axios.isCancel(cloudErr)) {
            setUploadStatus("idle");
            throw new Error("Upload canceled by user.");
          }
          const cloudMsg =
            cloudErr?.response?.data?.error?.message ||
            cloudErr?.response?.data?.message ||
            cloudErr?.message ||
            "Cloudinary attachment upload failed.";
          setError(cloudMsg);
          setUploadStatus("error");
          throw new Error(cloudMsg);
        }

        // Step 3: Register attachment with backend
        setUploadStatus("saving");
        const fileName = options.customFileName?.trim() || file.name;
        const publicId = cloudinaryRes.public_id;

        let attachmentResult: AttachmentItem;

        if (options.replaceAttachmentId) {
          // Replace existing attachment file
          attachmentResult = await courseAttachmentService.updateAttachment(
            options.replaceAttachmentId,
            {
              file_name: fileName,
              file_public_id: publicId,
            }
          );
        } else if (options.lessonId) {
          // Create lesson attachment
          attachmentResult = await courseAttachmentService.createLessonAttachment(
            options.lessonId,
            {
              file_name: fileName,
              file_public_id: publicId,
            }
          );
        } else {
          // Create course-level attachment (Course Materials)
          attachmentResult = await courseAttachmentService.createCourseAttachment(
            options.courseId,
            {
              file_name: fileName,
              file_public_id: publicId,
            }
          );
        }

        setUploadedAttachment(attachmentResult);
        setUploadStatus("success");
        setIsUploading(false);
        return attachmentResult;
      } catch (err: any) {
        setIsUploading(false);
        setUploadStatus("error");
        const finalMsg = err?.message || "Attachment upload flow failed.";
        setError(finalMsg);
        throw err;
      }
    },
    []
  );

  return {
    isUploading,
    progress,
    error,
    uploadStatus,
    uploadedAttachment,
    upload,
    reset,
    cancel,
  };
}
