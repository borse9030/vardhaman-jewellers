'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  MapPin,
  Menu,
  X,
  Phone,
  Sparkles,
  TrendingUp,
  ChevronDown,
  ShieldCheck,
  Home,
  LayoutGrid,
  LogIn,
  LogOut,
  Calendar,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useGoldRates } from '@/context/GoldRateContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { formatINR } from '@/services/pricingEngine';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const { rates, setIsLiveModalOpen, isUpdatedRecently } = useGoldRates();
  const { itemCount, setIsCartDrawerOpen } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { customer, adminUser, isAdminLoggedIn, logoutCustomer, logoutAdmin } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  const navLinks = [
    { label: t('allJewellery'), href: '/shop' },
    { label: t('gold'), href: '/gold' },
    { label: t('diamond'), href: '/diamond' },
    { label: t('silver'), href: '/silver' },
    { label: t('necklaces'), href: '/necklaces' },
    { label: t('earrings'), href: '/earrings' },
    { label: t('bangles'), href: '/bangles' },
    { label: t('rings'), href: '/rings' },
    { label: t('mangalsutra'), href: '/mangalsutra' },
    { label: t('wedding'), href: '/wedding' },
    { label: t('dailyWear'), href: '/daily-wear' },
    { label: t('gifting'), href: '/gifting' },
    { label: t('collections'), href: '/collections' },
    { label: t('goldRate'), href: '/gold-rate', highlight: true },
    { label: t('sellGold'), href: '/sell-gold', special: true },
  ];

  return (
    <header className="w-full select-none z-40 transition-all duration-300">
      {/* Top Bar: Announcement, Live Gold Rate Snippet, Language Switcher */}
      <div className="bg-[#380B12] text-[#FAF7F2] text-xs py-1.5 px-3 sm:px-8 border-b border-[#581825]/40 overflow-hidden w-full">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Live Bullion Ticker */}
          <button
            onClick={() => setIsLiveModalOpen(true)}
            className={`flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 text-[11px] sm:text-xs rounded-lg px-2 transition-all cursor-pointer text-left ${
              isUpdatedRecently
                ? 'bg-emerald-900/60 ring-1 ring-emerald-400 text-emerald-100 animate-pulse'
                : 'hover:bg-white/10'
            }`}
            title="Click to view full Live Rates breakdown, Calculator & Test Changer"
            aria-label="Open Live Bullion Rates"
          >
            <span className="flex items-center gap-1.5 font-medium text-[#DFCDAE] whitespace-nowrap">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="hidden sm:inline font-semibold">Live Bullion ({rates.effectiveTime}):</span>
              <span className="sm:hidden font-bold">Live:</span>
            </span>
            <div className="flex items-center gap-2 sm:gap-2.5 text-[11px] sm:text-xs whitespace-nowrap">
              <span className="text-[#FAF7F2]/90 flex items-center gap-1">
                <span className="text-[#DFCDAE]/70">22K:</span>
                <strong className="text-white font-semibold">{formatINR(rates.rate22K)}</strong>
                <span className="text-[10px] text-[#DFCDAE]/80">/g</span>
                {rates.change22K !== undefined && rates.change22K !== 0 && (
                  <span className={`text-[9px] font-bold px-1 py-0.2 rounded ${rates.change22K > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                    {rates.change22K > 0 ? '▲' : '▼'}{Math.abs(rates.change22K)}
                  </span>
                )}
              </span>
              <span className="text-[#FAF7F2]/40 hidden sm:inline">|</span>
              <span className="text-[#FAF7F2]/90 hidden md:inline-flex items-center gap-1">
                <span className="text-[#DFCDAE]/70">24K:</span>
                <strong className="text-white font-semibold">{formatINR(rates.rate24K)}</strong>
                <span className="text-[10px] text-[#DFCDAE]/80">/g</span>
              </span>
              <span className="text-[#FAF7F2]/40 hidden md:inline">|</span>
              <span className="text-[#FAF7F2]/90 hidden sm:inline-flex items-center gap-1">
                <span className="text-[#DFCDAE]/70">Silver:</span>
                <strong className="text-white font-semibold">{formatINR(rates.rateSilver)}</strong>
                <span className="text-[10px] text-[#DFCDAE]/80">/g</span>
                {rates.changeSilver !== undefined && rates.changeSilver !== 0 && (
                  <span className={`text-[9px] font-bold px-1 py-0.2 rounded ${rates.changeSilver > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                    {rates.changeSilver > 0 ? '▲' : '▼'}{Math.abs(rates.changeSilver)}
                  </span>
                )}
              </span>
              <span className="text-[9px] uppercase font-bold text-[#DFCDAE] bg-[#581825] px-1.5 py-0.5 rounded border border-[#C5A880]/30 hidden lg:inline">
                Calc & Rates ↗
              </span>
            </div>
          </button>

          {/* Right utility: WhatsApp help & Language switch */}
          <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
            <a
              href="https://wa.me/919822123456?text=Hello%20Vardhaman%20Jewellers,%20I%20would%20like%20to%20enquire%20about%20your%20jewellery%20collection."
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 text-[#DFCDAE] hover:text-white transition-colors text-xs"
            >
              <Phone className="w-3 h-3 text-[#C5A880]" />
              <span>WhatsApp Concierge: +91 98221 23456</span>
            </a>

            {/* Language Selector */}
            <div className="flex items-center gap-1 border-l border-[#581825] pl-2 sm:pl-4 text-[10px] sm:text-xs">
              <button
                onClick={() => setLanguage('en')}
                className={`px-1.5 py-0.5 rounded transition-all ${
                  language === 'en'
                    ? 'bg-[#C5A880] text-[#380B12] font-bold'
                    : 'text-[#FAF7F2]/80 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('mr')}
                className={`px-1.5 py-0.5 rounded transition-all ${
                  language === 'mr'
                    ? 'bg-[#C5A880] text-[#380B12] font-bold'
                    : 'text-[#FAF7F2]/80 hover:text-white'
                }`}
              >
                मराठी
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-1.5 py-0.5 rounded transition-all ${
                  language === 'hi'
                    ? 'bg-[#C5A880] text-[#380B12] font-bold'
                    : 'text-[#FAF7F2]/80 hover:text-white'
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div
        className={`w-full bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8E2D8] transition-all duration-300 ${
          isScrolled ? 'sticky top-0 shadow-md py-2 sm:py-2.5' : 'py-2.5 sm:py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-8 flex items-center justify-between gap-2 sm:gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-1.5 text-[#581825] hover:bg-[#F3EDE3] rounded-full transition-colors shrink-0"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Brand Logo & Royal Wordmark */}
          <Link href="/" className="flex items-center group shrink-0 py-0.5" aria-label="Vardhaman Jewellers Home">
            <Image
              src="/logo.png"
              alt="Vardhaman Jewellers"
              width={180}
              height={56}
              priority
              className="h-9 sm:h-11 md:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </Link>

          {/* Large Centered Search Bar (Desktop) */}
          <div className="hidden lg:flex flex-1 max-w-xl mx-6">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="w-full bg-[#F4EDE4] text-[#1A1818] placeholder-[#78716C] text-sm pl-11 pr-24 py-2.5 rounded-full border border-[#E8E2D8] focus:border-[#C5A880] focus:bg-white focus:outline-none transition-all shadow-inner"
                />
                <Search className="w-4 h-4 text-[#78716C] absolute left-4" />
                <button
                  type="submit"
                  className="absolute right-1.5 px-4 py-1.5 rounded-full bg-[#581825] text-white hover:bg-[#380B12] text-xs font-medium transition-colors"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1 sm:gap-4 shrink-0">
            {/* Mobile Search Button */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="lg:hidden p-1.5 text-[#581825] hover:bg-[#F3EDE3] rounded-full transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Store Locator Link */}
            <Link
              href="/stores"
              className="hidden sm:flex items-center gap-1.5 text-xs text-[#581825] hover:text-[#C5A880] transition-colors font-medium"
              title="Store Locations"
            >
              <MapPin className="w-4 h-4 text-[#C5A880]" />
              <span className="hidden xl:inline">{t('stores')}</span>
            </Link>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative p-1.5 sm:p-2 text-[#581825] hover:bg-[#F3EDE3] rounded-full transition-colors"
              title={t('wishlist')}
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#C5A880] text-[#380B12] text-[9px] sm:text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative p-1.5 sm:p-2 text-[#581825] hover:bg-[#F3EDE3] rounded-full transition-colors"
              title={t('cart')}
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#581825] text-white text-[9px] sm:text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Account Menu */}
            <div className="relative">
              <button
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className="flex items-center gap-1 p-2 text-[#581825] hover:bg-[#F3EDE3] rounded-full transition-colors cursor-pointer"
                title={t('account')}
              >
                <User className="w-5 h-5" />
                <ChevronDown className="w-3 h-3 text-[#78716C] hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {isAccountMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E8E2D8] py-2 z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
                  onMouseLeave={() => setIsAccountMenuOpen(false)}
                >
                  {customer || adminUser ? (
                    <>
                      <div className="px-4 py-3 border-b border-[#F0ECE4] bg-[#FAF7F2]">
                        <p className="text-[11px] text-[#78716C]">Signed in as</p>
                        <p className="text-sm font-bold text-[#1A1818] truncate">
                          {customer?.name || adminUser?.name || 'Valued Patron'}
                        </p>
                        <p className="text-xs text-[#9A7B4F] truncate font-medium">
                          {customer?.phone || customer?.email || adminUser?.email}
                        </p>
                      </div>

                      <div className="py-1.5">
                        <Link
                          href="/profile"
                          onClick={() => setIsAccountMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#2B2625] hover:bg-[#FAF7F2] hover:text-[#581825] transition-colors"
                        >
                          <User className="w-4 h-4 text-[#C5A880] shrink-0" />
                          <span>My Profile & Saved Addresses</span>
                        </Link>
                        <Link
                          href="/orders"
                          onClick={() => setIsAccountMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#2B2625] hover:bg-[#FAF7F2] hover:text-[#581825] transition-colors"
                        >
                          <ShoppingBag className="w-4 h-4 text-[#C5A880] shrink-0" />
                          <span>Track Orders & Invoices</span>
                        </Link>
                        <Link
                          href="/book-appointment"
                          onClick={() => setIsAccountMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#2B2625] hover:bg-[#FAF7F2] hover:text-[#581825] transition-colors"
                        >
                          <Calendar className="w-4 h-4 text-[#C5A880] shrink-0" />
                          <span>My Store Appointments</span>
                        </Link>
                      </div>

                      <div className="border-t border-[#F0ECE4] pt-1">
                        <button
                          onClick={() => {
                            logoutCustomer();
                            logoutAdmin();
                            setIsAccountMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 shrink-0" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 space-y-3">
                      <div>
                        <p className="font-serif text-sm font-bold text-[#1A1818]">Welcome to Vardhaman</p>
                        <p className="text-[11px] text-[#78716C] mt-1 leading-relaxed">
                          Sign in to view your profile, saved addresses, orders & wishlist.
                        </p>
                      </div>

                      <Link
                        href="/login"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="w-full py-2.5 px-3 rounded-xl bg-[#581825] hover:bg-[#380B12] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <LogIn className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span>Sign In with OTP</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Input Drawer (Visible when search icon is clicked) */}
        {isSearchOpen && (
          <div className="lg:hidden px-4 pt-3 pb-2 border-t border-[#E8E2D8] bg-[#FAF7F2]">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                autoFocus
                className="w-full bg-[#F4EDE4] text-sm pl-10 pr-20 py-2.5 rounded-full border border-[#E8E2D8] focus:border-[#C5A880] focus:bg-white focus:outline-none"
              />
              <Search className="w-4 h-4 text-[#78716C] absolute left-3.5" />
              <button
                type="submit"
                className="absolute right-1 px-3 py-1.5 rounded-full bg-[#581825] text-white text-xs font-medium"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Secondary Mega-Navigation (Desktop) */}
      <nav className="hidden lg:block bg-white border-b border-[#E8E2D8] shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <ul className="flex items-center justify-between text-xs font-medium tracking-wide py-2.5 overflow-x-auto no-scrollbar">
            {navLinks.map((item, idx) => {
              const isActive = pathname === item.href;
              return (
                <li key={idx} className="whitespace-nowrap">
                  <Link
                    href={item.href}
                    className={`py-1 px-2.5 rounded transition-colors uppercase tracking-wider text-[11px] ${
                      item.special
                        ? 'bg-[#581825] text-[#FAF7F2] hover:bg-[#380B12] font-semibold px-3 py-1 rounded-full'
                        : item.highlight
                        ? 'text-[#9A7B4F] font-bold hover:text-[#581825]'
                        : isActive
                        ? 'text-[#581825] font-bold border-b-2 border-[#581825]'
                        : 'text-[#2B2625] hover:text-[#581825]'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Mobile Sidebar Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="relative w-4/5 max-w-sm bg-[#FAF7F2] h-full shadow-2xl flex flex-col z-10 overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#E8E2D8] flex items-center justify-between bg-white">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="Vardhaman Jewellers"
                  width={140}
                  height={45}
                  className="h-8 w-auto object-contain"
                />
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 text-[#581825] hover:bg-[#F3EDE3] rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Gold Rate Badge in Drawer */}
            <div className="p-4 bg-[#F4EDE4] border-b border-[#E8E2D8]">
              <p className="text-[11px] font-semibold text-[#581825] uppercase tracking-wider">
                Live Gold Rate (Today)
              </p>
              <div className="flex justify-between items-center mt-1 text-xs">
                <span>22K: <strong>{formatINR(rates.rate22K)}/g</strong></span>
                <span>24K: <strong>{formatINR(rates.rate24K)}/g</strong></span>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="py-2 flex-1">
              {navLinks.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-5 py-3 text-sm font-medium border-b border-[#F0ECE4] ${
                    item.special
                      ? 'bg-[#581825] text-white my-2 mx-4 rounded-lg text-center'
                      : item.highlight
                      ? 'text-[#9A7B4F] font-bold'
                      : 'text-[#2B2625] hover:bg-[#F3EDE3] hover:text-[#581825]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              <div className="p-4 space-y-2 text-xs">
                {customer || adminUser ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 p-2 rounded text-[#581825] font-medium hover:bg-white"
                    >
                      <User className="w-4 h-4 text-[#C5A880]" />
                      <span>My Profile & Saved Addresses</span>
                    </Link>
                    <Link
                      href="/orders"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 p-2 rounded text-[#581825] font-medium hover:bg-white"
                    >
                      <ShoppingBag className="w-4 h-4 text-[#C5A880]" />
                      <span>Track Orders & Invoices</span>
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#581825] text-white font-bold text-xs shadow-xs mb-2"
                  >
                    <LogIn className="w-4 h-4 text-[#C5A880]" />
                    <span>Sign In with Mobile OTP</span>
                  </Link>
                )}

                <Link
                  href="/stores"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded text-[#581825] font-medium hover:bg-white"
                >
                  <MapPin className="w-4 h-4 text-[#C5A880]" />
                  <span>{t('stores')} (Jalgaon, Dhule, Pune, Mumbai)</span>
                </Link>
                <Link
                  href="/book-appointment"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded text-[#581825] font-medium hover:bg-white"
                >
                  <Sparkles className="w-4 h-4 text-[#C5A880]" />
                  <span>{t('bookAppointment')}</span>
                </Link>

                {(customer || adminUser) && (
                  <button
                    onClick={() => {
                      logoutCustomer();
                      logoutAdmin();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded text-rose-700 font-medium hover:bg-rose-50 text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MOBILE BOTTOM NAVIGATION BAR (FIXED) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8E2D8] py-1 px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-around text-[10px] font-medium text-[#78716C]">
          {/* Home */}
          <Link
            href="/"
            className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-colors ${
              pathname === '/' ? 'text-[#581825] font-bold' : 'hover:text-[#581825]'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </Link>

          {/* Categories */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-colors ${
              isMobileMenuOpen ? 'text-[#581825] font-bold' : 'hover:text-[#581825]'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
            <span>Categories</span>
          </button>

          {/* Search */}
          <button
            onClick={() => {
              setIsSearchOpen(true);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-colors ${
              isSearchOpen ? 'text-[#581825] font-bold' : 'hover:text-[#581825]'
            }`}
          >
            <Search className="w-5 h-5" />
            <span>Search</span>
          </button>

          {/* Wishlist */}
          <Link
            href="/wishlist"
            className={`flex flex-col items-center gap-0.5 py-1 px-2 relative transition-colors ${
              pathname === '/wishlist' ? 'text-[#581825] font-bold' : 'hover:text-[#581825]'
            }`}
          >
            <div className="relative">
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-[#C5A880] text-[#380B12] text-[8px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </div>
            <span>Wishlist</span>
          </Link>

          {/* Account */}
          <Link
            href={customer || adminUser ? "/profile" : "/login"}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-colors ${
              pathname === '/profile' || pathname === '/login' ? 'text-[#581825] font-bold' : 'hover:text-[#581825]'
            }`}
          >
            <User className="w-5 h-5" />
            <span>{customer || adminUser ? 'Account' : 'Sign In'}</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
