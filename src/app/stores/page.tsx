'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Navigation,
  Calendar,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getAllStores } from '@/lib/db/storeService';
import { StoreLocation } from '@/types';

export default function StoresPage() {
  const [stores, setStores] = useState<StoreLocation[]>([]);

  useEffect(() => {
    getAllStores().then((list) => setStores(list));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#9A7B4F]">
            Maharashtra Showrooms
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1818] mt-2">
            Visit Vardhaman Jewellers
          </h1>
          <p className="text-xs sm:text-sm text-[#78716C] mt-2 leading-relaxed">
            Experience our royal bridal lounges, computerized Karatmeter testing desks, and personalized master craftsman consultation in Jalgaon, Dhule, Pune, and Mumbai.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {stores.map((store) => (
            <div
              key={store.id}
              className="bg-white rounded-2xl border border-[#E8E2D8] luxury-card-shadow overflow-hidden flex flex-col justify-between"
            >
              <div className="relative h-60 w-full bg-[#FAF7F2]">
                <Image
                  src={store.images[0] || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80'}
                  alt={store.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 left-4 bg-[#581825] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {store.city} Outlet
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                <div>
                  <h2 className="font-serif text-xl font-bold text-[#1A1818]">
                    {store.name}
                  </h2>

                  <div className="mt-3 space-y-2 text-xs text-[#57534E]">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                      <span>{store.address}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-[#C5A880] shrink-0" />
                      <span>{store.phone}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-[#C5A880] shrink-0" />
                      <span>{store.email}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-[#C5A880] shrink-0" />
                      <span>{store.workingHours}</span>
                    </div>
                  </div>

                  {/* Available Services */}
                  <div className="mt-4 pt-3 border-t border-[#F0ECE4]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C] block mb-2">
                      In-Store Facilities:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {store.services.map((svc, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-[#FAF7F2] text-[#581825] border border-[#E8E2D8] px-2.5 py-0.5 rounded-full font-medium"
                        >
                          {svc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-[#F0ECE4] flex flex-wrap gap-2 text-xs">
                  <a
                    href={store.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#FAF7F2] hover:bg-[#E8E2D8] text-[#1A1818] font-semibold transition-colors flex items-center justify-center gap-1.5 border border-[#E8E2D8]"
                  >
                    <Navigation className="w-3.5 h-3.5 text-[#581825]" />
                    <span>Get Directions</span>
                  </a>

                  <a
                    href={`tel:${store.phone.replace(/[^0-9+]/g, '')}`}
                    className="py-2.5 px-4 rounded-xl border border-[#E8E2D8] text-[#581825] hover:bg-[#FAF7F2] font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>

                  <Link
                    href={`/book-appointment?store=${store.id}`}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#581825] hover:bg-[#380B12] text-white font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Book Appointment</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
