"use client";
import { usePathname, useParams } from "next/navigation";
import { useMemo } from "react";

export default function useAirlineBreadcrumbs() {
    const pathname = usePathname();
    const params = useParams();
    const { airlineSlug } = params;

    const breadcrumbs = [{ name: "Home", path: "/" }];

    breadcrumbs.push({ name: "Airlines", path: "/airlines.htm" });

    if (airlineSlug) {
        breadcrumbs.push({
            name: formatSlug(airlineSlug),
            path: pathname || `/airline/${airlineSlug}`,
        });
    }

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

function formatSlug(slug) {
    return slug
        ?.replace(/-/g, " ")
        .replace(/\.html$/, "")
        .replace(/\b\w/g, (c) => c.toUpperCase());
}
