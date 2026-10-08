import type { Metadata } from 'next';
import { Cormorant_Garamond, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { GoldRateProvider } from '@/context/GoldRateContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { AuthProvider } from '@/context/AuthContext';
import CartDrawer from '@/components/cart/CartDrawer';
import FloatingConcierge from '@/components/chat/FloatingConcierge';

const serifFont = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const sansFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Vardhaman Jewellers | Pure Gold, Certified Diamonds & Heritage Jewellery',
  description:
    'Experience the epitome of luxury Indian jewellery with Vardhaman Jewellers. Explore 22K BIS Hallmarked gold haars, uncut kundan chokers, certified diamond solitaires, and sacred Maharashtrian wedding trousseau.',
  keywords: [
    'Vardhaman Jewellers',
    'Gold Jewellery',
    'Diamond Jewellery',
    'Maharashtra Jewellery',
    'Khandesh Jewellers',
    '22K Gold Rate Today',
    'Temple Jewellery',
    'Wati Mangalsutra',
    'Patlya Bangles',
    'BIS 916 Hallmark',
  ],
  authors: [{ name: 'Vardhaman Jewellers' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.png', type: 'image/png' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: 'Vardhaman Jewellers | Pure Gold, Certified Diamonds & Heritage Jewellery',
    description:
      'Timeless elegance, crafted for generations. Explore authentic 22K hallmarked gold and certified diamonds.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Vardhaman Jewellers',
    images: [
      {
        url: '/logo.png',
        width: 1024,
        height: 680,
        alt: 'Vardhaman Jewellers Official Brand Logo',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Schema.org Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JewelryStore',
    name: 'Vardhaman Jewellers',
    logo: 'https://vardhamanjewellers.in/logo.png',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80',
    '@id': 'https://vardhamanjewellers.in',
    url: 'https://vardhamanjewellers.in',
    telephone: '+91 257 222 4589',
    priceRange: '₹₹₹₹',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'MG Road, Near Golani Market',
      addressLocality: 'Jalgaon',
      addressRegion: 'Maharashtra',
      postalCode: '425001',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 21.0077,
      longitude: 75.5626,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '10:00',
        closes: '20:30',
      },
    ],
  };

  return (
    <html lang="en" className={`${serifFont.variable} ${sansFont.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-[#FAF7F2] text-[#2B2625] antialiased selection:bg-[#581825] selection:text-[#FAF7F2]">
        <LanguageProvider>
          <GoldRateProvider>
            <CartProvider>
              <WishlistProvider>
                <AuthProvider>
                  {children}
                  <CartDrawer />
                  <FloatingConcierge />
                </AuthProvider>
              </WishlistProvider>
            </CartProvider>
          </GoldRateProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
