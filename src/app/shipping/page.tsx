'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ShippingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-8 py-10 sm:py-16">
        <h1 className="font-serif text-3xl font-bold text-[#1A1818] mb-6 pb-4 border-b border-[#E8E2D8]">
          Shipping & Transit Insurance
        </h1>
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-[#E8E2D8] text-xs text-[#57534E] space-y-5 leading-relaxed">
          <h2 className="font-serif text-base font-bold text-[#1A1818]">1. 100% Insured Delivery</h2>
          <p>
            Every piece of jewellery dispatched by Vardhaman Jewellers is fully insured during transit against theft, damage, or loss. The insurance coverage remains active until the package is handed over to you.
          </p>
          <h2 className="font-serif text-base font-bold text-[#1A1818]">2. Tamper-Proof Packaging</h2>
          <p>
            Your order is packaged in a royal presentation box placed inside a serialized, tamper-evident security pouch. If the security seal is broken or compromised, please do not accept the package.
          </p>
          <h2 className="font-serif text-base font-bold text-[#1A1818]">3. Dispatch Timelines</h2>
          <p>
            Ready-to-ship designs are dispatched within 24 to 48 hours. Made-to-order and custom bridal sets typically take 7 to 14 business days.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
