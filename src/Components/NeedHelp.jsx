"use client";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import CallbackPopup from "./CallbackPopup";
import { useGeneralSettings } from "../Context/GeneralSettingsContext";

const NeedHelp = () => {
  const pathname = usePathname();
  const { footerSetting } = useGeneralSettings();
  const [showPopup, setShowPopup] = useState(false);

  const footerData = footerSetting;
  const phone = footerData?.contents?.footer_phone || "";

  // Hide on static policy & about pages as per design, and on 404/thank-you pages
  const isHidden = ["about-us", "cookies", "terms", "privacy", "thank-you", "not-found", "_not-found"].some((key) =>
    pathname?.toLowerCase().includes(key)
  ) || (typeof window !== "undefined" && document.body.dataset.pageType === "not-found");
  if (isHidden) return null;

  return (
    <>
      {showPopup && (
        <CallbackPopup
          show={showPopup}
          onClose={() => setShowPopup(false)}
          phone={phone}
          whatsapp="4420-7043-4343"
        />
      )}

      <section id="need-help-section" className="w-full bg-white py-8">
        <div className="w-full max-w-[1202px] mx-auto px-4">

          {/* ── Desktop: one row ── Mobile: stacked ── */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-4 xl:gap-6">

            {/* ═══ LEFT: Call Us Now ═══ */}
            <a
              href={phone ? `tel:${phone}` : undefined}
              className="flex items-stretch rounded-[8px] overflow-hidden shrink-0 w-full sm:w-[387px]"
              style={{ height: "104px", textDecoration: "none" }}
            >
              {/* Dark purple icon box */}
              <div className="flex items-center justify-center bg-[#1e1b6e] shrink-0" style={{ width: "88px" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/media/fr-svgs/Vector1.png"
                  alt="Call Icon"
                  style={{ width: "48px", height: "48px", objectFit: "contain" }}
                />
              </div>
              {/* Teal text */}
              <div className="flex flex-col justify-center bg-[#4fbcd4] flex-1 px-5">
                <p style={{ fontSize: "24px", fontWeight: 700, color: "#fff", lineHeight: "1.2", margin: 0 }}>
                  Call Us Now!
                </p>
                <p style={{ fontSize: "30px", fontWeight: 400, color: "#fff", lineHeight: "1.2", margin: 0 }}>
                  {phone}
                </p>
              </div>
            </a>

            {/* ═══ CENTER: Need Help? + Telephone ═══ */}
            <div className="flex items-end justify-center shrink-0 relative" style={{ minWidth: "280px" }}>
              {/* "Need Help?" */}
              <p
                style={{
                  fontSize: "64px",
                  fontWeight: 700,
                  color: "#1e1b6e",
                  lineHeight: "1.0",
                  whiteSpace: "nowrap",
                  margin: 0,
                  transform: "translateY(-14px)",
                }}
              >
                Need<br />Help?
              </p>

              {/* Telephone image — overlaps onto text */}
              <div
                className="shrink-0 relative z-10"
                style={{ marginLeft: "-24px", marginTop: "0px" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/telephone%20png%202.png"
                  alt="Telephone"
                  style={{
                    width: "235px",
                    height: "157px",
                    objectFit: "contain",
                    filter: "drop-shadow(6px 10px 12px rgba(0, 0, 0, 0.3))",
                  }}
                  className="drop-shadow-[6px_10px_12px_rgba(0,0,0,0.3)]"
                />
              </div>
            </div>

            {/* ═══ RIGHT: Request a Call Back ═══ */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setShowPopup(true)}
              onKeyDown={(e) => e.key === "Enter" && setShowPopup(true)}
              className="flex items-stretch rounded-[8px] overflow-hidden shrink-0 cursor-pointer w-full sm:w-[387px]"
              style={{ height: "104px" }}
            >
              {/* Teal text */}
              <div className="flex flex-col justify-center bg-[#4fbcd4] flex-1 px-5 text-right">
                <p style={{ fontSize: "24px", fontWeight: 700, color: "#fff", lineHeight: "1.2", margin: 0 }}>
                  Request a Call Back
                </p>
                <p style={{ fontSize: "30px", fontWeight: 400, color: "#fff", lineHeight: "1.2", margin: 0 }}>
                  Too Busy to Talk?
                </p>
              </div>
              {/* Dark purple icon box */}
              <div className="flex items-center justify-center bg-[#1e1b6e] shrink-0" style={{ width: "88px" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/media/fr-svgs/Isolation_Mode.png"
                  alt="Callback Icon"
                  style={{ width: "48px", height: "48px", objectFit: "contain" }}
                />
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default NeedHelp;
