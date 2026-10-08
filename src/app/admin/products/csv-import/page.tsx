'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Papa from 'papaparse';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertCircle,
  Download,
  ArrowLeft,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { bulkImportProducts, getAllProducts } from '@/lib/db/productService';
import { Product, JewelleryType, GoldPurity } from '@/types';

export default function CSVImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validCount, setValidCount] = useState(0);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState<number | null>(null);

  const downloadSampleCSV = () => {
    const sample = `SKU,name,category,subcategory,jewelleryType,purity,grossWeight,netGoldWeight,makingCharge,wastagePercentage,stonePrice,description,imageUrl
VJ-NECK-101,Rajwadi Haar,Necklaces,Temple,Gold,22K,45.5,43.2,12,2.5,0,Handcrafted 22K hallmarked necklace,https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800
VJ-BANG-201,Khandesh Patlya,Bangles,Patlya,Gold,22K,32.0,32.0,600,1.5,0,Pair of solid broad bangles,https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800
VJ-RING-301,Solitaire Ring,Rings,Solitaire,Diamond,18K,4.5,4.2,5000,0,120000,IGI certified natural diamond ring,https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800`;

    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'vardhaman_catalogue_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportCurrentCatalogueCSV = async () => {
    const list = await getAllProducts();
    const csv = Papa.unparse(
      list.map((p) => ({
        SKU: p.SKU,
        name: p.name,
        category: p.category,
        subcategory: p.subcategory,
        jewelleryType: p.jewelleryType,
        purity: p.purity,
        grossWeight: p.grossWeight,
        netGoldWeight: p.netGoldWeight,
        makingCharge: p.makingCharge,
        wastagePercentage: p.wastagePercentage,
        stonePrice: p.stonePrice || 0,
        description: p.description,
        imageUrl: p.images[0] || p.thumbnail,
      }))
    );

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `vardhaman_catalogue_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setImportSuccess(null);
    setValidationErrors([]);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as any[];
        setParsedRows(rows);

        // Run thorough validation
        const errors: string[] = [];
        let valid = 0;

        rows.forEach((row, idx) => {
          const rowNum = idx + 2;
          if (!row.SKU) errors.push(`Row ${rowNum}: Missing mandatory field 'SKU'`);
          if (!row.name) errors.push(`Row ${rowNum}: Missing mandatory field 'name'`);
          if (!row.purity) errors.push(`Row ${rowNum}: Missing mandatory field 'purity'`);
          if (!row.netGoldWeight || isNaN(parseFloat(row.netGoldWeight))) {
            errors.push(`Row ${rowNum}: Invalid 'netGoldWeight' numeric value`);
          }

          if (row.SKU && row.name && row.purity && !isNaN(parseFloat(row.netGoldWeight))) {
            valid++;
          }
        });

        setValidationErrors(errors);
        setValidCount(valid);
      },
      error: (err) => {
        setValidationErrors([`CSV Parsing error: ${err.message}`]);
      },
    });
  };

  const handleExecuteImport = async () => {
    if (parsedRows.length === 0) return;
    setImporting(true);

    try {
      const formattedProducts: Product[] = parsedRows
        .filter((r) => r.SKU && r.name && r.purity)
        .map((r, i) => {
          const name = r.name.trim();
          const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          const net = parseFloat(r.netGoldWeight) || 10;
          const gross = parseFloat(r.grossWeight) || net;
          const purity = (r.purity.trim().toUpperCase() as GoldPurity) || '22K';

          return {
            id: `prod-csv-${r.SKU.toLowerCase()}`,
            SKU: r.SKU.trim(),
            name,
            slug: `${slug}-${i}`,
            shortDescription: r.description ? r.description.slice(0, 100) : 'Handcrafted BIS hallmarked fine jewellery.',
            description: r.description || 'Masterfully crafted in certified pure hallmarked gold.',
            category: r.category || 'Necklaces',
            subcategory: r.subcategory || 'Temple Jewellery',
            collection: 'Khandesh Royal Heritage',
            jewelleryType: (r.jewelleryType as JewelleryType) || 'Gold',
            metalType: r.jewelleryType === 'Diamond' ? 'White Gold' : 'Yellow Gold',
            purity,
            goldColor: 'Yellow',
            grossWeight: gross,
            netGoldWeight: net,
            stoneWeight: 0,
            stoneType: parseFloat(r.stonePrice) > 0 ? 'Certified Natural Stones' : 'None',
            stonePrice: parseFloat(r.stonePrice) || 0,
            makingChargeType: 'percentage',
            makingCharge: parseFloat(r.makingCharge) || 12,
            wastagePercentage: parseFloat(r.wastagePercentage) || 2.0,
            goldRateReference: purity === '18K' ? '18K' : purity === '24K' ? '24K' : purity === '925 Silver' ? 'Silver' : '22K',
            isDynamicPricing: true,
            basePrice: 0,
            discount: 0,
            GST: 3,
            finalPrice: 0,
            stockStatus: 'in_stock',
            stockQuantity: 10,
            featured: false,
            trending: false,
            newArrival: true,
            bestSeller: false,
            tags: [r.category || 'Jewellery', purity],
            specifications: [
              { key: 'Gold Purity', value: `${purity} (BIS Hallmark)` },
              { key: 'Net Weight', value: `${net}g` },
            ],
            images: [r.imageUrl || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800'],
            thumbnail: r.imageUrl || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        });

      const res = await bulkImportProducts(formattedProducts);
      setImportSuccess(res.count);
      setParsedRows([]);
      setFile(null);
    } catch (err) {
      console.error('Import failed:', err);
      setValidationErrors(['Database bulk write error occurred.']);
    } finally {
      setImporting(false);
    }
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
              CSV Bulk Product Import (Scale for 4,000+ Items)
            </h1>
          </div>
          <p className="text-xs text-[#A8A29E] mt-0.5">
            Import or export massive jewellery catalogue batches with automatic column mapping and validation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={downloadSampleCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2B2625] hover:bg-[#380B12] text-[#DFCDAE] text-xs font-bold border border-white/10"
          >
            <Download className="w-4 h-4 text-[#C5A880]" />
            <span>Download Sample CSV</span>
          </button>
          <button
            onClick={exportCurrentCatalogueCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2B2625] hover:bg-[#380B12] text-white text-xs font-bold border border-white/10"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export Full Catalogue</span>
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {importSuccess !== null && (
        <div className="p-6 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <strong className="block text-sm font-bold text-white">Import Successfully Completed!</strong>
            <p className="mt-0.5">
              Successfully imported <strong>{importSuccess}</strong> jewellery items into Firestore & local catalogue cache. All dynamic prices have been connected to today's live gold rate.
            </p>
          </div>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div className="bg-[#171515] p-8 rounded-2xl border-2 border-dashed border-white/20 text-center flex flex-col items-center justify-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-[#2B2625] flex items-center justify-center text-[#C5A880]">
          <FileSpreadsheet className="w-7 h-7" />
        </div>
        <div>
          <h3 className="font-serif text-base font-bold text-white">Select or Drag CSV Catalogue File</h3>
          <p className="text-xs text-[#A8A29E] mt-1">
            Compatible with Excel, Google Sheets, or ERP exported .csv files up to 50MB.
          </p>
        </div>

        <label className="cursor-pointer px-5 py-2.5 rounded-xl bg-[#581825] hover:bg-[#7E2638] text-white text-xs font-bold transition-colors shadow-sm">
          <span>Choose CSV File</span>
          <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
        </label>

        {file && (
          <p className="text-xs text-[#DFCDAE] font-semibold">
            Loaded: {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>

      {/* Validation & Preview Section */}
      {parsedRows.length > 0 && (
        <div className="bg-[#171515] rounded-2xl border border-white/10 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-white/10 text-xs">
            <div>
              <h3 className="font-serif text-base font-bold text-white">Pre-Import Validation Check</h3>
              <p className="text-[#A8A29E]">
                Total rows detected: <strong>{parsedRows.length}</strong> | Valid rows: <strong className="text-emerald-400">{validCount}</strong>
              </p>
            </div>

            <button
              onClick={handleExecuteImport}
              disabled={importing || validCount === 0}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{importing ? 'Processing 4,000+ Items...' : `Import ${validCount} Valid Products`}</span>
            </button>
          </div>

          {/* Validation Warnings */}
          {validationErrors.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs space-y-1 max-h-40 overflow-y-auto">
              <strong className="block text-amber-300">Validation Notice ({validationErrors.length} issues):</strong>
              {validationErrors.slice(0, 10).map((err, i) => (
                <p key={i}>• {err}</p>
              ))}
              {validationErrors.length > 10 && (
                <p className="text-[10px] text-amber-400 font-bold">
                  ...and {validationErrors.length - 10} more rows
                </p>
              )}
            </div>
          )}

          {/* Preview Table */}
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left text-[#E8E2D8]">
              <thead>
                <tr className="border-b border-white/10 text-[#A8A29E] uppercase text-[10px]">
                  <th className="py-2 px-3">SKU</th>
                  <th className="py-2 px-3">Name</th>
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-3">Purity</th>
                  <th className="py-2 px-3">Net Wt</th>
                  <th className="py-2 px-3">Making %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {parsedRows.slice(0, 5).map((row, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-3 font-mono text-[#C5A880]">{row.SKU}</td>
                    <td className="py-2 px-3 text-white font-medium">{row.name}</td>
                    <td className="py-2 px-3">{row.category}</td>
                    <td className="py-2 px-3 font-bold">{row.purity}</td>
                    <td className="py-2 px-3">{row.netGoldWeight}g</td>
                    <td className="py-2 px-3">{row.makingCharge || '12'}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
