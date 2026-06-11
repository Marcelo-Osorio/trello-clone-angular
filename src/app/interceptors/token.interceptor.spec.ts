import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { TokenInterceptor } from './token.interceptor';
import { TokenService } from '@services/token.service';
import { AuthService } from '@services/auth.service';

describe('TokenInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
    providers: [
      TokenInterceptor,
      { provide: TokenService, useValue: { getToken: () => null, isValidToken: () => false, getRefreshToken: () => null, isValidRefreshToken: () => false } },
      { provide: AuthService, useValue: { refreshToken: () => null } },
    ]
  }));

  it('should be created', () => {
    const interceptor: TokenInterceptor = TestBed.inject(TokenInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
