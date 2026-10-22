"use client";
import React, { useLayoutEffect, useState, useRef, useEffect, useCallback } from "react";
import "../ExternalCSS/ScrollDetail.css";

function parseScrollDescriptionClient(description) {
  const empty = {
    filteredDescription: "",
    leftPanelImageUrl: "/scroll-left.png",
    leftPanelImageAlt: "Emenac Travel",
    rightPanelImageUrl: "/scroll-right.png",
    rightPanelImageAlt: "Emenac Travel",
    isPngImage: false,
    hasContent: false,
  };

  if (typeof description !== "string" || !description.trim()) {
    return empty;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(description, "text/html");

  doc.querySelectorAll("*").forEach((el) => {
    el.removeAttribute("style");
    el.classList.add("font-quicksand");
  });

  doc.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((heading) => {
    heading.classList.add("!text-[#1F0060]", "font-bold", "text-center");
  });

  doc.querySelectorAll("p").forEach((p) => {
    p.classList.add("text-center", "text-[#4A5568]", "leading-relaxed", "my-3");
  });

  doc.querySelectorAll("ul").forEach((ul) => {
    ul.classList.add("list-disc", "pl-6", "text-left", "inline-block", "[&>li]:marker:text-[#1F0060]");
  });

  doc.querySelectorAll("ol").forEach((ol) => {
    ol.classList.add("list-decimal", "pl-6", "text-left", "inline-block", "[&>li]:marker:text-[#1F0060]");
  });

  doc.querySelectorAll("table").forEach((table) => {
    table.classList.add("w-full", "my-4", "border", "border-gray-300", "rounded-md");
  });

  doc.querySelectorAll("tr").forEach((row) => {
    row.classList.add("border-b", "border-gray-300");
  });

  doc.querySelectorAll("th, td").forEach((cell) => {
    cell.classList.add("px-2", "py-2", "text-left", "align-top", "border-r", "border-gray-300");
  });

  doc.querySelectorAll("th").forEach((th) => {
    th.classList.add("font-semibold", "text-[#1F0060]", "bg-gray-50");
  });

  doc.querySelectorAll("td").forEach((td) => {
    td.classList.add("text-gray-700");
  });

  // Remove any legacy inline CMS figures/images so they don't break the layout
  doc.querySelectorAll("figure, img").forEach((el) => {
    el.remove();
  });

  const filteredDescription = doc.body.innerHTML;
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = filteredDescription;
  const hasContent = tempDiv.textContent.trim().length > 0;

  return {
    filteredDescription,
    leftPanelImageUrl: "/scroll-left.png",
    leftPanelImageAlt: "Emenac Travel",
    rightPanelImageUrl: "/scroll-right.png",
    rightPanelImageAlt: "Emenac Travel",
    isPngImage: false,
    hasContent,
  };
}

function useScrollIndicator(scrollRef, trackRef, thumbHeight = 28) {
  const [thumbTop, setThumbTop] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartYRef = useRef(0);
  const dragStartScrollTopRef = useRef(0);

  const updateThumbPosition = useCallback(() => {
    const el = scrollRef.current;
    const track = trackRef.current;
    if (!el) return;
    const maxScroll = el.scrollHeight - el.clientHeight;
    if (maxScroll <= 0) {
      setThumbTop(0);
      return;
    }
    const trackHeight = track ? track.clientHeight : 620;
    const maxTravel = Math.max(10, trackHeight - thumbHeight);
    const ratio = el.scrollTop / maxScroll;
    const clampedRatio = Math.max(0, Math.min(1, ratio));
    setThumbTop(clampedRatio * maxTravel);
  }, [scrollRef, trackRef, thumbHeight]);

  const handleScroll = () => {
    if (!isDragging) {
      updateThumbPosition();
    }
  };

  const handleTrackClick = (e) => {
    if (e.target.closest('[data-thumb="true"]')) return;
    const track = trackRef.current;
    const scrollEl = scrollRef.current;
    if (!track || !scrollEl) return;

    const rect = track.getBoundingClientRect();
    const trackHeight = rect.height;
    const maxTravel = Math.max(10, trackHeight - thumbHeight);
    const clickY = e.clientY - rect.top;
    const targetThumb = Math.max(0, Math.min(maxTravel, clickY - thumbHeight / 2));
    const ratio = targetThumb / maxTravel;
    const maxScroll = scrollEl.scrollHeight - scrollEl.clientHeight;

    scrollEl.scrollTo({
      top: ratio * maxScroll,
      behavior: "smooth",
    });
  };

  const startDrag = (clientY) => {
    setIsDragging(true);
    dragStartYRef.current = clientY;
    dragStartScrollTopRef.current = scrollRef.current ? scrollRef.current.scrollTop : 0;
  };

  const handleThumbMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    startDrag(e.clientY);
  };

  const handleThumbTouchStart = (e) => {
    e.stopPropagation();
    if (e.touches && e.touches.length > 0) {
      startDrag(e.touches[0].clientY);
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e) => {
      const scrollEl = scrollRef.current;
      const track = trackRef.current;
      if (!scrollEl) return;
      const trackHeight = track ? track.clientHeight : 620;
      const maxTravel = Math.max(10, trackHeight - thumbHeight);
      const deltaY = e.clientY - dragStartYRef.current;
      const maxScroll = scrollEl.scrollHeight - scrollEl.clientHeight;
      if (maxScroll <= 0) return;

      const deltaScroll = (deltaY / maxTravel) * maxScroll;
      const newScrollTop = Math.max(0, Math.min(maxScroll, dragStartScrollTopRef.current + deltaScroll));
      scrollEl.scrollTop = newScrollTop;
      updateThumbPosition();
    };

    const onMouseUp = () => setIsDragging(false);

    const onTouchMove = (e) => {
      if (!e.touches || e.touches.length === 0) return;
      const scrollEl = scrollRef.current;
      const track = trackRef.current;
      if (!scrollEl) return;
      const trackHeight = track ? track.clientHeight : 620;
      const maxTravel = Math.max(10, trackHeight - thumbHeight);
      const deltaY = e.touches[0].clientY - dragStartYRef.current;
      const maxScroll = scrollEl.scrollHeight - scrollEl.clientHeight;
      if (maxScroll <= 0) return;

      const deltaScroll = (deltaY / maxTravel) * maxScroll;
      const newScrollTop = Math.max(0, Math.min(maxScroll, dragStartScrollTopRef.current + deltaScroll));
      scrollEl.scrollTop = newScrollTop;
      updateThumbPosition();
    };

    const onTouchEnd = () => setIsDragging(false);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [isDragging, scrollRef, trackRef, thumbHeight, updateThumbPosition]);

  return {
    thumbTop,
    isDragging,
    updateThumbPosition,
    handleScroll,
    handleTrackClick,
    handleThumbMouseDown,
    handleThumbTouchStart,
  };
}

function ScrollDetailView({
  filteredDescription,
  leftPanelImageUrl = "/scroll-left.png",
  leftPanelImageAlt = "Emenac Travel",
  rightPanelImageUrl = "/scroll-right.png",
  rightPanelImageAlt = "Emenac Travel",
}) {
  const desktopScrollRef = useRef(null);
  const desktopTrackRef = useRef(null);
  const mobileScrollRef = useRef(null);
  const mobileTrackRef = useRef(null);

  const desktopScroll = useScrollIndicator(desktopScrollRef, desktopTrackRef, 28);
  const mobileScroll = useScrollIndicator(mobileScrollRef, mobileTrackRef, 28);

  useEffect(() => {
    desktopScroll.updateThumbPosition();
    mobileScroll.updateThumbPosition();
    const handleResize = () => {
      desktopScroll.updateThumbPosition();
      mobileScroll.updateThumbPosition();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [filteredDescription, desktopScroll.updateThumbPosition, mobileScroll.updateThumbPosition]);

  return (
    <section className="w-full my-6 lg:my-10 py-2 px-3 sm:px-5 lg:px-6 xl:px-8">
      {/* ========================================================
          Desktop Layout (1024px+, 1360px & Full Screen 1440px-1920px+)
          - At 1360px: Exact 263x656px left, 361x656px right, 620px line
          - On Full Screen: Full width flex layout with reduced, tight gaps
          - On Laptops (1024px-1359px): Proportional fluid 3-column fit
         ======================================================== */}
      <div className="hidden lg:flex items-center justify-between gap-4 xl:gap-5 2xl:gap-6 w-full min-h-[600px] xl:min-h-[656px]">
        {/* Left Image: 263px width on 1360px+ / 656px height */}
        <div className="w-[220px] xl:w-[263px] h-[600px] xl:h-[656px] flex-shrink-0 rounded-[28px] overflow-hidden shadow-sm">
          <img
            src={leftPanelImageUrl || "/scroll-left.png"}
            alt={leftPanelImageAlt || "Emenac Travel"}
            width={263}
            height={656}
            className="w-full h-full object-cover rounded-[28px]"
            loading="lazy"
          />
        </div>

        {/* Center Content: fills remaining width with tight, comfortable spacing */}
        <div className="flex-1 min-w-0 w-full h-[600px] xl:h-[656px] flex flex-col justify-center relative">
          <div
            ref={desktopScrollRef}
            onScroll={desktopScroll.handleScroll}
            className="h-full overflow-y-auto scroll-detail-content px-2 sm:px-4 xl:px-5 py-4 select-text [&::-webkit-scrollbar]:!hidden [&::-webkit-scrollbar]:!w-0 [&::-webkit-scrollbar]:!h-0 [-ms-overflow-style:none] [scrollbar-width:none]"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <div
              className="prose max-w-none w-full font-quicksand text-center select-text"
              dangerouslySetInnerHTML={{ __html: filteredDescription }}
            />
          </div>
        </div>

        {/* Right Image Container with Left-edge Scroll Line: 361px width on 1360px+ / 656px height */}
        <div className="relative w-[300px] xl:w-[361px] h-[600px] xl:h-[656px] flex-shrink-0">
          {/* Vertical scroll track line on left edge: Height 620px at 1360px, Width 0px, Color #5CACC4 */}
          <div
            ref={desktopTrackRef}
            onClick={desktopScroll.handleTrackClick}
            className="absolute left-0 top-[18px] bottom-[18px] xl:h-[620px] w-0 border-l-2 border-[#5CACC4] cursor-pointer z-20"
          >
            {/* Click/touch hit target */}
            <div className="absolute -left-[8px] top-0 w-[16px] h-full" />

            {/* Scroll Thumb: Width 7px, Height 28px, Border #1F0060, White Inside */}
            <div
              data-thumb="true"
              onMouseDown={desktopScroll.handleThumbMouseDown}
              onTouchStart={desktopScroll.handleThumbTouchStart}
              style={{
                transform: `translate3d(-4.5px, ${desktopScroll.thumbTop}px, 0)`,
              }}
              className={`absolute top-0 w-[7px] h-[28px] bg-white border border-[#1F0060] rounded-full cursor-grab active:cursor-grabbing shadow-sm z-30 transition-transform duration-75 ${
                desktopScroll.isDragging ? "!cursor-grabbing" : ""
              }`}
            />
          </div>

          {/* Right Image */}
          <img
            src={rightPanelImageUrl || "/scroll-right.png"}
            alt={rightPanelImageAlt || "Emenac Travel"}
            width={361}
            height={656}
            className="w-full h-full object-cover rounded-[28px] shadow-sm"
            loading="lazy"
          />
        </div>
      </div>

      {/* ========================================================
          Tablet & Mobile Responsive Layout (<1024px)
          - Top: Two Images showcased side-by-side with rounded corners
          - Bottom: Scrollable text card with functional custom cyan line & handle
         ======================================================== */}
      <div className="flex flex-col lg:hidden gap-6 w-full max-w-[720px] mx-auto">
        {/* Top Imagery Row: Both images side by side */}
        <div className="flex items-center justify-center gap-3 sm:gap-5 w-full">
          <div className="w-[42%] max-w-[220px] h-[220px] sm:h-[300px] rounded-[20px] overflow-hidden shadow-sm flex-shrink-0">
            <img
              src={leftPanelImageUrl || "/scroll-left.png"}
              alt={leftPanelImageAlt || "Emenac Travel"}
              width={263}
              height={656}
              className="w-full h-full object-cover rounded-[20px]"
              loading="lazy"
            />
          </div>
          <div className="w-[54%] max-w-[280px] h-[220px] sm:h-[300px] rounded-[20px] overflow-hidden shadow-sm flex-shrink-0">
            <img
              src={rightPanelImageUrl || "/scroll-right.png"}
              alt={rightPanelImageAlt || "Emenac Travel"}
              width={361}
              height={656}
              className="w-full h-full object-cover rounded-[20px]"
              loading="lazy"
            />
          </div>
        </div>

        {/* Bottom Scrollable Text Box with custom scroll line */}
        <div className="relative w-full h-[360px] sm:h-[420px] bg-white rounded-2xl border border-gray-100 p-2 sm:p-4 shadow-sm">
          {/* Custom cyan scroll line on the right side of mobile card */}
          <div
            ref={mobileTrackRef}
            onClick={mobileScroll.handleTrackClick}
            className="absolute right-2 sm:right-3 top-[14px] bottom-[14px] w-0 border-l-2 border-[#5CACC4] cursor-pointer z-20"
          >
            <div className="absolute -left-[8px] top-0 w-[16px] h-full" />
            <div
              data-thumb="true"
              onMouseDown={mobileScroll.handleThumbMouseDown}
              onTouchStart={mobileScroll.handleThumbTouchStart}
              style={{
                transform: `translate3d(-4.5px, ${mobileScroll.thumbTop}px, 0)`,
              }}
              className={`absolute top-0 w-[7px] h-[28px] bg-white border border-[#1F0060] rounded-full cursor-grab active:cursor-grabbing shadow-sm z-30 transition-transform duration-75 ${
                mobileScroll.isDragging ? "!cursor-grabbing" : ""
              }`}
            />
          </div>

          <div
            ref={mobileScrollRef}
            onScroll={mobileScroll.handleScroll}
            className="h-full overflow-y-auto px-4 sm:px-8 py-2 select-text scroll-detail-content [&::-webkit-scrollbar]:!hidden [&::-webkit-scrollbar]:!w-0 [&::-webkit-scrollbar]:!h-0 [-ms-overflow-style:none] [scrollbar-width:none]"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <div
              className="prose max-w-none font-quicksand text-center select-text"
              dangerouslySetInnerHTML={{ __html: filteredDescription }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function ScrollDetailSkeleton() {
  return (
    <div className="w-full my-8 lg:my-12 py-2 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16" aria-hidden="true">
      {/* Desktop Skeleton */}
      <div className="hidden lg:flex items-center justify-between gap-6 xl:gap-8 2xl:gap-12 w-full min-h-[600px] xl:min-h-[656px]">
        <div className="w-[220px] xl:w-[263px] h-[600px] xl:h-[656px] rounded-[28px] bg-gray-100 animate-pulse flex-shrink-0" />
        <div className="flex-1 w-full h-[600px] xl:h-[656px] p-6 bg-white flex flex-col justify-center animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto" />
          <div className="h-4 bg-gray-100 rounded w-full" />
          <div className="h-4 bg-gray-100 rounded w-5/6 mx-auto" />
          <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto mt-6" />
          <div className="h-4 bg-gray-100 rounded w-full" />
          <div className="h-4 bg-gray-100 rounded w-4/5 mx-auto" />
        </div>
        <div className="w-[300px] xl:w-[361px] h-[600px] xl:h-[656px] rounded-[28px] bg-gray-100 animate-pulse flex-shrink-0" />
      </div>

      {/* Mobile Skeleton */}
      <div className="flex flex-col lg:hidden gap-6 w-full max-w-[720px] mx-auto">
        <div className="flex items-center justify-center gap-3 sm:gap-5 w-full">
          <div className="w-[42%] max-w-[220px] h-[220px] sm:h-[300px] rounded-[20px] bg-gray-100 animate-pulse flex-shrink-0" />
          <div className="w-[54%] max-w-[280px] h-[220px] sm:h-[300px] rounded-[20px] bg-gray-100 animate-pulse flex-shrink-0" />
        </div>
        <div className="w-full h-[360px] sm:h-[420px] bg-white rounded-2xl border border-gray-100 p-6 flex flex-col justify-center animate-pulse space-y-3">
          <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto" />
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-5/6 mx-auto" />
        </div>
      </div>
    </div>
  );
}

export default function ScrollDetail({
  description,
  parsedContent = null,
  leftImage = null,
  rightImage = null,
}) {
  const [clientParsed, setClientParsed] = useState(parsedContent);

  useLayoutEffect(() => {
    if (parsedContent) {
      setClientParsed(parsedContent);
      return;
    }
    if (description) {
      setClientParsed(parseScrollDescriptionClient(description));
    }
  }, [description, parsedContent]);

  const parsed = parsedContent ?? clientParsed;
  const hasDescription = typeof description === "string" && description.trim().length > 0;
  const isWaitingForParse = hasDescription && parsed === null;

  if (parsed?.hasContent) {
    return (
      <ScrollDetailView
        filteredDescription={parsed.filteredDescription}
        leftPanelImageUrl={leftImage || parsed.leftPanelImageUrl || "/scroll-left.png"}
        leftPanelImageAlt={parsed.leftPanelImageAlt || "Emenac Travel"}
        rightPanelImageUrl={rightImage || parsed.rightPanelImageUrl || "/scroll-right.png"}
        rightPanelImageAlt={parsed.rightPanelImageAlt || "Emenac Travel"}
      />
    );
  }

  if (isWaitingForParse) {
    return <ScrollDetailSkeleton />;
  }

  return null;
}
