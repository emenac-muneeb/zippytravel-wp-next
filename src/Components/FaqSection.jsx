"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { endpoints } from "../Helpers/endpoints";

const DEFAULT_FAQS = [
  {
    id: "faq-1",
    question: "How can flight costs be compared?",
    answer:
      "You can easily compare flight costs on our platform by entering your departure, destination, and travel dates to see real-time fares from top international airlines side by side.",
  },
  {
    id: "faq-2",
    question: "How far in advance should I book my airline tickets for a successful trip?",
    answer:
      "We recommend booking international flights 2 to 4 months in advance, and during off-peak periods, to secure the best rates and seat availability.",
  },
  {
    id: "faq-3",
    question: "How can flight costs be compared?",
    answer:
      "Use our flexible date search and filter options by airline, stops, and price to find the most economical flight option for your itinerary.",
  },
  {
    id: "faq-4",
    question: "From the UK, I'm looking for inexpensive flights. When should I make a reservation?",
    answer:
      "For UK departures, booking 6 to 12 weeks ahead and considering midweek departures (Tuesdays and Wednesdays) typically yields the lowest airfares.",
  },
  {
    id: "faq-5",
    question: "How can flight costs be compared?",
    answer:
      "Our portal automatically negotiates exclusive consolidator fares with premier airlines, ensuring you get lower rates than standard booking channels.",
  },
  {
    id: "faq-6",
    question: "How can flight costs be compared?",
    answer:
      "You can sign up for price alerts or contact our travel experts 24/7 to receive personalized flight options and secret negotiated deals.",
  },
];

const FaqItem = ({ faq, isOpen, onToggle }) => {
  return (
    <div className="w-full max-w-[387px] mx-auto lg:mx-0">
      <div
        onClick={onToggle}
        className="cursor-pointer select-none group"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        aria-expanded={isOpen}
      >
        <div className="flex items-start justify-between gap-3">
          <h3
            className="text-[16px] sm:text-[17px] font-semibold text-[#1C2938] leading-[24px] group-hover:text-[#50A7C2] transition-colors"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {faq.question}
          </h3>

          <span
            className="w-[22px] h-[19px] min-w-[22px] rounded-[4px] bg-[#50A7C2] flex items-center justify-center shrink-0 mt-1 transition-all duration-300 shadow-sm"
            aria-hidden="true"
          >
            <svg
              width="10"
              height="6"
              viewBox="0 0 10 6"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`transition-transform duration-300 ease-in-out ${
                isOpen ? "rotate-180" : ""
              }`}
            >
              <path
                d="M1 1.25L5 5.25L9 1.25"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-[300px] opacity-100 pt-3" : "max-h-0 opacity-0 pt-0"
          }`}
        >
          <div
            className="text-[14px] text-[#5A6B82] leading-[22px] prose prose-sm max-w-none"
            style={{ fontFamily: "'Poppins', sans-serif" }}
            dangerouslySetInnerHTML={{ __html: faq.answer }}
          />
        </div>
      </div>

      {/* Border line below question: gap 59px from text when closed, width 387px, height 0 */}
      <div
        className={`w-full max-w-[387px] border-b border-[#CBD5E1] transition-all duration-300 ${
          isOpen ? "mt-4" : "mt-[59px]"
        }`}
        style={{ height: 0 }}
      />
    </div>
  );
};

const FaqSection = ({
  faq_ids = [],
  heading = "",
  subheading = "",
  initialFaqs = null,
}) => {
  const [faqData, setFaqData] = useState(initialFaqs ?? []);
  const [activeIndex, setActiveIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const fetchedKeyRef = useRef(initialFaqs?.length ? faq_ids.join(",") : "");

  useEffect(() => {
    const currentKey = faq_ids.join(",");
    if (!currentKey || currentKey === fetchedKeyRef.current) return;

    fetchedKeyRef.current = currentKey;
    setIsLoading(true);

    const fetchFaqs = async () => {
      try {
        const response = await axios.get(endpoints.faqsId(currentKey));
        if (response.data.status === 1 && response.data.result?.faqs?.length) {
          setFaqData(response.data.result.faqs);
        }
      } catch (err) {
        console.error("FAQ fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFaqs();
  }, [faq_ids]);

  // Use fetched faqs or fallback to DEFAULT_FAQS (strictly 3 left, 3 right to match design)
  const rawItems = faqData && faqData.length > 0 ? faqData : DEFAULT_FAQS;
  const items = rawItems.slice(0, 6);
  const firstColumn = items.slice(0, 3);
  const secondColumn = items.slice(3, 6);

  const displayHeading = "Frequently Asked Questions";
  const displaySubheading =
    "Our customers can access our web site for a \u2018one-stop shop\u2019 including access to specially negotiated airfares, hotels, car rental and insurance.";

  return (
    <section className="mt-[110px] w-full bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1320px]">
        {/* Top Header & Subtitle */}
        <div className="text-center max-w-[820px] mx-auto">
          <h2
            className="text-[28px] sm:text-[32px] md:text-[36px] font-[700] text-[#1C2938] leading-[1.25]"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {displayHeading}
          </h2>
          <p
            className="text-[16px] sm:text-[18px] md:text-[20px] font-[400] text-[#5A6B82] leading-[1.45] mt-3"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {displaySubheading}
          </p>
        </div>

        {/* 1. Desktop Layout (1024px and above): 3 columns (Left questions, Center image, Right questions) */}
        <div className="mt-[46px] hidden lg:flex flex-row items-center justify-between gap-8 xl:gap-12">
          {/* Left Column Questions */}
          <div className="w-[387px] flex flex-col justify-between gap-6 min-h-[344px]">
            {firstColumn.map((faq, index) => {
              const globalIndex = index;
              return (
                <FaqItem
                  key={faq.id || `faq-left-${index}`}
                  faq={faq}
                  isOpen={activeIndex === globalIndex}
                  onToggle={() =>
                    setActiveIndex(activeIndex === globalIndex ? null : globalIndex)
                  }
                />
              );
            })}
          </div>

          {/* Center Image: height 344px (shifted further upwards) */}
          <div className="flex-shrink-0 flex items-center justify-center my-0 -mt-10 lg:-mt-[70px]">
            <img
              src="/faq-center.png"
              alt="Frequently Asked Questions Illustration"
              className="h-[344px] w-auto object-contain"
              width={393}
              height={344}
              loading="lazy"
            />
          </div>

          {/* Right Column Questions */}
          <div className="w-[387px] flex flex-col justify-between gap-6 min-h-[344px]">
            {secondColumn.map((faq, index) => {
              const globalIndex = 3 + index;
              return (
                <FaqItem
                  key={faq.id || `faq-right-${index}`}
                  faq={faq}
                  isOpen={activeIndex === globalIndex}
                  onToggle={() =>
                    setActiveIndex(activeIndex === globalIndex ? null : globalIndex)
                  }
                />
              );
            })}
          </div>
        </div>

        {/* 2. Responsive Layout (1023px and below): Heading -> Image -> Questions (2-per-row or 1-per-row on mobile with Load More) */}
        <div className="block lg:hidden mt-[16px]">
          {/* Image directly below heading & subtext */}
          <div className="flex justify-center mb-6 sm:mb-8 -mt-6 sm:-mt-8">
            <img
              src="/faq-center.png"
              alt="Frequently Asked Questions Illustration"
              className="h-[260px] sm:h-[300px] md:h-[344px] w-auto object-contain"
              width={393}
              height={344}
              loading="lazy"
            />
          </div>

          {/* Questions Grid:
              - On Tablet (sm to 1023px): 2 questions per line (sm:grid-cols-2)
              - On Mobile (< sm): 1 question per line (grid-cols-1)
              - On Mobile: Only first 4 questions shown initially; rest hidden behind Load More
          */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 max-w-[850px] w-full mx-auto">
            {items.map((faq, index) => (
              <div
                key={faq.id || `faq-responsive-${index}`}
                className={`w-full max-w-[387px] mx-auto ${
                  index >= 4 && !showMore ? "hidden sm:block" : "block"
                }`}
              >
                <FaqItem
                  faq={faq}
                  isOpen={activeIndex === index}
                  onToggle={() =>
                    setActiveIndex(activeIndex === index ? null : index)
                  }
                />
              </div>
            ))}
          </div>

          {/* Load More Button: ONLY shown when in single-column mobile view (sm:hidden) and there are more than 4 questions */}
          {items.length > 4 && (
            <div className="mt-8 flex justify-center sm:hidden">
              <button
                type="button"
                onClick={() => setShowMore(!showMore)}
                className="px-7 py-2.5 rounded-full bg-[#50A7C2] text-white font-medium text-[15px] shadow-sm hover:bg-[#4396af] active:scale-95 transition-all duration-200 flex items-center gap-2 cursor-pointer"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <span>{showMore ? "Show Less" : "Load More"}</span>
                <svg
                  width="10"
                  height="6"
                  viewBox="0 0 10 6"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`transition-transform duration-300 ${
                    showMore ? "rotate-180" : ""
                  }`}
                >
                  <path
                    d="M1 1.25L5 5.25L9 1.25"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
