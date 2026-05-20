import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  AuthTokens,
  RegisterResponse,
  LoginDto,
  RegisterDto,
  EmailExistsDto,
  EmailExistsResponse,
  RecoveryDto,
  RecoveryResponse,
  ChangePasswordDto,
  RefreshTokenDto,
} from '@models/auth.model';

import { environment } from '@environments/environment';
import { switchMap, tap } from 'rxjs/operators';
import { TokenService } from '@services/token.service';
import { RecentBoardsService } from '@services/recent-boards.service';
import { User } from '@models/user.model';
import { BehaviorSubject } from 'rxjs';
import { checkToken } from '@interceptors/token.interceptor';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  apiUrl = environment.API_URL;
  user$ = new BehaviorSubject<User | null>(null);

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private recentBoardsService: RecentBoardsService,
  ) {}

  getDataUser() {
    return this.user$.getValue();
  }

  login(email: string, password: string) {
    const data: LoginDto = { email, password };

    return this.http
      .post<AuthTokens>(`${this.apiUrl}/api/v1/auth/login`, data)
      .pipe(
        tap((response) => {
          this.tokenService.saveToken(response.access_token);
          this.tokenService.saveRefreshToken(response.refresh_token);
          this.recentBoardsService.clearStack();
        }),
      );
  }

  register(name: string, password: string, email: string) {
    const data: RegisterDto = { name, email, password };

    return this.http.post<RegisterResponse>(
      `${this.apiUrl}/api/v1/auth/register`,
      data,
    );
  }

  emailExists(email: string) {
    const data: EmailExistsDto = { email };

    return this.http.post<EmailExistsResponse>(
      `${this.apiUrl}/api/v1/auth/is-available`,
      data,
    );
  }

  registerAndLogin(name: string, email: string, password: string) {
    return this.register(name, password, email).pipe(
      tap((res) => console.log('user created', res)),
      switchMap(() => this.login(email, password)),
    );
  }

  recovery(email: string) {
    const data: RecoveryDto = { email };

    return this.http.post<RecoveryResponse>(
      `${this.apiUrl}/api/v1/auth/recovery`,
      data,
    );
  }

  changePassword(token: string, newPassword: string) {
    const data: ChangePasswordDto = { token, newPassword };

    return this.http.post(`${this.apiUrl}/api/v1/auth/change-password`, data);
  }

  getProfile() {
    return this.http
      .get<User>(`${this.apiUrl}/api/v1/me/profile`, { context: checkToken() })
      .pipe(
        tap((user) => {
          this.user$.next(user);
        }),
      );
  }

  logout() {
    this.tokenService.removeToken();
    this.tokenService.removeTokenRefresh();
  }

  refreshToken(refreshToken: string) {
    const data: RefreshTokenDto = { refreshToken };

    return this.http
      .post<AuthTokens>(`${this.apiUrl}/api/v1/auth/refresh-token`, data)
      .pipe(
        tap((response) => {
          this.tokenService.saveToken(response.access_token);
          this.tokenService.saveRefreshToken(response.refresh_token);
        }),
      );
  }
}
