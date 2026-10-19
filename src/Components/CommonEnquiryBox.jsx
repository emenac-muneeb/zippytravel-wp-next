import {
    FaMapMarkerAlt,
    FaUser,
    FaPhone,
    FaEnvelope,
    FaWalking,
} from "react-icons/fa";
import { BASE_URL_IMG } from "../Helpers/imageurl";
import { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../Helpers/apiHelper";
import axios from "axios";
import { endpoints } from "../Helpers/endpoints";
import { toast } from 'react-toastify';
import { useRouter } from "next/navigation";

// Simple toast replacement
const showToast = (msg, type = "info") => alert(`${type.toUpperCase()}: ${msg}`);

const CommonEnquiryBox = ({ UmrahTab, formType, pageURL }) => {
    const [departureDate, setDepartureDate] = useState(null);
    const dropdownRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [infants, setInfants] = useState(0);

    const [name, setName] = useState("");
    const [contact, setContact] = useState("");
    const [email, setEmail] = useState("");
    const [answer, setAnswer] = useState("");
    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");
    const [originSuggestions, setOriginSuggestions] = useState([]);
    const [destinationSuggestions, setDestinationSuggestions] = useState([]);
    const [originActiveIndex, setOriginActiveIndex] = useState(-1);
    const [destinationActiveIndex, setDestinationActiveIndex] = useState(-1);
    const originRef = useRef(null);
    const destinationRef = useRef(null);
    const [originSelected, setOriginSelected] = useState(false);
    const [destinationSelected, setDestinationSelected] = useState(false);
    const [destinationLabel, setDestinationLabel] = useState("");
    const [originLabel, setOriginLabel] = useState("");

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

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchSuggestions = async (text, type) => {
        try {
            const res = await api.get(`/autocomplete/${text}`);
            if (type === "origin") setOriginSuggestions(res.data);
            else setDestinationSuggestions(res.data);
        } catch (error) {
            console.error("Autocomplete Error:", error);
        }
    };

    const showToast = (msg, type = "info") => {
        toast[type](msg);
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (origin.length >= 3) fetchSuggestions(origin, "origin");
        }, 100);
        return () => clearTimeout(timeout);
    }, [origin]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (destination.length >= 3) fetchSuggestions(destination, "destination");
        }, 100);
        return () => clearTimeout(timeout);
    }, [destination]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (originRef.current && !originRef.current.contains(e.target)) setOriginSuggestions([]);
            if (destinationRef.current && !destinationRef.current.contains(e.target)) setDestinationSuggestions([]);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const router = useRouter();

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

    const handleChange = (key, value) => {
        switch (key) {
            case "name":
                value = value.replace(/[^a-zA-Z\s]/g, "");
                setName(value);
                break;

            case "contact":
                value = value.replace(/[^0-9]/g, "");
                setContact(value);
                break;

            case "email":
                setEmail(value);
                break;

            default:
                break;
        }
    };


    const handleSubmit = async () => {
        if (!name) {
            showToast("Please enter your name.", "error");
            return;
        }

        if (!contact) {
            showToast("Please enter your contact number.", "error");
            return;
        }

        if (!email) {
            showToast("Please enter your email address.", "error");
            return;
        }

        if (!departureDate) {
            showToast("Please select a departure date.", "error");
            return;
        }

        if (!origin) {
            showToast("Please enter the origin city.", "error");
            return;
        }

        if (!destination) {
            showToast("Please enter the destination city.", "error");
            return;
        }

        if (answer.trim() !== "9") {
            showToast("Security answer incorrect. What is 4 + 5?", "error");
            return;
        }

        const payload = {
            name,
            contact,
            email,
            contact_detail: {
                origin,
                destination,
                DepartureDate: departureDate.toISOString(),
                adults,
                children,
                infants,
                subject: "Airline Inquiry",
                message: "I would like to know more About Your Services.",
                user_ip: userIp,
                formType: formType || "enquiry form",
                pageURL: pageURL || ""
            }
        };
        console.log("Pay", payload)
        try {
            setLoading(true);
            const res = await axios.post(endpoints.sendEmail, payload, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            showToast("Form submitted successfully!", "success");

            setName("");
            setContact("");
            setEmail("");
            setOrigin("");
            setDestination("");
            setDepartureDate(null);
            setAdults(1);
            setChildren(0);
            setInfants(0);
            setAnswer("");

            router.push("/thankyou.html");
        } catch (err) {
            setLoading(false);
            if (axios.isAxiosError(err)) {
                const apiError = err.response?.data;
                if (apiError?.errors && typeof apiError.errors === "object") {
                    // Collect all error messages
                    const messages = Object.values(apiError.errors).flat().join(" ");
                    showToast(messages, "error");
                } else if (apiError?.message) {
                    showToast(apiError.message, "error");
                } else {
                    showToast("Something went wrong. Please try again.", "error");
                }
            } else {
                showToast("Unexpected error occurred.", "error");
            }
        } finally {
            setLoading(false);
        }

    };

    return (
        <div className="bg-[#A57233] text-white pt-3 pb-6 px-5 rounded-2xl max-w-3xl mx-auto space-y-2 shadow-md mt-5">
            {/* Top Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-2">
                {UmrahTab &&
                    <>
                        <div className=" flex gap-2">
                            {/* Origin */}
                            <div className="relative" ref={originRef}>
                                <div
                                    className="flex items-center bg-white text-black rounded-md px-3 py-2"
                                    style={{ height: "55px" }}
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
                                    style={{ height: "55px" }}
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
                        </div>
                    </>
                }
                {!UmrahTab &&
                    <>
                        <div className="flex bg-white text-gray-700 rounded-md px-2 py-2  flex-wrap sm:flex-nowrap">
                            <div className="flex items-center w-full sm:w-1/2 pr-0 sm:pr-2 border-b sm:border-b-0 sm:border-r border-gray-300 mb-2 sm:mb-0 relative" ref={originRef}>
                                <FaMapMarkerAlt className="mr-2 text-red-500 absolute left-2 top-3" />
                                <input
                                    type="text"
                                    aria-label="Origin"
                                    placeholder="Origin"
                                    value={origin}
                                    onChange={(e) => {
                                        const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                                        setOrigin(onlyLetters);
                                        setOriginActiveIndex(-1);
                                        setOriginSelected(false);
                                    }}

                                    onKeyDown={(e) => {
                                        if (e.key === "ArrowDown") {
                                            setOriginActiveIndex((prev) => (prev + 1) % originSuggestions.length);
                                        } else if (e.key === "ArrowUp") {
                                            setOriginActiveIndex((prev) => (prev - 1 + originSuggestions.length) % originSuggestions.length);
                                        } else if (e.key === "Enter" && originActiveIndex >= 0) {
                                            setOrigin(originSuggestions[originActiveIndex]);
                                            setOriginSuggestions([]);
                                        }
                                    }}
                                    className="bg-transparent outline-none w-full text-base pl-7 py-2 placeholder:text-black ml-2"
                                />
                                {originSuggestions.length > 0 && (
                                    <ul className="absolute top-full left-0 w-full bg-white z-10 text-black rounded shadow max-h-60 overflow-y-auto">
                                        {originSuggestions.map((item, idx) => (
                                            <li
                                                key={idx}
                                                className={`px-3 py-2 cursor-pointer ${idx === originActiveIndex
                                                    ? "bg-[#A57233] text-white"
                                                    : "hover:bg-[#A57233] hover:text-white"
                                                    }`}
                                                onMouseEnter={() => setOriginActiveIndex(idx)}
                                                onClick={() => {
                                                    setOrigin(item);
                                                    setOriginSuggestions([]);
                                                    setOriginActiveIndex(-1);
                                                    setOriginSelected(true);
                                                }}

                                            >
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {origin.length >= 3 && originSuggestions.length === 0 && !originSelected && (
                                    <div className="absolute top-full left-0 w-full bg-white text-black p-2 border rounded shadow">
                                        No results found
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center w-full sm:w-1/2 pl-0 sm:pl-2 relative" ref={destinationRef}>
                                <FaMapMarkerAlt className="mr-2 text-red-500 absolute left-2 top-3" />
                                <input
                                    type="text"
                                    aria-label="Destination"
                                    placeholder="Destination"
                                    value={destination}
                                    onChange={(e) => {
                                        const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                                        setDestination(onlyLetters);
                                        setDestinationActiveIndex(-1);
                                        setDestinationSelected(false);
                                    }}

                                    onKeyDown={(e) => {
                                        if (e.key === "ArrowDown") {
                                            setDestinationActiveIndex((prev) => (prev + 1) % destinationSuggestions.length);
                                        } else if (e.key === "ArrowUp") {
                                            setDestinationActiveIndex((prev) => (prev - 1 + destinationSuggestions.length) % destinationSuggestions.length);
                                        } else if (e.key === "Enter" && destinationActiveIndex >= 0) {
                                            setDestination(destinationSuggestions[destinationActiveIndex]);
                                            setDestinationSuggestions([]);
                                        }
                                    }}
                                    className="bg-transparent outline-none w-full text-base pl-7 py-2 placeholder:text-black ml-2"
                                />
                                {destinationSuggestions.length > 0 && (
                                    <ul className="absolute top-full left-0 w-full bg-white z-10 text-black rounded shadow max-h-60 overflow-y-auto">
                                        {destinationSuggestions.map((item, idx) => (
                                            <li
                                                key={idx}
                                                className={`px-3 py-2 cursor-pointer ${idx === destinationActiveIndex
                                                    ? "bg-[#A57233] text-white"
                                                    : "hover:bg-[#A57233] hover:text-white"
                                                    }`}
                                                onMouseEnter={() => setDestinationActiveIndex(idx)}
                                                onClick={() => {
                                                    setDestination(item);
                                                    setDestinationSuggestions([]);
                                                    setDestinationActiveIndex(-1);
                                                    setDestinationSelected(true);  // mark as selected
                                                }}

                                            >
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {destination.length >= 3 && destinationSuggestions.length === 0 && !destinationSelected && (
                                    <div className="absolute top-full left-0 w-full bg-white text-black p-2 border rounded shadow">
                                        No results found
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                }
                {/* Passenger dropdown */}
                <div className="relative w-full" ref={dropdownRef}>
                    <div
                        className="flex items-center bg-white text-black rounded-md px-3 py-2 cursor-pointer h-[55px]"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <img src={`${BASE_URL_IMG}/assets/svgs/Passenger.svg`} className="w-5 h-5 mr-2" alt="passenger" />
                        <input
                            type="text"
                            aria-label="Passengers"
                            readOnly
                            value={`${String(adults).padStart(2, "0")} ADT - ${String(children).padStart(2, "0")} CHD - ${String(infants).padStart(2, "0")} INF`}
                            className="w-full outline-none text-sm font-medium text-[#A9A3AF]"
                        />
                    </div>
                    {isOpen && (
                        <div className="absolute z-10 mt-2 w-full bg-white rounded-md shadow-lg p-2 space-y-4 min-w-[180px]">
                            {[
                                {
                                    label: "Adult(s)",
                                    count: adults,
                                    setCount: setAdults,
                                    icon: `${BASE_URL_IMG}/assets/svgs/adult.svg`,
                                    min: 1,
                                },
                                {
                                    label: "Child(s)",
                                    count: children,
                                    setCount: setChildren,
                                    icon: `${BASE_URL_IMG}/assets/svgs/child.svg`,
                                    min: 0,
                                },
                                {
                                    label: "Infant(s)",
                                    count: infants,
                                    setCount: setInfants,
                                    icon: `${BASE_URL_IMG}/assets/svgs/infant.svg`,
                                    min: 0,
                                },
                            ].map(({ label, count, setCount, icon, min }) => (
                                <div key={label} className="flex items-center justify-between">
                                    <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
                                        <img src={icon} alt={label} className="w-4 h-4" />
                                        {label}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => {
                                                if (label === "Adult(s)" && count > 1) {
                                                    if (children > (count - 1) * 2) {
                                                        showToast("Reduce children first", "info");
                                                        return;
                                                    }
                                                    if (infants > count - 1) {
                                                        showToast("Reduce infants first", "info");
                                                        return;
                                                    }
                                                }
                                                if (count > min) setCount(count - 1);
                                            }}
                                            className="bg-gray-200 text-gray-600 px-2 rounded"
                                        >
                                            -
                                        </button>
                                        <span className="min-[100px]:w-8 w-[20px] text-[14px] text-center font-semibold text-black underline">
                                            {String(count).padStart(2, "0")}
                                        </span>
                                        <button
                                            onClick={() => {
                                                const total = adults + children + infants;
                                                if (total >= 9) {
                                                    showToast("Max 9 passengers", "info");
                                                    return;
                                                }
                                                if (label === "Adult(s)") setCount(count + 1);
                                                if (label === "Child(s)" && children < adults * 2)
                                                    setCount(count + 1);
                                                if (label === "Infant(s)" && infants < adults)
                                                    setCount(count + 1);
                                            }}
                                            className="bg-[#A57233] text-white px-2 rounded"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <div className="flex justify-center pt-2">
                                <button
                                    className="text-[#A57233] font-medium hover:underline flex items-center gap-1"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Done ↗
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[{
                    key: "name",
                    icon: <img src={`${BASE_URL_IMG}/assets/svgs/Name.svg`} className="w-5 h-5 mr-2" alt="Name" />,
                    placeholder: "Your Name",
                    value: name
                }, {
                    key: "contact",
                    icon: <img src={`${BASE_URL_IMG}/assets/svgs/Call.svg`} className="w-5 h-5 mr-2" alt="Contact" />,
                    placeholder: "Contact #",
                    value: contact
                }, {
                    key: "email",
                    icon: <img src={`${BASE_URL_IMG}/media/fr-svgs/Email.svg`} className="w-5 h-5 mr-2" alt="Email" />,
                    placeholder: "Email Address",
                    value: email,
                    type: "email"
                }].map((field, i) => (
                    <div key={i} className="flex items-center bg-white text-gray-700 rounded-md px-2 py-2" style={{ height: "55px" }}>
                        {field.icon}
                        <input
                            type={field.type || "text"}
                            aria-label={field.placeholder}
                            placeholder={field.placeholder}
                            className="bg-transparent outline-none w-full text-sm ml-2 py-3"
                            value={field.value}
                            onChange={(e) => handleChange(field.key, e.target.value)}
                        />
                    </div>
                ))}
            </div>

            {/* Date / Captcha / Submit */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="flex items-center bg-white text-black rounded-md px-3 py-2 h-[55px]">
                    <img src={`${BASE_URL_IMG}/assets/svgs/Date.svg`} className="w-4 h-4 mr-2" alt="Calendar" />
                    <DatePicker
                        selected={departureDate}
                        onChange={(date) => setDepartureDate(date)}
                        placeholderText="Departure Date"
                        className="w-full outline-none text-sm placeholder:font-medium"
                        minDate={new Date()}
                        dateFormat="dd/MM/yyyy"
                    />
                </div>
                <div className="flex items-center bg-white text-black rounded-md px-3 py-2"
                    style={{ height: "55px" }}>
                    <input
                        value={answer}
                        aria-label="Security Answer"
                        onChange={(e) => {
                            const onlyNumbers = e.target.value.replace(/[^0-9]/g, "");
                            setAnswer(onlyNumbers);
                        }}
                        type="text"
                        placeholder="Answer"
                        className="w-full outline-none text-md placeholder:text-[14px] placeholder:font-medium"
                    />
                    <span className='text-[14px] font-medium text-[#A9A3AF]'>4+5</span>
                </div>
                {/* <button
                    onClick={handleSubmit}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md px-4 py-2 w-full text-sm h-[55px]"
                >
                    Submit
                </button> */}
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`bg-[#F1A868] text-white px-3 py-2 rounded-md text-[18px] font-bold flex items-center justify-center gap-2
        ${loading ? "opacity-70 cursor-not-allowed" : ""}
    `}
                    style={{ height: "55px" }}
                >
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <svg
                                className="animate-spin h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
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
                            Submitting...
                        </div>
                    ) : (
                        <>
                            Submit
                            <img
                                src={`${BASE_URL_IMG}/assets/svgs/Arrow-white-up.svg`}
                                alt="Submit"
                            />
                        </>
                    )}
                </button>

            </div>
        </div>
    );
};

export default CommonEnquiryBox;
