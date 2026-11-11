"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ThankYouPageClient() {
  useEffect(() => {
    document.body.dataset.pageType = "thank-you";
    return () => {
      delete document.body.dataset.pageType;
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          footer,
          #need-help-section,
          [data-needhelp] {
            display: none !important;
          }

          /* ── Subheading forced 32px on desktop ── */
          .ty-subheading p {
            font-size: clamp(18px, 2.35vw, 32px) !important;
            font-weight: 700 !important;
            line-height: 1.4 !important;
          }

          /* ── Suitcase horizontal overlap + vertical drop ── */
          @media (min-width: 1024px) {
            .luggage-responsive-wrapper {
              margin-right: clamp(-245px, -17.5vw, -145px) !important;
              transform: translateX(clamp(15px, 1.8vw, 28px)) translateY(38px) !important;
            }
          }
          @media (min-width: 768px) and (max-width: 1023px) {
            .luggage-responsive-wrapper {
              margin-right: clamp(-160px, -14vw, -80px) !important;
              transform: translateX(10px) translateY(28px) !important;
            }
          }
          @media (max-width: 767px) {
            .luggage-responsive-wrapper {
              margin-right: 0 !important;
              transform: none !important;
              margin-bottom: -12px !important;
            }
          }
        `
      }} />

      {/* ── Page wrapper ── */}
      <div className="relative w-full overflow-x-hidden bg-white font-poppins min-h-[calc(100vh-80px)] flex items-center justify-center pb-16 sm:pb-20">

        {/* ── Watermark Background ── */}
        <div
          aria-hidden="true"
          className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0"
          style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "16px 0" }}
        >
          {Array.from({ length: 7 }).map((_, r) => (
            <div
              key={r}
              className="flex whitespace-nowrap overflow-hidden"
              style={{ marginLeft: r % 2 === 0 ? "-30px" : "-160px", lineHeight: "1.15" }}
            >
              {Array.from({ length: 12 }).map((_, c) => (
                <span
                  key={c}
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 800,
                    fontSize: "clamp(55px, 6.5vw, 96px)",
                    color: "transparent",
                    WebkitTextStroke: "1.5px #E8ECF2",
                    marginRight: "48px",
                    letterSpacing: "2px",
                  }}
                >
                  THANK YOU
                </span>
              ))}
            </div>
          ))}
        </div>

        {/* ── Main Content ── */}
        <div
          className="relative z-10 w-full max-w-[1360px] mx-auto px-4 sm:px-8 flex items-center justify-center"
          style={{ marginTop: "clamp(30px, 5vh, 80px)" }}
        >
          {/* Flex row: bag left, text right */}
          <div className="flex flex-col md:flex-row items-center md:items-end justify-center w-full max-w-[1200px]">

            {/* ── Suitcase ── */}
            <div
              className="luggage-responsive-wrapper relative flex-shrink-0 z-30 select-none pointer-events-none"
              style={{
                width: "clamp(200px, 32vw, 441px)",
                maxWidth: "441px",
                alignSelf: "flex-end",
              }}
            >
              <div className="relative w-full" style={{ aspectRatio: "441 / 404" }}>
                <Image
                  src="/luggage.png"
                  alt="Zippy Travel Suitcase"
                  fill
                  sizes="(max-width: 767px) 220px, (max-width: 1023px) 300px, 441px"
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* ── Text + Button ── */}
            <div className="flex flex-col items-center text-center max-w-[600px] mt-3 md:mt-8 lg:mt-10">

              {/* Text section — z-10 so suitcase appears in front of heading */}
              <div className="relative z-10">

                {/* Thank You! */}
                <h1
                  className="font-poppins font-bold text-[#1F0060] leading-none tracking-tight select-none"
                  style={{
                    fontSize: "clamp(44px, 6.5vw, 92px)",
                    marginLeft: "clamp(-70px, -5vw, -30px)",
                    marginTop: "clamp(8px, 1.5vw, 20px)",
                  }}
                >
                  Thank You!
                </h1>

                {/* Sub-heading */}
                <div className="ty-subheading font-poppins text-[#1F0060] leading-snug mt-2 sm:mt-3">
                  <p>We&apos;ll contact back to you</p>
                  <p>As Soon As Possible</p>
                </div>

                {/* Paragraph */}
                <p
                  className="font-poppins font-normal text-[#4A5568] mt-2 sm:mt-3 leading-relaxed max-w-[500px]"
                  style={{ fontSize: "clamp(13px, 1.15vw, 17px)" }}
                >
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                  eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </div>

              {/* Button — z-50, outside z-10 so always above suitcase */}
              <div className="mt-5 sm:mt-7 relative z-50 pointer-events-auto">
                <Link
                  href="/"
                  className="font-poppins font-bold text-white rounded-[14px] transition-all hover:brightness-105 active:scale-95 flex items-center justify-center shadow-md whitespace-nowrap"
                  style={{
                    width: "clamp(220px, 21vw, 286px)",
                    height: "clamp(52px, 4.4vw, 60px)",
                    backgroundColor: "#5CACC4",
                    fontSize: "clamp(16px, 1.8vw, 24px)",
                    fontWeight: 700,
                  }}
                >
                  Go to Home Page
                </Link>
              </div>

            </div>
          </div>
        </div>

      </div>
    </>
  );
}
