"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';

import CommonHeroSection from './CommonHeroSection';
import BrandingSection from './BrandingSection';
import PackageCard, { PackageCardSkeleton } from './PackageCard';
import ScrollDetail from './ScrollDetail';
import FaqSection from './FaqSection';

import { endpoints } from '../Helpers/endpoints';
import useHolidayBreadcrumbs from '../Hooks/useHolidayBreadcrumbs';
import { ensureHtmlExt, stripHtmlExt } from '../Helpers/holidayUrls';

export default function CityPackages({ countrySlug, citySlug, initialPackages = null }) {
    const breadcrumbs = useHolidayBreadcrumbs();
    const params = useParams();
    const resolvedCountrySlug = countrySlug || params.countrySlug;
    const resolvedCitySlug = citySlug || params.citySlug;

    const [packagesData, setPackagesData] = useState(initialPackages || []);
    const [loading, setLoading] = useState(!initialPackages?.length);
    const [visibleCount, setVisibleCount] = useState(8);
    const [HolidayCities, setHolidayCities] = useState(null);
    // console.log("HolidayCities", HolidayCities)
    const [cityInfo, setCityInfo] = useState(null);

    const parseWidgetContent = (content = '') => {
        const headingMatch = content.match(/heading="([^"]+)"/);
        const subHeadingMatch = content.match(/sub_heading="([^"]+)"/);
        return {
            heading: headingMatch?.[1] || '',
            sub_heading: subHeadingMatch?.[1] || '',
        };
    };

    useEffect(() => {
        if (!resolvedCitySlug || initialPackages?.length) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    endpoints.holidaysCityDetailsBySlug(ensureHtmlExt(resolvedCitySlug))
                );
                setHolidayCities(response?.data)

                if (response?.data?.data?.length > 0) {
                    const cityPackages = response.data.data;
                    setPackagesData(cityPackages);
                    setCityInfo(cityPackages[0]);
                } else {
                    setPackagesData([]);
                }
            } catch (error) {
                console.error('Failed to fetch holiday packages:', error);
                setPackagesData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [resolvedCitySlug, initialPackages]);

    useEffect(() => {
        if (initialPackages?.length) {
            setPackagesData(initialPackages);
            setCityInfo(initialPackages[0]);
        }
    }, [initialPackages]);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 8);
    };
    const cityData = cityInfo || {};
    const widgetContentParsed = parseWidgetContent(cityInfo?.city_widgets_content || '');
    const faqWidget = cityInfo?.city_faq_widget?.[0];
    const faqIDs = faqWidget?.faq_ids?.split(',') || [];

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-[80%] mx-auto">
            {/* Breadcrumbs */}
            <div className="w-full text-left">
                {breadcrumbs}
            </div>

            {/* Top Hero Section */}
            <CommonHeroSection
                banners={cityInfo?.banner_img || []}
                description={cityInfo?.city_banner_section_content || ''}
            />

            <BrandingSection />

            {/* Optional heading/subheading from widget */}
            {(widgetContentParsed.heading || widgetContentParsed.sub_heading) && (
                <div className="w-full text-left my-6">
                    {widgetContentParsed.heading && (
                        <h2 className="text-2xl sm:text-3xl font-bold text-secondary mb-2">
                            {widgetContentParsed.heading}
                        </h2>
                    )}
                    {widgetContentParsed.sub_heading && (
                        <p className="text-sm sm:text-base text-gray-700 max-w-2xl">
                            {widgetContentParsed.sub_heading}
                        </p>
                    )}
                </div>
            )}

            {/* Package Cards */}
            <div className="flex flex-wrap gap-6 justify-center mt-6 w-full">
                {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                        <PackageCardSkeleton key={`skeleton-${i}`} />
                    ))
                ) : packagesData.length > 0 ? (
                    packagesData.slice(0, visibleCount).map((item) => (
                        <PackageCard
                            key={item.id}
                            id={item.id}
                            image={item.package_image_url}
                            Packageslug={item.package_slug.split('/').pop()}
                            alt={item.package_image_alt || item.title}
                            title={item.title}
                            price={item.package_price ? `£${item.package_price}` : '£512'}
                            stars={item.package_star ? parseInt(item.package_star) : 3}
                            nights={item.package_night ? `${item.package_night}-Nights` : '07-Nights'}
                            HolidayCities={HolidayCities}
                            countrySlug={resolvedCountrySlug}
                            citySlug={resolvedCitySlug}
                        />
                    ))
                ) : (
                    <p className="text-center text-gray-500">No holiday packages found for this city.</p>
                )}
            </div>

            {/* Load More Button */}
            {!loading && visibleCount < packagesData.length && (
                <div className="flex justify-center mt-6">
                    <button
                        onClick={handleLoadMore}
                        className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition"
                    >
                        Load More
                    </button>
                </div>
            )}

            {/* Bottom Sections */}
            <ScrollDetail description={cityInfo?.city_scroll_description || 'No description available'} />
            <div
                className='max-w-[90%] sm-max-w-[80%] mx-auto pt-16'
            >
                {faqIDs.length > 0 && (
                    <FaqSection
                        faq_ids={faqIDs}
                        heading={faqWidget?.heading || ''}
                        subheading={faqWidget?.sub_heading || ''}
                    />
                )}
            </div>
        </div>
    );
}
