"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LoginModal from "./LoginModal";
import SignUpModal from "./SignUpModal";
import WhatsAppCallbackDropdown from "./WhatsAppCallbackDropdown";
import { useGeneralSettings } from "../Context/GeneralSettingsContext";

const NavBar = () => {
  const { globalVarsMap } = useGeneralSettings();
  const globalVariable = globalVarsMap || {};
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [loginStep, setloginStep] = useState(1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const phoneNumber = globalVariable?.PHONENUMBER || "0203 - 923 - 2255";
  const telHref = `tel:${phoneNumber.replace(/[^0-9+]/g, "")}`;
  const whatsappUrl = globalVariable?.WHATSAPP
    ? `https://wa.me/${globalVariable.WHATSAPP.replace(/\D/g, "")}`
    : null;

  return (
    <>
      <header className="w-full bg-white border-b border-gray-100 z-50 relative font-poppins">
        {/* Main 1360px container */}
        <div className="w-full max-w-[1360px] mx-auto px-4 xl:px-0">
          {/* Desktop Navigation (>= 1200px) */}
          <div className="hidden xl:flex items-center h-[147px] pt-[43px] pb-[68px] px-[80px]">
            {/* Logo: 166px x 36px (80px from left edge) */}
            <Link href="/" className="shrink-0 flex items-center" aria-label="Zippy Travel Home">
              <Image
                src="/ZTlogo dark 1.png"
                alt="Zippy Travel"
                width={166}
                height={36}
                className="h-[36px] w-[166px] object-contain"
                priority
              />
            </Link>

            {/* Menu Links: 37px gap from logo, 28px gap between each button */}
            <nav className="flex items-center ml-[37px] gap-[28px]" aria-label="Main Navigation">
              {/* Business Class Flights (37px from logo) */}
              <Link
                href="/airlines"
                className="font-poppins font-normal text-[18px] text-[#000000] hover:text-[#5CACC4] transition-colors whitespace-nowrap"
              >
                Business Class Flights
              </Link>

              {/* Destination */}
              <Link
                href="/continents"
                className="font-poppins font-normal text-[18px] text-[#000000] hover:text-[#5CACC4] transition-colors whitespace-nowrap"
              >
                Destination
              </Link>

              {/* Airline Badge: 85px x 30px, bg #1F0060 */}
              <Link
                href="/airline"
                className="w-[85px] h-[30px] bg-[#1F0060] hover:bg-[#340b8a] text-white rounded-[6px] flex items-center justify-center font-poppins font-normal text-[16px] transition-colors whitespace-nowrap shadow-sm"
              >
                Airline
              </Link>

              {/* Contact Us */}
              <Link
                href="/contact-us"
                className="font-poppins font-normal text-[18px] text-[#000000] hover:text-[#5CACC4] transition-colors whitespace-nowrap"
              >
                Contact Us
              </Link>

              {/* Beat My Quote */}
              <Link
                href="/contact-us"
                className="font-poppins font-normal text-[18px] text-[#000000] hover:text-[#5CACC4] transition-colors whitespace-nowrap"
              >
                Beat My Quote
              </Link>
            </nav>

            {/* Contact Section: Exactly 48px to the right of Beat My Quote (or 48px to its left) */}
            <div className="ml-[48px] shrink-0">
              <a
                href={telHref}
                className="w-[223px] h-[44px] flex items-center rounded-[8px] overflow-hidden shadow-sm hover:opacity-90 transition-opacity"
                aria-label={`Call us at ${phoneNumber}`}
              >
                {/* Left Icon: 47px x 44px, bg #1F0060 */}
                <div className="w-[47px] h-[44px] bg-[#1F0060] flex items-center justify-center shrink-0">
                  <Image
                    src="/Vector.png"
                    alt="Call"
                    width={18}
                    height={26}
                    className="w-[18px] h-[26px] object-contain"
                  />
                </div>
                {/* Right Phone Text: bg #5CACC4 */}
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
                src="/ZTlogo dark 1.png"
                alt="Zippy Travel"
                width={150}
                height={32}
                className="h-[32px] w-[150px] object-contain"
                priority
              />
            </Link>

            <nav className="flex items-center gap-4 text-[15px]">
              <Link href="/airlines" className="font-poppins text-[#000000] hover:text-[#5CACC4]">
                Flights
              </Link>
              <Link href="/continents" className="font-poppins text-[#000000] hover:text-[#5CACC4]">
                Destination
              </Link>
              <Link
                href="/airline"
                className="px-3 py-1 bg-[#1F0060] text-white rounded text-[14px]"
              >
                Airline
              </Link>
              <Link href="/contact-us" className="font-poppins text-[#000000] hover:text-[#5CACC4]">
                Contact
              </Link>
              <Link href="/contact-us" className="font-poppins text-[#000000] hover:text-[#5CACC4]">
                Beat Quote
              </Link>
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
                src="/ZTlogo dark 1.png"
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

              {/* Hamburger Button */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-700 hover:text-black hover:bg-gray-100 transition-colors"
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

        {/* Mobile Dropdown Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white shadow-xl animate-in fade-in duration-200">
            <div className="px-6 py-6 space-y-4">
              <Link
                href="/airlines"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block font-poppins font-normal text-[17px] text-[#000000] hover:text-[#5CACC4] py-1 border-b border-gray-50"
              >
                Business Class Flights
              </Link>
              <Link
                href="/continents"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block font-poppins font-normal text-[17px] text-[#000000] hover:text-[#5CACC4] py-1 border-b border-gray-50"
              >
                Destination
              </Link>
              <Link
                href="/airline"
                onClick={() => setIsMobileMenuOpen(false)}
                className="inline-flex w-[90px] h-[32px] bg-[#1F0060] text-white rounded-[6px] items-center justify-center font-poppins font-normal text-[15px]"
              >
                Airline
              </Link>
              <Link
                href="/contact-us"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block font-poppins font-normal text-[17px] text-[#000000] hover:text-[#5CACC4] py-1 border-b border-gray-50"
              >
                Contact Us
              </Link>
              <Link
                href="/contact-us"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block font-poppins font-normal text-[17px] text-[#000000] hover:text-[#5CACC4] py-1 border-b border-gray-50"
              >
                Beat My Quote
              </Link>

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

      {/* Login & Sign Up Modals */}
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
