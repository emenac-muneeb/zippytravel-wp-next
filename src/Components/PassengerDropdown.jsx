"use client";
import React from "react";
import Image from "next/image";
import { showToast } from "../Helpers/Helper";

const PassengerDropdown = ({
  adults,
  setAdults,
  children: childCount,
  setChildren,
  infants,
  setInfants,
  className = "",
}) => {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`w-[340px] h-[176px] bg-white rounded-[16px] shadow-[0_10px_25px_rgba(0,0,0,0.12)] border border-gray-100 px-[24px] py-[16px] flex flex-col justify-between font-poppins select-none ${className}`}
    >
      {/* 1. Adult(s) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[14px]">
          <div className="w-[22px] h-[26px] flex items-center justify-center flex-shrink-0">
            <Image
              src="/Layer_1.png"
              alt="Adult"
              width={20}
              height={26}
              className="w-auto h-[24px] object-contain"
            />
          </div>
          <span className="font-poppins text-[17px] font-normal text-[#1F0060]">
            Adult(s)
          </span>
        </div>

        <div className="flex items-center gap-[10px]">
          <button
            type="button"
            onClick={() => {
              if (adults > 1) {
                const newAdult = adults - 1;
                if (childCount > newAdult * 2) {
                  showToast("Children cannot be more than twice the adults.", "info");
                  return;
                }
                if (infants > newAdult) {
                  showToast("Infants cannot exceed the number of adults.", "info");
                  return;
                }
                setAdults(newAdult);
              }
            }}
            disabled={adults <= 1}
            className={`w-[26px] h-[26px] rounded-[6px] text-white flex items-center justify-center font-bold text-[18px] leading-none transition-colors ${
              adults > 1
                ? "bg-[#180048] hover:bg-[#25006b] cursor-pointer"
                : "bg-[#B5ABC9] disabled:opacity-50 disabled:cursor-not-allowed"
            }`}
            aria-label="Decrease Adults"
          >
            -
          </button>
          <span className="min-w-[28px] text-center font-poppins text-[17px] font-medium text-[#180048] border-b-[1.5px] border-[#180048] pb-[1px] leading-tight">
            {String(adults).padStart(2, "0")}
          </span>
          <button
            type="button"
            onClick={() => {
              if (adults < 9) setAdults(adults + 1);
            }}
            disabled={adults >= 9}
            className="w-[26px] h-[26px] rounded-[6px] bg-[#180048] hover:bg-[#25006b] disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center font-bold text-[18px] leading-none transition-colors cursor-pointer"
            aria-label="Increase Adults"
          >
            +
          </button>
        </div>
      </div>

      {/* 2. Child(s) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[14px]">
          <div className="w-[22px] h-[26px] flex items-center justify-center flex-shrink-0">
            <Image
              src="/Layer_2.png"
              alt="Child"
              width={20}
              height={26}
              className="w-auto h-[24px] object-contain"
            />
          </div>
          <span className="font-poppins text-[17px] font-normal text-[#1F0060]">
            Child(s)
          </span>
        </div>

        <div className="flex items-center gap-[10px]">
          <button
            type="button"
            onClick={() => {
              if (childCount > 0) setChildren(childCount - 1);
            }}
            disabled={childCount <= 0}
            className={`w-[26px] h-[26px] rounded-[6px] text-white flex items-center justify-center font-bold text-[18px] leading-none transition-colors ${
              childCount > 0
                ? "bg-[#180048] hover:bg-[#25006b] cursor-pointer"
                : "bg-[#B5ABC9] disabled:opacity-50 disabled:cursor-not-allowed"
            }`}
            aria-label="Decrease Children"
          >
            -
          </button>
          <span className="min-w-[28px] text-center font-poppins text-[17px] font-medium text-[#180048] border-b-[1.5px] border-[#180048] pb-[1px] leading-tight">
            {String(childCount).padStart(2, "0")}
          </span>
          <button
            type="button"
            onClick={() => {
              if (childCount >= adults * 2) {
                showToast("Children cannot be more than twice the adults.", "info");
                return;
              }
              if (childCount < 9) setChildren(childCount + 1);
            }}
            disabled={childCount >= 9}
            className="w-[26px] h-[26px] rounded-[6px] bg-[#180048] hover:bg-[#25006b] disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center font-bold text-[18px] leading-none transition-colors cursor-pointer"
            aria-label="Increase Children"
          >
            +
          </button>
        </div>
      </div>

      {/* 3. Infant(s) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[14px]">
          <div className="w-[22px] h-[26px] flex items-center justify-center flex-shrink-0">
            <Image
              src="/Layer_3.png"
              alt="Infant"
              width={20}
              height={26}
              className="w-auto h-[24px] object-contain"
            />
          </div>
          <span className="font-poppins text-[17px] font-normal text-[#1F0060]">
            Infant(s)
          </span>
        </div>

        <div className="flex items-center gap-[10px]">
          <button
            type="button"
            onClick={() => {
              if (infants > 0) setInfants(infants - 1);
            }}
            disabled={infants <= 0}
            className={`w-[26px] h-[26px] rounded-[6px] text-white flex items-center justify-center font-bold text-[18px] leading-none transition-colors ${
              infants > 0
                ? "bg-[#180048] hover:bg-[#25006b] cursor-pointer"
                : "bg-[#B5ABC9] disabled:opacity-50 disabled:cursor-not-allowed"
            }`}
            aria-label="Decrease Infants"
          >
            -
          </button>
          <span className="min-w-[28px] text-center font-poppins text-[17px] font-medium text-[#180048] border-b-[1.5px] border-[#180048] pb-[1px] leading-tight">
            {String(infants).padStart(2, "0")}
          </span>
          <button
            type="button"
            onClick={() => {
              if (infants >= adults) {
                showToast("Infants cannot exceed the number of adults.", "info");
                return;
              }
              if (infants < 9) setInfants(infants + 1);
            }}
            disabled={infants >= adults}
            className="w-[26px] h-[26px] rounded-[6px] bg-[#180048] hover:bg-[#25006b] disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center font-bold text-[18px] leading-none transition-colors cursor-pointer"
            aria-label="Increase Infants"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};

export default PassengerDropdown;
