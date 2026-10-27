"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import api from '../Helpers/apiHelper';
import { stashFlightPrice } from '../Helpers/flightPriceCache';
import EnquiryModal from './EnquiryModal';
import { BASE_URL_IMG } from "../Helpers/imageurl";

const TakeoffIcon = () => <img src={`/media/fr-svgs/takeoff.png`} alt="" aria-hidden />;
const LandingIcon = () => <img src={`/media/fr-svgs/land.png`} alt="" aria-hidden />;
const SeatIcon = () => <img src={`/media/fr-svgs/seaticon.png`} alt="" aria-hidden />;
const PhoneIcon = () => <img src={`/media/fr-svgs/callicon.png`} alt="" aria-hidden />;

const ArrowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="17.411" height="11.09" viewBox="0 0 17.411 11.09" className="group-hover:translate-x-1 transition-transform" aria-hidden>
        <path d="M-838.359,1086.481h-.25c-5.259,0-7.615,0-12.874,0a1.76,1.76,0,0,1-.449-.039.879.879,0,0,1-.616-.991.884.884,0,0,1,.783-.8,2.932,2.932,0,0,1,.345-.012H-838.3c-.086-.092-.134-.148-.186-.2q-1.4-1.4-2.8-2.793a.921.921,0,0,1-.313-.873.873.873,0,0,1,.621-.71.889.889,0,0,1,.938.22c.432.424.857.854,1.285,1.282l3.253,3.257a.935.935,0,0,1,0,1.472c-1.5,1.5-3,2.992-4.487,4.5a.933.933,0,0,1-1.6-.414.889.889,0,0,1,.292-.9q1.4-1.4,2.8-2.794a.829.829,0,0,1,.208-.112Z" transform="translate(852.554 -1080.015)" fill="currentColor" />
    </svg>
);


const Flightlist = ({ results, setBookNowLoading, setPopupMessage, TokenResult }) => {
    const airSolutions = results?.result?.airSolutions || [];

    const router = useRouter();
    const searchParams = useSearchParams();

    const [FightDetailOpen, setFightDetailOpen] = useState(false);
    const [FightDetailData, setFightDetailData] = useState(null);
    const [FlightOptionsOpen, setFlightOptionsOpen] = useState(false);
    const [FlightOptionsData, setFlightOptionsData] = useState({});
    const [EnquiryOpen, setEnquiryOpen] = useState(false);

    const handleOpenModal = ({ departure = [], return: returnSegs = [], flight = null, optIndex = 0 }) => {
        setFightDetailData({ departure, return: returnSegs, flight, optIndex });
        setFightDetailOpen(true);
    };

    const openOptionsModal = (options) => {
        setFlightOptionsData(options);
        setFlightOptionsOpen(true);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleString('en-US', { month: 'short' });
        const weekday = date.toLocaleString('en-US', { weekday: 'short' });
        return `${day} ${month}, ${weekday}`;
    };

    const params = searchParams;

    let parsedData = {};
    try {
        if (typeof window !== 'undefined') {
            const savedData = localStorage.getItem("flightFormData");
            parsedData = savedData ? JSON.parse(savedData) : {};
        }
    } catch (e) {
        parsedData = {};
    }

    const origin = parsedData.originLabel || params.get("Originlabel") || '';
    const destination = parsedData.destinationLabel || params.get("Destinationlabel") || '';
    const departure = parsedData.departureDate || params.get("DepartDate") || '';
    const Return = parsedData.returnDate || params.get("ArrivalDate") || '';

    const handleFlightPrice = async (flight, optIndex = 0) => {
        setBookNowLoading(true);
        setPopupMessage(null);

        const pricingInfos = flight?.pricingInfos || [];

        const getPaxCount = (type) => {
            const paxInfo = pricingInfos.find(p => p.paxType === type);
            return paxInfo?.noOfPax ? String(paxInfo.noOfPax) : "0";
        };

        const NoOfAdultPax = getPaxCount("ADT");
        const NoOfChildPax = getPaxCount("CHD");
        const NoOfYouthPax = getPaxCount("INF");
        const Token = TokenResult?.result?.token;
        const TripType = params.get("TripType") === 'Round-Trip' ? 'RT' : 'OW';

        const OutBoundKey = flight?.journey?.[0]?.optionInfos?.[optIndex]?.optionKey || "";
        const InboundKey = TripType === "RT"
            ? (flight?.journey?.[1]?.optionInfos?.[optIndex]?.optionKey || "")
            : "";

        const OptionKeyList = [OutBoundKey];
        if (TripType === "RT" && InboundKey) {
            OptionKeyList.push(InboundKey);
        }

        const payload = {
            Key: flight?.key || "",
            TripType,
            InboundKey,
            OutBoundKey,
            token: Token || "",
            supp: flight?.supp || "",
            IsFlexibleDate: false,
            OptionKeyList,
            NoOfAdultPax,
            NoOfChildPax,
            NoOfYouthPax,
            AccountCode: "BS6593",
            CompanyCode: "BS6593",
            WebsiteName: "zippytravel.co.uk",
            ApplicationAccessMode: "LIVE",
            username: "BS6593",
            password: "#Bs65@93z1pPyTrAvEl_Live"
        };

        try {
            const response = await api.post("/flightprice", payload);
            const res = response.data;

            if (res?.result?.apiFault) {
                setPopupMessage(res.result.apiFault?.errorDescription || "Flight Pricing Failed.");
                setBookNowLoading(false);
                return;
            }

            stashFlightPrice(
                {
                    Key: flight?.key || "",
                    token: Token || "",
                    OutBoundKey,
                    InboundKey,
                },
                res
            );

            const queryParams = new URLSearchParams({
                Key: flight?.key || "",
                TripType,
                InboundKey,
                OutBoundKey,
                token: Token || "",
                supp: flight?.supp || "",
                IsFlexibleDate: false,
                OptionKeyList,
                NoOfAdultPax,
                NoOfChildPax,
                NoOfYouthPax,
                Originlabel: origin,
                Destinationlabel: destination,
                DepartDate: departure,
                ArrivalDate: Return
            }).toString();

            router.push(`/bookNow?${queryParams}`);
            // Keep loader visible until bookNow mounts (cache hydrates, no second API).
        } catch (error) {
            console.error("Flight Price API Error:", error);
            setPopupMessage("Something went wrong while checking Flight Price.");
            setBookNowLoading(false);
        }
    };

    const adultPrice = (flight) => {
        const price = flight?.pricingInfos?.find(p => p.paxType === "ADT")?.totalPrice;
        return price != null ? Math.round(price).toLocaleString() : "0";
    };

    const stopLabel = (infoItem) => {
        const stops = infoItem?.stop ?? ((infoItem?.airSegmentInfos?.length || 1) - 1);
        if (stops === 0) return 'Direct';
        if (stops === 1) return '01 Stop';
        return `${String(stops).padStart(2, '0')} Stops`;
    };

    const formatDurationLabel = (raw) => {
        if (!raw) return '';
        const text = String(raw).trim();
        if (/h|m/i.test(text) && !/:/.test(text)) {
            return text.replace(/\s+/g, '').toUpperCase().replace(/H/, 'H ').replace(/M/, 'M').trim();
        }
        const match = text.match(/(\d+)\s*[:=h]?\s*(\d+)?/i);
        if (match) {
            const h = String(match[1]).padStart(2, '0');
            const m = String(match[2] || 0).padStart(2, '0');
            return `${h}H ${m}M`;
        }
        return text.toUpperCase();
    };

    const parseSegmentDateTime = (seg, type = 'depart') => {
        const dateVal = type === 'depart' ? seg?.departDate : seg?.arrivalDate;
        const timeVal = type === 'depart' ? seg?.departTime : seg?.arrivalTime;
        if (!dateVal) return null;
        const datePart = String(dateVal).includes('T')
            ? String(dateVal)
            : `${String(dateVal).slice(0, 10)}T${(timeVal || '00:00').padStart(5, '0')}:00`;
        const parsed = new Date(datePart);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    };

    const getLayoverLabel = (prevSeg, nextSeg) => {
        const arrival = parseSegmentDateTime(prevSeg, 'arrival');
        const depart = parseSegmentDateTime(nextSeg, 'depart');
        if (!arrival || !depart) return null;
        const diffMins = Math.max(0, Math.round((depart - arrival) / 60000));
        const h = String(Math.floor(diffMins / 60)).padStart(2, '0');
        const m = String(diffMins % 60).padStart(2, '0');
        return `${h}H ${m}M`;
    };

    const airportLabel = (seg, type = 'origin') => {
        if (type === 'origin') {
            const city = seg?.originAirportName || seg?.originAirportCity || seg?.originCity || '';
            const country = seg?.originAirportCountry || seg?.originCountry || '';
            const code = seg?.origin || '';
            const place = [city, country].filter(Boolean).join(', ') || city;
            return place ? `${place}${code ? ` - ${code}` : ''}` : (code || 'N/A');
        }
        const city = seg?.destinationAirportName || seg?.destinationAirportCity || seg?.destinationCity || '';
        const country = seg?.destinationAirportCountry || seg?.destinationCountry || '';
        const code = seg?.destination || '';
        const place = [city, country].filter(Boolean).join(', ') || city;
        return place ? `${place}${code ? ` - ${code}` : ''}` : (code || 'N/A');
    };

    const renderJourneyLeg = (infoItem, isReturn = false) => {
        const segments = infoItem?.airSegmentInfos || [];
        const segFirst = segments[0];
        const segLast = segments[segments.length - 1];
        if (!segFirst || !segLast) return null;

        return (
            <div className="flex flex-col min-[500px]:grid min-[500px]:grid-cols-3 items-center gap-3 min-[500px]:gap-2 sm:gap-4">
                <div className="flex flex-col text-center min-[500px]:text-left truncate">
                    <span className="text-secondary text-[18px] sm:text-[20px] font-extrabold font-quicksand leading-none">
                        {segFirst?.departTime || "N/A"}
                    </span>
                    <span className="text-black/50 text-[12px] sm:text-[13px] font-quicksand mt-1">
                        {formatDate(segFirst?.departDate)}
                    </span>
                    <span className="text-black/70 text-[12px] sm:text-[13px] font-bold font-quicksand truncate">
                        {segFirst?.origin || "N/A"}
                    </span>
                </div>

                <div className="flex flex-col items-center justify-center relative px-1 sm:px-2 min-w-0 w-full max-w-[240px] min-[500px]:max-w-none">
                    <span className="text-secondary text-[11px] sm:text-[12px] font-medium font-quicksand mb-1">
                        {stopLabel(infoItem)}
                        {infoItem?.totalFlightDuration ? ` · ${infoItem.totalFlightDuration}` : ''}
                    </span>
                    <div className="flex items-center w-full justify-between gap-1 sm:gap-2">
                        <span className="text-[#A57C38] text-[15px] sm:text-[17px] min-[1360px]:text-[18px] font-bold font-quicksand shrink-0">
                            {segFirst?.origin || "—"}
                        </span>
                        <div className="flex-grow h-[1px] bg-[#E3DAC9] relative flex items-center justify-center min-w-[15px] sm:min-w-[20px]">
                            <div className="-mt-[15px] scale-90 sm:scale-100">
                                {isReturn ? <LandingIcon /> : <TakeoffIcon />}
                            </div>
                        </div>
                        <span className="text-[#A57C38] text-[15px] sm:text-[17px] min-[1360px]:text-[18px] font-bold font-quicksand shrink-0">
                            {segLast?.destination || "—"}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col text-center min-[500px]:text-right truncate">
                    <span className="text-secondary text-[18px] sm:text-[20px] font-extrabold font-quicksand leading-none">
                        {segLast?.arrivalTime || "N/A"}
                    </span>
                    <span className="text-black/50 text-[12px] sm:text-[13px] font-quicksand mt-1">
                        {formatDate(segLast?.arrivalDate)}
                    </span>
                    <span className="text-black/70 text-[12px] sm:text-[13px] font-bold font-quicksand truncate">
                        {segLast?.destination || "N/A"}
                    </span>
                </div>
            </div>
        );
    };

    const renderFlightCard = (flight, index, optIndex = 0, onBook = null) => {
        const journeys = flight.journey || [];
        const firstSeg = journeys?.[0]?.optionInfos?.[optIndex]?.airSegmentInfos?.[0];
        const cabinClass = firstSeg?.cabinClass || 'Economy';
        const airlineLogo = firstSeg?.airlineLogoUrl;
        const airlineName = firstSeg?.airlineName || 'Airline';

        return (
            <div
                key={`${index}-${optIndex}`}
                className="bg-white rounded-[24px] border border-[#F2ECE4] p-3.5 sm:p-4 min-[1360px]:p-5 flex flex-col md:flex-row justify-between items-stretch shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-all duration-300 gap-4 sm:gap-5 min-[1360px]:gap-6 overflow-hidden"
            >
                <div className="flex flex-col flex-grow justify-between gap-4 pr-0 md:pr-5 min-w-0">
                    {journeys.map((journeyItem, jIndex) => {
                        const infoItem = journeyItem?.optionInfos?.[optIndex];
                        if (!infoItem) return null;
                        return (
                            <div key={`${jIndex}-${optIndex}`} className={jIndex > 0 ? 'pt-3 border-t border-[#F5EFEB]' : ''}>
                                {renderJourneyLeg(infoItem, jIndex > 0)}
                            </div>
                        );
                    })}

                    <div className="grid grid-cols-2 min-[640px]:flex min-[640px]:flex-wrap items-center justify-between border-t border-[#F5EFEB] pt-3 sm:pt-4 mt-1 gap-2 sm:gap-4">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <SeatIcon />
                            <span className="text-black text-[12px] sm:text-[13px] min-[1360px]:text-[14px] font-semibold font-quicksand">
                                {cabinClass} Class
                            </span>
                        </div>

                        {airlineLogo ? (
                            <img
                                src={airlineLogo}
                                alt={airlineName}
                                className="w-auto max-w-[130px] max-h-[54px] object-contain flex-shrink-0"
                            />
                        ) : (
                            <span className="text-[#727272] text-[12px] sm:text-[13px] font-bold font-quicksand">{airlineName}</span>
                        )}

                        <div className="flex items-center gap-1.5 sm:gap-2 col-span-2 min-[640px]:col-span-1">
                            <PhoneIcon />
                            <a href="tel:02070434343" className="text-black text-[12px] sm:text-[13px] min-[1360px]:text-[14px] font-semibold font-quicksand hover:text-secondary">
                                0207 043 4343
                            </a>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 justify-between">
                        <button
                            type="button"
                            className="bg-[#FBEFE4] text-secondary font-quicksand text-[13px] sm:text-[14px] py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 group hover:bg-secondary hover:text-white"
                            onClick={() => setEnquiryOpen(true)}
                        >
                            Enquire Now <ArrowIcon />
                        </button>
                        {journeys?.[0]?.optionInfos?.length > 1 && optIndex === 0 && (
                            <button
                                type="button"
                                className="flex items-center gap-1 text-[13px] sm:text-[14px] font-medium text-[#A57232] font-quicksand hover:underline"
                                onClick={() => openOptionsModal(flight)}
                            >
                                More Options ({journeys?.[0]?.optionInfos?.length})<ArrowIcon />
                            </button>
                        )}
                        <button
                            type="button"
                            className="bg-[#FBEFE4] text-secondary font-quicksand text-[13px] sm:text-[14px] py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 group hover:bg-secondary hover:text-white"
                            onClick={() =>
                                handleOpenModal({
                                    departure: journeys?.[0]?.optionInfos?.[optIndex]?.airSegmentInfos || [],
                                    return: journeys?.length > 1
                                        ? journeys?.[1]?.optionInfos?.[optIndex]?.airSegmentInfos || []
                                        : [],
                                    flight,
                                    optIndex,
                                })
                            }
                        >
                            Flight Details <ArrowIcon />
                        </button>
                    </div>
                </div>

                <div className="hidden md:block w-[1px] bg-[#F0E6D8] self-stretch my-2 shrink-0" />

                <div className="flex flex-col items-center justify-center shrink-0 text-center gap-2.5 sm:gap-3 py-2 mx-0 sm:mx-2 min-[1200px]:mx-3 min-[1360px]:mx-[40px] border-t md:border-t-0 border-[#F5EFEB] pt-4 md:pt-2">
                    <div className="flex flex-col items-center">
                        <span className="text-black/50 text-[11px] font-quicksand">from</span>
                        <div className="flex items-baseline mt-0.5 sm:mt-1">
                            <span className="text-[#A57C38] text-[13px] sm:text-[14px] font-bold font-quicksand self-start mt-[3px]">£</span>
                            <span className="text-secondary text-[25px] sm:text-[27px] min-[1360px]:text-[29px] font-extrabold font-quicksand leading-none">
                                {adultPrice(flight)}
                            </span>
                        </div>
                        <span className="text-black/50 text-[11px] font-quicksand mt-1">Total Per Adult</span>
                    </div>
                    <div className="h-[1px] w-[82px] bg-[#F0E6D8]" />
                    <div className="flex flex-col items-center w-full gap-2">
                        <span className="text-black text-[12px] sm:text-[13px] font-quicksand">Subject to Availability</span>
                        <button
                            type="button"
                            onClick={() => (onBook ? onBook() : handleFlightPrice(flight, optIndex))}
                            className="w-full min-w-[140px] bg-[#FBEFE4] text-secondary font-quicksand text-[13px] sm:text-[14px] py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 group hover:bg-secondary hover:text-white"
                        >
                            Book Now
                            <ArrowIcon />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderDetailSegments = (segments, journeyLabel, routeFrom, routeTo) => {
        if (!segments?.length) return null;
        const first = segments[0];
        const last = segments[segments.length - 1];

        return (
            <div className="space-y-4">
                <div>
                    <h3 className="text-[22px] sm:text-[26px] font-bold text-[#3D3D3D] font-quicksand leading-tight">
                        {journeyLabel}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[18px] sm:text-[20px] font-bold text-[#A57C38] font-quicksand">
                            {first?.origin || routeFrom || '—'}
                        </span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="text-[#A57C38]">
                            <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="currentColor" />
                        </svg>
                        <span className="text-[18px] sm:text-[20px] font-bold text-[#A57C38] font-quicksand">
                            {last?.destination || routeTo || '—'}
                        </span>
                    </div>
                </div>

                {segments.map((flightData, idx) => {
                    const equipment = flightData?.equipment || flightData?.aircraftType || flightData?.equipmentType || '—';
                    const duration = formatDurationLabel(flightData?.travelDuration || flightData?.flightTime);
                    const baggage = flightData?.baggageInfo?.allowance || flightData?.baggage || 'N/A';
                    const cabin = flightData?.cabinClass
                        ? `${flightData.cabinClass}${/class/i.test(flightData.cabinClass) ? '' : ' Class'}`
                        : '—';
                    const layover = idx < segments.length - 1
                        ? formatDurationLabel(
                            segments[idx + 1]?.layoverDuration
                            || segments[idx + 1]?.connectionTime
                            || flightData?.layoverDuration
                            || flightData?.connectionTime
                            || getLayoverLabel(flightData, segments[idx + 1])
                        )
                        : null;

                    return (
                        <React.Fragment key={idx}>
                            <div className="space-y-3">
                                {/* Airline / Flight / Equipment bar */}
                                <div className="bg-[#FCF9F5] rounded-xl px-3 sm:px-4 py-2.5 flex flex-wrap items-center gap-3 sm:gap-5">
                                    {flightData?.airlineLogoUrl ? (
                                        <img
                                            src={flightData.airlineLogoUrl}
                                            alt={flightData?.airlineName || 'Airline'}
                                            className="h-7 sm:h-8 w-auto max-w-[110px] object-contain"
                                        />
                                    ) : (
                                        <span className="text-[13px] font-semibold text-[#3D3D3D] font-quicksand">
                                            {flightData?.airlineName || 'Airline'}
                                        </span>
                                    )}
                                    <span className="text-[13px] sm:text-[14px] text-[#6B6B6B] font-quicksand">
                                        Flight : {flightData?.flightNumber || '—'}
                                    </span>
                                    <span className="text-[13px] sm:text-[14px] text-[#6B6B6B] font-quicksand">
                                        Equipment {equipment}
                                    </span>
                                </div>

                                {/* Vertical timeline */}
                                <div className="flex gap-3 sm:gap-4 pl-1">
                                    {duration ? (
                                        <div className="w-5 shrink-0 flex items-center justify-center">
                                            <span
                                                className="text-[11px] sm:text-[12px] text-[#9A9A9A] font-quicksand tracking-[0.12em] whitespace-nowrap"
                                                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                                            >
                                                {duration}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="w-5 shrink-0" />
                                    )}

                                    <div className="flex flex-col items-center pt-1.5 pb-1.5 shrink-0">
                                        <span className="w-2.5 h-2.5 rounded-full border-2 border-[#C4B5A0] bg-white" />
                                        <span className="w-px flex-1 min-h-[52px] bg-[#E3DAC9]" />
                                        <span className="w-2.5 h-2.5 rounded-full border-2 border-[#C4B5A0] bg-white" />
                                    </div>

                                    <div className="flex-1 min-w-0 space-y-5">
                                        <div className="flex items-start gap-3 sm:gap-4">
                                            <span className="text-[14px] sm:text-[15px] font-semibold text-[#3D3D3D] font-quicksand w-[48px] shrink-0">
                                                {flightData?.departTime || '—'}
                                            </span>
                                            <span className="text-[14px] sm:text-[15px] text-[#3D3D3D] font-quicksand leading-snug">
                                                {airportLabel(flightData, 'origin')}
                                            </span>
                                        </div>
                                        <div className="flex items-start gap-3 sm:gap-4">
                                            <span className="text-[14px] sm:text-[15px] font-semibold text-[#3D3D3D] font-quicksand w-[48px] shrink-0">
                                                {flightData?.arrivalTime || '—'}
                                            </span>
                                            <span className="text-[14px] sm:text-[15px] text-[#3D3D3D] font-quicksand leading-snug">
                                                {airportLabel(flightData, 'destination')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Baggage / Class */}
                                <div className="flex flex-wrap items-center justify-between gap-5 sm:gap-8 pl-1">
                                    <div className="flex items-center gap-2 text-secondary">
                                        <span className='flex items-center gap-1'>
                                            <img src={`${BASE_URL_IMG}/assets/svgs/baggage.svg`} alt="" className="w-[18px] h-[18px] object-contain" aria-hidden />
                                            <span className='text-[13px] sm:text-[14px] font-medium font-quicksand text-[#686868]'>Baggage:</span>
                                        </span>

                                        <span className="text-[13px] sm:text-[14px] font-medium font-quicksand text-[#686868]">{baggage}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-secondary">
                                        <span className='flex items-center gap-1'>
                                            <img src={`/seaticon.png`} alt="" className="w-[18px] h-[18px] object-contain" aria-hidden />
                                            <span className='text-[13px] sm:text-[16px] font-medium font-quicksand text-[#686868]'>Class:</span>
                                        </span>
                                        <span className="text-[13px] sm:text-[16px] font-medium font-quicksand text-[#686868]">{cabin}</span>
                                    </div>
                                </div>
                            </div>

                            {layover && (
                                <div className="bg-secondary text-white rounded-xl py-2.5 px-4 text-center text-[13px] sm:text-[14px] font-semibold font-quicksand tracking-wide">
                                    StopOver &mdash; {layover}
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        );
    };

    const detailFlight = FightDetailData?.flight;
    const detailOptIndex = FightDetailData?.optIndex || 0;
    const detailOptionsCount = detailFlight?.journey?.[0]?.optionInfos?.length || 0;
    const originCode = FightDetailData?.departure?.[0]?.origin
        || params.get('Origin')
        || '';
    const destCode = FightDetailData?.departure?.[FightDetailData?.departure?.length - 1]?.destination
        || params.get('Destination')
        || '';

    return (
        <>
            <div className="w-full space-y-4">
                {airSolutions.map((flight, index) => renderFlightCard(flight, index))}
            </div>

            {/* Flight Details Modal */}
            <Dialog open={FightDetailOpen} onClose={setFightDetailOpen} className="relative z-50">
                <DialogBackdrop
                    transition
                    className="fixed inset-0 bg-black/50 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
                />
                <div className="fixed inset-0 z-50 flex justify-start items-center overflow-hidden">
                    <div className="w-full max-w-[520px] h-[92vh] max-h-[760px] ml-0 sm:ml-0 md:ml-0">
                        <DialogPanel
                            transition
                            className="relative w-full h-full bg-white rounded-tr-[24px] rounded-br-[24px]  shadow-2xl overflow-hidden flex flex-col transform transition-transform duration-300 ease-out data-closed:-translate-x-full data-enter:translate-x-0 data-leave:-translate-x-full border border-[#F2ECE4]"
                        >
                            <button
                                type="button"
                                onClick={() => setFightDetailOpen(false)}
                                className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center text-[#A57233] hover:text-[#A57233] text-xl font-light"
                                aria-label="Close"
                            >
                                ✕
                            </button>

                            <div className="flex-1 overflow-y-auto px-5 sm:px-7 pt-6 pb-4 font-quicksand space-y-8">
                                {FightDetailData?.departure?.length > 0 && renderDetailSegments(
                                    FightDetailData.departure,
                                    'Flight 01',
                                    originCode,
                                    destCode
                                )}

                                {FightDetailData?.return?.length > 0 && renderDetailSegments(
                                    FightDetailData.return,
                                    'Flight 02',
                                    destCode,
                                    originCode
                                )}
                            </div>

                            {/* Sticky footer */}
                            <div className="shrink-0 bg-[#FBF8F4] border-t border-[#F2ECE4] px-5 sm:px-7 py-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 sm:items-end gap-4 sm:gap-6">
                                    <div className="flex flex-col gap-2.5 w-full sm:flex-1">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (!detailFlight) return;
                                                setFightDetailOpen(false);
                                                handleFlightPrice(detailFlight, detailOptIndex);
                                            }}
                                            className="w-full bg-secondary text-white font-quicksand text-[13px] sm:text-[14px] font-bold uppercase tracking-wide py-3.5 px-5 rounded-xl hover:bg-secondary/90 transition-colors"
                                        >
                                            Book Now
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFightDetailOpen(false);
                                                setEnquiryOpen(true);
                                            }}
                                            className="w-full bg-white text-[#3D3D3D] border border-[#E5E0D8] font-quicksand text-[13px] sm:text-[14px] font-semibold uppercase tracking-wide py-3.5 px-5 rounded-xl hover:border-secondary hover:text-secondary transition-colors"
                                        >
                                            Enquire Fare
                                        </button>
                                    </div>

                                    <div className="text-left sm:text-right sm:pb-1 shrink-0 flex flex-col gap-2.5">
                                        <div>
                                            <div className="flex items-baseline gap-1 sm:justify-end">
                                                <span className="text-[13px] text-[#6B6B6B] font-quicksand">from</span>
                                                <span className="text-[16px] font-bold text-[#A57233] font-quicksand">£</span>
                                                <span className="text-[28px] sm:text-[30px] font-extrabold text-[#A57233] font-quicksand leading-none">
                                                    {adultPrice(detailFlight)}
                                                </span>
                                            </div>
                                            <p className="text-[12px] text-[#6B6B6B] font-quicksand mt-1">Total Per Adult</p>
                                        </div>

                                        {detailOptionsCount > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFightDetailOpen(false);
                                                    openOptionsModal(detailFlight);
                                                }}
                                                className="w-full bg-white text-[#3D3D3D] border border-[#E5E0D8] font-quicksand text-[13px] sm:text-[14px] font-semibold uppercase tracking-wide py-3.5 px-5 rounded-xl hover:border-secondary hover:text-secondary transition-colors"
                                            >
                                                {String(detailOptionsCount).padStart(2, '0')} Options More
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>

            {/* Flight Enquiry Modal */}
            {EnquiryOpen && (
                <Dialog open={EnquiryOpen} onClose={setEnquiryOpen} className="relative z-50">
                    <DialogBackdrop
                        transition
                        className="fixed inset-0 bg-black/50 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
                    />
                    <div className="fixed inset-0 z-50 flex justify-center items-center p-3 sm:p-6">
                        <DialogPanel
                            transition
                            className="w-[820px] max-w-full max-h-[94vh] bg-white rounded-[20px] sm:rounded-[24px] shadow-2xl transform transition-all overflow-auto relative data-closed:scale-95 data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in"
                        >
                            <EnquiryModal setEnquiryOpen={setEnquiryOpen} EnquiryOpen={EnquiryOpen} />
                        </DialogPanel>
                    </div>
                </Dialog>
            )}

            {/* Flight Options Modal */}
            <Dialog open={FlightOptionsOpen} onClose={setFlightOptionsOpen} className="relative z-10">
                <DialogBackdrop
                    transition
                    className="fixed inset-0 bg-black/50 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
                />
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0 mt-[70px]">
                        <DialogPanel
                            transition
                            className="relative transform overflow-hidden rounded-[24px] bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-3xl data-closed:sm:translate-y-0 data-closed:sm:scale-95 border border-[#F2ECE4]"
                        >
                            <div className="w-full bg-white p-4 sm:px-6 sm:pt-6 sm:pb-6 space-y-4 font-quicksand">
                                <button
                                    type="button"
                                    onClick={() => setFlightOptionsOpen(false)}
                                    className="text-black/70 text-xl hover:text-secondary"
                                    aria-label="Close"
                                >
                                    ✕
                                </button>
                                <div>
                                    <h3 className="text-[22px] font-bold text-secondary">Fare options for your search</h3>
                                    <p className="text-[14px] sm:text-[16px] text-black/70 mt-1">
                                        Flight — <span className="text-[#F1A868]">{origin}</span> to <span className="text-[#F1A868]">{destination}</span>
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {FlightOptionsData?.journey?.[0]?.optionInfos?.map((_, optIndex) =>
                                        renderFlightCard(
                                            FlightOptionsData,
                                            `opt-${optIndex}`,
                                            optIndex,
                                            () => handleFlightPrice(FlightOptionsData, optIndex)
                                        )
                                    )}
                                </div>

                                <div className="hidden sm:flex justify-between items-start gap-4 pt-2 border-t border-[#F5EFEB]">
                                    <div className="flex flex-col gap-1">
                                        <Link href="/contact-us" className="text-[14px] font-bold text-[#F1A868] hover:underline">
                                            Request a Call Back
                                        </Link>
                                        <span className="text-[12px] text-black/50">Too busy to dial a call?</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <a
                                            href="https://wa.me/442070434343?text=Hello%2C%20I%20want%20to%20book%20a%20flight"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[14px] font-bold text-[#1CCC2E] hover:underline"
                                        >
                                            WhatsApp
                                        </a>
                                        <span className="text-[12px] text-black/50">0207 - 043 - 4343</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <a href="tel:02070434343" className="text-[14px] font-bold text-[#F1A868] hover:underline">
                                            Call Us Now
                                        </a>
                                        <span className="text-[12px] text-black/50">0207 - 043 - 4343</span>
                                    </div>
                                </div>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export default Flightlist;
