import { StoreLocation } from '@/types';
import { INITIAL_STORES } from '@/data/seedData';

let memoryStores: StoreLocation[] = [...INITIAL_STORES];

export async function getAllStores(): Promise<StoreLocation[]> {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('vj_stores');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryStores = parsed;
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse stores:', e);
      }
    }
  }
  return memoryStores;
}

export async function getStoreById(id: string): Promise<StoreLocation | null> {
  const stores = await getAllStores();
  return stores.find((s) => s.id === id || s.slug === id) || null;
}
