'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatINR } from '@/services/pricingEngine';

export default function CartDrawer() {
  const router = useRouter();
  const {
    items,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
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
  const [isApplying, setIsApplying] = useState(false);

  if (!isCartDrawerOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
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

  const handleProceedToCheckout = () => {
    setIsCartDrawerOpen(false);
    router.push('/checkout');
  };

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartDrawerOpen(false)}
      ></div>

      {/* Slide-out Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8E2D8] flex items-center justify-between bg-[#FAF7F2]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#581825]" />
            <h2 className="font-serif text-lg font-bold text-[#1A1818]">Your Shopping Bag</h2>
            <span className="text-xs bg-[#581825] text-white px-2 py-0.5 rounded-full font-bold">
              {items.length}
            </span>
          </div>
          <button
            onClick={() => setIsCartDrawerOpen(false)}
            className="p-1.5 text-[#581825] hover:bg-[#E8E2D8] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Insured Shipping Callout */}
        <div className="bg-[#581825] text-[#FAF7F2] text-[11px] px-4 py-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium">
            <Truck className="w-3.5 h-3.5 text-[#C5A880]" />
            Free Fully Insured Doorstep Delivery Across India
          </span>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#78716C]">
              <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#E8E2D8] flex items-center justify-center mb-3">
                <ShoppingBag className="w-7 h-7 text-[#C5A880]" />
              </div>
              <h3 className="font-serif text-base font-bold text-[#1A1818]">Your cart is empty</h3>
              <p className="text-xs mt-1 max-w-xs">
                Explore our hallmarked 22K gold haars, diamond solitaires, and royal bridal collections.
              </p>
              <button
                onClick={() => {
                  setIsCartDrawerOpen(false);
                  router.push('/shop');
                }}
                className="mt-5 px-5 py-2.5 rounded-full bg-[#581825] text-white text-xs font-bold hover:bg-[#380B12] transition-colors"
              >
                Discover Jewellery
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3.5 p-3 rounded-xl border border-[#E8E2D8] bg-[#FAF7F2]/60 hover:bg-[#FAF7F2] transition-colors"
              >
                {/* Thumbnail */}
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-white border border-[#E8E2D8] shrink-0">
                  <Image
                    src={item.product.thumbnail || item.product.images[0]}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-1">
                      <Link
                        href={`/product/${item.product.slug}`}
                        onClick={() => setIsCartDrawerOpen(false)}
                        className="font-serif text-xs font-bold text-[#1A1818] line-clamp-1 hover:text-[#581825]"
                      >
                        {item.product.name}
                      </Link>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-[#A8A29E] hover:text-red-700 p-1"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[10px] text-[#78716C] mt-0.5">
                      {item.product.purity} • Net Wt: {item.product.netGoldWeight}g
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-[#E8E2D8] rounded-md bg-white">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="px-2 py-0.5 text-xs font-bold text-[#581825] hover:bg-[#FAF7F2]"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="px-2 py-0.5 text-xs font-bold text-[#581825] hover:bg-[#FAF7F2]"
                      >
                        +
                      </button>
                    </div>

                    {/* Price */}
                    <span className="text-sm font-bold text-[#581825]">
                      {formatINR(item.calculatedPrice * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout Summary */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 pb-6 sm:pb-5 border-t border-[#E8E2D8] bg-[#FAF7F2] space-y-3">
            {/* Promo Code Input */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
                  <span className="text-emerald-800 font-medium flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    Coupon <strong>{appliedCoupon.code}</strong> applied (-{formatINR(appliedCoupon.discount)})
                  </span>
                  <button
                    onClick={removeCouponCode}
                    className="text-emerald-700 hover:text-red-700 font-bold text-xs"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Enter promo code (e.g. VJGOLD)"
                      className="w-full bg-white text-xs pl-8 pr-3 py-2 rounded-lg border border-[#E8E2D8] uppercase font-medium focus:outline-none focus:border-[#C5A880]"
                    />
                    <Tag className="w-3.5 h-3.5 text-[#78716C] absolute left-2.5 top-2.5" />
                  </div>
                  <button
                    type="submit"
                    disabled={isApplying}
                    className="px-3 py-2 rounded-lg bg-[#2B2625] text-white hover:bg-[#1A1818] text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    {isApplying ? '...' : 'Apply'}
                  </button>
                </form>
              )}
              {couponError && <p className="text-[11px] text-red-600 mt-1">{couponError}</p>}
              {couponSuccess && <p className="text-[11px] text-emerald-600 mt-1">{couponSuccess}</p>}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-[#78716C] pt-1">
              <div className="flex justify-between">
                <span>Subtotal (Base & Making):</span>
                <span className="font-medium text-[#1A1818]">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (3%):</span>
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
                <span className="text-emerald-700 font-medium">FREE</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E8E2D8] text-sm font-bold text-[#1A1818]">
                <span>Total Amount:</span>
                <span className="text-base text-[#581825]">{formatINR(totalAmount)}</span>
              </div>
            </div>

            {/* Checkout Action */}
            <button
              onClick={handleProceedToCheckout}
              className="w-full py-3 rounded-xl bg-[#581825] hover:bg-[#380B12] text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
