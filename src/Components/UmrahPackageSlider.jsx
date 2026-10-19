"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { endpoints } from '../Helpers/endpoints';
import { BASE_URL_IMG } from "../Helpers/imageurl";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const StarRating = ({ rating }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;

  for (let i = 0; i < fullStars; i++) {
    stars.push(<span key={i}>★</span>);
  }
  if (halfStar) stars.push(<span key="half">☆</span>);

  return <span className="text-[#FACC15] ml-2 text-2xl">{stars}</span>;
};

export default function UmrahPackageSlider({ heading = '', subheading = '', umrahTypeId, link, Title }) {

  const router = useRouter();
  const [packages, setPackages] = useState([]);
  const [UmrahResponse, setUmrahResponse] = useState(null);
  // console.log("umrahTypeId", umrahTypeId)
  // console.log("Packages", packages)

  useEffect(() => {
    const url = umrahTypeId
      ? `${endpoints.umrahType}?umrah_type_id=${umrahTypeId}`
      : endpoints.umrahType;

    axios.get(url)
      .then((res) => {
        setUmrahResponse(res?.data);
        if (res.data.status === 1) {
          setPackages(res.data.result);
        }
      })
      .catch((err) => console.error('Failed to fetch packages:', err));
  }, [umrahTypeId]);

  return (
    <div id="umrah-package-slider" className="py-8 bg-gray-100">
      <div className="container mx-auto px-4">
        {(heading || subheading) && (
          <div className="text-center mb-6">
            {heading && <h2 className="text-2xl font-bold mb-2">{heading}</h2>}
            {subheading && <p className="text-gray-600">{subheading}</p>}
          </div>
        )}
        <div className='flex items-center justify-between  mb-6'>
          <div className="flex gap-2">
            <button
              className="custom-swiper-prev bg-[#F1A868] rounded-md flex items-center px-4 py-3"
              aria-label="Previous"
            >
              <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="25" height="11" viewBox="0 0 25 11">
                <defs>
                  <clipPath id="clip-path">
                    <rect id="Rectangle_6" data-name="Rectangle 6" width="25" height="11" transform="translate(0.299 0.402)" fill="#fff" />
                  </clipPath>
                </defs>
                <g id="Group_1" data-name="Group 1" transform="translate(-0.299 -0.402)" clip-path="url(#clip-path)">
                  <path id="Path_1" data-name="Path 1" d="M24.583,5.579a1.2,1.2,0,0,1-.284.5.96.96,0,0,1-.591.262c-.074.006-.15.005-.224.005H2.867a.5.5,0,0,0,.072.05,2.177,2.177,0,0,1,.718.5Q4.844,8.081,6.034,9.263a.935.935,0,0,1,.287,1,.889.889,0,0,1-1.374.423,1.715,1.715,0,0,1-.168-.147L.325,6.121A.9.9,0,0,1,.132,4.965a1.163,1.163,0,0,1,.187-.23Q2.553,2.516,4.79.3A.917.917,0,0,1,6.167.323a.921.921,0,0,1-.008,1.154c-.047.057-.1.111-.153.163q-1,.993-2,1.985A3.156,3.156,0,0,1,2.89,4.5l.009.031H3.04c2.907,0,17.621,0,20.528,0a.927.927,0,0,1,.811.349,2.458,2.458,0,0,1,.2.428v.272" transform="translate(0.527 0.459)" fill="#fff" />
                </g>
              </svg>
            </button>
            <button
              className="custom-swiper-next bg-[#F1A868] rounded-md flex items-center px-4 py-1"
              aria-label="Next"
            >
              <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="25" height="11" viewBox="0 0 25 11">
                <defs>
                  <clipPath id="clip-path">
                    <rect id="Rectangle_6" data-name="Rectangle 6" width="25" height="11" transform="translate(0.338 0.402)" fill="#fff" />
                  </clipPath>
                </defs>
                <g id="Group_77" data-name="Group 77" transform="translate(-0.338 -0.402)">
                  <g id="Group_1" data-name="Group 1" transform="translate(0)" clip-path="url(#clip-path)">
                    <path id="Path_1" data-name="Path 1" d="M0,5.579a1.2,1.2,0,0,0,.284.5.96.96,0,0,0,.591.262c.074.006.15.005.224.005H21.716a.5.5,0,0,1-.072.05,2.177,2.177,0,0,0-.718.5q-1.187,1.185-2.378,2.366a.935.935,0,0,0-.287,1,.889.889,0,0,0,1.374.423,1.715,1.715,0,0,0,.168-.147l4.455-4.417a.9.9,0,0,0,.193-1.157,1.163,1.163,0,0,0-.187-.23Q22.03,2.516,19.793.3a.917.917,0,0,0-1.376.024.921.921,0,0,0,.008,1.154c.047.057.1.111.153.163q1,.993,2,1.985a3.156,3.156,0,0,0,1.113.875l-.009.031h-.141c-2.907,0-17.621,0-20.528,0A.927.927,0,0,0,.2,4.879a2.458,2.458,0,0,0-.2.428v.272" transform="translate(0.527 0.459)" fill="#fff" />
                  </g>
                </g>
              </svg>
            </button>
          </div>
          <div className='flex'>
            <Link
              href={link}
              className="flex items-center cursor-pointer"
            >
              <button className="text-[20px] font-bold text-[#F1A868] mr-2 underline">
                {Title}
              </button>
              <img src={`${BASE_URL_IMG}/assets/svgs/Arrow1.svg`} alt="Arrow" />
            </Link>
          </div>
        </div>
        <Swiper
          modules={[Navigation]}
          spaceBetween={20}
          slidesPerView={1}
          navigation={{
            nextEl: '.custom-swiper-next',
            prevEl: '.custom-swiper-prev',
          }}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 },
          }}
        >
          {Object.values(packages || {}).flat().map((pkg, index) => (
            <SwiperSlide key={index}>
              <Link href={`/umrah/${pkg.page_url}`} passHref legacyBehavior>
                {/* <div
                  // onClick={(e) => {
                  //   e.preventDefault();
                  //   // navigate(`/umrah/${pkg.page_url}`,
                  //   // {
                  //   //   state: {
                  //   //     UmrahResponse: UmrahResponse,
                  //   //   }
                  //   // });
                  // }}
                  className="cursor-pointer bg-white rounded-tl-[50%] rounded-tr-[50%] transition-transform duration-300 ease-in-out hover:-translate-y-[25px] shadow-md h-full flex flex-col justify-between">
                  <div className="w-full aspect-[1/1] rounded-tl-[50%] rounded-tr-[50%] overflow-hidden">
                    <div
                      className="w-full h-full bg-center bg-cover"
                      style={{
                        backgroundImage: `url(${BASE_URL_IMG}/media/${pkg.image_url})`,
                      }}
                    />
                  </div>

                  <div className="p-4 flex flex-col justify-between flex-grow">
                    <div className="grid min-h-[5px] w-full place-items-center overflow-x-scroll rounded-lg lg:overflow-visible mb-2">
                      <div className="inline-flex items-center">
                        <span>
                          <StarRating rating={parseFloat(pkg.package_star)} />
                        </span>
                      </div>
                    </div>

                    <p className="text-[16px] font-bold text-center text-black mb-2">
                      {pkg.title}
                    </p>

                    <hr className="mb-3" />

                    <div className="flex justify-between items-center">
                      <div className="text-[16px] px-4 py-2">
                        Fr <span className="font-bold text-[18px]">£{pkg.price}</span>
                      </div>

                      <div className="text-sm font-bold">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(`/umrah/${pkg.page_url}`, {
                              state: {
                                umrah_package_id: pkg.id,
                                UmrahResponse: UmrahResponse,
                              },
                            });
                          }}
                          className="hover:underline flex items-center gap-1"
                        >
                          View All Fares
                          <img src={`${BASE_URL_IMG}/assets/svgs/Arrow1.svg`} alt="arrow right" />
                        </button>

                      </div>
                    </div>
                  </div>
                </div> */}
                <div
                  className="bg-white cursor-pointer shadow-md rounded-tl-[50%] rounded-tr-[50%] transition-transform duration-300 ease-in-out hover:-translate-y-2 flex flex-col justify-between h-full min-h-[420px]"
                >
                  {/* Image */}
                  <div className="w-full aspect-[1/1] relative rounded-tl-[50%] rounded-tr-[50%] overflow-hidden">
                    <div
                      className="w-full h-full bg-center bg-cover"
                      style={{
                        backgroundImage: `url(${BASE_URL_IMG}/media/${pkg.image_url})`,
                      }}
                    />
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full">
                      <StarRating rating={parseFloat(pkg.package_star)} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-grow">
                    <p className="text-[16px] font-bold text-center mb-1 line-clamp-2">
                      <a href={pkg.page_url} className="text-black  hover:text-black">
                        {pkg.title}
                      </a>
                    </p>

                    <hr className="my-3" />

                    <div className="flex items-center justify-between">
                      <div className="text-[16px] px-4 py-2">
                        Fr <span className="font-bold text-[18px]">£{pkg.price}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/umrah/${pkg.page_url}`,
                            {
                              state: {
                                UmrahResponse: UmrahResponse,
                              }
                            }
                          );
                        }}
                        className="text-[16px] hover:underline flex items-center gap-1 font-semibold"
                      >
                        Package Details
                        <img src={`${BASE_URL_IMG}/assets/svgs/Arrow1.svg`} alt="arrow right" />
                      </button>
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
