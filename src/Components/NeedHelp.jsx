"use client";
import React, { useState } from "react";
import CallbackPopup from "./CallbackPopup";
import { BASE_URL_IMG } from "../Helpers/imageurl";
import { useGeneralSettings } from "../Context/GeneralSettingsContext";

const NeedHelp = () => {
  const { footerSetting, frontIcons } = useGeneralSettings();
  const [showPopup, setShowPopup] = useState(false);

  const footerData = footerSetting;
  const phone = footerData?.contents?.footer_phone || "";

  const getFrontIcon = (fileName) => {
    return (frontIcons || []).find((iconUrl) => iconUrl.includes(fileName));
  };

  return (
    <div className="max-w-[94%] mx-auto md:mt-[90px] mb-[40px] min-h-[120px]">
      {showPopup && (
        <CallbackPopup
          show={showPopup}
          onClose={() => setShowPopup(false)}
          phone={phone}
          whatsapp="4420-7043-4343"
        />
      )}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-6 md:gap-8 lg:gap-12 min-h-[120px]">
        <a
          href={phone ? `tel:${phone}` : undefined}
          className="border border-[#56056b] rounded-full flex items-center gap-4 bg-white justify-center w-[300px] h-[80px] shrink-0"
        >
          {getFrontIcon("call-us-know.png") && (
            <img
              src={getFrontIcon("call-us-know.png")}
              alt="Call Icon"
              width={32}
              height={32}
              className="lg:w-8 w-6 lg:h-8 h-6 object-contain"
            />
          )}
          <div className="text-left">
            <p className="text-[#c6002a] font-gloock lg:text-[18px] text-[15px]">
              Call Us Now! <span className="ml-1">→</span>
            </p>
            <p className="lg:text-[22px] text-[17px] text-[#A57233] font-bold mt-[-5px] min-h-[28px]">
              {phone}
            </p>
          </div>
        </a>

        <div className="lg:mt-[-130px] shrink-0 w-64 md:w-58 lg:w-58 xl:w-full max-w-[280px]">
          <img
            src={`${BASE_URL_IMG}/assets/svgs/Help.svg`}
            alt="Help Icon"
            width={280}
            height={120}
            className="w-full h-auto object-contain"
          />
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={() => setShowPopup(true)}
          onKeyDown={(e) => e.key === "Enter" && setShowPopup(true)}
          className="border border-[#56056b] rounded-full flex items-center gap-4 bg-white justify-center w-[300px] h-[80px] shrink-0 cursor-pointer"
        >
          <div className="text-right">
            <p className="text-[#c6002a] font-gloock lg:text-[18px] text-[15px]">
              <span className="mr-1">←</span> Request Call Back!
            </p>
            <p className="lg:text-[22px] text-[17px] text-[#A57233] font-bold mt-[-5px]">
              Too Busy To Talk?
            </p>
          </div>
          {getFrontIcon("call-back.svg") && (
            <img
              src={getFrontIcon("call-back.svg")}
              alt="Callback Icon"
              width={32}
              height={32}
              className="lg:w-8 w-6 lg:h-8 h-6 object-contain"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default NeedHelp;
