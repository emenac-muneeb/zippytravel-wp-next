"use client";
import { usePathname, useParams } from 'next/navigation';
import { CITY_FARES_PREFIX, cityFaresPath, isCityFaresPrefix } from '../Helpers/destinationUrls';

export default function useDestinationBreadcrumbs() {
  const pathname = usePathname();
  const { slug } = useParams();
  // City fares: [country, citySlug]
  // Continent pages: [flights-to-africa] etc.
  const segments = Array.isArray(slug) ? slug : [slug].filter(Boolean);
  const firstSlug = segments[0];
  const citySlug =
    segments.length >= 2 ? segments[segments.length - 1] : null;

  const breadcrumbs = [{ name: "Home", path: "/" }];
  breadcrumbs.push({ name: "Destinations", path: "/continents" });

  const isDestinationsPage = pathname === '/continents.htm' || pathname === '/continents' || pathname === '/continents/';

  if (firstSlug && !isDestinationsPage) {
    if (isCityFaresPrefix(firstSlug)) {
      breadcrumbs.push({
        name: "Country",
        path: `/${CITY_FARES_PREFIX}`,
      });
    } else {
      const continentPath = firstSlug.startsWith('flights-to-')
        ? `/${firstSlug}`
        : `/flights-to-${firstSlug}`;
      breadcrumbs.push({
        name: formatSlug(firstSlug),
        path: continentPath,
      });
    }
  }

  if (citySlug && firstSlug && isCityFaresPrefix(firstSlug)) {
    breadcrumbs.push({
      name: formatSlug(citySlug),
      path: cityFaresPath(citySlug),
    });
  } else if (citySlug && firstSlug && !isCityFaresPrefix(firstSlug) && segments.length >= 2) {
    breadcrumbs.push({
      name: formatSlug(citySlug),
      path: `/${firstSlug}/${citySlug}`,
    });
  }

  return <BreadcrumbList breadcrumbs={breadcrumbs} />;
}

function formatSlug(slug) {
  return slug
    ?.replace("flights-to-", "")
    ?.replace(/-/g, " ")
    ?.replace(/\.html$/, "")
    ?.replace(/\b\w/g, (c) => c.toUpperCase());
}

function BreadcrumbList({ breadcrumbs }) {
  return (
    <nav className="text-sm">
      <ul className="flex flex-wrap items-center">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <li key={index} className="flex items-center">
              {!isLast ? (
                <a
                  href={crumb.path}
                  className="text-[#d92938] font-semibold capitalize"
                >
                  {crumb.name}
                </a>
              ) : (
                <span className="text-[#d92938] font-bold capitalize">
                  {crumb.name}
                </span>
              )}
              {!isLast && (
                <span className="mx-2 text-[#d92938] text-[13px]">➔</span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
