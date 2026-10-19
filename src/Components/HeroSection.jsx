// import React, { useState, useEffect } from 'react';
// import FlightTab from './FlightTab';
// import HolidayTab from './HolidayTab';
// import UmrahTab from './UmrahTab';
// import axios from 'axios';
// import { endpoints } from '../Helpers/endpoints';
// import { BASE_URL_IMG } from '../Helpers/imageurl';
// import '../ExternalCSS/HeroSection.css'

// const HeroSection = ({ setFlightLoading, setPopupMessage }) => {
//     const [activeTab, setActiveTab] = useState('flights');
//     const [banners, setBanners] = useState([]);

//     const tabs = [
//         { name: 'FLIGHTS', icon: `${BASE_URL_IMG}/assets/svgs/flight.svg` },
//         { name: 'HOLIDAYS', icon: `${BASE_URL_IMG}/assets/svgs/holiday.svg` },
//         { name: 'UMRAH', icon: `${BASE_URL_IMG}/assets/svgs/umrah.svg` },
//     ];

//     useEffect(() => {
//         axios
//             .get(endpoints.banner)
//             .then((res) => {
//                 if (res.data.status === 1) {
//                     setBanners(res.data.result);
//                 }
//             })
//             .catch((err) => console.error('Failed to fetch banners:', err));
//     }, []);

//     const getCurrentBanner = () =>
//         banners.find((item) => item.slug.toLowerCase() === activeTab);

//     const currentBanner = getCurrentBanner();

//     const getBannerImage = () => {
//         if (!currentBanner || !currentBanner.image_url) return '';
//         return `${BASE_URL_IMG}/media/${currentBanner.image_url}`;
//     };

//     return (
//         <div className="relative w-full -mb-10">
//             {/* Container for the entire hero section */}
//             <div className="relative w-full max-w-[90%] mx-auto my-8 sm:my-12 md:my-16">

//                 {/* Pills positioned above banner */}
//                 <div className="relative z-20 flex justify-center mb-4 sm:mb-6 md:mb-8">
//                     <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 justify-center">
//                         {tabs.map((tab) => (
//                             <button
//                                 key={tab.name}
//                                 onClick={() => setActiveTab(tab.name.toLowerCase())}
//                                 className={`flex items-center justify-center gap-1 sm:gap-2 rounded-full text-white font-bold transition-colors duration-300 ${activeTab === tab.name.toLowerCase()
//                                     ? 'bg-[#F1A868]'
//                                     : 'bg-[#AF81AA]'
//                                 }`}
//                                 style={{
//                                     height: 'clamp(35px, 6vw, 55px)',
//                                     width: 'clamp(100px, 20vw, 160px)',
//                                     fontSize: 'clamp(10px, 2vw, 16px)',
//                                     padding: '0 8px',
//                                 }}
//                             >
//                                 <img
//                                     src={tab.icon}
//                                     alt={tab.name}
//                                     className="flex-shrink-0"
//                                     style={{
//                                         width: 'clamp(12px, 3vw, 20px)',
//                                         height: 'clamp(12px, 3vw, 20px)'
//                                     }}
//                                 />
//                                 <span className="truncate text-center">{tab.name}</span>
//                             </button>
//                         ))}
//                     </div>
//                 </div>

//                 {/* Banner Background - extends to cover tabs on mobile/tablet */}
//                 <div
//                     className="relative hero-section-background w-full bg-cover bg-center bg-no-repeat rounded-md"
//                     style={{
//                         backgroundImage: `url('Images/Group 6429 (1).png')`,
//                         height: 'clamp(500px, 40vh, 500px)',
//                         minHeight: '500px',
//                         marginTop: 'clamp(-60px, -8vw, 0px)',
//                         paddingTop: 'clamp(60px, 8vw, 0px)',
//                     }}
//                 >
//                     {/* Overlay */}
//                     <div className="absolute inset-0 rounded-md"></div>
//                 </div>

//                 <div className="relative hero-section-container -mt-[clamp(500px, 1vh, 240px)] md:-mt-[clamp(450px,12vh,140px)] lg:-mt-[clamp(300px,12vh,140px)] z-30 px-2 sm:px-4">
//                     <div className="w-full max-w-6xl mx-auto">
//                         {/* Tab content container with responsive sizing */}
//                         <div
//                             className="transform scale-[clamp(0.7,1vw,1)] origin-top"
//                             style={{
//                                 minHeight: 'clamp(200px, 20vh, 300px)'
//                             }}
//                         >
//                             {activeTab === 'flights' && (
//                                 <FlightTab
//                                     setFlightLoading={setFlightLoading}
//                                     title={currentBanner?.title}
//                                     description={currentBanner?.description}
//                                     activeTab={activeTab}
//                                     setPopupMessage={setPopupMessage}
//                                 />
//                             )}
//                             {activeTab === 'holidays' && (
//                                 <HolidayTab
//                                     title={currentBanner?.title}
//                                     description={currentBanner?.description}
//                                 />
//                             )}
//                             {activeTab === 'umrah' && (
//                                 <UmrahTab
//                                     title={currentBanner?.title}
//                                     description={currentBanner?.description}
//                                 />
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Bottom spacer to prevent content overlap */}
//             <div className="h-[clamp(40px,8vh,80px)]"></div>
//         </div>
//     );
// };

// export default HeroSection;

import React, { useState, useEffect } from 'react';
import FlightTab from './FlightTab';
import HolidayTab from './HolidayTab';
import UmrahTab from './UmrahTab';
import axios from 'axios';
import { endpoints } from '../Helpers/endpoints';
import { BASE_URL_IMG } from "../Helpers/imageurl";

const HeroSection = ({ setFlightLoading, setPopupMessage }) => {
    const [activeTab, setActiveTab] = useState('flights');
    const [banners, setBanners] = useState([]);
    // console.log(banners)
    const tabs = [
        { name: 'FLIGHTS', icon: `${BASE_URL_IMG}/assets/svgs/flight.svg` },
        { name: 'HOLIDAYS', icon: `${BASE_URL_IMG}/assets/svgs/holiday.svg` },
        { name: 'UMRAH', icon: `${BASE_URL_IMG}/assets/svgs/umrah.svg` },
    ];

    useEffect(() => {
        axios.get(endpoints.banner)
            .then((res) => {
                if (res.data.status === 1) {
                    setBanners(res.data.result);
                }
            })
            .catch((err) => console.error('Failed to fetch banners:', err));
    }, []);

    const getCurrentBanner = () => banners.find(item => item.slug.toLowerCase() === activeTab);


    const currentBanner = getCurrentBanner();
    // console.log(`the current banners:`, currentBanner)

    const getBannerImage = () => {
        if (!currentBanner || !currentBanner.image_url) return '';
        return `${BASE_URL_IMG}/media/${currentBanner.image_url}`;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 container  py-6 max-w-[92%] mx-auto  ">
            {/* Image first for md and down, last for lg */}
            <div className="block md:block lg:hidden">
                {getBannerImage() && currentBanner && (
                    <img
                        src={getBannerImage()}
                        alt={currentBanner.image_alt || 'Banner'}
                        title={currentBanner.image_title || ''}
                        className="w-full h-40 object-cover md:h-28"
                    />
                )}
            </div>

            {/* Text + tabs */}
            <div className="flex flex-col w-full max-w-4xl mx-auto">
                {/* Tab buttons */}
                <div className="flex space-x-4 mb-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(tab.name.toLowerCase())}
                            className={`flex items-center justify-center gap-1 rounded-full text-white text-[16px] font-bold ${activeTab === tab.name.toLowerCase()
                                ? 'bg-[#F1A868]'
                                : 'bg-[#AF81AA]'
                                }`}
                            style={{ height: '50px', width: '145px' }}
                        >
                            <img src={tab.icon} alt={tab.name} />
                            {tab.name}
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                <div
                    className="flex justify-center items-center max-[1050px]:px-6 max-[1050px]:py-4 w-full max-w-4xl mx-auto"
                >
                    {activeTab === 'flights' && (
                        <FlightTab
                            setFlightLoading={setFlightLoading}
                            title={currentBanner?.title}
                            description={currentBanner?.description}
                            activeTab={activeTab}
                            setPopupMessage={setPopupMessage}
                        />
                    )}
                    {activeTab === 'holidays' && (
                        <HolidayTab
                            title={currentBanner?.title}
                            description={currentBanner?.description}
                        />
                    )}
                    {activeTab === 'umrah' && (
                        <UmrahTab
                            title={currentBanner?.title}
                            description={currentBanner?.description}
                        />
                    )}
                </div>

            </div>

            {/* Right-side image (desktop only) */}
            <div className="hidden lg:flex justify-center items-center">
                {getBannerImage() && currentBanner && (
                    <img
                        src={getBannerImage()}
                        alt={currentBanner.image_alt || 'Banner'}
                        title={currentBanner.image_title || ''}
                        className="h-[600px] object-contain"
                    />
                )}
            </div>
        </div>

    );
};

export default HeroSection;
