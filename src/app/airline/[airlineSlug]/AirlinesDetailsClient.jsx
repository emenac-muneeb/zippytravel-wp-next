"use client";
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import axios from 'axios';
import AirlineHeroWithForm from '../../../Components/AirlineHeroWithForm';
import LoadingScreen from '../../../Components/LoadingScreen';
import PopUp from '../../../Components/PopUp';
import FlightCard from '../../../Components/FlightCard';
import ScrollDetail from '../../../Components/ScrollDetail';
import FaqSection from '../../../Components/FaqSection';
import NotFound from "../../../Not-found";
import { endpoints } from '../../../Helpers/endpoints';

export default function AirlinesDetailsClient({ initialAirlineData, airlineSlug }) {
  const [airlineData] = useState(initialAirlineData);
  const [flightLoading, setFlightLoading] = useState(false);
  const [popupMessage, setPopupMessage] = useState(null);

  // Initial fares extraction
  const initialFaresList = useMemo(() => {
    if (!initialAirlineData?.fares) return [];
    return Array.isArray(initialAirlineData.fares)
      ? initialAirlineData.fares
      : (initialAirlineData.fares.data || []);
  }, [initialAirlineData]);

  const initialLastPage = useMemo(() => {
    if (initialAirlineData?.fares && !Array.isArray(initialAirlineData.fares)) {
      return initialAirlineData.fares.last_page || 1;
    }
    return 1;
  }, [initialAirlineData]);

  // Active fares & pagination state
  const [faresList, setFaresList] = useState(initialFaresList);
  const [currentPage, setCurrentPage] = useState(initialAirlineData?.fares?.current_page || 1);
  const [lastPage, setLastPage] = useState(initialLastPage);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filter states
  const [selectedClass, setSelectedClass] = useState('Business');
  const [stopoverFilter, setStopoverFilter] = useState('Any');
  const [searchDestination, setSearchDestination] = useState('');
  const [checkedDestinations, setCheckedDestinations] = useState(new Set());

  // Fixed price range from 0 to 10000
  const absoluteMinPrice = 0;
  const absoluteMaxPrice = 10000;

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);

  // Collapsible states
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isDestinationsOpen, setIsDestinationsOpen] = useState(true);

  // Unique destinations list from initial data
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
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  // API call to fetch fares by airline slug, class, price, city & pagination
  const fetchFares = useCallback(async (pageToFetch = 1, isAppend = false) => {
    try {
      if (isAppend) {
        setLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      const slug = airlineData?.slug || airlineSlug || '';

      const paramsObj = {
        slug: slug,
        page: pageToFetch,
        per_page: 12,
      };

      // Class filter: By default class is 0 (Business), so we don't send class filter for Business.
      // 1 for Premium Economy, 3 for First Class
      if (selectedClass === 'Premium Economy') {
        paramsObj.class = 1;
      } else if (selectedClass === 'First Class') {
        paramsObj.class = 3;
      }

      // Min and Max price filters
      if (minPrice !== undefined && minPrice > absoluteMinPrice) {
        paramsObj.min_price = minPrice;
      }
      if (maxPrice !== undefined && maxPrice < absoluteMaxPrice) {
        paramsObj.max_price = maxPrice;
      }

      // City filter
      if (checkedDestinations.size > 0) {
        paramsObj.city = Array.from(checkedDestinations).join(',');
      }

      const res = await axios.get(endpoints.airlines, { params: paramsObj });
      if (res.data?.status === 1 && res.data?.result?.fares) {
        const faresPayload = res.data.result.fares;
        const newFaresData = Array.isArray(faresPayload) ? faresPayload : (faresPayload.data || []);
        const fetchedLastPage = faresPayload.last_page || 1;

        setLastPage(fetchedLastPage);
        setCurrentPage(pageToFetch);

        if (isAppend) {
          setFaresList(prev => [...prev, ...newFaresData]);
        } else {
          setFaresList(newFaresData);
        }
      }
    } catch (err) {
      console.error("Error fetching airline fares:", err);
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  }, [airlineData, airlineSlug, selectedClass, minPrice, maxPrice, checkedDestinations, absoluteMinPrice, absoluteMaxPrice]);

  // Trigger API call on filter changes (debounced)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      fetchFares(1, false);
    }, 350);

    return () => clearTimeout(timer);
  }, [selectedClass, minPrice, maxPrice, checkedDestinations, fetchFares]);

  // Handle load more
  const handleLoadMore = () => {
    if (currentPage < lastPage && !loadingMore) {
      fetchFares(currentPage + 1, true);
    }
  };

  const faresWithAirline = useMemo(() => {
    return faresList.map((fare) => ({
      ...fare,
      airline: fare.airline || {
        title: airlineData?.title,
        image_url: airlineData?.image_url,
        image_alt: airlineData?.image_alt,
      },
    }));
  }, [faresList, airlineData]);

  // Client-side filter for stopover on loaded fares
  const filteredFares = useMemo(() => {
    return faresWithAirline.filter((fare) => {
      if (stopoverFilter !== 'Any') {
        const stopsText = String(fare.flight_type || 'Direct').toLowerCase();
        const isDirect = stopsText.includes('direct') || stopsText.includes('0 stops') || (!stopsText.includes('01') && !stopsText.includes('02') && !stopsText.includes('stop'));
        const isOneStop = stopsText.includes('1 stop') || stopsText.includes('01 stop');
        const isTwoStops = stopsText.includes('2 stops') || stopsText.includes('02 stops') || (stopsText.includes('stops') && !isOneStop);

        if (stopoverFilter === 'Direct' && !isDirect) return false;
        if (stopoverFilter === '01 Stop' && !isOneStop) return false;
        if (stopoverFilter === '02 Stops+' && !isTwoStops) return false;
      }

      return true;
    });
  }, [faresWithAirline, stopoverFilter]);

  if (!airlineData) {
    return <NotFound />;
  }

  const minPercent = ((minPrice - absoluteMinPrice) / (absoluteMaxPrice - absoluteMinPrice || 1)) * 100;
  const maxPercent = ((maxPrice - absoluteMinPrice) / (absoluteMaxPrice - absoluteMinPrice || 1)) * 100;

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

      {flightLoading && <LoadingScreen />}

      {popupMessage && (
        <PopUp
          title="Notice"
          message={popupMessage}
          onClose={() => setPopupMessage(null)}
        />
      )}

      {/* 
        Hero Banner:
        - Flight search form (Home Page form) in the center of the hero image
        - The 3 class buttons (Premium Class, Business Class, First Class) at the bottom edge
      */}
      <AirlineHeroWithForm
        bgImageOverride={airlineData?.banner_img?.[0]?.url}
        initialBanners={airlineData?.banner_img || []}
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        setFlightLoading={setFlightLoading}
        setPopupMessage={setPopupMessage}
      />

      <div className="container">
        {/* Top padding accommodates the 3 buttons overlapping the bottom of the hero */}
        <div className="w-full mx-auto pt-[60px] sm:pt-[75px] lg:pt-[90px]">
          {/* Heading without decorative before/after lines */}
          <div className="text-center max-w-[900px] mx-auto mb-8 sm:mb-10">
            <h2 className="pre_heading">
              {airlineData.page_title}
            </h2>
            <p className="sub_text mt-2 sm:mt-3">
              {airlineData.page_sub_title || `Your trusted partner for the best ${airlineData.title} flight deals, with unbeatable fares and exceptional service.`}
            </p>
          </div>

          <div className="flex flex-col min-[1285px]:flex-row gap-8 mt-6 mb-12">
            {/* Sidebar Filters */}
            <div className="w-full min-[1285px]:w-[320px] shrink-0 space-y-5">
              {/* Cabin Class Filter */}
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
                    { id: 'First Class', label: 'First Class' },
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

              {/* Price Filter */}
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
                          transform: minPercent < 15 ? 'translate(0%, -28px)' : minPercent > 85 ? 'translate(-100%, -28px)' : 'translate(-50%, -28px)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        £{minPrice.toLocaleString()}
                      </span>
                      <span
                        className="absolute text-[12px] font-semibold font-poppins text-[#1F0060] bg-white border border-[#E2E8F0] px-2 py-0.5 rounded shadow-sm select-none z-50 pointer-events-none transition-all duration-75"
                        style={{
                          left: `${maxPercent}%`,
                          transform: maxPercent > 85 ? 'translate(-100%, -28px)' : maxPercent < 15 ? 'translate(0%, -28px)' : 'translate(-50%, -28px)',
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

              {/* Destinations Filter */}
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

            {/* Flights List */}
            <div className="flex-grow min-w-0">
              {isLoading ? (
                <div className="border border-[#E2E8F0] py-[60px] px-[30px] rounded-[24px] text-center bg-white flex flex-col items-center justify-center gap-3 shadow-sm">
                  <div className="w-8 h-8 border-4 border-[#5CACC4] border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-500 font-poppins text-sm">Fetching flight fares...</p>
                </div>
              ) : filteredFares.length > 0 ? (
                <div className="border border-[#E2E8F0] py-4 px-3 sm:py-6 sm:px-5 min-[1360px]:py-[30px] min-[1360px]:px-[28px] rounded-[24px] overflow-hidden bg-white shadow-sm">
                  <FlightCard
                    cities={[{ ...airlineData, fares: filteredFares }]}
                    cols={1}
                  />
                </div>
              ) : (
                <div className="border border-[#E2E8F0] py-[60px] px-[30px] rounded-[24px] text-center bg-white shadow-sm">
                  <p className="text-gray-600 font-poppins font-medium text-[16px]">No fares match your selected filters.</p>
                  <button
                    onClick={() => {
                      setStopoverFilter('Any');
                      setSelectedClass('Business');
                      setMinPrice(absoluteMinPrice);
                      setMaxPrice(absoluteMaxPrice);
                      setCheckedDestinations(new Set());
                      setSearchDestination('');
                    }}
                    className="mt-4 px-6 py-2.5 bg-[#1F0060] hover:bg-[#2b0380] text-white font-poppins text-sm font-semibold rounded-[10px] transition-colors shadow-sm"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Pagination / Load More */}
          {currentPage < lastPage && (
            <div className="text-center mb-10 flex items-center justify-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="flex items-center justify-center gap-2 px-7 py-3 rounded-[12px] font-poppins font-semibold text-[15px] transition-all duration-300 text-center bg-[#5CACC4] hover:bg-[#4ea0b8] text-white shadow-[0_4px_16px_rgba(92,172,196,0.25)]"
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

          {airlineData?.scroll_description?.trim() && (
            <ScrollDetail description={airlineData.scroll_description} />
          )}
        </div>
      </div>

      {typeof airlineData?.faq_widget?.[0]?.faq_ids === 'string' && (
        <div className="mx-auto sm:pt-16 pt-8 pb-4">
          <FaqSection
            faq_ids={airlineData.faq_widget[0].faq_ids
              .split(',')
              .map((id) => parseInt(id.trim()))
              .filter((id) => !isNaN(id))}
            heading={airlineData.faq_widget[0].heading}
            subheading={airlineData.faq_widget[0].sub_heading}
          />
        </div>
      )}
    </>
  );
}
