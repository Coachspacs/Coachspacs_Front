import type { RegisterFormData, LoginFormData, AuthResponse } from "@/types";

/**
 * Base API URL configured via environment variables.
 * Backend developer: set NEXT_PUBLIC_API_BASE_URL in your .env.local file
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.example.com/v1";

/**
 * AuthService provides clean methods for backend API integration.
 * The backend developer can easily update endpoint paths or fetch/axios calls here.
 */
export const authService = {
  /**
   * Register a new user (Student or Instructor)
   *
   * @param payload RegisterFormData
   * @returns Promise<AuthResponse>
   */
  async register(payload: RegisterFormData): Promise<AuthResponse> {
    // ------------------------------------------------------------------------
    // BACKEND INTEGRATION TODO:
    // Replace mock simulation below with your actual API endpoint:
    //
    // const response = await fetch(`${API_BASE_URL}/auth/register`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(payload),
    // });
    // if (!response.ok) {
    //   const errorData = await response.json();
    //   throw new Error(errorData.message || "Registration failed");
    // }
    // return await response.json();
    // ------------------------------------------------------------------------

    // Mock API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Simulated successful response
    return {
      success: true,
      token: "mock-jwt-token-register",
      user: {
        id: "usr_" + Math.random().toString(36).substring(2, 9),
        fullName: payload.fullName,
        email: payload.email,
        role: payload.role,
      },
      message: "User registered successfully",
    };
  },

  /**
   * Log in an existing user
   *
   * @param payload LoginFormData
   * @returns Promise<AuthResponse>
   */
  async login(payload: LoginFormData): Promise<AuthResponse> {
    // ------------------------------------------------------------------------
    // BACKEND INTEGRATION TODO:
    // Replace mock simulation below with your actual API endpoint:
    //
    // const response = await fetch(`${API_BASE_URL}/auth/login`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ email: payload.email, password: payload.password }),
    // });
    // if (!response.ok) {
    //   const errorData = await response.json();
    //   throw new Error(errorData.message || "Invalid credentials");
    // }
    // return await response.json();
    // ------------------------------------------------------------------------

    // Mock API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Simulated successful response
    return {
      success: true,
      token: "mock-jwt-token-login",
      user: {
        id: "usr_login_123",
        fullName: "Demo User",
        email: payload.email,
        role: "student",
      },
      message: "Login successful",
    };
  },

  /**
   * Request password reset link via email
   *
   * @param email User's email address
   * @returns Promise<AuthResponse>
   */
  async requestPasswordReset(email: string): Promise<AuthResponse> {
    // ------------------------------------------------------------------------
    // BACKEND INTEGRATION TODO:
    // Replace mock simulation below with your actual API endpoint:
    //
    // const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ email }),
    // });
    // if (!response.ok) {
    //   const errorData = await response.json();
    //   throw new Error(errorData.message || "Failed to send reset link");
    // }
    // return await response.json();
    // ------------------------------------------------------------------------

    // Mock API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
      success: true,
      message: "Password reset link sent to email successfully",
    };
  },

  /**
   * Complete password reset using reset token from email link
   *
   * @param token Reset token received in email URL query string
   * @param newPassword New password
   * @returns Promise<AuthResponse>
   */
  async resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
    // ------------------------------------------------------------------------
    // BACKEND INTEGRATION TODO:
    // Replace mock simulation below with your actual API endpoint:
    //
    // const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ token, newPassword }),
    // });
    // if (!response.ok) {
    //   const errorData = await response.json();
    //   throw new Error(errorData.message || "Failed to reset password");
    // }
    // return await response.json();
    // ------------------------------------------------------------------------

    // Mock API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
      success: true,
      message: "Password has been reset successfully",
    };
  },
};
