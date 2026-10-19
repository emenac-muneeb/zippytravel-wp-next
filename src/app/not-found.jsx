"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BrandingSection from "../Components/BrandingSection";
import CallbackPopup from "../Components/CallbackPopup";
import EnquiryModalCompact from "../Components/EnquiryModalCompact";
import { endpoints } from "../Helpers/endpoints";
import { BASE_URL_IMG } from "../Helpers/imageurl";
import axios from "axios";
import bg404 from "../../public/404.png";

const BACKGROUND_IMAGE_URL = bg404.src;

export default function NotFound() {
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false);
  const [footerData, setFooterData] = useState(null);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);

  useEffect(() => {
    const fetchHelpData = async () => {
      try {
        const response = await axios.get(endpoints.generalSettings);
        if (response.data.status === 1) {
          setFooterData(response.data.result.footer_setting);
        }
      } catch (error) {
        console.error("Error fetching Help data:", error);
      }
    };
    fetchHelpData();
  }, []);

  useEffect(() => {
    document.body.dataset.pageType = "not-found";
    return () => {
      delete document.body.dataset.pageType;
    };
  }, []);

  const openEnquiryModal = () => {
    localStorage.removeItem('flightFormData');
    setShowEnquiryModal(true);
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
  };

  return (
    <>
      {/* Popup */}
      {showPopup && (
        <CallbackPopup
          show={showPopup}
          onClose={() => setShowPopup(false)}
          phone={footerData?.contents?.footer_phone}
          whatsapp="442070434343"
        />
      )}

      {showEnquiryModal && (
        <EnquiryModalCompact onClose={() => setShowEnquiryModal(false)} />
      )}

      {/* Main 404 Section with absolute background cover for transparent navbar overlay */}
      <div className="relative w-full max-w-[100%] mx-auto h-[480px] sm:h-[600px] md:h-[680px] lg:h-[780px] xl:h-[840px] flex flex-col justify-between pt-24 sm:pt-28 md:pt-36 pb-12 sm:pb-16 px-4 font-quicksand overflow-hidden rounded-b-[24px] sm:rounded-b-[32px] shadow-2xl mb-8 sm:mb-12">
        {/* Background Image Slot */}
        <img
          src={BACKGROUND_IMAGE_URL}
          onError={(e) => {
            // Fallback image if remote url fails or doesn't load
            e.currentTarget.src = "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1920&q=80";
          }}
          alt="404 Background"
          className="absolute inset-0 w-full h-full object-cover -z-10"
        />

        {/* Top Text Content */}
        <div className="flex flex-col items-center text-center mt-4 sm:mt-4 md:mt-8 z-10">
          <p className="text-gray-500 font-400 text-sm sm:text-base md:text-[16px] lg:text-[20px] mb-2 leading-relaxed">
            Error: Could not find your Query
          </p>
          <p className="text-gray-500 font-400 text-sm sm:text-base md:text-[16px] lg:text-[20px] leading-relaxed">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                openEnquiryModal();
              }}
              className="text-gray-500 underline hover:text-black cursor-pointer font-400"
            >
              Send us your Query
            </a>{" "}
            and we will get back to you
          </p>
        </div>

        {/* Bottom Buttons Content */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-[3rem] md:gap-[8rem] z-10">
          <button
            onClick={() => router.back()}
            className="bg-[#A57233] hover:bg-[#8f622c] text-white text-sm sm:text-[17px] font-semibold px-6 sm:px-12 py-3 rounded-[12px] sm:rounded-[16px] shadow-md transition-colors shrink-0"
          >
            Previous Page
          </button>
          <Link
            href="/"
            className="bg-[#A57233] hover:bg-[#8f622c] text-white text-sm sm:text-[17px] font-semibold px-6 sm:px-12 py-3 rounded-[12px] sm:rounded-[16px] shadow-md transition-colors shrink-0"
          >
            Go to Home Page
          </Link>
        </div>
      </div>

      <BrandingSection />
    </>
  );
}
