'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  Gem,
  Scale,
  RefreshCw,
  Truck,
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="w-full bg-[#1A1818] text-[#FAF7F2] pt-10 sm:pt-16 pb-28 lg:pb-12 border-t border-[#C5A880]/30 select-none">
      {/* 1. Trust & Assurance Strip */}
      <div className="max-w-7xl mx-auto px-3 sm:px-8 mb-10 sm:mb-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-6 pb-8 sm:pb-12 border-b border-[#380B12]/80">
          <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl bg-[#2B2625]/40 border border-[#C5A880]/15">
            <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8 text-[#C5A880] mb-1.5 sm:mb-2" />
            <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white">BIS 916 Hallmark</h4>
            <p className="text-[10px] sm:text-[11px] text-[#A8A29E] mt-0.5 sm:mt-1">100% pure certified gold guaranteed</p>
          </div>

          <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl bg-[#2B2625]/40 border border-[#C5A880]/15">
            <Gem className="w-6 h-6 sm:w-8 sm:h-8 text-[#C5A880] mb-1.5 sm:mb-2" />
            <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white">Certified Diamonds</h4>
            <p className="text-[10px] sm:text-[11px] text-[#A8A29E] mt-0.5 sm:mt-1">SGL & IGI natural certified stones</p>
          </div>

          <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl bg-[#2B2625]/40 border border-[#C5A880]/15">
            <Scale className="w-6 h-6 sm:w-8 sm:h-8 text-[#C5A880] mb-1.5 sm:mb-2" />
            <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white">Transparent Pricing</h4>
            <p className="text-[10px] sm:text-[11px] text-[#A8A29E] mt-0.5 sm:mt-1">Clear net weight, rates, and making</p>
          </div>

          <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl bg-[#2B2625]/40 border border-[#C5A880]/15">
            <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 text-[#C5A880] mb-1.5 sm:mb-2" />
            <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white">Lifetime Exchange</h4>
            <p className="text-[10px] sm:text-[11px] text-[#A8A29E] mt-0.5 sm:mt-1">Assured buyback across all stores</p>
          </div>

          <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl bg-[#2B2625]/40 border border-[#C5A880]/15 col-span-2 sm:col-span-1 md:col-span-1">
            <Truck className="w-6 h-6 sm:w-8 sm:h-8 text-[#C5A880] mb-1.5 sm:mb-2" />
            <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white">Insured Shipping</h4>
            <p className="text-[10px] sm:text-[11px] text-[#A8A29E] mt-0.5 sm:mt-1">Tamper-proof transit insurance</p>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Navigation Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#2B2625]">
          {/* Brand Bio */}
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-2">
              <Link href="/" className="inline-block group" aria-label="Vardhaman Jewellers Home">
                <Image
                  src="/logo-gold.png"
                  alt="Vardhaman Jewellers"
                  width={200}
                  height={64}
                  className="h-11 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
                />
              </Link>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880] font-medium">Heritage & Purity Since 1984</p>
            </div>

            <p className="text-xs text-[#A8A29E] leading-relaxed max-w-sm">
              Rooted in the rich cultural soil of Maharashtra and Khandesh, Vardhaman Jewellers celebrates life’s most precious milestones with timeless hallmarked gold, certified solitaires, and royal bridal heirlooms.
            </p>

            <div className="pt-2 space-y-2 text-xs text-[#D6D3D1]">
              <div className="flex items-center gap-2.5">
                <Phone className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Customer Concierge: +91 257 222 4589 / +91 98221 23456</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>care@vardhamanjewellers.in</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Mon – Sun: 10:00 AM – 8:30 PM</span>
              </div>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C5A880] mb-4">
              Jewellery Categories
            </h4>
            <ul className="space-y-2.5 text-xs text-[#A8A29E]">
              <li><Link href="/necklaces" className="hover:text-white transition-colors">Temple Haars & Chokers</Link></li>
              <li><Link href="/bangles" className="hover:text-white transition-colors">Patlya, Pichodi & Kadas</Link></li>
              <li><Link href="/mangalsutra" className="hover:text-white transition-colors">Traditional Wati Mangalsutras</Link></li>
              <li><Link href="/diamond" className="hover:text-white transition-colors">Solitaire Engagement Rings</Link></li>
              <li><Link href="/earrings" className="hover:text-white transition-colors">Chandbalis & Jhumkas</Link></li>
              <li><Link href="/silver" className="hover:text-white transition-colors">Pure 925 Silver Pooja Articles</Link></li>
              <li><Link href="/wedding" className="hover:text-white transition-colors">Bridal Wedding Trousseau</Link></li>
            </ul>
          </div>

          {/* Services & Guidance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C5A880] mb-4">
              Services & Bullion
            </h4>
            <ul className="space-y-2.5 text-xs text-[#A8A29E]">
              <li><Link href="/gold-rate" className="hover:text-white transition-colors">Today's Live Gold Rate</Link></li>
              <li><Link href="/sell-gold" className="hover:text-white transition-colors">Sell / Exchange Old Gold</Link></li>
              <li><Link href="/book-appointment" className="hover:text-white transition-colors">Book VIP In-Store Appointment</Link></li>
              <li><Link href="/stores" className="hover:text-white transition-colors">Store Locator & Directions</Link></li>
              <li><Link href="/gold-buying-guide" className="hover:text-white transition-colors">22K vs 24K Gold Buying Guide</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">Our 40-Year Heritage Story</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">Frequently Asked Questions</Link></li>
            </ul>
          </div>

          {/* Concierge & Policies */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C5A880] mb-4">
              Assistance & Trust
            </h4>
            <ul className="space-y-2.5 text-xs text-[#A8A29E] mb-6">
              <li><Link href="/orders" className="hover:text-white transition-colors">Track Your Order</Link></li>
              <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping & Transit Insurance</Link></li>
              <li><Link href="/returns" className="hover:text-white transition-colors">Return & Buyback Policy</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>

            {/* Newsletter */}
            <div>
              <p className="text-[11px] text-[#A8A29E] mb-2">Subscribe to daily gold rate alerts:</p>
              {subscribed ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Subscribed successfully!</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex items-center">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                    placeholder="Enter email or mobile"
                    className="w-full bg-[#2B2625] text-xs px-3 py-2 rounded-l border border-[#C5A880]/30 focus:outline-none focus:border-[#C5A880] text-white"
                  />
                  <button
                    type="submit"
                    className="bg-[#C5A880] hover:bg-[#B89758] text-[#1A1818] px-3 py-2 rounded-r transition-colors"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* 3. Physical Stores Footnote */}
        <div className="py-6 border-b border-[#2B2625] text-xs text-[#78716C] flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-semibold text-[#D6D3D1]">Our Flagship Outlets:</span>
            <span>Jalgaon (MG Road)</span>
            <span>•</span>
            <span>Dhule (Agra Road)</span>
            <span>•</span>
            <span>Pune (Swargate)</span>
            <span>•</span>
            <span>Mumbai (Dadar West)</span>
          </div>
          <div className="text-[11px]">
            BIS Hallmark Reg. No: <strong className="text-[#A8A29E]">HM-MH-916-84210</strong>
          </div>
        </div>

        {/* 4. Bottom Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#78716C] gap-3">
          <p>© {new Date().getFullYear()} Vardhaman Jewellers. All Rights Reserved.</p>
          <p className="text-[#A8A29E]">
            Designed with devotion for authentic Indian luxury jewellery connoisseurs.
          </p>
        </div>
      </div>
    </footer>
  );
}
