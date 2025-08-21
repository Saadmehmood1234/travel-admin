import type { NextConfig } from "next";

const nextConfig: NextConfig = {
images: {
    domains: ['pixabay.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pixabay.com',
        port: '',
        pathname: '/get/**',
      },
    ],
  },
};

export default nextConfig;
