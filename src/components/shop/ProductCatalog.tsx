'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Filter,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RotateCcw,
  Check,
} from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { Product } from '@/types';
import { getAllProducts } from '@/lib/db/productService';
import { useGoldRates } from '@/context/GoldRateContext';
import { calculateProductPrice } from '@/services/pricingEngine';

interface ProductCatalogProps {
  initialCategory?: string;
  initialType?: string;
  pageTitle?: string;
  pageSubtitle?: string;
}

export default function ProductCatalog({
  initialCategory,
  initialType,
  pageTitle = 'Fine Jewellery Collection',
  pageSubtitle = 'Handcrafted with BIS Hallmarked Gold & Certified Natural Diamonds',
}: ProductCatalogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { rates } = useGoldRates();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filters state from URL query params or defaults
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || initialCategory || 'all'
  );
  const [selectedType, setSelectedType] = useState<string>(
    searchParams.get('type') || initialType || 'all'
  );
  const [selectedPurity, setSelectedPurity] = useState<string>(
    searchParams.get('purity') || 'all'
  );
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>(
    searchParams.get('priceRange') || 'all'
  );
  const [selectedWeightRange, setSelectedWeightRange] = useState<string>(
    searchParams.get('weightRange') || 'all'
  );
  const [selectedSort, setSelectedSort] = useState<string>(
    searchParams.get('sort') || 'featured'
  );

  useEffect(() => {
    setLoading(true);
    getAllProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  // Sync state to URL
  const updateURL = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    updateURL('category', val);
  };
  const handleTypeChange = (val: string) => {
    setSelectedType(val);
    updateURL('type', val);
  };
  const handlePurityChange = (val: string) => {
    setSelectedPurity(val);
    updateURL('purity', val);
  };
  const handlePriceChange = (val: string) => {
    setSelectedPriceRange(val);
    updateURL('priceRange', val);
  };
  const handleWeightChange = (val: string) => {
    setSelectedWeightRange(val);
    updateURL('weightRange', val);
  };
  const handleSortChange = (val: string) => {
    setSelectedSort(val);
    updateURL('sort', val);
  };

  const handleClearAll = () => {
    setSelectedCategory('all');
    setSelectedType('all');
    setSelectedPurity('all');
    setSelectedPriceRange('all');
    setSelectedWeightRange('all');
    setSelectedSort('featured');
    router.replace(window.location.pathname, { scroll: false });
  };

  // Filtered & Sorted products computation
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category
      if (selectedCategory !== 'all') {
        const catNorm = selectedCategory.toLowerCase();
        const pCatNorm = p.category.toLowerCase();
        if (!pCatNorm.includes(catNorm) && !catNorm.includes(pCatNorm)) {
          return false;
        }
      }

      // Jewellery Type (Gold, Diamond, Silver)
      if (selectedType !== 'all') {
        if (p.jewelleryType.toLowerCase() !== selectedType.toLowerCase()) {
          return false;
        }
      }

      // Purity
      if (selectedPurity !== 'all') {
        if (p.purity.toLowerCase() !== selectedPurity.toLowerCase()) {
          return false;
        }
      }

      // Dynamic Price Range
      const breakdown = calculateProductPrice(p, rates);
      const price = breakdown.finalPrice;

      if (selectedPriceRange === 'under_25k' && price >= 25000) return false;
      if (selectedPriceRange === '25k_50k' && (price < 25000 || price > 50000)) return false;
      if (selectedPriceRange === '50k_100k' && (price < 50000 || price > 100000)) return false;
      if (selectedPriceRange === '100k_200k' && (price < 100000 || price > 200000)) return false;
      if (selectedPriceRange === 'above_200k' && price < 200000) return false;

      // Weight Range
      const weight = p.grossWeight;
      if (selectedWeightRange === 'under_2g' && weight >= 2) return false;
      if (selectedWeightRange === '2g_5g' && (weight < 2 || weight > 5)) return false;
      if (selectedWeightRange === '5g_10g' && (weight < 5 || weight > 10)) return false;
      if (selectedWeightRange === '10g_20g' && (weight < 10 || weight > 20)) return false;
      if (selectedWeightRange === 'above_20g' && weight < 20) return false;

      return true;
    }).sort((a, b) => {
      const priceA = calculateProductPrice(a, rates).finalPrice;
      const priceB = calculateProductPrice(b, rates).finalPrice;

      if (selectedSort === 'price_asc') return priceA - priceB;
      if (selectedSort === 'price_desc') return priceB - priceA;
      if (selectedSort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (selectedSort === 'bestseller') return (b.bestSeller ? 1 : 0) - (a.bestSeller ? 1 : 0);
      if (selectedSort === 'popular') return (b.trending ? 1 : 0) - (a.trending ? 1 : 0);
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [
    products,
    selectedCategory,
    selectedType,
    selectedPurity,
    selectedPriceRange,
    selectedWeightRange,
    selectedSort,
    rates,
  ]);

  const activeFiltersCount = [
    selectedCategory !== 'all',
    selectedType !== 'all',
    selectedPurity !== 'all',
    selectedPriceRange !== 'all',
    selectedWeightRange !== 'all',
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
      {/* Page Title & Breadcrumbs */}
      <div className="mb-8">
        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#1A1818] tracking-tight">
          {pageTitle}
        </h1>
        <p className="text-xs sm:text-sm text-[#78716C] mt-1.5">{pageSubtitle}</p>
      </div>

      {/* Top Filter Bar & Sorting */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-[#E8E2D8]">
        {/* Results counter & Mobile Filter Trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#E8E2D8] text-xs font-semibold text-[#581825] shadow-2xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
          </button>

          <span className="text-xs text-[#78716C]">
            Showing <strong className="text-[#1A1818] font-bold">{filteredProducts.length}</strong> creations
          </span>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#78716C] hidden sm:inline">Sort By:</span>
          <select
            value={selectedSort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="bg-white border border-[#E8E2D8] text-[#1A1818] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#C5A880] shadow-2xs cursor-pointer"
          >
            <option value="featured">Featured Curations</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Newest Arrivals</option>
            <option value="bestseller">Best Selling</option>
            <option value="popular">Most Trending</option>
          </select>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6 text-xs">
          <span className="text-[#78716C]">Active filters:</span>
          {selectedCategory !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-[#E8E2D8] text-[#581825] font-medium">
              Category: {selectedCategory}
              <button onClick={() => handleCategoryChange('all')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {selectedType !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-[#E8E2D8] text-[#581825] font-medium">
              Type: {selectedType}
              <button onClick={() => handleTypeChange('all')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {selectedPurity !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-[#E8E2D8] text-[#581825] font-medium">
              Purity: {selectedPurity}
              <button onClick={() => handlePurityChange('all')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {selectedPriceRange !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-[#E8E2D8] text-[#581825] font-medium">
              Price Filter
              <button onClick={() => handlePriceChange('all')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {selectedWeightRange !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-[#E8E2D8] text-[#581825] font-medium">
              Weight Filter
              <button onClick={() => handleWeightChange('all')}><X className="w-3 h-3" /></button>
            </span>
          )}
          <button
            onClick={handleClearAll}
            className="text-xs text-[#581825] font-bold hover:underline flex items-center gap-1 ml-2"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear All</span>
          </button>
        </div>
      )}

      {/* Main Grid Layout (Sidebar Filters + Products Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-2xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE4]">
              <span className="font-serif text-sm font-bold text-[#1A1818] uppercase tracking-wider">
                Refine Selection
              </span>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-[11px] text-[#581825] hover:underline font-semibold"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Jewellery Type (Gold / Diamond / Silver) */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#78716C] mb-2.5">
                Precious Metal
              </h4>
              <div className="space-y-1.5 text-xs">
                {['all', 'Gold', 'Diamond', 'Silver'].map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer py-1">
                    <input
                      type="radio"
                      name="metalType"
                      checked={selectedType === type}
                      onChange={() => handleTypeChange(type)}
                      className="accent-[#581825]"
                    />
                    <span className={selectedType === type ? 'font-bold text-[#581825]' : 'text-[#44403C]'}>
                      {type === 'all' ? 'All Metals' : type}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Purity */}
            <div className="pt-4 border-t border-[#F0ECE4]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#78716C] mb-2.5">
                Gold Purity
              </h4>
              <div className="space-y-1.5 text-xs">
                {['all', '24K', '22K', '18K', '925 Silver'].map((pur) => (
                  <label key={pur} className="flex items-center gap-2 cursor-pointer py-1">
                    <input
                      type="radio"
                      name="purity"
                      checked={selectedPurity === pur}
                      onChange={() => handlePurityChange(pur)}
                      className="accent-[#581825]"
                    />
                    <span className={selectedPurity === pur ? 'font-bold text-[#581825]' : 'text-[#44403C]'}>
                      {pur === 'all' ? 'All Purities' : pur}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Ranges */}
            <div className="pt-4 border-t border-[#F0ECE4]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#78716C] mb-2.5">
                Price (INR)
              </h4>
              <div className="space-y-1.5 text-xs">
                {[
                  { id: 'all', label: 'All Prices' },
                  { id: 'under_25k', label: 'Under ₹25,000' },
                  { id: '25k_50k', label: '₹25,000 – ₹50,000' },
                  { id: '50k_100k', label: '₹50,000 – ₹1,00,000' },
                  { id: '100k_200k', label: '₹1,00,000 – ₹2,00,000' },
                  { id: 'above_200k', label: '₹2,00,000 & Above' },
                ].map((range) => (
                  <label key={range.id} className="flex items-center gap-2 cursor-pointer py-1">
                    <input
                      type="radio"
                      name="priceRange"
                      checked={selectedPriceRange === range.id}
                      onChange={() => handlePriceChange(range.id)}
                      className="accent-[#581825]"
                    />
                    <span className={selectedPriceRange === range.id ? 'font-bold text-[#581825]' : 'text-[#44403C]'}>
                      {range.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Weight Ranges */}
            <div className="pt-4 border-t border-[#F0ECE4]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#78716C] mb-2.5">
                Gross Weight
              </h4>
              <div className="space-y-1.5 text-xs">
                {[
                  { id: 'all', label: 'All Weights' },
                  { id: 'under_2g', label: 'Under 2 Grams' },
                  { id: '2g_5g', label: '2 – 5 Grams' },
                  { id: '5g_10g', label: '5 – 10 Grams' },
                  { id: '10g_20g', label: '10 – 20 Grams' },
                  { id: 'above_20g', label: '20+ Grams (Haars/Kadas)' },
                ].map((range) => (
                  <label key={range.id} className="flex items-center gap-2 cursor-pointer py-1">
                    <input
                      type="radio"
                      name="weightRange"
                      checked={selectedWeightRange === range.id}
                      onChange={() => handleWeightChange(range.id)}
                      className="accent-[#581825]"
                    />
                    <span className={selectedWeightRange === range.id ? 'font-bold text-[#581825]' : 'text-[#44403C]'}>
                      {range.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Product Cards Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[4/5] rounded-xl luxury-shimmer border border-[#E8E2D8]"></div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E8E2D8] p-12 text-center flex flex-col items-center">
              <Sparkles className="w-10 h-10 text-[#C5A880] mb-3" />
              <h3 className="font-serif text-lg font-bold text-[#1A1818]">No ornaments match this filter</h3>
              <p className="text-xs text-[#78716C] mt-1 max-w-sm">
                Try loosening your price or metal filters to explore our full 22K hallmarked catalogue.
              </p>
              <button
                onClick={handleClearAll}
                className="mt-5 px-5 py-2.5 rounded-full bg-[#581825] text-white text-xs font-semibold hover:bg-[#380B12] transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Slide-out Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsMobileFilterOpen(false)}
          ></div>
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 p-5 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D8]">
              <h3 className="font-serif text-base font-bold text-[#1A1818]">Refine Catalogue</h3>
              <button onClick={() => setIsMobileFilterOpen(false)}>
                <X className="w-5 h-5 text-[#581825]" />
              </button>
            </div>

            <div className="py-4 space-y-6 flex-1 text-xs">
              {/* Category */}
              <div>
                <h4 className="font-bold text-[#78716C] uppercase mb-2">Category</h4>
                <div className="space-y-1.5">
                  {['all', 'Necklaces', 'Bangles', 'Earrings', 'Rings', 'Mangalsutra', 'Silver'].map((c) => (
                    <button
                      key={c}
                      onClick={() => handleCategoryChange(c)}
                      className={`block w-full text-left px-2 py-1.5 rounded ${
                        selectedCategory === c ? 'bg-[#581825] text-white font-bold' : 'text-[#2B2625]'
                      }`}
                    >
                      {c === 'all' ? 'All Categories' : c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="pt-4 border-t border-[#F0ECE4]">
                <h4 className="font-bold text-[#78716C] uppercase mb-2">Price Range</h4>
                <div className="space-y-1.5">
                  {[
                    { id: 'all', label: 'All Prices' },
                    { id: 'under_25k', label: 'Under ₹25,000' },
                    { id: '25k_50k', label: '₹25,000 – ₹50,000' },
                    { id: '50k_100k', label: '₹50,000 – ₹1,00,000' },
                    { id: '100k_200k', label: '₹1,00,000 – ₹2,00,000' },
                    { id: 'above_200k', label: '₹2,00,000+' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      onClick={() => handlePriceChange(r.id)}
                      className={`block w-full text-left px-2 py-1.5 rounded ${
                        selectedPriceRange === r.id ? 'bg-[#581825] text-white font-bold' : 'text-[#2B2625]'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8E2D8] flex gap-2">
              <button
                onClick={handleClearAll}
                className="flex-1 py-2.5 rounded-xl border border-[#E8E2D8] text-xs font-semibold text-[#581825]"
              >
                Reset
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#581825] text-white text-xs font-bold"
              >
                View ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
