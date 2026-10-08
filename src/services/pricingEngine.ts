import { Product, GoldRates, PriceBreakdown } from '@/types';

/**
 * Standard default fallback gold rates per gram (INR)
 * Used if database has not yet synced or offline
 */
export const DEFAULT_GOLD_RATES: GoldRates = {
  rate24K: 7350,
  rate22K: 6740,
  rate18K: 5510,
  rateSilver: 88,
  effectiveDate: new Date().toISOString().split('T')[0],
  effectiveTime: '10:30 AM',
  updatedBy: 'Vardhaman Bullion Desk',
  source: 'IBJA (India Bullion and Jewellers Association)',
  notes: 'Official morning opening rates',
  lastUpdatedTimestamp: Date.now(),
};

/**
 * Returns the effective rate per gram for a given gold/silver purity
 */
export function getRateForPurity(purity: string, rates: GoldRates = DEFAULT_GOLD_RATES): number {
  switch (purity) {
    case '24K':
      return rates.rate24K;
    case '22K':
      return rates.rate22K;
    case '18K':
      return rates.rate18K;
    case '14K':
      // 14K is 58.33% pure gold, calculated proportional to 24K
      return Math.round((rates.rate24K * 14) / 24);
    case '925 Silver':
    case 'Silver':
      return rates.rateSilver;
    default:
      return rates.rate22K;
  }
}

/**
 * Centralized Gold Pricing Calculator
 * Computes exact itemized price breakdown according to Indian jewellery standards
 */
export function calculateProductPrice(
  product: Product,
  rates: GoldRates = DEFAULT_GOLD_RATES,
  gstRateOverride?: number
): PriceBreakdown {
  // If product is set to fixed selling price and not dynamic pricing
  if (!product.isDynamicPricing && product.finalPrice > 0) {
    const fixedGstPercent = gstRateOverride ?? product.GST ?? 3;
    const baseBeforeTax = Math.round(product.finalPrice / (1 + fixedGstPercent / 100));
    const gstAmt = product.finalPrice - baseBeforeTax;
    return {
      netGoldWeight: product.netGoldWeight,
      goldRateApplied: getRateForPurity(product.purity, rates),
      goldValue: baseBeforeTax,
      makingCharges: 0,
      wastagePercentage: 0,
      wastageAmount: 0,
      stoneCharges: product.stonePrice || 0,
      subtotal: baseBeforeTax,
      gstPercentage: fixedGstPercent,
      gstAmount: gstAmt,
      discountAmount: product.discount || 0,
      finalPrice: Math.round(product.finalPrice),
      isDynamic: false,
    };
  }

  // 1. Identify applicable gold rate based on purity
  const goldRate = getRateForPurity(product.purity, rates);

  // 2. Gold Value = Net Gold Weight × Applicable Gold Rate
  const netWeight = Math.max(0, product.netGoldWeight || product.grossWeight || 0);
  const goldValue = Math.round(netWeight * goldRate);

  // 3. Making Charges calculation
  let makingCharges = 0;
  if (product.makingChargeType === 'perGram') {
    makingCharges = Math.round((product.makingCharge || 0) * (product.grossWeight || netWeight));
  } else if (product.makingChargeType === 'percentage') {
    makingCharges = Math.round((goldValue * (product.makingCharge || 0)) / 100);
  } else {
    // Fixed amount
    makingCharges = Math.round(product.makingCharge || 0);
  }

  // 4. Wastage = Net Gold Value × Wastage %
  const wastagePercentage = product.wastagePercentage || 0;
  const wastageAmount = Math.round((goldValue * wastagePercentage) / 100);

  // 5. Stone Charges
  const stoneCharges = Math.round(product.stonePrice || 0);

  // 6. Subtotal = Gold Value + Making Charges + Wastage + Stone Charges
  const subtotal = goldValue + makingCharges + wastageAmount + stoneCharges;

  // 7. GST = Applicable GST % (Standard 3% for jewellery in India)
  const gstPercent = gstRateOverride ?? product.GST ?? 3;
  const gstAmount = Math.round((subtotal * gstPercent) / 100);

  // 8. Discount
  const discountAmount = Math.round(product.discount || 0);

  // 9. Final Price = Subtotal + GST - Discount
  const finalPrice = Math.max(0, subtotal + gstAmount - discountAmount);

  return {
    netGoldWeight: netWeight,
    goldRateApplied: goldRate,
    goldValue,
    makingCharges,
    wastagePercentage,
    wastageAmount,
    stoneCharges,
    subtotal,
    gstPercentage: gstPercent,
    gstAmount,
    discountAmount,
    finalPrice,
    isDynamic: true,
  };
}

/**
 * Format number into Indian Rupee format (e.g. ₹1,45,200)
 */
export function formatINR(amount: number): string {
  if (isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculate scrap/old gold exchange estimation
 * Admin typically gives ~96-98% valuation for pure gold and applies testing margin
 */
export function calculateOldGoldValuation(
  weightGrams: number,
  purity: string,
  condition: string,
  rates: GoldRates = DEFAULT_GOLD_RATES
): {
  marketRatePerGram: number;
  grossValue: number;
  meltingRefiningDeduction: number;
  estimatedNetValuation: number;
} {
  const ratePerGram = getRateForPurity(purity, rates);
  const grossValue = Math.round(weightGrams * ratePerGram);

  // Standard scrap assessment deduction
  let deductionPercent = 2; // default 2%
  if (condition === 'Damaged/Scrap') deductionPercent = 3.5;
  if (condition === 'Heirloom') deductionPercent = 2.5;

  const deduction = Math.round((grossValue * deductionPercent) / 100);
  const estimatedNetValuation = grossValue - deduction;

  return {
    marketRatePerGram: ratePerGram,
    grossValue,
    meltingRefiningDeduction: deduction,
    estimatedNetValuation: Math.max(0, estimatedNetValuation),
  };
}
