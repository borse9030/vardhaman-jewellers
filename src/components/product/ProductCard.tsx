'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, MessageCircle, Eye, ShieldCheck } from 'lucide-react';
import { Product } from '@/types';
import { useGoldRates } from '@/context/GoldRateContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { calculateProductPrice, formatINR, isSilverProduct } from '@/services/pricingEngine';
import QuickViewModal from './QuickViewModal';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { rates, isUpdatedRecently } = useGoldRates();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [isHovered, setIsHovered] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const priceBreakdown = calculateProductPrice(product, rates);
  const isWishlisted = isInWishlist(product.id);

  const primaryImage = product.images[0] || product.thumbnail || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80';
  const secondaryImage = product.images[1] || primaryImage;

  // WhatsApp Enquiry Generator (Consistent across SSR and client hydration)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vardhamanjewellers.in';
  const productUrl = `${siteUrl}/product/${product.slug}`;
  const whatsappMsg = `Hello Vardhaman Jewellers, I am interested in:
Product: ${product.name}
SKU: ${product.SKU}
Purity: ${product.purity}
Estimated Price: ${formatINR(priceBreakdown.finalPrice)}
Link: ${productUrl}

Please share more details with me.`;
  const whatsappUrl = `https://wa.me/919822123456?text=${encodeURIComponent(whatsappMsg)}`;

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const currentOrigin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : siteUrl;
    const dynamicProductUrl = `${currentOrigin}/product/${product.slug}`;
    const dynamicMsg = `Hello Vardhaman Jewellers, I am interested in:
Product: ${product.name}
SKU: ${product.SKU}
Purity: ${product.purity}
Estimated Price: ${formatINR(priceBreakdown.finalPrice)}
Link: ${dynamicProductUrl}

Please share more details with me.`;
    window.open(`https://wa.me/919822123456?text=${encodeURIComponent(dynamicMsg)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div
        className="group relative flex flex-col bg-white rounded-xl border border-[#E8E2D8] overflow-hidden luxury-card-shadow transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Badges Bar */}
        <div className="absolute top-1.5 sm:top-2.5 left-1.5 sm:left-2.5 z-10 flex flex-col gap-1 items-start">
          {product.bestSeller && (
            <span className="px-1.5 sm:px-2 py-0.5 rounded-sm bg-[#581825] text-white text-[9px] sm:text-[10px] font-bold tracking-wider uppercase">
              Bestseller
            </span>
          )}
          {product.newArrival && (
            <span className="px-1.5 sm:px-2 py-0.5 rounded-sm bg-[#C5A880] text-[#380B12] text-[9px] sm:text-[10px] font-bold tracking-wider uppercase">
              New
            </span>
          )}
          {product.purity === '22K' && (
            <span className="px-1.5 sm:px-2 py-0.5 rounded-sm bg-[#FAF7F2] text-[#581825] border border-[#E8E2D8] text-[8px] sm:text-[9px] font-semibold flex items-center gap-1 shadow-2xs">
              <ShieldCheck className="w-2.5 h-2.5 text-[#581825]" />
              22K 916
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          className="absolute top-1.5 sm:top-2.5 right-1.5 sm:right-2.5 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#581825] hover:bg-[#581825] hover:text-white transition-all shadow-xs"
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          aria-label="Wishlist"
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isWishlisted ? 'fill-[#581825] text-[#581825] group-hover:fill-white' : ''}`} />
        </button>

        {/* Image Display with Secondary Image Hover */}
        <Link href={`/product/${product.slug}`} className="relative aspect-square w-full bg-[#FAF7F2] overflow-hidden block">
          <Image
            src={isHovered ? secondaryImage : primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />

          {/* Quick View Button overlay on hover (Desktop only) */}
          <div className="hidden sm:flex absolute inset-x-0 bottom-3 justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsQuickViewOpen(true);
              }}
              className="bg-white/95 text-[#380B12] hover:bg-[#581825] hover:text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              Quick View
            </button>
          </div>
        </Link>

        {/* Details Content */}
        <div className="p-2 sm:p-3.5 flex flex-col flex-1 justify-between bg-white">
          <div>
            {/* Metal & Weight Chips */}
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#78716C] mb-1">
              <span>{product.purity} • {product.metalType}</span>
              <span className="font-medium text-[#2B2625]">{product.grossWeight}g</span>
            </div>

            {/* Product Title */}
            <Link href={`/product/${product.slug}`} className="block">
              <h3 className="font-serif text-xs sm:text-sm font-semibold text-[#1A1818] line-clamp-1 hover:text-[#581825] transition-colors leading-tight">
                {product.name}
              </h3>
            </Link>

            {/* Price Display */}
            <div className="mt-1 sm:mt-2 flex flex-wrap items-baseline gap-1 sm:gap-2">
              <span
                className={`text-sm sm:text-base font-bold transition-all duration-300 rounded ${
                  isUpdatedRecently
                    ? 'text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 ring-1 ring-emerald-400 scale-105'
                    : 'text-[#581825]'
                }`}
              >
                {formatINR(priceBreakdown.finalPrice)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > priceBreakdown.finalPrice && (
                <span className="text-[10px] sm:text-xs text-[#A8A29E] line-through">
                  {formatINR(product.compareAtPrice)}
                </span>
              )}
            </div>

            {/* Dynamic Gold Rate Reference Tag */}
            {product.isDynamicPricing && (
              <p className="text-[9px] sm:text-[10px] text-[#9A7B4F] mt-0.5 truncate flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0"></span>
                <span>
                  Live rate: {formatINR(priceBreakdown.goldRateApplied)}/g ({isSilverProduct(product) ? '925 Silver' : product.purity})
                </span>
              </p>
            )}
          </div>

          {/* Card Actions */}
          <div className="mt-2 sm:mt-3.5 pt-2 sm:pt-3 border-t border-[#F0ECE4] flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => addToCart(product, 1)}
              className="flex-1 bg-[#FAF7F2] hover:bg-[#581825] text-[#581825] hover:text-white py-1 sm:py-1.5 px-1 sm:px-2 rounded-lg text-[10px] sm:text-xs font-semibold transition-all flex items-center justify-center gap-1 border border-[#E8E2D8] hover:border-[#581825]"
            >
              <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Add</span>
            </button>

            <a
              href={whatsappUrl}
              onClick={handleWhatsAppClick}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 sm:p-1.5 rounded-lg text-[#25D366] hover:bg-emerald-50 border border-emerald-200 transition-colors shrink-0"
              title="Enquire on WhatsApp"
              aria-label="Enquire on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {isQuickViewOpen && (
        <QuickViewModal product={product} onClose={() => setIsQuickViewOpen(false)} />
      )}
    </>
  );
}
