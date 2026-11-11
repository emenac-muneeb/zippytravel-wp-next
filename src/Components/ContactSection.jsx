"use client";
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { endpoints } from '../Helpers/endpoints';
import axios from 'axios';

function normalizeSlugParam(slug) {
    if (!slug) return '';
    const raw = Array.isArray(slug) ? slug.join('/') : String(slug);
    return raw.replace(/\.html?$/i, '').replace(/-/g, ' ');
}

const FieldLabel = ({ children, required = false }) => (
    <label className="block text-[14px] font-semibold font-poppins text-[#1F0060] mb-2">
        {children}
        {required && <span className="text-[#E11D48] ml-0.5">*</span>}
    </label>
);

const IconBox = ({ src, alt, imgClassName = "", style }) => (
    <div className="mr-[-15px] bg-[#F8FAFC] z-10 flex items-center justify-center w-[36px] h-[36px] shrink-0 border rounded-[6px] border-[#CBD5E1] shadow-sm">
        <img src={src} alt={alt} className={`w-[16px] h-[16px] object-contain ${imgClassName}`} style={style} />
    </div>
);

const InputShell = ({ children, className = "" }) => (
    <div className={`flex items-center w-full bg-white overflow-hidden transition-colors ${className}`}>
        {children}
    </div>
);

export default function ContactSection({ heading = "", subHeading = "" }) {
    const params = useParams();
    const router = useRouter();

    const [captcha, setCaptcha] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userIp, setUserIp] = useState("");

    const [name, setName] = useState("");
    const [contact, setContact] = useState("");
    const [email, setEmail] = useState("");
    const [note, setNote] = useState("");
    const [userInput, setUserInput] = useState("");
    const [agreed, setAgreed] = useState(true);

    const generateCaptcha = () => {
        const a = Math.floor(Math.random() * 9) + 1;
        const b = Math.floor(Math.random() * 9) + 1;
        setCaptcha({ question: `${a} + ${b}`, answer: a + b });
        setUserInput("");
    };

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting) return;

        if (!name || !contact || !email || !userInput) {
            toast.error('Please fill all required fields.');
            return;
        }

        if (!agreed) {
            toast.error('Please agree to the terms and conditions.');
            return;
        }

        if (!captcha || parseInt(userInput, 10) !== captcha.answer) {
            toast.error('Incorrect CAPTCHA answer.');
            generateCaptcha();
            return;
        }

        const formTypeLabel = normalizeSlugParam(params?.slug) || 'Contact US';

        try {
            setIsSubmitting(true);

            const payload = {
                name: name.trim(),
                contact,
                email,
                contact_detail: {
                    user_ip: userIp,
                    subject: 'Contact Form',
                    message: note || 'Contact form submission.',
                    type: `${formTypeLabel} form`,
                },
            };

            const { data } = await axios.post(endpoints.sendEmail, payload);

            if (data?.status === 1) {
                router.push("/thankyou.html");
                setName('');
                setContact('');
                setEmail('');
                setNote('');
                setUserInput('');
                generateCaptcha();
            } else {
                toast.error(data?.message || 'Something went wrong. Please try again.');
            }
        } catch (error) {
            console.error(error);
            toast.error('There was an error sending your message. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass =
        "w-full h-[50px] px-3 pl-6 outline-none bg-white text-[14px] sm:text-[15px] font-poppins text-[#222222] placeholder:text-[#8FA0AD] placeholder:font-normal border rounded-[10px] border-[#CBD5E1] focus:border-[#5CACC4] transition-colors";

    return (
        <div className="w-full py-6 font-poppins">
            {/* Header Section without line above */}
            {(heading || subHeading) && (
                <div className="text-center max-w-[800px] mx-auto mb-8">
                    {heading ? <h2 className="pre_heading">{heading}</h2> : null}
                    {subHeading ? <p className="sub_text mt-2 sm:mt-3">{subHeading}</p> : null}
                </div>
            )}

            {/* Form Container */}
            <div className="w-full bg-white border border-[#E2E8F0] rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] relative overflow-hidden">
                <form onSubmit={handleSubmit} className="p-5 sm:p-8 md:p-10 space-y-5">
                    {/* Row 1: Passenger Name, Phone Number, Email Address */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                        <div>
                            <FieldLabel required>Passenger Name</FieldLabel>
                            <InputShell>
                                <IconBox src="/media/fr-svgs/Layer_1.png" alt="User" />
                                <input
                                    className={inputClass}
                                    value={name}
                                    placeholder="Your Name"
                                    onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
                                    required
                                />
                            </InputShell>
                        </div>
                        <div>
                            <FieldLabel required>Phone Number</FieldLabel>
                            <InputShell>
                                <IconBox src="/media/fr-svgs/Layer_2.png" alt="Phone" />
                                <input
                                    className={inputClass}
                                    value={contact}
                                    placeholder="Type your contact number"
                                    onChange={(e) => setContact(e.target.value.replace(/[^0-9]/g, ""))}
                                    required
                                />
                            </InputShell>
                        </div>
                        <div>
                            <FieldLabel required>Email Address</FieldLabel>
                            <InputShell>
                                <IconBox src="/media/fr-svgs/Layer_3.png" alt="Email" />
                                <input
                                    type="email"
                                    className={inputClass}
                                    value={email}
                                    placeholder="Type your email address"
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </InputShell>
                        </div>
                    </div>

                    {/* Row 2: Type Message */}
                    <div>
                        <FieldLabel>Type Message</FieldLabel>
                        <InputShell>
                            <IconBox src="/media/fr-svgs/Layer_4.png" alt="Message" />
                            <input
                                className={inputClass}
                                value={note}
                                placeholder="Type Message..."
                                onChange={(e) => setNote(e.target.value)}
                            />
                        </InputShell>
                    </div>

                    {/* Row 3: Captcha Answer & Submit Button */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-end">
                        <div>
                            <FieldLabel>Answer</FieldLabel>
                            <InputShell className="relative">
                                <IconBox
                                    src="/media/fr-svgs/dateicon.png"
                                    alt="Answer"
                                    style={{
                                        filter: "brightness(0) saturate(100%) invert(8%) sepia(87%) saturate(5412%) hue-rotate(264deg) brightness(69%) contrast(124%)"
                                    }}
                                />
                                <input
                                    className={inputClass}
                                    value={userInput}
                                    placeholder="Enter Answer"
                                    onChange={(e) => setUserInput(e.target.value.replace(/[^0-9]/g, ""))}
                                    required
                                />
                                <span className="pr-4 text-[15px] font-bold text-[#1F0060] whitespace-nowrap absolute right-0 top-[50%] -translate-y-1/2 font-poppins">
                                    {captcha?.question ? `${captcha.question} = ?` : ""}
                                </span>
                            </InputShell>
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`h-[50px] px-8 rounded-[12px] bg-[#5CACC4] text-white text-[16px] font-bold font-poppins flex items-center justify-center gap-2.5 hover:bg-[#4ea0b8] transition-colors w-full shadow-md ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                                }`}
                        >
                            <span>{isSubmitting ? "Submitting..." : "Send Message"}</span>
                            <img src="/media/fr-svgs/send.svg" alt="Send Message" className="w-[18px] h-[18px] object-contain" />
                        </button>
                    </div>

                    {/* Row 4: Terms & Conditions Checkbox */}
                    <div className="flex items-start gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setAgreed((prev) => !prev)}
                            className={`mt-0.5 w-[20px] h-[20px] rounded-[5px] border flex items-center justify-center shrink-0 transition-colors ${agreed
                                ? "bg-[#5CACC4] border-[#5CACC4]"
                                : "bg-white border-[#CBD5E1]"
                                }`}
                            aria-pressed={agreed}
                            aria-label="Agree to terms"
                        >
                            {agreed && (
                                <svg
                                    className="w-3.5 h-3.5 text-white"
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
                        <p className="text-[12px] sm:text-[13px] leading-relaxed text-[#4A5568] font-poppins">
                            By checking this box you confirm that you have read and agreed to the terms and conditions of Zippy Travel (zippytravel.co.uk). It is the passenger&apos;s responsibility to ensure that all the details of the booking are correct prior to confirming.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
