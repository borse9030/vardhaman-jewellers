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
  const { rates, isUpdatedRecently, setIsLiveModalOpen, simulateRateDelta } = useGoldRates();
  const [history, setHistory] = useState<GoldRateHistoryItem[]>([]);

  useEffect(() => {
    getGoldRateHistory().then((data) => setHistory(data));
  }, [rates]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto px-3 sm:px-8 py-8 sm:py-16 pb-24 lg:pb-16">
        {/* Page Title */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#9A7B4F]">
            Official Bullion Benchmark
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#1A1818] mt-1.5 sm:mt-2">
            Today’s Live Gold & Silver Rates
          </h1>
          <p className="text-xs sm:text-sm text-[#78716C] mt-1.5 sm:mt-2 leading-relaxed">
            Updated live from the India Bullion & Jewellers Association (IBJA) spot market. Accurate pricing applied transparently to all Vardhaman Jewellers creations.
          </p>
        </div>

        {/* Interactive Toolbar for Live Rate Calculator & Testing */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-4 rounded-2xl bg-white border border-[#E8E2D8] shadow-xs">
          <div className="flex items-center gap-2 text-xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-[#380B12]">Real-Time Bullion Sync:</span>
            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Active • Updated {rates.effectiveTime}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLiveModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#581825] hover:bg-[#380B12] text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Scale className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Open Jewellery Calculator & Rate Changer</span>
            </button>
          </div>
        </div>

        {/* Live Rates Cards */}
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5 mb-8 sm:mb-12 transition-all duration-500 p-2 rounded-3xl ${
          isUpdatedRecently ? 'bg-emerald-50/50 ring-2 ring-emerald-400/50 shadow-lg' : ''
        }`}>
          {/* 22K Gold */}
          <div className="bg-white p-3.5 sm:p-6 rounded-2xl border-2 border-[#581825] shadow-md relative overflow-hidden flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-[#581825] bg-[#FAF7F2] px-1.5 py-0.5 rounded border border-[#E8E2D8] line-clamp-1">
                  Jewellery Benchmark
                </span>
                <h2 className="font-serif text-sm sm:text-lg font-bold text-[#1A1818] mt-2 sm:mt-3">22 Karat (916)</h2>
                <p className="text-[11px] sm:text-xs text-[#78716C]">BIS Hallmarked Standard</p>
              </div>
              {rates.change22K !== undefined && rates.change22K !== 0 && (
                <span
                  className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    rates.change22K > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {rates.change22K > 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : null}
                  {rates.change22K > 0 ? '+' : ''}₹{rates.change22K}
                </span>
              )}
            </div>
            <div>
              <div className="mt-3 pt-2 sm:mt-4 sm:pt-3 border-t border-[#F0ECE4]">
                <span className="text-xl sm:text-3xl font-bold text-[#581825]">{formatINR(rates.rate22K)}</span>
                <span className="text-[10px] sm:text-xs text-[#78716C] ml-1">/g</span>
              </div>
              <div className="text-[10px] sm:text-[11px] text-[#A8A29E] mt-1 sm:mt-2 space-y-0.5">
                <div className="flex justify-between">
                  <span>8g (1 Pavan):</span>
                  <strong className="text-[#1A1818]">{formatINR(rates.rate22K * 8)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>10g:</span>
                  <strong className="text-[#1A1818]">{formatINR(rates.rate22K * 10)}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 24K Gold */}
          <div className="bg-white p-3.5 sm:p-6 rounded-2xl border border-[#E8E2D8] shadow-xs flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-[#9A7B4F] bg-[#FAF7F2] px-1.5 py-0.5 rounded border border-[#E8E2D8] line-clamp-1">
                  99.9% Pure Bullion
                </span>
                <h2 className="font-serif text-sm sm:text-lg font-bold text-[#1A1818] mt-2 sm:mt-3">24 Karat (999)</h2>
                <p className="text-[11px] sm:text-xs text-[#78716C]">Investment Coins & Bars</p>
              </div>
              {rates.change24K !== undefined && rates.change24K !== 0 && (
                <span
                  className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    rates.change24K > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {rates.change24K > 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : null}
                  {rates.change24K > 0 ? '+' : ''}₹{rates.change24K}
                </span>
              )}
            </div>
            <div>
              <div className="mt-3 pt-2 sm:mt-4 sm:pt-3 border-t border-[#F0ECE4]">
                <span className="text-xl sm:text-3xl font-bold text-[#1A1818]">{formatINR(rates.rate24K)}</span>
                <span className="text-[10px] sm:text-xs text-[#78716C] ml-1">/g</span>
              </div>
              <div className="text-[10px] sm:text-[11px] text-[#A8A29E] mt-1 sm:mt-2 space-y-0.5">
                <div className="flex justify-between">
                  <span>8g:</span>
                  <strong className="text-[#1A1818]">{formatINR(rates.rate24K * 8)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>10g:</span>
                  <strong className="text-[#1A1818]">{formatINR(rates.rate24K * 10)}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 18K Gold */}
          <div className="bg-white p-3.5 sm:p-6 rounded-2xl border border-[#E8E2D8] shadow-xs flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-[#78716C] bg-[#FAF7F2] px-1.5 py-0.5 rounded border border-[#E8E2D8] line-clamp-1">
                  Diamond Grade
                </span>
                <h2 className="font-serif text-sm sm:text-lg font-bold text-[#1A1818] mt-2 sm:mt-3">18 Karat (750)</h2>
                <p className="text-[11px] sm:text-xs text-[#78716C]">Solitaires & Modern</p>
              </div>
              {rates.change18K !== undefined && rates.change18K !== 0 && (
                <span
                  className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    rates.change18K > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {rates.change18K > 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : null}
                  {rates.change18K > 0 ? '+' : ''}₹{rates.change18K}
                </span>
              )}
            </div>
            <div>
              <div className="mt-3 pt-2 sm:mt-4 sm:pt-3 border-t border-[#F0ECE4]">
                <span className="text-xl sm:text-3xl font-bold text-[#1A1818]">{formatINR(rates.rate18K)}</span>
                <span className="text-[10px] sm:text-xs text-[#78716C] ml-1">/g</span>
              </div>
              <div className="text-[10px] sm:text-[11px] text-[#A8A29E] mt-1 sm:mt-2 space-y-0.5">
                <div className="flex justify-between">
                  <span>10g:</span>
                  <strong className="text-[#1A1818]">{formatINR(rates.rate18K * 10)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>14K (585) rate:</span>
                  <strong className="text-[#1A1818]">{formatINR(rates.rate14K || Math.round((rates.rate24K * 14) / 24))}/g</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Silver */}
          <div className="bg-white p-3.5 sm:p-6 rounded-2xl border border-[#E8E2D8] shadow-xs flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-[#78716C] bg-[#FAF7F2] px-1.5 py-0.5 rounded border border-[#E8E2D8] line-clamp-1">
                  92.5 Sterling
                </span>
                <h2 className="font-serif text-sm sm:text-lg font-bold text-[#1A1818] mt-2 sm:mt-3">Pure Silver</h2>
                <p className="text-[11px] sm:text-xs text-[#78716C]">Pooja Articles & Gifts</p>
              </div>
              {rates.changeSilver !== undefined && rates.changeSilver !== 0 && (
                <span
                  className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    rates.changeSilver > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {rates.changeSilver > 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : null}
                  {rates.changeSilver > 0 ? '+' : ''}₹{rates.changeSilver}
                </span>
              )}
            </div>
            <div>
              <div className="mt-3 pt-2 sm:mt-4 sm:pt-3 border-t border-[#F0ECE4]">
                <span className="text-xl sm:text-3xl font-bold text-[#1A1818]">{formatINR(rates.rateSilver)}</span>
                <span className="text-[10px] sm:text-xs text-[#78716C] ml-1">/g</span>
              </div>
              <div className="text-[10px] sm:text-[11px] text-[#A8A29E] mt-1 sm:mt-2 space-y-0.5">
                <div className="flex justify-between">
                  <span>10g:</span>
                  <strong className="text-[#1A1818]">{formatINR(rates.rateSilver * 10)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>1kg:</span>
                  <strong className="text-[#581825]">{formatINR(rates.rateSilver * 1000)}</strong>
                </div>
              </div>
            </div>
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
