"use client";
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import axios from 'axios';
import BrandingSection from '../../../Components/BrandingSection';
import FlightCard from '../../../Components/FlightCard';
import { BASE_URL_IMG } from '../../../Helpers/imageurl';
import ScrollDetail from '../../../Components/ScrollDetail';
import FaqSection from '../../../Components/FaqSection';
import NotFound from "../../../Not-found";
import BannerInner from '../../../Components/BannerInner';
import { endpoints } from '../../../Helpers/endpoints';

export default function AirlinesDetailsClient({ initialAirlineData, airlineSlug }) {
  const [airlineData] = useState(initialAirlineData);

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
  const [isStopoversOpen, setIsStopoversOpen] = useState(true);
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

  const bannerContent = airlineData.banner_section_content || '';
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
          border: 2px solid #a57233;
          cursor: pointer;
          -webkit-appearance: none;
        }
        .dual-slider-input::-moz-range-thumb {
          pointer-events: auto;
          width: 16px;
          height: 16px;
          border-radius: 4px;
          background: #ffffff;
          border: 2px solid #a57233;
          cursor: pointer;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #A57233;
          opacity:0.3;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #A57233;
          opacity:0.3;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #A57233;
          opacity:0.5;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #E3DAC9 #FAF5ED;
        }
      `}</style>
      <BannerInner
        bgImageOverride={airlineData?.banner_img?.[0]?.url}
        descriptionOverride={bannerContent}
        showClassSelector={true}
        onClassChange={(newClass) => setSelectedClass(newClass)}
      />
      <div className="container">
        <div className="w-full mx-auto pt-[55px]">
          <div className='heading_section'>
            <h2 className='pre_heading'>
              {airlineData.page_title}
            </h2>
            <p className='sub_text'>
              {airlineData.page_sub_title || `Your trusted partner for the best ${airlineData.title} flight deals, with unbeatable fares and exceptional service.`}
            </p>
          </div>

          <div className="flex flex-col min-[1285px]:flex-row gap-8 mt-6 mb-9">
            {/* Sidebar Filters */}
            <div className="w-full min-[1285px]:w-[330px] shrink-0 space-y-5">
              {/* Stopovers Filter */}
              {/* <div className="bg-[#FFFAF5] rounded-[24px] p-5 border border-[#E3DAC9]">
                <div
                  className="flex justify-between items-center cursor-pointer select-none"
                  onClick={() => setIsStopoversOpen(!isStopoversOpen)}
                >
                  <div className="flex items-center gap-2">
                    <h3 className="text-secondary text-[18px] font-bold font-quicksand">Stopovers</h3>
                    <svg xmlns="http://www.w3.org/2000/svg" width="40.5" height="3.469" viewBox="0 0 40.5 3.469">
                      <g transform="translate(-60 -27.531)">
                        <line x2="29" transform="translate(60.5 28.031)" fill="none" stroke="#a57233" strokeLinecap="round" strokeWidth="1" />
                        <line x2="29" transform="translate(71 30.5)" fill="none" stroke="#a57233" strokeLinecap="round" strokeWidth="1" />
                      </g>
                    </svg>
                  </div>
                  <svg
                    className={`w-4 h-4 text-secondary transition-transform duration-300 ${isStopoversOpen ? '' : '-rotate-180'}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
                <div className={`transition-all duration-300 overflow-hidden ${isStopoversOpen ? 'max-h-[100px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="grid grid-cols-4 gap-2">
                    {['Direct', '01 Stop', '02 Stops+', 'Any'].map((type) => {
                      const isActive = stopoverFilter === type;
                      return (
                        <button
                          key={type}
                          onClick={() => setStopoverFilter(type)}
                          className={`text-[13px] font-semibold font-quicksand py-2 px-1 rounded-xl shadow-sm text-center transition-all ${isActive
                            ? 'bg-[#F1A868] text-white'
                            : 'bg-white hover:bg-white/80 text-[#363636] border border-[#EBE3D5]'
                            }`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div> */}

              {/* Price Filter */}
              <div className="bg-[#FFFAF5] rounded-[24px] p-5 border border-[#E3DAC9]">
                <div
                  className="flex justify-between items-center cursor-pointer select-none"
                  onClick={() => setIsPriceOpen(!isPriceOpen)}
                >
                  <div className="flex items-center gap-2">
                    <h3 className="text-secondary text-[18px] font-bold font-quicksand">Price</h3>
                    <svg xmlns="http://www.w3.org/2000/svg" width="40.5" height="3.469" viewBox="0 0 40.5 3.469">
                      <g transform="translate(-60 -27.531)">
                        <line x2="29" transform="translate(60.5 28.031)" fill="none" stroke="#a57233" strokeLinecap="round" strokeWidth="1" />
                        <line x2="29" transform="translate(71 30.5)" fill="none" stroke="#a57233" strokeLinecap="round" strokeWidth="1" />
                      </g>
                    </svg>
                  </div>
                  <svg
                    className={`w-4 h-4 text-secondary transition-transform duration-300 ${isPriceOpen ? '' : '-rotate-180'}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
                <div className={`transition-all duration-300 overflow-hidden ${isPriceOpen ? 'max-h-[140px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="space-y-4 px-2 pb-4">
                    <div className="relative h-12 flex items-end pb-1 mt-6">
                      <div className="absolute h-0.5 bg-[#E6DEC9] w-full rounded-full" />
                      <div
                        className="absolute h-0.5 bg-secondary rounded-full"
                        style={{
                          left: `${minPercent}%`,
                          width: `${maxPercent - minPercent}%`,
                        }}
                      />
                      <span
                        className="absolute text-[12px] font-light font-quicksand text-secondary px-1.5 py-0.5 rounded shadow-sm select-none z-50 pointer-events-none transition-all duration-75"
                        style={{
                          left: `${minPercent}%`,
                          transform: minPercent < 15 ? 'translate(0%, -26px)' : minPercent > 85 ? 'translate(-100%, -26px)' : 'translate(-50%, -26px)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        £{minPrice.toLocaleString()}
                      </span>
                      <span
                        className="absolute text-[12px] font-light font-quicksand text-secondary px-1.5 py-0.5 rounded shadow-sm select-none z-50 pointer-events-none transition-all duration-75"
                        style={{
                          left: `${maxPercent}%`,
                          transform: maxPercent > 85 ? 'translate(-100%, -26px)' : maxPercent < 15 ? 'translate(0%, -26px)' : 'translate(-50%, -26px)',
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
              <div className="bg-[#FFFAF5] rounded-[24px] p-5 border border-[#E3DAC9]">
                <div
                  className="flex justify-between items-center cursor-pointer select-none"
                  onClick={() => setIsDestinationsOpen(!isDestinationsOpen)}
                >
                  <div className="flex items-center gap-2">
                    <h3 className="text-secondary text-[18px] font-bold font-quicksand">Destinations</h3>
                    <svg xmlns="http://www.w3.org/2000/svg" width="40.5" height="3.469" viewBox="0 0 40.5 3.469">
                      <g transform="translate(-60 -27.531)">
                        <line x2="29" transform="translate(60.5 28.031)" fill="none" stroke="#a57233" strokeLinecap="round" strokeWidth="1" />
                        <line x2="29" transform="translate(71 30.5)" fill="none" stroke="#a57233" strokeLinecap="round" strokeWidth="1" />
                      </g>
                    </svg>
                  </div>
                  <svg
                    className={`w-4 h-4 text-secondary transition-transform duration-300 ${isDestinationsOpen ? '' : '-rotate-180'}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
                <div className={`transition-all duration-300 overflow-hidden ${isDestinationsOpen ? 'max-h-[300px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="relative mb-4 px-[19px]">
                    <input
                      type="text"
                      placeholder="Search Destination"
                      value={searchDestination}
                      onChange={(e) => setSearchDestination(e.target.value)}
                      className="w-full bg-transparent border-b border-[#E3DAC9] py-1 pr-6 text-[13px] font-quicksand text-black placeholder-black/30 focus:outline-none focus:border-secondary"
                    />
                    <svg className="w-3.5 h-3.5 text-black/40 absolute right-1 top-2" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  </div>
                  <div className="border border-[#F3EDE2] rounded-2xl bg-[#FFF3E8] p-4 max-h-[180px] overflow-y-auto space-y-3 custom-scrollbar">
                    {filteredDestinationsList.length > 0 ? (
                      filteredDestinationsList.map((destination, idx) => {
                        const isChecked = checkedDestinations.has(destination);
                        return (
                          <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative flex-shrink-0">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleDestination(destination)}
                                className="sr-only"
                              />
                              <div className={`w-[18px] h-[18px] rounded-full border border-secondary/60 flex items-center justify-center transition-all ${isChecked ? 'bg-secondary border-secondary' : 'bg-white'
                                }`}>
                                <svg className={`w-2.5 h-2.5 text-white transition-opacity ${isChecked ? 'opacity-100' : 'opacity-0'}`} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              </div>
                            </div>
                            <span className="text-[14px] text-black font-quicksand font-medium leading-none select-none">{destination}</span>
                          </label>
                        );
                      })
                    ) : (
                      <p className="text-[12px] text-gray-500 text-center py-2 font-quicksand">No destinations found</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Flights List */}
            <div className="flex-grow min-w-0">
              {isLoading ? (
                <div className="border border-[#F2E9DE] py-[60px] px-[30px] rounded-3xl text-center bg-white flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-500 font-quicksand text-sm">Fetching flight fares...</p>
                </div>
              ) : filteredFares.length > 0 ? (
                <div className="border border-[#F2E9DE] py-4 px-3 sm:py-6 sm:px-5 min-[1360px]:py-[34px] min-[1360px]:px-[30px] rounded-3xl overflow-hidden bg-white">
                  <FlightCard
                      cities={[{ ...airlineData, fares: filteredFares }]}
                    cols={1}
                  />
                </div>
              ) : (
                <div className="border border-[#F2E9DE] py-[60px] px-[30px] rounded-3xl text-center bg-white">
                  <p className="text-gray-500 font-quicksand font-medium text-[16px]">No fares match your selected filters.</p>
                  <button
                    onClick={() => {
                      setStopoverFilter('Any');
                          setSelectedClass('Business');
                      setMinPrice(absoluteMinPrice);
                      setMaxPrice(absoluteMaxPrice);
                      setCheckedDestinations(new Set());
                      setSearchDestination('');
                    }}
                    className="mt-4 px-5 py-2 bg-secondary text-white font-quicksand text-sm font-semibold rounded-xl hover:bg-secondary/90 transition-colors"
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
                className="flex items-center justify-center gap-2 w-[fit-content] px-4 py-2.5 rounded-10 font-quicksand font-bold transition-all duration-300 text-center bg-tertiary text-white shadow-[-11px_-2px_41px_10px_#EEDFD1]"
              >
                {loadingMore ? (
                  <>
                    <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                      Load More
                      <svg
                        className="w-3.5 h-3.5 text-white group-hover:translate-x-1.5 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="3"
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
