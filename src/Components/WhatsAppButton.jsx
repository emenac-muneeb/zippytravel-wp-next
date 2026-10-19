import React from "react";

const WhatsAppButton = () => {
      const whatsappNumber = "442070434343";
      const whatsappLink = whatsappNumber ? `https://wa.me/${whatsappNumber}` : "#";


  return (
      <div className="fixed bottom-4 left-4 z-50 lg:hidden"> 
      {/* 👆 changed right-4 → left-4 */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="flex items-center space-x-2 flex-row-reverse"
      >

        {/* WhatsApp icon */}
        <div className="w-14 h-14 rounded-full shadow-lg bg-green-500 flex items-center justify-center transition-transform duration-300 hover:scale-105 motion-reduce:transform-none">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
            alt="whatsapp"
            className="w-8 h-8"
            aria-hidden
          />
        </div>
      </a>
    </div>
  );
};

export default WhatsAppButton;
