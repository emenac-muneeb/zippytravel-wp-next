"use client";
import React, { useEffect, useMemo, useState } from 'react';
import BannerInner from './BannerInner';
import Flightlist from './Flightlist';
import { useSearchParams } from 'next/navigation';
import LoadingScreen from './LoadingScreen';
import PopUp from './PopUp';
import api from '../Helpers/apiHelper';
import NProgress from 'nprogress';

const FilterAccent = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="40.5" height="3.469" viewBox="0 0 40.5 3.469" aria-hidden>
        <g transform="translate(-60 -27.531)">
            <line x2="29" transform="translate(60.5 28.031)" fill="none" stroke="#a57233" strokeLinecap="round" strokeWidth="1" />
            <line x2="29" transform="translate(71 30.5)" fill="none" stroke="#a57233" strokeLinecap="round" strokeWidth="1" />
        </g>
    </svg>
);

const ChevronIcon = ({ open }) => (
    <svg
        className={`w-4 h-4 text-secondary transition-transform duration-300 ${open ? '' : '-rotate-180'}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        aria-hidden
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);

const FlightCardList = () => {
    const searchParams = useSearchParams();

    let results = null;
    try {
        const resultsStr = searchParams.get('results');
        if (resultsStr) results = JSON.parse(resultsStr);
    } catch (e) {}

    const [BookNowLoading, setBookNowLoading] = useState(false);
    const [popupMessage, setPopupMessage] = useState(null);
    const [stopoverFilter, setStopoverFilter] = useState('Any');
    const [selectedAirlines, setSelectedAirlines] = useState([]);
    const [searchAirline, setSearchAirline] = useState('');
    const [fetchedResults, setFetchedResults] = useState(null);
    const [loadingRes, setLoadingRes] = useState(() => !results);
    const [originLabel, setOriginLabel] = useState('');
    const [destinationLabel, setDestinationLabel] = useState('');

    const [isStopoversOpen, setIsStopoversOpen] = useState(true);
    const [isPriceOpen, setIsPriceOpen] = useState(true);
    const [isAirlinesOpen, setIsAirlinesOpen] = useState(true);

    const searchKey = searchParams.toString();

    useEffect(() => {
        const origin = searchParams.get("Origin") || "";
        const destination = searchParams.get("Destination") || "";
        if (!origin || !destination) {
            setLoadingRes(false);
            setBookNowLoading(false);
            NProgress.done(true);
            return;
        }

        let airlineCode = "";
        try {
            const savedData = JSON.parse(localStorage.getItem("flightFormData") || "{}");
            airlineCode = Array.isArray(savedData.selectedAirlines)
                ? savedData.selectedAirlines.join(",")
                : "";
        } catch (e) {}

        const tripTypeCode = searchParams.get("TripType") === "Round-Trip" ? "RT" : "OW";
        const body = {
            TripType: tripTypeCode || "OW",
            Origin: origin,
            Destination: destination,
            AirlineCode: airlineCode,
            DepartDate: searchParams.get("DepartDate") || "",
            ArrivalDate: searchParams.get("ArrivalDate") || "",
            Class: searchParams.get("Class") || "",
            IsFlexibleDate: false,
            IsDirectFlight: false,
            NoOfAdultPax: searchParams.get("NoOfAdultPax"),
            NoOfChildPax: searchParams.get("NoOfChildPax"),
            NoOfInfantPax: searchParams.get("NoOfInfantPax"),
            NoOfYouthPax: 0,
            CompanyCode: "BS6593",
            WebsiteName: "zippytravel.co.uk",
            ApplicationAccessMode: "LIVE",
            username: "BS6593",
            password: "#Bs65@93z1pPyTrAvEl_Live"
        };

        const controller = new AbortController();
        setLoadingRes(true);
        setFetchedResults(null);

        api.post("/flightsearch", body, { signal: controller.signal })
            .then((res) => {
                const data = res.data;
                if (data?.apiFault) {
                    setPopupMessage(data?.apiFault?.errorDescription || "Flight Pricing Failed.");
                    setFetchedResults(null);
                    return;
                }
                if (data?.result?.token) {
                    localStorage.setItem("FlightToken", data.result.token);
                }
                setFetchedResults(data);
            })
            .catch((err) => {
                if (controller.signal.aborted || err?.name === "CanceledError" || err?.code === "ERR_CANCELED") {
                    return;
                }
                console.error("Error fetching Flights:", err);
                setPopupMessage(err.message || "Flight Search Failed.");
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoadingRes(false);
                    setBookNowLoading(false);
                    NProgress.done(true);
                }
            });

        return () => controller.abort();
    }, [searchKey]);

    const finalResults = results || fetchedResults;

    useEffect(() => {
        let parsedData = {};
        try {
            const savedData = localStorage.getItem("flightFormData");
            parsedData = savedData ? JSON.parse(savedData) : {};
        } catch (e) {
            parsedData = {};
        }
        setOriginLabel(parsedData.originLabel || searchParams.get("Originlabel") || '');
        setDestinationLabel(parsedData.destinationLabel || searchParams.get("Destinationlabel") || '');
    }, [searchParams]);

    const prices = finalResults?.result?.airSolutions
        ?.map(f => parseInt(f.pricingInfos?.[0]?.totalPrice || 0))
        .filter(p => p > 0) || [];

    const absoluteMinPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const absoluteMaxPrice = prices.length > 0 ? Math.max(...prices) : 10000;

    const [minPrice, setMinPrice] = useState(absoluteMinPrice);
    const [maxPrice, setMaxPrice] = useState(absoluteMaxPrice);

    useEffect(() => {
        if (finalResults?.result?.airSolutions?.length > 0 && absoluteMinPrice <= absoluteMaxPrice) {
            setMinPrice(absoluteMinPrice);
            setMaxPrice(absoluteMaxPrice);
        }
    }, [finalResults, absoluteMinPrice, absoluteMaxPrice]);

    const minPercent = ((minPrice - absoluteMinPrice) / (absoluteMaxPrice - absoluteMinPrice || 1)) * 100;
    const maxPercent = ((maxPrice - absoluteMinPrice) / (absoluteMaxPrice - absoluteMinPrice || 1)) * 100;

    const filteredResults = useMemo(() => {
        if (!finalResults?.result?.airSolutions) return [];

        const airSolutions = finalResults.result.airSolutions;

        return airSolutions.filter(flight => {
            const price = parseFloat(flight.pricingInfos?.[0]?.totalPrice ?? flight.totalPrice ?? 0);
            const inPriceRange = price >= minPrice && price <= maxPrice;

            const journey = flight?.journey?.[0];
            const optionInfo = journey?.optionInfos?.[0];
            const firstSegment = optionInfo?.airSegmentInfos?.[0];
            const airlineName = firstSegment?.airlineName || '';
            const stops = (optionInfo?.airSegmentInfos?.length || 1) - 1;

            let stopMatch = true;
            if (stopoverFilter === 'Direct') stopMatch = stops === 0;
            else if (stopoverFilter === '01 Stop') stopMatch = stops === 1;
            else if (stopoverFilter === '02 Stops+') stopMatch = stops >= 2;

            const airlineMatch =
                selectedAirlines.length === 0 || selectedAirlines.includes(airlineName);

            return inPriceRange && airlineMatch && stopMatch;
        });
    }, [finalResults, minPrice, maxPrice, selectedAirlines, stopoverFilter]);

    const toggleAirline = (name) => {
        setSelectedAirlines((prev) =>
            prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
        );
    };

    const filteredAirlinesList = useMemo(() => {
        return (finalResults?.result?.distinctAirlines || []).filter((airline) =>
            (airline?.airlineName || "").toLowerCase().includes(searchAirline.toLowerCase())
        );
    }, [finalResults, searchAirline]);

    const resetFilters = () => {
        setStopoverFilter('Any');
        setMinPrice(absoluteMinPrice);
        setMaxPrice(absoluteMaxPrice);
        setSelectedAirlines([]);
        setSearchAirline('');
    };

    if (loadingRes || BookNowLoading) return <LoadingScreen />;

    const flightCount = filteredResults.length;
    const originShort = originLabel?.split(' - ')?.[0] || originLabel || searchParams.get("Origin") || 'Origin';
    const destinationShort = destinationLabel?.split(' - ')?.[0] || destinationLabel || searchParams.get("Destination") || 'Destination';

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

            {popupMessage && (
                <PopUp
                    title="Error"
                    message={popupMessage}
                    onClose={() => setPopupMessage(null)}
                />
            )}

            <BannerInner
                bgImageOverride="/flightdetail.png"
                pageBannerOnly
                setFlightLoading={setBookNowLoading}
                setPopupMessage={setPopupMessage}
            />

            <div className="container">
                <div className="w-full mx-auto pt-[40px] sm:pt-[55px] pb-10">
                    <div className="heading_section">
                        <h2 className="pre_heading font-quicksand">
                            {flightCount} {flightCount === 1 ? 'Flight' : 'Flights'} Found
                        </h2>
                        <p className="sub_text font-quicksand">
                            {originShort} to {destinationShort}
                            <span className="block text-[14px] sm:text-[16px] text-black/50 mt-1">
                                Fares change frequently — book soon to lock in the best price. All times shown are airport local time.
                            </span>
                        </p>
                    </div>

                    <div className="flex flex-col min-[1285px]:flex-row gap-8 mt-6 mb-9">
                        {/* Sidebar Filters */}
                        <div className="w-full min-[1285px]:w-[290px] min-[1360px]:w-[330px] shrink-0 space-y-5">
                            {/* Stopovers Filter */}
                            {/* <div className="bg-[#FFFAF5] rounded-[24px] p-4 sm:p-4 border border-[#E3DAC9]">
                                <div
                                    className="flex justify-between items-center cursor-pointer select-none"
                                    onClick={() => setIsStopoversOpen(!isStopoversOpen)}
                                >
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-secondary text-[18px] font-bold font-quicksand">Stopovers</h3>
                                        <FilterAccent />
                                    </div>
                                    <ChevronIcon open={isStopoversOpen} />
                                </div>
                                <div className={`transition-all duration-300 overflow-hidden ${isStopoversOpen ? 'max-h-[100px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="grid grid-cols-2 min-[380px]:grid-cols-4 gap-2">
                                        {['Direct', '01 Stop', '02 Stops+', 'Any'].map((type) => {
                                            const isActive = stopoverFilter === type;
                                            return (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setStopoverFilter(type)}
                                                    className={`text-[11px] font-semibold font-quicksand py-2 px-1 rounded-xl shadow-sm text-center transition-all ${isActive
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
                            <div className="bg-[#FFFAF5] rounded-[24px] p-4 sm:p-4 border border-[#E3DAC9]">
                                <div
                                    className="flex justify-between items-center cursor-pointer select-none"
                                    onClick={() => setIsPriceOpen(!isPriceOpen)}
                                >
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-secondary text-[18px] font-bold font-quicksand">Price</h3>
                                        <FilterAccent />
                                    </div>
                                    <ChevronIcon open={isPriceOpen} />
                                </div>
                                <div className={`transition-all duration-300 overflow-hidden ${isPriceOpen ? 'max-h-[120px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="space-y-4 px-1 pb-4">
                                        <div className="relative h-12 flex items-end pb-1 mt-6">
                                            <div className="absolute h-0.5 bg-[#E6DEC9] w-full rounded-full" />
                                            <div
                                                className="absolute h-0.5 bg-secondary rounded-full"
                                                style={{
                                                    left: `${minPercent}%`,
                                                    width: `${Math.max(maxPercent - minPercent, 0)}%`
                                                }}
                                            />
                                            <span
                                                className="absolute text-[12px] font-light font-quicksand text-secondary px-2 py-0.5 rounded shadow-sm select-none z-10 pointer-events-none"
                                                style={{
                                                    left: `${5}%`,
                                                    transform: 'translate(-50%, -26px)',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                £{minPrice.toLocaleString()}
                                            </span>
                                            <span
                                                className="absolute text-[12px] font-light font-quicksand text-secondary px-2 py-0.5 rounded shadow-sm select-none z-10 pointer-events-none"
                                                style={{
                                                    left: `${100 - 6}%`,
                                                    transform: 'translate(-50%, -26px)',
                                                    whiteSpace: 'nowrap'
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
                                                className="dual-slider-input absolute w-full pointer-events-none appearance-none bg-transparent h-1 focus:outline-none z-10"
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
                                                className="dual-slider-input absolute w-full pointer-events-none appearance-none bg-transparent h-1 focus:outline-none z-10"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Airlines Filter */}
                            <div className="bg-[#FFFAF5] rounded-[24px] p-4 sm:p-4 border border-[#E3DAC9]">
                                <div
                                    className="flex justify-between items-center cursor-pointer select-none"
                                    onClick={() => setIsAirlinesOpen(!isAirlinesOpen)}
                                >
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-secondary text-[18px] font-bold font-quicksand">Airlines</h3>
                                        <FilterAccent />
                                    </div>
                                    <ChevronIcon open={isAirlinesOpen} />
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
                                        <svg className="w-3.5 h-3.5 text-black/40 absolute right-1 top-2" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                        </svg>
                                    </div>
                                    <div className="border border-[#F3EDE2] rounded-2xl bg-[#FFF3E8] p-4 max-h-[180px] overflow-y-auto space-y-3 custom-scrollbar">
                                        {filteredAirlinesList.length > 0 ? (
                                            filteredAirlinesList.map((airline, idx) => {
                                                const isChecked = selectedAirlines.includes(airline.airlineName);
                                                return (
                                                    <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                                                        <div className="relative flex-shrink-0">
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={() => toggleAirline(airline.airlineName)}
                                                                className="sr-only"
                                                            />
                                                            <div className={`w-[18px] h-[18px] rounded-full border border-secondary/60 flex items-center justify-center transition-all ${isChecked ? 'bg-secondary border-secondary' : 'bg-white'}`}>
                                                                <svg className={`w-2.5 h-2.5 text-white transition-opacity ${isChecked ? 'opacity-100' : 'opacity-0'}`} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                        <span className="text-[14px] text-black font-quicksand font-medium leading-none select-none">{airline?.airlineName}</span>
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

                        {/* Flight List */}
                        <div className="flex-grow min-w-0">
                            {filteredResults.length > 0 ? (
                                <div className="border border-[#F2E9DE] py-4 px-3 sm:py-6 sm:px-5 min-[1360px]:py-[34px] min-[1360px]:px-[30px] rounded-3xl overflow-hidden bg-white">
                                    <Flightlist
                                        results={{ ...finalResults, result: { ...(finalResults?.result || {}), airSolutions: filteredResults } }}
                                        setBookNowLoading={setBookNowLoading}
                                        BookNowLoading={BookNowLoading}
                                        popupMessage={popupMessage}
                                        setPopupMessage={setPopupMessage}
                                        TokenResult={results || fetchedResults}
                                    />
                                </div>
                            ) : (
                                <div className="border border-[#F2E9DE] py-[60px] px-[30px] rounded-3xl text-center bg-white">
                                    <p className="text-gray-500 font-quicksand font-medium text-[16px]">
                                        {finalResults?.result?.airSolutions?.length
                                            ? 'No fares match your selected filters.'
                                            : 'Sorry, there are no flights available for your selected route or date at the moment.'}
                                    </p>
                                    {finalResults?.result?.airSolutions?.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={resetFilters}
                                            className="mt-4 px-5 py-2 bg-secondary text-white font-quicksand text-sm font-semibold rounded-xl hover:bg-secondary/90 transition-colors"
                                        >
                                            Reset Filters
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FlightCardList;
