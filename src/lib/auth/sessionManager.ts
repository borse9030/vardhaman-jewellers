'use client';

import { CustomerAddress, AdminUser, AdminRole } from '@/types';

export interface PersistentCustomerUser {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  isGuest?: boolean;
  addresses?: CustomerAddress[];
  createdAt?: string;
  lastActiveAt?: string;
  deviceToken?: string;
  verifiedVia?: 'firebase_sms' | 'otp_sms' | 'owner_bypass' | 'checkout_verified' | 'trusted_device';
}

export type PersistentAdminUser = AdminUser & {
  lastActiveAt?: string;
  token?: string;
};

const CUSTOMER_STORAGE_KEY = 'vj_customer_user';
const ADMIN_STORAGE_KEY = 'vj_admin_user';
const CUSTOMER_COOKIE_NAME = 'vj_customer_session';
const ADMIN_COOKIE_NAME = 'vj_admin_session';
const TRUSTED_DEVICE_PREFIX = 'vj_trusted_dev_';
const AUTH_CHANNEL_NAME = 'vj_auth_sync_channel';

// 365 Days in Seconds
const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;

/**
 * Cookie Utilities for Long-Lived (1-Year) Session Persistence
 */
export function setCookie(name: string, value: string, maxAgeSeconds: number = ONE_YEAR_SECONDS) {
  if (typeof document === 'undefined') return;
  try {
    const encoded = encodeURIComponent(value);
    document.cookie = `${name}=${encoded}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
  } catch (e) {
    console.warn('Failed to set persistent session cookie:', e);
  }
}

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  try {
    const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
    return match ? decodeURIComponent(match[3]) : null;
  } catch {
    return null;
  }
}

export function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

/**
 * Cross-Tab Broadcast Channel
 */
function getAuthBroadcastChannel(): BroadcastChannel | null {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      return new BroadcastChannel(AUTH_CHANNEL_NAME);
    } catch {
      return null;
    }
  }
  return null;
}

export function broadcastAuthEvent(type: 'CUSTOMER_LOGIN' | 'CUSTOMER_LOGOUT' | 'ADMIN_LOGIN' | 'ADMIN_LOGOUT' | 'PROFILE_UPDATED', data?: any) {
  const channel = getAuthBroadcastChannel();
  if (channel) {
    try {
      channel.postMessage({ type, data, timestamp: Date.now() });
      channel.close();
    } catch {}
  }
}

/**
 * Trusted Device / OTP Cost Reduction Logic:
 * When a user successfully verifies their mobile number once, we issue a trusted device token.
 * This proves this physical browser/device has already verified ownership of this phone number,
 * allowing subsequent logins without burning an SMS OTP!
 */
export function markDeviceAsTrusted(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  if (!cleanPhone || cleanPhone.length !== 10) return '';

  const token = `dev_tok_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  const payload = {
    phone: cleanPhone,
    token,
    issuedAt: Date.now(),
    expiresAt: Date.now() + ONE_YEAR_SECONDS * 1000,
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`${TRUSTED_DEVICE_PREFIX}${cleanPhone}`, JSON.stringify(payload));
      setCookie(`${TRUSTED_DEVICE_PREFIX}${cleanPhone}`, token, ONE_YEAR_SECONDS);
    } catch (e) {
      console.warn('Could not store trusted device token:', e);
    }
  }

  return token;
}

export function isDeviceTrusted(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  if (!cleanPhone || cleanPhone.length !== 10 || typeof window === 'undefined') return false;

  try {
    const raw = localStorage.getItem(`${TRUSTED_DEVICE_PREFIX}${cleanPhone}`);
    if (raw) {
      const data = JSON.parse(raw);
      if (data && data.phone === cleanPhone && data.expiresAt > Date.now()) {
        return true;
      }
    }

    const cookieToken = getCookie(`${TRUSTED_DEVICE_PREFIX}${cleanPhone}`);
    if (cookieToken) return true;
  } catch {
    return false;
  }

  return false;
}

/**
 * Customer Session Management (Multi-tier: LocalStorage + 1-Year Cookie)
 */
export function saveCustomerSession(user: PersistentCustomerUser, broadcast: boolean = true): void {
  if (typeof window === 'undefined') return;

  const enrichedUser: PersistentCustomerUser = {
    ...user,
    lastActiveAt: new Date().toISOString(),
    createdAt: user.createdAt || new Date().toISOString(),
  };

  try {
    const jsonStr = JSON.stringify(enrichedUser);
    localStorage.setItem(CUSTOMER_STORAGE_KEY, jsonStr);
    setCookie(CUSTOMER_COOKIE_NAME, jsonStr, ONE_YEAR_SECONDS);

    if (enrichedUser.phone) {
      markDeviceAsTrusted(enrichedUser.phone);
    }

    if (broadcast) {
      broadcastAuthEvent('CUSTOMER_LOGIN', enrichedUser);
    }
  } catch (e) {
    console.error('Error saving customer session:', e);
  }
}

export function loadCustomerSession(): PersistentCustomerUser | null {
  if (typeof window === 'undefined') return null;

  try {
    // 1. Try LocalStorage
    const stored = localStorage.getItem(CUSTOMER_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as PersistentCustomerUser;
      if (parsed && parsed.uid) {
        // Keep cookie in sync
        setCookie(CUSTOMER_COOKIE_NAME, stored, ONE_YEAR_SECONDS);
        return parsed;
      }
    }

    // 2. Fallback to 1-Year Persistent Cookie (Restores session if LocalStorage was cleared)
    const cookieVal = getCookie(CUSTOMER_COOKIE_NAME);
    if (cookieVal) {
      const parsed = JSON.parse(cookieVal) as PersistentCustomerUser;
      if (parsed && parsed.uid) {
        localStorage.setItem(CUSTOMER_STORAGE_KEY, cookieVal);
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error restoring customer session:', e);
  }

  return null;
}

export function clearCustomerSession(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(CUSTOMER_STORAGE_KEY);
    deleteCookie(CUSTOMER_COOKIE_NAME);
    broadcastAuthEvent('CUSTOMER_LOGOUT');
  } catch (e) {
    console.warn('Error clearing customer session:', e);
  }
}

/**
 * Admin / Store Owner Session Management
 */
export function saveAdminSession(admin: PersistentAdminUser, token?: string, broadcast: boolean = true): void {
  if (typeof window === 'undefined') return;

  const enrichedAdmin: PersistentAdminUser = {
    ...admin,
    lastActiveAt: new Date().toISOString(),
    token: token || admin.token,
  };

  try {
    const jsonStr = JSON.stringify(enrichedAdmin);
    localStorage.setItem(ADMIN_STORAGE_KEY, jsonStr);
    if (token) {
      localStorage.setItem('vj_admin_token', token);
    }
    setCookie(ADMIN_COOKIE_NAME, jsonStr, ONE_YEAR_SECONDS);

    if (broadcast) {
      broadcastAuthEvent('ADMIN_LOGIN', enrichedAdmin);
    }
  } catch (e) {
    console.error('Error saving admin session:', e);
  }
}

export function loadAdminSession(): PersistentAdminUser | null {
  if (typeof window === 'undefined') return null;

  try {
    // 1. LocalStorage
    const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as PersistentAdminUser;
      if (parsed && parsed.uid) {
        setCookie(ADMIN_COOKIE_NAME, stored, ONE_YEAR_SECONDS);
        return parsed;
      }
    }

    // 2. Cookie Fallback
    const cookieVal = getCookie(ADMIN_COOKIE_NAME);
    if (cookieVal) {
      const parsed = JSON.parse(cookieVal) as PersistentAdminUser;
      if (parsed && parsed.uid) {
        localStorage.setItem(ADMIN_STORAGE_KEY, cookieVal);
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error restoring admin session:', e);
  }

  return null;
}

export function clearAdminSession(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    localStorage.removeItem('vj_admin_token');
    deleteCookie(ADMIN_COOKIE_NAME);
    broadcastAuthEvent('ADMIN_LOGOUT');
  } catch (e) {
    console.warn('Error clearing admin session:', e);
  }
}
