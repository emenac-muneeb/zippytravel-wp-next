"use client";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import React from "react";

const ArrowIcon = () => (
  <span className="mx-2 text-[#F1A868] text-[13px]">➔</span>
);

const labelMap = {
  "about-us.html": "About Us",
  "contact-us.htm": "Contact Us",
  "privacy-policy.html": "Privacy Policy",
  "terms-and-conditions.html": "Terms & Conditions",
  "cookies-policy.html": "Cookies Policy",
  "profile-page": "Profile",
  "customer-reviews.html": "Reviews",
  "payment-success": "Payment Success",
  "payment-cancel": "Payment Cancelled",
};

const capitalize = (str) =>
  str
    .replace(/-/g, " ")
    .replace(/\.html$|\.htm$/i, "")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export default function useGeneralBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const breadcrumbs = [{ name: "Home", path: "/" }];

  segments.forEach((seg, index) => {
    let path = `/${segments.slice(0, index + 1).join("/")}`;
    if (path.startsWith("/blog")) {
      path += "/";
    }
    const label = labelMap[seg] || capitalize(seg);
    breadcrumbs.push({ name: label, path });
  });

  return (
    <nav className="text-sm">
      <ul className="flex flex-wrap items-center justify-center">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <li key={index} className="flex items-center">
              {!isLast ? (
                <Link
                  href={crumb.path}
                  className="text-[#373737] text-[16px] font-[400] capitalize no-underline"
                >
                  {crumb.name}
                </Link>
              ) : (
                <span className="text-[#F1A868] font-semibold text-[16px] capitalize">
                  {crumb.name}
                </span>
              )}
              {!isLast && <ArrowIcon />}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
