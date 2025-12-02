import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Editor de Markdown",
  description: "Editor de markdown con vista previa",
};

export const fontMono = "Euclid Circular A";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Editor de markdown con vista previa"
        />
        <meta name="author" content="Marklantern" />
        <meta name="keywords" content="editor, markdown, vista previa" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.cdnfonts.com/css/euclid-circular-a"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
