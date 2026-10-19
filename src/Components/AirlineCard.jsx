
"use client";
import React from "react";
import Link from "next/link";
import { BASE_URL_IMG } from "../Helpers/imageurl";

const DUMMY_THUMBNAIL = "https://placehold.co/188x122?text=188x122";

export default function AirlineCard({ airline }) {
  if (!airline) return null;
  const hasThumbnail = Boolean(
    airline.thumbnail_url &&
    typeof airline.thumbnail_url === "string" &&
    airline.thumbnail_url.trim() !== "" &&
    airline.thumbnail_url.trim() !== "null"
  );
  const thumbnail = hasThumbnail
    ? `${BASE_URL_IMG}/media/${airline.thumbnail_url}`
    : DUMMY_THUMBNAIL;

  const hasLogo = Boolean(
    airline.image_url &&
    typeof airline.image_url === "string" &&
    airline.image_url.trim() !== "" &&
    airline.image_url.trim() !== "null"
  );
  const logoSrc = hasLogo
    ? `${BASE_URL_IMG}/media/${airline.image_url}`
    : DUMMY_THUMBNAIL;

  const href = `/airline/${airline.slug}`;
  const name = airline.title || "Airline";

  return (
    <Link href={href} title={name} className=" airline_card group block w-full border border-[#F1A868] rounded-[12px]">
      <div className="relative w-full  overflow-hidden rounded-[12px] aspect-[16/10] pro_img">
        <img
          src={thumbnail}
          alt={airline.image_alt || name}
          loading="lazy"
          className="h-full  object-cover transition-transform duration-500"
          onError={(e) => {
            if (e.currentTarget.src !== DUMMY_THUMBNAIL) {
              e.currentTarget.src = DUMMY_THUMBNAIL;
            }
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="btn rounded-full border border-white/80 bg-[#fff] px-5 py-2 text-[15px] font-semibold text-[#A57233] flex items-center justify-center gap-2">
            View Fares <img src="/media/fr-svgs/cardbtnarrow.png" alt="" className="w-[18px] h-[10px] inline-block ml-3" />
          </span>
        </div>
      </div>

      <div className="h-[74px] flex items-center gap-2.5 px-[18px] py-[10px] overflow-hidden">
        <div className="flex  items-center justify-center overflow-hidden rounded-md bg-white">
          <img
            src={logoSrc}
            alt=""
            loading="lazy"
            className="max-w-[100%] object-contain"
            aria-hidden
            onError={(e) => {
              if (e.currentTarget.src !== DUMMY_THUMBNAIL) {
                e.currentTarget.src = DUMMY_THUMBNAIL;
              }
            }}
          />
        </div>
      </div>
    </Link>
  );
}
