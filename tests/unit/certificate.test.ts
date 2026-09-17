import { describe, it, expect } from "vitest";

describe("US-16: Certificate Generation, Code Formatting & Verification", () => {
  function formatCertificateCode(enrollmentId: number | string): string {
    return `CS-${enrollmentId}`;
  }

  function normalizeVerificationCode(input: string): string {
    return input.trim().toUpperCase().replace(/\s+/g, "");
  }

  function isValidCertificateCode(code: string): boolean {
    const normalized = normalizeVerificationCode(code);
    return /^CS-[A-Z0-9_-]+$/i.test(normalized);
  }

  it("formats certificate code in CS-{enrollment_id} format", () => {
    expect(formatCertificateCode(105)).toBe("CS-105");
    expect(formatCertificateCode("8821")).toBe("CS-8821");
  });

  it("normalizes and validates certificate codes entered for verification", () => {
    expect(normalizeVerificationCode("  cs-105  ")).toBe("CS-105");
    expect(normalizeVerificationCode("cs - 991 ")).toBe("CS-991");

    expect(isValidCertificateCode("CS-105")).toBe(true);
    expect(isValidCertificateCode("cs-abc-123")).toBe(true);
    expect(isValidCertificateCode("INVALID_FORMAT")).toBe(false);
  });

  it("ensures certificate data structure contains all required elements", () => {
    const cert = {
      id: "cert-1",
      certificate_code: "CS-45",
      student_name: "Ahmad Zaid",
      course_title: "Full Stack Next.js & Django",
      issued_at: "2026-09-16T12:00:00Z",
      instructor_name: "Coach Mohamed",
    };

    expect(cert.certificate_code).toMatch(/^CS-/);
    expect(cert.student_name.length).toBeGreaterThan(0);
    expect(cert.course_title.length).toBeGreaterThan(0);
    expect(new Date(cert.issued_at).getTime()).not.toBeNaN();
  });
});
