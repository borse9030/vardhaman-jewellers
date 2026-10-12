import { Product } from '@/types';
import { INITIAL_PRODUCTS } from '@/data/seedData';
import { db, isFirebaseConfigured } from '@/lib/firebase/config';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';

// In-memory / browser cached storage
let memoryProducts: Product[] = [...INITIAL_PRODUCTS];

// Helper to broadcast product updates across all open tabs and windows
function broadcastProductUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('vj_products_updated'));
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('vj_sync_channel');
        bc.postMessage({ type: 'PRODUCTS_UPDATED', timestamp: Date.now() });
        bc.close();
      }
    } catch {
      // Ignore broadcast channel errors in restricted environments
    }
  }
}

// LocalStorage tracking for deleted products so they are never accidentally resurrected
function getLocalDeletedIds(): string[] {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('vj_deleted_product_ids');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed.map((id) => String(id).toLowerCase().trim());
      }
    } catch {}
  }
  return [];
}

function addLocalDeletedId(id: string, sku?: string, slug?: string) {
  if (typeof window !== 'undefined') {
    try {
      const list = getLocalDeletedIds();
      if (id && !list.includes(id.toLowerCase())) list.push(id.toLowerCase());
      if (sku && !list.includes(sku.toLowerCase())) list.push(sku.toLowerCase());
      if (slug && !list.includes(slug.toLowerCase())) list.push(slug.toLowerCase());
      localStorage.setItem('vj_deleted_product_ids', JSON.stringify(list));
    } catch {}
  }
}

function removeLocalDeletedId(id: string, sku?: string) {
  if (typeof window !== 'undefined') {
    try {
      const list = getLocalDeletedIds();
      const updated = list.filter(
        (x) => x !== id.toLowerCase() && (!sku || x !== sku.toLowerCase())
      );
      localStorage.setItem('vj_deleted_product_ids', JSON.stringify(updated));
    } catch {}
  }
}

// Helper to filter out deleted products
function filterOutDeleted(products: Product[]): Product[] {
  const deleted = getLocalDeletedIds();
  if (deleted.length === 0) return products;
  return products.filter(
    (p) =>
      !deleted.includes(p.id.toLowerCase()) &&
      (!p.SKU || !deleted.includes(p.SKU.toLowerCase())) &&
      (!p.slug || !deleted.includes(p.slug.toLowerCase()))
  );
}

// Helper to get products from localStorage in browser
function getLocalStoredProducts(): Product[] {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('vj_products_cache');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const active = filterOutDeleted(parsed);
          memoryProducts = active;
          return active;
        }
      } catch (e) {
        console.error('Failed to parse local stored products:', e);
      }
    }
  }
  const activeMemory = filterOutDeleted(memoryProducts);
  return activeMemory;
}

function saveLocalProducts(products: Product[]) {
  const active = filterOutDeleted(products);
  memoryProducts = active;
  if (typeof window !== 'undefined') {
    localStorage.setItem('vj_products_cache', JSON.stringify(active));
    broadcastProductUpdate();
  }
}

// Global cross-tab listeners
if (typeof window !== 'undefined') {
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('vj_sync_channel');
      channel.onmessage = (event) => {
        if (event.data?.type === 'PRODUCTS_UPDATED') {
          getLocalStoredProducts();
          window.dispatchEvent(new Event('vj_products_updated'));
        }
      };
    }
  } catch {}

  window.addEventListener('storage', (e) => {
    if (e.key === 'vj_products_cache' || e.key === 'vj_deleted_product_ids') {
      getLocalStoredProducts();
      window.dispatchEvent(new Event('vj_products_updated'));
    }
  });
}

export interface ProductFilterParams {
  category?: string;
  jewelleryType?: string;
  metalType?: string;
  purity?: string;
  minPrice?: number;
  maxPrice?: number;
  minWeight?: number;
  maxWeight?: number;
  search?: string;
  sort?: 'featured' | 'newest' | 'price_asc' | 'price_desc' | 'popular' | 'bestseller';
  featured?: boolean;
  trending?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
  page?: number;
  limit?: number;
}

export async function getAllProducts(): Promise<Product[]> {
  // 1. In browser, try server API route first so newly uploaded products sync across all devices
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          const active = filterOutDeleted(data.products);
          memoryProducts = active;
          localStorage.setItem('vj_products_cache', JSON.stringify(active));
          return active;
        }
      }
    } catch {
      // Fall through to Firestore or localStorage on fetch error
    }
  }

  // 2. Try Firestore if configured
  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, 'products');
      const snapshot = await getDocs(colRef);
      if (!snapshot.empty) {
        const list: Product[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as Omit<Product, 'id'>) });
        });
        const deleted = getLocalDeletedIds();
        INITIAL_PRODUCTS.forEach((initP) => {
          if (
            deleted.includes(initP.id.toLowerCase()) ||
            deleted.includes(initP.SKU.toLowerCase()) ||
            (initP.slug && deleted.includes(initP.slug.toLowerCase()))
          ) {
            return;
          }
          if (!list.some((p) => p.id === initP.id || p.slug === initP.slug || p.SKU === initP.SKU)) {
            list.push(initP);
          }
        });
        const active = filterOutDeleted(list);
        saveLocalProducts(active);
        return active;
      }
    } catch (err: any) {
      if (err?.code !== 'permission-denied') {
        console.warn('Firestore fetch failed, falling back to local memory store:', err);
      }
    }
  }

  return getLocalStoredProducts();
}

export async function getFilteredProducts(params: ProductFilterParams): Promise<{
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const all = await getAllProducts();

  const filtered = all.filter((p) => {
    // Category match
    if (params.category && params.category !== 'all' && params.category !== 'All Jewellery') {
      const catNorm = params.category.toLowerCase().replace(/-/g, ' ');
      const pCatNorm = p.category.toLowerCase().replace(/-/g, ' ');
      const pSubcatNorm = p.subcategory.toLowerCase().replace(/-/g, ' ');
      const pTypeNorm = p.jewelleryType.toLowerCase();
      if (
        !pCatNorm.includes(catNorm) &&
        !catNorm.includes(pCatNorm) &&
        !pSubcatNorm.includes(catNorm) &&
        !pTypeNorm.includes(catNorm)
      ) {
        return false;
      }
    }

    // Jewellery Type match (Gold, Diamond, Silver)
    if (params.jewelleryType && params.jewelleryType !== 'all') {
      if (p.jewelleryType.toLowerCase() !== params.jewelleryType.toLowerCase()) {
        return false;
      }
    }

    // Purity match
    if (params.purity && params.purity !== 'all') {
      if (p.purity.toLowerCase() !== params.purity.toLowerCase()) {
        return false;
      }
    }

    // Metal Type
    if (params.metalType && params.metalType !== 'all') {
      if (!p.metalType.toLowerCase().includes(params.metalType.toLowerCase())) {
        return false;
      }
    }

    // Price range
    const price = p.finalPrice;
    if (params.minPrice !== undefined && price < params.minPrice) return false;
    if (params.maxPrice !== undefined && price > params.maxPrice) return false;

    // Weight range
    const weight = p.grossWeight;
    if (params.minWeight !== undefined && weight < params.minWeight) return false;
    if (params.maxWeight !== undefined && weight > params.maxWeight) return false;

    // Flags
    if (params.featured && !p.featured) return false;
    if (params.trending && !p.trending) return false;
    if (params.newArrival && !p.newArrival) return false;
    if (params.bestSeller && !p.bestSeller) return false;

    // Search query
    if (params.search && params.search.trim() !== '') {
      const q = params.search.toLowerCase().trim();
      const inName = p.name.toLowerCase().includes(q);
      const inSKU = p.SKU.toLowerCase().includes(q);
      const inCat = p.category.toLowerCase().includes(q);
      const inSubcat = p.subcategory.toLowerCase().includes(q);
      const inCollection = p.collection.toLowerCase().includes(q);
      const inTags = p.tags.some((t) => t.toLowerCase().includes(q));
      if (!inName && !inSKU && !inCat && !inSubcat && !inCollection && !inTags) {
        return false;
      }
    }

    return true;
  });

  // Sorting
  if (params.sort) {
    switch (params.sort) {
      case 'price_asc':
        filtered.sort((a, b) => a.finalPrice - b.finalPrice);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.finalPrice - a.finalPrice);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'bestseller':
        filtered.sort((a, b) => (b.bestSeller ? 1 : 0) - (a.bestSeller ? 1 : 0));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0));
        break;
      default:
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
  }

  const page = params.page || 1;
  const limit = params.limit || 24;
  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  return {
    products: paginated,
    total: filtered.length,
    page,
    totalPages: Math.ceil(filtered.length / limit) || 1,
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const normSlug = decodeURIComponent(slug).toLowerCase().trim();
  const all = await getAllProducts();
  const found = all.find(
    (p) => p.slug.toLowerCase() === normSlug || p.id.toLowerCase() === normSlug
  );
  if (found) return found;
  return (
    INITIAL_PRODUCTS.find(
      (p) => p.slug.toLowerCase() === normSlug || p.id.toLowerCase() === normSlug
    ) || null
  );
}

export async function getProductById(id: string): Promise<Product | null> {
  const all = await getAllProducts();
  const found = all.find((p) => p.id === id);
  return found || null;
}

export async function createOrUpdateProduct(product: Product): Promise<Product> {
  // Un-mark from local deleted list
  removeLocalDeletedId(product.id, product.SKU);

  const all = [...(await getAllProducts())];
  const index = all.findIndex((p) => p.id === product.id || p.SKU === product.SKU);

  // Guarantee thumbnail is synchronized with gallery images
  const finalThumbnail =
    (product.thumbnail && product.images?.includes(product.thumbnail))
      ? product.thumbnail
      : (product.images?.[0] || product.thumbnail || '');

  const updatedProduct: Product = {
    ...product,
    thumbnail: finalThumbnail,
    updatedAt: new Date().toISOString(),
  };

  if (index >= 0) {
    all[index] = updatedProduct;
  } else {
    all.unshift(updatedProduct);
  }

  // 1. Immediately save to local cache and broadcast across tabs
  saveLocalProducts(all);

  // 2. Persist to server API route
  if (typeof window !== 'undefined') {
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      });
    } catch (e) {
      console.warn('Server sync warning:', e);
    }
  }

  // 3. Persist to Firestore if configured
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'products', product.id);
      await setDoc(docRef, updatedProduct);
    } catch (err: any) {
      if (err?.code !== 'permission-denied') {
        console.error('Failed to sync product to Firestore:', err);
      }
    }
  }

  return updatedProduct;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const all = await getAllProducts();
  const target = all.find((p) => p.id === id || p.SKU?.toLowerCase() === id.toLowerCase());

  // Record in local deleted storage immediately
  addLocalDeletedId(id, target?.SKU, target?.slug);

  const filtered = all.filter(
    (p) => p.id !== id && p.SKU?.toLowerCase() !== id.toLowerCase()
  );
  saveLocalProducts(filtered);

  // 1. Sync to server API route
  if (typeof window !== 'undefined') {
    try {
      await fetch(`/api/products?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.warn('Server delete warning:', e);
    }
  }

  // 2. Sync to Firestore if configured
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (err) {
      console.error('Failed to delete product in Firestore:', err);
    }
  }

  return true;
}

export async function bulkImportProducts(products: Product[]): Promise<{ count: number }> {
  const all = [...(await getAllProducts())];
  const existingMap = new Map<string, number>();
  all.forEach((p, idx) => existingMap.set(p.SKU, idx));

  products.forEach((p) => {
    if (existingMap.has(p.SKU)) {
      const idx = existingMap.get(p.SKU)!;
      all[idx] = { ...p, updatedAt: new Date().toISOString() };
    } else {
      all.push(p);
    }
  });

  saveLocalProducts(all);

  // Sync to server API route for cross-device persistence
  if (typeof window !== 'undefined') {
    for (const p of products) {
      try {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(p),
        });
      } catch (e) {
        console.warn('Server bulk sync warning for product:', p.SKU, e);
      }
    }
  }

  if (isFirebaseConfigured && db) {
    try {
      for (const p of products) {
        await setDoc(doc(db, 'products', p.id), p);
      }
    } catch (e) {
      console.warn('Firestore bulk write warning:', e);
    }
  }

  return { count: products.length };
}
