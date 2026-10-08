'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Calendar,
  Scale,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  Edit2,
  Check,
} from 'lucide-react';
import {
  getAllGoldEnquiries,
  updateGoldEnquiry,
  getAllAppointments,
  updateAppointmentStatus,
  getAllGeneralEnquiries,
} from '@/lib/db/enquiryService';
import { formatINR } from '@/services/pricingEngine';
import { GoldSellEnquiry, Appointment, GeneralEnquiry, GoldEnquiryStatus } from '@/types';

export default function AdminEnquiriesPage() {
  const [activeTab, setActiveTab] = useState<'gold' | 'appointments' | 'general'>('gold');

  const [goldEnquiries, setGoldEnquiries] = useState<GoldSellEnquiry[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [generalEnquiries, setGeneralEnquiries] = useState<GeneralEnquiry[]>([]);

  const loadData = () => {
    getAllGoldEnquiries().then((g) => setGoldEnquiries(g));
    getAllAppointments().then((a) => setAppointments(a));
    getAllGeneralEnquiries().then((gen) => setGeneralEnquiries(gen));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGoldStatusChange = async (id: string, newStatus: GoldEnquiryStatus) => {
    await updateGoldEnquiry(id, { status: newStatus });
    loadData();
  };

  const handleAppointmentStatus = async (id: string, status: Appointment['status']) => {
    await updateAppointmentStatus(id, status);
    loadData();
  };

  const goldStatuses: GoldEnquiryStatus[] = [
    'New',
    'Contacted',
    'Inspection Scheduled',
    'Under Evaluation',
    'Offer Made',
    'Accepted',
    'Completed',
    'Rejected',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-white/10">
        <h1 className="font-serif text-2xl font-bold text-white">
          Enquiries, Valuation & Appointments Desk
        </h1>
        <p className="text-xs text-[#A8A29E] mt-0.5">
          Process customer scrap gold exchange leads, showroom bridal viewing reservations, and product consultations.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('gold')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'gold'
              ? 'bg-[#581825] text-white border border-[#C5A880]/30 shadow-sm'
              : 'bg-[#171515] text-[#A8A29E] hover:text-white'
          }`}
        >
          <Scale className="w-4 h-4 text-[#C5A880]" />
          <span>Gold Exchange Leads ({goldEnquiries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'appointments'
              ? 'bg-[#581825] text-white border border-[#C5A880]/30 shadow-sm'
              : 'bg-[#171515] text-[#A8A29E] hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4 text-[#C5A880]" />
          <span>Showroom Appointments ({appointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'general'
              ? 'bg-[#581825] text-white border border-[#C5A880]/30 shadow-sm'
              : 'bg-[#171515] text-[#A8A29E] hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-[#C5A880]" />
          <span>Product & WhatsApp Enquiries ({generalEnquiries.length})</span>
        </button>
      </div>

      {/* 1. Gold Sell / Exchange Enquiries */}
      {activeTab === 'gold' && (
        <div className="bg-[#171515] rounded-2xl border border-white/10 overflow-hidden shadow-xs">
          <div className="overflow-x-auto text-xs text-[#E8E2D8]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 bg-[#242121] text-[#A8A29E] uppercase text-[10px]">
                  <th className="py-3 px-4">Ref #</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Item Type</th>
                  <th className="py-3 px-3">Purity & Wt</th>
                  <th className="py-3 px-3">Condition</th>
                  <th className="py-3 px-3">Indicative Valuation</th>
                  <th className="py-3 px-3">Preferred Store</th>
                  <th className="py-3 px-4 text-right">Lifecycle Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {goldEnquiries.map((g) => (
                  <tr key={g.id} className="hover:bg-[#2B2625]/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#C5A880]">{g.enquiryNumber}</td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-white block">{g.customerName}</span>
                      <span className="text-[10px] text-[#A8A29E]">{g.customerPhone}</span>
                    </td>
                    <td className="py-3 px-3">{g.itemType}</td>
                    <td className="py-3 px-3 font-semibold text-white">
                      {g.goldPurity} • {g.estimatedWeight}g
                    </td>
                    <td className="py-3 px-3 text-[#A8A29E]">{g.condition}</td>
                    <td className="py-3 px-3 font-bold text-emerald-400">
                      {formatINR(g.estimatedValuation)}
                    </td>
                    <td className="py-3 px-3 text-[#A8A29E]">{g.storePreference}</td>
                    <td className="py-3 px-4 text-right">
                      <select
                        value={g.status}
                        onChange={(e) => handleGoldStatusChange(g.id, e.target.value as GoldEnquiryStatus)}
                        className="bg-[#2B2625] text-white text-[11px] p-1.5 rounded-lg border border-white/10 font-semibold focus:outline-none cursor-pointer"
                      >
                        {goldStatuses.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Appointments */}
      {activeTab === 'appointments' && (
        <div className="bg-[#171515] rounded-2xl border border-white/10 overflow-hidden shadow-xs">
          <div className="overflow-x-auto text-xs text-[#E8E2D8]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 bg-[#242121] text-[#A8A29E] uppercase text-[10px]">
                  <th className="py-3 px-4">Apt #</th>
                  <th className="py-3 px-3">Guest Details</th>
                  <th className="py-3 px-3">Date & Slot</th>
                  <th className="py-3 px-3">Showroom</th>
                  <th className="py-3 px-3">Purpose</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {appointments.map((a) => (
                  <tr key={a.id} className="hover:bg-[#2B2625]/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#C5A880]">{a.appointmentNumber}</td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-white block">{a.customerName}</span>
                      <span className="text-[10px] text-[#A8A29E]">{a.customerPhone}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-white block">{a.date}</span>
                      <span className="text-[10px] text-[#A8A29E]">{a.timeSlot}</span>
                    </td>
                    <td className="py-3 px-3">{a.preferredStoreName}</td>
                    <td className="py-3 px-3 font-semibold text-[#DFCDAE]">{a.purpose}</td>
                    <td className="py-3 px-4 text-right">
                      <select
                        value={a.status}
                        onChange={(e) => handleAppointmentStatus(a.id, e.target.value as any)}
                        className="bg-[#2B2625] text-white text-[11px] p-1.5 rounded-lg border border-white/10 font-semibold focus:outline-none cursor-pointer"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. General Enquiries */}
      {activeTab === 'general' && (
        <div className="bg-[#171515] rounded-2xl border border-white/10 overflow-hidden shadow-xs">
          <div className="overflow-x-auto text-xs text-[#E8E2D8]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 bg-[#242121] text-[#A8A29E] uppercase text-[10px]">
                  <th className="py-3 px-4">Ref #</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Product Link / Context</th>
                  <th className="py-3 px-3">Customer Message</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {generalEnquiries.map((gen) => (
                  <tr key={gen.id} className="hover:bg-[#2B2625]/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#C5A880]">{gen.enquiryNumber}</td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-white block">{gen.customerName}</span>
                      <span className="text-[10px] text-[#A8A29E]">{gen.customerPhone}</span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-white">{gen.type}</td>
                    <td className="py-3 px-3 text-[#A8A29E]">{gen.productName || 'General Store Query'}</td>
                    <td className="py-3 px-3 max-w-xs truncate text-[#D6D3D1]">{gen.message}</td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-400">{gen.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
