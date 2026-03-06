import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // reactStrictMode: false,
  devIndicators: false,
  allowedDevOrigins: ["192.168.1.40"],
  // transpilePackages: ["yt-search"],
  // allowedDevOrigins: ["local-origin.dev", "*.local-origin.dev"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "i9.ytimg.com",
      },
    ],
    unoptimized: true,
  },
  reactCompiler: true,
  reactStrictMode: false,
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
};

export default nextConfig;
