"use client";
import React, { useState, useEffect } from "react";
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { endpoints } from "../Helpers/endpoints";

import axios from "axios";
import { BASE_URL_IMG } from "../Helpers/imageurl";
import { holidayCountryPath } from "../Helpers/holidayUrls";
import Link from "next/link";

export default function HolidayCustom({ rows = 8, columns = 3, widgetContent = '' }) {
    const clampedColumns = Math.min(Math.max(columns, 1), 4);
    const initialRows = Math.max(rows, 1);
    const [visibleRows, setVisibleRows] = useState(initialRows);
    const [countries, setCountries] = useState([]);
    const [holidayResponse, setHolidayResponse] = useState(null);
    const totalItems = visibleRows * clampedColumns;
    const displayedDeals = countries.slice(0, totalItems);
    // console.log("HolidayResponse", holidayResponse)


    const columnClassMap = {
        1: "grid-cols-1",
        2: "grid-cols-1 sm:grid-cols-2",
        3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(endpoints.holidaysCountries);
                // console.log("##", response)
                setHolidayResponse(response?.data);
                if (response?.data?.data) {
                    setCountries(response.data.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch holiday countries:", error);
            }
        };

        fetchData();
    }, []);

    const handleLoadMore = () => {
        setVisibleRows((prev) => prev + 2);
        setTimeout(() => {
            window.scrollTo({
                top: document.documentElement.scrollTop + 400,
                behavior: 'smooth',
            });
        }, 50);
    };



    return (
        <>
        <meta name="robots" content="noindex, nofollow" />
        <section className="py-6 px-4 sm:py-8  md:py-10 md:px-10 lg:py-12">
            <div className="w-full mx-auto">
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-secondary font-bold mb-2 sm:mb-3">
                    {widgetContent.heading || "Best Fares for Holidays 2025"}
                </h2>
                <p className="text-gray-600 max-w-2xl text-start mb-6 sm:mb-8 text-xs sm:text-sm md:text-base">
                    {widgetContent.sub_heading || (
                        <>
                            Travellers always look for comfort on their air trips to the places they most long to Emenac Travel
                            <strong> we comforts over their budgets</strong>.
                        </>
                    )}
                </p>


                <div className={`grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 ${columnClassMap[clampedColumns]}`}>
                    {displayedDeals.map((deal, index) => (
                        <div key={index}>
                            <Link
                                href={holidayCountryPath(deal.holiday_country_slug)}
                                className="block sm:hidden w-[90%] mx-auto bg-white rounded-xl shadow border border-black hover:shadow-md transition overflow-hidden"
                            >
                                <img
                                    src={`${BASE_URL_IMG}/media/${deal.holiday_country_image_url}`}
                                    alt={`${deal.holiday_country_image_alt} holiday`}
                                    className="w-full aspect-[4/3] object-cover"
                                />
                                <div className="p-3">
                                    <Tippy content={deal.country_title}>
                                        <p className="text-base font-bold text-secondary mb-1 line-clamp-1 cursor-default">
                                            {deal.country_title}
                                        </p>
                                    </Tippy>
                                    <p className="text-sm text-black line-clamp-2 mb-3">
                                        {deal.holiday_country_slug}
                                    </p>
                                    <div className="flex justify-between items-center text-primary">
                                        <p className="text-red-600">
                                            <span className="text-sm">Fr</span>{" "}
                                            <span className="font-bold text-lg">£413.00</span>
                                        </p>
                                        <span className="flex items-center text-sm font-medium hover:underline text-primary hover:text-primaryHover gap-2">
                                            View All
                                            <span className="font-bold">
                                                <img src={`${BASE_URL_IMG}/assets/svgs/Arrow1.svg`} alt="arrow right" />
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </Link>

                            <div className="hidden sm:block">
                                <Link
                                    href={holidayCountryPath(deal.holiday_country_slug)}
                                    className="md:flex items-center bg-white rounded-xl shadow border border-black hover:shadow-md transition"
                                >
                                    <img
                                        src={`${BASE_URL_IMG}/media/${deal.holiday_country_image_url}`}
                                        alt={`${deal.holiday_country_image_alt} holiday`}
                                        className="w-full md:w-[130px] h-[122px] object-cover rounded-l-xl"
                                    />
                                    <div className="flex-1 p-3">
                                        <Tippy content={deal.country_title}>
                                            <p className="text-lg font-bold text-secondary line-clamp-1">
                                                {deal.country_title}
                                            </p>
                                        </Tippy>
                                        <p className="text-sm text-black line-clamp-2" dangerouslySetInnerHTML={{ __html: deal.holiday_country_short_description }}>
                                        </p>
                                        <div className="flex justify-between items-center text-primary">
                                            <p className="text-red-600">
                                                <span className="text-sm">Fr</span>{" "}
                                                <span className="font-bold text-xl">£{deal.lowest_package_price || 512}</span>
                                            </p>
                                            <span className="flex items-center text-sm font-medium hover:underline text-primary hover:text-primaryHover gap-2">
                                                View All
                                                <span className="font-bold">
                                                    <img src={`${BASE_URL_IMG}/assets/svgs/Arrow1.svg`} alt="arrow right" />
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {totalItems < countries.length && (
                    <div className="mt-8 sm:mt-10 md:mt-12 flex justify-center">
                        <button
                            onClick={handleLoadMore}
                            className="px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-full text-pink-600 font-semibold text-sm sm:text-base shadow-md transition-all duration-300 backdrop-blur-lg bg-white/10 hover:bg-white/20 border border-white/30"
                            style={{
                                background: 'rgba(255, 255, 255, 0.15)',
                                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.18)',
                            }}
                        >
                            Load More
                        </button>
                    </div>
                )}
            </div>
        </section>
        </>
    );
}
