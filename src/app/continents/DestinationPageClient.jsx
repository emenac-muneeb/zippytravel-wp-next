"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import HeroSectionNew from '../../Components/HeroSectionNew';
import ContinentCountryCard from '../../Components/ContinentCountryCard';
import LoadingScreen from '../../Components/LoadingScreen';
import PopUp from '../../Components/PopUp';
import { endpoints } from '../../Helpers/endpoints';

const SkeletonCard = () => (
    <div className="w-full aspect-[1/1.05] sm:aspect-square min-h-[270px] max-w-[340px] bg-gray-200 rounded-[24px] sm:rounded-[28px] shadow-sm animate-pulse relative overflow-hidden p-4 sm:p-5 flex flex-col justify-end mx-auto">
        <div className="flex justify-between items-end w-full gap-2">
            <div className="flex flex-col gap-2 w-1/2">
                <div className="h-3.5 bg-gray-300 rounded w-2/3" />
                <div className="h-6 bg-gray-300 rounded w-4/5" />
            </div>
            <div className="flex flex-col items-end gap-2 w-1/3">
                <div className="h-6 bg-gray-300 rounded w-3/4" />
                <div className="h-6 bg-gray-300 rounded-[6px] w-16" />
            </div>
        </div>
    </div>
);

export default function DestinationPageClient({ initialData = {} }) {
    const { continents = [], pageData } = initialData;
    const [FlightLoading, setFlightLoading] = useState(false);
    const [popupMessage, setPopupMessage] = useState(null);

    // Select first continent immediately (no null gap on first paint)
    const [selectedContinent, setSelectedContinent] = useState(() => continents[0] || null);
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasFetched, setHasFetched] = useState(false);
    const [visibleCount, setVisibleCount] = useState(16);

    const widgetContent = pageData?.widgets_content || '';
    const headingMatch = widgetContent.match(/heading="([^"]+)"/);
    const subHeadingMatch = widgetContent.match(/sub_heading="([^"]+)"/);
    
    const widgetData = {
        heading: headingMatch ? headingMatch[1] : (pageData?.heading || 'All Destinations'),
        sub_heading: subHeadingMatch ? subHeadingMatch[1] : (pageData?.sub_heading || "Our customers can access our web site for a 'one-stop shop' including access to specially negotiated airfares, hotels, car rental and insurance."),
    };

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
        setVisibleCount(16);

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

    const loadMore = () => setVisibleCount((prev) => prev + 16);

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
            {popupMessage && (
                <PopUp title="Error" message={popupMessage} onClose={() => setPopupMessage(null)} />
            )}

            {FlightLoading ? (
                <LoadingScreen />
            ) : (
                <>
                    {/* Hero Section matching Home Page exactly */}
                    <HeroSectionNew
                        setFlightLoading={setFlightLoading}
                        setPopupMessage={setPopupMessage}
                        title={pageData?.title || "Destinations"}
                        subTitle="— Zippy Travel"
                        description={
                            pageData?.banner_description ||
                            pageData?.description ||
                            "Zippytravel.co.uk is an e-commerce UK based company offering online travel products and services."
                        }
                        bgImageOverride={pageData?.banner_img?.[0]?.url}
                    />

                    <div className="w-full pb-16 font-poppins">
                        {/* Section Header: All Destinations */}
                        {(widgetData?.heading || widgetData?.sub_heading) && (
                            <div className="text-center mt-12 sm:mt-16 mb-8 sm:mb-10 max-w-3xl mx-auto px-4">
                                {widgetData.heading && (
                                    <h2 className="font-poppins font-bold text-[32px] sm:text-[40px] md:text-[44px] text-[#1F0060] tracking-tight">
                                        {widgetData.heading}
                                    </h2>
                                )}
                                {widgetData.sub_heading && (
                                    <p className="mt-3 text-[#555555] text-[15px] sm:text-[16px] font-poppins leading-relaxed">
                                        {widgetData.sub_heading}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Continent selection tabs */}
                        {continents.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-[1236px] mx-auto mb-8 sm:mb-12 px-4 sm:px-6 xl:px-0">
                                {continents.map((continent) => {
                                    const isActive = selectedContinent?.id === continent.id;
                                    return (
                                        <button
                                            key={continent.id}
                                            type="button"
                                            onClick={() => handleSelectContinent(continent)}
                                            className={`h-[48px] px-4 rounded-[10px] font-poppins font-bold text-[15px] sm:text-[17px] transition-all duration-300 flex items-center justify-center text-center w-full select-none ${
                                                isActive
                                                    ? "bg-[#5CACC4] text-white shadow-md"
                                                    : "bg-[#1F0060] text-white hover:bg-[#2A0080] shadow-sm"
                                            }`}
                                        >
                                            {continent.title}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Countries list / Skeleton Loader */}
                        {showSkeleton ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 max-w-[1236px] mx-auto px-4 sm:px-6 xl:px-0 mt-6">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <SkeletonCard key={i} />
                                ))}
                            </div>
                        ) : showEmpty ? (
                            <div className="text-center py-16 text-gray-500 font-poppins text-lg">
                                No destinations available for this continent at the moment.
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 max-w-[1236px] mx-auto px-4 sm:px-6 xl:px-0 mt-6">
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
                                    <div className="flex justify-center mt-10 mb-10">
                                        <button
                                            type="button"
                                            onClick={loadMore}
                                            className="px-8 py-2.5 bg-[#1F0060] hover:bg-[#2A0080] text-white font-poppins font-bold text-[16px] sm:text-[18px] rounded-[14px] shadow-md hover:shadow-lg transition-all flex items-center justify-center select-none"
                                        >
                                            Show More
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </>
            )}
        </>
    );
}
