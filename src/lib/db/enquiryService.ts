import {
  GoldSellEnquiry,
  Appointment,
  GeneralEnquiry,
  GoldEnquiryStatus,
} from '@/types';
import { db, isFirebaseConfigured } from '@/lib/firebase/config';
import { collection, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore';

// Initial sample enquiries
let memoryGoldEnquiries: GoldSellEnquiry[] = [
  {
    id: 'gold-enq-1',
    enquiryNumber: 'VJ-GOLD-801',
    customerName: 'Anil Chordiya',
    customerPhone: '+91 94222 11450',
    customerEmail: 'anil.chordiya@example.com',
    itemType: 'Old 22K Broken Haar & 2 Bangles',
    goldPurity: '22K',
    estimatedWeight: 52.5,
    condition: 'Damaged/Scrap',
    approximateAge: '15 Years',
    photos: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80'],
    storePreference: 'Jalgaon Flagship Store',
    estimatedValuation: 343200,
    adminFinalValuation: 345000,
    status: 'Inspection Scheduled',
    adminNotes: 'Customer visiting on Saturday at 2:00 PM for karatmeter testing.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'gold-enq-2',
    enquiryNumber: 'VJ-GOLD-802',
    customerName: 'Kavita Shinde',
    customerPhone: '+91 98901 33221',
    customerEmail: 'kavita.shinde@example.com',
    itemType: 'Ancestral Gold Coins & Rings',
    goldPurity: '24K',
    estimatedWeight: 20.0,
    condition: 'Excellent',
    approximateAge: '25 Years',
    photos: [],
    storePreference: 'Pune Swargate',
    estimatedValuation: 144600,
    status: 'New',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
];

let memoryAppointments: Appointment[] = [
  {
    id: 'apt-1',
    appointmentNumber: 'APT-2026-401',
    customerName: 'Snehal Deshpande',
    customerPhone: '+91 97654 32100',
    customerEmail: 'snehal.d@example.com',
    preferredStoreId: 'store-jalgaon',
    preferredStoreName: 'Jalgaon Flagship Store',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    timeSlot: '02:00 PM - 03:00 PM',
    purpose: 'Wedding Consultation',
    notes: 'Looking for full bridal trousseau including antique choker and wati mangalsutra.',
    status: 'Confirmed',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'apt-2',
    appointmentNumber: 'APT-2026-402',
    customerName: 'Rameshwar Bhalerao',
    customerPhone: '+91 98230 45678',
    customerEmail: 'rameshwar.b@example.com',
    preferredStoreId: 'store-pune',
    preferredStoreName: 'Pune Swargate',
    date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    timeSlot: '04:30 PM - 05:30 PM',
    purpose: 'Gold Exchange',
    notes: 'Exchanging old family ornaments towards new diamond solitaire.',
    status: 'Pending',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

let memoryGeneralEnquiries: GeneralEnquiry[] = [
  {
    id: 'gen-enq-1',
    enquiryNumber: 'ENQ-910',
    customerName: 'Deepak Mahajan',
    customerPhone: '+91 98229 99001',
    customerEmail: 'deepak.m@example.com',
    type: 'Product',
    productSKU: 'VJ-NECK-001',
    productName: 'Aadrika Antique Temple Nakshi Gold Haar',
    message: 'Can this haar length be customized with extra pearls?',
    status: 'In Progress',
    notes: 'Consultant Shraddha contacted via WhatsApp.',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
];

export async function getAllGoldEnquiries(): Promise<GoldSellEnquiry[]> {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('vj_gold_enquiries');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryGoldEnquiries = parsed;
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse gold enquiries:', e);
      }
    }
  }
  return memoryGoldEnquiries;
}

export async function createGoldEnquiry(
  data: Omit<GoldSellEnquiry, 'id' | 'enquiryNumber' | 'createdAt' | 'updatedAt' | 'status'>
): Promise<GoldSellEnquiry> {
  const all = await getAllGoldEnquiries();
  const enquiryNumber = `VJ-GOLD-${Math.floor(100 + Math.random() * 900)}`;
  const item: GoldSellEnquiry = {
    ...data,
    id: `gold-enq-${Date.now()}`,
    enquiryNumber,
    status: 'New',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  all.unshift(item);
  memoryGoldEnquiries = all;
  if (typeof window !== 'undefined') {
    localStorage.setItem('vj_gold_enquiries', JSON.stringify(all));
  }
  return item;
}

export async function updateGoldEnquiry(
  id: string,
  updates: Partial<GoldSellEnquiry>
): Promise<GoldSellEnquiry | null> {
  const all = await getAllGoldEnquiries();
  const index = all.findIndex((e) => e.id === id);
  if (index === -1) return null;

  const updated: GoldSellEnquiry = {
    ...all[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  all[index] = updated;
  memoryGoldEnquiries = all;
  if (typeof window !== 'undefined') {
    localStorage.setItem('vj_gold_enquiries', JSON.stringify(all));
  }
  return updated;
}

export async function getAllAppointments(): Promise<Appointment[]> {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('vj_appointments');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryAppointments = parsed;
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse appointments:', e);
      }
    }
  }
  return memoryAppointments;
}

export async function createAppointment(
  data: Omit<Appointment, 'id' | 'appointmentNumber' | 'createdAt' | 'status'>
): Promise<Appointment> {
  const all = await getAllAppointments();
  const appointmentNumber = `APT-2026-${Math.floor(100 + Math.random() * 900)}`;
  const item: Appointment = {
    ...data,
    id: `apt-${Date.now()}`,
    appointmentNumber,
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };
  all.unshift(item);
  memoryAppointments = all;
  if (typeof window !== 'undefined') {
    localStorage.setItem('vj_appointments', JSON.stringify(all));
  }
  return item;
}

export async function updateAppointmentStatus(
  id: string,
  status: Appointment['status']
): Promise<Appointment | null> {
  const all = await getAllAppointments();
  const index = all.findIndex((a) => a.id === id);
  if (index === -1) return null;

  all[index].status = status;
  memoryAppointments = all;
  if (typeof window !== 'undefined') {
    localStorage.setItem('vj_appointments', JSON.stringify(all));
  }
  return all[index];
}

export async function getAllGeneralEnquiries(): Promise<GeneralEnquiry[]> {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('vj_general_enquiries');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryGeneralEnquiries = parsed;
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse general enquiries:', e);
      }
    }
  }
  return memoryGeneralEnquiries;
}

export async function createGeneralEnquiry(
  data: Omit<GeneralEnquiry, 'id' | 'enquiryNumber' | 'createdAt' | 'status'>
): Promise<GeneralEnquiry> {
  const all = await getAllGeneralEnquiries();
  const enquiryNumber = `ENQ-${Math.floor(100 + Math.random() * 900)}`;
  const item: GeneralEnquiry = {
    ...data,
    id: `gen-enq-${Date.now()}`,
    enquiryNumber,
    status: 'Open',
    createdAt: new Date().toISOString(),
  };
  all.unshift(item);
  memoryGeneralEnquiries = all;
  if (typeof window !== 'undefined') {
    localStorage.setItem('vj_general_enquiries', JSON.stringify(all));
  }
  return item;
}
