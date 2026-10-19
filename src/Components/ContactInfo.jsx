"use client";
import React from "react";
import { Phone, Mail, MapPin, Share2 } from "lucide-react";
import { useGeneralSettings } from "../Context/GeneralSettingsContext";
import { BASE_URL_IMG } from "../Helpers/imageurl";
import { FaFacebookF, FaInstagram, FaWhatsapp, FaYoutube } from "react-icons/fa";

const CircleIcon = ({ children }) => (
  <div className="w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] rounded-full border-[1.5px] border-[#D4A373] shadow-[3px_3px_0_0_#F7CCA5] flex items-center justify-center bg-white shrink-0">
    {children}
  </div>
);

const SectionDivider = () => (
  <div className="flex items-center justify-center my-3 w-28 sm:w-32">
    <div className="h-[1px] bg-[#E0B892] flex-1"></div>
    <div className="w-2.5 h-2.5 rounded-full border border-[#E0B892] bg-white mx-1.5 flex-shrink-0"></div>
    <div className="h-[1px] bg-[#E0B892] flex-1"></div>
  </div>
);

export default function ContactInfo({ heading = "", subHeading = "" }) {
  const { globalVariables, globalVarsMap, settings, footerSetting } = useGeneralSettings();

  // Extract variables with fallbacks
  const phoneVal = globalVarsMap?.PHONENUMBER || footerSetting?.contents?.footer_phone;
  const altPhoneVal = globalVarsMap?.ALTPHONENUMBER;
  const emailVal = globalVarsMap?.OFFICEEMAIL || footerSetting?.contents?.footer_email;
  const addressVal = globalVarsMap?.OFFICEADDRESS || footerSetting?.contents?.footer_address;

  // Social Media Data from settings
  const footerSocialData = Array.isArray(settings)
    ? settings.find((item) => item.ref_name === "Footer Social Media Icons")?.contents
    : null;

  return (
    <div className="w-full py-6 font-quicksand">
      {/* Header Section */}
      <div className="section_heading heading_section mb-8">
        {heading ? <h2 className="pre_heading">{heading}</h2> : null}
        {subHeading ? <p className="sub_text">{subHeading}</p> : null}
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {/* Card 1: Call Us On */}
        <div className="bg-white rounded-[28px] sm:rounded-[32px] p-6 shadow-[0_8px_28px_rgba(0,0,0,0.12)] border border-gray-100 flex flex-col items-center justify-start text-center transition-all hover:shadow-[0_12px_35px_rgba(0,0,0,0.18)] h-full">
          <img src="/media/fr-svgs/phone-c.png" alt="call us on icon" width={102} height={102} className="w-[102px] h-[102px] object-contain" />

          <SectionDivider />

          <span className="text-xs sm:text-sm text-[#777777] font-medium mb-2.5 min-h-[20px] flex items-center justify-center">
            Call Us On
          </span>

          <div className="flex flex-col gap-0.5 text-sm sm:text-base font-semibold text-[#333333]">
            <a href={`tel:${phoneVal}`} className="hover:text-[#F1A868] transition-colors">
              {phoneVal}
            </a>
            {altPhoneVal && (
              <a href={`tel:${altPhoneVal}`} className="hover:text-[#F1A868] transition-colors">
                {altPhoneVal}
              </a>
            )}
          </div>
        </div>

        {/* Card 2: Send us Email */}
        <div className="bg-white rounded-[28px] sm:rounded-[32px] p-6 shadow-[0_8px_28px_rgba(0,0,0,0.12)] border border-gray-100 flex flex-col items-center justify-start text-center transition-all hover:shadow-[0_12px_35px_rgba(0,0,0,0.18)] h-full">
          <img src="/media/fr-svgs/email-c.png" alt="email icon" width={102} height={102} className="w-[102px] h-[102px] object-contain" />
          <SectionDivider />

          <span className="text-xs sm:text-sm text-[#777777] font-medium mb-2.5 min-h-[20px] flex items-center justify-center">
            Send us Email
          </span>

          <a
            href={`mailto:${emailVal}`}
            className="text-xs sm:text-sm font-semibold text-[#333333] hover:text-[#F1A868] transition-colors break-all"
          >
            {emailVal}
          </a>
        </div>

        {/* Card 3: Our Office Address */}
        <div className="bg-white rounded-[28px] sm:rounded-[32px] p-6 shadow-[0_8px_28px_rgba(0,0,0,0.12)] border border-gray-100 flex flex-col items-center justify-start text-center transition-all hover:shadow-[0_12px_35px_rgba(0,0,0,0.18)] h-full">
          <img src="/media/fr-svgs/pin-c.png" alt="address icon" width={102} height={102} className="w-[102px] h-[102px] object-contain" />

          <SectionDivider />

          <span className="text-xs sm:text-sm text-[#777777] font-medium mb-2.5 min-h-[20px] flex items-center justify-center">
            Our Office Address
          </span>

          <p className="text-xs sm:text-sm font-semibold text-[#333333] leading-relaxed max-w-[220px]">
            {addressVal}
          </p>
        </div>

        {/* Card 4: Visit Our Social Media */}
        <div className="bg-white rounded-[28px] sm:rounded-[32px] p-6 shadow-[0_8px_28px_rgba(0,0,0,0.12)] border border-gray-100 flex flex-col items-center justify-start text-center transition-all hover:shadow-[0_12px_35px_rgba(0,0,0,0.18)] h-full">
          <img src="/media/fr-svgs/social-c.png" alt="social icon" width={102} height={102} className="w-[102px] h-[102px] object-contain" />

          <SectionDivider />

          <span className="text-xs sm:text-sm text-[#777777] font-medium mb-2.5 min-h-[20px] flex items-center justify-center">
            Visit Our Social Media
          </span>

          {/* Social Icons Row */}
          {footerSocialData?.enable_social_media_icons === "1" && typeof footerSocialData === "object" ? (
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {Object.entries(footerSocialData)
                .filter(
                  ([key]) =>
                    key.startsWith("social_media_icons_") &&
                    !key.includes("input") &&
                    !key.includes("alt") &&
                    footerSocialData[key]
                )
                .map(([key, iconUrl], index) => {
                  const indexNum = key.split("_").pop();
                  const inputKey = `social_media_icons_input_${indexNum}`;
                  const altKey = `social_media_icons_alt_input_${indexNum}`;

                  const link = footerSocialData[inputKey] || "#";
                  const altText = footerSocialData[altKey] || "";

                  return (
                    <a
                      key={index}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:scale-110 transition-transform"
                    >
                      <img
                        src={`${BASE_URL_IMG}/${iconUrl}`}
                        alt={altText}
                        className="w-[41px] h-[39px] object-contain"
                      />
                    </a>
                  );
                })}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <p className="text-xs sm:text-sm text-[#777777] font-medium mb-2.5 min-h-[20px] flex items-center justify-center">
                No social media icons found
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
