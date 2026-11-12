"use client";
import React from "react";
import Link from "next/link";
import { BASE_URL_IMG } from "../Helpers/imageurl";
import { cityFaresPath } from "../Helpers/destinationUrls";
import { useGeneralSettings } from "../Context/GeneralSettingsContext";

function resolveMediaSrc(path) {
  if (!path || typeof path !== "string") return "";
  if (path.startsWith("http") || path.startsWith("/")) return path;
  const clean = path.replace(/^\/?media\//, "");
  return `${BASE_URL_IMG}/media/${clean}`;
}

function formatPrice(price) {
  const num = Number(price);
  if (Number.isNaN(num) || num <= 0) return null;
  return Math.round(num).toLocaleString();
}

function FareCard({
  destination,
  heightClass,
  overlayClass,
  phoneNumber,
  phoneHref,
}) {
  if (!destination?.slug || !destination?.title || !destination?.image) return null;

  const href = cityFaresPath(destination.slug);
  const imageSrc = resolveMediaSrc(destination.image);
  const priceLabel = formatPrice(destination.price);

  return (
    <Link
      href={href}
      className={`w-full ${heightClass} rounded-[28px] sm:rounded-[32px] overflow-hidden relative shadow-[0_10px_30px_rgba(0,0,0,0.12)] group block`}
    >
      <img
        src={imageSrc}
        alt={`Flights to ${destination.title}`}
        className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

      <div className={`absolute ${overlayClass} flex items-end justify-between z-10`}>
        <div className="flex flex-col text-left min-w-0 pr-2">
          <span className="font-poppins font-normal text-[16px] sm:text-[18px] text-white/90 leading-tight">
            Flights to
          </span>
          <span className="font-poppins font-medium text-[18px] sm:text-[20px] 2xl:text-[22px] text-white leading-tight mt-[2px] truncate">
            {destination.title}
          </span>
        </div>
        <div className="flex flex-col items-end shrink-0">
          {priceLabel ? (
            <span className="font-poppins font-medium text-[22px] sm:text-[24px] 2xl:text-[26px] text-white leading-none">
              £ {priceLabel}
            </span>
          ) : null}
          {phoneHref ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = phoneHref;
              }}
              aria-label={`Call us at ${phoneNumber}`}
              className="mt-[3px] w-[86px] h-[26px] bg-[#1F0060] hover:bg-[#2c0087] text-white font-poppins font-medium text-[12px] rounded-[6px] flex items-center justify-center transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              Call Us
            </button>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

export default function CheapestFlightFares({
  heading,
  subheading,
  destinations = [],
}) {
  const { globalVarsMap } = useGeneralSettings() || {};
  // Same general-settings phone as header (NavBar)
  const phoneNumber = globalVarsMap?.PHONENUMBER || "";
  const phoneHref = phoneNumber
    ? `tel:${String(phoneNumber).replace(/[^0-9+]/g, "")}`
    : "";

  const cards = Array.isArray(destinations) ? destinations.filter(Boolean) : [];
  if (!heading || !subheading || cards.length === 0) return null;

  const [card0, card1, card2, card3, card4] = cards;

  return (
    <section className="w-full py-10 sm:py-14 md:py-16 lg:py-20 bg-white font-poppins overflow-hidden">
      <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="text-center max-w-[900px] mx-auto mb-8 sm:mb-12 lg:mb-14 px-4">
          <h2 className="font-poppins font-bold text-[26px] sm:text-[32px] md:text-[38px] xl:text-[42px] 2xl:text-[46px] text-[#1F0060] tracking-tight leading-tight">
            {heading}
          </h2>
          <p className="font-poppins font-normal text-[14px] sm:text-[16px] md:text-[17px] xl:text-[18px] text-[#555555] mt-3 sm:mt-4 leading-relaxed">
            {subheading}
          </p>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[285fr_387fr_285fr_263fr] gap-6 xl:gap-[20px] 2xl:gap-[24px] xl:pl-[80px]">
          {/* Col1: cards 0 & 1 */}
          <div className="w-full flex flex-col gap-[20px] xl:gap-[26px]">
            <FareCard
              destination={card0}
              heightClass="h-[260px] sm:h-[282px] 2xl:h-[310px] 3xl:h-[340px]"
              overlayClass="bottom-[24px] sm:bottom-[29px] left-[16px] sm:left-[18px] right-[14px] sm:right-[15px]"
              phoneNumber={phoneNumber}
              phoneHref={phoneHref}
            />
            <FareCard
              destination={card1}
              heightClass="h-[260px] sm:h-[282px] 2xl:h-[310px] 3xl:h-[340px]"
              overlayClass="bottom-[24px] sm:bottom-[29px] left-[16px] sm:left-[18px] right-[14px] sm:right-[15px]"
              phoneNumber={phoneNumber}
              phoneHref={phoneHref}
            />
          </div>

          {/* Col2: tall card 2 + MORE */}
          <div className="w-full flex flex-col">
            <FareCard
              destination={card2}
              heightClass="h-[320px] sm:h-[382px] 2xl:h-[420px] 3xl:h-[460px]"
              overlayClass="bottom-[28px] sm:bottom-[38px] left-[20px] sm:left-[26px] right-[20px] sm:right-[26px]"
              phoneNumber={phoneNumber}
              phoneHref={phoneHref}
            />

            <div className="w-full mt-[16px] sm:mt-[20px] flex flex-col items-center">
              <Link
                href="/continents"
                className="w-full h-[100px] sm:h-[131px] 2xl:h-[145px] 3xl:h-[160px] bg-[#1F0060] hover:bg-[#2c0087] rounded-[22px] sm:rounded-[25px] flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all cursor-pointer group"
              >
                <span className="font-poppins font-bold text-[56px] sm:text-[76px] xl:text-[88px] 2xl:text-[96px] text-white tracking-tight leading-none select-none">
                  MORE
                </span>
              </Link>
              <Link
                href="/continents"
                className="font-poppins font-bold text-[28px] sm:text-[34px] xl:text-[41px] 2xl:text-[46px] text-[#5CACC4] tracking-tight uppercase leading-tight mt-2 sm:mt-3 text-center select-none hover:opacity-90 transition-opacity"
              >
                FLIGHT FARES!
              </Link>
            </div>
          </div>

          {/* Col3: cards 3 & 4 */}
          <div className="w-full md:col-span-2 lg:col-span-1 grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-col gap-[20px] xl:gap-[26px]">
            <FareCard
              destination={card3}
              heightClass="h-[260px] sm:h-[282px] 2xl:h-[310px] 3xl:h-[340px]"
              overlayClass="bottom-[24px] sm:bottom-[29px] left-[16px] sm:left-[18px] right-[14px] sm:right-[15px]"
              phoneNumber={phoneNumber}
              phoneHref={phoneHref}
            />
            <FareCard
              destination={card4}
              heightClass="h-[260px] sm:h-[282px] 2xl:h-[310px] 3xl:h-[340px]"
              overlayClass="bottom-[24px] sm:bottom-[29px] left-[16px] sm:left-[18px] right-[14px] sm:right-[15px]"
              phoneNumber={phoneNumber}
              phoneHref={phoneHref}
            />
          </div>

          {/* Col4: cyan + airplane */}
          <div className="hidden xl:block xl:h-[590px] 2xl:h-[640px] bg-[#5CACC4] rounded-[40px] relative overflow-visible shadow-lg">
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
