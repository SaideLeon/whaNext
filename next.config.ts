
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Aliasing fluent-ffmpeg to false to prevent it from being bundled on the client
    // This is a workaround because fluent-ffmpeg is a Node.js library
    // and whatsapp-web.js might try to optionally require it.
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'fluent-ffmpeg': false,
      };
    }
    return config;
  },
};

export default nextConfig;
