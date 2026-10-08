'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Award, Users, Gem, HeartHandshake, ArrowRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-8 py-10 sm:py-16">
        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#9A7B4F]">
            Our 40-Year Heritage
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1A1818] mt-2">
            The Legacy of Vardhaman Jewellers
          </h1>
          <p className="text-xs sm:text-sm text-[#78716C] mt-3 leading-relaxed">
            Founded in 1984 in the heart of Khandesh, Maharashtra, Vardhaman Jewellers was built on an uncompromising devotion to pure gold, honest weight, and family trust.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-16">
          <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden border border-[#E8E2D8] shadow-md">
            <Image
              src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&q=80"
              alt="Vardhaman Heritage Craft"
              fill
              className="object-cover"
            />
          </div>

          <div className="space-y-4 text-xs text-[#57534E] leading-relaxed">
            <h2 className="font-serif text-2xl font-bold text-[#1A1818]">
              Preserving Maharashtra’s Royal Goldsmith Traditions
            </h2>
            <p>
              For over four decades, our master artisans have preserved traditional goldsmithing techniques—from intricate temple Nakshi carvings and Kolhapuri Saaj to royal Maharashtrian Patlya and Pichodi bangles.
            </p>
            <p>
              Every ornament that leaves our ateliers is crafted with government BIS 916 hallmarked gold, ensuring that our patrons in Jalgaon, Dhule, Pune, and Mumbai receive nothing less than certified purity.
            </p>
            <p>
              We believe jewellery is never merely an ornament; it is a sacred trust passed down across mothers and daughters, celebrating sacred vows and life’s golden moments.
            </p>
          </div>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
          <div className="p-6 bg-white rounded-2xl border border-[#E8E2D8] text-center space-y-2">
            <ShieldCheck className="w-8 h-8 text-[#581825] mx-auto" />
            <h3 className="font-serif text-base font-bold text-[#1A1818]">100% BIS Hallmarked</h3>
            <p className="text-xs text-[#78716C]">
              Strict government quality audits ensuring 91.6% pure gold without compromise.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-[#E8E2D8] text-center space-y-2">
            <Gem className="w-8 h-8 text-[#581825] mx-auto" />
            <h3 className="font-serif text-base font-bold text-[#1A1818]">Certified Diamonds</h3>
            <p className="text-xs text-[#78716C]">
              IGI & SGL natural certified solitaires with conflict-free origin guarantees.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-[#E8E2D8] text-center space-y-2">
            <HeartHandshake className="w-8 h-8 text-[#581825] mx-auto" />
            <h3 className="font-serif text-base font-bold text-[#1A1818]">Lifetime Assurance</h3>
            <p className="text-xs text-[#78716C]">
              Transparent exchange and buyback benchmarked to live bullion market rates.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
