"use client";
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import PassengerForm from './PassengerForm';
import api from '../Helpers/apiHelper';
import { peekFlightPrice, scheduleClearFlightPrice } from '../Helpers/flightPriceCache';
import { BASE_URL_IMG } from "../Helpers/imageurl";
import LoadingScreen from './LoadingScreen';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import toast from 'react-hot-toast';
import PopUp from './PopUp';
import CallbackPopup from './CallbackPopup';

const BookingProgressTabs = () => {

    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [flightPriceRes, setFlightPriceRes] = useState(null);
    // console.log("Res", flightPriceRes)
    const [navigateOnClose, setNavigateOnClose] = useState(false);
    const [popupMessage, setPopupMessage] = useState(null);
    const [PayNowLoading, setPayNowLoading] = useState(false);
    const [isCodeOpen, setIsCodeOpen] = useState(false);
    const [selectedCode, setSelectedCode] = useState(null);
    const [dialingCode, setDialingCode] = useState('');
    const [addAnswer, setAddAnswer] = useState(null);
    const [captchaQuestion, setCaptchaQuestion] = useState('');
    const [userInput, setUserInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [showPopup, setShowPopup] = useState(false);
    const priceFetchKeyRef = useRef("");

    const [emailVerified, setEmailVerified] = useState(false);
    const [VerifyOpen, setVerifyOpen] = useState(false)
    const [VerifyCode, setVerifyCode] = useState(["", "", "", "", "", ""]);

    const priceCacheKeyParts = {
        Key: searchParams.get("Key") || "",
        token: searchParams.get("token") || "",
        OutBoundKey: searchParams.get("OutBoundKey") || "",
        InboundKey: searchParams.get("InboundKey") || "",
    };
    const priceRequestKey = [
        priceCacheKeyParts.Key,
        priceCacheKeyParts.token,
        priceCacheKeyParts.OutBoundKey,
        priceCacheKeyParts.InboundKey,
        searchParams.get("OptionKeyList") || "",
        searchParams.get("TripType") || "",
        searchParams.get("supp") || "",
        searchParams.get("NoOfAdultPax") || "",
        searchParams.get("NoOfChildPax") || "",
        searchParams.get("NoOfYouthPax") || "",
    ].join("|");

    useLayoutEffect(() => {
        if (!priceCacheKeyParts.Key && !priceCacheKeyParts.token) return;
        if (priceFetchKeyRef.current === priceRequestKey) return;

        const cached = peekFlightPrice(priceCacheKeyParts);
        if (!cached) return;

        priceFetchKeyRef.current = priceRequestKey;
        setFlightPriceRes(cached);
        setLoading(false);
        scheduleClearFlightPrice(priceCacheKeyParts);
    }, [priceRequestKey]);

    useEffect(() => {
        if (priceFetchKeyRef.current === priceRequestKey) return;
        if (!searchParams.get("Key") && !searchParams.get("token")) {
            setLoading(false);
            return;
        }

        const cached = peekFlightPrice(priceCacheKeyParts);
        if (cached) {
            priceFetchKeyRef.current = priceRequestKey;
            setFlightPriceRes(cached);
            setLoading(false);
            scheduleClearFlightPrice(priceCacheKeyParts);
            return;
        }

        const optionKeyListRaw = searchParams.get("OptionKeyList");
        const OptionKeyList = optionKeyListRaw ? optionKeyListRaw.split(",") : [];

        const payload = {
            Key: searchParams.get("Key"),
            TripType: searchParams.get("TripType"),
            InboundKey: searchParams.get("InboundKey"),
            OutBoundKey: searchParams.get("OutBoundKey"),
            token: searchParams.get("token"),
            supp: searchParams.get("supp"),
            IsFlexibleDate: searchParams.get("IsFlexibleDate") === "true",
            OptionKeyList,
            NoOfAdultPax: searchParams.get("NoOfAdultPax"),
            NoOfChildPax: searchParams.get("NoOfChildPax"),
            NoOfYouthPax: searchParams.get("NoOfYouthPax"),
            AccountCode: "BS6593",
            CompanyCode: "BS6593",
            WebsiteName: "zippytravel.co.uk",
            ApplicationAccessMode: "LIVE",
            username: "BS6593",
            password: "#Bs65@93z1pPyTrAvEl_Live"
        };

        const controller = new AbortController();
        let cancelled = false;
        priceFetchKeyRef.current = priceRequestKey;

        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await api.post("/flightprice", payload, { signal: controller.signal });
                if (cancelled) return;
                setFlightPriceRes(res.data);
            } catch (err) {
                if (cancelled || err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;
                console.error("Reload API Error:", err);
                priceFetchKeyRef.current = "";
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchData();

        return () => {
            cancelled = true;
            controller.abort();
            // Allow Strict Mode remount / retry after abort
            if (priceFetchKeyRef.current === priceRequestKey) {
                priceFetchKeyRef.current = "";
            }
        };
    }, [priceRequestKey]);

    useEffect(() => {
        generateCaptcha();
    }, []);

    const generateCaptcha = () => {
        const a = Math.floor(Math.random() * 9) + 1;
        const b = Math.floor(Math.random() * 9) + 1;
        setCaptchaQuestion(`${a} + ${b}`);
        setAddAnswer(a + b);
        setUserInput("");
    };

    const [selectedOption, setSelectedOption] = useState(null);
    const [activeStep, setActiveStep] = useState(1);
    const steps = [
        { id: 1, title: 'Select Flight' },
        { id: 2, title: 'Passenger Details' },
        { id: 3, title: 'Payment' },
        { id: 4, title: 'Confirmation' }
    ];

    const countryCodes = [
        { "country": "UK", "dial_code": "+44" },
        { "country": "Canada", "dial_code": "+1" },
        { "country": "Algeria", "dial_code": "+213" },
        { "country": "Andorra", "dial_code": "+376" },
        { "country": "Angola", "dial_code": "+244" },
        { "country": "Anguilla", "dial_code": "+1264" },
        { "country": "Antigua & Barbuda", "dial_code": "+1268" },
        { "country": "Argentina", "dial_code": "+54" },
        { "country": "Armenia", "dial_code": "+374" },
        { "country": "Aruba", "dial_code": "+297" },
        { "country": "Australia", "dial_code": "+61" },
        { "country": "Austria", "dial_code": "+43" },
        { "country": "Azerbaijan", "dial_code": "+994" },
        { "country": "Bahamas", "dial_code": "+1242" },
        { "country": "Bahrain", "dial_code": "+973" },
        { "country": "Bangladesh", "dial_code": "+880" },
        { "country": "Barbados", "dial_code": "+1246" },
        { "country": "Belarus", "dial_code": "+375" },
        { "country": "Belgium", "dial_code": "+32" },
        { "country": "Belize", "dial_code": "+501" },
        { "country": "Benin", "dial_code": "+229" },
        { "country": "Bermuda", "dial_code": "+1441" },
        { "country": "Bhutan", "dial_code": "+975" },
        { "country": "Bolivia", "dial_code": "+591" },
        { "country": "Bosnia Herzegovina", "dial_code": "+387" },
        { "country": "Botswana", "dial_code": "+267" },
        { "country": "Brazil", "dial_code": "+55" },
        { "country": "Brunei", "dial_code": "+673" },
        { "country": "Bulgaria", "dial_code": "+359" },
        { "country": "Burkina Faso", "dial_code": "+226" },
        { "country": "Burundi", "dial_code": "+257" },
        { "country": "Cambodia", "dial_code": "+855" },
        { "country": "Cameroon", "dial_code": "+237" },
        { "country": "Cape Verde Islands", "dial_code": "+238" },
        { "country": "Cayman Islands", "dial_code": "+1345" },
        { "country": "Central African Republic", "dial_code": "+236" },
        { "country": "Chile", "dial_code": "+56" },
        { "country": "China", "dial_code": "+86" },
        { "country": "Colombia", "dial_code": "+57" },
        { "country": "Mayotte", "dial_code": "+269" },
        { "country": "Congo", "dial_code": "+242" },
        { "country": "Cook Islands", "dial_code": "+682" },
        { "country": "Costa Rica", "dial_code": "+506" },
        { "country": "Croatia", "dial_code": "+385" },
        { "country": "Cuba", "dial_code": "+53" },
        { "country": "Cyprus North", "dial_code": "+90392" },
        { "country": "Cyprus South", "dial_code": "+357" },
        { "country": "Czech Republic", "dial_code": "+42" },
        { "country": "Denmark", "dial_code": "+45" },
        { "country": "Djibouti", "dial_code": "+253" },
        { "country": "Dominican Republic", "dial_code": "+1809" },
        { "country": "Ecuador", "dial_code": "+593" },
        { "country": "Egypt", "dial_code": "+20" },
        { "country": "El Salvador", "dial_code": "+503" },
        { "country": "Equatorial Guinea", "dial_code": "+240" },
        { "country": "Eritrea", "dial_code": "+291" },
        { "country": "Estonia", "dial_code": "+372" },
        { "country": "Ethiopia", "dial_code": "+251" },
        { "country": "Falkland Islands", "dial_code": "+500" },
        { "country": "Faroe Islands", "dial_code": "+298" },
        { "country": "Fiji", "dial_code": "+679" },
        { "country": "Finland", "dial_code": "+358" },
        { "country": "France", "dial_code": "+33" },
        { "country": "French Guiana", "dial_code": "+594" },
        { "country": "French Polynesia", "dial_code": "+689" },
        { "country": "Gabon", "dial_code": "+241" },
        { "country": "Gambia", "dial_code": "+220" },
        { "country": "Georgia", "dial_code": "+7880" },
        { "country": "Germany", "dial_code": "+49" },
        { "country": "Ghana", "dial_code": "+233" },
        { "country": "Gibraltar", "dial_code": "+350" },
        { "country": "Greece", "dial_code": "+30" },
        { "country": "Greenland", "dial_code": "+299" },
        { "country": "Grenada", "dial_code": "+1473" },
        { "country": "Guadeloupe", "dial_code": "+590" },
        { "country": "Guam", "dial_code": "+671" },
        { "country": "Guatemala", "dial_code": "+502" },
        { "country": "Guinea", "dial_code": "+224" },
        { "country": "Guinea - Bissau", "dial_code": "+245" },
        { "country": "Guyana", "dial_code": "+592" },
        { "country": "Haiti", "dial_code": "+509" },
        { "country": "Honduras", "dial_code": "+504" },
        { "country": "Hong Kong", "dial_code": "+852" },
        { "country": "Hungary", "dial_code": "+36" },
        { "country": "Iceland", "dial_code": "+354" },
        { "country": "India", "dial_code": "+91" },
        { "country": "Indonesia", "dial_code": "+62" },
        { "country": "Iran", "dial_code": "+98" },
        { "country": "Iraq", "dial_code": "+964" },
        { "country": "Ireland", "dial_code": "+353" },
        { "country": "Israel", "dial_code": "+972" },
        { "country": "Italy", "dial_code": "+39" },
        { "country": "Jamaica", "dial_code": "+1876" },
        { "country": "Japan", "dial_code": "+81" },
        { "country": "Jordan", "dial_code": "+962" },
        { "country": "Uzbekistan", "dial_code": "+7" },
        { "country": "Kenya", "dial_code": "+254" },
        { "country": "Kiribati", "dial_code": "+686" },
        { "country": "Korea North", "dial_code": "+850" },
        { "country": "Korea South", "dial_code": "+82" },
        { "country": "Kuwait", "dial_code": "+965" },
        { "country": "Kyrgyzstan", "dial_code": "+996" },
        { "country": "Laos", "dial_code": "+856" },
        { "country": "Latvia", "dial_code": "+371" },
        { "country": "Lebanon", "dial_code": "+961" },
        { "country": "Lesotho", "dial_code": "+266" },
        { "country": "Liberia", "dial_code": "+231" },
        { "country": "Libya", "dial_code": "+218" },
        { "country": "Liechtenstein", "dial_code": "+417" },
        { "country": "Lithuania", "dial_code": "+370" },
        { "country": "Luxembourg", "dial_code": "+352" },
        { "country": "Macao", "dial_code": "+853" },
        { "country": "Macedonia", "dial_code": "+389" },
        { "country": "Madagascar", "dial_code": "+261" },
        { "country": "Malawi", "dial_code": "+265" },
        { "country": "Malaysia", "dial_code": "+60" },
        { "country": "Maldives", "dial_code": "+960" },
        { "country": "Mali", "dial_code": "+223" },
        { "country": "Malta", "dial_code": "+356" },
        { "country": "Marshall Islands", "dial_code": "+692" },
        { "country": "Martinique", "dial_code": "+596" },
        { "country": "Mauritania", "dial_code": "+222" },
        { "country": "Mexico", "dial_code": "+52" },
        { "country": "Micronesia", "dial_code": "+691" },
        { "country": "Moldova", "dial_code": "+373" },
        { "country": "Monaco", "dial_code": "+377" },
        { "country": "Mongolia", "dial_code": "+976" },
        { "country": "Montserrat", "dial_code": "+1664" },
        { "country": "Morocco", "dial_code": "+212" },
        { "country": "Mozambique", "dial_code": "+258" },
        { "country": "Myanmar", "dial_code": "+95" },
        { "country": "Namibia", "dial_code": "+264" },
        { "country": "Nauru", "dial_code": "+674" },
        { "country": "Nepal", "dial_code": "+977" },
        { "country": "Netherlands", "dial_code": "+31" },
        { "country": "New Caledonia", "dial_code": "+687" },
        { "country": "New Zealand", "dial_code": "+64" },
        { "country": "Nicaragua", "dial_code": "+505" },
        { "country": "Niger", "dial_code": "+227" },
        { "country": "Nigeria", "dial_code": "+234" },
        { "country": "Niue", "dial_code": "+683" },
        { "country": "Norfolk Islands", "dial_code": "+672" },
        { "country": "Northern Marianas", "dial_code": "+670" },
        { "country": "Norway", "dial_code": "+47" },
        { "country": "Oman", "dial_code": "+968" },
        { "country": "Pakistan", "dial_code": "+92" },
        { "country": "Palau", "dial_code": "+680" },
        { "country": "Panama", "dial_code": "+507" },
        { "country": "Papua New Guinea", "dial_code": "+675" },
        { "country": "Paraguay", "dial_code": "+595" },
        { "country": "Peru", "dial_code": "+51" },
        { "country": "Philippines", "dial_code": "+63" },
        { "country": "Poland", "dial_code": "+48" },
        { "country": "Portugal", "dial_code": "+351" },
        { "country": "Puerto Rico", "dial_code": "+1787" },
        { "country": "Qatar", "dial_code": "+974" },
        { "country": "Reunion", "dial_code": "+262" },
        { "country": "Romania", "dial_code": "+40" },
        { "country": "Rwanda", "dial_code": "+250" },
        { "country": "San Marino", "dial_code": "+378" },
        { "country": "Sao Tome & Principe", "dial_code": "+239" },
        { "country": "Saudi Arabia", "dial_code": "+966" },
        { "country": "Senegal", "dial_code": "+221" },
        { "country": "Serbia", "dial_code": "+381" },
        { "country": "Seychelles", "dial_code": "+248" },
        { "country": "Sierra Leone", "dial_code": "+232" },
        { "country": "Singapore", "dial_code": "+65" },
        { "country": "Slovak Republic", "dial_code": "+421" },
        { "country": "Slovenia", "dial_code": "+386" },
        { "country": "Solomon Islands", "dial_code": "+677" },
        { "country": "Somalia", "dial_code": "+252" },
        { "country": "South Africa", "dial_code": "+27" },
        { "country": "Spain", "dial_code": "+34" },
        { "country": "Sri Lanka", "dial_code": "+94" },
        { "country": "St. Helena", "dial_code": "+290" },
        { "country": "St. Kitts", "dial_code": "+1869" },
        { "country": "St. Lucia", "dial_code": "+1758" },
        { "country": "Sudan", "dial_code": "+249" },
        { "country": "Suriname", "dial_code": "+597" },
        { "country": "Swaziland", "dial_code": "+268" },
        { "country": "Sweden", "dial_code": "+46" },
        { "country": "Switzerland", "dial_code": "+41" },
        { "country": "Syria", "dial_code": "+963" },
        { "country": "Taiwan", "dial_code": "+886" },
        { "country": "Thailand", "dial_code": "+66" },
        { "country": "Togo", "dial_code": "+228" },
        { "country": "Tonga", "dial_code": "+676" },
        { "country": "Trinidad & Tobago", "dial_code": "+1868" },
        { "country": "Tunisia", "dial_code": "+216" },
        { "country": "Turkey", "dial_code": "+90" },
        { "country": "Turkmenistan", "dial_code": "+993" },
        { "country": "Turks & Caicos Islands", "dial_code": "+1649" },
        { "country": "Tuvalu", "dial_code": "+688" },
        { "country": "Uganda", "dial_code": "+256" },
        { "country": "Ukraine", "dial_code": "+380" },
        { "country": "United Arab Emirates", "dial_code": "+971" },
        { "country": "Uruguay", "dial_code": "+598" },
        { "country": "Vanuatu", "dial_code": "+678" },
        { "country": "Vatican City", "dial_code": "+379" },
        { "country": "Venezuela", "dial_code": "+58" },
        { "country": "Virgin Islands - US", "dial_code": "+1340" },
        { "country": "Wallis & Futuna", "dial_code": "+681" },
        { "country": "Yemen (North)", "dial_code": "+969" },
        { "country": "Yemen (South)", "dial_code": "+967" },
        { "country": "Zambia", "dial_code": "+260" },
        { "country": "Zimbabwe", "dial_code": "+263" }
    ];

    useEffect(() => {
        if (countryCodes && countryCodes.length > 0 && !selectedCode) {
            setSelectedCode(countryCodes[0]);
            setDialingCode(countryCodes[0].dial_code);
        }
    }, [countryCodes]);

    const flightPriceData = flightPriceRes?.result?.airSolutions;
    // console.log("FlightPriceData", selectedOption)

    const Price = selectedOption?.pricingInfos;
    const TotalPrice = selectedOption?.totalPrice;
    const TripType = typeof window !== 'undefined' ? localStorage.getItem("TripType") : null;
    // console.log(Price)

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleString('en-US', { month: 'short' });
        const weekday = date.toLocaleString('en-US', { weekday: 'short' });
        return `${day} ${month}, ${weekday}`;
    }

    const formatDurationLabel = (raw) => {
        if (!raw) return '';
        const text = String(raw).trim();
        if (/h|m/i.test(text) && !/:/.test(text)) {
            return text.replace(/\s+/g, '').toUpperCase().replace(/H/, 'H ').replace(/M/, 'M').trim();
        }
        const match = text.match(/(\d+)\s*[:=h]?\s*(\d+)?/i);
        if (match) {
            const h = String(match[1]).padStart(2, '0');
            const m = String(match[2] || 0).padStart(2, '0');
            return `${h}H ${m}M`;
        }
        return text.toUpperCase();
    };

    const parseSegmentDateTime = (seg, type = 'depart') => {
        const dateVal = type === 'depart' ? seg?.departDate : seg?.arrivalDate;
        const timeVal = type === 'depart' ? seg?.departTime : seg?.arrivalTime;
        if (!dateVal) return null;
        const datePart = String(dateVal).includes('T')
            ? String(dateVal)
            : `${String(dateVal).slice(0, 10)}T${(timeVal || '00:00').padStart(5, '0')}:00`;
        const parsed = new Date(datePart);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    };

    const getLayoverLabel = (prevSeg, nextSeg) => {
        const arrival = parseSegmentDateTime(prevSeg, 'arrival');
        const depart = parseSegmentDateTime(nextSeg, 'depart');
        if (!arrival || !depart) return null;
        const diffMins = Math.max(0, Math.round((depart - arrival) / 60000));
        const h = String(Math.floor(diffMins / 60)).padStart(2, '0');
        const m = String(diffMins % 60).padStart(2, '0');
        return `${h}H ${m}M`;
    };

    const airportLabel = (seg, type = 'origin') => {
        if (type === 'origin') {
            const city = seg?.originAirportName || seg?.originAirportCity || seg?.originCity || '';
            const country = seg?.originAirportCountry || seg?.originCountry || '';
            const code = seg?.origin || '';
            const place = [city, country].filter(Boolean).join(', ') || city;
            return place ? `${place}${code ? ` - ${code}` : ''}` : (code || 'N/A');
        }
        const city = seg?.destinationAirportName || seg?.destinationAirportCity || seg?.destinationCity || '';
        const country = seg?.destinationAirportCountry || seg?.destinationCountry || '';
        const code = seg?.destination || '';
        const place = [city, country].filter(Boolean).join(', ') || city;
        return place ? `${place}${code ? ` - ${code}` : ''}` : (code || 'N/A');
    };

    const formatMoney = (value) => {
        const num = Number(value);
        if (Number.isNaN(num)) return value ?? '0';
        return Math.round(num).toLocaleString();
    };

    const savedData = typeof window !== 'undefined' ? localStorage.getItem("flightFormData") : null;
    let parsedData = null;

    try {
        parsedData = savedData ? JSON.parse(savedData) : null;
    } catch (e) {
        parsedData = null;
    }

    const params = searchParams;

    const origin = parsedData?.originLabel || params.get("Originlabel") || "";
    const destination = parsedData?.destinationLabel || params.get("Destinationlabel") || "";
    const departure = parsedData?.departureDate || params.get("DepartDate") || "";
    const Return = parsedData?.returnDate || params.get("ArrivalDate") || "";

    let globalIndex = 0;

    // useEffect(() => {
    //     if (Price?.length > 0) {
    //         const list = [];
    //         Price.forEach((pax) => {
    //             for (let i = 0; i < pax.noOfPax; i++) {
    //                 list.push({
    //                     title: "",
    //                     first_name: "",
    //                     middle_name: "",
    //                     last_name: "",
    //                     dob: null,
    //                     gender: "",
    //                     type: pax.paxTypeName,
    //                 });
    //             }
    //         });
    //         setPassengerList(list);
    //     }
    // }, [Price]);
    const [passengerList, setPassengerList] = useState([]);
    const [contactNumber, setContactNumber] = useState("");
    const [email, setEmail] = useState("");
    const [BookingData, setBookingData] = useState(null);
    const [ipAddress, setIpAddress] = useState(null);
    const [isBooking, setIsBooking] = useState(false);
    console.log("passengerList", passengerList)
    // console.log("PnrResponse", PnrResponse)
    // console.log("BookingData", BookingData)

    useEffect(() => {
        if (Price?.length > 0 && passengerList.length === 0) {
            const list = [];
            Price.forEach((pax) => {
                for (let i = 0; i < pax.noOfPax; i++) {
                    list.push({
                        title: "",
                        first_name: "",
                        middle_name: "",
                        last_name: "",
                        dob: null,
                        gender: "",
                        type: pax.paxTypeName,
                    });
                }
            });
            setPassengerList(list);
        }
    }, [Price, passengerList]);

    useEffect(() => {
        const fetchIp = async () => {
            try {
                const res = await fetch("https://api64.ipify.org?format=json");
                const data = await res.json();
                setIpAddress(data.ip);
            } catch (err) {
                console.error("Error fetching IP:", err);
            }
        };

        fetchIp();
    }, []);

    const handleContinueBooking = (option) => {
        setSelectedOption(option);
        setActiveStep(prev => prev + 1);
    };

    const handleOtpChange = (index, value, e) => {
        const newOtp = [...VerifyCode];
        if (!/^[0-9]?$/.test(value)) return;
        newOtp[index] = value;
        setVerifyCode(newOtp);

        if (value && index < 5) {
            document.getElementById(`VerifyCode-${index + 1}`).focus();
        }

        if (e.key === "Backspace" && !value && index > 0) {
            document.getElementById(`VerifyCode-${index - 1}`).focus();
        }
    };

    const handleVerifyOtp = async () => {
        if (VerifyCode.some((digit) => digit === "")) {
            setPopupMessage("Please Enter the Complete OTP.", "error");
            return;
        }

        const fullOtp = VerifyCode.join("");
        // console.log("Verifying email:", email, "OTP:", fullOtp);

        try {
            const res = await api.post("/verify-code", {
                email: email,
                code: fullOtp,
                key: "code-for-booking",
            });

            const VerifyRes = res?.data;
            console.log("Verify Response", VerifyRes);

            if (VerifyRes?.status === 1) {
                setPopupMessage("OTP Verified successfully!", "success");
                setVerifyOpen(false);
                setEmailVerified(true);
                setVerifyCode(["", "", "", "", "", ""]);

                try {
                    await handlePnrProcess(true);
                } catch (pnrErr) {
                    setPopupMessage("OTP verified, But Booking Process Failed.", "error");
                    setVerifyCode(["", "", "", "", "", ""]);
                }
            } else {
                // setVerifyOpen(false);
                setPopupMessage(
                    VerifyRes?.message || "Invalid OTP. Please Try Again.",
                    "error"
                );
                setVerifyCode(["", "", "", "", "", ""]);
            }
        } catch (err) {
            // setVerifyOpen(false);
            setVerifyCode(["", "", "", "", "", ""]);
            setPopupMessage(
                err?.response?.data?.message || "Error verifying OTP. Please Try Again.",
                "error"
            );
        }
    };

    const handlePnrCreated = async () => {

        if (isBooking) return;
        setIsBooking(true);

        const missingFields = passengerList?.some(pax =>
            !pax?.first_name ||
            !pax?.last_name ||
            !userInput ||
            !pax?.dob
        );

        if (missingFields || !email) {
            setPopupMessage("Please fill in all Required fields for every Passenger: Title, First Name, Last Name, Date of Birth, Captcha and Email.", "error");
            setIsBooking(false);
            return;
        }

        if (parseInt(userInput) !== addAnswer) {
            setPopupMessage("Captcha Incorrect. Try Again!", "error");
            generateCaptcha();
            setIsBooking(false);
            return;
        }

        try {
            const emailResponse = await api.post("/send-verification-code", {
                email,
            });
            const emailRes = emailResponse?.data;
            // console.log("Email Response", emailRes);

            if (
                emailRes?.status === 1
            ) {
                setVerifyOpen(true);
            } else {
                setPopupMessage(
                    emailRes?.message || "Failed to send Verification Code.",
                    "error"
                );
            }
        } catch (err) {
            setPopupMessage(
                err?.response?.data?.message ||
                "Error Sending Verification Code.",
                "error"
            );
        } finally {
            setIsBooking(false);
        }
    };

    const handlePnrProcess = async (otpVerified = false) => {
        if (!otpVerified && !emailVerified) return;

        setPayNowLoading(true);

        try {
            const Pax = passengerList?.map((pax, index) => ({
                Title: pax?.title || "MR",
                FirstName: pax?.first_name,
                MiddleName: pax?.middle_name,
                LastName: pax?.last_name,
                PaxType: pax?.type === "Adult" ? "ADT" :
                    pax?.type === "Child" ? "CHD" :
                        pax?.type === "Infant" ? "INF" : undefined,
                Gender: pax?.gender === "Male" ? "M" :
                    pax?.gender === "Female" ? "F" :
                        pax?.gender === "Other" ? "O" : undefined,
                PaxDOB: pax?.dob ? new Date(pax.dob).toISOString().split("T")[0] : undefined,
                IsLeadName: index === 0
            }));

            const payload = {
                Token: flightPriceRes?.result?.token,
                Key: selectedOption?.key,
                TripType: TripType,
                AccountCode: "BS6593",
                CompanyCode: "BS6593",
                WebsiteName: "zippytravel.co.uk",
                Supp: selectedOption?.supp,
                Pax,
                AddressInfo: {
                    City: {
                        CityCode: null,
                        AreaCode: null,
                        CityName: "Hounslow",
                        BillingCityName: null
                    },
                    Country: {
                        CountryCode: "GB",
                        CountryName: "London",
                        user_ip: ipAddress,
                        BillingCountryName: null
                    },
                    Street: {
                        HouseNo: "Brightsun Travel (Uk) Ltd",
                        PostalCode: "tw3 1ua",
                        Address1: "14 Hanworth Road,, Greater London",
                        Address2: "",
                        Address3: "",
                        AddressType: null,
                        BillingHouseNo: null,
                        BillingAddress1: null,
                        BillingAddress2: null,
                        BillingZipcode: null
                    }
                },
                Email: email,
                ContactNo: `${dialingCode || "+44"}${contactNumber}`,
                username: "BS6593",
                password: "#Bs65@93z1pPyTrAvEl_Live"
            };

            console.log("Final Payload to FlightPNR:", payload);

            const response = await api.post("/flightpnr", payload);
            const data = response?.data;
            console.log("PNR Response:", response);

            if (data?.apiFault || data?.errorDescription) {
                setPayNowLoading(false);
                setPopupMessage(
                    <>
                        {/* <p>
                            {data.apiFault?.errorDescription || data?.errorDescription || "PNR Creation Failed."}
                        </p> */}
                        <p className="text-gray-700 text-sm leading-relaxed mb-6">
                            This Flight has already been sold out. You can find another Option by clicking Search Again Button Or we can do it for You Free of cost if You Click Request a call Back.
                        </p>
                    </>,
                    "error"
                );
                setNavigateOnClose(true);
                return;
            }

            const passengerPayload = passengerList.map(pax => ({
                title: pax?.title || "MR",
                first_name: pax?.first_name,
                middle_name: pax?.middle_name,
                last_name: pax?.last_name,
                gender: pax?.gender,
                dob: pax?.dob ? new Date(pax.dob).toISOString().split("T")[0] : "",
                email: email,
                phone_no: `${dialingCode || "+44"}${contactNumber}`,
                mobile_no: `${dialingCode || "+44"}${contactNumber}`,
                address: ipAddress || "",
                passport_no: pax?.passport_no || "",
                seat_preferenc: pax?.type || "",
                meal_preferenc: pax?.meal_preferenc || "",
            }));

            const bookingQueuePayload = {
                booking: {
                    pnr_no: data?.result?.pnrInfo?.[0]?.airlineRef ? data?.result?.pnrInfo?.[0]?.airlineRef : data?.result?.pnrInfo?.[0]?.recLoc,
                    amount: selectedOption?.totalPrice,
                    flight_detail: {
                        from: origin,
                        to: destination,
                        user_ip: ipAddress,
                        airsolution: data
                    }
                },
                transaction: {},
                passenger: passengerPayload
            };
            console.log("bookingQueuePayload", bookingQueuePayload)

            const BookingResponse = await api.post("/booking", bookingQueuePayload);
            console.log("Booking Response:", BookingResponse);
            const FinalData = {
                ...BookingResponse?.data,
                pnr_response: data?.result,
                total_amount: selectedOption?.totalPrice || 0,
                flightData: selectedOption
            };
            // console.log("Booking Response:", FinalData);
            localStorage.setItem("BookingData", JSON.stringify(FinalData));
            setBookingData(FinalData);
            setPayNowLoading(false);
            setActiveStep(prev => prev + 1);

        } catch (err) {
            console.error("PNR/Booking Error:", err);
            setPopupMessage(err?.response?.data?.message ||
                "Something went wrong while Processing your Request.", "error");
            setPayNowLoading(false);
        } finally {
            setPayNowLoading(false);
        }
    };

    const handleCallBack = async () => {
        const passengerPayload = passengerList.map(pax => ({
            title: pax?.title || "MR",
            first_name: pax?.first_name,
            middle_name: pax?.middle_name,
            last_name: pax?.last_name,
            gender: pax?.gender,
            dob: pax?.dob ? new Date(pax.dob).toISOString().split("T")[0] : "",
            email: email,
            phone_no: `${dialingCode || "+44"}${contactNumber}`,
            mobile_no: `${dialingCode || "+44"}${contactNumber}`,
            address: ipAddress || "",
            passport_no: pax?.passport_no || "",
            seat_preferenc: pax?.type || "",
            meal_preferenc: pax?.meal_preferenc || "",
        }));

        const bookingQueuePayload = {
            booking: {
                pnr_no: "N/A",
                amount: selectedOption?.totalPrice,
                flight_detail: {
                    from: origin,
                    to: destination,
                    user_ip: ipAddress,
                    airsolution: selectedOption?.journey
                }
            },
            transaction: {},
            passenger: passengerPayload
        };

        console.log("Final Payload to FlightPNR:", bookingQueuePayload);

        try {
            const response = await api.post("/booking", bookingQueuePayload);
            console.log("Booking Response:", response);
        } catch (err) {
            console.error("Booking API Error:", err);
        }
    };

    const [isCustomerAgreed, setIsCustomerAgreed] = useState(true);
    const [isPrivacyAgreed, setIsPrivacyAgreed] = useState(true);

    const isButtonDisabled = !(isCustomerAgreed && isPrivacyAgreed);

    const [paymentInfo, setPaymentInfo] = useState(null);
    const savedBooking = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("BookingData") || "{}") : {};
    // console.log("Data", savedBooking)

    useEffect(() => {
        const isPaymentRedirect = searchParams.has("errorcode") || searchParams.has("orderreference");

        if (!isPaymentRedirect) {
            console.log("Normal Booking Route Detected");
            return;
        }

        const result = {
            errorcode: searchParams.get("errorcode"),
            orderreference: searchParams.get("orderreference"),
            paymenttypedescription: searchParams.get("paymenttypedescription"),
            requestreference: searchParams.get("requestreference"),
            settlestatus: searchParams.get("settlestatus"),
            sitereference: searchParams.get("sitereference"),
            transactionreference: searchParams.get("transactionreference"),
        };

        // console.log("Payment Response:", result);
        setPaymentInfo(result);

        const handleTrustPayment = async () => {
            const isSuccessful = result.errorcode === "0" && result.settlestatus === "0";

            const payload = {
                booking_id: savedBooking?.booking_id,
                pnr_no:
                    savedBooking?.pnr_response?.pnrInfo?.[0]?.airlineRef ? savedBooking?.pnr_response?.pnrInfo?.[0]?.airlineRef :
                        savedBooking?.pnr_response?.pnrInfo?.[0]?.recLoc,
                order_reference: savedBooking.order_ticket_id,
                transaction_reference: result.transactionreference,
                amount: savedBooking?.total_amount,
                currency: "GBP",
                payment_method: result.paymenttypedescription || "card",
                status: isSuccessful ? "paid" : "failed",
                gateway_response: {
                    message: isSuccessful
                        ? "Payment completed successfully"
                        : "Payment declined or cancelled",
                    pay_response: result
                },
            };

            // console.log("Final Payload:", payload);

            try {
                const response = await api.post("/transaction-trust-payment", payload);
                // console.log("Trust Payment API Response:", response);
                setActiveStep(4);
            } catch (error) {
                console.error("Trust Payment API Error:", error?.response?.data || error);
            }
        };

        if (result.orderreference) {
            handleTrustPayment();
        }
    }, [searchParams]);

    if (loading) return <LoadingScreen />;

    const getStepContent = () => {
        switch (activeStep) {
            case 1:
                return (
                    <>
                        <div className="mb-5 sm:mb-6 mt-6 sm:mt-8">
                            <h3 className="text-[26px] sm:text-[32px] font-semibold text-[#A57233] font-quicksand leading-tight">
                                Secure Booking
                            </h3>
                            <p className="text-[13px] sm:text-[15px] text-[#4C4C4C] font-quicksand mt-1 max-w-3xl">
                                We use secure transmission and encrypted storage to protect your personal information!
                            </p>
                        </div>

                        {flightPriceData?.map((item, index) => {
                            const journeys = Array.isArray(item?.journey) ? item.journey : [];
                            const getJourneySegments = (journey) =>
                                journey?.airSegments
                                || journey?.optionInfos?.[0]?.airSegmentInfos
                                || [];
                            const departure = getJourneySegments(journeys[0]);
                            const returnSegments = journeys.length > 1 ? getJourneySegments(journeys[1]) : [];
                            const brandName = item?.brand?.brandName || item?.brandName || '';

                            const renderJourneySummary = (segments, isReturn = false) => {
                                if (!segments?.length) return null;
                                const first = segments[0];
                                const last = segments[segments.length - 1];
                                const stops = segments.length - 1;
                                const stopText = stops === 0 ? 'Direct' : stops === 1 ? '01 Stop' : `${String(stops).padStart(2, '0')} Stops`;

                                return (
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 py-3 border-b border-[#F2ECE4] last:border-b-0 last:pb-0 first:pt-0">
                                        <div className="sm:w-[110px] shrink-0 flex items-center justify-center sm:justify-start">
                                            {first?.airlineLogoUrl ? (
                                                <img
                                                    src={first.airlineLogoUrl}
                                                    alt={first?.airlineName || 'Airline'}
                                                    className="h-8 sm:h-9 w-auto max-w-[110px] object-contain"
                                                />
                                            ) : (
                                                <span className="text-[12px] font-semibold text-[#686868] font-quicksand">
                                                    {first?.airlineName || 'Airline'}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0 grid grid-cols-1 min-[480px]:grid-cols-3 items-center gap-2 min-[480px]:gap-3">
                                            <div className="text-center min-[480px]:text-left">
                                                <p className="text-[18px] sm:text-[20px] font-extrabold text-secondary font-quicksand leading-none">
                                                    {first?.departTime || '—'}
                                                </p>
                                                <p className="text-[12px] text-black/50 font-quicksand mt-1">
                                                    {formatDate(first?.departDate)}
                                                </p>
                                                <p className="text-[13px] font-bold text-[#A57C38] font-quicksand">
                                                    {first?.origin || '—'}
                                                </p>
                                            </div>

                                            <div className="flex flex-col items-center px-1">
                                                <span className="text-[11px] sm:text-[12px] text-secondary font-medium font-quicksand mb-1">
                                                    {stopText}
                                                    {first?.travelDuration ? ` · ${formatDurationLabel(first.travelDuration)}` : ''}
                                                </span>
                                                <div className="flex items-center w-full max-w-[180px] gap-2">
                                                    <span className="text-[14px] font-bold text-[#A57C38] font-quicksand shrink-0">{first?.origin}</span>
                                                    <div className="flex-1 h-px bg-[#E3DAC9] relative flex items-center justify-center">
                                                        <img
                                                            src={isReturn ? '/media/fr-svgs/land.png' : '/media/fr-svgs/takeoff.png'}
                                                            alt=""
                                                            className="absolute -top-3 w-5 h-5 object-contain"
                                                            aria-hidden
                                                        />
                                                    </div>
                                                    <span className="text-[14px] font-bold text-[#A57C38] font-quicksand shrink-0">{last?.destination}</span>
                                                </div>
                                            </div>

                                            <div className="text-center min-[480px]:text-right">
                                                <p className="text-[18px] sm:text-[20px] font-extrabold text-secondary font-quicksand leading-none">
                                                    {last?.arrivalTime || '—'}
                                                </p>
                                                <p className="text-[12px] text-black/50 font-quicksand mt-1">
                                                    {formatDate(last?.arrivalDate)}
                                                </p>
                                                <p className="text-[13px] font-bold text-[#A57C38] font-quicksand">
                                                    {last?.destination || '—'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            };

                            const renderDetailJourney = (segments, journeyLabel) => {
                                if (!segments?.length) return null;
                                const first = segments[0];
                                const last = segments[segments.length - 1];

                                return (
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-[20px] sm:text-[22px] font-bold text-[#3D3D3D] font-quicksand">
                                                {journeyLabel}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                <span className="text-[16px] sm:text-[18px] font-bold text-[#A57C38] font-quicksand">
                                                    {first?.origin || '—'}
                                                </span>
                                                <svg width="134.17" height="8.541" viewBox="0 0 134.17 8.541" aria-hidden>
                                                    <defs>
                                                        <clipPath id="book-now-clip-path">
                                                        <rect width="8.54" height="5.257" transform="translate(0 0)" fill="#710c5c" stroke="rgba(0,0,0,0)" strokeWidth="1"/>
                                                        </clipPath>
                                                    </defs>
                                                    <g transform="translate(-418.214 -1071.73)" opacity="0.7">
                                                        <line x2="133.17" transform="translate(418.714 1076)" fill="none" stroke="#a57233" strokeLinecap="round" strokeWidth="1"/>
                                                        <g transform="translate(448.714 1080.271) rotate(-90)">
                                                        <g transform="translate(0 0)" clipPath="url(#book-now-clip-path)">
                                                            <path d="M3.756,5.12a1.147,1.147,0,0,1-.248-.19L2.368,3.807c-.666-.656-1.354-1.335-2.033-2A1.076,1.076,0,0,1,0,1.037,1.008,1.008,0,0,1,.015.859,1.028,1.028,0,0,1,.6.1,1.029,1.029,0,0,1,1.651.2a1.294,1.294,0,0,1,.162.14L4.269,2.763,6.737.33A1.039,1.039,0,0,1,8.027.146,1.075,1.075,0,0,1,8.517.8l.024.08v.295l-.015.066a1.3,1.3,0,0,1-.392.632q-1.1,1.085-2.207,2.173l-.888.876a1.049,1.049,0,0,1-1.283.2" transform="translate(0 0)" fill="#a57233" stroke="rgba(0,0,0,0)" strokeWidth="1"/>
                                                        </g>
                                                        </g>
                                                        <g transform="translate(517.402 1080.271) rotate(-90)">
                                                        <g transform="translate(0 0)" clipPath="url(#book-now-clip-path)">
                                                            <path d="M3.756,5.12a1.147,1.147,0,0,1-.248-.19L2.368,3.807c-.666-.656-1.354-1.335-2.033-2A1.076,1.076,0,0,1,0,1.037,1.008,1.008,0,0,1,.015.859,1.028,1.028,0,0,1,.6.1,1.029,1.029,0,0,1,1.651.2a1.294,1.294,0,0,1,.162.14L4.269,2.763,6.737.33A1.039,1.039,0,0,1,8.027.146,1.075,1.075,0,0,1,8.517.8l.024.08v.295l-.015.066a1.3,1.3,0,0,1-.392.632q-1.1,1.085-2.207,2.173l-.888.876a1.049,1.049,0,0,1-1.283.2" transform="translate(0 0)" fill="#a57233" stroke="rgba(0,0,0,0)" strokeWidth="1"/>
                                                        </g>
                                                        </g>
                                                    </g>
                                                </svg>
                                                {/* <img src={`${BASE_URL_IMG}/assets/svgs/fligtTo.svg`} alt="test" className="h-3 opacity-70" aria-hidden /> */}
                                                <span className="text-[16px] sm:text-[18px] font-bold text-[#A57C38] font-quicksand">
                                                    {last?.destination || '—'}
                                                </span>
                                                {first?.departDate && (
                                                    <span className="text-[12px] sm:text-[13px] text-black/50 font-quicksand">
                                                        · {formatDate(first.departDate)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {segments.map((flightData, idx) => {
                                            const duration = formatDurationLabel(flightData?.travelDuration || flightData?.flightTime);
                                            const equipment = flightData?.equipment || flightData?.aircraftType || '—';
                                            const cabin = flightData?.class
                                                ? `${flightData.class}${flightData?.subClass ? ` (${flightData.subClass})` : ''}`
                                                : (flightData?.cabinClass || '—');
                                            const baggage =
                                                flightData?.baggageInfo?.allowance
                                                || flightData?.baggage
                                                || flightData?.checkinBaggage
                                                || null;
                                            const layoverRaw = idx < segments.length - 1
                                                ? (segments[idx + 1]?.layoverDuration
                                                    || flightData?.layoverDuration
                                                    || getLayoverLabel(flightData, segments[idx + 1]))
                                                : null;
                                            const layover = layoverRaw ? (formatDurationLabel(layoverRaw) || layoverRaw) : null;

                                            return (
                                                <React.Fragment key={idx}>
                                                    <div className="space-y-3">
                                                        <div className="bg-[#FCF9F5] rounded-xl px-3 sm:px-4 py-2.5 flex flex-wrap items-center gap-x-4 gap-y-2">
                                                            {flightData?.airlineLogoUrl ? (
                                                                <img
                                                                    src={flightData.airlineLogoUrl}
                                                                    alt={flightData?.airlineName || 'Airline'}
                                                                    className="h-7 w-auto max-w-[100px] object-contain"
                                                                />
                                                            ) : null}
                                                            {flightData?.airlineName && (
                                                                <span className="text-[12px] sm:text-[13px] text-[#686868] font-quicksand font-medium">
                                                                    {flightData.airlineName}
                                                                </span>
                                                            )}
                                                            <span className="text-[12px] sm:text-[13px] text-[#686868] font-quicksand">
                                                                Flight : {flightData?.flightNumber || '—'}
                                                            </span>
                                                            <span className="text-[12px] sm:text-[13px] text-[#686868] font-quicksand">
                                                                Equipment {equipment}
                                                            </span>
                                                        </div>

                                                        <div className="flex gap-3 sm:gap-4 pl-1">
                                                            {duration ? (
                                                                <div className="w-5 shrink-0 flex items-center justify-center">
                                                                    <span
                                                                        className="text-[11px] text-[#9A9A9A] font-quicksand tracking-[0.12em] whitespace-nowrap"
                                                                        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                                                                    >
                                                                        {duration}
                                                                    </span>
                                                                </div>
                                                            ) : <div className="w-5 shrink-0" />}

                                                            <div className="flex flex-col items-center pt-1.5 pb-1.5 shrink-0">
                                                                <span className="w-2.5 h-2.5 rounded-full border-2 border-[#C4B5A0] bg-white" />
                                                                <span className="w-px flex-1 min-h-[52px] bg-[#E3DAC9]" />
                                                                <span className="w-2.5 h-2.5 rounded-full border-2 border-[#C4B5A0] bg-white" />
                                                            </div>

                                                            <div className="flex-1 min-w-0 space-y-5">
                                                                <div className="flex items-start gap-3 sm:gap-4">
                                                                    <span className="text-[14px] font-semibold text-[#3D3D3D] font-quicksand w-[48px] shrink-0">
                                                                        {flightData?.departTime || '—'}
                                                                    </span>
                                                                    <span className="text-[13px] sm:text-[14px] text-[#3D3D3D] font-quicksand leading-snug">
                                                                        {airportLabel(flightData, 'origin')}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-start gap-3 sm:gap-4">
                                                                    <span className="text-[14px] font-semibold text-[#3D3D3D] font-quicksand w-[48px] shrink-0">
                                                                        {flightData?.arrivalTime || '—'}
                                                                    </span>
                                                                    <span className="text-[13px] sm:text-[14px] text-[#3D3D3D] font-quicksand leading-snug">
                                                                        {airportLabel(flightData, 'destination')}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pl-1">
                                                            {baggage && (
                                                                <div className="flex items-center gap-2">
                                                                    <img src={`${BASE_URL_IMG}/assets/svgs/baggage.svg`} alt="" className="w-[16px] h-[16px] object-contain" aria-hidden />
                                                                    <span className="text-[13px] text-secondary font-medium font-quicksand">{baggage}</span>
                                                                </div>
                                                            )}
                                                            <div className="flex items-center gap-2">
                                                                <img src={`/seaticon.png`} alt="" className="w-[16px] h-[16px] object-contain" aria-hidden />
                                                                <span className="text-[13px] text-secondary font-medium font-quicksand">{cabin}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {layover && (
                                                        <div className="bg-secondary text-white rounded-xl py-2.5 px-4 text-center text-[13px] font-semibold font-quicksand tracking-wide">
                                                            StopOver &mdash; {layover}
                                                        </div>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}
                                    </div>
                                );
                            };

                            return (
                                <div key={index} className="w-full mb-6">
                                    {(flightPriceData.length > 1 || brandName) && (
                                        <p className="text-[22px] sm:text-[28px] font-bold text-[#A57233] mb-3 font-quicksand">
                                            Option {index + 1}
                                            {brandName ? ` (${brandName})` : ''}
                                        </p>
                                    )}
                                    <div className="bg-[#F8F1E9] rounded-[24px] sm:rounded-[28px] p-4 sm:p-6 lg:p-8 border border-[#EFE4D6]">
                                        <div className="flex flex-col lg:flex-row gap-5 lg:gap-6">
                                            {/* Left: Price Details */}
                                            <aside className="w-full lg:w-[270px] xl:w-[300px] shrink-0 order-2 lg:order-1">
                                                <div className="bg-white rounded-[20px] p-4 sm:p-5 border border-[#F2ECE4] lg:sticky lg:top-28">
                                                    <h4 className="text-[16px] sm:text-[18px] font-bold text-secondary font-quicksand mb-4">
                                                        Price Details £(GBP)
                                                    </h4>

                                                    <div className="space-y-3">
                                                        {item?.pricingInfos?.map((pax, idx) => (
                                                            <div key={idx} className="space-y-2 pb-3 border-b border-[#F2ECE4] last:border-b-0">
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <p className="text-[13px] sm:text-[14px] text-[#3D3D3D] font-quicksand leading-snug">
                                                                        {pax?.noOfPax} X {pax.paxTypeName === "Youth" ? "Infant" : pax.paxTypeName}{" "}
                                                                        (Base Fare)
                                                                    </p>
                                                                    <p className="text-[13px] sm:text-[14px] text-[#3D3D3D] font-semibold font-quicksand whitespace-nowrap">
                                                                        {pax?.noOfPax} X £{formatMoney(pax?.basePrice)}
                                                                    </p>
                                                                </div>
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <p className="text-[13px] sm:text-[14px] text-[#3D3D3D] font-quicksand leading-snug">
                                                                        {pax?.noOfPax} X {pax.paxTypeName === "Youth" ? "Infant" : pax.paxTypeName}{" "}
                                                                        (Taxes & Fees)
                                                                    </p>
                                                                    <p className="text-[13px] sm:text-[14px] text-[#3D3D3D] font-semibold font-quicksand whitespace-nowrap">
                                                                        {pax?.noOfPax} X £{formatMoney(pax?.tax)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="mt-4 pt-1">
                                                        <p className="text-[14px] sm:text-[15px] font-semibold text-[#A57233] font-quicksand">
                                                            Final Total Price
                                                        </p>
                                                        <p className="text-[11px] sm:text-[12px] text-[#6B6B6B] font-quicksand mt-0.5 leading-snug">
                                                            All prices (including taxes &amp; fees) are quoted in GBP
                                                        </p>
                                                        <p className="text-end text-[28px] sm:text-[32px] font-extrabold text-secondary font-quicksand leading-none mt-3">
                                                            £{formatMoney(item?.totalPrice)}
                                                        </p>
                                                        <p className="ml-auto text-center max-w-[112px] text-[11px] sm:text-[11px] text-[#6B6B6B] font-quicksand mt-2">
                                                            Total Per Adult Subject to Availability
                                                        </p>
                                                    </div>
                                                </div>

                                                <a
                                                    href="tel:02070434343"
                                                    className="mt-4 flex items-center justify-center gap-2 text-[13px] sm:text-[14px] font-semibold text-[#3D3D3D] font-quicksand hover:text-secondary"
                                                >
                                                    <img src={`/media/fr-svgs/callicon.png`} alt="" className="w-4 h-4 object-contain" aria-hidden />
                                                    0207 043 4343
                                                </a>
                                            </aside>

                                            {/* Right: Flight content */}
                                            <div className="flex-1 min-w-0 space-y-4 order-1 lg:order-2">
                                                {/* Journey summary */}
                                                <div className="bg-white rounded-[20px] p-4 sm:p-5 border border-[#F2ECE4]">
                                                    {journeys.map((journey, jIdx) => (
                                                        <React.Fragment key={`summary-${jIdx}`}>
                                                            {renderJourneySummary(getJourneySegments(journey), jIdx > 0)}
                                                        </React.Fragment>
                                                    ))}
                                                </div>

                                                {/* Flight details */}
                                                <div className="bg-white rounded-[20px] p-4 sm:p-6 border border-[#F2ECE4] space-y-8">
                                                    <h4 className="text-[14px] sm:text-[15px] font-bold tracking-[0.08em] uppercase text-[#A57C38] font-quicksand">
                                                        Flight Details
                                                    </h4>
                                                    {journeys.map((journey, jIdx) => (
                                                        <React.Fragment key={`detail-${jIdx}`}>
                                                            {renderDetailJourney(
                                                                getJourneySegments(journey),
                                                                `Flight ${String(jIdx + 1).padStart(2, '0')}`
                                                            )}
                                                        </React.Fragment>
                                                    ))}

                                                    {/* Preserve departing route labels */}
                                                    <div className="text-[12px] sm:text-[13px] text-black/55 font-quicksand space-y-1 pt-2 border-t border-[#F5EFEB]">
                                                        {departure?.length > 0 && (
                                                            <p>
                                                                Departing — <span className="text-[#A57C38]">{origin || departure[0]?.origin}</span>
                                                                {' '}to{' '}
                                                                <span className="text-[#A57C38]">{destination || departure[departure.length - 1]?.destination}</span>
                                                                {departure?.[0]?.departDate ? <> on <span className="text-[#A57C38]">{formatDate(departure[0].departDate)}</span></> : null}
                                                            </p>
                                                        )}
                                                        {returnSegments.length > 0 && (
                                                            <p>
                                                                Returning — <span className="text-[#A57C38]">{destination || returnSegments[0]?.origin}</span>
                                                                {' '}to{' '}
                                                                <span className="text-[#A57C38]">{origin || returnSegments[returnSegments.length - 1]?.destination}</span>
                                                                {returnSegments?.[0]?.departDate ? <> on <span className="text-[#A57C38]">{formatDate(returnSegments[0].departDate)}</span></> : null}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Baggage Information */}
                                                {item?.baggagePaxWise?.length > 0 && (
                                                    <div className="bg-white rounded-[20px] p-4 sm:p-6 border border-[#F2ECE4]">
                                                        <h4 className="text-[16px] sm:text-[18px] font-bold text-secondary font-quicksand mb-3">
                                                            Baggage Information
                                                        </h4>
                                                        {item.baggagePaxWise.map((baggage, bIdx) => (
                                                            <div key={bIdx} className="mb-4 last:mb-0 pb-4 last:pb-0 border-b border-[#F2ECE4] last:border-b-0">
                                                                <p className="text-[14px] font-bold text-[#3D3D3D] font-quicksand mb-2">
                                                                    Passenger Type : <span className="text-[#A57C38]">{baggage.passengerTypeCode}</span>
                                                                </p>
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                    <div>
                                                                        <p className="text-[13px] font-medium text-[#686868] font-quicksand">Cabin Baggage</p>
                                                                        <p className="text-[13px] text-[#3D3D3D] font-quicksand">{baggage.cabinBaggage || '—'}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[13px] font-medium text-[#686868] font-quicksand">Check-in Baggage</p>
                                                                        <p className="text-[13px] text-[#3D3D3D] font-quicksand">{baggage.checkinBaggage || '—'}</p>
                                                                    </div>
                                                                </div>
                                                                {baggage.handBaggageDesc && (
                                                                    <div className="mt-3">
                                                                        <p className="text-[13px] font-medium text-[#686868] font-quicksand">Hand Baggage Description</p>
                                                                        <p className="text-[13px] text-[#3D3D3D] font-quicksand">{baggage.handBaggageDesc}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Fare Rules */}
                                                {item?.fareRulePaxWise?.length > 0 && (
                                                    <div className="bg-white rounded-[20px] p-4 sm:p-6 border border-[#F2ECE4]">
                                                        <h4 className="text-[16px] sm:text-[18px] font-bold text-secondary font-quicksand mb-3">
                                                            Fare Rules
                                                        </h4>
                                                        {item.fareRulePaxWise.map((rule, rIdx) => (
                                                            <div key={rIdx} className="mb-4 last:mb-0 pb-4 last:pb-0 border-b border-[#F2ECE4] last:border-b-0">
                                                                <p className="text-[14px] font-bold text-[#3D3D3D] font-quicksand mb-2">
                                                                    Passenger Type :{' '}
                                                                    <span className="text-[#A57C38]">
                                                                        {rule.passengerTypeCode === "YTH" ? "INF" : rule.passengerTypeCode}
                                                                    </span>
                                                                </p>
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                    <div>
                                                                        <p className="text-[13px] font-medium text-[#686868] font-quicksand">Change Penalty</p>
                                                                        <p className="text-[13px] text-[#3D3D3D] font-quicksand">
                                                                            {rule.changePenalty?.penaltyApplies} – <strong>{rule.changePenalty?.amountText}</strong>
                                                                        </p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[13px] font-medium text-[#686868] font-quicksand">Cancel Penalty</p>
                                                                        <p className="text-[13px] text-[#3D3D3D] font-quicksand">
                                                                            {rule.cancelPenalty?.penaltyApplies} – <strong>{rule.cancelPenalty?.amountText}</strong>
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Footer actions */}
                                        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-6 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (typeof window !== 'undefined' && window.history.length > 1) {
                                                        router.back();
                                                    } else {
                                                        router.push('/');
                                                    }
                                                }}
                                                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-secondary text-secondary bg-white font-quicksand text-[14px] sm:text-[15px] font-semibold hover:bg-secondary hover:text-white transition-colors"
                                            >
                                                View Search Results
                                            </button>
                                            <button
                                                type="button"
                                                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-secondary text-white font-quicksand text-[14px] sm:text-[15px] font-semibold hover:bg-secondary/90 transition-colors"
                                                onClick={() => handleContinueBooking(item)}
                                            >
                                                Continue Booking
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Contact Buttons */}
                        <div className="hidden sm:flex items-center justify-between gap-4 mt-2 mb-4 px-1">
                            <div className="flex flex-col items-start">
                                <button
                                    type="button"
                                    className="flex items-center text-[15px] font-bold text-[#F1A868] font-quicksand"
                                    onClick={() => setShowPopup(true)}
                                >
                                    Request a Call Back
                                    <img src={`${BASE_URL_IMG}/assets/svgs/Arrow1.svg`} alt="" className="ml-2" aria-hidden />
                                </button>
                                <span className="text-[12px] text-black/50 font-quicksand">Too Busy to Dial a Call?</span>
                            </div>
                            <div className="flex flex-col">
                                <a
                                    href="https://wa.me/442070434343?text=Hello%2C%20I%20want%20to%20book%20a%20flight"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center text-[15px] font-bold text-[#1CCC2E] font-quicksand"
                                >
                                    WhatsApp
                                    <img src={`${BASE_URL_IMG}/assets/svgs/green-arrow.svg`} alt="" className="ml-2" aria-hidden />
                                </a>
                                <span className="text-[12px] text-black/50 font-quicksand">0207 - 043 - 4343</span>
                            </div>
                            <div className="flex flex-col items-start md:items-end">
                                <a href="tel:02070434343" className="flex items-center text-[15px] font-bold text-[#F1A868] font-quicksand">
                                    Call Us Now
                                    <img src={`${BASE_URL_IMG}/assets/svgs/Arrow1.svg`} alt="" className="ml-2" aria-hidden />
                                </a>
                                <span className="text-[12px] text-black/50 font-quicksand">0207 - 043 - 4343</span>
                            </div>
                        </div>
                    </>
                );
            case 2: {
                const adtCount = Price?.filter(p => (p.paxType === 'ADT' || p.paxTypeName === 'Adult'))
                    .reduce((sum, p) => sum + (Number(p.noOfPax) || 0), 0) || 0;
                const chdCount = Price?.filter(p => (p.paxType === 'CHD' || p.paxTypeName === 'Child'))
                    .reduce((sum, p) => sum + (Number(p.noOfPax) || 0), 0) || 0;
                const infCount = Price?.filter(p => (
                    p.paxType === 'INF' || p.paxType === 'YTH' || p.paxTypeName === 'Infant' || p.paxTypeName === 'Youth'
                )).reduce((sum, p) => sum + (Number(p.noOfPax) || 0), 0) || 0;
                const paxSummary = `Adt ${String(adtCount).padStart(2, '0')} - Chd ${String(chdCount).padStart(2, '0')} - Inf ${String(infCount).padStart(2, '0')}`;

                return (
                    <div className="w-full mt-6 sm:mt-8 mb-6">
                        <div className="bg-[#F8F1E9] rounded-[24px] sm:rounded-[28px] p-4 sm:p-6 lg:p-8 border border-[#EFE4D6]">
                            <div className="mb-5 sm:mb-6">
                                <h3 className="text-[26px] sm:text-[32px] font-semibold text-secondary font-quicksand leading-tight">
                                    Booking Information
                                </h3>
                                <p className="text-[13px] sm:text-[15px] text-[#6B6B6B] font-quicksand mt-1 max-w-3xl">
                                    We use secure transmission and encrypted storage to protect your personal information!
                                </p>
                            </div>

                            <div className="flex flex-col lg:flex-row gap-5 lg:gap-6">
                                {/* Left: Price Details */}
                                <aside className="w-full lg:w-[270px] xl:w-[300px] shrink-0 order-2 lg:order-1">
                                    <div className="bg-white rounded-[20px] p-4 sm:p-5 border border-[#F2ECE4] shadow-[0_8px_24px_rgba(0,0,0,0.03)] lg:sticky lg:top-28">
                                        <h4 className="text-[16px] sm:text-[18px] font-bold text-secondary font-quicksand mb-4">
                                            Price Details £(GBP)
                                        </h4>

                                        <div className="space-y-3">
                                            {Price?.map((item, index) => (
                                                <div key={index} className="space-y-2 pb-3 border-b border-[#F2ECE4] last:border-b-0">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <p className="text-[13px] sm:text-[14px] text-[#3D3D3D] font-quicksand leading-snug">
                                                            {item?.noOfPax} X {item?.paxTypeName === "Youth" ? "Infant" : item?.paxTypeName} (Base Fare)
                                                        </p>
                                                        <p className="text-[13px] sm:text-[14px] text-[#3D3D3D] font-semibold font-quicksand whitespace-nowrap">
                                                            {item?.noOfPax} X £{formatMoney(item?.basePrice)}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-start justify-between gap-3">
                                                        <p className="text-[13px] sm:text-[14px] text-[#3D3D3D] font-quicksand leading-snug">
                                                            {item?.noOfPax} X {item?.paxTypeName === "Youth" ? "Infant" : item?.paxTypeName} (Taxes & Fees)
                                                        </p>
                                                        <p className="text-[13px] sm:text-[14px] text-[#3D3D3D] font-semibold font-quicksand whitespace-nowrap">
                                                            {item?.noOfPax} X £{formatMoney(item?.tax)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-4 pt-1">
                                            <p className="text-[14px] sm:text-[15px] font-semibold text-[#3D3D3D] font-quicksand">
                                                Final Total Price
                                            </p>
                                            <p className="text-[11px] sm:text-[12px] text-[#6B6B6B] font-quicksand mt-0.5 leading-snug">
                                                All prices (including taxes &amp; fees) are quoted in GBP
                                            </p>
                                            <p className="text-[28px] sm:text-[32px] font-extrabold text-secondary font-quicksand leading-none mt-3">
                                                £{formatMoney(TotalPrice)}
                                            </p>
                                            <p className="text-[11px] sm:text-[12px] text-[#6B6B6B] font-quicksand mt-2">
                                                Total Per Adult Subject to Availability
                                            </p>
                                        </div>
                                    </div>

                                    <a
                                        href="tel:02070434343"
                                        className="mt-4 flex items-center justify-center gap-2 text-[13px] sm:text-[14px] font-semibold text-[#3D3D3D] font-quicksand hover:text-secondary"
                                    >
                                        <img src={`/media/fr-svgs/callicon.png`} alt="" className="w-4 h-4 object-contain" aria-hidden />
                                        0207 043 4343
                                    </a>
                                </aside>

                                {/* Right: Forms */}
                                <div className="flex-1 min-w-0 space-y-4 order-1 lg:order-2">
                                    {Price?.map((pax) =>
                                        Array.from({ length: pax.noOfPax }).map((_, paxIndex) => {
                                            const form = (
                                                <PassengerForm
                                                    key={`${pax.paxType}-${paxIndex}`}
                                                    index={globalIndex}
                                                    type={pax.paxTypeName}
                                                    setPassengerList={setPassengerList}
                                                    paxSummary={paxSummary}
                                                />
                                            );
                                            globalIndex++;
                                            return form;
                                        })
                                    )}

                                    {/* Contact Details */}
                                    <div className="relative bg-[#FFF9F4] rounded-[20px] border border-[#E8DFD2] p-4 sm:p-5 font-quicksand">
                                        <div className="absolute top-3 left-1/2 -translate-x-1/2" aria-hidden>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="40.5" height="3.469" viewBox="0 0 40.5 3.469">
                                                <g transform="translate(-60 -27.531)">
                                                    <line x2="29" transform="translate(60.5 28.031)" fill="none" stroke="#a57233" strokeLinecap="round" strokeWidth="1" />
                                                    <line x2="29" transform="translate(71 30.5)" fill="none" stroke="#a57233" strokeLinecap="round" strokeWidth="1" />
                                                </g>
                                            </svg>
                                        </div>

                                        <h3 className="text-[16px] sm:text-[18px] font-bold text-secondary font-quicksand text-center pt-3 mb-5">
                                            Contact Details
                                        </h3>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                            <div className="relative">
                                                <label className="block text-[13px] sm:text-[14px] font-semibold font-quicksand text-[#A57233] mb-1.5">
                                                    Country Code <span className="text-[#E11D48] ml-0.5">*</span>
                                                </label>
                                                <div
                                                    className="flex items-center w-full bg-white overflow-hidden cursor-pointer"
                                                    onClick={() => setIsCodeOpen(!isCodeOpen)}
                                                >
                                                    <div className="mr-[-15px] bg-white z-2 flex items-center justify-center w-[34px] h-[34px] shrink-0 border rounded-[4px] border-[#A57233] shadow-[0_0px_2px_rgba(0,0,0,0.06)]">
                                                        <img src="/media/fr-svgs/phonenumber.svg" alt="" className="w-[15px] h-[15px] object-contain" aria-hidden />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        aria-label="Select Dialing Code"
                                                        placeholder="Select Dialing Code"
                                                        value={selectedCode ? `${selectedCode.dial_code}` : ''}
                                                        readOnly
                                                        className="w-full h-[48px] px-3 pl-6 outline-none bg-transparent text-[14px] font-quicksand text-[#2a211c] placeholder:text-[#A9A3AF] placeholder:font-medium border rounded-[7px] border-[#A57233] cursor-pointer"
                                                    />
                                                </div>
                                                {isCodeOpen && (
                                                    <div className="absolute z-20 mt-1.5 w-full bg-white rounded-[7px] shadow-lg border border-[#A57233]/40 p-1 max-h-60 overflow-y-auto">
                                                        {countryCodes?.map((item) => (
                                                            <div
                                                                key={item.dial_code + item.country}
                                                                onClick={() => {
                                                                    setSelectedCode(item);
                                                                    setIsCodeOpen(false);
                                                                    setDialingCode(item.dial_code);
                                                                }}
                                                                className={`px-4 py-2.5 text-[14px] font-medium font-quicksand cursor-pointer border-b border-[#F2ECE4] last:border-b-0 hover:bg-[#F8F1E9] ${selectedCode?.dial_code === item.dial_code ? 'bg-[#F8F1E9] text-secondary font-semibold' : 'text-[#3D3D3D]'
                                                                    }`}
                                                            >
                                                                {item.dial_code} ({item.country})
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-[13px] sm:text-[14px] font-semibold font-quicksand text-[#A57233] mb-1.5">
                                                    Phone <span className="text-[#E11D48] ml-0.5">*</span>
                                                </label>
                                                <div className="flex items-center w-full bg-white overflow-hidden">
                                                    <div className="mr-[-15px] bg-white z-2 flex items-center justify-center w-[34px] h-[34px] shrink-0 border rounded-[4px] border-[#A57233] shadow-[0_0px_2px_rgba(0,0,0,0.06)]">
                                                        <img src="/media/fr-svgs/phonenumber.svg" alt="" className="w-[15px] h-[15px] object-contain" aria-hidden />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        aria-label="Contact Number"
                                                        placeholder="Type your contact number"
                                                        className="w-full h-[48px] px-3 pl-6 outline-none bg-transparent text-[14px] font-quicksand text-[#2a211c] placeholder:text-[#A9A3AF] placeholder:font-medium border rounded-[7px] border-[#A57233]"
                                                        value={contactNumber}
                                                        onKeyDown={(e) => {
                                                            const allowedKeys = [
                                                                "Backspace", "ArrowLeft", "ArrowRight", "Tab", "Delete"
                                                            ];
                                                            if (
                                                                !(e.key >= "0" && e.key <= "9") &&
                                                                !allowedKeys.includes(e.key)
                                                            ) {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                        onChange={(e) => setContactNumber(e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="sm:col-span-2 lg:col-span-1">
                                                <label className="block text-[13px] sm:text-[14px] font-semibold font-quicksand text-[#A57233] mb-1.5">
                                                    E-Mail <span className="text-[#E11D48] ml-0.5">*</span>
                                                </label>
                                                <div className="flex items-center w-full bg-white overflow-hidden">
                                                    <div className="mr-[-15px] bg-white z-2 flex items-center justify-center w-[34px] h-[34px] shrink-0 border rounded-[4px] border-[#A57233] shadow-[0_0px_2px_rgba(0,0,0,0.06)]">
                                                        <img src="/media/fr-svgs/email.svg" alt="" className="w-[15px] h-[15px] object-contain" aria-hidden />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        aria-label="Email Address"
                                                        placeholder="Type your email address"
                                                        className="w-full h-[48px] px-3 pl-6 outline-none bg-transparent text-[14px] font-quicksand text-[#2a211c] placeholder:text-[#A9A3AF] placeholder:font-medium border rounded-[7px] border-[#A57233]"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="sm:col-span-2 lg:col-span-3">
                                                <label className="block text-[13px] sm:text-[14px] font-semibold font-quicksand text-[#A57233] mb-1.5">
                                                    Captcha <span className="text-[#E11D48] ml-0.5">*</span>
                                                </label>
                                                <div className="relative flex items-center w-full max-w-md bg-white overflow-hidden">
                                                    <div className="mr-[-15px] bg-white z-2 flex items-center justify-center w-[34px] h-[34px] shrink-0 border rounded-[4px] border-[#A57233] shadow-[0_0px_2px_rgba(0,0,0,0.06)]">
                                                        <img src="/media/fr-svgs/calander.svg" alt="" className="w-[15px] h-[15px] object-contain" aria-hidden />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={userInput}
                                                        aria-label="Captcha Answer"
                                                        placeholder="Answer"
                                                        onChange={(e) => {
                                                            const onlyNumbers = e.target.value.replace(/[^0-9]/g, "");
                                                            setUserInput(onlyNumbers);
                                                        }}
                                                        className="w-full h-[48px] px-3 pl-6 pr-16 outline-none bg-transparent text-[14px] font-quicksand text-[#2a211c] placeholder:text-[#A9A3AF] placeholder:font-medium border rounded-[7px] border-[#A57233]"
                                                    />
                                                    <span className="pr-4 text-[14px] font-semibold text-[#A57233] whitespace-nowrap absolute right-0 top-1/2 -translate-y-1/2">
                                                        {captchaQuestion}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-5 space-y-3">
                                            <div className="flex items-start gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsCustomerAgreed((prev) => !prev)}
                                                    className={`mt-0.5 w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center shrink-0 transition-colors ${isCustomerAgreed
                                                        ? "bg-[#F1A868] border-[#F1A868]"
                                                        : "bg-white border-[#D9CFC0]"
                                                        }`}
                                                    aria-pressed={isCustomerAgreed}
                                                    aria-label="Terms and Conditions agreement"
                                                >
                                                    {isCustomerAgreed && (
                                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                        </svg>
                                                    )}
                                                </button>
                                                <label
                                                    className="text-[12px] sm:text-[13px] leading-relaxed text-[#000] font-quicksand cursor-pointer"
                                                    onClick={() => setIsCustomerAgreed((prev) => !prev)}
                                                >
                                                    I have read and agreed to the{" "}
                                                    <a
                                                        href="/terms-and-conditions.html"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="hover:underline text-secondary font-semibold"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        Terms and Conditions
                                                    </a>.
                                                </label>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsPrivacyAgreed((prev) => !prev)}
                                                    className={`mt-0.5 w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center shrink-0 transition-colors ${isPrivacyAgreed
                                                        ? "bg-[#F1A868] border-[#F1A868]"
                                                        : "bg-white border-[#D9CFC0]"
                                                        }`}
                                                    aria-pressed={isPrivacyAgreed}
                                                    aria-label="Privacy and discounts agreement"
                                                >
                                                    {isPrivacyAgreed && (
                                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                        </svg>
                                                    )}
                                                </button>
                                                <label
                                                    className="text-[12px] sm:text-[13px] leading-relaxed text-[#000] font-quicksand cursor-pointer"
                                                    onClick={() => setIsPrivacyAgreed((prev) => !prev)}
                                                >
                                                    By checking this box you agreed for existing customers discounts and contact.
                                                </label>
                                            </div>
                                        </div>

                                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2" aria-hidden>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="40.5" height="3.469" viewBox="0 0 40.5 3.469">
                                                <g transform="translate(-60 -27.531)">
                                                    <line x2="29" transform="translate(60.5 28.031)" fill="none" stroke="#a57233" strokeLinecap="round" strokeWidth="1" />
                                                    <line x2="29" transform="translate(71 30.5)" fill="none" stroke="#a57233" strokeLinecap="round" strokeWidth="1" />
                                                </g>
                                            </svg>
                                        </div>
                                        <div className="h-2" />
                                    </div>
                                </div>
                            </div>

                            {/* Footer actions */}
                            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-6 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveStep(1)}
                                    className="w-full sm:w-auto px-6 py-3 rounded-xl border border-secondary text-secondary bg-white font-quicksand text-[14px] sm:text-[15px] font-semibold hover:bg-secondary hover:text-white transition-colors"
                                >
                                    View Search Results
                                </button>
                                <button
                                    type="button"
                                    disabled={isBooking || isButtonDisabled}
                                    onClick={handlePnrCreated}
                                    className={`w-full sm:w-auto px-6 py-3 rounded-xl font-quicksand text-[14px] sm:text-[15px] font-semibold transition-colors shadow-[0_8px_20px_rgba(165,114,51,0.18)] ${isButtonDisabled || isBooking
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                                        : "bg-white text-secondary border border-[#E8DFD2] hover:bg-secondary hover:text-white hover:border-secondary"
                                        }`}
                                >
                                    {isBooking ? 'Processing...' : 'Continue Booking'}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            }
            case 3:
                return (
                    <div className="mx-auto mt-10">
                        <h3 className="text-[28px] font-regular">
                            Payment Details
                        </h3>
                        <p className='text[18px] font-regular mb-8'>
                            All Payments are handled through a secure gateway to keep your Financial Data Protected.
                        </p>

                        <div className="flex flex-col-reverse xl:flex-row gap-4">
                            <div className="w-full xl:w-3/4 border p-5"
                                style={{ borderColor: '#A57233', borderRadius: "25px" }}
                            >
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <div className="flex items-center gap-2">
                                        <p className="text-gray-700 font-semibold text-xl">
                                            Booking Details
                                        </p>
                                    </div>

                                    <p className="text-gray-700 mb-4">
                                        Here are the details of your Booking Request.
                                        Next, you can Proceed with Payment to confirm your Booking.
                                    </p>
                                    <div className="space-y-2 text-gray-700">
                                        <p>
                                            <span className="font-semibold">Brightsun Reference:</span>{" "}
                                            {BookingData?.pnr_response?.pnrInfo?.[0]?.brightsunReference || "N/A"}
                                        </p>
                                        <p>
                                            <span className="font-semibold">Rec Loc:</span>{" "}
                                            {BookingData?.pnr_response?.pnrInfo?.[0]?.recLoc || "N/A"}
                                        </p>
                                        <p>
                                            <span className="font-semibold">Universal Rec Loc:</span>{" "}
                                            {BookingData?.pnr_response?.pnrInfo?.[0]?.universalRecLoc || "N/A"}
                                        </p>
                                        <p>
                                            <span className="font-semibold">Airline Ref:</span>{" "}
                                            {BookingData?.pnr_response?.pnrInfo?.[0]?.airlineRef || "N/A"}
                                        </p>
                                        <p>
                                            <span className="font-semibold">Order Ticket ID:</span>{" "}
                                            {BookingData?.order_ticket_id || "N/A"}
                                        </p>
                                    </div>
                                </div>
                                <div className='flex justify-end items-center' style={{ marginTop: "10px" }}>
                                    <button
                                        onClick={() => {
                                            const form = document.createElement("form");
                                            form.method = "POST";
                                            form.action = "https://payments.securetrading.net/process/payments/choice";

                                            const add = (name, value) => {
                                                const input = document.createElement("input");
                                                input.type = "hidden";
                                                input.name = name;
                                                input.value = value;
                                                form.appendChild(input);
                                            };

                                            const passenger = passengerList[0];

                                            // add("sitereference", "test_travixum131164");
                                            add("sitereference", "travixum113799");
                                            add("version", "2");
                                            add("stprofile", "default");
                                            add("currencyiso3a", "GBP");
                                            add("mainamount", TotalPrice)
                                            // add("mainamount", "1.00")
                                            add("orderreference", savedBooking.order_ticket_id);

                                            add("ruleidentifier", "STR-6");
                                            add("successfulurlredirect", "https://www.emenactravel.co.uk/bookNow");
                                            add("declinedurlredirect", "https://www.emenactravel.co.uk/bookNow");

                                            add("billingprefixname", passenger.title || "MR");
                                            add("billingfirstname", passenger.first_name || "");
                                            add("billingmiddlename", passenger.middle_name || "");
                                            add("billinglastname", passenger.last_name || "");
                                            add("billingemail", email);
                                            add("billingtelephone", `${dialingCode || "+44"}${contactNumber}`);

                                            document.body.appendChild(form);
                                            form.submit();
                                        }}
                                        className="bg-[#F1A868] text-white px-3 py-2 rounded-md text-[18px] font-bold flex items-center gap-2 text-center justify-center"
                                        style={{ height: "50px", width: "145px" }}
                                    >
                                        Pay Now
                                    </button>
                                </div>
                            </div>
                            <div className="w-full xl:w-1/4">
                                <div className=' border p-6'
                                    style={{ borderColor: '#A57233', borderRadius: "25px" }}>
                                    <h3 className="text-[22px] font-regular">
                                        Price Details £(GBP)
                                    </h3>
                                    {Price?.map((item, index) => (
                                        <div key={index} className='border-b border-gray-[400] mt-3 pb-2'>
                                            <div className="flex items-center justify-between w-full">
                                                <p className="text-[15px] font-medium">
                                                    {item?.noOfPax} X {item?.paxTypeName} (Base Fare)
                                                </p>
                                                <p className="text-[14px] font-medium">
                                                    {item?.noOfPax} X £{item?.basePrice}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-between w-full mt-2">
                                                <p className="text-[15px] font-medium">
                                                    {item?.noOfPax} X {item?.paxTypeName} (Taxes)
                                                </p>
                                                <p className="text-[14px] font-medium">
                                                    {item?.noOfPax} X £{item?.tax}
                                                </p>

                                            </div>
                                        </div>
                                    ))}

                                    <div className="flex items-center justify-between w-full mt-2 gap-3">
                                        <h3 className="text-[16px]">
                                            Total Price <br />
                                            <span className='text-[12px] font-normal text-[#000000]' style={{ fontFamily: "inherit" }}>
                                                All prices ( including taxes & fees ) are updated GDP
                                            </span>
                                        </h3>
                                        <p className="text-[24px] font-bold text-[#F1A868]">
                                            £{TotalPrice}
                                        </p>
                                    </div>
                                </div>
                                <div className='hidden xl:flex justify-between items center mt-2'
                                >
                                    <div className='flex flex-col'>
                                        <Link
                                            href="#"
                                            className="flex items-center cursor-pointer"
                                        >
                                            <button className="text-[16px] font-bold text-[#F1A868] rounded transition mr-2"
                                                onClick={() => setShowPopup(true)}
                                            >
                                                Request a Call Back
                                            </button>
                                            <img src={`${BASE_URL_IMG}/assets/svgs/Arrow1.svg`} alt="Arrow" />
                                        </Link>
                                        Too Busy to Dial a Call?
                                    </div>

                                    <div className="flex flex-col">
                                        <a href="tel:02070434343" className="flex items-center">
                                            <button className="text-[16px] font-bold text-[#F1A868] rounded transition mr-2">
                                                Call Us Now
                                            </button>
                                            <img src={`${BASE_URL_IMG}/assets/svgs/Arrow1.svg`} alt="Search" />
                                        </a>
                                        <span>0207 - 043 - 4343</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='block xl:hidden flex justify-between items center mt-2'
                        >
                            <div className='flex flex-col'>
                                <Link
                                    href="#"
                                    className="flex items-center cursor-pointer"
                                >
                                    <button className="text-[16px] font-bold text-[#F1A868] rounded transition mr-2"
                                        onClick={() => setShowPopup(true)}
                                    >
                                        Request a Call Back
                                    </button>
                                    <img src={`${BASE_URL_IMG}/assets/svgs/Arrow1.svg`} alt="Arrow" />
                                </Link>
                                Too Busy to Dial a Call?
                            </div>

                            <div className="flex flex-col">
                                <a href="tel:02070434343" className="flex items-center">
                                    <button className="text-[16px] font-bold text-[#F1A868] rounded transition mr-2">
                                        Call Us Now
                                    </button>
                                    <img src={`${BASE_URL_IMG}/assets/svgs/Arrow1.svg`} alt="Search" />
                                </a>
                                <span>0207 - 043 - 4343</span>
                            </div>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="w-full bg-white rounded-2xl shadow-lg p-2 sm:p-6 border border-gray-100 mb-6">
                        <p className="text-[24px] mb-3 font-bold text-[#A57233]">
                            Booking Confirmation
                        </p>

                        <div className="space-y-4">
                            {/* Confirmation Badge */}
                            <div className="bg-green-100 border border-green-300 rounded-xl p-4 flex items-start space-x-3">
                                <Check className="w-6 h-6 text-green-600 mt-1" />
                                <div>
                                    <p className="text-green-800 font-semibold text-lg">Booking Confirmed!</p>
                                    <p className="text-green-700 text-md mt-2">
                                        <span className="font-semibold"> PNR No : {savedBooking?.pnr_response?.pnrInfo?.[0]?.airlineRef || savedBooking?.pnr_response?.pnrInfo?.[0]?.recLoc}</span>
                                    </p>
                                    <p className="text-green-700 text-md mt-2">
                                        <span className="font-semibold">Order Ticket ID : {savedBooking?.order_ticket_id}</span>
                                    </p>
                                    <p className="text-green-700 text-md mt-2">
                                        <span className="font-semibold">Transaction Reference : {paymentInfo?.transactionreference}</span>
                                    </p>
                                    <p className="text-green-700 text-md mt-2 font-medium">
                                        Congratulations! Your Payment has been successfully Processed.
                                    </p>
                                    <p className="text-green-700 text-md mt-2">
                                        Thank you for Booking with Us.{" "}
                                        <span className="font-medium">Your Reservation has been secured.</span>
                                    </p>
                                </div>
                            </div>

                            {/* Flight Details */}
                            <div className="rounded-xl border border-gray-200 p-5 bg-gray-50">
                                <div className="w-full">
                                    {savedBooking && (() => {
                                        const departure = savedBooking?.flightData?.journey?.[0]?.airSegments || [];
                                        const returnSegments =
                                            savedBooking?.flightData?.journey?.length > 1
                                                ? savedBooking?.flightData?.journey?.[1]?.airSegments || []
                                                : [];
                                        return (
                                            <div className="space-y-6">
                                                {/* Flight Details Departure */}
                                                {departure?.length > 0 && (
                                                    <>
                                                        <p className="text-[24px]" style={{ fontFamily: 'inherit' }}>
                                                            <span className="font-bold text-[#A57233]">Flight Details</span>
                                                            <br />
                                                            <span className="text-[18px]">
                                                                Departing -
                                                                <span className="text-[#F1A868]">&nbsp;{origin}&nbsp;</span>
                                                                to &nbsp;
                                                                <span className="text-[#F1A868]">{destination},&nbsp;</span>
                                                                On <span className="text-[#F1A868]">{formatDate(departure?.[0]?.departDate)}.</span>
                                                            </span>
                                                        </p>

                                                        {departure?.map((flightData, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="border-b border-gray-300 pb-6 flex flex-col gap-6"
                                                            >
                                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center items-start gap-4">
                                                                    <p className="text-[20px] font-bold text-gray-700 sm:w-1/4">
                                                                        Flight {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                                                                    </p>
                                                                    <div className="flex items-center gap-3 sm:w-3/4">
                                                                        <p className="text-[22px] font-bold text-[#F1A868]">{flightData?.origin}</p>
                                                                        <img src={`${BASE_URL_IMG}/assets/svgs/fligtTo.svg`} alt="To" />
                                                                        <p className="text-[22px] font-bold text-[#F1A868]">{flightData?.destination}</p>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center justify-between w-full gap-4">
                                                                    <div className="w-1/4 flex">
                                                                        <img src={flightData?.airlineLogoUrl} alt="Airline" className="max-h-10 object-contain" />
                                                                    </div>
                                                                    <div className="w-3/4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 md:gap-12">
                                                                        <p className="text-md sm:text-[18px] text-[#686868]">
                                                                            {formatDate(flightData?.departDate)}
                                                                        </p>

                                                                        <div className="flex gap-3 sm:gap-4">
                                                                            <p className="text-sm sm:text-[18px] font-medium text-[#AF81AA]">
                                                                                Flight No: {flightData?.flightNumber}
                                                                            </p>
                                                                            <p className="text-sm sm:text-[18px] font-medium text-[#AF81AA]">
                                                                                Equipment: {flightData?.equipment}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="flex flex-row items-center w-full gap-4">
                                                                    <div className="w-1/4">
                                                                        <p className="text-sm md:text-[18px] text-[#686868] font-medium">
                                                                            {flightData?.travelDuration}
                                                                        </p>
                                                                    </div>

                                                                    <div className="flex flex-row items-center gap-4 sm:gap-12 w-3/4">
                                                                        <img
                                                                            src={`${BASE_URL_IMG}/assets/svgs/flightline.svg`}
                                                                            alt="To"
                                                                        />
                                                                        <p className="text-sm md:text-[18px] text-[#686868] leading-6 md:leading-[35px]">
                                                                            {flightData?.departTime} <br />
                                                                            {flightData?.arrivalTime}
                                                                        </p>
                                                                        <p className="text-sm md:text-[18px] text-[#686868] leading-6 md:leading-[35px]">
                                                                            <span className="block md:hidden">
                                                                                {`${flightData?.originAirportCity}, ${flightData?.originAirportCountry}`.slice(0, 18)}...
                                                                                <br />
                                                                                {`${flightData?.destinationAirportCity}, ${flightData?.destinationAirportCountry}`.slice(0, 18)}...
                                                                            </span>
                                                                            <span className="hidden md:block">
                                                                                {`${flightData?.originAirportCity}, ${flightData?.originAirportCountry}`} <br />
                                                                                {`${flightData?.destinationAirportCity}, ${flightData?.destinationAirportCountry}`}
                                                                            </span>
                                                                        </p>
                                                                        {/* <p className="text-sm md:text-[18px] text-[#686868] leading-6 md:leading-[35px]">
                                                                                {`${flightData?.originAirportCity}, ${flightData?.originAirportCountry}`} <br />
                                                                                {`${flightData?.destinationAirportCity}, ${flightData?.destinationAirportCountry}`}
                                                                            </p> */}
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center justify-between w-full mt-4">
                                                                    <div className="flex gap-2 items-center">
                                                                        <img src={`${BASE_URL_IMG}/assets/svgs/flightInput.svg`} alt="Baggage" />
                                                                        <p className="text-sm sm:text-[16px]">Airline : {flightData?.airlineName}</p>
                                                                    </div>
                                                                    <div className="flex gap-2 items-center">
                                                                        <img src={`${BASE_URL_IMG}/assets/svgs/Class.svg`} alt="Class" />
                                                                        <p className="text-sm sm:text-[16px]">Class : {flightData?.class} ({flightData?.subClass})</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </>
                                                )}

                                                {/* Flight Details Return */}
                                                {returnSegments.length > 0 && (
                                                    <>
                                                        <p className="text-[24px]" style={{ fontFamily: 'inherit' }}>
                                                            <span className="text-[18px]">
                                                                Departing - <span className="text-[#F1A868]">{destination}</span> to <span className="text-[#F1A868]">{origin} </span>

                                                                On <span className="text-[#F1A868]">{formatDate(returnSegments?.[0]?.departDate)}.</span>
                                                            </span>
                                                        </p>

                                                        {returnSegments.map((flightData, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="border-b border-gray-300 pb-6 flex flex-col gap-6"
                                                            >
                                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center items-start gap-4">
                                                                    <p className="text-[20px] font-bold text-gray-700 sm:w-1/4">
                                                                        Flight {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                                                                    </p>
                                                                    <div className="flex items-center gap-3 sm:w-3/4">
                                                                        <p className="text-[22px] font-bold text-[#F1A868]">{flightData?.origin}</p>
                                                                        <img src={`${BASE_URL_IMG}/assets/svgs/fligtTo.svg`} alt="To" />
                                                                        <p className="text-[22px] font-bold text-[#F1A868]">{flightData?.destination}</p>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center justify-between w-full gap-4">
                                                                    <div className="w-1/4 flex">
                                                                        <img src={flightData?.airlineLogoUrl} alt="Airline" className="max-h-10 object-contain" />
                                                                    </div>
                                                                    <div className="w-3/4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 md:gap-12">
                                                                        <p className="text-md sm:text-[18px] text-[#686868]">
                                                                            {formatDate(flightData?.departDate)}
                                                                        </p>

                                                                        <div className="flex gap-3 sm:gap-4">
                                                                            <p className="text-sm sm:text-[18px] font-medium text-[#AF81AA]">
                                                                                Flight No: {flightData?.flightNumber}
                                                                            </p>
                                                                            <p className="text-sm sm:text-[18px] font-medium text-[#AF81AA]">
                                                                                Equipment: {flightData?.equipment}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="flex flex-row items-center w-full gap-4">
                                                                    <div className="w-1/4">
                                                                        <p className="text-sm md:text-[18px] text-[#686868] font-medium">
                                                                            {flightData?.travelDuration}
                                                                        </p>
                                                                    </div>

                                                                    <div className="flex flex-row items-center gap-4 sm:gap-12 w-3/4">
                                                                        <img
                                                                            src={`${BASE_URL_IMG}/assets/svgs/flightline.svg`}
                                                                            alt="To"
                                                                        />
                                                                        <p className="text-sm md:text-[18px] text-[#686868] leading-6 md:leading-[35px]">
                                                                            {flightData?.departTime} <br />
                                                                            {flightData?.arrivalTime}
                                                                        </p>
                                                                        <p className="text-sm md:text-[18px] text-[#686868] leading-6 md:leading-[35px]">
                                                                            <span className="block md:hidden">
                                                                                {`${flightData?.originAirportCity}, ${flightData?.originAirportCountry}`.slice(0, 18)}...
                                                                                <br />
                                                                                {`${flightData?.destinationAirportCity}, ${flightData?.destinationAirportCountry}`.slice(0, 18)}...
                                                                            </span>
                                                                            <span className="hidden md:block">
                                                                                {`${flightData?.originAirportCity}, ${flightData?.originAirportCountry}`} <br />
                                                                                {`${flightData?.destinationAirportCity}, ${flightData?.destinationAirportCountry}`}
                                                                            </span>
                                                                        </p>
                                                                        {/* <p className="text-sm md:text-[18px] text-[#686868] leading-6 md:leading-[35px]">
                                                                                {`${flightData?.originAirportCity}, ${flightData?.originAirportCountry}`} <br />
                                                                                {`${flightData?.destinationAirportCity}, ${flightData?.destinationAirportCountry}`}
                                                                            </p> */}
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center justify-between w-full mt-4">
                                                                    <div className="flex gap-2 items-center">
                                                                        <img src={`${BASE_URL_IMG}/assets/svgs/flightInput.svg`} alt="Baggage" />
                                                                        <p className="text-sm sm:text-[16px]">Airline : {flightData?.airlineName}</p>
                                                                    </div>
                                                                    <div className="flex gap-2 items-center">
                                                                        <img src={`${BASE_URL_IMG}/assets/svgs/Class.svg`} alt="Class" />
                                                                        <p className="text-sm sm:text-[16px]">Class : {flightData?.class} ({flightData?.subClass})</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                            <div className='flex flex-wrap gap-3 items-center justify-between'>
                                <div className='flex flex-col items-start'>
                                    <Link href="#" className="flex items-center cursor-pointer" onClick={(e) => e.preventDefault()}>
                                        <button className="text-[16px] font-bold text-[#F1A868] rounded transition mr-2" onClick={() => setShowPopup(true)}>
                                            Request a Call Back</button>
                                        <img src={`${BASE_URL_IMG}/assets/svgs/Arrow1.svg`} alt="Arrow" />
                                    </Link>
                                    <span>Too Busy to Dial a Call?</span>
                                </div>
                                <div className='flex flex-col'>
                                    <a
                                        href="https://wa.me/442070434343?text=Hello%2C%20I%20want%20to%20book%20a%20flight"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center"
                                    >
                                        <button className="text-[16px] font-bold text-[#1CCC2E] rounded transition mr-2">
                                            WhatsApp
                                        </button>
                                        <img src={`${BASE_URL_IMG}/assets/svgs/green-arrow.svg`} alt="Search" />
                                    </a>
                                    <span>0207 - 043 - 4343</span>
                                </div>
                                <div className="flex flex-col items-start md:items-end">
                                    <a href="tel:02070434343" className="flex items-center">
                                        <button className="text-[16px] font-bold text-[#F1A868] rounded transition mr-2">Call Us Now</button>
                                        <img src={`${BASE_URL_IMG}/assets/svgs/Arrow1.svg`} alt="Call" />
                                    </a>
                                    <span>0207 - 043 - 4343</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <>

            {popupMessage && (
                <PopUp
                    title="Error"
                    message={popupMessage}
                    onClose={() => setPopupMessage(null)}
                    navigateOnClose={navigateOnClose}
                    setNavigateOnClose={setNavigateOnClose}
                    handleCallBack={handleCallBack}
                />
            )}

            {showPopup && (
                <CallbackPopup
                    show={showPopup}
                    onClose={() => setShowPopup(false)}
                    phone="0207-043-4343"
                    whatsapp="442070434343"
                />
            )}

            {PayNowLoading ? (
                <LoadingScreen />
            ) : (
                <>
                    <div className="container w-full mx-auto pt-[87px] sm:pt-[100px] pb-2">
                        <div className="max-w-[94%] mx-auto">
                            {/* Progress Tabs */}
                            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between mt-8 mb-4 gap-4">
                                {steps.map((step) => {
                                    const isCompletedOrActive = activeStep >= step.id;

                                    return (
                                        <div
                                            key={step.id}
                                            className="flex items-center space-x-2 cursor-pointer"
                                            onClick={() => {
                                                if (step.id <= activeStep && activeStep !== steps.length) {
                                                    setActiveStep(step.id);
                                                }
                                            }}
                                        >
                                            <div className="flex items-center justify-center">
                                                <img
                                                    src={
                                                        isCompletedOrActive
                                                            ? `${BASE_URL_IMG}/media/fr-svgs/selectedtab.png`
                                                            : `${BASE_URL_IMG}/media/fr-svgs/unselectedtab.png`
                                                    }
                                                    alt="Tab"
                                                    className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10"
                                                />
                                            </div>
                                            <span
                                                className={`text-lg sm:text-xl md:text-2xl lg:text-[25px] font-medium ${isCompletedOrActive ? "text-[#A57233]" : "text-[#A57233]"} truncate`}
                                                style={{ fontFamily: "inherit" }}
                                            >
                                                {step.title}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Step Content */}
                            {getStepContent()}
                        </div>
                    </div>

                </>
            )}

            {VerifyOpen &&
                <Dialog open={VerifyOpen} onClose={() => { }} className="relative z-50">
                    <DialogBackdrop
                        transition
                        className="fixed inset-0 bg-black/50 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
                    />

                    <div className="fixed inset-0 z-50 flex justify-end items-center p-4">
                        <DialogPanel
                            transition
                            className="w-[470px] h-[370px] bg-white rounded-l-3xl shadow-xl transform transition-all overflow-auto relative 
                 data-closed:translate-x-full data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out 
                 data-leave:duration-200 data-leave:ease-in p-5"
                        >
                            <button
                                onClick={() => setVerifyOpen(false)}
                                className="absolute top-5 left-5 text-black text-md z-10"
                            >
                                ✕
                            </button>
                            <div>
                                <h2 className="font-sans font-bold mt-6">
                                    Verify Your Email
                                </h2>
                                <p className='mb-1'>
                                    Please check your inbox for the 6-digit Verification Code sent to <b>{email}</b>  </p>
                                <p className=''>
                                    If you don’t see it, Please check Your <b>Spam</b> Folder.
                                </p>
                                <div className="flex justify-between w-full max-w-sm mx-auto gap-1 my-6">
                                    {VerifyCode?.map((digit, index) => (
                                        <input
                                            key={index}
                                            id={`VerifyCode-${index}`}
                                            type="text"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) =>
                                                handleOtpChange(index, e.target.value, e.nativeEvent)
                                            }
                                            onKeyDown={(e) =>
                                                e.key === "Backspace" &&
                                                !digit &&
                                                index > 0 &&
                                                document.getElementById(`VerifyCode-${index - 1}`).focus()
                                            }
                                            className="border w-12 h-12 text-center rounded-md text-lg"
                                            autoFocus={index === 0}
                                        />
                                    ))}
                                </div>

                                <button
                                    className="bg-primary hover:bg-primaryHover rounded-md w-full text-white py-3 text-sm font-semibold flex gap-1 items-center justify-center"
                                    onClick={handleVerifyOtp}
                                >
                                    <span className='font-semibold'>Verify Code</span>
                                    <img src={`${BASE_URL_IMG}/assets/svgs/Arrow-white-up.svg`} alt="" />
                                </button>
                                <p className="text-md text-black mt-2">
                                    Didn't get the code?{" "}
                                    <button className="text-[#A57233] font-semibold text-base">
                                        Resend Code
                                    </button>
                                </p>
                            </div>
                        </DialogPanel>
                    </div>
                </Dialog>
            }

        </>
    );


};

export default BookingProgressTabs;