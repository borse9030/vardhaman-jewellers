// Vardhaman Jewellers Core Type Definitions

export type JewelleryType = 'Gold' | 'Diamond' | 'Silver' | 'Platinum' | 'Precious Gemstone';
export type MetalType = 'Yellow Gold' | 'Rose Gold' | 'White Gold' | 'Sterling Silver' | 'Platinum' | 'Two-Tone Gold';
export type GoldPurity = '24K' | '22K' | '18K' | '14K' | '925 Silver';
export type GoldColor = 'Yellow' | 'Rose' | 'White' | 'Two-Tone';
export type MakingChargeType = 'fixed' | 'percentage' | 'perGram';
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'made_to_order';

export interface ProductSpecification {
  key: string;
  value: string;
}

export interface Product {
  id: string;
  SKU: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: string;
  subcategory: string;
  collection: string;
  jewelleryType: JewelleryType;
  metalType: MetalType;
  purity: GoldPurity;
  goldColor: GoldColor;
  grossWeight: number; // in grams
  netGoldWeight: number; // in grams
  stoneWeight: number; // in carats/grams
  stoneType: string; // e.g. "SI-IJ Natural Diamonds", "Kundan & Pearls", "None"
  stonePrice?: number;
  makingChargeType: MakingChargeType;
  makingCharge: number;
  wastagePercentage: number;
  goldRateReference: '24K' | '22K' | '18K' | 'Silver';
  isDynamicPricing: boolean;
  basePrice: number;
  discount: number; // fixed discount amount or percentage
  GST: number; // e.g. 3% standard GST for jewellery
  finalPrice: number;
  compareAtPrice?: number;
  stockStatus: StockStatus;
  stockQuantity: number;
  featured: boolean;
  trending: boolean;
  newArrival: boolean;
  bestSeller: boolean;
  tags: string[];
  specifications: ProductSpecification[];
  images: string[];
  thumbnail: string;
  occasion?: string[];
  gender?: 'Women' | 'Men' | 'Unisex' | 'Kids';
  hallmarkCertified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GoldRates {
  rate24K: number; // per gram in INR
  rate22K: number;
  rate18K: number;
  rateSilver: number;
  rate14K?: number;
  rateSilver1kg?: number;
  effectiveDate: string; // YYYY-MM-DD
  effectiveTime: string; // HH:mm AM/PM
  updatedBy: string;
  source?: string;
  notes?: string;
  lastUpdatedTimestamp: number;
  change24K?: number;
  change22K?: number;
  change18K?: number;
  changeSilver?: number;
}

export interface GoldRateHistoryItem extends GoldRates {
  id: string;
}

export interface PriceBreakdown {
  netGoldWeight: number;
  goldRateApplied: number;
  goldValue: number;
  makingCharges: number;
  wastagePercentage: number;
  wastageAmount: number;
  stoneCharges: number;
  subtotal: number;
  gstPercentage: number;
  gstAmount: number;
  discountAmount: number;
  finalPrice: number;
  isDynamic: boolean;
}

export interface CartItem {
  id: string; // cart item unique id or productId
  productId: string;
  product: Product;
  quantity: number;
  calculatedPrice: number;
  priceBreakdown: PriceBreakdown;
  selectedSize?: string;
  customEngraving?: string;
}

export interface WishlistItem {
  productId: string;
  addedAt: string;
  product: Product;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Payment Processing'
  | 'Paid'
  | 'Processing'
  | 'Ready for Dispatch'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'Refunded';

export type DeliveryMethod = 'home_delivery' | 'store_pickup';
export type PaymentMethod = 'razorpay' | 'upi' | 'card' | 'cod' | 'assisted_purchase';

export interface OrderItem {
  productId: string;
  SKU: string;
  name: string;
  thumbnail: string;
  purity: GoldPurity;
  grossWeight: number;
  quantity: number;
  price: number;
  total: number;
  priceBreakdown: PriceBreakdown;
}

export interface CustomerAddress {
  id?: string;
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: CustomerAddress;
  billingAddress?: CustomerAddress;
  deliveryMethod: DeliveryMethod;
  pickupStoreId?: string;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  couponCode?: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'assisted_request';
  paymentReference?: string;
  giftMessage?: string;
  internalNotes?: string;
  trackingNumber?: string;
  courierPartner?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreLocation {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  address: string;
  pincode: string;
  phone: string;
  email: string;
  workingHours: string;
  googleMapsUrl: string;
  images: string[];
  services: string[]; // e.g. ["Custom Bridal Consultation", "Gold Testing & Buyback", "Diamond Certifications", "Jewellery Spa & Cleaning"]
}

export type AppointmentPurpose =
  | 'Jewellery Shopping'
  | 'Wedding Consultation'
  | 'Custom Design'
  | 'Gold Exchange'
  | 'Repair'
  | 'Valuation';

export interface Appointment {
  id: string;
  appointmentNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  preferredStoreId: string;
  preferredStoreName: string;
  date: string;
  timeSlot: string;
  purpose: AppointmentPurpose;
  notes?: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Rescheduled';
  createdAt: string;
}

export type GoldEnquiryStatus =
  | 'New'
  | 'Contacted'
  | 'Inspection Scheduled'
  | 'Under Evaluation'
  | 'Offer Made'
  | 'Accepted'
  | 'Completed'
  | 'Rejected';

export interface GoldSellEnquiry {
  id: string;
  enquiryNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  itemType: string;
  goldPurity: GoldPurity;
  estimatedWeight: number; // grams
  condition: 'Excellent' | 'Good' | 'Damaged/Scrap' | 'Heirloom';
  approximateAge?: string;
  photos: string[];
  storePreference: string;
  estimatedValuation: number;
  adminFinalValuation?: number;
  status: GoldEnquiryStatus;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GeneralEnquiry {
  id: string;
  enquiryNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  type: 'WhatsApp' | 'Product' | 'Contact' | 'CustomOrder';
  productSKU?: string;
  productName?: string;
  message: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  assignedTo?: string;
  notes?: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  applicableCategories?: string[];
  applicableProducts?: string[];
}

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  tagline: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  isActive: boolean;
  order: number;
}

export interface CustomerReview {
  id: string;
  productId?: string;
  customerName: string;
  city: string;
  rating: number; // 1-5
  comment: string;
  verifiedPurchase: boolean;
  date: string;
}

export interface AuditLog {
  id: string;
  action: string;
  category: 'GoldRate' | 'Product' | 'Order' | 'User' | 'Settings';
  performedBy: string;
  details: string;
  timestamp: string;
}

export type AdminRole = 'super_admin' | 'admin' | 'catalog_manager' | 'order_manager' | 'content_manager' | 'support';

export interface AdminUser {
  uid: string;
  email: string;
  name: string;
  role: AdminRole;
  isActive: boolean;
  phone?: string;
  lastLogin?: string;
}

export interface SiteSettings {
  brandName: string;
  tagline: string;
  contactPhone: string;
  whatsappNumber: string;
  contactEmail: string;
  headOfficeAddress: string;
  gstRate: number; // percentage (e.g. 3)
  freeShippingThreshold: number;
  defaultMakingChargesPercent: number;
  announcementText: string;
  announcementActive: boolean;
}
