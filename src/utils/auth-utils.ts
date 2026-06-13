import Cookie from 'js-cookie';
import SSRCookie from 'cookie';
import {
  AUTH_CRED, EMAIL_VERIFIED,
  PERMISSIONS,
  STAFF,
  STORE_OWNER,
  SUPER_ADMIN,
  TOKEN,
} from './constants';

export const allowedRoles = [SUPER_ADMIN, STORE_OWNER, STAFF];
export const adminAndOwnerOnly = [SUPER_ADMIN, STORE_OWNER];
export const adminOwnerAndStaffOnly = [SUPER_ADMIN, STORE_OWNER, STAFF];
export const adminOnly = [SUPER_ADMIN];
export const ownerOnly = [STORE_OWNER];
export const ownerAndStaffOnly = [STORE_OWNER, STAFF];

export function setAuthCredentials(token: string, permissions: any) {
  const payload = JSON.stringify({ token, permissions });
  Cookie.set(AUTH_CRED, payload);

  const configuredKey = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY;
  if (configuredKey && configuredKey !== AUTH_CRED) {
    Cookie.set(configuredKey, payload);
  }
}

export function clearAuthCredentials() {
  Cookie.remove(AUTH_CRED);
  const legacyKey = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY;
  if (legacyKey && legacyKey !== AUTH_CRED) {
    Cookie.remove(legacyKey);
  }
  Cookie.remove('authToken');
}
export function setEmailVerified(emailVerified: boolean) {
  Cookie.set(EMAIL_VERIFIED, JSON.stringify({ emailVerified }));
}
export function getEmailVerified(): {
  emailVerified: boolean;
} {
  const emailVerified = Cookie.get(EMAIL_VERIFIED);
  return emailVerified ? JSON.parse(emailVerified) : false;
}

export function getAuthCredentials(context?: any): {
  token: string | null;
  permissions: string[] | null;
} {
  let authCred;
  if (context) {
    const cookies = parseSSRCookie(context);
    const configuredKey = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY;
    authCred =
      cookies[AUTH_CRED] ||
      (configuredKey ? cookies[configuredKey] : undefined) ||
      cookies.authToken;
  } else {
    const configuredKey = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY;
    authCred =
      Cookie.get(AUTH_CRED) ||
      (configuredKey ? Cookie.get(configuredKey) : undefined) ||
      Cookie.get('authToken');
  }
  if (authCred) {
    try {
      return JSON.parse(authCred);
    } catch {
      try {
        return JSON.parse(decodeURIComponent(authCred));
      } catch {
        return { token: null, permissions: null };
      }
    }
  }
  return { token: null, permissions: null };
}

export function parseSSRCookie(context: any) {
  return SSRCookie.parse(context.req.headers.cookie ?? '');
}

export function hasAccess(
  _allowedRoles: string[],
  _userPermissions: string[] | undefined | null
) {
  if (_userPermissions) {
    return Boolean(
      _allowedRoles?.find((aRole) => _userPermissions.includes(aRole))
    );
  }
  return false;
}
export function isAuthenticated(_cookies: any) {
  return (
    !!_cookies[TOKEN] &&
    Array.isArray(_cookies[PERMISSIONS]) &&
    !!_cookies[PERMISSIONS].length
  );
}
