"use client";
import React, { useState } from 'react';
import CommonHeroSection from '../../Components/CommonHeroSection';
import BrandingSection from '../../Components/BrandingSection';
import ContinentCountryCard from '../../Components/ContinentCountryCard';
import useDestinationBreadcrumbs from '../../Hooks/useDestinationsBreadcrumbs';
import { BASE_URL_IMG } from "../../Helpers/imageurl";

export default function SpecificContinentClient({ initialData }) {
    const breadcrumbs = useDestinationBreadcrumbs();
    const [countries, setCountries] = useState(initialData?.data || []);
    const [visibleCount, setVisibleCount] = useState(100);

    const continentInfo = countries[0]?.continent || {};
    const bannerSection = continentInfo.description || '';

    const loadMore = () => setVisibleCount(prev => prev + 6);

    return (
        <div className="container">
            <div className='pt-[87px] sm:pt-[100px] pb-[24px] sm:pb-[32px]'>
                {breadcrumbs}

                <CommonHeroSection
                    banners={countries.flatMap(c => c.continent?.images || [])}
                    description={bannerSection}
                />

                <BrandingSection />

                <div className="my-8">
                    <h2 className="text-2xl sm:text-3xl font-semibold font-quicksand text-[#F1A868] mb-2">
                        {`${continentInfo?.page_title || 'Explore ' + continentInfo?.title}`}
                    </h2>

                    <p className="text-black text-sm sm:text-base font-quicksand max-w-2xl">
                        {`Travellers always seek comfort on their air journeys to destinations across ${continentInfo?.title}, and Emenac Travel ensures that comfort comes without straining their budget.`}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
                    {countries.slice(0, visibleCount).map((country, index) => (
                        <ContinentCountryCard
                            key={index}
                            id={country.id}
                            metaData={country}
                            continent={country.continent?.title}
                            slug={country.slug}
                            country={country.title}
                            price={parseFloat(country.fare?.price) || 0}
                            imageUrl={country.image_url}
                            imageAlt={country.image_alt}
                            browserTitle={country.browser_title}
                            description={country.short_description}
                            ContinentCountries={null}
                        />
                    ))}
                </div>

                {countries.length > visibleCount && (
                    <div className="flex justify-center mt-10">
                        <button
                            onClick={loadMore}
                            className="w-[140px] h-[44px] bg-[#1F0060] hover:bg-[#2c0087] text-white font-poppins font-bold text-[15px] rounded-[14px] shadow-sm transition-all duration-200 active:scale-95 flex items-center justify-center cursor-pointer"
                        >
                            Show More
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
