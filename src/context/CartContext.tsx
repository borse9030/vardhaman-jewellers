'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, Coupon, PriceBreakdown } from '@/types';
import { useGoldRates } from '@/context/GoldRateContext';
import { calculateProductPrice } from '@/services/pricingEngine';
import { validateCoupon } from '@/lib/db/couponService';

interface AppliedCouponInfo {
  code: string;
  discount: number;
  message: string;
  coupon?: Coupon;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedSize?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCouponCode: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCouponCode: () => void;
  appliedCoupon: AppliedCouponInfo | null;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  itemCount: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  applyCouponCode: async () => ({ success: false, message: '' }),
  removeCouponCode: () => {},
  appliedCoupon: null,
  subtotal: 0,
  taxAmount: 0,
  discountAmount: 0,
  totalAmount: 0,
  itemCount: 0,
  isCartDrawerOpen: false,
  setIsCartDrawerOpen: () => {},
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { rates } = useGoldRates();
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCouponInfo | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Load from local storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('vj_cart_items');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to parse cart storage:', e);
    }
  }, []);

  // Recalculate item prices dynamically whenever gold rates change
  useEffect(() => {
    if (items.length === 0) return;
    setItems((prev) =>
      prev.map((item) => {
        const freshBreakdown = calculateProductPrice(item.product, rates);
        return {
          ...item,
          calculatedPrice: freshBreakdown.finalPrice,
          priceBreakdown: freshBreakdown,
        };
      })
    );
  }, [rates]);

  // Persist items
  const persistItems = (newItems: CartItem[]) => {
    setItems(newItems);
    try {
      localStorage.setItem('vj_cart_items', JSON.stringify(newItems));
    } catch (e) {
      console.error('Failed to persist cart items:', e);
    }
  };

  const addToCart = (product: Product, quantity = 1, selectedSize?: string) => {
    const breakdown = calculateProductPrice(product, rates);
    const existingIndex = items.findIndex((i) => i.productId === product.id && i.selectedSize === selectedSize);

    let updated: CartItem[];
    if (existingIndex > -1) {
      updated = [...items];
      updated[existingIndex].quantity += quantity;
    } else {
      const newItem: CartItem = {
        id: `cart-${product.id}-${Date.now()}`,
        productId: product.id,
        product,
        quantity,
        calculatedPrice: breakdown.finalPrice,
        priceBreakdown: breakdown,
        selectedSize,
      };
      updated = [newItem, ...items];
    }

    persistItems(updated);
    setIsCartDrawerOpen(true);
  };

  const removeFromCart = (productId: string) => {
    const updated = items.filter((i) => i.productId !== productId);
    persistItems(updated);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const updated = items.map((i) => (i.productId === productId ? { ...i, quantity } : i));
    persistItems(updated);
  };

  const clearCart = () => {
    persistItems([]);
    setAppliedCoupon(null);
  };

  const applyCouponCode = async (code: string): Promise<{ success: boolean; message: string }> => {
    const sub = items.reduce((acc, curr) => acc + curr.calculatedPrice * curr.quantity, 0);
    const result = await validateCoupon(code, sub);
    if (result.valid) {
      setAppliedCoupon({
        code: result.coupon!.code,
        discount: result.discount,
        message: result.message,
        coupon: result.coupon,
      });
      return { success: true, message: result.message };
    }
    return { success: false, message: result.message };
  };

  const removeCouponCode = () => {
    setAppliedCoupon(null);
  };

  // Totals calculations
  const subtotal = items.reduce((acc, curr) => acc + (curr.priceBreakdown?.subtotal || curr.calculatedPrice) * curr.quantity, 0);
  const taxAmount = items.reduce((acc, curr) => acc + (curr.priceBreakdown?.gstAmount || 0) * curr.quantity, 0);
  const rawTotal = items.reduce((acc, curr) => acc + curr.calculatedPrice * curr.quantity, 0);
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const totalAmount = Math.max(0, rawTotal - couponDiscount);
  const itemCount = items.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCouponCode,
        removeCouponCode,
        appliedCoupon,
        subtotal,
        taxAmount,
        discountAmount: couponDiscount,
        totalAmount,
        itemCount,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
