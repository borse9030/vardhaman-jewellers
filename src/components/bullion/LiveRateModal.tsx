'use client';

import React, { useState } from 'react';
import {
  X,
  TrendingUp,
  TrendingDown,
  Scale,
  Sparkles,
  Zap,
  Clock,
  ShieldCheck,
  RefreshCw,
  Calculator,
  Sliders,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { useGoldRates } from '@/context/GoldRateContext';
import { formatINR } from '@/services/pricingEngine';

export default function LiveRateModal() {
  const {
    rates,
    isLiveModalOpen,
    setIsLiveModalOpen,
    simulateRateDelta,
    updateRates,
    isAutoMarketSync,
    setIsAutoMarketSync,
    lastChangedTimestamp,
  } = useGoldRates();

  // Calculator State
  const [calcMetal, setCalcMetal] = useState<'22K' | '24K' | '18K' | '14K' | 'Silver'>('22K');
  const [calcWeight, setCalcWeight] = useState<number>(10);
  const [calcMakingType, setCalcMakingType] = useState<'percentage' | 'perGram'>('percentage');
  const [calcMakingValue, setCalcMakingValue] = useState<number>(12); // 12% or ₹450/g

  // Quick edit inputs
  const [showAdminQuickEdit, setShowAdminQuickEdit] = useState<boolean>(false);
  const [custom22K, setCustom22K] = useState<number>(rates.rate22K);
  const [custom24K, setCustom24K] = useState<number>(rates.rate24K);
  const [custom18K, setCustom18K] = useState<number>(rates.rate18K);
  const [customSilver, setCustomSilver] = useState<number>(rates.rateSilver);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [applySuccess, setApplySuccess] = useState<boolean>(false);

  if (!isLiveModalOpen) return null;

  // Compute calculated values
  const getMetalRate = (metal: string) => {
    switch (metal) {
      case '24K':
        return rates.rate24K;
      case '22K':
        return rates.rate22K;
      case '18K':
        return rates.rate18K;
      case '14K':
        return rates.rate14K || Math.round((rates.rate24K * 14) / 24);
      case 'Silver':
        return rates.rateSilver;
      default:
        return rates.rate22K;
    }
  };

  const selectedRate = getMetalRate(calcMetal);
  const metalValue = Math.round(calcWeight * selectedRate);
  const makingCharges =
    calcMakingType === 'percentage'
      ? Math.round((metalValue * calcMakingValue) / 100)
      : Math.round(calcMakingValue * calcWeight);
  const subtotal = metalValue + makingCharges;
  const gstAmount = Math.round((subtotal * 3) / 100);
  const totalEstimatedPrice = subtotal + gstAmount;

  const handleApplyCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsApplying(true);
    try {
      await updateRates(
        {
          rate22K: Number(custom22K),
          rate24K: Number(custom24K),
          rate18K: Number(custom18K),
          rateSilver: Number(customSilver),
        },
        'Quick Rate Controller'
      );
      setApplySuccess(true);
      setTimeout(() => setApplySuccess(false), 3000);
    } finally {
      setIsApplying(false);
    }
  };

  const handleDelta = async (deltas: { delta22K?: number; deltaSilver?: number }) => {
    setIsApplying(true);
    try {
      await simulateRateDelta(deltas);
      setApplySuccess(true);
      setTimeout(() => setApplySuccess(false), 2000);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={() => setIsLiveModalOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-[#E8E2D8] overflow-hidden z-10 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="bg-[#380B12] text-white p-4 sm:p-6 border-b border-[#581825] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-[#581825] border border-[#C5A880]/40 flex items-center justify-center text-[#DFCDAE] shadow-inner">
              <Sparkles className="w-5 h-5 text-[#C5A880]" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg sm:text-xl font-bold text-[#FAF7F2]">
                  Live Bullion Rates & Instant Pricing Engine
                </h2>
                <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-[#DFCDAE]/80 mt-0.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#C5A880]" />
                Official India Bullion benchmark • Updated {rates.effectiveTime} Today
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsLiveModalOpen(false)}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Rate Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* 22K Gold */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border-2 border-[#581825] shadow-xs relative overflow-hidden flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#581825] bg-white px-2 py-0.5 rounded border border-[#E8E2D8]">
                    Jewellery Standard
                  </span>
                  <h3 className="font-serif text-base font-bold text-[#1A1818] mt-2">22 Karat (916)</h3>
                </div>
                {rates.change22K !== undefined && rates.change22K !== 0 && (
                  <span
                    className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      rates.change22K > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {rates.change22K > 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                    {rates.change22K > 0 ? '+' : ''}₹{rates.change22K}
                  </span>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-[#E8E2D8]">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-[#581825]">{formatINR(rates.rate22K)}</span>
                  <span className="text-xs text-[#78716C]">/g</span>
                </div>
                <div className="text-[10px] text-[#78716C] mt-1 space-y-0.5">
                  <div className="flex justify-between">
                    <span>1 Sovereign (8g):</span>
                    <strong>{formatINR(rates.rate22K * 8)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>10 Grams:</span>
                    <strong>{formatINR(rates.rate22K * 10)}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* 24K Gold */}
            <div className="p-4 rounded-2xl bg-white border border-[#E8E2D8] shadow-xs flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A7B4F] bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#E8E2D8]">
                    99.9% Pure Bullion
                  </span>
                  <h3 className="font-serif text-base font-bold text-[#1A1818] mt-2">24 Karat (999)</h3>
                </div>
                {rates.change24K !== undefined && rates.change24K !== 0 && (
                  <span
                    className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      rates.change24K > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {rates.change24K > 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                    {rates.change24K > 0 ? '+' : ''}₹{rates.change24K}
                  </span>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-[#F0ECE4]">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-[#1A1818]">{formatINR(rates.rate24K)}</span>
                  <span className="text-xs text-[#78716C]">/g</span>
                </div>
                <div className="text-[10px] text-[#78716C] mt-1 space-y-0.5">
                  <div className="flex justify-between">
                    <span>8 Grams:</span>
                    <strong>{formatINR(rates.rate24K * 8)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>10 Grams:</span>
                    <strong>{formatINR(rates.rate24K * 10)}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* 18K Gold */}
            <div className="p-4 rounded-2xl bg-white border border-[#E8E2D8] shadow-xs flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C] bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#E8E2D8]">
                    Diamond Grade
                  </span>
                  <h3 className="font-serif text-base font-bold text-[#1A1818] mt-2">18 Karat (750)</h3>
                </div>
                {rates.change18K !== undefined && rates.change18K !== 0 && (
                  <span
                    className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      rates.change18K > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {rates.change18K > 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                    {rates.change18K > 0 ? '+' : ''}₹{rates.change18K}
                  </span>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-[#F0ECE4]">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-[#1A1818]">{formatINR(rates.rate18K)}</span>
                  <span className="text-xs text-[#78716C]">/g</span>
                </div>
                <div className="text-[10px] text-[#78716C] mt-1 space-y-0.5">
                  <div className="flex justify-between">
                    <span>10 Grams:</span>
                    <strong>{formatINR(rates.rate18K * 10)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>14K (585) rate:</span>
                    <strong>{formatINR(rates.rate14K || Math.round((rates.rate24K * 14) / 24))}/g</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* 925 Sterling Silver */}
            <div className="p-4 rounded-2xl bg-white border border-[#E8E2D8] shadow-xs flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C] bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#E8E2D8]">
                    Pure Sterling
                  </span>
                  <h3 className="font-serif text-base font-bold text-[#1A1818] mt-2">Silver (925 / 999)</h3>
                </div>
                {rates.changeSilver !== undefined && rates.changeSilver !== 0 && (
                  <span
                    className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      rates.changeSilver > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {rates.changeSilver > 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                    {rates.changeSilver > 0 ? '+' : ''}₹{rates.changeSilver}
                  </span>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-[#F0ECE4]">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-[#1A1818]">{formatINR(rates.rateSilver)}</span>
                  <span className="text-xs text-[#78716C]">/g</span>
                </div>
                <div className="text-[10px] text-[#78716C] mt-1 space-y-0.5">
                  <div className="flex justify-between">
                    <span>10 Grams:</span>
                    <strong>{formatINR(rates.rateSilver * 10)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>1 Kilogram:</span>
                    <strong className="text-[#581825]">{formatINR(rates.rateSilver * 1000)}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Live Gold & Silver Jewellery Price Calculator */}
          <div className="bg-[#FAF7F2] p-5 sm:p-6 rounded-2xl border border-[#E8E2D8] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E2D8] pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-[#9A7B4F]" />
                <h3 className="font-serif text-sm sm:text-base font-bold text-[#1A1818]">
                  Live Jewellery Price Estimator (Transparent Indian Standard)
                </h3>
              </div>
              <span className="text-[11px] text-[#78716C]">
                Formula: Metal Weight × Live Rate + Making + 3% GST
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              {/* Left Controls */}
              <div className="md:col-span-7 space-y-3.5 text-xs">
                {/* Purity selector */}
                <div>
                  <label className="block text-[#57534E] font-medium mb-1">Select Metal / Purity</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {(['22K', '24K', '18K', '14K', 'Silver'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setCalcMetal(m)}
                        className={`py-2 rounded-xl font-semibold border text-center transition-all ${
                          calcMetal === m
                            ? 'bg-[#581825] text-white border-[#581825] shadow-xs'
                            : 'bg-white text-[#1A1818] border-[#E8E2D8] hover:bg-[#FAF7F2]'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Weight slider & input */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[#57534E] font-medium">Net Metal Weight (Grams)</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={calcWeight}
                        onChange={(e) => setCalcWeight(Math.max(0.1, parseFloat(e.target.value) || 0))}
                        className="w-20 px-2 py-1 text-right font-bold bg-white rounded-lg border border-[#E8E2D8] text-sm text-[#1A1818]"
                      />
                      <span className="text-[#78716C]">grams</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    step="0.5"
                    value={calcWeight}
                    onChange={(e) => setCalcWeight(parseFloat(e.target.value))}
                    className="w-full accent-[#581825] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#A8A29E] mt-0.5">
                    <span>1g (Lightweight)</span>
                    <span>10g</span>
                    <span>50g (Bridal Haar)</span>
                    <span>100g</span>
                  </div>
                </div>

                {/* Making charges */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#57534E] font-medium mb-1">Making Charge Type</label>
                    <select
                      value={calcMakingType}
                      onChange={(e) => setCalcMakingType(e.target.value as 'percentage' | 'perGram')}
                      className="w-full p-2 bg-white rounded-xl border border-[#E8E2D8] text-xs font-medium"
                    >
                      <option value="percentage">Percentage of Metal (%)</option>
                      <option value="perGram">Per Gram Rate (₹/g)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#57534E] font-medium mb-1">
                      Making Charge Value ({calcMakingType === 'percentage' ? '%' : '₹/g'})
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={calcMakingValue}
                      onChange={(e) => setCalcMakingValue(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full p-2 bg-white rounded-xl border border-[#E8E2D8] text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Right Output Card */}
              <div className="md:col-span-5 bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-sm space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A7B4F]">
                  Real-Time Calculation
                </span>

                <div className="space-y-1.5 text-xs text-[#57534E] border-b border-[#F0ECE4] pb-3">
                  <div className="flex justify-between">
                    <span>
                      {calcMetal === 'Silver' ? 'Silver' : 'Gold'} Value ({calcWeight}g @ {formatINR(selectedRate)}):
                    </span>
                    <strong className="text-[#1A1818]">{formatINR(metalValue)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Making Charges:</span>
                    <strong className="text-[#1A1818]">{formatINR(makingCharges)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (3% Indian Standard):</span>
                    <strong className="text-[#1A1818]">{formatINR(gstAmount)}</strong>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-semibold text-[#1A1818]">Estimated Price:</span>
                    <span className="text-2xl font-bold text-[#581825]">
                      {formatINR(totalEstimatedPrice)}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#A8A29E] mt-0.5">
                    Automatically updates if market gold or silver rates shift.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Testing & Instant Rate Adjuster Accordion */}
          <div className="border border-[#E8E2D8] rounded-2xl overflow-hidden bg-white">
            <button
              onClick={() => setShowAdminQuickEdit(!showAdminQuickEdit)}
              className="w-full px-5 py-3.5 bg-[#FAF7F2] hover:bg-[#F4EDE4] flex items-center justify-between text-xs font-semibold text-[#1A1818] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#9A7B4F]" />
                <span>Instant Live Rate Controller & Tester (Test Real-Time Rate Changes Across Website)</span>
              </div>
              <span className="text-[#9A7B4F] text-[11px] underline">
                {showAdminQuickEdit ? 'Collapse' : 'Expand Controller'}
              </span>
            </button>

            {showAdminQuickEdit && (
              <div className="p-5 space-y-4 border-t border-[#E8E2D8] text-xs">
                <p className="text-[#78716C] text-xs">
                  Click any quick change button or type a custom rate below. When you click, the gold and silver rates
                  will <strong>INSTANTLY update everywhere across the storefront</strong>, recalculating all product prices,
                  cart items, and header tickers with zero page refresh!
                </p>

                {applySuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Rates successfully updated! All storefront products and cart totals just recalculated in real-time.
                    </span>
                  </div>
                )}

                {/* 1-Click Delta Buttons */}
                <div>
                  <label className="block text-[#57534E] font-semibold mb-2">
                    1-Click Instant Adjustments:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={isApplying}
                      onClick={() => handleDelta({ delta22K: 25 })}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold text-xs transition-all active:scale-95"
                    >
                      ▲ +₹25 on 22K Gold
                    </button>
                    <button
                      type="button"
                      disabled={isApplying}
                      onClick={() => handleDelta({ delta22K: 50 })}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold text-xs transition-all active:scale-95"
                    >
                      ▲ +₹50 on 22K Gold
                    </button>
                    <button
                      type="button"
                      disabled={isApplying}
                      onClick={() => handleDelta({ delta22K: -25 })}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 font-semibold text-xs transition-all active:scale-95"
                    >
                      ▼ -₹25 on 22K Gold
                    </button>
                    <button
                      type="button"
                      disabled={isApplying}
                      onClick={() => handleDelta({ deltaSilver: 2 })}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 font-semibold text-xs transition-all active:scale-95"
                    >
                      ▲ +₹2 on Silver
                    </button>
                    <button
                      type="button"
                      disabled={isApplying}
                      onClick={() => handleDelta({ deltaSilver: -2 })}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 font-semibold text-xs transition-all active:scale-95"
                    >
                      ▼ -₹2 on Silver
                    </button>
                  </div>
                </div>

                {/* Auto Market Ticks Simulation Toggle */}
                <div className="flex items-center justify-between p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E8E2D8]">
                  <div>
                    <span className="font-semibold text-[#1A1818] block">
                      Auto-Market Fluctuation Simulation (Every 25s)
                    </span>
                    <span className="text-[11px] text-[#78716C]">
                      Simulates realistic live trading ticks during active bullion market hours.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAutoMarketSync(!isAutoMarketSync)}
                    className={`px-4 py-1.5 rounded-full font-bold text-xs transition-all ${
                      isAutoMarketSync
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-[#57534E] border border-[#E8E2D8]'
                    }`}
                  >
                    {isAutoMarketSync ? 'Active (Tick ON)' : 'Turn ON'}
                  </button>
                </div>

                {/* Custom Rates Form */}
                <form onSubmit={handleApplyCustom} className="space-y-3 pt-2">
                  <span className="font-semibold text-[#1A1818] block">Set Exact Custom Rates (₹/gram):</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[11px] text-[#57534E] mb-1 block">22K Gold</label>
                      <input
                        type="number"
                        value={custom22K}
                        onChange={(e) => setCustom22K(parseFloat(e.target.value) || 0)}
                        className="w-full p-2 bg-white rounded-xl border border-[#E8E2D8] font-bold text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#57534E] mb-1 block">24K Gold</label>
                      <input
                        type="number"
                        value={custom24K}
                        onChange={(e) => setCustom24K(parseFloat(e.target.value) || 0)}
                        className="w-full p-2 bg-white rounded-xl border border-[#E8E2D8] font-bold text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#57534E] mb-1 block">18K Gold</label>
                      <input
                        type="number"
                        value={custom18K}
                        onChange={(e) => setCustom18K(parseFloat(e.target.value) || 0)}
                        className="w-full p-2 bg-white rounded-xl border border-[#E8E2D8] font-bold text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#57534E] mb-1 block">925 Silver</label>
                      <input
                        type="number"
                        step="0.1"
                        value={customSilver}
                        onChange={(e) => setCustomSilver(parseFloat(e.target.value) || 0)}
                        className="w-full p-2 bg-white rounded-xl border border-[#E8E2D8] font-bold text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isApplying}
                    className="px-5 py-2.5 rounded-xl bg-[#581825] hover:bg-[#380B12] text-white font-semibold text-xs transition-all flex items-center gap-2 active:scale-95"
                  >
                    <Zap className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>{isApplying ? 'Applying Rates Everywhere...' : 'Apply Live Rates Instantly'}</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#FAF7F2] px-6 py-3 border-t border-[#E8E2D8] flex items-center justify-between text-xs text-[#78716C]">
          <span className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#581825]" />
            100% BIS Hallmarked Purity Guaranteed by Vardhaman Jewellers
          </span>
          <button
            onClick={() => setIsLiveModalOpen(false)}
            className="px-4 py-1.5 bg-white hover:bg-gray-100 border border-[#E8E2D8] text-[#1A1818] rounded-xl font-medium text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
