"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { endpoints } from "../Helpers/endpoints";

const FaqItem = ({ faq, isOpen, onToggle }) => {
  if (!faq?.question || !faq?.answer) return null;

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
  const [faqData, setFaqData] = useState(() =>
    Array.isArray(initialFaqs) ? initialFaqs : []
  );
  const [activeIndex, setActiveIndex] = useState(null);
  const [showMore, setShowMore] = useState(false);

  const idsKey = Array.isArray(faq_ids)
    ? faq_ids.filter((id) => id != null && id !== "").join(",")
    : "";
  const fetchedKeyRef = useRef(
    Array.isArray(initialFaqs) && initialFaqs.length > 0 ? idsKey : ""
  );

  useEffect(() => {
    if (!idsKey || idsKey === fetchedKeyRef.current) return;

    fetchedKeyRef.current = idsKey;
    let cancelled = false;

    const fetchFaqs = async () => {
      try {
        const response = await axios.get(endpoints.faqsId(idsKey));
        if (cancelled) return;
        if (response.data.status === 1 && response.data.result?.faqs?.length) {
          setFaqData(response.data.result.faqs);
        } else {
          setFaqData([]);
        }
      } catch (err) {
        console.error("FAQ fetch error:", err);
        if (!cancelled) setFaqData([]);
      }
    };

    fetchFaqs();
    return () => {
      cancelled = true;
    };
  }, [idsKey]);

  const items = (Array.isArray(faqData) ? faqData : []).filter(
    (faq) => faq?.question && faq?.answer
  );
  const mid = Math.ceil(items.length / 2);
  const firstColumn = items.slice(0, mid);
  const secondColumn = items.slice(mid);

  if (!heading || !subheading || items.length === 0) {
    return null;
  }

  return (
    <section className="mt-[60px] sm:mt-[80px] lg:mt-[110px] w-full bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1320px]">
        <div className="text-center max-w-[820px] mx-auto">
          <h2
            className="text-[28px] sm:text-[32px] md:text-[36px] font-[700] text-[#1C2938] leading-[1.25]"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {heading}
          </h2>
          <p
            className="text-[16px] sm:text-[18px] md:text-[20px] font-[400] text-[#5A6B82] leading-[1.45] mt-3"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {subheading}
          </p>
        </div>

        <div className="mt-[46px] hidden lg:flex flex-row items-center justify-between gap-8 xl:gap-12">
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

          <div className="flex-shrink-0 flex items-center justify-center my-0 -mt-10 lg:-mt-[70px]">
            <img
              src="/faq-center.png"
              alt={heading}
              className="h-[344px] w-auto object-contain"
              width={393}
              height={344}
              loading="lazy"
            />
          </div>

          <div className="w-[387px] flex flex-col justify-between gap-6 min-h-[344px]">
            {secondColumn.map((faq, index) => {
              const globalIndex = mid + index;
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

        <div className="block lg:hidden mt-6 sm:mt-8">
          <div className="flex justify-center mb-6 sm:mb-8">
            <img
              src="/faq-center.png"
              alt={heading}
              className="h-[220px] sm:h-[270px] md:h-[310px] w-auto max-w-full object-contain mx-auto"
              width={393}
              height={344}
              loading="lazy"
            />
          </div>

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
