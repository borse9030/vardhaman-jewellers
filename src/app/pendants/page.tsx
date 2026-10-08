'use client';

import React, { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCatalog from '@/components/shop/ProductCatalog';

export default function PendantsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="p-12 text-center text-xs">Loading pendants...</div>}>
          <ProductCatalog
            initialCategory="Pendants"
            pageTitle="Temple & Diamond Pendants"
            pageSubtitle="Devotional Ganesha medallions, floral diamond drops, and daily wear gold lockets."
          />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
