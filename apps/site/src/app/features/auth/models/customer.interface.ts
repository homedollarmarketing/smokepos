export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phoneNumber: string;
  address?: string | null;
  photoUrl?: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse extends AuthTokens {
  customer: Customer;
}

export interface SignupRequest {
  name: string;
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyEmailRequest {
  verificationToken: string;
  otp: string;
}

export interface VerifyLoginRequest {
  verificationToken: string;
  otp: string;
}

export interface InitiateLoginResponse {
  verificationToken: string;
  message: string;
}

export interface SignupResponse {
  message: string;
  email: string;
  verificationToken: string;
}

export interface MessageResponse {
  message: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phoneNumber?: string;
  address?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
