'use client';

import React, { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCatalog from '@/components/shop/ProductCatalog';

export default function NecklacesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="p-12 text-center text-xs">Loading necklaces...</div>}>
          <ProductCatalog
            initialCategory="Necklaces"
            pageTitle="Temple Haars, Chokers & Necklaces"
            pageSubtitle="Majestic 22K handcrafted nakshi haars, bikaneri kundan chokers, and royal bridal necklaces."
          />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
