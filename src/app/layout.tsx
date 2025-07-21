import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MBX Imobiliária - O Google dos Imóveis",
  description: "Encontre imóveis em todos os principais portais do Brasil: VivaReal, Zap Imóveis, Imovelweb, OLX, Chaves na Mão, WebCasas, Mercado Livre e mais. Busca unificada com filtros avançados.",
  keywords: "imóveis, busca imóveis, apartamento, casa, venda, aluguel, VivaReal, Zap Imóveis, Imovelweb, OLX, MBX",
  authors: [{ name: "MBX Imobiliária" }],
  openGraph: {
    title: "MBX Imobiliária - O Google dos Imóveis",
    description: "Encontre imóveis em todos os principais portais do Brasil com uma única busca",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "MBX Imobiliária - O Google dos Imóveis",
    description: "Encontre imóveis em todos os principais portais do Brasil com uma única busca",
  },
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
