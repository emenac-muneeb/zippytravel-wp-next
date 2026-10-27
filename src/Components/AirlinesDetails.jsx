"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import CommonHeroSection from './CommonHeroSection';
import BrandingSection from './BrandingSection';
import EnquiryModal from './EnquiryModal';
import { BASE_URL_IMG } from '../Helpers/imageurl';
import { endpoints } from '../Helpers/endpoints';
import { formatDate, formdataProvider } from '../utils/formDataProvider';
import ScrollDetail from './ScrollDetail';
import useAirlineBreadcrumbs from '../Hooks/useAirlineBreadcrumbs';
import FaqSection from './FaqSection';
import NotFound from "../Not-found";
import NotFound from "../Not-found";


export default function AirlinesDetails() {
  const { airlineSlug } = useParams();
  const [airlineData, setAirlineData] = useState(null);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);
  const [loading, setLoading] = useState(true);
  // console.log("airlineData", airlineData)

  const breadcrumbs = useAirlineBreadcrumbs();

  const handleEnquiryClick = (fare) => {
    localStorage.setItem("flightFormData", JSON.stringify(formdataProvider(fare)));
    setShowEnquiryModal(true);
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(endpoints.airlineDetails(airlineSlug));
        if (res.data?.status === 1 && res.data.result) {
          const result = res.data.result;

          // document.title = result.browser_title || result.title;

          // // --- SEO META SETUP ---
          // if (result.meta_description) {
          //   const desc = document.querySelector('meta[name="description"]') || document.createElement("meta");
          //   desc.setAttribute("name", "description");
          //   desc.setAttribute("content", result.meta_description || "");
          //   if (!desc.parentNode) document.head.appendChild(desc);
          // }

          // if (result.meta_keywords) {
          //   const keywords = document.querySelector('meta[name="keywords"]') || document.createElement("meta");
          //   keywords.setAttribute("name", "keywords");
          //   keywords.setAttribute("content", result.meta_keywords);
          //   if (!keywords.parentNode) document.head.appendChild(keywords);
          // }

          // const ogTitle = document.querySelector('meta[property="og:title"]') || document.createElement("meta");
          // ogTitle.setAttribute("property", "og:title");
          // ogTitle.setAttribute("content", result.browser_title || "");
          // if (!ogTitle.parentNode) document.head.appendChild(ogTitle);

          // const ogDescription = document.querySelector('meta[property="og:description"]') || document.createElement("meta");
          // ogDescription.setAttribute("property", "og:description");
          // ogDescription.setAttribute("content", result.meta_description || "");
          // if (!ogDescription.parentNode) document.head.appendChild(ogDescription);

          // const imageUrl = result.banner_img?.[0]?.url ? `${BASE_URL_IMG}/${result.banner_img[0].url}` : "";
          // const ogImage = document.querySelector('meta[property="og:image"]') || document.createElement("meta");
          // ogImage.setAttribute("property", "og:image");
          // ogImage.setAttribute("content", imageUrl);
          // if (!ogImage.parentNode) document.head.appendChild(ogImage);

          // const ogUrl = document.querySelector('meta[property="og:url"]') || document.createElement("meta");
          // ogUrl.setAttribute("property", "og:url");
          // ogUrl.setAttribute("content", window.location.href);
          // if (!ogUrl.parentNode) document.head.appendChild(ogUrl);

          // const ogType = document.querySelector('meta[property="og:type"]') || document.createElement("meta");
          // ogType.setAttribute("property", "og:type");
          // ogType.setAttribute("content", "Travels & Tours");
          // if (!ogType.parentNode) document.head.appendChild(ogType);

          // let canonicalLink = document.querySelector('link[rel="canonical"]');
          // if (!canonicalLink) {
          //   canonicalLink = document.createElement("link");
          //   canonicalLink.setAttribute("rel", "canonical");
          //   document.head.appendChild(canonicalLink);
          // }
          // canonicalLink.setAttribute("href", window.location.href);

          setAirlineData(result);
        } else {
          setAirlineData(null); // 🔹 invalid slug → 404
        }
      } catch (err) {
        console.error("Failed to fetch Airline Details:", err);
        setAirlineData(null); // 🔹 API failed → 404
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [airlineSlug]);



  const visibleFares = airlineData?.fares?.slice(0, visibleCount) || [];
  const hasMore = airlineData?.fares?.length > visibleCount;

  if (loading) {
    return <div className="text-center py-10">Loading Flight Fares ...</div>;
  }

  // 🔹 If slug missing → immediately 404
  if (!airlineData) {
    return <NotFound />;
  }

  // if (!airlineData) {
  //   return (
  //     <div className="flex items-center justify-center min-h-[40vh]">
  //       <p className="text-lg font-Montserrat">No Data Found</p>
  //     </div>
  //   );
  // }

  const imageUrl = airlineData && airlineData.banner_img?.[0]?.url
    ? `${BASE_URL_IMG}/${airlineData.banner_img[0].url}`
    : '';

  return (
    <div className="container">
      <div className="pt-[87px] sm:pt-[100px] pb-[24px] sm:pb-[32px]">
        {breadcrumbs}
        <CommonHeroSection description={airlineData.banner_section_content} banners={airlineData.banner_img} />

        <BrandingSection />

        <div className="flex flex-col">
          <h2 className="text-primary font-gloock">{airlineData.page_title}</h2>
          <p className="text-blacky font-quicksand">{airlineData.page_sub_title}</p>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-x-2 gap-y-4 py-6">
          {visibleFares.map((fare, idx) => {
            const fromCity = fare.origin?.city || "N/A";
            const toCity = fare.destination?.city || "N/A";
            const fromCode = fare.origin?.code || "N/A";
            const toCode = fare.destination?.code || "N/A";
            const fromCountry = fare.origin?.country || "N/A";
            const toCountry = fare.destination?.country || "N/A";
            const price = fare.price || "N/A";
            const flightType = fare.flight_type || "N/A";
            const flightClass = fare.flght_class || "N/A";
            const airlineName = airlineData.title || "N/A";
            const airlineImage = airlineData.image_url;
            const altText = airlineData.image_alt || airlineName;

            return (
              <div
                key={idx}
                className="border border-gray-400 rounded-xl p-4 flex flex-col md:flex-row justify-between items-stretch shadow-sm gap-4 overflow-hidden"
              >
                {/* Left Column */}
                <div className="flex flex-col md:w-[70%] overflow-hidden">
                  <div className="flex items-center gap-2 w-full overflow-hidden">
                    <img
                      src={`${BASE_URL_IMG}/media/${airlineImage}`}
                      alt={altText}
                      className="w-24 sm:w-28 h-auto flex-shrink-0 object-cover rounded"
                    />
                    <div className="text-sm text-gray-700 flex-grow px-1 overflow-hidden">
                      <div className="flex font-gloock items-center justify-between font-medium text-xl sm:text-2xl text-purple-800 px-1">
                        <span className="text-red-700">{fromCode}</span>
                        <img src={`${BASE_URL_IMG}/assets/svgs/DoubleArrow.svg`} alt="To" className="flex-shrink-0" />
                        <span className="text-red-700">{toCode}</span>
                      </div>
                      <div className="flex font-quicksand justify-between text-sm text-black mt-1 overflow-hidden">
                        <p className="w-1/2 text-left truncate">{fromCity}</p>
                        <p className="w-1/2 text-right truncate">{toCity}</p>
                      </div>
                      <div className="flex justify-between font-quicksand text-sm font-semibold text-black mt-0.5 overflow-hidden">
                        <p className="w-1/2 text-left truncate">{fromCountry}</p>
                        <p className="w-1/2 text-right truncate">{toCountry}</p>
                      </div>
                    </div>
                  </div>

                  <hr className="my-3 w-full sm:w-[70%] ml-3 border-gray-200" />

                  <ul className="text-black font-quicksand text-xs flex flex-wrap justify-between items-center gap-2 overflow-hidden">
                    <li className="truncate">{flightType}</li>
                    <li className="truncate">0207 - 043 - 4343</li>
                    <li className="truncate">{flightClass}</li>
                  </ul>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-[#D1D5DB] md:w-[1px] md:h-24 md:self-center" />

                {/* Right Column */}
                <div className="text-sm font-quicksand text-gray-600 space-y-2 text-center md:w-[22%] pt-2 md:pt-4 flex flex-col items-center">
                  <div className="text-secondary mt-2">
                    <span className="text-sm font-normal">Fr </span>
                    <span className="text-xl font-sans font-bold">£{price}</span>
                  </div>
                  <button
                    onClick={() => handleEnquiryClick(fare)}
                    className="text-red-600 font-bold text-sm hover:underline flex items-center gap-2"
                  >
                    Send Enquiry
                    <img src={`${BASE_URL_IMG}/assets/svgs/Arrow1.svg`} alt="Arrow" className="flex-shrink-0" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {hasMore && (
          <div className="text-center mb-20 flex justify-center">
            <button
              onClick={handleLoadMore}
              className="px-6 py-2 rounded-lg transition flex items-center gap-2 hover:underline"
            >
              Load More
              <img src={`${BASE_URL_IMG}/assets/svgs/Arrow1.svg`} alt="Arrow" />
            </button>
          </div>
        )}

        {showEnquiryModal && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowEnquiryModal(false);
            }}
            className="fixed inset-0 z-[999] bg-black/65 backdrop-blur-sm flex justify-center items-center p-3 sm:p-6 overflow-y-auto"
          >
            <div className="w-full max-w-[820px] relative max-h-[94vh] overflow-y-auto rounded-[20px] sm:rounded-[24px] shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200">
              <EnquiryModal
                formatDate={formatDate}
                onClose={() => setShowEnquiryModal(false)}
                showEnquiryModal={showEnquiryModal}
              />
            </div>
          </div>
        )}

        <div className="w-full">
          <ScrollDetail description={airlineData.scroll_description} />
        </div>

        {typeof airlineData?.faq_widget?.[0]?.faq_ids === 'string' && airlineData.faq_widget[0].faq_ids.trim() !== '' && (
          <div className="w-full pt-16 pb-4">
            <FaqSection
              faq_ids={airlineData.faq_widget[0].faq_ids
                .split(",")
                .map((id) => parseInt(id.trim()))
                .filter((id) => !isNaN(id))}
              heading={airlineData?.faq_widget?.[0]?.heading || ""}
              subheading={airlineData?.faq_widget?.[0]?.sub_heading || ""}
            />
          </div>
        )}
      </div>
    </div>
  );
}
