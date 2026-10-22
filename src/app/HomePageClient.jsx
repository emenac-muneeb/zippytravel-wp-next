"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import HeroSectionNew from "../Components/HeroSectionNew";
import LoadingScreen from "../Components/LoadingScreen";
import PopUp from "../Components/PopUp";
import ScrollDetailRight from "../Components/ScrollDetailRight";
import AirlineSlider from "../Components/AirlineSlider";
import LatestNews from "../Components/LatestNews";
import {
  DestinationSliderSkeleton,
  TestimonialsSkeleton,
  FaqSectionSkeleton,
  Skeleton,
} from "../Components/common/Skeleton";
import { ExclusiveAirlineFaresSkeleton } from "../Components/ExclusiveAirlineFares";

import CheapestFlightFares from "../Components/CheapestFlightFares";

const DestinationSlider = dynamic(() => import("../Components/DestinationSlider"), {
  ssr: true,
  loading: () => <DestinationSliderSkeleton />,
});

const ExclusiveAirlineFares = dynamic(() => import("../Components/ExclusiveAirlineFares"), {
  ssr: false,
  loading: () => <ExclusiveAirlineFaresSkeleton />,
});

const AffordableTourSection = dynamic(
  () => import("../Components/AffordableTourSection"),
  {
    ssr: true,
    loading: () => (
      <div className="py-[15px] sm:py-[25px]" aria-hidden>
        <div className="pb-[50px]">
          <div className="container">
            <div className="heading_section space-y-2">
              <Skeleton className="h-8 w-72" />
              <Skeleton className="h-4 w-96 max-w-full" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[24px]">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-[#FFFAF5] rounded-[30px] p-6 min-h-[280px] space-y-4"
                >
                  <Skeleton className="w-[104px] h-[104px] rounded-full mx-auto" />
                  <Skeleton className="h-7 w-3/4 mx-auto" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
  }
);

const NeedHelp = dynamic(() => import("../Components/NeedHelp"), {
  ssr: true,
  loading: () => <div className="min-h-[120px] w-full max-w-[94%] mx-auto" aria-hidden />,
});

const PopularDestinations = dynamic(() => import("../Components/PopularDestinations"), {
  ssr: true,
  loading: () => <div className="min-h-[400px] w-full" aria-hidden />,
});

const Testimonials = dynamic(() => import("../Components/Testimonials"), {
  ssr: true,
  loading: () => <TestimonialsSkeleton />,
});

const ScrollDetail = dynamic(() => import("../Components/ScrollDetail"), {
  ssr: true,
  loading: () => (
    <div className="w-full my-8 lg:my-12 py-2 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16" aria-hidden>
      <div className="hidden lg:flex items-center justify-between gap-6 xl:gap-8 2xl:gap-12 w-full min-h-[600px] xl:min-h-[656px]">
        <Skeleton className="w-[220px] xl:w-[263px] h-[600px] xl:h-[656px] rounded-[28px]" />
        <Skeleton className="flex-1 w-full h-[600px] xl:h-[656px] rounded-[28px]" />
        <Skeleton className="w-[300px] xl:w-[361px] h-[600px] xl:h-[656px] rounded-[28px]" />
      </div>
      <div className="flex flex-col lg:hidden gap-6 w-full max-w-[720px] mx-auto">
        <div className="flex items-center justify-center gap-3 sm:gap-5 w-full">
          <Skeleton className="w-[42%] max-w-[220px] h-[220px] sm:h-[300px] rounded-[20px]" />
          <Skeleton className="w-[54%] max-w-[280px] h-[220px] sm:h-[300px] rounded-[20px]" />
        </div>
        <Skeleton className="w-full h-[360px] sm:h-[420px] rounded-2xl" />
      </div>
    </div>
  ),
});

const FaqSection = dynamic(() => import("../Components/FaqSection"), {
  ssr: true,
  loading: () => <FaqSectionSkeleton />,
});

const HomePageClient = ({
  initialHomePage,
  initialCityFares,
  initialContinentCities,
  initialBanners,
  initialContinents = [],
  initialReviews = [],
  initialScrollParsed = null,
}) => {
  const [cityFares, setCityFares] = useState(() => {
    if (Array.isArray(initialCityFares)) return initialCityFares;
    if (initialCityFares?.data && Array.isArray(initialCityFares.data)) return initialCityFares.data;
    return [initialCityFares].filter(Boolean);
  });
  const [FlightLoading, setFlightLoading] = useState(false);
  const [homePage, setHomePage] = useState(initialHomePage);
  const [ContinentCities, setContinentCities] = useState(initialContinentCities);
  const [popupMessage, setPopupMessage] = useState(null);

  const mappedFares = React.useMemo(() => {
    const citiesList = Array.isArray(cityFares)
      ? cityFares
      : (cityFares?.data || []);

    return citiesList.map((city) => {
      if (!city) return null;
      const faresList = Array.isArray(city.fares)
        ? city.fares
        : (city.fares?.data || []);
      if (!faresList.length) return null;

      // Find the cheapest fare for this city
      const cheapestFare = faresList.reduce((min, fare) => {
        const farePrice = Number(fare.price);
        const minPrice = Number(min?.price);
        return (!min || (!isNaN(farePrice) && farePrice < minPrice)) ? fare : min;
      }, faresList[0]);

      const rawImage = city.image_url || city.banner_img?.[0]?.url || "fallback.jpg";
      const cleanImage = rawImage.replace(/^\/?media\//, "");

      return {
        id: city.id,
        title: city.title,
        city: city.title,
        country: city.country?.title || cheapestFare.origin?.country || "Unknown",
        continent: city.country?.continent?.title || "Unknown",
        code: cheapestFare.origin?.code || "LHR",
        price: cheapestFare.price,
        image: cleanImage,
        slug: city.slug,
      };
    }).filter(Boolean);
  }, [cityFares]);

  return (
    <>
      {popupMessage && (
        <PopUp title="Error" message={popupMessage} onClose={() => setPopupMessage(null)} />
      )}

      {FlightLoading ? (
        <LoadingScreen />
      ) : (
        <>
          <HeroSectionNew
            setFlightLoading={setFlightLoading}
            setPopupMessage={setPopupMessage}
            initialBanners={initialBanners}
          />

          <DestinationSlider
            fares={mappedFares}
            ContinentCities={ContinentCities}
            heading={homePage?.cheapfares_widget?.[0]?.heading || ""}
            subheading={homePage?.cheapfares_widget?.[0]?.sub_heading || ""}
          />
          {/* AffordableTourSection, ExclusiveAirlineFares, and Testimonials commented out as requested */}
          {/* <AffordableTourSection
            heading={homePage?.affordabletour_widget?.[0]?.heading || ""}
            subheading={homePage?.affordabletour_widget?.[0]?.sub_heading || ""}
          />
          <ExclusiveAirlineFares
            heading={homePage?.airfarepackages_widget?.[0]?.heading || "Exclusive Airline Fares"}
            subheading={homePage?.airfarepackages_widget?.[0]?.sub_heading || "Browse The best Business and First Class Airlines"}
            fares={homePage?.airfarepackages_widget?.[0]?.fares}
          />
          <Testimonials
            heading={homePage?.ourclientsays_widget?.[0]?.heading || ""}
            subheading={homePage?.ourclientsays_widget?.[0]?.sub_heading || ""}
            initialReviews={initialReviews}
          /> */}

          {/* <NeedHelp />
          <PopularDestinations
            heading=""
            subheading=""
            initialContinents={initialContinents}
          /> */}

          <AirlineSlider />

          <CheapestFlightFares />

          {(homePage?.scroll_description || initialScrollParsed?.hasContent) && (
            <div className="w-full font-quicksand bg-white">
              <ScrollDetail
                description={homePage?.scroll_description}
                parsedContent={initialScrollParsed}
              />
            </div>
          )}
           

          {homePage?.faq_widget?.[0]?.faq_ids && (
            <div className="sm:pt-16 pt-8">
              <FaqSection
                faq_ids={homePage.faq_widget[0].faq_ids.split(",").map(Number)}
                heading={homePage.faq_widget[0]?.heading || ""}
                subheading={homePage.faq_widget[0]?.sub_heading || ""}
              />
            </div>
          )}
          {homePage?.latestnews_widget?.[0]?.heading && (
           <div className="sm:mt-16 mt-8">
              <LatestNews
                heading={homePage?.latestnews_widget?.[0]?.heading || ""}
                subheading={homePage?.latestnews_widget?.[0]?.sub_heading || ""}
              />
            </div>
            )}
        </>
      )}
    </>
  );
};

export default HomePageClient;
