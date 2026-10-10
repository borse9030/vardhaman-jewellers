'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import OtpLoginForm from '@/components/auth/OtpLoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-8 py-10 sm:py-16">
        <OtpLoginForm redirectAfterLogin="/profile" sourceContext="storefront" />
      </main>

      <Footer />
    </div>
  );
}
