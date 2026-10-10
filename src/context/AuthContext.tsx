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

// Window extension for Firebase Phone Auth
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export interface CustomerUser {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  isGuest?: boolean;
}

interface AuthContextType {
  customer: CustomerUser | null;
  adminUser: AdminUser | null;
  isAdminLoggedIn: boolean;
  authReady: boolean;
  loginCustomer: (email: string, name?: string, phone?: string) => void;
  logoutCustomer: () => void;
  loginAdmin: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logoutAdmin: () => void;
  hasRole: (roles: AdminRole[]) => boolean;
  sendOtp: (phone: string) => Promise<{ success: boolean; message?: string; otpPreview?: string; formattedPhone?: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<{ success: boolean; role?: 'super_admin' | 'customer'; message?: string }>;
}

const AuthContext = createContext<AuthContextType>({
  customer: null,
  adminUser: null,
  isAdminLoggedIn: false,
  authReady: false,
  loginCustomer: () => {},
  logoutCustomer: () => {},
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

  // Restore sessions from storage and sync with Firebase Auth
  useEffect(() => {
    try {
      const storedCustomer = localStorage.getItem('vj_customer_user');
      if (storedCustomer) {
        setCustomer(JSON.parse(storedCustomer));
      }
      const storedAdmin = localStorage.getItem('vj_admin_user');
      if (storedAdmin) {
        setAdminUser(JSON.parse(storedAdmin));
      }
    } catch (e) {
      console.error('Failed to parse auth sessions:', e);
    } finally {
      setAuthReady(true);
    }

    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
          setCustomer((prev) => {
            if (!prev) {
              const restored: CustomerUser = {
                uid: fbUser.uid,
                name: fbUser.displayName || 'Valued Patron',
                email: fbUser.email || '',
                phone: fbUser.phoneNumber || '',
                isGuest: false,
              };
              localStorage.setItem('vj_customer_user', JSON.stringify(restored));
              return restored;
            }
            return prev;
          });
        }
      });
      return () => unsubscribe();
    }
  }, []);

  const loginCustomer = (email: string, name = 'Valued Customer', phone?: string) => {
    const cust: CustomerUser = {
      uid: `cust-${Date.now()}`,
      email,
      name,
      phone,
      isGuest: false,
    };
    setCustomer(cust);
    localStorage.setItem('vj_customer_user', JSON.stringify(cust));
  };

  const logoutCustomer = () => {
    setCustomer(null);
    localStorage.removeItem('vj_customer_user');
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
    localStorage.removeItem('vj_admin_user');
    localStorage.removeItem('vj_admin_token');
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

  const verifyOtp = async (phone: string, otp: string): Promise<{ success: boolean; role?: 'super_admin' | 'customer'; message?: string }> => {
    try {
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      const formattedDisplay = `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`;
      const isAdmin = cleanPhone === '9822123456';

      // 1. Instant bypass for secret admin test credentials (9822123456 + 123456)
      if (isAdmin && otp.trim() === '123456') {
        const adminUserObj: AdminUser = {
          uid: `adm-${cleanPhone}`,
          name: 'Jaynam (Administrator)',
          email: 'jaynam27@gmail.com',
          phone: formattedDisplay,
          role: 'super_admin',
          isActive: true,
        };
        setAdminUser(adminUserObj);
        localStorage.setItem('vj_admin_user', JSON.stringify(adminUserObj));
        localStorage.setItem('vj_admin_token', `vj_adm_otp_${Date.now()}`);
        return { success: true, role: 'super_admin', message: 'Administrative access verified.' };
      }

      // 2. PRIMARY: Verify via Firebase confirmationResult
      if (typeof window !== 'undefined' && window.confirmationResult) {
        try {
          const userCred = await window.confirmationResult.confirm(otp.trim());
          const fbUser = userCred.user;

          if (isAdmin) {
            const adminUserObj: AdminUser = {
              uid: fbUser.uid,
              name: 'Jaynam (Administrator)',
              email: fbUser.email || 'jaynam27@gmail.com',
              phone: fbUser.phoneNumber || formattedDisplay,
              role: 'super_admin',
              isActive: true,
            };
            setAdminUser(adminUserObj);
            localStorage.setItem('vj_admin_user', JSON.stringify(adminUserObj));
            localStorage.setItem('vj_admin_token', `vj_adm_otp_${Date.now()}`);
            return { success: true, role: 'super_admin', message: 'Administrative access verified.' };
          }

          // Customer user
          const customerObj: CustomerUser = {
            uid: fbUser.uid,
            name: fbUser.displayName || 'Valued Patron',
            email: fbUser.email || '',
            phone: fbUser.phoneNumber || formattedDisplay,
            isGuest: false,
          };
          setCustomer(customerObj);
          localStorage.setItem('vj_customer_user', JSON.stringify(customerObj));

          return {
            success: true,
            role: 'customer',
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
                localStorage.setItem('vj_admin_user', JSON.stringify(fallbackData.user));
                if (fallbackData.token) localStorage.setItem('vj_admin_token', fallbackData.token);
              } else {
                setCustomer(fallbackData.user);
                localStorage.setItem('vj_customer_user', JSON.stringify(fallbackData.user));
              }
              return { success: true, role: fallbackData.role, message: fallbackData.message };
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
        } else {
          setCustomer(data.user);
          localStorage.setItem('vj_customer_user', JSON.stringify(data.user));
        }
        return { success: true, role: data.role, message: data.message };
      }
      return { success: false, message: data.message || 'Invalid verification code.' };
    } catch (e: any) {
      console.error('Verify OTP error:', e);
      return { success: false, message: e?.message || 'Verification error. Please try again.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        adminUser,
        isAdminLoggedIn: Boolean(adminUser),
        authReady,
        loginCustomer,
        logoutCustomer,
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
