"use client";
import { useState, useEffect, useMemo } from 'react';
import React from 'react';
import BrandingSection from './BrandingSection';
import axios from 'axios';
import FlightForm from '../Components/EnquiryBox';
import { endpoints } from '../Helpers/endpoints';
import { ImageCarousel } from '../Components/ImageCarousel';
import { useParams } from 'next/navigation';
import useHolidayBreadcrumbs from '../Hooks/useHolidayBreadcrumbs';
import { BASE_URL_IMG } from "../Helpers/imageurl";

export default function HolidayPackageDetail() {
    // --- ALL REACT HOOKS MUST BE DECLARED HERE, AT THE TOP LEVEL ---
    const breadcrumbs = useHolidayBreadcrumbs();
    const { Packageslug: holiday_package_slug } = useParams(); // Using Packageslug as per your Route definition

    // Initialize packageDetail as null
    const [packageDetail, setPackageDetail] = useState(null);

    // useEffect for data fetching. It's a Hook, so it's here.
    useEffect(() => {
        // console.log("holiday_package_slug from useParams:", holiday_package_slug);
        if (!holiday_package_slug) {
            console.warn("holiday_package_slug is empty, not making API call.");
            return;
        }

        const apiUrl = endpoints.holidayPackageDetailsBySlug(holiday_package_slug);
        // console.log("Generated API URL:", apiUrl);

        axios.get(apiUrl)
            .then((res) => {
                // console.log('🚀 Fetched Holiday Package Data:', res.data);
                if (res.data && res.data.length > 0) {
                    setPackageDetail(res.data[0]);
                } else {
                    setPackageDetail({});
                    console.warn("No package details found or unexpected response format.", res.data);
                }
            })
            .catch((error) => {
                console.error("❌ Error fetching data:", error.response || error.message || error);
                setPackageDetail({});
            });
    }, [holiday_package_slug]);

    // useMemo for processing HTML content. It's a Hook, so it's here.
    const includes = useMemo(() => {
        const rawIncludesHTML = packageDetail?.description || "";
        const matches = [...rawIncludesHTML.matchAll(/<li[^>]*>(.*?)<\/li>/gi)];
        return matches.map(match => {
            const text = match[1] || "";
            return text.replace(/<[^>]*>/g, '').trim();
        });
    }, [packageDetail?.description]); // Dependency array ensures it re-runs if description changes

    // --- END OF REACT HOOK DECLARATIONS ---

    // Now, you can have your conditional rendering logic
    // console.log("PackageDetail state after hooks:", packageDetail); // Log after hooks

    // Conditional return for loading state (comes AFTER all hooks)
    if (!packageDetail || Object.keys(packageDetail).length === 0) {
        return (
            <div className="container max-w-[80%] mx-auto px-2 py-20 text-center text-xl font-quicksand">
                Loading package details...
            </div>
        );
    }

    // --- All other helper functions and variable derivations go here, after the loading check ---
    const getFirstParagraphText = (html) => {
        if (!html) return "";
        const pMatch = html.match(/<p[^>]*>(.*?)<\/p>/i);
        const content = pMatch ? pMatch[1] : html;
        return content.replace(/<[^>]*>/g, '').trim();
    };

    const icons = {
        Arrow1: `${BASE_URL_IMG}/assets/svgs/Arrow1.svg`,
        image: "/images/umrah-package-detail.png" // Double-check this path if it's not loading
    };

    // const services = packageDetail?.services || []; // Derived directly from packageDetail
    const services = [
        { id: 1, name: 'Flight', icon: 'assets/svgs/RFlight.svg' },
        { id: 2, name: 'Accommodation', icon: 'assets/svgs/Accomodation.svg' },
        { id: 3, name: 'Visa', icon: 'assets/svgs/Visa.svg' },
        { id: 4, name: 'Breakfast', icon: 'assets/svgs/BreakFast.svg' },
        { id: 5, name: 'Transfer', icon: 'assets/svgs/Transfer.svg' },
    ];

    const half = Math.ceil(includes.length / 2);
    const firstHalf = includes.slice(0, half);
    const secondHalf = includes.slice(half);

    return (
        <>
            <div className='container max-w-[80%] mx-auto px-2'>
                <div className="mb-4 flex items-center text-sm">
                    {breadcrumbs}
                </div>
                <div className='flex flex-col lg:flex-row justify-between gap-6'>
                    {/* LEFT SIDE */}
                    <div className='left w-full lg:w-[45%]'>
                        <div className="flex justify-between items-start mb-5">
                            {/* LEFT: Title and Country */}
                            <div>
                                <h2 className='text-primary font-quicksand text-2xl font-semibold'>
                                    {packageDetail?.city_title || 'City Name'}
                                </h2>
                                <div className='flex items-center gap-1 mt-1'>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        xmlnsXlink="http://www.w3.org/1999/xlink"
                                        width="13.666"
                                        height="16.747"
                                        viewBox="0 0 13.666 16.747"
                                    >
                                        <defs>
                                            <clipPath id="clip-path">
                                                <rect width="13.666" height="16.747" fill="#A57233" />
                                            </clipPath>
                                        </defs>
                                        <g clipPath="url(#clip-path)">
                                            <path
                                                d="M6.84,0a6.862,6.862,0,0,1,6.681,5.462,6.665,6.665,0,0,1-2.769,6.991,10.044,10.044,0,0,0-2.689,2.954q-.262.444-.529.886a.765.765,0,0,1-1.4,0,15.071,15.071,0,0,0-1.543-2.238,15.679,15.679,0,0,0-2.041-1.876A6.6,6.6,0,0,1,.024,7.438,6.809,6.809,0,0,1,5.6.134C6.01.058,6.427.043,6.84,0ZM3.8,6.859A3.036,3.036,0,1,0,6.864,3.825,3.042,3.042,0,0,0,3.8,6.859Z"
                                                fill="#A57233"
                                            />
                                        </g>
                                    </svg>
                                    <span className='text-lg font-light'>
                                        {packageDetail?.country_title || 'Country Name'}
                                    </span>
                                </div>
                            </div>

                            {/* RIGHT: Nights and Star */}
                            <div className='flex flex-col items-end gap-2'>
                                <p className='flex items-center gap-2 text-sm'>
                                    {packageDetail?.package_night || 'X'}-Nights <img src={`${BASE_URL_IMG}/assets/svgs/moon.svg`} alt="moon icon" />
                                </p>
                                <div className='flex items-center gap-1 text-sm'>
                                    <span className="ml-1">{packageDetail?.package_star || '0'}-Star</span>
                                    {[...Array(5)].map((_, index) => (
                                        <img
                                            key={index}
                                            src={
                                                index < (packageDetail?.package_star || 0)
                                                    ? `${BASE_URL_IMG}/assets/svgs/star-filled.svg`
                                                    : `${BASE_URL_IMG}/assets/svgs/star-outline.svg`
                                            }
                                            alt={index < (packageDetail?.package_star || 0) ? "Filled Star" : "Empty Star"}
                                            className="w-4 h-4"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <hr className='border-1 border-gray-300 my-6' />
                        <h3 className='text-2xl font-medium font-quicksand mb-7'>
                            {packageDetail?.title || 'Package Title'}
                        </h3>

                        <div className='flex flex-nowrap mb-5 no-scrollbar justify-between'>
                            {services.length > 0 ? (
                                services.map((service) => (
                                    <div
                                        key={service.id}
                                        className='flex flex-col items-center justify-center min-w-[70px] shrink-0 text-center'
                                    >
                                        <img
                                            src={`${BASE_URL_IMG}/${service.icon}`}
                                            alt={service.name}
                                            className="h-14 w-14 object-contain mb-1"
                                        />
                                        <p className="text-sm">{service.name}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No services listed.</p>
                            )}

                        </div>

                        <h4 className='text-xl font-medium font-quicksand mt-4'>Short Description!</h4>
                        <p className='text-base font-quicksand mb-5'>
                            {packageDetail?.short_description || 'No short description available.'}
                        </p>

                        <div className='flex flex-col sm:flex-row justify-between gap-6'>
                            <div>
                                <button className="text-red-600 font-bold text-base hover:underline flex items-center gap-2 mt-4">
                                    Send Enquiry <img src={icons.Arrow1} alt="Arrow Up icon" />
                                </button>
                                <p className='text-sm'>Too Busy to Dial a Call?</p>
                            </div>
                            <div>
                                <span className='font-medium text-xl'>Fr </span>
                                <span className='font-bold text-3xl'>£{packageDetail?.price || '0.00'}.00</span>
                                <p className='pl-4'>per person</p>
                            </div>
                            <div>
                                <button className="text-red-600 font-bold text-base hover:underline flex items-center gap-2 mt-4">
                                    Call Us Now <img src={icons.Arrow1} alt="Arrow Up icon" />
                                </button>
                                <p className='text-sm'>0207-043-3433</p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="mt-7 right w-full lg:w-[45%]">
                        <ImageCarousel images={packageDetail?.banner_img || []} />
                    </div>
                </div>

                {/* REVIEW SECTION */}
                <div className="mt-10">
                    <BrandingSection />
                </div>

                <div className='flex flex-col my-6'>
                    <h4 className='text-xl font-semibold font-quicksand text-red-700 underline line-clamp-4'>Description:</h4>
                    <p className='text-base font-quicksand mt-3'>
                        {getFirstParagraphText(packageDetail?.description)}
                    </p>
                </div>

                {/* PACKAGE INCLUDES & FLIGHT FORM */}
                <div className='flex flex-col lg:flex-row my-5 gap-6'>
                    <div className='w-full lg:w-[45%]'>
                        <h4 className='text-xl font-semibold font-quicksand text-red-700 underline mt-5'>
                            Package Includes:
                        </h4>
                        {packageDetail?.description ? (
                            <div
                                className="prose max-w-none"
                            // dangerouslySetInnerHTML={{ __html: packageDetail.description }}
                            />
                        ) : (
                            <p className="mt-4 text-base font-quicksand">No detailed inclusions provided.</p>
                        )}
                        {/* If 'includes' (parsed from description's <li>) is needed separately: */}
                        {includes.length > 0 && (
                            <div className="flex flex-col md:flex-row gap-8">
                                <ul className="list-disc list-outside pl-5 mt-4 text-base font-quicksand w-full md:w-1/2 space-y-2">
                                    {firstHalf.map((item, idx) => (
                                        <li key={`left-${idx}`}>{item}</li>
                                    ))}
                                </ul>
                                <ul className="list-disc list-outside pl-5 mt-4 text-base font-quicksand w-full md:w-1/2 space-y-2">
                                    {secondHalf.map((item, idx) => (
                                        <li key={`right-${idx}`}>{item}</li>
                                    ))}
                                </ul>
                            </div>


                        )}
                    </div>
                    <div className='w-full lg:w-[45%]'>
                        <FlightForm />
                    </div>
                </div>
            </div>
        </>
    );
}