"use client";
import React, { useEffect, useState, useCallback } from 'react';
import CommonHeroSection from '../../Components/CommonHeroSection';
import BrandingSection from '../../Components/BrandingSection';
import CountryCityCard from '../../Components/CountryCityCard';
import PackageSlider from '../../Components/PackageSlider';
import ScrollDetail from '../../Components/ScrollDetail';
import FaqSection from '../../Components/FaqSection';
import axios from 'axios';
import { endpoints } from '../../Helpers/endpoints';
import useHolidayBreadcrumbs from '../../Hooks/useHolidayBreadcrumbs';

export default function CountryPackagesClient({ initialData, countrySlug }) {
    const breadcrumbs = useHolidayBreadcrumbs();
    const [cities, setCities] = useState(initialData || []);
    const [packages, setPackages] = useState([]);
    const [loadingPackages, setLoadingPackages] = useState(false);

    const fetchPackagesForCities = useCallback(async () => {
        if (!cities.length) return;

        setLoadingPackages(true);
        try {
            const selectedCities = cities.slice(0, 5);
            const results = await Promise.all(
                selectedCities.map(city =>
                    axios.get(endpoints.holidaysCityDetailsBySlug(city.holiday_city_slug))
                        .then(res => (res.data?.data || []).map(pkg => ({
                            ...pkg,
                            // Attach known slugs so PackageSlider can build the correct URL
                            _citySlug: city.holiday_city_slug,
                            _countrySlug: countrySlug,
                        })))
                        .catch(() => [])
                )
            );
            setPackages(results.flat());
        } catch (error) {
            console.error("❌ Error fetching holiday packages:", error);
        } finally {
            setLoadingPackages(false);
        }
    }, [cities, countrySlug]);

    useEffect(() => {
        if (cities.length) fetchPackagesForCities();
    }, [cities, fetchPackagesForCities]);

    const countryData = cities[0] || {};

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-[85%] mx-auto">
            {breadcrumbs}

            <CommonHeroSection
                banners={countryData.banner_img}
                description={countryData.country_banner_section_content}
            />

            <BrandingSection />

            <CountryCityCard cities={cities} widgetContent={countryData.country_widgets_content} countrySlug={countrySlug} />
            <PackageSlider data={packages} loading={loadingPackages} countrySlug={countrySlug} />
            <ScrollDetail description={countryData.country_scroll_description || ''} />
            <div
                className='max-w-[90%] sm-max-w-[80%] mx-auto pt-16'
            >
                {cities.length > 0 &&
                cities[0]?.country_faq_widget?.[0]?.faq_ids && (
                    <FaqSection
                        faq_ids={
                            cities?.[0]?.country_faq_widget?.[0]?.faq_ids
                                ?.split(',')
                                .map((id) => parseInt(id.trim()))
                                .filter((id) => !isNaN(id)) || []
                        }
                        heading={cities?.[0]?.country_faq_widget?.[0]?.heading || ''}
                        subheading={cities?.[0]?.country_faq_widget?.[0]?.sub_heading || ''}
                    />
                )}
            </div>
        </div>
    );
}
