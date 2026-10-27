"use client";
import React, { useState, useMemo } from 'react';
import HeroSectionNew from '../../Components/HeroSectionNew';
import CountryCityFares from '../../Components/CountryCityFares';
import FlightCard from '../../Components/FlightCard';
import LoadingScreen from '../../Components/LoadingScreen';
import PopUp from '../../Components/PopUp';
import useDestinationBreadcrumbs from '../../Hooks/useDestinationsBreadcrumbs';
import ScrollDetail from '../../Components/ScrollDetail';
import ScrollDetailRight from '../../Components/ScrollDetailRight';
import FaqSection from '../../Components/FaqSection';

/** Only show scroll wrappers when there is real text content and a panel image. */
function hasScrollSection(parsed, rawHtml) {
    if (parsed) {
        return Boolean(parsed.hasContent && parsed.rightPanelImageUrl);
    }
    return typeof rawHtml === 'string' && rawHtml.trim().length > 0;
}

export default function CountryFaresClient({ initialData }) {
    useDestinationBreadcrumbs();
    const [countryData] = useState(initialData?.country || {});
    const [cityFares] = useState(initialData?.data || []);
    const [selectedClass, setSelectedClass] = useState('Business');
    const [FlightLoading, setFlightLoading] = useState(false);
    const [popupMessage, setPopupMessage] = useState(null);

    const countryBannerImage =
        countryData?.image_url ||
        countryData?.images?.[0]?.url ||
        countryData?.banner_img?.[0]?.url ||
        "";

    const allFares = useMemo(() => {
        const collected = cityFares.flatMap((city) =>
            (city.fares || []).map((fare) => ({
                ...fare,
                cityTitle: city.title,
                countryTitle: countryData?.title,
            }))
        );
        if (collected.length > 0) return collected;
        if (Array.isArray(countryData?.fares) && countryData.fares.length > 0) {
            return countryData.fares;
        }
        return [];
    }, [cityFares, countryData]);

    const showScroll1 = hasScrollSection(
        initialData?.parsedScrollContent,
        countryData?.description
    );
    const showScroll2 = hasScrollSection(
        initialData?.parsedScrollContent2,
        countryData?.scroll_description_2
    );

    const countryTitle = countryData?.title || 'Bangladesh';
    const heroTitle = `Flights to ${countryTitle}`;

    return (
        <>
            {popupMessage && (
                <PopUp title="Error" message={popupMessage} onClose={() => setPopupMessage(null)} />
            )}

            {FlightLoading ? (
                <LoadingScreen />
            ) : (
                <>
                    {/* Hero Section matching Home Page and Design Image */}
                    <HeroSectionNew
                        setFlightLoading={setFlightLoading}
                        setPopupMessage={setPopupMessage}
                        title={heroTitle}
                        subTitle="— Zippy Travel"
                        description={
                            countryData?.banner_section_content ||
                            countryData?.banner_description ||
                            countryData?.description ||
                            "Zippytravel.co.uk is an e-commerce UK based company offering online travel products and services."
                        }
                        bgImageOverride={countryBannerImage}
                    />

                    <div className="w-full font-poppins">
                        {/* Section 1: Book Flights to Top Cities in [Country] */}
                        <div className="text-center mt-12 sm:mt-16 mb-8 sm:mb-10 max-w-3xl mx-auto px-4">
                            <h2 className="font-poppins font-bold text-[30px] sm:text-[38px] md:text-[42px] text-[#1F0060] tracking-tight">
                                {countryData?.page_title || `Book Flights to Top Cities in ${countryTitle}`}
                            </h2>
                            <p className="mt-3 text-[#555555] text-[15px] sm:text-[16px] font-poppins leading-relaxed">
                                Our customers can access our web site for a 'one-stop shop' including access to specially negotiated airfares, hotels, car rental and insurance.
                            </p>
                        </div>

                        {cityFares.length > 0 ? (
                            <div className="max-w-[1236px] mx-auto px-4 sm:px-6 xl:px-0">
                                <CountryCityFares
                                    cities={cityFares.map(city => ({
                                        id: city.id,
                                        title: city.title,
                                        price: city.fares?.[0]?.price ?? null,
                                        image_url: city.image_url,
                                        image_alt: city.image_alt,
                                        slug: city.slug,
                                        country: city.country?.title,
                                        countryID: city.country?.id,
                                        continent: city.country?.continent?.title,
                                        continentID: city.country?.continent?.id,
                                        browser_title: city?.browser_title,
                                        meta_description: city?.meta_description,
                                        meta_keywords: city?.meta_keywords,
                                    }))}
                                    ContinentCities={countryData}
                                    classLabel={selectedClass}
                                />
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-8">No Cities Found.</p>
                        )}

                        {/* Section 2: Cheapest [Country] fares */}
                        {allFares.length > 0 && (
                            <div className="max-w-[1236px] mx-auto px-4 sm:px-6 xl:px-0 mt-14 sm:mt-18 mb-12">
                                <div className="text-center mb-8 sm:mb-10 max-w-3xl mx-auto">
                                    <h2 className="font-poppins font-bold text-[30px] sm:text-[38px] md:text-[42px] text-[#1F0060] tracking-tight">
                                        Cheapest {countryTitle} fares
                                    </h2>
                                    <p className="mt-3 text-[#555555] text-[15px] sm:text-[16px] font-poppins leading-relaxed">
                                        Our customers can access our web site for a 'one-stop shop' including access to specially negotiated airfares, hotels, car rental and insurance.
                                    </p>
                                </div>

                                <FlightCard fares={allFares} cities={cityFares} />
                            </div>
                        )}
                    </div>

                    {/* Unchanged existing sections */}
                    {showScroll1 && (
                        <div className="w-full font-quicksand sm:pb-[55px] pb-[30px] relative after:content-[''] after:absolute after:bottom-0 
                        after:right-0 after:w-[calc(75%-0px)]  after:h-[70%] after:bg-[#FFFAF5] after:rounded-tl-[40px] after:z-[-1] mt-16">
                            <ScrollDetail
                                description={countryData.description}
                                parsedContent={initialData?.parsedScrollContent}
                            />
                        </div>
                    )}
                    {showScroll2 && (
                        <div className="w-full font-quicksand  sm:pt-[55px] pt-[30px] pb-[55px] relative after:content-[''] after:absolute after:top-0 after:right-0 after:w-[calc(75%-0px)]  after:h-[70%] after:bg-[#FFFAF5] after:rounded-bl-[40px] after:z-[-1]">
                            <ScrollDetailRight
                                description={countryData.scroll_description_2}
                                parsedContent={initialData?.parsedScrollContent2}
                            />
                        </div>
                    )}
                    {countryData?.faq_widget?.[0]?.faq_ids && (
                        <div className='mx-auto sm:pt-16 pt-8 pb-4'>
                            <FaqSection
                                faq_ids={
                                    countryData.faq_widget[0].faq_ids
                                        .split(',')
                                        .map((id) => parseInt(id.trim()))
                                        .filter((id) => !isNaN(id))
                                }
                                heading={countryData.faq_widget[0].heading}
                                subheading={countryData.faq_widget[0].sub_heading}
                                initialFaqs={initialData?.initialFaqs}
                            />
                        </div>
                    )}
                </>
            )}
        </>
    );
}
