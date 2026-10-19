"use client";
import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { endpoints } from "../Helpers/endpoints";
import { useGeneralSettings } from "../Context/GeneralSettingsContext";
import AirlineCard from "./AirlineCard";

function groupByAlphabet(airlines) {
  return airlines.reduce((acc, airline) => {
    if (!airline?.title || typeof airline.title !== "string") return acc;
    const letter = airline.title[0].toUpperCase();
    if (!/^[A-Z]$/.test(letter)) return acc;
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(airline);
    return acc;
  }, {});
}

function AlphabetDivider({ letter }) {
  return (
    <div className="mb-[20px] flex items-center gap-4">
      <span className="text-[30px] font-extrabold leading-none text-[#A57233] sm:text-[60px] relative px-[43px] 
      after:content-[''] after:absolute after:bottom-1/2 after:translate-y-1/2 after:right-0  after:w-[40px] after:h-[6px] after:bg-[url('/shortdoblelineright.svg')] after:bg-contain after:bg-center
      before:content-[''] before:absolute before:bottom-1/2 before:translate-y-1/2 before:left-0  before:w-[40px] before:h-[6px] before:bg-[url('/shortdobleline.svg')] before:bg-contain before:bg-center">
        {letter}
      </span>
    </div>
  );
}

function AirlineCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[16/10] w-full rounded-[18px] bg-gray-200" />
      <div className="mt-3 flex items-center gap-2.5">
        <div className="h-9 w-9 rounded-md bg-gray-200" />
        <div className="h-4 w-2/3 rounded bg-gray-200" />
      </div>
    </div>
  );
}

export default function AirlineGrid({
  heading = "",
  subHeading = "",
  heading2 = "",
  subHeading2 = "",
}) {
  const { topAirlines: topAirlinesData } = useGeneralSettings();
  const [search, setSearch] = useState("");
  const [airlines, setAirlines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAirlines = async () => {
      try {
        const res = await axios.get(endpoints.airlines);
        if (res.data?.status === 1) {
          setAirlines(res.data.result || []);
        } else {
          console.error("Failed to fetch airlines:", res.data?.message);
        }
      } catch (error) {
        console.error("Error fetching airlines:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAirlines();
  }, []);

  const topAirlines = useMemo(() => {
    if (topAirlinesData?.is_active && Array.isArray(topAirlinesData.airlines) && topAirlinesData.airlines.length > 0) {
      return topAirlinesData.airlines.map((a) => ({
        ...a,
        slug: a.page_url || a.slug,
        thumbnail_url: a.thumbnail_url?.replace(/^\/media\//, "") || a.thumbnail_url,
        image_url: a.image_url?.replace(/^\/media\//, "") || a.image_url,
      }));
    }
    return airlines;
  }, [topAirlinesData, airlines]);

  const groupedAirlines = useMemo(() => groupByAlphabet(airlines), [airlines]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return null;
    return airlines.filter((a) => a.title?.toLowerCase().includes(q));
  }, [airlines, search]);

  const gridClass =
    "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-x-[24px] gap-y-[20px]";

  return (
    <div className="mx-auto pb-6">
      {/* Top Business Class Airlines */}
      <section className="mb-14 sm:mb-16">
        <div className="heading_section">
          <h1 className="pre_heading">
            {(topAirlinesData?.is_active && topAirlinesData?.heading) || heading}
          </h1>
          <p className="sub_text">
            {subHeading}
          </p>
        </div>

        {loading ? (
          <div className={gridClass}>
            {Array.from({ length: 14 }).map((_, i) => (
              <AirlineCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className={gridClass}>
            {topAirlines.map((airline) => (
              <AirlineCard key={airline.id || airline.slug} airline={airline} />
            ))}
          </div>
        )}
      </section>

      {/* All Airlines We Work With */}
      <section>
        <div className="mb-8 flex flex-col gap-6 min-[756px]:flex-row min-[756px]:items-center min-[756px]:justify-between">
          <div className="heading_section !pb-0 !mb-0">
            <h2 className="pre_heading">
              {heading2}
            </h2>
            <p className="sub_text">
              {subHeading2}
            </p>
          </div>

          <div className="relative w-full max-w-[443px] shrink-0 mx-auto min-[756px]:mx-0">
            <input
              type="text"
              aria-label="Search Airlines"
              placeholder="Search Airline..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border-0  bg-[#FFF8F1] py-2.5 pl-6 pr-20 h-[68px] text-[16px] text-[#C9A77E] 
              placeholder:text-[#C9A77E] outline-none transition"
            />
            <span
              className="absolute right-0 top-1/2 flex h-[68px] w-[68px] -translate-y-1/2 items-center justify-center rounded-full bg-[#FFE1C7] text-white
              border-[8px] border-[#fff]"
              aria-hidden
            >
              <img src="/media/fr-svgs/searchcolor.svg" alt="" />
            </span>
          </div>
        </div>

        {loading ? (
          <div className={gridClass}>
            {Array.from({ length: 10 }).map((_, i) => (
              <AirlineCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered ? (
          filtered.length ? (
            <div className={gridClass}>
              {filtered.map((airline) => (
                <AirlineCard key={airline.id || airline.slug} airline={airline} />
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-[#4C4C4C]">
              No matching airlines found.
            </p>
          )
        ) : (
          Object.keys(groupedAirlines)
            .sort()
            .map((letter) => {
              const group = groupedAirlines[letter] || [];
              if (!group.length) return null;
              return (
                <div key={letter} className="mb-12">
                  <AlphabetDivider letter={letter} />
                  <div className={gridClass}>
                    {group.map((airline) => (
                      <AirlineCard
                        key={airline.id || airline.slug}
                        airline={airline}
                      />
                    ))}
                  </div>
                </div>
              );
            })
        )}
      </section>
    </div>
  );
}
