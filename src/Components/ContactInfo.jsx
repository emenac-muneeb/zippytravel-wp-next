"use client";
import React from "react";
import { Phone, Mail, MapPin } from "lucide-react";
import { useGeneralSettings } from "../Context/GeneralSettingsContext";
import SocialMediaSection from "./SocialMediaSection";

const SectionDivider = () => (
  <div className="flex items-center justify-center my-3 w-28 sm:w-32">
    <div className="h-[1.5px] bg-[#5CACC4] flex-1"></div>
    <div className="w-2.5 h-2.5 rounded-full border border-[#5CACC4] bg-white mx-1.5 flex-shrink-0"></div>
    <div className="h-[1.5px] bg-[#5CACC4] flex-1"></div>
  </div>
);

export default function ContactInfo({ heading = "", subHeading = "" }) {
  const { globalVarsMap, footerSetting } = useGeneralSettings();

  // Extract variables with fallbacks
  const phoneVal = globalVarsMap?.PHONENUMBER || footerSetting?.contents?.footer_phone;
  const altPhoneVal = globalVarsMap?.ALTPHONENUMBER;
  const emailVal = globalVarsMap?.OFFICEEMAIL || footerSetting?.contents?.footer_email;
  const addressVal = globalVarsMap?.OFFICEADDRESS || footerSetting?.contents?.footer_address;

  return (
    <div className="w-full py-6 font-poppins space-y-12">
      {/* Header Section */}
      {/* {(heading || subHeading) && (
        <div className="text-center max-w-[800px] mx-auto mb-8">
          {heading ? <h2 className="pre_heading">{heading}</h2> : null}
          {subHeading ? <p className="sub_text mt-2 sm:mt-3">{subHeading}</p> : null}
        </div>
      )} */}

      {/* 3 Contact Cards Grid (Call, Email, Address) */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch max-w-[1050px] mx-auto">
        Card 1: Call Us On
        <div className="bg-white rounded-[24px] sm:rounded-[28px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-[#E2E8F0] flex flex-col items-center justify-start text-center transition-all hover:shadow-[0_10px_30px_rgba(92,172,196,0.18)] hover:-translate-y-1 h-full">
          <img src="/media/fr-svgs/phone-c.png" alt="call us on icon" width={102} height={102} className="w-[102px] h-[102px] object-contain" />
          <SectionDivider />
          <span className="text-xs sm:text-sm text-[#777777] font-medium mb-2.5 min-h-[20px] flex items-center justify-center">Call Us On</span>
          <div className="flex flex-col gap-1 text-sm sm:text-base font-semibold text-[#1F0060]">
            <a href={`tel:${phoneVal}`} className="hover:text-[#5CACC4] transition-colors">{phoneVal}</a>
            {altPhoneVal && (<a href={`tel:${altPhoneVal}`} className="hover:text-[#5CACC4] transition-colors">{altPhoneVal}</a>)}
          </div>
        </div>
        Card 2: Send us Email
        <div className="bg-white rounded-[24px] sm:rounded-[28px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-[#E2E8F0] flex flex-col items-center justify-start text-center transition-all hover:shadow-[0_10px_30px_rgba(92,172,196,0.18)] hover:-translate-y-1 h-full">
          <img src="/media/fr-svgs/email-c.png" alt="email icon" width={102} height={102} className="w-[102px] h-[102px] object-contain" />
          <SectionDivider />
          <span className="text-xs sm:text-sm text-[#777777] font-medium mb-2.5 min-h-[20px] flex items-center justify-center">Send us Email</span>
          <a href={`mailto:${emailVal}`} className="text-xs sm:text-sm font-semibold text-[#1F0060] hover:text-[#5CACC4] transition-colors break-all">{emailVal}</a>
        </div>
        Card 3: Our Office Address
        <div className="bg-white rounded-[24px] sm:rounded-[28px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-[#E2E8F0] flex flex-col items-center justify-start text-center transition-all hover:shadow-[0_10px_30px_rgba(92,172,196,0.18)] hover:-translate-y-1 h-full">
          <img src="/media/fr-svgs/pin-c.png" alt="address icon" width={102} height={102} className="w-[102px] h-[102px] object-contain" />
          <SectionDivider />
          <span className="text-xs sm:text-sm text-[#777777] font-medium mb-2.5 min-h-[20px] flex items-center justify-center">Our Office Address</span>
          <p className="text-xs sm:text-sm font-semibold text-[#1F0060] leading-relaxed max-w-[220px]">{addressVal}</p>
        </div>
      </div> */}

      {/* New Social Media Banner Section */}
      <SocialMediaSection />
    </div>
  );
}
