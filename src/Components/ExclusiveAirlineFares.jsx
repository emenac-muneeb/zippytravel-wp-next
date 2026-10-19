"use client";

import React, { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import Link from "next/link";
import { BASE_URL_IMG } from "../Helpers/imageurl";
import { useGeneralSettings } from "../Context/GeneralSettingsContext";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";



/* ─── Fallback image colours per airline ────────────────────────── */
const FALLBACK_COLORS = [
  "from-purple-900 to-rose-800",
  "from-amber-800 to-red-900",
  "from-blue-900 to-indigo-800",
  "from-teal-800 to-blue-900",
  "from-yellow-800 to-amber-900",
  "from-violet-900 to-purple-800",
];

/* ─── Airline logo fallback (SVG plane) ─────────────────────────── */
function AirlineLogoFallback({ name, color }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="flex items-center gap-2">
      <div
        className={``}
      >
        <img src="/logobrand.png" alt="logo" className="w-full h-full object-contain" />
      </div>
    </div>
  );
}

/* ─── Single Fare Card ───────────────────────────────────────────── */
function FareCard({ fare, colorClass }) {
  const [imgError, setImgError] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const { settings } = useGeneralSettings();

  const airlineName = fare?.airline_name || fare?.airlineName || "Airline";
  const classLabel = fare?.class_name || fare?.classLabel || "Business Class";
  const price = fare?.fare_price || fare?.price || "";
  const phone = fare?.phone || settings?.phone_number || "0208-146-4666";

  const rawLogo = fare?.airline_logo || fare?.airlineLogo || "";
  const logoSrc = rawLogo
    ? rawLogo.startsWith("http://") || rawLogo.startsWith("https://")
      ? rawLogo
      : `${BASE_URL_IMG}${rawLogo.startsWith("/") ? "" : "/"}${rawLogo}`
    : "";

  const rawImage = fare?.airline_banner || fare?.image || "";
  const imageSrc = rawImage
    ? rawImage.startsWith("http://") || rawImage.startsWith("https://")
      ? rawImage
      : `${BASE_URL_IMG}${rawImage.startsWith("/") ? "" : "/"}${rawImage}`
    : "";

  let href = fare?.airline_url || fare?.href || "#";
  if (href && href !== "#" && !href.startsWith("http://") && !href.startsWith("https://") && !href.startsWith("/")) {
    href = `/${href}`;
  }

  const desc = fare?.description || (fare?.origin && fare?.destination
    ? `${fare.origin.split(" - ")[0]} to ${fare.destination.split(" - ")[0]}`
    : `Fares with ${airlineName}`);

  return (
    <div className="exclusive-fare-card">
      {/* Left info panel */}
      <div className="eaf-left-panel">
        {/* Airline logo */}
        <div className="eaf-logo-wrap">
          {logoError || !logoSrc ? (
            <AirlineLogoFallback name={airlineName} color={colorClass} />
          ) : (
            <img
              src={logoSrc}
              alt={airlineName}
              className="eaf-logo-img"
              loading="lazy"
              decoding="async"
              onError={() => setLogoError(true)}
            />
          )}
        </div>

        {/* Class info */}
        <div className="eaf-content-wrap">
          <span className="eaf-available">Available</span>
          <span className="eaf-class-name">{classLabel}</span>
          <p className="eaf-class-desc">With {airlineName}</p>
          <div className="eaf-price-cta-row">
            <div className="eaf-price-block">
              <div className="eaf-price-row">
                <span className="eaf-starting">Starting <br />From</span>
                <span className="eaf-pound">£</span>
                <span className="eaf-amount">{price}</span>
                <span className="eaf-pp">pp</span>
                <span className="eaf-asterisk">*</span>
              </div>
            </div>
            <Link href={`airline${href}`} className="eaf-cta-btn">
              Check More Fares
              <img src="/media/fr-svgs/btnarrow.png" alt="btn arrow" className="w-[15px] h-[8px]" />
            </Link>
          </div>
        </div>

        {/* CTA Section */}
        <div className="eaf-cta-wrap">
          {/* OR + phone */}
          <div className="eaf-or-row">
            <span className="eaf-or-text">OR</span>
            <div>
              <div className="eaf-phone-row flex items-center gap-2">
                <span className="eaf-phone-icon ">
                  <img src="/media/fr-svgs/telephoneicon.png" alt="telephone icon" className="w-[24px] h-[37px]" />
                </span>
                <div>
                  <p className="eaf-call-label">Call Now!</p>
                  <a href={`tel:${phone}`} className="eaf-phone-link">
                    {phone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right image panel */}
      <div className="eaf-right-panel">
        {imgError || !imageSrc ? (
          <div className={`eaf-img-fallback bg-gradient-to-br ${colorClass}`}>
            <svg
              width="60"
              height="60"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              opacity="0.6"
            >
              <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
            </svg>
          </div>
        ) : (
          <img
            src={imageSrc}
            alt={`${airlineName} ${classLabel}`}
            className="eaf-img"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            onError={() => setImgError(true)}
          />
        )}
      </div>
    </div>
  );
}

/* ─── Skeleton Loader ───────────────────────────────────────────── */
export function ExclusiveAirlineFaresSkeleton() {
  return (
    <section className="eaf-section py-[25px] bg-white">
      <div className="container mx-auto px-4 max-w-[960px]">
        <div className="mb-9">
          <div className="h-8 w-64 bg-gray-200 animate-pulse rounded mb-2" />
          <div className="h-4 w-80 bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="flex flex-col lg:flex-row items-center justify-between w-full relative">
          <div className="w-full lg:w-[58%] bg-white border-4 border-[#F1A868]/40 rounded-[40px] p-6 lg:p-[50px] min-h-[460px] flex flex-col justify-between z-[1]">
            <div>
              <div className="h-10 w-36 bg-gray-200 animate-pulse rounded-md mb-6" />
              <div className="h-5 w-24 bg-gray-200 animate-pulse rounded mb-2" />
              <div className="h-9 w-48 bg-gray-200 animate-pulse rounded mb-2" />
              <div className="h-6 w-36 bg-gray-200 animate-pulse rounded mb-6" />
              <div className="flex items-center justify-between gap-4 mt-8 pt-4">
                <div className="h-12 w-32 bg-gray-200 animate-pulse rounded-md" />
                <div className="h-12 w-44 bg-gray-200 animate-pulse rounded-md" />
              </div>
            </div>
            <div className="flex items-center justify-center gap-6 mt-6">
              <div className="h-8 w-12 bg-gray-200 animate-pulse rounded" />
              <div className="h-10 w-36 bg-gray-200 animate-pulse rounded-md" />
            </div>
          </div>
          <div className="w-full lg:w-[50%] lg:-ml-[8%] h-[280px] lg:h-[380px] bg-gray-200 animate-pulse rounded-[20px] lg:rounded-[44px] mt-4 lg:mt-0 z-[2]" />
        </div>
      </div>
    </section>
  );
}

/* ─── Main Section ───────────────────────────────────────────────── */
export default function ExclusiveAirlineFares({
  heading = "Exclusive Airline Fares",
  subheading = "Browse The best Business and First Class Airlines",
  fares,
}) {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (fares === undefined) {
    return <ExclusiveAirlineFaresSkeleton />;
  }

  const displayFares = Array.isArray(fares) ? fares : [];

  if (displayFares.length === 0) return null;

  return (
    <section className="eaf-section">
      <style>{`
        /* ── Section wrapper ─────────────────────── */
        .eaf-section {
          padding: 25px 0 25px;
          background: #fff;
        }
        .eaf-inner {
          max-width: 960px;
          margin: 0 auto;
          position: relative;
          padding: 0 24px;
        }

        /* ── Header ──────────────────────────────── */
        .eaf-header {
          margin-bottom: 36px;
        }
        .eaf-header-bar {
          width: 60px;
          height: 3px;
          background: #F1A868;
          border-radius: 2px;
          margin-bottom: 12px;
        }
        .eaf-heading {
          font-size: 32px !important;
          font-weight: 800 !important;
          color: #1a1a1a !important;
          margin: 0 0 6px !important;
          font-family: inherit !important;
          letter-spacing: -0.5px !important;
        }
        .eaf-subheading {
          font-size: 15px !important;
          color: #666 !important;
          margin: 0 !important;
          font-weight: 500 !important;
        }

        /* ── Swiper custom styles ─────────────────── */
        .eaf-swiper {
          padding-bottom: 56px !important;
          overflow: hidden !important;
        }
        .eaf-swiper .swiper-wrapper {
          align-items: stretch;
        }
        .eaf-swiper .swiper-slide {
          height: auto !important;
        }
        .eaf-swiper .swiper-pagination {
          bottom: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 8px !important;
        }
        .eaf-swiper .swiper-pagination-bullet {
          width: 22px !important;
          height: 28px !important;
          border-radius: 12px !important;
          border: 1px solid #d67938 !important;
          background: transparent !important;
          opacity: 1 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          margin: 0 !important;
          transition: all 0.3s ease !important;
          color: #d67938 !important;
          cursor: pointer;
        }
        .eaf-swiper .swiper-pagination-bullet-active {
          background: #d67938 !important;
          color: #fff !important;
        }
        .eaf-swiper .swiper-pagination-bullet svg {
          display: block;
        }

        /* ── Nav buttons ─────────────────────────── */
        .eaf-nav-btn {
          position: absolute;
          z-index: 20;
          width: 52px;
          height: 52px;
          border-radius: 8px;
          border: 3px solid #F1A868;
          background: #fff;
          color: #d67938;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
          box-shadow: 0 4px 4px #A57233;
        }
        .eaf-nav-btn:hover {
          background: #d67938;
          color: #fff;
          border-color: #d67938;
        }
        .eaf-nav-btn:hover img{
            filter: brightness(100);
        }
        .eaf-nav-prev {
          left: -22px;
          bottom: 116px;
        }
        .eaf-nav-prev img{
            transform: rotate(270deg);
          }
        .eaf-nav-next {
          right: -22px;
          top:130px;
        }

        /* ── Card layout ─────────────────────────── */
        .exclusive-fare-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          max-width: 100%;
          margin: 0 auto;
          position: relative;
          overflow: visible;
          padding:  0;
        }

        /* Left Panel */
        .eaf-left-panel {
          flex: 0 0 58%;
          position: relative;
          z-index: 1;
          background: #fff;
          border: 4px solid #F1A868;
          border-radius: 40px;
          padding: 50px 92px 50px 50px;
          min-height: 460px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-sizing: border-box;
        }

        /* Right Panel */
        .eaf-right-panel {
          flex: 0 0 50%;
          position: relative;
          z-index: 2;
          margin-left: -8%;
          height: 380px;
          border-radius: 44px;
          overflow: hidden;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
          background: #eaeaea;
          max-width: 647px;
        }

        .eaf-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .eaf-img-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ── Left panel contents ─────────────────── */
        .eaf-logo-wrap {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
          width: 100%;
        }
        .eaf-logo-img {
          max-height: 44px;
          max-width: 180px;
          object-fit: contain;
        }

        .eaf-content-wrap {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          width: 100%;
          margin-bottom: 16px;
        }
        .eaf-available {
          font-size: 20px;
          font-weight: 300;
          color: #585858;
          text-transform: capitalize;
          margin-bottom: 1px;
        }
        .eaf-class-name {
          font-size: 34px ;
          font-weight: 800 ;
          color: #A26D3F ;
          margin: 0;
          line-height: 1.1;
        }
        .eaf-class-desc {
          font-size: 20px ;
          font-weight: 300;
          color: #585858 ;
          margin: 0px 0 0 0;
        }
        .eaf-price-block {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          position: relative;
          padding-left: 35px;
        }
        .eaf-price-block::before {
          content: '';
          position: absolute;
          top: 0;
          left: 4px;
          width: 4px;
          height: 100%;
          background: #f1a868;
        } 
        .eaf-price-block::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 2px;
          height: 100%;
          background: #f1a868;
        } 
        .eaf-starting {
          font-size: 16px;
          line-height: 1.2;
          font-weight: 300;
          color: #585858;
          text-transform: capitalize;
          padding-right: 10px;
        }
        .eaf-price-row {
            font-size: 18px;
            line-height: 24px;
            font-weight: 700;
            color: var(--black);
            margin: 0;
            display: flex;
            text-align: right;
        }
        .eaf-fr {
          font-size: 14px;
          font-weight: 700;
          margin-right: 1px;
        }
        .eaf-pound {
          font-size: 20px;
          font-weight: 700;
        }
        .eaf-amount {
          font-size: 34px;
          font-weight: 800;
          line-height: 1;
          letter-spacing: -1px;
        }
        .eaf-asterisk {
          font-size: 14px;
          font-weight: 700;
          align-self: flex-start;
          margin-top: -3px;
          margin-left: -6px;
          color: #585858;
        }
        .eaf-pp {
          font-size: 14px;
          font-weight: 700;
          align-self: flex-end;
          margin-bottom: 0px;
        }

        /* ── CTA and OR row ──────────────────────── */
        .eaf-cta-wrap {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
        }
       

        .eaf-or-row {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 35px;
          width: 100%;
          padding-left: 8px;
        }
        .eaf-or-text {
          font-size: 36px;
          color: #000000;
          font-weight: 800;
          letter-spacing: 0.5px;
          line-height: 1;
        }
        .eaf-call-label {
          font-size: 14px ;
          font-weight: 800;
          color: #343434 ;
          margin: 0;
        }
        .eaf-phone-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .eaf-phone-icon {
          flex-shrink: 0;
        }
        .eaf-phone-link {
          font-size: 20px;
          font-weight: 700;
          color: #505050;
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .eaf-phone-link:hover {
          color: #C58C59;
        }

        .eaf-price-cta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding-right: 24px;
          margin-top: 30px;
          position: relative;
          gap: 16px;
        }
        .eaf-price-cta-row::before {
          content: '';
          position: absolute;
          top: 50%;
          left: calc(50% - 12px);
          transform: translate(-50%, -50%);
          width: 38px;
          height: 4px;
          background: #A57233;
        }

        /* ── Responsive ──────────────────────────── */
        @media (max-width: 1360px) and (min-width: 1025px) {
          .eaf-left-panel {
            padding: 40px 60px 40px 40px;
            min-height: 420px;
          }
          .eaf-right-panel {
            height: 340px;
          }
          .eaf-class-name {
            font-size: 28px;
          }
          .eaf-class-desc {
            font-size: 16px;
          }
          .eaf-available {
            font-size: 16px;
          }
            .eaf-nav-prev {
            left: -15px;
        }
        .eaf-nav-next {
            right: -15px;
        }
            .eaf-cta-btn{
            margin-right: 15px;
            }
            .eaf-price-cta-row::before{
              left: calc(50% - 35px);
            }
        }
             @media (max-width: 1080px){
              .eaf-price-cta-row::before {
            display: none;
          }
             }

        @media (max-width: 1024px) {
          .eaf-section {
            padding: 40px 0 50px;
          }
          .exclusive-fare-card {
            flex-direction: column;
            padding: 10px 0;
            // max-width: 580px;
            margin: 0 auto;
          }
          .eaf-left-panel {
            width: 100%;
            min-height: auto;
            padding: 30px 24px;
            border-radius: 24px;
          }
          .eaf-right-panel {
            width: 100%;
            height: 280px;
            margin-left: 0;
            margin-top: -24px;
            border-radius: 20px;
          }
          .eaf-nav-btn{
            width: 38px;
            height: 38px;
          }
          .eaf-nav-btn img{
            width: 16px;
            height: auto;
            object-fit: contain;
          }
          .eaf-nav-prev {
            left: -12px;
            top: 50%;
            bottom: auto;
            transform: translateY(-50%);
          }
          .eaf-nav-next {
            right: -12px;
            top: 50%;
            transform: translateY(-50%);
          }
          .eaf-nav-next img{
            width: 9px;
          }
          .eaf-heading {
            font-size: 26px !important;
          }
            .eaf-price-cta-row::before {
            display: block;
          }
        }
           @media (max-width: 620px){
            .eaf-price-cta-row::before {
            display: none;
          }
            .eaf-or-text{
              font-size: 30px;
            }
           }

        @media (max-width: 576px) {
          .exclusive-fare-card {
            max-width: 100%;
          }
          .eaf-left-panel {
            padding: 24px 16px;
          }
          .eaf-right-panel {
            height: 220px;
          }
          .eaf-price-cta-row {
            flex-direction: column;
            align-items: center;
            padding-right: 0;
            gap: 16px;
          }
          .eaf-price-cta-row::before {
            display: none;
          }
        }
           @media (max-width: 370px){
           
           .eaf-or-text{
            margin-left: 15px;
            font-size: 25px;
           }
           }
      `}</style>

      <div className="container">
        {/* Header */}
        <div className="heading_section">
          <h2 className="pre_heading">
            {typeof heading === "string" ? heading.replace(/<[^>]*>/g, "").trim() : heading}
          </h2>
          <p className="sub_text">
            {typeof subheading === "string" ? subheading.replace(/<[^>]*>/g, "").trim() : subheading}
          </p>
        </div>
        {/* Slider wrapper */}
        <div style={{ position: "relative" }}>
          {/* Prev button */}
          <button ref={prevRef} className="eaf-nav-btn eaf-nav-prev" aria-label="Previous">
            <img src="/media/fr-svgs/leftarrow.svg" alt="prev arrow" className="" />
          </button>

          {/* Next button */}
          <button ref={nextRef} className="eaf-nav-btn eaf-nav-next" aria-label="Next">
            <img src="/media/fr-svgs/rightarrow.svg" alt="prev arrow" className="" />

          </button>

          {mounted && (
            <Swiper
              className="eaf-swiper"
              modules={[Navigation, Pagination]}
              // spaceBetween={24}
              slidesPerView={1}
              loop={false}
              navigation={{
                prevEl: prevRef.current,
                nextEl: nextRef.current,
              }}
              onBeforeInit={(swiper) => {
                if (prevRef.current) swiper.params.navigation.prevEl = prevRef.current;
                if (nextRef.current) swiper.params.navigation.nextEl = nextRef.current;
              }}
              pagination={{
                clickable: true,
                renderBullet: (index, className) =>
                  `<span class="${className}">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.5 9.5L9.5 2.5M2.5 6L6 2.5M6 9.5L9.5 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                  </span>`,
              }}
              observer
              observeParents
            >
              {displayFares.map((fare, i) => (
                <SwiperSlide key={fare.fare_id || fare.id || i}>
                  <FareCard fare={fare} colorClass={FALLBACK_COLORS[i % FALLBACK_COLORS.length]} />
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </div>
    </section>
  );
}
