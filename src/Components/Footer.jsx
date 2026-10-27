"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { endpoints } from "../Helpers/endpoints";
import api from "../Helpers/apiHelper";
import { BASE_URL_IMG } from "../Helpers/imageurl";
import { useGeneralSettings } from "../Context/GeneralSettingsContext";

function decodeHtmlEntities(text) {
  if (!text || typeof text !== "string") return "";
  return text
    .replace(/\u00A0/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(Number(num)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

const Footer = () => {
  const { footerSetting } = useGeneralSettings();
  const [footerData, setFooterData] = useState(() => footerSetting ?? {});

  useEffect(() => {
    if (footerSetting) {
      setFooterData(footerSetting);
    }
  }, [footerSetting]);

  useEffect(() => {
    if (footerSetting?.logo || footerSetting?.contents) return;

    const fetchSettings = async () => {
      try {
        const res = await api.get(endpoints.generalSettings);
        if (res.data.status === 1) {
          setFooterData(res.data.result.footer_setting ?? {});
        }
      } catch (error) {
        console.error("Failed to fetch general settings:", error);
      }
    };
    fetchSettings();
  }, [footerSetting]);

  const extractLinksFromHTML = (htmlString) => {
    if (!htmlString) return [];
    const links = [];
    const anchorTagRegex = /<a\b[^>]*>[\s\S]*?<\/a>/gi;
    let tagMatch = anchorTagRegex.exec(htmlString);

    while (tagMatch) {
      const tag = tagMatch[0];
      const hrefMatch = tag.match(/(?:^|\s)href=["']([^"']+)["']/i);
      const labelMatch = tag.match(/<a\b[^>]*>([\s\S]*?)<\/a>/i);

      if (hrefMatch) {
        links.push({
          href: decodeHtmlEntities(hrefMatch[1]),
          label: decodeHtmlEntities(
            (labelMatch?.[1] || "").replace(/<[^>]*>/g, "").trim()
          ),
        });
      }
      tagMatch = anchorTagRegex.exec(htmlString);
    }
    return links;
  };

  const getSocialPlatformLabel = (iconUrl, platformUrl) => {
    const hint = `${iconUrl || ""} ${platformUrl || ""}`.toLowerCase();
    if (hint.includes("facebook")) return "Facebook";
    if (hint.includes("instagram")) return "Instagram";
    if (hint.includes("twitter") || hint.includes("x.com")) return "X (Twitter)";
    if (hint.includes("linkedin")) return "LinkedIn";
    if (hint.includes("youtube")) return "YouTube";
    if (hint.includes("whatsapp")) return "WhatsApp";
    if (hint.includes("pinterest")) return "Pinterest";
    const file = String(iconUrl || "").split("/").pop()?.replace(/\.\w+$/, "") || "";
    if (file) return file.replace(/[-_]/g, " ");
    return "Social media";
  };

  const footerContents = footerData?.contents || {};

  // Extract navigation links strictly from API
  const navLinks1 = extractLinksFromHTML(footerContents.link_1_content);
  const navLinks2 = extractLinksFromHTML(footerContents.link_2_content);
  const allNavLinks = [...navLinks1, ...navLinks2];

  const phone = footerContents.footer_phone || "";
  const email = footerContents.footer_email || "";
  const address = decodeHtmlEntities(footerContents.footer_address || "");

  return (
    <footer className="w-full bg-[#1F0060] text-white font-poppins pt-12 pb-10 sm:pt-16 sm:pb-12">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
        {/* Brand Logo */}
        <div className="mb-7 sm:mb-8">
          <Link href="/" aria-label="Zippy Travel Home">
            <img
              src="/ZTlogo-white.png"
              alt="Zippy Travel"
              className="h-[38px] sm:h-[44px] w-auto object-contain mx-auto transition-transform hover:scale-105"
            />
          </Link>
        </div>

        {/* Dynamic Navigation Links from API with vertical divider bars */}
        {allNavLinks.length > 0 && (
          <div className="max-w-[960px] mx-auto mb-8 flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 gap-y-2 text-[14px] sm:text-[15px] font-medium text-white/95">
            {allNavLinks.map((link, idx) => (
              <React.Fragment key={link.href + idx}>
                <a
                  href={link.href}
                  className="hover:text-[#5CACC4] transition-colors"
                >
                  {link.label}
                </a>
                {idx < allNavLinks.length - 1 && (
                  <span className="text-white/35 font-light select-none">
                    |
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Call Us Now! + Dynamic Phone from API + ATOL Badge */}
        {phone && (
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-4">
            <span className="text-white font-bold text-[17px] sm:text-[20px] tracking-tight">
              Call Us Now!
            </span>

            <a
              href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
              className="bg-[#5CACC4] hover:bg-[#4ea2b9] text-white font-bold text-[16px] sm:text-[19px] px-5 sm:px-6 py-2 rounded-[10px] shadow-sm transition-all duration-200 active:scale-95 flex items-center justify-center cursor-pointer"
            >
              {phone}
            </a>

            <div className="flex items-center pl-1 sm:pl-2">
              <img
                src="/atol-logo.svg"
                alt="ATOL Protected"
                className="h-[36px] sm:h-[40px] w-auto object-contain"
              />
            </div>
          </div>
        )}

        {/* Dynamic Email and Address from API */}
        {(email || address) && (
          <div className="space-y-0.5 mb-6 text-[14px] sm:text-[15px] font-normal text-white/90">
            {email && (
              <p>
                <a
                  href={`mailto:${email}`}
                  className="hover:text-[#5CACC4] transition-colors"
                >
                  {email}
                </a>
              </p>
            )}
            {address && <p className="text-white/75">{address}</p>}
          </div>
        )}

        {/* Dynamic Social Media Icons from API (styled in rounded white cards) */}
        {footerData?.social_media_icons?.enable_social_media_icons === "1" &&
          typeof footerData.social_media_icons === "object" && (
            <div className="flex items-center justify-center gap-3 sm:gap-3.5 mb-3 flex-wrap">
              {Object.entries(footerData.social_media_icons)
                .filter(
                  ([key]) =>
                    key.startsWith("social_media_icons_") &&
                    !key.includes("input") &&
                    !key.includes("alt") &&
                    footerData.social_media_icons[key]
                )
                .map(([key, iconUrl], index) => {
                  const num = key.split("_").pop();
                  const inputKey = `social_media_icons_input_${num}`;
                  let platform = footerData.social_media_icons[inputKey] || "#";

                  if (
                    platform &&
                    !platform.startsWith("http") &&
                    !platform.startsWith("mailto:") &&
                    !platform.startsWith("tel:") &&
                    platform !== "#"
                  ) {
                    platform = `https://${platform.replace(/^\/+/, "")}`;
                  }

                  const hint = `${iconUrl || ""} ${platform || ""}`.toLowerCase();
                  const socialLabel = getSocialPlatformLabel(iconUrl, platform);

                  return (
                    <a
                      key={index}
                      href={platform}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Visit us on ${socialLabel}`}
                      className="w-[38px] h-[38px] sm:w-[42px] sm:h-[42px] bg-white rounded-[10px] flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all duration-200"
                    >
                      {hint.includes("facebook") ? (
                        <svg className="w-5 h-5 fill-[#1877F2]" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      ) : hint.includes("insta") ? (
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <radialGradient
                            id={`instaGrad-${index}`}
                            cx="20%"
                            cy="100%"
                            r="150%"
                          >
                            <stop offset="0%" stopColor="#fdf497" />
                            <stop offset="5%" stopColor="#fdf497" />
                            <stop offset="45%" stopColor="#fd5949" />
                            <stop offset="60%" stopColor="#d6249f" />
                            <stop offset="90%" stopColor="#285AEB" />
                          </radialGradient>
                          <path
                            fill={`url(#instaGrad-${index})`}
                            d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                          />
                        </svg>
                      ) : hint.includes("twitter") || hint.includes("x.com") ? (
                        <svg className="w-5 h-5 fill-[#1DA1F2]" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z" />
                        </svg>
                      ) : hint.includes("pinterest") ? (
                        <svg className="w-5 h-5 fill-[#BD081C]" viewBox="0 0 24 24">
                          <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.332 1.365-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                        </svg>
                      ) : hint.includes("whatsapp") ? (
                        <svg className="w-5 h-5 fill-[#25D366]" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                        </svg>
                      ) : (
                        <img
                          src={`${BASE_URL_IMG}/${iconUrl}`}
                          alt=""
                          className="w-5 h-5 object-contain"
                          aria-hidden
                        />
                      )}
                    </a>
                  );
                })}
            </div>
          )}

        {/* Dynamic Copyright from API */}
        {footerContents?.footer_copyright_content && (
          <p className="text-center text-[12px] sm:text-[13px] text-white/40 pt-4 mt-2">
            {decodeHtmlEntities(
              footerContents.footer_copyright_content.replace(
                "{YEAR}",
                new Date().getFullYear()
              )
            )}
          </p>
        )}
      </div>
    </footer>
  );
};

export default Footer;
