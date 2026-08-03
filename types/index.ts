import type { InputHTMLAttributes, ReactNode } from "react";

export type RoleType = "student" | "coach";

export interface NavigationItem {
  label: string;
  href: string;
  labelAr?: string;
}

export interface FooterLinkGroup {
  title: string;
  titleAr?: string;
  links: {
    label: string;
    labelAr?: string;
    href: string;
  }[];
}

/**
 * Payload data for registering a new user account
 */
export interface RegisterFormData {
  role: RoleType;
  fullName: string;
  email: string;
  password: string;
  agreeToTerms: boolean;
}

/**
 * Payload data for logging in an existing user
 */
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

/**
 * User object returned from successful authentication API
 */
export interface User {
  id: string;
  fullName: string;
  email: string;
  role: RoleType;
  createdAt?: string;
}

/**
 * Response structure returned from backend authentication API endpoints
 */
export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

/**
 * Error response structure returned from backend API on failure (4xx / 5xx)
 */
export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string>;
}

export interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  id: string;
  label: string;
  error?: string;
  icon?: ReactNode;
  trailing?: ReactNode;
}
