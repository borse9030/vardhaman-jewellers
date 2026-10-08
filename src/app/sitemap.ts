import { MetadataRoute } from 'next';
import { getAllProducts } from '@/lib/db/productService';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vardhamanjewellers.in';
  const products = await getAllProducts();

  const staticRoutes = [
    '',
    '/shop',
    '/gold',
    '/diamond',
    '/silver',
    '/necklaces',
    '/bangles',
    '/earrings',
    '/rings',
    '/mangalsutra',
    '/pendants',
    '/chains',
    '/wedding',
    '/daily-wear',
    '/gifting',
    '/collections',
    '/gold-rate',
    '/sell-gold',
    '/stores',
    '/book-appointment',
    '/about',
    '/contact',
    '/faq',
    '/gold-buying-guide',
    '/privacy',
    '/terms',
    '/shipping',
    '/returns',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  const productRoutes = products.map((p) => ({
    url: `${baseUrl}/product/${p.slug}`,
    lastModified: new Date(p.updatedAt || new Date()),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...productRoutes];
}
