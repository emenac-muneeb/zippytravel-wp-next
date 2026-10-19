/** @type {import('next').NextConfig} */
const SITEMAP_API_BASE =
  process.env.SITEMAP_API_BASE ?? "https://admin.premierflights.co.uk/api";

/** Proxies blog media: public path stays /blog/wp-content/uploads/… on this host; origin pull from admin. */
const ADMIN_BLOG_UPLOADS =
  "https://admin.premierflights.co.uk/blog/wp-content/uploads";
const ADMIN_BASE_ORIGIN = "https://admin.premierflights.co.uk";

/** Vercel production only — avoids pinning HSTS on preview URLs. */
const isVercelProduction = process.env.VERCEL_ENV === "production";

const isDev = process.env.NODE_ENV === "development";

/**
 * Balanced CSP: CMS-injected scripts (ScriptInjector) need `unsafe-inline` + `https:` for script-src.
 * `unsafe-eval` is development-only so React Fast Refresh / devtools can run (not used in production).
 */
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: https://*.tawk.to https://*.clickconnector.app"
    : "script-src 'self' 'unsafe-inline' https: https://*.tawk.to https://*.clickconnector.app",

  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://embed.tawk.to https://form-assets.mailchimp.com https://*.clickconnector.app",
  "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com https://embed.tawk.to https://form-assets.mailchimp.com https://*.clickconnector.app",

  "img-src 'self' data: blob: https: https://images.dmca.com https://www.dmca.com",

  "font-src 'self' https://fonts.gstatic.com https://embed.tawk.to data:",

  "connect-src 'self' https: wss: https://*.tawk.to https://*.clickconnector.app",

  "frame-src https: https://*.tawk.to https://*.clickconnector.app",

  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https:",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
  "worker-src 'self' blob:",
].join("; ");

const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  async headers() {
    const headers = [
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "X-Frame-Options",
        value: "SAMEORIGIN",
      },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "Permissions-Policy",
        value:
          "camera=(), microphone=(), geolocation=(), interest-cohort=()",
      },
      {
        key: "Content-Security-Policy",
        value: CONTENT_SECURITY_POLICY,
      },
    ];

    if (isVercelProduction) {
      headers.unshift({
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains",
      });
    }

    /** Keep crawlers from indexing build chunks / static files as standalone pages. */
    const noIndexRobots = [
      {
        key: "X-Robots-Tag",
        value: "noindex, nofollow",
      },
    ];

    return [
      {
        source: "/:path*",
        headers,
      },
      // Next.js hashed JS/CSS/font/media chunks under `/_next/static/`
      {
        source: "/_next/static/:path*",
        headers: noIndexRobots,
      },
      // Image optimizer responses (not content pages)
      {
        source: "/_next/image",
        headers: noIndexRobots,
      },
      // Loose public scripts / stylesheets / source maps
      {
        source: "/:path*\\.js",
        headers: noIndexRobots,
      },
      {
        source: "/:path*\\.css",
        headers: noIndexRobots,
      },
      {
        source: "/:path*\\.map",
        headers: noIndexRobots,
      },
      // API responses should not appear in search results
      {
        source: "/api/:path*",
        headers: noIndexRobots,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/media/:path*",
        destination: `${ADMIN_BASE_ORIGIN}/media/:path*`,
      },
      {
        source: "/assets/:path*",
        destination: `${ADMIN_BASE_ORIGIN}/assets/:path*`,
      },
      {
        source: "/frontend-icons/:path*",
        destination: `${ADMIN_BASE_ORIGIN}/frontend-icons/:path*`,
      },
      {
        source: "/storage/:path*",
        destination: `${ADMIN_BASE_ORIGIN}/storage/:path*`,
      },
      {
        source: "/editor-media/:path*",
        destination: `${ADMIN_BASE_ORIGIN}/editor-media/:path*`,
      },
      {
        source: "/blog/wp-content/uploads/:path*",
        destination: `${ADMIN_BLOG_UPLOADS}/:path*`,
      },
      {
        source: "/sitemap.xml",
        destination: `${SITEMAP_API_BASE}/generate-sitemap`,
      },
      {
        source: "/post-sitemap.xml",
        destination: `${SITEMAP_API_BASE}/generate-post-sitemap`,
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [70, 75],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "@heroicons/react"],
  },
};

export default nextConfig;
