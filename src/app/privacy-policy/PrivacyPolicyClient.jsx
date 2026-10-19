"use client";
import React from 'react';
import BrandingSection from '../../Components/BrandingSection';
import useGeneralBreadcrumbs from '../../Hooks/useGeneralBreadcrumbs';
import '../../ExternalCSS/staticpages.css';

export default function PrivacyPolicyClient({ initialData: privacyPage }) {
    const breadcrumbs = useGeneralBreadcrumbs();

    return (
        <div className="container">
            <div className='pt-[87px] sm:pt-[100px] pb-[24px] sm:pb-[32px]'>
                {breadcrumbs}
                <div className="w-full mx-auto custom-quicksand lg:mt-[50px] mt-[30px] parseData">
                    <h1 className="text-[32px] sm:text-[36px] font-bold text-primary mb-2">
                        {privacyPage?.title || 'Privacy Policy'}
                    </h1>

                    {privacyPage?.description ? (
                        <div
                            className={`
                                mt-2 custom-quicksand
                                [&_h1]:text-[24px] md:[&_h1]:text-[30px] [&_h1]:text-primary [&_h1]:font-bold [&_h1]:mt-6
                                [&_h2]:text-[20px] md:[&_h2]:text-[24px] [&_h2]:text-secondary [&_h2]:font-semibold [&_h2]:mt-4
                                [&_h3]:text-[18px] md:[&_h3]:text-[20px] [&_h3]:text-grayText [&_h3]:mt-3
                                [&_p]:text-sm sm:[&_p]:text-base md:[&_p]:text-[18px] [&_p]:text-black [&_p]:mb-4
                                [&_ul]:list-disc [&_ul]:ml-6 [&_li]:mb-2 [&_strong]:font-semibold [&_br]:block
                            `}
                            dangerouslySetInnerHTML={{ __html: privacyPage.description }}
                        />
                    ) : (
                        <div className="flex justify-center items-center mt-12">
                            <p className="text-primary text-lg font-semibold animate-pulse">
                                 Data is Privacy Policy not found...
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
