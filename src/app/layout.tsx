import type { Metadata } from "next";
import { Fraunces, Outfit, Plus_Jakarta_Sans, DM_Sans } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["300", "600", "700"],
  display: "swap",
  style: ["normal", "italic"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "digiRestau — Make Your Restaurant Digital | Free Digital Menu",
  description: "Create a digital menu for your restaurant. Take orders via QR code, track in real-time. Trusted by 200+ restaurants. Start for free!",
  keywords: ["digital menu", "restaurant", "QR code", "order management", "digiRestau", "Indian restaurant", "free menu"],
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
    shortcut: "/favicon.png",
  },
  openGraph: {
    title: "digiRestau — Make Your Restaurant Digital",
    description: "Create a digital menu for your restaurant. Take orders via QR code, track in real-time. Trusted by 200+ restaurants. Start for free!",
  },
};

import { RestaurantProvider } from "@/lib/restaurant-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning 
      style={{ 
        '--font-fraunces': fraunces.style.fontFamily,
        '--font-outfit': outfit.style.fontFamily,
        '--font-heading': plusJakarta.style.fontFamily,
        '--font-sans': dmSans.style.fontFamily,
      } as React.CSSProperties}>
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="shortcut icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('digirestau_theme') || 'light';
                document.documentElement.setAttribute('data-theme', theme);
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="font-sans antialiased bg-gray-50 text-gray-900 transition-colors duration-300">
        <RestaurantProvider>
          {children}
        </RestaurantProvider>
      </body>
    </html>
  );
}
