"use client";
import { usePathname, useParams } from 'next/navigation';

export default function useDestinationBreadcrumbs() {
  const pathname = usePathname();
  const { slug } = useParams();
  // 2-step destinations: [continentSlug, citySlug]
  // Legacy 3-segment URLs: [continentSlug, oldCountrySlug, citySlug] → use first + last
  const segments = Array.isArray(slug) ? slug : [slug].filter(Boolean);
  const continentSlug = segments[0];
  const citySlug =
    segments.length >= 3 ? segments[segments.length - 1] : segments[1];

  const breadcrumbs = [{ name: "Home", path: "/" }];
  breadcrumbs.push({ name: "Destinations", path: "/continents.htm" });

  // If we're on the destinations page itself, don't add further breadcrumbs
  const isDestinationsPage = pathname === '/continents.htm' || pathname === '/continents';

  if (continentSlug && !isDestinationsPage) {
    // Continent pages use admin slug (flights-to-africa); nested paths use title slug (africa)
    const continentPath = continentSlug.startsWith('flights-to-')
      ? `/${continentSlug}`
      : `/flights-to-${continentSlug}`;
    breadcrumbs.push({
      name: formatSlug(continentSlug),
      path: continentPath,
    });
  }

  if (citySlug && continentSlug) {
    breadcrumbs.push({
      name: formatSlug(citySlug),
      path: `/${continentSlug}/${citySlug}`,
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
