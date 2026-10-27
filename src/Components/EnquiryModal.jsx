"use client";
import React, { useEffect, useState, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from "next/navigation";

import api from "../Helpers/apiHelper";
import { showToast } from "../Helpers/Helper";
import { endpoints } from "../Helpers/endpoints";

const parseStoredDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/* Label with cyan bottom underline accent matching the screenshot */
const UnderlinedLabel = ({ children, required = false }) => (
  <div className="flex items-center gap-1 mb-1">
    <span className="relative inline-block text-[13px] sm:text-[14px] font-bold text-[#1F0060] font-poppins pb-0.5">
      {children}
      <span className="absolute left-0 bottom-0 w-full h-[2.5px] bg-[#5CACC4] rounded-full" />
    </span>
    {required && <span className="text-[#E11D48] text-xs font-bold">*</span>}
  </div>
);

const EnquiryModal = ({ setEnquiryOpen, onClose }) => {
  const closeModal = () => {
    if (typeof onClose === "function") onClose();
    else if (typeof setEnquiryOpen === "function") setEnquiryOpen(false);
  };

  const router = useRouter();

  // Trip Type: "one-way" | "round-trip"
  const [tripType, setTripType] = useState("round-trip");

  // Flight Route details
  const [originAirport, setOriginAirport] = useState("");
  const [destinationAirport, setDestinationAirport] = useState("");
  const [departureDate, setDepartureDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
  const [selectedClass, setSelectedClass] = useState("Premium Economy");

  // Passengers
  const [adults, setAdults] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);
  const [infants, setInfants] = useState(0);
  const [showPassengerPicker, setShowPassengerPicker] = useState(false);
  const passengerPickerRef = useRef(null);

  // Form Fields
  const [addNote, setAddNote] = useState("");
  const [passengerName, setPassengerName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");

  // Captcha & submission state
  const [addAnswer, setAddAnswer] = useState(null);
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageURL, setPageURL] = useState("");
  const [userIp, setUserIp] = useState("");

  // Close passenger dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        passengerPickerRef.current &&
        !passengerPickerRef.current.contains(event.target)
      ) {
        setShowPassengerPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prepopulate from localStorage (flightFormData)
  useEffect(() => {
    if (typeof window !== "undefined") {
      setPageURL(window.location.href);
      try {
        const stored = JSON.parse(localStorage.getItem("flightFormData") || "{}");
        if (stored.originLabel) setOriginAirport(stored.originLabel);
        else if (stored.originCity) setOriginAirport(stored.originCity);

        if (stored.destinationLabel) setDestinationAirport(stored.destinationLabel);
        else if (stored.destinationCity) {
          const dest = stored.destinationCountry
            ? `${stored.destinationCity}, ${stored.destinationCountry}`
            : stored.destinationCity;
          setDestinationAirport(dest);
        }

        if (stored.selectedClass) {
          setSelectedClass(stored.selectedClass);
        } else if (stored.class === 1) {
          setSelectedClass("Premium Economy");
        } else if (stored.class === 0) {
          setSelectedClass("Business Class");
        }

        if (stored.adults) setAdults(Number(stored.adults) || 1);
        if (stored.children) setChildrenCount(Number(stored.children) || 0);
        if (stored.infants) setInfants(Number(stored.infants) || 0);

        setDepartureDate(parseStoredDate(stored.departureDate) || new Date());
        setReturnDate(parseStoredDate(stored.returnDate));
      } catch (e) {
        console.error("Error reading flightFormData:", e);
      }
    }
  }, []);

  // Generate math captcha
  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    setCaptchaQuestion(`${a} + ${b} = ?`);
    setAddAnswer(a + b);
    setUserInput("");
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  // Fetch client IP
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

  // Reset return date if it's before departure date
  useEffect(() => {
    if (returnDate && departureDate && returnDate <= departureDate) {
      setReturnDate(null);
    }
  }, [departureDate]);

  const passengerLabel = `${String(adults).padStart(2, "0")} ADT - ${String(
    childrenCount
  ).padStart(2, "0")} CHD - ${String(infants).padStart(2, "0")} INF`;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    if (!passengerName.trim() || !contact.trim() || !email.trim()) {
      showToast("Please fill in your name, contact phone, and email.", "info");
      setLoading(false);
      return;
    }

    if (!userInput.trim()) {
      showToast("Please solve the captcha.", "info");
      setLoading(false);
      return;
    }

    if (parseInt(userInput, 10) !== addAnswer) {
      showToast("Captcha Incorrect. Try Again!", "error");
      generateCaptcha();
      setLoading(false);
      return;
    }

    const payload = {
      name: passengerName.trim(),
      email: email.trim(),
      contact: contact.trim(),
      contact_detail: {
        subject: "Product Inquiry",
        message: addNote || "I would like to know more about this flight fare.",
        Inquiry: "Airline Inquiry Form",
        user_ip: userIp,
        trip_type: tripType,
        origin: originAirport || "London",
        destination: destinationAirport,
        DepartureDate: departureDate
          ? departureDate.toISOString().split("T")[0]
          : "",
        Return:
          tripType === "round-trip" && returnDate
            ? returnDate.toISOString().split("T")[0]
            : "",
        Class: selectedClass,
        adults,
        children: childrenCount,
        infants,
        pageURL,
      },
    };

    try {
      const { data } = await api.post(endpoints.sendEmail, payload);
      if (data.status === 1) {
        router.push("/thankyou.html");
        setTimeout(() => closeModal(), 2000);
        setLoading(false);
      } else {
        showToast("Something went wrong. Please Try Again.", "error");
        setLoading(false);
      }
    } catch (err) {
      console.error("Submission Error:", err);
      showToast("Server error occurred. Please try again later.", "error");
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full bg-white font-poppins rounded-[20px] sm:rounded-[24px] p-5 sm:p-8 md:p-9 shadow-2xl">
      <style>{`
        .custom-dp .react-datepicker-wrapper,
        .custom-dp .react-datepicker__input-container {
          width: 100%;
        }
        .custom-dp .react-datepicker__input-container input {
          width: 100%;
          background: transparent;
          outline: none;
          font-size: 14px;
          color: #334155;
          font-family: inherit;
        }
        .custom-dp .react-datepicker__input-container input::placeholder {
          color: #94a3b8;
        }
      `}</style>

      {/* Close button top right - Dark purple square with rounded corners */}
      <button
        type="button"
        onClick={closeModal}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 w-8 h-8 sm:w-9 sm:h-9 bg-[#1F0060] hover:bg-[#2c0087] text-white rounded-[8px] flex items-center justify-center transition shadow-sm cursor-pointer"
        aria-label="Close enquiry form"
      >
        <svg
          className="w-4 h-4 sm:w-4.5 sm:h-4.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.8}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Top Toggle: One-Way vs Round Trip */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8 pt-1">
        <button
          type="button"
          onClick={() => setTripType("one-way")}
          className={`min-w-[120px] sm:min-w-[140px] h-[42px] sm:h-[44px] rounded-[10px] sm:rounded-[12px] font-bold text-[14px] sm:text-[15px] transition-all duration-200 cursor-pointer ${tripType === "one-way"
              ? "bg-[#1F0060] text-white shadow-sm"
              : "bg-white text-[#1F0060] border border-[#1F0060] hover:bg-[#1F0060]/5"
            }`}
        >
          One-Way
        </button>

        <button
          type="button"
          onClick={() => setTripType("round-trip")}
          className={`min-w-[120px] sm:min-w-[140px] h-[42px] sm:h-[44px] rounded-[10px] sm:rounded-[12px] font-bold text-[14px] sm:text-[15px] transition-all duration-200 cursor-pointer ${tripType === "round-trip"
              ? "bg-[#1F0060] text-white shadow-sm"
              : "bg-white text-[#1F0060] border border-[#1F0060] hover:bg-[#1F0060]/5"
            }`}
        >
          Round Trip
        </button>
      </div>

      {/* Main Form Fields */}
      <div className="space-y-3.5 sm:space-y-4">
        {/* Row 1: Departure Airport | Arrival Airport */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {/* Departure Airport */}
          <div className="bg-[#F4F9FA] rounded-[12px] sm:rounded-[14px] p-3 sm:px-4 sm:py-3 border border-transparent focus-within:border-[#5CACC4]/60 transition-all">
            <UnderlinedLabel>Departure Airport</UnderlinedLabel>
            <div className="flex items-center justify-between mt-1">
              <input
                type="text"
                disabled
                value={originAirport}
                onChange={(e) => setOriginAirport(e.target.value)}
                placeholder="London - All Airports (LON) - UK"
                className="w-full bg-transparent outline-none text-[13px] sm:text-[14px] text-slate-700 placeholder:text-slate-400 font-poppins pr-2"
              />
              <svg
                className="w-4 h-4 text-[#1F0060]/70 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </div>

          {/* Arrival Airport */}
          <div className="bg-[#F4F9FA] rounded-[12px] sm:rounded-[14px] p-3 sm:px-4 sm:py-3 border border-transparent focus-within:border-[#5CACC4]/60 transition-all">
            <UnderlinedLabel>Arrival Airport</UnderlinedLabel>
            <div className="flex items-center justify-between mt-1">
              <input
                type="text"
                disabled
                value={destinationAirport}
                onChange={(e) => setDestinationAirport(e.target.value)}
                placeholder="Destination City / Airport"
                className="w-full bg-transparent outline-none text-[13px] sm:text-[14px] text-slate-700 placeholder:text-slate-400 font-poppins pr-2"
              />
              <svg
                className="w-4 h-4 text-[#1F0060]/70 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Row 2: Departure Date | Return Date | Select Class */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 custom-dp">
          {/* Departure Date */}
          <div className="bg-[#F4F9FA] rounded-[12px] sm:rounded-[14px] p-3 sm:px-4 sm:py-3 border border-transparent focus-within:border-[#5CACC4]/60 transition-all">
            <UnderlinedLabel>Departure Date</UnderlinedLabel>
            <div className="flex items-center justify-between mt-1">
              <DatePicker
                selected={departureDate}
                onChange={(d) => setDepartureDate(d)}
                minDate={new Date()}
                dateFormat="dd/MM/yyyy"
                placeholderText="dd/mm/yyyy"
                className="w-full bg-transparent outline-none text-[13px] sm:text-[14px] text-slate-700 font-poppins cursor-pointer"
              />
              <svg
                className="w-4 h-4 text-[#1F0060]/70 shrink-0 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
          </div>

          {/* Return Date (Disabled when One-Way is selected) */}
          <div
            className={`rounded-[12px] sm:rounded-[14px] p-3 sm:px-4 sm:py-3 border transition-all ${tripType === "one-way"
                ? "bg-[#EFEFEF]/70 opacity-45 cursor-not-allowed border-transparent select-none"
                : "bg-[#F4F9FA] border-transparent focus-within:border-[#5CACC4]/60"
              }`}
          >
            <UnderlinedLabel>Return Date</UnderlinedLabel>
            <div className="flex items-center justify-between mt-1">
              <DatePicker
                selected={returnDate}
                onChange={(d) => setReturnDate(d)}
                disabled={tripType === "one-way"}
                minDate={
                  departureDate
                    ? new Date(departureDate.getTime() + 86400000)
                    : new Date()
                }
                dateFormat="dd/MM/yyyy"
                placeholderText={
                  tripType === "one-way" ? "Not Applicable" : "dd/mm/yyyy"
                }
                className={`w-full bg-transparent outline-none text-[13px] sm:text-[14px] font-poppins ${tripType === "one-way"
                    ? "cursor-not-allowed text-slate-400"
                    : "cursor-pointer text-slate-700"
                  }`}
              />
              <svg
                className={`w-4 h-4 shrink-0 pointer-events-none ${tripType === "one-way"
                    ? "text-slate-400"
                    : "text-[#1F0060]/70"
                  }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
          </div>

          {/* Select Class */}
          <div className="bg-[#F4F9FA] rounded-[12px] sm:rounded-[14px] p-3 sm:px-4 sm:py-3 border border-transparent focus-within:border-[#5CACC4]/60 transition-all relative">
            <UnderlinedLabel>Select Class</UnderlinedLabel>
            <div className="flex items-center justify-between mt-1">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full bg-transparent outline-none text-[13px] sm:text-[14px] text-slate-700 font-poppins cursor-pointer appearance-none pr-6"
              >
                <option value="Economy">Economy</option>
                <option value="Premium Economy">Premium Economy</option>
                <option value="Business Class">Business Class</option>
                <option value="First Class">First Class</option>
              </select>
              <svg
                className="w-4 h-4 text-[#1F0060]/70 shrink-0 pointer-events-none absolute right-3 sm:right-4 bottom-3 sm:bottom-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="12" cy="12" r="9" strokeWidth={1.8} />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Row 3: Passengers | Type a Note */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {/* Passengers */}
          <div
            ref={passengerPickerRef}
            className="bg-[#F4F9FA] rounded-[12px] sm:rounded-[14px] p-3 sm:px-4 sm:py-3 border border-transparent focus-within:border-[#5CACC4]/60 transition-all relative"
          >
            <UnderlinedLabel>Passengers</UnderlinedLabel>
            <button
              type="button"
              onClick={() => setShowPassengerPicker((prev) => !prev)}
              className="w-full flex items-center justify-between mt-1 text-left cursor-pointer"
            >
              <span className="text-[13px] sm:text-[14px] text-slate-700 font-poppins">
                {passengerLabel}
              </span>
              <svg
                className={`w-4 h-4 text-[#1F0060]/70 shrink-0 transition-transform ${showPassengerPicker ? "rotate-180" : ""
                  }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Passenger dropdown counter */}
            {showPassengerPicker && (
              <div className="absolute top-[105%] left-0 w-full sm:w-[280px] bg-white rounded-[14px] shadow-xl border border-slate-200 p-4 z-50 space-y-3 font-poppins">
                {/* Adults */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-semibold text-[#1F0060]">Adults</p>
                    <p className="text-[11px] text-slate-400">Age 12+</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAdults((prev) => Math.max(1, prev - 1))}
                      className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-[#1F0060] font-bold text-sm flex items-center justify-center transition"
                    >
                      -
                    </button>
                    <span className="w-5 text-center text-sm font-semibold text-slate-700">
                      {adults}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAdults((prev) => Math.min(9, prev + 1))}
                      className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-[#1F0060] font-bold text-sm flex items-center justify-center transition"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                  <div>
                    <p className="text-[13px] font-semibold text-[#1F0060]">Children</p>
                    <p className="text-[11px] text-slate-400">Age 2-11</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setChildrenCount((prev) => Math.max(0, prev - 1))}
                      className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-[#1F0060] font-bold text-sm flex items-center justify-center transition"
                    >
                      -
                    </button>
                    <span className="w-5 text-center text-sm font-semibold text-slate-700">
                      {childrenCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => setChildrenCount((prev) => Math.min(9, prev + 1))}
                      className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-[#1F0060] font-bold text-sm flex items-center justify-center transition"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Infants */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                  <div>
                    <p className="text-[13px] font-semibold text-[#1F0060]">Infants</p>
                    <p className="text-[11px] text-slate-400">Under 2</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setInfants((prev) => Math.max(0, prev - 1))}
                      className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-[#1F0060] font-bold text-sm flex items-center justify-center transition"
                    >
                      -
                    </button>
                    <span className="w-5 text-center text-sm font-semibold text-slate-700">
                      {infants}
                    </span>
                    <button
                      type="button"
                      onClick={() => setInfants((prev) => Math.min(9, prev + 1))}
                      className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-[#1F0060] font-bold text-sm flex items-center justify-center transition"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPassengerPicker(false)}
                  className="w-full mt-2 py-1.5 bg-[#1F0060] text-white text-xs font-semibold rounded-[8px] hover:bg-[#2c0087] transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            )}
          </div>

          {/* Type a Note */}
          <div className="bg-[#F4F9FA] rounded-[12px] sm:rounded-[14px] p-3 sm:px-4 sm:py-3 border border-transparent focus-within:border-[#5CACC4]/60 transition-all">
            <UnderlinedLabel>Type a Note</UnderlinedLabel>
            <div className="flex items-center justify-between mt-1">
              <input
                type="text"
                value={addNote}
                onChange={(e) => setAddNote(e.target.value)}
                placeholder="Type a message here"
                className="w-full bg-transparent outline-none text-[13px] sm:text-[14px] text-slate-700 placeholder:text-slate-400 font-poppins"
              />
            </div>
          </div>
        </div>

        {/* Row 4: Passenger Name | Contact Us | Email Address */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
          {/* Passenger Name */}
          <div className="bg-[#F4F9FA] rounded-[12px] sm:rounded-[14px] p-3 sm:px-4 sm:py-3 border border-transparent focus-within:border-[#5CACC4]/60 transition-all">
            <UnderlinedLabel required>Passenger Name</UnderlinedLabel>
            <div className="flex items-center justify-between mt-1">
              <input
                type="text"
                value={passengerName}
                onChange={(e) =>
                  setPassengerName(e.target.value.replace(/[^a-zA-Z\s]/g, ""))
                }
                placeholder="Enter your name"
                className="w-full bg-transparent outline-none text-[13px] sm:text-[14px] text-slate-700 placeholder:text-slate-400 font-poppins pr-2"
              />
              <svg
                className="w-4 h-4 text-[#1F0060]/70 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </div>

          {/* Contact Us */}
          <div className="bg-[#F4F9FA] rounded-[12px] sm:rounded-[14px] p-3 sm:px-4 sm:py-3 border border-transparent focus-within:border-[#5CACC4]/60 transition-all">
            <UnderlinedLabel required>Contact Us</UnderlinedLabel>
            <div className="flex items-center justify-between mt-1">
              <input
                type="tel"
                value={contact}
                onChange={(e) =>
                  setContact(e.target.value.replace(/[^0-9+\s-]/g, ""))
                }
                placeholder="Enter your phone"
                className="w-full bg-transparent outline-none text-[13px] sm:text-[14px] text-slate-700 placeholder:text-slate-400 font-poppins pr-2"
              />
              <svg
                className="w-4 h-4 text-[#1F0060]/70 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
          </div>

          {/* Email Address */}
          <div className="bg-[#F4F9FA] rounded-[12px] sm:rounded-[14px] p-3 sm:px-4 sm:py-3 border border-transparent focus-within:border-[#5CACC4]/60 transition-all">
            <UnderlinedLabel required>Email Address</UnderlinedLabel>
            <div className="flex items-center justify-between mt-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-transparent outline-none text-[13px] sm:text-[14px] text-slate-700 placeholder:text-slate-400 font-poppins"
              />
            </div>
          </div>
        </div>

        {/* Row 5: Answer (Captcha) | Submit Button */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 items-center pt-1">
          {/* Answer (Captcha) */}
          <div className="bg-[#F4F9FA] rounded-[12px] sm:rounded-[14px] p-3 sm:px-4 sm:py-3 border border-transparent focus-within:border-[#5CACC4]/60 transition-all">
            <div className="flex items-center justify-between">
              <UnderlinedLabel required>Answer</UnderlinedLabel>
              <span className="text-[12px] sm:text-[13px] font-semibold text-[#1F0060] bg-white px-2 py-0.5 rounded border border-slate-200">
                {captchaQuestion}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type capta here"
                className="w-full bg-transparent outline-none text-[13px] sm:text-[14px] text-slate-700 placeholder:text-slate-400 font-poppins"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full h-[52px] sm:h-[58px] bg-[#5CACC4] hover:bg-[#4fa3bb] active:scale-[0.98] text-white font-poppins font-semibold text-[16px] sm:text-[18px] rounded-[12px] sm:rounded-[14px] flex items-center justify-center gap-2 shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
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
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>Submit</span>
                  <span className="text-xl leading-none">→</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnquiryModal;
