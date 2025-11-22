import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import ToasterProvider from "@/components/ui/ToasterProvider";
import GoogleOAuthProviderWrapper from "@/components/providers/GoogleOAuthProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Travody - Discover India with Local Experts",
  description: "Connect, Explore, Experience - uncover places through those who truly know them.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} font-sans antialiased`} suppressHydrationWarning>
        <GoogleOAuthProviderWrapper>
          <AuthProvider>
            {children}
            <ToasterProvider />
          </AuthProvider>
        </GoogleOAuthProviderWrapper>
      </body>
    </html>
  );
}

