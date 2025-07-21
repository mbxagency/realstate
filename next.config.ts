import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['puppeteer'],
  images: {
    domains: [
      'www.vivareal.com.br',
      'www.zapimoveis.com.br',
      'www.imovelweb.com.br',
      'www.olx.com.br',
      'www.chavesnamao.com.br',
      'www.webcasas.com.br',
      'imoveis.mercadolivre.com.br',
      'www.jbaimoveis.com.br',
      'via.placeholder.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/search',
        destination: '/api/search',
      },
    ];
  },
};

export default nextConfig;
