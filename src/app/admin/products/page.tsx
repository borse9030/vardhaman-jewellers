'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Gem,
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  Upload,
  FileSpreadsheet,
  X,
  Check,
  ExternalLink,
  ShieldCheck,
  Image as ImageIcon,
  Scale,
  Sparkles,
  Layers,
  Tag,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import {
  getAllProducts,
  createOrUpdateProduct,
  deleteProduct,
} from '@/lib/db/productService';
import { useGoldRates } from '@/context/GoldRateContext';
import { calculateProductPrice, formatINR, isSilverProduct } from '@/services/pricingEngine';
import {
  Product,
  JewelleryType,
  GoldPurity,
  MetalType,
  GoldColor,
  MakingChargeType,
  StockStatus,
  ProductSpecification,
} from '@/types';

export default function AdminProductsPage() {
  const { rates } = useGoldRates();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPurity, setFilterPurity] = useState('all');

  // Modal State for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'basic' | 'gold' | 'pricing' | 'images' | 'badges'>('basic');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [urlInput, setUrlInput] = useState('');

  // Form Fields - Basic Info
  const [formName, setFormName] = useState('');
  const [formSKU, setFormSKU] = useState('');
  const [formCategory, setFormCategory] = useState('Necklaces');
  const [formSubcategory, setFormSubcategory] = useState('Temple Jewellery');
  const [formCollection, setFormCollection] = useState('Khandesh Royal Heritage');
  const [formDescription, setFormDescription] = useState('');

  // Form Fields - Gold & Metal Specifics
  const [formJewelleryType, setFormJewelleryType] = useState<JewelleryType>('Gold');
  const [formMetalType, setFormMetalType] = useState<MetalType>('Yellow Gold');
  const [formPurity, setFormPurity] = useState<GoldPurity>('22K');
  const [formGoldColor, setFormGoldColor] = useState<GoldColor>('Yellow');
  const [formGrossWeight, setFormGrossWeight] = useState<number>(25.0);
  const [formNetWeight, setFormNetWeight] = useState<number>(24.0);
  const [formHallmarkCertified, setFormHallmarkCertified] = useState<boolean>(true);
  const [formGender, setFormGender] = useState<'Women' | 'Men' | 'Unisex' | 'Kids'>('Women');
  const [formOccasions, setFormOccasions] = useState<string[]>(['Wedding', 'Traditional Festive']);

  // Form Fields - Stones & Diamonds
  const [formStoneWeight, setFormStoneWeight] = useState<number>(0);
  const [formStoneType, setFormStoneType] = useState('None');
  const [formStonePrice, setFormStonePrice] = useState<number>(0);

  // Form Fields - Pricing
  const [formIsDynamic, setFormIsDynamic] = useState(true);
  const [formMakingType, setFormMakingType] = useState<MakingChargeType>('percentage');
  const [formMakingCharge, setFormMakingCharge] = useState<number>(12);
  const [formWastage, setFormWastage] = useState<number>(2.0);
  const [formCompareAtPrice, setFormCompareAtPrice] = useState<number>(0);
  const [formDiscount, setFormDiscount] = useState<number>(0);
  const [formFixedPrice, setFormFixedPrice] = useState<number>(150000);

  // Form Fields - Images
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formThumbnail, setFormThumbnail] = useState<string>('');

  // Form Fields - Inventory & Marketing Badges
  const [formStockStatus, setFormStockStatus] = useState<StockStatus>('in_stock');
  const [formStockQuantity, setFormStockQuantity] = useState<number>(5);
  const [formFeatured, setFormFeatured] = useState<boolean>(true);
  const [formTrending, setFormTrending] = useState<boolean>(true);
  const [formNewArrival, setFormNewArrival] = useState<boolean>(true);
  const [formBestSeller, setFormBestSeller] = useState<boolean>(false);

  // Dynamic Specifications
  const [formSpecs, setFormSpecs] = useState<ProductSpecification[]>([
    { key: 'Gold Purity', value: '22 Karat (916 Hallmarked)' },
    { key: 'Certificate', value: 'Government BIS Hallmark' },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = () => {
    setLoading(true);
    getAllProducts().then((list) => {
      setProducts(list);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('action') === 'new') {
        setTimeout(() => openCreateModal(), 100);
      }
    }

    // Listen for live updates
    const handleUpdate = () => loadData();
    window.addEventListener('vj_products_updated', handleUpdate);
    return () => window.removeEventListener('vj_products_updated', handleUpdate);
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setActiveModalTab('basic');
    setFormName('');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setFormSKU(`VJ-GLD-${randomSuffix}`);
    setFormCategory('Necklaces');
    setFormSubcategory('Temple Jewellery');
    setFormCollection('Khandesh Royal Heritage');
    setFormDescription('Exquisitely handcrafted in certified 22K hallmarked gold with traditional motifs and heirloom finish.');
    setFormJewelleryType('Gold');
    setFormMetalType('Yellow Gold');
    setFormPurity('22K');
    setFormGoldColor('Yellow');
    setFormGrossWeight(25.0);
    setFormNetWeight(24.0);
    setFormHallmarkCertified(true);
    setFormGender('Women');
    setFormOccasions(['Wedding', 'Festive']);
    setFormStoneWeight(0);
    setFormStoneType('None');
    setFormStonePrice(0);
    setFormIsDynamic(true);
    setFormMakingType('percentage');
    setFormMakingCharge(12);
    setFormWastage(2.0);
    setFormCompareAtPrice(0);
    setFormDiscount(0);
    setFormFixedPrice(165000);
    setFormImages([
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&q=80',
    ]);
    setFormThumbnail('https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80');
    setFormStockStatus('in_stock');
    setFormStockQuantity(5);
    setFormFeatured(true);
    setFormTrending(true);
    setFormNewArrival(true);
    setFormBestSeller(false);
    setFormSpecs([
      { key: 'Gold Purity', value: '22 Karat (916 BIS)' },
      { key: 'Gross Weight', value: '25.00 g' },
      { key: 'Certificate', value: 'Government BIS Hallmark' },
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setActiveModalTab('basic');
    setFormName(p.name);
    setFormSKU(p.SKU);
    setFormCategory(p.category);
    setFormSubcategory(p.subcategory || 'Temple Jewellery');
    setFormCollection(p.collection || 'Khandesh Royal Heritage');
    setFormDescription(p.description || '');
    setFormJewelleryType(p.jewelleryType);
    setFormMetalType(p.metalType || 'Yellow Gold');
    setFormPurity(p.purity);
    setFormGoldColor(p.goldColor || 'Yellow');
    setFormGrossWeight(p.grossWeight);
    setFormNetWeight(p.netGoldWeight);
    setFormHallmarkCertified(p.hallmarkCertified ?? true);
    setFormGender(p.gender || 'Women');
    setFormOccasions(p.occasion || ['Wedding', 'Festive']);
    setFormStoneWeight(p.stoneWeight || 0);
    setFormStoneType(p.stoneType || 'None');
    setFormStonePrice(p.stonePrice || 0);
    setFormIsDynamic(p.isDynamicPricing);
    setFormMakingType(p.makingChargeType || 'percentage');
    setFormMakingCharge(p.makingCharge || 12);
    setFormWastage(p.wastagePercentage || 2.0);
    setFormCompareAtPrice(p.compareAtPrice || 0);
    setFormDiscount(p.discount || 0);
    setFormFixedPrice(p.finalPrice);
    setFormImages(p.images && p.images.length > 0 ? p.images : [p.thumbnail]);
    setFormThumbnail(p.thumbnail || (p.images && p.images[0]) || '');
    setFormStockStatus(p.stockStatus || 'in_stock');
    setFormStockQuantity(p.stockQuantity ?? 5);
    setFormFeatured(p.featured ?? false);
    setFormTrending(p.trending ?? false);
    setFormNewArrival(p.newArrival ?? false);
    setFormBestSeller(p.bestSeller ?? false);
    setFormSpecs(p.specifications && p.specifications.length > 0 ? p.specifications : [
      { key: 'Gold Purity', value: `${p.purity} (916 BIS)` },
      { key: 'Net Gold Weight', value: `${p.netGoldWeight}g` },
    ]);
    setIsModalOpen(true);
  };

  // Image file upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Upload failed on server');
      }

      const data = await res.json();
      const newUrls: string[] = data.urls || (data.url ? [data.url] : []);

      if (newUrls.length > 0) {
        setFormImages((prev) => {
          const combined = [...prev, ...newUrls];
          if (!formThumbnail && combined.length > 0) {
            setFormThumbnail(combined[0]);
          }
          return combined;
        });
      }
    } catch (err: any) {
      console.warn('Server upload error, falling back to base64 reader:', err);
      // Fallback: Read files as base64 data URLs so owner can still upload offline!
      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
          const result = uploadEvent.target?.result as string;
          if (result) {
            setFormImages((prev) => {
              const combined = [...prev, result];
              if (!formThumbnail) setFormThumbnail(result);
              return combined;
            });
          }
        };
        reader.readAsDataURL(files[i]);
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddUrlImage = () => {
    if (!urlInput.trim()) return;
    setFormImages((prev) => {
      const updated = [...prev, urlInput.trim()];
      if (!formThumbnail) setFormThumbnail(urlInput.trim());
      return updated;
    });
    setUrlInput('');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setFormImages((prev) => {
      const updated = prev.filter((_, idx) => idx !== indexToRemove);
      if (formThumbnail === prev[indexToRemove]) {
        setFormThumbnail(updated[0] || '');
      }
      return updated;
    });
  };

  const handleSetPrimaryThumbnail = (img: string) => {
    setFormThumbnail(img);
  };

  // Live Price Calculation Preview
  const tempProductForPreview: Product = {
    id: editingProduct?.id || 'preview',
    SKU: formSKU || 'VJ-PREV',
    name: formName || 'Preview Ornament',
    slug: 'preview',
    shortDescription: '',
    description: formDescription,
    category: formCategory,
    subcategory: formSubcategory,
    collection: formCollection,
    jewelleryType: formJewelleryType,
    metalType: formMetalType,
    purity: formPurity,
    goldColor: formGoldColor,
    grossWeight: Number(formGrossWeight) || 0,
    netGoldWeight: Number(formNetWeight) || 0,
    stoneWeight: Number(formStoneWeight) || 0,
    stoneType: formStoneType,
    stonePrice: Number(formStonePrice) || 0,
    makingChargeType: formMakingType,
    makingCharge: Number(formMakingCharge) || 0,
    wastagePercentage: Number(formWastage) || 0,
    goldRateReference: formPurity === '18K' ? '18K' : formPurity === '24K' ? '24K' : formPurity === '925 Silver' ? 'Silver' : '22K',
    isDynamicPricing: formIsDynamic,
    basePrice: Number(formFixedPrice) || 0,
    discount: Number(formDiscount) || 0,
    GST: 3,
    finalPrice: Number(formFixedPrice) || 0,
    compareAtPrice: Number(formCompareAtPrice) || 0,
    stockStatus: formStockStatus,
    stockQuantity: Number(formStockQuantity) || 0,
    featured: formFeatured,
    trending: formTrending,
    newArrival: formNewArrival,
    bestSeller: formBestSeller,
    tags: [formCategory, formPurity],
    specifications: formSpecs,
    images: formImages.length > 0 ? formImages : ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80'],
    thumbnail: formThumbnail || formImages[0] || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const previewPriceBreakdown = calculateProductPrice(tempProductForPreview, rates);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSKU.trim()) {
      alert('Please provide both Ornament Name and SKU');
      return;
    }

    const slug = formName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const resolvedImages =
      formImages.length > 0
        ? formImages
        : ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80'];
    const resolvedThumbnail = formThumbnail || resolvedImages[0];

    const finalCalculated = formIsDynamic ? previewPriceBreakdown.finalPrice : Number(formFixedPrice);

    const productPayload: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      SKU: formSKU.trim(),
      name: formName.trim(),
      slug,
      shortDescription: formDescription.slice(0, 140),
      description: formDescription,
      category: formCategory,
      subcategory: formSubcategory,
      collection: formCollection,
      jewelleryType: formJewelleryType,
      metalType: formMetalType,
      purity: formPurity,
      goldColor: formGoldColor,
      grossWeight: Number(formGrossWeight),
      netGoldWeight: Number(formNetWeight),
      stoneWeight: Number(formStoneWeight),
      stoneType: formStoneType,
      stonePrice: Number(formStonePrice),
      makingChargeType: formMakingType,
      makingCharge: Number(formMakingCharge),
      wastagePercentage: Number(formWastage),
      goldRateReference:
        formPurity === '18K'
          ? '18K'
          : formPurity === '24K'
          ? '24K'
          : formPurity === '925 Silver'
          ? 'Silver'
          : '22K',
      isDynamicPricing: formIsDynamic,
      basePrice: formIsDynamic ? 0 : Number(formFixedPrice),
      discount: Number(formDiscount),
      GST: 3,
      finalPrice: finalCalculated,
      compareAtPrice: Number(formCompareAtPrice) > 0 ? Number(formCompareAtPrice) : undefined,
      stockStatus: formStockStatus,
      stockQuantity: Number(formStockQuantity),
      featured: formFeatured,
      trending: formTrending,
      newArrival: formNewArrival,
      bestSeller: formBestSeller,
      tags: [formCategory, formPurity, formMetalType, ...formOccasions],
      specifications: formSpecs,
      images: resolvedImages,
      thumbnail: resolvedThumbnail,
      gender: formGender,
      occasion: formOccasions,
      hallmarkCertified: formHallmarkCertified,
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await createOrUpdateProduct(productPayload);
    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to permanently remove this ornament from the catalogue?')) {
      await deleteProduct(id);
      loadData();
    }
  };

  const handleDuplicate = async (p: Product) => {
    const duplicated: Product = {
      ...p,
      id: `prod-${Date.now()}`,
      SKU: `${p.SKU}-COPY`,
      name: `${p.name} (Copy)`,
      slug: `${p.slug}-copy-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await createOrUpdateProduct(duplicated);
    loadData();
  };

  const handleToggleBadge = async (p: Product, field: 'bestSeller' | 'trending' | 'newArrival') => {
    const updated = { ...p, [field]: !p[field] };
    await createOrUpdateProduct(updated);
    loadData();
  };

  const filteredProducts = products.filter((p) => {
    if (filterCategory !== 'all' && p.category.toLowerCase() !== filterCategory.toLowerCase()) {
      return false;
    }
    if (filterPurity !== 'all' && p.purity !== filterPurity) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        p.name.toLowerCase().includes(q) ||
        p.SKU.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.collection && p.collection.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Product Catalogue
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#581825] text-[#C5A880] text-xs font-bold border border-[#C5A880]/30">
              {products.length} Ornaments
            </span>
          </div>
          <p className="text-xs text-[#A8A29E] mt-1">
            Real-time synchronization between Admin &amp; Storefront. Upload photos, adjust gold weights, and live pricing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Link
            href="/admin/products/csv-import"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#2B2625] hover:bg-[#380B12] text-[#DFCDAE] text-xs font-bold border border-white/10 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#C5A880]" />
            <span>CSV Import</span>
          </Link>

          <button
            onClick={openCreateModal}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#581825] to-[#7E2638] hover:from-[#7E2638] hover:to-[#581825] text-white text-xs font-bold shadow-lg shadow-[#581825]/30 border border-[#C5A880]/30 transition-all hover:scale-102"
          >
            <Plus className="w-4 h-4 text-[#C5A880]" />
            <span>Add New Ornament</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-[#171515] p-3.5 sm:p-4 rounded-2xl border border-white/10">
        <div className="sm:col-span-6 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by SKU, Name, or Collection..."
            className="w-full bg-[#2B2625] text-xs text-white pl-9 pr-4 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#C5A880]"
          />
          <Search className="w-4 h-4 text-[#A8A29E] absolute left-3 top-3" />
        </div>

        <div className="sm:col-span-3">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full bg-[#2B2625] text-white text-xs p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#C5A880]"
          >
            <option value="all">All Categories</option>
            <option value="Necklaces">Necklaces & Haars</option>
            <option value="Bangles">Bangles & Patlya</option>
            <option value="Earrings">Earrings & Jhumkas</option>
            <option value="Rings">Rings & Solitaires</option>
            <option value="Mangalsutra">Mangalsutras</option>
            <option value="Chains">Chains</option>
            <option value="Pendants">Pendants</option>
            <option value="Bracelets">Bracelets</option>
            <option value="Nose Pins">Nose Pins</option>
            <option value="Silver">Silver Articles</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={filterPurity}
            onChange={(e) => setFilterPurity(e.target.value)}
            className="w-full bg-[#2B2625] text-white text-xs p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#C5A880]"
          >
            <option value="all">All Purity Benchmarks</option>
            <option value="22K">22K 916 BIS</option>
            <option value="24K">24K 999 Pure</option>
            <option value="18K">18K 750 Gold</option>
            <option value="14K">14K 585 Gold</option>
            <option value="925 Silver">925 Sterling Silver</option>
          </select>
        </div>
      </div>

      {/* Desktop Products Table */}
      <div className="hidden sm:block bg-[#171515] rounded-2xl border border-white/10 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#E8E2D8]">
            <thead>
              <tr className="border-b border-white/10 bg-[#242121] text-[#A8A29E] uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Ornament</th>
                <th className="py-3.5 px-3">SKU</th>
                <th className="py-3.5 px-3">Purity &amp; Metal</th>
                <th className="py-3.5 px-3">Weight (Net)</th>
                <th className="py-3.5 px-3">Live Final Price</th>
                <th className="py-3.5 px-3">Stock</th>
                <th className="py-3.5 px-3">Storefront Badges</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProducts.map((p) => {
                const breakdown = calculateProductPrice(p, rates);
                const thumb = p.thumbnail || p.images[0] || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=200&q=80';
                return (
                  <tr key={p.id} className="hover:bg-[#2B2625]/40 transition-colors">
                    {/* Ornament Title & Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#2B2625] shrink-0 border border-white/10">
                          <Image src={thumb} alt={p.name} fill className="object-cover" />
                          {p.images && p.images.length > 1 && (
                            <span className="absolute bottom-0 right-0 bg-black/70 text-white text-[8px] px-1 rounded-tl">
                              +{p.images.length}
                            </span>
                          )}
                        </div>
                        <div className="truncate max-w-[220px]">
                          <span className="font-bold text-white block truncate">{p.name}</span>
                          <span className="text-[10px] text-[#A8A29E]">
                            {p.category} • {p.subcategory}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="py-3 px-3 font-mono font-bold text-[#C5A880]">{p.SKU}</td>

                    {/* Purity & Metal */}
                    <td className="py-3 px-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="inline-block px-1.5 py-0.5 rounded bg-[#2B2625] font-semibold text-white border border-white/10 text-[10px] w-fit">
                          {p.purity}
                        </span>
                        <span className="text-[10px] text-[#A8A29E]">{p.metalType}</span>
                      </div>
                    </td>

                    {/* Weight */}
                    <td className="py-3 px-3">
                      <span className="font-semibold text-white">{p.netGoldWeight}g</span>
                      <span className="text-[10px] text-[#A8A29E] block">Gross: {p.grossWeight}g</span>
                    </td>

                    {/* Calculated Price */}
                    <td className="py-3 px-3">
                      <span className="font-bold text-emerald-400 block text-sm">
                        {formatINR(breakdown.finalPrice)}
                      </span>
                      {p.isDynamicPricing ? (
                        <span className="text-[9px] text-[#C5A880] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          Dynamic Live Bullion
                        </span>
                      ) : (
                        <span className="text-[9px] text-[#A8A29E]">Fixed Pricing</span>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          p.stockStatus === 'in_stock'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                            : p.stockStatus === 'low_stock'
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                            : 'bg-red-950 text-red-300 border border-red-500/30'
                        }`}
                      >
                        {p.stockQuantity ?? 5} in stock
                      </span>
                    </td>

                    {/* Badges toggles */}
                    <td className="py-3 px-3">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleToggleBadge(p, 'bestSeller')}
                          className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all ${
                            p.bestSeller
                              ? 'bg-[#581825] text-white border border-[#C5A880]/50 shadow-xs'
                              : 'bg-[#2B2625] text-[#78716C] hover:text-white'
                          }`}
                          title="Toggle Bestseller Badge"
                        >
                          Best
                        </button>
                        <button
                          onClick={() => handleToggleBadge(p, 'newArrival')}
                          className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all ${
                            p.newArrival
                              ? 'bg-[#C5A880] text-[#1A1818] font-black'
                              : 'bg-[#2B2625] text-[#78716C] hover:text-white'
                          }`}
                          title="Toggle New Arrival Badge"
                        >
                          New
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/product/${p.slug}`}
                          target="_blank"
                          className="p-2 rounded-xl bg-[#2B2625] text-[#A8A29E] hover:text-white hover:bg-[#380B12] transition-colors"
                          title="View on Storefront"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDuplicate(p)}
                          className="p-2 rounded-xl bg-[#2B2625] text-[#A8A29E] hover:text-[#C5A880] transition-colors"
                          title="Duplicate piece"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-2 rounded-xl bg-[#2B2625] text-[#A8A29E] hover:text-white hover:bg-[#581825] transition-colors"
                          title="Edit piece"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-2 rounded-xl bg-[#2B2625] text-[#A8A29E] hover:text-red-400 hover:bg-red-950/40 transition-colors"
                          title="Delete piece"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Products Cards Grid (sm:hidden) */}
      <div className="sm:hidden flex flex-col gap-3">
        {filteredProducts.map((p) => {
          const breakdown = calculateProductPrice(p, rates);
          const thumb = p.thumbnail || p.images[0] || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=200&q=80';
          return (
            <div
              key={p.id}
              className="bg-[#171515] p-3.5 rounded-2xl border border-white/10 shadow-xs flex flex-col gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#2B2625] shrink-0 border border-white/10">
                  <Image src={thumb} alt={p.name} fill className="object-cover" />
                  {p.images && p.images.length > 1 && (
                    <span className="absolute bottom-0 right-0 bg-black/80 text-white text-[8px] px-1 rounded-tl font-bold">
                      +{p.images.length}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-[11px] font-bold text-[#C5A880]">{p.SKU}</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#2B2625] text-[9px] font-bold text-white border border-white/10">
                      {p.purity}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-white text-xs truncate mt-0.5">{p.name}</h3>
                  <div className="flex items-center justify-between text-[10px] text-[#A8A29E] mt-1">
                    <span>{p.category}</span>
                    <span className="font-semibold text-white">{p.netGoldWeight}g net</span>
                  </div>
                </div>
              </div>

              {/* Price & Badges row */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div>
                  <span className="font-bold text-emerald-400 text-sm">{formatINR(breakdown.finalPrice)}</span>
                  <span className="text-[9px] text-[#A8A29E] block">
                    {p.isDynamicPricing ? 'Dynamic Bullion' : 'Fixed Price'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleBadge(p, 'bestSeller')}
                    className={`px-2 py-1 rounded text-[9px] font-bold ${
                      p.bestSeller ? 'bg-[#581825] text-white border border-[#C5A880]/50' : 'bg-[#2B2625] text-[#78716C]'
                    }`}
                  >
                    Best
                  </button>
                  <button
                    onClick={() => handleToggleBadge(p, 'newArrival')}
                    className={`px-2 py-1 rounded text-[9px] font-bold ${
                      p.newArrival ? 'bg-[#C5A880] text-[#1A1818]' : 'bg-[#2B2625] text-[#78716C]'
                    }`}
                  >
                    New
                  </button>
                </div>
              </div>

              {/* Card Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                <Link
                  href={`/product/${p.slug}`}
                  target="_blank"
                  className="flex-1 py-1.5 rounded-lg bg-[#2B2625] text-center text-[10px] font-bold text-[#A8A29E] hover:text-white"
                >
                  View
                </Link>
                <button
                  onClick={() => openEditModal(p)}
                  className="flex-1 py-1.5 rounded-lg bg-[#581825] text-center text-[10px] font-bold text-white"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-red-950/40 text-[10px] font-bold text-red-400"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* FULL RESPONSIVE CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setIsModalOpen(false)}></div>

          <div className="relative w-full max-w-4xl bg-[#1A1818] border border-white/10 rounded-3xl shadow-2xl z-10 max-h-[92vh] flex flex-col overflow-hidden text-xs text-[#E8E2D8]">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#171515]">
              <div>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                  {editingProduct ? `Edit ${editingProduct.name}` : 'Add New Gold & Jewellery Piece'}
                </h2>
                <p className="text-[11px] text-[#A8A29E] mt-0.5">
                  Complete jewellery specifications, live pricing engine parameters, and photo upload.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#2B2625] hover:bg-[#380B12] text-[#A8A29E] hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs Bar */}
            <div className="flex border-b border-white/10 bg-[#242121] overflow-x-auto no-scrollbar shrink-0 px-4 sm:px-6">
              {[
                { id: 'basic', label: '1. Basic Info' },
                { id: 'gold', label: '2. Gold & Metal' },
                { id: 'pricing', label: '3. Pricing & Making' },
                { id: 'images', label: '4. Upload Photos' },
                { id: 'badges', label: '5. Stock & Badges' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveModalTab(tab.id as any)}
                  className={`py-3 px-3 sm:px-4 font-bold whitespace-nowrap border-b-2 text-xs transition-all ${
                    activeModalTab === tab.id
                      ? 'border-[#C5A880] text-[#C5A880] bg-[#1A1818]'
                      : 'border-transparent text-[#A8A29E] hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* TAB 1: BASIC INFO */}
              {activeModalTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#D6D3D1] font-bold mb-1.5">
                        Ornament Title <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="e.g. Aadrika Antique Temple Nakshi Gold Haar"
                        className="w-full bg-[#2B2625] p-3 rounded-xl border border-white/10 text-white focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[#D6D3D1] font-bold">
                          SKU Code <span className="text-red-400">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setFormSKU(`VJ-${formCategory.slice(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`)}
                          className="text-[10px] text-[#C5A880] hover:underline"
                        >
                          Generate Code
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        value={formSKU}
                        onChange={(e) => setFormSKU(e.target.value.toUpperCase())}
                        placeholder="VJ-NECK-001"
                        className="w-full bg-[#2B2625] p-3 rounded-xl border border-white/10 text-white focus:outline-none focus:border-[#C5A880] font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[#D6D3D1] font-bold mb-1.5">Category</label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full bg-[#2B2625] p-3 rounded-xl border border-white/10 text-white focus:outline-none focus:border-[#C5A880]"
                      >
                        <option value="Necklaces">Necklaces &amp; Haars</option>
                        <option value="Bangles">Bangles &amp; Patlya</option>
                        <option value="Earrings">Earrings &amp; Jhumkas</option>
                        <option value="Rings">Rings &amp; Solitaires</option>
                        <option value="Mangalsutra">Mangalsutras</option>
                        <option value="Chains">Chains</option>
                        <option value="Pendants">Pendants</option>
                        <option value="Bracelets">Bracelets</option>
                        <option value="Nose Pins">Nose Pins</option>
                        <option value="Silver">Silver Articles</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[#D6D3D1] font-bold mb-1.5">Subcategory</label>
                      <input
                        type="text"
                        value={formSubcategory}
                        onChange={(e) => setFormSubcategory(e.target.value)}
                        placeholder="e.g. Temple Nakshi / Choker"
                        className="w-full bg-[#2B2625] p-3 rounded-xl border border-white/10 text-white focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>

                    <div>
                      <label className="block text-[#D6D3D1] font-bold mb-1.5">Collection</label>
                      <select
                        value={formCollection}
                        onChange={(e) => setFormCollection(e.target.value)}
                        className="w-full bg-[#2B2625] p-3 rounded-xl border border-white/10 text-white focus:outline-none focus:border-[#C5A880]"
                      >
                        <option value="Khandesh Royal Heritage">Khandesh Royal Heritage</option>
                        <option value="Rajputana & Khandesh Wedding">Rajputana &amp; Khandesh Wedding</option>
                        <option value="Solitaire Radiance">Solitaire Radiance</option>
                        <option value="Pavitra Silver Collection">Pavitra Silver Collection</option>
                        <option value="Daily Luxury Collection">Daily Luxury Collection</option>
                        <option value="Vardhaman Men’s Line">Vardhaman Men’s Line</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#D6D3D1] font-bold mb-1.5">Comprehensive Description</label>
                    <textarea
                      rows={3}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Describe the craftsmanship, motifs, closure, hallmarking, and heritage significance..."
                      className="w-full bg-[#2B2625] p-3 rounded-xl border border-white/10 text-white focus:outline-none focus:border-[#C5A880] leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: GOLD & METAL SPECIFICATIONS */}
              {activeModalTab === 'gold' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[#D6D3D1] font-bold mb-1.5">Jewellery Type</label>
                      <select
                        value={formJewelleryType}
                        onChange={(e) => setFormJewelleryType(e.target.value as any)}
                        className="w-full bg-[#2B2625] p-2.5 rounded-xl border border-white/10 text-white focus:outline-none"
                      >
                        <option value="Gold">Gold</option>
                        <option value="Diamond">Diamond</option>
                        <option value="Silver">Silver</option>
                        <option value="Platinum">Platinum</option>
                        <option value="Precious Gemstone">Precious Gemstone</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[#D6D3D1] font-bold mb-1.5">Metal Type</label>
                      <select
                        value={formMetalType}
                        onChange={(e) => setFormMetalType(e.target.value as any)}
                        className="w-full bg-[#2B2625] p-2.5 rounded-xl border border-white/10 text-white focus:outline-none"
                      >
                        <option value="Yellow Gold">Yellow Gold</option>
                        <option value="Rose Gold">Rose Gold</option>
                        <option value="White Gold">White Gold</option>
                        <option value="Two-Tone Gold">Two-Tone Gold</option>
                        <option value="Sterling Silver">Sterling Silver</option>
                        <option value="Platinum">Platinum</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[#D6D3D1] font-bold mb-1.5">Gold Purity</label>
                      <select
                        value={formPurity}
                        onChange={(e) => setFormPurity(e.target.value as any)}
                        className="w-full bg-[#2B2625] p-2.5 rounded-xl border border-white/10 text-white focus:outline-none font-bold text-[#C5A880]"
                      >
                        <option value="22K">22K (916 BIS Hallmark)</option>
                        <option value="24K">24K (999 Pure Bullion)</option>
                        <option value="18K">18K (750 Diamonds)</option>
                        <option value="14K">14K (585 Daily)</option>
                        <option value="925 Silver">925 Sterling Silver</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[#D6D3D1] font-bold mb-1.5">Gold Color</label>
                      <select
                        value={formGoldColor}
                        onChange={(e) => setFormGoldColor(e.target.value as any)}
                        className="w-full bg-[#2B2625] p-2.5 rounded-xl border border-white/10 text-white focus:outline-none"
                      >
                        <option value="Yellow">Yellow</option>
                        <option value="Rose">Rose</option>
                        <option value="White">White</option>
                        <option value="Two-Tone">Two-Tone</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#242121] border border-white/10">
                    <div>
                      <label className="block text-[#D6D3D1] font-bold mb-1">
                        Gross Weight (g) <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formGrossWeight}
                        onChange={(e) => setFormGrossWeight(parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#1A1818] p-2.5 rounded-xl border border-white/10 text-white font-bold"
                      />
                      <span className="text-[10px] text-[#A8A29E] mt-0.5 block">Total physical weight</span>
                    </div>

                    <div>
                      <label className="block text-[#D6D3D1] font-bold mb-1">
                        Net Gold Weight (g) <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formNetWeight}
                        onChange={(e) => setFormNetWeight(parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#1A1818] p-2.5 rounded-xl border border-white/10 text-white font-bold text-amber-300"
                      />
                      <span className="text-[10px] text-[#A8A29E] mt-0.5 block">Gold rate is applied on this</span>
                    </div>

                    <div className="col-span-2 sm:col-span-1 flex flex-col justify-center">
                      <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl bg-[#1A1818] border border-white/10">
                        <input
                          type="checkbox"
                          checked={formHallmarkCertified}
                          onChange={(e) => setFormHallmarkCertified(e.target.checked)}
                          className="w-4 h-4 accent-[#581825]"
                        />
                        <span className="text-white font-bold text-[11px] flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" />
                          BIS 916 Hallmark Certified
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Gemstone / Polki / Diamond details */}
                  <div className="p-4 rounded-2xl bg-[#242121] border border-white/10 space-y-3">
                    <span className="text-xs font-bold text-[#C5A880] block">Stones, Polki &amp; Diamond Attributes</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[#A8A29E] mb-1">Stone / Diamond Type</label>
                        <input
                          type="text"
                          value={formStoneType}
                          onChange={(e) => setFormStoneType(e.target.value)}
                          placeholder="e.g. SI-IJ Natural Diamonds / Kundan"
                          className="w-full bg-[#1A1818] p-2.5 rounded-xl border border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[#A8A29E] mb-1">Stone Weight (ct / g)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formStoneWeight}
                          onChange={(e) => setFormStoneWeight(parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#1A1818] p-2.5 rounded-xl border border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[#A8A29E] mb-1">Stone Value / Price (₹)</label>
                        <input
                          type="number"
                          value={formStonePrice}
                          onChange={(e) => setFormStonePrice(parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#1A1818] p-2.5 rounded-xl border border-white/10 text-white font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PRICING & MAKING CHARGES */}
              {activeModalTab === 'pricing' && (
                <div className="space-y-4">
                  {/* Pricing Mode Toggle */}
                  <div className="p-4 rounded-2xl bg-[#242121] border border-white/10 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white text-sm block">Centralized Pricing Engine</span>
                      <p className="text-[11px] text-[#A8A29E]">
                        Dynamic pricing calculates live based on current daily bullion rate.
                      </p>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-[#1A1818] border border-[#C5A880]/30">
                      <input
                        type="checkbox"
                        checked={formIsDynamic}
                        onChange={(e) => setFormIsDynamic(e.target.checked)}
                        className="w-4 h-4 accent-[#581825]"
                      />
                      <span className="text-[#DFCDAE] font-bold text-xs">Dynamic Live Pricing</span>
                    </label>
                  </div>

                  {formIsDynamic ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[#D6D3D1] font-bold mb-1.5">Making Charge Type</label>
                        <select
                          value={formMakingType}
                          onChange={(e) => setFormMakingType(e.target.value as any)}
                          className="w-full bg-[#2B2625] p-2.5 rounded-xl border border-white/10 text-white focus:outline-none"
                        >
                          <option value="percentage">Percentage (%) of Gold Value</option>
                          <option value="perGram">Per Gram (₹ / g)</option>
                          <option value="fixed">Fixed Flat Amount (₹)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[#D6D3D1] font-bold mb-1.5">
                          Making Charge {formMakingType === 'percentage' ? '(%)' : '(₹)'}
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={formMakingCharge}
                          onChange={(e) => setFormMakingCharge(parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#2B2625] p-2.5 rounded-xl border border-white/10 text-white font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[#D6D3D1] font-bold mb-1.5">Wastage / Vaal (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={formWastage}
                          onChange={(e) => setFormWastage(parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#2B2625] p-2.5 rounded-xl border border-white/10 text-white font-bold"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[#D6D3D1] font-bold mb-1.5">Fixed Final Selling Price (₹)</label>
                      <input
                        type="number"
                        value={formFixedPrice}
                        onChange={(e) => setFormFixedPrice(parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#2B2625] p-3 rounded-xl border border-white/10 text-white font-bold text-base text-emerald-400"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#D6D3D1] font-bold mb-1.5">Compare at / MRP Price (₹)</label>
                      <input
                        type="number"
                        value={formCompareAtPrice}
                        onChange={(e) => setFormCompareAtPrice(parseFloat(e.target.value) || 0)}
                        placeholder="Optional strikethrough price"
                        className="w-full bg-[#2B2625] p-2.5 rounded-xl border border-white/10 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[#D6D3D1] font-bold mb-1.5">Discount Voucher Deduction (₹)</label>
                      <input
                        type="number"
                        value={formDiscount}
                        onChange={(e) => setFormDiscount(parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#2B2625] p-2.5 rounded-xl border border-white/10 text-white"
                      />
                    </div>
                  </div>

                  {/* LIVE ESTIMATED BREAKDOWN PREVIEW CARD */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-[#2B2625] to-[#380B12] border border-[#C5A880]/30 space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span className="font-bold text-[#DFCDAE] flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#C5A880]" />
                        Live Calculated Preview (Today’s Rates)
                      </span>
                      <span className="text-[10px] text-[#A8A29E]">
                        Rate Applied: {formatINR(previewPriceBreakdown.goldRateApplied)}/g ({tempProductForPreview.purity})
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                      <div>
                        <span className="text-[#A8A29E] block">Gold Net Value:</span>
                        <strong className="text-white">{formatINR(previewPriceBreakdown.goldValue)}</strong>
                      </div>
                      <div>
                        <span className="text-[#A8A29E] block">Making Charges:</span>
                        <strong className="text-white">{formatINR(previewPriceBreakdown.makingCharges)}</strong>
                      </div>
                      <div>
                        <span className="text-[#A8A29E] block">Wastage / Gemstones:</span>
                        <strong className="text-white">
                          {formatINR(previewPriceBreakdown.wastageAmount + previewPriceBreakdown.stoneCharges)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[#A8A29E] block">GST (3%):</span>
                        <strong className="text-white">{formatINR(previewPriceBreakdown.gstAmount)}</strong>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                      <span className="font-bold text-white text-xs">Customer Final Price:</span>
                      <span className="text-lg font-black text-emerald-400">
                        {formatINR(previewPriceBreakdown.finalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: UPLOAD PHOTOS & GALLERY */}
              {activeModalTab === 'images' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[#D6D3D1] font-bold mb-1.5">
                      Upload Photos from Device or Computer
                    </label>
                    <p className="text-[11px] text-[#A8A29E] mb-3">
                      Add multiple angles so customers can smoothly swipe between product images on the storefront!
                    </p>

                    {/* File Upload Drop Zone */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-[#C5A880]/40 hover:border-[#C5A880] bg-[#242121] hover:bg-[#2B2625] rounded-2xl p-6 text-center cursor-pointer transition-all group"
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        multiple
                        accept="image/*"
                        className="hidden"
                      />
                      <Upload className="w-8 h-8 text-[#C5A880] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-white block text-xs">
                        {isUploading ? 'Uploading & Processing Images...' : 'Click to Browse Files or Drag & Drop Photos'}
                      </span>
                      <span className="text-[10px] text-[#A8A29E] block mt-0.5">
                        PNG, JPG, WEBP formats supported. Select multiple files at once.
                      </span>
                    </div>
                  </div>

                  {/* Add Image by Web URL Strip */}
                  <div className="p-3.5 rounded-xl bg-[#242121] border border-white/10 space-y-1.5">
                    <span className="text-[11px] font-bold text-[#A8A29E]">Or Add by Direct URL:</span>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="flex-1 bg-[#1A1818] px-3 py-2 rounded-xl border border-white/10 text-white text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddUrlImage}
                        className="px-4 py-2 bg-[#581825] hover:bg-[#7E2638] text-white font-bold rounded-xl text-xs"
                      >
                        Add URL
                      </button>
                    </div>
                  </div>

                  {/* Photo Gallery Grid */}
                  <div>
                    <label className="block text-[#D6D3D1] font-bold mb-2">
                      Ornament Photo Gallery ({formImages.length} images)
                    </label>

                    {formImages.length === 0 ? (
                      <div className="p-6 text-center rounded-2xl bg-[#242121] border border-white/10 text-[#A8A29E] text-xs">
                        No photos added yet. Upload files above or add a URL.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {formImages.map((img, idx) => {
                          const isThumb = formThumbnail === img || (!formThumbnail && idx === 0);
                          return (
                            <div
                              key={idx}
                              className={`relative aspect-square rounded-xl overflow-hidden border-2 bg-[#242121] group transition-all ${
                                isThumb ? 'border-[#C5A880] ring-2 ring-[#C5A880]/30' : 'border-white/10'
                              }`}
                            >
                              <Image src={img} alt={`Photo ${idx + 1}`} fill className="object-cover" />

                              {/* Primary Thumbnail Badge */}
                              {isThumb && (
                                <span className="absolute top-1.5 left-1.5 z-10 bg-[#581825] text-[#C5A880] text-[9px] font-bold px-1.5 py-0.5 rounded shadow-md border border-[#C5A880]/40">
                                  ★ Primary
                                </span>
                              )}

                              {/* Actions on hover */}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 transition-opacity p-2">
                                {!isThumb && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetPrimaryThumbnail(img)}
                                    className="px-2 py-1 rounded bg-[#C5A880] text-[#1A1818] font-bold text-[9px] hover:bg-white"
                                  >
                                    Set as Main
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(idx)}
                                  className="px-2 py-1 rounded bg-red-600 text-white font-bold text-[9px] hover:bg-red-700 flex items-center gap-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Remove</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: STOCK, VISIBILITY & BADGES */}
              {activeModalTab === 'badges' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#D6D3D1] font-bold mb-1.5">Stock Status</label>
                      <select
                        value={formStockStatus}
                        onChange={(e) => setFormStockStatus(e.target.value as any)}
                        className="w-full bg-[#2B2625] p-2.5 rounded-xl border border-white/10 text-white focus:outline-none"
                      >
                        <option value="in_stock">In Stock &amp; Ready</option>
                        <option value="low_stock">Low Stock (Limited Pieces)</option>
                        <option value="made_to_order">Made to Order (Crafted on Demand)</option>
                        <option value="out_of_stock">Out of Stock</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[#D6D3D1] font-bold mb-1.5">Stock Quantity</label>
                      <input
                        type="number"
                        min="0"
                        value={formStockQuantity}
                        onChange={(e) => setFormStockQuantity(parseInt(e.target.value) || 0)}
                        className="w-full bg-[#2B2625] p-2.5 rounded-xl border border-white/10 text-white font-bold"
                      />
                    </div>
                  </div>

                  {/* Storefront Badges */}
                  <div className="p-4 rounded-2xl bg-[#242121] border border-white/10 space-y-3">
                    <span className="text-xs font-bold text-[#C5A880] block">Storefront Visibility Badges</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl bg-[#1A1818] border border-white/10">
                        <input
                          type="checkbox"
                          checked={formBestSeller}
                          onChange={(e) => setFormBestSeller(e.target.checked)}
                          className="w-4 h-4 accent-[#581825]"
                        />
                        <span className="text-white font-bold text-[11px]">Bestseller</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl bg-[#1A1818] border border-white/10">
                        <input
                          type="checkbox"
                          checked={formNewArrival}
                          onChange={(e) => setFormNewArrival(e.target.checked)}
                          className="w-4 h-4 accent-[#C5A880]"
                        />
                        <span className="text-white font-bold text-[11px]">New Arrival</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl bg-[#1A1818] border border-white/10">
                        <input
                          type="checkbox"
                          checked={formFeatured}
                          onChange={(e) => setFormFeatured(e.target.checked)}
                          className="w-4 h-4 accent-[#581825]"
                        />
                        <span className="text-white font-bold text-[11px]">Featured</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl bg-[#1A1818] border border-white/10">
                        <input
                          type="checkbox"
                          checked={formTrending}
                          onChange={(e) => setFormTrending(e.target.checked)}
                          className="w-4 h-4 accent-[#C5A880]"
                        />
                        <span className="text-white font-bold text-[11px]">Trending</span>
                      </label>
                    </div>
                  </div>

                  {/* Target Audience & Gender */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#D6D3D1] font-bold mb-1.5">Target Gender</label>
                      <select
                        value={formGender}
                        onChange={(e) => setFormGender(e.target.value as any)}
                        className="w-full bg-[#2B2625] p-2.5 rounded-xl border border-white/10 text-white focus:outline-none"
                      >
                        <option value="Women">Women</option>
                        <option value="Men">Men</option>
                        <option value="Unisex">Unisex</option>
                        <option value="Kids">Kids</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[#D6D3D1] font-bold mb-1.5">Occasions</label>
                      <input
                        type="text"
                        value={formOccasions.join(', ')}
                        onChange={(e) => setFormOccasions(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                        placeholder="Wedding, Festive, Daily Wear..."
                        className="w-full bg-[#2B2625] p-2.5 rounded-xl border border-white/10 text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer Bar */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#1A1818]">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {activeModalTab !== 'basic' && (
                    <button
                      type="button"
                      onClick={() => {
                        const tabs = ['basic', 'gold', 'pricing', 'images', 'badges'] as const;
                        const prevIdx = tabs.indexOf(activeModalTab) - 1;
                        if (prevIdx >= 0) setActiveModalTab(tabs[prevIdx]);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#2B2625] text-white text-xs font-semibold hover:bg-[#380B12]"
                    >
                      ← Previous Tab
                    </button>
                  )}
                  {activeModalTab !== 'badges' && (
                    <button
                      type="button"
                      onClick={() => {
                        const tabs = ['basic', 'gold', 'pricing', 'images', 'badges'] as const;
                        const nextIdx = tabs.indexOf(activeModalTab) + 1;
                        if (nextIdx < tabs.length) setActiveModalTab(tabs[nextIdx]);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#2B2625] text-[#C5A880] text-xs font-semibold hover:bg-[#380B12]"
                    >
                      Next Tab →
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-white/10 text-[#A8A29E] hover:text-white text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#581825] to-[#7E2638] hover:from-[#7E2638] hover:to-[#581825] text-white font-bold text-xs shadow-lg shadow-[#581825]/30 border border-[#C5A880]/30 transition-all hover:scale-102"
                  >
                    {editingProduct ? 'Save & Sync Changes' : 'Publish & Sync to Storefront'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
