"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../ExternalCSS/FlightTab.css";
import api from '../Helpers/apiHelper';
import { showToast } from '../Helpers/Helper';
import { BASE_URL_IMG } from '../Helpers/imageurl';
import { endpoints } from '../Helpers/endpoints';
import { useRouter } from 'next/navigation';

const UmrahTab = ({ title, description }) => {
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
    const [departureDate, setDepartureDate] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [infants, setInfants] = useState(0);
    const [name, setName] = useState("");
    const [contact, setContact] = useState("");
    const [email, setEmail] = useState("");
    const [addAnswer, setAddAnswer] = useState(null);
    const [captchaQuestion, setCaptchaQuestion] = useState('');
    const [userInput, setUserInput] = useState("");
    const [pageURL, setPageURL] = useState('');

    const router = useRouter();

    useEffect(() => {
        setPageURL(window.location.href);
        generateCaptcha();
    }, []);

    const generateCaptcha = () => {
        const a = Math.floor(Math.random() * 9) + 1;
        const b = Math.floor(Math.random() * 9) + 1;
        setCaptchaQuestion(`${a} + ${b}`);
        setAddAnswer(a + b);
        setUserInput("");
    };

    const [userIp, setUserIp] = useState("");
    // console.log("IP", userIp)

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

    const handleSubmit = async () => {

        if (!name || !contact || !userInput) {
            showToast('Please Fill all Fields.', "info");
            return;
        }

        if (parseInt(userInput) !== addAnswer) {
            showToast("Captcha Incorrect. Try Again!", "error");
            generateCaptcha();
            return;
        }

        const payload = {
            name: name,
            email: email,
            phone: contact,
            contact_detail: {
                subject: "Product Inquiry",
                message: "I would like to know more About Your Services.",
                Inquiry: "Umrah Contact Form",
                user_ip: userIp,
                origin,
                destination,
                DepartureDate: departureDate.toISOString().split("T")[0],
                adults,
                children,
                infants,
                pageURL,
                formType: "Umrah Contact Form"
            }
        };
        // console.log("Pay", payload)
        try {
            const response = await api.post(endpoints.sendEmail, payload);
            const data = response.data;
            if (data.status === 1) {
                setName("");
                setEmail("");
                setContact("");
                setOrigin("");
                setOriginLabel("");
                setOriginSuggestions([]);
                setDestination("");
                setDestinationLabel("");
                setDestinationSuggestions([]);
                setDepartureDate(null);
                setAdults(1);
                setChildren(0);
                setInfants(0);

                router.push("/thankyou.html");

            } else {
                showToast("Something went wrong. Please Try Again.", "error");
            }
        } catch (err) {
            console.error("Submission Error:", err);
            showToast("Server Error occurred. Please Try Again later.", "error");
        }
    };

    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const originRef = useRef(null);
    const destinationRef = useRef(null);

    // Airlines Origin DropDown
    const [origin, setOrigin] = useState("");
    const [originLabel, setOriginLabel] = useState("");
    const [originSuggestions, setOriginSuggestions] = useState([]);

    // Airlines Destination DropDown
    const [destination, setDestination] = useState("");
    const [destinationLabel, setDestinationLabel] = useState("");
    const [destinationSuggestions, setDestinationSuggestions] = useState([]);

    // console.log(origin)
    // console.log(destination)

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

    const staticOrigins = [
        { label: "Leeds (LBA) - United Kingdom", code: "LBA" },
        { label: "London-All (LON) - United Kingdom", code: "LON" },
        { label: "London-Heathrow (LHR) - United Kingdom", code: "LHR" },
        { label: "London-Gatwick (LGW) - United Kingdom", code: "LGW" },
        { label: "Shetland Islands-Lerwick (LWK) - United Kingdom", code: "LWK" },
        { label: "London-City (LCY) - United Kingdom", code: "LCY" },
        { label: "Manchester (MAN) - United Kingdom", code: "MAN" },
        { label: "Isles Of Scilly-St Marys (ISC) - United Kingdom", code: "ISC" },
        { label: "Kirkwall (KOI) - United Kingdom", code: "KOI" },
        { label: "London-Luton (LTN) - United Kingdom", code: "LTN" },
        { label: "London-St Pancras (QQS) - United Kingdom", code: "QQS" },
        { label: "Liverpool (LPL) - United Kingdom", code: "LPL" },
        { label: "Shetland Islands-Sumburgh (LSI) - United Kingdom", code: "LSI" },
        { label: "London-Stansted (STN) - United Kingdom", code: "STN" },
        { label: "Humberside (HUY) - United Kingdom", code: "HUY" },
        { label: "Islay (ILY) - United Kingdom", code: "ILY" },
        { label: "Inverness (INV) - United Kingdom", code: "INV" },
        { label: "Isle Of Man (IOM) - United Kingdom", code: "IOM" },
        { label: "Jersey (JER) - United Kingdom", code: "JER" },
        { label: "Guernsey (GCI) - United Kingdom", code: "GCI" },
        { label: "Glasgow Intl (GLA) - United Kingdom", code: "GLA" },
        { label: "Dundee (DND) - United Kingdom", code: "DND" },
        { label: "Doncaster/Sheffield (DSA) - United Kingdom", code: "DSA" },
        { label: "Edinburgh (EDI) - United Kingdom", code: "EDI" }
    ];

    const staticDestinations = [
        { label: "Jeddah", code: "JED" },
        { label: "Dammam", code: "DMM" },
        { label: "Abha", code: "AHB" },
        { label: "Yanbu", code: "YNB" },
        { label: "Taif", code: "TIF" },
        { label: "Riyadh", code: "RUH" }
    ];

    return (
        <>
            <div className="bg-[#A57233] rounded-xl shadow-lg px-2 py-4 sm:p-4 mt-[-2px]">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 
                xl:grid-cols-4 gap-x-2 gap-y-2 xl:gap-y-3">
                    {/* Origin */}
                    <div className="relative" ref={originRef}>
                        <div
                            className="flex items-center bg-white text-black rounded-md px-3 py-2"
                            style={{ height: "60px" }}
                        >
                            <img src={`${BASE_URL_IMG}/assets/svgs/flightInput.svg`} className="w-5 h-5 mr-2" alt="Flight" />
                            <input
                                type="text"
                                aria-label="Origin"
                                placeholder="Origin"
                                className="w-full outline-none text-md placeholder:text-[14px] placeholder:font-medium"
                                value={originLabel}
                                onFocus={() => setOriginSuggestions(staticOrigins.map(item => item.label))}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                                    setOriginLabel(value);
                                    const filtered = staticOrigins
                                        .map(item => item.label)
                                        .filter(label => label.toLowerCase().includes(value.toLowerCase()));
                                    setOriginSuggestions(filtered);
                                }}
                            />
                        </div>
                        {/* Custom Suggestion Dropdown */}
                        {originSuggestions.length > 0 && (
                            <ul className="absolute z-10 left-0 top-[110%] w-full bg-white border border-gray-300 max-h-60 overflow-y-auto rounded-md shadow-md mt-1">
                                {originSuggestions.map((item, index) => (
                                    <li
                                        key={index}
                                        onClick={() => {
                                            const match = item.match(/\(([^)]+)\)/);
                                            const code = match ? match[1] : item;

                                            setOrigin(code);
                                            setOriginLabel(item);
                                            setOriginSuggestions([]);
                                        }}
                                        className="px-2 py-2 cursor-pointer hover:bg-[#A57233] text-black text-md font-medium hover:text-white"
                                    >
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    {/* Destination */}
                    <div className="relative" ref={destinationRef}>
                        <div
                            className="flex items-center bg-white text-black rounded-md px-3 py-2"
                            style={{ height: "60px" }}
                        >
                            <img
                                src={`${BASE_URL_IMG}/assets/svgs/DesiInput.svg`}
                                className="w-5 h-5 mr-2"
                                alt="Destination"
                            />
                            <input
                                type="text"
                                aria-label="Destination"
                                placeholder="Destination"
                                className="w-full outline-none text-md placeholder:text-[14px] placeholder:font-medium"
                                value={destinationLabel}
                                onFocus={() =>
                                    setDestinationSuggestions(staticDestinations.map(item => item.label))
                                }
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                                    setDestinationLabel(value);
                                    const filtered = staticDestinations
                                        .map(item => item.label)
                                        .filter(label =>
                                            label.toLowerCase().includes(value.toLowerCase())
                                        );
                                    setDestinationSuggestions(filtered);
                                }}
                            />
                        </div>
                        {/* ✅ Proper Suggestion Dropdown Container */}
                        {destinationSuggestions.length > 0 && (
                            <ul className="absolute z-10 left-0 top-[110%] w-full bg-white border border-gray-300 max-h-60 overflow-y-auto rounded-md shadow-md mt-1">
                                {destinationSuggestions.map((item, index) => {
                                    const selected = staticDestinations.find(dest => dest.label === item);
                                    const code = selected?.code || "";

                                    return (
                                        <li
                                            key={index}
                                            onClick={() => {
                                                setDestination(code);
                                                setDestinationLabel(`${item} (${code})`);
                                                setDestinationSuggestions([]);
                                            }}
                                            className="px-4 py-2 cursor-pointer hover:bg-[#A57233] text-black text-md font-medium hover:text-white"
                                        >
                                            <span className="flex gap-1 items-center">
                                                <span>{item}</span>
                                                <span className="">({code})</span>
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
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
                                aria-label="Passengers"
                                readOnly
                                value={`${String(adults).padStart(2, '0')} ADT - ${String(children).padStart(2, '0')} CHD - ${String(infants).padStart(2, '0')} INF`}
                                onChange={() => { }}
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
                    {/* DeParture Date */}
                    <div className="flex items-center bg-white text-black rounded-md px-3 py-2" style={{ height: "60px" }}>
                        <img src={`${BASE_URL_IMG}/assets/svgs/Date.svg`} className="w-4 h-4 mr-2" alt="Calendar" />
                        <DatePicker
                            selected={departureDate}
                            onChange={(date) => setDepartureDate(date)}
                            placeholderText="Departure Date"
                            className="w-full outline-none text-md placeholder:text-[14px] placeholder:font-medium"
                            minDate={new Date()}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 
                xl:grid-cols-5 gap-x-2 gap-y-2 xl:gap-y-3 mt-2 xl:mt-3">
                    <div className="flex items-center bg-white text-black rounded-md px-3 py-2" style={{ height: "60px" }}>
                        <img src={`${BASE_URL_IMG}/assets/svgs/Name.svg`} className="w-5 h-5 mr-2" alt="Name" />
                        <input
                            type="text"
                            aria-label="Name"
                            value={name}
                            onChange={(e) => {
                                const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                                setName(onlyLetters);
                            }}
                            placeholder="Name"
                            className="w-full outline-none text-md placeholder:text-[14px] placeholder:font-medium"

                        />
                    </div>

                    <div className="flex items-center bg-white text-black rounded-md px-3 py-2" style={{ height: "60px" }}>
                        <img src={`${BASE_URL_IMG}/assets/svgs/Call.svg`} className="w-5 h-5 mr-2" alt="Contact" />
                        <input
                            type="text"
                            aria-label="Contact Number"
                            value={contact}
                            onChange={(e) => {
                                const onlyNumbers = e.target.value.replace(/[^0-9]/g, "");
                                setContact(onlyNumbers);
                            }}
                            placeholder="Contact"
                            className="w-full outline-none text-md placeholder:text-[14px] placeholder:font-medium"

                        />
                    </div>

                    <div className="flex items-center bg-white text-black rounded-md px-3 py-2" style={{ height: "60px" }}>
                        <img src={`${BASE_URL_IMG}/media/fr-svgs/Email.svg`} className="w-5 h-5 mr-2" alt="Email" />
                        <input
                            type="text"
                            aria-label="Email Address"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full outline-none text-md placeholder:text-[14px] placeholder:font-medium"

                        />
                    </div>
                    <div className="flex items-center bg-white text-black rounded-md px-3 py-2"
                        style={{ height: "60px" }}>
                        <input
                            type="text"
                            aria-label="Captcha Answer"
                            value={userInput}
                            placeholder="Answer"
                            onChange={(e) => {
                                const onlyNumbers = e.target.value.replace(/[^0-9]/g, "");
                                setUserInput(onlyNumbers);
                            }}
                            className="w-full outline-none text-md placeholder:text-[14px] placeholder:font-medium"
                        />
                        <div className='text-[14px] font-medium text-[#A9A3AF] whitespace-nowrap'>{captchaQuestion}</div>
                    </div>

                    {/*Sumbit Button */}
                    <button
                        onClick={handleSubmit}
                        className="bg-[#F1A868] text-white px-3 py-2 rounded-md text-[18px] font-bold flex items-center gap-2 text-center justify-center" style={{ height: "60px" }}>
                        Submit
                    </button>
                </div>
            </div>
        </>
    )
}

export default UmrahTab;