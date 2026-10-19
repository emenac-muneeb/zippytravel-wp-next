"use client";
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BASE_URL_IMG } from "../Helpers/imageurl";
import { endpoints } from '../Helpers/endpoints';
import api from '../Helpers/apiHelper';
import { holidayCountryPath } from '../Helpers/holidayUrls';

export default function HolidayDeals({ deals = [], rows = 3, columns = 1, holidayResponse, heading = '', subheading = '' }) {

  const clampedColumns = Math.min(Math.max(columns, 1), 4);
  const clampedRows = Math.max(rows, 1);
  const totalItems = clampedRows * clampedColumns;
  const displayedDeals = Array.isArray(deals) ? deals.slice(0, totalItems) : [];

  const router = useRouter();
  const [frontIcons, setFrontIcons] = useState([]);

  useEffect(() => {
    const fetchHoData = async () => {
      try {
        const response = await api.get(endpoints.generalSettings);
        if (response.data.status === 1) {
          setFrontIcons(response.data.result.front_icons ?? []);
        }
      } catch (error) {
        console.error('Error fetching front icons:', error);
      }
    };
    fetchHoData();
  }, []);

  const getFrontIcon = (fileName) => {
    return Array.isArray(frontIcons)
      ? frontIcons.find(iconUrl => iconUrl.includes(fileName)) || ''
      : '';
  };

  const columnClassMap = {
    1: "sm:grid-cols-1",
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 md:grid-cols-3",
    4: "sm:grid-cols-2 md:grid-cols-4"
  };

  const handleCardClick = (deal) => {
    const slug = deal?.holiday_country_slug;
    if (slug) router.push(holidayCountryPath(slug));
  };

  return (
    <div
      className="flex flex-col md:flex-row bg-cover bg-center bg-no-repeat py-10"
      style={{ backgroundImage: `url('${getFrontIcon("iStock.png")}')` }}
    >
      <div className="flex flex-wrap md:flex-nowrap justify-center w-full max-w-7xl mx-auto px-4 md:px-6">

        {/* Left Content */}
        <div className="w-full md:w-1/2 bg-white/90 p-6 md:p-8 rounded-3xl md:rounded-l-3xl shadow-lg">
          <h2 className="text-center text-2xl md:text-3xl font-bold mb-4">
            {heading || "Best Holiday Deals 2025"}
          </h2>
          <p className="mb-6 text-justify text-gray-700 text-sm md:text-base">
            {subheading || "Travellers always look for comfort on their air trips to the most popular destinations. Emenac Travel offers exceptional value without compromising comfort."}
          </p>

          <div className={`grid gap-5 ${columnClassMap[clampedColumns]}`}>
            {displayedDeals.map((deal, index) => (
              <div
                key={index}
                onClick={() => handleCardClick(deal)}
                className="flex flex-col md:flex-row w-full bg-white rounded-xl shadow border border-gray-200 hover:shadow-md transition duration-300"
              >
                <img
                  src={`${BASE_URL_IMG}/media/${deal.holiday_country_image_url}`}
                  alt={`${deal.holiday_country_image_alt} holiday`}
                  className="w-full md:w-[180px] h-48 md:h-auto object-cover rounded-t-xl md:rounded-l-xl md:rounded-tr-none"
                />
                <div className="flex-1 p-4">
                  <p className="text-lg font-bold text-secondary">{deal.country_title}</p>
                  <p className="text-sm text-black line-clamp-2">{deal.holiday_country_short_description}</p>
                  <div className="flex justify-between items-center mt-2 text-primary">
                    <p className="text-red-600">
                      <span className="text-sm">Fr</span>{" "}
                      <span className="font-bold text-lg">
                        {deal.lowest_package_price ? `£${parseFloat(deal.lowest_package_price).toFixed(2)}` : '£512.00'}
                      </span>
                    </p>
                    <button className="flex items-center text-sm font-medium hover:underline text-primary hover:text-primaryHover gap-2">
                      View All
                      <span className="font-bold">
                        <img src={`${BASE_URL_IMG}/assets/svgs/Arrow1.svg`} alt="arrow right" />
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-6">
            <Link
              href="/holidays.html"
              className="text-base font-semibold flex items-center justify-center gap-2 hover:underline text-primary hover:text-primaryHover"
            >
              <span>View All Destinations</span>
              <img src={`${BASE_URL_IMG}/assets/svgs/Arrow1.svg`} alt="arrow right" className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Right Content */}
        <div className="hidden md:block w-full md:w-1/2 mt-6 md:mt-0 rounded-b-3xl md:rounded-r-3xl shadow-lg deal-border"></div>
      </div>
    </div>
  );
}
