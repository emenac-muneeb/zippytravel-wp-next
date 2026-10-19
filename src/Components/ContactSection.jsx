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
    <label className="block text-[13px] sm:text-[14px] font-semibold font-quicksand text-[#A57233] mb-1.5">
        {children}
        {required && <span className="text-[#E11D48] ml-0.5">*</span>}
    </label>
);

const IconBox = ({ src, alt }) => (
    <div className="mr-[-15px] bg-white z-10 flex items-center justify-center w-[34px] h-[34px] shrink-0 border rounded-[4px] border-[#A57233] shadow-[0_0px_2px_rgba(0,0,0,0.06)]">
        <img src={src} alt={alt} className="w-[15px] h-[15px] object-contain" />
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
        setCaptcha({ question: `${a}+${b}`, answer: a + b });
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
        "w-full h-[48px] px-3 pl-6 outline-none bg-transparent text-[14px] font-quicksand text-[#2a211c] placeholder:text-[#A9A3AF] placeholder:font-medium border rounded-[7px] border-[#A57233]";

    return (
        <div className="w-full py-6 font-quicksand">
            {/* Header Section */}
            <div className="section_heading heading_section mb-8">
                {heading ? <h2 className="pre_heading">{heading}</h2> : null}
                {subHeading ? <p className="sub_text">{subHeading}</p> : null}
            </div>

            {/* Form Container */}
            <div className="w-full bg-[#FFF9F4] border border-[#A57233] rounded-[15px] relative
            before:content-[''] before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-[239px] before:h-[4px] 
            before:bg-[#F1A868] before:z-[1]
            after:content-[''] after:absolute after:top-[8px] after:left-1/2 after:-translate-x-1/2 after:w-[239px] after:h-[1px] 
            after:bg-[#F1A868] after:z-[1]">
                <form onSubmit={handleSubmit} className="relative p-5 sm:p-8 md:p-10
                before:content-[''] before:absolute before:bottom-0 before:left-1/2 before:-translate-x-1/2 before:w-[239px] before:h-[4px] 
                before:bg-[#F1A868] before:z-[1]
                after:content-[''] after:absolute after:bottom-[8px] after:left-1/2 after:-translate-x-1/2 after:w-[239px] after:h-[1px] 
                after:bg-[#F1A868] after:z-[1] space-y-5">

                    {/* Row 1: Passenger Name, Phone Number, Email Address */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                        <div>
                            <FieldLabel required>Passenger Name</FieldLabel>
                            <InputShell>
                                <IconBox src="/media/fr-svgs/user.svg" alt="User" />
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
                                <IconBox src="/media/fr-svgs/phonenumber.svg" alt="Phone" />
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
                                <IconBox src="/media/fr-svgs/email.svg" alt="Email" />
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
                            <IconBox src="/media/fr-svgs/writeicon.svg" alt="Message" />
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
                                <IconBox src="/media/fr-svgs/calander.svg" alt="Answer" />
                                <input
                                    className={inputClass}
                                    value={userInput}
                                    placeholder="Select Answer"
                                    onChange={(e) => setUserInput(e.target.value.replace(/[^0-9]/g, ""))}
                                    required
                                />
                                <span className="pr-4 text-[14px] font-semibold text-[#A57233] whitespace-nowrap absolute right-0 top-[50%] -translate-y-1/2">
                                    {captcha?.question || ""}
                                </span>
                            </InputShell>
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`h-[48px] px-8 rounded-[10px] bg-[#A57233] text-white text-[15px] sm:text-[16px] font-semibold font-quicksand flex items-center justify-center gap-2.5 hover:bg-[#8f622c] transition-colors w-full ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                                }`}
                        >
                            {isSubmitting ? "Submitting..." : "Send Message"}
                            {!isSubmitting && (
                                <img src="/media/fr-svgs/send.svg" alt="Send" className="w-[16px] h-[16px]" />
                            )}
                        </button>
                    </div>

                    {/* Row 4: Terms & Conditions Checkbox */}
                    <div className="flex items-start gap-3 pt-2">
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
                            By checking this box you confirm that you have read and agreed to the terms and conditions of Brightsun Travel (UK) Ltd. T/A Emenac Travel. It is the passengers responsibility to ensure that all the details of the booking is correct prior to confirming.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
