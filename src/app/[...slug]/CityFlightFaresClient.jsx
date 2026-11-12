"use client";
import React, { useState, useMemo } from 'react';
import HeroSectionNew from '../../Components/HeroSectionNew';
import FlightCard from '../../Components/FlightCard';
import LoadingScreen from '../../Components/LoadingScreen';
import PopUp from '../../Components/PopUp';
import useDestinationBreadcrumbs from '../../Hooks/useDestinationsBreadcrumbs';
import ScrollDetail from '../../Components/ScrollDetail';
import ScrollDetailRight from '../../Components/ScrollDetailRight';
import FaqSection from '../../Components/FaqSection';

const PAGE_SIZE = 12;

export default function CityFlightFaresClient({ initialData, params }) {
    useDestinationBreadcrumbs();
    const [cityData] = useState(initialData);
    const [FlightLoading, setFlightLoading] = useState(false);
    const [popupMessage, setPopupMessage] = useState(null);
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    // match-location returns all cabin classes in one list (no class filter)
    const allFares = useMemo(() => {
        if (!initialData?.fares) return [];
        return Array.isArray(initialData.fares)
            ? initialData.fares
            : (initialData.fares.data || []);
    }, [initialData]);

    const faresList = useMemo(
        () => allFares.slice(0, visibleCount),
        [allFares, visibleCount]
    );
    const hasMore = visibleCount < allFares.length;

    const handleLoadMore = () => {
        if (!hasMore) return;
        setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, allFares.length));
    };

    const cityName = cityData?.title || 'City';
    // Hero H1 must use API page_title (e.g. "Book Flight Tickets to Ghana")
    const heroTitle = cityData?.page_title || `Flights to ${cityName}`;

    return (
        <>
            {popupMessage && (
                <PopUp title="Error" message={popupMessage} onClose={() => setPopupMessage(null)} />
            )}

            {FlightLoading ? (
                <LoadingScreen />
            ) : (
                <>
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

                    <div className="w-full font-poppins">
                        <div className="text-center mt-12 sm:mt-16 mb-8 sm:mb-10 max-w-3xl mx-auto px-4">
                            <h2 className="font-poppins font-bold text-[30px] sm:text-[38px] md:text-[42px] text-[#1F0060] tracking-tight">
                                {`Cheapest ${cityName} Flight Fares`}
                            </h2>
                            <p className="mt-3 text-[#555555] text-[15px] sm:text-[16px] font-poppins leading-relaxed">
                                Our customers can access our web site for a 'one-stop shop' including access to specially negotiated airfares, hotels, car rental and insurance.
                            </p>
                        </div>

                        <div className="max-w-[1236px] mx-auto px-4 sm:px-6 xl:px-0">
                            {faresList.length > 0 ? (
                                <FlightCard fares={faresList} cols={2} />
                            ) : (
                                <p className="text-center text-gray-500 py-12 text-base">
                                    No fares available for {cityName} at the moment.
                                </p>
                            )}

                            {hasMore && (
                                <div className="flex justify-center mt-10 mb-8">
                                    <button
                                        type="button"
                                        onClick={handleLoadMore}
                                        className="px-8 py-2.5 bg-[#1F0060] hover:bg-[#2A0080] text-white font-poppins font-bold text-[16px] sm:text-[18px] rounded-[14px] shadow-md hover:shadow-lg transition-all flex items-center justify-center select-none"
                                    >
                                        Show More
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

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
                    {typeof cityData?.faq_widget?.[0]?.faq_ids === 'string' &&
                        cityData.faq_widget[0]?.heading &&
                        cityData.faq_widget[0]?.sub_heading && (
                        <div className='mx-auto '>
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
