"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function CheapestFlightFares({
  heading = "Cheapest Flight Fares",
  subheading = "Our customers can access our web site for a 'one-stop shop' including access to specially negotiated airfares, hotels, car rental and insurance.",
}) {
  return (
    <section className="w-full py-10 sm:py-14 md:py-16 lg:py-20 bg-white font-poppins overflow-hidden">
      {/* 
        Full-width Container:
        - Matches AirlineSlider's exact container padding (px-2 sm:px-4 md:px-6 lg:px-8)
        - Starts right from the left with zero extra offset or gap
      */}
      <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
        {/* Section Heading & Subtitle */}
        <div className="text-center max-w-[900px] mx-auto mb-8 sm:mb-12 lg:mb-14 px-4">
          <h2 className="font-poppins font-bold text-[26px] sm:text-[32px] md:text-[38px] xl:text-[42px] 2xl:text-[46px] text-[#1F0060] tracking-tight leading-tight">
            {heading}
          </h2>
          <p className="font-poppins font-normal text-[14px] sm:text-[16px] md:text-[17px] xl:text-[18px] text-[#555555] mt-3 sm:mt-4 leading-relaxed">
            {subheading}
          </p>
        </div>

        {/* 
          Main Full-Width Grid:
          - Zero left gap: starts immediately at the left edge
          - Mobile (< 768px): Single column stack
          - Tablet (768px - 1199px): Balanced 2x2 grid (Col 1 & 2 top, Col 3 & 4 bottom)
          - Desktop & Full-screen (1200px+): 4 columns stretching 100% across the full width
          - Column ratios: 285fr : 387fr : 285fr : 263fr
        */}
        {/* 
          Grid layout:
          - Mobile (< 768px): 1 col stack
          - Tablet md (768px-1023px): 2 col — Col1 & Col2 on top, Col3 cards side-by-side below
          - Large tablet / Small laptop lg (1024px-1279px): 3 col — Col1, Col2, Col3 side by side ("aamne saamne")
          - Desktop xl+ (1280px+): 4 col proportional [285fr 387fr 285fr 263fr] with airplane
        */}
        <div 
          className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[285fr_387fr_285fr_263fr] gap-6 xl:gap-[20px] 2xl:gap-[24px] xl:pl-[80px]"
        >
          {/* Col1: United States & UAE */}
          <div className="w-full flex flex-col gap-[20px] xl:gap-[26px]">
            {/* Card 1: United States */}
            <div className="w-full h-[260px] sm:h-[282px] 2xl:h-[310px] 3xl:h-[340px] rounded-[28px] sm:rounded-[32px] overflow-hidden relative shadow-[0_10px_30px_rgba(0,0,0,0.12)] group">
              <img
                src="/Photo.png"
                alt="Flights to United States"
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

              {/* Overlay: bottom: 29px, left: 18px, right: 15px */}
              <div className="absolute bottom-[24px] sm:bottom-[29px] left-[16px] sm:left-[18px] right-[14px] sm:right-[15px] flex items-end justify-between z-10">
                <div className="flex flex-col text-left">
                  <span className="font-poppins font-normal text-[16px] sm:text-[18px] text-white/90 leading-tight">
                    Flights to
                  </span>
                  <span className="font-poppins font-medium text-[18px] sm:text-[20px] 2xl:text-[22px] text-white leading-tight mt-[2px]">
                    United States
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-poppins font-medium text-[22px] sm:text-[24px] 2xl:text-[26px] text-white leading-none">
                    £ 488
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = "tel:02039232255";
                    }}
                    className="mt-[3px] w-[86px] h-[26px] bg-[#1F0060] hover:bg-[#2c0087] text-white font-poppins font-medium text-[12px] rounded-[6px] flex items-center justify-center transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    Call Us
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2: UAE */}
            <div className="w-full h-[260px] sm:h-[282px] 2xl:h-[310px] 3xl:h-[340px] rounded-[28px] sm:rounded-[32px] overflow-hidden relative shadow-[0_10px_30px_rgba(0,0,0,0.12)] group">
              <img
                src="/Photo1.png"
                alt="Flights to UAE"
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

              {/* Overlay: bottom: 29px, left: 18px, right: 15px */}
              <div className="absolute bottom-[24px] sm:bottom-[29px] left-[16px] sm:left-[18px] right-[14px] sm:right-[15px] flex items-end justify-between z-10">
                <div className="flex flex-col text-left">
                  <span className="font-poppins font-normal text-[16px] sm:text-[18px] text-white/90 leading-tight">
                    Flights to
                  </span>
                  <span className="font-poppins font-medium text-[18px] sm:text-[20px] 2xl:text-[22px] text-white leading-tight mt-[2px]">
                    UAE
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-poppins font-medium text-[22px] sm:text-[24px] 2xl:text-[26px] text-white leading-none">
                    £ 488
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = "tel:02039232255";
                    }}
                    className="mt-[3px] w-[86px] h-[26px] bg-[#1F0060] hover:bg-[#2c0087] text-white font-poppins font-medium text-[12px] rounded-[6px] flex items-center justify-center transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    Call Us
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Col2: Thailand + MORE Button */}
          <div className="w-full flex flex-col">
            {/* Top Card: Thailand */}
            <div className="w-full h-[320px] sm:h-[382px] 2xl:h-[420px] 3xl:h-[460px] rounded-[28px] sm:rounded-[32px] overflow-hidden relative shadow-[0_10px_30px_rgba(0,0,0,0.12)] group">
              <img
                src="/Photo2.png"
                alt="Flights to Thailand"
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

              {/* Overlay: bottom: 38px, left: 26px, right: 26px */}
              <div className="absolute bottom-[28px] sm:bottom-[38px] left-[20px] sm:left-[26px] right-[20px] sm:right-[26px] flex items-end justify-between z-10">
                <div className="flex flex-col text-left">
                  <span className="font-poppins font-normal text-[16px] sm:text-[18px] text-white/90 leading-tight">
                    Flights to
                  </span>
                  <span className="font-poppins font-medium text-[18px] sm:text-[20px] 2xl:text-[22px] text-white leading-tight mt-[2px]">
                    Thailand
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-poppins font-medium text-[22px] sm:text-[24px] 2xl:text-[26px] text-white leading-none">
                    £ 488
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = "tel:02039232255";
                    }}
                    className="mt-[3px] w-[86px] h-[26px] bg-[#1F0060] hover:bg-[#2c0087] text-white font-poppins font-medium text-[12px] rounded-[6px] flex items-center justify-center transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    Call Us
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom: MORE Button (387px x 131px) + Flight Fares! Text */}
            <div className="w-full mt-[16px] sm:mt-[20px] flex flex-col items-center">
              <Link
                href="/flightDetails"
                className="w-full h-[100px] sm:h-[131px] 2xl:h-[145px] 3xl:h-[160px] bg-[#1F0060] hover:bg-[#2c0087] rounded-[22px] sm:rounded-[25px] flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all cursor-pointer group"
              >
                <span className="font-poppins font-bold text-[56px] sm:text-[76px] xl:text-[88px] 2xl:text-[96px] text-white tracking-tight leading-none select-none">
                  MORE
                </span>
              </Link>
              {/* Flight Fares! (Font size: 41px, Weight: 700, Color: #5CACC4) */}
              <Link
                href="/flightDetails"
                className="font-poppins font-bold text-[28px] sm:text-[34px] xl:text-[41px] 2xl:text-[46px] text-[#5CACC4] tracking-tight uppercase leading-tight mt-2 sm:mt-3 text-center select-none hover:opacity-90 transition-opacity"
              >
                FLIGHT FARES!
              </Link>
            </div>
          </div>

          {/* Col3: Netherlands & Australia */}
          <div className="w-full md:col-span-2 lg:col-span-1 grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-col gap-[20px] xl:gap-[26px]">
            {/* Card 1: Netherlands */}
            <div className="w-full h-[260px] sm:h-[282px] 2xl:h-[310px] 3xl:h-[340px] rounded-[28px] sm:rounded-[32px] overflow-hidden relative shadow-[0_10px_30px_rgba(0,0,0,0.12)] group">
              <img
                src="/Photo3.png"
                alt="Flights to Netherlands"
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

              {/* Overlay: bottom: 29px, left: 18px, right: 15px */}
              <div className="absolute bottom-[24px] sm:bottom-[29px] left-[16px] sm:left-[18px] right-[14px] sm:right-[15px] flex items-end justify-between z-10">
                <div className="flex flex-col text-left">
                  <span className="font-poppins font-normal text-[16px] sm:text-[18px] text-white/90 leading-tight">
                    Flights to
                  </span>
                  <span className="font-poppins font-medium text-[18px] sm:text-[20px] 2xl:text-[22px] text-white leading-tight mt-[2px]">
                    Netherlands
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-poppins font-medium text-[22px] sm:text-[24px] 2xl:text-[26px] text-white leading-none">
                    £ 488
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = "tel:02039232255";
                    }}
                    className="mt-[3px] w-[86px] h-[26px] bg-[#1F0060] hover:bg-[#2c0087] text-white font-poppins font-medium text-[12px] rounded-[6px] flex items-center justify-center transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    Call Us
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2: Australia */}
            <div className="w-full h-[260px] sm:h-[282px] 2xl:h-[310px] 3xl:h-[340px] rounded-[28px] sm:rounded-[32px] overflow-hidden relative shadow-[0_10px_30px_rgba(0,0,0,0.12)] group">
              <img
                src="/Photo4.png"
                alt="Flights to Australia"
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

              {/* Overlay: bottom: 29px, left: 18px, right: 15px */}
              <div className="absolute bottom-[24px] sm:bottom-[29px] left-[16px] sm:left-[18px] right-[14px] sm:right-[15px] flex items-end justify-between z-10">
                <div className="flex flex-col text-left">
                  <span className="font-poppins font-normal text-[16px] sm:text-[18px] text-white/90 leading-tight">
                    Flights to
                  </span>
                  <span className="font-poppins font-medium text-[18px] sm:text-[20px] 2xl:text-[22px] text-white leading-tight mt-[2px]">
                    Australia
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-poppins font-medium text-[22px] sm:text-[24px] 2xl:text-[26px] text-white leading-none">
                    £ 488
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = "tel:02039232255";
                    }}
                    className="mt-[3px] w-[86px] h-[26px] bg-[#1F0060] hover:bg-[#2c0087] text-white font-poppins font-medium text-[12px] rounded-[6px] flex items-center justify-center transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    Call Us
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* COLUMN 4: Cyan Card + Airplane                            */}
          {/* HIDDEN below xl (1280px) — Col 3 takes bottom-left slot  */}
          {/* ========================================================= */}
          <div className="hidden xl:block xl:h-[590px] 2xl:h-[640px] bg-[#5CACC4] rounded-[40px] relative overflow-visible shadow-lg">

            {/* xl+ (1280px+): Original overlapping design */}
            <div className="absolute top-[74px] 2xl:top-[80px] right-0 w-[540px] 2xl:w-[620px] h-[612px] 2xl:h-[660px] pointer-events-none select-none z-20">
              <img
                src="/flight-plane.png"
                onError={(e) => {
                  e.currentTarget.src = "/flight%20image%202.png";
                }}
                alt="Airplane"
                className="w-full h-full object-contain object-right"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
