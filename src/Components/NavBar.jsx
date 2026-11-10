"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LoginModal from "./LoginModal";
import SignUpModal from "./SignUpModal";
import { useGeneralSettings } from "../Context/GeneralSettingsContext";

const normalizeNavSlug = (pageUrl = "") =>
  String(pageUrl)
    .trim()
    .replace(/^\/+/, "")
    .replace(/\.(htm|html)$/i, "")
    .toLowerCase();

const NavBar = () => {
  const { globalVarsMap, navTree } = useGeneralSettings();
  const globalVariable = globalVarsMap || {};
  const navData = Array.isArray(navTree) ? navTree : [];
  const sortedNav = [...navData].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [loginStep, setloginStep] = useState(1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const normalizedPath = (pathname || "").toLowerCase().replace(/\/+$/, "") || "/";
  const isAboutUs = normalizedPath.includes("about-us");

  const isActive = (pageUrl) => {
    const slug = normalizeNavSlug(pageUrl);
    if (!slug) return false;
    const href = `/${slug}`;
    return normalizedPath === href || normalizedPath.startsWith(`${href}/`);
  };

  const getHref = (pageUrl) => {
    const slug = normalizeNavSlug(pageUrl);
    return slug ? `/${slug}` : "/";
  };

  const getNavLinkClass = (pageUrl, { size = "desktop" } = {}) => {
    const active = isActive(pageUrl);

    if (active) {
      if (size === "mobile") {
        return "inline-flex px-4 h-[32px] bg-[#1F0060] hover:bg-[#340b8a] text-white rounded-[6px] items-center justify-center font-poppins font-normal text-[15px] shadow-sm transition-colors";
      }
      if (size === "tablet") {
        return "px-3.5 py-1 bg-[#1F0060] hover:bg-[#340b8a] text-white rounded text-[14px] font-poppins transition-colors";
      }
      return "h-[32px] px-3.5 bg-[#1F0060] hover:bg-[#340b8a] text-white rounded-[6px] inline-flex items-center justify-center font-poppins font-normal text-[16px] shadow-sm transition-colors whitespace-nowrap";
    }

    if (size === "mobile") {
      return "block font-poppins font-normal text-[17px] text-[#000000] hover:text-[#5CACC4] py-1 border-b border-gray-50 transition-colors";
    }
    if (size === "tablet") {
      return `font-poppins transition-colors ${
        isAboutUs ? "text-white hover:text-[#5CACC4]" : "text-[#000000] hover:text-[#5CACC4]"
      }`;
    }
    return `font-poppins font-normal text-[18px] transition-colors whitespace-nowrap ${
      isAboutUs ? "text-white hover:text-[#5CACC4]" : "text-[#000000] hover:text-[#5CACC4]"
    }`;
  };

  const phoneNumber = globalVariable?.PHONENUMBER || "0203 - 923 - 2255";
  const telHref = `tel:${phoneNumber.replace(/[^0-9+]/g, "")}`;

  return (
    <>
      <header
        className={`w-full z-50 font-poppins transition-colors ${
          isAboutUs
            ? "absolute top-0 left-0 bg-transparent border-none"
            : "w-full bg-white relative"
        }`}
      >
        {/* Main 1360px container */}
        <div className="w-full max-w-[1236px] mx-auto px-4 xl:px-[20px]">
          {/* Desktop Navigation (>= 1200px) */}
          <div className="hidden xl:grid grid-cols-[166px_1fr_223px] gap-x-[28px] items-center h-[147px] pt-[43px] pb-[52px]">
            <Link href="/" className="shrink-0 flex items-center" aria-label="Zippy Travel Home">
              <Image
                src={isAboutUs ? "/ZTlogo-white.png" : "/ZTlogo dark 1.png"}
                alt="Zippy Travel"
                width={166}
                height={36}
                className="h-[36px] w-[166px] object-contain"
                priority
              />
            </Link>

            <nav className="flex items-center justify-center gap-[28px]" aria-label="Main Navigation">
              {sortedNav.map((item) => (
                <Link
                  key={item.id}
                  href={getHref(item.page_url)}
                  className={getNavLinkClass(item.page_url)}
                >
                  {item.title}
                </Link>
              ))}
            </nav>

            <div className="">
              <a
                href={telHref}
                className="w-[223px] h-[44px] flex items-center rounded-[8px] overflow-hidden shadow-sm hover:opacity-90 transition-opacity"
                aria-label={`Call us at ${phoneNumber}`}
              >
                <div className="w-[47px] h-[44px] bg-[#1F0060] flex items-center justify-center shrink-0">
                  <Image
                    src="/Vector.png"
                    alt="Call"
                    width={18}
                    height={26}
                    className="w-[18px] h-[26px] object-contain"
                  />
                </div>
                <div className="flex-1 h-[44px] bg-[#5CACC4] flex items-center justify-center font-poppins font-bold text-[18px] text-white tracking-wide">
                  {phoneNumber}
                </div>
              </a>
            </div>
          </div>

          {/* Medium Screen / Tablet Navigation (1024px - 1199px) */}
          <div className="hidden lg:flex xl:hidden items-center justify-between h-[100px] px-6">
            <Link href="/" className="shrink-0 flex items-center">
              <Image
                src={isAboutUs ? "/ZTlogo-white.png" : "/ZTlogo dark 1.png"}
                alt="Zippy Travel"
                width={150}
                height={32}
                className="h-[32px] w-[150px] object-contain"
                priority
              />
            </Link>

            <nav className="flex items-center gap-4 text-[15px]">
              {sortedNav.map((item) => (
                <Link
                  key={item.id}
                  href={getHref(item.page_url)}
                  className={getNavLinkClass(item.page_url, { size: "tablet" })}
                >
                  {item.title}
                </Link>
              ))}
            </nav>

            <a
              href={telHref}
              className="h-[38px] flex items-center rounded-[6px] overflow-hidden shadow-sm"
            >
              <div className="w-[38px] h-[38px] bg-[#1F0060] flex items-center justify-center">
                <Image src="/Vector.png" alt="Call" width={14} height={20} />
              </div>
              <div className="px-3 h-[38px] bg-[#5CACC4] flex items-center font-poppins font-bold text-[15px] text-white">
                {phoneNumber}
              </div>
            </a>
          </div>

          {/* Mobile Navigation (< 1024px) */}
          <div className="flex lg:hidden items-center justify-between h-[75px] px-2 sm:px-4">
            <Link href="/" className="shrink-0 flex items-center">
              <Image
                src={isAboutUs ? "/ZTlogo-white.png" : "/ZTlogo dark 1.png"}
                alt="Zippy Travel"
                width={140}
                height={30}
                className="h-[30px] w-auto object-contain"
                priority
              />
            </Link>

            <div className="flex items-center gap-3">
              <a
                href={telHref}
                className="h-[34px] flex items-center rounded-[6px] overflow-hidden shadow-sm"
                aria-label="Call Zippy Travel"
              >
                <div className="w-[34px] h-[34px] bg-[#1F0060] flex items-center justify-center">
                  <Image src="/Vector.png" alt="Call" width={14} height={18} />
                </div>
                <div className="hidden sm:flex px-2.5 h-[34px] bg-[#5CACC4] items-center font-poppins font-bold text-[13px] text-white">
                  {phoneNumber}
                </div>
              </a>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-2 rounded-md transition-colors ${
                  isAboutUs ? "text-white hover:bg-white/10" : "text-gray-700 hover:text-black hover:bg-gray-100"
                }`}
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white shadow-xl animate-in fade-in duration-200">
            <div className="px-6 py-6 space-y-4">
              {sortedNav.map((item) => (
                <Link
                  key={item.id}
                  href={getHref(item.page_url)}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={getNavLinkClass(item.page_url, { size: "mobile" })}
                >
                  {item.title}
                </Link>
              ))}

              <div className="pt-2">
                <a
                  href={telHref}
                  className="w-full h-[44px] flex items-center rounded-[8px] overflow-hidden shadow-sm"
                >
                  <div className="w-[47px] h-[44px] bg-[#1F0060] flex items-center justify-center shrink-0">
                    <Image src="/Vector.png" alt="Call" width={18} height={26} />
                  </div>
                  <div className="flex-1 h-[44px] bg-[#5CACC4] flex items-center justify-center font-poppins font-bold text-[17px] text-white">
                    {phoneNumber}
                  </div>
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      {isLoginOpen && (
        <LoginModal
          isOpen={isLoginOpen}
          setIsOpen={setIsLoginOpen}
          loginStep={loginStep}
          setloginStep={setloginStep}
          switchToSignUp={() => {
            setIsLoginOpen(false);
            setIsSignUpOpen(true);
          }}
        />
      )}
      {isSignUpOpen && (
        <SignUpModal
          isOpen={isSignUpOpen}
          setIsOpen={setIsSignUpOpen}
          switchToLogin={() => {
            setIsSignUpOpen(false);
            setIsLoginOpen(true);
          }}
        />
      )}
    </>
  );
};

export default NavBar;
