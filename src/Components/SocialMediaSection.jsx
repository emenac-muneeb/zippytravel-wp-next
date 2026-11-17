"use client";
import React from "react";
import Image from "next/image";
import { useGeneralSettings } from "../Context/GeneralSettingsContext";

// Extract clean pathname slug e.g. "https://www.facebook.com/zippytravel" → "/zippytravel"
function extractSlug(url, fallbackSlug) {
  if (!url || typeof url !== "string") return fallbackSlug;
  const trimmed = url.trim();
  if (!trimmed || trimmed === "#") return fallbackSlug;

  try {
    const parsed = new URL(
      trimmed.startsWith("http") ? trimmed : `https://${trimmed.replace(/^\/+/, "")}`
    );

    // Special formatting for wa.me / whatsapp links
    if (parsed.hostname.includes("wa.me")) {
      const phone = parsed.pathname.replace(/^\/+/, "");
      return phone ? `/${phone}` : fallbackSlug;
    }

    const path = parsed.pathname;
    if (!path || path === "/" || path === "") {
      return fallbackSlug;
    }
    return path.startsWith("/") ? path : `/${path}`;
  } catch {
    return fallbackSlug;
  }
}

// Map platform hint to label, icon and styles
function resolvePlatform(iconPath, url, alt) {
  const hint = `${iconPath || ""} ${url || ""} ${alt || ""}`.toLowerCase();

  if (hint.includes("facebook") || hint.includes("fb.com") || hint.includes("facbook")) {
    return {
      title: "Facebook",
      fallbackSlug: "/zippytravel",
      icon: "/facebook-1.png",
      iconWidth: 20,
      iconHeight: 32,
      iconClassName: "w-[20px] h-[32px] object-contain brightness-0 invert",
    };
  }

  if (hint.includes("instagram") || hint.includes("insta")) {
    return {
      title: "Instagram",
      fallbackSlug: "/zippytravel/",
      icon: "/instagram-2.png",
      iconWidth: 30,
      iconHeight: 30,
      iconClassName: "w-[30px] h-[30px] object-contain",
    };
  }

  if (hint.includes("whatsapp") || hint.includes("wa.me") || hint.includes("whatapp")) {
    return {
      title: "WhatsApp",
      fallbackSlug: "/+442081464666",
      icon: "/whastapp-icon.png",
      iconWidth: 34,
      iconHeight: 34,
      iconClassName: "w-[34px] h-[34px] object-contain",
    };
  }

  if (hint.includes("twitter") || hint.includes("x.com")) {
    return {
      title: "Twitter",
      fallbackSlug: "/zippytravel",
      icon: "/twitter-2.png",
      iconWidth: 28,
      iconHeight: 28,
      iconClassName: "w-[28px] h-[28px] object-contain brightness-0 invert",
    };
  }

  if (hint.includes("pinterest")) {
    return {
      title: "Pinterest",
      fallbackSlug: "/zippytravel/",
      icon: "/social-2.png",
      iconWidth: 28,
      iconHeight: 30,
      iconClassName: "w-[28px] h-[30px] object-contain",
    };
  }

  if (hint.includes("youtube")) {
    return {
      title: "YouTube",
      fallbackSlug: "/zippytravel",
      icon: "/social-2.png",
      iconWidth: 28,
      iconHeight: 28,
      iconClassName: "w-[28px] h-[28px] object-contain",
    };
  }

  if (hint.includes("linkedin")) {
    return {
      title: "LinkedIn",
      fallbackSlug: "/zippytravel",
      icon: "/facebook-1.png",
      iconWidth: 24,
      iconHeight: 24,
      iconClassName: "w-[24px] h-[24px] object-contain brightness-0 invert",
    };
  }

  // Generic fallback: use alt text or icon from backend
  const fallbackTitle = alt ? alt.charAt(0).toUpperCase() + alt.slice(1) : "Social";
  const iconUrl = iconPath
    ? iconPath.startsWith("http")
      ? iconPath
      : `https://admin.zippytravel.co.uk/${iconPath.replace(/^\/+/, "")}`
    : "/facebook-1.png";

  return {
    title: fallbackTitle,
    fallbackSlug: "/zippytravel",
    icon: iconUrl,
    iconWidth: 30,
    iconHeight: 30,
    iconClassName: "w-[30px] h-[30px] object-contain",
  };
}

export default function SocialMediaSection({ heading = "", subHeading = "" }) {
  const { footerSetting, settings, globalVarsMap } = useGeneralSettings();

  // Dynamic phone number strictly from API global variables or footer setting
  const phoneNumber =
    globalVarsMap?.PHONENUMBER ||
    footerSetting?.contents?.footer_phone ||
    "";
  const telHref = phoneNumber
    ? `tel:${String(phoneNumber).replace(/[^0-9+]/g, "")}`
    : "#";

  // Find social media icons from footerSetting or settings
  const socialIcons =
    footerSetting?.social_media_icons ||
    (Array.isArray(settings)
      ? settings.find((item) => item.ref_name === "Footer Social Media Icons" || item.id === 15)
          ?.contents
      : null);

  // Dynamic cards built strictly from backend data
  const dynamicCards = React.useMemo(() => {
    if (!socialIcons || typeof socialIcons !== "object") return [];
    if (socialIcons.enable_social_media_icons !== "1") return [];

    const items = [];
    Object.entries(socialIcons)
      .filter(
        ([key]) =>
          key.startsWith("social_media_icons_") &&
          !key.includes("input") &&
          !key.includes("alt") &&
          !key.includes("INDEX") &&
          !key.includes("enable") &&
          socialIcons[key]
      )
      .forEach(([key, iconPath]) => {
        const num = key.split("_").pop();
        const inputKey = `social_media_icons_input_${num}`;
        const altKey = `social_media_icons_alt_input_${num}`;
        const rawUrl = socialIcons[inputKey];
        const altText = socialIcons[altKey] || "";

        if (!rawUrl || rawUrl === "#" || typeof rawUrl !== "string") return;

        const platform = resolvePlatform(iconPath, rawUrl, altText);
        const slug = extractSlug(rawUrl, platform.fallbackSlug);

        items.push({
          id: `social_${num}`,
          title: platform.title,
          url: rawUrl,
          slug,
          icon: platform.icon,
          iconWidth: platform.iconWidth,
          iconHeight: platform.iconHeight,
          iconClassName: platform.iconClassName,
        });
      });

    return items;
  }, [socialIcons]);

  // Fallback cards if backend data hasn't loaded yet
  const fallbackCards = [
    {
      id: "fallback_fb",
      title: "Facebook",
      url: "https://facebook.com/zippytravel",
      slug: "/zippytravel",
      icon: "/facebook-1.png",
      iconWidth: 20,
      iconHeight: 32,
      iconClassName: "w-[20px] h-[32px] object-contain brightness-0 invert",
    },
    {
      id: "fallback_insta",
      title: "Instagram",
      url: "https://instagram.com/zippytravel/",
      slug: "/zippytravel/",
      icon: "/instagram-2.png",
      iconWidth: 30,
      iconHeight: 30,
      iconClassName: "w-[30px] h-[30px] object-contain",
    },
    {
      id: "fallback_tw",
      title: "Twitter",
      url: "https://twitter.com/zippytravel",
      slug: "/zippytravel",
      icon: "/twitter-2.png",
      iconWidth: 28,
      iconHeight: 28,
      iconClassName: "w-[28px] h-[28px] object-contain brightness-0 invert",
    },
  ];

  // Exactly as many cards as backend has added (or fallback before load)
  const allCards = dynamicCards.length > 0 ? dynamicCards : fallbackCards;

  // Split cards evenly between left and right sides
  const half = Math.ceil(allCards.length / 2);
  const leftCards = allCards.slice(0, half);
  const rightCards = allCards.slice(half);

  return (
    <section className="w-full py-6 md:py-10 font-poppins">
      {/* Optional Heading Section */}
      {(heading || subHeading) && (
        <div className="text-center max-w-[800px] mx-auto mb-10 sm:mb-14">
          {heading ? <h2 className="pre_heading">{heading}</h2> : null}
          {subHeading ? <p className="sub_text mt-2 sm:mt-3">{subHeading}</p> : null}
        </div>
      )}

      {/* Main Responsive Grid / Flex Container centered at max-w-[1360px] */}
      <div className="w-full max-w-[1360px] mx-auto px-14 sm:px-16 lg:px-20">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-4 xl:gap-8">

          {/* ══════════════ LEFT COLUMN ══════════════ */}
          {leftCards.length > 0 && (
            <div className="flex flex-col gap-6 sm:gap-7 w-full sm:w-auto items-center lg:items-end">
              {leftCards.map((card) => (
                <a
                  key={card.id}
                  href={card.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit Zippy Travel on ${card.title}`}
                  className="relative w-full max-w-[300px] sm:w-[300px] lg:w-[280px] xl:w-[310px] 2xl:w-[331px] h-[110px] bg-white rounded-[22px] border border-[#CBD5E1] shadow-[0_4px_20px_rgba(0,0,0,0.05)] pl-[52px] pr-4 py-3 flex flex-col justify-center text-left transition-all duration-300 hover:shadow-[0_8px_30px_rgba(92,172,196,0.22)] hover:-translate-y-1 group"
                >
                  {/* Overlapping Left Icon Badge: 70px x 77px */}
                  <div className="absolute -left-[40px] top-1/2 -translate-y-1/2 w-[70px] h-[77px] bg-[#5CACC4] rounded-[18px] flex items-center justify-center shadow-[0_4px_14px_rgba(92,172,196,0.45)] group-hover:scale-105 transition-transform duration-300 z-10">
                    {card.icon?.startsWith("http") ? (
                      <img
                        src={card.icon}
                        alt={card.title}
                        className={card.iconClassName}
                      />
                    ) : (
                      <Image
                        src={card.icon}
                        alt={card.title}
                        width={card.iconWidth}
                        height={card.iconHeight}
                        className={card.iconClassName}
                      />
                    )}
                  </div>
                  <span className="text-[#5CACC4] text-[16px] lg:text-[17px] xl:text-[20px] font-bold leading-tight">
                    {card.title}
                  </span>
                  <span
                    title={card.slug}
                    className={`text-[#1F0060] ${
                      card.slug.length > 14
                        ? "text-[17px] lg:text-[19px] xl:text-[23px] 2xl:text-[25px]"
                        : "text-[20px] lg:text-[22px] xl:text-[32px]"
                    } font-bold leading-tight mt-0.5 tracking-tight truncate`}
                  >
                    {card.slug}
                  </span>
                </a>
              ))}

              {/* Blank slot filler to preserve 2x2 grid slot when left has fewer cards */}
              {leftCards.length < Math.max(2, rightCards.length) &&
                Array.from({
                  length: Math.max(2, rightCards.length) - leftCards.length,
                }).map((_, i) => (
                  <div
                    key={`left_blank_${i}`}
                    aria-hidden="true"
                    className="hidden lg:block w-full max-w-[300px] sm:w-[300px] lg:w-[280px] xl:w-[310px] 2xl:w-[331px] h-[110px] opacity-0 pointer-events-none select-none"
                  />
                ))}
            </div>
          )}

          {/* ══════════════ CENTER DIV (387px x 260px, bg #1F0060) ══════════════ */}
          <div className="relative w-full max-w-[340px] sm:w-[340px] lg:w-[320px] xl:w-[360px] 2xl:w-[387px] h-[260px] bg-[#1F0060] rounded-[28px] my-6 lg:my-0 flex-shrink-0 shadow-[0_12px_40px_rgba(31,0,96,0.25)]">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[239px] h-[314px] pointer-events-none select-none">
              <Image
                src="/social-media-image.png"
                alt="zippytravel"
                width={239}
                height={314}
                priority
                className="w-[239px] h-[314px] object-contain object-bottom"
              />
            </div>
          </div>

          {/* ══════════════ RIGHT COLUMN ══════════════ */}
          {rightCards.length > 0 && (
            <div className="flex flex-col gap-6 sm:gap-7 w-full sm:w-auto items-center lg:items-start">
              {rightCards.map((card) => (
                <a
                  key={card.id}
                  href={card.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit Zippy Travel on ${card.title}`}
                  className="relative w-full max-w-[300px] sm:w-[300px] lg:w-[280px] xl:w-[310px] 2xl:w-[331px] h-[110px] bg-white rounded-[22px] border border-[#CBD5E1] shadow-[0_4px_20px_rgba(0,0,0,0.05)] pr-[52px] pl-4 py-3 flex flex-col justify-center text-right transition-all duration-300 hover:shadow-[0_8px_30px_rgba(92,172,196,0.22)] hover:-translate-y-1 group"
                >
                  {/* Overlapping Right Icon Badge: 70px x 77px */}
                  <div className="absolute -right-[40px] top-1/2 -translate-y-1/2 w-[70px] h-[77px] bg-[#5CACC4] rounded-[18px] flex items-center justify-center shadow-[0_4px_14px_rgba(92,172,196,0.45)] group-hover:scale-105 transition-transform duration-300 z-10">
                    {card.icon?.startsWith("http") ? (
                      <img
                        src={card.icon}
                        alt={card.title}
                        className={card.iconClassName}
                      />
                    ) : (
                      <Image
                        src={card.icon}
                        alt={card.title}
                        width={card.iconWidth}
                        height={card.iconHeight}
                        className={card.iconClassName}
                      />
                    )}
                  </div>
                  <span className="text-[#5CACC4] text-[16px] lg:text-[17px] xl:text-[20px] font-bold leading-tight">
                    {card.title}
                  </span>
                  <span
                    title={card.slug}
                    className={`text-[#1F0060] ${
                      card.slug.length > 14
                        ? "text-[17px] lg:text-[19px] xl:text-[23px] 2xl:text-[25px]"
                        : "text-[20px] lg:text-[22px] xl:text-[32px]"
                    } font-bold leading-tight mt-0.5 tracking-tight truncate`}
                  >
                    {card.slug}
                  </span>
                </a>
              ))}

              {/* Dynamic Call Us Now Card to complete the 2x2 grid on right bottom */}
              {rightCards.length < Math.max(2, leftCards.length) && (
                <a
                  key="call_us_now_card"
                  href={telHref}
                  aria-label={`Call Zippy Travel at ${phoneNumber}`}
                  className="relative w-full max-w-[300px] sm:w-[300px] lg:w-[280px] xl:w-[310px] 2xl:w-[331px] h-[110px] bg-white rounded-[22px] border border-[#CBD5E1] shadow-[0_4px_20px_rgba(0,0,0,0.05)] pr-[52px] pl-4 py-3 flex flex-col justify-center text-right transition-all duration-300 hover:shadow-[0_8px_30px_rgba(92,172,196,0.22)] hover:-translate-y-1 group"
                >
                  {/* Overlapping Right Icon Badge: 70px x 77px */}
                  <div className="absolute -right-[40px] top-1/2 -translate-y-1/2 w-[70px] h-[77px] bg-[#5CACC4] rounded-[18px] flex items-center justify-center shadow-[0_4px_14px_rgba(92,172,196,0.45)] group-hover:scale-105 transition-transform duration-300 z-10">
                    <Image
                      src="/Vector1.png"
                      alt="Call Us Now"
                      width={28}
                      height={37}
                      className="w-[28px] h-[37px] object-contain brightness-0 invert"
                    />
                  </div>
                  <span className="text-[#5CACC4] text-[16px] lg:text-[17px] xl:text-[20px] font-bold leading-tight">
                    Call Us Now!
                  </span>
                  <span
                    title={phoneNumber}
                    className="text-[#1F0060] text-[18px] lg:text-[20px] xl:text-[24px] 2xl:text-[26px] font-bold leading-tight mt-0.5 tracking-tight truncate"
                  >
                    {phoneNumber}
                  </span>
                </a>
              )}

              {/* Blank slot filler if right column still has fewer cards than left column */}
              {rightCards.length + 1 < leftCards.length &&
                Array.from({
                  length: leftCards.length - (rightCards.length + 1),
                }).map((_, i) => (
                  <div
                    key={`right_blank_${i}`}
                    aria-hidden="true"
                    className="hidden lg:block w-full max-w-[300px] sm:w-[300px] lg:w-[280px] xl:w-[310px] 2xl:w-[331px] h-[110px] opacity-0 pointer-events-none select-none"
                  />
                ))}
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
