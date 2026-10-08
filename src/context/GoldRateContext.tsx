'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoldRates } from '@/types';
import { DEFAULT_GOLD_RATES } from '@/services/pricingEngine';
import { getLatestGoldRates } from '@/lib/db/goldRateService';

interface GoldRateContextType {
  rates: GoldRates;
  loading: boolean;
  refreshRates: () => Promise<void>;
}

const GoldRateContext = createContext<GoldRateContextType>({
  rates: DEFAULT_GOLD_RATES,
  loading: false,
  refreshRates: async () => {},
});

export const GoldRateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rates, setRates] = useState<GoldRates>(DEFAULT_GOLD_RATES);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchRates = async () => {
    try {
      const live = await getLatestGoldRates();
      setRates(live);
    } catch (e) {
      console.error('Failed to load rates in provider:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();

    const handleRateChange = (event: Event) => {
      const custom = event as CustomEvent<GoldRates>;
      if (custom.detail) {
        setRates(custom.detail);
      } else {
        fetchRates();
      }
    };

    window.addEventListener('vj_gold_rate_changed', handleRateChange);
    return () => {
      window.removeEventListener('vj_gold_rate_changed', handleRateChange);
    };
  }, []);

  return (
    <GoldRateContext.Provider value={{ rates, loading, refreshRates: fetchRates }}>
      {children}
    </GoldRateContext.Provider>
  );
};

export const useGoldRates = () => useContext(GoldRateContext);
