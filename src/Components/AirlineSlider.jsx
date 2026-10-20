"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";

// 8 primary partner airlines from the 1360px design image
const BASE_AIRLINES = [
  {
    id: 1,
    name: "Air China",
    logo: "/air-china.png",
    fallback: "/Air-China-Logo%202.png",
    href: "/airline",
  },
  {
    id: 2,
    name: "Malaysia Airlines",
    logo: "/malaysia-airlines.png",
    fallback: "/587b51ad44060909aa603a8f%202.png",
    href: "/airline",
  },
  {
    id: 3,
    name: "Etihad Airways",
    logo: "/etihad.png",
    fallback: "/Etihad-airways-logo.svg%202.png",
    href: "/airline",
  },
  {
    id: 4,
    name: "Ethiopian Airlines",
    logo: "/ethiopian.png",
    fallback: "/Ethiopian_Airlines-Logo.wine%201.png",
    href: "/airline",
  },
  {
    id: 5,
    name: "Gulf Air",
    logo: "/gulf-air.png",
    fallback: "/Gulf-Air-logo%202.png",
    href: "/airline",
  },
  {
    id: 6,
    name: "EgyptAir",
    logo: "/egyptair.png",
    fallback: "/EgyptAir-Logo.wine%201.png",
    href: "/airline",
  },
  {
    id: 7,
    name: "Royal Jordanian",
    logo: "/royal-jordanian.png",
    fallback: "/Royal_Jordanian-Logo.wine%202.png",
    href: "/airline",
  },
  {
    id: 8,
    name: "Qantas",
    logo: "/qantas.png",
    fallback: "/qantas-logo-png-transparent%202.png",
    href: "/airline",
  },
];

// Extra airlines: Hidden at 1360px (and below) so 1360px keeps only original 9 items (3x3)
// Visible only on full-screen (2xl: >= 1536px) to form a balanced 4-in-a-row (4x3) layout
const EXTRA_AIRLINES = [
  {
    id: 9,
    name: "Emirates",
    logo: "/emirates.svg",
    fallback: "/airlinebg.png",
    href: "/airline",
  },
  {
    id: 10,
    name: "Singapore Airlines",
    logo: "/singapore-airlines.svg",
    fallback: "/airlinebg.png",
    href: "/airline",
  },
  {
    id: 11,
    name: "British Airways",
    logo: "/british-airways.svg",
    fallback: "/airlinebg.png",
    href: "/airline",
  },
];

export default function AirlineSlider({
  heading = "Association with Leading Airlines",
  subheading = "Our customers can access our web site for a 'one-stop shop' including access to specially negotiated airfares, hotels, car rental and insurance.",
}) {
  return (
    <section className="w-full py-10 sm:py-14 lg:py-16 bg-white font-poppins">
      {/* 
        Full-width Container: Takes full screen width with clean responsive edge padding
        matches hero banner full-width style
      */}
      <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
        {/* Section Heading & Subtitle (Centered) */}
        <div className="text-center max-w-[900px] mx-auto mb-8 sm:mb-12 lg:mb-14 px-4">
          <h2 className="font-poppins font-bold text-[28px] sm:text-[34px] lg:text-[42px] text-[#000000] tracking-tight leading-tight">
            {heading}
          </h2>
          <p className="font-poppins font-normal text-[15px] sm:text-[17px] lg:text-[18px] text-[#555555] mt-3 sm:mt-4 leading-relaxed">
            {subheading}
          </p>
        </div>

        {/* 
          Main Partner Card Container:
          - Full-width dark navy (#1F0060) card
          - Rounded corners rounded-[30px] sm:rounded-[40px]
          - overflow-visible so the airhostess cap pops out above the top edge
        */}
        <div className="w-full bg-[#1F0060] rounded-[30px] sm:rounded-[40px] shadow-2xl relative overflow-visible flex flex-col xl:flex-row items-center xl:items-stretch min-h-[480px]">
          {/* 
            Left Airhostess Div:
            - 365px width at 1360px+
            - 480px height
            - Soft pale grey-blue background (#EEF3F7)
          */}
          <div className="w-full xl:w-[365px] h-[380px] sm:h-[440px] xl:h-[480px] bg-[#EEF3F7] rounded-t-[30px] xl:rounded-t-none xl:rounded-l-[40px] xl:rounded-r-[40px] relative flex items-end justify-center shrink-0 overflow-visible">
            {/* 
              Airhostess Image:
              - Width: 292px, Height: 528px
              - bottom-0 anchored, sticks 48px out of top of 480px div
            */}
            <img
              src="/airhostess.png"
              onError={(e) => {
                e.currentTarget.src = "/airline%20section%20-%20image%202.png";
              }}
              alt="Airhostess"
              className="w-[240px] sm:w-[270px] xl:w-[292px] h-[430px] sm:h-[480px] xl:h-[528px] object-contain object-bottom absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none select-none z-10 drop-shadow-md"
            />
          </div>

          {/* 
            Right Grid Area:
            - Full Screen (2xl: >= 1536px): 4-4 per row (2xl:grid-cols-4), all 12 items visible
            - 1360px / Laptops (lg / xl): 3 per row (lg:grid-cols-3), extra items HIDDEN, only original 9 items visible
            - Tablets (sm): 2 per row
            - Mobile: 1 per row
          */}
          <div className="flex-1 w-full p-4 sm:p-6 xl:py-[20px] xl:pl-[24px] xl:pr-[30px] 2xl:pr-[35px] flex items-center justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-[12px] sm:gap-[15px] xl:gap-[16px] 2xl:gap-[18px] w-full justify-items-stretch">
              {/* Primary 8 Airline Cards — Always visible */}
              {BASE_AIRLINES.map((airline) => (
                <Link
                  key={airline.id}
                  href={airline.href}
                  className="w-full h-[100px] sm:h-[110px] xl:h-[120px] bg-white rounded-[20px] flex items-center justify-center p-4 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group cursor-pointer"
                >
                  <img
                    src={airline.logo}
                    onError={(e) => {
                      if (airline.fallback) e.currentTarget.src = airline.fallback;
                    }}
                    alt={airline.name}
                    className="max-h-[50px] sm:max-h-[55px] xl:max-h-[62px] max-w-[190px] xl:max-w-[220px] w-auto h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>
              ))}

              {/* 
                Extra 3 Airlines:
                - HIDDEN at 1360px and smaller screens (hidden)
                - VISIBLE ONLY on Full Screen (hidden 2xl:flex)
                - This ensures 1360px displays strictly the original 3x3 (9 items) without any extras
              */}
              {EXTRA_AIRLINES.map((airline) => (
                <Link
                  key={airline.id}
                  href={airline.href}
                  className="hidden 2xl:flex w-full h-[100px] sm:h-[110px] xl:h-[120px] bg-white rounded-[20px] items-center justify-center p-4 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group cursor-pointer"
                >
                  <img
                    src={airline.logo}
                    onError={(e) => {
                      if (airline.fallback) e.currentTarget.src = airline.fallback;
                    }}
                    alt={airline.name}
                    className="max-h-[50px] sm:max-h-[55px] xl:max-h-[62px] max-w-[190px] xl:max-w-[220px] w-auto h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>
              ))}

              {/* 
                MORE AIRLINES Button Card (Always visible):
                - At 1360px: 9th card (sitting in row 3, column 3 of the 3x3 grid)
                - At 2xl Full Screen: 12th card (sitting in row 3, column 4 of the 4x3 grid)
                - Background: #EBF3F6
                - Rounded: rounded-[20px]
                - "MORE": 66px 700 #1F0060
                - "AIRLINES": 30px 700 #5CACC4
              */}
              <Link
                href="/airline"
                className="w-full h-[100px] sm:h-[110px] xl:h-[120px] bg-[#EBF3F6] hover:bg-[#d8eaf1] rounded-[20px] flex flex-col items-center justify-center shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer select-none leading-none text-center"
              >
                <span className="font-poppins font-bold text-[36px] sm:text-[46px] xl:text-[66px] text-[#1F0060] leading-[0.88] tracking-tight">
                  MORE
                </span>
                <span className="font-poppins font-bold text-[17px] sm:text-[22px] xl:text-[30px] text-[#5CACC4] leading-tight tracking-wider mt-[2px] xl:mt-[4px]">
                  AIRLINES
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
