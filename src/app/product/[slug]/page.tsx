'use client';

import React, { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Heart,
  ShoppingBag,
  MessageCircle,
  Calendar,
  ShieldCheck,
  Gem,
  RefreshCw,
  Truck,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Info,
  Share2,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import { Product } from '@/types';
import { getProductBySlug, getAllProducts } from '@/lib/db/productService';
import { useGoldRates } from '@/context/GoldRateContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { calculateProductPrice, formatINR } from '@/services/pricingEngine';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const router = useRouter();
  const { slug } = use(params);
  const { rates } = useGoldRates();
  const { addToCart, setIsCartDrawerOpen } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'policies' | 'care'>('specs');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    getProductBySlug(slug).then((p) => setProduct(p));
    getAllProducts().then((list) => setAllProducts(list));
  }, [slug]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-[#E8E2D8] shadow-sm">
            <Sparkles className="w-10 h-10 text-[#C5A880] mx-auto mb-3" />
            <h1 className="font-serif text-xl font-bold text-[#1A1818]">Ornament Not Found</h1>
            <p className="text-xs text-[#78716C] mt-1 mb-6">
              The requested design might have moved or is exclusively crafted on order.
            </p>
            <Link
              href="/shop"
              className="px-6 py-2.5 rounded-full bg-[#581825] text-white text-xs font-semibold hover:bg-[#380B12]"
            >
              Browse All Jewellery
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const priceBreakdown = calculateProductPrice(product, rates);
  const isWishlisted = isInWishlist(product.id);
  const gallery = product.images.length > 0 ? product.images : [product.thumbnail];
  const relatedProducts = allProducts.filter((p) => p.category === product.category && p.id !== product.id);

  const handleBuyNow = () => {
    addToCart(product, quantity);
    router.push('/checkout');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // WhatsApp Enquiry Link (Consistent across SSR and client hydration)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vardhamanjewellers.in';
  const productUrl = `${siteUrl}/product/${product.slug}`;
  const whatsappMsg = `Hello Vardhaman Jewellers, I would like to enquire about:
Product: ${product.name}
SKU: ${product.SKU}
Estimated Price: ${formatINR(priceBreakdown.finalPrice)}
Link: ${productUrl}

Please provide availability and viewing slot details.`;
  const whatsappUrl = `https://wa.me/919822123456?text=${encodeURIComponent(whatsappMsg)}`;

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const currentOrigin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : siteUrl;
    const dynamicProductUrl = `${currentOrigin}/product/${product.slug}`;
    const dynamicMsg = `Hello Vardhaman Jewellers, I would like to enquire about:
Product: ${product.name}
SKU: ${product.SKU}
Estimated Price: ${formatINR(priceBreakdown.finalPrice)}
Link: ${dynamicProductUrl}

Please provide availability and viewing slot details.`;
    window.open(`https://wa.me/919822123456?text=${encodeURIComponent(dynamicMsg)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-[#78716C] mb-8 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-[#581825]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#A8A29E]" />
          <Link href="/shop" className="hover:text-[#581825]">Jewellery</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#A8A29E]" />
          <Link href={`/${product.category.toLowerCase()}`} className="hover:text-[#581825]">{product.category}</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#A8A29E]" />
          <span className="text-[#1A1818] font-semibold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Main PDP Grid (Left Gallery, Right Product Info & Price Breakdown) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* LEFT: Image Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white border border-[#E8E2D8] shadow-sm">
              <Image
                src={gallery[selectedImageIndex] || product.thumbnail}
                alt={product.name}
                fill
                priority
                className="object-cover transition-transform duration-500 hover:scale-105 cursor-zoom-in"
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
                {product.bestSeller && (
                  <span className="px-2.5 py-1 rounded bg-[#581825] text-white text-[10px] font-bold uppercase tracking-wider">
                    Bestseller
                  </span>
                )}
                <span className="px-2.5 py-1 rounded bg-[#FAF7F2] text-[#581825] border border-[#E8E2D8] text-[10px] font-bold flex items-center gap-1 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#581825]" />
                  100% BIS 916 Hallmark
                </span>
              </div>

              {/* Share button */}
              <button
                onClick={handleShare}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-[#581825] hover:text-white flex items-center justify-center text-[#581825] shadow-sm transition-colors"
                title="Share link"
              >
                <Share2 className="w-4 h-4" />
              </button>
              {isCopied && (
                <div className="absolute top-16 right-4 z-10 bg-black/80 text-white text-[10px] px-2 py-1 rounded">
                  Link copied!
                </div>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {gallery.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImageIndex === idx ? 'border-[#581825] shadow-xs' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt={`Thumb ${idx}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Details & Live Pricing Engine */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs text-[#78716C] mb-2">
                <span>SKU: <strong className="text-[#1A1818]">{product.SKU}</strong></span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  In Stock & Ready for Dispatch
                </span>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1818] leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 mt-2 text-xs text-[#57534E]">
                <span>{product.purity} Pure Gold</span>
                <span>•</span>
                <span>Gross: <strong>{product.grossWeight}g</strong></span>
                <span>•</span>
                <span>Net Gold: <strong>{product.netGoldWeight}g</strong></span>
              </div>
            </div>

            {/* Live Pricing Breakdown Card */}
            <div className="p-5 rounded-2xl bg-white border border-[#E8E2D8] shadow-xs space-y-4">
              <div className="flex items-baseline justify-between border-b border-[#F0ECE4] pb-3">
                <div>
                  <span className="text-2xl sm:text-3xl font-bold text-[#581825]">
                    {formatINR(priceBreakdown.finalPrice)}
                  </span>
                  <p className="text-[11px] text-[#78716C] mt-0.5">
                    (Inclusive of all taxes & making charges)
                  </p>
                </div>
                {product.compareAtPrice && product.compareAtPrice > priceBreakdown.finalPrice && (
                  <div className="text-right">
                    <span className="text-xs text-[#A8A29E] line-through block">
                      {formatINR(product.compareAtPrice)}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Special Rate
                    </span>
                  </div>
                )}
              </div>

              {/* Centralized Gold Pricing Engine Itemized Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-xs font-semibold text-[#1A1818] mb-1">
                  <span className="flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-[#C5A880]" />
                    Transparent Price Breakdown
                  </span>
                  <span className="text-[10px] text-[#9A7B4F]">IBJA Live Benchmark</span>
                </div>

                <div className="flex justify-between text-[#78716C]">
                  <span>Gold Value ({priceBreakdown.netGoldWeight}g @ {formatINR(priceBreakdown.goldRateApplied)}/g):</span>
                  <span className="font-medium text-[#1A1818]">{formatINR(priceBreakdown.goldValue)}</span>
                </div>

                <div className="flex justify-between text-[#78716C]">
                  <span>Making Charges:</span>
                  <span className="font-medium text-[#1A1818]">{formatINR(priceBreakdown.makingCharges)}</span>
                </div>

                {priceBreakdown.wastageAmount > 0 && (
                  <div className="flex justify-between text-[#78716C]">
                    <span>Wastage ({priceBreakdown.wastagePercentage}%):</span>
                    <span className="font-medium text-[#1A1818]">{formatINR(priceBreakdown.wastageAmount)}</span>
                  </div>
                )}

                {priceBreakdown.stoneCharges > 0 && (
                  <div className="flex justify-between text-[#78716C]">
                    <span>Gemstone / Diamond Charges:</span>
                    <span className="font-medium text-[#1A1818]">{formatINR(priceBreakdown.stoneCharges)}</span>
                  </div>
                )}

                <div className="flex justify-between text-[#78716C]">
                  <span>GST ({priceBreakdown.gstPercentage}% Indian Official Standard):</span>
                  <span className="font-medium text-[#1A1818]">{formatINR(priceBreakdown.gstAmount)}</span>
                </div>

                {priceBreakdown.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Special Privilege Discount:</span>
                    <span>-{formatINR(priceBreakdown.discountAmount)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                {/* Quantity */}
                <div className="flex items-center border border-[#E8E2D8] rounded-xl bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-2 text-sm font-bold text-[#581825] hover:bg-[#FAF7F2]"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3.5 py-2 text-sm font-bold text-[#581825] hover:bg-[#FAF7F2]"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={() => addToCart(product, quantity)}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#FAF7F2] hover:bg-[#581825] text-[#581825] hover:text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-[#E8E2D8] hover:border-[#581825] shadow-xs"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag</span>
                </button>

                {/* Wishlist */}
                <button
                  onClick={() => toggleWishlist(product)}
                  className="p-3 rounded-xl border border-[#E8E2D8] hover:bg-[#FAF7F2] text-[#581825] transition-colors"
                  title="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-[#581825]' : ''}`} />
                </button>
              </div>

              {/* Buy Now Primary CTA */}
              <button
                onClick={handleBuyNow}
                className="w-full py-3.5 rounded-xl bg-[#581825] hover:bg-[#380B12] text-white font-bold text-xs uppercase tracking-widest transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <span>Buy Now (Instant Insured Checkout)</span>
              </button>

              {/* WhatsApp Enquiry & Book Appointment */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <a
                  href={whatsappUrl}
                  onClick={handleWhatsAppClick}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl border border-emerald-500 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Enquire on WhatsApp</span>
                </a>

                <Link
                  href="/book-appointment"
                  className="py-2.5 px-3 rounded-xl border border-[#C5A880] text-[#581825] hover:bg-[#FAF7F2] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-4 h-4 text-[#C5A880]" />
                  <span>Book In-Store Viewing</span>
                </Link>
              </div>
            </div>

            {/* Trust Assurances Icons */}
            <div className="p-4 rounded-xl bg-white border border-[#E8E2D8] grid grid-cols-2 gap-3 text-[11px] text-[#44403C]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#581825] shrink-0" />
                <span>BIS 916 Hallmark</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#581825] shrink-0" />
                <span>100% Insured Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[#581825] shrink-0" />
                <span>Lifetime Exchange</span>
              </div>
              <div className="flex items-center gap-2">
                <Gem className="w-4 h-4 text-[#581825] shrink-0" />
                <span>Certified Authenticity</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Tabs: Specifications, Policies, Care */}
        <div className="mt-16 pt-10 border-t border-[#E8E2D8]">
          <div className="flex gap-6 border-b border-[#E8E2D8] pb-3 text-sm font-semibold">
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-2 transition-colors relative ${
                activeTab === 'specs' ? 'text-[#581825] font-bold' : 'text-[#78716C] hover:text-[#1A1818]'
              }`}
            >
              Product Specifications
              {activeTab === 'specs' && <span className="absolute bottom-[-13px] inset-x-0 h-0.5 bg-[#581825]"></span>}
            </button>

            <button
              onClick={() => setActiveTab('policies')}
              className={`pb-2 transition-colors relative ${
                activeTab === 'policies' ? 'text-[#581825] font-bold' : 'text-[#78716C] hover:text-[#1A1818]'
              }`}
            >
              Lifetime Exchange & Buyback
              {activeTab === 'policies' && <span className="absolute bottom-[-13px] inset-x-0 h-0.5 bg-[#581825]"></span>}
            </button>

            <button
              onClick={() => setActiveTab('care')}
              className={`pb-2 transition-colors relative ${
                activeTab === 'care' ? 'text-[#581825] font-bold' : 'text-[#78716C] hover:text-[#1A1818]'
              }`}
            >
              Jewellery Care Instructions
              {activeTab === 'care' && <span className="absolute bottom-[-13px] inset-x-0 h-0.5 bg-[#581825]"></span>}
            </button>
          </div>

          <div className="py-6">
            {activeTab === 'specs' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl text-xs">
                <div className="p-3 bg-white rounded-lg border border-[#E8E2D8] flex justify-between">
                  <span className="text-[#78716C]">Gold Purity:</span>
                  <span className="font-semibold text-[#1A1818]">{product.purity} (916 BIS Hallmark)</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-[#E8E2D8] flex justify-between">
                  <span className="text-[#78716C]">Gross Weight:</span>
                  <span className="font-semibold text-[#1A1818]">{product.grossWeight} Grams</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-[#E8E2D8] flex justify-between">
                  <span className="text-[#78716C]">Net Gold Weight:</span>
                  <span className="font-semibold text-[#1A1818]">{product.netGoldWeight} Grams</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-[#E8E2D8] flex justify-between">
                  <span className="text-[#78716C]">Stone Details:</span>
                  <span className="font-semibold text-[#1A1818]">{product.stoneType || 'Plain Gold'}</span>
                </div>
                {product.specifications?.map((spec, i) => (
                  <div key={i} className="p-3 bg-white rounded-lg border border-[#E8E2D8] flex justify-between">
                    <span className="text-[#78716C]">{spec.key}:</span>
                    <span className="font-semibold text-[#1A1818]">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'policies' && (
              <div className="max-w-3xl text-xs text-[#57534E] space-y-3 leading-relaxed">
                <p>
                  <strong>100% Exchange Guarantee:</strong> All gold jewellery purchased from Vardhaman Jewellers carries an assured lifetime exchange guarantee across any of our stores in Jalgaon, Dhule, Pune, and Mumbai.
                </p>
                <p>
                  <strong>Buyback:</strong> In case of gold buyback, valuation is calculated on prevailing IBJA spot market gold rates on the day of return with zero deduction on pure net gold weight.
                </p>
                <p>
                  <strong>Diamond Valuation:</strong> Certified natural diamonds carry up to 90% exchange value towards any upgraded diamond jewellery.
                </p>
              </div>
            )}

            {activeTab === 'care' && (
              <div className="max-w-3xl text-xs text-[#57534E] space-y-3 leading-relaxed">
                <p>• Store individual ornaments separately in velvet pouches to avoid friction scratches.</p>
                <p>• Avoid direct contact with perfumes, chlorine pools, hairsprays, and harsh cosmetics.</p>
                <p>• Clean periodically with lukewarm water and a soft-bristled brush, or visit any Vardhaman Jewellers showroom for our complimentary sonic cleaning spa service.</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Creations */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-[#E8E2D8]">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1818] mb-6">
              You May Also Admire
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
