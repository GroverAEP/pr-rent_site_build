import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LocalVista | Locales Comerciales con Recorrido 3D en Perú",
  description:
    "Plataforma para explorar, publicar y contactar sobre locales comerciales en alquiler, venta y traspaso con recorrido 3D inmersivo del interior.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${sora.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col font-sans antialiased bg-[#F6F7F9] text-[#0F172A]">
        {children}
      </body>
    </html>
  );
}
