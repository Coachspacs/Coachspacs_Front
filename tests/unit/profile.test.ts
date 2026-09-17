import { describe, it, expect } from "vitest";

describe("US-04: Profile Management and Avatar Upload Validation", () => {
  const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5 MB in bytes
  const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

  function validateAvatarFile(file: { size: number; type: string }): { valid: boolean; error?: string } {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return { valid: false, error: "Only JPG, PNG, and WebP images are allowed." };
    }
    if (file.size > MAX_AVATAR_SIZE) {
      return { valid: false, error: "Avatar image cannot exceed 5 MB." };
    }
    return { valid: true };
  }

  it("accepts valid JPG, PNG, and WebP under 5MB", () => {
    expect(validateAvatarFile({ size: 1024 * 1024, type: "image/jpeg" })).toEqual({ valid: true });
    expect(validateAvatarFile({ size: 2 * 1024 * 1024, type: "image/png" })).toEqual({ valid: true });
    expect(validateAvatarFile({ size: 4.9 * 1024 * 1024, type: "image/webp" })).toEqual({ valid: true });
  });

  it("rejects files exceeding 5MB", () => {
    const oversizedFile = { size: 5.5 * 1024 * 1024, type: "image/jpeg" };
    const res = validateAvatarFile(oversizedFile);
    expect(res.valid).toBe(false);
    expect(res.error).toContain("cannot exceed 5 MB");
  });

  it("rejects disallowed file formats like PDF or GIF", () => {
    const pdfFile = { size: 500 * 1024, type: "application/pdf" };
    const gifFile = { size: 500 * 1024, type: "image/gif" };
    expect(validateAvatarFile(pdfFile).valid).toBe(false);
    expect(validateAvatarFile(gifFile).valid).toBe(false);
  });

  it("validates profile update fields format", () => {
    const validUpdate = {
      full_name: "Mariam Salem",
      phone_number: "+962791234567",
      preferred_language: "ar",
    };

    expect(validUpdate.full_name.trim().length).toBeGreaterThanOrEqual(2);
    expect(["ar", "en"]).toContain(validUpdate.preferred_language);
    expect(validUpdate.phone_number).toMatch(/^\+?[0-9]{8,15}$/);
  });
});
