import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // SEO optimizations
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // Headers for security and SEO
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
    ];
  },

  // Redirects for SEO
  async redirects() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://travody.com';
    
    return [
      // Redirect www to non-www (or vice versa - adjust based on your preference)
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.travody.com',
          },
        ],
        destination: `${baseUrl}/:path*`,
        permanent: true,
      },
      
      // Redirect trailing slashes to non-trailing (or vice versa)
      {
        source: '/:path+/',
        destination: '/:path+',
        permanent: true,
      },
      
      // Common URL variations and old paths
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/index',
        destination: '/',
        permanent: true,
      },
      {
        source: '/tours',
        destination: '/explore',
        permanent: true,
      },
      {
        source: '/tour',
        destination: '/explore',
        permanent: true,
      },
      {
        source: '/guides',
        destination: '/explore',
        permanent: true,
      },
      {
        source: '/guide',
        destination: '/explore',
        permanent: true,
      },
      {
        source: '/become-a-guide',
        destination: '/become-guide',
        permanent: true,
      },
      {
        source: '/becomeaguide',
        destination: '/become-guide',
        permanent: true,
      },
      {
        source: '/signup',
        destination: '/auth/traveler/signup',
        permanent: false, // Temporary redirect in case you want to change this later
      },
      {
        source: '/login',
        destination: '/auth/traveler/login',
        permanent: false,
      },
      {
        source: '/register',
        destination: '/auth/traveler/signup',
        permanent: false,
      },
      {
        source: '/sign-up',
        destination: '/auth/traveler/signup',
        permanent: false,
      },
      {
        source: '/log-in',
        destination: '/auth/traveler/login',
        permanent: false,
      },
      {
        source: '/about-us',
        destination: '/about',
        permanent: true,
      },
      {
        source: '/contact-us',
        destination: '/contact',
        permanent: true,
      },
      {
        source: '/faqs',
        destination: '/faq',
        permanent: true,
      },
      {
        source: '/frequently-asked-questions',
        destination: '/faq',
        permanent: true,
      },
      {
        source: '/privacy-policy',
        destination: '/privacy',
        permanent: true,
      },
      {
        source: '/terms-of-service',
        destination: '/terms',
        permanent: true,
      },
      {
        source: '/terms-and-conditions',
        destination: '/terms',
        permanent: true,
      },
      {
        source: '/t&c',
        destination: '/terms',
        permanent: true,
      },
      {
        source: '/tnc',
        destination: '/terms',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

