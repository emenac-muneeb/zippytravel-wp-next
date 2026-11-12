/** Fixed URL prefix for city fare pages: /country/{citySlug} */
export const CITY_FARES_PREFIX = "country";

export function isCityFaresPrefix(segment) {
  return String(segment || "")
    .replace(/\.html?$/i, "")
    .toLowerCase() === CITY_FARES_PREFIX;
}

/** Build city fares path, e.g. ghana → /country/ghana */
export function cityFaresPath(citySlug) {
  const slug = String(citySlug || "")
    .trim()
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
  if (!slug) return `/${CITY_FARES_PREFIX}`;
  return `/${CITY_FARES_PREFIX}/${slug}`;
}
