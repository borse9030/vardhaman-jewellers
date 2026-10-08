'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getAllOrders } from '@/lib/db/orderService';
import { Order, OrderStatus } from '@/types';
import { formatINR } from '@/services/pricingEngine';

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllOrders().then((list) => {
      setOrders(list);
      setLoading(false);
    });
  }, []);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Shipped':
      case 'Ready for Dispatch':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Confirmed':
      case 'Paid':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Cancelled':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-stone-50 text-stone-800 border-stone-200';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-3 sm:px-8 py-8 sm:py-16 pb-24 lg:pb-16">
        <div className="mb-6 sm:mb-8 pb-3 sm:pb-4 border-b border-[#E8E2D8]">
          <h1 className="font-serif text-xl sm:text-3xl font-bold text-[#1A1818]">
            Orders & Shipments Tracking
          </h1>
          <p className="text-xs text-[#78716C] mt-1">
            Track your insured jewellery consignments, delivery timelines, and download tax invoices.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-40 rounded-2xl luxury-shimmer border border-[#E8E2D8]"></div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E8E2D8] p-12 text-center max-w-md mx-auto">
            <Package className="w-12 h-12 text-[#C5A880] mx-auto mb-3" />
            <h2 className="font-serif text-lg font-bold text-[#1A1818]">No Orders Found</h2>
            <p className="text-xs text-[#78716C] mt-1 mb-6">
              When you place an order with Vardhaman Jewellers, your tracking details will appear here.
            </p>
            <Link
              href="/shop"
              className="px-6 py-2.5 rounded-full bg-[#581825] text-white text-xs font-bold hover:bg-[#380B12]"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white rounded-2xl border border-[#E8E2D8] shadow-xs overflow-hidden"
              >
                {/* Header */}
                <div className="p-4 sm:p-5 bg-[#FAF7F2] border-b border-[#E8E2D8] flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs">
                  <div>
                    <span className="font-serif font-bold text-[#1A1818] text-sm">
                      Order #{ord.orderNumber}
                    </span>
                    <p className="text-[11px] text-[#78716C] mt-0.5">
                      Placed on {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                        ord.status
                      )}`}
                    >
                      {ord.status}
                    </span>
                    <Link
                      href={`/order-success?orderId=${ord.id}`}
                      className="text-xs text-[#581825] font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Invoice</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Items */}
                <div className="p-4 sm:p-5 space-y-4">
                  {ord.items.map((it, idx) => (
                    <div key={idx} className="flex gap-4 items-center">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#FAF7F2] border border-[#E8E2D8] shrink-0">
                        <Image src={it.thumbnail} alt={it.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 truncate">
                        <h4 className="font-semibold text-xs text-[#1A1818] truncate">{it.name}</h4>
                        <p className="text-[11px] text-[#78716C] mt-0.5">
                          {it.purity} Gold • Gross: {it.grossWeight}g • Qty: {it.quantity}
                        </p>
                      </div>
                      <span className="font-bold text-xs text-[#581825]">
                        {formatINR(it.price * it.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="p-4 sm:p-5 bg-white border-t border-[#F0ECE4] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                  <div className="text-[#78716C]">
                    <span>Fulfillment: </span>
                    <strong className="text-[#1A1818]">
                      {ord.deliveryMethod === 'home_delivery' ? 'Insured Transit Delivery' : 'Store Pickup'}
                    </strong>
                    <span> • Payment: </span>
                    <strong className="text-[#1A1818] uppercase">{ord.paymentMethod}</strong>
                  </div>

                  <div className="text-right">
                    <span className="text-[#78716C]">Total Amount: </span>
                    <strong className="text-[#581825] font-bold text-sm">
                      {formatINR(ord.totalAmount)}
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
