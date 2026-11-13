// T1.2 - replace the hardcoded localhost:8000 rewrite.
// Adapt to next.config.mjs / .ts if that is what the repo uses.
// NOTE: rewrites() is evaluated at build time, so API_BASE_URL must exist
// as a build-time env var on the frontend service.
const API_BASE_URL = process.env.API_BASE_URL;

if (process.env.NODE_ENV === "production" && !API_BASE_URL) {
  throw new Error(
    "API_BASE_URL must be set for production builds, e.g. https://voice-roots-api.onrender.com"
  );
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ["images.unsplash.com", "api.qrserver.com"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(self), geolocation=(), interest-cohort=()",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
      {
        source: "/audio/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "Accept-Ranges",
            value: "bytes",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${API_BASE_URL || "http://localhost:8000"}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
