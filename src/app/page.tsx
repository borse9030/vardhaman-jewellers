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
  const { rates } = useGoldRates();
  const [currentSlide, setCurrentSlide] = useState(0);
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
      image: 'https://images.unsplash.com/photo-1611591475152-4783113837af?auto=format&fit=crop&w=600&q=80',
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

      <main className="flex-1">
        {/* 1. EDITORIAL HERO CAROUSEL */}
        <section className="relative w-full h-[520px] sm:h-[620px] md:h-[700px] overflow-hidden bg-[#2B2625]">
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

              <div className="absolute inset-0 max-w-7xl mx-auto px-6 sm:px-12 flex flex-col justify-center items-start text-white">
                <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#DFCDAE] mb-3 bg-[#581825]/70 backdrop-blur-xs px-3 py-1 rounded-full border border-[#C5A880]/30">
                  {banner.tagline}
                </span>

                <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold leading-tight max-w-2xl text-balance drop-shadow-sm">
                  {banner.title}
                </h1>

                <p className="mt-3 text-sm sm:text-base md:text-lg text-[#F4EDE4] max-w-xl font-light drop-shadow-xs">
                  {banner.subtitle}
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link
                    href={banner.ctaLink}
                    className="px-6 py-3.5 rounded-full bg-[#581825] hover:bg-[#380B12] text-white text-xs sm:text-sm font-semibold tracking-wide uppercase transition-all shadow-lg hover:shadow-2xl border border-[#C5A880]/40 flex items-center gap-2"
                  >
                    <span>{banner.ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  {banner.secondaryCtaText && (
                    <Link
                      href={banner.secondaryCtaLink || '/book-appointment'}
                      className="px-6 py-3.5 rounded-full bg-white/20 hover:bg-white text-white hover:text-[#380B12] text-xs sm:text-sm font-semibold tracking-wide uppercase transition-all backdrop-blur-md border border-white/40"
                    >
                      {banner.secondaryCtaText}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Carousel Navigation Arrows */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + INITIAL_BANNERS.length) % INITIAL_BANNERS.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors backdrop-blur-xs"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % INITIAL_BANNERS.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors backdrop-blur-xs"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-6 inset-x-0 z-20 flex justify-center gap-2">
            {INITIAL_BANNERS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-1.5 rounded-full transition-all ${
                  currentSlide === i ? 'w-8 bg-[#C5A880]' : 'w-2 bg-white/50'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </section>

        {/* 2. LIVE GOLD RATE STRIP (ADMIN-SYNCED) */}
        <section className="bg-white border-y border-[#E8E2D8] py-4 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-[#581825]">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
              <span className="font-bold uppercase tracking-wider">Live Bullion Benchmark:</span>
              <span className="text-[#78716C]">Updated today at {rates.effectiveTime} (IBJA Market)</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 sm:gap-8 text-xs font-medium">
              <div className="flex items-center gap-1.5 bg-[#FAF7F2] px-3 py-1.5 rounded-lg border border-[#E8E2D8]">
                <span className="text-[#78716C]">22K (916 Pure):</span>
                <strong className="text-[#581825] font-bold text-sm">{formatINR(rates.rate22K)}</strong>
                <span className="text-[10px] text-[#78716C]">/g</span>
              </div>

              <div className="flex items-center gap-1.5 bg-[#FAF7F2] px-3 py-1.5 rounded-lg border border-[#E8E2D8]">
                <span className="text-[#78716C]">24K (Bullion):</span>
                <strong className="text-[#581825] font-bold text-sm">{formatINR(rates.rate24K)}</strong>
                <span className="text-[10px] text-[#78716C]">/g</span>
              </div>

              <div className="flex items-center gap-1.5 bg-[#FAF7F2] px-3 py-1.5 rounded-lg border border-[#E8E2D8]">
                <span className="text-[#78716C]">Silver:</span>
                <strong className="text-[#581825] font-bold text-sm">{formatINR(rates.rateSilver)}</strong>
                <span className="text-[10px] text-[#78716C]">/g</span>
              </div>

              <Link
                href="/gold-rate"
                className="text-xs font-semibold text-[#9A7B4F] hover:text-[#581825] underline underline-offset-4 flex items-center gap-1"
              >
                <span>Rate History & Trends</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
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
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                <div className="absolute bottom-4 inset-x-4 text-white">
                  <span className="text-[10px] uppercase tracking-wider text-[#DFCDAE] font-semibold">
                    {cat.tag}
                  </span>
                  <h3 className="font-serif text-sm sm:text-base font-bold mt-0.5 group-hover:text-[#DFCDAE] transition-colors">
                    {cat.name}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] text-white/80 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Explore designs</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 4. FEATURED BRIDAL COLLECTION BANNER */}
        <section className="bg-[#FAF7F2] py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="relative rounded-2xl overflow-hidden bg-[#380B12] text-white border border-[#C5A880]/30 shadow-xl grid grid-cols-1 lg:grid-cols-12 items-center">
              <div className="lg:col-span-7 p-8 sm:p-12 space-y-4">
                <span className="text-[11px] uppercase tracking-[0.25em] text-[#C5A880] font-bold">
                  The Royal Khandesh Wedding Trousseau
                </span>
                <h2 className="font-serif text-2xl sm:text-4xl font-bold leading-tight">
                  Sacred Heirlooms for Every Maharashtrian Bride
                </h2>
                <p className="text-xs sm:text-sm text-[#F4EDE4] leading-relaxed max-w-lg">
                  From traditional twin-cup Wati Mangalsutras and hand-embossed Patlya bangles to majestic Kolhapuri Saaj and Nakshi temple chokers, each creation honors your most cherished sacred promises.
                </p>
                <div className="pt-4 flex flex-wrap gap-4">
                  <Link
                    href="/wedding"
                    className="px-6 py-3 rounded-full bg-[#C5A880] text-[#380B12] text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors"
                  >
                    View Bridal Collection
                  </Link>
                  <Link
                    href="/book-appointment"
                    className="px-6 py-3 rounded-full border border-white/40 text-white text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-colors"
                  >
                    Book Bridal Lounge
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5 relative h-64 lg:h-96 w-full">
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
        <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#9A7B4F]">
                Time-Tested Favorites
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1818] mt-1">
                Most Cherished Jewellery
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-xs font-bold text-[#581825] hover:text-[#9A7B4F] flex items-center gap-1 transition-colors uppercase tracking-wider"
            >
              <span>View All Catalogue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {bestSellers.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* 6. SELL YOUR GOLD / GOLD EXCHANGE HIGHLIGHT */}
        <section className="bg-white border-y border-[#E8E2D8] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#C5A880]/40 text-xs text-[#581825] font-semibold">
                  <Scale className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>100% Transparent Scrap Assessment</span>
                </div>

                <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#1A1818]">
                  Exchange Your Old Gold for Modern Hallmarked Masterpieces
                </h2>

                <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
                  Turn your idle ancestral ornaments into brand new certified 22K jewellery or diamond solitaires. We provide instant computerized Karatmeter testing right in front of you, with zero hidden melt loss deductions.
                </p>

                <div className="space-y-3 pt-2 text-xs text-[#2B2625]">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Live valuation calculated on today’s IBJA spot bullion rate</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Exact karatage verification via German Karatmeter spectrometer</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Same-day store exchange or bank credit voucher</span>
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-4">
                  <Link
                    href="/sell-gold"
                    className="px-6 py-3 rounded-full bg-[#581825] hover:bg-[#380B12] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-md flex items-center gap-2"
                  >
                    <span>Calculate Exchange Value</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/gold-buying-guide"
                    className="text-xs font-semibold text-[#581825] hover:underline"
                  >
                    Read Gold Buying Guide
                  </Link>
                </div>
              </div>

              {/* Calculator Teaser Card */}
              <div className="p-6 sm:p-8 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] luxury-card-shadow">
                <h3 className="font-serif text-lg font-bold text-[#1A1818] mb-1">
                  Indicative Old Gold Calculator
                </h3>
                <p className="text-xs text-[#78716C] mb-6">
                  Estimate your old ornament value instantly based on current rates
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#2B2625] mb-1">
                      Approximate Weight in Grams
                    </label>
                    <div className="p-3 bg-white border border-[#E8E2D8] rounded-xl text-sm font-bold text-[#581825]">
                      Example: 25.00 Grams
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2B2625] mb-1">
                      Assumed Purity
                    </label>
                    <div className="p-3 bg-white border border-[#E8E2D8] rounded-xl text-sm font-bold text-[#581825]">
                      22 Karat (91.6% Pure Gold)
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#E8E2D8] flex items-baseline justify-between">
                    <div>
                      <p className="text-xs text-[#78716C]">Estimated Valuation</p>
                      <span className="text-2xl font-bold text-[#581825]">
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
        <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#9A7B4F]">
              Fresh from the Ateliers
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1818] mt-1">
              New Arrivals
            </h2>
            <div className="w-16 h-0.5 bg-[#C5A880] mx-auto mt-3"></div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* 8. WHY VARDHAMAN JEWELLERS */}
        <section className="bg-[#FAF7F2] py-16 border-t border-[#E8E2D8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#9A7B4F]">
                The Vardhaman Promise
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1818] mt-1">
                Why Families Trust Vardhaman Jewellers
              </h2>
              <div className="w-16 h-0.5 bg-[#C5A880] mx-auto mt-3"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl bg-white border border-[#E8E2D8] luxury-card-shadow flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-[#FAF7F2] border border-[#C5A880] flex items-center justify-center mb-4">
                  <ShieldCheck className="w-7 h-7 text-[#581825]" />
                </div>
                <h3 className="font-serif text-base font-bold text-[#1A1818]">100% BIS Hallmarked</h3>
                <p className="text-xs text-[#78716C] mt-2 leading-relaxed">
                  Every gram of gold is certified with the Government of India BIS Hallmark stamp, guaranteeing 91.6% purity with zero compromises.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#E8E2D8] luxury-card-shadow flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-[#FAF7F2] border border-[#C5A880] flex items-center justify-center mb-4">
                  <Scale className="w-7 h-7 text-[#581825]" />
                </div>
                <h3 className="font-serif text-base font-bold text-[#1A1818]">Transparent Pricing</h3>
                <p className="text-xs text-[#78716C] mt-2 leading-relaxed">
                  Clear itemized invoices displaying exact net gold weight, daily spot rate, making charges, and 3% GST. Complete peace of mind.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#E8E2D8] luxury-card-shadow flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-[#FAF7F2] border border-[#C5A880] flex items-center justify-center mb-4">
                  <RefreshCw className="w-7 h-7 text-[#581825]" />
                </div>
                <h3 className="font-serif text-base font-bold text-[#1A1818]">Lifetime Buyback & Exchange</h3>
                <p className="text-xs text-[#78716C] mt-2 leading-relaxed">
                  Assured lifetime exchange policy across our Jalgaon, Dhule, Pune, and Mumbai stores. Your jewellery is a lifelong asset.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 9. TESTIMONIALS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#9A7B4F]">
              Voices of Khandesh & Maharashtra
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1818] mt-1">
              Customer Testimonials
            </h2>
            <div className="w-16 h-0.5 bg-[#C5A880] mx-auto mt-3"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {INITIAL_REVIEWS.map((rev) => (
              <div
                key={rev.id}
                className="p-6 rounded-2xl bg-white border border-[#E8E2D8] luxury-card-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-1 text-amber-500 mb-3">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-[#44403C] leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[#F0ECE4] flex items-center justify-between text-xs">
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
        <section className="bg-[#380B12] text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center space-y-6">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#C5A880]">
              Personalized Luxury Experience
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold">
              Experience the Vardhaman Heritage in Person
            </h2>
            <p className="text-xs sm:text-sm text-[#F4EDE4] max-w-xl mx-auto leading-relaxed">
              Book a private bridal consultation or gold exchange viewing at our Jalgaon, Dhule, Pune, or Mumbai stores. Enjoy dedicated consultation with our senior master craftsman.
            </p>
            <div className="pt-2">
              <Link
                href="/book-appointment"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#C5A880] text-[#380B12] font-bold text-xs uppercase tracking-wider hover:bg-white transition-colors shadow-lg"
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
