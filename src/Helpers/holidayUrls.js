export function stripHtmlExt(slug) {
  return slug?.replace(/\.html$/i, '').replace(/\.htm$/i, '') ?? '';
}

export function ensureHtmlExt(slug) {
  if (!slug) return '';
  return `${stripHtmlExt(slug)}.html`;
}

export function holidayCountryPath(countrySlug) {
  return `/holidays/${ensureHtmlExt(countrySlug)}`;
}

export function holidayCityPath(countrySlug, citySlug) {
  return `/holidays/${stripHtmlExt(countrySlug)}/${ensureHtmlExt(citySlug)}`;
}

export function holidayPackagePath(countrySlug, citySlug, packageSlug) {
  return `/holidays/${stripHtmlExt(countrySlug)}/${stripHtmlExt(citySlug)}/${ensureHtmlExt(packageSlug)}`;
}