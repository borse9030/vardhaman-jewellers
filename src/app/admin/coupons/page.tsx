'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, CheckCircle2, X, AlertCircle } from 'lucide-react';
import { getAllCoupons, createCoupon, deleteCoupon, toggleCoupon } from '@/lib/db/couponService';
import { formatINR } from '@/services/pricingEngine';
import { Coupon } from '@/types';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New coupon form
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(5);
  const [minOrder, setMinOrder] = useState(50000);
  const [maxDiscount, setMaxDiscount] = useState(5000);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('2026-12-31');

  const loadData = () => {
    getAllCoupons().then((list) => setCoupons(list));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    await createCoupon({
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrder),
      maxDiscountAmount: discountType === 'percentage' ? Number(maxDiscount) : undefined,
      startDate,
      endDate,
      isActive: true,
    });

    setIsModalOpen(false);
    setCode('');
    loadData();
  };

  const handleToggle = async (id: string) => {
    await toggleCoupon(id);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this coupon code?')) {
      await deleteCoupon(id);
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">Coupons & Festive Discounts</h1>
          <p className="text-xs text-[#A8A29E] mt-0.5">
            Configure promotional promo codes, cart thresholds, and percentage or flat value discounts.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#581825] hover:bg-[#7E2638] text-white font-bold text-xs shadow-sm"
        >
          <Plus className="w-4 h-4 text-[#C5A880]" />
          <span>Create Promo Code</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-[#171515] rounded-2xl border border-white/10 overflow-hidden shadow-xs">
        <div className="overflow-x-auto text-xs text-[#E8E2D8]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 bg-[#242121] text-[#A8A29E] uppercase text-[10px]">
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-3">Type & Discount</th>
                <th className="py-3 px-3">Min Order Amount</th>
                <th className="py-3 px-3">Validity</th>
                <th className="py-3 px-3">Usage</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-[#2B2625]/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-base text-[#C5A880]">{c.code}</td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-white">
                      {c.discountType === 'percentage'
                        ? `${c.discountValue}% OFF`
                        : `${formatINR(c.discountValue)} Flat OFF`}
                    </span>
                    {c.maxDiscountAmount && (
                      <span className="text-[10px] text-[#A8A29E] block">
                        Max Cap: {formatINR(c.maxDiscountAmount)}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">{formatINR(c.minOrderAmount)}</td>
                  <td className="py-3 px-3 text-[#A8A29E]">
                    {c.startDate} to {c.endDate}
                  </td>
                  <td className="py-3 px-3">{c.usedCount} Redemptions</td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => handleToggle(c.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.isActive
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-red-950 text-red-300 border border-red-800'
                      }`}
                    >
                      {c.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-1.5 rounded-lg bg-[#2B2625] text-[#A8A29E] hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-xs" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-md bg-[#1A1818] border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 z-10 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-5">
              <h2 className="font-serif text-base font-bold text-white">Create New Coupon</h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-[#A8A29E] hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-[#D6D3D1] font-semibold mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. BRIDAL2026"
                  className="w-full bg-[#2B2625] p-2.5 rounded-xl border border-white/10 text-white uppercase font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#D6D3D1] font-semibold mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full bg-[#2B2625] p-2.5 rounded-xl border border-white/10 text-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#D6D3D1] font-semibold mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value))}
                    className="w-full bg-[#2B2625] p-2.5 rounded-xl border border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#D6D3D1] font-semibold mb-1">Min Order Amount (₹)</label>
                  <input
                    type="number"
                    value={minOrder}
                    onChange={(e) => setMinOrder(parseFloat(e.target.value))}
                    className="w-full bg-[#2B2625] p-2.5 rounded-xl border border-white/10 text-white"
                  />
                </div>

                {discountType === 'percentage' && (
                  <div>
                    <label className="block text-[#D6D3D1] font-semibold mb-1">Max Discount Cap (₹)</label>
                    <input
                      type="number"
                      value={maxDiscount}
                      onChange={(e) => setMaxDiscount(parseFloat(e.target.value))}
                      className="w-full bg-[#2B2625] p-2.5 rounded-xl border border-white/10 text-white"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-[#A8A29E]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#581825] text-white font-bold"
                >
                  Create Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
