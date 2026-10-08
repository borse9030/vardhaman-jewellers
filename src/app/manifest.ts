import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Vardhaman Jewellers',
    short_name: 'Vardhaman',
    description: 'Pure Gold, Certified Diamonds & Heritage Jewellery',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF7F2',
    theme_color: '#581825',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '32x32',
        type: 'image/x-icon',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
