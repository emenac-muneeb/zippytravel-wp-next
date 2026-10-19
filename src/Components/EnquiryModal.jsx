"use client";
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from "next/navigation";

import api from "../Helpers/apiHelper";
import { showToast } from "../Helpers/Helper";
import { endpoints } from "../Helpers/endpoints";

const FieldLabel = ({ children, required = false }) => (
  <label className="block text-[13px] sm:text-[14px] font-semibold font-quicksand text-[#A57233] mb-1.5">
    {children}
    {required && <span className="text-[#E11D48] ml-0.5">*</span>}
  </label>
);

const IconBox = ({ src, alt }) => (
  <div className="mr-[-15px] bg-white z-10 flex items-center justify-center w-[34px] h-[34px] sm:w-[34px] sm:h-[34px] shrink-0 border rounded-[4px] border-[#A57233] 
  shadow-[0_0px_2 px_rgba(0,0,0,0.06)]">
    <img src={src} alt={alt} className="w-[15px] h-[15px] object-contain" />
  </div>
);

const InputShell = ({ children, className = "" }) => (
  <div
    className={`flex items-center w-full bg-white  overflow-hidden transition-colors ${className}`}
  >
    {children}
  </div>
);

const parseStoredDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const EnquiryModal = ({ setEnquiryOpen, onClose }) => {
  const closeModal = () => {
    if (typeof onClose === "function") onClose();
    else if (typeof setEnquiryOpen === "function") setEnquiryOpen(false);
  };

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [addNote, setAddNote] = useState("");
  const [addAnswer, setAddAnswer] = useState(null);
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [pageURL, setPageURL] = useState("");
  const [userIp, setUserIp] = useState("");
  const [parsedData, setParsedData] = useState({});
  const [departureDate, setDepartureDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);

  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPageURL(window.location.href);
      const data = JSON.parse(localStorage.getItem("flightFormData") || "{}");
      setParsedData(data);
      setDepartureDate(parseStoredDate(data.departureDate));
      setReturnDate(parseStoredDate(data.returnDate));
    }
  }, []);

  useEffect(() => {
    generateCaptcha();
  }, []);

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
    if (returnDate && departureDate && returnDate <= departureDate) {
      setReturnDate(null);
    }
  }, [departureDate]);

  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    setCaptchaQuestion(`${a}+${b}`);
    setAddAnswer(a + b);
    setUserInput("");
  };

  const {
    originLabel: storedOriginLabel = "",
    destinationLabel: storedDestinationLabel = "",
    destinationCity = "",
    destinationCountry = "",
    selectedClass: storedClass = "",
    adults = 1,
    children = 0,
    infants = 0,
  } = parsedData;

  const destinationTitle = (() => {
    if (destinationCity && destinationCountry) {
      return `Flight To ${destinationCity}, ${destinationCountry}`;
    }
    if (destinationCity) return `Flight To ${destinationCity}`;
    if (storedDestinationLabel) {
      const city = storedDestinationLabel.replace(/\s*\([^)]*\)\s*$/, "").trim();
      return city ? `Flight To ${city}` : "Flight Enquiry";
    }
    return "Flight Enquiry";
  })();

  const fullName = [firstName, middleName, lastName].filter(Boolean).join(" ").trim();

  const handleSubmit = async () => {
    setLoading(true);

    if (!firstName || !lastName || !contact || !email || !userInput) {
      showToast("Please fill all required fields.", "info");
      setLoading(false);
      return;
    }

    if (!agreed) {
      showToast("Please agree to the terms and conditions.", "info");
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
      name: fullName,
      email,
      contact,
      contact_detail: {
        subject: "Product Inquiry",
        message: addNote || "I would like to know more About your Services.",
        Inquiry: "Airline Inquiry Form",
        user_ip: userIp,
        origin: storedOriginLabel,
        destination: storedDestinationLabel,
        DepartureDate: departureDate ? departureDate.toISOString().split("T")[0] : "",
        Return: returnDate ? returnDate.toISOString().split("T")[0] : "",
        Class: storedClass,
        adults,
        children,
        infants,
        pageURL,
      },
    };

    try {
      const { data } = await api.post(endpoints.sendEmail, payload);
      if (data.status === 1) {
        router.push("/thankyou.html");
        setTimeout(() => closeModal(), 3000);
        setLoading(false);
      } else {
        showToast("Something went wrong. Please Try Again.", "error");
        setLoading(false);
      }
    } catch (err) {
      console.error("Submission Error:", err);
      showToast("Server Error occurred. Please Try Again later.", "error");
      setLoading(false);
    }
  };

  const inputClass =
    "w-full h-[48px] sm:h-[48px] px-3 pl-6 outline-none bg-transparent text-[14px] font-quicksand text-[#2a211c] placeholder:text-[#A9A3AF] placeholder:font-medium border rounded-[7px] border-[#A57233]";

  return (
    <div className="w-full bg-[#FFF9F4]  overflow-y-auto font-quicksand border border-[#A57233] rounded-[15px] relative
    before:content-[''] before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-[239px] before:h-[4px] 
    before:bg-[#F1A868] before:z-[1]
    after:content-[''] after:absolute after:top-[8px] after:left-1/2 after:-translate-x-1/2 after:w-[239px] after:h-[1px] 
    after:bg-[#F1A868] after:z-[1]">
      <style>{`
        .enquiry-datepicker .react-datepicker-wrapper {
          width: 100%;
        }
        .enquiry-datepicker .react-datepicker__input-container,
        .enquiry-datepicker .react-datepicker__input-container input {
          width: 100%;
        }
      `}</style>
      <div className="relative p-5 sm:p-8
      before:content-[''] before:absolute before:bottom-0 before:left-1/2 before:-translate-x-1/2 before:w-[239px] before:h-[4px] 
      before:bg-[#F1A868] before:z-[1]
      after:content-[''] after:absolute after:bottom-[8px] after:left-1/2 after:-translate-x-1/2 after:w-[239px] after:h-[1px] 
      after:bg-[#F1A868] after:z-[1]">
        <h2 className="text-center text-[20px] sm:text-[24px] font-semibold text-[#4C4C4C] mb-6 sm:mb-8">
          {destinationTitle}
        </h2>

        <div className="enquiry-datepicker w-full max-w-4xl mx-auto space-y-4 sm:space-y-5">
          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel>Departure date</FieldLabel>
              <InputShell>
                <IconBox src="/media/fr-svgs/calander.svg" alt="Calendar" />
                <div className="w-full">
                  <DatePicker
                    placeholderText="Select Departure Date"
                    selected={departureDate}
                    onChange={(date) => setDepartureDate(date)}
                    minDate={new Date()}
                    dateFormat="dd/MM/yyyy"
                    className={inputClass}
                    wrapperClassName="w-full"
                  />
                </div>
              </InputShell>
            </div>
            <div>
              <FieldLabel>Return Date</FieldLabel>
              <InputShell>
                <IconBox src="/media/fr-svgs/calander.svg" alt="Calendar" />
                <DatePicker
                  placeholderText="Select Return Date"
                  selected={returnDate}
                  onChange={(date) => setReturnDate(date)}
                  minDate={
                    departureDate
                      ? new Date(departureDate.getTime() + 86400000)
                      : new Date()
                  }
                  dateFormat="dd/MM/yyyy"
                  className={inputClass}
                  wrapperClassName="w-full"
                />
              </InputShell>
            </div>
          </div>

          {/* Passenger Name */}
          <div>
            <FieldLabel required>Passenger Name</FieldLabel>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <InputShell>
                <IconBox src="/media/fr-svgs/user.svg" alt="User" />
                <input
                  className={inputClass}
                  value={firstName}
                  placeholder="First Name"
                  onChange={(e) =>
                    setFirstName(e.target.value.replace(/[^a-zA-Z\s]/g, ""))
                  }
                />
              </InputShell>
              <InputShell>
                <input
                  className={inputClass}
                  value={middleName}
                  placeholder="Middle Name"
                  onChange={(e) =>
                    setMiddleName(e.target.value.replace(/[^a-zA-Z\s]/g, ""))
                  }
                />
              </InputShell>
              <InputShell>
                <input
                  className={inputClass}
                  value={lastName}
                  placeholder="Last Name"
                  onChange={(e) =>
                    setLastName(e.target.value.replace(/[^a-zA-Z\s]/g, ""))
                  }
                />
              </InputShell>
            </div>
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Phone Number</FieldLabel>
              <InputShell>
                <IconBox src="/media/fr-svgs/phonenumber.svg" alt="Phone" />
                <input
                  className={inputClass}
                  value={contact}
                  placeholder="Type your contact number"
                  onChange={(e) =>
                    setContact(e.target.value.replace(/[^0-9]/g, ""))
                  }
                />
              </InputShell>
            </div>
            <div>
              <FieldLabel required>Email Address</FieldLabel>
              <InputShell>
                <IconBox src="/media/fr-svgs/email.svg" alt="Email" />
                <input
                  type="email"
                  className={inputClass}
                  value={email}
                  placeholder="Type your email address"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </InputShell>
            </div>
          </div>

          {/* Message */}
          <div>
            <FieldLabel>Type Message</FieldLabel>
            <InputShell>
              <IconBox src="/media/fr-svgs/writeicon.svg" alt="Message" />
              <input
                className={inputClass}
                value={addNote}
                placeholder="Type Message..."
                onChange={(e) => setAddNote(e.target.value)}
              />
            </InputShell>
          </div>

          {/* Captcha + Submit */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr] gap-4 items-end">
            <div>
              <FieldLabel>Answer</FieldLabel>
              <InputShell className="relative">
                <IconBox src="/media/fr-svgs/calander.svg" alt="Answer" />
                <input
                  className={inputClass}
                  value={userInput}
                  placeholder="Select Answer"
                  onChange={(e) =>
                    setUserInput(e.target.value.replace(/[^0-9]/g, ""))
                  }
                />
                <span className="pr-4 text-[14px] font-semibold text-[#A57233] whitespace-nowrap absolute right-0 top-[50%] -translate-y-1/2">
                  {captchaQuestion}
                </span>
              </InputShell>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className={`h-[44px] sm:h-[48px] px-6 sm:px-8 rounded-[10px] bg-[#A57233] text-white text-[15px] sm:text-[16px] font-semibold font-quicksand flex items-center justify-center gap-2.5 hover:bg-[#8f622c] transition-colors ${loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
            >
              {loading ? "Submitting..." : "Send Message"}
              {!loading && (
                <img src="/media/fr-svgs/send.svg" alt="" className="w-[16px] h-[16px]" />
              )}
            </button>
          </div>

          {/* Terms */}
          <div className="flex items-start gap-3 pt-1">
            <button
              type="button"
              onClick={() => setAgreed((prev) => !prev)}
              className={`mt-0.5 w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center shrink-0 transition-colors ${agreed
                ? "bg-[#F1A868] border-[#F1A868]"
                : "bg-white border-[#D9CFC0]"
                }`}
              aria-pressed={agreed}
              aria-label="Agree to terms"
            >
              {agreed && (
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              )}
            </button>
            <p className="text-[12px] sm:text-[13px] leading-relaxed text-[#000] font-quicksand">
              By checking this box you confirm that you have read and agreed to
              the terms and conditions of Brightsun Travel (UK) Ltd. T/A Emenac
              Travel. It is the passengers responsibility to ensure that all the
              details of the booking is correct prior to confirming.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnquiryModal;
