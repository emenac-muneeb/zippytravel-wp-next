"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Disclosure, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LoginModal from "./LoginModal";
import SignUpModal from "./SignUpModal";
import WhatsAppCallbackDropdown from "./WhatsAppCallbackDropdown";
import { BASE_URL_IMG } from "../Helpers/imageurl";
import { useGeneralSettings } from "../Context/GeneralSettingsContext";

const NavBar = () => {
  const { navTree, globalVarsMap, footerSetting, frontIcons: contextFrontIcons } = useGeneralSettings();
  const [footerData, setFooterData] = useState(() => footerSetting ?? {});
  const [frontIcons, setFrontIcons] = useState(() => contextFrontIcons ?? []);
  const navData = navTree || [];
  const globalVariable = globalVarsMap || {};
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [loginStep, setloginStep] = useState(1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [bodyPageType, setBodyPageType] = useState("");
  const mobileMenuRef = useRef();
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "";
  const path = (pathname || "").toLowerCase();
  const isNotFoundPage =
    path === "/not-found" ||
    path.startsWith("/not-found/") ||
    bodyPageType === "not-found";

  // Sticky white header (design) on static pages — exclude About & Contact
  const isAboutOrContact =
    path.includes("about-us") || path.includes("contact-us");
  const isStickyStaticHeader =
    !isAboutOrContact &&
    (path === "/blog" ||
      path === "/blog/" ||
      path.startsWith("/blog/") ||
      path.includes("privacy-policy") ||
      path.includes("cookies") ||
      path.includes("terms-condition") ||
      path.includes("terms-and-conditions") ||
      path.includes("customer-reviews") ||
      path.includes("thankyou") ||
      path.includes("thank-you") ||
      path.includes("booknow") ||
      isNotFoundPage);

  // Transparent overlay on home / search / destination heroes
  const isHeroPage = !isStickyStaticHeader

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof document === "undefined" || !document.body) return;

    const syncBodyPageType = () => {
      setBodyPageType(document.body.dataset?.pageType || "");
    };

    syncBodyPageType();

    const observer = new MutationObserver(syncBodyPageType);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-page-type"],
    });

    return () => observer.disconnect();
  }, [pathname]);

  const handleSwitchToSignUp = () => {
    setIsLoginOpen(false);
    setIsSignUpOpen(true);
  };

  const handleSwitchToLogin = () => {
    setIsSignUpOpen(false);
    setIsLoginOpen(true);
    setloginStep(2);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (slug) => pathname.includes(slug);
  const isHomeActive = pathname === "/" || pathname === "";

  const toggleDropdown = (id) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const whatsappUrl = globalVariable?.WHATSAPP
    ? `https://wa.me/${globalVariable.WHATSAPP.replace(/\D/g, "")}`
    : null;

  const overlayMode = isHeroPage && !isScrolled;
  const linkBase = overlayMode
    ? "text-white/90 hover:text-white"
    : "text-[#707070] hover:text-secondary";
  const linkActive = overlayMode ? "text-white" : "text-secondary";

  const NavLinkUnderline = ({ active }) => (
    <span
      className={`absolute left-2.5   h-[2px] w-5 rounded-full bg-[#F1A868] transition-opacity ${active ? "opacity-100" : "opacity-0 group-hover:opacity-60"
        } ${overlayMode ? "top-1" : "-bottom-0.5"}`}
    />
  );

  return (
    <>
      {/* Mobile contact strip — About / Contact only */}
      {!isHeroPage && !isStickyStaticHeader && (
        <div className="lg:hidden bg-[#A57233] h-[60px] flex items-center justify-center">
          <div className="w-[94%] mx-auto flex items-center justify-between">
            {globalVariable?.PHONENUMBER && (
              <a
                href={`tel:${globalVariable.PHONENUMBER}`}
                className="flex items-center text-white text-[18px] font-bold gap-1"
              >
                {globalVariable.PHONENUMBER}
                <Image
                  src={`${BASE_URL_IMG}/assets/svgs/dial.svg`}
                  alt="Phone Icon"
                  width={24}
                  height={24}
                />
              </a>
            )}
            {whatsappUrl && (
              <WhatsAppCallbackDropdown whatsappUrl={whatsappUrl} light />
            )}
          </div>
        </div>
      )}

      <Disclosure as="nav">
        {({ open, close }) => (
          <div
            className={`w-full z-[100] transition-all duration-300 ${isStickyStaticHeader
              ? `fixed top-0 left-0 right-0 bg-white ${isScrolled
                ? "shadow-lg "
                : ""
              }`
              : isHeroPage
                ? isScrolled
                  ? "fixed top-0 left-0 right-0 bg-[#fff]/95 backdrop-blur-md shadow-lg"
                  : "absolute top-0 left-0 right-0 bg-transparent"
                : isScrolled
                  ? "fixed top-4 left-1/2 -translate-x-1/2 w-[94%] rounded-2xl backdrop-blur-sm bg-white/90 shadow-xl border border-white/20 px-4"
                  : "relative bg-transparent"
              }`}
          >
            <div
              className={`${isStickyStaticHeader || isHeroPage || !isScrolled
                ? "container"
                : ""
                } ${!isHeroPage && !isStickyStaticHeader && isScrolled ? "w-full" : ""}`}
            >
              <div className={`relative flex h-[80px] lg:h-[95px] items-center justify-between pt-[22px] lg:pt-[40px] 
                ${isHeroPage ? "pb-[31px]" : isStickyStaticHeader ? "pb-[31px]" : "pb-[0px]"}`}>
                {/* Mobile menu button */}
                <div className="absolute inset-y-0 left-0 flex items-center lg:hidden">
                  <Disclosure.Button
                    className={`inline-flex items-center justify-center rounded-md p-1 transition duration-300 ${overlayMode
                      ? "text-white hover:bg-white/10"
                      : "text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                      }`}
                  >
                    {open ? (
                      <XMarkIcon className="block size-6" />
                    ) : (
                      <Image
                          src={`${BASE_URL_IMG}/assets/svgs/toggle-new.svg`}
                        alt="Toggle Icon"
                        width={24}
                        height={24}
                        className={overlayMode ? "brightness-0 invert" : ""}
                      />
                    )}
                  </Disclosure.Button>
                </div>

                {/* Logo */}
                <div className="flex flex-1 items-center justify-center lg:justify-start lg:flex-none">
                  <Link href="/" aria-label="Emenac Travel home">
                    <Image
                      alt=""
                      src={`${BASE_URL_IMG}${footerData.logo}`}
                      aria-hidden
                      className={`w-[150px] sm:w-auto h-[40px] sm:h-[54px] ${overlayMode ? "brightness-0 invert" : ""
                        }`}
                      width={200}
                      height={60}
                      priority
                    />
                  </Link>
                </div>



                {/* Right utilities */}
                <div className="hidden lg:flex items-center gap-4 xl:gap-5 ml-auto">
                  {globalVariable?.PHONENUMBER && (
                    <a
                      href={`tel:${globalVariable.PHONENUMBER}`}
                      className={`flex items-center gap-2 font-semibold text-[15px] xl:text-[16px] font-quicksand transition-colors ${overlayMode ? "text-white" : "text-[#707070]"
                        }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="19.691" height="30.55" viewBox="0 0 19.691 30.55">
                        <g id="Group_56" data-name="Group 56" transform="translate(409.412 -797.642)">
                          <path id="Path_31" data-name="Path 31" d="M-399.327,797.642a1.138,1.138,0,0,1,.665,1.2c-.023,1.649-.008,3.3-.009,4.949,0,.734-.337,1.066-1.08,1.066h-3.593a28.258,28.258,0,0,0,0,12.523h3.561c.8,0,1.112.319,1.112,1.123q0,2.519,0,5.038a.926.926,0,0,1-1.061,1.055h-2.5a1.756,1.756,0,0,0,1.756,1.786c1.024.011,2.047,0,3.071,0q3.354,0,6.709,0a.891.891,0,0,1,.847,1.332.9.9,0,0,1-.845.457q-1.893,0-3.787,0c-1.888,0-3.778-.051-5.665.014a3.683,3.683,0,0,1-3.912-3.562c-1.87-.2-2.723-1.571-3.446-3.056a18.388,18.388,0,0,1-1.488-5.158,32.6,32.6,0,0,1-.353-7.4,24.5,24.5,0,0,1,1.613-7.838,11.066,11.066,0,0,1,.771-1.508,3.969,3.969,0,0,1,2.56-2.028Z" transform="translate(0 0)" fill="#f1a868" />
                          <path id="Path_32" data-name="Path 32" d="M-226.293,862.842a11.433,11.433,0,0,1-3.975,8.345.9.9,0,0,1-1.328.008.9.9,0,0,1,.137-1.34,9.563,9.563,0,0,0,3.205-5.667,9.656,9.656,0,0,0-2.986-8.956c-.085-.083-.179-.158-.265-.24a.894.894,0,0,1-.111-1.279.9.9,0,0,1,1.3-.051,11.56,11.56,0,0,1,3.228,4.579A12.2,12.2,0,0,1-226.293,862.842Z" transform="translate(-163.43 -51.324)" fill="#f1a868" />
                          <path id="Path_33" data-name="Path 33" d="M-256.737,893.506a8.269,8.269,0,0,1-2.747,6.318.9.9,0,0,1-1.327-.005.9.9,0,0,1,.129-1.319,6.141,6.141,0,0,0,2.132-4.825,6.1,6.1,0,0,0-2.105-4.568.936.936,0,0,1-.368-.918.889.889,0,0,1,1.487-.48,7.809,7.809,0,0,1,2.53,4.118C-256.851,892.469-256.8,893.135-256.737,893.506Z" transform="translate(-136.55 -82.669)" fill="#f1a868" />
                          <path id="Path_34" data-name="Path 34" d="M-287.21,925.425a4.358,4.358,0,0,1-1.487,3.113.9.9,0,0,1-1.306,0,.9.9,0,0,1,.078-1.3,2.669,2.669,0,0,0,0-4.049.894.894,0,0,1-.083-1.3.909.909,0,0,1,1.307,0A4.61,4.61,0,0,1-287.21,925.425Z" transform="translate(-109.672 -114.095)" fill="#f1a868" />
                        </g>
                      </svg>

                      {globalVariable.PHONENUMBER}
                    </a>
                  )}
                  {whatsappUrl && (
                    <WhatsAppCallbackDropdown
                      whatsappUrl={whatsappUrl}
                      light={overlayMode}
                    />
                  )}
                  <button
                    onClick={() => setIsLoginOpen(true)}
                    className={`hidden items-center py-2 text-[15px] font-semibold gap-2 transition font-quicksand ${overlayMode
                      ? "text-white/90 hover:text-white"
                      : "text-[#707070] hover:text-secondary"
                      }`}
                  >
                    <Image
                      src={`${BASE_URL_IMG}/assets/svgs/account.svg`}
                      alt="Login"
                      className={`w-5 h-5 ${overlayMode ? "brightness-0 invert" : ""}`}
                      width={20}
                      height={20}
                    />
                    Login
                  </button>
                </div>

                {/* Mobile right: phone + whatsapp */}
                {(isHeroPage || isStickyStaticHeader) && (
                  <div className="absolute inset-y-0 right-0 flex items-center gap-3 lg:hidden">
                    {globalVariable?.PHONENUMBER && (
                      <a
                        href={`tel:${globalVariable.PHONENUMBER}`}
                        className={overlayMode ? "text-white" : "text-[#707070]"}
                        aria-label="Call us"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"
                            stroke="#F27A2A"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </a>
                    )}
                    {whatsappUrl && (
                      <WhatsAppCallbackDropdown
                        whatsappUrl={whatsappUrl}
                        light={overlayMode}
                      />
                    )}
                  </div>
                )}
              </div>
              {/* Desktop centered nav */}
              <div
                className={`hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 xl:gap-2 ${isScrolled || isStickyStaticHeader ? "top-[32px]" : ""
                  }`}
              >
                <Link
                  href="/"
                  className={`group relative text-[15px] xl:text-[16px] font-semibold px-2.5 py-2 transition-colors duration-200 font-quicksand ${isHomeActive ? linkActive : linkBase
                    }`}
                >
                  <NavLinkUnderline active={isHomeActive} />
                  Home
                </Link>
                {[...navData]
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((item) => {
                    if (
                      pathname.includes("umrah") &&
                      item.page_url === "continents.htm"
                    ) {
                      return null;
                    }
                    if (
                      item.page_url === "umrah-packages.html" &&
                      !pathname.includes("umrah")
                    ) {
                      return null;
                    }

                    const sortedSubItems = item.subItems
                      ? [...item.subItems].sort(
                        (a, b) => a.sort_order - b.sort_order
                      )
                      : [];
                    const active = isActive(item.slug);

                    return (
                      <div key={item.id} className="relative group">
                        <div className="flex items-center gap-0.5">
                          <Link
                            href={`/${item.page_url}`}
                            className={`relative text-[15px] xl:text-[16px] font-semibold px-2.5 py-2 transition-colors duration-200 font-quicksand ${active ? linkActive : linkBase
                              }`}
                          >
                            <NavLinkUnderline active={active} />
                            {item.title}
                          </Link>
                          {item.dropdown && (
                            <svg
                              className={`w-3.5 h-3.5 transition-transform group-hover:rotate-180 ${overlayMode ? "text-white/80" : "text-[#707070]"
                                }`}
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          )}
                        </div>
                        {item.dropdown && (
                          <div className="absolute z-20 w-60 rounded-xl bg-white shadow-lg border border-gray-100 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-300 mt-1">
                            {sortedSubItems?.map((subItem, index) => (
                              <React.Fragment key={subItem.id}>
                                {index > 0 && (
                                  <hr className="border-t border-gray-200" />
                                )}
                                <Link
                                  href={`/${subItem.page_url}`}
                                  className={`block px-5 py-3 text-[15px] font-medium tracking-wide rounded-lg transition-colors duration-200 ${isActive(subItem.slug)
                                    ? "text-[#F27A2A] bg-[#FFF5EB]"
                                    : "text-gray-700 hover:bg-[#FFF5EB] hover:text-[#F27A2A]"
                                    }`}
                                >
                                  {subItem.title}
                                </Link>
                              </React.Fragment>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Mobile nav panel */}
            <Disclosure.Panel className="lg:hidden mb-3 px-[3%]">
              <div className="space-y-1 px-4 pb-6 pt-4 bg-white rounded-2xl shadow-md">
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <Link
                    href="/"
                    onClick={() => close()}
                    className="text-base font-bold text-gray-700"
                  >
                    Home
                  </Link>
                </div>
                {[...navData]
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((item) => {
                    if (
                      pathname.includes("umrah") &&
                      item.page_url === "continents.htm"
                    ) {
                      return null;
                    }
                    if (
                      item.page_url === "umrah-packages.html" &&
                      !pathname.includes("umrah")
                    ) {
                      return null;
                    }

                    const isOpen = !!openDropdowns[item.id];
                    const hasChildren =
                      item.dropdown && item.subItems.length > 0;
                    const sortedSubItems = hasChildren
                      ? [...item.subItems].sort(
                        (a, b) => a.sort_order - b.sort_order
                      )
                      : [];

                    return (
                      <div key={item.id} className="w-full">
                        <div
                          className="flex justify-between items-center py-3 border-b border-gray-200 cursor-pointer"
                          onClick={() =>
                            hasChildren ? toggleDropdown(item.id) : null
                          }
                        >
                          <Link
                            href={`/${item.page_url}`}
                            onClick={() => close()}
                            className={`text-base font-bold ${isActive(item.slug)
                              ? "text-[#F27A2A]"
                              : "text-gray-700"
                              }`}
                          >
                            {item.title}
                          </Link>
                          {hasChildren && (
                            <svg
                              className={`w-5 h-5 transform transition-transform duration-300 ${isOpen
                                ? "rotate-180 text-[#F27A2A]"
                                : "rotate-0 text-gray-500"
                                }`}
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          )}
                        </div>
                        {hasChildren && (
                          <Transition
                            show={isOpen}
                            enter="transition duration-300 ease-out"
                            enterFrom="transform opacity-0 -translate-y-2"
                            enterTo="transform opacity-100 translate-y-0"
                            leave="transition duration-200 ease-in"
                            leaveFrom="transform opacity-100 translate-y-0"
                            leaveTo="transform opacity-0 -translate-y-2"
                          >
                            <div className="ml-4 mt-2 space-y-2 border-l border-gray-200 pl-4">
                              {sortedSubItems.map((subItem) => (
                                <Link
                                  key={subItem.id}
                                  href={`/${subItem.page_url}`}
                                  onClick={() => close()}
                                  className={`block text-sm py-1 ${isActive(subItem.page_url)
                                    ? "text-[#F27A2A] font-semibold"
                                    : "text-gray-600"
                                    }`}
                                >
                                  {subItem.title}
                                </Link>
                              ))}
                            </div>
                          </Transition>
                        )}
                      </div>
                    );
                  })}
               
              </div>
            </Disclosure.Panel>
          </div>
        )}
      </Disclosure>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => {
          setIsLoginOpen(false);
          setloginStep(1);
        }}
        onSwitchToSignUp={handleSwitchToSignUp}
        loginStep={loginStep}
        setloginStep={setloginStep}
        onSwitchToLogin={handleSwitchToLogin}
      />
      <SignUpModal
        isOpen={isSignUpOpen}
        onClose={() => setIsSignUpOpen(false)}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </>
  );
};

export default NavBar;
