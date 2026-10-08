'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Trash2, ArrowRight, Share2, Sparkles } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { useGoldRates } from '@/context/GoldRateContext';
import { calculateProductPrice, formatINR } from '@/services/pricingEngine';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, moveToCart } = useWishlist();
  const { rates } = useGoldRates();
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-8 border-b border-[#E8E2D8] gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1818]">
              My Cherished Wishlist
            </h1>
            <p className="text-xs text-[#78716C] mt-1">
              Your saved 22K hallmarked gold & diamond pieces
            </p>
          </div>

          {wishlist.length > 0 && (
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl bg-white border border-[#E8E2D8] text-[#581825] font-semibold hover:bg-[#FAF7F2] shadow-2xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Link Copied!' : 'Share Wishlist'}</span>
            </button>
          )}
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E8E2D8] p-12 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#E8E2D8] flex items-center justify-center mx-auto mb-3">
              <Heart className="w-7 h-7 text-[#C5A880]" />
            </div>
            <h2 className="font-serif text-lg font-bold text-[#1A1818]">Your Wishlist is Empty</h2>
            <p className="text-xs text-[#78716C] mt-1 mb-6">
              Save your favorite temple haars, bridal kadas, or diamond rings by clicking the heart icon on any design.
            </p>
            <Link
              href="/shop"
              className="px-6 py-2.5 rounded-full bg-[#581825] text-white text-xs font-bold hover:bg-[#380B12]"
            >
              Explore Catalogue
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map((product) => {
              const breakdown = calculateProductPrice(product, rates);
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl border border-[#E8E2D8] overflow-hidden luxury-card-shadow flex flex-col justify-between"
                >
                  <div className="relative aspect-square w-full bg-[#FAF7F2]">
                    <Image
                      src={product.thumbnail || product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 text-[#78716C] hover:text-red-700 shadow-sm"
                      title="Remove from Wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-[11px] text-[#78716C] mb-1">
                        {product.purity} • {product.grossWeight}g
                      </p>
                      <Link
                        href={`/product/${product.slug}`}
                        className="font-serif text-sm font-semibold text-[#1A1818] line-clamp-1 hover:text-[#581825]"
                      >
                        {product.name}
                      </Link>
                      <div className="mt-2 text-sm font-bold text-[#581825]">
                        {formatINR(breakdown.finalPrice)}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#F0ECE4]">
                      <button
                        onClick={() => moveToCart(product)}
                        className="w-full py-2 px-3 rounded-lg bg-[#581825] text-white hover:bg-[#380B12] text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Move to Bag</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
