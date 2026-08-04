import { api } from "./api";

// Roles allowed during public registration
export type SignupRole = "MENTEE" | "MENTOR";
// Roles returned by the backend
export type UserRole = SignupRole | "ADMIN";

// User returned from authentication endpoints
export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
}

// Request payloads to create | login into an account
export interface SignupCredentials {
  fullName: string;
  email: string;
  password: string;
  role: SignupRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Responses
export interface SignupResponse {
  message: string;
  verificationEmailSent: boolean;
  user: AuthUser;
}

export interface LoginResponse {
  // accessToken: string;
  user: AuthUser;
}

export interface VerificationResponse {
  message: string;
  user: AuthUser;
}

export interface ApiMessageResponse {
  message: string;
}

// API calls
export async function signup(
  credentials: SignupCredentials,
): Promise<SignupResponse> {
  const response = await api.post<SignupResponse>("/auth/signup", credentials);

  return response.data;
}

// Authenticate an existing user
export async function login(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/auth/login", credentials);

  return response.data;
}

// Verify an email using the token from the verification link.
export async function verifyEmail(
  token: string,
): Promise<VerificationResponse> {
  const response = await api.get<VerificationResponse>("/auth/verify-email", {
    params: { token },
  });

  return response.data;
}

// Request a replacement verification email.
export async function resendVerification(
  email: string,
): Promise<ApiMessageResponse> {
  const response = await api.post<ApiMessageResponse>(
    "/auth/resend-verification",
    { email },
  );
  return response.data;
}

// Clear the authentication cookie
export async function logout(): Promise<ApiMessageResponse> {
  const response = await api.post<ApiMessageResponse>("/auth/logout");

  return response.data;
}
