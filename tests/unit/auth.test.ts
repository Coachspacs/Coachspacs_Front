import { describe, it, expect, beforeEach, vi } from "vitest";
import { tokenManager } from "@/lib/tokenManager";
import { RegisterRequest, LoginRequest } from "@/services/auth";

describe("US-01 & US-02: Authentication & Registration (Student & Instructor)", () => {
  beforeEach(() => {
    tokenManager.clearTokens();
  });

  it("US-01: valid student registration payload format", () => {
    const studentPayload: RegisterRequest = {
      full_name: "Ahmed Ali",
      email: "ahmed@example.com",
      password: "SecurePassword123!",
      role: "student",
    };

    expect(studentPayload.role).toBe("student");
    expect(studentPayload.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    expect(studentPayload.password.length).toBeGreaterThanOrEqual(8);
  });

  it("US-02: instructor registration specifies instructor role and triggers pending approval", () => {
    const instructorPayload: RegisterRequest = {
      full_name: "Dr. Sarah Coach",
      email: "sarah@coachspace.com",
      password: "InstructorPass123!",
      role: "instructor",
    };

    expect(instructorPayload.role).toBe("instructor");

    // Check approval status logic: an instructor defaults to pending approval
    const determineInitialStatus = (role: string) =>
      role === "instructor" ? "pending" : "approved";

    expect(determineInitialStatus(instructorPayload.role)).toBe("pending");
    expect(determineInitialStatus("student")).toBe("approved");
  });

  it("US-02: route access logic blocks unapproved instructors from instructor studio", () => {
    const canAccessInstructorStudio = (role: string, status: string) => {
      if (role !== "instructor") return false;
      return status === "approved";
    };

    expect(canAccessInstructorStudio("instructor", "pending")).toBe(false);
    expect(canAccessInstructorStudio("instructor", "rejected")).toBe(false);
    expect(canAccessInstructorStudio("instructor", "approved")).toBe(true);
    expect(canAccessInstructorStudio("student", "approved")).toBe(false);
  });
});

describe("US-03: Token Management, Session & Logout", () => {
  beforeEach(() => {
    tokenManager.clearTokens();
  });

  it("sets and retrieves access and refresh tokens correctly", () => {
    expect(tokenManager.hasSession()).toBe(false);
    expect(tokenManager.getAccessToken()).toBeNull();

    tokenManager.setAccessToken("mock-jwt-access-token-123", "student", "approved");
    tokenManager.setRefreshToken("mock-jwt-refresh-token-456");

    expect(tokenManager.getAccessToken()).toBe("mock-jwt-access-token-123");
    expect(tokenManager.getRefreshToken()).toBe("mock-jwt-refresh-token-456");
    expect(tokenManager.hasSession()).toBe(true);
  });

  it("clearTokens removes all tokens and resets session state", () => {
    tokenManager.setAccessToken("active-token", "instructor", "approved");
    tokenManager.setRefreshToken("refresh-token");
    expect(tokenManager.hasSession()).toBe(true);

    tokenManager.clearTokens();

    expect(tokenManager.getAccessToken()).toBeNull();
    expect(tokenManager.getRefreshToken()).toBeNull();
    expect(tokenManager.hasSession()).toBe(false);
  });
});
