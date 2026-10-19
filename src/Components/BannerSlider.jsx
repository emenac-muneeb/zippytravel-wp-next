"use client";
import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { BASE_URL_IMG } from '../Helpers/imageurl';
import "swiper/css";

const BannerSlider = ({ images }) => {
    const [activeSlide, setActiveSlide] = useState(0);
    const [swiperInstance, setSwiperInstance] = useState(null);
    const [mounted, setMounted] = useState(false);
    const [swiperReady, setSwiperReady] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!images || images.length === 0) return null;

    const hasMultipleImages = images.length > 1;

    // If only one image, show it directly without the slider
    if (!hasMultipleImages) {
        const img = images[0];
        return (
            <div className="w-full flex items-center overflow-hidden rounded-lg shadow h-auto max-h-[490px] xl:h-[490px]">
                <img
                    src={`${BASE_URL_IMG}/${img.url}`}
                    alt={img.alt || 'Banner'}
                    className="w-full h-auto object-cover"
                    loading="eager"
                />
            </div>
        );
    }

    // Custom CSS to reserve height/style for the static placeholder and hide it when swiper is ready
    const placeholderClass = `w-full flex items-center overflow-hidden rounded-lg shadow h-auto max-h-[490px] xl:h-[490px] ${
        swiperReady ? "invisible absolute inset-0 pointer-events-none" : ""
    }`;

    return (
        <div className="relative w-full">
            {!swiperReady && (
                <div className={placeholderClass}>
                    <img
                        src={`${BASE_URL_IMG}/${images[0].url}`}
                        alt={images[0].alt || 'Banner'}
                        className="w-full h-auto object-cover"
                        loading="eager"
                    />
                </div>
            )}

            {mounted ? (
                <Swiper
                    className={
                        swiperReady
                            ? "banner-stable-swiper relative w-full overflow-hidden rounded-lg shadow"
                            : "banner-stable-swiper absolute inset-0 opacity-0 pointer-events-none rounded-lg shadow"
                    }
                    modules={[Autoplay]}
                    spaceBetween={0}
                    slidesPerView={1}
                    loop={hasMultipleImages}
                    autoplay={
                        hasMultipleImages
                            ? { delay: 3000, disableOnInteraction: false }
                            : false
                    }
                    speed={500}
                    onSwiper={(swiper) => {
                        setSwiperInstance(swiper);
                        requestAnimationFrame(() => setSwiperReady(true));
                    }}
                    onSlideChange={(swiper) => setActiveSlide(swiper.realIndex)}
                >
                    {images.map((img, index) => {
                        return (
                            <SwiperSlide key={index} className="!h-auto flex items-center">
                                <div className="w-full flex items-center overflow-hidden h-auto max-h-[490px] xl:h-[490px]">
                                    <img
                                        src={`${BASE_URL_IMG}/${img.url}`}
                                        alt={img.alt || 'Banner'}
                                        className="w-full h-auto object-cover"
                                        loading={index === 0 ? "eager" : "lazy"}
                                    />
                                </div>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>
            ) : null}

            {hasMultipleImages && swiperReady && (
                <div className="flex justify-center mt-4">
                    {images.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => swiperInstance?.slideToLoop(i)}
                            className={`h-[6px] transition-all duration-300 rounded-full mx-[3px] ${
                                activeSlide === i ? 'w-8 bg-primary' : 'w-3 bg-gray-300'
                            }`}
                            aria-label={`Go to slide ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default BannerSlider;
