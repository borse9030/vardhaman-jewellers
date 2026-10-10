/**
 * Master Authorization Configuration for Vardhaman Jewellers Store Heads & Owners
 *
 * The two primary authorized store owners who have full control over the website are:
 * 1. 7972565911 (Managing Director & Store Head)
 * 2. 7498806028 (Executive Director & Store Head)
 *
 * Plus developer / systems fallback administrator:
 * 3. 9822123456 (Jaynam / Administrator)
 */

export interface OwnerProfile {
  phone: string; // 10-digit clean phone
  name: string;
  roleTitle: string;
  email: string;
  isPrimaryOwner: boolean;
}

export const AUTHORIZED_OWNERS: Record<string, OwnerProfile> = {
  '7972565911': {
    phone: '7972565911',
    name: 'Bhave (Store Owner)',
    roleTitle: 'Managing Director & Store Head',
    email: 'owner1@vardhamanjewellers.com',
    isPrimaryOwner: true,
  },
  '7498806028': {
    phone: '7498806028',
    name: 'Store Head & Co-Owner',
    roleTitle: 'Executive Director & Store Head',
    email: 'owner2@vardhamanjewellers.com',
    isPrimaryOwner: true,
  },
  '9822123456': {
    phone: '9822123456',
    name: 'Jaynam (Administrator)',
    roleTitle: 'Chief Administrator & Systems Head',
    email: 'jaynam27@gmail.com',
    isPrimaryOwner: false,
  },
};

export const OWNER_PHONE_NUMBERS = Object.keys(AUTHORIZED_OWNERS);

/**
 * Normalizes any phone number format (with +91, spaces, dashes) to pure 10 digits
 */
export function normalizePhone10(rawPhone: string): string {
  const digits = (rawPhone || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length > 10) {
    return digits.slice(-10);
  }
  return digits;
}

/**
 * Formats a 10-digit number into Indian phone format: +91 XXXXX XXXXX
 */
export function formatIndianPhone(clean10: string): string {
  if (!clean10 || clean10.length !== 10) return clean10;
  return `+91 ${clean10.slice(0, 5)} ${clean10.slice(5)}`;
}

/**
 * Checks if a given phone number is an authorized store owner / head
 */
export function getOwnerProfile(rawPhone?: string | null): OwnerProfile | null {
  if (!rawPhone) return null;
  const clean = normalizePhone10(rawPhone);
  return AUTHORIZED_OWNERS[clean] || null;
}

export function isAuthorizedOwner(rawPhone?: string | null): boolean {
  return Boolean(getOwnerProfile(rawPhone));
}
