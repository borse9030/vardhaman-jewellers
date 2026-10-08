'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminRole, AdminUser } from '@/types';

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
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // Restore sessions from storage
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
  };

  const hasRole = (roles: AdminRole[]): boolean => {
    if (!adminUser) return false;
    if (adminUser.role === 'super_admin') return true;
    return roles.includes(adminUser.role);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
