'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminRole, AdminUser } from '@/types';
import { auth, isFirebaseConfigured } from '@/lib/firebase/config';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import {
  AUTHORIZED_OWNERS,
  OwnerProfile,
  getOwnerProfile,
  isAuthorizedOwner,
  formatIndianPhone,
} from '@/config/ownerAccess';

// Window extension for Firebase Phone Auth
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

import { CustomerAddress } from '@/types';
import {
  saveCustomerSession,
  loadCustomerSession,
  clearCustomerSession,
  saveAdminSession,
  loadAdminSession,
  clearAdminSession,
  isDeviceTrusted,
  markDeviceAsTrusted,
  PersistentCustomerUser,
} from '@/lib/auth/sessionManager';

export interface CustomerUser {
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

interface AuthContextType {
  customer: CustomerUser | null;
  adminUser: AdminUser | null;
  isAdminLoggedIn: boolean;
  isOwnerLoggedIn: boolean;
  ownerProfile: OwnerProfile | null;
  authReady: boolean;
  loginCustomer: (email: string, name?: string, phone?: string) => void;
  logoutCustomer: () => void;
  updateCustomerProfile: (updates: Partial<CustomerUser>) => void;
  addCustomerAddress: (address: Omit<CustomerAddress, 'id'>) => CustomerAddress;
  removeCustomerAddress: (addressId: string) => void;
  setDefaultAddress: (addressId: string) => void;
  loginWithTrustedDevice: (phone: string) => Promise<{ success: boolean; message?: string }>;
  isTrustedDevice: (phone: string) => boolean;
  loginAdmin: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logoutAdmin: () => void;
  hasRole: (roles: AdminRole[]) => boolean;
  sendOtp: (phone: string) => Promise<{ success: boolean; message?: string; otpPreview?: string; formattedPhone?: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<{ success: boolean; role?: 'super_admin' | 'customer'; message?: string; isOwner?: boolean }>;
}

const AuthContext = createContext<AuthContextType>({
  customer: null,
  adminUser: null,
  isAdminLoggedIn: false,
  isOwnerLoggedIn: false,
  ownerProfile: null,
  authReady: false,
  loginCustomer: () => {},
  logoutCustomer: () => {},
  updateCustomerProfile: () => {},
  addCustomerAddress: () => ({} as CustomerAddress),
  removeCustomerAddress: () => {},
  setDefaultAddress: () => {},
  loginWithTrustedDevice: async () => ({ success: false }),
  isTrustedDevice: () => false,
  loginAdmin: async () => ({ success: false }),
  logoutAdmin: () => {},
  hasRole: () => false,
  sendOtp: async () => ({ success: false }),
  verifyOtp: async () => ({ success: false }),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // Restore sessions from multi-tier storage (LocalStorage + 1-Year Cookie) and sync with Firebase Auth
  useEffect(() => {
    try {
      // 1. Load Customer Session
      const restoredCust = loadCustomerSession();
      if (restoredCust) {
        setCustomer(restoredCust);
      }

      // 2. Load Admin Session
      const restoredAdmin = loadAdminSession();
      if (restoredAdmin) {
        setAdminUser(restoredAdmin);
      }
    } catch (e) {
      console.error('Failed to parse auth sessions:', e);
    } finally {
      setAuthReady(true);
    }

    // 3. Setup Cross-Tab Multi-Window Auth Synchronization
    let channel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        channel = new BroadcastChannel('vj_auth_sync_channel');
        channel.onmessage = (event) => {
          const { type, data } = event.data || {};
          if (type === 'CUSTOMER_LOGIN' && data) {
            setCustomer(data);
          } else if (type === 'CUSTOMER_LOGOUT') {
            setCustomer(null);
          } else if (type === 'ADMIN_LOGIN' && data) {
            setAdminUser(data);
          } else if (type === 'ADMIN_LOGOUT') {
            setAdminUser(null);
          } else if (type === 'PROFILE_UPDATED' && data) {
            setCustomer(data);
          }
        };
      } catch {}
    }

    // Storage event listener fallback for older browsers
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'vj_customer_user') {
        if (e.newValue) {
          try {
            setCustomer(JSON.parse(e.newValue));
          } catch {}
        } else {
          setCustomer(null);
        }
      } else if (e.key === 'vj_admin_user') {
        if (e.newValue) {
          try {
            setAdminUser(JSON.parse(e.newValue));
          } catch {}
        } else {
          setAdminUser(null);
        }
      }
    };
    window.addEventListener('storage', handleStorage);

    // 4. Firebase Auth synchronization
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
          const owner = getOwnerProfile(fbUser.phoneNumber);
          if (owner) {
            const adminUserObj: AdminUser = {
              uid: fbUser.uid,
              name: owner.name,
              email: fbUser.email || owner.email,
              phone: fbUser.phoneNumber || formatIndianPhone(owner.phone),
              role: 'super_admin',
              isActive: true,
            };
            setAdminUser((prev) => prev || adminUserObj);
            saveAdminSession(adminUserObj, `vj_adm_fb_${Date.now()}_${owner.phone}`);
          }

          setCustomer((prev) => {
            if (!prev) {
              const restored: CustomerUser = {
                uid: fbUser.uid,
                name: owner ? owner.name : fbUser.displayName || 'Valued Patron',
                email: fbUser.email || (owner ? owner.email : ''),
                phone: fbUser.phoneNumber || (owner ? formatIndianPhone(owner.phone) : ''),
                isGuest: false,
                verifiedVia: 'firebase_sms',
                createdAt: new Date().toISOString(),
                lastActiveAt: new Date().toISOString(),
              };
              saveCustomerSession(restored);
              return restored;
            }
            return prev;
          });
        }
      });
      return () => {
        unsubscribe();
        if (channel) channel.close();
        window.removeEventListener('storage', handleStorage);
      };
    }

    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const updateCustomerProfile = (updates: Partial<CustomerUser>) => {
    setCustomer((prev) => {
      if (!prev) return null;
      const updated: CustomerUser = {
        ...prev,
        ...updates,
        lastActiveAt: new Date().toISOString(),
      };
      saveCustomerSession(updated);
      return updated;
    });
  };

  const addCustomerAddress = (address: Omit<CustomerAddress, 'id'>): CustomerAddress => {
    const newId = `addr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const fullAddress: CustomerAddress = {
      ...address,
      id: newId,
    };

    setCustomer((prev) => {
      const base: CustomerUser = prev || {
        uid: `cust-${Date.now()}`,
        name: address.fullName,
        email: address.email,
        phone: address.phone,
        isGuest: false,
      };

      const existing = base.addresses || [];
      const updatedAddresses = address.isDefault
        ? [...existing.map((a) => ({ ...a, isDefault: false })), { ...fullAddress, isDefault: true }]
        : [...existing, fullAddress];

      const updated: CustomerUser = {
        ...base,
        addresses: updatedAddresses,
        lastActiveAt: new Date().toISOString(),
      };

      saveCustomerSession(updated);
      return updated;
    });

    return fullAddress;
  };

  const removeCustomerAddress = (addressId: string) => {
    setCustomer((prev) => {
      if (!prev || !prev.addresses) return prev;
      const filtered = prev.addresses.filter((a) => a.id !== addressId);
      const updated: CustomerUser = {
        ...prev,
        addresses: filtered,
        lastActiveAt: new Date().toISOString(),
      };
      saveCustomerSession(updated);
      return updated;
    });
  };

  const setDefaultAddress = (addressId: string) => {
    setCustomer((prev) => {
      if (!prev || !prev.addresses) return prev;
      const updatedList = prev.addresses.map((a) => ({
        ...a,
        isDefault: a.id === addressId,
      }));
      const updated: CustomerUser = {
        ...prev,
        addresses: updatedList,
        lastActiveAt: new Date().toISOString(),
      };
      saveCustomerSession(updated);
      return updated;
    });
  };

  // Instant Login with Trusted Device (Zero OTP, Zero SMS Cost)
  const loginWithTrustedDevice = async (phone: string): Promise<{ success: boolean; message?: string }> => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      return { success: false, message: 'Invalid phone number' };
    }

    if (!isDeviceTrusted(cleanPhone)) {
      return { success: false, message: 'This device is not yet verified for this phone number.' };
    }

    const formattedDisplay = formatIndianPhone(cleanPhone);
    const existing = loadCustomerSession();

    const restoredUser: CustomerUser = {
      uid: existing && existing.phone?.includes(cleanPhone) ? existing.uid : `cust-${cleanPhone}`,
      name: existing && existing.phone?.includes(cleanPhone) ? existing.name : 'Valued Patron',
      email: existing && existing.phone?.includes(cleanPhone) ? existing.email : '',
      phone: formattedDisplay,
      isGuest: false,
      addresses: existing?.addresses || [],
      verifiedVia: 'trusted_device',
      lastActiveAt: new Date().toISOString(),
    };

    setCustomer(restoredUser);
    saveCustomerSession(restoredUser);

    return {
      success: true,
      message: `Device recognized! Welcome back, ${restoredUser.name}.`,
    };
  };

  const isTrustedDevice = (phone: string): boolean => {
    return isDeviceTrusted(phone);
  };

  const loginCustomer = (email: string, name = 'Valued Customer', phone?: string) => {
    const cust: CustomerUser = {
      uid: `cust-${Date.now()}`,
      email,
      name,
      phone,
      isGuest: false,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };
    setCustomer(cust);
    saveCustomerSession(cust);
  };

  const logoutCustomer = () => {
    setCustomer(null);
    clearCustomerSession();
    if (isFirebaseConfigured && auth) {
      signOut(auth).catch((err) => console.warn('Firebase signout:', err));
    }
  };

  const loginAdmin = async (email: string, pass: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        setAdminUser(data.user);
        localStorage.setItem('vj_admin_user', JSON.stringify(data.user));
        if (data.token) {
          localStorage.setItem('vj_admin_token', data.token);
        }
        return { success: true };
      }
      return { success: false, message: data.message || 'Authentication failed' };
    } catch (e) {
      console.error('Admin login error:', e);
      return { success: false, message: 'Server connection error' };
    }
  };

  const logoutAdmin = () => {
    setAdminUser(null);
    clearAdminSession();
    if (isFirebaseConfigured && auth) {
      signOut(auth).catch((err) => console.warn('Firebase signout:', err));
    }
  };

  const hasRole = (roles: AdminRole[]): boolean => {
    if (!adminUser) return false;
    if (adminUser.role === 'super_admin') return true;
    return roles.includes(adminUser.role);
  };

  const sendOtp = async (phone: string): Promise<{ success: boolean; message?: string; otpPreview?: string; formattedPhone?: string }> => {
    try {
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      if (cleanPhone.length !== 10) {
        return { success: false, message: 'Please enter a valid 10-digit mobile number.' };
      }
      const formattedE164 = `+91${cleanPhone}`;
      const formattedDisplay = `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`;

      // 0. Authorized store heads/owners instant bypass (7972565911, 7498806028, 9822123456)
      if (isAuthorizedOwner(cleanPhone)) {
        return {
          success: true,
          message: `Owner verification active for ${formattedDisplay}. Use Owner PIN 123456 to enter.`,
          formattedPhone: formattedDisplay,
          otpPreview: '123456',
        };
      }

      // 1. PRIMARY: Real Firebase Phone Auth SDK
      if (isFirebaseConfigured && auth && typeof window !== 'undefined') {
        try {
          let verifier = window.recaptchaVerifier;

          if (!verifier) {
            const container = document.getElementById('recaptcha-container');
            if (!container) {
              throw new Error('reCAPTCHA container missing in DOM');
            }
            container.innerHTML = '';
            verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
              size: 'normal',
              callback: () => {
                console.log('reCAPTCHA verified for phone auth');
              },
              'expired-callback': () => {
                console.warn('reCAPTCHA token expired');
              },
            });
            window.recaptchaVerifier = verifier;
            await verifier.render();
          }

          // Pre-flight check: Ensure reCAPTCHA was actually ticked
          const widgetId = (window as any).recaptchaWidgetId;
          const grecaptcha = (window as any).grecaptcha;
          if (grecaptcha && widgetId !== undefined) {
            const responseToken = grecaptcha.getResponse(widgetId);
            if (!responseToken) {
              return {
                success: false,
                message: 'Please complete the "I\'m not a robot" security check before proceeding.',
                formattedPhone: formattedDisplay,
              };
            }
          }

          // Dispatch REAL SMS via Google Firebase SMS Gateway
          const confirmationResult = await signInWithPhoneNumber(auth, formattedE164, verifier);
          window.confirmationResult = confirmationResult;

          console.log(`[Firebase Phone Auth] Real SMS OTP dispatched to ${formattedE164}`);

          return {
            success: true,
            message: `Verification code sent via SMS to ${formattedDisplay}.`,
            formattedPhone: formattedDisplay,
          };
        } catch (firebaseErr: any) {
          console.error('Firebase signInWithPhoneNumber error:', firebaseErr);

          // Reset the reCAPTCHA widget so user can re-verify with a fresh single-use token
          if (typeof window !== 'undefined' && (window as any).grecaptcha && (window as any).recaptchaWidgetId !== undefined) {
            try {
              (window as any).grecaptcha.reset((window as any).recaptchaWidgetId);
            } catch (rErr) {
              console.warn('Could not reset reCAPTCHA widget:', rErr);
            }
          }

          let errorMsg = 'Failed to send SMS to your phone.';
          const code = firebaseErr?.code || '';
          const msg = String(firebaseErr?.message || '');

          if (code === 'auth/operation-not-allowed' || msg.includes('region enabled')) {
            errorMsg = 'SMS to India (+91) is blocked by Firebase SMS Region Policy. In Firebase Console, go to Authentication > Settings > SMS region policy and allow India (+91).';
          } else if (code === 'auth/invalid-app-credential') {
            errorMsg = 'Google security verification failed or expired. Please tick the "I\'m not a robot" box and try again.';
          } else if (code === 'auth/invalid-phone-number') {
            errorMsg = 'Please enter a valid 10-digit Indian mobile number.';
          } else if (code === 'auth/quota-exceeded') {
            errorMsg = 'SMS quota reached in Firebase project. Please check Firebase billing or try again later.';
          } else if (code === 'auth/too-many-requests') {
            errorMsg = 'Too many requests sent to this number. Please wait a few moments before trying again.';
          } else if (code === 'auth/unauthorized-domain') {
            errorMsg = 'Domain (localhost / 127.0.0.1) is not in Firebase Authorized Domains (Authentication > Settings > Authorized Domains).';
          } else if (firebaseErr?.message) {
            errorMsg = firebaseErr.message;
          }

          return {
            success: false,
            message: errorMsg,
            formattedPhone: formattedDisplay,
          };
        }
      }

      return {
        success: false,
        message: 'Firebase Authentication is not configured.',
        formattedPhone: formattedDisplay,
      };

      // Fallback if Firebase client is not configured
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', phone }),
      });
      return await res.json();
    } catch (e: any) {
      console.error('Send OTP error:', e);
      return { success: false, message: e?.message || 'Failed to send verification code. Please check connection.' };
    }
  };

  const verifyOtp = async (phone: string, otp: string): Promise<{ success: boolean; role?: 'super_admin' | 'customer'; message?: string; isOwner?: boolean }> => {
    try {
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      const formattedDisplay = formatIndianPhone(cleanPhone);
      const owner = getOwnerProfile(cleanPhone);
      const isOwner = Boolean(owner);

      // 1. Instant bypass for authorized store heads/owners during testing (7972565911, 7498806028, 9822123456 + 123456)
      if (isOwner && otp.trim() === '123456') {
        const adminUserObj: AdminUser = {
          uid: `adm-${cleanPhone}`,
          name: owner!.name,
          email: owner!.email,
          phone: formattedDisplay,
          role: 'super_admin',
          isActive: true,
        };

        const customerObj: CustomerUser = {
          uid: `owner-cust-${cleanPhone}`,
          name: owner!.name,
          email: owner!.email,
          phone: formattedDisplay,
          isGuest: false,
        };

        setAdminUser(adminUserObj);
        setCustomer(customerObj);
        saveAdminSession(adminUserObj, `vj_adm_otp_${Date.now()}_${cleanPhone}`);
        saveCustomerSession(customerObj);
        markDeviceAsTrusted(cleanPhone);

        return {
          success: true,
          role: 'super_admin',
          isOwner: true,
          message: `Welcome, ${owner!.name}. Full store owner administrative access granted.`,
        };
      }

      // 2. PRIMARY: Verify via Firebase confirmationResult
      if (typeof window !== 'undefined' && window.confirmationResult) {
        try {
          const userCred = await window.confirmationResult.confirm(otp.trim());
          const fbUser = userCred.user;

          if (isOwner) {
            const adminUserObj: AdminUser = {
              uid: fbUser.uid,
              name: owner!.name,
              email: fbUser.email || owner!.email,
              phone: fbUser.phoneNumber || formattedDisplay,
              role: 'super_admin',
              isActive: true,
            };

            const customerObj: CustomerUser = {
              uid: fbUser.uid,
              name: owner!.name,
              email: fbUser.email || owner!.email,
              phone: fbUser.phoneNumber || formattedDisplay,
              isGuest: false,
              verifiedVia: 'firebase_sms',
            };

            setAdminUser(adminUserObj);
            setCustomer(customerObj);
            saveAdminSession(adminUserObj, `vj_adm_otp_${Date.now()}_${cleanPhone}`);
            saveCustomerSession(customerObj);
            markDeviceAsTrusted(cleanPhone);

            return {
              success: true,
              role: 'super_admin',
              isOwner: true,
              message: `Welcome, ${owner!.name}. Full store owner administrative access granted.`,
            };
          }

          // Regular customer user - ensure admin session is cleared for security
          setAdminUser(null);
          clearAdminSession();

          // Restore existing saved profile details (like addresses) if same user
          const existingCust = loadCustomerSession();
          const customerObj: CustomerUser = {
            uid: fbUser.uid,
            name: (existingCust && existingCust.phone === formattedDisplay && existingCust.name) ? existingCust.name : (fbUser.displayName || 'Valued Patron'),
            email: fbUser.email || existingCust?.email || '',
            phone: fbUser.phoneNumber || formattedDisplay,
            isGuest: false,
            addresses: existingCust?.addresses || [],
            verifiedVia: 'firebase_sms',
            createdAt: existingCust?.createdAt || new Date().toISOString(),
            lastActiveAt: new Date().toISOString(),
          };

          setCustomer(customerObj);
          saveCustomerSession(customerObj);
          markDeviceAsTrusted(cleanPhone);

          return {
            success: true,
            role: 'customer',
            isOwner: false,
            message: 'Mobile verification successful. Welcome to Vardhaman Jewellers.',
          };
        } catch (fbErr: any) {
          console.error('Firebase OTP confirmation error:', fbErr);

          // If Firebase OTP verification failed, try server verification fallback
          try {
            const fallbackRes = await fetch('/api/auth/otp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'verify', phone, otp }),
            });
            const fallbackData = await fallbackRes.json();
            if (fallbackData.success && fallbackData.user) {
              if (fallbackData.role === 'super_admin') {
                setAdminUser(fallbackData.user);
                saveAdminSession(fallbackData.user, fallbackData.token);
                if (fallbackData.customer) {
                  setCustomer(fallbackData.customer);
                  saveCustomerSession(fallbackData.customer);
                }
                markDeviceAsTrusted(cleanPhone);
                return { success: true, role: 'super_admin', isOwner: true, message: fallbackData.message };
              } else {
                setAdminUser(null);
                clearAdminSession();
                const existingCust = loadCustomerSession();
                const custUser = {
                  ...fallbackData.user,
                  addresses: existingCust?.addresses || [],
                  verifiedVia: 'otp_sms' as const,
                };
                setCustomer(custUser);
                saveCustomerSession(custUser);
                markDeviceAsTrusted(cleanPhone);
                return { success: true, role: 'customer', isOwner: false, message: fallbackData.message };
              }
            }
          } catch (e) {
            // ignore fallback error and report Firebase error
          }

          let errorMsg = 'Invalid verification code.';
          if (fbErr?.code === 'auth/invalid-verification-code') {
            errorMsg = 'Incorrect 6-digit code. Please enter the exact code received on your mobile.';
          } else if (fbErr?.code === 'auth/code-expired') {
            errorMsg = 'The verification code has expired. Please request a new code.';
          } else if (fbErr?.message) {
            errorMsg = fbErr.message;
          }

          return { success: false, message: errorMsg };
        }
      }

      // 3. Fallback to API route verify
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', phone, otp }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        if (data.role === 'super_admin') {
          setAdminUser(data.user);
          localStorage.setItem('vj_admin_user', JSON.stringify(data.user));
          if (data.token) {
            localStorage.setItem('vj_admin_token', data.token);
          }
          if (data.customer) {
            setCustomer(data.customer);
            localStorage.setItem('vj_customer_user', JSON.stringify(data.customer));
          }
          return { success: true, role: data.role, isOwner: true, message: data.message };
        } else {
          setAdminUser(null);
          localStorage.removeItem('vj_admin_user');
          localStorage.removeItem('vj_admin_token');
          setCustomer(data.user);
          localStorage.setItem('vj_customer_user', JSON.stringify(data.user));
          return { success: true, role: data.role, isOwner: false, message: data.message };
        }
      }
      return { success: false, message: data.message || 'Invalid verification code.' };
    } catch (e: any) {
      console.error('Verify OTP error:', e);
      return { success: false, message: e?.message || 'Verification error. Please try again.' };
    }
  };

  const isOwnerLoggedIn = Boolean(
    (adminUser && isAuthorizedOwner(adminUser.phone)) ||
    (customer && isAuthorizedOwner(customer.phone))
  );
  const currentOwnerProfile = getOwnerProfile(adminUser?.phone || customer?.phone);

  return (
    <AuthContext.Provider
      value={{
        customer,
        adminUser,
        isAdminLoggedIn: Boolean(adminUser),
        isOwnerLoggedIn,
        ownerProfile: currentOwnerProfile,
        authReady,
        loginCustomer,
        logoutCustomer,
        updateCustomerProfile,
        addCustomerAddress,
        removeCustomerAddress,
        setDefaultAddress,
        loginWithTrustedDevice,
        isTrustedDevice,
        loginAdmin,
        logoutAdmin,
        hasRole,
        sendOtp,
        verifyOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
