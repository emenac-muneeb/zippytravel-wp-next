"use client";
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import axios from 'axios';
import CommonHeroSection from '../../Components/CommonHeroSection';
import BrandingSection from '../../Components/BrandingSection';
import FlightCard from '../../Components/FlightCard';
import useDestinationBreadcrumbs from '../../Hooks/useDestinationsBreadcrumbs';
import ScrollDetail from '../../Components/ScrollDetail';
import ScrollDetailRight from '../../Components/ScrollDetailRight';
import FaqSection from '../../Components/FaqSection';
import { BASE_URL_IMG } from '../../Helpers/imageurl';
import BannerInner from '../../Components/BannerInner';
import { endpoints } from '../../Helpers/endpoints';
import { FlightFareCardSkeleton } from '../../Components/common/Skeleton';

/** city-fares: omit class / class=0 → Business; 1 → Premium; 3 → First. */
function getCityFaresClassParam(selectedClass) {
    if (selectedClass === 'Premium Economy') return 1;
    if (selectedClass === 'First Class') return 3;
    return undefined; // Business (API default)
}

export default function CityFlightFaresClient({ initialData, params }) {
    const breadcrumbs = useDestinationBreadcrumbs();
    const [cityData, setCityData] = useState(initialData);

    // Initial fares extraction (SSR should already be Business via enrichPageResult)
    const initialFaresList = useMemo(() => {
        if (!initialData?.fares) return [];
        return Array.isArray(initialData.fares) ? initialData.fares : (initialData.fares.data || []);
    }, [initialData]);

    const initialLastPage = useMemo(() => {
        if (initialData?.fares && !Array.isArray(initialData.fares)) {
            return initialData.fares.last_page || 1;
        }
        return 1;
    }, [initialData]);

    // Active fares & pagination state
    const [faresList, setFaresList] = useState(initialFaresList);
    const [currentPage, setCurrentPage] = useState(initialData?.fares?.current_page || 1);
    const [lastPage, setLastPage] = useState(initialLastPage);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    // Filter states — Business matches BannerInner + city-fares API default
    const [selectedClass, setSelectedClass] = useState('Business');
    const [stopoverFilter, setStopoverFilter] = useState('Any');
    const [searchAirline, setSearchAirline] = useState('');
    const [checkedAirlines, setCheckedAirlines] = useState(new Set());

    // Fixed price range from 0 to 10000
    const absoluteMinPrice = 0;
    const absoluteMaxPrice = 10000;

    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(10000);

    // Collapsible states
    const [isStopoversOpen, setIsStopoversOpen] = useState(true);
    const [isPriceOpen, setIsPriceOpen] = useState(true);
    const [isAirlinesOpen, setIsAirlinesOpen] = useState(true);

    const handleClassChange = useCallback((newClass) => {
        setSelectedClass(newClass);
    }, []);

    // Unique airlines list from loaded fares (updates when class changes)
    const uniqueAirlines = useMemo(() => {
        const list = faresList
            .map(f => f.airline?.title || f.airline_name)
            .filter(Boolean);
        return Array.from(new Set(list));
    }, [faresList]);

    const filteredAirlinesList = useMemo(() => {
        return uniqueAirlines.filter(name =>
            name.toLowerCase().includes(searchAirline.toLowerCase())
        );
    }, [uniqueAirlines, searchAirline]);

    const toggleAirline = (name) => {
        setCheckedAirlines(prev => {
            const next = new Set(prev);
            if (next.has(name)) {
                next.delete(name);
            } else {
                next.add(name);
            }
            return next;
        });
    };

    // API call to fetch fares by city slug, class, price, airline & pagination
    const fetchFares = useCallback(async (pageToFetch = 1, isAppend = false) => {
        try {
            if (isAppend) {
                setLoadingMore(true);
            } else {
                setIsLoading(true);
            }

            const citySlug = cityData?.slug || (params?.slug ? params.slug[params.slug.length - 1] : '');

            const paramsObj = {
                slug: citySlug,
                page: pageToFetch,
                per_page: 12,
            };

            const classParam = getCityFaresClassParam(selectedClass);
            if (classParam !== undefined) {
                paramsObj.class = classParam;
            }

            // Min and Max price filters
            if (minPrice !== undefined && minPrice > absoluteMinPrice) {
                paramsObj.min_price = minPrice;
            }
            if (maxPrice !== undefined && maxPrice < absoluteMaxPrice) {
                paramsObj.max_price = maxPrice;
            }

            // Airline filter
            if (checkedAirlines.size > 0) {
                paramsObj.airline = Array.from(checkedAirlines).join(',');
            }

            const res = await axios.get(endpoints.cityFares, { params: paramsObj });
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
            } else if (!isAppend) {
                setFaresList([]);
                setLastPage(1);
                setCurrentPage(1);
            }
        } catch (err) {
            console.error("Error fetching city fares:", err);
            if (!isAppend) {
                setFaresList([]);
            }
        } finally {
            setIsLoading(false);
            setLoadingMore(false);
        }
    }, [cityData, params, selectedClass, minPrice, maxPrice, checkedAirlines, absoluteMinPrice, absoluteMaxPrice]);

    // Trigger API call on filter changes (debounced). Skip first paint — SSR already has Business fares.
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
    }, [selectedClass, minPrice, maxPrice, checkedAirlines, fetchFares]);

    // Handle load more
    const handleLoadMore = () => {
        if (currentPage < lastPage && !loadingMore) {
            fetchFares(currentPage + 1, true);
        }
    };

    // Client-side filter for stopover on loaded fares
    const filteredFares = useMemo(() => {
        return faresList.filter(fare => {
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
    }, [faresList, stopoverFilter]);

    if (!cityData) return null;

    const bannerContent = cityData.banner_section_content || '';
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
                bgImageOverride={cityData?.banner_img?.[0]?.url}
                descriptionOverride={bannerContent}
                showClassSelector={true}
                onClassChange={handleClassChange}
            />
            <div className="container">
                <div className='w-full mx-auto pt-[55px]'>
                    <div className='heading_section'>
                        <h2 className='pre_heading'>
                            {cityData.page_title}
                        </h2>
                        <p className='sub_text'>
                            {`Your trusted partner for the best flight deals to ${cityData.title}, with unbeatable fares and exceptional service.`}
                        </p>
                    </div>
                    <div className="flex flex-col min-[1285px]:flex-row gap-8 mt-6 mb-9">
                        {/* Sidebar Filters */}
                        <div className="w-full min-[1285px]:w-[290px] min-[1360px]:w-[330px] shrink-0 space-y-5">
                            {/* Stopovers Filter */}
                            {/* <div className="bg-[#FFFAF5] rounded-[24px] p-4 sm:p-5 border border-[#E3DAC9]">
                                <div
                                    className="flex justify-between items-center cursor-pointer select-none"
                                    onClick={() => setIsStopoversOpen(!isStopoversOpen)}
                                >
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-secondary text-[18px] font-bold font-quicksand">Stopovers</h3>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="40.5" height="3.469" viewBox="0 0 40.5 3.469">
                                            <g id="Group_4204" data-name="Group 4204" transform="translate(-60 -27.531)">
                                                <line id="Line_49" data-name="Line 49" x2="29" transform="translate(60.5 28.031)" fill="none" stroke="#a57233" strokeLinecap="round" strokeWidth="1" />
                                                <line id="Line_50" data-name="Line 50" x2="29" transform="translate(71 30.5)" fill="none" stroke="#a57233" strokeLinecap="round" strokeWidth="1" />
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
                                    <div className="grid grid-cols-2 min-[380px]:grid-cols-4 gap-2">
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
                            <div className="bg-[#FFFAF5] rounded-[24px] p-4 sm:p-5 border border-[#E3DAC9]">
                                <div
                                    className="flex justify-between items-center cursor-pointer select-none"
                                    onClick={() => setIsPriceOpen(!isPriceOpen)}
                                >
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-secondary text-[18px] font-bold font-quicksand">Price</h3>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="40.5" height="3.469" viewBox="0 0 40.5 3.469">
                                            <g id="Group_4204" data-name="Group 4204" transform="translate(-60 -27.531)">
                                                <line id="Line_49" data-name="Line 49" x2="29" transform="translate(60.5 28.031)" fill="none" stroke="#a57233" strokeLinecap="round" strokeWidth="1" />
                                                <line id="Line_50" data-name="Line 50" x2="29" transform="translate(71 30.5)" fill="none" stroke="#a57233" strokeLinecap="round" strokeWidth="1" />
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
                                                style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
                                            />
                                            <span 
                                                className="absolute text-[12px] font-light font-quicksand text-secondary px-1.5 py-0.5 rounded shadow-sm select-none z-50 pointer-events-none transition-all duration-75" 
                                                style={{ 
                                                    left: `${minPercent}%`, 
                                                    transform: minPercent < 15 ? 'translate(0%, -26px)' : minPercent > 85 ? 'translate(-100%, -26px)' : 'translate(-50%, -26px)', 
                                                    whiteSpace: 'nowrap' 
                                                }}
                                            >
                                                £{minPrice.toLocaleString()}
                                            </span>
                                            <span 
                                                className="absolute text-[12px] font-light font-quicksand text-secondary px-1.5 py-0.5 rounded shadow-sm select-none z-50 pointer-events-none transition-all duration-75" 
                                                style={{ 
                                                    left: `${maxPercent}%`, 
                                                    transform: maxPercent > 85 ? 'translate(-100%, -26px)' : maxPercent < 15 ? 'translate(0%, -26px)' : 'translate(-50%, -26px)', 
                                                    whiteSpace: 'nowrap' 
                                                }}
                                            >
                                                £{maxPrice.toLocaleString()}
                                            </span>
                                            <input type="range" min={absoluteMinPrice} max={absoluteMaxPrice} value={minPrice} onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice))} className="dual-slider-input absolute w-full pointer-events-none appearance-none bg-transparent h-1 focus:outline-none z-30" />
                                            <input type="range" min={absoluteMinPrice} max={absoluteMaxPrice} value={maxPrice} onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice))} className="dual-slider-input absolute w-full pointer-events-none appearance-none bg-transparent h-1 focus:outline-none z-40" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Airlines Filter */}
                            <div className="bg-[#FFFAF5] rounded-[24px] p-4 sm:p-5 border border-[#E3DAC9]">
                                <div
                                    className="flex justify-between items-center cursor-pointer select-none"
                                    onClick={() => setIsAirlinesOpen(!isAirlinesOpen)}
                                >
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-secondary text-[18px] font-bold font-quicksand">Airlines</h3>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="40.5" height="3.469" viewBox="0 0 40.5 3.469">
                                            <g id="Group_4204" data-name="Group 4204" transform="translate(-60 -27.531)">
                                                <line id="Line_49" data-name="Line 49" x2="29" transform="translate(60.5 28.031)" fill="none" stroke="#a57233" strokeLinecap="round" strokeWidth="1" />
                                                <line id="Line_50" data-name="Line 50" x2="29" transform="translate(71 30.5)" fill="none" stroke="#a57233" strokeLinecap="round" strokeWidth="1" />
                                            </g>
                                        </svg>
                                    </div>
                                    <svg
                                        className={`w-4 h-4 text-secondary transition-transform duration-300 ${isAirlinesOpen ? '' : '-rotate-180'}`}
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                    </svg>
                                </div>
                                <div className={`transition-all duration-300 overflow-hidden ${isAirlinesOpen ? 'max-h-[300px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="relative mb-4 px-[19px]">
                                        <input
                                            type="text"
                                            placeholder="Search Airline"
                                            value={searchAirline}
                                            onChange={(e) => setSearchAirline(e.target.value)}
                                            className="w-full bg-transparent border-b border-[#E3DAC9] py-1 pr-6 text-[13px] font-quicksand text-black placeholder-black/30 focus:outline-none focus:border-secondary"
                                        />
                                        <svg className="w-3.5 h-3.5 text-black/40 absolute right-1 top-2" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                        </svg>
                                    </div>
                                    <div className=" border border-[#F3EDE2] rounded-2xl bg-[#FFF3E8] p-4 max-h-[180px] overflow-y-auto space-y-3 custom-scrollbar">
                                        {filteredAirlinesList.length > 0 ? (
                                            filteredAirlinesList.map((airline, idx) => {
                                                const isChecked = checkedAirlines.has(airline);
                                                return (
                                                    <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                                                        <div className="relative flex-shrink-0">
                                                            <input type="checkbox" checked={isChecked} onChange={() => toggleAirline(airline)} className="sr-only" />
                                                            <div className={`w-[18px] h-[18px] rounded-full border border-secondary/60 flex items-center justify-center transition-all ${isChecked ? 'bg-secondary border-secondary' : 'bg-white'}`}>
                                                                <svg className={`w-2.5 h-2.5 text-white transition-opacity ${isChecked ? 'opacity-100' : 'opacity-0'}`} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                        <span className="text-[14px] text-black font-quicksand font-medium leading-none select-none">{airline}</span>
                                                    </label>
                                                );
                                            })
                                        ) : (
                                            <p className="text-[12px] text-gray-500 text-center py-2 font-quicksand">No airlines found</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Flights List */}
                        <div className="flex-grow min-w-0">
                            {isLoading ? (
                                <div className="border border-[#F2E9DE] py-4 px-3 sm:py-6 sm:px-5 min-[1360px]:py-[34px] min-[1360px]:px-[30px] rounded-3xl overflow-hidden bg-white space-y-4" aria-busy="true">
                                    {[1, 2, 3, 4].map((i) => (
                                        <FlightFareCardSkeleton key={i} />
                                    ))}
                                </div>
                            ) : filteredFares.length > 0 ? (
                                <div className="border border-[#F2E9DE] py-4 px-3 sm:py-6 sm:px-5 min-[1360px]:py-[34px] min-[1360px]:px-[30px] rounded-3xl overflow-hidden bg-white">
                                        <FlightCard cities={[{ ...cityData, fares: filteredFares }]} cols={1} />
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
                                            setCheckedAirlines(new Set());
                                            setSearchAirline('');
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
                                className="eaf-cta-btn disabled:opacity-50"
                            >
                                {loadingMore ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                            Load More
                                            <img src={`${BASE_URL_IMG}/media/fr-svgs/btnarrow.png`} alt="Arrow" />
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {(cityData?.parsedScrollContent?.hasContent ||
                        (!cityData?.parsedScrollContent && cityData?.description?.trim())) && (
                        <div className="w-full font-quicksand sm:pb-[55px] pb-[30px] relative after:content-[''] after:absolute after:bottom-0 
              after:right-0 after:w-[calc(75%-0px)]  after:h-[70%] after:bg-[#FFFAF5] after:rounded-tl-[40px] after:z-[-1]">
                            <ScrollDetail
                                description={cityData?.description}
                                parsedContent={cityData?.parsedScrollContent}
                            />
                        </div>
                    )}
                    {(cityData?.parsedScrollContent2?.hasContent ||
                        (!cityData?.parsedScrollContent2 && cityData?.scroll_description_2?.trim())) && (
                        <div className="w-full font-quicksand sm:pt-[55px] pt-[30px] relative after:content-[''] after:absolute after:top-0 
              after:right-0 after:w-[calc(75%-0px)]  after:h-[70%] after:bg-[#FFFAF5] after:rounded-bl-[40px] after:z-[-1]">
                            <ScrollDetailRight
                                description={cityData?.scroll_description_2}
                                parsedContent={cityData?.parsedScrollContent2}
                            />
                        </div>
                    )}
                  
                </div>
            </div>
            {typeof cityData?.faq_widget?.[0]?.faq_ids === 'string' && (
                <div className='mx-auto sm:pt-16 pt-8 pb-4'>
                    <FaqSection
                        faq_ids={cityData.faq_widget[0].faq_ids
                            .split(',')
                            .map((id) => parseInt(id.trim()))
                            .filter((id) => !isNaN(id))}
                        heading={cityData.faq_widget[0].heading}
                        subheading={cityData.faq_widget[0].sub_heading}
                        initialFaqs={cityData.initialFaqs}
                    />
                </div>
            )}
        </>
    );
}
