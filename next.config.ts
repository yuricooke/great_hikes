import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Local dev only: let phones/tablets on the same Wi-Fi open the dev server (http://<mac-ip>:3001).
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*", "*.local"],
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 70, 75],
    // Instagram images served by Behold (official API feeds).
    remotePatterns: [
      { protocol: "https", hostname: "behold.pictures" },
      { protocol: "https", hostname: "cdn2.behold.pictures" },
      // Licensed stock photos chosen by the owner (credited per each service's guidelines).
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "thumb.wikimedia.org" },
      // Approved community photos (Supabase Storage public bucket).
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/community/**" },
      // Gallery photos mirrored from Wikimedia Commons (scripts/mirror-commons.mjs).
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/media/**" },
    ],
  },
};

export default nextConfig;
