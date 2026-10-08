'use client';

import React, { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCatalog from '@/components/shop/ProductCatalog';

export default function SilverJewelleryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="p-12 text-center text-xs">Loading silver collection...</div>}>
          <ProductCatalog
            initialType="Silver"
            pageTitle="Pure 925 Sterling Silver Collection"
            pageSubtitle="Auspicious Pooja thalis, silver coins, diyas, and handcrafted silver payals."
          />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
