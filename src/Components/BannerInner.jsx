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
      className="w-full min-h-[300px] md:min-h-[140px] rounded-[15px] bg-white/20 animate-pulse"
      aria-hidden
    />
  ),
});

const classOptions = [
  {
    id: "Premium Economy",
    label: "Premium Class",
    icon: (isActive) => (
      <img
        src={`/media/fr-svgs/premiumclass.png`}
        alt="Premium Class"
        className="w-5 h-5 min-[400px]:w-6 min-[400px]:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 min-[900px]:w-9 min-[900px]:h-9 min-[1065px]:w-auto min-[1065px]:h-auto object-contain flex-shrink-0"
      />
    ),
  },
  {
    id: "Business",
    label: "Business Class",
    icon: (isActive) => (
      <img
        src={`/media/fr-svgs/businessclass.png`}
        alt="Business Class"
        className="w-5 h-5 min-[400px]:w-6 min-[400px]:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 min-[900px]:w-9 min-[900px]:h-9 min-[1065px]:w-auto min-[1065px]:h-auto object-contain flex-shrink-0"
      />
    ),
  },
  {
    id: "First Class",
    label: "First Class",
    icon: (isActive) => (
      <img
        src={`/media/fr-svgs/firstclass.png`}
        alt="First Class"
        className="w-5 h-5 min-[400px]:w-6 min-[400px]:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 min-[900px]:w-9 min-[900px]:h-9 min-[1065px]:w-auto min-[1065px]:h-auto object-contain flex-shrink-0"
      />
    ),
  },
];

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

const BannerInner = ({
  setFlightLoading,
  setPopupMessage,
  initialBanners = [],
  bgImageOverride = "",
  titleOverride = "",
  descriptionOverride = "",
  showClassSelector = false,
  onClassChange,
  /** When true, never load or show the global home banner fallback */
  pageBannerOnly = false,
}) => {
  const [activeTab, setActiveTab] = useState("flights");
  const [banners, setBanners] = useState(initialBanners);
  const [selectedClass, setSelectedClass] = useState("Business");

  useEffect(() => {
    onClassChange?.(selectedClass);
  }, [selectedClass, onClassChange]);

  const showServiceTabs = false;

  const tabs = [
    { name: "FLIGHTS", icon: `${BASE_URL_IMG}/assets/svgs/flight.svg` },
    { name: "HOLIDAYS", icon: `${BASE_URL_IMG}/assets/svgs/holiday.svg` },
    { name: "UMRAH", icon: `${BASE_URL_IMG}/assets/svgs/umrah.svg` },
  ];

  useEffect(() => {
    if (pageBannerOnly || banners.length > 0) return;
    axios
      .get(endpoints.banner)
      .then((res) => {
        if (res.data.status === 1) {
          setBanners(res.data.result);
        }
      })
      .catch((err) => console.error("Failed to fetch banners:", err));
  }, [banners.length, pageBannerOnly]);

  const currentBanner = banners.find(
    (item) => item?.slug?.toLowerCase() === activeTab.toLowerCase()
  );

  const getBannerImage = () => {
    if (pageBannerOnly || bgImageOverride) {
      if (!bgImageOverride) return "";
      if (bgImageOverride.startsWith("http")) {
        return bgImageOverride;
      }
      return `${BASE_URL_IMG}/${bgImageOverride.replace(/^\/+/, "")}`;
    }
    if (!currentBanner || !currentBanner.image_url) return "";
    return `${BASE_URL_IMG}/media/${currentBanner.image_url}`;
  };

  const parseDescription = (htmlString) => {
    if (!htmlString) return { h2Text: "", pText: "" };
    const h1Match = htmlString.match(/<h1[^>]*>(.*?)<\/h1>/i);
    const h2Match = htmlString.match(/<h2[^>]*>(.*?)<\/h2>/i);
    const pMatch = htmlString.match(/<p[^>]*>(.*?)<\/p>/i);
    const h2Text = (h1Match || h2Match) ? (h1Match || h2Match)[1].replace(/<[^>]*>/g, "").trim() : "";
    const pText = pMatch ? pMatch[1].replace(/<[^>]*>/g, "").trim() : "";
    return { h2Text, pText };
  };

  const bannerTitle = activeTab === "flights" && titleOverride ? titleOverride : (currentBanner?.title || "");
  const bannerDescription = activeTab === "flights" && descriptionOverride ? descriptionOverride : (currentBanner?.description || "");

  const { h2Text, pText } = parseDescription(bannerDescription);
  // CMS may put the main line in <h2> or <p>; promote to large serif headline
  const heroHeadline = h2Text || pText;
  const heroSupport = h2Text ? pText : "";

  return (
    <section className={`relative w-full ${showClassSelector ? "mb-[50px]" : "mb-0"}`}>
      <div className="relative w-full overflow-hidden rounded-b-[40px] sm:rounded-b-[56px] lg:rounded-b-[72px] min-h-[640px] sm:min-h-[620px] lg:min-h-[620px]">
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
        <div className="relative z-1 flex flex-col items-center w-[94%] max-w-[1320px] mx-auto pt-[100px] sm:pt-[120px] lg:pt-[250px] pb-20 min-[576px]:pb-12 lg:pb-20">
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
                      className={`flex items-center justify-center gap-1.5 sm:gap-2 rounded-full text-white font-semibold font-quicksand transition-all duration-300 ${isActive
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

          {/* Form area */}
          <div className="w-full">
            {activeTab === "flights" && (
              <Suspense
                fallback={
                  <div
                    className="w-full min-h-[300px] md:min-h-[140px] rounded-[15px] bg-white/20"
                    aria-hidden
                  />
                }
              >
                <FlightTabNew
                  setFlightLoading={setFlightLoading}
                  activeTab={activeTab}
                  setPopupMessage={setPopupMessage}
                  selectedClass={selectedClass}
                  setSelectedClass={setSelectedClass}
                  hideClassSelector={true}
                />
              </Suspense>
            )}
            {activeTab === "holidays" && (
              <div className="rounded-3xl bg-white/10 backdrop-blur-md border border-white/15 p-3 sm:p-4 overflow-hidden">
                <HolidayTab
                  title={currentBanner?.title}
                  description={currentBanner?.description}
                />
              </div>
            )}
            {activeTab === "umrah" && (
              <div className="rounded-3xl bg-white/10 backdrop-blur-md border border-white/15 p-3 sm:p-4 overflow-hidden">
                <UmrahTab
                  title={currentBanner?.title}
                  description={currentBanner?.description}
                />
              </div>
            )}
          </div>

          {/* Trust / brand logos inside hero */}
          <div className="w-full mt-3 mb-2 min-[576px]:mb-0 sm:mt-10">
            <BrandingSection variant="hero" />
          </div>
        </div>
      </div>

      {/* Class Selector - only when showClassSelector is passed true */}
      {showClassSelector && activeTab === "flights" && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 z-[1] w-[92%] container flex items-center justify-center">
          <div className="flex flex-wrap justify-center min-[576px]:grid min-[576px]:grid-cols-3 w-full items-stretch gap-2.5 min-[576px]:gap-0">
            {classOptions.map((option, index) => {
              const isActive = selectedClass === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedClass(option.id)}
                  className={`flex items-center justify-center gap-1.5 min-[400px]:gap-2 sm:gap-2.5 min-[1065px]:gap-3 transition-all duration-300 ease-in-out px-2.5 sm:px-4 min-[1065px]:px-6 rounded-[16px] w-[calc(50%-6px)] min-[576px]:w-full ${isActive
                    ? "bg-white border-2 border-[#A57233] shadow-[0_10px_25px_rgba(165,114,51,0.22)] z-20 py-3 sm:py-5 min-[1065px]:py-6 scale-[1.05] rounded-[18px] min-[576px]:rounded-[20px] min-[1065px]:rounded-[24px] min-[576px]:border min-[576px]:-my-2.5 min-[1065px]:-my-3"
                    : "bg-[#FDFBF9] border border-[#e8e0d7] py-2 sm:py-3.5 min-[1065px]:py-4.5 z-10 hover:bg-white scale-100"
                    } ${index === 0 && !isActive
                      ? "min-[576px]:rounded-l-[18px] min-[1065px]:rounded-l-[20px] min-[576px]:rounded-r-none min-[576px]:border-r-0"
                      : ""
                    } ${index === 1 && !isActive
                      ? `min-[576px]:rounded-none ${selectedClass === "Premium Economy"
                        ? "min-[576px]:border-l-0"
                        : selectedClass === "First Class"
                          ? "min-[576px]:border-r-0"
                          : "min-[576px]:border-l-0 min-[576px]:border-r-0"
                      }`
                      : ""
                    } ${index === 2 && !isActive
                      ? "min-[576px]:rounded-r-[18px] min-[1065px]:rounded-r-[20px] min-[576px]:rounded-l-none min-[576px]:border-l-0"
                      : ""
                    }`}
                  style={{
                    minHeight: isActive
                      ? "clamp(52px, 7.5vw, 84px)"
                      : "clamp(44px, 6vw, 64px)",
                  }}
                >
                  {option.icon(isActive)}
                  <span
                    className={`text-[13px] min-[380px]:text-[14px] min-[576px]:text-[18px] md:text-[22px] min-[900px]:text-[26px] min-[1065px]:text-[32px] font-medium tracking-normal sm:tracking-wide transition-colors duration-300 whitespace-nowrap ${isActive ? "text-[#2a211c]" : "text-[#2a211c]/60"
                      }`}
                  >
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

export default BannerInner;
