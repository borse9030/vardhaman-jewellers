'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-8 py-10 sm:py-16">
        <h1 className="font-serif text-3xl font-bold text-[#1A1818] mb-6 pb-4 border-b border-[#E8E2D8]">
          Terms of Service
        </h1>
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-[#E8E2D8] text-xs text-[#57534E] space-y-5 leading-relaxed">
          <p>
            Welcome to the official digital portal of <strong>Vardhaman Jewellers</strong>. By accessing our services, you agree to comply with our terms.
          </p>
          <h2 className="font-serif text-base font-bold text-[#1A1818]">1. Bullion Rate Fluctuation</h2>
          <p>
            Gold and precious metal prices fluctuate dynamically based on the India Bullion and Jewellers Association (IBJA) spot market rates. Prices locked upon order placement remain fixed for that transaction.
          </p>
          <h2 className="font-serif text-base font-bold text-[#1A1818]">2. Hallmarking Certification</h2>
          <p>
            All jewellery sold on this platform complies with Bureau of Indian Standards (BIS) hallmarking regulations.
          </p>
          <h2 className="font-serif text-base font-bold text-[#1A1818]">3. Jurisdiction</h2>
          <p>
            Any disputes arising out of transactions shall be governed by the laws of India and subject to the exclusive jurisdiction of the courts of Jalgaon / Pune, Maharashtra.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
