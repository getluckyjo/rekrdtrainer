import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

/* next/font self-hosts these and emits the CSS variables the design system
   already expects, which also kills the FOUT the original @import had. */
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-accent",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://coach.rekrd.io"),
  title: {
    default: "REKRD Ambassador Programme — get sponsored, and earn",
    template: "%s · REKRD Ambassador Programme",
  },
  description:
    "Recommend REKRD with your own code. Your clients get 10% off, you earn 15% of everything they spend — including every subscription renewal. Free to join, no stock, no minimum.",
  openGraph: {
    title: "REKRD Ambassador Programme",
    description:
      "Your clients get 10% off. You earn 15% of everything they spend. Free to join, nothing to buy.",
    type: "website",
    locale: "en_ZA",
  },
};

export const viewport: Viewport = {
  themeColor: "#F4F1EB",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-ZA"
      className={`${archivo.variable} ${instrumentSerif.variable} ${plexMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
