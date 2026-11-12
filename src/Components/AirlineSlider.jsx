"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { endpoints } from "../Helpers/endpoints";
import { useGeneralSettings } from "../Context/GeneralSettingsContext";

const resolveImage = (path) => {
  if (!path || typeof path !== "string") return null;
  const trimmed = path.trim();
  if (!trimmed || trimmed === "null") return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
    return trimmed;
  }
  const clean = trimmed.replace(/^\/?(media\/)?/, "");
  return `/media/${clean}`;
};

const normalizeAirline = (airline) => {
  if (!airline) return null;
  const slug = airline.page_url || airline.slug;
  if (!slug) return null;

  return {
    id: airline.id || slug,
    name: airline.title || airline.name || "Airline",
    slug: String(slug).replace(/^\/+|\/+$/g, ""),
    logo:
      resolveImage(airline.image_url) ||
      resolveImage(airline.logo) ||
      resolveImage(airline.thumbnail_url),
    alt: airline.image_alt || airline.title || airline.name || "Airline",
  };
};

function AirlineLogoCard({ airline }) {
  const [imgError, setImgError] = useState(false);
  if (!airline?.slug) return null;

  return (
    <Link
      href={`/airline/${airline.slug}`}
      title={airline.name}
      className="w-full h-[100px] sm:h-[110px] xl:h-[120px] bg-white rounded-[20px] flex items-center justify-center p-4 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group cursor-pointer"
    >
      {airline.logo && !imgError ? (
        <img
          src={airline.logo}
          alt={airline.alt}
          loading="lazy"
          onError={() => setImgError(true)}
          className="max-h-[50px] sm:max-h-[55px] xl:max-h-[62px] max-w-[190px] xl:max-w-[220px] w-auto h-auto object-contain transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <span className="text-[14px] sm:text-[15px] font-bold text-[#1F0060] font-poppins text-center line-clamp-2 px-2">
          {airline.name}
        </span>
      )}
    </Link>
  );
}

export default function AirlineSlider({
  heading = "",
  subheading = "",
}) {
  const { topAirlines: topAirlinesData } = useGeneralSettings();
  const [airlines, setAirlines] = useState([]);

  useEffect(() => {
    const fetchAirlines = async () => {
      try {
        const res = await axios.get(endpoints.airlines);
        if (res.data?.status === 1) {
          setAirlines(res.data.result || []);
        }
      } catch (error) {
        console.error("Error fetching airlines for slider:", error);
      }
    };

    fetchAirlines();
  }, []);

  // Same source as airlines page: top_airlines from general settings, else first API airlines
  const displayAirlines = useMemo(() => {
    let source = [];

    if (
      topAirlinesData?.is_active &&
      Array.isArray(topAirlinesData.airlines) &&
      topAirlinesData.airlines.length > 0
    ) {
      source = topAirlinesData.airlines;
    } else if (Array.isArray(airlines) && airlines.length > 0) {
      source = airlines;
    }

    return source.map(normalizeAirline).filter(Boolean).slice(0, 11);
  }, [topAirlinesData, airlines]);

  // Prefer home widgets_content AIRLINES shortcode (props); else general-settings top_airlines
  const sectionHeading =
    heading ||
    (topAirlinesData?.is_active && topAirlinesData?.heading) ||
    "";
  const sectionSubheading = subheading || "";

  // Keep visual grid fill: first 8 always, extras for responsive layouts, last slot = MORE
  const primaryAirlines = displayAirlines.slice(0, 8);
  const extraAirlines = displayAirlines.slice(8, 11);

  if (displayAirlines.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-10 sm:py-14 lg:py-16 bg-white font-poppins">
      <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="text-center max-w-[900px] mx-auto mb-14 sm:mb-12 lg:mb-14 px-4">
          <h2 className="font-poppins font-bold text-[28px] sm:text-[34px] lg:text-[42px] text-[#000000] tracking-tight leading-tight">
            {sectionHeading}
          </h2>
          <p className="font-poppins font-normal text-[15px] sm:text-[17px] lg:text-[18px] text-[#555555] mt-3 sm:mt-4 leading-relaxed">
            {sectionSubheading}
          </p>
        </div>

        <div className="w-full bg-[#1F0060] rounded-[30px] sm:rounded-[40px] shadow-2xl relative overflow-visible flex flex-col xl:flex-row items-center xl:items-stretch min-h-[480px]">
          <div className="w-full xl:w-[365px] h-[380px] sm:h-[440px] xl:h-[480px] bg-[#EEF3F7] rounded-t-[30px] xl:rounded-t-none xl:rounded-l-[40px] xl:rounded-r-[40px] relative flex items-end justify-center shrink-0 overflow-visible">
            <img
              src="/airhostess.png"
              onError={(e) => {
                e.currentTarget.src = "/airline%20section%20-%20image%202.png";
              }}
              alt="Airhostess"
              className="w-[240px] sm:w-[270px] xl:w-[292px] h-[430px] sm:h-[480px] xl:h-[528px] object-contain object-bottom absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none select-none z-10 drop-shadow-md"
            />
          </div>

          <div className="flex-1 w-full p-4 sm:p-6 xl:py-[20px] xl:pl-[24px] xl:pr-[30px] 2xl:pr-[35px] flex items-center justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-[12px] sm:gap-[15px] xl:gap-[16px] 2xl:gap-[18px] w-full justify-items-stretch">
              {primaryAirlines.map((airline) => (
                <AirlineLogoCard key={airline.id} airline={airline} />
              ))}

              {extraAirlines.map((airline, idx) => (
                <div
                  key={airline.id}
                  className={idx === 0 ? "flex lg:hidden 2xl:flex" : "hidden 2xl:flex"}
                >
                  <AirlineLogoCard airline={airline} />
                </div>
              ))}

              <Link
                href="/airlines"
                className="w-full h-[100px] sm:h-[110px] xl:h-[120px] bg-[#EBF3F6] hover:bg-[#d8eaf1] rounded-[20px] flex flex-col items-center justify-center shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer select-none leading-none text-center"
              >
                <span className="font-poppins font-bold text-[36px] sm:text-[46px] xl:text-[66px] text-[#1F0060] leading-[0.88] tracking-tight">
                  MORE
                </span>
                <span className="font-poppins font-bold text-[17px] sm:text-[22px] xl:text-[30px] text-[#5CACC4] leading-tight tracking-wider mt-[2px] xl:mt-[4px]">
                  AIRLINES
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
