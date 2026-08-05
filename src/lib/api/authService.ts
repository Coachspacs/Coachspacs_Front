import type { RegisterFormData, LoginFormData, AuthResponse } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.example.com/v1";

export const authService = {
  async register(payload: RegisterFormData): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 800));

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

  async login(payload: LoginFormData): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 800));

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

  async requestPasswordReset(email: string): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
      success: true,
      message: "Password reset link sent to email successfully",
    };
  },

  async resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
      success: true,
      message: "Password has been reset successfully",
    };
  },
};
