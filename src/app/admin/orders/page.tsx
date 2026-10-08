'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Search,
  ExternalLink,
  Printer,
  CheckCircle2,
  Clock,
  Truck,
  Building,
  ChevronDown,
} from 'lucide-react';
import { getAllOrders, updateOrderStatus } from '@/lib/db/orderService';
import { formatINR } from '@/services/pricingEngine';
import { Order, OrderStatus } from '@/types';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadData = () => {
    setLoading(true);
    getAllOrders().then((list) => {
      setOrders(list);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await updateOrderStatus(orderId, newStatus);
    loadData();
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const statuses: OrderStatus[] = [
    'Pending',
    'Confirmed',
    'Payment Processing',
    'Paid',
    'Processing',
    'Ready for Dispatch',
    'Shipped',
    'Delivered',
    'Cancelled',
  ];

  const filteredOrders = orders.filter((o) => {
    if (filterStatus !== 'all' && o.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">
            Order & Dispatch Management
          </h1>
          <p className="text-xs text-[#A8A29E] mt-0.5">
            Process incoming jewellery orders, track transit delivery, and print GST tax invoices.
          </p>
        </div>
      </div>

      {/* Search & Status Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#171515] p-4 rounded-2xl border border-white/10">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order #, customer, or phone..."
            className="w-full bg-[#2B2625] text-xs text-white pl-9 pr-4 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-[#C5A880]"
          />
          <Search className="w-4 h-4 text-[#A8A29E] absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#A8A29E]">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#2B2625] text-white text-xs p-2 rounded-xl border border-white/10 focus:outline-none"
          >
            <option value="all">All Orders ({orders.length})</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#171515] rounded-2xl border border-white/10 overflow-hidden shadow-xs">
        <div className="overflow-x-auto text-xs text-[#E8E2D8]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 bg-[#242121] text-[#A8A29E] uppercase text-[10px]">
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Fulfillment</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Invoice & Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-[#2B2625]/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#C5A880]">
                    #{ord.orderNumber}
                  </td>
                  <td className="py-3 px-3 text-[#A8A29E]">
                    {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-white block">{ord.customerName}</span>
                    <span className="text-[10px] text-[#A8A29E]">{ord.customerPhone}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="flex items-center gap-1.5">
                      {ord.deliveryMethod === 'home_delivery' ? (
                        <Truck className="w-3.5 h-3.5 text-blue-400" />
                      ) : (
                        <Building className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      <span>{ord.deliveryMethod === 'home_delivery' ? 'Home Delivery' : 'Showroom Pickup'}</span>
                    </span>
                  </td>
                  <td className="py-3 px-3 uppercase text-[11px] font-semibold text-white">
                    {ord.paymentMethod}
                  </td>
                  <td className="py-3 px-3 font-bold text-white text-sm">
                    {formatINR(ord.totalAmount)}
                  </td>
                  <td className="py-3 px-3">
                    <select
                      value={ord.status}
                      onChange={(e) => handleStatusChange(ord.id, e.target.value as OrderStatus)}
                      className="bg-[#2B2625] text-white text-[11px] p-1.5 rounded-lg border border-white/10 font-medium focus:outline-none cursor-pointer"
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/order-success?orderId=${ord.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2B2625] hover:bg-[#581825] text-white text-xs font-semibold transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>Print GST Invoice</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
