'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Gem,
  Upload,
  FileSpreadsheet,
  TrendingUp,
  ShoppingBag,
  MessageSquare,
  Tag,
  Settings,
  ExternalLink,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useGoldRates } from '@/context/GoldRateContext';
import { formatINR } from '@/services/pricingEngine';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { adminUser, isAdminLoggedIn, authReady, logoutAdmin } = useAuth();
  const { rates } = useGoldRates();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Redirect to login if not authenticated (only after session check is ready)
  useEffect(() => {
    if (authReady && !isAdminLoggedIn && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [authReady, isAdminLoggedIn, pathname, router]);

  // If on login page, render children directly without admin chrome
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!authReady || !isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-[#1A1818] flex items-center justify-center p-4 text-white text-xs">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#C5A880] border-t-transparent rounded-full animate-spin"></div>
          <span>Verifying administrative session...</span>
        </div>
      </div>
    );
  }

  const menuItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Products Catalogue', href: '/admin/products', icon: Gem },
    { label: 'CSV Bulk Import (4,000+)', href: '/admin/products/csv-import', icon: FileSpreadsheet },
    { label: 'Bulk Image Upload (R2)', href: '/admin/bulk-upload', icon: Upload },
    { label: 'Gold Rate Manager', href: '/admin/gold-rates', icon: TrendingUp },
    { label: 'Orders & Invoices', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Enquiries & Appointments', href: '/admin/enquiries', icon: MessageSquare },
    { label: 'Coupons & Promo Codes', href: '/admin/coupons', icon: Tag },
    { label: 'Settings & Cloudflare R2', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0F0E0E] text-[#E8E2D8] flex flex-col lg:flex-row selection:bg-[#581825] selection:text-white">
      {/* Mobile Header Bar */}
      <div className="lg:hidden bg-[#1A1818] border-b border-white/10 p-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full border border-[#C5A880] flex items-center justify-center bg-[#2B2625]">
            <span className="font-serif text-xs font-bold text-[#C5A880]">VJ</span>
          </div>
          <span className="font-serif font-bold text-sm text-white">Vardhaman Admin</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg bg-[#2B2625] text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-xs z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`w-72 bg-[#171515] border-r border-white/10 flex flex-col justify-between shrink-0 z-40 transition-all ${
          mobileMenuOpen ? 'fixed inset-y-0 left-0 shadow-2xl flex' : 'hidden lg:flex'
        }`}
      >
        <div>
          {/* Brand Emblem Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-[#C5A880] flex items-center justify-center bg-[#2B2625] shadow-md">
                  <span className="font-serif text-sm font-bold text-[#C5A880]">VJ</span>
                </div>
                <div>
                  <h1 className="font-serif text-base font-bold text-white tracking-tight">
                    VARDHAMAN
                  </h1>
                  <p className="text-[10px] uppercase tracking-widest text-[#C5A880]">
                    Admin Console
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden p-1.5 rounded-lg bg-[#2B2625] text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Admin User Chip */}
            <div className="mt-4 p-2.5 rounded-xl bg-[#2B2625]/60 border border-white/5 flex items-center justify-between text-xs">
              <div className="truncate">
                <span className="text-[10px] text-[#A8A29E] block">Super Admin</span>
                <span className="font-bold text-white truncate block">{adminUser?.email}</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#581825] text-white shadow-md border border-[#C5A880]/30'
                      : 'text-[#D6D3D1] hover:bg-[#2B2625] hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#C5A880]' : 'text-[#A8A29E]'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 space-y-2">
          {/* Quick link to live store */}
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#2B2625] hover:bg-[#380B12] text-xs font-semibold text-[#DFCDAE] transition-colors"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>View Storefront</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          {/* Logout button */}
          <button
            onClick={() => {
              logoutAdmin();
              router.push('/admin/login');
            }}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Body */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Admin Top Utility Bar */}
        <header className="bg-[#171515] border-b border-white/10 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs">
            <span className="text-[#A8A29E]">Active Bullion Rate:</span>
            <span className="bg-[#2B2625] px-2.5 py-1 rounded-lg border border-white/10 text-white">
              22K: <strong className="text-[#C5A880]">{formatINR(rates.rate22K)}</strong>/g
            </span>
            <span className="bg-[#2B2625] px-2.5 py-1 rounded-lg border border-white/10 text-white hidden sm:inline">
              24K: <strong className="text-[#C5A880]">{formatINR(rates.rate24K)}</strong>/g
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Real-time Firestore Sync Active
            </span>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 p-3.5 sm:p-8 overflow-y-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
