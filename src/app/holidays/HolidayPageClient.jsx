"use client";
import React from 'react';
import HolidayCustom from '../../Components/HolidayCustom';
import BrandingSection from '../../Components/BrandingSection';
import CommonHeroSection from '../../Components/CommonHeroSection';
import ScrollDetail from '../../Components/ScrollDetail';
import FaqSection from '../../Components/FaqSection';
import useHolidayBreadcrumbs from '../../Hooks/useHolidayBreadcrumbs';

export default function HolidayPageClient({ initialData }) {
    const { holidayPage, countries } = initialData;
    const breadcrumbs = useHolidayBreadcrumbs();

    const parseWidgetContent = (widgetString = '') => {
        const headingMatch = widgetString.match(/heading="([^"]+)"/);
        const subHeadingMatch = widgetString.match(/sub_heading="([^"]+)"/);
        return {
            heading: headingMatch ? headingMatch[1] : '',
            sub_heading: subHeadingMatch ? subHeadingMatch[1] : '',
        };
    };

    const widgetData = parseWidgetContent(holidayPage?.widgets_content || '');
    const firstWithImages = countries.find((country) => country.banner_img?.length > 0);
    const bannerImages = firstWithImages ? firstWithImages.banner_img.map((img) => ({
        url: `${img.url}`,
        alt: img.alt,
        title: img.title,
    })) : [];

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-[85%] mx-auto">
            {breadcrumbs}

            <CommonHeroSection banners={bannerImages} description={holidayPage?.description} />

            <BrandingSection />
            <HolidayCustom deals={countries} limit={100} columns={3} widgetContent={widgetData} />

            {holidayPage?.scroll_description && (
                <div>
                    <ScrollDetail description={holidayPage.scroll_description} />
                </div>
            )}
            <div
                className='max-w-[90%] sm-max-w-[80%] mx-auto pt-16'
            >
                <FaqSection
                faq_ids={
                    holidayPage?.faq_widget?.[0]?.faq_ids
                        ? holidayPage.faq_widget[0].faq_ids.split(',').map(Number)
                        : []
                }
                heading={holidayPage?.faq_widget?.[0]?.heading || ''}
                subheading={holidayPage?.faq_widget?.[0]?.sub_heading || ''}
            />
            </div>
        </div>
    );
}
