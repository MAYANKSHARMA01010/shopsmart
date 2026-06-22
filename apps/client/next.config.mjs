/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://backend:5001"}/api/:path*`,
      },
    ];
  },
  images: {
    // Allow any HTTPS host (needed for external product images)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Cache external images for 1 hour in Next.js image cache
    minimumCacheTTL: 3600,
  },
};

export default nextConfig;
