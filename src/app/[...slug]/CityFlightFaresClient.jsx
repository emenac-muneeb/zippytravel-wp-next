"use client";
import React, { useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import HeroSectionNew from '../../Components/HeroSectionNew';
import FlightCard from '../../Components/FlightCard';
import LoadingScreen from '../../Components/LoadingScreen';
import PopUp from '../../Components/PopUp';
import useDestinationBreadcrumbs from '../../Hooks/useDestinationsBreadcrumbs';
import ScrollDetail from '../../Components/ScrollDetail';
import ScrollDetailRight from '../../Components/ScrollDetailRight';
import FaqSection from '../../Components/FaqSection';
import { endpoints } from '../../Helpers/endpoints';

export default function CityFlightFaresClient({ initialData, params }) {
    useDestinationBreadcrumbs();
    const [cityData] = useState(initialData);

    // Initial fares extraction
    const initialFaresList = useMemo(() => {
        if (!initialData?.fares) return [];
        return Array.isArray(initialData.fares) ? initialData.fares : (initialData.fares.data || []);
    }, [initialData]);

    const initialLastPage = useMemo(() => {
        if (initialData?.fares && !Array.isArray(initialData.fares)) {
            return initialData.fares.last_page || 1;
        }
        return 1;
    }, [initialData]);

    // Active fares & pagination state
    const [faresList, setFaresList] = useState(initialFaresList);
    const [currentPage, setCurrentPage] = useState(initialData?.fares?.current_page || 1);
    const [lastPage, setLastPage] = useState(initialLastPage);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [FlightLoading, setFlightLoading] = useState(false);
    const [popupMessage, setPopupMessage] = useState(null);

    // Fetch next page without any filters
    const fetchFares = useCallback(async (pageToFetch = 1, isAppend = false) => {
        try {
            if (isAppend) {
                setLoadingMore(true);
            } else {
                setIsLoading(true);
            }

            const citySlug = cityData?.slug || (params?.slug ? params.slug[params.slug.length - 1] : '');

            const paramsObj = {
                slug: citySlug,
                page: pageToFetch,
                per_page: 12,
                class: 1, // Economy / Premium class
            };

            const res = await axios.get(endpoints.cityFares, { params: paramsObj });
            if (res.data?.status === 1 && res.data?.result?.fares) {
                const faresPayload = res.data.result.fares;
                const newFaresData = Array.isArray(faresPayload) ? faresPayload : (faresPayload.data || []);
                const fetchedLastPage = faresPayload.last_page || 1;

                setLastPage(fetchedLastPage);
                setCurrentPage(pageToFetch);

                if (isAppend) {
                    setFaresList(prev => [...prev, ...newFaresData]);
                } else {
                    setFaresList(newFaresData);
                }
            } else if (!isAppend) {
                setFaresList([]);
                setLastPage(1);
                setCurrentPage(1);
            }
        } catch (err) {
            console.error("Error fetching city fares:", err);
            if (!isAppend) {
                setFaresList([]);
            }
        } finally {
            setIsLoading(false);
            setLoadingMore(false);
        }
    }, [cityData, params]);

    const handleLoadMore = () => {
        if (currentPage < lastPage && !loadingMore) {
            fetchFares(currentPage + 1, true);
        }
    };

    const cityName = cityData?.title || 'City';
    const heroTitle = `Flights to ${cityName}`;

    return (
        <>
            {popupMessage && (
                <PopUp title="Error" message={popupMessage} onClose={() => setPopupMessage(null)} />
            )}

            {FlightLoading ? (
                <LoadingScreen />
            ) : (
                <>
                    {/* Hero Section matching Home Page */}
                    <HeroSectionNew
                        setFlightLoading={setFlightLoading}
                        setPopupMessage={setPopupMessage}
                        title={heroTitle}
                        subTitle="— Zippy Travel"
                        description={
                            cityData?.banner_section_content ||
                            cityData?.banner_description ||
                            cityData?.description ||
                            "Zippytravel.co.uk is an e-commerce UK based company offering online travel products and services."
                        }
                        bgImageOverride={cityData?.banner_img?.[0]?.url || cityData?.image_url}
                    />

                    <div className="w-full font-poppins pb-16">
                        {/* Section Header */}
                        <div className="text-center mt-12 sm:mt-16 mb-8 sm:mb-10 max-w-3xl mx-auto px-4">
                            <h2 className="font-poppins font-bold text-[30px] sm:text-[38px] md:text-[42px] text-[#1F0060] tracking-tight">
                                {cityData?.page_title || `Cheapest ${cityName} Flight Fares`}
                            </h2>
                            <p className="mt-3 text-[#555555] text-[15px] sm:text-[16px] font-poppins leading-relaxed">
                                Our customers can access our web site for a 'one-stop shop' including access to specially negotiated airfares, hotels, car rental and insurance.
                            </p>
                        </div>

                        {/* Fares List: 2 fares in a row (two by two) */}
                        <div className="max-w-[1236px] mx-auto px-4 sm:px-6 xl:px-0">
                            {isLoading ? (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 w-full">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="h-[140px] bg-gray-100 rounded-[20px] animate-pulse" />
                                    ))}
                                </div>
                            ) : faresList.length > 0 ? (
                                <FlightCard fares={faresList} cols={2} />
                            ) : (
                                <p className="text-center text-gray-500 py-12 text-base">
                                    No fares available for {cityName} at the moment.
                                </p>
                            )}

                            {/* Show More Button matching reference image */}
                            {currentPage < lastPage && (
                                <div className="flex justify-center mt-10 mb-8">
                                    <button
                                        type="button"
                                        onClick={handleLoadMore}
                                        disabled={loadingMore}
                                        className="px-8 py-2.5 bg-[#1F0060] hover:bg-[#2A0080] text-white font-poppins font-bold text-[16px] sm:text-[18px] rounded-[14px] shadow-md hover:shadow-lg transition-all flex items-center justify-center select-none disabled:opacity-50"
                                    >
                                        {loadingMore ? "Loading..." : "Show More"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Preserved Scroll & FAQ sections */}
                    {(cityData?.parsedScrollContent?.hasContent ||
                        (!cityData?.parsedScrollContent && cityData?.description?.trim())) && (
                        <div className="w-full font-quicksand sm:pb-[55px] pb-[30px] relative after:content-[''] after:absolute after:bottom-0 
              after:right-0 after:w-[calc(75%-0px)] after:h-[70%] after:bg-[#FFFAF5] after:rounded-tl-[40px] after:z-[-1]">
                            <ScrollDetail
                                description={cityData?.description}
                                parsedContent={cityData?.parsedScrollContent}
                            />
                        </div>
                    )}
                    {(cityData?.parsedScrollContent2?.hasContent ||
                        (!cityData?.parsedScrollContent2 && cityData?.scroll_description_2?.trim())) && (
                        <div className="w-full font-quicksand sm:pt-[55px] pt-[30px] relative after:content-[''] after:absolute after:top-0 
              after:right-0 after:w-[calc(75%-0px)] after:h-[70%] after:bg-[#FFFAF5] after:rounded-bl-[40px] after:z-[-1]">
                            <ScrollDetailRight
                                description={cityData?.scroll_description_2}
                                parsedContent={cityData?.parsedScrollContent2}
                            />
                        </div>
                    )}
                    {typeof cityData?.faq_widget?.[0]?.faq_ids === 'string' && (
                        <div className='mx-auto sm:pt-16 pt-8 pb-4'>
                            <FaqSection
                                faq_ids={cityData.faq_widget[0].faq_ids
                                    .split(',')
                                    .map((id) => parseInt(id.trim()))
                                    .filter((id) => !isNaN(id))}
                                heading={cityData.faq_widget[0].heading}
                                subheading={cityData.faq_widget[0].sub_heading}
                                initialFaqs={cityData.initialFaqs}
                            />
                        </div>
                    )}
                </>
            )}
        </>
    );
}
