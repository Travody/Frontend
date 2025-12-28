import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import ToasterProvider from "@/components/ui/ToasterProvider";
import ToastProviderWrapper from "@/components/providers/ToastProviderWrapper";
import GoogleOAuthProviderWrapper from "@/components/providers/GoogleOAuthProvider";
import StructuredData from "@/components/seo/StructuredData";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://travody.com'),
  title: {
    default: "Travody - Discover India with Local Experts",
    template: "%s | Travody"
  },
  description: "Connect, Explore, Experience - uncover places through those who truly know them. Book verified local guides and unique tour experiences across India.",
  keywords: [
    "travel India",
    "local guides India",
    "tour guides",
    "India travel experiences",
    "authentic India tours",
    "local experts",
    "travel booking",
    "India tourism",
    "guided tours",
    "cultural experiences India"
  ],
  authors: [{ name: "Travody" }],
  creator: "Travody",
  publisher: "Travody",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "Travody",
    title: "Travody - Discover India with Local Experts",
    description: "Connect, Explore, Experience - uncover places through those who truly know them. Book verified local guides and unique tour experiences across India.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Travody - Discover India with Local Experts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Travody - Discover India with Local Experts",
    description: "Connect, Explore, Experience - uncover places through those who truly know them.",
    images: ["/og-image.jpg"],
    creator: "@travody",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification codes here when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // yahoo: "your-yahoo-verification-code",
  },
  alternates: {
    canonical: "/",
  },
  category: "travel",
  icons: {
    icon: [
      { url: "/favicon.svg", sizes: "32x32", type: "image/svg+xml" },
      { url: "/favicon.svg", sizes: "16x16", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/favicon.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} font-sans antialiased`} suppressHydrationWarning>
        <StructuredData type="organization" />
        <GoogleOAuthProviderWrapper>
          <AuthProvider>
            <NotificationProvider>
            <ToastProvider>
              <ToastProviderWrapper>
                {children}
                <ToasterProvider />
              </ToastProviderWrapper>
            </ToastProvider>
            </NotificationProvider>
          </AuthProvider>
        </GoogleOAuthProviderWrapper>
      </body>
    </html>
  );
}

