import { GoldRates, GoldRateHistoryItem } from '@/types';
import { INITIAL_GOLD_RATES } from '@/data/seedData';
import { db, isFirebaseConfigured } from '@/lib/firebase/config';
import { doc, getDoc, setDoc, collection, addDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';

const CHANNEL_NAME = 'vj_bullion_rates_channel_v1';

let memoryRates: GoldRates = {
  ...INITIAL_GOLD_RATES,
  rate14K: Math.round((INITIAL_GOLD_RATES.rate24K * 14) / 24),
  rateSilver1kg: INITIAL_GOLD_RATES.rateSilver * 1000,
  change24K: 15,
  change22K: 15,
  change18K: 10,
  changeSilver: 0.5,
};

let memoryHistory: GoldRateHistoryItem[] = [
  { ...memoryRates, id: 'init-rate-1' },
  {
    id: 'rate-hist-yesterday',
    rate24K: 7340,
    rate22K: 6730,
    rate18K: 5500,
    rateSilver: 88,
    rate14K: 4280,
    rateSilver1kg: 88000,
    change24K: -10,
    change22K: -10,
    change18K: -5,
    changeSilver: -0.2,
    effectiveDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    effectiveTime: '10:30 AM',
    updatedBy: 'Vardhaman Bullion Desk',
    source: 'IBJA Spot Rate',
    notes: 'Closing rate yesterday',
    lastUpdatedTimestamp: Date.now() - 86400000,
  },
];

function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      return new BroadcastChannel(CHANNEL_NAME);
    } catch {
      return null;
    }
  }
  return null;
}

export function getStoredRates(): GoldRates {
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

export function saveRatesLocally(rates: GoldRates, broadcast: boolean = true) {
  memoryRates = rates;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('vj_gold_rates', JSON.stringify(rates));
    } catch (e) {
      console.warn('LocalStorage error saving gold rates:', e);
    }

    if (broadcast) {
      // 1. Dispatch custom event for current window
      window.dispatchEvent(new CustomEvent('vj_gold_rate_changed', { detail: rates }));

      // 2. BroadcastChannel for instant cross-tab sync
      const channel = getBroadcastChannel();
      if (channel) {
        try {
          channel.postMessage(rates);
          channel.close();
        } catch {}
      }
    }
  }
}

/**
 * Subscribes to real-time gold and silver rates updates across tabs and devices.
 * Uses BroadcastChannel, LocalStorage storage events, CustomEvent, and Firestore onSnapshot.
 */
export function subscribeToGoldRates(callback: (rates: GoldRates) => void): () => void {
  // 1. Emit current rate immediately
  callback(getStoredRates());

  // 2. Listen to custom event (same window/tab)
  const handleCustomEvent = (e: Event) => {
    const custom = e as CustomEvent<GoldRates>;
    if (custom.detail) {
      callback(custom.detail);
    }
  };

  // 3. Listen to storage event (across tabs in same browser)
  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === 'vj_gold_rates' && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        memoryRates = parsed;
        callback(parsed);
      } catch (err) {
        console.error('Error parsing rates from storage event:', err);
      }
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('vj_gold_rate_changed', handleCustomEvent);
    window.addEventListener('storage', handleStorageEvent);
  }

  // 4. Listen to BroadcastChannel (ultra-fast cross-tab synchronization)
  let channel: BroadcastChannel | null = null;
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = (event) => {
        if (event.data) {
          memoryRates = event.data;
          callback(event.data);
        }
      };
    } catch {}
  }

  // 5. Firestore real-time onSnapshot listener (cross-device sync)
  let firestoreUnsub: Unsubscribe | null = null;
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'settings', 'goldRates');
      firestoreUnsub = onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as GoldRates;
            saveRatesLocally(data, false); // Do not re-broadcast endlessly
            callback(data);
          }
        },
        (error) => {
          console.warn('Firestore onSnapshot subscription error:', error);
        }
      );
    } catch (err) {
      console.warn('Firestore snapshot setup failed:', err);
    }
  }

  // Return cleanup function
  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('vj_gold_rate_changed', handleCustomEvent);
      window.removeEventListener('storage', handleStorageEvent);
    }
    if (channel) {
      try {
        channel.close();
      } catch {}
    }
    if (firestoreUnsub) {
      try {
        firestoreUnsub();
      } catch {}
    }
  };
}

export async function getLatestGoldRates(): Promise<GoldRates> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'settings', 'goldRates');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as GoldRates;
        saveRatesLocally(data, false);
        return data;
      }
    } catch (e) {
      console.warn('Firestore gold rates fetch error:', e);
    }
  }
  return getStoredRates();
}

/**
 * Updates gold & silver rates and immediately propagates the new rates to all clients.
 */
export async function updateGoldRates(newRates: Partial<GoldRates>, updatedBy: string = 'Admin'): Promise<GoldRates> {
  const current = getStoredRates();

  const change24K = newRates.rate24K !== undefined ? newRates.rate24K - current.rate24K : current.change24K || 0;
  const change22K = newRates.rate22K !== undefined ? newRates.rate22K - current.rate22K : current.change22K || 0;
  const change18K = newRates.rate18K !== undefined ? newRates.rate18K - current.rate18K : current.change18K || 0;
  const changeSilver = newRates.rateSilver !== undefined ? Math.round((newRates.rateSilver - current.rateSilver) * 10) / 10 : current.changeSilver || 0;

  const rate24K = newRates.rate24K ?? current.rate24K;
  const rate22K = newRates.rate22K ?? current.rate22K;
  const rate18K = newRates.rate18K ?? current.rate18K;
  const rateSilver = newRates.rateSilver ?? current.rateSilver;

  const updated: GoldRates = {
    ...current,
    ...newRates,
    rate24K,
    rate22K,
    rate18K,
    rateSilver,
    rate14K: newRates.rate14K ?? Math.round((rate24K * 14) / 24),
    rateSilver1kg: rateSilver * 1000,
    change24K,
    change22K,
    change18K,
    changeSilver,
    updatedBy,
    lastUpdatedTimestamp: Date.now(),
    effectiveDate: new Date().toISOString().split('T')[0],
    effectiveTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
  };

  saveRatesLocally(updated, true);

  // Add to local history
  const historyItem: GoldRateHistoryItem = {
    ...updated,
    id: `rate-${Date.now()}`,
  };
  memoryHistory.unshift(historyItem);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('vj_gold_rates_history', JSON.stringify(memoryHistory.slice(0, 50)));
    } catch {}
  }

  // Push to Firestore if configured
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

/**
 * Simulates a market fluctuation or applies deltas to test instant rate change across the site.
 */
export async function simulateRateDelta(deltas: {
  delta22K?: number;
  delta24K?: number;
  delta18K?: number;
  deltaSilver?: number;
}): Promise<GoldRates> {
  const current = getStoredRates();
  const next22K = Math.max(5000, current.rate22K + (deltas.delta22K ?? 0));
  const next24K = Math.max(5500, current.rate24K + (deltas.delta24K ?? (deltas.delta22K ? Math.round(deltas.delta22K * 1.09) : 0)));
  const next18K = Math.max(4000, current.rate18K + (deltas.delta18K ?? (deltas.delta22K ? Math.round(deltas.delta22K * 0.82) : 0)));
  const nextSilver = Math.max(50, Math.round((current.rateSilver + (deltas.deltaSilver ?? 0)) * 10) / 10);

  return updateGoldRates(
    {
      rate24K: next24K,
      rate22K: next22K,
      rate18K: next18K,
      rateSilver: nextSilver,
      source: 'IBJA Spot Real-Time Tick',
      notes: `Market adjustment: 22K (${deltas.delta22K ? (deltas.delta22K > 0 ? '+' : '') + deltas.delta22K : '0'}), Silver (${deltas.deltaSilver ? (deltas.deltaSilver > 0 ? '+' : '') + deltas.deltaSilver : '0'})`,
    },
    'Live Market Feed'
  );
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
