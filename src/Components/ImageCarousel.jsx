import { useKeenSlider } from "keen-slider/react"
import React from "react"
import "keen-slider/keen-slider.min.css"
import { BASE_URL_IMG } from "../Helpers/imageurl" // Assuming you have this already

export function ImageCarousel({ images = [] }) {
    const [currentSlide, setCurrentSlide] = React.useState(0);
    const [sliderRef, instanceRef] = useKeenSlider({
        loop: true,
        mode: "snap",
        slides: {
            origin: 0,
            perView: 1,
            spacing: 0,
        },
        slideChanged(slider) {
            setCurrentSlide(slider.track.details.rel);
        },
    });

    return (
        <div className="w-full overflow-hidden min-h-[300px] md:min-h-[500px]">
            <div className="w-full relative min-h-[300px] md:min-h-[500px]">
                <div ref={sliderRef} className="keen-slider rounded-xl relative min-h-[300px] md:min-h-[500px]">
                    {images.map((img, index) => (
                        <div
                            key={index}
                            className="keen-slider__slide w-full flex justify-center items-center min-h-[300px] md:min-h-[500px]"
                        >
                            <img
                                src={`${BASE_URL_IMG}/${img.url}`}
                                alt={img.alt || `Slide ${index + 1}`}
                                title={img.title || ""}
                                className="max-w-full max-h-[300px] md:max-h-[500px] object-scale-down"
                                width={800}
                                height={500}
                                onError={(e) => e.currentTarget.src = "/Images/placeholder.png"}
                            />
                        </div>
                    ))}

                    {/* Slider Navigation lines */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                        {images.map((_, index) => (
                            <div
                                key={index}
                                onClick={() => instanceRef.current?.moveToIdx(index)}
                                className={`cursor-pointer transition-all duration-300 h-[4px] rounded-full ${currentSlide === index
                                    ? "w-14 bg-white shadow-md font-bold"
                                    : "w-10 bg-white/60"
                                    }`}
                            ></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
