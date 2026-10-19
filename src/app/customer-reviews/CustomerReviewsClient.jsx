"use client";
import React from 'react';
import BrandingSection from '../../Components/BrandingSection';
import ReviewSection from '../../Components/ReviewsSection';
import useGeneralBreadcrumbs from '../../Hooks/useGeneralBreadcrumbs';
import { BASE_URL_IMG } from '../../Helpers/imageurl';

export default function CustomerReviewsClient({ initialData }) {
    const breadcrumbs = useGeneralBreadcrumbs();
    const reviewPage = initialData;



    return (
        <div className="container">
            <div className='pt-[87px] sm:pt-[100px] pb-[24px] sm:pb-[32px]'>
                {breadcrumbs}
                <div className="w-full mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 py-4">
                        <div>
                            <h2 className="text-lg font-semibold text-secondary mb-1">What Our</h2>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#F1A868] leading-snug">
                                Client Says About Us
                            </h1>
                            <p className="text-sm sm:text-base md:text-lg mt-3 text-gray-700 leading-relaxed">
                                Travellers always look for comfort on their air trips to the places. Emenac Travel comforts customers over their budgets.
                            </p>
                        </div>

                        {reviewPage?.banner_img?.[0]?.url && (
                            <div className="w-full max-w-md mx-auto md:mx-0">
                                <img
                                    src={`${BASE_URL_IMG}/${reviewPage.banner_img[0].url.trim().replace(/\s/g, '').replace(/\.p$/, '.png')}`}
                                    alt={reviewPage.banner_img[0]?.alt || 'Reviews'}
                                    className="w-full h-auto rounded-lg shadow-lg"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <BrandingSection />

                <div className="w-full mx-auto py-4">
                    <ReviewSection />
                </div>
            </div>
        </div>
    );
}
