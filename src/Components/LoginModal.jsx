"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff } from "react-icons/fi";
import { endpoints } from '../Helpers/endpoints';
import axios from "axios";
import { BASE_URL_IMG } from "../Helpers/imageurl";

const AirplaneLoader = () => (
    <div className="flex flex-col items-center justify-center my-6">
        <svg
            viewBox="0 0 1024 1024"
            class="icon"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            fill="#000000"
        >
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
                <path d="M200.5 484.7H77.4l-0.9-168h43.8z" fill="#FFEB4D"></path>
                <path
                    d="M897 652.7H245.5c-92.8 0-168-75.2-168-168h725.6c93.4 0 146.4 51.7 146.4 115.4 0 29-23.5 52.6-52.5 52.6z"
                    fill="#DAE5FF"
                ></path>
                <path d="M124.4 600.7c30.6 31.8 73.5 51.6 121.2 51.6H897c28.7 0 52-23 52.5-51.6H124.4z"
                    fill="#FFACC2"
                ></path>
                <path d="M776.5 513.7h32v42h-32z" fill="#FFFFFF"></path>
                <path
                    d="M808.5 562.7h-32c-4.4 0-8-3.1-8-7v-42c0-3.9 3.6-7 8-7h32c4.4 0 8 3.1 8 7v42c0 3.8-3.5 7-8 7z m-24-14h16v-28h-16v28z"
                    fill="#9A2D2F"
                ></path>
                <path
                    d="M214.5 555.7h-20c-3.3 0-6-2.7-6-6v-30c0-3.3 2.7-6 6-6h20c3.3 0 6 2.7 6 6v30c0 3.3-2.6 6-6 6z"
                    fill="#FFFFFF"
                ></path>
                <path
                    d="M214.5 562.7h-20c-7.7 0-14-5.5-14-12.2V519c0-6.8 6.3-12.2 14-12.2h20c7.7 0 14 5.5 14 12.2v31.5c0 6.7-6.2 12.2-14 12.2z m-18-14h16v-28h-16v28zM731.5 521.7h-4c-3.3 0-6 2.7-6 6v8c0 3.3 2.7 6 6 6h4c3.3 0 6-2.7 6-6v-8c0-3.3-2.6-6-6-6zM700.5 521.7h-4c-3.3 0-6 2.2-6 5v10c0 2.8 2.7 5 6 5h4c3.3 0 6-2.2 6-5v-10c0-2.8-2.6-5-6-5zM669.5 521.7h-4c-3.3 0-6 2.2-6 5v10c0 2.8 2.7 5 6 5h4c3.3 0 6-2.2 6-5v-10c0-2.8-2.6-5-6-5zM638.5 521.7h-4c-3.3 0-6 2.2-6 5v10c0 2.8 2.7 5 6 5h4c3.3 0 6-2.2 6-5v-10c0-2.8-2.6-5-6-5zM607.5 521.7h-4c-3.3 0-6 2.2-6 5v10c0 2.8 2.7 5 6 5h4c3.3 0 6-2.2 6-5v-10c0-2.8-2.6-5-6-5zM577.5 521.7h-4c-3.3 0-6 2.2-6 5v10c0 2.8 2.7 5 6 5h4c3.3 0 6-2.2 6-5v-10c0-2.8-2.6-5-6-5zM546.5 521.7h-4c-3.3 0-6 2.2-6 5v10c0 2.8 2.7 5 6 5h4c3.3 0 6-2.2 6-5v-10c0-2.8-2.6-5-6-5zM515.5 521.7h-4c-3.3 0-6 2.2-6 5v10c0 2.8 2.7 5 6 5h4c3.3 0 6-2.2 6-5v-10c0-2.8-2.6-5-6-5zM298.5 521.7h-4c-3.3 0-6 2.2-6 5v10c0 2.8 2.7 5 6 5h4c3.3 0 6-2.2 6-5v-10c0-2.8-2.6-5-6-5zM267.5 521.7h-4c-3.3 0-6 2.7-6 6v8c0 3.3 2.7 6 6 6h4c3.3 0 6-2.7 6-6v-8c0-3.3-2.6-6-6-6z"
                    fill="#9A2D2F"
                ></path>
                <path
                    d="M950.5 821.7c-13.8 0-20.7-9.8-25.7-17-5.1-7.3-7.7-10.2-12.7-10.2s-7.5 3-12.7 10.2c-5.1 7.2-12 17-25.7 17-13.8 0-20.7-9.8-25.7-17-5.1-7.3-7.7-10.2-12.7-10.2s-7.5 3-12.7 10.2c-5.1 7.2-12 17-25.7 17-13.8 0-20.7-9.8-25.7-17-5.1-7.3-7.7-10.2-12.7-10.2-4.4 0-8-3.6-8-8s3.6-8 8-8c13.8 0 20.7 9.8 25.7 17 5.1 7.3 7.7 10.2 12.7 10.2 5 0 7.5-3 12.7-10.2 5.1-7.2 12-17 25.7-17s20.7 9.8 25.7 17c5.1 7.3 7.7 10.2 12.7 10.2 5 0 7.5-3 12.7-10.2 5.1-7.2 12-17 25.7-17s20.7 9.8 25.7 17c5.1 7.3 7.7 10.2 12.7 10.2 4.4 0 8 3.6 8 8s-3.5 8-8 8zM950.5 771.7c-13.8 0-20.7-9.8-25.7-17-5.1-7.3-7.7-10.2-12.7-10.2s-7.5 3-12.7 10.2c-5.1 7.2-12 17-25.7 17-13.8 0-20.7-9.8-25.7-17-5.1-7.3-7.7-10.2-12.7-10.2s-7.5 3-12.7 10.2c-5.1 7.2-12 17-25.7 17-13.8 0-20.7-9.8-25.7-17-5.1-7.3-7.7-10.2-12.7-10.2-4.4 0-8-3.6-8-8s3.6-8 8-8c13.8 0 20.7 9.8 25.7 17 5.1 7.3 7.7 10.2 12.7 10.2 5 0 7.5-3 12.7-10.2 5.1-7.2 12-17 25.7-17s20.7 9.8 25.7 17c5.1 7.3 7.7 10.2 12.7 10.2 5 0 7.5-3 12.7-10.2 5.1-7.2 12-17 25.7-17s20.7 9.8 25.7 17c5.1 7.3 7.7 10.2 12.7 10.2 4.4 0 8 3.6 8 8s-3.5 8-8 8zM241.6 259.6c-12.9 0-19.2-10.1-23.8-17.4-4.3-6.9-6.5-9.9-10.2-9.9s-5.9 3-10.2 9.9c-4.6 7.3-10.9 17.4-23.8 17.4s-19.2-10.1-23.8-17.4c-4.3-6.9-6.5-9.9-10.2-9.9s-5.9 3-10.2 9.9c-4.6 7.3-10.9 17.4-23.8 17.4s-19.2-10.1-23.8-17.4c-4.3-6.9-6.5-9.9-10.2-9.9-4.4 0-8-3.6-8-8s3.6-8 8-8c12.9 0 19.2 10.1 23.8 17.4 4.3 6.9 6.5 9.9 10.2 9.9s5.9-3 10.2-9.9c4.6-7.3 10.9-17.4 23.8-17.4s19.2 10.1 23.8 17.4c4.3 6.9 6.5 9.9 10.2 9.9 3.7 0 5.9-3 10.2-9.9 4.6-7.3 10.9-17.4 23.8-17.4s19.2 10.1 23.8 17.4c4.3 6.9 6.5 9.9 10.2 9.9 4.4 0 8 3.6 8 8s-3.6 8-8 8zM263.5 209.6c-13.8 0-20.7-9.8-25.7-17-5.1-7.3-7.7-10.2-12.7-10.2-5 0-7.5 3-12.7 10.2-5.1 7.2-12 17-25.7 17-13.8 0-20.7-9.8-25.7-17-5.1-7.3-7.7-10.2-12.7-10.2s-7.5 3-12.7 10.2c-5.1 7.2-12 17-25.7 17-13.8 0-20.7-9.8-25.7-17-5.1-7.3-7.7-10.2-12.7-10.2-4.4 0-8-3.6-8-8s3.6-8 8-8c13.8 0 20.7 9.8 25.7 17 5.1 7.3 7.7 10.2 12.7 10.2 5 0 7.5-3 12.7-10.2 5.1-7.2 12-17 25.7-17s20.7 9.8 25.7 17c5.1 7.3 7.7 10.2 12.7 10.2 5 0 7.5-3 12.7-10.2 5.1-7.2 12-17 25.7-17s20.7 9.8 25.7 17c5.1 7.3 7.7 10.2 12.7 10.2 4.4 0 8 3.6 8 8s-3.5 8-8 8z"
                    fill="#9A2D2F"
                ></path>
                <path
                    d="M350.1 82m-32 0a32 32 0 1 0 64 0 32 32 0 1 0-64 0Z"
                    fill="#FFEB4D"
                ></path>
                <path
                    d="M350.1 122c-22.1 0-40-17.9-40-40s17.9-40 40-40 40 17.9 40 40-17.9 40-40 40z m0-64c-13.2 0-24 10.8-24 24s10.8 24 24 24 24-10.8 24-24-10.7-24-24-24zM926.5 957.7h-824c-4.4 0-8-3.6-8-8s3.6-8 8-8h824c4.4 0 8 3.6 8 8s-3.5 8-8 8z"
                    fill="#9A2D2F"
                ></path>
                <path
                    d="M233 492.7c4 9.7 20 21.4 47.5 19.2 65.5-5.2 131.9-13.6 204-9.2 136.5 8.2 231.1 1.5 272.6-2 15.8-1.3 48.4-3.5 62.9-7.4-5.5-0.4-11.1-0.6-16.9-0.6H233z"
                    fill="#FFFFFF"
                ></path>
                <path d="M656.3 652.2H456.4l-194.1-203h56.3z" fill="#FFACC2"></path>
                <path
                    d="M701.3 684.7h-70c-8.8 0-16-7.2-16-16v-28c0-8.8 7.2-16 16-16h70c8.8 0 16 7.2 16 16v28c0 8.8-7.2 16-16 16z"
                    fill="#CAE8FF"
                ></path>
                <path
                    d="M916.5 512.4c-27.9-23.3-67.1-35.7-113.4-35.7H379.9l-57.1-34.4c-1.2-0.7-2.7-1.1-4.1-1.1h-56.3c-3.2 0-6.1 1.9-7.4 4.9-1.3 2.9-0.6 6.4 1.6 8.7l21 22h-72.2l-78-163.8c-1.4-2.6-4.1-4.2-7-4.2H76.5c-2.1 0-4.2 0.8-5.7 2.4-1.5 1.5-2.3 3.6-2.3 5.7l0.9 168c0 0.4 0 0.8 0.1 1.2 0.7 96.5 79.4 174.8 176 174.8h361.8v8c0 13.2 10.8 24 24 24h70c13.2 0 24-10.8 24-24v-8H897c33.4 0 60.6-27.2 60.6-60.6-0.1-34.6-14.6-65.8-41.1-87.9z m-113.4-19.7c42.5 0 78.2 11 103.1 31.9 20.9 17.5 33.1 41.4 35 68.1H572.8l-85.7-51.5c2-0.8 3.4-2.5 3.4-4.5v-10c0-2.8-2.7-5-6-5h-4c-3.3 0-6 2.2-6 5v6.9l-68-40.9h396.6z m-718.5-168h31l71.6 152H85.4l-0.8-152z m1.1 168H292.8l28.9 30.2c-1.3 0.9-2.1 2.3-2.1 3.8v10c0 2.8 2.7 5 6 5h4c3.1 0 5.6-1.9 5.9-4.4l53 55.4H127.6c-24.4-26.7-40-61.6-41.9-100z m222.6 151.6h-62.8c-37.2 0-72.3-12.5-100.7-35.6h258.8l34.2 35.7-129.5-0.1z m299-3.6v3.5H459.8L281 457.2h35.4l292.2 175.7c-0.8 2.4-1.3 5-1.3 7.8z m102 28c0 4.4-3.6 8-8 8h-70c-4.4 0-8-3.6-8-8v-28c0-4.4 3.6-8 8-8h70c4.4 0 8 3.6 8 8v28zM897 644.3l-171.7 0.4v-4c0-13.2-10.8-24-24-24h-70c-4.6 0-8.9 1.3-12.6 3.6l-19.3-11.6h341.1c-4.1 20.2-22.2 35.6-43.5 35.6z"
                    fill="#9A2D2F"
                ></path>
            </g>
        </svg>
        <p className="mt-2 text-sm text-gray-600">Sending your data securely...</p>
    </div>
);

export default function LoginModal({ isOpen, onClose, onSwitchToSignUp, loginStep, setloginStep, onSwitchToLogin }) {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const router = useRouter();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const resetStates = () => {
        setloginStep(1);
        setOtp(["", "", "", "", "", ""]);
        setFormData({ email: '', password: '' });
        setShowPassword(false);
        setLoading(false);
    };

    const handleClose = () => {
        resetStates();
        onClose();
    };

    if (!isOpen) return null;

    const handleLogin = async () => {
        const { email, password } = formData;

        if (!email || !password) {
            toast.error("All Fields are Required.");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(`${endpoints.login}`, {
                email,
                password,
            });

            // console.log("API Response:", res);
            // console.log("API Response Data:", res.data);

            if (res.data?.status === 1) {
                const token = res.data?.data?.token;

                if (token) {
                    localStorage.setItem("authToken", token);
                }
                toast.success("Login Successful!");
                router.push('/profile-page');
                setFormData({ email: '', password: '' });
                handleClose();
            } else {
                toast.error(res.data?.message || "Login Failed.");
                // console.log("API Returned status !== 1. Message:", res.data?.message);
            }
        } catch (err) {
            const errMsg = err?.response?.data?.message || "Server error. Please try again.";
            toast.error(errMsg);
            console.error("API Call Error:", err);

            if (err?.response?.data?.message === "Your email is not verified. We've sent you a new verification code. Please check your inbox to verify.") {
                // console.log("Unverified User, Switching to OTP Screen (step 3)");
                setloginStep(3);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index, value, e) => {
        const newOtp = [...otp];
        // Allow only single digit numbers
        if (!/^[0-9]?$/.test(value)) return;
        newOtp[index] = value;
        setOtp(newOtp);

        // Move focus to the next input field
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`).focus();
        }

        // Move focus to the previous input field on backspace if current is empty
        if (e.key === "Backspace" && !value && index > 0) {
            document.getElementById(`otp-${index - 1}`).focus();
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.some((digit) => digit === "")) {
            toast.error("Please enter the complete OTP.");
            return;
        }

        const fullOtp = otp.join("");
        setLoading(true);
        try {
            const res = await axios.post(`${endpoints.verifyCode}`, {
                email: formData.email,
                code: fullOtp,
            });

            if (res.data?.status === 1) {
                toast.success("OTP verified successfully!");
                setloginStep(4); // Go to success step
            } else {
                toast.error(res.data?.message || "Invalid OTP. Please try again.");
                setOtp(["", "", "", "", "", ""]); // Clear OTP fields on failure
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Error verifying OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        const { name, email, password, confirm_password } = formData;

        setLoading(true);
        try {
            const res = await axios.post(`${endpoints.resendOtp}`, {
                name,
                email,
                password,
                confirm_password,
            });

            if (res.data?.status === 1) {
                toast.success("OTP resent successfully!");
            } else {
                toast.error(res.data?.message || "Failed to resend OTP.");
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Server error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div
                className="font-sans fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center sm:justify-end items-center"
                onClick={onClose}
            >
                <div
                    className="bg-white w-full sm:w-[90%] md:w-[70%] lg:w-[50%] xl:w-[35%] max-h-screen h-[90vh] sm:h-[75vh] md:h-[76vh] overflow-y-auto scrollbar-hide rounded-l-3xl p-4 sm:p-6 flex flex-col justify-between animate-slide-in-right"
                    onClick={(e) => e.stopPropagation()}
                >

                    {loading && (
                        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50 rounded-l-3xl">
                            <AirplaneLoader />
                        </div>
                    )}

                    {/* Top bar */}
                    <div className="flex items-center justify-between">
                        {step > 1 ? (
                            <button onClick={() => setStep(step - 1)}>
                                <img src={`${BASE_URL_IMG}/media/fr-svgs/leftarrow.svg`} alt="" />
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    handleClose()
                                }}
                                className=""
                            >
                                <img src={`${BASE_URL_IMG}/assets/svgs/cross.svg`} alt="" />
                            </button>
                        )}
                    </div>

                    {/* Step content */}
                    <div className="flex-1 space-y-4">
                        {loginStep === 1 && (
                            <div className="space-y-4 flex flex-col">
                                <div className='ml-6 mb-2'>
                                    <img src={`${BASE_URL_IMG}/assets/svgs/logo.svg`} alt="Company Logo" className="w-60 my-3" />
                                    <h2 className="font-bold text-black font-sans">Get the full Experience</h2>
                                    <p className="text-sm text-black font-semibold">
                                        Track Prices, make trip planning easier and enjoy faster bookings.
                                    </p>
                                </div>
                                <div className="space-y-4 text-center flex flex-col items-center">

                                    <button
                                        className="w-[90%] bg-gray-200 text-black font-medium py-2 rounded-md mt-4 hover:rounded-lg hover:bg-gray-300 transition-all"
                                        onClick={() => setloginStep(2)}
                                    >
                                        Continue with Email
                                    </button>
                                    <button className="w-[90%] border p-2 bg-gray-200 text-black font-medium rounded-md flex items-center justify-center gap-2 hover:rounded-lg hover:bg-gray-300 transition-all">
                                        <img src={`${BASE_URL_IMG}/assets/svgs/g-icon.svg`} alt="google" className="w-4 h-4" />
                                        Google
                                    </button>
                                    <button className="w-[90%] border p-2 bg-gray-200 text-black font-medium rounded-md flex items-center justify-center gap-2 hover:rounded-lg hover:bg-gray-300 transition-all">
                                        <img src={`${BASE_URL_IMG}/assets/svgs/fb-icon.svg`} alt="facebook" className="w-5 h-5" />
                                        Facebook
                                    </button>
                                    <button className="w-[90%] border p-2 bg-gray-200 text-black font-medium rounded-md flex items-center justify-center gap-2 hover:rounded-lg hover:bg-gray-300 transition-all">
                                        <img src={`${BASE_URL_IMG}/assets/svgs/apple-icon.svg`} alt="apple" className="w-5 h-5" />
                                        Apple
                                    </button>
                                </div>

                            </div>
                        )}

                        {loginStep === 2 && (
                            <div className="space-y-3">
                                <h2 className="font-sans font-bold text-black">What's Your Email Address?</h2>
                                <label className="block text-sm font-medium">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    id='email'
                                    aria-label="Email Address"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    required
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded-md"
                                />
                                <div className="relative mb-4">
                                    <label htmlFor="password" className="block text-base font-semibold sr-only">Password</label>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        aria-label="Password"
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border rounded"
                                        disabled={loading}
                                    />
                                    <span
                                        className="absolute right-3 top-2.5 cursor-pointer text-gray-600"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <FiEye /> : <FiEyeOff />}
                                    </span>
                                </div>
                                <button
                                    className="flex item-center justify-center gap-2 w-full bg-[#A57233]  hover:last:bg-primaryHover transition-all text-white py-2 rounded-md"
                                    onClick={handleLogin}
                                >
                                    <span className='font-semibold'>Login</span>
                                    <img src={`${BASE_URL_IMG}/assets/svgs/Arrow-white-up.svg`} alt="" />
                                </button>

                                <div className='space-y-3 ml-6'>
                                    <label className="flex items-center space-x-3 text-base mt-4 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            id="remember"
                                            aria-label="Remember me"
                                        />

                                        <span className="select-none font-semibold">Remember me</span>
                                    </label>
                                    <p>
                                        Don't have an account?{' '}
                                        <button onClick={onSwitchToSignUp} className="text-[#A57233] font-semibold underline">
                                            Sign up
                                        </button>
                                    </p>


                                    <p className="text-sm text-black font-semibold">
                                        By continuing you agree to our <Link href='/' className="underline">Terms & Conditions</Link> and <Link href='/' className="underline">Privacy Policy</Link>.
                                    </p>
                                </div>
                            </div>
                        )}

                        {loginStep === 3 && (
                            <div>
                                <h2 className="font-sans font-bold text-black mb-2">
                                    Enter Verification Code
                                </h2>
                                <p className="mb-4">
                                    Please enter the 6-digit code sent to <b>{formData.email}</b>
                                </p>
                                <div className="flex justify-between w-full max-w-sm mx-auto gap-1 mb-6">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            id={`otp-${index}`}
                                            type="text"
                                            maxLength={1}
                                            aria-label={`OTP Digit ${index + 1}`}
                                            value={digit}
                                            onChange={(e) =>
                                                handleOtpChange(index, e.target.value, e.nativeEvent)
                                            }
                                            onKeyDown={(e) =>
                                                e.key === "Backspace" &&
                                                !digit &&
                                                index > 0 &&
                                                document.getElementById(`otp-${index - 1}`).focus()
                                            }
                                            className="border w-12 h-12 text-center rounded-md text-lg"
                                            disabled={loading}
                                            autoFocus={index === 0}
                                        />
                                    ))}
                                </div>

                                <button
                                    className="bg-primary hover:bg-primaryHover rounded-md w-full text-white py-3 text-sm font-semibold flex gap-1 items-center justify-center"
                                    onClick={handleVerifyOtp}
                                    disabled={loading}
                                >
                                    <span className='font-semibold'>Verify Code</span>
                                    <img src={`${BASE_URL_IMG}/assets/svgs/Arrow-white-up.svg`} alt="" />
                                </button>
                                <p className="text-sm text-black mt-2">
                                    Didn't get the code?{" "}
                                    <button onClick={handleResendOtp} className="text-[#A57233] font-semibold text-base">
                                        Resend Code
                                    </button>
                                </p>
                            </div>
                        )}

                        {loginStep === 4 && (
                            <div className="text-center space-y-4">
                                <h2 className="font-sans font-bold text-black text-xl">
                                    Sign Up Successful!
                                </h2>
                                <p className="text-black">
                                    Your account has been created successfully.
                                </p>
                                <button
                                    className="bg-[#A57233] rounded-full w-full text-white py-3 text-sm font-semibold"
                                    onClick={() => {
                                        onClose();
                                        onSwitchToLogin();
                                    }}
                                >
                                    Go to Login
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
