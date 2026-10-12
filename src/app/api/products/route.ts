import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { INITIAL_PRODUCTS } from '@/data/seedData';
import { Product } from '@/types';

const DATA_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'persistedProducts.json');
const DELETED_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'deletedProducts.json');

// Helper to read deleted product IDs so deleted products are never resurrected
function readDeletedIds(): string[] {
  try {
    if (fs.existsSync(DELETED_FILE_PATH)) {
      const raw = fs.readFileSync(DELETED_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((id) => String(id).toLowerCase().trim());
      }
    }
  } catch (err) {
    console.error('Error reading deleted products list:', err);
  }
  return [];
}

// Helper to write deleted product IDs
function writeDeletedIds(ids: string[]): boolean {
  try {
    const unique = Array.from(new Set(ids.map((id) => String(id).toLowerCase().trim())));
    fs.writeFileSync(DELETED_FILE_PATH, JSON.stringify(unique, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing deleted products list:', err);
    return false;
  }
}

// Helper to safely read persisted products from server disk
function readServerProducts(): Product[] {
  const deletedIds = readDeletedIds();
  const isDeleted = (p: { id?: string; SKU?: string; slug?: string }) => {
    return (
      (p.id && deletedIds.includes(p.id.toLowerCase())) ||
      (p.SKU && deletedIds.includes(p.SKU.toLowerCase())) ||
      (p.slug && deletedIds.includes(p.slug.toLowerCase()))
    );
  };

  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const raw = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Exclude any previously deleted products
        const merged: Product[] = parsed.filter((p: Product) => !isDeleted(p));

        // Sync thumbnail if user uploaded an image
        merged.forEach((p) => {
          if (p.images && p.images.length > 0) {
            if (!p.thumbnail || (!p.images.includes(p.thumbnail) && p.images[0].startsWith('/uploads'))) {
              p.thumbnail = p.images[0];
            }
          }
        });

        // Merge initial products ONLY if they haven't been deleted
        for (const initP of INITIAL_PRODUCTS) {
          if (isDeleted(initP)) continue;
          if (!merged.some((p) => p.id === initP.id || p.SKU === initP.SKU)) {
            merged.push(initP);
          }
        }
        return merged;
      }
    }
  } catch (err) {
    console.error('Error reading persisted products:', err);
  }

  try {
    const filteredInitial = INITIAL_PRODUCTS.filter((p) => !isDeleted(p));
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(filteredInitial, null, 2), 'utf-8');
    return filteredInitial;
  } catch (e) {
    console.warn('Could not initialize persistedProducts.json on disk:', e);
  }
  return INITIAL_PRODUCTS.filter((p) => !isDeleted(p));
}

// Helper to write products to server disk
function writeServerProducts(products: Product[]): boolean {
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(products, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing persisted products:', err);
    return false;
  }
}

// GET /api/products - Returns all products from server storage
export async function GET() {
  const products = readServerProducts();
  return NextResponse.json(
    { products, count: products.length, timestamp: Date.now() },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}

// POST /api/products - Create or update a product
export async function POST(req: NextRequest) {
  try {
    const product: Product = await req.json();
    if (!product || !product.id || !product.name) {
      return NextResponse.json({ error: 'Invalid product payload' }, { status: 400 });
    }

    // Un-delete if this product ID or SKU was previously in deleted list
    const deletedIds = readDeletedIds();
    const updatedDeletedIds = deletedIds.filter(
      (d) =>
        d !== product.id.toLowerCase() &&
        d !== product.SKU?.toLowerCase() &&
        d !== product.slug?.toLowerCase()
    );
    if (updatedDeletedIds.length !== deletedIds.length) {
      writeDeletedIds(updatedDeletedIds);
    }

    const currentList = readServerProducts();
    const existingIndex = currentList.findIndex(
      (p) => p.id === product.id || p.SKU === product.SKU
    );

    // Make sure thumbnail is aligned with images
    const finalThumbnail =
      (product.thumbnail && product.images?.includes(product.thumbnail))
        ? product.thumbnail
        : (product.images?.[0] || product.thumbnail || '');

    const updatedProduct: Product = {
      ...product,
      thumbnail: finalThumbnail,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      currentList[existingIndex] = updatedProduct;
    } else {
      currentList.unshift(updatedProduct);
    }

    writeServerProducts(currentList);

    return NextResponse.json(
      { product: updatedProduct, success: true },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err: any) {
    console.error('Failed to save product on server:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/products?id=... - Delete a product
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing product ID' }, { status: 400 });
    }

    const currentList = readServerProducts();
    const targetProduct = currentList.find(
      (p) => p.id === id || p.SKU?.toLowerCase() === id.toLowerCase()
    );
    const filtered = currentList.filter(
      (p) => p.id !== id && p.SKU?.toLowerCase() !== id.toLowerCase()
    );

    writeServerProducts(filtered);

    // Record permanently in deletedProducts.json
    const deletedIds = readDeletedIds();
    deletedIds.push(id.toLowerCase());
    if (targetProduct) {
      if (targetProduct.id) deletedIds.push(targetProduct.id.toLowerCase());
      if (targetProduct.SKU) deletedIds.push(targetProduct.SKU.toLowerCase());
      if (targetProduct.slug) deletedIds.push(targetProduct.slug.toLowerCase());
    }
    writeDeletedIds(deletedIds);

    return NextResponse.json(
      { success: true, remainingCount: filtered.length, deletedId: id },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err: any) {
    console.error('Failed to delete product on server:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
