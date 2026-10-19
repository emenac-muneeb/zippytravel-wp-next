"use client";
import {
    FaMapMarkerAlt,
    FaUser,
    FaPhone,
    FaEnvelope,
    FaWalking,
} from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BASE_URL_IMG } from "../Helpers/imageurl";
import { endpoints } from "../Helpers/endpoints";
import axios from "axios";
import { toast } from 'react-toastify';
import { useRouter } from "next/navigation";

// const showToast = (msg, type = "info") => alert(`${type.toUpperCase()}: ${msg}`);

const FlightForm = ({ formType, url }) => {
    const [departureDate, setDepartureDate] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [infants, setInfants] = useState(0);

    const [name, setName] = useState("");
    const [contact, setContact] = useState("");
    const [email, setEmail] = useState("");
    const [note, setNote] = useState("");
    const [answer, setAnswer] = useState("");

    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");

    const showToast = (msg, type = "info") => {
        toast[type](msg);
    };

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

    const originRef = useRef(null);
    const destinationRef = useRef(null);
    const [originSelected, setOriginSelected] = useState(false);
    const [destinationSelected, setDestinationSelected] = useState(false);
    const [destinationLabel, setDestinationLabel] = useState("");
    const [originLabel, setOriginLabel] = useState("");
    const [originSuggestions, setOriginSuggestions] = useState([]);
    const [destinationSuggestions, setDestinationSuggestions] = useState([]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (originRef.current && !originRef.current.contains(e.target)) setOriginSuggestions([]);
            if (destinationRef.current && !destinationRef.current.contains(e.target)) setDestinationSuggestions([]);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const router = useRouter();

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
        // Basic validation
        if (
            !name ||
            !email ||
            !contact ||
            !origin ||
            !destination ||
            !departureDate ||
            answer.trim() !== "9"
        ) {
            showToast("Please fill all Fields correctly (4 + 5 must be 9)", "error");
            return;
        }

        const payload = {
            name,
            email,
            contact: contact,
            contact_detail: {
                subject: "Flight Enquiry",
                message: note || "Customer is interested in booking a flight.",
                origin,
                destination,
                DepartureDate: departureDate.toISOString().split("T")[0],
                adults,
                children,
                infants,
                formType,
                url
            }
        };
        // console.log("Payload", payload)
        try {
            const response = await axios.post(endpoints.sendEmail, payload);
            const data = response.data;
            // console.log('response', response)

            if (data.status === 1) {
                showToast(data.message || "Enquiry submitted successfully!", "success");
                router.push("/thankyou.html");
                setTimeout(() => {
                    // Optionally reset form or close modal
                }, 2000);
            } else {
                showToast(data.message || "Something went wrong. Please try again.", "error");
            }
        } catch (error) {
            console.error("Submission Error:", error);
            showToast("Server error occurred. Please try again later.", "error");
        }
    };
    return (
        <>
            <div className="bg-[#A57233] text-white p-4 rounded-2xl max-w-3xl mx-auto space-y-2 shadow-md mt-6">
                {/* Origin / Destination */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    <div className="col-span-1 sm:col-span-3 sm:flex gap-2">
                        {/* Origin */}
                        <div className="relative mb-2 sm:mb-0" ref={originRef}>
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
                    </div>
                    {/* <div className="flex bg-white text-black rounded-md px-2 py-2 col-span-1 sm:col-span-3 flex-wrap sm:flex-nowrap h-[60px]">
                        <div className="flex items-center w-full sm:w-1/2 pr-0 sm:pr-2 border-b sm:border-b-0 sm:border-r border-gray-300 mb-2 sm:mb-0">
                            <FaMapMarkerAlt className="mr-2 text-red-500" />
                            <input
                                type="text"
                                placeholder="Origin"
                                className="bg-transparent outline-none w-full text-sm"
                                value={origin}
                                onChange={(e) => setOrigin(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center w-full sm:w-1/2 pl-0 sm:pl-2">
                            <FaMapMarkerAlt className="mr-2 text-red-500" />
                            <input
                                type="text"
                                placeholder="Destination"
                                className="bg-transparent outline-none w-full text-sm"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                            />
                        </div>
                    </div> */}

                    {/* Passenger Selector */}
                    <div className="relative w-full sm:col-span-2" ref={dropdownRef}>
                        <div
                            className="flex items-center bg-white text-black rounded-md px-3 py-2 cursor-pointer h-[60px]"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            <img src={`${BASE_URL_IMG}/assets/svgs/Passenger.svg`} className="w-5 h-5 mr-2" alt="02 ADT-00 CHD-00 INF" />
                            <input
                                type="text"
                                readOnly
                                aria-label="Selected Passengers"
                                value={`${String(adults).padStart(2, "0")} ADT - ${String(children).padStart(2, "0")} CHD - ${String(infants).padStart(2, "0")} INF`}
                                className="w-full outline-none text-sm font-medium text-[#A9A3AF]"
                            />
                        </div>

                        {isOpen && (
                            <div className="absolute z-10 mt-2 w-full bg-white rounded-md shadow-lg p-4 space-y-4">
                                {[
                                    { label: "Adult(s)", count: adults, setCount: setAdults, icon: `${BASE_URL_IMG}/assets/svgs/adult.svg`, min: 1 },
                                    { label: "Child(s)", count: children, setCount: setChildren, icon: `${BASE_URL_IMG}/assets/svgs/child.svg`, min: 0 },
                                    { label: "Infant(s)", count: infants, setCount: setInfants, icon: `${BASE_URL_IMG}/assets/svgs/infant.svg`, min: 0 },
                                ].map(({ label, count, setCount, icon, min }) => (
                                    <div key={label} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm font-medium text-black">
                                            <img src={icon} alt={label} className="w-4 h-4" />
                                            {label}
                                        </div>
                                        <div className="flex items-center gap-2">
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
                                                className="bg-gray-200 text-black px-2 rounded"
                                            >-</button>
                                            <span className="w-8 text-center font-semibold text-black underline">
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
                                                    if (label === "Child(s)" && children < adults * 2) setCount(count + 1);
                                                    if (label === "Infant(s)" && infants < adults) setCount(count + 1);
                                                }}
                                                className="bg-[#A57233] text-white px-2 rounded"
                                            >+</button>
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

                {/* Note */}
                <div className="bg-white text-black rounded-md px-3 py-2 h-[60px]">
                    <textarea
                        rows="2"
                        aria-label="Notes"
                        placeholder="Type a note..."
                        className="w-full bg-transparent outline-none resize-none text-sm"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </div>

                {/* Date / Captcha / Submit */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="flex items-center bg-white text-black rounded-md px-3 py-2 h-[60px]">
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
                    <input
                        type="text"
                        aria-label="Captcha Answer"
                        placeholder="Answer 4+5"
                        className="bg-white text-black rounded-md px-3 py-2 w-full outline-none text-sm h-[60px]"
                        value={answer}
                        onChange={(e) => {
                            const onlyNumbers = e.target.value.replace(/[^0-9]/g, "");
                            setAnswer(onlyNumbers);
                        }}
                    />
                    <button
                        onClick={handleSubmit}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md px-4 py-2 w-full text-sm h-[60px]"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </>
    );
};

export default FlightForm;
