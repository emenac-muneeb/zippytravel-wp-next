"use client";

import React from "react";
import Link from "next/link";
import { BASE_URL_IMG } from "../Helpers/imageurl";

function CityFareCard({ item, href, classLabel = "Business Class", country }) {
  const priceDisplay = item.price !== undefined && item.price !== null
    ? Math.round(item.price).toLocaleString()
    : null;

  return (
    <div className="w-full max-w-[424px] cursor-pointer bg-white rounded-[32px] shadow-[0_12px_30px_rgba(0,0,0,0.04)] border border-gray-100/60 pb-3.5 mx-auto hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 group">
      <Link href={href} className="block">
        {/* Image with badge */}
        <div className="relative h-[220px] sm:h-[260px] min-[1301px]:h-[295px] w-full rounded-[24px] overflow-hidden bg-gray-50">
          <img
            src={`${BASE_URL_IMG}/media/${item.image_url}`}
            alt={item.image_alt || item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Bottom row */}
        <div className="mt-4 px-3 sm:px-4 flex justify-between items-end pb-1">
          {/* Left: label + city + country */}
          <div className="flex flex-col text-left">
            <span className="text-black text-[14px] sm:text-[16px] font-quicksand tracking-wider">
              {classLabel} Flights To
            </span>
            <h3 className="text-secondary text-[19px] sm:text-[22px] font-bold font-quicksand leading-tight">
              {item.title},
            </h3>
            <span className="text-[14px] sm:text-[16px] text-black font-quicksand -mt-0.5">
              {country}
            </span>
          </div>

          {/* Right: price + view fares */}
          <div className="flex flex-col items-end shrink-0">
            {priceDisplay && (
              <div className="flex items-baseline">
                <span className="text-[#363636] text-[13px] sm:text-[14px] font-bold font-quicksand self-start mt-[3px]">£</span>
                <span className="text-[#363636] text-[22px] sm:text-[26px] font-bold font-quicksand">{priceDisplay}</span>
                <span className="text-[12px] sm:text-[13px] text-[#363636] font-bold font-quicksand ml-1">pp</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[#727272] text-[13px] sm:text-[14px] font-quicksand">
                View Fares
              </span>
              <svg
                className="w-3.5 h-3.5 text-secondary group-hover:translate-x-1.5 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="3"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function CountryCityFares({ cities = [], ContinentCities, classLabel = "Business Class" }) {
  const sanitize = (str) =>
    str?.toLowerCase().replace(/\s+/g, "-").replace(/\//g, "") ?? "";

  const sanitizedContinent = sanitize(ContinentCities?.continent?.title);
  const sanitizedCountry = sanitize(ContinentCities?.title);

  const getHref = (item) => `/${sanitizedContinent}/${sanitizedCountry}/${item.slug}`;

  if (!cities.length) return null;

  return (
    <div id="country-city-fares" className="py-2">
      <div className="grid grid-cols-1 min-[500px]:grid-cols-2 min-[1301px]:grid-cols-3 gap-6 justify-items-center">
        {cities.map((item, index) => {
          const isThirdInThree = index === 2 && cities.length === 3;
          return (
            <div
              key={item.id || item.slug}
              className={`w-full flex justify-center ${
                isThirdInThree ? "min-[500px]:col-span-2 min-[1301px]:col-span-1" : ""
              }`}
            >
              <CityFareCard
                item={item}
                href={getHref(item)}
                classLabel={classLabel}
                country={ContinentCities.title}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
