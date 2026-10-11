'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  ShoppingBag,
  MessageCircle,
  Eye,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Product } from '@/types';
import { useGoldRates } from '@/context/GoldRateContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { calculateProductPrice, formatINR, isSilverProduct } from '@/services/pricingEngine';
import QuickViewModal from './QuickViewModal';

interface ProductCardProps {
  product: Product;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : direction < 0 ? '-100%' : 0,
    opacity: 0.3,
    scale: 0.98,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: 'spring' as const, stiffness: 340, damping: 32, mass: 0.75 },
      opacity: { duration: 0.2 },
      scale: { duration: 0.2 },
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-100%' : '100%',
    opacity: 0.3,
    scale: 0.98,
    transition: {
      x: { type: 'spring' as const, stiffness: 340, damping: 32, mass: 0.75 },
      opacity: { duration: 0.2 },
      scale: { duration: 0.2 },
    },
  }),
};

export default function ProductCard({ product }: ProductCardProps) {
  const { rates, isUpdatedRecently } = useGoldRates();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(0);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const priceBreakdown = calculateProductPrice(product, rates);
  const isWishlisted = isInWishlist(product.id);

  // Extract all available product images
  const images: string[] =
    product.images && product.images.length > 0
      ? product.images
      : product.thumbnail
      ? [product.thumbnail]
      : ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80'];

  const nextImage = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (images.length <= 1) return;
    setSlideDirection(1);
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (images.length <= 1) return;
    setSlideDirection(-1);
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Touch & pointer swipe tracking
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isSwiping = useRef(false);
  const hasSwiped = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartX.current = t.clientX;
    touchStartY.current = t.clientY;
    isSwiping.current = false;
    hasSwiped.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStartX.current;
    const dy = t.clientY - touchStartY.current;

    // Detect intentional horizontal drag
    if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
      isSwiping.current = true;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX.current;
    const dy = t.clientY - (touchStartY.current || 0);

    const SWIPE_THRESHOLD = 30;
    if (Math.abs(dx) >= SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) && images.length > 1) {
      hasSwiped.current = true;
      if (dx < 0) {
        nextImage();
      } else {
        prevImage();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    setTimeout(() => {
      isSwiping.current = false;
      hasSwiped.current = false;
    }, 220);
  };

  // Mouse drag support for desktop
  const mouseStartX = useRef<number | null>(null);
  const isMouseDown = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only primary button
    mouseStartX.current = e.clientX;
    isMouseDown.current = true;
    hasSwiped.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown.current || mouseStartX.current === null) return;
    const dx = e.clientX - mouseStartX.current;
    if (Math.abs(dx) > 10) {
      isSwiping.current = true;
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isMouseDown.current || mouseStartX.current === null) return;
    const dx = e.clientX - mouseStartX.current;
    const SWIPE_THRESHOLD = 30;

    if (Math.abs(dx) >= SWIPE_THRESHOLD && images.length > 1) {
      hasSwiped.current = true;
      if (dx < 0) {
        nextImage();
      } else {
        prevImage();
      }
    }

    isMouseDown.current = false;
    mouseStartX.current = null;
    setTimeout(() => {
      isSwiping.current = false;
      hasSwiped.current = false;
    }, 220);
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    // If a swipe gesture just occurred, block the link navigation
    if (hasSwiped.current || isSwiping.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // WhatsApp Enquiry Generator
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
    const currentOrigin =
      typeof window !== 'undefined' && window.location.origin ? window.location.origin : siteUrl;
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
      <div className="group relative flex flex-col bg-white rounded-xl border border-[#E8E2D8] overflow-hidden luxury-card-shadow transition-all duration-300">
        {/* Badges Bar */}
        <div className="absolute top-1.5 sm:top-2.5 left-1.5 sm:left-2.5 z-20 flex flex-col gap-1 items-start pointer-events-none">
          {product.bestSeller && (
            <span className="px-1.5 sm:px-2 py-0.5 rounded-sm bg-[#581825] text-white text-[9px] sm:text-[10px] font-bold tracking-wider uppercase shadow-xs">
              Bestseller
            </span>
          )}
          {product.newArrival && (
            <span className="px-1.5 sm:px-2 py-0.5 rounded-sm bg-[#C5A880] text-[#380B12] text-[9px] sm:text-[10px] font-bold tracking-wider uppercase shadow-xs">
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
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className="absolute top-1.5 sm:top-2.5 right-1.5 sm:right-2.5 z-30 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#581825] hover:bg-[#581825] hover:text-white transition-all shadow-xs"
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          aria-label="Wishlist"
        >
          <Heart
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
              isWishlisted ? 'fill-[#581825] text-[#581825] group-hover:fill-white' : ''
            }`}
          />
        </button>

        {/* Interactive Swipable Image Container */}
        <div
          className="relative aspect-square w-full bg-[#FAF7F2] overflow-hidden select-none touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <Link
            href={`/product/${product.slug}`}
            onClick={handleLinkClick}
            className="relative block w-full h-full overflow-hidden"
            draggable={false}
          >
            <AnimatePresence initial={false} custom={slideDirection} mode="popLayout">
              <motion.div
                key={activeImageIndex}
                custom={slideDirection}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0 w-full h-full"
              >
                <Image
                  src={images[activeImageIndex] || product.thumbnail}
                  alt={`${product.name} - view ${activeImageIndex + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105 pointer-events-none select-none"
                  loading={activeImageIndex === 0 ? 'eager' : 'lazy'}
                  draggable={false}
                />
              </motion.div>
            </AnimatePresence>

            {/* Quick View Button overlay on hover (Desktop only) */}
            <div className="hidden sm:flex absolute inset-x-0 bottom-4 justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 pointer-events-none">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsQuickViewOpen(true);
                }}
                className="pointer-events-auto bg-white/95 text-[#380B12] hover:bg-[#581825] hover:text-white px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-md flex items-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                Quick View
              </button>
            </div>
          </Link>

          {/* Desktop Hover Chevron Buttons for smooth image switching */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs text-[#380B12] hover:bg-[#581825] hover:text-white items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md hover:scale-110"
                title="Previous photo"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextImage}
                className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs text-[#380B12] hover:bg-[#581825] hover:text-white items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md hover:scale-110"
                title="Next photo"
                aria-label="Next photo"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Pagination Indicators / Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-2 inset-x-0 z-20 flex items-center justify-center gap-1.5 pointer-events-none">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSlideDirection(idx > activeImageIndex ? 1 : -1);
                    setActiveImageIndex(idx);
                  }}
                  className={`pointer-events-auto transition-all duration-300 rounded-full h-1.5 ${
                    idx === activeImageIndex
                      ? 'w-4 bg-[#581825] shadow-sm'
                      : 'w-1.5 bg-black/25 hover:bg-black/50 backdrop-blur-xs'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {/* Mobile Image Counter Badge */}
          {images.length > 1 && (
            <div className="sm:hidden absolute top-2 right-10 z-20 px-1.5 py-0.5 rounded-full bg-black/40 backdrop-blur-xs text-white text-[9px] font-semibold tracking-wider pointer-events-none">
              {activeImageIndex + 1}/{images.length}
            </div>
          )}
        </div>

        {/* Details Content */}
        <div className="p-2 sm:p-3.5 flex flex-col flex-1 justify-between bg-white">
          <div>
            {/* Metal & Weight Chips */}
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#78716C] mb-1">
              <span>
                {product.purity} • {product.metalType}
              </span>
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
