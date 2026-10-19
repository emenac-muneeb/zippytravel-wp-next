"use client";
import React, { useState, useEffect } from "react";
import { useGeneralSettings } from "../Context/GeneralSettingsContext";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { parsePortalLogos } from "../Helpers/parseBusinessSlogans";
import "swiper/css";

/** Fixed height for hero brand row including optional pagination dots (prevents CLS). */
const HERO_BRAND_ROW = "min-h-[88px]";
const DEFAULT_BRAND_ROW = "min-h-[88px]";

const LogoItem = ({
  logo,
  className = "",
  imgClassName = "",
  width = 140,
  height = 56,
  loading = "lazy",
}) => {
  const label = logo.title || "Brand logo";
  const img = (
    <img
      src={logo.img}
      alt={label}
      width={width}
      height={height}
      className={imgClassName}
      loading={loading}
      decoding="async"
    />
  );

  if (logo.link) {
    return (
      <a
        href={logo.link}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className={className}
      >
        {img}
      </a>
    );
  }

  return (
    <span className={className} role="img" aria-label={label}>
      {img}
    </span>
  );
};

const BrandingSection = ({ variant = "default" }) => {
  const { settings, loading } = useGeneralSettings();
  const [activeSlide, setActiveSlide] = useState(0);
  const [swiperInstance, setSwiperInstance] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [swiperReady, setSwiperReady] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logos = parsePortalLogos(settings);
  const isHero = variant === "hero";

  if (loading && logos.length === 0) {
    return (
      <div
        className={`${isHero ? HERO_BRAND_ROW : DEFAULT_BRAND_ROW} w-full`}
        aria-hidden
      />
    );
  }

  if (logos.length === 0) return null;

  const hasMultipleImages = logos.length > 1;

  if (isHero) {
    return (
      <>
        {/* Mobile: carousel, white-filtered logos */}
        <div
          className={`block md:hidden w-full py-2 ${HERO_BRAND_ROW} relative overflow-hidden flex flex-col justify-center`}
        >
          {/* Static first logo until Swiper is ready — same box size as slides */}
          {!swiperReady && logos.length > 0 && (
            <div className="flex justify-center items-center w-full h-[56px]">
              <LogoItem
                logo={logos[0]}
                className="flex justify-center items-center w-full h-[56px]"
                imgClassName="max-h-[56px] h-[56px] w-auto max-w-[140px] object-contain brightness-0 invert opacity-90"
                width={140}
                height={56}
                loading="eager"
              />
            </div>
          )}

          {mounted ? (
            <Swiper
              className={
                swiperReady
                  ? "branding-stable-swiper relative w-full overflow-hidden"
                  : "branding-stable-swiper absolute inset-0 opacity-0 pointer-events-none"
              }
              modules={[Autoplay]}
              spaceBetween={0}
              slidesPerView={1}
              loop={hasMultipleImages}
              autoplay={
                hasMultipleImages
                  ? { delay: 3000, disableOnInteraction: false }
                  : false
              }
              speed={500}
              onSwiper={(swiper) => {
                setSwiperInstance(swiper);
                requestAnimationFrame(() => setSwiperReady(true));
              }}
              onSlideChange={(swiper) => setActiveSlide(swiper.realIndex)}
            >
              {logos.map((logo) => (
                <SwiperSlide key={logo.index} className="!h-auto">
                  <div className="flex justify-center items-center w-full h-[56px]">
                    <LogoItem
                      logo={logo}
                      className="flex justify-center items-center w-full h-[56px]"
                      imgClassName="max-h-[56px] h-[56px] w-auto max-w-[140px] object-contain brightness-0 invert opacity-90"
                      width={140}
                      height={56}
                      loading={logo.index === logos[0].index ? "eager" : "lazy"}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : null}

          {/* Always reserve pagination height when multiple logos (invisible until ready) */}
          {hasMultipleImages && (
            <div
              className={`flex justify-center gap-x-3 mt-3 h-[6px] ${
                swiperReady ? "" : "invisible"
              }`}
              aria-hidden={!swiperReady}
            >
              {logos.map((logo, i) => (
                <button
                  key={logo.index}
                  type="button"
                  onClick={() => swiperInstance?.slideToLoop(i)}
                  className={`h-[6px] transition-all duration-300 rounded-full ${
                    activeSlide === i ? "w-6 bg-[#F27A2A]" : "w-3 bg-white/40"
                  }`}
                  aria-label={`Go to ${logo.title || `slide ${i + 1}`}`}
                  tabIndex={swiperReady ? 0 : -1}
                />
              ))}
            </div>
          )}
        </div>

        {/* Desktop: connected logo row */}
        <div className="hidden md:flex items-center justify-center w-full max-w-[900px] mx-auto px-4 min-h-[60px]">
          {logos.map((logo, index) => (
            <React.Fragment key={logo.index}>
              {index > 0 && (
                <div className="flex-1 max-w-[40px] lg:max-w-[52px] h-px bg-white/50 mx-2 relative" />
              )}
              <LogoItem
                logo={logo}
                className="flex-shrink-0 px-2 lg:px-3 flex items-center justify-center h-[60px]"
                imgClassName="max-h-[52px] lg:max-h-[60px] h-[52px] lg:h-[60px] w-auto max-w-[140px] object-contain"
                width={140}
                height={60}
                loading={index === 0 ? "eager" : "lazy"}
              />
            </React.Fragment>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <div
        className={`block md:hidden bg-white rounded-md w-full py-5 ${DEFAULT_BRAND_ROW} relative overflow-hidden flex flex-col justify-center`}
      >
        {!swiperReady && logos.length > 0 && (
          <div className="flex justify-center items-center w-full h-[83px]">
            <LogoItem
              logo={logos[0]}
              className="flex justify-center items-center w-full h-[83px]"
              imgClassName="max-h-[83px] h-[83px] w-auto max-w-[160px] object-contain"
              width={160}
              height={83}
              loading="eager"
            />
          </div>
        )}

        {mounted ? (
          <Swiper
            className={
              swiperReady
                ? "branding-stable-swiper relative w-full overflow-hidden"
                : "branding-stable-swiper absolute inset-0 opacity-0 pointer-events-none"
            }
            modules={[Autoplay]}
            spaceBetween={0}
            slidesPerView={1}
            loop={hasMultipleImages}
            autoplay={
              hasMultipleImages
                ? { delay: 3000, disableOnInteraction: false }
                : false
            }
            speed={500}
            onSwiper={(swiper) => {
              setSwiperInstance(swiper);
              requestAnimationFrame(() => setSwiperReady(true));
            }}
            onSlideChange={(swiper) => setActiveSlide(swiper.realIndex)}
          >
            {logos.map((logo) => (
              <SwiperSlide key={logo.index} className="!h-auto">
                <div className="flex justify-center items-center w-full h-[83px]">
                  <LogoItem
                    logo={logo}
                    className="flex justify-center items-center w-full h-[83px]"
                    imgClassName="max-h-[83px] h-[83px] w-auto max-w-[160px] object-contain"
                    width={160}
                    height={83}
                    loading={logo.index === logos[0].index ? "eager" : "lazy"}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : null}

        {hasMultipleImages && (
          <div
            className={`flex justify-center gap-x-3 mt-3 h-[6px] ${
              swiperReady ? "" : "invisible"
            }`}
            aria-hidden={!swiperReady}
          >
            {logos.map((logo, i) => (
              <button
                key={logo.index}
                type="button"
                onClick={() => swiperInstance?.slideToLoop(i)}
                className={`h-[6px] transition-all duration-300 rounded-full ${
                  activeSlide === i ? "w-6 bg-primary" : "w-3 bg-gray-300"
                }`}
                aria-label={`Go to ${logo.title || `slide ${i + 1}`}`}
                tabIndex={swiperReady ? 0 : -1}
              />
            ))}
          </div>
        )}
      </div>

      <div
        className={`hidden md:flex flex-wrap items-center justify-center gap-y-3 bg-white text-black rounded-md container mx-auto py-4 px-3 ${DEFAULT_BRAND_ROW}`}
      >
        {logos.map((logo, index) => (
          <React.Fragment key={logo.index}>
            {index > 0 && (
              <div className="hidden md:block w-px self-stretch min-h-[40px] bg-gray-300 mx-2 lg:mx-4" />
            )}
            <div className="flex items-center justify-center h-[83px] px-2 lg:px-3">
              <LogoItem
                logo={logo}
                imgClassName="max-h-[83px] h-[83px] w-auto max-w-[160px] object-contain"
                width={160}
                height={83}
                loading={index === 0 ? "eager" : "lazy"}
              />
            </div>
          </React.Fragment>
        ))}
      </div>
    </>
  );
};

export default BrandingSection;
