'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Trash2,
  Tag,
  ShieldCheck,
  Truck,
  ArrowRight,
  Gift,
  ArrowLeft,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { formatINR } from '@/services/pricingEngine';

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    removeFromCart,
    updateQuantity,
    subtotal,
    taxAmount,
    discountAmount,
    totalAmount,
    applyCouponCode,
    removeCouponCode,
    appliedCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [giftNote, setGiftNote] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplying(true);
    setCouponError('');
    setCouponSuccess('');
    const res = await applyCouponCode(couponInput.trim());
    setIsApplying(false);
    if (res.success) {
      setCouponSuccess(res.message);
      setCouponInput('');
    } else {
      setCouponError(res.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-16">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1818] mb-8 pb-4 border-b border-[#E8E2D8]">
          Shopping Bag ({items.length} {items.length === 1 ? 'Design' : 'Designs'})
        </h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E8E2D8] p-12 text-center max-w-md mx-auto">
            <ShoppingBag className="w-12 h-12 text-[#C5A880] mx-auto mb-3" />
            <h2 className="font-serif text-lg font-bold text-[#1A1818]">Your bag is currently empty</h2>
            <p className="text-xs text-[#78716C] mt-1 mb-6">
              Browse our heritage collection of 22K hallmarked gold and certified diamonds.
            </p>
            <Link
              href="/shop"
              className="px-6 py-2.5 rounded-full bg-[#581825] text-white text-xs font-bold hover:bg-[#380B12]"
            >
              Discover Jewellery
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Items Column */}
            <div className="lg:col-span-8 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E2D8] shadow-2xs flex flex-col sm:flex-row gap-5 justify-between items-start sm:items-center"
                >
                  <div className="flex gap-4 items-center">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#FAF7F2] border border-[#E8E2D8] shrink-0">
                      <Image
                        src={item.product.thumbnail || item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] text-[#78716C] uppercase font-bold tracking-wider">
                        {item.product.purity} Gold • Net: {item.product.netGoldWeight}g
                      </span>
                      <Link
                        href={`/product/${item.product.slug}`}
                        className="font-serif text-sm sm:text-base font-bold text-[#1A1818] block hover:text-[#581825]"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-xs text-[#78716C] mt-0.5">SKU: {item.product.SKU}</p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3">
                    <span className="text-base font-bold text-[#581825]">
                      {formatINR(item.calculatedPrice * item.quantity)}
                    </span>

                    <div className="flex items-center gap-3">
                      {/* Quantity */}
                      <div className="flex items-center border border-[#E8E2D8] rounded-lg bg-[#FAF7F2]">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="px-2.5 py-1 text-xs font-bold text-[#581825] hover:bg-[#E8E2D8]"
                        >
                          -
                        </button>
                        <span className="px-3 text-xs font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="px-2.5 py-1 text-xs font-bold text-[#581825] hover:bg-[#E8E2D8]"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="p-1.5 text-[#A8A29E] hover:text-red-700"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Gift Message Input */}
              <div className="bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1A1818] mb-2">
                  <Gift className="w-4 h-4 text-[#C5A880]" />
                  <span>Complimentary Luxury Gift Box & Greeting Note</span>
                </div>
                <textarea
                  rows={2}
                  value={giftNote}
                  onChange={(e) => setGiftNote(e.target.value)}
                  placeholder="Enter a personalized wedding or anniversary greeting message to be printed on royal stationery..."
                  className="w-full bg-[#FAF7F2] p-3 rounded-xl border border-[#E8E2D8] text-xs focus:outline-none"
                />
              </div>

              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#581825] hover:underline pt-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Continue Exploring Jewellery</span>
              </Link>
            </div>

            {/* Right Summary Column */}
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#E8E2D8] shadow-xs space-y-4">
              <h2 className="font-serif text-base font-bold text-[#1A1818] pb-3 border-b border-[#F0ECE4]">
                Order Summary
              </h2>

              {/* Coupon */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                    <span className="text-emerald-800 font-medium">
                      Coupon <strong>{appliedCoupon.code}</strong> (-{formatINR(appliedCoupon.discount)})
                    </span>
                    <button
                      onClick={removeCouponCode}
                      className="text-red-700 font-bold hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApply} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Coupon Code (e.g. VJGOLD)"
                      className="flex-1 bg-[#FAF7F2] text-xs px-3 py-2 rounded-xl border border-[#E8E2D8] uppercase focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isApplying}
                      className="px-4 py-2 rounded-xl bg-[#2B2625] text-white hover:bg-[#1A1818] text-xs font-bold"
                    >
                      {isApplying ? '...' : 'Apply'}
                    </button>
                  </form>
                )}
                {couponError && <p className="text-[11px] text-red-600 mt-1">{couponError}</p>}
                {couponSuccess && <p className="text-[11px] text-emerald-600 mt-1">{couponSuccess}</p>}
              </div>

              {/* Breakdown */}
              <div className="space-y-2 text-xs text-[#78716C] pt-2 border-t border-[#F0ECE4]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium text-[#1A1818]">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (3% Indian Standard):</span>
                  <span className="font-medium text-[#1A1818]">{formatINR(taxAmount)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Coupon Discount:</span>
                    <span>-{formatINR(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Insured Doorstep Shipping:</span>
                  <span className="text-emerald-700 font-semibold">FREE</span>
                </div>

                <div className="flex justify-between pt-3 border-t border-[#E8E2D8] text-base font-bold text-[#1A1818]">
                  <span>Total Payable:</span>
                  <span className="text-[#581825]">{formatINR(totalAmount)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={() => router.push('/checkout')}
                className="w-full py-3.5 rounded-xl bg-[#581825] hover:bg-[#380B12] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8E2D8] text-[11px] text-[#57534E] space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-[#1A1818]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Insured Delivery Guarantee</span>
                </div>
                <p>Every shipment is packed in tamper-evident sealed security cases with transit coverage.</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
