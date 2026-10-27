"use client";
import React from 'react';
import Link from 'next/link';
import { BASE_URL_IMG } from '../Helpers/imageurl';

export default function ContinentCountryCard({ 
    continent, 
    country, 
    price, 
    imageUrl, 
    description, 
    slug, 
    imageAlt, 
    browserTitle, 
    id, 
    ContinentCountries, 
    metaData,
    classLabel = "Business Class"
}) {
    const rawContinent = continent || metaData?.continent?.title || '';
    const continentSlug = rawContinent
        ? rawContinent.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '')
        : '';
    const href = continentSlug ? `/${continentSlug}/${slug}` : `/${slug}`;

    const resolvedImgSrc = React.useMemo(() => {
        const raw = imageUrl || metaData?.image_url || metaData?.banner_img?.[0]?.url;
        if (!raw) return '/Photo.png';
        if (raw.startsWith('http') || raw.startsWith('/')) return raw;
        const clean = raw.replace(/^\/?media\//, '');
        return `${BASE_URL_IMG}/media/${clean}`;
    }, [imageUrl, metaData]);

    const formattedPrice = React.useMemo(() => {
        const num = Number(price);
        if (!isNaN(num) && num > 0) return Math.round(num).toLocaleString();
        const metaNum = Number(metaData?.fare?.price);
        if (!isNaN(metaNum) && metaNum > 0) return Math.round(metaNum).toLocaleString();
        return '350';
    }, [price, metaData]);

    return (
        <div className="w-full aspect-[1/1.05] sm:aspect-square min-h-[270px] max-w-[340px] rounded-[24px] sm:rounded-[28px] overflow-hidden relative group cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.18)] transition-all duration-300 mx-auto">
            <Link href={href} className="block w-full h-full relative">
                {/* Background Image */}
                <img
                    src={resolvedImgSrc}
                    alt={imageAlt || country || "Country destination"}
                    title={browserTitle || country || ""}
                    onError={(e) => {
                        e.currentTarget.src = '/Photo.png';
                    }}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Dark gradient overlay for bottom text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 via-45% to-transparent pointer-events-none" />

                {/* Bottom Details Section */}
                <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 flex items-end justify-between z-10 gap-2">
                    {/* Left: "Flights to" + Country Name */}
                    <div className="flex flex-col text-left min-w-0 flex-1">
                        <span className="text-white/90 font-poppins text-[13px] sm:text-[14px] font-normal leading-tight">
                            Flights to
                        </span>
                        <h3 className="text-white font-poppins font-bold text-[18px] sm:text-[22px] leading-tight truncate mt-0.5 drop-shadow-sm">
                            {country}
                        </h3>
                    </div>

                    {/* Right: Price + "View All" pill */}
                    <div className="flex flex-col items-end shrink-0">
                        <span className="text-white font-poppins font-bold text-[18px] sm:text-[22px] leading-tight drop-shadow-sm">
                            £ {formattedPrice}
                        </span>
                        <span className="inline-flex items-center justify-center bg-[#1F0060] text-white text-[12px] font-medium px-3.5 py-1 rounded-[6px] mt-1 group-hover:bg-[#2A0080] transition-colors shadow-sm">
                            View All
                        </span>
                    </div>
                </div>
            </Link>
        </div>
    );
}
