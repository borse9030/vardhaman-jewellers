import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { INITIAL_PRODUCTS } from '@/data/seedData';
import { Product } from '@/types';

const DATA_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'persistedProducts.json');

// Helper to safely read persisted products from server disk
function readServerProducts(): Product[] {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const raw = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const merged = [...parsed];
        for (const initP of INITIAL_PRODUCTS) {
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
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(INITIAL_PRODUCTS, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Could not initialize persistedProducts.json on disk:', e);
  }
  return [...INITIAL_PRODUCTS];
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

    const currentList = readServerProducts();
    const existingIndex = currentList.findIndex(
      (p) => p.id === product.id || p.SKU === product.SKU
    );

    const updatedProduct: Product = {
      ...product,
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
    const filtered = currentList.filter((p) => p.id !== id);

    writeServerProducts(filtered);

    return NextResponse.json(
      { success: true, remainingCount: filtered.length },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err: any) {
    console.error('Failed to delete product on server:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
