const COOKIE_NAME = 'bb-token';

let _accessToken: string | null = null;
let _refreshToken: string | null = null;

export function setTokens(access: string, refresh: string): void {
  _accessToken = access;
  _refreshToken = refresh;
  if (typeof document !== 'undefined') {
    document.cookie = `${COOKIE_NAME}=${access}; path=/; SameSite=Lax`;
  }
}

export function getAccessToken(): string | null {
  return _accessToken;
}

export function getRefreshToken(): string | null {
  return _refreshToken;
}

export function clearTokens(): void {
  _accessToken = null;
  _refreshToken = null;
  if (typeof document !== 'undefined') {
    document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
}

export function isAuthenticated(): boolean {
  return _accessToken !== null;
}
