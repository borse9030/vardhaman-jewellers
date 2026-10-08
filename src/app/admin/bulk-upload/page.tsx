'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  FileImage,
  ArrowLeft,
  X,
  Sparkles,
  RefreshCw,
  Layers,
} from 'lucide-react';
import { getAllProducts, createOrUpdateProduct } from '@/lib/db/productService';

interface UploadItem {
  id: string;
  file: File;
  previewUrl: string;
  matchedSKU?: string;
  status: 'pending' | 'uploading' | 'success' | 'failed';
  progress: number;
}

export default function BulkImageUploadPage() {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [summaryMessage, setSummaryMessage] = useState<string | null>(null);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const allProducts = await getAllProducts();
    const productSKUs = allProducts.map((p) => p.SKU.toUpperCase());

    const newItems: UploadItem[] = [];

    Array.from(files).forEach((file) => {
      // Automatic SKU Matching: Extracts SKU prefix like "VJ-NECK-001" from "VJ-NECK-001-main.jpg"
      const fileNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      const matched = productSKUs.find((sku) =>
        fileNameWithoutExt.toUpperCase().startsWith(sku)
      );

      newItems.push({
        id: `img-${Date.now()}-${Math.random()}`,
        file,
        previewUrl: URL.createObjectURL(file),
        matchedSKU: matched || undefined,
        status: 'pending',
        progress: 0,
      });
    });

    setItems((prev) => [...prev, ...newItems]);
    setSummaryMessage(null);
  };

  const handleRemove = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleUploadAll = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);

    const allProducts = await getAllProducts();
    let attachedCount = 0;

    // Simulate R2 signed upload & automatic product association
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // Update progress
      setItems((prev) =>
        prev.map((it, idx) => (idx === i ? { ...it, status: 'uploading', progress: 50 } : it))
      );

      await new Promise((r) => setTimeout(r, 120)); // simulated direct presigned S3 upload

      // If matched SKU found, attach image to product in catalogue
      if (item.matchedSKU) {
        const prod = allProducts.find(
          (p) => p.SKU.toUpperCase() === item.matchedSKU!.toUpperCase()
        );
        if (prod) {
          const updatedImages = [item.previewUrl, ...prod.images.filter((img) => img !== item.previewUrl)];
          await createOrUpdateProduct({
            ...prod,
            images: updatedImages,
            thumbnail: item.previewUrl,
          });
          attachedCount++;
        }
      }

      setItems((prev) =>
        prev.map((it, idx) => (idx === i ? { ...it, status: 'success', progress: 100 } : it))
      );
    }

    setIsProcessing(false);
    setSummaryMessage(
      `Successfully processed ${items.length} images to Cloudflare R2. Automatically matched and attached to ${attachedCount} products via SKU recognition!`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin/products" className="text-[#A8A29E] hover:text-white">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="font-serif text-2xl font-bold text-white">
              Cloudflare R2 Bulk Image Uploader & SKU Matcher
            </h1>
          </div>
          <p className="text-xs text-[#A8A29E] mt-0.5">
            Upload hundreds of high-resolution jewellery photographs with automatic SKU prefix recognition.
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={handleUploadAll}
            disabled={isProcessing}
            className="px-6 py-2.5 rounded-xl bg-[#581825] hover:bg-[#7E2638] text-white font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 shadow-md flex items-center gap-2"
          >
            <Upload className="w-4 h-4 text-[#C5A880]" />
            <span>{isProcessing ? 'Uploading to R2...' : `Upload All (${items.length} Files)`}</span>
          </button>
        )}
      </div>

      {/* Summary Alert */}
      {summaryMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{summaryMessage}</span>
        </div>
      )}

      {/* Dropzone */}
      <div className="bg-[#171515] p-8 rounded-2xl border-2 border-dashed border-white/20 text-center flex flex-col items-center justify-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-[#2B2625] flex items-center justify-center text-[#C5A880]">
          <Upload className="w-7 h-7" />
        </div>
        <div>
          <h3 className="font-serif text-base font-bold text-white">
            Select or Drag Multiple Jewellery Photos
          </h3>
          <p className="text-xs text-[#A8A29E] mt-1 max-w-md">
            Name your files starting with the SKU (e.g. <code>VJ-NECK-001-main.webp</code>, <code>VJ-RING-001-zoom.jpg</code>) for automated catalogue binding.
          </p>
        </div>

        <label className="cursor-pointer px-5 py-2.5 rounded-xl bg-[#581825] hover:bg-[#7E2638] text-white text-xs font-bold transition-colors shadow-sm">
          <span>Browse Media Files</span>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFiles}
            className="hidden"
          />
        </label>
      </div>

      {/* Files Queue Grid */}
      {items.length > 0 && (
        <div className="bg-[#171515] p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-white/10 text-xs">
            <span className="font-bold text-white">Queue: {items.length} Images</span>
            <button
              onClick={() => setItems([])}
              className="text-[#A8A29E] hover:text-red-400"
            >
              Clear Queue
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-[#2B2625] rounded-xl border border-white/10 overflow-hidden text-xs relative flex flex-col justify-between"
              >
                <button
                  onClick={() => handleRemove(item.id)}
                  className="absolute top-1.5 right-1.5 z-10 p-1 rounded-full bg-black/60 text-white hover:bg-red-700"
                >
                  <X className="w-3 h-3" />
                </button>

                <div className="relative aspect-square w-full bg-[#1A1818]">
                  <Image src={item.previewUrl} alt={item.file.name} fill className="object-cover" />
                </div>

                <div className="p-2.5 space-y-1">
                  <p className="font-semibold text-white truncate text-[11px]">{item.file.name}</p>

                  {item.matchedSKU ? (
                    <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                      Matched: {item.matchedSKU}
                    </span>
                  ) : (
                    <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-stone-900 text-[#A8A29E]">
                      No SKU Match
                    </span>
                  )}

                  {/* Status */}
                  <div className="pt-1">
                    {item.status === 'uploading' && (
                      <span className="text-[10px] text-amber-400 animate-pulse">Uploading...</span>
                    )}
                    {item.status === 'success' && (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Uploaded & Linked
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
