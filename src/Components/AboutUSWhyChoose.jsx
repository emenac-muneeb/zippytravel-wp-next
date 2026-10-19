"use client";

import React, { useEffect, useRef, useState } from "react";

const defaultStats = [
  {
    id: 1,
    image: "/media/fr-svgs/awc1.png",
    title: "100%",
    subtitle: "Safe and Secure",
  },
  {
    id: 2,
    image: "/media/fr-svgs/awc2.png",
    title: "10,000+",
    subtitle: "Loyal Customer",
  },
  {
    id: 3,
    image: "/media/fr-svgs/awc3.png",
    title: "150+",
    subtitle: "Live Experts",
  },
];

function parseStatTitle(title) {
  const str = String(title).trim();
  const match = str.match(/^([\d,]+)(.*)$/);
  if (!match) return { end: null, suffix: str, hasNumber: false, useCommas: false };

  const end = parseInt(match[1].replace(/,/g, ""), 10);
  return {
    end,
    suffix: match[2] || "",
    hasNumber: !Number.isNaN(end),
    useCommas: match[1].includes(","),
  };
}

function formatNumber(value, useCommas) {
  return useCommas ? value.toLocaleString("en-US") : String(value);
}

function AnimatedStat({ title }) {
  const ref = useRef(null);
  const hasAnimated = useRef(false);
  const { end, suffix, hasNumber, useCommas } = parseStatTitle(title);
  const [display, setDisplay] = useState(() => (hasNumber ? "0" : title));

  useEffect(() => {
    if (!hasNumber || end === null) return undefined;

    const element = ref.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAnimated.current) return;
        hasAnimated.current = true;

        const duration = 2600;
        const startTime = performance.now();

        const tick = (now) => {
          const progress = Math.min((now - startTime) / duration, 1);
          const eased = 1 - (1 - progress) ** 3;
          const current = Math.round(end * eased);
          setDisplay(formatNumber(current, useCommas));
          if (progress < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
      },
      { threshold: 0.35, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [end, hasNumber, useCommas]);

  if (!hasNumber) {
    return <span ref={ref}>{title}</span>;
  }

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

export default function AboutUSWhyChoose({ stats = defaultStats }) {
  return (
    <section className="w-full py-6 md:py-10 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 lg:gap-12 items-center justify-items-center">
          {stats.map((item, index) => (
            <div
              key={item.id || index}
              className="flex items-center gap-3 sm:gap-4 lg:gap-5 max-w-xs w-full [&:nth-child(1)]:justify-start [&:nth-child(2)]:justify-center [&:nth-child(3)]:justify-end"
            >
              <div className="flex-shrink-0">
                <img
                  src={item.image}
                  alt={item.subtitle || item.title}
                  className="h-auto w-[98px] object-contain"
                />
              </div>

              <div className="flex flex-col text-left">
                <span className="text-2xl sm:text-3xl lg:text-[36px] font-bold text-[#2D2D2D] tracking-tight leading-none tabular-nums">
                  <AnimatedStat title={item.title} />
                </span>
                <span className="text-xs sm:text-sm text-[#555555] font-medium leading-tight mt-1">
                  {item.subtitle}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
