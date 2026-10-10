'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Gem,
  Scale,
  RefreshCw,
  MapPin,
  Calendar,
  ArrowRight,
  TrendingUp,
  Award,
  Star,
  CheckCircle2,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import { useGoldRates } from '@/context/GoldRateContext';
import { formatINR } from '@/services/pricingEngine';
import { INITIAL_BANNERS, INITIAL_PRODUCTS, INITIAL_REVIEWS } from '@/data/seedData';
import { getAllProducts } from '@/lib/db/productService';
import { Product } from '@/types';

export default function HomePage() {
  const { rates, setIsLiveModalOpen, isUpdatedRecently, simulateRateDelta } = useGoldRates();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);

  useEffect(() => {
    getAllProducts().then((data) => {
      if (data && data.length > 0) setProducts(data);
    });

    // Auto-advance hero carousel
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % INITIAL_BANNERS.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const categories = [
    {
      name: 'Necklaces & Haars',
      slug: '/necklaces',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
      tag: 'Temple & Chokers',
    },
    {
      name: 'Bangles & Patlya',
      slug: '/bangles',
      image: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=600&q=80',
      tag: 'Khandesh Heritage',
    },
    {
      name: 'Mangalsutras',
      slug: '/mangalsutra',
      image: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=600&q=80',
      tag: 'Wati & Modern',
    },
    {
      name: 'Earrings & Jhumkas',
      slug: '/earrings',
      image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=600&q=80',
      tag: 'Peacock & Drops',
    },
    {
      name: 'Diamond Solitaires',
      slug: '/diamond',
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80',
      tag: 'IGI Certified',
    },
    {
      name: 'Gold Rings',
      slug: '/rings',
      image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=600&q=80',
      tag: 'Bridal & Men’s',
    },
    {
      name: 'Chains & Pendants',
      slug: '/chains',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80',
      tag: 'Solid 22K',
    },
    {
      name: 'Pure 925 Silver',
      slug: '/silver',
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
      tag: 'Pooja Articles',
    },
  ];

  const featuredHaars = products.filter((p) => p.category === 'Necklaces');
  const bestSellers = products.filter((p) => p.bestSeller);
  const newArrivals = products.filter((p) => p.newArrival);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Header />

      <main className="flex-1 pb-20 lg:pb-0">
        {/* 1. EDITORIAL HERO CAROUSEL */}
        <section
          className="relative w-full h-[460px] sm:h-[580px] md:h-[680px] overflow-hidden bg-[#2B2625] select-none"
          onTouchStart={(e) => setTouchStart(e.targetTouches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchStart === null) return;
            const touchEnd = e.changedTouches[0].clientX;
            const diff = touchStart - touchEnd;
            if (diff > 45) {
              setCurrentSlide((prev) => (prev + 1) % INITIAL_BANNERS.length);
            } else if (diff < -45) {
              setCurrentSlide((prev) => (prev - 1 + INITIAL_BANNERS.length) % INITIAL_BANNERS.length);
            }
            setTouchStart(null);
          }}
        >
          {INITIAL_BANNERS.map((banner, idx) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <Image
                src={banner.imageUrl}
                alt={banner.title}
                fill
                priority={idx === 0}
                className="object-cover object-center filter brightness-[0.72]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1818]/90 via-[#1A1818]/30 to-black/20" />

              <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-12 flex flex-col justify-center items-start text-white">
                <span className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] sm:tracking-[0.25em] uppercase text-[#DFCDAE] mb-2 sm:mb-3 bg-[#581825]/75 backdrop-blur-xs px-2.5 py-1 rounded-full border border-[#C5A880]/30">
                  {banner.tagline}
                </span>

                <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight max-w-2xl text-balance drop-shadow-sm">
                  {banner.title}
                </h1>

                <p className="mt-2 sm:mt-3 text-xs sm:text-base md:text-lg text-[#F4EDE4] max-w-xl font-light line-clamp-2 sm:line-clamp-none drop-shadow-xs">
                  {banner.subtitle}
                </p>

                <div className="mt-4 sm:mt-8 flex flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto max-w-sm sm:max-w-none">
                  <Link
                    href={banner.ctaLink}
                    className="flex-1 sm:flex-initial px-3 sm:px-6 py-2 sm:py-3.5 rounded-full bg-[#581825] hover:bg-[#380B12] text-white text-[11px] sm:text-sm font-medium sm:font-semibold tracking-wider uppercase transition-all shadow-md hover:shadow-2xl border border-[#C5A880]/40 flex items-center justify-center gap-1.5 text-center active:scale-95"
                  >
                    <span className="truncate">{banner.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </Link>

                  {banner.secondaryCtaText && (
                    <Link
                      href={banner.secondaryCtaLink || '/book-appointment'}
                      className="flex-1 sm:flex-initial px-2.5 sm:px-6 py-2 sm:py-3.5 rounded-full bg-white/20 hover:bg-white text-white hover:text-[#380B12] text-[11px] sm:text-sm font-medium sm:font-semibold tracking-wider uppercase transition-all backdrop-blur-md border border-white/40 text-center flex items-center justify-center active:scale-95"
                    >
                      <span className="truncate">
                        <span className="sm:hidden">
                          {banner.secondaryCtaText === 'Book In-Store Viewing' ? 'Book Viewing' : banner.secondaryCtaText}
                        </span>
                        <span className="hidden sm:inline">
                          {banner.secondaryCtaText}
                        </span>
                      </span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Carousel Navigation Arrows */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + INITIAL_BANNERS.length) % INITIAL_BANNERS.length)}
            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white items-center justify-center transition-colors backdrop-blur-xs"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % INITIAL_BANNERS.length)}
            className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white items-center justify-center transition-colors backdrop-blur-xs"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 sm:bottom-6 inset-x-0 z-20 flex justify-center gap-1.5 sm:gap-2">
            {INITIAL_BANNERS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-1.5 rounded-full transition-all ${
                  currentSlide === i ? 'w-6 sm:w-8 bg-[#C5A880]' : 'w-2 bg-white/50'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </section>

        {/* 2. LIVE GOLD & SILVER RATE STRIP (REAL-TIME AUTO-SYNCED) */}
        <section
          className={`bg-white border-y border-[#E8E2D8] py-3.5 sm:py-4.5 transition-all duration-500 shadow-xs ${
            isUpdatedRecently ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-400/30' : ''
          }`}
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-8 flex flex-col lg:flex-row items-center justify-between gap-3 sm:gap-4">
            {/* Header info */}
            <div className="flex items-center gap-2.5 text-[11px] sm:text-xs text-[#581825] w-full lg:w-auto justify-between lg:justify-start">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="font-bold uppercase tracking-wider text-[#380B12]">
                  Live Bullion Rates:
                </span>
              </div>
              <span className="text-[#78716C] text-[10px] sm:text-xs flex items-center gap-1">
                <span>Updated {rates.effectiveTime} Today</span>
                <span className="text-emerald-700 font-semibold">• Live IBJA</span>
              </span>
            </div>

            {/* 4 Metal Price Badges: 22K, 24K, 18K, Silver */}
            <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2.5 w-full sm:w-auto text-xs font-medium">
                {/* 22K */}
                <button
                  onClick={() => setIsLiveModalOpen(true)}
                  className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1.5 bg-[#FAF7F2] hover:bg-[#F4EDE4] p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-[#E8E2D8] text-center sm:text-left transition-colors cursor-pointer"
                  title="Click to calculate or view details"
                >
                  <span className="text-[10px] sm:text-xs text-[#78716C] font-medium">22K:</span>
                  <strong className="text-[#581825] font-bold text-xs sm:text-sm">{formatINR(rates.rate22K)}</strong>
                  <span className="text-[9px] sm:text-[10px] text-[#78716C]">/g</span>
                  {rates.change22K !== undefined && rates.change22K !== 0 && (
                    <span className={`text-[9px] font-bold px-1 rounded ${rates.change22K > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {rates.change22K > 0 ? '▲' : '▼'}{Math.abs(rates.change22K)}
                    </span>
                  )}
                </button>

                {/* 24K */}
                <button
                  onClick={() => setIsLiveModalOpen(true)}
                  className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1.5 bg-[#FAF7F2] hover:bg-[#F4EDE4] p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-[#E8E2D8] text-center sm:text-left transition-colors cursor-pointer"
                  title="Click to calculate or view details"
                >
                  <span className="text-[10px] sm:text-xs text-[#78716C] font-medium">24K:</span>
                  <strong className="text-[#1A1818] font-bold text-xs sm:text-sm">{formatINR(rates.rate24K)}</strong>
                  <span className="text-[9px] sm:text-[10px] text-[#78716C]">/g</span>
                </button>

                {/* 18K */}
                <button
                  onClick={() => setIsLiveModalOpen(true)}
                  className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1.5 bg-[#FAF7F2] hover:bg-[#F4EDE4] p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-[#E8E2D8] text-center sm:text-left transition-colors cursor-pointer"
                  title="Click to calculate or view details"
                >
                  <span className="text-[10px] sm:text-xs text-[#78716C] font-medium">18K:</span>
                  <strong className="text-[#1A1818] font-bold text-xs sm:text-sm">{formatINR(rates.rate18K)}</strong>
                  <span className="text-[9px] sm:text-[10px] text-[#78716C]">/g</span>
                </button>

                {/* Silver */}
                <button
                  onClick={() => setIsLiveModalOpen(true)}
                  className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1.5 bg-[#FAF7F2] hover:bg-[#F4EDE4] p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-[#E8E2D8] text-center sm:text-left transition-colors cursor-pointer"
                  title="Click to calculate or view details"
                >
                  <span className="text-[10px] sm:text-xs text-[#78716C] font-medium">Silver:</span>
                  <strong className="text-[#1A1818] font-bold text-xs sm:text-sm">{formatINR(rates.rateSilver)}</strong>
                  <span className="text-[9px] sm:text-[10px] text-[#78716C]">/g</span>
                  {rates.changeSilver !== undefined && rates.changeSilver !== 0 && (
                    <span className={`text-[9px] font-bold px-1 rounded ${rates.changeSilver > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {rates.changeSilver > 0 ? '▲' : '▼'}{Math.abs(rates.changeSilver)}
                    </span>
                  )}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 self-end sm:self-center">
                <button
                  onClick={() => setIsLiveModalOpen(true)}
                  className="px-3 py-1.5 rounded-full bg-[#581825] hover:bg-[#380B12] text-white text-[11px] font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Sparkles className="w-3 h-3 text-[#C5A880]" />
                  <span>Calculator & Tester</span>
                </button>

                <Link
                  href="/gold-rate"
                  className="text-[11px] sm:text-xs font-semibold text-[#9A7B4F] hover:text-[#581825] underline underline-offset-4 flex items-center gap-1"
                >
                  <span>Rate History</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 3. SHOP BY CATEGORY */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#9A7B4F]">
              Curated Masterpieces
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#1A1818] mt-1">
              Shop by Category
            </h2>
            <div className="w-16 h-0.5 bg-[#C5A880] mx-auto mt-3"></div>
          </div>          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
            {categories.map((cat, idx) => (
              <Link
                key={idx}
                href={cat.slug}
                className="group relative rounded-xl overflow-hidden bg-white border border-[#E8E2D8] luxury-card-shadow block aspect-[4/5]"
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-108"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"></div>

                <div className="absolute bottom-2.5 sm:bottom-4 inset-x-2.5 sm:inset-x-4 text-white">
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#DFCDAE] font-semibold">
                    {cat.tag}
                  </span>
                  <h3 className="font-serif text-xs sm:text-base font-bold mt-0.5 group-hover:text-[#DFCDAE] transition-colors leading-tight">
                    {cat.name}
                  </h3>
                  <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-white/80 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Explore designs</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 4. FEATURED BRIDAL COLLECTION BANNER */}
        <section className="bg-[#FAF7F2] py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-3 sm:px-8">
            <div className="relative rounded-2xl overflow-hidden bg-[#380B12] text-white border border-[#C5A880]/30 shadow-xl grid grid-cols-1 lg:grid-cols-12 items-center">
              <div className="lg:col-span-7 p-5 sm:p-10 lg:p-12 space-y-3 sm:space-y-4">
                <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#C5A880] font-bold">
                  The Royal Khandesh Wedding Trousseau
                </span>
                <h2 className="font-serif text-xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                  Sacred Heirlooms for Every Maharashtrian Bride
                </h2>
                <p className="text-xs sm:text-sm text-[#F4EDE4] leading-relaxed max-w-lg">
                  From traditional twin-cup Wati Mangalsutras and hand-embossed Patlya bangles to majestic Kolhapuri Saaj and Nakshi temple chokers, each creation honors your most cherished sacred promises.
                </p>
                <div className="pt-2 sm:pt-4 flex flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto">
                  <Link
                    href="/wedding"
                    className="flex-1 sm:flex-initial px-3 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#C5A880] text-[#380B12] text-[11px] sm:text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors text-center truncate active:scale-95"
                  >
                    Bridal Collection
                  </Link>
                  <Link
                    href="/book-appointment"
                    className="flex-1 sm:flex-initial px-3 sm:px-6 py-2.5 sm:py-3 rounded-full border border-white/40 text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-colors text-center truncate active:scale-95"
                  >
                    Book Lounge
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5 relative h-52 sm:h-72 lg:h-96 w-full">
                <Image
                  src="https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=1000&q=80"
                  alt="Bridal Jewellery"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 5. BEST SELLERS PRODUCT GRID */}
        <section className="max-w-7xl mx-auto px-3 sm:px-8 py-10 sm:py-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 sm:mb-10 gap-3 sm:gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#9A7B4F]">
                Time-Tested Favorites
              </span>
              <h2 className="font-serif text-xl sm:text-3xl font-bold text-[#1A1818] mt-1">
                Most Cherished Jewellery
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-xs font-bold text-[#581825] hover:text-[#9A7B4F] flex items-center gap-1 transition-colors uppercase tracking-wider self-end sm:self-auto"
            >
              <span>View All Catalogue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
            {bestSellers.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* 6. SELL YOUR GOLD / GOLD EXCHANGE HIGHLIGHT */}
        <section className="bg-white border-y border-[#E8E2D8] py-10 sm:py-16">
          <div className="max-w-7xl mx-auto px-3 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="space-y-4 sm:space-y-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#C5A880]/40 text-xs text-[#581825] font-semibold">
                  <Scale className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>100% Transparent Scrap Assessment</span>
                </div>

                <h2 className="font-serif text-xl sm:text-3xl lg:text-4xl font-bold text-[#1A1818] leading-tight">
                  Exchange Your Old Gold for Modern Hallmarked Masterpieces
                </h2>

                <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
                  Turn your idle ancestral ornaments into brand new certified 22K jewellery or diamond solitaires. We provide instant computerized Karatmeter testing right in front of you, with zero hidden melt loss deductions.
                </p>

                <div className="space-y-2.5 pt-1 text-xs text-[#2B2625]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Live valuation calculated on today’s IBJA spot bullion rate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Exact karatage verification via German Karatmeter spectrometer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Same-day store exchange or bank credit voucher</span>
                  </div>
                </div>

                <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <Link
                    href="/sell-gold"
                    className="px-6 py-3 rounded-full bg-[#581825] hover:bg-[#380B12] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Calculate Exchange Value</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/gold-buying-guide"
                    className="text-xs font-semibold text-[#581825] hover:underline text-center sm:text-left"
                  >
                    Read Gold Buying Guide
                  </Link>
                </div>
              </div>

              {/* Calculator Teaser Card */}
              <div className="p-4 sm:p-8 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] luxury-card-shadow">
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#1A1818] mb-1">
                  Indicative Old Gold Calculator
                </h3>
                <p className="text-xs text-[#78716C] mb-4 sm:mb-6">
                  Estimate your old ornament value instantly based on current rates
                </p>

                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#2B2625] mb-1">
                      Approximate Weight in Grams
                    </label>
                    <div className="p-2.5 sm:p-3 bg-white border border-[#E8E2D8] rounded-xl text-xs sm:text-sm font-bold text-[#581825]">
                      Example: 25.00 Grams
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2B2625] mb-1">
                      Assumed Purity
                    </label>
                    <div className="p-2.5 sm:p-3 bg-white border border-[#E8E2D8] rounded-xl text-xs sm:text-sm font-bold text-[#581825]">
                      22 Karat (91.6% Pure Gold)
                    </div>
                  </div>

                  <div className="pt-3 sm:pt-4 border-t border-[#E8E2D8] flex items-baseline justify-between">
                    <div>
                      <p className="text-[11px] sm:text-xs text-[#78716C]">Estimated Valuation</p>
                      <span className="text-xl sm:text-2xl font-bold text-[#581825]">
                        {formatINR(Math.round(25 * rates.rate22K * 0.98))}
                      </span>
                    </div>
                    <Link
                      href="/sell-gold"
                      className="px-4 py-2 rounded-lg bg-[#581825] text-white text-xs font-bold hover:bg-[#380B12]"
                    >
                      Use Full Tool
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. NEW ARRIVALS */}
        <section className="max-w-7xl mx-auto px-3 sm:px-8 py-10 sm:py-16">
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#9A7B4F]">
              Fresh from the Ateliers
            </span>
            <h2 className="font-serif text-xl sm:text-3xl font-bold text-[#1A1818] mt-1">
              New Arrivals
            </h2>
            <div className="w-16 h-0.5 bg-[#C5A880] mx-auto mt-2 sm:mt-3"></div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
            {newArrivals.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* 8. WHY VARDHAMAN JEWELLERS */}
        <section className="bg-[#FAF7F2] py-10 sm:py-16 border-t border-[#E8E2D8]">
          <div className="max-w-7xl mx-auto px-3 sm:px-8">
            <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#9A7B4F]">
                The Vardhaman Promise
              </span>
              <h2 className="font-serif text-xl sm:text-3xl font-bold text-[#1A1818] mt-1">
                Why Families Trust Vardhaman Jewellers
              </h2>
              <div className="w-16 h-0.5 bg-[#C5A880] mx-auto mt-2 sm:mt-3"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
              <div className="p-4 sm:p-6 rounded-2xl bg-white border border-[#E8E2D8] luxury-card-shadow flex flex-col items-center text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FAF7F2] border border-[#C5A880] flex items-center justify-center mb-3 sm:mb-4">
                  <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-[#581825]" />
                </div>
                <h3 className="font-serif text-sm sm:text-base font-bold text-[#1A1818]">100% BIS Hallmarked</h3>
                <p className="text-xs text-[#78716C] mt-1.5 sm:mt-2 leading-relaxed">
                  Every gram of gold is certified with the Government of India BIS Hallmark stamp, guaranteeing 91.6% purity with zero compromises.
                </p>
              </div>

              <div className="p-4 sm:p-6 rounded-2xl bg-white border border-[#E8E2D8] luxury-card-shadow flex flex-col items-center text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FAF7F2] border border-[#C5A880] flex items-center justify-center mb-3 sm:mb-4">
                  <Scale className="w-6 h-6 sm:w-7 sm:h-7 text-[#581825]" />
                </div>
                <h3 className="font-serif text-sm sm:text-base font-bold text-[#1A1818]">Transparent Pricing</h3>
                <p className="text-xs text-[#78716C] mt-1.5 sm:mt-2 leading-relaxed">
                  Clear itemized invoices displaying exact net gold weight, daily spot rate, making charges, and 3% GST. Complete peace of mind.
                </p>
              </div>

              <div className="p-4 sm:p-6 rounded-2xl bg-white border border-[#E8E2D8] luxury-card-shadow flex flex-col items-center text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FAF7F2] border border-[#C5A880] flex items-center justify-center mb-3 sm:mb-4">
                  <RefreshCw className="w-6 h-6 sm:w-7 sm:h-7 text-[#581825]" />
                </div>
                <h3 className="font-serif text-sm sm:text-base font-bold text-[#1A1818]">Lifetime Buyback & Exchange</h3>
                <p className="text-xs text-[#78716C] mt-1.5 sm:mt-2 leading-relaxed">
                  Assured lifetime exchange policy across our Jalgaon, Dhule, Pune, and Mumbai stores. Your jewellery is a lifelong asset.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 9. TESTIMONIALS */}
        <section className="max-w-7xl mx-auto px-3 sm:px-8 py-10 sm:py-16">
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#9A7B4F]">
              Voices of Khandesh & Maharashtra
            </span>
            <h2 className="font-serif text-xl sm:text-3xl font-bold text-[#1A1818] mt-1">
              Customer Testimonials
            </h2>
            <div className="w-16 h-0.5 bg-[#C5A880] mx-auto mt-2 sm:mt-3"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {INITIAL_REVIEWS.map((rev) => (
              <div
                key={rev.id}
                className="p-4 sm:p-6 rounded-2xl bg-white border border-[#E8E2D8] luxury-card-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-1 text-amber-500 mb-2.5 sm:mb-3">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-[#44403C] leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-[#F0ECE4] flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-[#1A1818]">{rev.customerName}</h4>
                    <span className="text-[11px] text-[#78716C]">{rev.city}, Maharashtra</span>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                    Verified Buyer
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 10. BOOK IN-STORE APPOINTMENT CTA */}
        <section className="bg-[#380B12] text-white py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center space-y-4 sm:space-y-6">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#C5A880]">
              Personalized Luxury Experience
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold leading-tight">
              Experience the Vardhaman Heritage in Person
            </h2>
            <p className="text-xs sm:text-sm text-[#F4EDE4] max-w-xl mx-auto leading-relaxed">
              Book a private bridal consultation or gold exchange viewing at our Jalgaon, Dhule, Pune, or Mumbai stores. Enjoy dedicated consultation with our senior master craftsman.
            </p>
            <div className="pt-2">
              <Link
                href="/book-appointment"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#C5A880] text-[#380B12] font-bold text-xs uppercase tracking-wider hover:bg-white transition-colors shadow-lg"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Store Appointment</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
