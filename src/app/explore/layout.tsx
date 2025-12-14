import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore Tours & Guides',
  description: 'Search and discover verified local guides and unique tour experiences across India. Find the perfect guide or tour plan for your next adventure.',
  keywords: [
    'find tour guide',
    'search guides India',
    'tour search',
    'local guides search',
    'India tour booking',
    'guide finder',
    'tour discovery',
  ],
  openGraph: {
    title: 'Explore Tours & Guides | Travody',
    description: 'Search and discover verified local guides and unique tour experiences across India.',
    url: '/explore',
    siteName: 'Travody',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Explore Tours & Guides on Travody',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Explore Tours & Guides | Travody',
    description: 'Search and discover verified local guides and unique tour experiences across India.',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: '/explore',
  },
};

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

