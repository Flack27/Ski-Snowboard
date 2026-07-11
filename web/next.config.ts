import type { NextConfig } from "next";

// Allow next/image to load product photos served by PocketBase (/api/files/**).
const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090";
const pb = new URL(pbUrl);

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: pb.protocol.replace(":", "") as "http" | "https",
        hostname: pb.hostname,
        port: pb.port || "",
        pathname: "/api/files/**",
      },
    ],
  },
};

export default nextConfig;
