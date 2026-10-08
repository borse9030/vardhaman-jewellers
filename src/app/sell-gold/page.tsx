'use client';

import React, { useState } from 'react';
import {
  Scale,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Clock,
  ArrowRight,
  Upload,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useGoldRates } from '@/context/GoldRateContext';
import { calculateOldGoldValuation, formatINR } from '@/services/pricingEngine';
import { createGoldEnquiry } from '@/lib/db/enquiryService';
import { GoldPurity } from '@/types';

export default function SellGoldPage() {
  const { rates } = useGoldRates();

  // Form state
  const [weight, setWeight] = useState<number>(20);
  const [purity, setPurity] = useState<GoldPurity>('22K');
  const [itemType, setItemType] = useState('Old Gold Bangles & Chains');
  const [condition, setCondition] = useState<'Excellent' | 'Good' | 'Damaged/Scrap' | 'Heirloom'>('Good');
  const [approxAge, setApproxAge] = useState('10 - 15 Years');
  const [storePreference, setStorePreference] = useState('Jalgaon Flagship Store');

  // Customer Contact State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedEnquiryNumber, setSubmittedEnquiryNumber] = useState<string | null>(null);

  // Valuation Calculation
  const valuation = calculateOldGoldValuation(weight, purity, condition, rates);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) return;

    setIsSubmitting(true);
    try {
      const enq = await createGoldEnquiry({
        customerName,
        customerPhone,
        customerEmail: customerEmail || 'not-provided@example.com',
        itemType,
        goldPurity: purity,
        estimatedWeight: Number(weight),
        condition,
        approximateAge: approxAge,
        photos: [],
        storePreference,
        estimatedValuation: valuation.estimatedNetValuation,
      });

      setSubmittedEnquiryNumber(enq.enquiryNumber);
    } catch (err) {
      console.error('Failed to submit gold enquiry:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-8 py-10 sm:py-16">
        {/* Page Banner */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#9A7B4F]">
            100% Transparent Scrap Assessment
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1818] mt-2">
            Sell or Exchange Your Old Gold
          </h1>
          <p className="text-xs sm:text-sm text-[#78716C] mt-2 leading-relaxed">
            Get the best market valuation for your ancestral ornaments, scrap gold, or coins. Instant computerized Karatmeter purity testing across all Vardhaman Jewellers showrooms.
          </p>
        </div>

        {submittedEnquiryNumber ? (
          <div className="bg-white p-8 sm:p-12 rounded-2xl border border-[#E8E2D8] shadow-md text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4 text-emerald-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#1A1818]">Enquiry Registered!</h2>
            <p className="text-xs text-[#78716C] mt-1 mb-4">
              Your Gold Exchange Reference Number: <strong className="text-[#581825] font-mono text-sm">{submittedEnquiryNumber}</strong>
            </p>
            <p className="text-xs text-[#57534E] leading-relaxed mb-6">
              Our gold valuation manager will call you at <strong>{customerPhone}</strong> within 30 minutes to schedule your physical Karatmeter inspection at <strong>{storePreference}</strong>.
            </p>
            <button
              onClick={() => {
                setSubmittedEnquiryNumber(null);
                setCustomerName('');
                setCustomerPhone('');
              }}
              className="px-6 py-2.5 rounded-full bg-[#581825] text-white text-xs font-bold hover:bg-[#380B12]"
            >
              Calculate Another Item
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Inputs (Left) */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-[#E8E2D8] shadow-xs space-y-6">
              <h2 className="font-serif text-lg font-bold text-[#1A1818] border-b border-[#F0ECE4] pb-3">
                1. Item & Karat Details
              </h2>

              <div className="space-y-4 text-xs">
                {/* Weight Input */}
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <label className="text-[#2B2625]">Gross Gold Weight (in Grams):</label>
                    <span className="text-[#581825] font-bold text-sm">{weight} g</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="250"
                    step="0.5"
                    value={weight}
                    onChange={(e) => setWeight(parseFloat(e.target.value))}
                    className="w-full accent-[#581825] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#A8A29E] mt-1">
                    <span>1 g</span>
                    <span>100 g</span>
                    <span>250 g</span>
                  </div>
                </div>

                {/* Purity Selector */}
                <div>
                  <label className="block font-semibold text-[#2B2625] mb-1.5">
                    Assumed Gold Purity:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['24K', '22K', '18K', '14K'] as GoldPurity[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPurity(p)}
                        className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                          purity === p
                            ? 'bg-[#581825] text-white border-[#581825]'
                            : 'bg-[#FAF7F2] text-[#2B2625] border-[#E8E2D8] hover:border-[#581825]'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Item Type & Condition */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#2B2625] mb-1">Ornament Type:</label>
                    <select
                      value={itemType}
                      onChange={(e) => setItemType(e.target.value)}
                      className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8E2D8] focus:outline-none"
                    >
                      <option>Old Gold Bangles & Chains</option>
                      <option>Ancestral Haar / Choker</option>
                      <option>Mangalsutra / Watya</option>
                      <option>Gold Coins or Bullion Bars</option>
                      <option>Damaged or Broken Scrap</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#2B2625] mb-1">Condition:</label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value as any)}
                      className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8E2D8] focus:outline-none"
                    >
                      <option value="Good">Good Wearable</option>
                      <option value="Excellent">Excellent / Hallmarked</option>
                      <option value="Damaged/Scrap">Damaged / Broken Scrap</option>
                      <option value="Heirloom">Antique Heirloom</option>
                    </select>
                  </div>
                </div>

                {/* Preferred Store */}
                <div>
                  <label className="block font-semibold text-[#2B2625] mb-1">
                    Preferred Store for Karatmeter Inspection:
                  </label>
                  <select
                    value={storePreference}
                    onChange={(e) => setStorePreference(e.target.value)}
                    className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8E2D8] focus:outline-none"
                  >
                    <option>Jalgaon Flagship Store (MG Road)</option>
                    <option>Dhule City Store (Agra Road)</option>
                    <option>Pune Swargate / Laxmi Road</option>
                    <option>Mumbai Dadar (West)</option>
                  </select>
                </div>
              </div>

              {/* Customer Contact */}
              <div className="pt-4 border-t border-[#F0ECE4] space-y-4">
                <h3 className="font-serif text-sm font-bold text-[#1A1818]">
                  2. Your Contact Information
                </h3>

                <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-[#2B2625] mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Ramesh Patil"
                      className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8E2D8] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-[#2B2625] mb-1">Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+91 98220 00000"
                        className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8E2D8] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#2B2625] mb-1">Email Address</label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="ramesh@example.com"
                        className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8E2D8] focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !customerName || !customerPhone}
                    className="w-full mt-2 py-3 rounded-xl bg-[#581825] hover:bg-[#380B12] text-white font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 shadow-sm flex items-center justify-center gap-2"
                  >
                    <span>{isSubmitting ? 'Registering Enquiry...' : 'Submit Gold Exchange Request'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>

            {/* Valuation Summary Box (Right) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#C5A880]/40 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-xs text-[#581825] font-semibold">
                  <Scale className="w-4 h-4 text-[#C5A880]" />
                  <span>Real-Time Indicative Valuation</span>
                </div>

                <div className="pt-2 border-t border-[#E8E2D8]">
                  <p className="text-[11px] text-[#78716C]">Estimated Value of {weight}g ({purity}):</p>
                  <span className="text-3xl font-bold text-[#581825] block mt-0.5">
                    {formatINR(valuation.estimatedNetValuation)}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-[#78716C] pt-2 border-t border-[#E8E2D8]">
                  <div className="flex justify-between">
                    <span>Applicable Market Rate:</span>
                    <span className="font-semibold text-[#1A1818]">{formatINR(valuation.marketRatePerGram)}/g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gross Metallic Value:</span>
                    <span className="font-semibold text-[#1A1818]">{formatINR(valuation.grossValue)}</span>
                  </div>
                  <div className="flex justify-between text-amber-800">
                    <span>Refining & Testing Margin:</span>
                    <span>-{formatINR(valuation.meltingRefiningDeduction)}</span>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Important Note:</strong> This is an indicative estimate based on user-entered values. The final valuation will be confirmed after physical testing on our German Karatmeter spectrometer in the store.
                  </p>
                </div>
              </div>

              {/* Trust Callouts */}
              <div className="bg-white p-5 rounded-2xl border border-[#E8E2D8] text-xs text-[#57534E] space-y-2.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#581825]" />
                  <span>Zero destruction testing via Karatmeter spectrometer</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#581825]" />
                  <span>Instant same-day exchange towards new jewellery</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#581825]" />
                  <span>Direct bank transfer option available</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
