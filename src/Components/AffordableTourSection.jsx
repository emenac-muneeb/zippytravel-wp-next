"use client";
import React, { useMemo, useState } from "react";
import { useGeneralSettings } from "../Context/GeneralSettingsContext";
import { parseBusinessSlogans } from "../Helpers/parseBusinessSlogans";
import FeatureCardPopup from "./FeatureCardPopup";

const AffordableTourSection = ({ heading = "", subheading = "" }) => {
  const { settings, loading } = useGeneralSettings();
  const [showPopup, setShowPopup] = useState(false);

  const { sloganHeading, features, showPopupCardIndex } = useMemo(
    () => parseBusinessSlogans(settings),
    [settings]
  );

  const showHeading = sloganHeading.heading || heading;
  const showSubheading = sloganHeading.subheading || subheading;

  if (loading && features.length === 0) {
    return null;
  }

  if (features.length === 0 && !showHeading) return null;

  return (
    <>
      <div className="py-[15px] sm:py-[25px] ">
        <div className="pb-[50px] relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[378px] after:bg-[#FFF9F3] after:z-[-1]">
          <div className="container">
          {showHeading && (
            <div className="heading_section">
              <h2 className="pre_heading">
                {showHeading}
              </h2>
              <p className="sub_text">
                {showSubheading}
              </p>
            </div>
          )}
          
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[24px] justify-center">
              {features.map((feature, index) => {
                // First <p> from API → heading; remaining <p> → description
                const headingText = feature.title || "";
                const subheadingText = feature.description || "";
                const isPopupCard = showPopupCardIndex ? (index + 1) === showPopupCardIndex : index === 0;

                return (
                  <div
                    key={index}
                    onClick={isPopupCard ? () => setShowPopup(true) : undefined}
                    className={`bg-[#FFFAF5] rounded-[30px] shadow-[0_4px_20px_0_rgba(165,114,51,0.08)] hover:shadow-[0_8px_30px_rgba(165,114,51,0.15)] 
                    hover:-translate-y-[15px] transition-all duration-300 p-[15px] sm:p-[30px] flex flex-col items-start text-left${isPopupCard ? " cursor-pointer" : ""}`}
                  >
                    <div className="w-[104px] h-[104px] rounded-full border-[2px] border-[#A57233] shadow-[4px_4px_0_0_#F7CCA5] flex items-center justify-center mb-[16px] shrink-0">
                      <img
                        src={feature.image}
                        alt={feature.title}
                        className="w-[62px] h-[62px] object-contain"
                      />
                    </div>
                    
                    <div className="mb-2 w-full">
                      <span className="text-[27px] font-[600] text-[#343434] leading-tight block">
                        {headingText}
                      </span>
                    </div>
                    
                    <div className="flex flex-col gap-[3px] my-3 w-full">
                      <div className="w-[85px] h-[4px] bg-[#F1A868]"></div>
                      <div className="w-[85px] h-[1px] bg-[#F1A868]"></div>
                    </div>
                    
                    {subheadingText && (
                      <p className="text-[15px] text-[#343434] leading-[1.3] w-full">
                        {subheadingText}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {showPopup && (
        <FeatureCardPopup
          onClose={() => setShowPopup(false)}
        />
      )}
    </>
  );
};

export default AffordableTourSection;
