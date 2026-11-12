"use client";
import React from "react";
import Image from "next/image";
import { useGeneralSettings } from "../Context/GeneralSettingsContext";

export default function SocialMediaBannerSection({
  heading = "",
  subHeading = "",
}) {
  const { settings } = useGeneralSettings();

  const footerSocialData = Array.isArray(settings)
    ? settings.find((item) => item.ref_name === "Footer Social Media Icons")?.contents
    : null;

  // Extract dynamic links if available with sensible fallbacks
  let fbLink = "https://facebook.com/zippytravel";
  let instaLink = "https://instagram.com/zippytravel";
  let twitterLink = "https://twitter.com/zippytravel";
  let pinterestLink = "https://pinterest.com/zippytravel";

  if (footerSocialData && typeof footerSocialData === "object") {
    Object.entries(footerSocialData).forEach(([key, val]) => {
      if (key.startsWith("social_media_icons_input_")) {
        const url = String(val).toLowerCase();
        if (url.includes("facebook") || url.includes("fb")) fbLink = val;
        else if (url.includes("instagram") || url.includes("insta")) instaLink = val;
        else if (url.includes("twitter") || url.includes("x.com")) twitterLink = val;
        else if (url.includes("pinterest")) pinterestLink = val;
      }
    });
  }

  return (
    <section className="w-full py-6 md:py-10 font-poppins">
      {/* Optional Heading Section */}
      {(heading || subHeading) && (
        <div className="text-center max-w-[800px] mx-auto mb-10 sm:mb-14">
          {heading ? <h2 className="pre_heading">{heading}</h2> : null}
          {subHeading ? <p className="sub_text mt-2 sm:mt-3">{subHeading}</p> : null}
        </div>
      )}

      {/* Main Responsive Grid / Flex Container centered at max-w-[1360px] */}
      <div className="w-full max-w-[1360px] mx-auto px-14 sm:px-16 lg:px-20">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-4 xl:gap-8">

          {/* ══════════════ LEFT COLUMN (Facebook & Instagram) ══════════════ */}
          <div className="flex flex-col gap-6 sm:gap-7 w-full sm:w-auto items-center lg:items-end">
            
            {/* 1. Facebook Card */}
            <a
              href={fbLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Zippy Travel on Facebook"
              className="relative w-full max-w-[300px] sm:w-[300px] lg:w-[280px] xl:w-[310px] 2xl:w-[331px] h-[110px] bg-white rounded-[22px] border border-[#CBD5E1] shadow-[0_4px_20px_rgba(0,0,0,0.05)] pl-[52px] pr-4 py-3 flex flex-col justify-center text-left transition-all duration-300 hover:shadow-[0_8px_30px_rgba(92,172,196,0.22)] hover:-translate-y-1 group"
            >
              {/* Overlapping Left Icon Badge: 70px x 77px */}
              <div className="absolute -left-[40px] top-1/2 -translate-y-1/2 w-[70px] h-[77px] bg-[#5CACC4] rounded-[18px] flex items-center justify-center shadow-[0_4px_14px_rgba(92,172,196,0.45)] group-hover:scale-105 transition-transform duration-300 z-10">
                <Image
                  src="/facebook-1.png"
                  alt="Facebook"
                  width={20}
                  height={32}
                  className="w-[20px] h-[32px] object-contain brightness-0 invert"
                />
              </div>
              <span className="text-[#5CACC4] text-[16px] lg:text-[17px] xl:text-[20px] font-bold leading-tight">
                Facebook
              </span>
              <span className="text-[#1F0060] text-[20px] lg:text-[22px] xl:text-[32px] font-bold leading-tight mt-0.5 tracking-tight truncate">
                /zippytravel
              </span>
            </a>

            {/* 2. Instagram Card */}
            <a
              href={instaLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Zippy Travel on Instagram"
              className="relative w-full max-w-[300px] sm:w-[300px] lg:w-[280px] xl:w-[310px] 2xl:w-[331px] h-[110px] bg-white rounded-[22px] border border-[#CBD5E1] shadow-[0_4px_20px_rgba(0,0,0,0.05)] pl-[52px] pr-4 py-3 flex flex-col justify-center text-left transition-all duration-300 hover:shadow-[0_8px_30px_rgba(92,172,196,0.22)] hover:-translate-y-1 group"
            >
              {/* Overlapping Left Icon Badge: 70px x 77px */}
              <div className="absolute -left-[40px] top-1/2 -translate-y-1/2 w-[70px] h-[77px] bg-[#5CACC4] rounded-[18px] flex items-center justify-center shadow-[0_4px_14px_rgba(92,172,196,0.45)] group-hover:scale-105 transition-transform duration-300 z-10">
                <Image
                  src="/instagram-2.png"
                  alt="Instagram"
                  width={30}
                  height={30}
                  className="w-[30px] h-[30px] object-contain"
                />
              </div>
              <span className="text-[#5CACC4] text-[16px] lg:text-[17px] xl:text-[20px] font-bold leading-tight">
                Instagram
              </span>
              <span className="text-[#1F0060] text-[20px] lg:text-[22px] xl:text-[32px] font-bold leading-tight mt-0.5 tracking-tight truncate">
                /zippytravel/
              </span>
            </a>

          </div>

          {/* ══════════════ CENTER DIV (387px x 260px, bg #1F0060) ══════════════ */}
          {/* Image is 239px x 314px, bottom aligned inside, pops out of the top */}
          <div className="relative w-full max-w-[340px] sm:w-[340px] lg:w-[320px] xl:w-[360px] 2xl:w-[387px] h-[260px] bg-[#1F0060] rounded-[28px] my-6 lg:my-0 flex-shrink-0 shadow-[0_12px_40px_rgba(31,0,96,0.25)]">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[239px] h-[314px] pointer-events-none select-none">
              <Image
                src="/social-media-image.png"
                alt="Social Media Experience"
                width={239}
                height={314}
                priority
                className="w-[239px] h-[314px] object-contain object-bottom"
              />
            </div>
          </div>

          {/* ══════════════ RIGHT COLUMN (Twitter & Pinterest) ══════════════ */}
          <div className="flex flex-col gap-6 sm:gap-7 w-full sm:w-auto items-center lg:items-start">

            {/* 3. Twitter Card */}
            <a
              href={twitterLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Zippy Travel on Twitter"
              className="relative w-full max-w-[300px] sm:w-[300px] lg:w-[280px] xl:w-[310px] 2xl:w-[331px] h-[110px] bg-white rounded-[22px] border border-[#CBD5E1] shadow-[0_4px_20px_rgba(0,0,0,0.05)] pr-[52px] pl-4 py-3 flex flex-col justify-center text-right transition-all duration-300 hover:shadow-[0_8px_30px_rgba(92,172,196,0.22)] hover:-translate-y-1 group"
            >
              {/* Overlapping Right Icon Badge: 70px x 77px */}
              <div className="absolute -right-[40px] top-1/2 -translate-y-1/2 w-[70px] h-[77px] bg-[#5CACC4] rounded-[18px] flex items-center justify-center shadow-[0_4px_14px_rgba(92,172,196,0.45)] group-hover:scale-105 transition-transform duration-300 z-10">
                <Image
                  src="/twitter-2.png"
                  alt="Twitter"
                  width={28}
                  height={28}
                  className="w-[28px] h-[28px] object-contain brightness-0 invert"
                />
              </div>
              <span className="text-[#5CACC4] text-[16px] lg:text-[17px] xl:text-[20px] font-bold leading-tight">
                Twitter
              </span>
              <span className="text-[#1F0060] text-[20px] lg:text-[22px] xl:text-[32px] font-bold leading-tight mt-0.5 tracking-tight truncate">
                /zippytravel
              </span>
            </a>

            {/* 4. Pinterest Card */}
            <a
              href={pinterestLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Zippy Travel on Pinterest"
              className="relative w-full max-w-[300px] sm:w-[300px] lg:w-[280px] xl:w-[310px] 2xl:w-[331px] h-[110px] bg-white rounded-[22px] border border-[#CBD5E1] shadow-[0_4px_20px_rgba(0,0,0,0.05)] pr-[52px] pl-4 py-3 flex flex-col justify-center text-right transition-all duration-300 hover:shadow-[0_8px_30px_rgba(92,172,196,0.22)] hover:-translate-y-1 group"
            >
              {/* Overlapping Right Icon Badge: 70px x 77px */}
              <div className="absolute -right-[40px] top-1/2 -translate-y-1/2 w-[70px] h-[77px] bg-[#5CACC4] rounded-[18px] flex items-center justify-center shadow-[0_4px_14px_rgba(92,172,196,0.45)] group-hover:scale-105 transition-transform duration-300 z-10">
                <Image
                  src="/social-2.png"
                  alt="Pinterest"
                  width={28}
                  height={30}
                  className="w-[28px] h-[30px] object-contain"
                />
              </div>
              <span className="text-[#5CACC4] text-[16px] lg:text-[17px] xl:text-[20px] font-bold leading-tight">
                Pinterest
              </span>
              <span className="text-[#1F0060] text-[20px] lg:text-[22px] xl:text-[32px] font-bold leading-tight mt-0.5 tracking-tight truncate">
                /zippytravel/
              </span>
            </a>

          </div>

        </div>
      </div>
    </section>
  );
}

