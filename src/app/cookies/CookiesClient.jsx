"use client";
import React from 'react';
import BrandingSection from '../../Components/BrandingSection';
import useGeneralBreadcrumbs from '../../Hooks/useGeneralBreadcrumbs';
import parse from 'html-react-parser';
import '../../ExternalCSS/staticpages.css';

export default function CookiesClient({ initialData: CookiesPage }) {
    const breadcrumbs = useGeneralBreadcrumbs();

    return (
        <div className="container parseData">
            <div className='pt-[87px] sm:pt-[100px] pb-[24px] sm:pb-[32px]'>
                {breadcrumbs}
                <div className="prose max-w-none text-[16px] leading-[28px] custom-quicksand lg:mt-[50px] mt-[30px]">
                    {parse(CookiesPage?.description || "")}
                </div>
            </div>
        </div>
    );
}
