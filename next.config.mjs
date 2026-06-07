/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  // Allowlist local dev origins to avoid cross-origin dev warnings
  // Add any other dev host:port combos you use (e.g. LAN IPs)
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.1.104:3000",
  ],
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
};

export default nextConfig;
