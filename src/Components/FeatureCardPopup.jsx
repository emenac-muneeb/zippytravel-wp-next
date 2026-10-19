"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";
import { useGeneralSettings } from "../Context/GeneralSettingsContext";
import { endpoints } from "../Helpers/endpoints";

const FeatureCardPopup = ({ onClose }) => {
  const router = useRouter();
  const { footerSetting } = useGeneralSettings();
  const phone = footerSetting?.contents?.footer_phone || "0205 000 0000";
  const email = footerSetting?.contents?.footer_email || "";
  const whatsapp = "4420-7043-4343";

  const [callbackPhone, setCallbackPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pageURL, setPageURL] = useState("");
  const [visible, setVisible] = useState(false);
  const overlayRef = useRef(null);

  useEffect(() => {
    setPageURL(window.location.href);
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) handleClose();
  };

  const formatWhatsApp = (num) => num?.replace(/\D/g, "");

  const handlePhoneInput = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
    let formatted = digits;
    if (digits.length > 7) {
      formatted = `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    } else if (digits.length > 4) {
      formatted = `${digits.slice(0, 4)} ${digits.slice(4)}`;
    }
    setCallbackPhone(formatted);
  };

  const handleCallbackSubmit = async (e) => {
    e?.preventDefault?.();
    const cleaned = callbackPhone.replace(/\D/g, "");
    if (!cleaned || cleaned.length < 7) {
      toast.error("Please enter a valid phone number.");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(endpoints.sendEmail, {
        name: "Call You Back",
        contact: cleaned,
        contact_detail: { form_type: "24/7 support", pageURL },
      });
      toast.success("Submitted successfully!");
      setCallbackPhone("");
      handleClose();
      router.push("/thankyou.html");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[999] flex items-center justify-center px-4 transition-[background-color,backdrop-filter] duration-300"
      style={{
        backgroundColor: visible ? "rgba(0,0,0,0.40)" : "rgba(0,0,0,0)",
        backdropFilter: visible ? "blur(3px)" : "blur(0px)",
      }}
    >
      <div
        className="flex flex-col items-center w-full max-w-[660px] transition-[opacity,transform] duration-300"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0) scale(1)" : "translateY(15px) scale(0.97)",
        }}
      >
        {/* ── Close Button (Top Center with Shadow) ── */}
        <button
          onClick={handleClose}
          aria-label="Close"
          className="w-11 h-11 rounded-full border-2 border-[#9C6628] bg-white flex items-center justify-center mb-4 cursor-pointer shrink-0 shadow-[2px_3px_0px_#E2B888] hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <line x1="2" y1="2" x2="14" y2="14" stroke="#9C6628" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="14" y1="2" x2="2" y2="14" stroke="#9C6628" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </button>

        {/* ── Main Cream Card Container ── */}
        <div className="w-full font-quicksand bg-[#FFF3E7] border border-[#E5C7A3] rounded-[22px] p-6 sm:p-7 shadow-[0_8px_30px_rgba(156,102,40,0.12)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* 1. Call Now! */}
            <a
              href={`tel:${phone.replace(/\s|-/g, "")}`}
              className="flex items-center gap-4 bg-white border border-[#E5C7A3] rounded-[16px] px-5 py-3.5 no-underline hover:border-[#9C6628] transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="27.723" height="27.723" viewBox="0 0 27.723 27.723">
                <g id="Group_4013" data-name="Group 4013" transform="translate(-0.001)">
                  <g id="Group_3765" data-name="Group 3765" transform="translate(0 0.716)">
                    <path id="Path_58584" data-name="Path 58584" d="M3480.974,2387.18l-.285.29c-.411.417-.836.851-1.286,1.245a7.306,7.306,0,0,1-4.832,1.826,7.393,7.393,0,0,1-3.3-.779,34.806,34.806,0,0,1-9.29-6.688,36.633,36.633,0,0,1-6.618-9.338,6.925,6.925,0,0,1-.692-2.335.313.313,0,0,0-.024-.077l-.022-.061-.006-.023,0-1.387c.02-.109.04-.216.059-.325.043-.236.089-.48.146-.719a7.336,7.336,0,0,1,1.84-3.353c.4-.42.837-.857,1.332-1.337a1.874,1.874,0,0,1,2.734.014c1.534,1.526,3.092,3.084,4.764,4.763a1.874,1.874,0,0,1-.005,2.78c-.378.385-.765.77-1.14,1.144-.249.25-.5.5-.747.747a1.086,1.086,0,0,0-.169,1.594c.2.3.413.6.619.889l.266.376a.909.909,0,0,1,.183.679.714.714,0,0,1-.308.465.777.777,0,0,1-1.1-.257c-.319-.442-.681-.944-1.01-1.448a2.533,2.533,0,0,1,.328-3.247c.416-.426.845-.852,1.259-1.265q.338-.334.671-.67c.328-.328.33-.468.012-.786-1.66-1.663-3.169-3.172-4.613-4.613-.157-.157-.278-.231-.38-.231h0c-.1,0-.222.076-.377.236s-.327.326-.488.483a10.435,10.435,0,0,0-1.124,1.215,5.566,5.566,0,0,0-.586,6.176,33.725,33.725,0,0,0,8.926,11.241,31.845,31.845,0,0,0,6.375,4.057,5.763,5.763,0,0,0,6.413-.969c.415-.381.818-.792,1.209-1.19l.209-.214a.388.388,0,0,0-.007-.635c-1.688-1.7-3.238-3.247-4.741-4.741-.229-.229-.407-.223-.655.023l-.946.944-.965.965a2.542,2.542,0,0,1-3.44.332c-.615-.418-1.22-.87-1.805-1.309l-.187-.138a.874.874,0,0,1-.366-.586.729.729,0,0,1,.166-.554.77.77,0,0,1,1.124-.062l.38.28c.506.373,1.032.759,1.555,1.124a1.04,1.04,0,0,0,1.476-.138c.4-.388.794-.788,1.18-1.175l.73-.732a1.884,1.884,0,0,1,2.866-.008c1.653,1.648,3.183,3.178,4.679,4.678A1.9,1.9,0,0,1,3480.974,2387.18Z" transform="translate(-3454.621 -2363.534)" fill="#a57233" />
                  </g>
                  <g id="Group_3766" data-name="Group 3766" transform="translate(17.086)">
                    <path id="Path_58585" data-name="Path 58585" d="M3746.008,2362.183a.717.717,0,0,1-.533.217c-.451,0-.735-.322-.76-.861a8.311,8.311,0,0,0-4.677-7.395,7.861,7.861,0,0,0-3.433-.865c-.036,0-.073,0-.11,0-.065,0-.132,0-.2-.007a.755.755,0,0,1-.041-1.5,1.725,1.725,0,0,1,.266-.006c.05,0,.108,0,.176,0h0a9.7,9.7,0,0,1,6.244,2.522,9.8,9.8,0,0,1,3.184,5.99c.049.375.082.776.1,1.22A.9.9,0,0,1,3746.008,2362.183Z" transform="translate(-3735.593 -2351.757)" fill="#a57233" />
                  </g>
                  <g id="Group_3767" data-name="Group 3767" transform="translate(17.087 3.651)">
                    <path id="Path_58586" data-name="Path 58586" d="M3742.322,2418.572a.81.81,0,0,1-.538.17.947.947,0,0,1-.2-.019c-.19-.035-.431-.18-.5-.651-.022-.149-.041-.3-.06-.449a5.2,5.2,0,0,0-.256-1.233,4.617,4.617,0,0,0-4.26-3.079c-.028,0-.057,0-.086,0a1.569,1.569,0,0,1-.166-.011.737.737,0,0,1-.646-.69.725.725,0,0,1,.543-.772,1.242,1.242,0,0,1,.267-.038.23.23,0,0,1,.028,0l.011,0h.013a6.264,6.264,0,0,1,6.112,6.045A1.044,1.044,0,0,1,3742.322,2418.572Z" transform="translate(-3735.604 -2411.79)" fill="#a57233" />
                  </g>
                  <g id="Group_3768" data-name="Group 3768" transform="translate(17.087 7.312)">
                    <path id="Path_58587" data-name="Path 58587" d="M3738.94,2474.479a.759.759,0,0,1-.694.856l-.066,0a.747.747,0,0,1-.742-.709c-.112-.751-.37-1.012-1.1-1.116a.756.756,0,1,1,.145-1.5,2.557,2.557,0,0,1,2.458,2.47Z" transform="translate(-3735.611 -2472.009)" fill="#a57233" />
                  </g>
                  <g id="Group_3769" data-name="Group 3769" transform="translate(10.166 15.458)">
                    <path id="Path_58588" data-name="Path 58588" d="M3623.3,2606.686a.765.765,0,0,1-.217.557.738.738,0,0,1-.533.225h0a.76.76,0,0,1-.751-.751.742.742,0,0,1,.739-.757h.015A.734.734,0,0,1,3623.3,2606.686Z" transform="translate(-3621.799 -2605.96)" fill="#a57233" />
                  </g>
                </g>
              </svg>

              <div className="min-w-0">
                <p className="text-[#9C6628] text-[14px] font-bold leading-tight m-0">Call Now!</p>
                <p className="text-[#444444] text-[15px] font-normal leading-tight mt-1 mb-0">{phone}</p>
              </div>
            </a>

            {/* 2. Call You Back */}
            <form
              onSubmit={handleCallbackSubmit}
              className="flex items-center justify-between gap-2 bg-white border border-[#E5C7A3] rounded-[16px] px-4 py-2.5"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="26.975" height="29.362" viewBox="0 0 26.975 29.362">
                  <g id="Group_4014" data-name="Group 4014" transform="translate(13309.665 -5227)">
                    <g id="Group_4005" data-name="Group 4005" transform="translate(-13309.665 5228.639)">
                      <g id="Group_3765" data-name="Group 3765" transform="translate(0 0.716)">
                        <path id="Path_58584" data-name="Path 58584" d="M3480.974,2387.18l-.285.29c-.411.417-.836.851-1.286,1.245a7.306,7.306,0,0,1-4.832,1.826,7.393,7.393,0,0,1-3.3-.779,34.806,34.806,0,0,1-9.29-6.688,36.633,36.633,0,0,1-6.618-9.338,6.925,6.925,0,0,1-.692-2.335.313.313,0,0,0-.024-.077l-.022-.061-.006-.023,0-1.387c.02-.109.04-.216.059-.325.043-.236.089-.48.146-.719a7.336,7.336,0,0,1,1.84-3.353c.4-.42.837-.857,1.332-1.337a1.874,1.874,0,0,1,2.734.014c1.534,1.526,3.092,3.084,4.764,4.763a1.874,1.874,0,0,1-.005,2.78c-.378.385-.765.77-1.14,1.144-.249.25-.5.5-.747.747a1.086,1.086,0,0,0-.169,1.594c.2.3.413.6.619.889l.266.376a.909.909,0,0,1,.183.679.714.714,0,0,1-.308.465.777.777,0,0,1-1.1-.257c-.319-.442-.681-.944-1.01-1.448a2.533,2.533,0,0,1,.328-3.247c.416-.426.845-.852,1.259-1.265q.338-.334.671-.67c.328-.328.33-.468.012-.786-1.66-1.663-3.169-3.172-4.613-4.613-.157-.157-.278-.231-.38-.231h0c-.1,0-.222.076-.377.236s-.327.326-.488.483a10.435,10.435,0,0,0-1.124,1.215,5.566,5.566,0,0,0-.586,6.176,33.725,33.725,0,0,0,8.926,11.241,31.845,31.845,0,0,0,6.375,4.057,5.763,5.763,0,0,0,6.413-.969c.415-.381.818-.792,1.209-1.19l.209-.214a.388.388,0,0,0-.007-.635c-1.688-1.7-3.238-3.247-4.741-4.741-.229-.229-.407-.223-.655.023l-.946.944-.965.965a2.542,2.542,0,0,1-3.44.332c-.615-.418-1.22-.87-1.805-1.309l-.187-.138a.874.874,0,0,1-.366-.586.729.729,0,0,1,.166-.554.77.77,0,0,1,1.124-.062l.38.28c.506.373,1.032.759,1.555,1.124a1.04,1.04,0,0,0,1.476-.138c.4-.388.794-.788,1.18-1.175l.73-.732a1.884,1.884,0,0,1,2.866-.008c1.653,1.648,3.183,3.178,4.679,4.678A1.9,1.9,0,0,1,3480.974,2387.18Z" transform="translate(-3454.621 -2363.534)" fill="#a57233" />
                      </g>
                      <g id="Group_3769" data-name="Group 3769" transform="translate(10.166 15.458)">
                        <path id="Path_58588" data-name="Path 58588" d="M3623.3,2606.686a.765.765,0,0,1-.217.557.738.738,0,0,1-.533.225h0a.76.76,0,0,1-.751-.751.742.742,0,0,1,.739-.757h.015A.734.734,0,0,1,3623.3,2606.686Z" transform="translate(-3621.799 -2605.96)" fill="#a57233" />
                      </g>
                    </g>
                    <g id="Group_4002" data-name="Group 4002" transform="translate(-13597.408 4841.488) rotate(-90)">
                      <path id="Path_58703" data-name="Path 58703" d="M-267.342,312.82v-.245q0-3.712,0-7.424a.589.589,0,0,1,.426-.644.567.567,0,0,1,.713.486c.007.077.005.155.005.232q0,3.685,0,7.37v.229c.072-.066.116-.1.156-.142.371-.371.741-.743,1.114-1.113a.577.577,0,0,1,.856-.044.583.583,0,0,1-.05.857q-1.1,1.1-2.2,2.2a.574.574,0,0,1-.895-.007q-1.1-1.1-2.2-2.2a.577.577,0,0,1-.037-.857.576.576,0,0,1,.843.046c.373.369.743.742,1.114,1.112C-267.458,312.717-267.414,312.754-267.342,312.82Z" transform="translate(-121.604 -0.076)" fill="#a57233" />
                      <path id="Path_58704" data-name="Path 58704" d="M-395.047,306.376c-.075.069-.119.107-.159.147-.376.375-.749.752-1.127,1.125a.572.572,0,0,1-.843.023.575.575,0,0,1,.034-.831q1.111-1.116,2.226-2.226a.572.572,0,0,1,.882,0q1.109,1.1,2.214,2.213a.576.576,0,0,1,.041.845.577.577,0,0,1-.856-.042c-.409-.407-.816-.817-1.266-1.267v.247q0,3.712,0,7.423a.6.6,0,0,1-.414.654.566.566,0,0,1-.726-.486c-.007-.077,0-.155,0-.232q0-3.676,0-7.352Z" transform="translate(0 0)" fill="#a57233" />
                    </g>
                  </g>
                </svg>

                <div className="min-w-0 flex-1">
                  <p className="text-[#9C6628] text-[14px] font-bold leading-tight m-0">Call You Back</p>
                  <div className="flex items-center mt-1 border-b border-[#9C6628]/40 pb-0.5">
                    <span className="text-[#333333] text-[14px] font-semibold mr-1.5">+44</span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="203 000 0000"
                      value={callbackPhone}
                      onChange={handlePhoneInput}
                      className="w-full border-0 outline-none text-[14px] text-[#333333] placeholder:text-[#cccccc] bg-transparent p-0 min-w-0"
                      aria-label="Callback phone number"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="shrink-0 bg-[#9C6628] text-white text-[13px] font-semibold px-4 py-2 rounded-[12px] cursor-pointer whitespace-nowrap disabled:opacity-60 hover:bg-[#83531d] transition-colors duration-200 ml-1"
              >
                {submitting ? "..." : "Send"}
              </button>
            </form>

            {/* 3. WhatsApp Us */}
            <a
              href={`https://wa.me/${formatWhatsApp(whatsapp)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-white border border-[#E5C7A3] rounded-[16px] px-2 py-2 no-underline hover:border-[#25D366] transition-colors duration-200"
            >
              <img src="/media/fr-svgs/whastapp-icon.png" alt="WhatsApp Us" width={50} height={50} className="shrink-0" />
              <span className="text-[#9C6628] text-[16px] font-semibold">WhatsApp &nbsp;Us</span>
            </a>

            {/* 4. Send Email To Us */}
            <a
              href={email ? `mailto:${email}` : undefined}
              className="flex items-center gap-4 bg-white border border-[#E5C7A3] rounded-[16px] px-5 py-4 no-underline hover:border-[#9C6628] transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="45.264" height="25.976" viewBox="0 0 45.264 25.976">
                <g id="Group_4016" data-name="Group 4016" transform="translate(-796.442 -156.02)">
                  <g id="Group_4009" data-name="Group 4009" transform="translate(802.534 156.02)">
                    <path id="Path_58705" data-name="Path 58705" d="M881.493,160.121a5.339,5.339,0,0,0-.085-1.081,3.744,3.744,0,0,0-1.349-2.2,4.079,4.079,0,0,0-2.538-.819q-7.354,0-14.71,0h-16.5c-.11,0-.224,0-.339.005a3.76,3.76,0,0,0-3.525,2.958,12.04,12.04,0,0,0-.1,2.29l0,.187a.7.7,0,0,0,.733.639h.007a.688.688,0,0,0,.717-.632c.027-.28.028-.562.028-.859,0-.185,0-.377.007-.567s.028-.352.052-.551c.012-.1.024-.2.036-.313l.053-.5.384.331,11.413,9.8.234.2-.234.2-5.617,4.822-5.707,4.9-.1.088-.133-.032-.082-.02-.1-.024-.2-.049v-.21c0-.2,0-.41,0-.616,0-.457.008-.929-.01-1.39a.717.717,0,0,0-.74-.763h-.033a.743.743,0,0,0-.72.789c-.009.266-.008.538-.005.8,0,.112,0,.223,0,.335a3.846,3.846,0,0,0,4.13,4.153h30.914a3.818,3.818,0,0,0,4.122-4.1C881.5,172.225,881.5,166.245,881.493,160.121Zm-34.94-1.224-.565-.485c-.074-.065-.145-.129-.242-.219l-.19-.175-.5-.462h33.707l-.49.459-.161.154c-.089.085-.159.151-.235.216q-7.434,6.377-14.872,12.753a1.661,1.661,0,0,1-1.078.511,1.7,1.7,0,0,1-1.1-.522Q853.689,165.015,846.553,158.9Zm-1.537,21.544.543-.467,3.7-3.181,7.747-6.658.174-.149.173.15.668.579c.663.576,1.317,1.144,1.972,1.711l.048.042a4.16,4.16,0,0,0,.353.284,2.664,2.664,0,0,0,1.513.481,2.724,2.724,0,0,0,1.759-.66c.647-.542,1.271-1.089,1.93-1.667l.881-.77.174-.151.174.15,4.382,3.765,7.07,6.074.544.467Zm34.922-1.032-.438-.377-5.7-4.9-5.736-4.925-.235-.2.235-.2,11.441-9.826.438-.376Z" transform="translate(-842.325 -156.02)" fill="#a57233" />
                  </g>
                  <g id="Group_4010" data-name="Group 4010" transform="translate(796.442 170.79)">
                    <path id="Path_58706" data-name="Path 58706" d="M806.924,268.515a.938.938,0,0,1-.722.281c-.544,0-1.131.005-1.849.005H799.14c-.708,0-1.288,0-1.824-.007a.913.913,0,0,1-.721-.293.744.744,0,0,1-.134-.632.818.818,0,0,1,.894-.595c.481,0,1.005-.007,1.648-.007h4.973c.846,0,1.533,0,2.165,0,.317,0,.863.086.939.644A.732.732,0,0,1,806.924,268.515Z" transform="translate(-796.443 -267.27)" fill="#a57233" />
                  </g>
                  <g id="Group_4011" data-name="Group 4011" transform="translate(799.486 165.694)">
                    <path id="Path_58707" data-name="Path 58707" d="M826.624,230.271a1.254,1.254,0,0,1-.579.141c-1.038.008-2.1.011-3.168.011-.85,0-1.722,0-2.591-.007a1,1,0,0,1-.732-.266.69.69,0,0,1-.187-.518c.016-.451.373-.734.932-.738q.562,0,1.123,0h3.492c.485,0,.879,0,1.241.007a.75.75,0,0,1,.787.551A.678.678,0,0,1,826.624,230.271Z" transform="translate(-819.367 -228.89)" fill="#a57233" />
                  </g>
                </g>
              </svg>

              <span className="text-[#9C6628] text-[16px] font-semibold">Send Email To Us</span>
            </a>

          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureCardPopup;
