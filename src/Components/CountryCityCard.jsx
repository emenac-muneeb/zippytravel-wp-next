"use client";
import React, { useEffect, useState } from 'react';
import { endpoints } from '../Helpers/endpoints';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { BASE_URL_IMG } from '../Helpers/imageurl';
import { holidayCityPath, ensureHtmlExt, stripHtmlExt } from '../Helpers/holidayUrls';

export default function CountryCityCard({ widgetContent = '', countrySlug: countrySlugProp }) {

    const { countrySlug: countrySlugParam } = useParams();
    const holidayCountrySlug = countrySlugProp || countrySlugParam;
    const [cityData, setCityData] = useState([]);
    const [visibleCount, setVisibleCount] = useState(6);
    const [HolidayCountries, setHolidayCountries] = useState(null);



    useEffect(() => {
        if (!holidayCountrySlug) return;

        const fetchData = async () => {
            try {
                const response = await axios.get(
                    endpoints.holidaysCountryDetailsBySlug(ensureHtmlExt(holidayCountrySlug))
                );
                setHolidayCountries(response?.data);
                if (response?.data?.data) {
                    setCityData(response.data.data);
                } else {
                    console.error("Unexpected city data format:", response.data);
                }
            } catch (error) {
                console.error("Failed to fetch holiday cities:", error);
            }
        };

        fetchData();
    }, [holidayCountrySlug]);

    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + 6);
    };



    const parseWidgetContent = (content) => {
        if (typeof content !== 'string') content = '';
        const headingMatch = content.match(/heading="([^"]+)"/);
        const subHeadingMatch = content.match(/sub_heading="([^"]+)"/);

        return {
            heading: headingMatch?.[1] || '',
            sub_heading: subHeadingMatch?.[1] || '',
        };
    };

    const { heading, sub_heading } = parseWidgetContent(widgetContent || '');

    const CityBreakCard = ({ name, image, price, holiday_city_short_description, alt, item }) => (
        <Link
            href={holidayCityPath(holidayCountrySlug, item.holiday_city_slug)}
            className="bg-white shadow-xl rounded-lg p-5 cursor-pointer overflow-hidden w-[75%] sm:w-[45%] md:w-[24%] block"
        >
            <h3 className="text-lg font-base text-secondary mb-1 font-quicksand">{name}</h3>
            <img src={`${BASE_URL_IMG}/media/${image}`} alt={alt} className="w-full h-48 object-cover" />
            <div className="p-2">
                <p className="text-sm text-black mb-2 line-clamp-1"
                    dangerouslySetInnerHTML={{ __html: holiday_city_short_description || '' }}
                >
                </p>
                <div className="flex justify-between items-center">
                    <div>
                        <span className='text-red-600 font-quicksand text-base mr-1'>Fr</span>
                        <span className="text-red-600 font-bold text-xl">{price}</span>
                    </div>
                    <span className="flex items-center text-sm font-medium hover:underline text-primary hover:text-primaryHover gap-2">
                        View All Fares
                        <img src={`${BASE_URL_IMG}/assets/svgs/Arrow1.svg`} alt="arrow right" />
                    </span>
                </div>
            </div>
        </Link>
    );

    return (
        <section className="py-10 px-4">
            <div className="mb-10">
                {heading && (
                    <h2 className="text-3xl font-quicksand text-secondary">
                        {heading}
                    </h2>
                )}
                {sub_heading && (
                    <p className="mt-2 text-sm sm:text-base text-black max-w-2xl">
                        {sub_heading}
                    </p>
                )}
            </div>

            <div className="flex flex-wrap gap-x-10 gap-y-8 justify-start">
                {cityData.slice(0, visibleCount).map((item, index) => (
                    <CityBreakCard
                        key={item.id || index}
                        name={item.holiday_city_title}
                        image={item.holiday_city_image_url}
                        alt={item.holiday_city_image_alt}
                        holiday_city_short_description={item.holiday_city_short_description}
                        item={item}
                        price={
                            item.lowest_package_price
                                ? `£${item.lowest_package_price}`
                                : '£512'
                        }
                    />
                ))}
            </div>
            {visibleCount < cityData.length && (
                <div className="flex justify-center mt-6">
                    <button
                        onClick={handleLoadMore}
                        className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition"
                    >
                        Load More
                    </button>
                </div>
            )}
        </section>
    );
}
