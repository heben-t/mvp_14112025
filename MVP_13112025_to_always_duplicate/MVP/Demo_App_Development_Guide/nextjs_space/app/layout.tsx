import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import GlobalStyles from "./global-styles";
import { ThemeProvider } from "@/components/theme-provider";
import Chatbot from "@/components/chatbot";
import { Providers } from "@/components/providers";
import Navigation from "@/components/navigation";
import { CookieConsent } from "@/components/legal/cookie-consent";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "HEBED AI - AI-Powered ROI Analytics for Startups & Investors",
  description: "Real-time AI ROI tracking and investment intelligence platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={plusJakarta.className}>
        <GlobalStyles />
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <Navigation />
            {children}
            <Chatbot />
            <CookieConsent />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
