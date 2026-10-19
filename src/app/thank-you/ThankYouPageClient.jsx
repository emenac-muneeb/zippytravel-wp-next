"use client";
import React from "react";
import Link from "next/link";
import { BASE_URL_IMG } from "../../Helpers/imageurl";

export default function ThankYouPageClient() {
  return (
    <>
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-12">
        <div className="flex flex-col min-[1150px]:flex-row items-center justify-center min-[1150px]:justify-between gap-8 min-[1150px]:gap-[24px]">
          {/* Left Column: Thank You Text + Smiley SVG + Subtext + Buttons */}
          <div className="w-full min-[1150px]:w-auto flex flex-col items-center min-[1150px]:items-start shrink-0">
            {/* Wrapper to keep THANK above YOU left-aligned, while centering the wrapper itself on mobile */}
            <div className="flex flex-col items-start text-left w-fit">
              {/* THANK */}
              <h1 className="text-[44px] sm:text-[68px] md:text-[80px] min-[1150px]:text-[84px] xl:text-[96px] font-black text-[#EB9448] tracking-wider leading-none uppercase select-none">
                THANK
              </h1>

              {/* Y + Smiley SVG + U + Subtext */}
              <div className="flex flex-wrap sm:flex-nowrap items-center">
                <div className="flex items-center shrink-0">
                  <span className="text-[44px] sm:text-[68px] md:text-[80px] min-[1150px]:text-[84px] xl:text-[96px] font-black text-[#EB9448] tracking-wider leading-none uppercase select-none">
                    Y
                  </span>

                  {/* Smiley SVG replacing "O" */}
                  <svg
                    width="92"
                    height="92"
                    viewBox="0 0 100 100"
                    className="w-10 h-10 sm:w-[56px] sm:h-[56px] md:w-[68px] md:h-[68px] min-[1150px]:w-[76px] min-[1150px]:h-[76px] xl:w-[86px] xl:h-[86px] drop-shadow-md shrink-0 inline-block"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Golden circular border with cream background */}
                    <circle cx="50" cy="50" r="45" fill="#FAF4EB" stroke="#C89B65" strokeWidth="6" />
                    {/* Left eye arc */}
                    <path d="M30 42 C 34 33, 42 33, 46 42" stroke="#8C5C2B" strokeWidth="5" strokeLinecap="round" fill="none" />
                    {/* Right eye arc */}
                    <path d="M54 42 C 58 33, 66 33, 70 42" stroke="#8C5C2B" strokeWidth="5" strokeLinecap="round" fill="none" />
                    {/* Smile mouth */}
                    <path d="M34 58 C 42 74, 58 74, 66 58" stroke="#8C5C2B" strokeWidth="5" strokeLinecap="round" fill="none" />
                  </svg>

                  <span className="text-[44px] sm:text-[68px] md:text-[80px] min-[1150px]:text-[84px] xl:text-[96px] font-black text-[#EB9448] tracking-wider leading-none uppercase select-none">
                    U
                  </span>
                </div>

                {/* Message subtext */}
                <div className="flex flex-col text-[#555555] text-xs sm:text-sm md:text-[16px] xl:text-[17px] font-normal leading-relaxed max-w-[280px] sm:max-w-[300px]">
                  <span>We have received your enquiry</span>
                  <span>One of Our agent will get back to</span>
                  <span>you with in 24 Hours</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center min-[1150px]:justify-start gap-4 sm:gap-6 min-[1150px]:gap-8 min-[1250px]:gap-16 min-[1360px]:gap-[166px] mt-6 sm:mt-10 w-full min-[1150px]:w-auto">
              <Link
                href="/"
                className="bg-[#A57233] hover:bg-[#8f622c] text-white text-xs sm:text-sm md:text-base font-semibold px-4 sm:px-5 min-[1360px]:px-6 py-2.5 sm:py-3 rounded-[12px] shadow-md transition-colors flex items-center gap-2 shrink-0"
              >
                Done <span className="text-sm md:text-base">→</span>
              </Link>

              <Link
                href="/"
                className="bg-[#A57233] hover:bg-[#8f622c] text-white text-xs sm:text-sm md:text-base font-semibold px-4 sm:px-5 min-[1360px]:px-6 py-2.5 sm:py-3 rounded-[12px] shadow-md transition-colors flex items-center gap-2 shrink-0"
              >
                Continue More Searching <span className="text-sm md:text-base">→</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Image scaling smoothly below 1360px and exactly 760px x 460px on 1360px+ */}
          <div className="w-full min-[1150px]:flex-1 min-[1150px]:max-w-[580px] min-[1250px]:max-w-[650px] min-[1360px]:max-w-[760px] min-[1360px]:w-[760px] flex items-center justify-center min-[1150px]:justify-end">
            <img
              // src={`${BASE_URL_IMG}/assets/svgs/thank-you`}
              src={'/thank-you.png'}
              alt="Thank You Customer Flight Cabin"
              width={760}
              height={460}
              className="w-full max-w-[760px] h-[240px] sm:h-[340px] md:h-[380px] min-[1150px]:h-[400px] min-[1250px]:h-[430px] min-[1360px]:h-[460px] object-cover rounded-[24px] sm:rounded-[32px]"
            />
          </div>
        </div>
      </div>
    </>
  );
}