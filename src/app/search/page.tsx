'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Sparkles, X, ArrowRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import { Product } from '@/types';
import { getAllProducts } from '@/lib/db/productService';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    getAllProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const trendingTags = [
    '22K Haar',
    'Solitaire Ring',
    'Patlya Bangles',
    'Wati Mangalsutra',
    'Antique Choker',
    'Jhumkas',
    'Silver Pooja',
  ];

  const searchResults = products.filter((p) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();
    return (
      p.name.toLowerCase().includes(q) ||
      p.SKU.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.subcategory.toLowerCase().includes(q) ||
      p.collection.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
      {/* Search Bar Header */}
      <div className="max-w-2xl mx-auto text-center mb-10">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1818] mb-4">
          Discover Jewellery at Vardhaman
        </h1>

        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by jewellery name, SKU, 22K gold, diamond..."
            className="w-full bg-white text-sm pl-12 pr-28 py-3.5 rounded-full border border-[#E8E2D8] focus:border-[#C5A880] focus:outline-none shadow-md"
          />
          <Search className="w-5 h-5 text-[#78716C] absolute left-4 top-4" />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                router.push('/search');
              }}
              className="absolute right-24 top-4 text-[#A8A29E] hover:text-[#2B2625]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 bottom-1.5 px-6 rounded-full bg-[#581825] text-white text-xs font-semibold hover:bg-[#380B12] transition-colors"
          >
            Search
          </button>
        </form>

        {/* Trending Searches */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
          <span className="text-[#78716C] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
            Trending:
          </span>
          {trendingTags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setQuery(tag);
                router.push(`/search?q=${encodeURIComponent(tag)}`);
              }}
              className="bg-white hover:bg-[#FAF7F2] text-[#581825] px-3 py-1 rounded-full border border-[#E8E2D8] transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between pb-4 mb-8 border-b border-[#E8E2D8] text-xs">
        <span className="text-[#78716C]">
          {query ? (
            <>
              Showing results for "<strong className="text-[#1A1818]">{query}</strong>"
            </>
          ) : (
            'Showing all curated creations'
          )}
        </span>
        <span className="font-semibold text-[#581825]">{searchResults.length} Products Found</span>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-[4/5] rounded-xl luxury-shimmer border border-[#E8E2D8]"></div>
          ))}
        </div>
      ) : searchResults.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E8E2D8] p-12 text-center max-w-md mx-auto">
          <Sparkles className="w-10 h-10 text-[#C5A880] mx-auto mb-3" />
          <h3 className="font-serif text-lg font-bold text-[#1A1818]">No matches found</h3>
          <p className="text-xs text-[#78716C] mt-1">
            We couldn't find any jewellery matching "{query}". Try searching for categories like "Haar", "Bangles", "22K", or "Diamond".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {searchResults.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="p-12 text-center text-xs">Loading search...</div>}>
          <SearchContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
