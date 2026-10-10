'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { useGoldRates } from '@/context/GoldRateContext';
import { useCart } from '@/context/CartContext';
import { formatINR } from '@/services/pricingEngine';

export default function FloatingBullionBar() {
  const pathname = usePathname();
  const { rates, setIsLiveModalOpen, isUpdatedRecently, isLiveModalOpen } = useGoldRates();
  const { isCartDrawerOpen } = useCart();

  if (isCartDrawerOpen || isLiveModalOpen || pathname?.startsWith('/admin') || pathname === '/login') {
    return null;
  }

  return (
    <div className="hidden md:flex fixed bottom-20 left-4 sm:left-6 z-40 select-none">
      <button
        onClick={() => setIsLiveModalOpen(true)}
        className={`group flex items-center gap-2.5 px-3.5 py-2 rounded-full text-xs font-semibold backdrop-blur-md transition-all duration-300 shadow-xl border ${
          isUpdatedRecently
            ? 'bg-emerald-950/90 text-emerald-200 border-emerald-400 scale-105 ring-2 ring-emerald-400/50 animate-pulse'
            : 'bg-[#380B12]/90 hover:bg-[#380B12] text-[#FAF7F2] border-[#C5A880]/40 hover:border-[#C5A880]'
        }`}
        title="View Live Gold & Silver Rates and Calculator"
        aria-label="Live Bullion Rates"
      >
        <span className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#DFCDAE]">
            Live:
          </span>
        </span>

        <span className="flex items-center gap-1 text-[11px] sm:text-xs">
          <span className="text-[#DFCDAE]/80">22K:</span>
          <strong className="text-white">{formatINR(rates.rate22K)}</strong>
        </span>

        <span className="text-white/30 hidden sm:inline">|</span>

        <span className="hidden sm:flex items-center gap-1 text-xs">
          <span className="text-[#DFCDAE]/80">Silver:</span>
          <strong className="text-white">{formatINR(rates.rateSilver)}</strong>
        </span>

        <span className="ml-0.5 px-1.5 py-0.5 text-[9px] uppercase font-bold rounded-md bg-[#581825] group-hover:bg-[#7E2638] text-[#DFCDAE] border border-[#C5A880]/30 transition-colors">
          Rates & Calc ↗
        </span>
      </button>
    </div>
  );
}
