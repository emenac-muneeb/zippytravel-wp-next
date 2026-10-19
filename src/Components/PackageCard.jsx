"use client";
import React from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { useRouter, useParams } from 'next/navigation';
import { BASE_URL_IMG } from '../Helpers/imageurl';
import { holidayPackagePath, stripHtmlExt } from '../Helpers/holidayUrls';
import Link from 'next/link';

export default function PackageCard({
    id,
    Packageslug,
    alt,
    image,
    stars = 2,
    nights,
    price,
    title,
    HolidayCities,
    countrySlug: countrySlugProp,
    citySlug: citySlugProp,
}) {
    const totalStars = 5;
    const params = useParams();
    const countrySlug = countrySlugProp || params.countrySlug;
    const citySlug = citySlugProp || params.citySlug;


    return (
        <Link href={holidayPackagePath(countrySlug, citySlug, Packageslug)}

            className="bg-white cursor-pointer rounded-lg overflow-hidden shadow-sm w-full max-w-[270px]">
            <img
                src={`${BASE_URL_IMG}/media/${image}`}
                alt={alt}
                width={270}
                height={160}
                className="w-full h-[160px] object-cover rounded-t-lg"
            />
            {/* <img src={`/media/HolidayCityImages/687f923689f61_1753190966.png`} alt={alt} className="w-full h-[160px] object-cover rounded-t-lg" /> */}

            <div className="px-2 py-3">
                <div className="flex flex-row justify-between text-xs text-black mb-1">
                    <div className="flex items-center gap-[3px]">
                        <span className=" font-quicksand text-[13px] text-secondary mr-1">{stars}.0</span>
                        {[...Array(totalStars)].map((_, i) =>
                            i < stars ? (
                                <FaStar key={i} className="text-yellow-400 text-[12px]" />
                            ) : (
                                <FaRegStar key={i} className="text-gray-300 text-[12px]" />
                            )
                        )}

                    </div>
                    <span className='text-secondary font-quicksand text-[13px]'>{nights}</span>
                </div>

                <p className="text-[11px] text-black mt-1 mb-2 leading-snug line-clamp-1">
                    {title}
                </p>

                <div className="flex justify-between items-center text-[13px]">
                    <Link href={holidayPackagePath(countrySlug, citySlug, Packageslug)} className="text-sm text-red-600 font-medium hover:underline flex items-center gap-1">
                        Package Details
                        <img src={`${BASE_URL_IMG}/assets/svgs/Arrow1.svg`} alt="arrow" className="w-[8px]" />
                    </Link>
                    <div>
                        <span className="text-red-600 text-xs mr-[2px]">Fr</span>
                        <span className="text-red-600 font-bold text-base">{price}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export function PackageCardSkeleton() {
    return (
        <div className="bg-white rounded-lg overflow-hidden shadow-sm w-full max-w-[270px] animate-pulse">
            <div className="w-full h-[160px] bg-gray-200 rounded-t-lg"></div>
            <div className="px-2 py-3 space-y-3">
                <div className="flex flex-row justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="flex justify-between items-center mt-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-5 bg-gray-200 rounded w-16"></div>
                </div>
            </div>
        </div>
    );
}

