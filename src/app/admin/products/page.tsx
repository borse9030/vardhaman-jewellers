'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import {
  getAllProducts,
  createOrUpdateProduct,
  deleteProduct,
} from '@/lib/db/productService';
import { useGoldRates } from '@/context/GoldRateContext';
import { calculateProductPrice, formatINR } from '@/services/pricingEngine';
import { Product, JewelleryType, GoldPurity, MakingChargeType } from '@/types';

export default function AdminProductsPage() {
  const { rates } = useGoldRates();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Modal State for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formSKU, setFormSKU] = useState('');
  const [formCategory, setFormCategory] = useState('Necklaces');
  const [formSubcategory, setFormSubcategory] = useState('Temple Jewellery');
  const [formJewelleryType, setFormJewelleryType] = useState<JewelleryType>('Gold');
  const [formPurity, setFormPurity] = useState<GoldPurity>('22K');
  const [formGrossWeight, setFormGrossWeight] = useState(25.0);
  const [formNetWeight, setFormNetWeight] = useState(24.0);
  const [formMakingType, setFormMakingType] = useState<MakingChargeType>('percentage');
  const [formMakingCharge, setFormMakingCharge] = useState(12);
  const [formWastage, setFormWastage] = useState(2.0);
  const [formStonePrice, setFormStonePrice] = useState(0);
  const [formIsDynamic, setFormIsDynamic] = useState(true);
  const [formFixedPrice, setFormFixedPrice] = useState(150000);
  const [formImageUrl, setFormImageUrl] = useState('https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80');
  const [formDescription, setFormDescription] = useState('');

  const loadData = () => {
    setLoading(true);
    getAllProducts().then((list) => {
      setProducts(list);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormSKU(`VJ-${Date.now().toString().slice(-6)}`);
    setFormCategory('Necklaces');
    setFormSubcategory('Temple Jewellery');
    setFormJewelleryType('Gold');
    setFormPurity('22K');
    setFormGrossWeight(25.0);
    setFormNetWeight(24.0);
    setFormMakingType('percentage');
    setFormMakingCharge(12);
    setFormWastage(2.0);
    setFormStonePrice(0);
    setFormIsDynamic(true);
    setFormFixedPrice(150000);
    setFormImageUrl('https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80');
    setFormDescription('Handcrafted in certified BIS 916 hallmarked pure gold.');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormSKU(p.SKU);
    setFormCategory(p.category);
    setFormSubcategory(p.subcategory);
    setFormJewelleryType(p.jewelleryType);
    setFormPurity(p.purity);
    setFormGrossWeight(p.grossWeight);
    setFormNetWeight(p.netGoldWeight);
    setFormMakingType(p.makingChargeType);
    setFormMakingCharge(p.makingCharge);
    setFormWastage(p.wastagePercentage);
    setFormStonePrice(p.stonePrice || 0);
    setFormIsDynamic(p.isDynamicPricing);
    setFormFixedPrice(p.finalPrice);
    setFormImageUrl(p.images[0] || p.thumbnail);
    setFormDescription(p.description);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formSKU) return;

    const slug = formName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const productPayload: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      SKU: formSKU,
      name: formName,
      slug,
      shortDescription: formDescription.slice(0, 120),
      description: formDescription,
      category: formCategory,
      subcategory: formSubcategory,
      collection: 'Khandesh Royal Heritage',
      jewelleryType: formJewelleryType,
      metalType: formJewelleryType === 'Diamond' ? 'White Gold' : 'Yellow Gold',
      purity: formPurity,
      goldColor: 'Yellow',
      grossWeight: Number(formGrossWeight),
      netGoldWeight: Number(formNetWeight),
      stoneWeight: 0,
      stoneType: formStonePrice > 0 ? 'Certified Gemstones' : 'None',
      stonePrice: Number(formStonePrice),
      makingChargeType: formMakingType,
      makingCharge: Number(formMakingCharge),
      wastagePercentage: Number(formWastage),
      goldRateReference: formPurity === '18K' ? '18K' : formPurity === '24K' ? '24K' : formPurity === '925 Silver' ? 'Silver' : '22K',
      isDynamicPricing: formIsDynamic,
      basePrice: 0,
      discount: 0,
      GST: 3,
      finalPrice: Number(formFixedPrice),
      stockStatus: 'in_stock',
      stockQuantity: 5,
      featured: editingProduct ? editingProduct.featured : true,
      trending: editingProduct ? editingProduct.trending : true,
      newArrival: editingProduct ? editingProduct.newArrival : true,
      bestSeller: editingProduct ? editingProduct.bestSeller : false,
      tags: [formCategory, formPurity, 'Hallmark'],
      specifications: [
        { key: 'Gold Purity', value: `${formPurity} (916 BIS)` },
        { key: 'Net Gold Weight', value: `${formNetWeight}g` },
      ],
      images: [formImageUrl],
      thumbnail: formImageUrl,
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await createOrUpdateProduct(productPayload);
    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this ornament from the catalogue?')) {
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
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return p.name.toLowerCase().includes(q) || p.SKU.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Sub-actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">Product Catalogue Manager</h1>
          <p className="text-xs text-[#A8A29E] mt-0.5">
            Manage dynamic gold rates, making charges, stock, and photography across your inventory.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/products/csv-import"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2B2625] hover:bg-[#380B12] text-[#DFCDAE] text-xs font-bold border border-white/10"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#C5A880]" />
            <span>CSV Bulk Import</span>
          </Link>

          <Link
            href="/admin/bulk-upload"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2B2625] hover:bg-[#380B12] text-[#DFCDAE] text-xs font-bold border border-white/10"
          >
            <Upload className="w-4 h-4 text-[#C5A880]" />
            <span>R2 Bulk Images</span>
          </Link>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#581825] hover:bg-[#7E2638] text-white text-xs font-bold shadow-sm"
          >
            <Plus className="w-4 h-4 text-[#C5A880]" />
            <span>Add New Ornament</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#171515] p-4 rounded-2xl border border-white/10">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by SKU or Ornament name..."
            className="w-full bg-[#2B2625] text-xs text-white pl-9 pr-4 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-[#C5A880]"
          />
          <Search className="w-4 h-4 text-[#A8A29E] absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto text-xs">
          <span className="text-[#A8A29E]">Category:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-[#2B2625] text-white text-xs p-2 rounded-xl border border-white/10 focus:outline-none"
          >
            <option value="all">All Categories ({products.length})</option>
            <option value="Necklaces">Necklaces</option>
            <option value="Bangles">Bangles & Patlya</option>
            <option value="Earrings">Earrings</option>
            <option value="Rings">Rings</option>
            <option value="Mangalsutra">Mangalsutras</option>
            <option value="Silver">Silver Articles</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[#171515] rounded-2xl border border-white/10 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#E8E2D8]">
            <thead>
              <tr className="border-b border-white/10 bg-[#242121] text-[#A8A29E] uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Ornament</th>
                <th className="py-3 px-3">SKU</th>
                <th className="py-3 px-3">Purity & Metal</th>
                <th className="py-3 px-3">Net Wt</th>
                <th className="py-3 px-3">Pricing Model</th>
                <th className="py-3 px-3">Live Final Price</th>
                <th className="py-3 px-3">Badges</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProducts.map((p) => {
                const breakdown = calculateProductPrice(p, rates);
                return (
                  <tr key={p.id} className="hover:bg-[#2B2625]/40 transition-colors">
                    {/* Ornament Title & Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-[#2B2625] shrink-0 border border-white/10">
                          <Image src={p.thumbnail || p.images[0]} alt={p.name} fill className="object-cover" />
                        </div>
                        <div className="truncate max-w-[200px]">
                          <span className="font-bold text-white block truncate">{p.name}</span>
                          <span className="text-[10px] text-[#A8A29E]">{p.category}</span>
                        </div>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="py-3 px-3 font-mono font-medium text-[#C5A880]">{p.SKU}</td>

                    {/* Purity */}
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-[#2B2625] font-semibold text-white border border-white/10">
                        {p.purity}
                      </span>
                    </td>

                    {/* Weight */}
                    <td className="py-3 px-3">{p.netGoldWeight}g</td>

                    {/* Pricing Mode */}
                    <td className="py-3 px-3">
                      {p.isDynamicPricing ? (
                        <span className="text-emerald-400 font-semibold text-[11px]">Dynamic (Bullion)</span>
                      ) : (
                        <span className="text-[#A8A29E] text-[11px]">Fixed Price</span>
                      )}
                    </td>

                    {/* Calculated Price */}
                    <td className="py-3 px-3 font-bold text-white">
                      {formatINR(breakdown.finalPrice)}
                    </td>

                    {/* Badges toggles */}
                    <td className="py-3 px-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleToggleBadge(p, 'bestSeller')}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            p.bestSeller ? 'bg-[#581825] text-white' : 'bg-[#2B2625] text-[#78716C]'
                          }`}
                          title="Toggle Bestseller"
                        >
                          Best
                        </button>
                        <button
                          onClick={() => handleToggleBadge(p, 'newArrival')}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            p.newArrival ? 'bg-[#C5A880] text-[#1A1818]' : 'bg-[#2B2625] text-[#78716C]'
                          }`}
                          title="Toggle New Arrival"
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
                          className="p-1.5 rounded-lg bg-[#2B2625] text-[#A8A29E] hover:text-white"
                          title="View on site"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDuplicate(p)}
                          className="p-1.5 rounded-lg bg-[#2B2625] text-[#A8A29E] hover:text-[#C5A880]"
                          title="Duplicate"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg bg-[#2B2625] text-[#A8A29E] hover:text-white"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 rounded-lg bg-[#2B2625] text-[#A8A29E] hover:text-red-400"
                          title="Delete"
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

      {/* Create / Edit Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-xs" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-2xl bg-[#1A1818] border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <h2 className="font-serif text-lg font-bold text-white">
                {editingProduct ? 'Edit Jewellery Piece' : 'Add New Jewellery Piece'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#A8A29E] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#D6D3D1] font-semibold mb-1">Ornament Title *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Royal Nakshi Antique Haar"
                    className="w-full bg-[#2B2625] p-2.5 rounded-xl border border-white/10 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#D6D3D1] font-semibold mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={formSKU}
                    onChange={(e) => setFormSKU(e.target.value)}
                    placeholder="VJ-NECK-001"
                    className="w-full bg-[#2B2625] p-2.5 rounded-xl border border-white/10 text-white focus:outline-none uppercase font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#D6D3D1] font-semibold mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-[#2B2625] p-2.5 rounded-xl border border-white/10 text-white"
                  >
                    <option>Necklaces</option>
                    <option>Bangles</option>
                    <option>Earrings</option>
                    <option>Rings</option>
                    <option>Mangalsutra</option>
                    <option>Chains</option>
                    <option>Silver</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#D6D3D1] font-semibold mb-1">Purity</label>
                  <select
                    value={formPurity}
                    onChange={(e) => setFormPurity(e.target.value as any)}
                    className="w-full bg-[#2B2625] p-2.5 rounded-xl border border-white/10 text-white"
                  >
                    <option value="22K">22K (916 BIS)</option>
                    <option value="24K">24K (999 Pure)</option>
                    <option value="18K">18K (750 Diamonds)</option>
                    <option value="925 Silver">925 Silver</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#D6D3D1] font-semibold mb-1">Net Gold Wt (g)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formNetWeight}
                    onChange={(e) => setFormNetWeight(parseFloat(e.target.value))}
                    className="w-full bg-[#2B2625] p-2.5 rounded-xl border border-white/10 text-white"
                  />
                </div>
              </div>

              {/* Dynamic Pricing Engine Parameters */}
              <div className="p-4 rounded-xl bg-[#2B2625] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#C5A880]">Centralized Pricing Engine Parameters</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsDynamic}
                      onChange={(e) => setFormIsDynamic(e.target.checked)}
                      className="accent-[#581825]"
                    />
                    <span className="text-white font-semibold">Enable Live Dynamic Pricing</span>
                  </label>
                </div>

                {formIsDynamic ? (
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[#A8A29E] mb-1">Making Charge (%)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={formMakingCharge}
                        onChange={(e) => setFormMakingCharge(parseFloat(e.target.value))}
                        className="w-full bg-[#1A1818] p-2 rounded-lg border border-white/10 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[#A8A29E] mb-1">Wastage %</label>
                      <input
                        type="number"
                        step="0.5"
                        value={formWastage}
                        onChange={(e) => setFormWastage(parseFloat(e.target.value))}
                        className="w-full bg-[#1A1818] p-2 rounded-lg border border-white/10 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[#A8A29E] mb-1">Stone Charges (₹)</label>
                      <input
                        type="number"
                        value={formStonePrice}
                        onChange={(e) => setFormStonePrice(parseFloat(e.target.value))}
                        className="w-full bg-[#1A1818] p-2 rounded-lg border border-white/10 text-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[#A8A29E] mb-1">Fixed Selling Price (₹)</label>
                    <input
                      type="number"
                      value={formFixedPrice}
                      onChange={(e) => setFormFixedPrice(parseFloat(e.target.value))}
                      className="w-full bg-[#1A1818] p-2 rounded-lg border border-white/10 text-white"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[#D6D3D1] font-semibold mb-1">Primary Image URL (Cloudflare R2 or CDN)</label>
                <input
                  type="text"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="w-full bg-[#2B2625] p-2.5 rounded-xl border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block text-[#D6D3D1] font-semibold mb-1">Product Description</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-[#2B2625] p-2.5 rounded-xl border border-white/10 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-[#A8A29E] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#581825] hover:bg-[#7E2638] text-white font-bold"
                >
                  Save Ornament
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
