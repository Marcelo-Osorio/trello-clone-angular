import type { User } from './user.model';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export type RegisterResponse = User;

export interface EmailExistsDto {
  email: string;
}

export interface EmailExistsResponse {
  isAvailable: boolean;
}

export interface RecoveryDto {
  email: string;
}

export interface RecoveryResponse {
  link: string;
  recoveryToken: string;
}

export interface ChangePasswordDto {
  token: string;
  newPassword: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}
