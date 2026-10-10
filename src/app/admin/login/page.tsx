'use client';

import React from 'react';
import OtpLoginForm from '@/components/auth/OtpLoginForm';

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center items-center p-4 selection:bg-[#581825] selection:text-white">
      {/* Subtle royal background glow */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#581825]/10 via-transparent to-transparent pointer-events-none"></div>

      <div className="w-full relative z-10 py-6 sm:py-12">
        <OtpLoginForm redirectAfterLogin="/admin" sourceContext="admin" />
      </div>
    </div>
  );
}
