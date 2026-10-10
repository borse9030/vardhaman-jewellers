'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { GoldRates } from '@/types';
import { DEFAULT_GOLD_RATES } from '@/services/pricingEngine';
import {
  getLatestGoldRates,
  subscribeToGoldRates,
  updateGoldRates as serviceUpdateGoldRates,
  simulateRateDelta as serviceSimulateRateDelta,
} from '@/lib/db/goldRateService';
import { Zap, X } from 'lucide-react';

interface GoldRateContextType {
  rates: GoldRates;
  previousRates: GoldRates | null;
  loading: boolean;
  refreshRates: () => Promise<void>;
  updateRates: (newRates: Partial<GoldRates>, updatedBy?: string) => Promise<GoldRates>;
  simulateRateDelta: (deltas: {
    delta22K?: number;
    delta24K?: number;
    delta18K?: number;
    deltaSilver?: number;
  }) => Promise<GoldRates>;
  lastChangedTimestamp: number;
  isUpdatedRecently: boolean;
  recentChangeMessage: string | null;
  isLiveModalOpen: boolean;
  setIsLiveModalOpen: (open: boolean) => void;
  isAutoMarketSync: boolean;
  setIsAutoMarketSync: (active: boolean) => void;
}

const GoldRateContext = createContext<GoldRateContextType>({
  rates: DEFAULT_GOLD_RATES,
  previousRates: null,
  loading: false,
  refreshRates: async () => {},
  updateRates: async () => DEFAULT_GOLD_RATES,
  simulateRateDelta: async () => DEFAULT_GOLD_RATES,
  lastChangedTimestamp: 0,
  isUpdatedRecently: false,
  recentChangeMessage: null,
  isLiveModalOpen: false,
  setIsLiveModalOpen: () => {},
  isAutoMarketSync: false,
  setIsAutoMarketSync: () => {},
});

export const GoldRateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rates, setRates] = useState<GoldRates>(DEFAULT_GOLD_RATES);
  const [previousRates, setPreviousRates] = useState<GoldRates | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastChangedTimestamp, setLastChangedTimestamp] = useState<number>(0);
  const [isUpdatedRecently, setIsUpdatedRecently] = useState<boolean>(false);
  const [recentChangeMessage, setRecentChangeMessage] = useState<string | null>(null);
  const [isLiveModalOpen, setIsLiveModalOpen] = useState<boolean>(false);
  const [isAutoMarketSync, setIsAutoMarketSync] = useState<boolean>(false);

  const pathname = usePathname();
  const prevRatesRef = useRef<GoldRates>(DEFAULT_GOLD_RATES);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef<boolean>(true);

  // Subscribe to real-time updates (BroadcastChannel, LocalStorage, Firestore onSnapshot)
  useEffect(() => {
    const unsubscribe = subscribeToGoldRates((incoming) => {
      // Ignore initial subscription emission on page load/mount to prevent unwanted toasts
      if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
        prevRatesRef.current = incoming;
        setRates(incoming);
        setLoading(false);
        return;
      }

      const prev = prevRatesRef.current;
      const goldDiff = incoming.rate22K - prev.rate22K;
      const silverDiff = incoming.rateSilver - prev.rateSilver;
      const hasChanged =
        prev &&
        (prev.rate24K !== incoming.rate24K ||
          goldDiff !== 0 ||
          prev.rate18K !== incoming.rate18K ||
          silverDiff !== 0);

      if (hasChanged && (goldDiff !== 0 || silverDiff !== 0)) {
        setPreviousRates({ ...prev });
        setLastChangedTimestamp(Date.now());
        setIsUpdatedRecently(true);

        let diffText = '';
        if (goldDiff !== 0) {
          diffText += `22K: ₹${incoming.rate22K}/g (${goldDiff > 0 ? '+' : ''}₹${goldDiff}) `;
        }
        if (silverDiff !== 0) {
          diffText += `Silver: ₹${incoming.rateSilver}/g (${silverDiff > 0 ? '+' : ''}₹${silverDiff})`;
        }

        setRecentChangeMessage(diffText || 'Rates updated');

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setIsUpdatedRecently(false);
          setRecentChangeMessage(null);
        }, 5000);
      }

      prevRatesRef.current = incoming;
      setRates(incoming);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Simulated live market auto-ticker during trading hours (optional feature)
  useEffect(() => {
    if (!isAutoMarketSync) return;

    const interval = setInterval(() => {
      // Pick a random fluctuation: ±₹5, ±₹10, or ±₹15 for gold, ±₹0.2 to ±₹0.5 for silver
      const randGold = (Math.floor(Math.random() * 5) - 2) * 5; // -10, -5, 0, 5, 10
      const randSilver = Math.round((Math.random() * 0.8 - 0.4) * 10) / 10;

      if (randGold !== 0 || randSilver !== 0) {
        serviceSimulateRateDelta({
          delta22K: randGold,
          deltaSilver: randSilver,
        });
      }
    }, 25000);

    return () => clearInterval(interval);
  }, [isAutoMarketSync]);

  const refreshRates = async () => {
    try {
      const live = await getLatestGoldRates();
      setRates(live);
    } catch (e) {
      console.error('Failed to reload rates:', e);
    }
  };

  const updateRates = async (newRates: Partial<GoldRates>, updatedBy: string = 'Admin'): Promise<GoldRates> => {
    return await serviceUpdateGoldRates(newRates, updatedBy);
  };

  const simulateRateDelta = async (deltas: {
    delta22K?: number;
    delta24K?: number;
    delta18K?: number;
    deltaSilver?: number;
  }): Promise<GoldRates> => {
    return await serviceSimulateRateDelta(deltas);
  };

  return (
    <GoldRateContext.Provider
      value={{
        rates,
        previousRates,
        loading,
        refreshRates,
        updateRates,
        simulateRateDelta,
        lastChangedTimestamp,
        isUpdatedRecently,
        recentChangeMessage,
        isLiveModalOpen,
        setIsLiveModalOpen,
        isAutoMarketSync,
        setIsAutoMarketSync,
      }}
    >
      {children}

      {/* Floating Instant Real-Time Rate Change Toast Banner: Strictly restricted to /gold-rate and /admin/gold-rates */}
      {(pathname === '/gold-rate' || pathname === '/admin/gold-rates') && isUpdatedRecently && recentChangeMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-50 max-w-sm w-[calc(100vw-1.5rem)] sm:w-auto bg-[#1A1818]/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-[#C5A880]/50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 animate-pulse">
                <Zap className="w-4 h-4 fill-emerald-400" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#DFCDAE]">
                    Live Bullion Rate Changed
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                </div>
                <p className="text-xs font-semibold text-white mt-0.5 truncate">
                  {recentChangeMessage}
                </p>
                <p className="text-[10px] text-[#A8A29E] mt-0.5">
                  Live bullion benchmark updated.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsUpdatedRecently(false)}
              className="text-[#A8A29E] hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors shrink-0"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </GoldRateContext.Provider>
  );
};

export const useGoldRates = () => useContext(GoldRateContext);
