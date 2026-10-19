"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BrandingSection from '../../Components/BrandingSection';
import ContinentCountryCard from '../../Components/ContinentCountryCard';
import useDestinationBreadcrumbs from '../../Hooks/useDestinationsBreadcrumbs';
import { endpoints } from '../../Helpers/endpoints';
import { BASE_URL_IMG } from '../../Helpers/imageurl';
import BannerInner from '../../Components/BannerInner';


const SkeletonCard = () => (
    <div className="w-full max-w-[312px] h-[290px] bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-gray-100/60 p-[10px] mx-auto mb-6 animate-pulse flex flex-col justify-between">
        <div className="w-full h-[203px] max-w-[292px] bg-gray-200 rounded-[16px] mx-auto shrink-0" />
        <div className="flex justify-between items-start mt-[15px] px-0 pb-1">
            <div className="flex flex-col gap-2 w-1/2 pl-[11px]">
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-6 bg-gray-200 rounded w-3/4" />
            </div>
            <div className="flex flex-col items-end gap-2 w-1/3 pr-[11px]">
                <div className="h-6 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
        </div>
    </div>
);

export default function DestinationPageClient({ initialData }) {
    const { continents = [], pageData } = initialData;
    const breadcrumbs = useDestinationBreadcrumbs();
    const [FlightLoading, setFlightLoading] = useState(false);
    const [popupMessage, setPopupMessage] = useState(null);

    // Select first continent immediately (no null gap on first paint)
    const [selectedContinent, setSelectedContinent] = useState(() => continents[0] || null);
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasFetched, setHasFetched] = useState(false);
    const [visibleCount, setVisibleCount] = useState(12);

    const widgetContent = pageData?.widgets_content || '';
    const headingMatch = widgetContent.match(/heading="([^"]+)"/);
    const subHeadingMatch = widgetContent.match(/sub_heading="([^"]+)"/);
    
    const widgetData = {
        heading: headingMatch ? headingMatch[1] : 'Top Destinations',
        sub_heading: subHeadingMatch ? subHeadingMatch[1] : 'Travellers always look for comfort on their air trips to the places they most long to Emenac Travel comforts over their budgets.',
    };

    const allBanners = continents.flatMap(continent => continent.banner_img || []);

    // Keep selection in sync if continents arrive/change
    useEffect(() => {
        if (continents.length === 0) {
            setSelectedContinent(null);
            setLoading(false);
            setHasFetched(true);
            setCountries([]);
            return;
        }
        if (!selectedContinent || !continents.some((c) => c.id === selectedContinent.id)) {
            setSelectedContinent(continents[0]);
        }
    }, [continents, selectedContinent]);

    // Fetch countries when selected continent changes
    useEffect(() => {
        if (!selectedContinent?.slug) return;

        let cancelled = false;
        setLoading(true);
        setHasFetched(false);
        setCountries([]);
        setVisibleCount(12);

        axios
            .get(endpoints.ContinentCountriesBySlug(selectedContinent.slug))
            .then((response) => {
                if (cancelled) return;
                if (response.data.status === 1) {
                    setCountries(response.data.result.data || []);
                } else {
                    setCountries([]);
                }
            })
            .catch((err) => {
                if (cancelled) return;
                console.error('Error fetching countries:', err);
                setCountries([]);
            })
            .finally(() => {
                if (cancelled) return;
                setLoading(false);
                setHasFetched(true);
            });

        return () => {
            cancelled = true;
        };
    }, [selectedContinent?.id, selectedContinent?.slug]);

    const loadMore = () => setVisibleCount(prev => prev + 12);

    const showSkeleton = loading || !hasFetched;
    const showEmpty = hasFetched && !loading && countries.length === 0;

    const handleSelectContinent = (continent) => {
        if (selectedContinent?.id === continent.id) return;
        setSelectedContinent(continent);
        setLoading(true);
        setHasFetched(false);
        setCountries([]);
    };

    return (
        <>
            <BannerInner
                setFlightLoading={setFlightLoading}
                setPopupMessage={setPopupMessage}
                initialBanners={[]}
                bgImageOverride={pageData?.banner_img?.[0]?.url}
                showClassSelector={false}
            />

            <div className="w-full mx-auto py-2">
                <div className='container'>
                    {/* {breadcrumbs} */}

               

                {(widgetData?.heading || widgetData.sub_heading) && (
                    <div className="my-8">
                        {widgetData.heading && (
                                <div className="heading_section pb-00">
                                    <h1 className="font-bold text-[42px] text-black">
                                        {widgetData.heading}
                                    </h1>
                                </div>
                        )}
                        {widgetData.sub_heading && (
                                <p className="text-gray-700 text-sm sm:text-base max-w-2xl font-quicksand">
                                {widgetData.sub_heading}
                            </p>
                        )}
                    </div>
                )}

                    {/* Continent selection tabs */}
                    {continents.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
                            {continents.map((continent) => {
                                const isActive = selectedContinent?.id === continent.id;
                                return (
                                    <button
                                        key={continent.id}
                                        type="button"
                                        onClick={() => handleSelectContinent(continent)}
                                        className={`px-2 py-2.5 rounded-10 font-quicksand font-bold transition-all duration-300 text-center w-full ${isActive
                                            ? "bg-tertiary text-white shadow-[-11px_-2px_41px_10px_#EEDFD1]"
                                            : "bg-[#FDF3E7] text-[#A57233] hover:bg-[#FAF2EA] shadow-md"
                                            }`}
                                    >
                                        {continent.title}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Countries list / Skeleton Loader — never show empty message while API is in flight */}
                    {showSkeleton ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center mt-6">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <SkeletonCard key={i} />
                            ))}
                        </div>
                    ) : showEmpty ? (
                        <div className="text-center py-12 text-gray-500 font-quicksand">
                            No destinations available for this continent at the moment.
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center mt-6">
                                {countries.slice(0, visibleCount).map((country, index) => {
                                    const continentName = selectedContinent?.title || "";
                                    return (
                                        <ContinentCountryCard
                                            key={country.id || country.slug || index}
                                            id={country.id}
                                            metaData={country}
                                            continent={continentName}
                                            slug={country.slug}
                                            country={country.title}
                                            price={parseFloat(country.fare?.price) || 0}
                                            imageUrl={country.image_url}
                                            imageAlt={country.image_alt}
                                            browserTitle={country.browser_title}
                                            description={country.short_description}
                                            ContinentCountries={null}
                                        />
                                    );
                                })}
                            </div>
                            {countries.length > visibleCount && (
                                <div className="flex justify-center mt-6 mb-12">
                                    <button
                                        type="button"
                                        onClick={loadMore}
                                        className="flex items-center justify-center gap-2 w-[fit-content]
                                        px-4 py-2.5 rounded-10 font-quicksand font-bold transition-all duration-300 text-center bg-tertiary text-white shadow-[-11px_-2px_41px_10px_#EEDFD1]"
                                    >
                                        Load More
                                        <svg
                                            className="w-3.5 h-3.5 text-white group-hover:translate-x-1.5 transition-transform duration-300"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            strokeWidth="3"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </>
                    )}
            </div>
        </div>
        </>
    );
}
