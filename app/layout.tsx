import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Luminary",
  description: "Editor de markdown online",
  openGraph: {
    title: "Luminary",
    description: "Editor de markdown online",
    url: "https://luminary-md.vercel.app",
    siteName: "Luminary",
    images: [
      {
        url: "https://luminary-md.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Texto alternativo de la imagen",
      },
    ],
    locale: "es",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
