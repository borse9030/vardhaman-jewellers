'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Scale, Award, ArrowRight, HelpCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function GoldBuyingGuidePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-8 py-10 sm:py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#9A7B4F]">
            Jewellery Education
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1818] mt-2">
            The Complete Indian Gold Buying Guide
          </h1>
          <p className="text-xs sm:text-sm text-[#78716C] mt-2 leading-relaxed">
            Essential knowledge on BIS hallmarking, purity karatage, making charges, and transparent pricing.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-[#E8E2D8] shadow-xs space-y-8 text-xs text-[#57534E] leading-relaxed">
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#1A1818]">
              1. Understanding Karatage & Purity (24K vs 22K vs 18K)
            </h2>
            <p>
              The purity of gold is measured in karats out of 24 parts:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>24 Karat (99.9% pure):</strong> Pure elemental gold. Soft and malleable; best suited for gold coins, bars, and bullion investment.</li>
              <li><strong>22 Karat (91.6% pure / 916):</strong> The quintessential Indian jewellery standard. Blended with copper/silver to give strength and retain glorious rich luster.</li>
              <li><strong>18 Karat (75.0% pure / 750):</strong> Ideal for setting natural diamonds and gemstones due to its superior prong grip.</li>
            </ul>
          </section>

          <section className="space-y-3 pt-4 border-t border-[#F0ECE4]">
            <h2 className="font-serif text-xl font-bold text-[#1A1818]">
              2. How to Read the BIS Hallmark 6-Digit HUID
            </h2>
            <p>
              Every genuine piece of hallmarked gold jewellery in India must contain 3 mandatory marks:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8E2D8]">
                <strong className="block text-[#1A1818]">1. BIS Logo</strong>
                <span>Triangular official mark of Bureau of Indian Standards</span>
              </div>
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8E2D8]">
                <strong className="block text-[#1A1818]">2. Purity Stamp</strong>
                <span>22K916, 18K750, or 14K585</span>
              </div>
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8E2D8]">
                <strong className="block text-[#1A1818]">3. 6-Digit HUID</strong>
                <span>Unique alphanumeric tracking number verifiable on BIS Care App</span>
              </div>
            </div>
          </section>

          <section className="space-y-3 pt-4 border-t border-[#F0ECE4]">
            <h2 className="font-serif text-xl font-bold text-[#1A1818]">
              3. The Vardhaman Transparent Pricing Guarantee
            </h2>
            <p>
              Unlike conventional jewelers who bundle confusing making charges, we explicitly itemize:
            </p>
            <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E8E2D8] font-mono text-[11px] text-[#581825]">
              Final Amount = (Net Gold Weight × Live Spot Rate) + Making Charges + Wastage + Gems + 3% GST
            </div>
          </section>

          <div className="pt-4 border-t border-[#F0ECE4] flex flex-wrap gap-4 justify-between items-center">
            <Link
              href="/gold-rate"
              className="text-xs font-bold text-[#581825] hover:underline flex items-center gap-1"
            >
              <span>View Today's Live Gold Rates</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/sell-gold"
              className="text-xs font-bold text-[#581825] hover:underline flex items-center gap-1"
            >
              <span>Sell / Exchange Old Gold</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
