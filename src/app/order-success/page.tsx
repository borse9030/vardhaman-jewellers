'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Printer,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  MapPin,
  Calendar,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getOrderById } from '@/lib/db/orderService';
import { Order } from '@/types';
import { formatINR } from '@/services/pricingEngine';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '';

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fire festive celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C5A880', '#581825', '#DFCDAE', '#FAF7F2'],
      });
    } catch (e) {
      // safe fallback
    }

    if (orderId) {
      getOrderById(orderId).then((ord) => {
        setOrder(ord);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="p-16 text-center text-xs">Loading order confirmation...</div>;
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto p-12 text-center bg-white rounded-2xl border border-[#E8E2D8]">
        <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
        <h2 className="font-serif text-xl font-bold text-[#1A1818]">Order Confirmed!</h2>
        <p className="text-xs text-[#78716C] mt-2 mb-6">
          Thank you for trusting Vardhaman Jewellers with your auspicious moments.
        </p>
        <Link
          href="/shop"
          className="px-6 py-2.5 rounded-full bg-[#581825] text-white text-xs font-bold hover:bg-[#380B12]"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-8 py-8 sm:py-16 pb-24 lg:pb-16">
      {/* Success Banner */}
      <div className="text-center mb-10 no-print">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-3 text-emerald-600 shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#9A7B4F]">
          Order Confirmed & Secured
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1818] mt-1">
          Thank You, {order.customerName}
        </h1>
        <p className="text-xs sm:text-sm text-[#78716C] mt-1">
          Order Reference: <strong className="text-[#581825] font-mono text-sm">{order.orderNumber}</strong>
        </p>

        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-[#E8E2D8] hover:bg-[#FAF7F2] text-[#581825] text-xs font-bold shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Tax Invoice</span>
          </button>
          <Link
            href="/orders"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#581825] hover:bg-[#380B12] text-white text-xs font-bold shadow-xs transition-colors"
          >
            <span>Track Order Status</span>
          </Link>
        </div>
      </div>

      {/* Printable GST Tax Invoice Document */}
      <div className="bg-white rounded-2xl border border-[#E8E2D8] p-6 sm:p-10 shadow-sm print:shadow-none print:border-none space-y-6">
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start pb-6 border-b border-[#E8E2D8] gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl font-bold text-[#380B12]">VARDHAMAN JEWELLERS</span>
            </div>
            <p className="text-[11px] text-[#78716C] mt-0.5">Head Office: MG Road, Golani Market, Jalgaon - 425001</p>
            <p className="text-[11px] text-[#78716C]">GSTIN: 27AABCV8421Q1Z8 • BIS Hallmark Reg: HM-MH-916-84210</p>
          </div>

          <div className="sm:text-right text-xs">
            <span className="font-bold text-[#581825] uppercase tracking-wider block text-sm">
              Tax Invoice / Bill of Supply
            </span>
            <p className="text-[#78716C] mt-0.5">Invoice No: <strong>{order.orderNumber}</strong></p>
            <p className="text-[#78716C]">Date: {new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
          </div>
        </div>

        {/* Customer & Delivery Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-[#44403C] py-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C] block mb-1">
              Billed To:
            </span>
            <p className="font-bold text-[#1A1818]">{order.customerName}</p>
            <p>{order.shippingAddress.addressLine1}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
            <p>Mobile: {order.customerPhone}</p>
            <p>Email: {order.customerEmail}</p>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C] block mb-1">
              Fulfillment Method:
            </span>
            <p className="font-bold text-[#1A1818]">
              {order.deliveryMethod === 'home_delivery'
                ? 'Insured Transit Doorstep Delivery'
                : 'Showroom Pickup (Jalgaon Flagship Store)'}
            </p>
            <p className="mt-1">
              Payment Status: <strong className="text-emerald-700 uppercase">{order.paymentStatus}</strong> ({order.paymentMethod.toUpperCase()})
            </p>
            <p className="text-[#78716C] mt-0.5">Payment Ref: {order.paymentReference}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-y border-[#E8E2D8] bg-[#FAF7F2] text-[#78716C] uppercase text-[10px]">
                <th className="py-2.5 px-3">Item Description</th>
                <th className="py-2.5 px-2">HSN</th>
                <th className="py-2.5 px-2">Purity</th>
                <th className="py-2.5 px-2">Gross Wt</th>
                <th className="py-2.5 px-2">Qty</th>
                <th className="py-2.5 px-3 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0ECE4]">
              {order.items.map((it, idx) => (
                <tr key={idx}>
                  <td className="py-3 px-3 font-semibold text-[#1A1818]">
                    {it.name}
                    <span className="block text-[10px] text-[#78716C] font-normal">SKU: {it.SKU}</span>
                  </td>
                  <td className="py-3 px-2 text-[#78716C]">7113</td>
                  <td className="py-3 px-2 font-bold text-[#581825]">{it.purity}</td>
                  <td className="py-3 px-2">{it.grossWeight}g</td>
                  <td className="py-3 px-2">{it.quantity}</td>
                  <td className="py-3 px-3 text-right font-bold text-[#1A1818]">
                    {formatINR(it.price * it.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Invoice Totals */}
        <div className="border-t border-[#E8E2D8] pt-4 flex flex-col sm:flex-row justify-between items-start gap-4 text-xs">
          <div className="text-[11px] text-[#78716C] max-w-sm">
            <p><strong>Declaration:</strong> Certified that all gold jewellery sold under this tax invoice complies with BIS 916 hallmarking standards and is covered by lifetime exchange policy.</p>
          </div>

          <div className="w-full sm:w-64 space-y-1.5 text-right">
            <div className="flex justify-between text-[#78716C]">
              <span>Taxable Subtotal:</span>
              <span className="font-semibold text-[#1A1818]">{formatINR(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#78716C]">
              <span>IGST / CGST+SGST (3%):</span>
              <span className="font-semibold text-[#1A1818]">{formatINR(order.taxAmount)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount:</span>
                <span>-{formatINR(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-[#78716C]">
              <span>Transit Insurance:</span>
              <span className="text-emerald-700 font-bold">FREE</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#E8E2D8] text-base font-bold text-[#1A1818]">
              <span>Total Amount:</span>
              <span className="text-[#581825] text-lg">{formatINR(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="p-16 text-center text-xs">Loading order...</div>}>
          <OrderSuccessContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
