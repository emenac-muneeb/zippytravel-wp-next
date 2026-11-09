"use client";
import React from "react";
import "../../ExternalCSS/staticpages.css";

export default function PrivacyPolicyClient({ initialData: privacyPage }) {
  const title = privacyPage?.title || "Privacy Policy";
  const description = privacyPage?.description || "";

  return (
    <div className="w-full bg-white font-poppins">
      <main className="w-full max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-[80px] py-10 sm:py-14 lg:py-16">
        {/* Title: 28px, weight 600, color #5CACC4 */}
        <h1 className="font-poppins font-semibold text-[20px] sm:text-[23px] md:text-[26px] text-[#5CACC4] leading-tight mb-6">
          {title}
        </h1>

        {/* API Content */}
        {description ? (
          <div
            className="parseData"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        ) : (
          <p className="text-[#4C4C4C] text-[22px] font-normal">
            Content not available.
          </p>
        )}
      </main>
    </div>
  );
}
