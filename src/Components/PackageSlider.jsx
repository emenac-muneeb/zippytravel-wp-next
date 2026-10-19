import React, { useState } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { BASE_URL_IMG } from '../Helpers/imageurl';
import { holidayPackagePath, stripHtmlExt } from '../Helpers/holidayUrls';
import { PackageCardSkeleton } from './PackageCard';
import Link from 'next/link';

function PackageCard({ pkg, Packageslug, image, countrySlug: countrySlugProp }) {
    const totalStars = 5;

    // Extract only the filename part (strip leading directory path)
    const rawSlug = Packageslug || pkg.package_slug || '';
    const packageSlug = stripHtmlExt(rawSlug.split('/').pop());

    // City slug: prefer injected _citySlug, then fall back to package fields
    const rawCitySlug = pkg._citySlug || pkg.holiday_city_slug || pkg.city_slug || '';
    const citySlug = stripHtmlExt(rawCitySlug.split('/').pop());

    // Country slug: prefer injected _countrySlug, then prop, then package fields
    const rawCountrySlug = pkg._countrySlug || countrySlugProp || pkg.holiday_country_slug || pkg.country_slug || '';
    const countrySlug = stripHtmlExt(rawCountrySlug.split('/').pop());

    const cardHref = (countrySlug && citySlug)
        ? holidayPackagePath(countrySlug, citySlug, packageSlug)
        : `/holiday/${packageSlug}`;

    return (
        <div className="px-2 h-full">
            <Link
                href={cardHref}
                className="rounded-xl cursor-pointer overflow-hidden flex flex-col h-full min-h-[400px] max-h-[420px] shadow-[0_1px_6px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow duration-300 bg-white"
            >
                <img
                    src={image}
                    alt={pkg?.package_image_alt}
                    className="w-full h-44 object-cover"
                />

                <div className='px-3 pt-4 flex flex-col flex-grow'>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center font-bold gap-[4px]">
                            <p className='text-[16px] text-[#A57233] leading-none font-gloock'>
                                0{pkg.package_star}-Star
                            </p>
                            {[...Array(totalStars)].map((_, i) =>
                                i < pkg.package_star ? (
                                    <FaStar key={i} className="text-yellow-400 text-[14px]" />
                                ) : (
                                    <FaRegStar key={i} className="text-gray-300 text-[14px]" />
                                )
                            )}
                        </div>
                        <p className="text-[#A57233] text-[16px] font-bold font-gloock">
                            {pkg.package_night} Nights
                        </p>
                    </div>

                    <div className="flex flex-col justify-between mt-2 mb-3 flex-grow">
                        <p className="text-[16px] font-quicksand">
                            {pkg?.title}
                        </p>

                        <div className="flex justify-between items-end mt-3">
                            {/* span used here to avoid nested <a> inside the outer Link */}
                            <span className="text-[16px] text-[#F1A868] underline font-bold">
                                View All Fares ↗
                            </span>
                            <p className="text-[#F1A868] text-[20px] font-bold">£{pkg.package_price}</p>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}

export default function PackageSlider({ data = [], countrySlug, loading = false }) {
    const [currentSlide, setCurrentSlide] = useState(0);

    if (loading) {
        return (
            <div className="w-full mb-16">
                <div className="mb-6">
                    <h2 className="text-2xl font-quicksand text-secondary">Top Packages</h2>
                    <p className="text-sm text-gray-600 mt-1 max-w-xl">
                        Explore handpicked travel packages with unbeatable prices and exclusive deals.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <PackageCardSkeleton key={`slider-skeleton-${i}`} />
                    ))}
                </div>
            </div>
        );
    }

    const settings = {
        dots: false,
        arrows: false,
        infinite: true,
        autoplay: true,
        vertical: false,
        autoplaySpeed: 3000,
        slidesToShow: 4,
        slidesToScroll: 1,
        speed: 800,
        afterChange: (i) => setCurrentSlide(i % data.length),
        responsive: [
            { breakpoint: 1280, settings: { slidesToShow: 3 } },
            { breakpoint: 1024, settings: { slidesToShow: 2 } },
            { breakpoint: 768, settings: { slidesToShow: 2 } },
            { breakpoint: 480, settings: { slidesToShow: 1 } },
        ],
    };

    return (
        <div className="w-full mb-16">
            <div className="mb-6">
                <h2 className="text-2xl font-quicksand text-secondary">Top Packages</h2>
                <p className="text-sm text-gray-600 mt-1 max-w-xl">
                    Explore handpicked travel packages with unbeatable prices and exclusive deals.
                </p>
            </div>

            {data.length > 1 ? (
                <Slider {...settings}>
                    {data.map((pkg, idx) => (
                        <PackageCard
                            key={pkg.id || idx}
                            pkg={pkg}
                            image={`${BASE_URL_IMG}/media/${pkg.package_image_url}`}
                            Packageslug={pkg.package_slug}
                            countrySlug={countrySlug}
                        />
                    ))}
                </Slider>
            ) : (
                <div className="flex justify-center">
                    {data.map((pkg, idx) => (
                        <div key={pkg.id || idx} className="w-[300px]">
                            <PackageCard
                                pkg={pkg}
                                image={`${BASE_URL_IMG}/media/${pkg.package_image_url}`}
                                Packageslug={pkg.package_slug}
                                countrySlug={countrySlug}
                            />
                        </div>
                    ))}
                </div>
            )}

            {data.length > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                    {[...Array(Math.min(5, data.length))].map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 rounded-full transition-all duration-300 ${currentSlide === i
                                ? 'w-16 bg-[#A57233]'
                                : 'w-8 bg-[#A57233]'
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
