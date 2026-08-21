/**
 * In-Memory Token Manager
 * 
 * Stores sensitive access tokens in JS runtime memory (closure) to mitigate XSS exposure,
 * while managing session synchronization for Next.js Middleware.
 */

let memoryAccessToken: string | null = null;
let memoryRefreshToken: string | null = null;

// Helpers to read/write session cookies for Next.js Edge middleware
function setCookie(name: string, value: string, days: number = 7) {
  if (typeof document === 'undefined') return;
  const maxAge = days * 24 * 60 * 60;
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
}

function removeCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const matches = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return matches ? decodeURIComponent(matches[1]) : null;
}

export const tokenManager = {
  /**
   * Returns the current access token from memory.
   */
  getAccessToken(): string | null {
    if (memoryAccessToken) {
      return memoryAccessToken;
    }
    // Fallback: If memory is empty (e.g. initial page load or hard refresh), check session cookie
    if (typeof document !== 'undefined') {
      const cookieToken = getCookie('auth_token');
      if (cookieToken && cookieToken !== 'undefined' && cookieToken !== 'null') {
        memoryAccessToken = cookieToken;
        return memoryAccessToken;
      }
    }
    return null;
  },

  /**
   * Sets the access token in runtime memory and syncs the session cookie for middleware.
   */
  setAccessToken(token: string | null, role?: string, status?: string): void {
    memoryAccessToken = token;
    if (token) {
      setCookie('auth_token', token, 7);
      if (role) {
        setCookie('user_role', role, 7);
      }
      if (status !== undefined) {
        setCookie('user_status', status || '', 7);
      }
    } else {
      this.clearTokens();
    }
  },

  /**
   * Gets the refresh token.
   */
  getRefreshToken(): string | null {
    if (memoryRefreshToken) {
      return memoryRefreshToken;
    }
    if (typeof document !== 'undefined') {
      const cookieRefresh = getCookie('refresh_token');
      if (cookieRefresh && cookieRefresh !== 'undefined' && cookieRefresh !== 'null') {
        memoryRefreshToken = cookieRefresh;
        return memoryRefreshToken;
      }
    }
    return null;
  },

  /**
   * Sets the refresh token in memory and secure cookie.
   */
  setRefreshToken(token: string | null): void {
    memoryRefreshToken = token;
    if (token) {
      setCookie('refresh_token', token, 30);
    } else {
      removeCookie('refresh_token');
    }
  },

  /**
   * Clears all tokens and session cookies upon logout or expiration.
   */
  clearTokens(): void {
    memoryAccessToken = null;
    memoryRefreshToken = null;
    removeCookie('auth_token');
    removeCookie('refresh_token');
    removeCookie('user_role');
    removeCookie('user_status');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  },

  /**
   * Checks if user has a valid authenticated session.
   */
  hasSession(): boolean {
    return Boolean(this.getAccessToken() || this.getRefreshToken());
  },
};

export default tokenManager;
