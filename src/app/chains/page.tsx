'use client';

import React, { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCatalog from '@/components/shop/ProductCatalog';

export default function ChainsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="p-12 text-center text-xs">Loading chains...</div>}>
          <ProductCatalog
            initialCategory="Chains"
            pageTitle="Solid 22K Gold Chains"
            pageSubtitle="Dubai links, rope chains, machine crafted link chains, and traditional thushi styles."
          />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
