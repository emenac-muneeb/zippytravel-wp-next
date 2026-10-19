import React, { useEffect, useState } from 'react';
import api from '../Helpers/apiHelper';
import { endpoints } from '../Helpers/endpoints';

const CookieBanner = () => {
    const [showPopup, setShowPopup] = useState(false);
    const [cookieText, setCookieText] = useState("");

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get(endpoints.generalSettings);
                if (res.data.status === 1) {
                    const contents = res.data.result.footer_setting.contents;
                    const cookieEnabled = contents?.footer_cookies_notice === "1";
                    const text = contents?.cookie_policy_text;

                    setCookieText(text);

                    if (!cookieEnabled) return;

                    const consent = localStorage.getItem('cookieConsent');
                    const timestamp = localStorage.getItem('cookieConsentTimestamp');
                    const now = new Date().getTime();

                    if (!consent || !timestamp) {
                        setShowPopup(true);
                        return;
                    }

                    const lastTime = parseInt(timestamp, 10);

                    if (consent === 'accepted') {
                        const sevenDays = 7 * 24 * 60 * 60 * 1000;
                        if (now - lastTime > sevenDays) setShowPopup(true);
                    }

                    if (consent === 'rejected') {
                        const thirtyMin = 30 * 60 * 1000;
                        if (now - lastTime > thirtyMin) setShowPopup(true);
                    }
                }
            } catch (error) {
                console.error("Error fetching general settings:", error);
            }
        };

        fetchSettings();
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'accepted');
        localStorage.setItem('cookieConsentTimestamp', Date.now().toString());
        setShowPopup(false);
    };

    const handleReject = () => {
        localStorage.setItem('cookieConsent', 'rejected');
        localStorage.setItem('cookieConsentTimestamp', Date.now().toString());
        setShowPopup(false);
    };

    if (!showPopup || !cookieText) return null;

    return (
        <div className="fixed bottom-0 left-0 w-full z-50 bg-gray-800 text-white px-4 py-4 shadow-lg">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
                <div
                    className="flex-1"
                    dangerouslySetInnerHTML={{ __html: cookieText }}
                />
                <div className="flex gap-2 mt-2 md:mt-0">
                    <button
                        onClick={handleAccept}
                        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm"
                    >
                        Accept
                    </button>
                    <button
                        onClick={handleReject}
                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm"
                    >
                        Reject
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieBanner;
