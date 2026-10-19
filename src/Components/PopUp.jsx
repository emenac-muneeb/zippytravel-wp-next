"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const PopUp = ({ title = "Error", message, onClose, navigateOnClose, setNavigateOnClose, handleCallBack }) => {

    const router = useRouter();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 w-full max-w-md transition duration-300 ease-out scale-100">

                {/* Header with Title */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-[#FFF6EC] rounded-full">
                        <span className="text-[#A57233] text-xl font-bold">!</span>
                    </div>
                    <h1 className="text-lg font-semibold text-[#A57233]">{title}</h1>
                </div>

                {/* Message Text */}
                <p className="text-gray-700 text-sm leading-relaxed mb-6">
                    {message}
                </p>

                {/* Action Button */}
                <div className="flex justify-end gap-3">
                    {navigateOnClose ? (
                        <>
                            <button
                                onClick={() => {
                                    setNavigateOnClose(false);
                                    handleCallBack();
                                    onClose();
                                    router.push("/thankyou.html");
                                }}
                                className="px-4 py-2 bg-[#A57233] text-white text-sm font-medium rounded-md shadow-md hover:bg-[#A57233]/80 hover:shadow-lg transition duration-200"
                            >
                                Request a Call Back
                            </button>
                            <button
                                onClick={() => {
                                    router.back();
                                    setNavigateOnClose(false);
                                    onClose();
                                }}
                                className="px-4 py-2 bg-[#A57233] text-white text-sm font-medium rounded-md shadow-md hover:bg-[#A57233]/80 hover:shadow-lg transition duration-200"
                            >
                               Search Again
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-[#A57233] text-white text-sm font-medium rounded-md shadow-md hover:bg-[#A57233]/80 hover:shadow-lg transition duration-200"
                        >
                            Close
                        </button>
                    )}
                </div>
            </div>
        </div >
    );
};

export default PopUp;
