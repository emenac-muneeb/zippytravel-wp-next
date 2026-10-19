import React from 'react';

export default function ReviewApp() {
    const images = [
        {
            src: '/Images/feefo.png',
            width: 'w-36',
        },
        {
            src: '/Images/Google.png',
            width: 'w-32',
        },
        {
            src: '/Images/Trus.png',
            width: 'w-40',
        }
    ];

    return (
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-6 sm:gap-8 my-10 mx-auto w-full max-w-[90%]">
            {images.map((image, index) => (
                <React.Fragment key={index}>
                    <img
                        src={image.src}
                        alt={`Review platform ${index + 1}`}
                        className={`h-10 sm:h-12 object-contain ${image.width}`}
                    />
                    {index < images.length - 1 && (
                        <div className="hidden sm:block h-10 sm:h-12 w-[1px] bg-gray-400"></div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}
