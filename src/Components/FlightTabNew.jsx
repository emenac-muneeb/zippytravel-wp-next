"use client";
import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../ExternalCSS/FlightTab.css";
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { airlines } from '../DataResources/Airlines';
import api, { BASE_URL } from '../Helpers/apiHelper';
import { showToast } from '../Helpers/Helper';
import { BASE_URL_IMG } from "../Helpers/imageurl";

const FlightTabNew = ({
    setFlightLoading,
    setPopupMessage,
    setBookNowLoading,
    selectedClass = "Business",
    setSelectedClass
}) => {

    const router = useRouter();
    const [userIp, setUserIp] = useState("");
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [departureDate, setDepartureDate] = useState(null);
    const [returnDate, setReturnDate] = useState(null);
    const [loadingOrigin, setLoadingOrigin] = useState(false);
    const [loadingDestination, setLoadingDestination] = useState(false);
    const ORIGINAL_ORDER = ["One-Way", "Round-Trip", "Multi-City"];
    const tripTypeLabels = {
        "One-Way": "One-Way",
        "Round-Trip": "Round-Trip",
        "Multi-City": "Multi-City",
    };

    function getReorderedList(selected) {
        const middleIndex = Math.floor((ORIGINAL_ORDER.length - 1) / 2);
        const rest = ORIGINAL_ORDER.filter((t) => t !== selected);
        const reordered = [...rest];
        reordered.splice(middleIndex, 0, selected);
        return reordered;
    }
    const [tripType, setTripType] = useState(ORIGINAL_ORDER[0]);
    const itemRefs = useRef({});   // type -> DOM node
    const prevRects = useRef({});
    useLayoutEffect(() => {
        const newRects = {};
        Object.keys(itemRefs.current).forEach((key) => {
            const el = itemRefs.current[key];
            if (el) newRects[key] = el.getBoundingClientRect();
        });

        Object.keys(newRects).forEach((key) => {
            const el = itemRefs.current[key];
            const prev = prevRects.current[key];
            const next = newRects[key];
            if (!el || !prev) return;

            const lift = key === tripType ? -12 : 0; // px, matches -translate-y-[12px]
            const deltaX = prev.left - next.left;

            el.style.willChange = "transform";
            el.style.transition = "none";
            el.style.transform = `translateX(${deltaX}px) translateY(${lift}px)`;

            requestAnimationFrame(() => {
                el.style.transition =
                    "transform 420ms cubic-bezier(0.34, 1.28, 0.4, 1), color 300ms ease, font-size 300ms ease";
                el.style.transform = `translateX(0px) translateY(${lift}px)`;
            });
        });

        prevRects.current = newRects;
    }, [tripType]);


    const order = getReorderedList(tripType);

    const originRef = useRef(null);
    const destinationRef = useRef(null);
    const formRef = useRef(null);
    const calendarModalRef = useRef(null);
    const multiCityFlightsModalRef = useRef(null);

    // No Of Adults DropDown
    const dropdownRef = useRef(null);

    const [isOpen, setIsOpen] = useState(false);
    const [showTripDropdown, setShowTripDropdown] = useState(false);
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [infants, setInfants] = useState(0);
    const [focusedField, setFocusedField] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    /** Mobile only: collapsed shows From + To + Search; tap a field to expand all */
    const [isMobileFormExpanded, setIsMobileFormExpanded] = useState(false);
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) setIsMobileFormExpanded(false);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const expandMobileForm = () => {
        if (isMobile) setIsMobileFormExpanded(true);
    };
    /** CSS-first: hide Dates/Travellers below md until expanded — no isMobile hydrate flash/CLS */
    const mobileCollapsedFieldClass = isMobileFormExpanded ? "" : "max-md:hidden";
    useEffect(() => {
        const fetchIp = async () => {
            try {
                const res = await fetch("https://api64.ipify.org?format=json");
                const data = await res.json();
                setUserIp(data.ip);
            } catch (err) {
                console.error("Error fetching IP:", err);
            }
        };

        fetchIp();
    }, []);
    useEffect(() => {
        const handleClickOutside = (event) => {
            const isInsideForm = formRef.current && formRef.current.contains(event.target);
            const isInsideClass = classRef.current && classRef.current.contains(event.target);
            const isInsideTravellers = dropdownRef.current && dropdownRef.current.contains(event.target);
            const isInsideCalendar = calendarModalRef.current && calendarModalRef.current.contains(event.target);
            const isInsideMultiCityModal =
                multiCityFlightsModalRef.current &&
                multiCityFlightsModalRef.current.contains(event.target);
            const isInsideSuggestions = event.target.closest("ul") || event.target.closest(".suggestion-list");

            if (
                !isInsideForm &&
                !isInsideClass &&
                !isInsideTravellers &&
                !isInsideCalendar &&
                !isInsideMultiCityModal &&
                !isInsideSuggestions
            ) {
                setFocusedField(null);
                setIsOpen(false);
                setIsClassOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Airlines Class DropDown
    const classRef = useRef(null);

    const [isClassOpen, setIsClassOpen] = useState(false);

    const travelClasses = ["Premium Economy", "Business", "First Class"];

    const handleSelect = (item) => {
        setSelectedClass(item);
        setIsClassOpen(false);
    };

    // Airlines List DropDown
    const [isAirOpen, setIsAirOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAirlines, setSelectedAirlines] = useState([]);
    const AirRef = useRef();

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (AirRef.current && !AirRef.current.contains(e.target)) {
                setIsAirOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleToggle = (code) => {
        if (selectedAirlines.includes(code)) {
            setSelectedAirlines(selectedAirlines.filter((c) => c !== code));
        } else {
            setSelectedAirlines([...selectedAirlines, code]);
        }
    };

    const selectedNames = selectedAirlines
        .map((code) => airlines.find((a) => a.code === code)?.name || code)
        .join(", ");

    // Airlines Origin DropDown
    const [origin, setOrigin] = useState("");
    const [originLabel, setOriginLabel] = useState("");
    const [originSuggestions, setOriginSuggestions] = useState([]);

    // Airlines Destination DropDown
    const [destination, setDestination] = useState("");
    const [destinationLabel, setDestinationLabel] = useState("");
    const [destinationSuggestions, setDestinationSuggestions] = useState([]);

    // Multi-City Contact Fields
    const [multiCityFullName, setMultiCityFullName] = useState("");
    const [multiCityEmail, setMultiCityEmail] = useState("");
    const [multiCityPhone, setMultiCityPhone] = useState("");
    const [multiCitySubmitting, setMultiCitySubmitting] = useState(false);
    const [isMultiCityFlightsOpen, setIsMultiCityFlightsOpen] = useState(false);

    const EMPTY_MULTI_FLIGHT = {
        originLabel: "",
        origin: "",
        destinationLabel: "",
        destination: "",
        date: "",
    };

    const [Multiflights, setMultiflights] = useState([{ ...EMPTY_MULTI_FLIGHT }]);
    const [activeSuggestion, setActiveSuggestion] = useState(null); // { index: number, type: 'origin' | 'destination' } or null

    const MAX_MULTI_FLIGHTS = 4;

    const addFlight = () => {
        setMultiflights((prev) => {
            if (prev.length >= MAX_MULTI_FLIGHTS) {
                showToast(`You can add up to ${MAX_MULTI_FLIGHTS} flights.`, "danger");
                return prev;
            }
            return [...prev, { ...EMPTY_MULTI_FLIGHT }];
        });
    };

    const removeFlight = (index) => {
        // Flight 1 stays on the main form — only extra flights can be removed
        if (index === 0) {
            showToast("Flight 1 is edited on the main form.", "danger");
            return;
        }
        setMultiflights((prev) => {
            if (prev.length <= 1) return prev;
            return prev.filter((_, i) => i !== index);
        });
        setFocusedField((current) => {
            if (!current) return current;
            if (
                current === `mc-origin-${index}` ||
                current === `mc-dest-${index}` ||
                current === `mc-date-${index}`
            ) {
                return null;
            }
            return current;
        });
        setActiveSuggestion(null);
        setOriginSuggestions([]);
        setDestinationSuggestions([]);
    };

    const openMultiCityFlightsPopup = () => {
        // Keep Flight 1 on the main form; open popup for extra flights
        setMultiflights((prev) => {
            if (prev.length >= MAX_MULTI_FLIGHTS) {
                showToast(`You can add up to ${MAX_MULTI_FLIGHTS} flights.`, "danger");
                return prev;
            }
            if (prev.length === 1) {
                return [...prev, { ...EMPTY_MULTI_FLIGHT }];
            }
            return prev;
        });
        setIsMultiCityFlightsOpen(true);
    };

    const closeMultiCityFlightsPopup = () => {
        setIsMultiCityFlightsOpen(false);
        setFocusedField(null);
        setActiveSuggestion(null);
        setOriginSuggestions([]);
        setDestinationSuggestions([]);
        setIsOpen(false);
    };

    const updateFlight = (index, fieldOrFields, value) => {
        setMultiflights((prev) => {
            const updated = [...prev];
            if (typeof fieldOrFields === "object" && fieldOrFields !== null) {
                updated[index] = { ...updated[index], ...fieldOrFields };
            } else {
                updated[index] = { ...updated[index], [fieldOrFields]: value };
            }
            return updated;
        });
    };

    const selectMultiCitySuggestion = (index, type, item) => {
        const match = typeof item === "string" ? item.match(/\(([^)]+)\)/) : null;
        const code = match ? match[1] : item;
        if (type === "origin") {
            updateFlight(index, { origin: code, originLabel: item });
            setOriginSuggestions([]);
        } else {
            updateFlight(index, { destination: code, destinationLabel: item });
            setDestinationSuggestions([]);
        }
        setActiveSuggestion(null);
        setFocusedField(null);
    };

    useEffect(() => {
        if (!isMultiCityFlightsOpen) return;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prevOverflow;
        };
    }, [isMultiCityFlightsOpen]);

    useEffect(() => {
        if (tripType === "One-Way") {
            setReturnDate(null);
        }
        if (tripType !== "Multi-City") {
            setIsMultiCityFlightsOpen(false);
        }
    }, [tripType]);

    useEffect(() => {
        if (returnDate && departureDate && returnDate <= departureDate) {
            setReturnDate(null);
        }
    }, [departureDate]);

    useEffect(() => {
        if (pathname && pathname.replace(/\/$/, "") === "/flightDetails") {
            const savedData = JSON.parse(localStorage.getItem("flightFormData"));
            if (savedData) {
                setTripType(savedData.tripType || "One-Way");
                setOrigin(savedData.origin || "");
                setDestination(savedData.destination || "");
                setOriginLabel(savedData.originLabel || "");
                setDestinationLabel(savedData.destinationLabel || "");
                setDepartureDate(savedData.departureDate ? new Date(savedData.departureDate) : null);
                setReturnDate(savedData.returnDate ? new Date(savedData.returnDate) : null);
                setSelectedClass(savedData.selectedClass || "");
                setAdults(savedData.adults || 1);
                setChildren(savedData.children || 0);
                setInfants(savedData.infants || 0);
                setSelectedAirlines(savedData.selectedAirlines || []);
            }
        }
    }, [pathname, searchParams]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Keep suggestion lists alive until their own mousedown handler selects an item
            if (
                event.target.closest("ul.suggestion-list") ||
                event.target.closest(".suggestion-list")
            ) {
                return;
            }

            const inMcModal =
                multiCityFlightsModalRef.current &&
                multiCityFlightsModalRef.current.contains(event.target);

            // Origin (one-way / round-trip + flight-1 shell)
            if (originRef.current && !originRef.current.contains(event.target)) {
                if (!inMcModal && originSuggestions.length > 0) {
                    setOriginLabel("");
                }
                setOriginSuggestions([]);
            }

            // Destination
            if (destinationRef.current && !destinationRef.current.contains(event.target)) {
                if (!inMcModal && destinationSuggestions.length > 0) {
                    setDestinationLabel("");
                }
                setDestinationSuggestions([]);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [originSuggestions, destinationSuggestions]);



    const formatDisplayDate = (date) => {
        if (!date) return "";
        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const totalTravellers = adults + children + infants;

    const mcFieldWrapper = "flex flex-col justify-between py-3 px-1 min-[1450px]:px-3 min-h-[88px]";
    const mcFieldLabel = "text-[10px] font-bold text-[#A57233] uppercase pl-3";
    const mcFieldBox = "bg-white rounded-[14px] border border-[#A57233]/40 px-4 py-2.5 flex items-center justify-between min-h-[48px] hover:bg-white/95 transition-all shadow-sm";
    const mcFieldText = "text-[14px] sm:text-[15px] font-bold text-[#878787]/70 truncate";
    const mcInputClass = "w-full outline-none bg-transparent text-[14px] sm:text-[15px] font-bold text-[#2a211c]/70 placeholder:text-[#2a211c]/40 p-0 min-w-0";

    const getMultiCityDateIndex = () => {
        if (!focusedField || !focusedField.startsWith("mc-date-")) return null;
        const index = parseInt(focusedField.replace("mc-date-", ""), 10);
        return Number.isNaN(index) ? null : index;
    };

    const multiCityDateIndex = getMultiCityDateIndex();

    function formatLocalDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${day}-${month}-${year}`;
    }

    // Fetch Cities
    const fetchCitySuggestions = async (text, type) => {
        if (text.length < 3) {
            if (type === "origin") setOriginSuggestions([]);
            else setDestinationSuggestions([]);
            return;
        }

        if (type === "origin") setLoadingOrigin(true);
        else setLoadingDestination(true);

        try {
            text = text.trim().toLowerCase();

            const response = await api.get(`/autocomplete/${text}`);
            const data = response.data;
            // console.log("City", response)

            if (type === "origin") {
                setOriginSuggestions(data);
            } else {
                setDestinationSuggestions(data);
            }

        } catch (error) {
            console.error("Error Fetching City Suggestions:", error);
        } finally {
            if (type === "origin") setLoadingOrigin(false);
            else setLoadingDestination(false);
        }
    };

    // Multi-City Form Submit (Contact Us API)
    const submitMultiCityForm = async () => {
        // Validate contact fields
        if (!multiCityFullName.trim()) {
            showToast("Please enter your Full Name.", "error");
            return;
        }
        if (!multiCityEmail.trim()) {
            showToast("Please enter your Email Address.", "error");
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(multiCityEmail.trim())) {
            showToast("Please enter a valid Email Address.", "error");
            return;
        }
        if (!multiCityPhone.trim()) {
            showToast("Please enter your Phone Number.", "error");
            return;
        }
        if (!selectedClass) {
            showToast("Please select a Travel Class.", "error");
            return;
        }
        // Validate each flight
        for (let i = 0; i < Multiflights.length; i++) {
            const flight = Multiflights[i];
            if (!flight.originLabel) {
                showToast(`Please enter Origin for Flight ${i + 1}.`, "error");
                return;
            }
            if (!flight.destinationLabel) {
                showToast(`Please enter Destination for Flight ${i + 1}.`, "error");
                return;
            }
            if (!flight.date) {
                showToast(`Please select Departure Date for Flight ${i + 1}.`, "error");
                return;
            }
        }

        setMultiCitySubmitting(true);

        // Build flights info for the note
        const flightsInfo = Multiflights.map((flight, i) => {
            const flightOrigin = flight.originLabel || 'N/A';
            const flightDest = flight.destinationLabel || 'N/A';
            const flightDate = flight.date ? formatLocalDate(new Date(flight.date)) : 'N/A';
            return `Flight ${i + 1}: ${flightOrigin} → ${flightDest} on ${flightDate}`;
        }).join(' | ');

        const passengersInfo = `Adults: ${adults}, Children: ${children}, Infants: ${infants}`;

        const payload = {
            fullName: multiCityFullName.trim(),
            contact: multiCityPhone.trim(),
            email: multiCityEmail.trim(),
            contact_detail: {
                user_ip: userIp,
                subject: 'Multi-City Flight Enquiry',
                note: `Multi-City Flight Request | Class: ${selectedClass} | ${passengersInfo} | ${flightsInfo}`,

                type: 'Multi-City Flight form',
            },
        };

        try {
            const res = await fetch(`${BASE_URL}/send-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error('Failed to submit form');

            showToast("Your Multi-City flight enquiry has been submitted successfully!", "success");
            // Reset form
            setMultiCityFullName("");
            setMultiCityEmail("");
            setMultiCityPhone("");
            setMultiflights([{ originLabel: "", origin: "", destinationLabel: "", destination: "", date: "" }]);
            setSelectedClass("");
            setAdults(1);
            setChildren(0);
            setInfants(0);

            // Redirect to thank you page
            router.push("/thankyou.html");
        } catch (error) {
            console.error('Multi-City submit error:', error);
            showToast("There was an error submitting your enquiry. Please try again.", "error");
        } finally {
            setMultiCitySubmitting(false);
        }
    };

    // Navigate to results — FlightCardList owns the single /flightsearch call
    const searchFlights = () => {
        const isOnFlightDetails = pathname && pathname.replace(/\/$/, "") === "/flightDetails";

        if (!origin || !destination || !departureDate) {
            if (typeof setPopupMessage === 'function') {
                setPopupMessage("Please select origin, destination and departure date.");
            } else {
                showToast("Please select origin, destination and departure date.", "error");
            }
            return;
        }

        if (tripType === "Round-Trip" && !returnDate) {
            if (typeof setPopupMessage === 'function') {
                setPopupMessage("Please select a return date.");
            } else {
                showToast("Please select a return date.", "error");
            }
            return;
        }

        const formState = {
            tripType,
            origin,
            destination,
            originLabel,
            destinationLabel,
            departureDate,
            returnDate,
            selectedClass,
            adults,
            children,
            infants,
            selectedAirlines
        };

        localStorage.setItem("flightFormData", JSON.stringify(formState));
        localStorage.setItem("TripType", tripType === 'Round-Trip' ? 'RT' : 'OW');

        const queryString = new URLSearchParams({
            TripType: tripType,
            Origin: origin,
            Originlabel: originLabel,
            Destination: destination,
            Destinationlabel: destinationLabel,
            DepartDate: departureDate ? formatLocalDate(departureDate) : "",
            ArrivalDate: returnDate ? formatLocalDate(returnDate) : "",
            Class: selectedClass,
            NoOfAdultPax: adults,
            NoOfChildPax: children,
            NoOfInfantPax: infants,
        }).toString();

        // Show loading while navigating / while FlightCardList refetches
        if (typeof setBookNowLoading === 'function') setBookNowLoading(true);
        if (typeof setFlightLoading === 'function') setFlightLoading(true);

        if (isOnFlightDetails) {
            // Cache-bust so identical criteria still trigger a single refetch
            const params = new URLSearchParams(queryString);
            params.set("_ts", String(Date.now()));
            router.replace(`/flightDetails?${params.toString()}`);
        } else {
            router.push(`/flightDetails?${queryString}`);
        }
    };

    const suggestionItemClass =
        "px-5 py-3.5 cursor-pointer text-sm text-[#2a211c] font-medium flex items-center justify-between gap-3 transition-all duration-150 hover:bg-[#faf2ea] hover:text-[#A57233] group border-b border-gray-50/50 last:border-b-0";

    return (
        <>
            <div className="w-full">
                {/* Top row: cabin class + trip type */}
                <div className="relative flex flex-col md:flex-row flex-wrap items-center lg:justify-center justify-end gap-3 mb-2 sm:mb-2 min-h-[44px] z-30">
                    <div className="z-30 order-2 md:order-none md:absolute md:left-0 md:top-1/2 md:-translate-y-1/2 w-full md:w-auto flex justify-center md:block" ref={classRef}>
                        <button
                            type="button"
                            onClick={() => setIsClassOpen(!isClassOpen)}
                            className="w-[266px] inline-flex items-center justify-between gap-2 rounded-full bg-[rgba(191,180,170,0.4)] hover:bg-[#6c5d52] pl-4 py-0 text-[20px] text-white transition-colors shadow-inner"
                            aria-label="Travel Class"
                        >
                            <span className="font-medium">{selectedClass || "Select Class"}</span>
                            <span className="w-[47px] h-[47px] rounded-full bg-[rgba(191,180,170,0.4)] flex items-center justify-center text-white shrink-0">
                                <img src="/media/fr-svgs/caret.png" alt="caret" />
                            </span>
                        </button>
                        {isClassOpen && (
                            <div className="absolute left-1/2 md:left-0 -translate-x-1/2 md:translate-x-0 z-[300] mt-2 min-w-[200px] rounded-2xl bg-white shadow-2xl border border-gray-100 p-1.5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                {travelClasses?.map((item) => (
                                    <div
                                        key={item}
                                        onClick={() => handleSelect(item)}
                                        className={`px-4 py-2.5 text-sm font-medium cursor-pointer rounded-xl transition-colors flex items-center justify-between ${selectedClass === item
                                            ? "bg-[#faf2ea] text-[#A57233] font-semibold"
                                            : "text-[#2a211c] hover:bg-[#faf2ea] hover:text-[#A57233]"
                                            }`}
                                    >
                                        <span>{item}</span>
                                        {selectedClass === item && (
                                            <span className="text-[#A57233] text-xs font-bold" aria-hidden>✓</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-center gap-5 sm:gap-8">
                        {order.map((type) => (
                            <button
                                key={type}
                                ref={(el) => (itemRefs.current[type] = el)}
                                type="button"
                                onClick={() => setTripType(type)}
                                className={`relative tracking-wide leading-none whitespace-nowrap
                transition-all duration-300 ease-out
                ${tripType === type
                                        ? "text-white sm:text-[20px] text-[16px] font-bold pb-1"
                                        : "text-white/60 hover:text-white/85 sm:text-[18px] text-[14px] font-semibold"
                                    }`}
                            >
                                {tripTypeLabels[type] || type}
                                {/* Underline indicator — always rendered, animated in/out */}
                                <span
                                    className={`absolute left-1/2 -translate-x-1/2 -bottom-0.5 h-[4px] rounded-full bg-[#F1A868]
                  transition-all duration-300 ease-out
                  ${tripType === type ? "w-[28px] opacity-100" : "w-0 opacity-0"}`}
                                />
                            </button>
                        ))}


                    </div>
                </div>                {tripType !== "Multi-City" && (
                    <div ref={formRef} className="relative z-20 rounded-[15px] bg-[#A7A29F] backdrop-blur-md border border-white/10 shadow-[0_12px_48px_rgba(0,0,0,0.22)] w-full max-w-[1320px] mx-auto min-h-[88px] flex flex-col md:flex-row items-stretch md:items-center p-2 sm:p-3 md:p-0  md:pr-[55px] min-[1450px]:pr-[45px] overflow-visible">
                        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-3 p-1 md:py-3 md:pl-[21px] md:pr-0 overflow-visible">
                            {/* FROM */}
                            <div ref={originRef} className="w-full relative  overflow-visible">
                                {focusedField === "origin" ? (
                                    <div className="relative bg-white rounded-[15px] lg:rounded-l-[15px] lg:rounded-r-none px-4 sm:px-6 py-2 flex items-center min-h-[75px] md:min-h-[80px] w-full z-20 shadow-lg transition-all duration-300">
                                        <img src="/media/fr-svgs/activesearchicon.png" alt="search" className="w-5 h-5 mr-3 shrink-0" />
                                        <div className="flex-1 flex flex-col items-start min-w-0">
                                            <span className="text-[14px] font-extrabold text-[#A57233] tracking-wide mb-0.5">Flying from?</span>
                                            <input
                                                type="text"
                                                aria-label="Origin"
                                                autoFocus
                                                placeholder="Your Departure Airport"
                                                className="w-full outline-none bg-transparent text-[15px] sm:text-[16px] text-[#A5A5A5] placeholder:text-[#A5A5A5] p-0"
                                                value={originLabel}
                                                onFocus={() => {
                                                    expandMobileForm();
                                                    setIsClassOpen(false);
                                                }}
                                                onChange={(e) => {
                                                    expandMobileForm();
                                                    setIsClassOpen(false);
                                                    const value = e.target.value;
                                                    if (/^[a-zA-Z\s]*$/.test(value)) {
                                                        setOriginLabel(value);
                                                        fetchCitySuggestions(value, "origin");
                                                    }
                                                }}
                                            />
                                        </div>
                                        {loadingOrigin && (
                                            <svg className="animate-spin h-5 w-5 text-[#A57233] shrink-0 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                            </svg>
                                        )}

                                        {originSuggestions.length > 0 && (
                                            <ul className="suggestion-list absolute left-0 right-0 top-full mt-2 z-[200] bg-white border border-gray-100 max-h-52 overflow-y-auto rounded-[20px] shadow-2xl p-1">
                                                {originSuggestions.map((item, index) => (
                                                    <li
                                                        key={index}
                                                        onMouseDown={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            const match = item.match(/\(([^)]+)\)/);
                                                            const code = match ? match[1] : item;
                                                            setOrigin(code);
                                                            setOriginLabel(item);
                                                            setOriginSuggestions([]);
                                                            setFocusedField(null);
                                                        }}
                                                        className={suggestionItemClass}
                                                    >
                                                        <span className="font-semibold">{item}</span>
                                                        <span className="text-[#A57233] opacity-0 group-hover:opacity-100 transition-opacity font-bold" aria-hidden>→</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => {
                                            expandMobileForm();
                                            setIsClassOpen(false);
                                            setFocusedField("origin");
                                        }}
                                        className="flex flex-col justify-between py-1 md:py-0 cursor-pointer w-full"
                                    >
                                        <span className="text-[14px] font-extrabold text-[#A57233] uppercase pl-2 mb-1">From</span>
                                        <div className="bg-white rounded-[14px] border border-[#A57233]/40 px-4 flex items-center justify-between h-[47px] w-full hover:bg-white/95 transition-all shadow-sm">
                                            <div className="flex items-center min-w-0 flex-1">
                                                <img src="/media/fr-svgs/locicon.png" alt="location" className="w-[17px] h-[22px] shrink-0 mr-2" />
                                                <span className="text-[14px] font-bold text-[#878787]/70 truncate pl-0.5">
                                                    {originLabel || "e.g London-All (LON)"}
                                                </span>
                                            </div>
                                            <img src="/media/fr-svgs/fromicon.png" alt="location" className="w-[24px] h-[25px] shrink-0 ml-2" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* TO */}
                            <div ref={destinationRef} className="w-full relative  overflow-visible">
                                {focusedField === "destination" ? (
                                    <div className="relative bg-white rounded-[15px] px-4 sm:px-6 py-2 flex items-center min-h-[75px] md:min-h-[80px] w-full z-20 shadow-lg transition-all duration-300">
                                        <img src="/media/fr-svgs/activesearchicon.png" alt="search" className="w-5 h-5 mr-3 shrink-0" />
                                        <div className="flex-1 flex flex-col items-start min-w-0">
                                            <span className="text-[14px] font-extrabold text-[#A57233] tracking-wide mb-0.5">Flying to?</span>
                                            <input
                                                type="text"
                                                aria-label="Destination"
                                                autoFocus
                                                placeholder="Your Destination Airport"
                                                className="w-full outline-none bg-transparent text-[15px] sm:text-[16px] text-[#A5A5A5] placeholder:text-[#A5A5A5] p-0"
                                                value={destinationLabel}
                                                onFocus={() => {
                                                    expandMobileForm();
                                                    setIsClassOpen(false);
                                                }}
                                                onChange={(e) => {
                                                    expandMobileForm();
                                                    setIsClassOpen(false);
                                                    const value = e.target.value;
                                                    if (/^[a-zA-Z\s]*$/.test(value)) {
                                                        setDestinationLabel(value);
                                                        fetchCitySuggestions(value, "destination");
                                                    }
                                                }}
                                            />
                                        </div>
                                        {loadingDestination && (
                                            <svg className="animate-spin h-5 w-5 text-[#A57233] shrink-0 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                            </svg>
                                        )}

                                        {destinationSuggestions.length > 0 && (
                                            <ul className="suggestion-list absolute left-0 right-0 top-full mt-2 z-[200] bg-white border border-gray-100 max-h-52 overflow-y-auto rounded-[20px] shadow-2xl p-1">
                                                {destinationSuggestions.map((item, index) => (
                                                    <li
                                                        key={index}
                                                        onMouseDown={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            const match = item.match(/\(([^)]+)\)/);
                                                            const code = match ? match[1] : item;
                                                            setDestination(code);
                                                            setDestinationLabel(item);
                                                            setDestinationSuggestions([]);
                                                            setFocusedField(null);
                                                        }}
                                                        className={suggestionItemClass}
                                                    >
                                                        <span className="font-semibold">{item}</span>
                                                        <span className="text-[#A57233] opacity-0 group-hover:opacity-100 transition-opacity font-bold" aria-hidden>→</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => {
                                            expandMobileForm();
                                            setIsClassOpen(false);
                                            setFocusedField("destination");
                                        }}
                                        className="flex flex-col justify-between py-1 md:py-0 cursor-pointer w-full"
                                    >
                                        <span className="text-[14px] font-extrabold text-[#A57233] uppercase pl-2 mb-1">To</span>
                                        <div className="bg-white rounded-[14px] border border-[#A57233]/40 px-4 flex items-center justify-between h-[47px] w-full hover:bg-white/95 transition-all shadow-sm">
                                            <div className="flex items-center min-w-0 flex-1">
                                                <img src="/media/fr-svgs/locicon.png" alt="location" className="w-[17px] h-[22px] shrink-0 mr-2" />
                                                <span className="text-[14px] font-bold text-[#878787]/70 truncate pl-0.5">
                                                    {destinationLabel || "e.g Copenhagen (CPG)"}
                                                </span>
                                            </div>
                                            <img src="/media/fr-svgs/toicon.png" alt="location" className="w-[20px] h-[15px] ml-2" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* DATES — hidden on mobile until form expanded (CSS max-md avoids isMobile hydrate CLS) */}
                            <div
                                onClick={() => {
                                    expandMobileForm();
                                    setFocusedField("dates");
                                }}
                                className={`flex flex-col justify-between py-1 md:py-0 cursor-pointer w-full ${mobileCollapsedFieldClass}`}
                            >
                                <span className="text-[14px] font-extrabold text-[#A57233] uppercase pl-2 mb-1">Dates</span>
                                <div className="bg-white rounded-[14px] border border-[#A57233]/40 px-4 flex items-center justify-between h-[47px] w-full hover:bg-white/95 transition-all shadow-sm">
                                    <div className="flex items-center min-w-0 flex-1 pl-1">
                                        <span className="text-[14px] font-bold text-[#878787]/70 truncate">
                                            {departureDate ? (
                                                tripType === "Round-Trip" && returnDate ? (
                                                    `${formatDisplayDate(departureDate)} - ${formatDisplayDate(returnDate)}`
                                                ) : (
                                                    formatDisplayDate(departureDate)
                                                )
                                            ) : (
                                                "Select Date"
                                            )}
                                        </span>
                                    </div>
                                    <img src="/media/fr-svgs/dateicon.png" alt="calendar" className="w-[18px] h-[18px] shrink-0 ml-2 opacity-85" />
                                </div>
                            </div>

                            {/* TRAVELLERS — hidden on mobile until form expanded (CSS max-md avoids isMobile hydrate CLS) */}
                            <div
                                ref={dropdownRef}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    expandMobileForm();
                                    setIsOpen(!isOpen);
                                }}
                                className={`relative flex flex-col justify-between py-1 md:py-0 cursor-pointer w-full ${mobileCollapsedFieldClass}`}
                            >
                                <span className="text-[14px] font-extrabold text-[#A57233] uppercase pl-2 mb-1">Travellers</span>
                                <div className="bg-white rounded-[14px] border border-[#A57233]/40 px-4 flex items-center justify-between h-[47px] w-full hover:bg-white/95 transition-all shadow-sm">
                                    <div className="flex items-center min-w-0 flex-1 pl-1">
                                        <span className="text-[14px] font-bold text-[#878787]/70 truncate">
                                            {`${String(totalTravellers).padStart(2, "0")} - Travellers`}
                                        </span>
                                    </div>
                                    <img src="/media/fr-svgs/travellersicon.png" alt="travellers" className="w-[18px] h-[18px] shrink-0 ml-2 opacity-85" />
                                </div>

                                {isOpen && (
                                    <div
                                        className="absolute z-40 mt-2 left-0 right-0 sm:left-auto sm:right-0 sm:w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 p-5 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {[
                                            { label: "Adult", desc: "Ages 16 years above", count: adults, setCount: setAdults, icon: `${BASE_URL_IMG}/assets/svgs/adult.svg`, min: 1 },
                                            { label: "Children", desc: "Ages 2 years - 12 years", count: children, setCount: setChildren, icon: `${BASE_URL_IMG}/assets/svgs/child.svg`, min: 0 },
                                            { label: "Infants", desc: "Under 2 years", count: infants, setCount: setInfants, icon: `${BASE_URL_IMG}/assets/svgs/infant.svg`, min: 0 },
                                        ].map(({ label, desc, count, setCount, icon, min }) => (
                                            <div key={label} className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3 text-left">
                                                    <img src={icon} alt="" className="w-5 h-5 opacity-80" />
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-[#2a211c]">{label}</span>
                                                        <span className="text-[10px] text-[#8a7f76] font-medium">{desc}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (label === "Adult") {
                                                                if (adults > 1) {
                                                                    const newAdult = adults - 1;
                                                                    if (children > newAdult * 2) {
                                                                        showToast(`You must Reduce Children to max ${newAdult * 2} before Reducing Adults.`, "info");
                                                                        return;
                                                                    }
                                                                    if (infants > newAdult) {
                                                                        showToast(`You must Reduce infants to max ${newAdult} before Reducing Adults.`, "info");
                                                                        return;
                                                                    }
                                                                    setCount(newAdult);
                                                                }
                                                            } else if (count > min) {
                                                                setCount(count - 1);
                                                            }
                                                        }}
                                                        className="w-7 h-7 rounded-full border border-[#7a6a5e] text-[#2a211c] font-semibold flex items-center justify-center hover:bg-gray-50 transition-colors"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-6 text-center font-bold text-[#2a211c] text-sm">
                                                        {String(count).padStart(2, "0")}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const total = adults + children + infants;
                                                            if (total >= 9) {
                                                                showToast("Total Passengers cannot Exceed 9.", "info");
                                                                return;
                                                            }
                                                            if (label === "Adult") {
                                                                setCount(adults + 1);
                                                            } else if (label === "Children") {
                                                                if (children >= adults * 2) {
                                                                    showToast("Children cannot be more than Twice the Number of Adults.", "info");
                                                                    return;
                                                                }
                                                                setCount(children + 1);
                                                            } else if (label === "Infants") {
                                                                if (infants >= adults) {
                                                                    showToast("Number of infants cannot Exceed Number of Adults.", "info");
                                                                    return;
                                                                }
                                                                setCount(infants + 1);
                                                            }
                                                        }}
                                                        className="w-7 h-7 rounded-full bg-[#A57233] text-white text-[19px] leading-[2] flex items-center justify-center hover:bg-[#8e622b] transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        <div className="pt-2 border-t border-gray-100">
                                            <button
                                                type="button"
                                                onClick={() => setIsOpen(false)}
                                                className="w-full py-2.5 bg-[#A57233] hover:bg-[#8e622b] text-white font-semibold rounded-full text-xs flex items-center justify-center gap-1.5 transition-colors"
                                            >
                                                Done &rarr;
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Mobile search button inside grid */}
                            <div className="md:hidden mt-2">
                                <button
                                    type="button"
                                    onClick={searchFlights}
                                    className="flex items-center justify-center gap-2 rounded-[14px] bg-[#A57233] hover:bg-[#8e622b] text-white font-semibold shadow-md w-full h-[47px] transition-colors"
                                    aria-label="Search flights"
                                >
                                    <img src="/media/fr-svgs/searchicon.png" alt="search" className="w-5 h-5 object-contain brightness-0 invert" />
                                    <span className="text-[15px] font-bold">Search Flights</span>
                                </button>
                            </div>
                        </div>

                        {/* Desktop Search Button — positioned on right edge */}
                        <div className="hidden md:flex absolute min-[1450px]:right-[-34px] lg:right-[-23px] md:right-[-15px] top-[50%] translate-y-[-50%] items-center justify-center m-0 shrink-0 z-20">
                            <button
                                type="button"
                                onClick={searchFlights}
                                className="flex flex-col items-center justify-center gap-0 rounded-full bg-[#A57233] hover:bg-[#8e622b] text-white font-semibold shadow-md w-16 h-16 transition-colors shrink-0"
                                aria-label="Search flights"
                            >
                                <img src="/media/fr-svgs/searchicon.png" alt="search" className="w-5 h-5 object-contain brightness-0 invert" />
                                <span className="text-[11px] mt-0.5 leading-none">Search</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Custom Double-Month Calendar Modal */}
                {(focusedField === "dates" || multiCityDateIndex !== null) && (
                    <div
                        className="mainbannerdatepicker fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                        onClick={() => setShowTripDropdown(false)}
                    >
                        <div
                            ref={calendarModalRef}
                            className="relative w-full max-w-[680px] bg-white rounded-[24px] shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 overflow-visible"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* ── Header ── */}
                            <div className="flex items-start justify-between px-[20px] pt-[31px] pb-5 relative after:w-[70%] after:h-[1px] after:bg-[#C6C6C6]  after:absolute after:left-[50%] after:translate-x-[-50%] after:bottom-0">
                                <div className="flex items-center gap-6">
                                    {/* Departure date block */}
                                    <div className="flex flex-col text-left min-w-[80px]">
                                        <span className="text-[18px] text-[#343434]">
                                            {multiCityDateIndex !== null ? `Flight ${multiCityDateIndex + 1}` : "From"}
                                        </span>
                                        <div className="flex flex-col items-start gap-1">
                                            <span className="text-[32px] font-bold text-[#343434] leading-none">
                                                {multiCityDateIndex !== null
                                                    ? (Multiflights[multiCityDateIndex]?.date ? new Date(Multiflights[multiCityDateIndex].date).getDate() : "--")
                                                    : (departureDate ? departureDate.getDate() : "--")}
                                            </span>
                                            <div className="flex flex-col pb-1">
                                                <span className="text-[18px] text-[#343434] leading-tight">
                                                    {multiCityDateIndex !== null
                                                        ? (Multiflights[multiCityDateIndex]?.date
                                                            ? new Date(Multiflights[multiCityDateIndex].date).toLocaleString("en-GB", { month: "long", year: "numeric" })
                                                            : "Select date")
                                                        : (departureDate
                                                            ? departureDate.toLocaleString("en-GB", { month: "long", year: "numeric" })
                                                            : "Select date")}
                                                </span>
                                                <span className="text-[18px] text-[#343434]">
                                                    {multiCityDateIndex !== null
                                                        ? (Multiflights[multiCityDateIndex]?.date
                                                            ? new Date(Multiflights[multiCityDateIndex].date).toLocaleString("en-GB", { weekday: "long" })
                                                            : "")
                                                        : (departureDate ? departureDate.toLocaleString("en-GB", { weekday: "long" }) : "")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Airplane separator — always visible */}
                                    {multiCityDateIndex === null && (
                                        <div className="flex items-center justify-center text-[#A57233] mx-1">
                                            <img src="/media/fr-svgs/airplane.png" alt="airplane" />
                                        </div>
                                    )}

                                    {/* Return date block — only shown in Round-Trip */}
                                    {multiCityDateIndex === null && tripType === "Round-Trip" && (
                                        <div className="flex flex-col text-left min-w-[80px]">
                                            <span className="text-[18px] text-[#343434]">From</span>
                                            <div className="flex flex-col items-start gap-1">
                                                <span className="text-[32px] font-bold text-[#343434] leading-none">
                                                    {returnDate ? returnDate.getDate() : "--"}
                                                </span>
                                                <div className="flex flex-col pb-1">
                                                    <span className="text-[18px] text-[#343434] leading-tight">
                                                        {returnDate
                                                            ? returnDate.toLocaleString("en-GB", { month: "long", year: "numeric" })
                                                            : "Select date"}
                                                    </span>
                                                    <span className="text-[18px] text-[#343434]">
                                                        {returnDate ? returnDate.toLocaleString("en-GB", { weekday: "long" }) : ""}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Close button */}
                                <button
                                    type="button"
                                    onClick={() => { setFocusedField(null); setShowTripDropdown(false); }}
                                    className="ml-4 mt-1 p-1.5 rounded-full hover:bg-gray-100 text-[#8a7f76] hover:text-[#A57233] transition-colors shrink-0"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* ── Calendar Body ── */}
                            <div className="flex justify-center px-[20px] py-[0px] overflow-x-auto">
                                {multiCityDateIndex !== null ? (
                                    <DatePicker
                                        selected={Multiflights[multiCityDateIndex]?.date ? new Date(Multiflights[multiCityDateIndex].date) : null}
                                        onChange={(date) => updateFlight(multiCityDateIndex, "date", date)}
                                        monthsShown={isMobile ? 1 : 2}
                                        inline
                                        minDate={new Date()}
                                    />
                                ) : (
                                    <DatePicker
                                        selected={departureDate}
                                        onChange={(dates) => {
                                            if (tripType === "Round-Trip") {
                                                const [start, end] = dates;
                                                setDepartureDate(start);
                                                setReturnDate(end);
                                            } else {
                                                setDepartureDate(dates);
                                                setReturnDate(null);
                                            }
                                        }}
                                        startDate={departureDate}
                                        endDate={returnDate}
                                        selectsRange={tripType === "Round-Trip"}
                                        monthsShown={isMobile ? 1 : 2}
                                        inline
                                        minDate={new Date()}
                                    />
                                )}
                            </div>

                            {/* ── Footer ── */}
                            <div className="flex items-center justify-between px-[40px] pb-[25px] pt-[5px]">
                                {/* Trip-type dropdown button */}
                                {multiCityDateIndex === null ? (
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); setShowTripDropdown((v) => !v); }}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-[#A57233] hover:bg-[#8e622b] text-white font-semibold rounded-full text-sm transition-colors"
                                        >
                                            <span>{tripType === "Round-Trip" ? "Round Trip" : "One Way"}</span>
                                            <svg
                                                className={`w-4 h-4 transition-transform duration-200 ${showTripDropdown ? "rotate-180" : ""}`}
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                            </svg>
                                        </button>

                                        {/* Dropdown list */}
                                        {showTripDropdown && (
                                            <div className="absolute left-0 bottom-full mb-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden min-w-[140px] z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
                                                {[
                                                    { label: "Round Trip", value: "Round-Trip" },
                                                    { label: "One Way", value: "One-Way" },
                                                ].map((opt) => (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setTripType(opt.value);
                                                            if (opt.value === "One-Way") setReturnDate(null);
                                                            setShowTripDropdown(false);
                                                        }}
                                                        className={`w-full text-left px-5 py-3 text-sm font-semibold transition-colors ${tripType === opt.value
                                                            ? "bg-[#faf2ea] text-[#A57233]"
                                                            : "text-[#2a211c] hover:bg-gray-50"
                                                            }`}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-sm font-semibold text-[#8a7f76]">Departure Date</span>
                                )}

                                {/* Done button */}
                                <button
                                    type="button"
                                    onClick={() => { setFocusedField(null); setShowTripDropdown(false); }}
                                    className="flex items-center gap-2 px-7 py-2.5 bg-[#A57233] hover:bg-[#8e622b] text-white font-bold rounded-full text-sm transition-colors"
                                >
                                    Done
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14M13 6l6 6-6 6" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {tripType === "Multi-City" && (
                    <div ref={formRef} className="z-20 relative rounded-[15px] bg-[#A7A29F] backdrop-blur-md border border-white/10 shadow-[0_12px_48px_rgba(0,0,0,0.22)] p-0 space-y-0 overflow-visible">
                        {/* Contact row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:items-stretch border-b border-white/10">
                            {/* TRAVELLERS */}
                            <div
                                ref={dropdownRef}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsOpen(!isOpen);
                                    setFocusedField("travellers");
                                }}
                                className={`relative ${mcFieldWrapper} cursor-pointer`}
                            >
                                <span className={mcFieldLabel}>Travellers</span>
                                <div className={mcFieldBox}>
                                    <div className="flex items-center min-w-0 flex-1 pl-1">
                                        <span className={mcFieldText}>
                                            {`${String(totalTravellers).padStart(2, "0")} - Travellers`}
                                        </span>
                                    </div>
                                    <img src="/media/fr-svgs/travellersicon.png" alt="travellers" className="w-[18px] h-[18px] shrink-0 ml-2 opacity-85" />
                                </div>

                                {isOpen && (
                                    <div
                                        className="absolute z-40 mt-2 left-0 right-0 sm:left-auto sm:right-0 sm:w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 p-5 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {[
                                            { label: "Adult", desc: "Ages 16 years above", count: adults, setCount: setAdults, icon: `${BASE_URL_IMG}/assets/svgs/adult.svg`, min: 1 },
                                            { label: "Children", desc: "Ages 2 years - 12 years", count: children, setCount: setChildren, icon: `${BASE_URL_IMG}/assets/svgs/child.svg`, min: 0 },
                                            { label: "Infants", desc: "Under 2 years", count: infants, setCount: setInfants, icon: `${BASE_URL_IMG}/assets/svgs/infant.svg`, min: 0 },
                                        ].map(({ label, desc, count, setCount, icon, min }) => (
                                            <div key={label} className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3 text-left">
                                                    <img src={icon} alt="" className="w-5 h-5 opacity-80" />
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-[#2a211c]">{label}</span>
                                                        <span className="text-[10px] text-[#8a7f76] font-medium">{desc}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (label === "Adult") {
                                                                if (adults > 1) {
                                                                    const newAdult = adults - 1;
                                                                    if (children > newAdult * 2) {
                                                                        showToast(`You must Reduce Children to max ${newAdult * 2} before Reducing Adults.`, "info");
                                                                        return;
                                                                    }
                                                                    if (infants > newAdult) {
                                                                        showToast(`You must Reduce infants to max ${newAdult} before Reducing Adults.`, "info");
                                                                        return;
                                                                    }
                                                                    setCount(newAdult);
                                                                }
                                                            } else if (count > min) {
                                                                setCount(count - 1);
                                                            }
                                                        }}
                                                        className="w-7 h-7 rounded-full border border-[#7a6a5e] text-[#2a211c] font-semibold flex items-center justify-center hover:bg-gray-50 transition-colors"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-6 text-center font-bold text-[#2a211c] text-sm">
                                                        {String(count).padStart(2, "0")}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const total = adults + children + infants;
                                                            if (total >= 9) {
                                                                showToast("Total Passengers cannot Exceed 9.", "info");
                                                                return;
                                                            }
                                                            if (label === "Adult") {
                                                                setCount(adults + 1);
                                                            } else if (label === "Children") {
                                                                if (children >= adults * 2) {
                                                                    showToast("Children cannot be more than Twice the Number of Adults.", "info");
                                                                    return;
                                                                }
                                                                setCount(children + 1);
                                                            } else if (label === "Infants") {
                                                                if (infants >= adults) {
                                                                    showToast("Number of infants cannot Exceed Number of Adults.", "info");
                                                                    return;
                                                                }
                                                                setCount(infants + 1);
                                                            }
                                                        }}
                                                        className="w-7 h-7 rounded-full bg-[#A57233] text-white font-semibold flex items-center justify-center hover:bg-[#8e622b] transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        <div className="pt-2 border-t border-gray-100">
                                            <button
                                                type="button"
                                                onClick={() => setIsOpen(false)}
                                                className="w-full py-2.5 bg-[#A57233] hover:bg-[#8e622b] text-white font-semibold rounded-full text-xs flex items-center justify-center gap-1.5 transition-colors"
                                            >
                                                Done &rarr;
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* NAME */}
                            <div className={mcFieldWrapper}>
                                <span className={mcFieldLabel}>Name</span>
                                <div className={mcFieldBox}>
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        aria-label="Full Name"
                                        className={mcInputClass}
                                        value={multiCityFullName}
                                        onFocus={() => setFocusedField("mc-name")}
                                        onBlur={() => setFocusedField((f) => (f === "mc-name" ? null : f))}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (/^[a-zA-Z\s]*$/.test(value)) setMultiCityFullName(value);
                                        }}
                                    />
                                </div>
                            </div>

                            {/* EMAIL */}
                            <div className={mcFieldWrapper}>
                                <span className={mcFieldLabel}>Email</span>
                                <div className={mcFieldBox}>
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        aria-label="Email Address"
                                        className={mcInputClass}
                                        value={multiCityEmail}
                                        onFocus={() => setFocusedField("mc-email")}
                                        onBlur={() => setFocusedField((f) => (f === "mc-email" ? null : f))}
                                        onChange={(e) => setMultiCityEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* PHONE */}
                            <div className={mcFieldWrapper}>
                                <span className={mcFieldLabel}>Phone</span>
                                <div className={mcFieldBox}>
                                    <input
                                        type="tel"
                                        placeholder="Phone Number"
                                        aria-label="Phone Number"
                                        className={mcInputClass}
                                        value={multiCityPhone}
                                        onFocus={() => setFocusedField("mc-phone")}
                                        onBlur={() => setFocusedField((f) => (f === "mc-phone" ? null : f))}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (/^[0-9+\s-]*$/.test(value)) setMultiCityPhone(value);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Flight 1 — same main-form layout as before */}
                        {(() => {
                            const flight = Multiflights[0] || EMPTY_MULTI_FLIGHT;
                            const index = 0;
                            return (
                            <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:items-stretch pr-0">
                                {/* FROM */}
                                <div className="w-full relative" ref={originRef}>
                                    {focusedField === `mc-origin-${index}` ? (
                                        <div className="relative bg-white rounded-[15px] lg:rounded-l-[15px] lg:rounded-r-none px-6 py-3.5 flex items-center min-h-[88px] w-full z-20 shadow-lg transition-all duration-300">
                                            <img src="/media/fr-svgs/activesearchicon.png" alt="search" className="w-5 h-5 mr-3 shrink-0" />
                                            <div className="flex-1 flex flex-col items-start min-w-0">
                                                <span className="text-[16px] font-medium text-[#A57233] tracking-wide mb-0.5">Flying from?</span>
                                                <input
                                                    type="text"
                                                    aria-label="Flight 1 Origin"
                                                    autoFocus
                                                    placeholder="Your Departure Airport"
                                                    className="w-full outline-none bg-transparent text-[16px] sm:text-[18px] text-[#A5A5A5] placeholder:text-[#A5A5A5] p-0"
                                                    value={flight.originLabel}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (/^[a-zA-Z\s]*$/.test(value)) {
                                                            updateFlight(index, "originLabel", value);
                                                            setActiveSuggestion({ index, type: "origin" });
                                                            fetchCitySuggestions(value, "origin");
                                                        }
                                                    }}
                                                />
                                            </div>
                                            {loadingOrigin && activeSuggestion?.index === index && activeSuggestion?.type === "origin" && (
                                                <svg className="animate-spin h-5 w-5 text-[#A57233] shrink-0 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                                </svg>
                                            )}
                                            {activeSuggestion?.index === index && activeSuggestion?.type === "origin" && originSuggestions.length > 0 && (
                                                <ul className="suggestion-list absolute left-0 right-0 top-full mt-2 z-[200] bg-white border border-gray-100 max-h-52 overflow-y-auto rounded-[20px] shadow-2xl p-1">
                                                    {originSuggestions.map((item, i) => (
                                                        <li
                                                            key={i}
                                                            onMouseDown={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                selectMultiCitySuggestion(index, "origin", item);
                                                            }}
                                                            className={suggestionItemClass}
                                                        >
                                                            <span className="font-semibold">{item}</span>
                                                            <span className="text-[#A57233] opacity-0 group-hover:opacity-100 transition-opacity font-bold" aria-hidden>→</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => setFocusedField(`mc-origin-${index}`)}
                                            className={`${mcFieldWrapper} cursor-pointer`}
                                        >
                                            <span className={mcFieldLabel}>From</span>
                                            <div className={mcFieldBox}>
                                                <div className="flex items-center min-w-0 flex-1">
                                                    <img src="/media/fr-svgs/locicon.png" alt="location" className="w-[17px] h-[22px] shrink-0 mr-2" />
                                                    <span className={`${mcFieldText} pl-0.5`}>
                                                        {flight.originLabel || "e.g London-All (LON)"}
                                                    </span>
                                                </div>
                                                <img src="/media/fr-svgs/fromicon.png" alt="from" className="w-[24px] h-[25px] shrink-0 ml-2" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* TO */}
                                <div className="w-full relative" ref={destinationRef}>
                                    {focusedField === `mc-dest-${index}` ? (
                                        <div className="relative bg-white rounded-[15px] px-6 py-3.5 flex items-center min-h-[88px] w-full z-20 shadow-lg transition-all duration-300">
                                            <img src="/media/fr-svgs/activesearchicon.png" alt="search" className="w-5 h-5 mr-3 shrink-0" />
                                            <div className="flex-1 flex flex-col items-start min-w-0">
                                                <span className="text-[16px] font-medium text-[#A57233] tracking-wide mb-0.5">Flying to?</span>
                                                <input
                                                    type="text"
                                                    aria-label="Flight 1 Destination"
                                                    autoFocus
                                                    placeholder="Your Destination Airport"
                                                    className="w-full outline-none bg-transparent text-[16px] sm:text-[18px] text-[#A5A5A5] placeholder:text-[#A5A5A5] p-0"
                                                    value={flight.destinationLabel}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (/^[a-zA-Z\s]*$/.test(value)) {
                                                            updateFlight(index, "destinationLabel", value);
                                                            setActiveSuggestion({ index, type: "destination" });
                                                            fetchCitySuggestions(value, "destination");
                                                        }
                                                    }}
                                                />
                                            </div>
                                            {loadingDestination && activeSuggestion?.index === index && activeSuggestion?.type === "destination" && (
                                                <svg className="animate-spin h-5 w-5 text-[#A57233] shrink-0 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                                </svg>
                                            )}
                                            {activeSuggestion?.index === index && activeSuggestion?.type === "destination" && destinationSuggestions.length > 0 && (
                                                <ul className="suggestion-list absolute left-0 right-0 top-full mt-2 z-[200] bg-white border border-gray-100 max-h-52 overflow-y-auto rounded-[20px] shadow-2xl p-1">
                                                    {destinationSuggestions.map((item, i) => (
                                                        <li
                                                            key={i}
                                                            onMouseDown={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                selectMultiCitySuggestion(index, "destination", item);
                                                            }}
                                                            className={suggestionItemClass}
                                                        >
                                                            <span className="font-semibold">{item}</span>
                                                            <span className="text-[#A57233] opacity-0 group-hover:opacity-100 transition-opacity font-bold" aria-hidden>→</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => setFocusedField(`mc-dest-${index}`)}
                                            className={`${mcFieldWrapper} cursor-pointer`}
                                        >
                                            <span className={mcFieldLabel}>To</span>
                                            <div className={mcFieldBox}>
                                                <div className="flex items-center min-w-0 flex-1">
                                                    <img src="/media/fr-svgs/locicon.png" alt="location" className="w-[17px] h-[22px] shrink-0 mr-2" />
                                                    <span className={`${mcFieldText} pl-0.5`}>
                                                        {flight.destinationLabel || "e.g Copenhagen (CPG)"}
                                                    </span>
                                                </div>
                                                <img src="/media/fr-svgs/toicon.png" alt="to" className="w-[20px] h-[15px] ml-2" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* DATE */}
                                <div
                                    onClick={() => setFocusedField(`mc-date-${index}`)}
                                    className="flex flex-col py-3 px-1 min-[1450px]:px-3 min-h-[88px] cursor-pointer justify-start"
                                >
                                    <span className={mcFieldLabel}>Date</span>
                                    <div className={mcFieldBox}>
                                        <div className="flex items-center min-w-0 flex-1 pl-1">
                                            <span className={mcFieldText}>
                                                {flight.date ? formatDisplayDate(new Date(flight.date)) : "Select Departure Date"}
                                            </span>
                                        </div>
                                        <img src="/media/fr-svgs/dateicon.png" alt="calendar" className="w-[18px] h-[18px] shrink-0 ml-2 opacity-85" />
                                    </div>
                                </div>

                                {/* ADD FLIGHT + SUBMIT */}
                                <div className={`${mcFieldWrapper} !min-h-0 lg:col-span-1`}>
                                    <span className={`${mcFieldLabel} invisible`}>Action</span>
                                    <div className="flex items-center gap-2 min-h-[48px]">
                                        <button
                                            type="button"
                                            onClick={openMultiCityFlightsPopup}
                                            className="flex flex-col items-center justify-center gap-0.5 shrink-0 text-[#A57233] hover:text-[#8e622b] transition-colors px-1"
                                        >
                                            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-[#A57233]/40 text-[#A57233] shadow-sm text-xl font-light leading-none">+</span>
                                            <span className="text-[10px] font-bold uppercase tracking-wide">Add Flight</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={submitMultiCityForm}
                                            disabled={multiCitySubmitting}
                                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-[14px] bg-[#A57233] hover:bg-[#8e622b] text-white font-semibold min-h-[48px] px-4 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-md"
                                        >
                                            {multiCitySubmitting ? "Submitting..." : "Submit"}
                                            {!multiCitySubmitting && (
                                                <img src="/media/fr-svgs/searchicon.png" alt="" className="w-4 h-4 object-contain brightness-0 invert" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            );
                        })()}
                    </div>
                )}

                {/* Popup: extra flights only (Flight 2+) */}
                {isMultiCityFlightsOpen && tripType === "Multi-City" && (
                    <div
                        className="fixed inset-0 z-[9980] overflow-y-auto bg-black/45 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={closeMultiCityFlightsPopup}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Manage additional multi-city flights"
                    >
                        <div className="min-h-full flex items-end sm:items-center justify-center p-0 sm:p-4">
                        <div
                            ref={multiCityFlightsModalRef}
                            className="relative w-full max-w-[920px] bg-[#F7F3EF] sm:rounded-[24px] rounded-t-[24px] shadow-2xl flex flex-col overflow-visible animate-in zoom-in-95 duration-200 my-0 sm:my-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between px-5 sm:px-6 pt-5 pb-4 border-b border-[#E5E0D8] shrink-0">
                                <div>
                                    <h3 className="text-[18px] sm:text-[20px] font-bold text-[#2a211c]">
                                        Additional Flights
                                    </h3>
                                    <p className="text-[12px] sm:text-[13px] text-[#6B6B6B] mt-0.5">
                                        Flight 1 stays on the form. Add or remove extra flights here, then Done.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={closeMultiCityFlightsPopup}
                                    className="w-9 h-9 rounded-full bg-white border border-[#E5E0D8] text-[#2a211c] hover:border-[#A57233] transition-colors flex items-center justify-center"
                                    aria-label="Close flights popup"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
                                    </svg>
                                </button>
                            </div>

                            <div className="relative z-20 px-4 sm:px-6 py-4 space-y-4 overflow-visible max-h-[332px] overflow-y-auto sm:max-h-none sm:overflow-visible">
                                {Multiflights.length <= 1 && (
                                    <p className="text-center text-[14px] text-[#6B6B6B] py-8">
                                        No additional flights yet. Tap Add Flight below.
                                    </p>
                                )}
                                {Multiflights.map((flight, index) => {
                                    if (index === 0) return null;
                                    const isEditingThis =
                                        focusedField === `mc-origin-${index}` ||
                                        focusedField === `mc-dest-${index}`;
                                    return (
                                    <div
                                        key={index}
                                        className={`relative rounded-[18px] bg-[#A7A29F]/55 border border-white/20 p-3 sm:p-4 space-y-2 overflow-visible ${
                                            isEditingThis ? "z-40" : "z-10"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1 px-1">
                                            <span className="text-[12px] font-bold uppercase tracking-wide text-[#A57233]">
                                                Flight {index + 1}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => removeFlight(index)}
                                                className="text-[12px] font-semibold text-[#B42318] hover:underline"
                                            >
                                                Remove
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 overflow-visible">
                                            {/* FROM */}
                                            <div className="w-full relative overflow-visible">
                                                {focusedField === `mc-origin-${index}` ? (
                                                    <div className="relative bg-white rounded-[15px] px-4 py-3 flex items-center min-h-[72px] w-full z-20 shadow-lg overflow-visible">
                                                        <img src="/media/fr-svgs/activesearchicon.png" alt="" className="w-5 h-5 mr-2 shrink-0" />
                                                        <div className="flex-1 flex flex-col items-start min-w-0">
                                                            <span className="text-[13px] font-medium text-[#A57233] mb-0.5">Flying from?</span>
                                                            <input
                                                                type="text"
                                                                aria-label={`Flight ${index + 1} Origin`}
                                                                autoFocus
                                                                placeholder="Your Departure Airport"
                                                                className="w-full outline-none bg-transparent text-[15px] text-[#A5A5A5] placeholder:text-[#A5A5A5] p-0"
                                                                value={flight.originLabel}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    if (/^[a-zA-Z\s]*$/.test(value)) {
                                                                        updateFlight(index, "originLabel", value);
                                                                        setActiveSuggestion({ index, type: "origin" });
                                                                        fetchCitySuggestions(value, "origin");
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                        {loadingOrigin && activeSuggestion?.index === index && activeSuggestion?.type === "origin" && (
                                                            <svg className="animate-spin h-5 w-5 text-[#A57233] shrink-0 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                                            </svg>
                                                        )}
                                                        {activeSuggestion?.index === index && activeSuggestion?.type === "origin" && originSuggestions.length > 0 && (
                                                            <ul className="suggestion-list absolute left-0 right-0 top-full mt-2 z-[200] bg-white border border-gray-100 max-h-56 overflow-y-auto rounded-[16px] shadow-2xl p-1">
                                                                {originSuggestions.map((item, i) => (
                                                                    <li
                                                                        key={i}
                                                                        onMouseDown={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            selectMultiCitySuggestion(index, "origin", item);
                                                                        }}
                                                                        className={suggestionItemClass}
                                                                    >
                                                                        <span className="font-semibold">{item}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div
                                                        onClick={() => setFocusedField(`mc-origin-${index}`)}
                                                        className="cursor-pointer"
                                                    >
                                                        <span className={mcFieldLabel}>From</span>
                                                        <div className={mcFieldBox}>
                                                            <div className="flex items-center min-w-0 flex-1">
                                                                <img src="/media/fr-svgs/locicon.png" alt="" className="w-[17px] h-[22px] shrink-0 mr-2" />
                                                                <span className={`${mcFieldText} pl-0.5`}>
                                                                    {flight.originLabel || "e.g London-All (LON)"}
                                                                </span>
                                                            </div>
                                                            <img src="/media/fr-svgs/fromicon.png" alt="" className="w-[24px] h-[25px] shrink-0 ml-2" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* TO */}
                                            <div className="w-full relative overflow-visible">
                                                {focusedField === `mc-dest-${index}` ? (
                                                    <div className="relative bg-white rounded-[15px] px-4 py-3 flex items-center min-h-[72px] w-full z-20 shadow-lg overflow-visible">
                                                        <img src="/media/fr-svgs/activesearchicon.png" alt="" className="w-5 h-5 mr-2 shrink-0" />
                                                        <div className="flex-1 flex flex-col items-start min-w-0">
                                                            <span className="text-[13px] font-medium text-[#A57233] mb-0.5">Flying to?</span>
                                                            <input
                                                                type="text"
                                                                aria-label={`Flight ${index + 1} Destination`}
                                                                autoFocus
                                                                placeholder="Your Destination Airport"
                                                                className="w-full outline-none bg-transparent text-[15px] text-[#A5A5A5] placeholder:text-[#A5A5A5] p-0"
                                                                value={flight.destinationLabel}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    if (/^[a-zA-Z\s]*$/.test(value)) {
                                                                        updateFlight(index, "destinationLabel", value);
                                                                        setActiveSuggestion({ index, type: "destination" });
                                                                        fetchCitySuggestions(value, "destination");
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                        {loadingDestination && activeSuggestion?.index === index && activeSuggestion?.type === "destination" && (
                                                            <svg className="animate-spin h-5 w-5 text-[#A57233] shrink-0 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                                            </svg>
                                                        )}
                                                        {activeSuggestion?.index === index && activeSuggestion?.type === "destination" && destinationSuggestions.length > 0 && (
                                                            <ul className="suggestion-list absolute left-0 right-0 top-full mt-2 z-[200] bg-white border border-gray-100 max-h-56 overflow-y-auto rounded-[16px] shadow-2xl p-1">
                                                                {destinationSuggestions.map((item, i) => (
                                                                    <li
                                                                        key={i}
                                                                        onMouseDown={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            selectMultiCitySuggestion(index, "destination", item);
                                                                        }}
                                                                        className={suggestionItemClass}
                                                                    >
                                                                        <span className="font-semibold">{item}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div
                                                        onClick={() => setFocusedField(`mc-dest-${index}`)}
                                                        className="cursor-pointer"
                                                    >
                                                        <span className={mcFieldLabel}>To</span>
                                                        <div className={mcFieldBox}>
                                                            <div className="flex items-center min-w-0 flex-1">
                                                                <img src="/media/fr-svgs/locicon.png" alt="" className="w-[17px] h-[22px] shrink-0 mr-2" />
                                                                <span className={`${mcFieldText} pl-0.5`}>
                                                                    {flight.destinationLabel || "e.g Copenhagen (CPG)"}
                                                                </span>
                                                            </div>
                                                            <img src="/media/fr-svgs/toicon.png" alt="" className="w-[20px] h-[15px] ml-2" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* DATE */}
                                            <div
                                                onClick={() => setFocusedField(`mc-date-${index}`)}
                                                className="cursor-pointer"
                                            >
                                                <span className={mcFieldLabel}>Date</span>
                                                <div className={mcFieldBox}>
                                                    <div className="flex items-center min-w-0 flex-1 pl-1">
                                                        <span className={mcFieldText}>
                                                            {flight.date
                                                                ? formatDisplayDate(new Date(flight.date))
                                                                : "Select Departure Date"}
                                                        </span>
                                                    </div>
                                                    <img src="/media/fr-svgs/dateicon.png" alt="" className="w-[18px] h-[18px] shrink-0 ml-2 opacity-85" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>

                            <div className="relative z-10 shrink-0 border-t border-[#E5E0D8] bg-white px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:rounded-b-[24px]">
                                <button
                                    type="button"
                                    onClick={addFlight}
                                    disabled={Multiflights.length >= MAX_MULTI_FLIGHTS}
                                    className="inline-flex items-center justify-center gap-2 rounded-[14px] border border-[#A57233]/50 text-[#A57233] font-semibold min-h-[48px] px-4 hover:bg-[#A57233]/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <span className="text-xl leading-none font-light">+</span>
                                    Add Flight
                                </button>
                                <button
                                    type="button"
                                    onClick={closeMultiCityFlightsPopup}
                                    className="sm:ml-auto inline-flex items-center justify-center gap-2 rounded-[14px] bg-[#A57233] hover:bg-[#8e622b] text-white font-semibold min-h-[48px] px-6 transition-colors shadow-md"
                                >
                                    Done
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14M13 6l6 6-6 6" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default FlightTabNew;
