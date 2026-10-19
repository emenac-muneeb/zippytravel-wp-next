"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import CommonHeroSection from './CommonHeroSection';
import BrandingSection from './BrandingSection';
import FlightCard from './FlightCard';
import axios from 'axios';
import { endpoints } from '../Helpers/endpoints';
import useDestinationBreadcrumbs from '../Hooks/useDestinationsBreadcrumbs';
import ScrollDetail from './ScrollDetail';
import FaqSection from './FaqSection';
import { BASE_URL_IMG } from '../Helpers/imageurl';
import NotFound from '../Not-found';



export default function CityFlightFares() {
    const breadcrumbs = useDestinationBreadcrumbs();
    const { continentSlug, countrySlug, citySlug } = useParams();

    const router = useRouter();

    const cityName = citySlug;

    const [cityData, setCityData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [widgetContent, setWidgetContent] = useState({ heading: '', sub_heading: '' });
    const [bannerContent, setBannerContent] = useState('');
    const [visibleCount, setVisibleCount] = useState(12);
    // console.log("cityData", cityData)

    const parseWidgetContent = (widgetString = '') => {
        const headingMatch = widgetString.match(/heading="([^"]+)"/);
        const subHeadingMatch = widgetString.match(/sub_heading="([^"]+)"/);
        return {
            heading: headingMatch ? headingMatch[1] : '',
            sub_heading: subHeadingMatch ? subHeadingMatch[1] : '',
        };
    };

    const [invalidSlug, setInvalidSlug] = useState(false);

    useEffect(() => {
        const fetchCityFares = async () => {
            try {
                const response = await axios.get(endpoints.CityFaresByCityName(cityName));
                // console.log("Ye", response)

                if (response.data?.status === 0) {
                    setInvalidSlug(true);
                    return;
                }

                const UrlData = response.data.result.country;
                const apiCountrySlug = UrlData?.title
                    ?.toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/\//g, "");
                const apiContinentSlug = UrlData?.continent?.title
                    ?.toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/\//g, "");

                if (apiContinentSlug !== continentSlug || apiCountrySlug !== countrySlug) {
                    router.push(`/${continentSlug}/${countrySlug}/${citySlug}`);
                    return;
                }

                const data = response.data.result;
                setCityData(data);

                // ✅ Inject country-level content for banners and widgets
                if (data?.country) {
                    // console.log(data)
                    // document.title = data.browser_title || data.title;

                    // // Set Meta Description
                    // if (data?.meta_description) {
                    //     const desc = document.querySelector('meta[name="description"]') || document.createElement("meta");
                    //     desc.setAttribute("name", "description");
                    //     desc.setAttribute("content", data?.meta_description || "");
                    //     if (!desc.parentNode) document.head.appendChild(desc);
                    // }
                    // // Set meta keywords
                    // if (data?.meta_keywords) {
                    //     const keywords = document.querySelector('meta[name="keywords"]') || document.createElement("meta");
                    //     keywords.setAttribute("name", "keywords");
                    //     keywords.setAttribute("content", data?.meta_keywords);
                    //     if (!keywords.parentNode) document.head.appendChild(keywords);
                    // }
                    // // OG Title
                    // const ogTitle = document.querySelector('meta[property="og:title"]') || document.createElement("meta");
                    // ogTitle.setAttribute("property", "og:title");
                    // ogTitle.setAttribute("content", data.browser_title);
                    // if (!ogTitle.parentNode) document.head.appendChild(ogTitle);

                    // // OG Description
                    // const ogDescription = document.querySelector('meta[property="og:description"]') || document.createElement("meta");
                    // ogDescription.setAttribute("property", "og:description");
                    // ogDescription.setAttribute("content", data.meta_description || "");
                    // if (!ogDescription.parentNode) document.head.appendChild(ogDescription);

                    // // OG Image (dynamic from banner_img[0])
                    // const imageUrl = data.banner_img?.[0]?.url
                    //     ? `${BASE_URL_IMG}/${data.banner_img[0].url}`
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

                    // // Canonical Link
                    // let canonicalLink = document.querySelector('link[rel="canonical"]');
                    // if (!canonicalLink) {
                    //     canonicalLink = document.createElement("link");
                    //     canonicalLink.setAttribute("rel", "canonical");
                    //     document.head.appendChild(canonicalLink);
                    // }
                    // canonicalLink.setAttribute("href", window.location.href);
                    setWidgetContent(parseWidgetContent(data.widgets_content || ''));
                    setBannerContent(data.banner_section_content || '');
                }
            } catch (error) {
                console.error('Error fetching city fares:', error);
            } finally {
                setLoading(false);
            }
        };

        if (cityName) fetchCityFares();
    }, [cityName]);



    // console.log('FAQ IDS:', cityData?.faq_widget?.[0]?.faq_ids);

    if (invalidSlug) {
        return <NotFound />;
    }

    // if (!cityData) {
    //     return (
    //         <div className="flex items-center justify-center min-h-[40vh]">
    //             <p className="text-lg font-Montserrat">No Data Found</p>
    //         </div>
    //     );
    // }

    const imageUrl = cityData && cityData.banner_img?.[0]?.url
        ? `${BASE_URL_IMG}/${cityData.banner_img[0].url}`
        : '';

    return (
        <div className="container w-full mx-auto py-2">
            <div className='max-w-[94%] mx-auto'>
                {breadcrumbs}

                <CommonHeroSection
                    banners={cityData?.banner_img || []}
                    description={bannerContent}
                />

                <BrandingSection />

                {cityData && (
                    <div className="my-6">
                        <h2 className="text-2xl sm:text-3xl font-semibold font-quicksand text-[#F1A868] mb-2">
                            {cityData.page_title}
                        </h2>
                        <p className="text-black text-sm sm:text-base max-w-2xl">
                            {`Your trusted partner for the best flight deals to ${cityData.title}, with unbeatable fares and exceptional service.`}
                        </p>
                    </div>
                )}

                <div className="grid gap-6 mt-6 mb-9">
                    {loading ? (
                        <p className="text-center text-gray-500">Loading fares...</p>
                    ) : cityData?.fares?.length > 0 ? (
                        <FlightCard cities={[{ ...cityData, fares: cityData.fares.slice(0, visibleCount) }]} />
                    ) : (
                        <p className="text-center text-gray-500">No fares found.</p>
                    )}
                </div>
                {!loading && cityData?.fares?.length > visibleCount && (
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

                {/* Description Section */}
                {cityData?.description &&
                    <ScrollDetail description={cityData?.description} />
                }
                {typeof cityData?.faq_widget?.[0]?.faq_ids === 'string' && (
                    <div className='mx-auto sm:pt-16 pt-8 pb-4'>
                        <FaqSection
                            faq_ids={cityData.faq_widget[0].faq_ids
                                .split(',')
                                .map((id) => parseInt(id.trim()))
                                .filter((id) => !isNaN(id))}
                            heading={cityData.faq_widget[0].heading}
                            subheading={cityData.faq_widget[0].sub_heading}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
