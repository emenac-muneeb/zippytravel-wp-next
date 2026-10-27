"use client";
import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { endpoints } from "../Helpers/endpoints";
import { useGeneralSettings } from "../Context/GeneralSettingsContext";
import AirlineCard from "./AirlineCard";

function groupByAlphabet(airlines) {
  return airlines.reduce((acc, airline) => {
    if (!airline?.title || typeof airline.title !== "string") return acc;
    const letter = airline.title.trim()[0].toUpperCase();
    if (!/^[A-Z]$/.test(letter)) return acc;
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(airline);
    return acc;
  }, {});
}

function AirlineCardSkeleton() {
  return (
    <div className="w-full h-[96px] sm:h-[110px] rounded-[20px] sm:rounded-[24px] bg-[#F0F5F8] animate-pulse" />
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
    if (
      topAirlinesData?.is_active &&
      Array.isArray(topAirlinesData.airlines) &&
      topAirlinesData.airlines.length > 0
    ) {
      return topAirlinesData.airlines.map((a) => ({
        ...a,
        slug: a.page_url || a.slug,
        image_url: a.image_url || a.logo || a.thumbnail_url,
      }));
    }
    return airlines.slice(0, 8);
  }, [topAirlinesData, airlines]);

  const groupedAirlines = useMemo(() => groupByAlphabet(airlines), [airlines]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return null;
    return airlines.filter((a) => a.title?.toLowerCase().includes(q));
  }, [airlines, search]);

  const topHeading =
    (topAirlinesData?.is_active && topAirlinesData?.heading) ||
    heading ||
    "Top Class Airlines";
  const topSubHeading =
    subHeading ||
    "Our customers can access our web site for a 'one-stop shop' including access to specially negotiated airfares, hotels, car rental and insurance.";

  const allHeading = heading2 || "All Available Airlines";
  const allSubHeading =
    subHeading2 ||
    "Our customers can access our web site for a 'one-stop shop' including access to specially negotiated airfares, hotels, car rental and insurance.";

  const gridClass =
    "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6";

  const sortedLetters = Object.keys(groupedAirlines).sort();

  return (
    <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 pb-20 font-poppins">
      {/* ── Section 1: Top Class Airlines ── */}
      <section className="mb-16 sm:mb-24">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-[28px] sm:text-[34px] font-bold text-[#1F0060] tracking-tight">
            {topHeading}
          </h2>
          <p className="text-[14px] sm:text-[15px] text-[#5E6470] max-w-[680px] mx-auto mt-2 sm:mt-2.5 leading-relaxed font-normal">
            {topSubHeading}
          </p>
        </div>

        {loading ? (
          <div className={gridClass}>
            {Array.from({ length: 8 }).map((_, i) => (
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

      {/* ── Section 2: All Available Airlines ── */}
      <section>
        {allHeading && (
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-[28px] sm:text-[34px] font-bold text-[#1F0060] tracking-tight">
              {allHeading}
            </h2>
            <p className="text-[14px] sm:text-[15px] text-[#5E6470] max-w-[680px] mx-auto mt-2 sm:mt-2.5 leading-relaxed font-normal">
              {allSubHeading}
            </p>
          </div>
        )}

        {loading ? (
          <div className="space-y-10">
            <div className="flex items-center gap-2.5">
              <span className="text-[#5CACC4] text-[40px] sm:text-[48px] font-extrabold leading-none">
                A
              </span>
              <span className="text-[#1F0060] text-[28px] sm:text-[34px] font-bold leading-none">
                →
              </span>
            </div>
            <div className={gridClass}>
              {Array.from({ length: 8 }).map((_, i) => (
                <AirlineCardSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : filtered ? (
          <div>
            <div className="flex items-center justify-between mb-8 pb-3 border-b border-slate-200">
              <span className="text-sm font-semibold text-slate-600">
                Search Results ({filtered.length})
              </span>
              <div className="flex flex-col items-end">
                <span className="text-[12px] sm:text-[13px] font-semibold text-[#5CACC4]">
                  Choose Airline
                </span>
                <div className="relative border-b-[1.5px] border-[#5CACC4] focus-within:border-[#1F0060] pb-1 w-[180px] sm:w-[240px] flex items-center justify-between transition-colors">
                  <input
                    type="text"
                    placeholder="Search Airline Here"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-transparent outline-none text-xs text-slate-700 placeholder:text-slate-400 pr-2"
                  />
                  <svg
                    className="w-3.5 h-3.5 text-[#1F0060]/70 shrink-0 pointer-events-none"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {filtered.length > 0 ? (
              <div className={gridClass}>
                {filtered.map((airline) => (
                  <AirlineCard key={airline.id || airline.slug} airline={airline} />
                ))}
              </div>
            ) : (
              <p className="py-12 text-center text-slate-500 font-medium">
                No matching airlines found.
              </p>
            )}
          </div>
        ) : (
          sortedLetters.map((letter, letterIdx) => {
            const group = groupedAirlines[letter] || [];
            if (!group.length) return null;

            return (
              <div key={letter} className="mb-14 sm:mb-20">
                {/* Letter Header + Search input on the very first letter */}
                <div className="flex items-center justify-between mb-6 sm:mb-7">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[#5CACC4] text-[40px] sm:text-[50px] font-extrabold leading-none">
                      {letter}
                    </span>
                    <span className="text-[#1F0060] text-[28px] sm:text-[34px] font-bold leading-none">
                      →
                    </span>
                  </div>

                  {letterIdx === 0 && (
                    <div className="flex flex-col items-end">
                      <span className="text-[12px] sm:text-[13px] font-semibold text-[#5CACC4] mb-0.5">
                        Choose Airline
                      </span>
                      <div className="relative border-b-[1.5px] border-[#5CACC4]/80 focus-within:border-[#1F0060] pb-1 w-[180px] sm:w-[240px] flex items-center justify-between transition-colors">
                        <input
                          type="text"
                          placeholder="Search Airline Here"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="w-full bg-transparent outline-none text-[12px] sm:text-[13px] text-slate-700 placeholder:text-slate-400 pr-2"
                        />
                        <svg
                          className="w-3.5 h-3.5 text-[#1F0060]/70 shrink-0 pointer-events-none"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4-column Airline Cards Grid */}
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
