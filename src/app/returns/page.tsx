'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ReturnsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-8 py-10 sm:py-16">
        <h1 className="font-serif text-3xl font-bold text-[#1A1818] mb-6 pb-4 border-b border-[#E8E2D8]">
          Lifetime Exchange & Buyback Policy
        </h1>
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-[#E8E2D8] text-xs text-[#57534E] space-y-5 leading-relaxed">
          <h2 className="font-serif text-base font-bold text-[#1A1818]">1. 15-Day Money-Back Guarantee</h2>
          <p>
            If you are not entirely delighted with your jewellery piece, you may return it within 15 days of delivery in its original, unworn condition with the original invoice and certificate for a 100% refund.
          </p>
          <h2 className="font-serif text-base font-bold text-[#1A1818]">2. Lifetime Gold Exchange</h2>
          <p>
            Exchange your jewellery at any time across our Jalgaon, Dhule, Pune, and Mumbai showrooms. 100% of the prevailing spot bullion rate is applied to the net pure gold weight.
          </p>
          <h2 className="font-serif text-base font-bold text-[#1A1818]">3. Certified Diamond Buyback</h2>
          <p>
            Natural certified diamonds carry up to 90% exchange value towards upgraded diamond jewellery or 80% direct cash buyback.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
