import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        // Website storefront API (not Admin :4000)
        destination: "http://localhost:4001/api/:path*",
      },
    ];
  },
};

export default nextConfig;
