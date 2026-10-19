"use client";
import React, { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import Link from "next/link";
import axios from "axios";
import { MoveLeft, MoveRight } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import { endpoints } from "../Helpers/endpoints";
import { BASE_URL_IMG } from "../Helpers/imageurl";

const SLIDER_BREAKPOINTS = {
  640: { slidesPerView: 2 },
  1280: { slidesPerView: 3 },
};

const GRID_CLASS =
  "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2";

function StablePopularDestinationsSwiper({ items, getKey, renderCard, loop, prevRef, nextRef }) {
  const [mounted, setMounted] = useState(false);
  const [swiperReady, setSwiperReady] = useState(false);
  const initDoneRef = useRef(false);

  // Swiper loop needs more slides than max slidesPerView (3). Require at least 4.
  const enableLoop = Boolean(loop) && items.length >= 4;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSwiperInit = (swiper) => {
    if (initDoneRef.current) return;
    initDoneRef.current = true;

    if (prevRef?.current && nextRef?.current && swiper.params?.navigation) {
      swiper.params.navigation.prevEl = prevRef.current;
      swiper.params.navigation.nextEl = nextRef.current;
    }

    requestAnimationFrame(() => {
      try {
        swiper.update();
        if (
          swiper.navigation &&
          prevRef?.current &&
          nextRef?.current &&
          !swiper.navigation.initialized
        ) {
          swiper.navigation.init();
          swiper.navigation.update();
        }
      } catch (err) {
        console.warn("Popular destinations slider init:", err);
      }
      requestAnimationFrame(() => setSwiperReady(true));
    });
  };

  const gridClass = `${GRID_CLASS} max-h-[400px] overflow-hidden ${swiperReady ? "invisible absolute inset-0 pointer-events-none" : ""
    }`;

  return (
    <div className="min-h-[400px] relative overflow-hidden">
      <div className={gridClass}>
        {items.slice(0, 3).map((item, index) => (
          <div key={getKey(item, index)}>{renderCard(item, index)}</div>
        ))}
      </div>
      {mounted ? (
        <Swiper
          className={
            swiperReady
              ? "popular-stable-swiper relative w-full overflow-hidden"
              : "popular-stable-swiper absolute inset-0 opacity-0 pointer-events-none"
          }
          modules={[Navigation]}
          spaceBetween={8}
          slidesPerView={1}
          loop={enableLoop}
          watchOverflow
          observer
          observeParents
          onSwiper={handleSwiperInit}
          navigation={{ prevEl: prevRef?.current, nextEl: nextRef?.current }}
          onBeforeInit={(swiper) => {
            if (prevRef?.current) swiper.params.navigation.prevEl = prevRef.current;
            if (nextRef?.current) swiper.params.navigation.nextEl = nextRef.current;
          }}
          breakpoints={SLIDER_BREAKPOINTS}
        >
          {items.map((item, index) => (
            <SwiperSlide key={getKey(item, index)} className="!h-auto">
              {renderCard(item, index)}
            </SwiperSlide>
          ))}
        </Swiper>
      ) : null}
    </div>
  );
}

function mapContinentItems(data) {
  // Handle both raw API array and nested shapes
  let items = data;
  if (!Array.isArray(items)) {
    items = data?.result?.data || data?.data || [];
  }
  if (!Array.isArray(items) || !items.length) return [];
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    image: item.image_url
      ? `${BASE_URL_IMG}/media/${item.image_url}`
      : item.image || '',
    slug: item.slug,
    imgage_alt: item.image_alt || item.imgage_alt || item.title || '',
  }));
}

const PopularDestinations = ({
  heading = "",
  subheading = "",
  initialContinents = [],
}) => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [destinations, setDestinations] = useState(() =>
    mapContinentItems(initialContinents)
  );

  // Start at 0 for SSR consistency; randomize after mount to avoid hydration mismatch
  const [randomIndex, setRandomIndex] = useState(0);

  useEffect(() => {
    if (!destinations.length) return;
    const maxIndex = Math.min(4, destinations.length - 1);
    setRandomIndex(Math.floor(Math.random() * (maxIndex + 1)));
  }, [destinations.length]);

  useEffect(() => {
    if (destinations.length > 0) return;

    const fetchContinents = async () => {
      setLoading(true);
      try {
        const res = await axios.get(endpoints.getContinents);
        if (res.data.status === 1) {
          const fetchedData = mapContinentItems(res.data.result.data);
          setDestinations(fetchedData);
          const maxIndex = Math.min(4, fetchedData.length - 1);
          setRandomIndex(Math.floor(Math.random() * (maxIndex + 1)));
        }
      } catch (error) {
        console.error("Failed to fetch continents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContinents();
  }, [destinations.length]);

  if (!destinations.length) {
    return null;
  }

  const renderCard = (item, index) => (
    <Link href={`/${item.slug}`}>
      <div className="relative h-[400px] text-white cursor-pointer px-2 rounded-xl overflow-hidden">
        <img
          src={item.image}
          alt={item.imgage_alt}
          loading={index < 3 ? "eager" : "lazy"}
          className="absolute inset-0 w-full h-full object-cover rounded-xl"
        />
        <div className="absolute inset-0 bg-black/40 z-10" />
        <div className="absolute flex justify-between bottom-4 left-4 right-4 z-20">
          <p className="font-bold font-quicksand text-xl text-white white_tags">
            {item.title}
          </p>
          <span className="text-sm text-white hover:underline inline-flex items-center gap-1 mt-1">
            View All Fares
            <img
              src={`${BASE_URL_IMG}/assets/svgs/Arrow1.svg`}
              alt=""
              aria-hidden
            />
          </span>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="flex flex-col lg:flex-row rounded-xl overflow-hidden w-full p-1 gap-[5px]">
      <div className="w-full lg:w-[67%] bg-white overflow-hidden">
        <StablePopularDestinationsSwiper
          items={destinations}
          getKey={(item, index) => `${item.id}-${index}`}
          renderCard={renderCard}
          loop
          prevRef={prevRef}
          nextRef={nextRef}
        />
      </div>

      <div className="w-full lg:w-[33%] relative h-[400px] overflow-hidden rounded-xl text-white flex items-center justify-center">
        <img
          src={destinations[randomIndex]?.image}
          alt={destinations[randomIndex]?.imgage_alt || "Popular Destinations"}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 text-center px-6 max-w-[100%] flex flex-col items-center justify-center">
          <h2 className="text-4xl lg:text-5xl font-semibold leading-tight font-gloock text-white white_tags text-right">
            Cheap Fares <br /> to Popular <br /> Destinations
          </h2>
          <p className="text-sm text-white/90 mt-3 text-right w-full">
            Travellers always look for comfort on their
            <br />
            air trips to the places.Emenac Travel comfort
            <br />
            the customers over their budgets.
          </p>
          <div className="flex items-center justify-between gap-4 mt-6 w-full">
            <div className="flex items-center justify-between gap-2 w-[25%]">
              <button
                type="button"
                ref={prevRef}
                className="text-white transition p-2"
                aria-label="Previous"
              >
                <MoveLeft />
              </button>
              <button
                type="button"
                ref={nextRef}
                className="text-white transition p-2"
                aria-label="Next"
              >
                <MoveRight />
              </button>
            </div>
            <Link
              href="/continents.htm"
              className="text-white flex items-center hover:underline text-sm font-medium gap-2"
            >
              View All Fares
              <img
                src={`${BASE_URL_IMG}/assets/svgs/Arrow-white-up.svg`}
                alt=""
                aria-hidden
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopularDestinations;
