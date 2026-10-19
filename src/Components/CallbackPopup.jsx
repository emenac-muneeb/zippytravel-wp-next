"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { User, Phone, X, ArrowRight } from 'lucide-react';
import { BASE_URL_IMG } from '../Helpers/imageurl';
import { endpoints } from '../Helpers/endpoints';
import axios from 'axios';

const CallbackPopup = ({ onClose, phone, whatsapp }) => {
    const router = useRouter();
    const [form, setForm] = useState({ name: '', phone: '', captcha: '' });
    const [captchaQuestion, setCaptchaQuestion] = useState('');
    const [captchaAnswer, setCaptchaAnswer] = useState(null);
    const [pageURL, setPageURL] = useState('');

    // Generate captcha on mount
    useEffect(() => {
        setPageURL(window.location.href);
        generateCaptcha();
    }, []);

    const generateCaptcha = () => {
        const a = Math.floor(Math.random() * 9) + 1;
        const b = Math.floor(Math.random() * 9) + 1;
        setCaptchaQuestion(`${a} + ${b}`);
        setCaptchaAnswer(a + b);
    };

    const handleSubmit = async () => {
        if (!form.name || !form.phone || !form.captcha) {
            toast.error('Please fill in all fields.');
            return;
        }

        if (parseInt(form.captcha) !== captchaAnswer) {
            toast.error('Incorrect captcha answer.');
            generateCaptcha();
            return;
        }

        try {
            await axios.post(endpoints.sendEmail, {
                name: form.name,
                contact: form.phone,
                contact_detail: {
                    form_type: 'Callback Popup',
                    pageURL: pageURL
                }
            });

            toast.success('Submitted successfully!');
            onClose(); // Close popup
            router.push("/thankyou.html"); // Redirect to thank you page
        } catch (error) {
            const message = error?.response?.data?.message || 'Submission failed.';
            toast.error(message);
            console.error(error);
        }
    };


    const formatWhatsApp = (num) => {
        return num?.replace(/\D/g, '');
    };

    return (
        <div className="fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black bg-opacity-40" onClick={onClose}></div>
            <div className="ml-auto w-full max-w-full sm:max-w-2xl my-auto p-4 bg-white shadow-xl transform transition-transform duration-300 translate-x-0 rounded-l-[55px] overflow-y-auto">

                <button className="absolute top-12 left-4 text-black hover:text-black z-10" onClick={onClose}>
                    <X className="w-5 h-5" />
                </button>

                <div className="p-6 pt-12">
                    <p className="text-center font-medium mb-6">
                        Are you too busy to dial a call? Just drop your contact number, one of our agents will get back to you.
                    </p>

                    <div className="bg-[#F8F5F8] p-5 rounded-xl space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Name */}
                            <div className="flex items-center bg-white p-3 rounded-md">
                                <User className="w-4 h-4 text-secondary mr-2" />
                                <input
                                    type="text"
                                    aria-label="Full Name"
                                    placeholder="Lead Passenger Name"
                                    className="w-full outline-none placeholder:text-gray-400"
                                    value={form.name}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                                        setForm({ ...form, name: value });
                                    }}
                                />

                            </div>

                            {/* Phone */}
                            <div className="flex items-center bg-white p-3 rounded-md">
                                <Phone className="w-4 h-4 text-secondary mr-2" />
                                <input
                                    type="text"
                                    aria-label="Phone Number"
                                    placeholder="Contact #"
                                    className="w-full outline-none placeholder:text-gray-400"
                                    value={form.phone}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^0-9]/g, "");
                                        setForm({ ...form, phone: value });
                                    }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center border rounded-lg px-3 py-2 bg-white">
                                <input
                                    type="text"
                                    name="captchaAnswer"
                                    aria-label="Captcha Answer"
                                    placeholder="Answer"
                                    className="outline-none bg-transparent w-full"
                                    value={form.captcha}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^0-9]/g, "");
                                        setForm({ ...form, captcha: value });
                                    }}
                                    required
                                />
                                <div className="text-gray-500 ml-3 whitespace-nowrap">{captchaQuestion}</div>
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleSubmit}
                                className="w-full bg-[#de002c] hover:bg-[#b60024] transition-colors text-white font-medium rounded-md flex items-center justify-center gap-2 py-3"
                            >
                                <span>Submit</span>
                                <img src={`${BASE_URL_IMG}/assets/svgs/Arrow-white-up.svg`} alt='arrow' />
                            </button>
                        </div>
                    </div>

                    {/* WhatsApp and Call links */}
                    <div className="mt-6 flex justify-between items-center text-sm">
                        <div>
                            <a
                                href={`https://wa.me/${formatWhatsApp(whatsapp)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#25D366] hover:text-[#25D366] text-base font-semibold flex items-center gap-1"
                            >
                                WhatsApp <img src={`${BASE_URL_IMG}/assets/svgs/green-arrow.svg`} alt='arrow' />

                            </a>
                            <span className='text-base'>{whatsapp}</span>
                        </div>
                        <div>
                            <a
                                href={`tel:${phone.replace(/\s|-/g, '')}`}
                                className="text-red-600 text-base font-semibold flex items-center gap-1"
                            >
                                Call Us Now <img src={`${BASE_URL_IMG}/assets/svgs/Arrow1.svg`} alt='arrow' />
                            </a>
                            <span className='text-base'>{phone}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CallbackPopup;
