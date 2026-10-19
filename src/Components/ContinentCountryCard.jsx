"use client";
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
    const router = useRouter();

    const continentSlug = continent.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '');

    return (
        <div className="w-full max-w-[312px] h-[290px] cursor-pointer bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100/60 p-[10px] mx-auto mb-6 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between">
            <Link href={`/${continentSlug}/${slug}`} className="block h-full flex flex-col justify-between">
                {/* Image Container with Badge */}
                <div className="relative w-full h-[203px] max-w-[292px] rounded-[16px] overflow-hidden bg-gray-50 mx-auto shrink-0">
                    <img
                        src={`${BASE_URL_IMG}/media/${imageUrl}`}
                        alt={imageAlt || country}
                        title={browserTitle || country}
                        width={292}
                        height={203}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                </div>

                {/* Badge on left side of the card, partially over the image */}
                {/* <div className="absolute top-[33px] left-0 z-10 w-[105px] h-[23px] bg-[#F1A868] rounded-r-[6px] flex items-center justify-center text-white text-[12px] font-bold shadow-sm tracking-wide">
                    {classLabel}
                </div> */}

                {/* Bottom Details Section */}
                <div className="flex justify-between items-start mt-[15px] px-0 pb-1 flex-1">
                    {/* Left details: 11px inset */}
                    <div className="flex flex-col text-left pl-[11px] min-w-0 flex-1 mr-2">
                        <span className="text-[#878787] text-[12px] font-normal uppercase leading-tight truncate">
                            Starting Fares
                        </span>
                        <h3 className="text-[#A57233] text-[24px] font-bold leading-tight truncate mt-0.5">
                            {country}
                        </h3>
                    </div>

                    {/* Right details: 11px inset for price, 20px inset for button */}
                    <div className="flex flex-col items-end shrink-0 pr-[11px]">
                        <div className="flex items-baseline leading-none">
                            <span className="text-[#343434] text-[22px] font-bold leading-none">
                                £{price ? Math.round(price).toLocaleString() : 'N/A'}
                            </span>
                            <span className="text-[14px] text-[#878787] font-normal ml-1 leading-none">
                                pp
                            </span>
                        </div>
                        
                        <div className="w-[81px] h-[19px] flex items-center justify-end gap-1.5 mt-1.5">
                            <span className="text-[#878787] text-[12px] font-normal group-hover:text-[#A57233] transition-colors whitespace-nowrap">
                                View Fares
                            </span>
                            <img src="/arrowdateright.png" alt="arrow" className="w-[12px] h-[8px] object-contain" />
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}
