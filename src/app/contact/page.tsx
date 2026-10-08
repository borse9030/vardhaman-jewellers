'use client';

import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, MessageCircle, Send, CheckCircle2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { createGeneralEnquiry } from '@/lib/db/enquiryService';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    await createGeneralEnquiry({
      customerName: name,
      customerPhone: phone,
      customerEmail: email || 'contact@example.com',
      type: 'Contact',
      message,
    });
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-8 py-10 sm:py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#9A7B4F]">
            Dedicated Assistance
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1818] mt-2">
            Contact Vardhaman Jewellers
          </h1>
          <p className="text-xs sm:text-sm text-[#78716C] mt-2">
            Reach our jewellery specialists for custom bridal trousseau orders, gold rate inquiries, or showroom appointments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Contact Details */}
          <div className="md:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-[#E8E2D8] shadow-xs space-y-6">
            <h2 className="font-serif text-lg font-bold text-[#1A1818]">Showroom Concierge</h2>

            <div className="space-y-4 text-xs text-[#57534E]">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#C5A880] mt-0.5" />
                <div>
                  <strong className="block text-[#1A1818]">Telephone Support</strong>
                  <span>+91 257 222 4589 (Jalgaon)</span>
                  <br />
                  <span>+91 20 2445 8899 (Pune)</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MessageCircle className="w-4 h-4 text-emerald-600 mt-0.5" />
                <div>
                  <strong className="block text-[#1A1818]">WhatsApp Concierge</strong>
                  <a
                    href="https://wa.me/919822123456"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 font-semibold hover:underline"
                  >
                    +91 98221 23456 (Instant Chat)
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#C5A880] mt-0.5" />
                <div>
                  <strong className="block text-[#1A1818]">Email Inquiries</strong>
                  <span>care@vardhamanjewellers.in</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#C5A880] mt-0.5" />
                <div>
                  <strong className="block text-[#1A1818]">Operating Hours</strong>
                  <span>Mon – Sun: 10:00 AM – 8:30 PM (Open all 7 days)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-[#E8E2D8] shadow-xs">
            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <h3 className="font-serif text-xl font-bold text-[#1A1818]">Message Dispatched</h3>
                <p className="text-xs text-[#78716C] mt-2">
                  Thank you for contacting us. A senior concierge will respond within 2 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <h2 className="font-serif text-lg font-bold text-[#1A1818] mb-2">Send an Enquiry</h2>
                <div>
                  <label className="block font-semibold text-[#2B2625] mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8E2D8]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#2B2625] mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8E2D8]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#2B2625] mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8E2D8]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-[#2B2625] mb-1">Your Message / Design Query *</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what you are looking for..."
                    className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8E2D8]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#581825] hover:bg-[#380B12] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
