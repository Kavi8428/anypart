import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  experimental: {
    serverActions: {
      bodySizeLimit: '110mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.payhere.lk',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
