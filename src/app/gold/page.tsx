'use client';

import React, { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCatalog from '@/components/shop/ProductCatalog';

export default function GoldJewelleryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="p-12 text-center text-xs">Loading gold jewellery...</div>}>
          <ProductCatalog
            initialType="Gold"
            pageTitle="22K & 24K Pure Gold Jewellery"
            pageSubtitle="Government BIS 916 Hallmarked creations with transparent live gold pricing."
          />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
