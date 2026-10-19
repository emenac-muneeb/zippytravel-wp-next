"use client";
import React from 'react';
import BrandingSection from '../../Components/BrandingSection';
import useGeneralBreadcrumbs from '../../Hooks/useGeneralBreadcrumbs';
import '../../ExternalCSS/staticpages.css';

export default function TermsConditionClient({ initialData: termPage }) {
    const breadcrumbs = useGeneralBreadcrumbs();

    return (
        <div className="container parseData">
            <div className='pt-[87px] sm:pt-[100px] pb-[24px] sm:pb-[32px]'>
                {breadcrumbs}
                <div className="w-full mx-auto lg:mt-[50px] mt-[30px]">
                    <div
                        className="prose max-w-none text-[16px] leading-[28px] custom-quicksand"
                        dangerouslySetInnerHTML={{ __html: termPage?.description || '' }}
                    />
                </div>
            </div>
        </div>
    );
}
