"use client";
import React from 'react';
import BrandingSection from '../../Components/BrandingSection';
import AffordableTourSection from '../../Components/AffordableTourSection';
import Testimonials from '../../Components/Testimonials';
import { BASE_URL_IMG } from '../../Helpers/imageurl';
import useGeneralBreadcrumbs from '../../Hooks/useGeneralBreadcrumbs';
import StaticBanner from '../../Components/StaticBanner';
import AboutUSWhyChoose from '../../Components/AboutUSWhyChoose';
import BannerInner from '../../Components/BannerInner';

export default function AboutUsClient({ initialData: aboutPage }) {
    const breadcrumbs = useGeneralBreadcrumbs();
    const pageData = aboutPage?.pageData ?? {};
    const ourclientsays_widget = pageData?.ourclientsays_widget ?? [];
    const cheapfares_widget = pageData?.cheapfares_widget ?? [];
    const companyStatement = pageData?.company_statement || "";
    const missionStatement = pageData?.mission_statement || "";

    return (
        <>
            {/* <BannerInner
                initialBanners={[]}
                bgImageOverride={pageData?.banner_img?.[0]?.url}
                showClassSelector={false}
            /> */}
            <StaticBanner
                titleOverride={pageData?.title}
                descriptionOverride={pageData?.banner_description}
                initialBanners={pageData?.banner_img?.[0]?.url}
            />
            <div className="w-full mx-auto py-[50px]">
                <div className='w-full mx-auto'>
                    {/* Company Background & Mission Statement Section */}
                    <div className="w-full container mx-auto px-4 py-10 mt-[53px]">

                        <div className="section_heading heading_section mb-8">
                            <h2 className="pre_heading">
                                {cheapfares_widget[0]?.heading }
                            </h2>
                            <p className="sub_text">
                                {cheapfares_widget[0]?.sub_heading}
                            </p>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-stretch">
                            {/* Left Card: Company Background */}
                            <div className="lg:col-span-7 bg-white rounded-[28px] sm:rounded-[36px] shadow-[0_0_14px_7px_rgba(0,0,0,0.12)] border border-gray-100 relative pt-10 pb-8 px-6 sm:px-10 flex flex-col items-center text-center">
                                {/* Floating Badge */}
                                <div className="text-center">
                                    <div className="bg-[#EB9448] text-white font-bold text-sm sm:text-base md:text-[17px] tracking-wider uppercase py-2.5 px-8 sm:px-12 rounded-[18px] shadow-[0_0_14px_13px_rgba(0,0,0,0.12)] whitespace-nowrap">
                                        Company Background
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="flex items-center justify-center my-4 w-32 sm:w-40">
                                    <div className="h-[1px] bg-[#E0B892] flex-1"></div>
                                    <div className="w-2.5 h-2.5 rounded-full border border-[#E0B892] bg-white mx-1.5 flex-shrink-0"></div>
                                    <div className="h-[1px] bg-[#E0B892] flex-1"></div>
                                </div>

                                {/* Content from API company_statement */}
                                {companyStatement ? (
                                    <div
                                        className="text-[#555555] text-xs sm:text-sm md:text-[14.5px] leading-relaxed font-normal text-center max-w-3xl [&_p]:mb-0 [&_span]:text-inherit"
                                        dangerouslySetInnerHTML={{ __html: companyStatement }}
                                    />
                                ) : null}
                            </div>

                            {/* Right Card: Mission Statement */}
                            <div className="lg:col-span-5 bg-white rounded-[28px] sm:rounded-[36px] shadow-[0_0_14px_7px_rgba(0,0,0,0.12)] border border-gray-100 relative pt-10 pb-8 px-6 sm:px-8 flex flex-col items-center text-center">
                                {/* Floating Badge */}
                                <div className="text-center">
                                    <div className="bg-[#EB9448] text-white font-bold text-sm sm:text-base md:text-[17px] tracking-wider uppercase py-2.5 px-8 sm:px-10 rounded-[18px] shadow-[0_0_14px_13px_rgba(0,0,0,0.12)] whitespace-nowrap">
                                        Mission Statement
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="flex items-center justify-center my-4 w-32 sm:w-40">
                                    <div className="h-[1px] bg-[#E0B892] flex-1"></div>
                                    <div className="w-2.5 h-2.5 rounded-full border border-[#E0B892] bg-white mx-1.5 flex-shrink-0"></div>
                                    <div className="h-[1px] bg-[#E0B892] flex-1"></div>
                                </div>

                                {/* Content from API mission_statement */}
                                {missionStatement ? (
                                    <div
                                        className="text-center max-w-3xl
                                            [&_h3]:text-[#333333] [&_h3]:text-sm sm:[&_h3]:text-base md:[&_h3]:text-[17px] [&_h3]:font-semibold [&_h3]:tracking-wider [&_h3]:uppercase [&_h3]:mb-3
                                            [&_p]:text-[#555555] [&_p]:text-xs sm:[&_p]:text-sm md:[&_p]:text-[14.5px] [&_p]:leading-relaxed [&_p]:font-normal [&_p]:mb-0"
                                        dangerouslySetInnerHTML={{ __html: missionStatement }}
                                    />
                                ) : null}
                            </div>
                        </div>
                        <div className='details_section pt-[50px]'>
                            {pageData?.description ? (
                                    <div
                                        className={`
                                            font-medium custom-quicksand
                                            [&_h1]:text-[24px] md:[&_h1]:text-[30px] [&_h1]:text-primary [&_h1]:font-bold [&_h1]:mt-6
                                            [&_h2]:text-[20px] md:[&_h2]:text-[24px] [&_h2]:text-secondary [&_h2]:font-semibold [&_h2]:mt-4
                                            [&_p]:text-sm md:[&_p]:text-[18px] [&_p]:text-gray-700 [&_p]:mb-4
                                            [&_ul]:list-disc [&_ul]:ml-6 [&_li]:mb-2 [&_strong]:font-semibold
                                        `}
                                        dangerouslySetInnerHTML={{ __html: pageData.description }}
                                    />
                                ) : (
                                    <div className="flex justify-center items-center mt-12">
                                        <p className="text-primary text-lg font-semibold animate-pulse">
                                            ⏳ Loading About Us content...
                                        </p>
                                    </div>
                            )}
                        </div>
                    </div>
                    <div className='py-3'>
                        <AffordableTourSection />
                    </div>

                    <AboutUSWhyChoose />

                    {/* Discounted Offer For Business Class Banner */}


                    <Testimonials
                        heading={ourclientsays_widget[0]?.heading}
                        subheading={ourclientsays_widget[0]?.sub_heading}
                    />
                    <div className="w-full container mx-auto px-4 my-10">
                        <div className="relative w-full rounded-[24px] sm:rounded-[32px] md:rounded-[36px] overflow-hidden shadow-xl min-h-[220px] sm:min-h-[280px] md:min-h-[378px] flex items-end p-6 sm:p-10 md:pl-[90px] md:pb-[30px] border border-gray-100">
                            {/* Background Image */}
                            <img
                                src="/Qatar-Airways.png"
                                alt="Discounted Offer For Business Class"
                                className="absolute inset-0 w-full h-full object-cover z-0"
                            />

                            {/* Dark Gradient Overlay for optimal text readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent z-1" />

                            {/* Text Content */}
                            <div className="relative z-10 text-left text-white">
                                <h2 className="text-[60px] font-semibold leading-[68px] text-white tracking-wide">
                                    Discounted Offer
                                </h2>
                                <p className="text-[40px] font-semibold leading-[68px] text-white/90 mt-1">
                                    FOR BUSINESS CLASS
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

