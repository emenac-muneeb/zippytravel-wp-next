/**
 * Keep image URLs same-origin and relative so Next/Image treats
 * them as local paths (allowing rewrites/proxy to admin).
 */
export const BASE_URL_IMG = "";

const NORMALIZABLE_HOSTS = new Set([
  "admin.premierflights.co.uk",
  "new.premierflights.co.uk",
]);

const NORMALIZABLE_PREFIXES = [
  "/media/",
  "/assets/",
  "/frontend-icons/",
  "/storage/",
  "/editor-media/",
  "/blog/wp-content/uploads/",
];

/**
 * Convert known CMS absolute image URLs to same-origin relative paths.
 * Keeps external third-party image URLs unchanged.
 */
export function normalizeFrontendImageSrc(url) {
  if (!url || typeof url !== "string") return "";
  if (url.startsWith("/")) return url;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname || "";
    const shouldNormalize =
      NORMALIZABLE_HOSTS.has(host) &&
      NORMALIZABLE_PREFIXES.some((prefix) => pathname.startsWith(prefix));

    if (!shouldNormalize) return url;
    return `${pathname}${parsed.search || ""}`;
  } catch {
    return url;
  }
}

/** Apex, www, staging, or CMS typo host `stagging.` + /blog/wp-content/uploads/… → same-origin path; Next rewrite → admin. */
const EMENAC_BLOG_UPLOADS_RE =
  /^https?:\/\/(?:(?:www|staging|stagging|admin)\.)?emenactravel\.co\.uk(\/blog\/wp-content\/uploads\/[^?\s"'#]*)/i;

const EMENAC_BLOG_UPLOADS_GLOBAL_RE =
  /https?:\/\/(?:(?:www|staging|stagging|admin)\.)?emenactravel\.co\.uk(\/blog\/wp-content\/uploads\/[^"'\s<>]*)/gi;

/**
 * Map stored Emenac blog upload URLs to same-origin `/blog/wp-content/uploads/…` so rewrites fetch from admin.
 * Any other URL is returned unchanged.
 */
export function resolveBlogUploadSrc(url) {
  if (!url || typeof url !== "string") return "";
  const normalized = normalizeFrontendImageSrc(url);
  const m = normalized.match(EMENAC_BLOG_UPLOADS_RE);
  if (m) return m[1];
  return normalized;
}

/**
 * CommonHeroSection: legacy `${BASE_URL_IMG}/${url}` except Emenac blog upload URLs → same-origin upload path.
 */
export function resolveCommonHeroBannerSrc(url) {
  if (!url || typeof url !== "string") return "";
  const normalized = normalizeFrontendImageSrc(url);
  const m = normalized.match(EMENAC_BLOG_UPLOADS_RE);
  if (m) return m[1];
  return `${BASE_URL_IMG}/${normalized.replace(/^\/+/, "")}`;
}

/** Post body HTML: matching Emenac blog upload URLs → same-origin path */
export function rewriteBlogUploadUrlsInHtml(html) {
  if (!html || typeof html !== "string") return "";
  const absoluteCmsImageRe =
    /https?:\/\/(?:admin\.premierflights\.co\.uk|new\.premierflights\.co\.uk|(?:www|staging|stagging)\.emenactravel\.co\.uk|emenactravel\.co\.uk)(\/(?:media|assets|frontend-icons|storage|editor-media|blog\/wp-content\/uploads)\/[^"'\s<>]*)/gi;
  let processed = html
    .replace(EMENAC_BLOG_UPLOADS_GLOBAL_RE, "$1")
    .replace(absoluteCmsImageRe, "$1");
  // Add loading="lazy" and decoding="async" to <img> tags if they don't already specify loading
  processed = processed.replace(/<img\s+(?![^>]*\bloading\s*=)([^>]+)>/gi, '<img loading="lazy" decoding="async" $1>');
  return processed;
}
