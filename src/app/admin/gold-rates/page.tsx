'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  Save,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useGoldRates } from '@/context/GoldRateContext';
import { updateGoldRates, getGoldRateHistory } from '@/lib/db/goldRateService';
import { addAuditLog } from '@/lib/db/auditService';
import { formatINR } from '@/services/pricingEngine';
import { GoldRateHistoryItem } from '@/types';

export default function AdminGoldRatesPage() {
  const { rates, refreshRates } = useGoldRates();

  const [rate24K, setRate24K] = useState(rates.rate24K);
  const [rate22K, setRate22K] = useState(rates.rate22K);
  const [rate18K, setRate18K] = useState(rates.rate18K);
  const [rateSilver, setRateSilver] = useState(rates.rateSilver);
  const [source, setSource] = useState('IBJA (India Bullion & Jewellers Association)');
  const [notes, setNotes] = useState('Morning spot market opening benchmark');

  const [history, setHistory] = useState<GoldRateHistoryItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  useEffect(() => {
    setRate24K(rates.rate24K);
    setRate22K(rates.rate22K);
    setRate18K(rates.rate18K);
    setRateSilver(rates.rateSilver);
    getGoldRateHistory().then((h) => setHistory(h));
  }, [rates]);

  const handleSaveRates = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(false);

    try {
      const updated = await updateGoldRates(
        {
          rate24K: Number(rate24K),
          rate22K: Number(rate22K),
          rate18K: Number(rate18K),
          rateSilver: Number(rateSilver),
          source,
          notes,
        },
        'jaynam27@gmail.com'
      );

      await addAuditLog(
        'Gold Rate Update',
        'GoldRate',
        'jaynam27@gmail.com',
        `Updated 24K: ₹${rate24K}, 22K: ₹${rate22K}, 18K: ₹${rate18K}, Silver: ₹${rateSilver}/g`
      );

      await refreshRates();
      const updatedHist = await getGoldRateHistory();
      setHistory(updatedHist);
      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 4000);
    } catch (err) {
      console.error('Failed to update rates:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">
            Centralized Bullion Rate Manager
          </h1>
          <p className="text-xs text-[#A8A29E] mt-0.5">
            Configure live gold and silver rates per gram. All dynamically calculated jewellery products update automatically.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#A8A29E]">Active Benchmark:</span>
          <span className="text-emerald-400 font-bold bg-[#2B2625] px-3 py-1 rounded-full border border-white/10">
            {rates.effectiveTime} Today
          </span>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            Gold rates updated successfully! Real-time synchronization event triggered across all storefront pages.
          </span>
        </div>
      )}

      {/* Main Rate Edit Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Inputs */}
        <div className="lg:col-span-7 bg-[#171515] p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6">
          <h2 className="font-serif text-base font-bold text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#C5A880]" />
              Set New Spot Rates (₹ Per Gram)
            </span>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full font-sans">
              Instant Sync Across Site
            </span>
          </h2>

          {/* Quick Adjustment Shortcuts */}
          <div className="p-3 bg-[#2B2625] rounded-xl border border-white/5 space-y-2">
            <span className="text-[11px] text-[#A8A29E] font-medium block">
              1-Click Quick Adjusters (auto-fills below):
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setRate22K((prev) => prev + 25);
                  setRate24K((prev) => prev + 27);
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold"
              >
                +₹25 Gold
              </button>
              <button
                type="button"
                onClick={() => {
                  setRate22K((prev) => prev + 50);
                  setRate24K((prev) => prev + 55);
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold"
              >
                +₹50 Gold
              </button>
              <button
                type="button"
                onClick={() => {
                  setRate22K((prev) => prev - 25);
                  setRate24K((prev) => prev - 27);
                }}
                className="px-2.5 py-1 rounded-lg bg-rose-900/40 hover:bg-rose-800/60 text-rose-300 border border-rose-500/30 text-[11px] font-semibold"
              >
                -₹25 Gold
              </button>
              <button
                type="button"
                onClick={() => setRateSilver((prev) => Math.round((prev + 2) * 10) / 10)}
                className="px-2.5 py-1 rounded-lg bg-blue-900/40 hover:bg-blue-800/60 text-blue-300 border border-blue-500/30 text-[11px] font-semibold"
              >
                +₹2 Silver
              </button>
              <button
                type="button"
                onClick={() => setRateSilver((prev) => Math.round((prev - 2) * 10) / 10)}
                className="px-2.5 py-1 rounded-lg bg-rose-900/40 hover:bg-rose-800/60 text-rose-300 border border-rose-500/30 text-[11px] font-semibold"
              >
                -₹2 Silver
              </button>
            </div>
          </div>

          <form onSubmit={handleSaveRates} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[#D6D3D1] font-semibold mb-1">
                  22K Gold Rate (916) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    value={rate22K}
                    onChange={(e) => setRate22K(parseFloat(e.target.value))}
                    className="w-full bg-[#2B2625] p-3 pl-8 rounded-xl border border-white/10 text-white font-bold text-base focus:outline-none focus:border-[#C5A880]"
                  />
                  <span className="text-white absolute left-3 top-3 text-sm">₹</span>
                </div>
                <span className="text-[10px] text-[#A8A29E] mt-1 block">Standard Jewellery Purity</span>
              </div>

              <div>
                <label className="block text-[#D6D3D1] font-semibold mb-1">
                  24K Gold Rate (999) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    value={rate24K}
                    onChange={(e) => setRate24K(parseFloat(e.target.value))}
                    className="w-full bg-[#2B2625] p-3 pl-8 rounded-xl border border-white/10 text-white font-bold text-base focus:outline-none focus:border-[#C5A880]"
                  />
                  <span className="text-white absolute left-3 top-3 text-sm">₹</span>
                </div>
                <span className="text-[10px] text-[#A8A29E] mt-1 block">Pure Bullion Coins & Bars</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[#D6D3D1] font-semibold mb-1">
                  18K Gold Rate (750) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    value={rate18K}
                    onChange={(e) => setRate18K(parseFloat(e.target.value))}
                    className="w-full bg-[#2B2625] p-3 pl-8 rounded-xl border border-white/10 text-white font-bold text-base focus:outline-none focus:border-[#C5A880]"
                  />
                  <span className="text-white absolute left-3 top-3 text-sm">₹</span>
                </div>
                <span className="text-[10px] text-[#A8A29E] mt-1 block">Natural Diamond Settings</span>
              </div>

              <div>
                <label className="block text-[#D6D3D1] font-semibold mb-1">
                  Silver Rate (925) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    value={rateSilver}
                    onChange={(e) => setRateSilver(parseFloat(e.target.value))}
                    className="w-full bg-[#2B2625] p-3 pl-8 rounded-xl border border-white/10 text-white font-bold text-base focus:outline-none focus:border-[#C5A880]"
                  />
                  <span className="text-white absolute left-3 top-3 text-sm">₹</span>
                </div>
                <span className="text-[10px] text-[#A8A29E] mt-1 block">Sterling Silver Articles</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-[#D6D3D1] font-semibold mb-1">Benchmark Source</label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full bg-[#2B2625] p-2.5 rounded-xl border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block text-[#D6D3D1] font-semibold mb-1">Internal Log Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#2B2625] p-2.5 rounded-xl border border-white/10 text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 rounded-xl bg-[#581825] hover:bg-[#7E2638] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg flex items-center justify-center gap-2 mt-4"
            >
              <Save className="w-4 h-4 text-[#C5A880]" />
              <span>{saving ? 'Synchronizing Rates Across Website...' : 'Publish & Sync New Rates'}</span>
            </button>
          </form>
        </div>

        {/* Live Calculation Impact Simulator */}
        <div className="lg:col-span-5 bg-[#171515] p-6 sm:p-8 rounded-2xl border border-white/10 space-y-4 text-xs">
          <h2 className="font-serif text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Live Price Impact Simulator
          </h2>
          <p className="text-[#A8A29E]">
            How updating 22K rate to {formatINR(rate22K)}/g alters popular pieces:
          </p>

          <div className="space-y-3 pt-2">
            <div className="p-3.5 rounded-xl bg-[#2B2625] border border-white/5 space-y-1">
              <div className="flex justify-between font-bold text-white">
                <span>46.2g Temple Haar (22K)</span>
                <span className="text-[#C5A880]">{formatINR(Math.round(46.2 * rate22K * 1.15 * 1.03))}</span>
              </div>
              <p className="text-[11px] text-[#A8A29E]">
                Gold Value: {formatINR(Math.round(46.2 * rate22K))} + Making & GST
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#2B2625] border border-white/5 space-y-1">
              <div className="flex justify-between font-bold text-white">
                <span>32.5g Patlya Bangles (Pair, 22K)</span>
                <span className="text-[#C5A880]">{formatINR(Math.round(32.5 * rate22K * 1.12 * 1.03))}</span>
              </div>
              <p className="text-[11px] text-[#A8A29E]">
                Gold Value: {formatINR(Math.round(32.5 * rate22K))} + Making & GST
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#2B2625] border border-white/5 space-y-1">
              <div className="flex justify-between font-bold text-white">
                <span>12.2g Traditional Wati Mangalsutra (22K)</span>
                <span className="text-[#C5A880]">{formatINR(Math.round(12.2 * rate22K * 1.14 * 1.03))}</span>
              </div>
              <p className="text-[11px] text-[#A8A29E]">
                Gold Value: {formatINR(Math.round(12.2 * rate22K))} + Making & GST
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Audit Trail Table */}
      <div className="bg-[#171515] p-6 rounded-2xl border border-white/10 space-y-4">
        <h3 className="font-serif text-base font-bold text-white">
          Rate History & Audit Trail (IBJA Spot)
        </h3>

        <div className="overflow-x-auto text-xs text-[#E8E2D8]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-[#A8A29E] uppercase text-[10px]">
                <th className="py-2.5 px-3">Effective Date & Time</th>
                <th className="py-2.5 px-3">22K Gold</th>
                <th className="py-2.5 px-3">24K Gold</th>
                <th className="py-2.5 px-3">18K Gold</th>
                <th className="py-2.5 px-3">Silver</th>
                <th className="py-2.5 px-3">Updated By</th>
                <th className="py-2.5 px-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {history.map((h, i) => (
                <tr key={i}>
                  <td className="py-2.5 px-3 font-medium text-white">{h.effectiveDate} {h.effectiveTime}</td>
                  <td className="py-2.5 px-3 font-bold text-[#C5A880]">{formatINR(h.rate22K)}/g</td>
                  <td className="py-2.5 px-3 font-bold">{formatINR(h.rate24K)}/g</td>
                  <td className="py-2.5 px-3">{formatINR(h.rate18K)}/g</td>
                  <td className="py-2.5 px-3">{formatINR(h.rateSilver)}/g</td>
                  <td className="py-2.5 px-3 text-[#A8A29E]">{h.updatedBy}</td>
                  <td className="py-2.5 px-3 text-[#A8A29E]">{h.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
