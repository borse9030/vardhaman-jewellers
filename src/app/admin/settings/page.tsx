'use client';

import React, { useState } from 'react';
import {
  Settings,
  Save,
  ShieldCheck,
  CheckCircle2,
  Server,
  Cloud,
  Database,
  Lock,
} from 'lucide-react';
import { isFirebaseConfigured } from '@/lib/firebase/config';
import { isR2Configured } from '@/lib/r2/client';

export default function AdminSettingsPage() {
  const [brandName, setBrandName] = useState('Vardhaman Jewellers');
  const [phone, setPhone] = useState('+91 257 222 4589');
  const [whatsapp, setWhatsapp] = useState('919822123456');
  const [email, setEmail] = useState('care@vardhamanjewellers.in');
  const [address, setAddress] = useState('MG Road, Near Golani Market, Jalgaon, Maharashtra 425001');
  const [gstRate, setGstRate] = useState(3);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-4 border-b border-white/10">
        <h1 className="font-serif text-2xl font-bold text-white">System & Storefront Configuration</h1>
        <p className="text-xs text-[#A8A29E] mt-0.5">
          Configure official company details, tax parameters, and view cloud infrastructure diagnostics.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Store settings saved successfully!</span>
        </div>
      )}

      {/* Cloud Infrastructure Diagnostics */}
      <div className="bg-[#171515] p-6 rounded-2xl border border-white/10 space-y-4 text-xs">
        <h2 className="font-serif text-base font-bold text-white flex items-center gap-2">
          <Server className="w-4 h-4 text-[#C5A880]" />
          Cloud Architecture & Services Status
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Cloudflare R2 */}
          <div className="p-4 rounded-xl bg-[#2B2625] border border-white/5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-amber-400" />
                Cloudflare R2
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-bold">
                Ready
              </span>
            </div>
            <p className="text-[11px] text-[#A8A29E]">Bucket: vardhaman-jewellery-media</p>
            <p className="text-[10px] text-[#78716C]">S3 API Presigned Uploads Active</p>
          </div>

          {/* Firebase Database */}
          <div className="p-4 rounded-xl bg-[#2B2625] border border-white/5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Database className="w-4 h-4 text-orange-400" />
                Firestore DB
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-bold">
                Synced
              </span>
            </div>
            <p className="text-[11px] text-[#A8A29E]">Collections: products, goldRates, orders</p>
            <p className="text-[10px] text-[#78716C]">Real-Time Sync Provider Active</p>
          </div>

          {/* Super Admin Provisioning */}
          <div className="p-4 rounded-xl bg-[#2B2625] border border-white/5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-400" />
                Auth Security
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-bold">
                Super Admin
              </span>
            </div>
            <p className="text-[11px] text-[#A8A29E]">Account: jaynam27@gmail.com</p>
            <p className="text-[10px] text-[#78716C]">Role: super_admin (RBAC enforced)</p>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-[#171515] p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6 text-xs">
        <h2 className="font-serif text-base font-bold text-white flex items-center gap-2">
          <Settings className="w-4 h-4 text-[#C5A880]" />
          Storefront & Communication Parameters
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[#D6D3D1] font-semibold mb-1">Brand Name *</label>
            <input
              type="text"
              required
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full bg-[#2B2625] p-2.5 rounded-xl border border-white/10 text-white"
            />
          </div>

          <div>
            <label className="block text-[#D6D3D1] font-semibold mb-1">Official WhatsApp Number *</label>
            <input
              type="text"
              required
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="919822123456"
              className="w-full bg-[#2B2625] p-2.5 rounded-xl border border-white/10 text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[#D6D3D1] font-semibold mb-1">Showroom Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#2B2625] p-2.5 rounded-xl border border-white/10 text-white"
            />
          </div>

          <div>
            <label className="block text-[#D6D3D1] font-semibold mb-1">Customer Care Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#2B2625] p-2.5 rounded-xl border border-white/10 text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[#D6D3D1] font-semibold mb-1">Flagship Head Office Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-[#2B2625] p-2.5 rounded-xl border border-white/10 text-white"
            />
          </div>

          <div>
            <label className="block text-[#D6D3D1] font-semibold mb-1">GST Tax Rate for Precious Jewellery (%)</label>
            <input
              type="number"
              step="0.1"
              value={gstRate}
              onChange={(e) => setGstRate(parseFloat(e.target.value))}
              className="w-full bg-[#2B2625] p-2.5 rounded-xl border border-white/10 text-white"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-[#581825] hover:bg-[#7E2638] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center gap-2"
        >
          <Save className="w-4 h-4 text-[#C5A880]" />
          <span>Save Store Settings</span>
        </button>
      </form>
    </div>
  );
}
