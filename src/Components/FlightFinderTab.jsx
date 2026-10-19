"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../ExternalCSS/FlightTab.css";
import { useRouter } from "next/navigation";
import { airlines } from '../DataResources/Airlines';
import { BASE_URL_IMG } from "../Helpers/imageurl";

const FlightFinderTab = () => {

    const router = useRouter();

    const [tripType, setTripType] = useState('One-Way');
    const [departureDate, setDepartureDate] = useState(null);
    const [returnDate, setReturnDate] = useState(null);

    // No Of Adults DropDown
    const dropdownRef = useRef(null);

    const [isOpen, setIsOpen] = useState(false);
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [infants, setInfants] = useState(0);

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
    const [selectedClass, setSelectedClass] = useState('');

    const travelClasses = ['Any', 'Economy', 'Premium Economy', 'Business', 'First Class'];

    const handleSelect = (item) => {
        setSelectedClass(item);
        setIsClassOpen(false);
    };

    // Airlines List DropDown
    const AirRef = useRef(null);

    const [isAirOpen, setIsAirOpen] = useState(false);
    const [selectedAirlines, setSelectedAirlines] = useState([]);

    const handleToggle = (airline) => {
        if (selectedAirlines.includes(airline)) {
            setSelectedAirlines(selectedAirlines.filter(a => a !== airline));
        } else {
            setSelectedAirlines([...selectedAirlines, airline]);
        }
    };

    const displayValue = selectedAirlines.length > 0 ? selectedAirlines.join(', ') : 'Select Airlines';

    // Airlines Origin DropDown
    const [origin, setOrigin] = useState("");
    const [originSuggestions, setOriginSuggestions] = useState([]);

    // Airlines Destination DropDown
    const [destination, setDestination] = useState("");
    const [destinationSuggestions, setDestinationSuggestions] = useState([]);

    // console.log(originSuggestions)
    // console.log(destinationSuggestions)


    // Fetch Cities
    const fetchCitySuggestions = async (text, type) => {
        if (text.length < 3) return;

        try {
            text = text.trim().toLowerCase();

            const response = await fetch(`http://localhost:5000/api/cities/${text}`);
            const data = await response.json();

            // console.log("Full city API Response:", data);

            if (type === "origin") {
                setOriginSuggestions(data);
            } else {
                setDestinationSuggestions(data);
            }

        } catch (error) {
            console.error("Error fetching city suggestions:", error);
        }
    };

    // Fetch Flights
    const searchFlights = async () => {
        const body = {
            TripType: tripType === 'Round-Trip' ? 'RT' : 'OW',
            Origin: origin,
            Destination: destination,
            AirlineCode: "",
            DepartDate: departureDate ? departureDate.toISOString().split("T")[0] : "",
            ArrivalDate: returnDate ? returnDate.toISOString().split("T")[0] : "",
            Class: "Economy",
            IsFlexibleDate: false,
            IsDirectFlight: false,
            NoOfAdultPax: adults,
            NoOfInfantPax: infants,
            NoOfChildPax: children,
            NoOfYouthPax: 0,
            CompanyCode: "BS6593",
            WebsiteName: "zippytravel.co.uk",
            ApplicationAccessMode: "LIVE"
        };

        try {
            const res = await fetch("http://localhost:5000/api/search-flights", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            const data = await res.json();
            // console.log("Flight Results:", data);

            // ✅ Navigate to Results Page with Data
            // Assuming queryParams would be constructed from the 'data' object or other state
            // For now, I'll use a placeholder for queryParams or construct a simple one.
            // If 'queryParams' is meant to be a variable, it needs to be defined.
            // Given the instruction, I'll assume the user wants to pass the data as a query parameter
            // or expects 'queryParams' to be defined elsewhere.
            // Since `state` is not directly supported in `router.push` for Next.js,
            // data would typically be passed via query parameters or a global state management.
            // I will construct a basic query string for `results` for now.
            const queryParams = new URLSearchParams({ results: JSON.stringify(data) }).toString();
            router.push(`/flight-list?${queryParams}`);

        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <>
            <div className="w-full">

                {/* Form */}
                <div className="bg-[#A57233] rounded-xl p-4 w-full max-w-4xl mx-auto text-white space-y-5 mt-7 mb-10">
                    {/* Trip Type Tabs */}
                    <div className="flex space-x-6">
                        {['One-Way', 'Round-Trip','Multi-City'].map((type) => (
                            <label key={type} className="flex items-center space-x-3 cursor-pointer">
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
                                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
      ${tripType === type ? 'border-[#F1A868]' : 'border-[#F1A868]'}`}>
                                    {tripType === type && <span className="w-2 h-2 bg-[#F1A868] rounded-full" />}
                                </span>
                                <span className='text-[16px] text-white' style={{ marginLeft: "5px" }}>
                                    {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-')}
                                </span>
                            </label>
                        ))}
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
                        {/* Origin */}
                        <div className="flex items-center bg-white text-black rounded-md px-3 py-2" style={{ height: "55px" }} >
                            <img src={`${BASE_URL_IMG}/assets/svgs/flightInput.svg`} className="w-5 h-5 mr-2" alt="Flight" />
                            <input
                                type="text"
                                placeholder="Origin"
                                className="w-full outline-none text-md placeholder:text-[14px] placeholder:font-medium"
                                value={origin}
                                onChange={(e) => {
                                    setOrigin(e.target.value);
                                    fetchCitySuggestions(e.target.value, "origin");
                                }}
                            />
                        </div>

                        {/* Destination */}
                        <div className="flex items-center bg-white text-black rounded-md px-3 py-2" style={{ height: "55px" }}>
                            <img src={`${BASE_URL_IMG}/assets/svgs/DesiInput.svg`} className="w-5 h-5 mr-2" alt="Destination" />
                            <input
                                type="text"
                                placeholder="Destination"
                                className="w-full outline-none text-md placeholder:text-[14px] placeholder:font-medium"
                                value={destination}
                                onChange={(e) => {
                                    setDestination(e.target.value);
                                    fetchCitySuggestions(e.target.value, "destination");
                                }}
                            />
                        </div>

                        {/* DeParture Date */}
                        <div className="flex items-center bg-white text-black rounded-md px-3 py-2" style={{ height: "55px" }}>
                            <img src={`${BASE_URL_IMG}/assets/svgs/Date.svg`} className="w-4 h-4 mr-2" alt="Calendar" />
                            <DatePicker
                                selected={departureDate}
                                onChange={(date) => setDepartureDate(date)}
                                placeholderText="Departure Date"
                                className="w-full outline-none text-md placeholder:text-[14px] placeholder:font-medium"
                            />
                        </div>

                        {tripType === "Round-Trip" ?
                            <>
                                {/* Return Date */}
                                <div className="flex items-center bg-white text-black rounded-md px-3 py-2" style={{ height: "55px" }}>
                                    <img src={`${BASE_URL_IMG}/assets/svgs/Date.svg`} className="w-4 h-4 mr-2" alt="Calendar" />
                                    <DatePicker
                                        selected={returnDate}
                                        onChange={(date) => setReturnDate(date)}
                                        placeholderText="Return Date"
                                        className="w-full outline-none text-md placeholder:text-[14px] placeholder:font-medium"
                                    />
                                </div>
                            </>
                            : ""}

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
                                            className={`px-4 py-2 cursor-pointer hover:bg-gray-100 text-[#F1A868] rounded ${selectedClass === item ? 'bg-gray-200 font-semibold' : ''
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
                                        { label: 'Adult(s)', count: adults, setCount: setAdults, icon: `${BASE_URL_IMG}/assets/svgs/adult.svg` },
                                        { label: 'Child(s)', count: children, setCount: setChildren, icon: `${BASE_URL_IMG}/assets/svgs/child.svg` },
                                        { label: 'Infant(s)', count: infants, setCount: setInfants, icon: `${BASE_URL_IMG}/assets/svgs/infant.svg` },
                                    ].map(({ label, count, setCount, icon }) => (
                                        <div key={label} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                                <img src={icon} alt={label} className="w-4 h-4 text-red-600" />
                                                {label}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setCount(count > 0 ? count - 1 : 0)}
                                                    className="bg-gray-200 text-gray-600 px-2 rounded"
                                                >
                                                    -
                                                </button>
                                                <span className="w-8 text-center font-semibold text-black" style={{ textDecoration: "underline" }}>{String(count).padStart(2, '0')}</span>
                                                <button
                                                    onClick={() => setCount(count + 1)}
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
                        <div className="relative inline-block w-full" ref={AirRef}>
                            {/* Input Field */}
                            <div
                                className="flex items-center bg-white text-black rounded-md px-3 py-2 cursor-pointer text-left min-h-[55px]"
                                onClick={() => setIsAirOpen(!isAirOpen)}
                            >
                                <img src={`${BASE_URL_IMG}/assets/svgs/flightInput.svg`} className="w-5 h-5 mr-2" alt="Airlines" />
                                <div className="w-full outline-none text-md text-[14px] font-medium text-[#A9A3AF]">
                                    {displayValue}
                                </div>
                            </div>

                            {/* Dropdown */}
                            {isAirOpen && (
                                <div className="absolute z-10 mt-2 w-full bg-white rounded-md shadow-lg p-2 max-h-64 overflow-y-auto">
                                    {airlines.map((airline) => (
                                        <div
                                            key={airline}
                                            onClick={() => handleToggle(airline.name)}
                                            className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-100 rounded text-red-600"
                                        >
                                            <option key={airline.code} value={airline.code}>{airline.name}</option>
                                            <input
                                                type="checkbox"
                                                checked={selectedAirlines.includes(airline.name)}
                                                readOnly
                                                className="form-checkbox text-[#A57233] accent-[#A57233]"
                                            />
                                        </div>
                                    ))}
                                    <div className="flex justify-center pt-2">
                                        <button
                                            className="text-[#A57233] font-medium hover:underline"
                                            onClick={() => setIsAirOpen(false)}
                                        >
                                            Done
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

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
                </div>
            </div>
        </>
    )
}

export default FlightFinderTab;