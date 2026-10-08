'use client';

import React, { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCatalog from '@/components/shop/ProductCatalog';

export default function WeddingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="p-12 text-center text-xs">Loading wedding collection...</div>}>
          <ProductCatalog
            pageTitle="The Royal Khandesh Wedding Trousseau"
            pageSubtitle="Exquisite bridal sets, antique temple chokers, raani haars, and sacred bridal kadas for the grand Indian wedding."
          />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
