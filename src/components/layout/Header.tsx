'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  const { rates } = useGoldRates();
  const { itemCount, setIsCartDrawerOpen } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { customer, adminUser, isAdminLoggedIn } = useAuth();

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
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 text-[11px] sm:text-xs">
            <span className="flex items-center gap-1.5 font-medium text-[#DFCDAE] whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="hidden sm:inline">{t('rateUpdatedToday')} {rates.effectiveTime}:</span>
              <span className="sm:hidden font-bold">22K Today:</span>
            </span>
            <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs whitespace-nowrap">
              <span className="text-[#FAF7F2]/90">
                <strong className="text-white font-semibold">{formatINR(rates.rate22K)}</strong>
                <span className="text-[10px] text-[#DFCDAE]/80">/g</span>
              </span>
              <span className="text-[#FAF7F2]/40 hidden sm:inline">|</span>
              <span className="text-[#FAF7F2]/90 hidden sm:inline">
                24K: <strong className="text-white font-semibold">{formatINR(rates.rate24K)}</strong>
                <span className="text-[10px] text-[#DFCDAE]/80">/g</span>
              </span>
              <span className="text-[#FAF7F2]/40 hidden sm:inline">|</span>
              <span className="text-[#FAF7F2]/90 hidden sm:inline">
                Silver: <strong className="text-white font-semibold">{formatINR(rates.rateSilver)}</strong>
                <span className="text-[10px] text-[#DFCDAE]/80">/g</span>
              </span>
            </div>
          </div>

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
          <Link href="/" className="flex flex-col items-center group shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Royal Emblem Symbol */}
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-[#C5A880] flex items-center justify-center bg-[#FAF7F2] shadow-xs group-hover:scale-105 transition-transform">
                <span className="font-serif text-xs sm:text-sm font-bold text-[#581825] tracking-tight">VJ</span>
              </div>
              <span className="font-serif text-lg sm:text-2xl md:text-3xl font-bold tracking-tight text-[#380B12] group-hover:text-[#581825] transition-colors">
                VARDHAMAN
              </span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="w-3 sm:w-4 h-[1px] bg-[#C5A880]"></span>
              <span className="text-[8px] sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#9A7B4F] font-semibold">
                JEWELLERS
              </span>
              <span className="w-3 sm:w-4 h-[1px] bg-[#C5A880]"></span>
            </div>
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

            {/* Account / Admin Menu */}
            <div className="relative">
              <button
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className="flex items-center gap-1 p-2 text-[#581825] hover:bg-[#F3EDE3] rounded-full transition-colors"
                title={t('account')}
              >
                <User className="w-5 h-5" />
                <ChevronDown className="w-3 h-3 text-[#78716C] hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {isAccountMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#E8E2D8] py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onMouseLeave={() => setIsAccountMenuOpen(false)}
                >
                  {customer ? (
                    <div className="px-4 py-2 border-b border-[#F0ECE4]">
                      <p className="text-xs text-[#78716C]">Signed in as</p>
                      <p className="text-sm font-semibold text-[#1A1818] truncate">{customer.name}</p>
                      <p className="text-xs text-[#9A7B4F] truncate">{customer.email}</p>
                    </div>
                  ) : (
                    <div className="px-4 py-2 border-b border-[#F0ECE4]">
                      <p className="text-sm font-semibold text-[#380B12]">Welcome to Vardhaman</p>
                      <p className="text-xs text-[#78716C]">Maharashtra’s Heirloom Jeweller</p>
                    </div>
                  )}

                  <Link
                    href="/profile"
                    onClick={() => setIsAccountMenuOpen(false)}
                    className="block px-4 py-2 text-xs text-[#2B2625] hover:bg-[#FAF7F2] hover:text-[#581825]"
                  >
                    My Profile & Saved Addresses
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setIsAccountMenuOpen(false)}
                    className="block px-4 py-2 text-xs text-[#2B2625] hover:bg-[#FAF7F2] hover:text-[#581825]"
                  >
                    Track Orders & Invoices
                  </Link>
                  <Link
                    href="/book-appointment"
                    onClick={() => setIsAccountMenuOpen(false)}
                    className="block px-4 py-2 text-xs text-[#2B2625] hover:bg-[#FAF7F2] hover:text-[#581825]"
                  >
                    My Store Appointments
                  </Link>

                  <div className="border-t border-[#F0ECE4] my-1"></div>

                  <Link
                    href="/admin"
                    onClick={() => setIsAccountMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#581825] hover:bg-[#F6EBEF]"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#581825]" />
                    {isAdminLoggedIn ? 'Admin Dashboard (Active)' : 'Admin Portal Login'}
                  </Link>
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
            <div className="p-5 border-b border-[#E8E2D8] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-bold text-[#380B12]">VARDHAMAN</span>
                <span className="text-[10px] tracking-widest text-[#9A7B4F]">JEWELLERS</span>
              </div>
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
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded text-[#581825] font-medium hover:bg-white"
                >
                  <ShieldCheck className="w-4 h-4 text-[#581825]" />
                  <span>{t('adminPortal')}</span>
                </Link>
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
            href="/profile"
            className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-colors ${
              pathname === '/profile' ? 'text-[#581825] font-bold' : 'hover:text-[#581825]'
            }`}
          >
            <User className="w-5 h-5" />
            <span>Account</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
