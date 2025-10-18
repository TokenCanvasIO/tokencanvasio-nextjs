/** @type {import('next').NextConfig} */

// This variable is automatically provided by Netlify during its build process.
const assetPrefix = process.env.URL || '';

const nextConfig = {
  // This is the crucial part for your Netlify deployment to work correctly.
  assetPrefix: process.env.NODE_ENV === 'production' ? assetPrefix : undefined,

  // This enables React's Strict Mode for development.
  reactStrictMode: true,

  // This allows you to use images from these specific external websites.
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
      },
    ],
  },

  // This adds the CORS headers to fix the "blocked by CORS policy" error
  // during local development.
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "http://localhost:5173", // Your React app's origin
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, OPTIONS, POST, PUT, DELETE",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-Requested-With, Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};

export default nextConfig;