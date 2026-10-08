import { Order, OrderStatus } from '@/types';
import { db, isFirebaseConfigured } from '@/lib/firebase/config';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';

// Initial sample orders for realistic dashboard preview
let memoryOrders: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'VJ-2026-1001',
    customerName: 'Priya Kulkarni',
    customerEmail: 'priya.kulkarni@example.com',
    customerPhone: '+91 98223 44556',
    shippingAddress: {
      fullName: 'Priya Kulkarni',
      phone: '+91 98223 44556',
      email: 'priya.kulkarni@example.com',
      addressLine1: 'Flat 402, Royal Palms, Laxmi Road',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411030',
    },
    deliveryMethod: 'home_delivery',
    items: [
      {
        productId: 'vj-neck-001',
        SKU: 'VJ-NECK-001',
        name: 'Aadrika Antique Temple Nakshi Gold Haar',
        thumbnail: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=500&q=80',
        purity: '22K',
        grossWeight: 48.65,
        quantity: 1,
        price: 382450,
        total: 382450,
        priceBreakdown: {
          netGoldWeight: 46.2,
          goldRateApplied: 6765,
          goldValue: 312543,
          makingCharges: 43756,
          wastagePercentage: 2.5,
          wastageAmount: 7813,
          stoneCharges: 8500,
          subtotal: 372612,
          gstPercentage: 3,
          gstAmount: 11178,
          discountAmount: 5000,
          finalPrice: 382450,
          isDynamic: true,
        },
      },
    ],
    subtotal: 372612,
    taxAmount: 11178,
    discountAmount: 5000,
    shippingFee: 0,
    totalAmount: 382450,
    couponCode: 'VJGOLD',
    status: 'Ready for Dispatch',
    paymentMethod: 'assisted_purchase',
    paymentStatus: 'completed',
    paymentReference: 'UPI-REF-99482103',
    giftMessage: 'Best wishes on your daughter’s wedding!',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: 'ord-1002',
    orderNumber: 'VJ-2026-1002',
    customerName: 'Sanjay Jain',
    customerEmail: 'sanjay.jain@example.com',
    customerPhone: '+91 94231 88990',
    shippingAddress: {
      fullName: 'Sanjay Jain',
      phone: '+91 94231 88990',
      email: 'sanjay.jain@example.com',
      addressLine1: 'Shop No 14, Main Cloth Market',
      city: 'Jalgaon',
      state: 'Maharashtra',
      pincode: '425001',
    },
    deliveryMethod: 'store_pickup',
    pickupStoreId: 'store-jalgaon',
    items: [
      {
        productId: 'vj-ring-001',
        SKU: 'VJ-RING-001',
        name: 'Suryavanshi 22K Men’s Gold Signet Ring',
        thumbnail: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=500&q=80',
        purity: '22K',
        grossWeight: 11.4,
        quantity: 1,
        price: 89400,
        total: 89400,
        priceBreakdown: {
          netGoldWeight: 11.4,
          goldRateApplied: 6765,
          goldValue: 77121,
          makingCharges: 8483,
          wastagePercentage: 1.5,
          wastageAmount: 1157,
          stoneCharges: 0,
          subtotal: 86761,
          gstPercentage: 3,
          gstAmount: 2603,
          discountAmount: 1000,
          finalPrice: 89400,
          isDynamic: true,
        },
      },
    ],
    subtotal: 86761,
    taxAmount: 2603,
    discountAmount: 1000,
    shippingFee: 0,
    totalAmount: 89400,
    status: 'Confirmed',
    paymentMethod: 'upi',
    paymentStatus: 'completed',
    paymentReference: 'UPI-JAL-488210',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
];

function getStoredOrders(): Order[] {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('vj_orders');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryOrders = parsed;
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse orders:', e);
      }
    }
  }
  return memoryOrders;
}

function saveOrdersLocally(orders: Order[]) {
  memoryOrders = orders;
  if (typeof window !== 'undefined') {
    localStorage.setItem('vj_orders', JSON.stringify(orders));
    window.dispatchEvent(new Event('vj_orders_updated'));
  }
}

export async function getAllOrders(): Promise<Order[]> {
  if (isFirebaseConfigured && db) {
    try {
      const col = collection(db, 'orders');
      const snap = await getDocs(col);
      if (!snap.empty) {
        const list: Order[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<Order, 'id'>) }));
        saveOrdersLocally(list);
        return list;
      }
    } catch (e) {
      console.warn('Firestore orders fetch error:', e);
    }
  }
  return getStoredOrders();
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const all = await getAllOrders();
  const found = all.find((o) => o.id === orderId || o.orderNumber === orderId);
  return found || null;
}

export async function createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<Order> {
  const all = await getAllOrders();
  const orderNumber = `VJ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const newOrder: Order = {
    ...orderData,
    id: `ord-${Date.now()}`,
    orderNumber,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  all.unshift(newOrder);
  saveOrdersLocally(all);

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'orders', newOrder.id), newOrder);
    } catch (e) {
      console.error('Firestore createOrder failed:', e);
    }
  }

  return newOrder;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus, internalNotes?: string): Promise<Order | null> {
  const all = await getAllOrders();
  const index = all.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
  if (index === -1) return null;

  const updated: Order = {
    ...all[index],
    status,
    internalNotes: internalNotes ?? all[index].internalNotes,
    updatedAt: new Date().toISOString(),
  };

  all[index] = updated;
  saveOrdersLocally(all);

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'orders', updated.id), {
        status,
        internalNotes: updated.internalNotes,
        updatedAt: updated.updatedAt,
      });
    } catch (e) {
      console.error('Firestore updateOrderStatus failed:', e);
    }
  }

  return updated;
}
