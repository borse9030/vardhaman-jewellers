import { Coupon } from '@/types';
import { INITIAL_COUPONS } from '@/data/seedData';

let memoryCoupons: Coupon[] = [...INITIAL_COUPONS];

function getStoredCoupons(): Coupon[] {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('vj_coupons');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryCoupons = parsed;
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse coupons:', e);
      }
    }
  }
  return memoryCoupons;
}

function saveCouponsLocally(coupons: Coupon[]) {
  memoryCoupons = coupons;
  if (typeof window !== 'undefined') {
    localStorage.setItem('vj_coupons', JSON.stringify(coupons));
  }
}

export async function getAllCoupons(): Promise<Coupon[]> {
  return getStoredCoupons();
}

export async function validateCoupon(
  code: string,
  orderAmount: number
): Promise<{ valid: boolean; discount: number; message: string; coupon?: Coupon }> {
  const coupons = await getAllCoupons();
  const normalized = code.trim().toUpperCase();
  const coupon = coupons.find((c) => c.code.toUpperCase() === normalized);

  if (!coupon) {
    return { valid: false, discount: 0, message: 'Invalid promo code.' };
  }

  if (!coupon.isActive) {
    return { valid: false, discount: 0, message: 'This coupon is no longer active.' };
  }

  if (orderAmount < coupon.minOrderAmount) {
    return {
      valid: false,
      discount: 0,
      message: `Minimum order amount of ₹${coupon.minOrderAmount.toLocaleString('en-IN')} required for this coupon.`,
    };
  }

  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = Math.round((orderAmount * coupon.discountValue) / 100);
    if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
      discount = coupon.maxDiscountAmount;
    }
  } else {
    discount = coupon.discountValue;
  }

  return {
    valid: true,
    discount,
    message: `Coupon "${coupon.code}" applied! You saved ₹${discount.toLocaleString('en-IN')}`,
    coupon,
  };
}

export async function createCoupon(data: Omit<Coupon, 'id' | 'usedCount'>): Promise<Coupon> {
  const all = await getAllCoupons();
  const newCoupon: Coupon = {
    ...data,
    id: `cp-${Date.now()}`,
    usedCount: 0,
  };
  all.unshift(newCoupon);
  saveCouponsLocally(all);
  return newCoupon;
}

export async function deleteCoupon(id: string): Promise<boolean> {
  const all = await getAllCoupons();
  const filtered = all.filter((c) => c.id !== id);
  saveCouponsLocally(filtered);
  return true;
}

export async function toggleCoupon(id: string): Promise<Coupon | null> {
  const all = await getAllCoupons();
  const item = all.find((c) => c.id === id);
  if (!item) return null;
  item.isActive = !item.isActive;
  saveCouponsLocally(all);
  return item;
}
