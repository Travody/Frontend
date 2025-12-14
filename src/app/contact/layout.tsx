import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Travody. Have questions? We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.',
  keywords: [
    'contact Travody',
    'customer support',
    'travel support',
    'help center',
    'contact travel platform',
  ],
  openGraph: {
    title: 'Contact Us | Travody',
    description: 'Get in touch with Travody. Have questions? We\'d love to hear from you.',
    url: '/contact',
    siteName: 'Travody',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Contact Travody',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | Travody',
    description: 'Get in touch with Travody. Have questions? We\'d love to hear from you.',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: '/contact',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

