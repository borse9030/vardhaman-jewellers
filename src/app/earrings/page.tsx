'use client';

import React, { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCatalog from '@/components/shop/ProductCatalog';

export default function EarringsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="p-12 text-center text-xs">Loading earrings...</div>}>
          <ProductCatalog
            initialCategory="Earrings"
            pageTitle="Chandbalis, Jhumkas & Ear Drops"
            pageSubtitle="Antique Mayura jhumkas, daily wear studs, and bridal chandeliers in 22K hallmarked gold."
          />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
