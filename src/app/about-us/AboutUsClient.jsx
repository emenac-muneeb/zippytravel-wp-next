"use client";
import React from "react";
import "../../ExternalCSS/staticpages.css";

export default function AboutUsClient({ initialData: aboutPage }) {
  const pageData = aboutPage?.pageData || aboutPage || {};
  const companyStatement = pageData?.company_statement || "";
  const missionStatement = pageData?.mission_statement || "";

  const combinedContent = [companyStatement, missionStatement]
    .filter(Boolean)
    .join("");

  return (
    <div className="w-full bg-white font-poppins">

      {/* =========================================================
          Hero Banner — exact same layout as Home Page:
          - outer section: w-full relative mt-[28px]
          - side-padded wrapper: px-2 sm:px-4 md:px-6 lg:px-8
          - inner card: all 4 corners rounded like home page
         ========================================================= */}
      <section className="w-full relative mt-[28px] mb-[30px] sm:mb-[40px] lg:mb-[50px] font-poppins">
        {/* Side padding wrapper — same as HeroSectionNew */}
        <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 relative">
          {/* Hero card: all 4 corners rounded */}
          <div className="w-full relative overflow-hidden rounded-[28px] sm:rounded-[36px] lg:rounded-[40px] min-h-[520px] sm:min-h-[580px] lg:min-h-[640px] flex flex-col items-center justify-center">

            {/* Background Image */}
            <img
              src="/about-us.png"
              alt="Who We Are - Zippy Travel"
              className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-0"
            />

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/40 pointer-events-none z-[1]" />

            {/* Hero Text */}
            <div className="w-full max-w-[1360px] mx-auto text-center px-4 sm:px-6 relative z-10 py-[80px] sm:py-[100px] lg:py-[120px]">
              <p className="font-poppins font-normal text-[18px] sm:text-[22px] lg:text-[24px] text-white tracking-wide mb-3 sm:mb-4">
                — Zippy Travel
              </p>
              <h1 className="font-poppins font-bold text-[32px] sm:text-[46px] md:text-[54px] lg:text-[64px] text-white tracking-tight leading-[1.15] max-w-[950px] mx-auto drop-shadow-sm">
                Who We Are?<br className="hidden sm:inline" /> Let&apos;s Just Know About Us
              </h1>
              <p className="mt-4 sm:mt-6 font-poppins font-medium text-[16px] sm:text-[20px] lg:text-[24px] text-white/95 max-w-[850px] mx-auto leading-relaxed">
                Travellers always look for comfort on their air trips to the places.<br className="hidden sm:inline" /> Emenac Travel comforts customers over their budgets.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Main Content from API */}
      <main className="w-full max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-[80px] py-12 sm:py-16 lg:py-20">
        {combinedContent ? (
          <div
            className="parseData"
            dangerouslySetInnerHTML={{ __html: combinedContent }}
          />
        ) : (
          /* Fallback static content */
          <div className="parseData">
            <h2>Travixum Ltd t/a Emenac Travel is the foremost pan-European flagship ATOL protected travel agency.</h2>
            <p>To be the ultimate source of unsurpassed quality and unmatched value for global destinations and worldwide airlines for European consumers and vendors.</p>
            <h2>Mission Statement</h2>
            <p>We have expanded our global coverage to a maximum and multiplied your travel choices. Potential travelers can choose from a number of state-of-the-art airlines to fly with and stay at the best hotels out there from 5-star deluxe hotels to cheap bed &amp; breakfasts. Our online presence means that bookings, changes in schedule, cancellations, and payments of tickets can be made from the comfort of your bedroom. Our travel agency brings holiday offers from relevant sources. This cuts the risk of scams and third-party service providers who are not ATOL protected.</p>
            <h2>Company Background</h2>
            <p>Travixum Ltd t/a Emenac Travel is an ATOL-protected travel agency that is governed by the Civil Aviation Authority. We are registered as Travixum Ltd t/a Emenac Travel in 14 Hanworth Road Hounslow Middlesex TW3 1UA. It is a renowned travel organization which is sited at walking distance from the Oxford Circus in the heart of London.</p>
            <h2>Our Objectives</h2>
            <ul>
              <li>To gauge client satisfaction and enhance our service quality.</li>
              <li>Offer monetary rewards to loyal customers whenever possible</li>
              <li>Keep customers updated with the latest travel news, travel articles, guides, suggestions, and weekly newsletters</li>
              <li>Give complete and absolutely accurate product details to clients upon an inquiry put forward by them</li>
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
