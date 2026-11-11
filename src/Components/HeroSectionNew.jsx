"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";
import { showToast } from "../Helpers/Helper";
import PassengerDropdown from "./PassengerDropdown";
import CalendarDropdown from "./CalendarDropdown";
import { BASE_URL_IMG } from "../Helpers/imageurl";
import { endpoints } from "../Helpers/endpoints";
import api from "../Helpers/apiHelper";

const toInputDate = (value) => {
  if (!value) return "";
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  // DD-MM-YYYY from legacy search forms
  const dmy = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  return value;
};

const resolveMediaSrc = (url) => {
  if (!url || typeof url !== "string") return "";
  if (url.startsWith("http") || url.startsWith("/")) return url;
  return `${BASE_URL_IMG}/media/${url.replace(/^\/?media\//, "")}`;
};

const HeroSectionNew = ({
  setFlightLoading,
  setPopupMessage,
  title,
  subTitle,
  description,
  bgImageOverride,
  initialBanners = [],
  bannerSlug = "flights",
  initialSearch = null,
}) => {
  const router = useRouter();

  // Tab state: "One-Way" or "Round Trip"
  const [tripType, setTripType] = useState("One-Way");
  const [banners, setBanners] = useState(
    Array.isArray(initialBanners) ? initialBanners : []
  );

  // Form states — codes are the selected airport IATA values; labels are what the inputs show
  const [origin, setOrigin] = useState("");
  const [originLabel, setOriginLabel] = useState("");
  const [destination, setDestination] = useState("");
  const [destinationLabel, setDestinationLabel] = useState("");
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [loadingOrigin, setLoadingOrigin] = useState(false);
  const [loadingDestination, setLoadingDestination] = useState(false);
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const suggestionReq = useRef({ origin: 0, destination: 0 });

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
  const originMobileInputRef = useRef(null);
  const destinationMobileInputRef = useRef(null);
  const passengerContainerRef = useRef(null);
  const depCalendarContainerRef = useRef(null);
  const retCalendarContainerRef = useRef(null);
  const mobilePassengerContainerRef = useRef(null);
  const mobileDepCalendarContainerRef = useRef(null);
  const mobileRetCalendarContainerRef = useRef(null);

  useEffect(() => {
    if (Array.isArray(initialBanners) && initialBanners.length > 0) {
      setBanners(initialBanners);
    }
  }, [initialBanners]);

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

  // Prefill search form when parent provides current search values (flight details)
  useEffect(() => {
    if (!initialSearch) return;

    let saved = {};
    try {
      saved = JSON.parse(localStorage.getItem("flightFormData") || "{}");
    } catch {
      saved = {};
    }

    const trip = initialSearch.tripType || saved.tripType || "One-Way";
    setTripType(trip === "Round-Trip" || trip === "Round Trip" ? "Round Trip" : "One-Way");
    setOrigin(initialSearch.origin || saved.origin || "");
    setOriginLabel(
      initialSearch.originLabel || saved.originLabel || initialSearch.origin || ""
    );
    setDestination(initialSearch.destination || saved.destination || "");
    setDestinationLabel(
      initialSearch.destinationLabel ||
        saved.destinationLabel ||
        initialSearch.destination ||
        ""
    );
    setDepartureDate(
      toInputDate(initialSearch.departureDate || saved.departureDate || "")
    );
    setReturnDate(toInputDate(initialSearch.returnDate || saved.returnDate || ""));
    setAdults(Number(initialSearch.adults ?? saved.adults ?? 1));
    setChildren(Number(initialSearch.children ?? saved.children ?? 0));
    setInfants(Number(initialSearch.infants ?? saved.infants ?? 0));
  }, [initialSearch]);

  // Home banner fallback: fetch /banner when no SSR banners and no page overrides
  useEffect(() => {
    if (banners.length > 0 || title || description || bgImageOverride) return;

    axios
      .get(endpoints.banner)
      .then((res) => {
        if (res.data?.status === 1 && Array.isArray(res.data.result)) {
          setBanners(res.data.result);
        }
      })
      .catch((err) => console.error("Failed to fetch banners:", err));
  }, [banners.length, title, description, bgImageOverride]);

  const currentBanner =
    banners.find(
      (item) => item?.slug?.toLowerCase() === String(bannerSlug).toLowerCase()
    ) ||
    banners.find((item) => item?.title || item?.image_url || item?.url) ||
    null;

  const displaySubTitle = subTitle || "— Zippy Travel";
  const displayTitle = title || currentBanner?.title || "London-Based UK Agency";
  const displayDescription =
    description ||
    currentBanner?.description ||
    currentBanner?.banner_description ||
    "";
  const displayImageAlt =
    currentBanner?.image_alt || displayTitle || "Zippy Travel Hero Banner";

  // Resolve background image: page override → banner API image_url → fallback
  const bannerImgSrc = React.useMemo(() => {
    if (bgImageOverride) return resolveMediaSrc(bgImageOverride) || "/BG%20Banner.png";

    const apiImage =
      currentBanner?.image_url ||
      currentBanner?.url ||
      (typeof banners[0] === "string" ? banners[0] : banners[0]?.url || banners[0]?.image_url);

    return resolveMediaSrc(apiImage) || "/BG%20Banner.png";
  }, [bgImageOverride, currentBanner, banners]);

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
      if (!e.target.closest(".airport-origin")) setOriginSuggestions([]);
      if (!e.target.closest(".airport-destination")) setDestinationSuggestions([]);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const focusVisibleInput = (desktopRef, mobileRef) => {
    const desktop = desktopRef.current;
    if (desktop && desktop.offsetParent !== null) desktop.focus();
    else mobileRef.current?.focus();
  };

  const fetchCitySuggestions = async (text, type) => {
    const query = text.trim().toLowerCase();
    const isOrigin = type === "origin";

    if (query.length < 3) {
      if (isOrigin) setOriginSuggestions([]);
      else setDestinationSuggestions([]);
      return;
    }

    const reqId = ++suggestionReq.current[type];
    if (isOrigin) setLoadingOrigin(true);
    else setLoadingDestination(true);

    try {
      const response = await api.get(`/autocomplete/${encodeURIComponent(query)}`);
      if (suggestionReq.current[type] !== reqId) return;
      const data = Array.isArray(response.data)
        ? response.data.filter((item) => typeof item === "string" && item.trim())
        : [];
      if (isOrigin) setOriginSuggestions(data);
      else setDestinationSuggestions(data);
    } catch (error) {
      if (suggestionReq.current[type] !== reqId) return;
      console.error("Error fetching city suggestions:", error);
      if (isOrigin) setOriginSuggestions([]);
      else setDestinationSuggestions([]);
    } finally {
      if (suggestionReq.current[type] === reqId) {
        if (isOrigin) setLoadingOrigin(false);
        else setLoadingDestination(false);
      }
    }
  };

  const selectAirport = (item, type) => {
    const match = String(item).match(/\(([^)]+)\)/);
    const code = match ? match[1] : item;
    if (type === "origin") {
      setOrigin(code);
      setOriginLabel(item);
      setOriginSuggestions([]);
    } else {
      setDestination(code);
      setDestinationLabel(item);
      setDestinationSuggestions([]);
    }
  };

  const handleAirportChange = (value, type) => {
    if (!/^[a-zA-Z0-9\s()/,.'&\-]*$/.test(value)) return;
    setShowPassengerModal(false);
    setShowDepCalendar(false);
    setShowRetCalendar(false);
    if (type === "origin") {
      setOriginLabel(value);
      setOrigin("");
    } else {
      setDestinationLabel(value);
      setDestination("");
    }
    fetchCitySuggestions(value, type);
  };

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
      const msg =
        !origin.trim() || !destination.trim()
          ? "Please choose origin and destination from the suggestions."
          : "Please select a departure date.";
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
    const fromLabel = originLabel.trim() || origin.trim();
    const toLabel = destinationLabel.trim() || destination.trim();
    const returnValue = tripType === "Round Trip" ? returnDate : "";

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
        OriginCode: origin.trim(),
        DestinationCode: destination.trim(),
        DepartureDate: departureDate,
        Return: returnValue,
        Class: "Business",
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

  const renderAirportSuggestions = (items, type) => {
    if (!items.length) return null;
    return (
      <ul className="suggestion-list absolute left-0 right-0 top-[calc(100%+6px)] z-[80] bg-white border border-[#E3E8EC] max-h-52 overflow-y-auto rounded-[12px] shadow-[0_12px_40px_rgba(31,0,96,0.16)] py-1">
        {items.map((item) => (
          <li key={item}>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                selectAirport(item, type);
              }}
              className="w-full text-left px-4 py-2.5 cursor-pointer text-[14px] sm:text-[15px] text-[#1F0060] font-poppins hover:bg-[#F3F6F8] hover:text-[#5CACC4]"
            >
              {item}
            </button>
          </li>
        ))}
      </ul>
    );
  };

  const passengerDisplayText = `${String(adults).padStart(2, "0")} adt - ${String(
    children
  ).padStart(2, "0")} chd - ${String(infants).padStart(2, "0")} inf`;

  return (
    <section className="w-full relative mt-[28px] mb-[30px] sm:mb-[40px] lg:mb-[50px] font-poppins">
      {/* 
        Full-width Hero Banner Wrapper:
        Takes 100% full width of the screen, with responsive side padding so all 4 corners stay curved.
      */}
      <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 relative">
        {/* 
          Hero Banner Card with ALL 4 CORNERS CURVED:
          rounded-[28px] sm:rounded-[36px] lg:rounded-[40px] on ALL four corners!
        */}
        <div className="w-full relative overflow-hidden rounded-[28px] sm:rounded-[36px] lg:rounded-[40px] min-h-[580px] sm:min-h-[625px] xl:min-h-[640px] flex flex-col items-center">
          {/* 
            Background Image
          */}
          <img
            src={bannerImgSrc}
            onError={(e) => {
              e.currentTarget.src = "/BG%20Banner.png";
            }}
            alt={displayImageAlt}
            title={currentBanner?.image_title || displayTitle}
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-0"
          />

          {/* Subtle contrast overlay to enhance text readability */}
          <div className="absolute inset-0 bg-black/25 pointer-events-none z-[1]" />

          {/* Centered Text Content (Max 1360px container) */}
          <div className="w-full max-w-[1360px] mx-auto text-center pt-[70px] sm:pt-[90px] lg:pt-[107px] px-4 relative z-10">
            {/* Subtitle stays static */}
            <p className="font-poppins font-normal text-[18px] sm:text-[22px] lg:text-[24px] text-white tracking-wide">
              {displaySubTitle}
            </p>

            {/* H1 from /banner title (or page override) */}
            <h1 className="mt-[8px] font-poppins font-bold text-[36px] sm:text-[54px] md:text-[68px] lg:text-[83px] text-white tracking-tight leading-[1.08] drop-shadow-sm">
              {displayTitle}
            </h1>

            {/* Description from /banner description (or page override) */}
            {displayDescription ? (
              typeof displayDescription === "string" && displayDescription.includes("<") ? (
                <div
                  className="banner-description"
                  dangerouslySetInnerHTML={{ __html: displayDescription }}
                />
              ) : (
                <div className="banner-description">
                  <p>{displayDescription}</p>
                </div>
              )
            ) : (
              <div className="banner-description">
                <p>
                  Zippytravel.co.uk is an e-commerce UK based company
                  <br className="hidden sm:inline" />
                  {" "}offering online travel products and services.
                </p>
              </div>
            )}
          </div>

          {/* Bottom spacer so banner maintains proper height */}
          <div className="w-full h-[180px] sm:h-[220px]" />
        </div>

        {/* 
          Form Section:
          Width: 1236px (at 1360px screen), adjusts smoothly on full screen (wider screens), Height: 260px
          Half inside bottom of hero banner (130px), half outside (130px)
        */}
        <div className="w-full max-w-[1236px] 2xl:max-w-[1400px] 3xl:max-w-[1550px] mx-auto -mt-[130px] relative z-20 px-3 sm:px-4 xl:px-0">
          {/* Tabs: Half on hero img, half on form card (-top-[23px]) */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-[23px] flex items-center justify-center gap-[10px] z-30">
            {/* One-Way Tab (242px x 46px) */}
            <button
              type="button"
              onClick={() => setTripType("One-Way")}
              className={`w-[140px] sm:w-[200px] lg:w-[242px] h-[46px] rounded-[10px] font-poppins font-bold text-[16px] sm:text-[18px] transition-all flex items-center justify-center select-none ${
                tripType === "One-Way"
                  ? "bg-[#5CACC4] text-white shadow-md border-0"
                  : "bg-white text-[#1F0060] border-[1.5px] border-[#1F0060] hover:bg-[#F3F6F8]"
              }`}
            >
              One-Way
            </button>

            {/* Round Trip Tab (242px x 46px) */}
            <button
              type="button"
              onClick={() => setTripType("Round Trip")}
              className={`w-[140px] sm:w-[200px] lg:w-[242px] h-[46px] rounded-[10px] font-poppins font-bold text-[16px] sm:text-[18px] transition-all flex items-center justify-center select-none ${
                tripType === "Round Trip"
                  ? "bg-[#5CACC4] text-white shadow-md border-0"
                  : "bg-white text-[#1F0060] border-[1.5px] border-[#1F0060] hover:bg-[#F3F6F8]"
              }`}
            >
              Round Trip
            </button>
          </div>

          {/* Desktop Form Card (>= 1200px): Exactly 1236px x 260px at 1360px screen, responsive on wider */}
          <div className="hidden xl:block w-full h-[260px] bg-white rounded-[25px] shadow-[0_20px_50px_rgba(0,0,0,0.12)] relative border border-gray-100/50">
            {/* Left Fields Area: Left 32px, Right 164px (leaves 20px gap to search button at right 32px) */}
            <div className="absolute left-[32px] right-[164px] top-[37px]">
              {/* Row 1: 3 Divs (340px x 88px at 1360px, 10px gap) */}
              <div className="flex items-center gap-[10px]">
                {/* 1. Origin Div */}
                <div
                  onClick={() => focusVisibleInput(originInputRef, originMobileInputRef)}
                  className={`airport-origin flex-1 h-[88px] bg-[#F3F6F8] rounded-[10px] relative px-[24px] py-[12px] flex flex-col justify-center cursor-text ${
                    originSuggestions.length ? "z-40" : "z-10"
                  }`}
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
                      aria-label="Origin"
                      autoComplete="off"
                      value={originLabel}
                      onChange={(e) => handleAirportChange(e.target.value, "origin")}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") setOriginSuggestions([]);
                        if (e.key === "Enter" && originSuggestions[0]) {
                          e.preventDefault();
                          selectAirport(originSuggestions[0], "origin");
                        }
                      }}
                      placeholder="Enter your origin"
                      className="w-[85%] bg-transparent font-poppins font-normal text-[18px] text-[#222222] placeholder-[#8FA0AD] mt-[7px] outline-none border-none focus:ring-0 p-0 underline decoration-[#9BB0BF] underline-offset-2"
                    />
                  </div>
                  {loadingOrigin && (
                    <span className="absolute right-[52px] top-[52px] h-4 w-4 rounded-full border-2 border-[#5CACC4] border-t-transparent animate-spin" />
                  )}
                  {renderAirportSuggestions(originSuggestions, "origin")}
                  {/* Right Icon: right 20px, top 48px */}
                  <div className="absolute right-[20px] top-[48px] pointer-events-none">
                    <Image
                      src="/Icon1.png"
                      alt="Origin Icon"
                      width={24}
                      height={24}
                      className="w-[24px] h-[24px] object-contain"
                    />
                  </div>
                </div>

                {/* 2. Destination Div */}
                <div
                  onClick={() => focusVisibleInput(destinationInputRef, destinationMobileInputRef)}
                  className={`airport-destination flex-1 h-[88px] bg-[#F3F6F8] rounded-[10px] relative px-[24px] py-[12px] flex flex-col justify-center cursor-text ${
                    destinationSuggestions.length ? "z-40" : "z-10"
                  }`}
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
                      aria-label="Destination"
                      autoComplete="off"
                      value={destinationLabel}
                      onChange={(e) => handleAirportChange(e.target.value, "destination")}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") setDestinationSuggestions([]);
                        if (e.key === "Enter" && destinationSuggestions[0]) {
                          e.preventDefault();
                          selectAirport(destinationSuggestions[0], "destination");
                        }
                      }}
                      placeholder="Enter your destination"
                      className="w-[85%] bg-transparent font-poppins font-normal text-[18px] text-[#222222] placeholder-[#8FA0AD] mt-[7px] outline-none border-none focus:ring-0 p-0 underline decoration-[#9BB0BF] underline-offset-2"
                    />
                  </div>
                  {loadingDestination && (
                    <span className="absolute right-[52px] top-[52px] h-4 w-4 rounded-full border-2 border-[#5CACC4] border-t-transparent animate-spin" />
                  )}
                  {renderAirportSuggestions(destinationSuggestions, "destination")}
                  {/* Right Icon: right 20px, top 48px */}
                  <div className="absolute right-[20px] top-[48px] pointer-events-none">
                    <Image
                      src="/Group 8.png"
                      alt="Destination Dropdown"
                      width={24}
                      height={24}
                      className="w-[24px] h-[24px] object-contain"
                    />
                  </div>
                </div>

                {/* 3. Passengers Div */}
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
                  {/* Right Icon: right 20px, top 48px */}
                  <div className="absolute right-[20px] top-[48px] pointer-events-none">
                    <Image
                      src="/Group 8.png"
                      alt="Passengers Dropdown"
                      width={24}
                      height={24}
                      className={`w-[24px] h-[24px] object-contain transition-transform ${
                        showPassengerModal ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  {/* Custom Passengers Dropdown: 6px gap from input, 340px width, 176px height */}
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

              {/* Row 2: 2 Divs (515px x 88px at 1360px, 10px gap, mt 10px) */}
              <div className="flex items-center gap-[10px] mt-[10px] relative z-20">
                {/* 1. Departure Date Div (Origin Departure Calendar) */}
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
                    <span className={`font-poppins font-normal text-[18px] mt-[7px] underline decoration-[#9BB0BF] underline-offset-2 inline-block ${departureDate ? "text-[#222222] font-medium" : "text-[#8FA0AD]"}`}>
                      {departureDate ? formatDisplayDate(departureDate) : "Enter your departure date"}
                    </span>
                  </div>
                  {/* Right Icon: right 20px, top 48px */}
                  <div className="absolute right-[20px] top-[48px] pointer-events-none z-10">
                    <Image
                      src="/Icon2.png"
                      alt="Calendar"
                      width={24}
                      height={24}
                      className="w-[24px] h-[24px] object-contain"
                    />
                  </div>

                  {/* Custom Calendar Dropdown: 10px gap from input, 395px width, 304px height */}
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
                        if (tripType === "Round Trip" && !returnDate) {
                          setShowRetCalendar(true);
                        }
                      }}
                      className="absolute top-[calc(100%+10px)] right-0 z-50"
                    />
                  )}
                </div>

                {/* 2. Return Date Div */}
                <div
                  ref={retCalendarContainerRef}
                  onClick={() => {
                    if (tripType !== "Round Trip") return;
                    setShowRetCalendar(!showRetCalendar);
                    setShowPassengerModal(false);
                    setShowDepCalendar(false);
                  }}
                  className={`flex-1 h-[88px] bg-[#F3F6F8] rounded-[10px] relative px-[24px] py-[12px] flex flex-col justify-center select-none transition-all duration-200 ${
                    tripType === "Round Trip"
                      ? "opacity-100 cursor-pointer"
                      : "opacity-35 cursor-not-allowed"
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
                    <span className={`font-poppins font-normal text-[18px] mt-[7px] underline decoration-[#9BB0BF] underline-offset-2 inline-block ${returnDate ? "text-[#222222] font-medium" : "text-[#8FA0AD]"}`}>
                      {tripType === "Round Trip" && returnDate
                        ? formatDisplayDate(returnDate)
                        : "Enter your return date"}
                    </span>
                  </div>
                  {/* Right Icon: right 20px, top 48px */}
                  <div className="absolute right-[20px] top-[48px] pointer-events-none z-10">
                    <Image
                      src="/Icon3.png"
                      alt="Calendar"
                      width={24}
                      height={24}
                      className="w-[24px] h-[24px] object-contain"
                    />
                  </div>

                  {/* Custom Return Calendar Dropdown: 10px gap from input, 395px width, 304px height */}
                  {showRetCalendar && tripType === "Round Trip" && (
                    <CalendarDropdown
                      selectedDate={returnDate}
                      minDate={departureDate || new Date().toISOString().split("T")[0]}
                      onSelectDate={(dateStr) => {
                        setReturnDate(dateStr);
                        setShowRetCalendar(false);
                      }}
                      className="absolute top-[calc(100%+10px)] right-0 z-50"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Right Submit Button: Width 112px, Height 185px, Right 32px, Top 38px, Bottom 37px */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="absolute right-[32px] top-[38px] bottom-[37px] w-[112px] h-[185px] bg-[#5CACC4] hover:bg-[#4ea0b8] rounded-[15px] flex flex-col items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
              aria-label="Submit"
            >
              <Image
                src="/send.svg"
                alt="Submit"
                width={32}
                height={32}
                className="w-[32px] h-[32px] object-contain"
              />
              <span className="font-poppins font-bold text-[16px] text-white">
                {submitting ? "..." : "Submit"}
              </span>
            </button>
          </div>

          {/* Responsive Form Card for Tablets & Mobile (< 1200px) */}
          <div className="block xl:hidden w-full bg-white rounded-[20px] sm:rounded-[25px] shadow-[0_20px_50px_rgba(0,0,0,0.12)] p-4 sm:p-6 border border-gray-100">
            <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {/* Origin */}
              <div
                onClick={() => focusVisibleInput(originInputRef, originMobileInputRef)}
                className={`airport-origin bg-[#F3F6F8] rounded-[10px] p-4 relative flex flex-col justify-center min-h-[84px] cursor-text ${
                  originSuggestions.length ? "z-40" : "z-10"
                }`}
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
                  ref={originMobileInputRef}
                  type="text"
                  aria-label="Origin"
                  autoComplete="off"
                  value={originLabel}
                  onChange={(e) => handleAirportChange(e.target.value, "origin")}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setOriginSuggestions([]);
                    if (e.key === "Enter" && originSuggestions[0]) {
                      e.preventDefault();
                      selectAirport(originSuggestions[0], "origin");
                    }
                  }}
                  placeholder="Enter your origin"
                  className="w-[85%] bg-transparent font-poppins text-[16px] text-[#222222] placeholder-[#8FA0AD] mt-2 outline-none border-none p-0 underline decoration-[#9BB0BF] underline-offset-2"
                />
                {loadingOrigin && (
                  <span className="absolute right-12 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-[#5CACC4] border-t-transparent animate-spin" />
                )}
                {renderAirportSuggestions(originSuggestions, "origin")}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Image src="/Icon1.png" alt="Origin" width={22} height={22} />
                </div>
              </div>

              {/* Destination */}
              <div
                onClick={() => focusVisibleInput(destinationInputRef, destinationMobileInputRef)}
                className={`airport-destination bg-[#F3F6F8] rounded-[10px] p-4 relative flex flex-col justify-center min-h-[84px] cursor-text ${
                  destinationSuggestions.length ? "z-40" : "z-10"
                }`}
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
                  ref={destinationMobileInputRef}
                  type="text"
                  aria-label="Destination"
                  autoComplete="off"
                  value={destinationLabel}
                  onChange={(e) => handleAirportChange(e.target.value, "destination")}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setDestinationSuggestions([]);
                    if (e.key === "Enter" && destinationSuggestions[0]) {
                      e.preventDefault();
                      selectAirport(destinationSuggestions[0], "destination");
                    }
                  }}
                  placeholder="Enter your destination"
                  className="w-[85%] bg-transparent font-poppins text-[16px] text-[#222222] placeholder-[#8FA0AD] mt-2 outline-none border-none p-0 underline decoration-[#9BB0BF] underline-offset-2"
                />
                {loadingDestination && (
                  <span className="absolute right-12 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-[#5CACC4] border-t-transparent animate-spin" />
                )}
                {renderAirportSuggestions(destinationSuggestions, "destination")}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Image src="/Group 8.png" alt="Destination" width={22} height={22} />
                </div>
              </div>

              {/* Passengers */}
              <div
                ref={mobilePassengerContainerRef}
                onClick={() => {
                  setShowPassengerModal(!showPassengerModal);
                  setShowDepCalendar(false);
                  setShowRetCalendar(false);
                }}
                className="bg-[#F3F6F8] rounded-[10px] p-4 relative flex flex-col justify-center min-h-[84px] cursor-pointer select-none z-30"
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
                  <Image src="/Group 8.png" alt="Passengers" width={22} height={22} />
                </div>

                {/* Mobile Custom Passengers Dropdown: 6px gap from input, 340px width, 176px height */}
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

              {/* Departure Date */}
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

                {/* Mobile Custom Calendar Dropdown: 10px gap from input, 395px width, 304px height */}
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

              {/* Return Date */}
              <div
                ref={mobileRetCalendarContainerRef}
                onClick={() => {
                  if (tripType !== "Round Trip") return;
                  setShowRetCalendar(!showRetCalendar);
                  setShowPassengerModal(false);
                  setShowDepCalendar(false);
                }}
                className={`bg-[#F3F6F8] rounded-[10px] p-4 relative flex flex-col justify-center min-h-[84px] md:col-span-2 select-none z-10 ${
                  tripType === "Round Trip" ? "opacity-100 cursor-pointer" : "opacity-35 cursor-not-allowed"
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

                {/* Mobile Custom Return Calendar Dropdown: 10px gap from input, 395px width, 304px height */}
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
              className="mt-4 w-full h-[52px] bg-[#5CACC4] hover:bg-[#4ea0b8] text-white font-poppins font-bold rounded-[12px] flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Image src="/send.svg" alt="Submit" width={22} height={22} className="w-[22px] h-[22px] object-contain" />
              <span>{submitting ? "Submitting..." : "Submit"}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSectionNew;
