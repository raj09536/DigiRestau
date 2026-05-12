import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.pinimg.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: 'supabase.co' }, // General supabase
      { protocol: 'https', hostname: '**.supabase.co' }, // Subdomain supabase
    ],
  },
};

export default nextConfig;
