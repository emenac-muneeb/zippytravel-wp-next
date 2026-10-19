"use client";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

const useUmrahPackageBreadcrumbs = (umrahTitle) => {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    const list = [{ name: "Home", path: "/" }];
    list.push({ name: "Umrah Packages", path: "/umrah-packages.html" });

    const pathParts = pathname
      .replace(/^\/|\/$/g, "")
      .split("/")
      .filter(Boolean);

    let cumulativePath = "";
    pathParts.forEach((part, idx) => {
      cumulativePath += "/" + part;

      if (part === "umrah") return;
      if (part === "umrah-packages.html") return;

      list.push({
        name: idx === pathParts.length - 1 && umrahTitle ? umrahTitle : formatSlug(part),
        path: cumulativePath,
      });
    });
    return list;
  }, [pathname, umrahTitle]);

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
};

function formatSlug(slug) {
  return slug
    ?.replace(/-/g, " ")
    .replace(/\.html$/, "")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default useUmrahPackageBreadcrumbs;
