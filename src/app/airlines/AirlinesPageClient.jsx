"use client";
import React, { useState } from "react";
import AirlineGrid from "../../Components/AirlineGrid";
import HeroSectionNew from "../../Components/HeroSectionNew";
import FaqSection from "../../Components/FaqSection";

export default function AirlinesPageClient({ initialPageData }) {
  const [pageData] = useState(initialPageData);

  const widgetContent = pageData?.widgets_content || "";

  // Parse all AIRLINES widget instances if provided dynamically
  const airlinesWidgetRegex =
    /\{\{AIRLINES(?:[^}]*)heading="([^"]*)"(?:[^}]*)sub_heading="([^"]*)"(?:[^}]*)?\}\}/g;
  const airlinesWidgets = [];
  let airlinesMatch;
  while ((airlinesMatch = airlinesWidgetRegex.exec(widgetContent)) !== null) {
    airlinesWidgets.push({
      heading: airlinesMatch[1],
      subHeading: airlinesMatch[2],
    });
  }

  const topHeading =
    airlinesWidgets[0]?.heading || pageData?.heading || "Top Class Airlines";
  const topSubHeading =
    airlinesWidgets[0]?.subHeading ||
    pageData?.sub_heading ||
    "Our customers can access our web site for a 'one-stop shop' including access to specially negotiated airfares, hotels, car rental and insurance.";

  const allHeading =
    airlinesWidgets[1]?.heading || "All Available Airlines";
  const allSubHeading =
    airlinesWidgets[1]?.subHeading ||
    "Our customers can access our web site for a 'one-stop shop' including access to specially negotiated airfares, hotels, car rental and insurance.";

  const faqWidget = pageData?.faq_widget?.[0];
  const faqIds = faqWidget?.faq_ids
    ? String(faqWidget.faq_ids)
        .split(",")
        .map((id) => Number(id.trim()))
        .filter(Boolean)
    : [];

  return (
    <div className="w-full bg-white">
      {/* Brand Hero Section with flight attendant background and search box */}
      <HeroSectionNew
        title="Airlines"
        subTitle="— Zippy Travel"
        description={
          pageData?.short_description ||
          "Zippytravel.co.uk is an e-commerce UK based company offering online travel products and services."
        }
        bgImageOverride={pageData?.banner_img?.[0]?.url}
        initialBanners={pageData?.banner_img || []}
      />

      {/* Main Airline Grid Section */}
      <div className="w-full mx-auto pt-12 sm:pt-16">
        <AirlineGrid
          heading={topHeading}
          subHeading={topSubHeading}
          heading2={allHeading}
          subHeading2={allSubHeading}
        />
      </div>

      {/* FAQ Section */}
      {(faqIds.length > 0 || faqWidget?.heading) && (
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 pb-16">
          <FaqSection
            faq_ids={faqIds}
            heading={faqWidget?.heading}
            subheading={faqWidget?.sub_heading}
          />
        </div>
      )}
    </div>
  );
}
