"use client";
import { useMemo, useEffect, useState } from 'react';
import React from 'react';
import "../ExternalCSS/LoadingScreen.css";
import { BASE_URL_IMG } from "../Helpers/imageurl";
import api from '../Helpers/apiHelper';
import { endpoints } from '../Helpers/endpoints';
import { parsePortalLogos } from '../Helpers/parseBusinessSlogans';

export default function LoadingScreen() {
    const images = {
        atol: `${BASE_URL_IMG}/assets/svgs/atol-protected-vector-logo-400x400.svg`,
        // feefo: '../Images/feefo.png',
        // google: '../Images/Google.png',
        img1: `${BASE_URL_IMG}/PF_Fare _Loading _Image.png`,
        img2: `${BASE_URL_IMG}/loader/emenac-flight-loader2.png`,
        img3: `${BASE_URL_IMG}/loader/emenac-flight-laoder.png`,
        // trustpilot:  '../Images/Trus.png',
        iata: `${BASE_URL_IMG}/assets/svgs/iata.svg`,
    };

    const randomPlaneImage = useMemo(() => {
        const imageOptions = [images.img1];
        return imageOptions[Math.floor(Math.random() * imageOptions.length)];
    }, [images.img1]);

    const [logos, setLogos] = useState([]);
    useEffect(() => {
        const fetchBrandData = async () => {
            try {
                const response = await api.get(endpoints.generalSettings);
                if (response.data.status === 1) {
                    setLogos(parsePortalLogos(response.data.result.settings));
                }
            } catch (error) {
                console.error("Error fetching branding data:", error);
            }
        };

        fetchBrandData();
    }, []);

    return (
        <div className="flex flex-col lg:flex-row w-full items-center justify-center min-h-screen px-4 lg:px-12 z-[1000] fixed top-0 left-0 right-0 bottom-0 bg-white">

            {/* Responsive Flex Container */}
            <div className="flex flex-col lg:flex-row w-full items-center justify-center">

                {/* Left Section */}
                <div className="flex-1 pl-2 sm:pl-6 md:pl-10 lg:pl-16 xl:pl-20 max-w-full lg:max-w-[43%] justify-center items-center mb-12 lg:mb-0">
                    <div className="mb-8 lg:mb-16 text-center lg:text-left flex flex-col justify-center items-center lg:items-start px-4 sm:px-6 lg:px-0">
                        <span className="text-[2.5rem] sm:text-[3rem] md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-4 text-[#A57233]">
                            Get Ready
                        </span>
                        <span className="text-[3rem] sm:text-[3.5rem] md:text-6xl lg:text-8xl xl:text-8xl font-bold leading-tight flex text-[#A57233]">
                            To Fly
                            <span className="ml-2 flex space-x-1 animate-pulseDots">
                                <span className="">.</span>
                                <span className="">.</span>
                                <span className="">.</span>
                            </span>
                        </span>
                    </div>                   
                </div>

                {/* Right Section with Plane */}
                <div className="flex-1 flex justify-center items-center relative max-w-full lg:max-w-[50%] px-4">
                    <div className="relative w-full max-w-[100%]">
                        <img
                            src={randomPlaneImage}
                            alt="Plane with travel documents"
                            className="w-full h-auto max-h-[500px] lg:max-h-[100%] object-contain"
                            style={{
                                filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.1))',
                                animation: 'float 3s ease-in-out infinite'
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
