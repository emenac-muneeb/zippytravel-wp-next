"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import BrandingSection from './BrandingSection'
import axios from 'axios';
import FlightForm from './EnquiryBox';
import { ImageCarousel } from './ImageCarousel';
import { endpoints } from '../Helpers/endpoints';
import { BASE_URL_IMG } from "../Helpers/imageurl";
import CallbackPopup from './CallbackPopup';
import useUmrahPackageBreadcrumbs from '../Hooks/useUmrahPackageBreadcrumbs';



const StarRating = ({ rating }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;

  for (let i = 0; i < fullStars; i++) {
    stars.push(<span key={i}>★</span>);
  }
  if (halfStar) stars.push(<span key="half">☆</span>);

  return <span className="text-[#FACC15] text-2xl">{stars}</span>;
};

export default function UmrahPackageDetail({ initialData }) {
  const { slug } = useParams();
  const [packageData, setPackageData] = useState(initialData || null);
  const [points, setPoints] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const breadcrumbs = useUmrahPackageBreadcrumbs(packageData?.title);
  console.log("packageData", packageData)
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUrl(window.location.href);
    }
  }, []);

  // Fetch Points
  useEffect(() => {
    axios.get('/api/points')
      .then((res) => {
        let data = res.data;

        if (Array.isArray(data)) {
          setPoints(data);
        } else if (data && typeof data === "object") {
          setPoints(Object.values(data));
        } else if (typeof data === "string") {
        } else {
          setPoints([]);
        }
      })
      .catch((err) => {
        console.error('Error fetching points:', err);
        setPoints([]);
      });
  }, []);

  useEffect(() => {
    if (slug && !initialData) {
      axios.get(`${endpoints.umrahType}?slug=${slug}`)
        .then((res) => {
          if (res.data.status === 1) {
            const packageList = res.data.result;
            setPackageData(packageList);
          }
        })
        .catch((error) => console.error('Error fetching package:', error));
    }
  }, [slug, initialData]);

  // Debug Updated packageData
  useEffect(() => {
    if (packageData) {
      //   console.log("Updated packageData:", packageData);
    }
  }, [packageData]);



  const middleIndex = Math.ceil((points?.length || 0) / 2);
  const firstHalf = Array.isArray(points) ? points.slice(0, middleIndex) : [];
  const secondHalf = Array.isArray(points) ? points.slice(middleIndex) : [];

  const services = [
    { id: 1, name: 'Flight', icon: `${BASE_URL_IMG}/assets/svgs/RFlight.svg` },
    { id: 2, name: 'Accommodation', icon: `${BASE_URL_IMG}/assets/svgs/Accomodation.svg` },
    { id: 3, name: 'Visa', icon: `${BASE_URL_IMG}/assets/svgs/Visa.svg` },
    { id: 4, name: 'Breakfast', icon: `${BASE_URL_IMG}/assets/svgs/BreakFast.svg` },
    { id: 5, name: 'Transfer', icon: `${BASE_URL_IMG}/assets/svgs/Transfer.svg` },
  ];

  const icons = {
    Arrow1: `${BASE_URL_IMG}/assets/svgs/Arrow1.svg`,
    image: "/images/umrah-package-detail.png"
  };

  if (!packageData) return <p className="text-center mt-10">Loading Package Details...</p>;

  const imageUrl = packageData && packageData.image_url
    ? `${BASE_URL_IMG}/${packageData.image_url}`
    : '';

  return (
    <div className='container max-w-[96%] sm:max-w-[80%] mx-auto px-2'>

      <div className='my-3'>
        {breadcrumbs}
      </div>

      <div className='flex flex-col lg:flex-row justify-between gap-6 mt-4'>
        <div className='left w-full lg:w-[45%]'>
          <div className='flex justify-between m-5'>
            <p className='flex items-center gap-2'>{packageData.package_star}-Star
              {/* <img src={`${BASE_URL_IMG}/assets/svgs/3star.svg`} alt="3star" /> */}
              <span>
                <StarRating rating={parseFloat(packageData.package_star)} />
              </span>
            </p>
            <p className='flex items-center gap-2'>{packageData.package_night}-Nights
              <img src={`${BASE_URL_IMG}/assets/svgs/moon.svg`} alt="moon" />
            </p>
          </div>
          <hr className='border-1 border-gray-300 my-6' />
          <h1 className="text-3xl font-medium font-quicksand mb-7 h3-black">
            {packageData.title}
          </h1>
          <div className='flex flex-wrap sm:flex-nowrap mb-5 no-scrollbar justify-between gap-1'>
            {services.map((service) => (
              <div key={service.id} className='flex flex-col items-center justify-center min-w-[70px] shrink-0 text-center'>
                <img src={service.icon} alt={service.name} className="h-14 w-14 object-contain mb-1" />
                <p className="text-sm">{service.name}</p>
              </div>
            ))}
          </div>
          {packageData.package_description && (
            <>
              <h2 className='text-xl font-medium font-quicksand mt-4'>Short Description!</h2>
              <p className='text-base font-quicksand mb-5' dangerouslySetInnerHTML={{ __html: packageData.package_description }}></p>
            </>
          )}

          <div className='flex flex-col sm:flex-row justify-between gap-6'>
            <div onClick={() => setShowPopup(true)}>
              <button className="text-red-600 font-bold text-base hover:underline flex items-center gap-2 mt-4">
                Request Call Back <img src={icons.Arrow1} alt="ArrowUp" />
              </button>
              <p className='text-sm'>Too Busy to Dial a Call?</p>
            </div>
            <div>
              <span className='font-medium text-xl'>Fr </span>
              <span className='font-bold text-3xl'>£{packageData.price}</span>
              <p className='pl-4'>per person</p>
            </div>
            <div>
              <a href="tel:02070434343">
                <button className="text-red-600 font-bold text-base hover:underline flex items-center gap-2 mt-4">
                  Call Us Now <img src={icons.Arrow1} alt="ArrowUp" />
                </button>
                <p className='text-sm text-black'>0207-043-4343</p>
              </a>
            </div>
          </div>
        </div>

        <div className="right w-full lg:w-[45%] flex justify-center items-center">
          <ImageCarousel images={Array.isArray(packageData.images) ? packageData.images : []} />
          {/* <img
            src={image}
            alt={packageData?.image_alt || packageData?.browser_title}
          // className="max-w-full md:max-h-[500px] object-scale-down"
          /> */}
        </div>
      </div>

      <div className="mt-10">
        <BrandingSection />
      </div>

      <div className='flex flex-col my-6'>
        <h2 className='text-xl font-semibold font-quicksand text-red-700'>
          {packageData.makkah_hotel.name} ({packageData.makkah_hotel.city} Hotel) :
        </h2>
        <div className='flex justify-between mt-3'>
          <p className='flex items-center gap-2'>{packageData.makkah_hotel.hotel_star}-Star
            <span>
              <StarRating rating={parseFloat(packageData.makkah_hotel.hotel_star)} />
            </span>
          </p>
          <p className='flex items-center gap-2'>{packageData.makkah_night}-Nights
            <img src={`${BASE_URL_IMG}/assets/svgs/moon.svg`} alt="moon" />
          </p>
          <p className=''>
          </p>
          <p className=''>
          </p>
        </div>
        <p className='text-base font-quicksand mt-2' dangerouslySetInnerHTML={{ __html: packageData.makkah_hotel.description }}>
        </p>
        <br />
        <h2 className='text-xl font-semibold font-quicksand text-red-700'>
          {packageData.madinah_hotel.name} ({packageData.madinah_hotel.city} Hotel) :
        </h2>
        <div className='flex justify-between mt-3'>
          <p className='flex items-center gap-2'>{packageData.madinah_hotel.hotel_star}-Star
            <span>
              <StarRating rating={parseFloat(packageData.madinah_hotel.hotel_star)} />
            </span>
          </p>
          <p className='flex items-center gap-2'>{packageData.madinah_night}-Nights
            <img src={`${BASE_URL_IMG}/assets/svgs/moon.svg`} alt="moon" />
          </p>
          <p className=''>
          </p>
          <p className=''>
          </p>
        </div>
        <p className='text-base font-quicksand mt-2'
          dangerouslySetInnerHTML={{ __html: packageData.madinah_hotel.description }}>
        </p>
      </div>

      <div className='flex flex-col xl:flex-row my-5 gap-3'>
        <div className='w-full xl:w-[45%]'>
          <h2 className='text-xl font-semibold font-quicksand text-red-700 underline mb-3'>
            Package Includes:
          </h2>
          <div className="text-base font-quicksand">
            <style>
              {`
      .custom-bullets li::marker {
        color: #A57233;
      }
    `}
            </style>
            <div
              dangerouslySetInnerHTML={{
                __html: packageData?.description?.replace(
                  "<ul>",
                  '<ul class="list-disc list-inside grid sm:grid-cols-2 gap-x-4 gap-y-2 custom-bullets">'
                ),
              }}
            />
          </div>

          <div className='flex flex-wrap'>
            <ul className="list-disc list-inside grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(Array.isArray(firstHalf) ? firstHalf : []).map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
            <ul className="list-disc list-inside grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(Array.isArray(secondHalf) ? secondHalf : []).map((point, index) => (
                <li key={index + middleIndex}>{point}</li>
              ))}
            </ul>
          </div>

        </div>
        <div className='w-full xl:w-[55%]'>
          <FlightForm formType="umrah detail page" url={url} />
        </div>
      </div>

      {showPopup && (
        <CallbackPopup
          show={showPopup}
          onClose={() => setShowPopup(false)}
          phone="0207-043-4343"
          whatsapp="442070434343"
        />
      )}

    </div>
  );
}
