/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  // Inject SOURCE_COMMIT from Coolify as a public environment variable
  env: {
    NEXT_PUBLIC_COMMIT_HASH: process.env.SOURCE_COMMIT,
  },

  // distDir: "build",
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" }, // allow all origins
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT,OPTIONS" },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
          },
          { key: "Access-Control-Max-Age", value: "86400" }, // 24 hours
        ],
      },
    ];
  },
};

export default nextConfig;
