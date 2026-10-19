"use client";
import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { endpoints } from "../Helpers/endpoints";
import { BASE_URL_IMG } from "../Helpers/imageurl";
import axios from "axios";
import ReviewCard from "./ReviewCard";
import { TestimonialsCarouselSkeleton } from "./common/Skeleton";
import "swiper/css";
import "swiper/css/pagination";

const BREAKPOINTS = {
  640: { slidesPerView: 2, spaceBetween: 20 },
  1024: { slidesPerView: 3, spaceBetween: 24 },
  1280: { slidesPerView: 4, spaceBetween: 24 },
};

export default function Testimonials({
  heading = "",
  subheading = "",
  initialReviews = [],
}) {
  const hasInitial = Array.isArray(initialReviews) && initialReviews.length > 0;
  const [mounted, setMounted] = useState(false);
  const [reviews, setReviews] = useState(hasInitial ? initialReviews : []);
  const [loading, setLoading] = useState(!hasInitial);

  useEffect(() => {
    setMounted(true);

    if (hasInitial) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const fetchReviews = async () => {
      try {
        const res = await axios.get(endpoints.reviews);
        if (cancelled) return;
        if (res.data.status === 1) {
          setReviews(Array.isArray(res.data.result) ? res.data.result : []);
        } else {
          setReviews([]);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to fetch reviews:", error);
          setReviews([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchReviews();
    return () => {
      cancelled = true;
    };
  }, [hasInitial]);

  const enableLoop = reviews.length > 4;
  // Keep skeleton until client mount (Swiper) AND fetch done — avoids empty gap CLS
  const showSkeleton = !mounted || loading;
  const showCarousel = mounted && !loading && reviews.length > 0;

  return (
    <div className="py-[15px] sm:py-[25px]">
      <div
        className="pt-[50px] relative before:content-[''] before:absolute before:top-0 before:left-0 
      before:w-full min-[1400px]:before:w-[1060px] before:h-[442px] before:bg-[#FFF6EC] before:rounded-[40px]"
      >
        <div className="container">
          <div className="heading_section max-w-[800px]">
            <h2 className="pre_heading">{heading}</h2>
            <p className="sub_text">{subheading}</p>
          </div>
        </div>
        <div className="relative w-full testimonials-swiper-container min-h-[430px]">
          <style>{`
            .testimonials-swiper-container {
              padding-left: 76px;
              padding-right: 76px;
            }
            @media (max-width: 768px) {
              .testimonials-swiper-container {
                padding-left: 20px;
                padding-right: 20px;
              }
            }
            .testimonials-card-wrapper {
              width: 100%;
              max-width: 350px;
              margin-left: auto;
              margin-right: auto;
            }
            @media (min-width: 640px) {
              .testimonials-card-wrapper {
                max-width: none;
              }
            }
            .testimonials-swiper {
              padding-top: 70px !important;
              padding-bottom: 60px !important;
              overflow: hidden;
              min-height: 430px;
            }
            .testimonials-swiper .swiper-wrapper {
              align-items: stretch;
            }
            .testimonials-swiper .swiper-slide {
              height: auto;
              box-sizing: border-box;
            }
            .testimonials-swiper .swiper-pagination {
              bottom: 8px !important;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
            }
            .testimonials-swiper .swiper-pagination-bullet {
              width: 22px !important;
              height: 28px !important;
              border-radius: 12px !important;
              border: 1px solid #d67938 !important;
              background-color: transparent !important;
              opacity: 1 !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              margin: 0 !important;
              color: #d67938 !important;
              transition: all 0.3s ease !important;
            }
            .testimonials-swiper .swiper-pagination-bullet-active {
              background-color: #d67938 !important;
              color: white !important;
            }
          `}</style>

          {showSkeleton && <TestimonialsCarouselSkeleton />}

          {showCarousel && (
            <Swiper
              className="testimonials-swiper"
              modules={[Pagination]}
              spaceBetween={0}
              slidesPerView={1}
              centeredSlides={false}
              loop={enableLoop}
              watchOverflow
              observer
              observeParents
              breakpoints={BREAKPOINTS}
              pagination={{
                clickable: true,
                renderBullet: (index, className) =>
                  `<span class="${className}">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.5 9.5L9.5 2.5M2.5 6L6 2.5M6 9.5L9.5 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                  </span>`,
              }}
            >
              {reviews.map((t, index) => {
                const reviewData = {
                  id: t.id,
                  name: t.publisher,
                  rating: parseFloat(t.rating),
                  image: t.image_url
                    ? `${BASE_URL_IMG}/media/${t.image_url}`
                    : "/images/Icons/istockphoto-1460836430-612x612.png",
                  text: t.review,
                };
                return (
                  <SwiperSlide key={t.id || index}>
                    <div className="testimonials-card-wrapper h-full transition-all duration-300 translate-y-[0px] hover:translate-y-[-12px] hover:shadow-lg hover:shadow-gray-300">
                      <ReviewCard review={reviewData} priority={index < 4} />
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          )}
        </div>
      </div>
    </div>
  );
}
