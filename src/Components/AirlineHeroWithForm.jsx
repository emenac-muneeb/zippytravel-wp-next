"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { showToast } from "../Helpers/Helper";
import PassengerDropdown from "./PassengerDropdown";
import CalendarDropdown from "./CalendarDropdown";
import { BASE_URL_IMG } from "../Helpers/imageurl";
import { endpoints } from "../Helpers/endpoints";
import api from "../Helpers/apiHelper";

const classOptions = [
  {
    id: "Premium Economy",
    label: "Premium Class",
    iconSrc: "/premiumclass.png",
  },
  {
    id: "Business",
    label: "Business Class",
    iconSrc: "/businessclass.png",
  },
  {
    id: "First Class",
    label: "First Class",
    iconSrc: "/firstclass.png",
  },
];

const AirlineHeroWithForm = ({
  bgImageOverride,
  initialBanners = [],
  selectedClass = "Business",
  setSelectedClass,
  setFlightLoading,
  setPopupMessage,
}) => {
  const router = useRouter();

  // Tab state: "One-Way" or "Round Trip"
  const [tripType, setTripType] = useState("One-Way");

  // Form states
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  // Dropdown states
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [showDepCalendar, setShowDepCalendar] = useState(false);
  const [showRetCalendar, setShowRetCalendar] = useState(false);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [userIp, setUserIp] = useState("");

  // Input and container refs
  const originInputRef = useRef(null);
  const destinationInputRef = useRef(null);
  const passengerContainerRef = useRef(null);
  const depCalendarContainerRef = useRef(null);
  const retCalendarContainerRef = useRef(null);
  const mobilePassengerContainerRef = useRef(null);
  const mobileDepCalendarContainerRef = useRef(null);
  const mobileRetCalendarContainerRef = useRef(null);

  // Resolve background image
  const bannerImgSrc = useMemo(() => {
    if (bgImageOverride) {
      if (bgImageOverride.startsWith("http") || bgImageOverride.startsWith("/")) {
        return bgImageOverride;
      }
      return `${BASE_URL_IMG}/media/${bgImageOverride.replace(/^\/?media\//, "")}`;
    }
    if (initialBanners && initialBanners.length > 0) {
      const first = initialBanners[0];
      const url = typeof first === "string" ? first : (first?.url || first?.image_url);
      if (url) {
        if (url.startsWith("http") || url.startsWith("/")) return url;
        return `${BASE_URL_IMG}/media/${url.replace(/^\/?media\//, "")}`;
      }
    }
    return "/BG%20Banner.png";
  }, [bgImageOverride, initialBanners]);

  useEffect(() => {
    const fetchIp = async () => {
      try {
        const res = await fetch("https://api64.ipify.org?format=json");
        const data = await res.json();
        setUserIp(data.ip || "");
      } catch (err) {
        console.error("Error fetching IP:", err);
      }
    };
    fetchIp();
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        passengerContainerRef.current &&
        !passengerContainerRef.current.contains(e.target) &&
        (!mobilePassengerContainerRef.current ||
          !mobilePassengerContainerRef.current.contains(e.target))
      ) {
        setShowPassengerModal(false);
      }
      if (
        depCalendarContainerRef.current &&
        !depCalendarContainerRef.current.contains(e.target) &&
        (!mobileDepCalendarContainerRef.current ||
          !mobileDepCalendarContainerRef.current.contains(e.target))
      ) {
        setShowDepCalendar(false);
      }
      if (
        retCalendarContainerRef.current &&
        !retCalendarContainerRef.current.contains(e.target) &&
        (!mobileRetCalendarContainerRef.current ||
          !mobileRetCalendarContainerRef.current.contains(e.target))
      ) {
        setShowRetCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format date helper: YYYY-MM-DD -> DD/MM/YYYY
  const formatDisplayDate = (val) => {
    if (!val) return "";
    try {
      const [y, m, d] = val.split("-");
      return `${d}/${m}/${y}`;
    } catch {
      return val;
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (submitting) return;

    if (!origin.trim() || !destination.trim() || !departureDate) {
      const msg = "Please enter origin, destination, and departure date.";
      if (typeof setPopupMessage === "function") setPopupMessage(msg);
      else showToast(msg, "error");
      return;
    }

    if (tripType === "Round Trip" && !returnDate) {
      const msg = "Please select a return date for round trip.";
      if (typeof setPopupMessage === "function") setPopupMessage(msg);
      else showToast(msg, "error");
      return;
    }

    const trip = tripType === "Round Trip" ? "Round-Trip" : "One-Way";
    const fromLabel = origin.trim();
    const toLabel = destination.trim();
    const returnValue = tripType === "Round Trip" ? returnDate : "";
    const travelClass = selectedClass || "Business";

    const payload = {
      name: fromLabel,
      email: "",
      contact: "",
      contact_detail: {
        subject: "Banner Flight Enquiry",
        message: `Flight enquiry from ${fromLabel} to ${toLabel}`,
        Inquiry: "Banner Flight Form",
        user_ip: userIp,
        trip_type: trip,
        origin: fromLabel,
        destination: toLabel,
        DepartureDate: departureDate,
        Return: returnValue,
        Class: travelClass,
        adults,
        children,
        infants,
        pageURL: typeof window !== "undefined" ? window.location.href : "",
        formType: "banner flight form",
      },
    };

    setSubmitting(true);
    try {
      const { data } = await api.post(endpoints.sendEmail, payload);
      if (data?.status === 1 || data?.success === 1) {
        showToast("Form submitted successfully!", "success");
        router.push("/thankyou.html");
      } else {
        showToast(data?.message || "Something went wrong. Please try again.", "error");
      }
    } catch (err) {
      console.error("Banner form submit error:", err);
      showToast("Server error occurred. Please try again later.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const passengerDisplayText = `${String(adults).padStart(2, "0")} adt - ${String(
    children
  ).padStart(2, "0")} chd - ${String(infants).padStart(2, "0")} inf`;

  return (
    <section className="relative w-full mb-[20px] sm:mb-[30px] lg:mb-[30px] font-poppins">
      {/* 
        Full-width Hero Banner with Flight Attendant / Airline Background:
        rounded-b-[36px] sm:rounded-b-[48px] lg:rounded-b-[60px]
      */}
      <div className="relative w-full overflow-hidden rounded-b-[36px] sm:rounded-b-[48px] lg:rounded-b-[60px] min-h-[580px] sm:min-h-[620px] lg:min-h-[650px] flex items-center justify-center">
        {/* Background Image */}
        <img
          src={bannerImgSrc}
          onError={(e) => {
            e.currentTarget.src = "/BG%20Banner.png";
          }}
          alt="Hero Banner"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-0"
        />

        {/* Dark Contrast Overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{
            background:
              "linear-gradient(180deg, rgba(20, 10, 45, 0.55) 0%, rgba(20, 10, 45, 0.45) 50%, rgba(20, 10, 45, 0.72) 100%)",
          }}
        />

        {/* 
          Centered Content: The Home Page Flight Search Form Card
          Placed directly in the center of the hero image, ABOVE the 3 bottom class buttons
        */}
        <div className="relative z-10 w-full max-w-[1236px] 2xl:max-w-[1360px] mx-auto px-3 sm:px-4 xl:px-0 pt-[40px] sm:pt-[50px] pb-[85px] sm:pb-[95px] flex flex-col items-center">
          {/* Form Card Container */}
          <div className="w-full relative mt-[23px]">
            {/* Tabs: One-Way and Round Trip */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-[23px] flex items-center justify-center gap-[10px] z-30">
              <button
                type="button"
                onClick={() => setTripType("One-Way")}
                className={`w-[140px] sm:w-[200px] lg:w-[242px] h-[46px] rounded-[10px] font-poppins font-bold text-[16px] sm:text-[18px] transition-all flex items-center justify-center select-none ${tripType === "One-Way"
                  ? "bg-[#5CACC4] text-white shadow-md border-0"
                  : "bg-white text-[#1F0060] border-[1.5px] border-[#1F0060] hover:bg-[#F3F6F8]"
                  }`}
              >
                One-Way
              </button>

              <button
                type="button"
                onClick={() => setTripType("Round Trip")}
                className={`w-[140px] sm:w-[200px] lg:w-[242px] h-[46px] rounded-[10px] font-poppins font-bold text-[16px] sm:text-[18px] transition-all flex items-center justify-center select-none ${tripType === "Round Trip"
                  ? "bg-[#5CACC4] text-white shadow-md border-0"
                  : "bg-white text-[#1F0060] border-[1.5px] border-[#1F0060] hover:bg-[#F3F6F8]"
                  }`}
              >
                Round Trip
              </button>
            </div>

            {/* Desktop Form Card (>= 1200px) */}
            <div className="hidden xl:block w-full h-[260px] bg-white rounded-[25px] shadow-[0_20px_50px_rgba(0,0,0,0.18)] relative border border-gray-100/50">
              {/* Fields Area */}
              <div className="absolute left-[32px] right-[164px] top-[37px]">
                {/* Row 1: Origin, Destination, Passengers */}
                <div className="flex items-center gap-[10px]">
                  {/* 1. Origin */}
                  <div
                    onClick={() => originInputRef.current?.focus()}
                    className="flex-1 h-[88px] bg-[#F3F6F8] rounded-[10px] relative px-[24px] py-[12px] flex flex-col justify-center cursor-text"
                  >
                    <div className="flex flex-col items-start">
                      <span
                        className="font-poppins font-semibold text-[20px] text-[#1F0060] inline-block"
                        style={{
                          borderBottomWidth: "5px",
                          borderBottomStyle: "solid",
                          borderBottomColor: "#5CACC4",
                          lineHeight: "0.6",
                          paddingBottom: "0px",
                        }}
                      >
                        Origin
                      </span>
                      <input
                        ref={originInputRef}
                        type="text"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                        placeholder="Enter your origin"
                        className="w-[85%] bg-transparent font-poppins font-normal text-[18px] text-[#222222] placeholder-[#8FA0AD] mt-[7px] outline-none border-none focus:ring-0 p-0 underline decoration-[#9BB0BF] underline-offset-2"
                      />
                    </div>
                    <div className="absolute right-[20px] top-[48px] pointer-events-none">
                      <Image
                        src="/media/fr-svgs/Icon1.png"
                        alt="Origin Icon"
                        width={24}
                        height={24}
                        className="w-[24px] h-[24px] object-contain"
                      />
                    </div>
                  </div>

                  {/* 2. Destination */}
                  <div
                    onClick={() => destinationInputRef.current?.focus()}
                    className="flex-1 h-[88px] bg-[#F3F6F8] rounded-[10px] relative px-[24px] py-[12px] flex flex-col justify-center cursor-text"
                  >
                    <div className="flex flex-col items-start">
                      <span
                        className="font-poppins font-semibold text-[20px] text-[#1F0060] inline-block"
                        style={{
                          borderBottomWidth: "5px",
                          borderBottomStyle: "solid",
                          borderBottomColor: "#5CACC4",
                          lineHeight: "0.6",
                          paddingBottom: "0px",
                        }}
                      >
                        Destination
                      </span>
                      <input
                        ref={destinationInputRef}
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="Enter your destination"
                        className="w-[85%] bg-transparent font-poppins font-normal text-[18px] text-[#222222] placeholder-[#8FA0AD] mt-[7px] outline-none border-none focus:ring-0 p-0 underline decoration-[#9BB0BF] underline-offset-2"
                      />
                    </div>
                    <div className="absolute right-[20px] top-[48px] pointer-events-none">
                      <Image
                        src="/media/fr-svgs/Group 8.png"
                        alt="Destination Dropdown"
                        width={24}
                        height={24}
                        className="w-[24px] h-[24px] object-contain"
                      />
                    </div>
                  </div>

                  {/* 3. Passengers */}
                  <div
                    ref={passengerContainerRef}
                    onClick={() => {
                      setShowPassengerModal(!showPassengerModal);
                      setShowDepCalendar(false);
                      setShowRetCalendar(false);
                    }}
                    className="flex-1 h-[88px] bg-[#F3F6F8] rounded-[10px] relative px-[24px] py-[12px] flex flex-col justify-center cursor-pointer select-none"
                  >
                    <div className="flex flex-col items-start pointer-events-none">
                      <span
                        className="font-poppins font-semibold text-[20px] text-[#1F0060] inline-block"
                        style={{
                          borderBottomWidth: "5px",
                          borderBottomStyle: "solid",
                          borderBottomColor: "#5CACC4",
                          lineHeight: "0.6",
                          paddingBottom: "0px",
                        }}
                      >
                        Passengers
                      </span>
                      <span className="font-poppins font-normal text-[18px] text-[#8FA0AD] mt-[7px] truncate underline decoration-[#9BB0BF] underline-offset-2 inline-block">
                        {passengerDisplayText}
                      </span>
                    </div>
                    <div className="absolute right-[20px] top-[48px] pointer-events-none">
                      <Image
                        src="/media/fr-svgs/Group 8.png"
                        alt="Passengers Dropdown"
                        width={24}
                        height={24}
                        className={`w-[24px] h-[24px] object-contain transition-transform ${showPassengerModal ? "rotate-180" : ""
                          }`}
                      />
                    </div>

                    {showPassengerModal && (
                      <PassengerDropdown
                        adults={adults}
                        setAdults={setAdults}
                        children={children}
                        setChildren={setChildren}
                        infants={infants}
                        setInfants={setInfants}
                        className="absolute top-[calc(100%+6px)] right-0 z-50"
                      />
                    )}
                  </div>
                </div>

                {/* Row 2: Departure Date & Return Date */}
                <div className="flex items-center gap-[10px] mt-[10px] relative z-20">
                  {/* 1. Departure Date */}
                  <div
                    ref={depCalendarContainerRef}
                    onClick={() => {
                      setShowDepCalendar(!showDepCalendar);
                      setShowPassengerModal(false);
                      setShowRetCalendar(false);
                    }}
                    className="flex-1 h-[88px] bg-[#F3F6F8] rounded-[10px] relative px-[24px] py-[12px] flex flex-col justify-center cursor-pointer select-none"
                  >
                    <div className="flex flex-col items-start pointer-events-none">
                      <span
                        className="font-poppins font-semibold text-[20px] text-[#1F0060] inline-block"
                        style={{
                          borderBottomWidth: "5px",
                          borderBottomStyle: "solid",
                          borderBottomColor: "#5CACC4",
                          lineHeight: "0.6",
                          paddingBottom: "0px",
                        }}
                      >
                        Departure Date
                      </span>
                      <span
                        className={`font-poppins font-normal text-[18px] mt-[7px] truncate underline decoration-[#9BB0BF] underline-offset-2 inline-block ${departureDate ? "text-[#222222] font-medium" : "text-[#8FA0AD]"
                          }`}
                      >
                        {departureDate ? formatDisplayDate(departureDate) : "Enter your departure date"}
                      </span>
                    </div>
                    <div className="absolute right-[20px] top-[48px] pointer-events-none">
                      <Image
                        src="/Icon2.png"
                        alt="Calendar Icon"
                        width={24}
                        height={24}
                        className="w-[24px] h-[24px] object-contain"
                      />
                    </div>

                    {showDepCalendar && (
                      <CalendarDropdown
                        selectedDate={departureDate}
                        minDate={new Date().toISOString().split("T")[0]}
                        onSelectDate={(dateStr) => {
                          setDepartureDate(dateStr);
                          if (returnDate && returnDate < dateStr) {
                            setReturnDate("");
                          }
                          setShowDepCalendar(false);
                        }}
                        className="absolute top-[calc(100%+6px)] left-0 z-50"
                      />
                    )}
                  </div>

                  {/* 2. Return Date */}
                  <div
                    ref={retCalendarContainerRef}
                    onClick={() => {
                      if (tripType !== "Round Trip") return;
                      setShowRetCalendar(!showRetCalendar);
                      setShowPassengerModal(false);
                      setShowDepCalendar(false);
                    }}
                    className={`flex-1 h-[88px] bg-[#F3F6F8] rounded-[10px] relative px-[24px] py-[12px] flex flex-col justify-center select-none ${tripType === "Round Trip" ? "cursor-pointer opacity-100" : "cursor-not-allowed opacity-40"
                      }`}
                  >
                    <div className="flex flex-col items-start pointer-events-none">
                      <span
                        className="font-poppins font-semibold text-[20px] text-[#1F0060] inline-block"
                        style={{
                          borderBottomWidth: "5px",
                          borderBottomStyle: "solid",
                          borderBottomColor: "#5CACC4",
                          lineHeight: "0.6",
                          paddingBottom: "0px",
                        }}
                      >
                        Return Date
                      </span>
                      <span
                        className={`font-poppins font-normal text-[18px] mt-[7px] truncate underline decoration-[#9BB0BF] underline-offset-2 inline-block ${returnDate ? "text-[#222222] font-medium" : "text-[#8FA0AD]"
                          }`}
                      >
                        {tripType === "Round Trip" && returnDate
                          ? formatDisplayDate(returnDate)
                          : "Enter your return date"}
                      </span>
                    </div>
                    <div className="absolute right-[20px] top-[48px] pointer-events-none">
                      <Image
                        src="/Icon3.png"
                        alt="Return Calendar Icon"
                        width={24}
                        height={24}
                        className="w-[24px] h-[24px] object-contain"
                      />
                    </div>

                    {showRetCalendar && tripType === "Round Trip" && (
                      <CalendarDropdown
                        selectedDate={returnDate}
                        minDate={departureDate || new Date().toISOString().split("T")[0]}
                        onSelectDate={(dateStr) => {
                          setReturnDate(dateStr);
                          setShowRetCalendar(false);
                        }}
                        className="absolute top-[calc(100%+6px)] left-0 z-50"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="absolute right-[32px] top-[37px] w-[112px] h-[186px] bg-[#5CACC4] hover:bg-[#4ea0b8] rounded-[10px] flex flex-col items-center justify-center cursor-pointer transition-all duration-200 select-none shadow-md group disabled:opacity-70 disabled:cursor-not-allowed"
                aria-label="Submit"
              >
                <div className="w-[38px] h-[38px] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Image
                    src="/media/fr-svgs/send.svg"
                    alt="Search Icon"
                    width={22}
                    height={22}
                    className="w-[22px] h-[22px] object-contain"
                  />
                </div>
                <span className="font-poppins font-bold text-[18px] text-white text-center leading-[22px] mt-[10px] px-2">
                  {submitting ? "..." : "Submit"}
                </span>
              </button>
            </div>

            {/* Mobile / Tablet Form Card (< 1200px) */}
            <div className="block xl:hidden w-full bg-white rounded-[20px] p-4 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.18)] border border-gray-100/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 pt-4">
                {/* Mobile Origin */}
                <div
                  onClick={() => originInputRef.current?.focus()}
                  className="bg-[#F3F6F8] rounded-[10px] p-4 relative flex flex-col justify-center min-h-[84px] cursor-text"
                >
                  <span
                    className="font-poppins font-semibold text-[18px] text-[#1F0060] inline-block w-fit"
                    style={{
                      borderBottomWidth: "5px",
                      borderBottomStyle: "solid",
                      borderBottomColor: "#5CACC4",
                      lineHeight: "0.6",
                      paddingBottom: "0px",
                    }}
                  >
                    Origin
                  </span>
                  <input
                    ref={originInputRef}
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="Enter your origin"
                    className="w-[85%] bg-transparent font-poppins text-[16px] text-[#222222] placeholder-[#8FA0AD] mt-2 outline-none border-none focus:ring-0 p-0 underline decoration-[#9BB0BF] underline-offset-2"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Image src="/media/fr-svgs/Icon1.png" alt="Origin" width={22} height={22} />
                  </div>
                </div>

                {/* Mobile Destination */}
                <div
                  onClick={() => destinationInputRef.current?.focus()}
                  className="bg-[#F3F6F8] rounded-[10px] p-4 relative flex flex-col justify-center min-h-[84px] cursor-text"
                >
                  <span
                    className="font-poppins font-semibold text-[18px] text-[#1F0060] inline-block w-fit"
                    style={{
                      borderBottomWidth: "5px",
                      borderBottomStyle: "solid",
                      borderBottomColor: "#5CACC4",
                      lineHeight: "0.6",
                      paddingBottom: "0px",
                    }}
                  >
                    Destination
                  </span>
                  <input
                    ref={destinationInputRef}
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Enter your destination"
                    className="w-[85%] bg-transparent font-poppins text-[16px] text-[#222222] placeholder-[#8FA0AD] mt-2 outline-none border-none focus:ring-0 p-0 underline decoration-[#9BB0BF] underline-offset-2"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Image src="/media/fr-svgs/Group 8.png" alt="Destination" width={22} height={22} />
                  </div>
                </div>

                {/* Mobile Passengers */}
                <div
                  ref={mobilePassengerContainerRef}
                  onClick={() => {
                    setShowPassengerModal(!showPassengerModal);
                    setShowDepCalendar(false);
                    setShowRetCalendar(false);
                  }}
                  className="bg-[#F3F6F8] rounded-[10px] p-4 relative flex flex-col justify-center min-h-[84px] md:col-span-2 cursor-pointer select-none z-30"
                >
                  <span
                    className="font-poppins font-semibold text-[18px] text-[#1F0060] inline-block w-fit pointer-events-none"
                    style={{
                      borderBottomWidth: "5px",
                      borderBottomStyle: "solid",
                      borderBottomColor: "#5CACC4",
                      lineHeight: "0.6",
                      paddingBottom: "0px",
                    }}
                  >
                    Passengers
                  </span>
                  <span className="font-poppins text-[16px] text-[#8FA0AD] mt-2 truncate underline decoration-[#9BB0BF] underline-offset-2 inline-block pointer-events-none">
                    {passengerDisplayText}
                  </span>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Image src="/media/fr-svgs/Group 8.png" alt="Passengers" width={22} height={22} />
                  </div>

                  {showPassengerModal && (
                    <PassengerDropdown
                      adults={adults}
                      setAdults={setAdults}
                      children={children}
                      setChildren={setChildren}
                      infants={infants}
                      setInfants={setInfants}
                      className="absolute top-[calc(100%+6px)] left-0 sm:left-auto right-0 z-50 max-w-[340px]"
                    />
                  )}
                </div>

                {/* Mobile Departure Date */}
                <div
                  ref={mobileDepCalendarContainerRef}
                  onClick={() => {
                    setShowDepCalendar(!showDepCalendar);
                    setShowPassengerModal(false);
                    setShowRetCalendar(false);
                  }}
                  className="bg-[#F3F6F8] rounded-[10px] p-4 relative flex flex-col justify-center min-h-[84px] cursor-pointer select-none z-20"
                >
                  <div className="pointer-events-none">
                    <span
                      className="font-poppins font-semibold text-[18px] text-[#1F0060] inline-block w-fit"
                      style={{
                        borderBottomWidth: "5px",
                        borderBottomStyle: "solid",
                        borderBottomColor: "#5CACC4",
                        lineHeight: "0.6",
                        paddingBottom: "0px",
                      }}
                    >
                      Departure Date
                    </span>
                    <span className={`font-poppins text-[16px] mt-2 underline decoration-[#9BB0BF] underline-offset-2 block ${departureDate ? "text-[#222222] font-medium" : "text-[#8FA0AD]"}`}>
                      {departureDate ? formatDisplayDate(departureDate) : "Enter your departure date"}
                    </span>
                  </div>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                    <Image src="/Icon2.png" alt="Departure Date" width={22} height={22} />
                  </div>

                  {showDepCalendar && (
                    <CalendarDropdown
                      selectedDate={departureDate}
                      minDate={new Date().toISOString().split("T")[0]}
                      onSelectDate={(dateStr) => {
                        setDepartureDate(dateStr);
                        if (returnDate && returnDate < dateStr) {
                          setReturnDate("");
                        }
                        setShowDepCalendar(false);
                      }}
                      className="absolute top-[calc(100%+10px)] left-0 sm:left-auto right-0 z-50 max-w-[395px]"
                    />
                  )}
                </div>

                {/* Mobile Return Date */}
                <div
                  ref={mobileRetCalendarContainerRef}
                  onClick={() => {
                    if (tripType !== "Round Trip") return;
                    setShowRetCalendar(!showRetCalendar);
                    setShowPassengerModal(false);
                    setShowDepCalendar(false);
                  }}
                  className={`bg-[#F3F6F8] rounded-[10px] p-4 relative flex flex-col justify-center min-h-[84px] select-none z-10 ${tripType === "Round Trip" ? "opacity-100 cursor-pointer" : "opacity-35 cursor-not-allowed"
                    }`}
                >
                  <div className="pointer-events-none">
                    <span
                      className="font-poppins font-semibold text-[18px] text-[#1F0060] inline-block w-fit"
                      style={{
                        borderBottomWidth: "5px",
                        borderBottomStyle: "solid",
                        borderBottomColor: "#5CACC4",
                        lineHeight: "0.6",
                        paddingBottom: "0px",
                      }}
                    >
                      Return Date
                    </span>
                    <span className={`font-poppins text-[16px] mt-2 underline decoration-[#9BB0BF] underline-offset-2 block ${returnDate ? "text-[#222222] font-medium" : "text-[#8FA0AD]"}`}>
                      {tripType === "Round Trip" && returnDate
                        ? formatDisplayDate(returnDate)
                        : "Enter your return date"}
                    </span>
                  </div>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                    <Image src="/Icon3.png" alt="Return Date" width={22} height={22} />
                  </div>

                  {showRetCalendar && tripType === "Round Trip" && (
                    <CalendarDropdown
                      selectedDate={returnDate}
                      minDate={departureDate || new Date().toISOString().split("T")[0]}
                      onSelectDate={(dateStr) => {
                        setReturnDate(dateStr);
                        setShowRetCalendar(false);
                      }}
                      className="absolute top-[calc(100%+10px)] left-0 sm:left-auto right-0 z-50 max-w-[395px]"
                    />
                  )}
                </div>
              </div>

              {/* Mobile Submit Button */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="mt-4 w-full h-[52px] bg-[#5CACC4] hover:bg-[#4ea0b8] text-white font-poppins font-bold rounded-[12px] flex items-center justify-center gap-2 shadow-md cursor-pointer transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Image src="/media/fr-svgs/send.svg" alt="Search" width={20} height={20} className="w-[20px] h-[20px] object-contain" />
                <span>Search Flights</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 
        The 3 Class Selector Buttons at the bottom edge of the hero image:
        Center button (Business Class) is taller with larger padding, minHeight, and -my-2.5 / -my-3.5 protrusion.
        Left (Premium Class) and Right (First Class) buttons are shorter with clean rounded outer corners.
        Styled in Zippy Travel colors (#5CACC4, #1F0060, white, #E2E8F0)
      */}
      <div className="hidden absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 z-[30] w-[92%] container flex items-center justify-center">
        <div className="flex flex-wrap justify-center min-[576px]:grid min-[576px]:grid-cols-3 w-full items-stretch gap-2.5 min-[576px]:gap-0">
          {classOptions.map((option, index) => {
            const isCenter = index === 1;
            const isActive = selectedClass === option.id;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedClass?.(option.id)}
                className={`flex items-center justify-center gap-1.5 min-[400px]:gap-2 sm:gap-2.5 min-[1065px]:gap-3 transition-all duration-300 ease-in-out px-2.5 sm:px-4 min-[1065px]:px-6 w-[calc(50%-6px)] min-[576px]:w-full ${isActive
                  ? "bg-white border-2 border-[#5CACC4] shadow-[0_12px_32px_rgba(92,172,196,0.35)] z-20 text-[#1F0060]"
                  : "bg-[#F8FAFC] border border-[#E2E8F0] z-10 hover:bg-white text-[#1F0060]/70"
                  } ${isCenter
                    ? "py-3 sm:py-5 min-[1065px]:py-6 rounded-[18px] min-[576px]:rounded-[22px] min-[1065px]:rounded-[26px] min-[576px]:border min-[576px]:-my-2.5 min-[1065px]:-my-3.5 scale-[1.03] z-20"
                    : "py-2 sm:py-3.5 min-[1065px]:py-4 scale-100"
                  } ${index === 0 && !isCenter
                    ? "min-[576px]:rounded-l-[18px] min-[1065px]:rounded-l-[22px] min-[576px]:rounded-r-none min-[576px]:border-r-0 rounded-[14px]"
                    : ""
                  } ${index === 2 && !isCenter
                    ? "min-[576px]:rounded-r-[18px] min-[1065px]:rounded-r-[22px] min-[576px]:rounded-l-none min-[576px]:border-l-0 rounded-[14px]"
                    : ""
                  }`}
                style={{
                  minHeight: isCenter
                    ? "clamp(56px, 7.8vw, 86px)"
                    : "clamp(44px, 5.8vw, 64px)",
                }}
              >
                <img
                  src={option.iconSrc}
                  alt={option.label}
                  className="w-5 h-5 min-[400px]:w-6 min-[400px]:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 min-[900px]:w-9 min-[900px]:h-9 min-[1065px]:w-auto min-[1065px]:h-auto object-contain flex-shrink-0"
                />
                <span
                  className={`font-poppins tracking-normal sm:tracking-wide transition-colors duration-300 whitespace-nowrap ${isCenter
                    ? "text-[14px] min-[380px]:text-[15px] min-[576px]:text-[18px] md:text-[22px] min-[900px]:text-[26px] min-[1065px]:text-[30px] font-bold"
                    : "text-[13px] min-[380px]:text-[14px] min-[576px]:text-[16px] md:text-[19px] min-[900px]:text-[22px] min-[1065px]:text-[25px] font-semibold"
                    } ${isActive ? "text-[#1F0060]" : "text-[#1F0060]/75"}`}
                >
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AirlineHeroWithForm;

