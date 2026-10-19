import React, { useState } from 'react';
import { BASE_URL_IMG } from '../Helpers/imageurl';
import EnquiryModal from './EnquiryModal';
import { formatDate, formdataProvider } from '../utils/formDataProvider';

const TakeoffIcon = () => (
    <img src={`/media/fr-svgs/takeoff.png`} alt="plane" />
);

const LandingIcon = () => (
    <img src={`/media/fr-svgs/land.png`} alt="plane" />
);

const SeatIcon = () => (
    // <img src={`${BASE_URL_IMG}/assets/svgs/seaticon.png`} alt="Plane" />
    <img src={`/media/fr-svgs/seaticon.png`} alt="seat" />
);

const PhoneIcon = () => (
    <img src={`/media/fr-svgs/callicon.png`} alt="phone" />
);

export default function FlightCard({ cities, cols = 2 }) {
    const [showEnquiryModal, setShowEnquiryModal] = useState(false);
    if (!cities || !Array.isArray(cities)) return null;

    const handleEnquiryClick = (fare) => {
        localStorage.setItem("flightFormData", JSON.stringify(formdataProvider(fare)));
        setShowEnquiryModal(true);
    };

    return (
        <div className={`grid grid-cols-1 ${cols === 1 ? '' : 'lg:grid-cols-2'} gap-6 py-4`}>
            {cities.map((city) =>
                (city.fares || []).map((fare, index) => {
                    const fromCity = fare.origin?.city || 'London';
                    const toCity = fare.destination?.city || city.title || 'N/A';
                    const fromCode = fare.origin?.code || 'LGW';
                    const toCode = fare.destination?.code || 'JNB';
                    const fromCountry = fare.origin?.country || 'United Kingdom';
                    const toCountry = fare.destination?.country || city.country?.title || 'N/A';
                    const price = fare.price || '9,815';
                    const flightType = fare.flight_type || 'Round Trip';
                    const flightClass = fare.flght_class || fare.flight_class || 'Business Class';
                    // Support both nested (fare.airline.title) and flat (fare.airline_name) shapes
                    const airlineName = fare.airline?.title || fare.airline_name || 'Etihad Airways';
                    // airline_logo from paginated API already has /media/ prefix — strip it so the
                    // downstream template `${BASE_URL_IMG}/media/${airlineImage}` stays correct.
                    const rawAirlineImage = fare.airline?.image_url || fare.airline_logo;
                    const airlineImage = rawAirlineImage
                        ? rawAirlineImage.replace(/^\/media\//, '')
                        : undefined;
                    const altText = city.image_alt || airlineName;

                    const priceDisplay = price ? Math.round(price).toLocaleString() : 'N/A';

                    const isReturn = flightType.toLowerCase().includes('return') || flightType.toLowerCase().includes('round');

                    return (
                        <div
                            key={`${city.id}-${index}`}
                            className="bg-white rounded-[24px] border border-[#F2ECE4] p-3.5 sm:p-4 min-[1360px]:p-5 flex flex-col md:flex-row justify-between items-stretch shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-all duration-300 gap-4 sm:gap-5 min-[1360px]:gap-6 overflow-hidden"
                        >
                            {/* Left Column (Flight Details) */}
                            <div className="flex flex-col flex-grow justify-between gap-4 pr-5">
                                {/* Flight leg info */}
                                <div className="flex flex-col min-[500px]:grid min-[500px]:grid-cols-2 items-center gap-3 min-[500px]:gap-2 sm:gap-4">
                                    {/* Origin details */}
                                    <div className="flex flex-col text-center min-[500px]:text-left truncate">
                                        <span className="text-black text-[13px] sm:text-[14px] min-[1360px]:text-[15px] font-normal font-quicksand truncate">{fromCity}</span>
                                        <span className="text-black text-[11px] sm:text-[12px] font-bold font-quicksand truncate">{fromCountry}</span>
                                    </div>



                                    {/* Destination details */}
                                    <div className="flex flex-col text-center min-[500px]:text-right truncate">
                                        <span className="text-black text-[13px] sm:text-[14px] min-[1360px]:text-[15px] font-normal font-quicksand truncate">{toCity}</span>
                                        <span className="text-black text-[11px] sm:text-[12px] font-bold font-quicksand truncate">{toCountry}</span>
                                    </div>
                                </div>
                                <div className='flex flex-col items-center justify-center'>
                                    {/* Journey Line & Codes */}
                                    <div className=" flex flex-col items-center justify-center relative px-1 sm:px-2 min-w-0 w-full max-w-[340px] min-[500px]:max-w-[80%]">
                                        {/* Outbound Leg */}
                                        <span className="text-secondary text-[11px] sm:text-[12px] font-medium font-quicksand mb-1">Direct</span>
                                        <div className="flex items-center w-full justify-between gap-1 sm:gap-2">
                                            <span className="text-[#A57C38] text-[15px] sm:text-[17px] min-[1360px]:text-[18px] font-bold font-quicksand shrink-0">{fromCode}</span>
                                            <div className="flex-grow h-[1px] bg-[#E3DAC9] relative flex items-center justify-center min-w-[15px] sm:min-w-[20px]">
                                                <div className='-mt-[15px] scale-90 sm:scale-100'>
                                                    <TakeoffIcon />
                                                </div>
                                            </div>
                                            <span className="text-[#A57C38] text-[15px] sm:text-[17px] min-[1360px]:text-[18px] font-bold font-quicksand shrink-0">{toCode}</span>
                                        </div>

                                        {/* Inbound Leg (Only if return) */}
                                        {isReturn && (
                                            <div className="w-full flex flex-col items-center mt-3">
                                                <span className="text-secondary text-[11px] sm:text-[12px] font-medium font-quicksand mb-1">02 Stops</span>
                                                <div className="flex items-center w-full justify-between gap-1 sm:gap-2">
                                                    <span className="text-[#A57C38] text-[15px] sm:text-[17px] min-[1360px]:text-[18px] font-bold font-quicksand shrink-0">{toCode}</span>
                                                    <div className="flex-grow h-[1px] bg-[#E3DAC9] relative flex items-center justify-center min-w-[15px] sm:min-w-[20px]">
                                                        <div className='-mt-[20px] scale-90 sm:scale-100'>
                                                            <LandingIcon />
                                                        </div>
                                                    </div>
                                                    <span className="text-[#A57C38] text-[15px] sm:text-[17px] min-[1360px]:text-[18px] font-bold font-quicksand shrink-0">{fromCode}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Footer details */}
                                <div className="grid grid-cols-1 min-[500px]:flex min-[500px]:flex-wrap items-center justify-between  pt-3 sm:pt-4  gap-2 sm:gap-4">
                                    {/* Class */}
                                    <div className="flex items-center gap-1.5 sm:gap-2 justify-center min-[500px]:justify-start">
                                        <SeatIcon />
                                        <span className="text-black text-[12px] sm:text-[13px] min-[1360px]:text-[14px] font-semibold font-quicksand">{flightClass}</span>
                                    </div>

                                    {/* Airline Logo */}
                                    {airlineImage ? (
                                        <img
                                            src={`${BASE_URL_IMG}/media/${airlineImage}`}
                                            alt={altText}
                                            className="w-auto max-w-[150px] object-contain flex-shrink-0 mx-auto min-[500px]:mx-0 my-[10px] min-[500px]:my-0"
                                        />
                                    ) : (
                                        <span className="text-center text-[#727272] text-[12px] sm:text-[13px] min-[1360px]:text-[14px] font-bold font-quicksand">{airlineName}</span>
                                    )}

                                    {/* Contact Phone */}
                                    <div className="flex items-center gap-1.5 sm:gap-2 justify-center min-[500px]:justify-start">
                                        <PhoneIcon />
                                        <span className="text-black text-[12px] sm:text-[13px] min-[1360px]:text-[14px] font-semibold font-quicksand">0205 000 0000</span>
                                    </div>
                                </div>
                            </div>

                            {/* Vertical Separator */}
                            <div className="hidden md:block w-[1px] bg-[#F0E6D8] self-stretch my-2 shrink-0" />

                            {/* Right Column (Pricing & CTA) */}
                            <div className="flex flex-col items-center md:items-center justify-center shrink-0 text-center gap-2.5 sm:gap-3 py-2 mx-0 sm:mx-2 min-[1200px]:mx-3 min-[1360px]:mx-[47px]">
                                <div className="flex flex-col items-start">
                                    <span className="text-black/50 text-[11px] font-quicksand">from</span>
                                    <div className="flex items-baseline mt-0.5 sm:mt-1">
                                        <span className="text-[#A57C38] text-[13px] sm:text-[14px] font-bold font-quicksand self-start mt-[3px]">£</span>
                                        <span className="text-secondary text-[25px] sm:text-[27px] min-[1360px]:text-[29px] font-extrabold font-quicksand leading-none">{priceDisplay}</span>
                                    </div>
                                    <span className="text-black/50 text-[11px] font-quicksand mt-1">Total Per Adult</span>
                                </div>
                                <div className="h-[1px] w-[82px] bg-[#606060] " />
                                <div className="flex flex-col items-center w-full gap-2">
                                    <span className="text-black text-[12px] sm:text-[13px] font-quicksand">Subject to Availability</span>
                                    <button
                                        onClick={() => handleEnquiryClick(fare)}
                                        className="w-full bg-[#FBEFE4] text-secondary font-quicksand text-[13px] sm:text-[14px] py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 group hover:bg-secondary hover:text-white"
                                    >
                                        Enquire Now
                                        <svg xmlns="http://www.w3.org/2000/svg" width="17.411" height="11.09" viewBox="0 0 17.411 11.09" className="group-hover:translate-x-1 transition-transform">
                                            <path id="Path_58571" data-name="Path 58571" d="M-838.359,1086.481h-.25c-5.259,0-7.615,0-12.874,0a1.76,1.76,0,0,1-.449-.039.879.879,0,0,1-.616-.991.884.884,0,0,1,.783-.8,2.932,2.932,0,0,1,.345-.012H-838.3c-.086-.092-.134-.148-.186-.2q-1.4-1.4-2.8-2.793a.921.921,0,0,1-.313-.873.873.873,0,0,1,.621-.71.889.889,0,0,1,.938.22c.432.424.857.854,1.285,1.282l3.253,3.257a.935.935,0,0,1,0,1.472c-1.5,1.5-3,2.992-4.487,4.5a.933.933,0,0,1-1.6-.414.889.889,0,0,1,.292-.9q1.4-1.4,2.8-2.794a.829.829,0,0,1,.208-.112Z" transform="translate(852.554 -1080.015)" fill="currentColor" />
                                        </svg>

                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}

            {showEnquiryModal && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-end items-center">
                    <div className=" w-full sm:w-[90%] md:w-[80%] lg:w-[60%] max-w-5xl relative h-auto max-h-[90%] overflow-y-auto shadow-lg">
                        <button
                            onClick={() => setShowEnquiryModal(false)}
                            className="absolute top-3 right-5 z-10 text-[#3D3D3D] text-2xl font-bold hover:text-[#A57233]"
                        >
                            &times;
                        </button>

                        <EnquiryModal
                            formatDate={formatDate}
                            onClose={() => setShowEnquiryModal(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
