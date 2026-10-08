'use client';

import React, { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCatalog from '@/components/shop/ProductCatalog';

export default function BanglesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="p-12 text-center text-xs">Loading bangles...</div>}>
          <ProductCatalog
            initialCategory="Bangles"
            pageTitle="Khandeshi Patlya, Pichodi & Kadas"
            pageSubtitle="Solid 22K gold bridal bangles, diamond bracelets, and heritage embossed kadas."
          />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
