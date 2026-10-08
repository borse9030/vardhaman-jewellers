'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShieldCheck,
  Calendar,
  Clock,
  ArrowRight,
  Scale,
  Info,
  CheckCircle2,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useGoldRates } from '@/context/GoldRateContext';
import { formatINR } from '@/services/pricingEngine';
import { getGoldRateHistory } from '@/lib/db/goldRateService';
import { GoldRateHistoryItem } from '@/types';

export default function GoldRatePage() {
  const { rates } = useGoldRates();
  const [history, setHistory] = useState<GoldRateHistoryItem[]>([]);

  useEffect(() => {
    getGoldRateHistory().then((data) => setHistory(data));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-8 py-10 sm:py-16">
        {/* Page Title */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#9A7B4F]">
            Official Bullion Benchmark
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1818] mt-2">
            Today’s Live Gold & Silver Rates
          </h1>
          <p className="text-xs sm:text-sm text-[#78716C] mt-2 leading-relaxed">
            Updated live from the India Bullion & Jewellers Association (IBJA) spot market. Accurate pricing applied transparently to all Vardhaman Jewellers creations.
          </p>
        </div>

        {/* Live Rates Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {/* 22K Gold */}
          <div className="bg-white p-6 rounded-2xl border-2 border-[#581825] shadow-md relative overflow-hidden">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#581825] bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#E8E2D8]">
              Most Popular For Jewellery
            </span>
            <h2 className="font-serif text-lg font-bold text-[#1A1818] mt-3">22 Karat Gold (916)</h2>
            <p className="text-xs text-[#78716C]">Government BIS Hallmarked</p>
            <div className="mt-4 pt-3 border-t border-[#F0ECE4]">
              <span className="text-3xl font-bold text-[#581825]">{formatINR(rates.rate22K)}</span>
              <span className="text-xs text-[#78716C] ml-1">/gram</span>
            </div>
            <p className="text-[11px] text-[#A8A29E] mt-2">
              10 Grams: <strong>{formatINR(rates.rate22K * 10)}</strong>
            </p>
          </div>

          {/* 24K Gold */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8E2D8] shadow-xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#9A7B4F] bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#E8E2D8]">
              99.9% Pure Bullion
            </span>
            <h2 className="font-serif text-lg font-bold text-[#1A1818] mt-3">24 Karat Gold (999)</h2>
            <p className="text-xs text-[#78716C]">Investment Coins & Bars</p>
            <div className="mt-4 pt-3 border-t border-[#F0ECE4]">
              <span className="text-3xl font-bold text-[#1A1818]">{formatINR(rates.rate24K)}</span>
              <span className="text-xs text-[#78716C] ml-1">/gram</span>
            </div>
            <p className="text-[11px] text-[#A8A29E] mt-2">
              10 Grams: <strong>{formatINR(rates.rate24K * 10)}</strong>
            </p>
          </div>

          {/* 18K Gold */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8E2D8] shadow-xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#78716C] bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#E8E2D8]">
              Diamond Setting Grade
            </span>
            <h2 className="font-serif text-lg font-bold text-[#1A1818] mt-3">18 Karat Gold (750)</h2>
            <p className="text-xs text-[#78716C]">Solitaires & High Jewellery</p>
            <div className="mt-4 pt-3 border-t border-[#F0ECE4]">
              <span className="text-3xl font-bold text-[#1A1818]">{formatINR(rates.rate18K)}</span>
              <span className="text-xs text-[#78716C] ml-1">/gram</span>
            </div>
            <p className="text-[11px] text-[#A8A29E] mt-2">
              10 Grams: <strong>{formatINR(rates.rate18K * 10)}</strong>
            </p>
          </div>

          {/* Silver */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8E2D8] shadow-xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#78716C] bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#E8E2D8]">
              92.5 Sterling Silver
            </span>
            <h2 className="font-serif text-lg font-bold text-[#1A1818] mt-3">Pure Silver</h2>
            <p className="text-xs text-[#78716C]">Pooja Thalis & Payals</p>
            <div className="mt-4 pt-3 border-t border-[#F0ECE4]">
              <span className="text-3xl font-bold text-[#1A1818]">{formatINR(rates.rateSilver)}</span>
              <span className="text-xs text-[#78716C] ml-1">/gram</span>
            </div>
            <p className="text-[11px] text-[#A8A29E] mt-2">
              1 Kilogram: <strong>{formatINR(rates.rateSilver * 1000)}</strong>
            </p>
          </div>
        </div>

        {/* Rate History Log Table */}
        <div className="bg-white rounded-2xl border border-[#E8E2D8] p-6 sm:p-8 shadow-xs mb-12">
          <div className="flex items-center justify-between pb-4 border-b border-[#F0ECE4] mb-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#1A1818]">Bullion Rate History & Audit</h3>
              <p className="text-xs text-[#78716C]">Official benchmark updates logged across our billing servers</p>
            </div>
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Real-Time Synced
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8E2D8] text-[#78716C] uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-2">Date & Time</th>
                  <th className="py-3 px-2">22K Gold (₹/g)</th>
                  <th className="py-3 px-2">24K Gold (₹/g)</th>
                  <th className="py-3 px-2">18K Gold (₹/g)</th>
                  <th className="py-3 px-2">Silver (₹/g)</th>
                  <th className="py-3 px-2">Benchmark Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0ECE4]">
                {history.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#FAF7F2]">
                    <td className="py-3 px-2 font-medium text-[#1A1818]">
                      {item.effectiveDate} ({item.effectiveTime})
                    </td>
                    <td className="py-3 px-2 font-bold text-[#581825]">{formatINR(item.rate22K)}</td>
                    <td className="py-3 px-2">{formatINR(item.rate24K)}</td>
                    <td className="py-3 px-2">{formatINR(item.rate18K)}</td>
                    <td className="py-3 px-2">{formatINR(item.rateSilver)}</td>
                    <td className="py-3 px-2 text-[#78716C]">{item.source || 'IBJA Spot'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Educational Gold Guide Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[#FAF7F2] p-8 rounded-2xl border border-[#E8E2D8]">
          <div className="space-y-4 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A7B4F]">
              Jewellery Knowledge
            </span>
            <h3 className="font-serif text-xl font-bold text-[#1A1818]">
              Understanding Gold Purities: 24K vs 22K vs 18K
            </h3>
            <p className="text-[#57534E] leading-relaxed">
              <strong>24 Karat (99.9% Pure):</strong> Pure gold is naturally soft and malleable. It is ideal for bullion bars and investment coins, but not suited for intricate durable wearable jewellery.
            </p>
            <p className="text-[#57534E] leading-relaxed">
              <strong>22 Karat (91.6% Pure):</strong> The golden standard for Indian jewellery. Alloyed with 8.4% copper or silver to impart structural strength while preserving the rich yellow hue. All our traditional haars, patlya, and mangalsutras are 22K BIS Hallmarked.
            </p>
            <p className="text-[#57534E] leading-relaxed">
              <strong>18 Karat (75.0% Pure):</strong> Provides high tensile grip, making it the preferred choice for diamond solitaires, prong settings, and rose/white gold styles.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E8E2D8] space-y-4 text-center">
            <Scale className="w-10 h-10 text-[#C5A880] mx-auto" />
            <h4 className="font-serif text-base font-bold text-[#1A1818]">Have Old Gold to Exchange?</h4>
            <p className="text-xs text-[#78716C]">
              Calculate how much your scrap jewellery is worth based on today's official rates.
            </p>
            <Link
              href="/sell-gold"
              className="inline-block px-6 py-2.5 rounded-full bg-[#581825] text-white text-xs font-bold hover:bg-[#380B12]"
            >
              Use Old Gold Calculator
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
