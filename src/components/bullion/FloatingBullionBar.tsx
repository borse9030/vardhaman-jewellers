'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { useGoldRates } from '@/context/GoldRateContext';
import { useCart } from '@/context/CartContext';
import { formatINR } from '@/services/pricingEngine';

export default function FloatingBullionBar() {
  const pathname = usePathname();
  const { rates, setIsLiveModalOpen, isUpdatedRecently, isLiveModalOpen } = useGoldRates();
  const { isCartDrawerOpen } = useCart();

  if (isCartDrawerOpen || isLiveModalOpen || pathname?.startsWith('/admin') || pathname === '/login') {
    return null;
  }

  // Permanently disabled: Live bullion rates are properly integrated in the header announcement bar & footer
  return null;
}
