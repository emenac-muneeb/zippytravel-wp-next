"use client";
import React, { useState } from 'react';
import CountryCityFares from '../../Components/CountryCityFares';
import useDestinationBreadcrumbs from '../../Hooks/useDestinationsBreadcrumbs';
import ScrollDetail from '../../Components/ScrollDetail';
import ScrollDetailRight from '../../Components/ScrollDetailRight';
import FaqSection from '../../Components/FaqSection';
import BannerInner from '../../Components/BannerInner';

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

    const countryBannerImage =
        countryData?.images?.[0]?.url ||
        countryData?.banner_img?.[0]?.url ||
        "";

    const showScroll1 = hasScrollSection(
        initialData?.parsedScrollContent,
        countryData?.description
    );
    const showScroll2 = hasScrollSection(
        initialData?.parsedScrollContent2,
        countryData?.scroll_description_2
    );

    return (
        <>
            <BannerInner
                bgImageOverride={countryBannerImage}
                pageBannerOnly
                onClassChange={setSelectedClass}
            />

            <div className="container">
                <div className='w-full mx-auto pt-[50px]'>
                    <div className="mb-8">
                            <h1 className="heading_section text-black font-bold text-[22px] min-[450px]:text-[32px] sm:text-[42px] pb-00 leading-tight sm:leading-normal">
                            {countryData.page_title}
                            </h1>
                        <p className="text-black text-xs min-[450px]:text-sm sm:text-base max-w-2xl mt-2">
                                {`Premier Flights connects you from the UK to the top cities in ${countryData.title} with ease. 
                            Book affordable flights and enjoy a smooth travel experience to your desired destination.`}
                        </p>
                    </div>

                    {cityFares.length > 0 ? (
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
                    ) : (
                        <p className="text-center text-gray-500">No Cities Found.</p>
                    )}
                </div>
            </div>
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
    );
}
