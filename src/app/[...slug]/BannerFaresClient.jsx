"use client";
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import HeroSectionNew from '../../Components/HeroSectionNew';
import FlightCard from '../../Components/FlightCard';
import LoadingScreen from '../../Components/LoadingScreen';
import PopUp from '../../Components/PopUp';
import ScrollDetail from '../../Components/ScrollDetail';
import ScrollDetailRight from '../../Components/ScrollDetailRight';
import FaqSection from '../../Components/FaqSection';
import { endpoints } from '../../Helpers/endpoints';

const HERO_FALLBACK =
  "Zippytravel.co.uk is an e-commerce UK based company offering online travel products and services.";

const SECTION_FALLBACK =
  "Our customers can access our web site for a 'one-stop shop' including access to specially negotiated airfares, hotels, car rental and insurance.";

function visibleHtmlText(html) {
  if (typeof html !== 'string') return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function parseFaqIdList(raw) {
  if (typeof raw !== 'string') return [];
  return raw
    .split(',')
    .map((id) => parseInt(id.trim(), 10))
    .filter((id) => !Number.isNaN(id));
}

export default function BannerFaresClient({ initialData }) {
  const pageData = initialData?.pageData || {};
  const cityIds = initialData?.cityIds || '';
  const fareWidget = pageData?.cityfares_widget?.[0] || {};

  const initialFaresList = useMemo(() => {
    if (!initialData?.fares) return [];
    return Array.isArray(initialData.fares)
      ? initialData.fares
      : (initialData.fares.data || []);
  }, [initialData]);

  const initialLastPage = useMemo(() => {
    if (initialData?.fares && !Array.isArray(initialData.fares)) {
      return initialData.fares.last_page || 1;
    }
    return 1;
  }, [initialData]);

  const [faresList, setFaresList] = useState(initialFaresList);
  const [currentPage, setCurrentPage] = useState(initialData?.fares?.current_page || 1);
  const [lastPage, setLastPage] = useState(initialLastPage);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [flightLoading, setFlightLoading] = useState(false);
  const [popupMessage, setPopupMessage] = useState(null);

  // Filter states — same behaviour as /airline/[slug]
  const [selectedClass, setSelectedClass] = useState('Business');
  const [stopoverFilter, setStopoverFilter] = useState('Any');
  const [searchDestination, setSearchDestination] = useState('');
  const [checkedDestinations, setCheckedDestinations] = useState(new Set());

  const absoluteMinPrice = 0;
  const absoluteMaxPrice = 10000;
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);

  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isDestinationsOpen, setIsDestinationsOpen] = useState(true);

  const uniqueDestinations = useMemo(() => {
    const list = initialFaresList
      .map((f) => f.destination?.city)
      .filter(Boolean);
    return Array.from(new Set(list));
  }, [initialFaresList]);

  const filteredDestinationsList = useMemo(() => {
    return uniqueDestinations.filter((name) =>
      name.toLowerCase().includes(searchDestination.toLowerCase())
    );
  }, [uniqueDestinations, searchDestination]);

  const toggleDestination = (name) => {
    setCheckedDestinations((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const fetchFares = useCallback(async (pageToFetch = 1, isAppend = false) => {
    if (!cityIds) {
      if (!isAppend) {
        setFaresList([]);
        setLastPage(1);
        setCurrentPage(1);
      }
      return;
    }

    try {
      if (isAppend) setLoadingMore(true);
      else setIsLoading(true);

      const paramsObj = {
        city_ids: cityIds,
        page: pageToFetch,
        per_page: 12,
      };

      // Default city-fares (no class) = Business. class=1 Premium, class=3 Economy.
      if (selectedClass === 'Premium Economy') {
        paramsObj.class = 1;
      } else if (selectedClass === 'First Class') {
        paramsObj.class = 2;
      } else if (selectedClass === 'Economy Class') {
        paramsObj.class = 3;
      }

      if (minPrice !== undefined && minPrice > absoluteMinPrice) {
        paramsObj.min_price = minPrice;
      }
      if (maxPrice !== undefined && maxPrice < absoluteMaxPrice) {
        paramsObj.max_price = maxPrice;
      }

      if (checkedDestinations.size > 0) {
        paramsObj.city = Array.from(checkedDestinations).join(',');
      }

      const res = await axios.get(endpoints.cityFares, { params: paramsObj });
      if (res.data?.status === 1 && res.data?.result?.fares) {
        const faresPayload = res.data.result.fares;
        const newFaresData = Array.isArray(faresPayload)
          ? faresPayload
          : (faresPayload.data || []);
        const fetchedLastPage = faresPayload.last_page || 1;

        setLastPage(fetchedLastPage);
        setCurrentPage(pageToFetch);

        if (isAppend) {
          setFaresList((prev) => [...prev, ...newFaresData]);
        } else {
          setFaresList(newFaresData);
        }
      } else if (!isAppend) {
        setFaresList([]);
        setLastPage(1);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error('Error fetching banner city fares:', err);
      if (!isAppend) setFaresList([]);
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  }, [cityIds, selectedClass, minPrice, maxPrice, checkedDestinations, absoluteMinPrice, absoluteMaxPrice]);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (!initialFaresList.length && cityIds) {
        fetchFares(1, false);
      }
      return;
    }

    const timer = setTimeout(() => {
      fetchFares(1, false);
    }, 350);

    return () => clearTimeout(timer);
  }, [selectedClass, minPrice, maxPrice, checkedDestinations, fetchFares, cityIds, initialFaresList.length]);

  const handleLoadMore = () => {
    if (currentPage < lastPage && !loadingMore) {
      fetchFares(currentPage + 1, true);
    }
  };

  const resetFilters = () => {
    setStopoverFilter('Any');
    setSelectedClass('Business');
    setMinPrice(absoluteMinPrice);
    setMaxPrice(absoluteMaxPrice);
    setCheckedDestinations(new Set());
    setSearchDestination('');
  };

  const filteredFares = useMemo(() => {
    return faresList.filter((fare) => {
      if (stopoverFilter !== 'Any') {
        const stopsText = String(fare.flight_type || 'Direct').toLowerCase();
        const isDirect =
          stopsText.includes('direct') ||
          stopsText.includes('0 stops') ||
          (!stopsText.includes('01') && !stopsText.includes('02') && !stopsText.includes('stop'));
        const isOneStop = stopsText.includes('1 stop') || stopsText.includes('01 stop');
        const isTwoStops =
          stopsText.includes('2 stops') ||
          stopsText.includes('02 stops') ||
          (stopsText.includes('stops') && !isOneStop);

        if (stopoverFilter === 'Direct' && !isDirect) return false;
        if (stopoverFilter === '01 Stop' && !isOneStop) return false;
        if (stopoverFilter === '02 Stops+' && !isTwoStops) return false;
      }
      return true;
    });
  }, [faresList, stopoverFilter]);

  const pageTitle = visibleHtmlText(pageData.title) || 'Flights';
  const bannerHtml = visibleHtmlText(pageData.banner_description)
    ? pageData.banner_description
    : (visibleHtmlText(pageData.description) ? pageData.description : '');
  const sectionHeading = visibleHtmlText(fareWidget.heading) || pageTitle;
  const sectionSub = visibleHtmlText(fareWidget.sub_heading)
    ? fareWidget.sub_heading
    : SECTION_FALLBACK;
  const faqIds = parseFaqIdList(pageData?.faq_widget?.[0]?.faq_ids);

  const minPercent =
    ((minPrice - absoluteMinPrice) / (absoluteMaxPrice - absoluteMinPrice || 1)) * 100;
  const maxPercent =
    ((maxPrice - absoluteMinPrice) / (absoluteMaxPrice - absoluteMinPrice || 1)) * 100;

  return (
    <>
      <style>{`
        .dual-slider-input::-webkit-slider-thumb {
          pointer-events: auto;
          width: 16px;
          height: 16px;
          border-radius: 4px;
          background: #ffffff;
          border: 2px solid #5CACC4;
          cursor: pointer;
          -webkit-appearance: none;
        }
        .dual-slider-input::-moz-range-thumb {
          pointer-events: auto;
          width: 16px;
          height: 16px;
          border-radius: 4px;
          background: #ffffff;
          border: 2px solid #5CACC4;
          cursor: pointer;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #EEF3F7;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #5CACC4;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #1F0060;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #5CACC4 #EEF3F7;
        }
      `}</style>

      {popupMessage && (
        <PopUp title="Error" message={popupMessage} onClose={() => setPopupMessage(null)} />
      )}

      {flightLoading ? (
        <LoadingScreen />
      ) : (
        <>
          <HeroSectionNew
            setFlightLoading={setFlightLoading}
            setPopupMessage={setPopupMessage}
            title={pageTitle}
            subTitle="— Zippy Travel"
            description={bannerHtml || HERO_FALLBACK}
            bgImageOverride={pageData?.banner_img?.[0]?.url || pageData?.image_url}
            bannerSlug="flights"
          />

          <div className="container">
            <div className="w-full mx-auto pt-[40px] sm:pt-[45px] lg:pt-[30px]">
              <div className="text-center max-w-[900px] mx-auto mb-8 sm:mb-10">
                <h2 className="pre_heading">{sectionHeading}</h2>
                {sectionSub.includes('<') ? (
                  <div
                    className="sub_text mt-2 sm:mt-3"
                    dangerouslySetInnerHTML={{ __html: sectionSub }}
                  />
                ) : (
                  <p className="sub_text mt-2 sm:mt-3">{sectionSub}</p>
                )}
              </div>

              <div className="flex flex-col min-[1285px]:flex-row gap-8 mt-6 mb-12">
                {/* Sidebar Filters */}
                <div className="w-full min-[1285px]:w-[320px] shrink-0 space-y-5">
                  {/* Cabin Class */}
                  <div className="bg-white rounded-[20px] p-5 border border-[#E2E8F0] shadow-sm">
                    <div className="flex justify-between items-center select-none mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[#1F0060] text-[18px] font-bold font-poppins">Cabin Class</h3>
                        <div className="w-[30px] h-[3px] bg-[#5CACC4] rounded-full" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {[
                        { id: 'Business', label: 'Business Class' },
                        { id: 'Premium Economy', label: 'Premium Economy' },
                        { id: 'Economy Class', label: 'Economy Class' },
                      ].map((item) => {
                        const isActive = selectedClass === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setSelectedClass(item.id)}
                            className={`w-full py-2.5 px-3.5 rounded-[12px] font-poppins font-medium text-[14px] text-left transition-all flex items-center justify-between ${
                              isActive
                                ? 'bg-[#1F0060] text-white shadow-sm font-semibold'
                                : 'bg-[#F8FAFC] text-[#333333] hover:bg-[#EEF3F7] border border-[#E2E8F0]'
                            }`}
                          >
                            <span>{item.label}</span>
                            {isActive && (
                              <span className="w-2.5 h-2.5 rounded-full bg-[#5CACC4]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="bg-white rounded-[20px] p-5 border border-[#E2E8F0] shadow-sm">
                    <div
                      className="flex justify-between items-center cursor-pointer select-none"
                      onClick={() => setIsPriceOpen(!isPriceOpen)}
                    >
                      <div className="flex items-center gap-2">
                        <h3 className="text-[#1F0060] text-[18px] font-bold font-poppins">Price</h3>
                        <div className="w-[30px] h-[3px] bg-[#5CACC4] rounded-full" />
                      </div>
                      <svg
                        className={`w-4 h-4 text-[#1F0060] transition-transform duration-300 ${isPriceOpen ? '' : '-rotate-180'}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                    <div className={`transition-all duration-300 overflow-hidden ${isPriceOpen ? 'max-h-[140px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="space-y-4 px-2 pb-4">
                        <div className="relative h-12 flex items-end pb-1 mt-6">
                          <div className="absolute h-1 bg-[#EEF3F7] w-full rounded-full" />
                          <div
                            className="absolute h-1 bg-[#5CACC4] rounded-full"
                            style={{
                              left: `${minPercent}%`,
                              width: `${maxPercent - minPercent}%`,
                            }}
                          />
                          <span
                            className="absolute text-[12px] font-semibold font-poppins text-[#1F0060] bg-white border border-[#E2E8F0] px-2 py-0.5 rounded shadow-sm select-none z-50 pointer-events-none transition-all duration-75"
                            style={{
                              left: `${minPercent}%`,
                              transform:
                                minPercent < 15
                                  ? 'translate(0%, -28px)'
                                  : minPercent > 85
                                    ? 'translate(-100%, -28px)'
                                    : 'translate(-50%, -28px)',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            £{minPrice.toLocaleString()}
                          </span>
                          <span
                            className="absolute text-[12px] font-semibold font-poppins text-[#1F0060] bg-white border border-[#E2E8F0] px-2 py-0.5 rounded shadow-sm select-none z-50 pointer-events-none transition-all duration-75"
                            style={{
                              left: `${maxPercent}%`,
                              transform:
                                maxPercent > 85
                                  ? 'translate(-100%, -28px)'
                                  : maxPercent < 15
                                    ? 'translate(0%, -28px)'
                                    : 'translate(-50%, -28px)',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            £{maxPrice.toLocaleString()}
                          </span>
                          <input
                            type="range"
                            min={absoluteMinPrice}
                            max={absoluteMaxPrice}
                            value={minPrice}
                            onChange={(e) => {
                              const val = Math.min(Number(e.target.value), maxPrice);
                              setMinPrice(val);
                            }}
                            className="dual-slider-input absolute w-full pointer-events-none appearance-none bg-transparent h-1 focus:outline-none z-30"
                          />
                          <input
                            type="range"
                            min={absoluteMinPrice}
                            max={absoluteMaxPrice}
                            value={maxPrice}
                            onChange={(e) => {
                              const val = Math.max(Number(e.target.value), minPrice);
                              setMaxPrice(val);
                            }}
                            className="dual-slider-input absolute w-full pointer-events-none appearance-none bg-transparent h-1 focus:outline-none z-40"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Destinations */}
                  <div className="bg-white rounded-[20px] p-5 border border-[#E2E8F0] shadow-sm">
                    <div
                      className="flex justify-between items-center cursor-pointer select-none"
                      onClick={() => setIsDestinationsOpen(!isDestinationsOpen)}
                    >
                      <div className="flex items-center gap-2">
                        <h3 className="text-[#1F0060] text-[18px] font-bold font-poppins">Destinations</h3>
                        <div className="w-[30px] h-[3px] bg-[#5CACC4] rounded-full" />
                      </div>
                      <svg
                        className={`w-4 h-4 text-[#1F0060] transition-transform duration-300 ${isDestinationsOpen ? '' : '-rotate-180'}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                    <div className={`transition-all duration-300 overflow-hidden ${isDestinationsOpen ? 'max-h-[300px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="relative mb-3">
                        <input
                          type="text"
                          placeholder="Search destination..."
                          value={searchDestination}
                          onChange={(e) => setSearchDestination(e.target.value)}
                          className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] py-2 px-3 pr-8 text-[13px] font-poppins text-[#222222] placeholder-[#8FA0AD] focus:outline-none focus:border-[#5CACC4] transition-colors"
                        />
                        <svg className="w-4 h-4 text-[#8FA0AD] absolute right-2.5 top-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                      </div>
                      <div className="border border-[#E2E8F0] rounded-[14px] bg-[#F8FAFC] p-3 max-h-[190px] overflow-y-auto space-y-2.5 custom-scrollbar">
                        {filteredDestinationsList.length > 0 ? (
                          filteredDestinationsList.map((destination, idx) => {
                            const isChecked = checkedDestinations.has(destination);
                            return (
                              <label key={idx} className="flex items-center gap-2.5 cursor-pointer group select-none">
                                <div className="relative flex-shrink-0">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleDestination(destination)}
                                    className="sr-only"
                                  />
                                  <div className={`w-[18px] h-[18px] rounded-full border flex items-center justify-center transition-all ${
                                    isChecked
                                      ? 'bg-[#5CACC4] border-[#5CACC4]'
                                      : 'bg-white border-[#CBD5E1] group-hover:border-[#5CACC4]'
                                  }`}>
                                    <svg className={`w-2.5 h-2.5 text-white transition-opacity ${isChecked ? 'opacity-100' : 'opacity-0'}`} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                  </div>
                                </div>
                                <span className={`text-[13px] font-poppins font-medium transition-colors ${isChecked ? 'text-[#1F0060] font-semibold' : 'text-[#333333]'}`}>
                                  {destination}
                                </span>
                              </label>
                            );
                          })
                        ) : (
                          <p className="text-[12px] text-gray-500 text-center py-2 font-poppins">No destinations found</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fares list */}
                <div className="flex-grow min-w-0">
                  {isLoading ? (
                    <div className="border border-[#E2E8F0] py-[60px] px-[30px] rounded-[24px] text-center bg-white flex flex-col items-center justify-center gap-3 shadow-sm">
                      <div className="w-8 h-8 border-4 border-[#5CACC4] border-t-transparent rounded-full animate-spin" />
                      <p className="text-gray-500 font-poppins text-sm">Fetching flight fares...</p>
                    </div>
                  ) : filteredFares.length > 0 ? (
                    <div className="border border-[#E2E8F0] py-4 px-3 sm:py-6 sm:px-5 min-[1360px]:py-[30px] min-[1360px]:px-[28px] rounded-[24px] overflow-hidden bg-white shadow-sm">
                      <FlightCard fares={filteredFares} cols={1} />
                    </div>
                  ) : (
                    <div className="border border-[#E2E8F0] py-[60px] px-[30px] rounded-[24px] text-center bg-white shadow-sm">
                      <p className="text-gray-600 font-poppins font-medium text-[16px]">
                        No fares match your selected filters.
                      </p>
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="mt-4 px-6 py-2.5 bg-[#1F0060] hover:bg-[#2b0380] text-white font-poppins text-sm font-semibold rounded-[10px] transition-colors shadow-sm"
                      >
                        Reset Filters
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {currentPage < lastPage && (
                <div className="text-center mb-10 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="flex items-center justify-center gap-2 px-7 py-3 rounded-[12px] font-poppins font-semibold text-[15px] transition-all duration-300 text-center bg-[#5CACC4] hover:bg-[#4ea0b8] text-white shadow-[0_4px_16px_rgba(92,172,196,0.25)] disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <span>Load More</span>
                        <svg
                          className="w-4 h-4 text-white group-hover:translate-x-1.5 transition-transform duration-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth="2.5"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* {(initialData?.parsedScrollContent?.hasContent ||
                (!initialData?.parsedScrollContent && pageData?.scroll_description?.trim())) && (
                <div className="w-full font-quicksand sm:pb-[55px] pb-[30px]">
                  <ScrollDetail
                    description={pageData?.scroll_description}
                    parsedContent={initialData?.parsedScrollContent}
                  />
                </div>
              )}

              {(initialData?.parsedScrollContent2?.hasContent ||
                (!initialData?.parsedScrollContent2 && visibleHtmlText(pageData?.scroll_description_2))) && (
                <div className="w-full font-quicksand sm:pt-[55px] pt-[30px]">
                  <ScrollDetailRight
                    description={pageData?.scroll_description_2}
                    parsedContent={initialData?.parsedScrollContent2}
                  />
                </div>
              )} */}
            </div>
          </div>

          {faqIds.length > 0 && (
            <div className="mx-auto pt-0 pb-4">
              <FaqSection
                faq_ids={faqIds}
                heading={pageData.faq_widget?.[0]?.heading}
                subheading={pageData.faq_widget?.[0]?.sub_heading}
                initialFaqs={initialData?.initialFaqs}
              />
            </div>
          )}
        </>
      )}
    </>
  );
}
