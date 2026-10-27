"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function AirlineCard({ airline }) {
  if (!airline) return null;

  const [imgError, setImgError] = useState(false);

  const resolveImage = (path) => {
    if (!path || typeof path !== "string") return null;
    const trimmed = path.trim();
    if (!trimmed || trimmed === "null") return null;
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    const clean = trimmed.replace(/^\/?(media\/)?/, "");
    return `/media/${clean}`;
  };

  const logoSrc = resolveImage(airline.image_url || airline.logo);
  const fallbackSrc = resolveImage(airline.thumbnail_url);
  const activeSrc = !imgError ? (logoSrc || fallbackSrc) : null;

  const href = `/airline/${airline.slug}`;
  const name = airline.title || "Airline";

  return (
    <Link
      href={href}
      title={name}
      className="w-full bg-[#F0F5F8] hover:bg-white rounded-[20px] sm:rounded-[24px] px-5 py-4 flex items-center justify-center h-[96px] sm:h-[110px] border border-transparent hover:border-[#5CACC4]/40 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(31,0,96,0.06)] hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer"
    >
      {activeSrc ? (
        <img
          src={activeSrc}
          alt={airline.image_alt || name}
          loading="lazy"
          className="max-h-[46px] sm:max-h-[52px] max-w-[80%] sm:max-w-[75%] w-auto h-auto object-contain group-hover:scale-105 transition-transform duration-200"
          onError={() => {
            if (logoSrc && fallbackSrc && activeSrc === logoSrc && logoSrc !== fallbackSrc) {
              setImgError(false);
            } else {
              setImgError(true);
            }
          }}
        />
      ) : (
        <span className="text-[14px] sm:text-[15px] font-bold text-[#1F0060] font-poppins text-center line-clamp-2 px-2">
          {name}
        </span>
      )}
    </Link>
  );
}
