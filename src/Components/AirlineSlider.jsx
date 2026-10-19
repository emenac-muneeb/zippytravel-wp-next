"use client";
import React, { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import Link from "next/link";
import axios from "axios";
import { BASE_URL_IMG } from "../Helpers/imageurl";
import { endpoints } from "../Helpers/endpoints";
import "swiper/css";
import "swiper/css/pagination";


export default function AirlineSlider({
  heading = "Our Airline Partners",
  subheading = "Fly with the World's Best Airlines",
  bgImage = "/airlinebg.png",
}) {
  const [airlines, setAirlines] = useState([]);
  const [mounted, setMounted] = useState(false);
  const swiperRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    const fetchAirlines = async () => {
      try {
        const res = await axios.get(endpoints.airlines);
        if (res.data?.status === 1) {
          const payload = res.data.result;
          const list = Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload)
              ? payload
              : [];
          setAirlines(list);
        } else {
          setAirlines([]);
        }
      } catch (error) {
        console.error("Error fetching airlines:", error);
        setAirlines([]);
      }
    };
    fetchAirlines();
  }, []);

  return (
    <section
      className="relative asl-bg w-full py-14 bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: `url('${bgImage}')` }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 z-0" />

      <style>{`
        .airline-swiper {
          padding-bottom: 64px !important;
        }
        .airline-swiper .swiper-pagination:not(.swiper-pagination-bullets-dynamic) {
          bottom: 0px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 8px !important;
        }
        .airline-swiper .swiper-pagination.swiper-pagination-bullets-dynamic {
          bottom: 0px !important;
        }
        .airline-swiper .swiper-pagination-bullet {
          width: 22px !important;
          height: 28px !important;
          border-radius: 16px !important;
          border: 1px solid rgba(255,255,255,0.7) !important;
          background-color: transparent !important;
          opacity: 1 !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          margin: 0 4px !important;
          color: rgba(255,255,255,0.8) !important;
          transition: all 0.3s ease, transform 0.3s !important;
        }
        .airline-swiper .swiper-pagination-bullet-active {
          background-color: #ffffff !important;
          border-color: #ffffff !important;
          color: #363636 !important;
        }
        /* dynamic-bullets scale helpers keep sizing consistent */
        .airline-swiper .swiper-pagination-bullet-active-main {
          border-color: #ffffff !important;
        }
      `}</style>

      <div className="relative z-10">
        {/* Heading inside container */}
        <div className="container">
          <div className="heading_section text-white head-white">
            <h2 className="pre_heading text-white">{heading}</h2>
            <p className="sub_text text-white">{subheading}</p>
          </div>
        </div>

        {/* Slider — full width, padded */}
        <div className="mt-6 container">
          {mounted && Array.isArray(airlines) && airlines.length > 0 ? (
            <Swiper
              className="airline-swiper"
              modules={[Autoplay, Pagination]}
              spaceBetween={24}
              slidesPerView="auto"
              loop={airlines.length >= 7}
              autoplay={{ delay: 2500, disableOnInteraction: false }}
              speed={600}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
              pagination={{
                clickable: true,
                dynamicBullets: true,
                dynamicMainBullets: 7,
                renderBullet: function (index, className) {
                  return `<span class="${className}">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.5 9.5L9.5 2.5M2.5 6L6 2.5M6 9.5L9.5 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                  </span>`;
                },
              }}

            >
              {airlines.map((airline, index) => (
                <SwiperSlide key={airline.id || index} className="!w-[200px] !h-auto">
                  <Link href={`/airline/${airline.slug}`} title={airline.title}>
                    <div className="group bg-white rounded-xl shadow-md flex items-center justify-center w-[200px] h-[104px] px-3 cursor-pointer transition-all duration-300 hover:shadow-xl">
                      <img
                        src={`${BASE_URL_IMG}/media/${airline.image_url}`}
                        alt={airline.image_alt || airline.title}
                        loading={index < 7 ? "eager" : "lazy"}
                        className="w-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            /* Skeleton placeholder while loading — match real slide size + swiper padding */
            <div className="flex gap-4 overflow-hidden pb-16">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-[200px] h-[104px] bg-white/20 rounded-xl animate-pulse"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
