'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Gem,
  TrendingUp,
  ShoppingBag,
  MessageSquare,
  Calendar,
  ShieldCheck,
  ArrowRight,
  Plus,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { getAllProducts } from '@/lib/db/productService';
import { getAllOrders } from '@/lib/db/orderService';
import { getAllGoldEnquiries, getAllAppointments } from '@/lib/db/enquiryService';
import { useGoldRates } from '@/context/GoldRateContext';
import { formatINR } from '@/services/pricingEngine';
import { Product, Order, GoldSellEnquiry, Appointment } from '@/types';

export default function AdminDashboardPage() {
  const { rates } = useGoldRates();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [goldEnquiries, setGoldEnquiries] = useState<GoldSellEnquiry[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAllProducts(),
      getAllOrders(),
      getAllGoldEnquiries(),
      getAllAppointments(),
    ]).then(([pList, oList, gList, aList]) => {
      setProducts(pList);
      setOrders(oList);
      setGoldEnquiries(gList);
      setAppointments(aList);
      setLoading(false);
    });
  }, []);

  const totalRevenue = orders.reduce((sum, ord) => sum + ord.totalAmount, 0);
  const pendingAppointments = appointments.filter((a) => a.status === 'Pending').length;
  const pendingEnquiries = goldEnquiries.filter((g) => g.status === 'New').length;

  return (
    <div className="space-y-8">
      {/* Welcome & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Administration Overview
          </h1>
          <p className="text-xs text-[#A8A29E] mt-1">
            Real-time management for Vardhaman Jewellers catalogue, orders, bullion rates & customer appointments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/products?action=new"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#581825] hover:bg-[#7E2638] text-white text-xs font-bold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 text-[#C5A880]" />
            <span>Add Product</span>
          </Link>

          <Link
            href="/admin/gold-rates"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2B2625] hover:bg-[#380B12] text-[#DFCDAE] text-xs font-bold border border-white/10 transition-colors"
          >
            <TrendingUp className="w-4 h-4 text-[#C5A880]" />
            <span>Update Gold Rates</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Products */}
        <div className="bg-[#171515] p-5 rounded-2xl border border-white/10 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#A8A29E] mb-2">
            <span>Catalogue Items</span>
            <Gem className="w-4 h-4 text-[#C5A880]" />
          </div>
          <span className="text-2xl font-bold text-white">{products.length}</span>
          <p className="text-[11px] text-emerald-400 mt-1">Ready for 4,000+ Scalable Inventory</p>
        </div>

        {/* Total Orders & Revenue */}
        <div className="bg-[#171515] p-5 rounded-2xl border border-white/10 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#A8A29E] mb-2">
            <span>Gross Orders</span>
            <ShoppingBag className="w-4 h-4 text-[#C5A880]" />
          </div>
          <span className="text-2xl font-bold text-white">{orders.length}</span>
          <p className="text-[11px] text-[#C5A880] mt-1 font-semibold">{formatINR(totalRevenue)} Recorded</p>
        </div>

        {/* Pending Appointments */}
        <div className="bg-[#171515] p-5 rounded-2xl border border-white/10 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#A8A29E] mb-2">
            <span>Store Appointments</span>
            <Calendar className="w-4 h-4 text-[#C5A880]" />
          </div>
          <span className="text-2xl font-bold text-white">{appointments.length}</span>
          <p className="text-[11px] text-amber-400 mt-1">{pendingAppointments} Pending Confirmation</p>
        </div>

        {/* Gold Sell / Exchange Enquiries */}
        <div className="bg-[#171515] p-5 rounded-2xl border border-white/10 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#A8A29E] mb-2">
            <span>Gold Exchange Leads</span>
            <MessageSquare className="w-4 h-4 text-[#C5A880]" />
          </div>
          <span className="text-2xl font-bold text-white">{goldEnquiries.length}</span>
          <p className="text-[11px] text-blue-400 mt-1">{pendingEnquiries} New Inquiries</p>
        </div>
      </div>

      {/* Live Gold Rates Quick Control Strip */}
      <div className="bg-[#171515] p-6 rounded-2xl border border-[#C5A880]/30 shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
          <div>
            <h2 className="font-serif text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#C5A880]" />
              Active Centralized Bullion Rates
            </h2>
            <p className="text-xs text-[#A8A29E] mt-0.5">
              Changes instantly update dynamically priced products across the entire website.
            </p>
          </div>
          <Link
            href="/admin/gold-rates"
            className="text-xs font-bold text-[#C5A880] hover:underline flex items-center gap-1"
          >
            <span>Open Gold Rate Manager</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs">
          <div className="p-3 bg-[#2B2625] rounded-xl border border-white/5">
            <span className="text-[#A8A29E] block">22K Gold (916)</span>
            <strong className="text-lg font-bold text-white mt-1 block">
              {formatINR(rates.rate22K)}/g
            </strong>
          </div>
          <div className="p-3 bg-[#2B2625] rounded-xl border border-white/5">
            <span className="text-[#A8A29E] block">24K Bullion (999)</span>
            <strong className="text-lg font-bold text-white mt-1 block">
              {formatINR(rates.rate24K)}/g
            </strong>
          </div>
          <div className="p-3 bg-[#2B2625] rounded-xl border border-white/5">
            <span className="text-[#A8A29E] block">18K Diamond Setting</span>
            <strong className="text-lg font-bold text-white mt-1 block">
              {formatINR(rates.rate18K)}/g
            </strong>
          </div>
          <div className="p-3 bg-[#2B2625] rounded-xl border border-white/5">
            <span className="text-[#A8A29E] block">Silver (925)</span>
            <strong className="text-lg font-bold text-white mt-1 block">
              {formatINR(rates.rateSilver)}/g
            </strong>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Orders & Recent Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-[#171515] p-6 rounded-2xl border border-white/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h2 className="font-serif text-base font-bold text-white">Recent Customer Orders</h2>
            <Link href="/admin/orders" className="text-xs text-[#C5A880] hover:underline">
              View All Orders
            </Link>
          </div>

          <div className="space-y-3">
            {orders.slice(0, 4).map((ord) => (
              <div
                key={ord.id}
                className="p-3.5 rounded-xl bg-[#2B2625]/50 border border-white/5 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-white block">#{ord.orderNumber}</span>
                  <span className="text-[11px] text-[#A8A29E]">{ord.customerName} • {ord.items.length} item(s)</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#C5A880] block">{formatINR(ord.totalAmount)}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#581825] text-white">
                    {ord.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Appointments */}
        <div className="bg-[#171515] p-6 rounded-2xl border border-white/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h2 className="font-serif text-base font-bold text-white">Upcoming Store Appointments</h2>
            <Link href="/admin/enquiries" className="text-xs text-[#C5A880] hover:underline">
              Manage Enquiries
            </Link>
          </div>

          <div className="space-y-3">
            {appointments.slice(0, 4).map((apt) => (
              <div
                key={apt.id}
                className="p-3.5 rounded-xl bg-[#2B2625]/50 border border-white/5 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-white block">{apt.customerName}</span>
                  <span className="text-[11px] text-[#A8A29E]">{apt.purpose} • {apt.preferredStoreName}</span>
                </div>
                <div className="text-right">
                  <span className="text-white block font-medium">{apt.date}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {apt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
