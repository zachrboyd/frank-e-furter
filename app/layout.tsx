import type { Metadata } from "next";
import {
  Bungee_Inline,
  Special_Elite,
  Cabin_Sketch,
  IBM_Plex_Sans,
  Permanent_Marker,
  Shadows_Into_Light,
} from "next/font/google";
import "./globals.css";

const bungeeInline = Bungee_Inline({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bungee",
  display: "swap",
});

const specialElite = Special_Elite({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-special-elite",
  display: "swap",
});

const cabinSketch = Cabin_Sketch({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-cabin-sketch",
  display: "swap",
});

const ibmPlex = IBM_Plex_Sans({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-ibm-plex",
  display: "swap",
});

const permanentMarker = Permanent_Marker({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-permanent-marker",
  display: "swap",
});

const shadowsIntoLight = Shadows_Into_Light({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-shadows",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Frank E. Furter's Lead Dogs & Dog Leads",
  description:
    "Serving piping hot ADA lawsuit leads. A food-truck-themed lead generation tool that surfaces companies recently sued for website accessibility violations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bungeeInline.variable} ${specialElite.variable} ${cabinSketch.variable} ${ibmPlex.variable} ${permanentMarker.variable} ${shadowsIntoLight.variable}`}
    >
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
