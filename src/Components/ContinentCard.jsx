"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { endpoints } from '../Helpers/endpoints';
import { BASE_URL_IMG } from '../Helpers/imageurl';

export default function ContinentCard({ continentResponse }) {
    const [continents, setContinents] = useState([]);
    // console.log("ContinentResponse", continentResponse)

    const router = useRouter();

    useEffect(() => {
        axios.get(endpoints.getContinents)
            .then(response => {
                if (response.data.status === 1) {
                    setContinents(response.data.result.data);
                }
            })
            .catch(err => console.error('Error Fetching Continents:', err));
    }, []);

    const handleCardClick = (continent) => {
        router.push(`/${continent.slug}`);
    };

    return (
        <div id="continent-destinations-grid" className="">
            <div className="container mx-auto">
                {continents.length === 0 ? (
                    <p className="text-center text-gray-500">No destinations available at the moment.</p>
                ) : (
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" >
                        {continents.map((continent) => (
                            <Link href={`/${continent.slug}`} key={continent.id}>
                                <div
                                    key={continent.id}
                                    // onClick={() => handleCardClick(continent)}
                                    className="relative rounded-lg overflow-hidden cursor-pointer w-full max-w-[424px] shadow-md h-[400px] bg-cover bg-center mx-auto"
                                    style={{ backgroundImage: `url(${BASE_URL_IMG}/media/${continent.image_url})` }}
                                >
                                    {/* Fade overlay */}
                                    <img
                                        src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='424' height='607' viewBox='0 0 424 607'><defs><linearGradient id='linear-gradient' x1='0.5' y1='0.561' x2='0.5' y2='1' gradientUnits='objectBoundingBox'><stop offset='0' stop-opacity='0'/><stop offset='1' stop-opacity='1'/></linearGradient></defs><rect width='424' height='607' rx='10' opacity='0.75' fill='url(%23linear-gradient)'/></svg>"
                                        alt=""
                                        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                                    />

                                    {/* Title */}
                                    <div className="absolute bottom-0 left-0 p-4 text-white text-lg font-semibold z-10">
                                        {continent.title}
                                    </div>

                                    {/* View All Fares (still clickable via outer div) */}
                                    <div className="absolute bottom-0 right-0 p-4 text-white text-sm z-10">
                                        <span className="flex items-center hover:underline text-sm font-medium gap-2">
                                            View All Fares
                                            <img
                                                src={`${BASE_URL_IMG}/assets/svgs/Arrow-white-up.svg`}
                                                alt=""
                                                aria-hidden
                                            />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
