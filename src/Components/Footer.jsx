"use client";
import React, { useState, useEffect } from 'react';
import { endpoints } from '../Helpers/endpoints';
import api from '../Helpers/apiHelper';
import { BASE_URL_IMG } from "../Helpers/imageurl";
import { usePathname, useRouter } from "next/navigation";
import Link from 'next/link';
import Script from 'next/script';
import { useGeneralSettings } from '../Context/GeneralSettingsContext';

function decodeHtmlEntities(text) {
    if (!text || typeof text !== 'string') return '';
    return text
        .replace(/\u00A0/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
        .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(Number(num)))
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
}

const Footer = () => {
    const router = useRouter();
    const { footerSetting, frontIcons: contextFrontIcons } = useGeneralSettings();
    const [footerData, setFooterData] = useState(() => footerSetting ?? {});
    const [frontIcons, setFrontIcons] = useState(() => contextFrontIcons ?? []);
    const [destination, setDestination] = useState([]);

    const pathname = usePathname();

    useEffect(() => {
        if (footerSetting) {
            setFooterData(footerSetting);
        }
        if (contextFrontIcons?.length) {
            setFrontIcons(contextFrontIcons);
        }
    }, [footerSetting, contextFrontIcons]);

    useEffect(() => {
        if (footerSetting?.logo || footerSetting?.contents) return;

        const fetchSettings = async () => {
            try {
                const res = await api.get(endpoints.generalSettings);
                if (res.data.status === 1) {
                    const result = res.data.result;
                    setFooterData(result.footer_setting ?? {});
                    setFrontIcons(result.front_icons || []);
                }
            } catch (error) {
                console.error("Failed to fetch general settings:", error);
            }
        };
        fetchSettings();
    }, [footerSetting]);

    useEffect(() => {
        const fetchContinents = async () => {
            try {
                const res = await api.get(endpoints.getContinents);
                if (res.data.status === 1) {
                    const fetchedData = res.data.result.data.map((item) => ({
                        id: item.id,
                        title: item.title,
                        slug: item.slug,
                    }));
                    setDestination(fetchedData);
                }
            } catch (error) {
                console.error("Failed to fetch continents:", error);
            }
        };
        fetchContinents();
    }, []);

    const handleClick = (id, slug) => {
        // setSelectedId(id);
        router.push(`/${slug}`);
    };

    const handlePackageClick = (id, slug) => {
        setSelectedPackId(id);
        router.push(`/${slug}`);
    };

    const extractLinksFromHTML = (htmlString) => {
        if (!htmlString) return [];

        // Parse each <a> tag separately so we never match href inside data-cke-saved-href
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
                        (labelMatch?.[1] || '').replace(/<[^>]*>/g, '').trim()
                    ),
                });
            }

            tagMatch = anchorTagRegex.exec(htmlString);
        }

        return links;
    };

    const getFrontIcon = (fileName) => {
        return (frontIcons || []).find((iconUrl) => iconUrl.includes(fileName));
    };

    const footerContents = footerData?.contents || {};
    const topCountryLinks = extractLinksFromHTML(footerContents.top_footer_list_1_content);
    const topCityLinks = extractLinksFromHTML(footerContents.top_footer_list_2_content);
    const topAirLines = extractLinksFromHTML(footerContents.top_footer_list_3_content);

    const getSocialPlatformLabel = (iconUrl, platformUrl) => {
        const hint = `${iconUrl || ""} ${platformUrl || ""}`.toLowerCase();
        if (hint.includes("facebook")) return "Facebook";
        if (hint.includes("instagram")) return "Instagram";
        if (hint.includes("twitter") || hint.includes("x.com")) return "X (Twitter)";
        if (hint.includes("linkedin")) return "LinkedIn";
        if (hint.includes("youtube")) return "YouTube";
        if (hint.includes("tiktok")) return "TikTok";
        if (hint.includes("pinterest")) return "Pinterest";
        const file = String(iconUrl || "").split("/").pop()?.replace(/\.\w+$/, "") || "";
        if (file) return file.replace(/[-_]/g, " ");
        return "Social media";
    };


    return (
        <footer className="font-quicksand text-sm">
            {/* ── Top Links Section (white) ── */}
            {!["/umrah-packages.html"].some(path => pathname.endsWith(path)) &&
                !pathname.includes("umrah") &&
                (
                    <div className="bg-white py-10 sm:py-[50px]">
                        <div className='container'>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-10">

                                {/* Destinations */}
                                <div>
                                    <span className="text-[#A57233] text-[20px] font-semibold mb-5 block">{footerContents.top_footer_list_1_heading || "Special Offers"}</span>
                                    <ul className="space-y-[2px]">
                                        {topCountryLinks.map((link) => (
                                            <li key={link.href}>
                                                <a
                                                    href={link.href}
                                                    className="cursor-pointer text-[18px] text-[#707070] hover:text-[#707070] hover:underline underline-offset-4"
                                                >
                                                    {link.label}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Top Countries */}
                                <div>
                                <span className="text-[#A57233] text-[20px] font-semibold mb-5 block">{footerContents.top_footer_list_2_heading || "Top Cities"}</span>
                                    <ul className="space-y-[2px]">
                                        {topCityLinks.map((link) => (
                                            <li key={link.href}>
                                                <a
                                                    href={link.href}
                                                    className="cursor-pointer text-[18px] text-[#707070] hover:text-[#707070] hover:underline underline-offset-4"
                                                >
                                                    {link.label}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Top Cities */}
                                <div className="hidden sm:block">
                                    <span className="text-[#A57233] text-[20px] font-semibold mb-5 block">{footerContents.top_footer_list_3_heading || "Top Airlines"}</span>
                                    <ul className="space-y-[2px]">
                                        {topAirLines.map((link) => (
                                            <li key={link.href}>
                                                <a
                                                    href={link.href}
                                                    className="cursor-pointer text-[18px] text-[#707070] hover:text-[#707070] hover:underline underline-offset-4"
                                                >
                                                    {link.label}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                            </div>
                        </div>
                    </div>
                )
            }

            {/* ── Bottom Section (cream) ── */}
            <div className="bg-[#FFF9F3] md:pt-[65px] pt-[30px] pb-[46px]">
                <div className="container">

                    {/* Row 1: Logo + Social | Main Menu | Useful Links | Office Address */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.4fr] gap-x-8 gap-y-10">

                        {/* Logo & Social */}
                        <div className="flex flex-col items-start gap-[36px]">
                            <a href="/" aria-label="Emenac Travel home">
                                {footerData?.logo && (
                                    <img
                                        src={`${BASE_URL_IMG}${footerData.logo}`}
                                        alt="Emenac Travel"
                                        className="max-w-[220px] h-auto"
                                        aria-hidden
                                    />
                                )}
                            </a>

                            {footerData?.social_media_icons?.enable_social_media_icons === "1" &&
                                typeof footerData.social_media_icons === "object" && (
                                <div className="flex items-center gap-[40px] flex-wrap">
                                    {Object.entries(footerData.social_media_icons)
                                        .filter(
                                            ([key]) =>
                                                key.startsWith("social_media_icons_") &&
                                                !key.includes("input") &&
                                                footerData.social_media_icons[key]
                                        )
                                        .map(([key, iconUrl], index) => {
                                            const inputKey = `social_media_icons_input_${key.split("_").pop()}`;
                                            let platform = footerData.social_media_icons[inputKey] || "#";

                                            // ✅ Ensure external links are absolute
                                            if (
                                                platform &&
                                                !platform.startsWith("http") &&
                                                !platform.startsWith("mailto:") &&
                                                !platform.startsWith("tel:")
                                            ) {
                                                platform = `https://${platform.replace(/^\/+/, "")}`;
                                            }

                                            const socialLabel = getSocialPlatformLabel(iconUrl, platform);

                                            return (
                                                <a
                                                    key={index}
                                                    href={platform}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    aria-label={`Visit us on ${socialLabel}`}
                                                    className="hover:opacity-80 transition-opacity"
                                                >
                                                    <img
                                                        src={`${BASE_URL_IMG}/${iconUrl}`}
                                                        alt=""
                                                        className="h-10 w-10"
                                                        aria-hidden
                                                    />
                                                </a>
                                            );
                                        })}
                                </div>
                            )}

                            {/* <a
                                href="https://www.dmca.com/Protection/Status.aspx?ID=3d8e8532-bb1c-4b76-b59f-b8fab6f914a8"
                                title="DMCA.com Protection Status"
                                className="dmca-badge block leading-none dmcaBadgeHelper"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <img
                                    src="https://images.dmca.com/Badges/dmca_protected_sml_120n.png?ID=3d8e8532-bb1c-4b76-b59f-b8fab6f914a8"
                                    alt=""
                                    width={121}
                                    height={24}
                                    className="block h-auto w-[121px] max-w-full"
                                    aria-hidden
                                />
                            </a>
                            <Script
                                src="https://images.dmca.com/Badges/DMCABadgeHelper.min.js"
                                strategy="lazyOnload"
                            /> */}
                        </div>

                        {/* Main Menu */}
                        <div className="text-left">
                            <p className="text-[#A57233] text-[20px] font-bold mb-2">Main Menu</p>
                            <span className="hidden sm:block w-[38px] h-[2px] bg-[#A57233] mb-4"></span>
                            <ul className="space-y-[12px]">
                                {extractLinksFromHTML(footerData?.contents?.link_1_content).map((link, index) => (
                                    <li key={index}>
                                        <a
                                            href={link.href}
                                            className="text-[18px] text-[#707070] hover:text-[#A57233] transition-colors"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Useful Links */}
                        <div className="text-left">
                            <p className="text-[#A57233] text-[20px] font-bold mb-2">Useful Links</p>
                            <span className="hidden sm:block w-[38px] h-[2px] bg-[#A57233] mb-4"></span>
                            <ul className="space-y-[12px]">
                                {extractLinksFromHTML(footerData?.contents?.link_2_content).map((link, index) => (
                                    <li key={index}>
                                        <a
                                            href={link.href}
                                            className="text-[18px] text-[#707070] hover:text-[#A57233] transition-colors"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Office Address */}
                        <div className="text-left">
                            <p className="text-[#A57233] text-[20px] font-bold mb-2">Office Address</p>
                            <span className="hidden sm:block w-[38px] h-[2px] bg-[#A57233] mb-4"></span>
                            <p className="text-[16px] text-[#707070] leading-[1.7] max-w-[260px] mx-0">
                                {footerData?.contents?.footer_address}
                            </p>
                        </div>
                    </div>

                    {/* Row 2: Need Help + Phone + Email + Payment Icons */}
                    <div className="sm:mt-[50px] mt-[30px] flex flex-wrap items-center justify-start lg:justify-between gap-x-10 gap-y-8">
                        <span className="text-[#A57233] text-[26px] font-bold m-0 leading-none w-full lg:w-fit block">
                            Need Help?
                        </span>

                        {/* Phone */}
                        <div className="flex flex-col items-start gap-1.5">
                            <span className="inline-block bg-[#A57233] text-white text-[16px] font-bold px-3 py-[3px] rounded-[5px] leading-tight">
                                Call Us On
                            </span>
                            <a
                                href={`tel:${footerData?.contents?.footer_phone}`}
                                className="text-[22px] text-[#707070] no-underline hover:text-[#A57233] transition-colors"
                            >
                                {footerData?.contents?.footer_phone}
                            </a>
                        </div>

                        {/* Email */}
                        <div className="flex flex-col items-start gap-1.5">
                            <span className="inline-block bg-[#A57233] text-white text-[16px] font-bold px-3 py-[3px] rounded-[5px] leading-tight">
                                Send Email Us
                            </span>
                            <a
                                href={`mailto:${footerData?.contents?.footer_email}`}
                                className="text-[22px] text-[#707070] no-underline hover:text-[#A57233] transition-colors"
                            >
                                {footerData?.contents?.footer_email}
                            </a>
                        </div>

                        {/* Payment / Certificate Icons */}
                        {footerData?.contents?.footer_certificate_icon === "1" &&
                            footerData?.contents &&
                            typeof footerData.contents === "object" && (
                            <div className="flex items-center gap-[30px] flex-wrap justify-start lg:justify-center w-full lg:w-fit">
                                {Object.entries(footerData.contents)
                                    .filter(([key]) => key.startsWith("footer_business_icon_") && !key.includes("_input"))
                                    .map(([iconKey, iconPath], index) => {
                                        const iconNum = iconKey.match(/\d+/)?.[0];
                                        const inputKey = `footer_business_icon_${iconNum}_input`;
                                        const link = footerData.contents[inputKey] || "#";

                                        // Extract SVG filename without extension
                                        const filename = iconPath.split("/").pop()?.split(".")[0] || `icon-${iconNum}`;

                                        return (
                                            <img
                                                key={index}
                                                src={`${BASE_URL_IMG}/${iconPath}`}
                                                alt={`${filename}`}
                                                className="h-7 max-w-[85px] sm:max-w-full"
                                            />
                                        );
                                    })}
                            </div>
                        )}
                    </div>

                    {/* Copyright */}
                    <p className="text-center mt-10 text-[18px] text-[#D9B595]">
                        {decodeHtmlEntities(
                            footerData?.contents?.footer_copyright_content?.replace('{YEAR}', new Date().getFullYear()) || ''
                        )}
                    </p>
                </div>
            </div>

            {/* {isHomePage && <JsonLdScripts />} */}
        </footer>
    );
};

export default Footer;
