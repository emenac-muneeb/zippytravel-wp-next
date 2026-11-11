"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    document.body.dataset.pageType = "not-found";
    return () => {
      delete document.body.dataset.pageType;
    };
  }, []);

  return (
    <>
      {/* Hide footer, need help section, and define smooth responsive airplane scaling */}
      <style dangerouslySetInnerHTML={{
        __html: `
          footer,
          #need-help-section,
          [data-needhelp] {
            display: none !important;
          }
          /* > 1152px: Exact previous desktop styling */
          @media (min-width: 1153px) {
            .airplane-responsive-wrapper {
              margin-top: -170px !important;
              transform: translateX(45px) !important;
            }
          }
          /* 768px - 1152px: Proportionally scaled so airplane never jumps up into text */
          @media (min-width: 768px) and (max-width: 1152px) {
            .airplane-responsive-wrapper {
              margin-top: clamp(-85px, -7.5vw, -45px) !important;
              transform: translateX(clamp(10px, 2vw, 30px)) !important;
            }
          }
          /* < 768px (Mobile): Clean natural spacing */
          @media (max-width: 767px) {
            .airplane-responsive-wrapper {
              margin-top: 16px !important;
              transform: none !important;
            }
          }
        `
      }} />

      <div className="bg-[url('/zippy404.png')] bg-contain bg-center bg-repeat relative w-full overflow-hidden bg-white font-poppins xl:min-h-[calc(100vh-147px)] md:min-h-[calc(100vh-100px)] min-h-[calc(100vh-80px)] flex items-center justify-center">
        {/* ── Repeating Outlined "404 ERROR" Watermark Background ── */}
       

        {/* ── Main 1360px Unified Composition ── */}
        <div className="relative z-10 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-[80px] py-4 sm:py-6 -mt-4 sm:-mt-6 md:-mt-10 lg:-mt-12 flex flex-col items-center">
          
          {/* ═══ Desktop / Tablet Row (md+): Buttons vertically centered with "404" ═══ */}
          <div className="hidden md:flex items-center justify-between w-full relative z-10">
            {/* Left Button: Go to Previous Page */}
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  if (window.history.length > 1) {
                    router.back();
                  } else {
                    router.push("/");
                  }
                }
              }}
              className="font-poppins font-bold text-white rounded-[14px] transition-all hover:brightness-105 active:scale-95 flex items-center justify-center shadow-sm flex-shrink-0 whitespace-nowrap px-3 pointer-events-auto"
              style={{
                width: "clamp(180px, 21vw, 286px)",
                height: "clamp(48px, 4.4vw, 60px)",
                backgroundColor: "#5CACC4",
                fontSize: "clamp(13px, 1.76vw, 24px)",
                fontWeight: 700,
              }}
            >
              Go to Previous Page
            </button>

            {/* Center: "404" text - Vertically centered with the buttons */}
            <h1
              className="font-poppins font-bold text-[#1F0060] leading-none select-none tracking-tight text-center px-2 sm:px-4"
              style={{ fontSize: "clamp(64px, 8.8vw, 120px)" }}
            >
              404
            </h1>

            {/* Right Button: Go to Home Page */}
            <Link
              href="/"
              className="font-poppins font-bold text-white rounded-[14px] transition-all hover:brightness-105 active:scale-95 flex items-center justify-center shadow-sm flex-shrink-0 whitespace-nowrap px-3 pointer-events-auto"
              style={{
                width: "clamp(180px, 21vw, 286px)",
                height: "clamp(48px, 4.4vw, 60px)",
                backgroundColor: "#5CACC4",
                fontSize: "clamp(13px, 1.76vw, 24px)",
                fontWeight: 700,
              }}
            >
              Go to Home Page
            </Link>
          </div>

          {/* Mobile View (< md): "404" text */}
          <div className="flex md:hidden flex-col items-center text-center w-full relative z-20">
            <h1
              className="font-poppins font-bold text-[#1F0060] leading-none select-none tracking-tight"
              style={{ fontSize: "clamp(64px, 18vw, 96px)" }}
            >
              404
            </h1>
          </div>

          {/* ═══ Center Sub-Text Block (Layered cleanly on top of airplane) ═══ */}
          <div className="flex flex-col items-center text-center w-full max-w-[640px] mx-auto mt-1 sm:mt-2 relative z-30">
            {/* Oooops ... Page Not Found */}
            <h2
              className="font-poppins font-bold text-[#1F0060] leading-snug"
              style={{ fontSize: "clamp(18px, 2.35vw, 32px)" }}
            >
              Oooops ... Page Not Found
            </h2>

            {/* Error : Could not find your Query */}
            <p
              className="font-poppins font-normal text-[#2D3748] mt-1"
              style={{ fontSize: "clamp(13px, 1.45vw, 20px)" }}
            >
              Error : Could not find your Query
            </p>

            {/* Send Us Your Query and we'll get back to you */}
            <p
              className="font-poppins font-normal text-[#2D3748] mt-1"
              style={{ fontSize: "clamp(13px, 1.45vw, 20px)" }}
            >
              <Link
                href="/contact-us"
                className="text-[#5CACC4] underline hover:text-[#4396ad] transition-colors font-medium pointer-events-auto"
              >
                Send Us Your Query
              </Link>
              {" "}and we&apos;ll get back to you
            </p>

            {/* Mobile Buttons: shown only on screens < md */}
            <div className="flex md:hidden flex-col sm:flex-row items-center justify-center gap-3 w-full mt-4">
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    if (window.history.length > 1) {
                      router.back();
                    } else {
                      router.push("/");
                    }
                  }
                }}
                className="font-poppins font-bold text-white rounded-[12px] py-3 px-6 w-full sm:w-auto transition-all shadow-sm"
                style={{
                  backgroundColor: "#5CACC4",
                  fontSize: "clamp(16px, 4.5vw, 24px)",
                  fontWeight: 700,
                }}
              >
                Go to Previous Page
              </button>
              <Link
                href="/"
                className="font-poppins font-bold text-white rounded-[12px] py-3 px-6 w-full sm:w-auto transition-all shadow-sm text-center"
                style={{
                  backgroundColor: "#5CACC4",
                  fontSize: "clamp(16px, 4.5vw, 24px)",
                  fontWeight: 700,
                }}
              >
                Go to Home Page
              </Link>
            </div>
          </div>

          {/* ═══ Airplane Image: flight-1.png (1123px x 357px) ═══
              > 1152px: Exact previous styling (-mt-[170px], translateX(45px))
              768px - 1152px: Proportional scaling so it never jumps into text
              < 768px: Mobile clean placement */}
          <div className="airplane-responsive-wrapper relative z-20 w-full flex justify-center pointer-events-none select-none">
            <div
              className="relative w-full max-w-[1123px]"
              style={{ aspectRatio: "1123 / 357" }}
            >
              <Image
                src="/flight-1.png"
                alt="Airplane"
                fill
                sizes="(max-width: 1200px) 100vw, 1123px"
                className="object-contain"
                priority
              />
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
