"use client";
import React, { useState } from "react";
import AirlineGrid from "../../Components/AirlineGrid";
import BannerInner from "../../Components/BannerInner";
import FaqSection from "../../Components/FaqSection";
import LoadingScreen from "../../Components/LoadingScreen";
import PopUp from "../../Components/PopUp";

export default function AirlinesPageClient({ initialPageData }) {
  const [pageData] = useState(initialPageData);
  const [FlightLoading, setFlightLoading] = useState(false);
  const [popupMessage, setPopupMessage] = useState(null);

  const widgetContent = pageData?.widgets_content || "";

  // Parse all AIRLINES widget instances
  const airlinesWidgetRegex = /\{\{AIRLINES(?:[^}]*)heading="([^"]*)"(?:[^}]*)sub_heading="([^"]*)"(?:[^}]*)?\}\}/g;
  const airlinesWidgets = [];
  let airlinesMatch;
  while ((airlinesMatch = airlinesWidgetRegex.exec(widgetContent)) !== null) {
    airlinesWidgets.push({ heading: airlinesMatch[1], subHeading: airlinesMatch[2] });
  }

  const topHeading = airlinesWidgets[0]?.heading || "Top Business Class Airlines";
  const topSubHeading = airlinesWidgets[0]?.subHeading || "Find your desired flight from UK to Worldwide.";
  const allHeading = airlinesWidgets[1]?.heading || "All Airlines We Work With...";
  const allSubHeading = airlinesWidgets[1]?.subHeading || "Find your desired flight from UK to Worldwide.";

  const faqWidget = pageData?.faq_widget?.[0];
  const faqIds = faqWidget?.faq_ids
    ? String(faqWidget.faq_ids)
      .split(",")
      .map((id) => Number(id.trim()))
      .filter(Boolean)
    : [];

  return (
    <>
      {popupMessage && (
        <PopUp
          title="Error"
          message={popupMessage}
          onClose={() => setPopupMessage(null)}
        />
      )}

      {FlightLoading ? (
        <LoadingScreen />
      ) : (
        <>
          <BannerInner
            setFlightLoading={setFlightLoading}
            setPopupMessage={setPopupMessage}
            initialBanners={[]}
            bgImageOverride={pageData?.banner_img?.[0]?.url}
            showClassSelector={false}
          />

          <div className="w-full mx-auto py-2 pt-[40px] sm:pt-[55px]">
            <div className="container">
              <AirlineGrid
                heading={topHeading}
                subHeading={topSubHeading}
                heading2={allHeading}
                subHeading2={allSubHeading}
              />
            </div>
          </div>
          {(faqIds.length > 0 || faqWidget?.heading) && (
            <FaqSection
              faq_ids={faqIds}
              heading={faqWidget?.heading}
              subheading={
                faqWidget?.sub_heading
              }
            />
          )}
        </>
      )}
    </>
  );
}
