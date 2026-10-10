'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  User,
  MapPin,
  Package,
  Heart,
  Calendar,
  LogOut,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Crown,
  ArrowRight,
  TrendingUp,
  Gem,
  Tag,
  Settings,
  MessageSquare,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';

import OtpLoginForm from '@/components/auth/OtpLoginForm';

export default function ProfilePage() {
  const { customer, adminUser, isAdminLoggedIn, isOwnerLoggedIn, ownerProfile, logoutCustomer, logoutAdmin } = useAuth();

  // Address state
  const [addresses, setAddresses] = useState([
    {
      id: 'addr-1',
      fullName: 'Priya Kulkarni',
      phone: '+91 98223 44556',
      addressLine1: 'Flat 402, Royal Palms, Laxmi Road',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411030',
      isDefault: true,
    },
  ]);

  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newPin, setNewPin] = useState('');



  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet || !newCity || !newPin) return;

    setAddresses([
      ...addresses,
      {
        id: `addr-${Date.now()}`,
        fullName: customer?.name || 'Valued Patron',
        phone: customer?.phone || '+91 98220 00000',
        addressLine1: newStreet,
        city: newCity,
        state: 'Maharashtra',
        pincode: newPin,
        isDefault: false,
      },
    ]);
    setShowAddAddress(false);
    setNewStreet('');
    setNewCity('');
    setNewPin('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-8 py-10 sm:py-16">
        {!customer && !adminUser ? (
          <div className="py-4">
            <OtpLoginForm redirectAfterLogin="/profile" sourceContext="storefront" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Profile Overview Card */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8E2D8] shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FAF7F2] to-[#EAE0D0] border-2 border-[#C5A880] flex items-center justify-center font-serif text-lg font-bold text-[#581825] shadow-xs">
                  {customer?.name?.[0]?.toUpperCase() || adminUser?.name?.[0]?.toUpperCase() || 'V'}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1818]">
                      {customer?.name || adminUser?.name || 'Valued Patron'}
                    </h1>
                    {(isAdminLoggedIn || isOwnerLoggedIn) && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#581825] text-[#DFCDAE] border border-[#C5A880]/40">
                        <Crown className="w-3 h-3 text-[#C5A880]" />
                        <span>Store Head &amp; Owner</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#78716C] mt-0.5">{customer?.email || adminUser?.email}</p>
                  {(customer?.phone || adminUser?.phone) && (
                    <p className="text-xs text-[#9A7B4F] font-medium">{customer?.phone || adminUser?.phone}</p>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  logoutCustomer();
                  logoutAdmin();
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E8E2D8] text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>

            {/* EXCLUSIVE: Executive Store Control Center (STRICTLY FOR AUTHORIZED OWNERS) */}
            {(isAdminLoggedIn || isOwnerLoggedIn) && (
              <div className="bg-gradient-to-br from-[#2D0A11] via-[#1E060B] to-[#120306] border border-[#C5A880]/40 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
                {/* Gold Glow Accent */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#C5A880]/20 via-transparent to-transparent pointer-events-none"></div>

                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 relative z-10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#C5A880]/20 text-[#DFCDAE] border border-[#C5A880]/40">
                        <Crown className="w-3 h-3 text-[#C5A880]" />
                        <span>Executive Control Center</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        Full Website Control
                      </span>
                    </div>
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-white pt-1">
                      Store Head &amp; Owner Administration
                    </h2>
                    <p className="text-xs text-[#D6D3D1] max-w-2xl leading-relaxed">
                      You are logged in as an authorized owner of Vardhaman Jewellers. You have complete operational control to update live bullion rates, manage the jewellery catalogue, track customer orders, and configure promotions.
                    </p>
                  </div>

                  <Link
                    href="/admin"
                    className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#DFCDAE] text-[#1A1818] font-bold text-xs uppercase tracking-wider transition-all hover:scale-105 shadow-md group"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#581825]" />
                    <span>Open Admin Dashboard</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>

                {/* Quick Owner Action Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 relative z-10 pt-2 border-t border-white/10">
                  <Link
                    href="/admin/gold-rates"
                    className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#C5A880]/50 transition-all text-center flex flex-col items-center group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#581825] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-4 h-4 text-[#C5A880]" />
                    </div>
                    <span className="text-xs font-bold text-white block">Gold Rates</span>
                    <span className="text-[10px] text-[#A8A29E] mt-0.5">Live Bullion</span>
                  </Link>

                  <Link
                    href="/admin/products"
                    className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#C5A880]/50 transition-all text-center flex flex-col items-center group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#581825] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Gem className="w-4 h-4 text-[#C5A880]" />
                    </div>
                    <span className="text-xs font-bold text-white block">Catalogue</span>
                    <span className="text-[10px] text-[#A8A29E] mt-0.5">4,000+ Items</span>
                  </Link>

                  <Link
                    href="/admin/orders"
                    className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#C5A880]/50 transition-all text-center flex flex-col items-center group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#581825] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Package className="w-4 h-4 text-[#C5A880]" />
                    </div>
                    <span className="text-xs font-bold text-white block">Orders</span>
                    <span className="text-[10px] text-[#A8A29E] mt-0.5">Invoices &amp; Ship</span>
                  </Link>

                  <Link
                    href="/admin/enquiries"
                    className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#C5A880]/50 transition-all text-center flex flex-col items-center group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#581825] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <MessageSquare className="w-4 h-4 text-[#C5A880]" />
                    </div>
                    <span className="text-xs font-bold text-white block">Enquiries</span>
                    <span className="text-[10px] text-[#A8A29E] mt-0.5">Appointments</span>
                  </Link>

                  <Link
                    href="/admin/coupons"
                    className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#C5A880]/50 transition-all text-center flex flex-col items-center group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#581825] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Tag className="w-4 h-4 text-[#C5A880]" />
                    </div>
                    <span className="text-xs font-bold text-white block">Coupons</span>
                    <span className="text-[10px] text-[#A8A29E] mt-0.5">Promotions</span>
                  </Link>

                  <Link
                    href="/admin/settings"
                    className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#C5A880]/50 transition-all text-center flex flex-col items-center group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#581825] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Settings className="w-4 h-4 text-[#C5A880]" />
                    </div>
                    <span className="text-xs font-bold text-white block">Settings</span>
                    <span className="text-[10px] text-[#A8A29E] mt-0.5">Store Config</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Quick Navigation Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link
                href="/orders"
                className="p-5 bg-white rounded-2xl border border-[#E8E2D8] hover:border-[#581825] transition-colors shadow-2xs flex flex-col items-center text-center"
              >
                <Package className="w-6 h-6 text-[#581825] mb-2" />
                <span className="text-xs font-bold text-[#1A1818]">My Orders</span>
                <span className="text-[10px] text-[#78716C] mt-0.5">Track Shipments</span>
              </Link>

              <Link
                href="/wishlist"
                className="p-5 bg-white rounded-2xl border border-[#E8E2D8] hover:border-[#581825] transition-colors shadow-2xs flex flex-col items-center text-center"
              >
                <Heart className="w-6 h-6 text-[#581825] mb-2" />
                <span className="text-xs font-bold text-[#1A1818]">Wishlist</span>
                <span className="text-[10px] text-[#78716C] mt-0.5">Saved Pieces</span>
              </Link>

              <Link
                href="/book-appointment"
                className="p-5 bg-white rounded-2xl border border-[#E8E2D8] hover:border-[#581825] transition-colors shadow-2xs flex flex-col items-center text-center"
              >
                <Calendar className="w-6 h-6 text-[#581825] mb-2" />
                <span className="text-xs font-bold text-[#1A1818]">Appointments</span>
                <span className="text-[10px] text-[#78716C] mt-0.5">Showroom Visits</span>
              </Link>

              <Link
                href="/sell-gold"
                className="p-5 bg-white rounded-2xl border border-[#E8E2D8] hover:border-[#581825] transition-colors shadow-2xs flex flex-col items-center text-center"
              >
                <ShieldCheck className="w-6 h-6 text-[#581825] mb-2" />
                <span className="text-xs font-bold text-[#1A1818]">Gold Exchange</span>
                <span className="text-[10px] text-[#78716C] mt-0.5">Valuation Leads</span>
              </Link>
            </div>

            {/* Saved Addresses Section */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8E2D8] shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE4]">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#581825]" />
                  <h2 className="font-serif text-base font-bold text-[#1A1818]">
                    Saved Delivery Addresses
                  </h2>
                </div>
                <button
                  onClick={() => setShowAddAddress(!showAddAddress)}
                  className="flex items-center gap-1 text-xs font-bold text-[#581825] hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </button>
              </div>

              {showAddAddress && (
                <form onSubmit={handleAddAddress} className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E8E2D8] space-y-3 text-xs">
                  <h3 className="font-bold text-[#1A1818]">New Address</h3>
                  <div>
                    <label className="block text-[#78716C] mb-1">Street Address</label>
                    <input
                      type="text"
                      required
                      value={newStreet}
                      onChange={(e) => setNewStreet(e.target.value)}
                      placeholder="Flat No, Building, Street"
                      className="w-full bg-white p-2 rounded-lg border border-[#E8E2D8]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#78716C] mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        placeholder="Pune / Jalgaon"
                        className="w-full bg-white p-2 rounded-lg border border-[#E8E2D8]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#78716C] mb-1">Pincode</label>
                      <input
                        type="text"
                        required
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value)}
                        placeholder="411030"
                        className="w-full bg-white p-2 rounded-lg border border-[#E8E2D8]"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button type="submit" className="px-4 py-2 bg-[#581825] text-white rounded-lg font-bold">Save Address</button>
                    <button type="button" onClick={() => setShowAddAddress(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div key={addr.id} className="p-4 rounded-xl border border-[#E8E2D8] bg-[#FAF7F2]/50 text-xs text-[#57534E] space-y-1">
                    <div className="flex items-center justify-between font-bold text-[#1A1818]">
                      <span>{addr.fullName}</span>
                      {addr.isDefault && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p>{addr.addressLine1}</p>
                    <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                    <p className="text-[11px] text-[#78716C] pt-1">Contact: {addr.phone}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
