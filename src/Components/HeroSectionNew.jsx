"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { showToast } from "../Helpers/Helper";

const HeroSectionNew = ({ setFlightLoading, setPopupMessage }) => {
  const router = useRouter();

  // Tab state: "One-Way" or "Round Trip"
  const [tripType, setTripType] = useState("One-Way");

  // Form states
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  // Passengers popover state
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);

  // Hidden date and input refs
  const originInputRef = useRef(null);
  const destinationInputRef = useRef(null);
  const departureDateInputRef = useRef(null);
  const returnDateInputRef = useRef(null);
  const passengerModalRef = useRef(null);

  // Close passenger dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        passengerModalRef.current &&
        !passengerModalRef.current.contains(e.target)
      ) {
        setShowPassengerModal(false);
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

  const handleSearch = (e) => {
    if (e) e.preventDefault();

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

    const queryParams = new URLSearchParams({
      TripType: tripType === "Round Trip" ? "Round-Trip" : "One-Way",
      Origin: origin.trim(),
      Originlabel: origin.trim(),
      Destination: destination.trim(),
      Destinationlabel: destination.trim(),
      DepartDate: departureDate,
      ArrivalDate: tripType === "Round Trip" ? returnDate : "",
      Class: "Business",
      NoOfAdultPax: adults,
      NoOfChildPax: children,
      NoOfInfantPax: infants,
    });

    if (typeof setFlightLoading === "function") setFlightLoading(true);
    router.push(`/flightDetails?${queryParams.toString()}`);
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
            Background Image: BG Banner.png
            Direct img tag with URL-encoded fallback so it is 100% visible,
            never blocked behind parent background or Next.js optimizer errors.
          */}
          <img
            src="/BG%20Banner.png"
            onError={(e) => {
              e.currentTarget.src = "/bg-banner.png";
            }}
            alt="Zippy Travel Hero Banner"
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-0"
          />

          {/* Subtle contrast overlay to enhance text readability */}
          <div className="absolute inset-0 bg-black/25 pointer-events-none z-[1]" />

          {/* Centered Text Content (Max 1360px container) */}
          <div className="w-full max-w-[1360px] mx-auto text-center pt-[70px] sm:pt-[90px] lg:pt-[107px] px-4 relative z-10">
            {/* Text 1: — Zippy Travel (Poppins 24px, 400) */}
            <p className="font-poppins font-normal text-[18px] sm:text-[22px] lg:text-[24px] text-white tracking-wide">
              — Zippy Travel
            </p>

            {/* Text 2: London-Based UK Agency (Poppins 83px, 700) */}
            <h1 className="mt-[8px] font-poppins font-bold text-[36px] sm:text-[54px] md:text-[68px] lg:text-[83px] text-white tracking-tight leading-[1.08] drop-shadow-sm">
              London-Based UK Agency
            </h1>

            {/* Text 3: Description (Poppins 24px, 500) */}
            <p className="mt-[24px] sm:mt-[32px] lg:mt-[40px] font-poppins font-medium text-[16px] sm:text-[20px] lg:text-[24px] text-white/95 max-w-[850px] mx-auto leading-relaxed">
              Zippytravel.co.uk is an e-commerce UK based company
              <br className="hidden sm:inline" />
              {" "}offering online travel products and services.
            </p>
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
                  onClick={() => setShowPassengerModal(!showPassengerModal)}
                  className="flex-1 h-[88px] bg-[#F3F6F8] rounded-[10px] relative px-[24px] py-[12px] flex flex-col justify-center cursor-pointer select-none"
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
                      Passengers
                    </span>
                    <span className="font-poppins font-normal text-[18px] text-[#8FA0AD] mt-[7px] truncate underline decoration-[#9BB0BF] underline-offset-2 inline-block">
                      {passengerDisplayText}
                    </span>
                  </div>
                  {/* Right Icon: right 20px, top 48px */}
                  <div className="absolute right-[20px] top-[48px]">
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
                </div>
              </div>

              {/* Row 2: 2 Divs (515px x 88px at 1360px, 10px gap, mt 10px) */}
              <div className="flex items-center gap-[10px] mt-[10px]">
                {/* 1. Departure Date Div (Origin Departure Calendar) */}
                <div
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
                  {/* Full-coverage native date input — opens calendar on ANY click reliably */}
                  <input
                    ref={departureDateInputRef}
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    aria-label="Departure Date"
                  />
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
                </div>

                {/* 2. Return Date Div */}
                <div
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
                  {/* Full-coverage native date input for Return Date */}
                  <input
                    ref={returnDateInputRef}
                    type="date"
                    min={departureDate || new Date().toISOString().split("T")[0]}
                    value={returnDate}
                    disabled={tripType !== "Round Trip"}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 disabled:cursor-not-allowed disabled:pointer-events-none"
                    aria-label="Return Date"
                  />
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
                </div>
              </div>
            </div>

            {/* Right Search Button: Width 112px, Height 185px, Right 32px, Top 38px, Bottom 37px */}
            <button
              type="button"
              onClick={handleSearch}
              className="absolute right-[32px] top-[38px] bottom-[37px] w-[112px] h-[185px] bg-[#5CACC4] hover:bg-[#4ea0b8] rounded-[15px] flex items-center justify-center transition-all cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.99]"
              aria-label="Search Flights"
            >
              <Image
                src="/Icon.png"
                alt="Search"
                width={32}
                height={32}
                className="w-[32px] h-[32px] object-contain"
              />
            </button>
          </div>

          {/* Responsive Form Card for Tablets & Mobile (< 1200px) */}
          <div className="block xl:hidden w-full bg-white rounded-[20px] sm:rounded-[25px] shadow-[0_20px_50px_rgba(0,0,0,0.12)] p-4 sm:p-6 border border-gray-100">
            <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {/* Origin */}
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
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="Enter your origin"
                  className="bg-transparent font-poppins text-[16px] text-[#222222] placeholder-[#8FA0AD] mt-2 outline-none border-none p-0 underline decoration-[#9BB0BF] underline-offset-2"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Image src="/Icon1.png" alt="Origin" width={22} height={22} />
                </div>
              </div>

              {/* Destination */}
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
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Enter your destination"
                  className="bg-transparent font-poppins text-[16px] text-[#222222] placeholder-[#8FA0AD] mt-2 outline-none border-none p-0 underline decoration-[#9BB0BF] underline-offset-2"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Image src="/Group 8.png" alt="Destination" width={22} height={22} />
                </div>
              </div>

              {/* Passengers */}
              <div
                onClick={() => setShowPassengerModal(!showPassengerModal)}
                className="bg-[#F3F6F8] rounded-[10px] p-4 relative flex flex-col justify-center min-h-[84px] cursor-pointer select-none"
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
                  Passengers
                </span>
                <span className="font-poppins text-[16px] text-[#8FA0AD] mt-2 truncate underline decoration-[#9BB0BF] underline-offset-2 inline-block">
                  {passengerDisplayText}
                </span>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Image src="/Group 8.png" alt="Passengers" width={22} height={22} />
                </div>
              </div>

              {/* Departure Date */}
              <div
                className="bg-[#F3F6F8] rounded-[10px] p-4 relative flex flex-col justify-center min-h-[84px] cursor-pointer select-none"
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
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  aria-label="Departure Date"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                  <Image src="/Icon2.png" alt="Departure Date" width={22} height={22} />
                </div>
              </div>

              {/* Return Date */}
              <div
                className={`bg-[#F3F6F8] rounded-[10px] p-4 relative flex flex-col justify-center min-h-[84px] md:col-span-2 select-none ${
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
                <input
                  type="date"
                  min={departureDate || new Date().toISOString().split("T")[0]}
                  value={returnDate}
                  disabled={tripType !== "Round Trip"}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 disabled:cursor-not-allowed disabled:pointer-events-none"
                  aria-label="Return Date"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                  <Image src="/Icon3.png" alt="Return Date" width={22} height={22} />
                </div>
              </div>
            </div>

            {/* Mobile Search Button */}
            <button
              type="button"
              onClick={handleSearch}
              className="mt-4 w-full h-[52px] bg-[#5CACC4] hover:bg-[#4ea0b8] text-white font-poppins font-bold rounded-[12px] flex items-center justify-center gap-2 shadow-md"
            >
              <Image src="/Icon.png" alt="Search" width={22} height={22} />
              <span>Search Flights</span>
            </button>
          </div>

          {/* Passenger Counter Modal Popover */}
          {showPassengerModal && (
            <div
              ref={passengerModalRef}
              className="absolute right-4 xl:right-[150px] top-[140px] z-50 w-[300px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 font-poppins"
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                <span className="font-semibold text-[16px] text-[#1F0060]">Select Passengers</span>
                <button
                  type="button"
                  onClick={() => setShowPassengerModal(false)}
                  className="text-gray-400 hover:text-black font-bold text-lg"
                >
                  ✕
                </button>
              </div>

              {/* Adults */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-[15px] text-[#222]">Adults</p>
                  <p className="text-[12px] text-gray-400">12+ years</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center font-bold text-gray-600 hover:border-[#5CACC4] hover:text-[#5CACC4]"
                  >
                    -
                  </button>
                  <span className="font-semibold w-5 text-center">{adults}</span>
                  <button
                    type="button"
                    onClick={() => setAdults(Math.min(9, adults + 1))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center font-bold text-gray-600 hover:border-[#5CACC4] hover:text-[#5CACC4]"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-[15px] text-[#222]">Children</p>
                  <p className="text-[12px] text-gray-400">2 - 11 years</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setChildren(Math.max(0, children - 1))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center font-bold text-gray-600 hover:border-[#5CACC4] hover:text-[#5CACC4]"
                  >
                    -
                  </button>
                  <span className="font-semibold w-5 text-center">{children}</span>
                  <button
                    type="button"
                    onClick={() => setChildren(Math.min(9, children + 1))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center font-bold text-gray-600 hover:border-[#5CACC4] hover:text-[#5CACC4]"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Infants */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-[15px] text-[#222]">Infants</p>
                  <p className="text-[12px] text-gray-400">&lt; 2 years</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setInfants(Math.max(0, infants - 1))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center font-bold text-gray-600 hover:border-[#5CACC4] hover:text-[#5CACC4]"
                  >
                    -
                  </button>
                  <span className="font-semibold w-5 text-center">{infants}</span>
                  <button
                    type="button"
                    onClick={() => setInfants(Math.min(adults, infants + 1))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center font-bold text-gray-600 hover:border-[#5CACC4] hover:text-[#5CACC4]"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPassengerModal(false)}
                className="mt-4 w-full py-2 bg-[#5CACC4] text-white rounded-lg font-bold text-[14px] hover:bg-[#4ea0b8] transition-colors"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSectionNew;
