'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, ShoppingBag, Heart, MessageCircle, ShieldCheck, ChevronRight } from 'lucide-react';
import { Product } from '@/types';
import { useGoldRates } from '@/context/GoldRateContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { calculateProductPrice, formatINR, isSilverProduct } from '@/services/pricingEngine';

interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { rates, isUpdatedRecently } = useGoldRates();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const priceBreakdown = calculateProductPrice(product, rates);
  const isWishlisted = isInWishlist(product.id);

  const images = product.images.length > 0 ? product.images : [product.thumbnail];

  const handleAdd = () => {
    addToCart(product, quantity);
    onClose();
  };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vardhamanjewellers.in';
  const whatsappMsg = `Hello Vardhaman Jewellers, I am interested in:
Product: ${product.name} (SKU: ${product.SKU})
Estimated Price: ${formatINR(priceBreakdown.finalPrice)}
Link: ${siteUrl}/product/${product.slug}`;
  const whatsappUrl = `https://wa.me/919822123456?text=${encodeURIComponent(whatsappMsg)}`;

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const currentOrigin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : siteUrl;
    const dynamicMsg = `Hello Vardhaman Jewellers, I am interested in:
Product: ${product.name} (SKU: ${product.SKU})
Estimated Price: ${formatINR(priceBreakdown.finalPrice)}
Link: ${currentOrigin}/product/${product.slug}`;
    window.open(`https://wa.me/919822123456?text=${encodeURIComponent(dynamicMsg)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose}></div>

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-[#E8E2D8] overflow-hidden z-10 max-h-[90vh] flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-[#581825] hover:text-white flex items-center justify-center text-[#2B2625] transition-colors shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Product Images */}
        <div className="md:w-1/2 bg-[#FAF7F2] p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#E8E2D8]">
          <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white border border-[#E8E2D8]">
            <Image
              src={images[activeImageIndex] || product.thumbnail}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Thumbnail row */}
          {images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                    activeImageIndex === idx ? 'border-[#581825]' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`Thumb ${idx}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Live Price Breakdown */}
        <div className="md:w-1/2 p-6 overflow-y-auto max-h-[80vh]">
          {/* Breadcrumb / Category */}
          <div className="text-xs text-[#78716C] mb-1">
            {product.category} &gt; {product.subcategory}
          </div>

          <h2 className="font-serif text-xl md:text-2xl font-bold text-[#1A1818] leading-tight">
            {product.name}
          </h2>

          <div className="flex items-center gap-2 mt-1 text-xs text-[#78716C]">
            <span>SKU: <strong className="text-[#2B2625]">{product.SKU}</strong></span>
            <span>•</span>
            <span className="flex items-center gap-1 text-[#581825] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              BIS 916 Hallmarked
            </span>
          </div>

          {/* Pricing Highlight */}
          <div className="my-4 p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E2D8]">
            <div className="flex items-baseline justify-between">
              <div>
                <span className={`text-2xl font-bold transition-all ${
                  isUpdatedRecently ? 'text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded' : 'text-[#581825]'
                }`}>
                  {formatINR(priceBreakdown.finalPrice)}
                </span>
                <p className="text-[11px] text-[#78716C]">Inclusive of all taxes & making charges</p>
              </div>
              <span className="px-2 py-1 rounded bg-[#E8E2D8]/60 text-xs font-semibold text-[#380B12]">
                {isSilverProduct(product) ? `${product.purity} Pure Silver` : `${product.purity} Gold`}
              </span>
            </div>

            {/* Quick Transparent Breakdown */}
            <div className="mt-3 pt-3 border-t border-[#E8E2D8] space-y-1 text-xs">
              <div className="flex justify-between text-[#78716C]">
                <span>Net {isSilverProduct(product) ? 'Silver' : 'Gold'} ({priceBreakdown.netGoldWeight}g @ {formatINR(priceBreakdown.goldRateApplied)}/g):</span>
                <span className="font-medium text-[#1A1818]">{formatINR(priceBreakdown.goldValue)}</span>
              </div>
              <div className="flex justify-between text-[#78716C]">
                <span>Making & Wastage Charges:</span>
                <span className="font-medium text-[#1A1818]">{formatINR(priceBreakdown.makingCharges + priceBreakdown.wastageAmount)}</span>
              </div>
              {priceBreakdown.stoneCharges > 0 && (
                <div className="flex justify-between text-[#78716C]">
                  <span>Gemstones / Diamonds:</span>
                  <span className="font-medium text-[#1A1818]">{formatINR(priceBreakdown.stoneCharges)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#78716C]">
                <span>GST (3%):</span>
                <span className="font-medium text-[#1A1818]">{formatINR(priceBreakdown.gstAmount)}</span>
              </div>
            </div>
          </div>

          {/* Short Description */}
          <p className="text-xs text-[#44403C] leading-relaxed line-clamp-3 mb-4">
            {product.shortDescription || product.description}
          </p>

          {/* Quantity & CTA buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-[#E8E2D8] rounded-lg bg-[#FAF7F2]">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-sm font-bold text-[#581825] hover:bg-[#E8E2D8]"
                >
                  -
                </button>
                <span className="px-3 py-1.5 text-xs font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1.5 text-sm font-bold text-[#581825] hover:bg-[#E8E2D8]"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAdd}
                className="flex-1 bg-[#581825] hover:bg-[#380B12] text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className="p-2.5 rounded-xl border border-[#E8E2D8] hover:bg-[#FAF7F2] text-[#581825]"
                title="Wishlist"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#581825]' : ''}`} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={whatsappUrl}
                onClick={handleWhatsAppClick}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 border border-emerald-500 text-emerald-700 hover:bg-emerald-50 py-2 px-3 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Enquire on WhatsApp</span>
              </a>

              <Link
                href={`/product/${product.slug}`}
                onClick={onClose}
                className="text-xs text-[#581825] hover:text-[#380B12] font-semibold flex items-center gap-1 px-3 py-2"
              >
                <span>Full Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
