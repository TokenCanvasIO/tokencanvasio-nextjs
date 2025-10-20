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
  
  // Update CORS to allow your production domain
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*", // Or specifically: "https://xrpmemecoins.com"
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