import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { endpoints } from '../Helpers/endpoints';

const FaqColumn = ({ faqs, activeIndex, setActiveIndex, columnOffset }) => {
  return (
    <div className="space-y-[24px]">
      {faqs.map((faq, index) => {
        const globalIndex = columnOffset + index;
        const isOpen = activeIndex === globalIndex;

        return (
          <div
            key={faq.id}
            // className={`border ${isOpen ? 'border-black ring-2 black_tag z-10 bg-[#F3F3F3]' : 'border-black  z-0'
            //   } rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 `}
            className={`border shadow-md hover:shadow-lg ${isOpen
              ? 'border-[#A57233] z-10 rounded-[10px] bg-[#FFFFFF]'
              : 'border-[#A57233] z-0 rounded-[10px]'
              }`}
          >
            <button
              onClick={() => setActiveIndex(isOpen ? null : globalIndex)}
              className="w-full px-6 py-4 flex justify-between items-center text-left focus:outline-none"
            >
              <h3 className={`text-[16px] font-quicksand black_tag faq_question`}>
                {faq.question}
              </h3>

              <span className="w-6 h-6 flex items-center justify-center">
                {isOpen ? (
                  <svg width="20" height="4" viewBox="0 0 20 4" fill="none">
                    <rect width="20" height="4" rx="1" fill="#A57233" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect x="9" width="3" height="20" rx="1" fill="#A57233" />
                      <rect y="9" width="20" height="3" rx="1" fill="#A57233" />
                  </svg>
                )}
              </span>
            </button>

            <div
              className={`px-6 overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-[500px] py-4 opacity-100' : 'max-h-0 py-0 opacity-0'
                }`}
            >
              <hr className='h-[2px] bg-[#A57233] w-[80%] mb-3 rounded-full' />
              <div
                className="text-[16px] ck-content prose prose-sm max-w-none black_tag"
                dangerouslySetInnerHTML={{ __html: faq.answer }}
              />

            </div>
          </div>
        );
      })}
    </div>
  );
};

const FaqSkeletonItem = () => (
  <div className="border border-[#A57233] rounded-3xl shadow-md animate-pulse">
    <div className="px-6 py-4 flex justify-between items-center">
      <div className="h-4 bg-gray-200 rounded w-4/5" />
      <div className="w-6 h-6 bg-gray-200 rounded" />
    </div>
  </div>
);

const FaqSection = ({ faq_ids = [], heading = '', subheading = '', initialFaqs = null }) => {
  const [faqData, setFaqData] = useState(initialFaqs ?? []);
  const [activeIndex, setActiveIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(!initialFaqs?.length && faq_ids.length > 0);

  const fetchedKeyRef = useRef(initialFaqs?.length ? faq_ids.join(',') : '');

  useEffect(() => {
    const currentKey = faq_ids.join(',');
    if (!currentKey || currentKey === fetchedKeyRef.current) return;

    fetchedKeyRef.current = currentKey;
    setIsLoading(true);

    const fetchFaqs = async () => {
      try {
        const response = await axios.get(endpoints.faqsId(currentKey));
        if (response.data.status === 1) {
          setFaqData(response.data.result.faqs);
        }
      } catch (err) {
        console.error('FAQ fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFaqs();
  }, [faq_ids]);

  const half = Math.ceil(faqData.length / 2);
  const firstColumn = faqData.slice(0, half);
  const secondColumn = faqData.slice(half);

  if (!isLoading && faqData.length === 0 && faq_ids.length === 0) {
    return null;
  }

  return (
    <section className="">
      <div className='container'>
        
        {(heading || subheading) && (
          <div className='heading_section'>
            <h2 className='pre_heading'>
              {heading}
            </h2>
            <p className='sub_text'>
              {subheading}
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]" aria-hidden="true">
            <div className="space-y-[24px]">
              {Array.from({ length: Math.ceil(faq_ids.length / 2) || 3 }).map((_, index) => (
                <FaqSkeletonItem key={`faq-skeleton-left-${index}`} />
              ))}
            </div>
            <div className="space-y-[24px]">
              {Array.from({ length: Math.floor(faq_ids.length / 2) || 3 }).map((_, index) => (
                <FaqSkeletonItem key={`faq-skeleton-right-${index}`} />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
            <FaqColumn
              faqs={firstColumn}
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
              columnOffset={0}
            />
            <FaqColumn
              faqs={secondColumn}
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
              columnOffset={half}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default FaqSection;

