"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { BASE_URL_IMG } from "../Helpers/imageurl";

/** Card (295+100) + pt-4 + pagination 78 — keep in sync with DestinationSliderSkeleton */
const DEST_SLIDER_STRIP_MIN_H = "min-h-[488px] sm:min-h-[500px]";

const SLIDER_BREAKPOINTS = {
  576: { slidesPerView: 1.5, spaceBetween: 20 },
  652: { slidesPerView: 1.8, spaceBetween: 20 },
  768: { slidesPerView: 2.2, spaceBetween: 20 },
  1024: { slidesPerView: 2.6, spaceBetween: 20 },
  1199: { slidesPerView: 3.3, spaceBetween: 20 },
  1400: { slidesPerView: 3.8, spaceBetween: 20 },
  1600: { slidesPerView: 4.3, spaceBetween: 20 },
};

function slugifyDestination(str) {
  return String(str || "")
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function DestinationFareCard({ dest, href, priority = false }) {
  const imagePath = dest?.image ? String(dest.image) : "fallback.jpg";

  return (
    <Link
      href={href}
      className="block cursor-pointer bg-white rounded-[30px] shadow-[0_3px_14px_0_#A5723326] hover:shadow-[0_8px_24px_0_#A5723326] 
      translate-y-0 hover:translate-y-[-10px] transition-all duration-300 ease-in-out flex flex-col overflow-hidden"
    >
      {/* Top Image — fixed height prevents image-load CLS */}
      <div className="relative h-[295px] w-full shrink-0 p-[2px]">
        <Image
          src={`${BASE_URL_IMG}/media/${imagePath}`}
          alt={dest.city || "Destination"}
          fill
          sizes="(max-width: 540px) 90vw, (max-width: 1024px) 50vw, (max-width: 1280px) 25vw, 25vw"
          priority={priority}
          className="object-cover rounded-[30px]"
        />
      </div>

      {/* Content Area — min-height locks price/title wrap on mobile */}
      <div className="pt-[13px] pb-[16px] px-[22px] flex justify-between flex-grow bg-white min-h-[100px]">
        <div className="min-w-0 pr-2">
          <p className="sm:text-[16px] text-[14px] text-[#363636] mb-0 leading-snug">Business Class Flights To</p>
          <span className="sm:text-[22px] text-[18px] font-[700] text-[#A57233] leading-tight group-hover:text-gray-800 transition-colors block line-clamp-2">
            {dest.city}
          </span>
          <p className="text-[16px] text-[#363636] mt-0 truncate">{dest.country || dest.continent}</p>
        </div>

        <div className="flex flex-col justify-center items-end gap-[10px] shrink-0">

          <div className="text-gray-800 text-right flex items-start leading-none">
            <span className="text-[20px] font-[700] mt-[-4px]">£</span>
            <span className="sm:text-[26px] text-[22px] font-[700] tracking-tight">{dest.price}</span>
            <span className="text-[16px] font-[300] self-end ml-[3px]">pp</span>
          </div>
          <span className="whitespace-nowrap sm:text-[14px] text-[12px] text-[#727272] leading-1 flex items-center sm:gap-3 gap-2 group-hover:text-[#d67938] transition-colors">
            View Fares <span className="flex"><img src="/media/fr-svgs/cardbtnarrow.png" alt="cardbtnarrow" className="w-[18px] h-[10px]" /></span>
          </span>
        </div>
      </div>
    </Link>
  );
}

function StableDestinationSwiper({ items, getKey, renderCard, loop, prevRef, nextRef }) {
  const [mounted, setMounted] = useState(false);
  const [swiperReady, setSwiperReady] = useState(false);
  const initDoneRef = useRef(false);

  const enableLoop = Boolean(loop) && items.length >= 4;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSwiperInit = (swiper) => {
    if (initDoneRef.current) return;
    initDoneRef.current = true;

    if (prevRef?.current && nextRef?.current && swiper.params?.navigation) {
      swiper.params.navigation.prevEl = prevRef.current;
      swiper.params.navigation.nextEl = nextRef.current;
    }

    requestAnimationFrame(() => {
      try {
        swiper.update();
        if (
          swiper.navigation &&
          prevRef?.current &&
          nextRef?.current &&
          !swiper.navigation.initialized
        ) {
          swiper.navigation.init();
          swiper.navigation.update();
        }
      } catch (err) {
        console.warn("Destination slider init:", err);
      }
      // One more frame so slide widths settle before revealing
      requestAnimationFrame(() => setSwiperReady(true));
    });
  };

  /*
   * Placeholder must match Swiper slide widths (not a full-width grid card).
   * Mobile: slidesPerView 1.1, spaceBetween 10
   * sm+: approximate breakpoint slide fractions so the first card does not shrink on swap.
   */
  const placeholderSlideClass =
    "shrink-0 w-[calc((100%-1px)/1.1)] min-[576px]:w-[calc((100%-20px)/1.5)] min-[652px]:w-[calc((100%-20px)/1.8)] min-[768px]:w-[calc((100%-20px)/2.2)] min-[1024px]:w-[calc((100%-20px)/2.6)] min-[1199px]:w-[calc((100%-40px)/3.3)] min-[1400px]:w-[calc((100%-40px)/3.8)] min-[1600px]:w-[calc((100%-60px)/4.3)]";

  return (
    <div className={`${DEST_SLIDER_STRIP_MIN_H} relative overflow-hidden pl-[20px] sm:pl-[27px]`}>
      <style>{`
            .dest-swiper {
              padding-bottom: 78px !important;
            }
            .dest-swiper .swiper-pagination {
              bottom: 0px !important;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
            }
            .dest-swiper .swiper-pagination-bullet {
              width: 22px !important;
              height: 28px !important;
              border-radius: 12px !important;
              border: 1px solid #d67938 !important;
              background-color: transparent !important;
              opacity: 1 !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              margin: 0 !important;
              color: #d67938 !important;
              transition: all 0.3s ease !important;
            }
            .dest-swiper .swiper-pagination-bullet-active {
              background-color: #d67938 !important;
              color: white !important;
            }
          `}</style>

      {/* Static strip mirrors swiper geometry until swiper is ready */}
      <div
        className={`flex gap-[10px] min-[576px]:gap-5 pt-4 pb-[78px] overflow-hidden ${
          swiperReady ? "invisible absolute inset-0 pointer-events-none" : ""
        }`}
        aria-hidden={swiperReady}
      >
        {items.slice(0, 3).map((item, index) => (
          <div key={getKey(item, index)} className={placeholderSlideClass}>
            {renderCard(item, index)}
          </div>
        ))}
      </div>

      {mounted ? (
        <Swiper
          className={
            swiperReady
              ? "dest-swiper relative w-full overflow-hidden !pt-4"
              : "dest-swiper absolute inset-0 opacity-0 pointer-events-none !pt-4"
          }
          modules={[Navigation, Pagination]}
          spaceBetween={10}
          slidesPerView={1.1}
          loop={enableLoop}
          pagination={{
            clickable: true,
            renderBullet: function (index, className) {
              return `<span class="${className}">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.5 9.5L9.5 2.5M2.5 6L6 2.5M6 9.5L9.5 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </span>`;
            }
          }}
          watchOverflow
          observer
          observeParents
          onSwiper={handleSwiperInit}
          onBeforeInit={(swiper) => {
            if (prevRef?.current) swiper.params.navigation.prevEl = prevRef.current;
            if (nextRef?.current) swiper.params.navigation.nextEl = nextRef.current;
          }}
          breakpoints={SLIDER_BREAKPOINTS}
        >
          {items.map((item, index) => (
            <SwiperSlide key={getKey(item, index)} className="!h-auto">
              {renderCard(item, index)}
            </SwiperSlide>
          ))}
        </Swiper>
      ) : null}
    </div>
  );
}

export default function DestinationSlider({
  fares = [],
  heading = "",
  subheading = "",
}) {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  const getHref = (dest) =>
    `/${slugifyDestination(dest.continent)}/${slugifyDestination(dest.country)}/${slugifyDestination(dest.slug)}`;

  const getKey = (dest, index) =>
    dest.id ? `${dest.id}-${index}` : `${dest.slug}-${index}`;

  // Do not priority-load destination images — they compete with the hero LCP poster.
  const renderCard = (dest, index) => (
    <DestinationFareCard
      dest={dest}
      href={getHref(dest)}
      priority={false}
    />
  );

  return (
    <div id="recommended-destinations" className="pt-[30px] sm:pt-[50px] pb-[15px] sm:pb-[25px] bg-white">
      <div className="container">
        {/* Reserve multi-line heading height on mobile (title + long subtitle wrap) */}
        <div className="heading_section min-h-[170px] sm:min-h-[120px] md:min-h-[130px]">
          <h2 className="pre_heading">
            {heading || 'Top Destinations'}
          </h2>
          <p className="sub_text">
            {subheading || 'Best Premium Fares'}
          </p>
        </div>
      </div>
      <div className="relative">


        <div className="relative w-full">

          {fares.length === 0 ? (
            <p className={`${DEST_SLIDER_STRIP_MIN_H} text-center text-gray-500 flex items-center justify-center`}>
              No Destinations Available at the Moment.
            </p>
          ) : (
            <StableDestinationSwiper
              items={fares}
              getKey={getKey}
              renderCard={renderCard}
              loop
              prevRef={prevRef}
              nextRef={nextRef}
            />
          )}
        </div>
      </div>
    </div>
  );
}
