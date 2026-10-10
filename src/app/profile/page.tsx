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
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';

import OtpLoginForm from '@/components/auth/OtpLoginForm';

export default function ProfilePage() {
  const { customer, logoutCustomer } = useAuth();

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
        {!customer ? (
          <div className="py-4">
            <OtpLoginForm redirectAfterLogin="/profile" sourceContext="storefront" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Profile Overview Card */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8E2D8] shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#FAF7F2] border border-[#C5A880] flex items-center justify-center font-serif text-lg font-bold text-[#581825]">
                  {customer.name[0]?.toUpperCase() || 'V'}
                </div>
                <div>
                  <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1818]">
                    {customer.name}
                  </h1>
                  <p className="text-xs text-[#78716C] mt-0.5">{customer.email}</p>
                  {customer.phone && <p className="text-xs text-[#78716C]">{customer.phone}</p>}
                </div>
              </div>

              <button
                onClick={logoutCustomer}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E8E2D8] text-xs font-semibold text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>

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
