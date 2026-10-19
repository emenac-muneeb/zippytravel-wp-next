"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";
import { endpoints } from "../Helpers/endpoints";
import { BASE_URL_IMG } from "../Helpers/imageurl";

/**
 * Header WhatsApp "Call You Back" dropdown.
 * Reuses the same Enquiry API payload pattern as CallbackPopup.
 */
const WhatsAppCallbackDropdown = ({ whatsappUrl, light = false }) => {
  const router = useRouter();
  const containerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pageURL, setPageURL] = useState("");
  const [isHoverCapable, setIsHoverCapable] = useState(false);

  useEffect(() => {
    setPageURL(window.location.href);
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setIsHoverCapable(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, []);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    const cleaned = phone.replace(/[^0-9]/g, "");

    if (!cleaned) {
      toast.error("Please enter your phone number.");
      return;
    }
    if (cleaned.length < 7) {
      toast.error("Please enter a valid phone number.");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(endpoints.sendEmail, {
        name: "Call You Back",
        contact: cleaned,
        contact_detail: {
          form_type: "Callback Popup",
          pageURL: pageURL,
        },
      });
      toast.success("Submitted successfully!");
      setPhone("");
      setOpen(false);
      router.push("/thankyou.html");
    } catch (error) {
      const message = error?.response?.data?.message || "Submission failed.";
      toast.error(message);
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const closeTimerRef = useRef(null);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center"
      onMouseEnter={() => {
        if (isHoverCapable) {
          if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
          setOpen(true);
        }
      }}
      onMouseLeave={() => {
        if (isHoverCapable) {
          closeTimerRef.current = window.setTimeout(() => setOpen(false), 180);
        }
      }}
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact us on WhatsApp"
        className="flex items-center"
        onClick={(e) => {
          if (!isHoverCapable) {
            e.preventDefault();
            setOpen((prev) => !prev);
          }
        }}
      >
        <img
          src={`${BASE_URL_IMG}/media/fr-svgs/whastapp-icon.png`}
          alt=""
          width={26}
          height={26}
          aria-hidden
        />
      </a>
      <button
        type="button"
        aria-label="Open call you back form"
        aria-expanded={open}
        className={`ml-1 p-0.5 transition-transform ${open ? "rotate-180" : ""}`}
        onClick={() => setOpen((prev) => !prev)}
      >
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M1 1L5 5L9 1"
            stroke={light ? "#F27A2A" : "#F27A2A"}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div
        className={`absolute right-0 top-full z-[60] pt-3 transition-all duration-200 origin-top ${open
          ? "opacity-100 visible translate-y-0"
          : "opacity-0 invisible -translate-y-1 pointer-events-none"
          }`}
      >
        <form
          onSubmit={handleSubmit}
          className="w-[260px] rounded-xl bg-white shadow-xl border border-black/5 p-4"
        >
          <p className="text-secondary text-[18px] text-center font-semibold mb-3 font-quicksand">
            Call You Back
          </p>
          <div className="px-[27px]">
            <div className="flex items-center text-center gap-2 border-b-2 border-secondary mb-3">
              <span className="text-black text-[18px] font-medium shrink-0">+44</span>
              <input
                type="tel"
                inputMode="numeric"
                aria-label="Phone number"
                placeholder="0205 000 0000"
                value={phone}
                maxLength={13}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
                  let formatted = digits;
                  if (digits.length > 7) {
                    formatted = `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
                  } else if (digits.length > 4) {
                    formatted = `${digits.slice(0, 4)} ${digits.slice(4)}`;
                  }
                  setPhone(formatted);
                }}
                className="w-full outline-none text-[18px] text-gray-800 placeholder:text-gray-400 font-quicksand"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="absolute rounded-lg left-[80px] py-[5px] px-[21px] bg-secondary hover:bg-secondary/80 disabled:opacity-60 text-white font-semibold text-[18px] flex items-center justify-center gap-2 transition-colors font-quicksand"
          >
            {submitting ? "Sending..." : "Send"}
            {!submitting && (
              <img src={`/media/fr-svgs/arrow-right-white.png`} alt="" className="fill-white" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WhatsAppCallbackDropdown;
