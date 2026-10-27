"use client";

import React from "react";
import Link from "next/link";
import { BASE_URL_IMG } from "../Helpers/imageurl";

function CityFareCard({ item, href }) {
  const priceDisplay =
    item.price !== undefined && item.price !== null && Number(item.price) > 0
      ? Math.round(Number(item.price)).toLocaleString()
      : "488";

  const resolvedImg = React.useMemo(() => {
    const raw = item.image_url || item.banner_img?.[0]?.url;
    if (!raw) return "/Photo.png";
    if (raw.startsWith("http") || raw.startsWith("/")) return raw;
    const clean = raw.replace(/^\/?media\//, "");
    return `${BASE_URL_IMG}/media/${clean}`;
  }, [item]);

  // All city cards share the exact same slanted top design from the reference image
  const clipId = "city-card-shape";

  return (
    <div className="w-full max-w-[390px] mx-auto filter drop-shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:drop-shadow-[0_12px_32px_rgba(0,0,0,0.18)] transition-all duration-300">
      <div
        className="w-full h-[280px] sm:h-[305px] relative group cursor-pointer overflow-hidden rounded-[28px]"
        style={{
          clipPath: `url(#${clipId})`,
          WebkitClipPath: `url(#${clipId})`,
        }}
      >
        <Link href={href} className="block w-full h-full relative">
          {/* Background Image */}
          <img
            src={resolvedImg}
            alt={item.image_alt || item.title || "City destination"}
            onError={(e) => {
              e.currentTarget.src = "/Photo.png";
            }}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Dark gradient overlay for bottom text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />

          {/* Bottom Details Section */}
          <div className="absolute bottom-[24px] sm:bottom-[28px] left-[18px] sm:left-[22px] right-[16px] sm:right-[20px] flex items-end justify-between z-10 gap-2 font-poppins">
            {/* Left: "Flights to" + City Name */}
            <div className="flex flex-col text-left min-w-0 flex-1">
              <span className="text-white/95 text-[15px] sm:text-[17px] font-normal leading-tight">
                Flights to
              </span>
              <h3 className="text-white font-medium text-[20px] sm:text-[23px] leading-tight truncate mt-[2px] drop-shadow-sm">
                {item.title}
              </h3>
            </div>

            {/* Right: Price + "Call Us" button */}
            <div className="flex flex-col items-end shrink-0 pl-2">
              <span className="text-white font-medium text-[22px] sm:text-[26px] leading-none">
                £ {priceDisplay}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = "tel:02039232255";
                }}
                className="mt-1.5 px-4 py-1 min-w-[86px] h-[28px] bg-[#1F0060] hover:bg-[#2c0087] text-white font-poppins font-medium text-[12px] rounded-[6px] flex items-center justify-center transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                Call Us
              </button>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default function CountryCityFares({
  cities = [],
  ContinentCities,
  classLabel = "Business Class",
}) {
  const sanitize = (str) =>
    str?.toLowerCase().replace(/\s+/g, "-").replace(/\//g, "") ?? "";

  const sanitizedContinent = sanitize(ContinentCities?.continent?.title);
  const sanitizedCountry = sanitize(ContinentCities?.title);

  const getHref = (item) =>
    `/${sanitizedContinent}/${sanitizedCountry}/${item.slug}`;

  if (!cities.length) return null;

  return (
    <div id="country-city-fares" className="py-2 w-full">
      {/* SVG Definition for the uniform card shape matching the reference image */}
      <svg width="0" height="0" className="absolute pointer-events-none">
        <defs>
          <clipPath id="city-card-shape" clipPathUnits="objectBoundingBox">
            <path d="M 0,0.24 C 0,0.18 0.04,0.16 0.08,0.15 L 0.92,0.00 C 0.96,0.00 1,0.03 1,0.08 L 1,0.92 C 1,0.97 0.96,1 0.92,1 L 0.08,1 C 0.04,1 0,0.97 0,0.92 Z" />
          </clipPath>
        </defs>
      </svg>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 justify-items-center max-w-[1236px] mx-auto">
        {cities.map((item) => (
          <div key={item.id || item.slug} className="w-full flex justify-center">
            <CityFareCard
              item={item}
              href={getHref(item)}
              classLabel={classLabel}
              country={ContinentCities?.title}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
