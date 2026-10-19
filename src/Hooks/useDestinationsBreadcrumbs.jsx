"use client";
import { usePathname, useParams } from 'next/navigation';

export default function useDestinationBreadcrumbs() {
  const pathname = usePathname();
  const { slug } = useParams();
  const [continentSlug, countrySlug, citySlug] = Array.isArray(slug) ? slug : [slug];

  const breadcrumbs = [{ name: "Home", path: "/" }];
  breadcrumbs.push({ name: "Destinations", path: "/continents.htm" });

  // If we're on the destinations page itself, don't add further breadcrumbs
  const isDestinationsPage = pathname === '/continents.htm';

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

  if (countrySlug) {
    breadcrumbs.push({
      name: formatSlug(countrySlug),
      path: `/${continentSlug}/${countrySlug}`,
    });
  }

  if (citySlug) {
    breadcrumbs.push({
      name: formatSlug(citySlug),
      path: `/${continentSlug}/${countrySlug}/${citySlug}`,
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
