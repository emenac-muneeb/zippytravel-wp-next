"use client";
import axios from "axios";
import { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { endpoints } from "../Helpers/endpoints";
import { BASE_URL_IMG } from "../Helpers/imageurl";
import BrandingSection from "./BrandingSection";

const FlightTabNew = dynamic(() => import("./FlightTabNew"), {
  ssr: true,
  loading: () => (
    <div
      className="w-full min-h-[120px] rounded-full bg-white/20 animate-pulse"
      aria-hidden
    />
  ),
});

const HolidayTab = dynamic(() => import("./HolidayTab"), {
  ssr: true,
  loading: () => (
    <div className="min-h-[200px] w-full rounded-xl bg-white/20 animate-pulse" aria-hidden />
  ),
});

const UmrahTab = dynamic(() => import("./UmrahTab"), {
  ssr: true,
  loading: () => (
    <div className="min-h-[200px] w-full rounded-xl bg-white/20 animate-pulse" aria-hidden />
  ),
});

const StaticBanner = ({
  setFlightLoading,
  setPopupMessage,
  initialBanners = [],
  bgImageOverride = "",
  titleOverride = "",
  descriptionOverride = "",
}) => {
  const [activeTab, setActiveTab] = useState("flights");
  const [banners, setBanners] = useState(initialBanners);
  const [selectedClass, setSelectedClass] = useState("Business");

  useEffect(() => {
    setBanners(initialBanners);
  }, [initialBanners]);

  const showServiceTabs = false;

  const tabs = [
    { name: "FLIGHTS", icon: `${BASE_URL_IMG}/assets/svgs/flight.svg` },
    { name: "HOLIDAYS", icon: `${BASE_URL_IMG}/assets/svgs/holiday.svg` },
    { name: "UMRAH", icon: `${BASE_URL_IMG}/assets/svgs/umrah.svg` },
  ];

  const currentBanner = Array.isArray(banners)
    ? banners.find((item) => item?.slug?.toLowerCase() === activeTab.toLowerCase()) || banners[0]
    : null;

  const getBannerImage = () => {
    if (bgImageOverride) {
      if (bgImageOverride.startsWith("http")) return bgImageOverride;
      return `${BASE_URL_IMG}/${bgImageOverride.replace(/^\/+/, "")}`;
    }
    if (typeof initialBanners === "string" && initialBanners) {
      if (initialBanners.startsWith("http")) return initialBanners;
      return `${BASE_URL_IMG}/${initialBanners.replace(/^\/+/, "")}`;
    }
    if (!currentBanner) return "";
    const imgUrl = currentBanner.image_url || currentBanner.url;
    if (!imgUrl) return "";
    if (imgUrl.startsWith("http")) return imgUrl;
    return `${BASE_URL_IMG}/media/${imgUrl.replace(/^\/+/, "")}`;
  };

  const parseDescription = (htmlString) => {
    if (!htmlString) return { h2Text: "", pText: "" };
    const h2Match = htmlString.match(/<h2[^>]*>(.*?)<\/h2>/i);
    const pMatch = htmlString.match(/<p[^>]*>(.*?)<\/p>/i);
    const h2Text = h2Match ? h2Match[1].replace(/<[^>]*>/g, "").trim() : "";
    const pText = pMatch ? pMatch[1].replace(/<[^>]*>/g, "").trim() : "";
    return { h2Text, pText };
  };

  const bannerTitle = titleOverride || currentBanner?.title || "";
  const bannerDescription =
    descriptionOverride ||
    currentBanner?.banner_description ||
    currentBanner?.description ||
    "";

  const { h2Text, pText } = parseDescription(bannerDescription);
  // CMS may put the main line in <h2> or <p>; promote to large serif headline
  const heroHeadline = h2Text || pText;
  const heroSupport = h2Text ? pText : "";

  return (
    <section className="relative w-full mb-[53px]">
      <div className="relative w-full overflow-hidden rounded-b-[40px] sm:rounded-b-[56px] lg:rounded-b-[72px] min-h-[640px] sm:min-h-[720px] lg:min-h-[620px]">
        {/* Background image */}
        <div className="absolute inset-0 bg-[#2a211c]">
          {getBannerImage() ? (
            <Image
              src={getBannerImage()}
              alt={currentBanner?.image_alt || "Banner"}
              title={currentBanner?.image_title || ""}
              fill
              priority
              fetchPriority="high"
              sizes="100vw"
              className="object-cover scale-105"
            />
          ) : null}
          {/* Dark warm overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(25,18,14,0.55) 0%, rgba(25,18,14,0.45) 40%, rgba(25,18,14,0.72) 100%)",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center w-[94%] max-w-[1320px] mx-auto pt-[100px] sm:pt-[120px] lg:pt-[250px] pb-10 sm:pb-12 lg:pb-14">
          {/* Headings — keep dynamic banner title / description */}
          <div className="text-center max-w-[900px] mx-auto mb-6 sm:mb-8 px-2 min-h-[120px]">
            {activeTab === "flights" ? (
              <>
                <h1 className="text-[18px] text-white">
                  {bannerTitle && (
                    <span className="text-[50px] font-semibold text-[#F5BA87] block">
                      {bannerTitle}
                    </span>
                  )}
                  {!descriptionOverride ? heroHeadline : null}
                </h1>
                {bannerDescription ? (
                  <div
                    className="mt-3 text-white/90 text-[16px] sm:text-[18px] leading-relaxed font-quicksand text-white banner-description"
                    dangerouslySetInnerHTML={{ __html: bannerDescription }}
                  />
                ) : heroSupport ? (
                  <p className="mt-3 text-white/90 text-[16px] sm:text-[18px] leading-relaxed font-quicksand">
                    {heroSupport}
                  </p>
                ) : null}
              </>
            ) : (
              <p className="hero-banner-title tracking-wide">
                  {bannerTitle}
              </p>
            )}
          </div>

          {/* Service tabs — preserved functionality, refined to fit hero */}
          {showServiceTabs && (
            <div className="mb-5 sm:mb-6">
              <div className="flex flex-wrap justify-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 p-1.5 sm:p-2">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.name.toLowerCase();
                  return (
                    <button
                      key={tab.name}
                      type="button"
                      onClick={() => setActiveTab(tab.name.toLowerCase())}
                      className={`flex items-center justify-center gap-1.5 sm:gap-2 rounded-full text-white font-semibold font-quicksand transition-all duration-300 ${
                        isActive
                          ? "bg-[#F27A2A] shadow-md"
                          : "bg-transparent hover:bg-white/10"
                      }`}
                      style={{
                        height: "clamp(36px, 5vw, 44px)",
                        minWidth: "clamp(92px, 18vw, 132px)",
                        fontSize: "clamp(11px, 2.2vw, 14px)",
                        padding: "0 clamp(10px, 2vw, 18px)",
                      }}
                    >
                      <img
                        src={tab.icon}
                        alt=""
                        width={18}
                        height={18}
                        className="flex-shrink-0 brightness-0 invert opacity-90"
                        aria-hidden
                      />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}



          {/* Trust / brand logos inside hero */}
          <div className="w-full mt-8 sm:mt-10">
            <BrandingSection variant="hero" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default StaticBanner;
