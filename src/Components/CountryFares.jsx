"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import CommonHeroSection from './CommonHeroSection';
import BrandingSection from './BrandingSection';
import CountryCityFares from './CountryCityFares';
import FlightCard from './FlightCard';
import axios from 'axios';
import { endpoints } from '../Helpers/endpoints';
import useDestinationBreadcrumbs from '../Hooks/useDestinationsBreadcrumbs';
import ScrollDetail from './ScrollDetail';
import FaqSection from './FaqSection';
import { BASE_URL_IMG } from '../Helpers/imageurl';
import NotFound from '../Not-found';



export default function CountryFares() {
    const breadcrumbs = useDestinationBreadcrumbs();
    const { continentSlug, countrySlug } = useParams();

    const [cityFares, setCityFares] = useState([]);
    const [countryState, setCountryState] = useState({});
    const [loading, setLoading] = useState(true);
    const [ContinentCities, setContinentCities] = useState(null);
    const [bannerSection, setBannerSection] = useState('');
    const [widgetContent, setWidgetContent] = useState({ heading: '', sub_heading: '' });
    const [visibleCount, setVisibleCount] = useState(6);
    const [invalidSlug, setInvalidSlug] = useState(false);
    // console.log("city fares", cityFares)
    console.log("countryState", countryState)

    const router = useRouter();

    const parseWidgetContent = (widgetString = '') => {
        const headingMatch = widgetString.match(/heading="([^"]+)"/);
        const subHeadingMatch = widgetString.match(/sub_heading="([^"]+)"/);
        return {
            heading: headingMatch ? headingMatch[1] : '',
            sub_heading: subHeadingMatch ? subHeadingMatch[1] : '',
        };
    };

    useEffect(() => {
        if (!countrySlug) return;

        const fetchCities = async () => {
            try {
                const response = await axios.get(endpoints.CountriesCitiesBySlug(countrySlug));
                // console.log("Res", response)

                if (response.data?.status === 0) {
                    setInvalidSlug(true);
                    return;
                }

                if (response.data?.status === 1) {
                    const UrlData = response.data.result.country;
                    const apiContinentSlug = UrlData?.continent?.title
                        ?.toLowerCase()
                        .replace(/\s+/g, "-")
                        .replace(/\//g, "");

                    if (apiContinentSlug !== continentSlug) {
                        setInvalidSlug(true);
                        return;
                    }

                    setContinentCities(response?.data?.result?.country);
                    const data = response.data.result.data || [];
                    setCityFares(data);
                    const countryData = response.data.result.country || {};
                    setCountryState(countryData)

                    // document.title = countryData.browser_title || countryData.title;

                    // // Set Meta Description
                    // if (countryData?.meta_description) {
                    //     const desc = document.querySelector('meta[name="description"]') || document.createElement("meta");
                    //     desc.setAttribute("name", "description");
                    //     desc.setAttribute("content", countryData?.meta_description || "");
                    //     if (!desc.parentNode) document.head.appendChild(desc);
                    // }
                    // // Set meta keywords
                    // if (countryData?.meta_keywords) {
                    //     const keywords = document.querySelector('meta[name="keywords"]') || document.createElement("meta");
                    //     keywords.setAttribute("name", "keywords");
                    //     keywords.setAttribute("content", countryData?.meta_keywords);
                    //     if (!keywords.parentNode) document.head.appendChild(keywords);
                    // }
                    // // OG Title
                    // const ogTitle = document.querySelector('meta[property="og:title"]') || document.createElement("meta");
                    // ogTitle.setAttribute("property", "og:title");
                    // ogTitle.setAttribute("content", countryData.browser_title);
                    // if (!ogTitle.parentNode) document.head.appendChild(ogTitle);

                    // // OG Description
                    // const ogDescription = document.querySelector('meta[property="og:description"]') || document.createElement("meta");
                    // ogDescription.setAttribute("property", "og:description");
                    // ogDescription.setAttribute("content", countryData.meta_description || "");
                    // if (!ogDescription.parentNode) document.head.appendChild(ogDescription);

                    // // OG Image (dynamic from banner_img[0])
                    // const imageUrl = countryData.banner_img?.[0]?.url
                    //     ? `${BASE_URL_IMG}/${countryData.banner_img[0].url}`
                    //     : '';
                    // console.log("imageUrl", imageUrl)
                    // const ogImage = document.querySelector('meta[property="og:image"]') || document.createElement("meta");
                    // ogImage.setAttribute("property", "og:image");
                    // ogImage.setAttribute("content", imageUrl);
                    // if (!ogImage.parentNode) document.head.appendChild(ogImage);

                    // // OG URL (current page URL)
                    // const ogUrl = document.querySelector('meta[property="og:url"]') || document.createElement("meta");
                    // ogUrl.setAttribute("property", "og:url");
                    // ogUrl.setAttribute("content", window.location.href);
                    // if (!ogUrl.parentNode) document.head.appendChild(ogUrl);

                    // // OG Type (always set to "Travels & Tours")
                    // const ogType = document.querySelector('meta[property="og:type"]') || document.createElement("meta");
                    // ogType.setAttribute("property", "og:type");
                    // ogType.setAttribute("content", "Travels & Tours");
                    // if (!ogType.parentNode) document.head.appendChild(ogType);
                    // let canonicalLink = document.querySelector('link[rel="canonical"]');
                    // if (!canonicalLink) {
                    //     canonicalLink = document.createElement("link");
                    //     canonicalLink.setAttribute("rel", "canonical");
                    //     document.head.appendChild(canonicalLink);
                    // }
                    // canonicalLink.setAttribute("href", window.location.href);
                    setBannerSection(countryData.banner_section_content || '');
                    setWidgetContent(parseWidgetContent(countryData.widgets_content || ''));

                }
            } catch (error) {
                console.error('Error fetching cities:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCities();
    }, [countrySlug]);



    if (invalidSlug) {
        return <NotFound />;
    }

    // if (!countryState) {
    //     return (
    //         <div className="flex items-center justify-center min-h-[40vh]">
    //             <p className="text-lg font-Montserrat">No Data Found</p>
    //         </div>
    //     );
    // }

    const imageUrl = countryState && countryState.images?.[0]?.url
        ? `${BASE_URL_IMG}/${countryState.images[0].url}`
        : '';

    return (
        <div className="container w-full mx-auto py-2">
            <div className='max-w-[94%] mx-auto'>
                {breadcrumbs}

                <CommonHeroSection
                    banners={countryState?.images || []}
                    description={bannerSection}
                />


                <BrandingSection />

                {loading ? (
                    <p className="text-center text-gray-500">Loading Fares...</p>
                ) : cityFares.length > 0 ? (
                    <>

                        {/* ✅ Widget Section */}
                        {/*
            {(widgetContent.heading || widgetContent.sub_heading) && (
                <div className="my-8">
                    <h2 className="text-2xl sm:text-3xl font-semibold font-quicksand text-[#F1A868] mb-2">
                        {widgetContent.heading}
                    </h2>
                    <p className="text-black text-sm sm:text-base max-w-2xl">
                        {widgetContent.sub_heading}
                    </p>
                </div>
            )}
             */}
                        {!loading && (
                            <div className="my-8">
                                    <h2 className="text-lg min-[450px]:text-2xl sm:text-3xl font-semibold font-quicksand text-[#F1A868] mb-2">
                                    {countryState.page_title}
                                </h2>
                                <p className="text-black text-xs min-[450px]:text-sm sm:text-base max-w-2xl">

                                    {`Emenac Travel connects you from the UK to the top cities in ${countryState.title} with ease. 
                              Book affordable flights and enjoy a smooth travel experience to your desired destination.`}
                                </p>
                            </div>

                        )}
                        {loading ? (
                            <p className="text-center text-gray-500">Loading fares...</p>
                        ) : cityFares.length > 0 ? (
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
                                ContinentCities={ContinentCities}
                            />
                        ) : (
                            <p className="text-center text-gray-500">No Cities Found.</p>
                        )}


                        {/* Flight Fares */}
                        <div className="grid gap-6 mb-5 mt-2">
                            <div className="mt-6">
                                    <h2 className="text-2xl sm:text-3xl font-semibold font-quicksand text-[#F1A868] mb-2">
                                    {`Cheapest ${countryState.title} fares`}
                                </h2>
                                <p className="text-black text-sm sm:text-base max-w-2xl">

                                    {`Find the cheapest flights from the UK to ${countryState.title} with Emenac Travel. We offer budget 
                                 friendly fares without compromising on comfort or service.`}
                                </p>
                            </div>

                            {/* {loading ? (
                                <p className="text-center text-gray-500">Loading fares...</p>
                            ) : cityFares.length > 0 ? (
                                <FlightCard
                                 cities={cityFares.slice(0, visibleCount)}
                                  />
                            ) : (
                                <p className="text-center text-gray-500">No city fares found.</p>
                            )} */}
                            {loading ? (
                                <p className="text-center text-gray-500">Loading fares...</p>
                            ) : cityFares.length > 0 ? (
                                <FlightCard
                                    cities={[
                                        {
                                            id: "all",
                                            fares: cityFares
                                                .flatMap(city => city.fares || [])
                                                .sort((a, b) => (a.price || Infinity) - (b.price || Infinity)),
                                        }
                                    ]}
                                />
                            ) : (
                                <p className="text-center text-gray-500">No city fares found.</p>
                            )}

                        </div>
                        {!loading && cityFares.length > visibleCount && (
                            <div className="text-center mb-10 flex items-center justify-center">
                                <button
                                    onClick={() => setVisibleCount((prev) => prev + 6)}
                                    className="px-6 py-2  text-black flex items-center gap-2 hover:underline"
                                >
                                    Load More
                                    <img src={`${BASE_URL_IMG}/assets/svgs/Arrow1.svg`} alt="Arrow" />
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <p className="text-center mt-20 mb-20 text-gray-500">No cities found.</p>
                )}

                {/* Scroll Description */}
                {countryState?.description && (
                    <ScrollDetail description={countryState.description || "No Description avaliable yet."} />
                )}

                {countryState?.faq_widget?.[0]?.faq_ids && (() => {
                    const faqWidget = countryState.faq_widget[0];

                    return (
                        <div className='mx-auto sm:pt-16 pt-8 pb-4'>
                            <FaqSection
                                faq_ids={
                                    faqWidget.faq_ids
                                        .split(',')
                                        .map((id) => parseInt(id.trim()))
                                        .filter((id) => !isNaN(id))
                                }
                                heading={faqWidget.heading}
                                subheading={faqWidget.sub_heading}
                            />
                        </div>
                    );
                })()}



            </div>
        </div>
    );
}
