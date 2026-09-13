import axios from "axios";
import axiosInstance, { getCurrentLocale } from "@/lib/axios";
import {
  CertificateItem,
  CertificateListResponse,
  CertificateDownloadResponse,
  CertificateVerifyResponse,
} from "@/types/certificate";

const rawBaseURL = process.env.NEXT_PUBLIC_API_URL || "/api";
const baseURL = rawBaseURL.replace(/\/+$/, "");

export const certificateService = {
  /**
   * List earned certificates for the authenticated student
   * GET /api/certificates
   */
  async getMyCertificates(): Promise<CertificateItem[]> {
    const response = await axiosInstance.get<
      CertificateListResponse | CertificateItem[]
    >("/certificates");
    const data = response.data;
    if (Array.isArray(data)) {
      return data;
    }
    if (data && Array.isArray((data as CertificateListResponse).results)) {
      return (data as CertificateListResponse).results;
    }
    return [];
  },

  /**
   * Download certificate PDF with asynchronous retry polling
   * GET /api/certificates/{id}/download
   *
   * Handles 202 Accepted (pending generation) with automated polling (every 3s, max 5 attempts)
   * Handles 200/302 with PDF URL or file stream to trigger download.
   */
  async downloadCertificate(
    id: number | string,
    onStatusUpdate?: (status: "pending" | "ready", detail?: string) => void
  ): Promise<CertificateDownloadResponse> {
    const maxAttempts = 5;
    const intervalMs = 3000;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await axiosInstance.get(`/certificates/${id}/download`, {
          validateStatus: (status) =>
            (status >= 200 && status < 300) || status === 302,
        });

        // 202 Accepted or explicit pending status
        if (
          response.status === 202 ||
          response.data?.status === "pending"
        ) {
          const detail =
            response.data?.detail ||
            "Certificate PDF generation is in progress. Retrying...";
          onStatusUpdate?.("pending", detail);

          if (attempt < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, intervalMs));
            continue;
          } else {
            return {
              status: "pending",
              detail:
                "Certificate preparation is taking longer than expected. Please check back in a few moments.",
            };
          }
        }

        // Ready response (200 OK or 302 Found)
        const downloadUrl =
          response.data?.download_url ||
          response.data?.pdf_url ||
          (typeof response.data === "string" && response.data.startsWith("http")
            ? response.data
            : null);

        if (downloadUrl) {
          onStatusUpdate?.("ready");
          triggerBrowserDownload(downloadUrl, `certificate-${id}.pdf`);
          return { status: "ready", download_url: downloadUrl };
        }

        // Direct binary blob or octet-stream
        if (response.data) {
          onStatusUpdate?.("ready");
          return { status: "ready" };
        }
      } catch (err: any) {
        // If 202 is treated as an error by custom interceptors
        if (err?.response?.status === 202) {
          const detail =
            err.response?.data?.detail || "Certificate generation is queued...";
          onStatusUpdate?.("pending", detail);
          if (attempt < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, intervalMs));
            continue;
          }
          return { status: "pending", detail };
        }
        throw err;
      }
    }

    return {
      status: "pending",
      detail: "Generation timed out. Please try again shortly.",
    };
  },

  /**
   * Public certificate verification (US-16 / US-18)
   * GET /api/certificates/verify/{code}
   *
   * Note: Unauthenticated public request without Bearer token.
   */
  async verifyCertificate(code: string): Promise<CertificateVerifyResponse> {
    const cleanCode = encodeURIComponent(code.trim());
    const locale = getCurrentLocale();

    try {
      // Pure axios call without auth interceptor
      const response = await axios.get<CertificateVerifyResponse>(
        `${baseURL}/certificates/verify/${cleanCode}`,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": locale,
          },
        }
      );
      return response.data;
    } catch (err: any) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail || err?.response?.data?.code;

      if (status === 400) {
        const invalidError: any = new Error(
          detail || "This doesn't look like a valid certificate code."
        );
        invalidError.status = 400;
        invalidError.isInvalidFormat = true;
        throw invalidError;
      }

      if (status === 404) {
        const notFoundError: any = new Error(
          detail ||
            "Certificate not found. Please verify the certificate code and try again."
        );
        notFoundError.status = 404;
        notFoundError.isNotFound = true;
        throw notFoundError;
      }

      if (status === 429) {
        const rateLimitError: any = new Error(
          detail ||
            "Rate limit exceeded (maximum 20 verification requests per hour). Please try again later."
        );
        rateLimitError.status = 429;
        rateLimitError.isRateLimited = true;
        throw rateLimitError;
      }

      throw err;
    }
  },
};

function triggerBrowserDownload(url: string, filename: string) {
  if (typeof window === "undefined") return;
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default certificateService;
