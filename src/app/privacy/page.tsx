'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-8 py-10 sm:py-16">
        <h1 className="font-serif text-3xl font-bold text-[#1A1818] mb-6 pb-4 border-b border-[#E8E2D8]">
          Privacy Policy
        </h1>
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-[#E8E2D8] text-xs text-[#57534E] space-y-5 leading-relaxed">
          <p>
            At <strong>Vardhaman Jewellers</strong>, we respect your privacy and are committed to protecting the personal information you share with us.
          </p>
          <h2 className="font-serif text-base font-bold text-[#1A1818]">1. Information We Collect</h2>
          <p>
            When you browse our catalogue, register an account, book a showroom appointment, or place an order, we may collect your name, mobile number, email address, and delivery coordinates.
          </p>
          <h2 className="font-serif text-base font-bold text-[#1A1818]">2. Security of High-Value Orders</h2>
          <p>
            All online transactions and payment references are encrypted using industry-standard SSL encryption. We do not store credit card or debit card numbers on our servers.
          </p>
          <h2 className="font-serif text-base font-bold text-[#1A1818]">3. Government Compliance & KYC</h2>
          <p>
            In accordance with Government of India regulations, purchase of high-value precious jewellery exceeding statutory thresholds may require PAN verification.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
