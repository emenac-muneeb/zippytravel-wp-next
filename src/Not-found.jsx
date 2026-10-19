"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BrandingSection from "./Components/BrandingSection";
import { BASE_URL_IMG } from "./Helpers/imageurl";
import { useEffect, useState } from "react";
import CallbackPopup from "./Components/CallbackPopup";
import api from "./Helpers/apiHelper";
import { endpoints } from "./Helpers/endpoints";
import EnquiryModal from "./Components/EnquiryModal";
import { formatDate } from "./utils/formDataProvider";

export default function NotFound() {
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false);
  const [footerData, setFooterData] = useState(null);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);

  useEffect(() => {
    // // 1️⃣ Set page title
    // document.title = "404 Page not Found";

    // // 2️⃣ Add or update canonical tag
    // let canonicalLink = document.querySelector('link[rel="canonical"]');
    // if (!canonicalLink) {
    //   canonicalLink = document.createElement("link");
    //   canonicalLink.setAttribute("rel", "canonical");
    //   document.head.appendChild(canonicalLink);
    // }
    // canonicalLink.setAttribute("href", window.location.href);

    // let robotsMeta = document.querySelector('meta[name="robots"]');
    // if (!robotsMeta) {
    //   robotsMeta = document.createElement("meta");
    //   robotsMeta.setAttribute("name", "robots");
    //   document.head.appendChild(robotsMeta);
    // }
    // robotsMeta.setAttribute("content", "noindex, nofollow");

    // 3️⃣ Fetch footer data
    const fetchHelpData = async () => {
      try {
        const response = await api.get(endpoints.generalSettings);
        if (response.data.status === 1) {
          setFooterData(response.data.result.footer_setting);
        }
      } catch (error) {
        console.error("Error fetching Help data:", error);
      }
    };
    fetchHelpData();

    // 4️⃣ Trigger popup after 3 seconds
    // const timer = setTimeout(() => {
    //   setShowPopup(true);
    // }, 3000);

    // return () => clearTimeout(timer);
  }, []);

  const openEnquiryModal = () => {
    localStorage.removeItem('flightFormData');
    setShowEnquiryModal(true);
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
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-end items-center">
          <div className="bg-white rounded-l-2xl rounded-r-none w-full sm:w-[90%] md:w-[80%] lg:w-[60%] max-w-5xl relative h-auto max-h-[90%] overflow-y-auto shadow-lg">
            <button
              onClick={() => setShowEnquiryModal(false)}
              className="absolute top-3 right-5 text-gray-600 text-2xl font-bold hover:text-gray-800"
            >
              &times;
            </button>

            <EnquiryModal
              key={Date.now()}
              formatDate={formatDate}
              onClose={() => setShowEnquiryModal(false)}
            />
          </div>
        </div>
      )}

      <div className="w-full container max-w-[85%] mx-auto flex mt-4 items-center justify-center mb-6">
        <div className="flex flex-col lg:flex-row justify-center gap-12 items-center">
          {/* Left - Text */}
          <div className="w-full lg:w-1/2">
            <h2 className="text-3xl font-semibold text-purple-900 mb-2">
              Oooops...
            </h2>
            <h1 className="text-5xl font-bold text-red-700 mb-4">
              404 Page Not Found
            </h1>
            <p className="text-gray-700 mb-4">
              Error: Could not find your Query
            </p>
            <p className="text-gray-700 mb-6">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  openEnquiryModal();
                }}
                className="text-pink-600 underline hover:text-pink-800 cursor-pointer"
              >
                Send us your Query
              </a>{" "}
              and we will get back to you
            </p>
            <div className="flex flex-wrap gap-4 mt-6">
              <button
                onClick={() => router.back()}
                className="text-purple-800 font-medium hover:underline"
              >
                Go to Previous Page ↗
              </button>
              <Link
                href="/"
                className="text-red-700 font-medium hover:underline"
              >
                Go to Home Page ↗
              </Link>
            </div>
          </div>

          {/* Right - Image */}
          <div className="w-full lg:w-1/2">
            <img
              src={`${BASE_URL_IMG}/loader/404-page.webp`}
              alt="404 emenac"
            // className="w-full h-auto"
            />
          </div>
        </div>
      </div>

      <BrandingSection />
    </>
  );
}
