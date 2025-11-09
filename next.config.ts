import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Optimizaciones para builds más rápidos
  swcMinify: true,
  experimental: {
    // Usar caché de compilación
    turbo: {
      rules: {},
    },
  },
  // Suprimir warnings de hidratación causados por extensiones del navegador
  reactStrictMode: false,
  // Suprimir warnings de hidratación
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ['error', 'warn'],
    } : false,
  },
};

export default nextConfig;
