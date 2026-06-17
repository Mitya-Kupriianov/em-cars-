import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Частичный CSP: только директивы, не зависящие от доменов скриптов
// (Clerk/Supabase), поэтому они безопасны и ничего не ломают.
//   object-src 'none'      — блокирует <object>/<embed>/плагины
//   base-uri 'self'        — запрещает подмену <base> (вектор XSS/угона ссылок)
//   frame-ancestors 'self' — анти-кликджекинг (современный аналог X-Frame-Options)
//   upgrade-insecure-requests — апгрейд http→https (только в проде)
// Полный script-src/connect-src lockdown через proxy.ts + nonce — отдельной
// задачей ПОСЛЕ перевода Clerk на production-инстанс (домены скриптов сменятся).
const contentSecurityPolicy = [
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'self'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "electro-motors.top",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "*.autoimg.cn",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
        ],
      },
    ];
  },
};

export default nextConfig;
