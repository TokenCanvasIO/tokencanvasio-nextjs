/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.coingecko.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.bithomp.com',
      },
      {
        protocol: 'https',
        hostname: 'coin-images.coingecko.com',
      }
    ],
  },
};

export default nextConfig;