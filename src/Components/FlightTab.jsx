"use client";
import React, { useEffect, useRef, useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../ExternalCSS/FlightTab.css";
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { airlines } from '../DataResources/Airlines';
import api, { BASE_URL } from '../Helpers/apiHelper';
import { showToast } from '../Helpers/Helper';
import { BASE_URL_IMG } from "../Helpers/imageurl";

const FlightTab = ({ title, description, setFlightLoading, activeTab, setPopupMessage, setBookNowLoading }) => {
    const parseDescription = (htmlString) => {
        if (!htmlString) return { h2Text: '', pText: '' };
        // Simple regex to extract text content from h2 and p tags (SSR-safe)
        const h2Match = htmlString.match(/<h2[^>]*>(.*?)<\/h2>/i);
        const pMatch = htmlString.match(/<p[^>]*>(.*?)<\/p>/i);
        const h2Text = h2Match ? h2Match[1].replace(/<[^>]*>/g, '').trim() : '';
        const pText = pMatch ? pMatch[1].replace(/<[^>]*>/g, '').trim() : '';
        return { h2Text, pText };
    };

    const { h2Text, pText } = parseDescription(description || '');

    const router = useRouter();
    const [userIp, setUserIp] = useState("");
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [tripType, setTripType] = useState('One-Way');
    const [departureDate, setDepartureDate] = useState(null);
    const [returnDate, setReturnDate] = useState(null);
    const [loadingOrigin, setLoadingOrigin] = useState(false);
    const [loadingDestination, setLoadingDestination] = useState(false);

    const originRef = useRef(null);
    const destinationRef = useRef(null);

    // No Of Adults DropDown
    const dropdownRef = useRef(null);

    const [isOpen, setIsOpen] = useState(false);
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [infants, setInfants] = useState(0);
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
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Airlines Class DropDown
    const classRef = useRef(null);

    const [isClassOpen, setIsClassOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState("");

    const travelClasses = ["Economy", "Premium Economy", "Business", "First Class"];

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

    // MultiCity Flights
    const [Multiflights, setMultiflights] = useState([
        { originLabel: "", origin: "", destinationLabel: "", destination: "", date: "" }
    ]);
    const [activeSuggestion, setActiveSuggestion] = useState(null); // { index: number, type: 'origin' | 'destination' } or null

    const addFlight = () => {
        setMultiflights([...Multiflights, { originLabel: "", origin: "", destinationLabel: "", destination: "", date: "" }]);
    };

    const updateFlight = (index, field, value) => {
        const updated = [...Multiflights];
        updated[index][field] = value;
        setMultiflights(updated);
    };

    const parseDate = (dateStr) => {
        if (!dateStr) return null;
        const [day, month, year] = dateStr.split("-").map(Number);
        return new Date(year, month - 1, day);
    };

    useEffect(() => {
        if (pathname && pathname.replace(/\/$/, "") === "/flightDetails") {
            let savedData = {};
            try {
                const raw = localStorage.getItem("flightFormData");
                savedData = raw ? JSON.parse(raw) : {};
            } catch (e) {
                savedData = {};
            }

            const params = searchParams;

            setTripType(savedData.tripType || params.get("TripType") || "One-Way");
            setOrigin(savedData.origin || params.get("Origin") || "");
            setDestination(savedData.destination || params.get("Destination") || "");
            setOriginLabel(savedData.originLabel || params.get("Originlabel") || "");
            setDestinationLabel(savedData.destinationLabel || params.get("Destinationlabel") || "");

            setDepartureDate(
                savedData.departureDate
                    ? new Date(savedData.departureDate)
                    : params.get("DepartDate")
                        ? parseDate(params.get("DepartDate"))
                        : null
            );

            setReturnDate(
                savedData.returnDate
                    ? new Date(savedData.returnDate)
                    : params.get("ArrivalDate")
                        ? parseDate(params.get("ArrivalDate"))
                        : null
            );

            setSelectedClass(savedData.selectedClass || params.get("Class") || "");
            setAdults(savedData.adults || params.get("NoOfAdultPax") || 1);
            setChildren(savedData.children || params.get("NoOfChildPax") || 0);
            setInfants(savedData.infants || params.get("NoOfInfantPax") || 0);
            setSelectedAirlines(savedData.selectedAirlines || []);
        }
    }, [pathname, searchParams]);


    useEffect(() => {
        const handleClickOutside = (event) => {
            // Origin
            if (originRef.current && !originRef.current.contains(event.target)) {
                if (originSuggestions.length > 0) {
                    setOriginLabel("");
                }
                setOriginSuggestions([]);
            }

            // Destination
            if (destinationRef.current && !destinationRef.current.contains(event.target)) {
                if (destinationSuggestions.length > 0) {
                    setDestinationLabel("");
                }
                setDestinationSuggestions([]);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [originSuggestions, destinationSuggestions]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (classRef.current && !classRef.current.contains(event.target)) {
                setIsClassOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    function formatLocalDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${day}-${month}-${year}`;
    }

    // useEffect(() => {
    //     if (tripType === "One-Way") {
    //         setReturnDate(null);
    //     }
    // }, [tripType]);

    // useEffect(() => {
    //     if (returnDate && departureDate && returnDate <= departureDate) {
    //         setReturnDate(null);
    //     }
    // }, [departureDate]);

    // const validDepartureDate = departureDate instanceof Date && !isNaN(departureDate.getTime())
    //     ? departureDate
    //     : null;

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
            if (!originLabel && !flight.originLabel) {
                showToast(`Please enter Origin for Flight ${i + 1}.`, "error");
                return;
            }
            if (!destinationLabel && !flight.destinationLabel) {
                showToast(`Please enter Destination for Flight ${i + 1}.`, "error");
                return;
            }
            if (!departureDate && !flight.date) {
                showToast(`Please select Departure Date for Flight ${i + 1}.`, "error");
                return;
            }
        }

        setMultiCitySubmitting(true);

        // Build flights info for the note
        const flightsInfo = Multiflights.map((flight, i) => {
            const flightOrigin = flight.originLabel || originLabel || 'N/A';
            const flightDest = flight.destinationLabel || destinationLabel || 'N/A';
            const flightDate = flight.date ? formatLocalDate(new Date(flight.date)) : (departureDate ? formatLocalDate(departureDate) : 'N/A');
            return `Flight ${i + 1}: ${flightOrigin} → ${flightDest} on ${flightDate}`;
        }).join(' | ');

        const passengersInfo = `Adults: ${adults}, Children: ${children}, Infants: ${infants}`;

        const payload = {
            fullname: multiCityFullName.trim(),
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
            setMultiflights([{ origin: "", destination: "", date: "" }]);
            setSelectedClass("");
            setAdults(1);
            setChildren(0);
            setInfants(0);
            setOriginLabel("");
            setDestinationLabel("");
            setOrigin("");
            setDestination("");
            router.push("/thankyou.html");
        } catch (error) {
            console.error('Multi-City submit error:', error);
            showToast("There was an error submitting your enquiry. Please try again.", "error");
        } finally {
            setMultiCitySubmitting(false);
        }
    };

    // Fetch Flights
    const searchFlights = async () => {
        const isOnFlightDetails = pathname && pathname.replace(/\/$/, "") === "/flightDetails";
        if (isOnFlightDetails) {
            if (typeof setBookNowLoading === 'function') setBookNowLoading(true);
        } else {
            if (typeof setFlightLoading === 'function') setFlightLoading(true);
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

        // Save Form data
        localStorage.setItem("flightFormData", JSON.stringify(formState));

        const tripTypeCode = tripType === 'Round-Trip' ? 'RT' : 'OW';
        localStorage.setItem("TripType", tripTypeCode);

        const body = {
            TripType: tripTypeCode,
            Origin: origin,
            Destination: destination,
            AirlineCode: selectedAirlines.join(','),
            DepartDate: departureDate ? formatLocalDate(departureDate) : "",
            ArrivalDate: returnDate ? formatLocalDate(returnDate) : "",
            Class: selectedClass,
            IsFlexibleDate: false,
            IsDirectFlight: false,
            NoOfAdultPax: adults,
            NoOfInfantPax: infants,
            NoOfChildPax: children,
            NoOfYouthPax: 0,
            CompanyCode: "BS6593",
            WebsiteName: "zippytravel.co.uk",
            ApplicationAccessMode: "LIVE",
            username: "BS6593",
            password: "#Bs65@93z1pPyTrAvEl_Live"
        };
        // console.log("FlightBody", body)

        try {
            const response = await api.post('/flightsearch', body);
            const data = response.data;
            // console.log("Search Results:", response);

            if (data?.apiFault) {
                if (isOnFlightDetails) {
                    if (typeof setBookNowLoading === 'function') setBookNowLoading(false);
                } else {
                    if (typeof setFlightLoading === 'function') setFlightLoading(false);
                }
                if (typeof setPopupMessage === 'function') setPopupMessage(data?.apiFault?.errorDescription || "Flight Pricing Failed.");
                return;
            }

            if (data?.result?.token) {
                localStorage.setItem("FlightToken", data?.result?.token);
            }

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

            if (isOnFlightDetails) {
                if (typeof setBookNowLoading === 'function') setBookNowLoading(false);
                router.replace(`/flightDetails?${queryString}`);
                // navigate("/flightDetails", { state: { results: data }, replace: true });

            } else {
                if (typeof setFlightLoading === 'function') setFlightLoading(false);
                // navigate("/flightDetails", { state: { results: data } });
                router.push(`/flightDetails?${queryString}`);
            }

        } catch (error) {
            console.error("Error:", error.message || error);
            if (isOnFlightDetails) {
                if (typeof setBookNowLoading === 'function') setBookNowLoading(false);
            } else {
                if (typeof setFlightLoading === 'function') setFlightLoading(false);
            }
            if (typeof setPopupMessage === 'function') setPopupMessage(error.message || "Flight Search Failed.");
        }
    };

    return (
        <>
            <div className="w-full sm:max-w-4xl">
                {/* Headings */}
                {title &&
                    <div className="max-w-4xl mx-auto">
                        <h1
                            className="text-[32px] sm:text-[36px] md:text-[40px] lg:text-[48px] font-normal leading-tight mt-[25px]"
                            style={{ fontFamily: "inherit", lineHeight: "1.3" }}
                        >
                            {title} <br />
                            <span className="text-[#F1A868] text-[40px] sm:text-[46px] md:text-[52px] lg:text-[60px]">
                                {h2Text}
                            </span>
                        </h1>

                        <p
                            className="text-[16px] sm:text-[17px] md:text-[18px] lg:text-[20px] text-[#000000] mt-1"
                            style={{ fontFamily: "inherit" }}
                        >
                            {pText}
                        </p>

                    </div>
                }
                {/* Form */}
                <div className="bg-[#A57233] rounded-xl py-4 px-4 w-full max-w-3xl text-white space-y-2">
                    {/* Trip Type Tabs */}
                    <div className="flex flex-wrap gap-3 mb-4">
                        {['One-Way', 'Round-Trip','Multi-City'].map((type) => (
                            <label
                                key={type}
                                className="flex items-center space-x-3 cursor-pointer w-[48%] sm:w-auto"
                            >
                                {/* Hide Native input */}
                                <input
                                    type="radio"
                                    name="tripType"
                                    value={type}
                                    checked={tripType === type}
                                    onChange={() => setTripType(type)}
                                    className="hidden"
                                />

                                {/* Custom radio */}
                                <span
                                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                ${tripType === type ? 'border-[#F1A868]' : 'border-[#F1A868]'}`}
                                >
                                    {tripType === type && (
                                        <span className="w-2 h-2 bg-[#F1A868] rounded-full" />
                                    )}
                                </span>

                                {/* Label text */}
                                <span className="text-[16px] text-white ml-[5px]">
                                    {type
                                        .split('-')
                                        .map(
                                            (word) =>
                                                word.charAt(0).toUpperCase() + word.slice(1)
                                        )
                                        .join('-')}
                                </span>
                            </label>
                        ))}
                    </div>

                    {/* Form Fields */}
                    {tripType !== "Multi-City" &&
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-2">
                                {/* Origin */}
                                <div className="relative" ref={originRef}>
                                    <div
                                        className="flex items-center bg-white text-black rounded-md px-3 py-2"
                                        style={{ height: "55px" }}
                                    >
                                        <img
                                            src={`${BASE_URL_IMG}/assets/svgs/flightInput.svg`}
                                            className="w-5 h-5 mr-2"
                                            alt="Flight"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Origin"
                                            className="w-full outline-none text-md placeholder:text-[14px] placeholder:font-medium"
                                            value={originLabel}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (/^[a-zA-Z\s]*$/.test(value)) {
                                                    setOriginLabel(value);
                                                    fetchCitySuggestions(value, "origin");
                                                }
                                            }}
                                        />
                                        {loadingOrigin && (
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                            <svg className="animate-spin h-6 w-6 text-[#A57233]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                                    ></path>
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    {originSuggestions.length > 0 && (
                                        <ul className="absolute z-10 w-full bg-white border border-gray-300 max-h-60 overflow-y-auto rounded-md shadow-md mt-1">
                                            {originSuggestions.map((item, index) => (
                                                <li
                                                    key={index}
                                                    onClick={() => {
                                                        const fullText = item;
                                                        const match = fullText.match(/\(([^)]+)\)/);
                                                        const code = match ? match[1] : fullText;

                                                        setOrigin(code);
                                                        setOriginLabel(fullText);
                                                        setOriginSuggestions([]);
                                                    }}
                                                    className="px-4 py-2 cursor-pointer hover:bg-[#A57233] text-black text-md font-medium hover:text-white"
                                                >
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                {/* Destination */}
                                <div className="relative" ref={destinationRef}>
                                    <div className="flex items-center bg-white text-black rounded-md px-3 py-2" style={{ height: "55px" }}>
                                        <img src={`${BASE_URL_IMG}/assets/svgs/DesiInput.svg`} className="w-5 h-5 mr-2" alt="Destination" />
                                        <input
                                            type="text"
                                            placeholder="Destination"
                                            className="w-full outline-none text-md placeholder:text-[14px] placeholder:font-medium"
                                            value={destinationLabel}
                                            onChange={(e) => {
                                                const value = e.target.value;

                                                if (/^[a-zA-Z\s]*$/.test(value)) {
                                                    setDestinationLabel(value);
                                                    fetchCitySuggestions(value, "destination");
                                                }
                                            }}
                                        />
                                        {loadingDestination && (
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                            <svg className="animate-spin h-6 w-6 text-[#A57233]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                                    ></path>
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    {destinationSuggestions.length > 0 && (
                                        <ul className="absolute z-10 w-full bg-white border border-gray-300 max-h-60 overflow-y-auto rounded-md shadow-md mt-1">
                                            {destinationSuggestions.map((item, index) => (
                                                <li
                                                    key={index}
                                                    onClick={() => {
                                                        const fullText = item;
                                                        const match = fullText.match(/\(([^)]+)\)/);
                                                        const code = match ? match[1] : fullText;

                                                        setDestination(code);
                                                        setDestinationLabel(fullText);
                                                        setDestinationSuggestions([]);
                                                    }}
                                                    className="px-4 py-2 cursor-pointer hover:bg-[#A57233] text-black text-md font-medium hover:text-white"
                                                >
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-2">
                                {/* DeParture Date */}
                                <div className="flex items-center bg-white text-black rounded-md px-3 py-2" style={{ height: "55px" }}>
                                    <img src={`${BASE_URL_IMG}/assets/svgs/Date.svg`} className="w-4 h-4 mr-2" alt="Calendar" />
                                    <DatePicker
                                        selected={departureDate}
                                        onChange={(date) => setDepartureDate(date)}
                                        placeholderText="Departure Date"
                                        className="w-full outline-none text-md placeholder:text-[14px] placeholder:font-medium"
                                        minDate={new Date()}
                                    />
                                </div>
                                {/* Return Date */}
                                <div
                                    className={`flex items-center rounded-md px-3 py-2 transition-colors duration-200 ${tripType === "One-Way"
                                        ? "bg-[#E5C7DE] text-gray-500"
                                        : "bg-white text-black"
                                        }`}
                                    style={{ height: "55px" }}
                                >
                                    <img
                                        src={`${BASE_URL_IMG}/assets/svgs/Date.svg`}
                                        className="w-4 h-4 mr-2"
                                        alt="Calendar"
                                        style={{
                                            opacity: tripType === "One-Way" ? 0.7 : 1,
                                        }}
                                    />

                                    <DatePicker
                                        selected={returnDate}
                                        onChange={(date) => setReturnDate(date)}
                                        placeholderText="Return Date"
                                        disabled={tripType === "One-Way"}
                                        className="w-full outline-none text-md placeholder:text-[14px] placeholder:font-medium bg-transparent"
                                        minDate={new Date()}
                                    />
                                </div>
                                {/* Class Type */}
                                <div className="relative inline-block w-full" ref={classRef}>
                                    {/* Input Field */}
                                    <div
                                        className="flex items-center bg-white text-black rounded-md px-3 py-2 cursor-pointer text-left"
                                        onClick={() => setIsClassOpen(!isClassOpen)}
                                        style={{ height: "55px" }}
                                    >
                                        <img src={`${BASE_URL_IMG}/assets/svgs/Export.svg`} className="w-5 h-5 mr-2" alt="Class" />
                                        <input
                                            type="text"
                                            placeholder='Select Class'
                                            value={selectedClass}
                                            readOnly
                                            className="w-full outline-none text-md placeholder:text-[14px] placeholder:font-medium"
                                        />
                                    </div>

                                    {/* Dropdown Menu */}
                                    {isClassOpen && (
                                        <div className="absolute z-10 mt-2 w-full bg-white rounded-md shadow-lg p-2">
                                            {travelClasses?.map((item) => (
                                                <div
                                                    key={item}
                                                    onClick={() => handleSelect(item)}
                                                    className={`px-4 py-2 font-semibold cursor-pointer hover:bg-[#AF81AA] hover:text-white border-b border-gray-300 text-[#F1A868] rounded ${selectedClass === item ? 'bg-[#AF81AA] text-white' : ''
                                                        }`}
                                                >
                                                    {item}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-2">
                                {/* Adults Type */}
                                <div className="relative inline-block w-full" ref={dropdownRef}>
                                    {/* Input field */}
                                    <div
                                        className="flex items-center bg-white text-black rounded-md px-3 py-2 cursor-pointer text-left"
                                        onClick={() => setIsOpen(!isOpen)}
                                        style={{ height: "60px" }}
                                    >
                                        <img src={`${BASE_URL_IMG}/assets/svgs/Passenger.svg`} className="w-5 h-5 mr-2" alt="02 ADT-00 CHD-00 INF" />
                                        <input
                                            type="text"
                                            readOnly
                                            value={`${String(adults).padStart(2, '0')} ADT - ${String(children).padStart(2, '0')} CHD - ${String(infants).padStart(2, '0')} INF`}
                                            className="w-full outline-none text-md text-[14px] font-medium text-[#A9A3AF]"
                                        />
                                    </div>

                                    {/* Dropdown */}
                                    {isOpen && (
                                        <div className="absolute z-10 mt-2 w-full bg-white rounded-md shadow-lg p-4 space-y-4">
                                            {[
                                                { label: 'Adult(s)', count: adults, setCount: setAdults, icon: `${BASE_URL_IMG}/assets/svgs/adult.svg`, min: 1 },
                                                { label: 'Child(s)', count: children, setCount: setChildren, icon: `${BASE_URL_IMG}/assets/svgs/child.svg`, min: 0 },
                                                { label: 'Infant(s)', count: infants, setCount: setInfants, icon: `${BASE_URL_IMG}/assets/svgs/infant.svg`, min: 0 },
                                            ].map(({ label, count, setCount, icon, min }) => (
                                                <div key={label} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                                        <img src={icon} alt={label} className="w-4 h-4 text-red-600" />
                                                        {label}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {/* Decrease */}
                                                        <button
                                                            onClick={() => {
                                                                if (label === 'Adult(s)') {
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
                                                                } else {
                                                                    if (count > min) setCount(count - 1);
                                                                }
                                                            }}
                                                            className="bg-gray-200 text-gray-600 px-2 rounded"
                                                        >
                                                            -
                                                        </button>

                                                        {/* Count display */}
                                                        <span className="w-8 text-center font-semibold text-black" style={{ textDecoration: "underline" }}>
                                                            {String(count).padStart(2, '0')}
                                                        </span>

                                                        {/* Increase */}
                                                        <button
                                                            onClick={() => {
                                                                const total = adults + children + infants;

                                                                if (total >= 9) {
                                                                    showToast("Total Passengers cannot Exceed 9.", "info");
                                                                    return;
                                                                }

                                                                if (label === 'Adult(s)') {
                                                                    setCount(adults + 1);
                                                                }

                                                                if (label === 'Child(s)') {
                                                                    if (children >= adults * 2) {
                                                                        showToast("Children cannot be more than Twice the Number of Adults.", "info");
                                                                        return;
                                                                    }
                                                                    setCount(children + 1);
                                                                }

                                                                if (label === 'Infant(s)') {
                                                                    if (infants >= adults) {
                                                                        showToast("Number of infants cannot Exceed Number of Adults.", "info");
                                                                        return;
                                                                    }
                                                                    setCount(infants + 1);
                                                                }
                                                            }}
                                                            className="bg-[#A57233] text-white px-2 rounded"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}

                                            <div className=" flex justify-center text-center pt-2">
                                                <button
                                                className="text-[#A57233] font-medium hover:underline flex items-center gap-1"
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    Done <span>↗</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {/* Airlines Type */}
                                {/* <div className="relative inline-block w-full" ref={AirRef}> */}
                                {/* Input Field */}
                                {/* <div
                                        className="flex items-center bg-white text-black rounded-md px-3 py-2 cursor-text min-h-[55px] border border-gray-300"
                                        onClick={() => setIsAirOpen(true)}
                                    >
                                        <img src={`${BASE_URL_IMG}/assets/svgs/flightInput.svg`} className="w-5 h-5 mr-2" alt="Airlines" />
                                        <input
                                            type="text"
                                            placeholder="Select Airlines"
                                            value={searchTerm || selectedNames}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full outline-none text-[14px] font-medium text-black placeholder:text-[#A9A3AF]"
                                            onFocus={() => setIsAirOpen(true)}
                                        />
                                    </div> */}

                                {/* Dropdown */}
                                {/* {isAirOpen && (
                                        <div className="absolute z-10 mt-2 w-full bg-white rounded-md shadow-lg p-2 max-h-64 overflow-y-auto border border-gray-200">
                                            {airlines
                                                ?.filter((airline) =>
                                                    airline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                    airline.code.toLowerCase().includes(searchTerm.toLowerCase())
                                                )
                                                .map((airline) => (
                                                    <div
                                                        key={airline.code}
                                                        onClick={() => handleToggle(airline.code)}
                                                        className="flex items-center justify-between px-4 py-2 cursor-pointer border-b border-gray-100 hover:bg-gray-100 text-[#F1A868] rounded"
                                                    >
                                                        <span className="font-medium">
                                                            {airline.name} ({airline.code})
                                                        </span>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedAirlines.includes(airline.code)}
                                                            readOnly
                                                            className="form-checkbox text-[#A57233] accent-[#A57233] w-4 h-4"
                                                        />
                                                    </div>
                                                ))}
                                            <div className="flex justify-center pt-2">
                                                <button
                                                    className="text-[#A57233] font-medium hover:underline"
                                                    onClick={() => {
                                                        setIsAirOpen(false);
                                                        setSearchTerm("");
                                                    }}
                                                >
                                                    Done <span>↗</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div> */}

                                {/* Search Button */}
                                <button
                                    onClick={searchFlights}
                                className="bg-[#F1A868] text-white px-3 py-2 rounded-md text-[18px] font-bold flex items-center gap-2 text-center justify-center w-full"
                                    style={{ height: "55px" }}
                                >
                                    Search
                                    <span className="text-lg">
                                        <img src={`${BASE_URL_IMG}/assets/svgs/Search.svg`} className="mr-2" alt="Search" />
                                    </span>
                                </button>
                            </div>
                        </>
                    }

                    {tripType === "Multi-City" &&
                        <div className="">
                            {Multiflights?.map((flight, index) => (
                                <div key={index} className="mb-4">
                                    <p className="font-bold mb-2 text-white text-[16px]">
                                        Flight {index + 1}
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                        {/* Origin */}
                                        <div className="relative" ref={originRef}>
                                            <div
                                                className="flex items-center bg-white text-black rounded-md px-3 py-2"
                                                style={{ height: "55px" }}
                                            >
                                                <img
                                                    src={`${BASE_URL_IMG}/assets/svgs/flightInput.svg`}
                                                    className="w-5 h-5 mr-2"
                                                    alt="Flight"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Origin"
                                                    className="w-full outline-none text-md placeholder:text-[14px] placeholder:font-medium"
                                                    value={flight.originLabel}
                                                    onChange={(e) => {
                                                        updateFlight(index, "originLabel", e.target.value);
                                                        setActiveSuggestion({ index, type: "origin" });
                                                        fetchCitySuggestions(e.target.value, "origin");
                                                    }}
                                                    onFocus={() => setActiveSuggestion({ index, type: "origin" })}
                                                />
                                                {loadingOrigin && activeSuggestion && activeSuggestion.index === index && activeSuggestion.type === "origin" && (
                                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                        <svg className="animate-spin h-6 w-6 text-[#A57233]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle
                                                                className="opacity-25"
                                                                cx="12"
                                                                cy="12"
                                                                r="10"
                                                                stroke="currentColor"
                                                                strokeWidth="4"
                                                            ></circle>
                                                            <path
                                                                className="opacity-75"
                                                                fill="currentColor"
                                                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                                            ></path>
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>

                                            {activeSuggestion && activeSuggestion.index === index && activeSuggestion.type === "origin" && originSuggestions.length > 0 && (
                                                <ul className="absolute z-10 w-full bg-white border border-gray-300 max-h-60 overflow-y-auto rounded-md shadow-md mt-1">
                                                    {originSuggestions.map((item, i) => (
                                                        <li
                                                            key={i}
                                                            onClick={() => {
                                                                const fullText = item;
                                                                const match = fullText.match(/\(([^)]+)\)/);
                                                                const code = match ? match[1] : fullText;

                                                                updateFlight(index, "origin", code);
                                                                updateFlight(index, "originLabel", fullText);
                                                                setOriginSuggestions([]);
                                                                setActiveSuggestion(null);
                                                            }}
                                                            className="px-4 py-2 cursor-pointer hover:bg-[#A57233] text-black text-md font-medium hover:text-white"
                                                        >
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>

                                        {/* Destination */}
                                        <div className="relative" ref={destinationRef}>
                                            <div className="flex items-center bg-white text-black rounded-md px-3 py-2" style={{ height: "55px" }}>
                                                <img src={`${BASE_URL_IMG}/assets/svgs/DesiInput.svg`} className="w-5 h-5 mr-2" alt="Destination" />
                                                <input
                                                    type="text"
                                                    placeholder="Destination"
                                                    className="w-full outline-none text-md placeholder:text-[14px] placeholder:font-medium"
                                                    value={flight.destinationLabel}
                                                    onChange={(e) => {
                                                        updateFlight(index, "destinationLabel", e.target.value);
                                                        setActiveSuggestion({ index, type: "destination" });
                                                        fetchCitySuggestions(e.target.value, "destination");
                                                    }}
                                                    onFocus={() => setActiveSuggestion({ index, type: "destination" })}
                                                />
                                                {loadingDestination && activeSuggestion && activeSuggestion.index === index && activeSuggestion.type === "destination" && (
                                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                        <svg className="animate-spin h-6 w-6 text-[#A57233]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle
                                                                className="opacity-25"
                                                                cx="12"
                                                                cy="12"
                                                                r="10"
                                                                stroke="currentColor"
                                                                strokeWidth="4"
                                                            ></circle>
                                                            <path
                                                                className="opacity-75"
                                                                fill="currentColor"
                                                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                                            ></path>
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>

                                            {activeSuggestion && activeSuggestion.index === index && activeSuggestion.type === "destination" && destinationSuggestions.length > 0 && (
                                                <ul className="absolute z-10 w-full bg-white border border-gray-300 max-h-60 overflow-y-auto rounded-md shadow-md mt-1">
                                                    {destinationSuggestions.map((item, i) => (
                                                        <li
                                                            key={i}
                                                            onClick={() => {
                                                                const fullText = item;
                                                                const match = fullText.match(/\(([^)]+)\)/);
                                                                const code = match ? match[1] : fullText;

                                                                updateFlight(index, "destination", code);
                                                                updateFlight(index, "destinationLabel", fullText);
                                                                setDestinationSuggestions([]);
                                                                setActiveSuggestion(null);
                                                            }}
                                                            className="px-4 py-2 cursor-pointer hover:bg-[#A57233] text-black text-md font-medium hover:text-white"
                                                        >
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>

                                        {/* DeParture Date */}
                                        <div className="flex items-center bg-white text-black rounded-md px-3 py-2" style={{ height: "55px" }}>
                                            <img src={`${BASE_URL_IMG}/assets/svgs/Date.svg`} className="w-4 h-4 mr-2" alt="Calendar" />
                                            <DatePicker
                                                selected={flight.date}
                                                onChange={(date) => updateFlight(index, "date", date)}
                                                placeholderText="Departure Date"
                                                className="w-full outline-none text-md placeholder:text-[14px] placeholder:font-medium"
                                                minDate={new Date()}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div className="text-center flex flex-col items-center space-y-1 mt-2 mb-2">
                                <div className="w-9 h-9 flex items-center justify-center bg-white rounded-full shadow-md">
                                    <img src={`${BASE_URL_IMG}/assets/svgs/Add.svg`}
                                        className=" cursor-pointer" alt="Add Icon" onClick={addFlight} />
                                </div>
                                <button
                                    className="text-white text-md font-semibold"
                                >
                                    Add Flight
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3">
                                {/* Class Type */}
                                <div className="relative inline-block w-full" ref={classRef}>
                                    {/* Input Field */}
                                    <div
                                        className="flex items-center bg-white text-black rounded-md px-3 py-2 cursor-pointer text-left"
                                        onClick={() => setIsClassOpen(!isClassOpen)}
                                        style={{ height: "55px" }}
                                    >
                                        <img src={`${BASE_URL_IMG}/assets/svgs/Export.svg`} className="w-5 h-5 mr-2" alt="Class" />
                                        <input
                                            type="text"
                                            placeholder='Select Class'
                                            value={selectedClass}
                                            readOnly
                                            className="w-full outline-none text-md placeholder:text-[14px] placeholder:font-medium"
                                        />
                                    </div>

                                    {/* Dropdown Menu */}
                                    {isClassOpen && (
                                        <div className="absolute z-10 mt-2 w-full bg-white rounded-md shadow-lg p-2">
                                            {travelClasses?.map((item) => (
                                                <div
                                                    key={item}
                                                    onClick={() => handleSelect(item)}
                                                    className={`px-4 py-2 font-semibold cursor-pointer hover:bg-[#AF81AA] hover:text-white border-b border-gray-300 text-[#F1A868] rounded ${selectedClass === item ? 'bg-[#AF81AA] text-white' : ''
                                                        }`}
                                                >
                                                    {item}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Adults Type */}
                                <div className="relative inline-block w-full" ref={dropdownRef}>
                                    {/* Input field */}
                                    <div
                                        className="flex items-center bg-white text-black rounded-md px-3 py-2 cursor-pointer text-left"
                                        onClick={() => setIsOpen(!isOpen)}
                                        style={{ height: "55px" }}
                                    >
                                        <img src={`${BASE_URL_IMG}/assets/svgs/Passenger.svg`} className="w-5 h-5 mr-2" alt="02 ADT - 00 CHD - 00 INF" />
                                        <input
                                            type="text"
                                            readOnly
                                            value={`${String(adults).padStart(2, '0')} ADT - ${String(children).padStart(2, '0')} CHD - ${String(infants).padStart(2, '0')} INF`}
                                            className="w-full outline-none text-md text-[14px] font-medium text-[#A9A3AF]"
                                        />
                                    </div>

                                    {/* Dropdown */}
                                    {isOpen && (
                                        <div className="absolute z-10 mt-2 w-full bg-white rounded-md shadow-lg p-4 space-y-4">
                                            {[
                                                { label: 'Adult(s)', count: adults, setCount: setAdults, icon: `${BASE_URL_IMG}/assets/svgs/adult.svg`, min: 1 },
                                                { label: 'Child(s)', count: children, setCount: setChildren, icon: `${BASE_URL_IMG}/assets/svgs/child.svg`, min: 0 },
                                                { label: 'Infant(s)', count: infants, setCount: setInfants, icon: `${BASE_URL_IMG}/assets/svgs/infant.svg`, min: 0 },
                                            ].map(({ label, count, setCount, icon, min }) => (
                                                <div key={label} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                                        <img src={icon} alt={label} className="w-4 h-4 text-red-600" />
                                                        {label}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {/* Decrease */}
                                                        <button
                                                            onClick={() => {
                                                                if (label === 'Adult(s)') {
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
                                                                } else {
                                                                    if (count > min) setCount(count - 1);
                                                                }
                                                            }}
                                                            className="bg-gray-200 text-gray-600 px-2 rounded"
                                                        >
                                                            -
                                                        </button>

                                                        {/* Count display */}
                                                        <span className="w-8 text-center font-semibold text-black" style={{ textDecoration: "underline" }}>
                                                            {String(count).padStart(2, '0')}
                                                        </span>

                                                        {/* Increase */}
                                                        <button
                                                            onClick={() => {
                                                                const total = adults + children + infants;

                                                                if (total >= 9) {
                                                                    showToast("Total Passengers cannot Exceed 9.", "info");
                                                                    return;
                                                                }

                                                                if (label === 'Adult(s)') {
                                                                    setCount(adults + 1);
                                                                }

                                                                if (label === 'Child(s)') {
                                                                    if (children >= adults * 2) {
                                                                        showToast("Children cannot be more than Twice the Number of Adults.", "info");
                                                                        return;
                                                                    }
                                                                    setCount(children + 1);
                                                                }

                                                                if (label === 'Infant(s)') {
                                                                    if (infants >= adults) {
                                                                        showToast("Number of infants cannot Exceed Number of Adults.", "info");
                                                                        return;
                                                                    }
                                                                    setCount(infants + 1);
                                                                }
                                                            }}
                                                            className="bg-[#A57233] text-white px-2 rounded"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}

                                            <div className=" flex justify-center text-center pt-2">
                                                <button
                                                    className="text-[#A57233] font-medium hover:underline flex items-center gap-1"
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    Done <span>↗</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Multi-City Contact Fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-3 mt-2">
                                {/* Full Name */}
                                <div className="flex items-center bg-white text-black rounded-md px-3 py-2" style={{ height: "55px" }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        className="w-full outline-none text-md placeholder:text-[14px] placeholder:font-medium"
                                        value={multiCityFullName}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (/^[a-zA-Z\s]*$/.test(value)) {
                                                setMultiCityFullName(value);
                                            }
                                        }}
                                    />
                                </div>
                                {/* Email */}
                                <div className="flex items-center bg-white text-black rounded-md px-3 py-2" style={{ height: "55px" }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        className="w-full outline-none text-md placeholder:text-[14px] placeholder:font-medium"
                                        value={multiCityEmail}
                                        onChange={(e) => setMultiCityEmail(e.target.value)}
                                    />
                                </div>
                                {/* Phone Number */}
                                <div className="flex items-center bg-white text-black rounded-md px-3 py-2" style={{ height: "55px" }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <input
                                        type="tel"
                                        placeholder="Phone Number"
                                        className="w-full outline-none text-md placeholder:text-[14px] placeholder:font-medium"
                                        value={multiCityPhone}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (/^[0-9+\-\s]*$/.test(value)) {
                                                setMultiCityPhone(value);
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={submitMultiCityForm}
                                disabled={multiCitySubmitting}
                                className="bg-[#F1A868] text-white px-3 py-2 rounded-md text-[18px] font-bold flex items-center gap-2 text-center justify-center w-full mt-3 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#b8051f] transition-colors duration-200"
                                style={{ height: "55px" }}
                            >
                                {multiCitySubmitting ? "Submitting..." : "Submit"}
                                {!multiCitySubmitting && (
                                    <span className="text-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                )}
                            </button>
                        </div>
                    }
                </div>
            </div>
        </>
    )
}

export default FlightTab;