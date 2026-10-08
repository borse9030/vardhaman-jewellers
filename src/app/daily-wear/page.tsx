'use client';

import React, { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCatalog from '@/components/shop/ProductCatalog';

export default function DailyWearPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="p-12 text-center text-xs">Loading daily wear collection...</div>}>
          <ProductCatalog
            pageTitle="Everyday Fine Jewellery"
            pageSubtitle="Lightweight 22K & 18K gold and diamond pieces crafted for comfort, daily grace, and office wear."
          />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
