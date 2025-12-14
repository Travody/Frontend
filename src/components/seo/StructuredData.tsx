import Script from 'next/script';

interface OrganizationSchema {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
  contactPoint?: {
    '@type': string;
    telephone?: string;
    contactType: string;
    areaServed?: string;
    availableLanguage?: string[];
  };
}

interface WebsiteSchema {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  potentialAction: {
    '@type': string;
    target: {
      '@type': string;
      urlTemplate: string;
    };
    'query-input': string;
  };
}

interface BreadcrumbSchema {
  '@context': string;
  '@type': string;
  itemListElement: Array<{
    '@type': string;
    position: number;
    name: string;
    item?: string;
  }>;
}

interface StructuredDataProps {
  type?: 'organization' | 'website' | 'breadcrumb' | 'custom';
  data?: OrganizationSchema | WebsiteSchema | BreadcrumbSchema | Record<string, unknown>;
}

export default function StructuredData({ type = 'organization', data }: StructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://travody.com';

  const defaultOrganizationSchema: OrganizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Travody',
    url: baseUrl,
    description: 'Discover India with Local Experts - Connect, Explore, Experience',
    sameAs: [
      // Add your social media links here
      // 'https://www.facebook.com/travody',
      // 'https://www.twitter.com/travody',
      // 'https://www.instagram.com/travody',
      // 'https://www.linkedin.com/company/travody',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi'],
    },
  };

  const defaultWebsiteSchema: WebsiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Travody',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/explore?location={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  let schema: Record<string, unknown>;

  if (data) {
    schema = data as Record<string, unknown>;
  } else if (type === 'organization') {
    schema = defaultOrganizationSchema as unknown as Record<string, unknown>;
  } else if (type === 'website') {
    schema = defaultWebsiteSchema as unknown as Record<string, unknown>;
  } else {
    schema = defaultOrganizationSchema as unknown as Record<string, unknown>;
  }

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

