'use client';

import React, { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCatalog from '@/components/shop/ProductCatalog';

export default function RingsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="p-12 text-center text-xs">Loading rings...</div>}>
          <ProductCatalog
            initialCategory="Rings"
            pageTitle="Gold Rings & Diamond Solitaires"
            pageSubtitle="Bridal cocktail rings, couple bands, and commanding 22K men's signet rings."
          />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
