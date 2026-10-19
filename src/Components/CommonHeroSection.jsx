// CommonHeroSection.jsx
import React, { useEffect, useState } from 'react';
import CommonEnquiryBox from './CommonEnquiryBox';
import { resolveCommonHeroBannerSrc } from '../Helpers/imageurl';
import Image from 'next/image';

export default function CommonHeroSection({ banners = [], description = "", UmrahTab, formType }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [pageURL, setPageURL] = useState('');

    const handleSlideChange = (index) => {
        setCurrentIndex(index);
    };

    useEffect(() => {
        setPageURL(window.location.href);
        if (banners.length > 1) {
            const interval = setInterval(() => {
                setCurrentIndex(prevIndex =>
                    prevIndex === banners.length - 1 ? 0 : prevIndex + 1
                );
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [banners]);

    return (
        <div className="flex flex-col-reverse lg:flex-row w-full justify-center items-center gap-6 py-4">
            {/* Left Section */}
            <div className="w-full lg:w-[50%] flex flex-col">
                <div
                    className="text-secondary text-sm sm:text-base"
                    dangerouslySetInnerHTML={{ __html: description }}
                />
                <CommonEnquiryBox UmrahTab={UmrahTab} formType={formType} pageURL={pageURL} />
            </div>

            {/* Right Slider Section */}
            <div className="w-full lg:w-[50%] overflow-hidden relative">
                {banners.length > 0 && (
                    <div className="relative w-full flex items-center justify-center">
                        <div className="relative w-full h-[338px] sm:h-[400px] md:h-[600px] lg:h-[490px]">
                            {/* <Image
                                src={resolveCommonHeroBannerSrc(banners[currentIndex].url)}
                                alt={banners[currentIndex].alt || 'Banner'}
                                title={banners[currentIndex].title || ''}
                                fill
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                priority={true}
                                className="object-contain md:object-cover transition-all duration-500 rounded-none md:rounded-3xl"
                            /> */}
                             <img
                                src={resolveCommonHeroBannerSrc(banners[currentIndex].url)}
                                alt={banners[currentIndex].alt || 'Banner'}
                                title={banners[currentIndex].title || ''}
                                width={800}
                                height={490}
                                className="w-full md:w-full object-cover transition-all duration-500 rounded-none md:rounded-3xl
                                h-[338px] sm:h-[400px] md:h-[600px] lg:h-[490px]"
                            />
                        </div>

                        {/* Pills */}
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                            {banners.map((_, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleSlideChange(index)}
                                    className={`h-[6px] cursor-pointer rounded-full transition-all duration-300 ${currentIndex === index
                                        ? 'w-14 bg-white'
                                        : 'w-8 bg-white/60'
                                        }`}
                                ></div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
