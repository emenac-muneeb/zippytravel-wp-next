import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const QuoteIcon = () => (
    <svg width="24" height="20.337" viewBox="0 0 24 20.337" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.155,20.337H0V11.164C0,4.992,3.342,1.372,8.423,0l1.737,2.693C6.368,3.94,4.358,6.726,4.358,10.08h5.797V20.337z M24,20.337H13.845V11.164c0-6.172,3.342-9.792,8.423-11.164L24,2.693c-3.792,1.247-5.802,4.033-5.802,7.387H24V20.337z" fill="#EB9448" />
    </svg>
);

const ReviewCard = ({ review, priority = false }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const stripHtml = (html) => {
        if (!html) return "";
        return String(html).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    };

    const textContent = stripHtml(review.text || '');
    const shouldTruncate = textContent.length > 160;
    const displayedText = textContent.slice(0, 160) + (shouldTruncate ? '...' : '');

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; }
    }, [isModalOpen]);

    return (
        <>
            <div className="relative bg-white rounded-[24px] px-6 pb-8 shadow-[0_3px_14px_0_#A5723326] flex flex-col items-center h-full min-h-[300px] border border-[#f0f0f0]">
                {/* Profile Picture */}
                <div className="absolute left-1/2 top-[-58px] -translate-x-1/2 w-[116px] h-[116px] rounded-full 
                border-[2px] border-[#d67938] bg-white shadow-[4px_4px_0_0_#F1A86857] overflow-hidden z-10 
                flex items-center justify-center p-0">
                    <div className="w-full h-full rounded-full overflow-hidden">
                        <img
                            src={review.image}
                            alt={review.name}
                            loading={priority ? "eager" : "lazy"}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Rating Stars */}
                <div className="absolute right-6 top-[30px] flex text-[#F1A868] text-xl">
                    {Array.from({ length: 5 }).map((_, idx) => (
                        <span key={idx}>
                            {idx < review.rating ? (
                                <img src="/media/fr-svgs/fillstar.svg" alt="star" />
                            ) : (
                                <img src="/media/fr-svgs/unfillstar.svg" alt="star" />
                            )}
                        </span>
                    ))}
                </div>

                {/* Content Container */}
                <div className="pt-[80px] w-full flex flex-col items-center flex-grow">
                    {/* Name */}
                    <div className='pb-[28px] text-center'>
                        <span className="text-[20px] font-[600] text-[#343434] text-center block">
                            {review.name}
                        </span>
                        <span className='text-[16px] font-[300] text-[#343434] text-center'>
                            {review.designation || 'London'}
                        </span>
                    </div>

                    {/* Custom Divider */}
                    <div className="relative w-full flex items-center justify-center my-6">
                        <div className="w-[70%] h-[1px] bg-[#A57233]"></div>
                        <div className="absolute w-[40px] h-[40px] rounded-full border border-[#A57233] shadow-[2px_2px_0_0_#F1A86857] bg-white flex items-center justify-center">
                            <QuoteIcon />
                        </div>
                    </div>

                    {/* Review Text */}
                    <div className="text-center w-full px-2 flex flex-col items-center pt-[13px] h-[100%]">
                        <p className="text-[16px] sm:text-[16px] text-[#343434] font-[300] leading-relaxed">
                            {displayedText}
                        </p>
                        {!shouldTruncate && (
                            <div
                                className="mt-3 block w-[99px] h-px shrink-0 bg-[#A57233] mt-auto"
                                aria-hidden="true"
                            />
                        )}
                        {shouldTruncate && (
                            <button
                                className="text-gray-800 cursor-pointer underline underline-offset-[5px] font-semibold text-[17px] mt-3"
                                onClick={() => setIsModalOpen(true)}
                            >
                                Read More
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal - rendered via Portal to escape Swiper's transform context */}
            {mounted && isModalOpen && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
                    <div className="relative bg-white rounded-[24px] px-8 pb-10 shadow-2xl flex flex-col items-center w-full max-w-[700px] mt-12 animate-in fade-in zoom-in-95 duration-200">
                        {/* Close Button */}
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>

                        {/* Profile Picture (Modal) */}
                        <div className="absolute left-1/2 top-[-58px] -translate-x-1/2 w-[116px] h-[116px] rounded-full border-[2px] border-[#d67938] bg-white shadow-[4px_4px_0_0_#F1A86857] overflow-hidden z-10 flex items-center justify-center p-1">
                            <div className="w-full h-full rounded-full overflow-hidden">
                                <img
                                    src={review.image}
                                    alt={review.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Rating Stars (Modal) */}
                        <div className="absolute right-8 top-8 flex text-[#F1A868] text-2xl">
                            {Array.from({ length: 5 }).map((_, idx) => (
                                <span key={idx}>{idx < review.rating ? '★' : '☆'}</span>
                            ))}
                        </div>

                        {/* Modal Content */}
                        <div className="pt-[80px] w-full flex flex-col items-center">
                            <h4 className="text-[24px] font-[700] text-gray-800 text-center">
                                {review.name}
                            </h4>

                            {/* Modal Divider */}
                            <div className="relative w-full flex items-center justify-center my-8">
                                <div className="w-[80%] h-[1px] bg-[#d67938]"></div>
                                <div className="absolute w-[46px] h-[46px] rounded-full border border-[#d67938] bg-white flex items-center justify-center">
                                    <QuoteIcon />
                                </div>
                            </div>

                            {/* Full Review Text */}
                            <p className="text-[16px] sm:text-[17px] text-gray-600 leading-relaxed text-center px-4">
                                {textContent}
                            </p>

                            {/* Bottom Divider Line */}
                            <div className="w-[120px] h-[1px] bg-[#d67938] mt-10"></div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default ReviewCard;
