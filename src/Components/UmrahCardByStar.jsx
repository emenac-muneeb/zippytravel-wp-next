"use client";
import React, { useEffect, useState } from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { endpoints } from '../Helpers/endpoints';
import { BASE_URL_IMG } from "../Helpers/imageurl";
import Link from 'next/link';

const StarRating = ({ rating }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 0; i < fullStars; i++) {
    stars.push(<FaStar key={`full-${i}`} className="text-[#FACC15] text-sm" />);
  }

  if (hasHalfStar) {
    stars.push(<FaStarHalfAlt key="half" className="text-[#FACC15] text-sm" />);
  }

  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<FaRegStar key={`empty-${i}`} className="text-[#FACC15] text-sm" />);
  }

  return <div className="flex gap-1">{stars}</div>;
};

export default function UmrahCardByStar({
  minStar = 1,
  maxStar = 5,
  customPackages,
  allowedPackageIds,
  UmrahResponse,
  setUmrahResponse
}) {
  const [packages, setPackages] = useState([]);

  const swiperId = `star-${minStar}`;
  const prevClass = `custom-swiper-prev-${swiperId}`;
  const nextClass = `custom-swiper-next-${swiperId}`;

  useEffect(() => {
    if (!customPackages) return;

    const allPackages = Array.isArray(customPackages)
      ? customPackages
      : Object.values(customPackages || {}).flat();

    const allowedSet =
      Array.isArray(allowedPackageIds) && allowedPackageIds.length
        ? new Set(allowedPackageIds.map((x) => Number(x)))
        : null;

    const filtered = allPackages.filter((pkg) => {
      const star = parseFloat(pkg.package_star || pkg.stars || 0);
      const starOk = star >= minStar && star <= maxStar;
      if (!starOk) return false;

      if (!allowedSet) return true;
      return allowedSet.has(Number(pkg.id));
    });

    setPackages(filtered);
  }, [customPackages, allowedPackageIds, minStar, maxStar]);

  return (
    <div id={`umrah-star-segment-${minStar}`} className="py-8 bg-gray-100 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Navigation Arrows */}
        <div className="flex justify-end items-center mb-4 gap-3">
          <button className={`${prevClass} bg-[#F1A868] rounded-md flex items-center px-4 py-3 hover:bg-[#b00620] transition-colors shadow-sm cursor-pointer z-10`} aria-label="Previous">
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="11" viewBox="0 0 25 11">
              <path d="M24.583,5.579a1.2,1.2,0,0,1-.284.5.96.96,0,0,1-.591.262c-.074.006-.15.005-.224.005H2.867a.5.5,0,0,0,.072.05,2.177,2.177,0,0,1,.718.5Q4.844,8.081,6.034,9.263a.935.935,0,0,1,.287,1,.889.889,0,0,1-1.374.423,1.715,1.715,0,0,1-.168-.147L.325,6.121A.9.9,0,0,1,.132,4.965a1.163,1.163,0,0,1,.187-.23Q2.553,2.516,4.79.3A.917.917,0,0,1,6.167.323a.921.921,0,0,1-.008,1.154c-.047.057-.1.111-.153.163q-1,.993-2,1.985A3.156,3.156,0,0,1,2.89,4.5l.009.031H3.04c2.907,0,17.621,0,20.528,0a.927.927,0,0,1,.811.349,2.458,2.458,0,0,1,.2.428v.272" transform="translate(0.527 0.459)" fill="#fff" />
            </svg>
          </button>
          <button className={`${nextClass} bg-[#F1A868] rounded-md flex items-center px-4 py-3 hover:bg-[#b00620] transition-colors shadow-sm cursor-pointer z-10`} aria-label="Next">
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="11" viewBox="0 0 25 11">
              <path d="M0,5.579a1.2,1.2,0,0,0,.284.5.96.96,0,0,0,.591.262c.074.006.15.005.224.005H21.716a.5.5,0,0,1-.072.05,2.177,2.177,0,0,0-.718.5q-1.187,1.185-2.378,2.366a.935.935,0,0,0-.287,1,.889.889,0,0,0,1.374.423,1.715,1.715,0,0,0,.168-.147l4.455-4.417a.9.9,0,0,0,.193-1.157,1.163,1.163,0,0,0-.187-.23Q22.03,2.516,19.793.3a.917.917,0,0,0-1.376.024.921.921,0,0,0,.008,1.154c.047.057.1.111.153.163q1,.993,2,1.985a3.156,3.156,0,0,0,1.113.875l-.009.031h-.141c-2.907,0-17.621,0-20.528,0A.927.927,0,0,0,.2,4.879a2.458,2.458,0,0,0-.2.428v.272" transform="translate(0.527 0.459)" fill="#fff" />
            </svg>
          </button>
        </div>

        {/* Swiper */}
        <Swiper
          modules={[Navigation]}
          spaceBetween={20}
          slidesPerView={1}
          navigation={{
            nextEl: `.${nextClass}`,
            prevEl: `.${prevClass}`,
          }}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 },
          }}
          className="h-full"
        >
          {packages.map((pkg, index) => (
            <SwiperSlide key={index} className="h-full">
              <Link href={`/umrah/${pkg.page_url || pkg.slug}`}>
                <div
                  className="bg-white cursor-pointer shadow-md rounded-tl-[50%] rounded-tr-[50%] transition-transform duration-300 ease-in-out "
                >
                  {/* Image */}
                  <div className="w-full aspect-[1/1] relative rounded-tl-[50%] rounded-tr-[50%] overflow-hidden">
                    <img
                      src={(pkg.image_url || pkg.package_image_url) ? `${BASE_URL_IMG}/media/${pkg.image_url || pkg.package_image_url}` : `${BASE_URL_IMG}/frontend-icons/footer-background.png`}
                      alt={pkg.title}
                      className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                      onError={(e) => { e.target.src = `${BASE_URL_IMG}/frontend-icons/footer-background.png`; }}
                    />
                    <div className="absolute bottom-2 left-1/2 -track-x-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/10 backdrop-blur-sm">
                      <StarRating rating={parseFloat(pkg.package_star || pkg.stars || 0)} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-grow">
                    <p className="text-[16px] font-bold text-center mb-1 line-clamp-2">
                      <span className="text-black group-hover:text-[#F1A868] transition-colors">
                        {pkg.title}
                      </span>
                    </p>

                    <hr className="my-3" />

                    <div className="flex items-center justify-between">
                      <div className="text-[16px] px-4 py-2 text-[#F1A868]">
                        Fr <span className="font-bold text-[18px]">£{pkg.price}</span>
                      </div>
                      <div className="text-[16px] hover:underline flex items-center gap-1 font-semibold text-[#F1A868]">
                        Package Details
                        <img src={`${BASE_URL_IMG}/assets/svgs/Arrow1.svg`} alt="arrow right" className="w-2 h-2" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
