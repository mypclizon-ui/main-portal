import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config) {
    config.resolve.alias["@"] = __dirname;
    return config;
  },
  async rewrites() {
    // Proxy API calls to the FastAPI backend so the browser never needs to
    // deal with CORS on a different host. Use the deployed API origin in
    // production (api.bdgarmentscareer.com), localhost:8000 during dev.
    const apiOrigin = process.env.API_ORIGIN || "http://localhost:8000";
    return [
      {
        source: "/api/:path*",
        destination: `${apiOrigin}/:path*`,
      },
    ];
  },
};

export default nextConfig;