'use client';

import React, { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCatalog from '@/components/shop/ProductCatalog';

export default function DiamondJewelleryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="p-12 text-center text-xs">Loading diamond jewellery...</div>}>
          <ProductCatalog
            initialType="Diamond"
            pageTitle="Certified Natural Diamond Jewellery"
            pageSubtitle="Solitaire engagement rings, tennis bracelets, and diamond earrings certified by IGI & SGL laboratories."
          />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
