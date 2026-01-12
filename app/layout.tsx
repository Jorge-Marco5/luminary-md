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
      <head>
        <link
          href="https://fonts.cdnfonts.com/css/euclid-circular-a"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
