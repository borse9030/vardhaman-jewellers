'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, MessageCircle, Eye, ShieldCheck } from 'lucide-react';
import { Product } from '@/types';
import { useGoldRates } from '@/context/GoldRateContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { calculateProductPrice, formatINR } from '@/services/pricingEngine';
import QuickViewModal from './QuickViewModal';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { rates } = useGoldRates();
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
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
          {product.bestSeller && (
            <span className="px-2 py-0.5 rounded-sm bg-[#581825] text-white text-[10px] font-bold tracking-wider uppercase">
              Bestseller
            </span>
          )}
          {product.newArrival && (
            <span className="px-2 py-0.5 rounded-sm bg-[#C5A880] text-[#380B12] text-[10px] font-bold tracking-wider uppercase">
              New
            </span>
          )}
          {product.purity === '22K' && (
            <span className="px-2 py-0.5 rounded-sm bg-[#FAF7F2] text-[#581825] border border-[#E8E2D8] text-[9px] font-semibold flex items-center gap-1 shadow-2xs">
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
          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#581825] hover:bg-[#581825] hover:text-white transition-all shadow-xs"
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          aria-label="Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#581825] text-[#581825] group-hover:fill-white' : ''}`} />
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

          {/* Quick View Button overlay on hover (Desktop) */}
          <div className="absolute inset-x-0 bottom-3 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
        <div className="p-3.5 flex flex-col flex-1 justify-between bg-white">
          <div>
            {/* Metal & Weight Chips */}
            <div className="flex items-center justify-between text-[11px] text-[#78716C] mb-1">
              <span>{product.purity} • {product.metalType}</span>
              <span className="font-medium text-[#2B2625]">{product.grossWeight}g</span>
            </div>

            {/* Product Title */}
            <Link href={`/product/${product.slug}`} className="block">
              <h3 className="font-serif text-sm font-semibold text-[#1A1818] line-clamp-1 hover:text-[#581825] transition-colors">
                {product.name}
              </h3>
            </Link>

            {/* Price Display */}
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-base font-bold text-[#581825]">
                {formatINR(priceBreakdown.finalPrice)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > priceBreakdown.finalPrice && (
                <span className="text-xs text-[#A8A29E] line-through">
                  {formatINR(product.compareAtPrice)}
                </span>
              )}
            </div>

            {/* Dynamic Gold Rate Reference Tag */}
            {product.isDynamicPricing && (
              <p className="text-[10px] text-[#9A7B4F] mt-0.5">
                Dynamic price based on live {product.purity} rate
              </p>
            )}
          </div>

          {/* Card Actions */}
          <div className="mt-3.5 pt-3 border-t border-[#F0ECE4] flex items-center gap-2">
            <button
              onClick={() => addToCart(product, 1)}
              className="flex-1 bg-[#FAF7F2] hover:bg-[#581825] text-[#581825] hover:text-white py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border border-[#E8E2D8] hover:border-[#581825]"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>

            <a
              href={whatsappUrl}
              onClick={handleWhatsAppClick}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-[#25D366] hover:bg-emerald-50 border border-emerald-200 transition-colors"
              title="Enquire on WhatsApp"
              aria-label="Enquire on WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
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
