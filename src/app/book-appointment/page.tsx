'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  User,
  Phone,
  Mail,
  ArrowRight,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { createAppointment } from '@/lib/db/enquiryService';
import { getAllStores } from '@/lib/db/storeService';
import { StoreLocation, AppointmentPurpose } from '@/types';

function BookAppointmentContent() {
  const searchParams = useSearchParams();
  const preselectedStoreId = searchParams.get('store') || '';

  const [stores, setStores] = useState<StoreLocation[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState(preselectedStoreId);
  const [purpose, setPurpose] = useState<AppointmentPurpose>('Wedding Consultation');
  const [date, setDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [timeSlot, setTimeSlot] = useState('02:00 PM - 03:30 PM');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedNumber, setConfirmedNumber] = useState<string | null>(null);

  useEffect(() => {
    getAllStores().then((list) => {
      setStores(list);
      if (!selectedStoreId && list.length > 0) {
        setSelectedStoreId(list[0].id);
      }
    });
  }, [selectedStoreId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    setIsSubmitting(true);
    const store = stores.find((s) => s.id === selectedStoreId) || stores[0];

    try {
      const apt = await createAppointment({
        customerName: name,
        customerPhone: phone,
        customerEmail: email || 'not-provided@example.com',
        preferredStoreId: store?.id || 'store-jalgaon',
        preferredStoreName: store?.name || 'Jalgaon Flagship Store',
        date,
        timeSlot,
        purpose,
        notes,
      });

      setConfirmedNumber(apt.appointmentNumber);
    } catch (e) {
      console.error('Failed to create appointment:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const purposes: AppointmentPurpose[] = [
    'Wedding Consultation',
    'Jewellery Shopping',
    'Custom Design',
    'Gold Exchange',
    'Valuation',
    'Repair',
  ];

  const timeSlots = [
    '11:00 AM - 12:30 PM (Morning Slot)',
    '02:00 PM - 03:30 PM (Afternoon Lounge)',
    '04:30 PM - 06:00 PM (Evening Preview)',
    '06:30 PM - 08:00 PM (Twilight Viewing)',
  ];

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-8 py-8 sm:py-16 pb-24 lg:pb-16">
      <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#9A7B4F]">
          Exclusive VIP Consultation
        </span>
        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#1A1818] mt-1.5 sm:mt-2">
          Book an In-Store Viewing
        </h1>
        <p className="text-xs sm:text-sm text-[#78716C] mt-2 leading-relaxed">
          Reserve private time in our Bridal Lounge or Diamond Boutique. Receive undivided guidance from our senior jewellery masters.
        </p>
      </div>

      {confirmedNumber ? (
        <div className="bg-white p-8 sm:p-12 rounded-2xl border border-[#E8E2D8] shadow-md text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4 text-emerald-600">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#1A1818]">Appointment Reserved!</h2>
          <p className="text-xs text-[#78716C] mt-1 mb-4">
            Appointment Number: <strong className="text-[#581825] font-mono text-sm">{confirmedNumber}</strong>
          </p>
          <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E8E2D8] text-xs text-[#2B2625] text-left space-y-1.5 mb-6">
            <p><strong>Customer:</strong> {name} ({phone})</p>
            <p><strong>Date & Time:</strong> {date} ({timeSlot})</p>
            <p><strong>Showroom:</strong> {stores.find((s) => s.id === selectedStoreId)?.name}</p>
            <p><strong>Purpose:</strong> {purpose}</p>
          </div>
          <p className="text-xs text-[#57534E] leading-relaxed mb-6">
            A confirmation SMS & WhatsApp message has been dispatched. Our store concierge looks forward to welcoming you with refreshments.
          </p>
          <button
            onClick={() => {
              setConfirmedNumber(null);
              setName('');
              setPhone('');
            }}
            className="px-6 py-2.5 rounded-full bg-[#581825] text-white text-xs font-bold hover:bg-[#380B12]"
          >
            Book Another Appointment
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-10 rounded-2xl border border-[#E8E2D8] shadow-sm space-y-6">
          {/* 1. Purpose */}
          <div>
            <label className="block text-xs font-bold text-[#1A1818] uppercase tracking-wider mb-2">
              1. Consultation Purpose
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              {purposes.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPurpose(p)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                    purpose === p
                      ? 'bg-[#581825] text-white border-[#581825] shadow-xs'
                      : 'bg-[#FAF7F2] text-[#2B2625] border-[#E8E2D8] hover:border-[#581825]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Store Location */}
          <div className="pt-4 border-t border-[#F0ECE4]">
            <label className="block text-xs font-bold text-[#1A1818] uppercase tracking-wider mb-2">
              2. Select Showroom
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {stores.map((s) => (
                <label
                  key={s.id}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    selectedStoreId === s.id
                      ? 'bg-[#FAF7F2] border-[#581825] ring-1 ring-[#581825]'
                      : 'border-[#E8E2D8] hover:border-[#C5A880]'
                  }`}
                >
                  <input
                    type="radio"
                    name="store"
                    checked={selectedStoreId === s.id}
                    onChange={() => setSelectedStoreId(s.id)}
                    className="accent-[#581825] mt-1"
                  />
                  <div>
                    <span className="font-serif font-bold text-[#1A1818] block">{s.name}</span>
                    <span className="text-[11px] text-[#78716C] block mt-0.5">{s.address}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 3. Date & Time */}
          <div className="pt-4 border-t border-[#F0ECE4] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#2B2625] mb-1">Preferred Date *</label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8E2D8] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#2B2625] mb-1">Preferred Time Slot *</label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8E2D8] focus:outline-none"
              >
                {timeSlots.map((ts, i) => (
                  <option key={i} value={ts}>{ts}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. Contact Details */}
          <div className="pt-4 border-t border-[#F0ECE4] space-y-3 text-xs">
            <h3 className="text-xs font-bold text-[#1A1818] uppercase tracking-wider mb-2">
              3. Guest Details
            </h3>

            <div>
              <label className="block font-semibold text-[#2B2625] mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Shraddha Patil"
                className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8E2D8] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#2B2625] mb-1">Mobile Number (For WhatsApp / SMS) *</label>
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
                <label className="block font-semibold text-[#2B2625] mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="shraddha@example.com"
                  className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8E2D8] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#2B2625] mb-1">Special Design Requests (Optional)</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Interested in viewing heavy antique chokers with matching jhumkas..."
                className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8E2D8] focus:outline-none"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || !name || !phone}
            className="w-full py-3.5 rounded-xl bg-[#581825] hover:bg-[#380B12] text-white font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
          >
            <span>{isSubmitting ? 'Confirming Reservation...' : 'Confirm In-Store Appointment'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
}

export default function BookAppointmentPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="p-12 text-center text-xs">Loading appointment form...</div>}>
          <BookAppointmentContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
