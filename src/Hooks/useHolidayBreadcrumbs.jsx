"use client";
import { usePathname } from "next/navigation";
import {
  holidayCityPath,
  stripHtmlExt,
} from "../Helpers/holidayUrls";

export default function useHolidayBreadcrumbs() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);

  const breadcrumbs = [{ name: "Home", path: "/" }];
  breadcrumbs.push({ name: "Holidays", path: "/holidays.html" });

  if (parts[0] !== "holidays") {
    return renderBreadcrumbs(breadcrumbs);
  }

  const countrySlug = parts[1];
  const citySlug = parts[2];
  const packageSlug = parts[3];

  // Package Detail
  if (packageSlug) {
    if (citySlug) {
      breadcrumbs.push({
        name: formatSlug(citySlug),
        path: holidayCityPath(countrySlug, citySlug),
      });
    }

    breadcrumbs.push({
      name: truncate(formatSlug(packageSlug), 43),
      path: pathname,
    });
  }
  // City Page
  else if (citySlug) {
    breadcrumbs.push({
      name: formatSlug(countrySlug),
      path: `/holidays/${countrySlug}.html`,
    });

    breadcrumbs.push({
      name: formatSlug(citySlug),
      path: holidayCityPath(countrySlug, citySlug),
    });
  }
  // Country Page
  else if (countrySlug) {
    breadcrumbs.push({
      name: formatSlug(countrySlug),
      path: `/holidays/${countrySlug}.html`,
    });
  }

  return renderBreadcrumbs(breadcrumbs);
}

function renderBreadcrumbs(breadcrumbs) {
  return (
    <nav className="text-sm py-2">
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

function formatSlug(slug) {
  return stripHtmlExt(slug)
    ?.replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function truncate(text, maxLength = 43) {
  if (!text) return "";
  return text.length > maxLength
    ? `${text.slice(0, maxLength)}...`
    : text;
}