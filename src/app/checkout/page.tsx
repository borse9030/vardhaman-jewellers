'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldCheck,
  Truck,
  MapPin,
  Lock,
  ArrowRight,
  PhoneCall,
  CheckCircle2,
  CreditCard,
  Building,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { formatINR } from '@/services/pricingEngine';
import { createOrder } from '@/lib/db/orderService';
import { DeliveryMethod, PaymentMethod } from '@/types';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, taxAmount, discountAmount, totalAmount, clearCart } = useCart();

  // Delivery options
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('home_delivery');
  const [pickupStoreId, setPickupStoreId] = useState('store-jalgaon');

  // Customer Contact & Shipping
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('');

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !email) return;
    if (deliveryMethod === 'home_delivery' && (!addressLine1 || !city || !pincode)) return;

    setIsSubmitting(true);
    try {
      const orderItems = items.map((item) => ({
        productId: item.productId,
        SKU: item.product.SKU,
        name: item.product.name,
        thumbnail: item.product.thumbnail || item.product.images[0],
        purity: item.product.purity,
        grossWeight: item.product.grossWeight,
        quantity: item.quantity,
        price: item.calculatedPrice,
        total: item.calculatedPrice * item.quantity,
        priceBreakdown: item.priceBreakdown,
      }));

      const newOrder = await createOrder({
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
        shippingAddress: {
          fullName,
          phone,
          email,
          addressLine1: addressLine1 || 'Store Pickup Requested',
          addressLine2,
          city: city || 'Jalgaon',
          state,
          pincode: pincode || '425001',
        },
        deliveryMethod,
        pickupStoreId: deliveryMethod === 'store_pickup' ? pickupStoreId : undefined,
        items: orderItems,
        subtotal,
        taxAmount,
        discountAmount,
        shippingFee: 0,
        totalAmount,
        status: paymentMethod === 'assisted_purchase' ? 'Confirmed' : 'Paid',
        paymentMethod,
        paymentStatus: paymentMethod === 'assisted_purchase' ? 'assisted_request' : 'completed',
        paymentReference: `PAY-${Date.now().toString().slice(-8)}`,
      });

      clearCart();
      router.push(`/order-success?orderId=${newOrder.id}`);
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
        <Header />
        <main className="flex-1 max-w-md mx-auto px-4 py-20 text-center">
          <div className="bg-white p-8 rounded-2xl border border-[#E8E2D8] shadow-sm">
            <h2 className="font-serif text-xl font-bold text-[#1A1818]">Your shopping bag is empty</h2>
            <p className="text-xs text-[#78716C] mt-2 mb-6">
              Please add your desired jewellery designs to the bag before proceeding to checkout.
            </p>
            <Link
              href="/shop"
              className="px-6 py-2.5 rounded-full bg-[#581825] text-white text-xs font-bold hover:bg-[#380B12]"
            >
              Explore Catalogue
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isHighValue = totalAmount >= 100000;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-8 py-8 sm:py-16 pb-24 lg:pb-16">
        <div className="flex items-center gap-2 mb-6 sm:mb-8 pb-3 sm:pb-4 border-b border-[#E8E2D8]">
          <Lock className="w-5 h-5 text-[#581825]" />
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1818]">
            Secure Luxury Checkout
          </h1>
        </div>

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form: Details & Delivery */}
          <div className="lg:col-span-7 space-y-6">
            {/* Delivery Method Selector */}
            <div className="bg-white p-6 rounded-2xl border border-[#E8E2D8] shadow-xs space-y-4">
              <h2 className="font-serif text-base font-bold text-[#1A1818]">
                1. Delivery Preference
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    deliveryMethod === 'home_delivery'
                      ? 'bg-[#FAF7F2] border-[#581825] ring-1 ring-[#581825]'
                      : 'border-[#E8E2D8] hover:border-[#C5A880]'
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryMethod === 'home_delivery'}
                    onChange={() => setDeliveryMethod('home_delivery')}
                    className="accent-[#581825] mt-0.5"
                  />
                  <div>
                    <span className="font-bold text-[#1A1818] block flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-[#581825]" />
                      Insured Home Delivery
                    </span>
                    <span className="text-[11px] text-[#78716C] block mt-1">
                      Doorstep insured delivery in tamper-evident sealed security container.
                    </span>
                  </div>
                </label>

                <label
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    deliveryMethod === 'store_pickup'
                      ? 'bg-[#FAF7F2] border-[#581825] ring-1 ring-[#581825]'
                      : 'border-[#E8E2D8] hover:border-[#C5A880]'
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryMethod === 'store_pickup'}
                    onChange={() => setDeliveryMethod('store_pickup')}
                    className="accent-[#581825] mt-0.5"
                  />
                  <div>
                    <span className="font-bold text-[#1A1818] block flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-[#581825]" />
                      Showroom Pickup
                    </span>
                    <span className="text-[11px] text-[#78716C] block mt-1">
                      Collect in person at our Jalgaon, Dhule, Pune, or Mumbai stores.
                    </span>
                  </div>
                </label>
              </div>

              {deliveryMethod === 'store_pickup' && (
                <div className="pt-2 text-xs">
                  <label className="block font-semibold text-[#2B2625] mb-1">Select Pickup Outlet:</label>
                  <select
                    value={pickupStoreId}
                    onChange={(e) => setPickupStoreId(e.target.value)}
                    className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8E2D8]"
                  >
                    <option value="store-jalgaon">Jalgaon Flagship Store (MG Road)</option>
                    <option value="store-dhule">Dhule City Store (Agra Road)</option>
                    <option value="store-pune">Pune Swargate / Laxmi Road</option>
                    <option value="store-mumbai">Mumbai Dadar (Ranade Road West)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Customer Contact & Address */}
            <div className="bg-white p-6 rounded-2xl border border-[#E8E2D8] shadow-xs space-y-4">
              <h2 className="font-serif text-base font-bold text-[#1A1818]">
                2. Customer & Address Details
              </h2>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#2B2625] mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="As per Government ID (Aadhaar / PAN)"
                    className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8E2D8] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#2B2625] mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98220 00000"
                      className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8E2D8] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#2B2625] mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8E2D8] focus:outline-none"
                    />
                  </div>
                </div>

                {deliveryMethod === 'home_delivery' && (
                  <>
                    <div>
                      <label className="block font-semibold text-[#2B2625] mb-1">Address Line 1 *</label>
                      <input
                        type="text"
                        required
                        value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        placeholder="House / Flat No, Building Name, Street"
                        className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8E2D8] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#2B2625] mb-1">Landmark / Area</label>
                      <input
                        type="text"
                        value={addressLine2}
                        onChange={(e) => setAddressLine2(e.target.value)}
                        placeholder="Near Temple / College / Road"
                        className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8E2D8] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold text-[#2B2625] mb-1">City *</label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="e.g. Pune"
                          className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8E2D8] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-[#2B2625] mb-1">State *</label>
                        <input
                          type="text"
                          required
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8E2D8] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-[#2B2625] mb-1">Pincode *</label>
                        <input
                          type="text"
                          required
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                          placeholder="411030"
                          className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8E2D8] focus:outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Payment Options & Assisted High-Value Purchase */}
            <div className="bg-white p-6 rounded-2xl border border-[#E8E2D8] shadow-xs space-y-4">
              <h2 className="font-serif text-base font-bold text-[#1A1818]">
                3. Payment Architecture
              </h2>

              {isHighValue && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
                  <PhoneCall className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Assisted VIP Purchase Recommended:</span>
                    <p className="mt-0.5 leading-relaxed">
                      For high-ticket jewellery ({formatINR(totalAmount)}), you may select <strong>"Assisted Purchase"</strong> below to lock today's gold rate immediately and coordinate payment via bank RTGS or store concierge.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2.5 text-xs">
                <label
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === 'upi'
                      ? 'bg-[#FAF7F2] border-[#581825] ring-1 ring-[#581825]'
                      : 'border-[#E8E2D8] hover:border-[#C5A880]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="accent-[#581825]"
                    />
                    <span className="font-semibold text-[#1A1818]">Instant UPI / QR / Net Banking (Razorpay/Bank)</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Fastest</span>
                </label>

                <label
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === 'card'
                      ? 'bg-[#FAF7F2] border-[#581825] ring-1 ring-[#581825]'
                      : 'border-[#E8E2D8] hover:border-[#C5A880]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="accent-[#581825]"
                    />
                    <span className="font-semibold text-[#1A1818]">Credit / Debit Card (Visa, Mastercard, RuPay)</span>
                  </div>
                  <CreditCard className="w-4 h-4 text-[#78716C]" />
                </label>

                <label
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === 'assisted_purchase'
                      ? 'bg-[#FAF7F2] border-[#581825] ring-1 ring-[#581825]'
                      : 'border-[#E8E2D8] hover:border-[#C5A880]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'assisted_purchase'}
                      onChange={() => setPaymentMethod('assisted_purchase')}
                      className="accent-[#581825]"
                    />
                    <div>
                      <span className="font-semibold text-[#1A1818] block">Assisted VIP Purchase (Callback & Bullion Rate Lock)</span>
                      <span className="text-[10px] text-[#78716C]">Pay via RTGS/NEFT or showroom verification</span>
                    </div>
                  </div>
                  <PhoneCall className="w-4 h-4 text-[#581825]" />
                </label>
              </div>
            </div>
          </div>

          {/* Right Summary Column */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#E8E2D8] shadow-xs space-y-5">
            <h2 className="font-serif text-base font-bold text-[#1A1818] pb-3 border-b border-[#F0ECE4]">
              Review Order ({items.length} Items)
            </h2>

            {/* Item Thumbnails List */}
            <div className="max-h-56 overflow-y-auto space-y-3 pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 items-center text-xs">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#FAF7F2] border border-[#E8E2D8] shrink-0">
                    <Image
                      src={item.product.thumbnail || item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 truncate">
                    <p className="font-semibold text-[#1A1818] truncate">{item.product.name}</p>
                    <p className="text-[10px] text-[#78716C]">{item.product.purity} • Qty: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-[#581825]">
                    {formatINR(item.calculatedPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 text-xs text-[#78716C] pt-3 border-t border-[#F0ECE4]">
              <div className="flex justify-between">
                <span>Subtotal (Base & Making):</span>
                <span className="font-medium text-[#1A1818]">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (3% Indian Standard):</span>
                <span className="font-medium text-[#1A1818]">{formatINR(taxAmount)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discount:</span>
                  <span>-{formatINR(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Insured Doorstep Shipping:</span>
                <span className="text-emerald-700 font-semibold">FREE</span>
              </div>

              <div className="flex justify-between pt-3 border-t border-[#E8E2D8] text-base font-bold text-[#1A1818]">
                <span>Total Amount:</span>
                <span className="text-[#581825] text-xl">{formatINR(totalAmount)}</span>
              </div>
            </div>

            {/* Submit Order Button */}
            <button
              type="submit"
              disabled={isSubmitting || !fullName || !phone}
              className="w-full py-4 rounded-xl bg-[#581825] hover:bg-[#380B12] text-white font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Securing Order...' : `Complete Order (${formatINR(totalAmount)})`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8E2D8] text-[11px] text-[#57534E] space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-[#1A1818]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Transit Insured Delivery</span>
              </div>
              <p>Government BIS 916 hallmarked invoice with tamper-proof delivery tracking generated upon completion.</p>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
