'use client';

import React, { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCatalog from '@/components/shop/ProductCatalog';

export default function CollectionsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="p-12 text-center text-xs">Loading collections...</div>}>
          <ProductCatalog
            pageTitle="Heritage & Contemporary Collections"
            pageSubtitle="Explore our thematic lines: Khandesh Royal Heritage, Solitaire Radiance, and Pavitra Silver."
          />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
