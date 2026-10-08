import { Product } from '@/types';
import { INITIAL_PRODUCTS } from '@/data/seedData';
import { db, isFirebaseConfigured } from '@/lib/firebase/config';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

// In-memory / browser cached storage when Firebase credentials are not yet set
let memoryProducts: Product[] = [...INITIAL_PRODUCTS];

// Helper to get products from localStorage in browser if available
function getLocalStoredProducts(): Product[] {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('vj_products_cache');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryProducts = parsed;
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse local stored products:', e);
      }
    }
  }
  return memoryProducts;
}

function saveLocalProducts(products: Product[]) {
  memoryProducts = products;
  if (typeof window !== 'undefined') {
    localStorage.setItem('vj_products_cache', JSON.stringify(products));
    window.dispatchEvent(new Event('vj_products_updated'));
  }
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
  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, 'products');
      const snapshot = await getDocs(colRef);
      if (!snapshot.empty) {
        const list: Product[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as Omit<Product, 'id'>) });
        });
        saveLocalProducts(list);
        return list;
      }
    } catch (err) {
      console.warn('Firestore fetch failed, falling back to local memory store:', err);
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

  let filtered = all.filter((p) => {
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
  const all = await getAllProducts();
  const found = all.find((p) => p.slug === slug || p.id === slug);
  return found || null;
}

export async function getProductById(id: string): Promise<Product | null> {
  const all = await getAllProducts();
  const found = all.find((p) => p.id === id);
  return found || null;
}

export async function createOrUpdateProduct(product: Product): Promise<Product> {
  const all = [...(await getAllProducts())];
  const index = all.findIndex((p) => p.id === product.id);

  const updatedProduct = {
    ...product,
    updatedAt: new Date().toISOString(),
  };

  if (index >= 0) {
    all[index] = updatedProduct;
  } else {
    all.unshift(updatedProduct);
  }

  saveLocalProducts(all);

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'products', product.id);
      await setDoc(docRef, updatedProduct);
    } catch (err) {
      console.error('Failed to sync product to Firestore:', err);
    }
  }

  return updatedProduct;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const all = await getAllProducts();
  const filtered = all.filter((p) => p.id !== id);
  saveLocalProducts(filtered);

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

  if (isFirebaseConfigured && db) {
    try {
      // Chunk writes for Firestore 500 ops limit
      for (const p of products) {
        await setDoc(doc(db, 'products', p.id), p);
      }
    } catch (e) {
      console.warn('Firestore bulk write warning:', e);
    }
  }

  return { count: products.length };
}
