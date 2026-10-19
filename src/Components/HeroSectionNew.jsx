"use client";
import axios from "axios";
import { useEffect, useState, useRef, Suspense } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { endpoints } from "../Helpers/endpoints";
import { BASE_URL_IMG } from "../Helpers/imageurl";
import BrandingSection from "./BrandingSection";

/** Prefer smaller WebM; MP4 fallback for Safari. Paths must match public/ casing (Linux-sensitive). */
const HOME_BANNER_VIDEO_WEBM = "/banner-video.webm";

/** Matches collapsed mobile FlightTab (class + trip + From/To/Search) and desktop single-row form. */
const FLIGHT_FORM_RESERVE =
  "w-full min-h-[300px] md:min-h-[140px] overflow-visible relative z-20";

const FlightFormPlaceholder = () => (
  <div
    className={`${FLIGHT_FORM_RESERVE} rounded-[15px] bg-white/20 animate-pulse`}
    aria-hidden
  />
);

const FlightTabNew = dynamic(() => import("./FlightTabNew"), {
  ssr: true,
  loading: () => <FlightFormPlaceholder />,
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

const HeroSectionNew = ({
  setFlightLoading,
  setPopupMessage,
  initialBanners = [],
}) => {
  const [activeTab, setActiveTab] = useState("flights");
  const [banners, setBanners] = useState(initialBanners);
  const [selectedClass, setSelectedClass] = useState("Business");
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [allowDesktopVideo, setAllowDesktopVideo] = useState(false);
  const videoRef = useRef(null);

  const showServiceTabs = false;

  const tabs = [
    { name: "FLIGHTS", icon: `${BASE_URL_IMG}/assets/svgs/flight.svg` },
    { name: "HOLIDAYS", icon: `${BASE_URL_IMG}/assets/svgs/holiday.svg` },
    { name: "UMRAH", icon: `${BASE_URL_IMG}/assets/svgs/umrah.svg` },
  ];

  useEffect(() => {
    if (banners.length === 0) {
      axios
        .get(endpoints.banner)
        .then((res) => {
          if (res.data.status === 1) {
            setBanners(res.data.result);
          }
        })
        .catch((err) => console.error("Failed to fetch banners:", err));
    }
  }, [banners.length]);

  // Desktop only: start video well after LCP (poster) has settled.
  // Early video paint becomes the LCP element and inflates the score even at ~1MB.
  // Mobile: poster only — no video download / decode.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mq = window.matchMedia("(min-width: 1024px)");
    let idleId = 0;
    let timeoutId = 0;
    let cancelled = false;
    let onLoad = null;

    const clearDeferred = () => {
      if (idleId && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) clearTimeout(timeoutId);
      if (onLoad) {
        window.removeEventListener("load", onLoad);
        onLoad = null;
      }
      idleId = 0;
      timeoutId = 0;
    };

    const enableVideo = () => {
      if (cancelled || !mq.matches) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      setAllowDesktopVideo(true);
    };

    const afterLoad = () => {
      if (cancelled) return;
      if ("requestIdleCallback" in window) {
        idleId = window.requestIdleCallback(enableVideo, { timeout: 4000 });
      } else {
        timeoutId = window.setTimeout(enableVideo, 3000);
      }
    };

    const scheduleVideo = () => {
      clearDeferred();
      if (cancelled || !mq.matches) {
        setAllowDesktopVideo(false);
        setIsVideoReady(false);
        return;
      }

      // Wait for full load + short buffer so the optimized poster remains LCP
      if (document.readyState === "complete") {
        timeoutId = window.setTimeout(afterLoad, 2500);
      } else {
        onLoad = () => {
          timeoutId = window.setTimeout(afterLoad, 2500);
        };
        window.addEventListener("load", onLoad, { once: true });
      }
    };

    scheduleVideo();
    mq.addEventListener("change", scheduleVideo);

    return () => {
      cancelled = true;
      clearDeferred();
      mq.removeEventListener("change", scheduleVideo);
    };
  }, []);

  const currentBanner = banners.find(
    (item) => item?.slug?.toLowerCase() === activeTab.toLowerCase()
  );

  const getBannerImage = () => {
    if (!currentBanner || !currentBanner.image_url) return "";
    return `${BASE_URL_IMG}/media/${currentBanner.image_url}`;
  };

  const bannerPoster = getBannerImage();

  // Autoplay muted looping background video (desktop only, after deferral)
  useEffect(() => {
    if (!allowDesktopVideo) return;

    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;

    const markReadyAndPlay = () => {
      if (cancelled) return;
      setIsVideoReady(true);
      const playPromise = video.play();
      if (playPromise?.catch) {
        playPromise.catch(() => {
          // Autoplay may be blocked; poster stays visible
        });
      }
    };

    const onCanPlay = () => markReadyAndPlay();
    const onPlaying = () => {
      if (!cancelled) setIsVideoReady(true);
    };

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    if (video.readyState >= 3) {
      markReadyAndPlay();
    } else {
      video.addEventListener("canplay", onCanPlay);
      video.addEventListener("playing", onPlaying);
    }

    return () => {
      cancelled = true;
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("playing", onPlaying);
    };
  }, [allowDesktopVideo]);

  const parseDescription = (htmlString) => {
    if (!htmlString) return { h2Text: "", pText: "" };
    const h2Match = htmlString.match(/<h2[^>]*>(.*?)<\/h2>/i);
    const pMatch = htmlString.match(/<p[^>]*>(.*?)<\/p>/i);
    const h2Text = h2Match ? h2Match[1].replace(/<[^>]*>/g, "").trim() : "";
    const pText = pMatch ? pMatch[1].replace(/<[^>]*>/g, "").trim() : "";
    return { h2Text, pText };
  };

  const { h2Text, pText } = parseDescription(currentBanner?.description || "");
  // CMS may put the main line in <h2> or <p>; promote to large serif headline
  const heroHeadline = h2Text || pText;
  const heroSupport = h2Text ? pText : "";

  return (
    <section className="relative w-full">
      {/* Outer shell keeps radius; overflow stays visible so form dropdowns are not clipped */}
      <div className="relative w-full rounded-b-[40px] sm:rounded-b-[56px] lg:rounded-b-[72px] min-h-[640px] sm:min-h-[720px] lg:min-h-[820px]">
        {/* Background only — clip media to rounded corners without clipping dropdowns */}
        <div className="absolute inset-0 overflow-hidden rounded-b-[40px] sm:rounded-b-[56px] lg:rounded-b-[72px] bg-[#2a211c]">
          {bannerPoster ? (
            <Image
              src={bannerPoster}
              alt={currentBanner?.image_alt || "Banner"}
              title={currentBanner?.image_title || ""}
              fill
              priority
              fetchPriority="high"
              sizes="100vw"
              quality={70}
              className="object-cover scale-105"
            />
          ) : null}

          {allowDesktopVideo ? (
            <video
              ref={videoRef}
              className={`absolute inset-0 w-full h-full object-cover scale-105 transition-opacity duration-700 ease-out pointer-events-none ${
                isVideoReady ? "opacity-100" : "opacity-0"
              }`}
              poster={bannerPoster || undefined}
              muted
              loop
              playsInline
              autoPlay
              preload="none"
              controls={false}
              disablePictureInPicture
              aria-hidden
              tabIndex={-1}
            >
              <source src={HOME_BANNER_VIDEO_WEBM} type="video/webm" />
            </video>
          ) : null}

          {/* Dark warm overlay */}
          <div
            className="absolute inset-0 z-[1]"
            style={{
              background:
                "linear-gradient(180deg, rgba(25,18,14,0.55) 0%, rgba(25,18,14,0.45) 40%, rgba(25,18,14,0.72) 100%)",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center w-[94%] max-w-[1320px] mx-auto pt-[100px] sm:pt-[120px] lg:pt-[250px] pb-10 sm:pb-12 lg:pb-14 overflow-visible">
          {/* Headings — keep dynamic banner title / description */}
          <div className="text-center max-w-[900px] mx-auto mb-3 sm:mb-8 px-2 min-h-[80px] sm:min-h-[120px]">
            {activeTab === "flights" ? (
              <h1 className="hero-banner-title tracking-wide text-[#fff]">
                <span className="text-[16px] sm:text-[24px] md:text-[24px] font-bold text-[#fff] block">
                   {currentBanner?.title}
                </span>
                <span className="text-[24px] sm:text-[34px] md:text-[45px] font-extralight block">
                  {heroHeadline}
                </span>
              </h1>
            ) : (
              <p className="hero-banner-title tracking-wide">
                {currentBanner?.title}
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

          {/* Form area — reserved height prevents CLS while FlightTab hydrates */}
          <div className={FLIGHT_FORM_RESERVE}>
            {activeTab === "flights" && (
              <Suspense fallback={<FlightFormPlaceholder />}>
                <FlightTabNew
                  setFlightLoading={setFlightLoading}
                  activeTab={activeTab}
                  setPopupMessage={setPopupMessage}
                  selectedClass={selectedClass}
                  setSelectedClass={setSelectedClass}
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
          <div className="w-full mt-8 sm:mt-10">
            <BrandingSection variant="hero" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSectionNew;
