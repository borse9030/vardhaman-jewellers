'use client';

import React, { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCatalog from '@/components/shop/ProductCatalog';

export default function MangalsutraPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="p-12 text-center text-xs">Loading mangalsutra collection...</div>}>
          <ProductCatalog
            initialCategory="Mangalsutra"
            pageTitle="Auspicious Maharashtrian Mangalsutras"
            pageSubtitle="Sacred twin-cup Wati designs, Kolhapuri Saaj, and contemporary diamond mangalsutras."
          />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
