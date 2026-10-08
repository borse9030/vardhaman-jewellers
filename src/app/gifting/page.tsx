'use client';

import React, { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCatalog from '@/components/shop/ProductCatalog';

export default function GiftingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="p-12 text-center text-xs">Loading gifting collection...</div>}>
          <ProductCatalog
            pageTitle="Precious Gifting Curations"
            pageSubtitle="Delight loved ones with timeless gold pendants, diamond rings, and auspicious silver coins."
          />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
