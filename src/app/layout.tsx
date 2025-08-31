import Image from "next/image";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ca">
      <head>
        <title>OCR en Català, Castellà i Anglès  amb Tesseract.js</title>
        <meta name="description" content="Fes OCR a imatges directament al navegador en català, castellà i anglès. Utilitza Tesseract.js. Tot client-side, és a dir totalment privat." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content="OCR, català, castellà, anglès, tesseract.js, reconeixement de text, imatges, navegador" />
        <meta name="author" content="ocr-en-catala.vercel.app" />
        <meta property="og:title" content="OCR en Català, Castellà i Anglès amb Tesseract.js" />
        <meta property="og:description" content="Fes OCR a imatges directament al navegador en català, castellà i anglès. Utilitza Tesseract.js. Tot client-side, és a dir totalment privat." />
        <meta property="og:image" content="https://ocr-en-catala.vercel.app/banner.png" />
        <meta property="og:url" content="https://ocr-en-catala.vercel.app/" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="OCR en Català, Castellà i Anglès amb Tesseract.js" />
        <meta name="twitter:description" content="Fes OCR a imatges directament al navegador en català, castellà i anglès. Utilitza Tesseract.js. Tot client-side, és a dir totalment privat." />
        <meta name="twitter:image" content="https://ocr-en-catala.vercel.app/banner.png" />
      </head>
      <body>
        <main className="max-w-2xl mx-auto px-2 py-6">
          
          {children}
        </main>
      </body>
    </html>
  );
}
