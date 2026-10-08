import { GoldRates, GoldRateHistoryItem } from '@/types';
import { INITIAL_GOLD_RATES } from '@/data/seedData';
import { db, isFirebaseConfigured } from '@/lib/firebase/config';
import { doc, getDoc, setDoc, collection, addDoc, getDocs } from 'firebase/firestore';

let memoryRates: GoldRates = { ...INITIAL_GOLD_RATES };
let memoryHistory: GoldRateHistoryItem[] = [
  { ...INITIAL_GOLD_RATES, id: 'init-rate-1' },
  {
    id: 'rate-hist-yesterday',
    rate24K: 7340,
    rate22K: 6730,
    rate18K: 5500,
    rateSilver: 88,
    effectiveDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    effectiveTime: '10:30 AM',
    updatedBy: 'Vardhaman Bullion Desk',
    source: 'IBJA Spot Rate',
    notes: 'Closing rate',
    lastUpdatedTimestamp: Date.now() - 86400000,
  },
];

function getStoredRates(): GoldRates {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('vj_gold_rates');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        memoryRates = parsed;
        return parsed;
      } catch (e) {
        console.error('Failed to parse gold rates:', e);
      }
    }
  }
  return memoryRates;
}

function saveRatesLocally(rates: GoldRates) {
  memoryRates = rates;
  if (typeof window !== 'undefined') {
    localStorage.setItem('vj_gold_rates', JSON.stringify(rates));
    window.dispatchEvent(new CustomEvent('vj_gold_rate_changed', { detail: rates }));
  }
}

export async function getLatestGoldRates(): Promise<GoldRates> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'settings', 'goldRates');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as GoldRates;
        saveRatesLocally(data);
        return data;
      }
    } catch (e) {
      console.warn('Firestore gold rates fetch error:', e);
    }
  }
  return getStoredRates();
}

export async function updateGoldRates(newRates: Partial<GoldRates>, updatedBy: string = 'Admin'): Promise<GoldRates> {
  const current = await getLatestGoldRates();
  const updated: GoldRates = {
    ...current,
    ...newRates,
    updatedBy,
    lastUpdatedTimestamp: Date.now(),
    effectiveDate: new Date().toISOString().split('T')[0],
    effectiveTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
  };

  saveRatesLocally(updated);

  // Add to history
  const historyItem: GoldRateHistoryItem = {
    ...updated,
    id: `rate-${Date.now()}`,
  };
  memoryHistory.unshift(historyItem);
  if (typeof window !== 'undefined') {
    localStorage.setItem('vj_gold_rates_history', JSON.stringify(memoryHistory.slice(0, 50)));
  }

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'settings', 'goldRates'), updated);
      await addDoc(collection(db, 'goldRateHistory'), historyItem);
    } catch (e) {
      console.error('Firestore gold rate update failed:', e);
    }
  }

  return updated;
}

export async function getGoldRateHistory(): Promise<GoldRateHistoryItem[]> {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('vj_gold_rates_history');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryHistory = parsed;
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse history:', e);
      }
    }
  }
  return memoryHistory;
}
