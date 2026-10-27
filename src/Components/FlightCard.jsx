"use client";

import React, { useState } from "react";
import { BASE_URL_IMG } from "../Helpers/imageurl";
import EnquiryModal from "./EnquiryModal";
import { formatDate, formdataProvider } from "../utils/formDataProvider";

export default function FlightCard({ cities, fares, cols = 2 }) {
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);

  const faresList = React.useMemo(() => {
    if (Array.isArray(fares) && fares.length > 0) return fares;
    if (Array.isArray(cities)) {
      return cities.flatMap((c) =>
        (c.fares || []).map((f) => ({
          ...f,
          cityTitle: c.title,
          countryTitle: c.country?.title,
        }))
      );
    }
    return [];
  }, [fares, cities]);

  if (!faresList.length) return null;

  const handleEnquiryClick = (fare) => {
    localStorage.setItem(
      "flightFormData",
      JSON.stringify(formdataProvider(fare))
    );
    setShowEnquiryModal(true);
  };

  return (
    <>
      <div
        className={`grid grid-cols-1 ${
          cols === 1 ? "" : "lg:grid-cols-2"
        } gap-4 sm:gap-5 w-full font-poppins`}
      >
        {faresList.map((fare, index) => {
          const fromCity = fare.origin?.city || "London Heathrow";
          const toCity =
            fare.destination?.city ||
            fare.cityTitle ||
            fare.destination_city ||
            "Dhaka";
          const fromCode = fare.origin?.code || "LHR";
          const toCode = fare.destination?.code || "ACC";
          const fromCountry = fare.origin?.country || "United Kingdom";
          const toCountry =
            fare.destination?.country ||
            fare.countryTitle ||
            fare.destination_country ||
            "Bangladesh";

          const rawPrice = fare.price || 488;
          const numPrice = Number(rawPrice);
          const priceDisplay =
            !isNaN(numPrice) && numPrice > 0
              ? Math.round(numPrice).toLocaleString()
              : "18,500";

          const flightType = fare.flight_type || "Return";
          const flightClass =
            fare.flght_class || fare.flight_class || "Business Class";

          const airlineName =
            fare.airline?.title || fare.airline_name || "SWISS";
          const rawAirlineImage = fare.airline?.image_url || fare.airline_logo;
          const airlineImage = rawAirlineImage
            ? rawAirlineImage.startsWith("http") ||
              rawAirlineImage.startsWith("/")
              ? rawAirlineImage
              : `${BASE_URL_IMG}/media/${rawAirlineImage.replace(
                  /^\/?media\//,
                  ""
                )}`
            : null;

          return (
            <div
              key={fare.id || `${fromCode}-${toCode}-${index}`}
              className="bg-white rounded-[16px] sm:rounded-[20px] p-4 sm:p-5 border border-[#EDEDED] shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all flex flex-col justify-between"
            >
              {/* Top Row: Origin, Destination, Price + Send Enquiry */}
              <div className="flex items-start justify-between gap-2 sm:gap-4">
                {/* 1. Origin */}
                <div className="flex flex-col text-left min-w-0 flex-1">
                  <span className="text-[20px] sm:text-[22px] font-bold text-black leading-tight">
                    {fromCode}
                  </span>
                  <span className="text-[13px] sm:text-[14px] font-bold text-black leading-tight mt-1 truncate">
                    {fromCity}
                  </span>
                  <span className="text-[12px] text-gray-500 font-normal leading-tight mt-0.5 truncate">
                    {fromCountry}
                  </span>
                </div>

                {/* 2. Destination */}
                <div className="flex flex-col text-left min-w-0 flex-1">
                  <span className="text-[20px] sm:text-[22px] font-bold text-black leading-tight">
                    {toCode}
                  </span>
                  <span className="text-[13px] sm:text-[14px] font-bold text-black leading-tight mt-1 truncate">
                    {toCity}
                  </span>
                  <span className="text-[12px] text-gray-500 font-normal leading-tight mt-0.5 truncate">
                    {toCountry}
                  </span>
                </div>

                {/* 3. Price & Action */}
                <div className="flex flex-col items-end shrink-0 pl-1">
                  <span className="text-[20px] sm:text-[22px] font-bold text-black leading-tight">
                    £{priceDisplay}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleEnquiryClick(fare)}
                    className="bg-[#5CACC4] hover:bg-[#4ea0b8] text-white font-medium text-[12px] sm:text-[13px] px-3.5 py-1.5 rounded-[8px] transition-colors mt-1.5 whitespace-nowrap inline-flex items-center justify-center shadow-sm"
                  >
                    Send Enquiry
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="w-full h-[1px] bg-gray-100 my-3.5" />

              {/* Bottom Row: Airline Logo, Flight Type & Class, Call Us */}
              <div className="flex items-center justify-between gap-2">
                {/* Airline Logo */}
                <div className="flex items-center min-w-[80px] sm:min-w-[110px] h-7">
                  {airlineImage ? (
                    <img
                      src={airlineImage}
                      alt={airlineName}
                      className="h-6 sm:h-7 max-w-[120px] object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const sibling = e.currentTarget.nextSibling;
                        if (sibling) sibling.style.display = "block";
                      }}
                    />
                  ) : null}
                  <span
                    className={`text-[13px] font-bold text-gray-800 ${
                      airlineImage ? "hidden" : "block"
                    }`}
                  >
                    {airlineName}
                  </span>
                </div>

                {/* Flight Type & Class */}
                <div className="flex flex-col items-center text-center">
                  <span className="text-[12px] font-semibold text-black leading-tight">
                    {flightType}
                  </span>
                  <span className="text-[11px] text-gray-500 font-normal leading-tight mt-0.5">
                    {flightClass}
                  </span>
                </div>

                {/* Contact Phone */}
                <div className="flex flex-col items-end text-right">
                  <span className="text-[11px] text-gray-500 font-normal leading-tight">
                    Call Us
                  </span>
                  <a
                    href="tel:02039232255"
                    className="text-[12px] font-bold text-black hover:text-[#5CACC4] transition-colors leading-tight mt-0.5"
                  >
                    0203 - 923 - 2255
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showEnquiryModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowEnquiryModal(false);
          }}
          className="fixed inset-0 z-[999] bg-black/65 backdrop-blur-sm flex justify-center items-center p-3 sm:p-6 overflow-y-auto"
        >
          <div className="w-full max-w-[820px] relative max-h-[94vh] overflow-y-auto rounded-[20px] sm:rounded-[24px] shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200">
            <EnquiryModal
              formatDate={formatDate}
              onClose={() => setShowEnquiryModal(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
