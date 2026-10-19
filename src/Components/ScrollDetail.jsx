"use client";
import React, { useLayoutEffect, useState } from 'react';
import '../ExternalCSS/ScrollDetail.css';
import { normalizeFrontendImageSrc } from "../Helpers/imageurl";

function parseScrollDescriptionClient(description) {
  const empty = {
    filteredDescription: '',
    rightPanelImageUrl: null,
    rightPanelImageAlt: 'Emenac Travel',
    isPngImage: false,
    hasContent: false,
  };

  if (typeof description !== 'string' || !description.trim()) {
    return empty;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(description, 'text/html');

  doc.querySelectorAll('*').forEach((el) => {
    el.removeAttribute('style');
    el.classList.add('font-quicksand');
  });

  doc.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading) => {
    heading.classList.add('!text-[#A57233]');
  });

  doc.querySelectorAll('ul').forEach((ul) => {
    ul.classList.add('list-disc', 'pl-6', '[&>li]:marker:text-[#A57233]');
  });

  doc.querySelectorAll('ol').forEach((ol) => {
    ol.classList.add('list-decimal', 'pl-6', '[&>li]:marker:text-[#A57233]');
  });

  doc.querySelectorAll('table').forEach((table) => {
    table.classList.add('w-full', 'my-4', 'border', 'border-gray-400', 'rounded-md');
  });

  doc.querySelectorAll('tr').forEach((row) => {
    row.classList.add('border-b', 'border-gray-400');
  });

  doc.querySelectorAll('th, td').forEach((cell) => {
    cell.classList.add('px-2', 'py-2', 'text-left', 'align-top', 'border-r', 'border-gray-400');
  });

  doc.querySelectorAll('th').forEach((th) => {
    th.classList.add('font-semibold', 'text-green-700', 'bg-gray-50');
  });

  doc.querySelectorAll('td').forEach((td) => {
    td.classList.add('text-gray-700');
  });

  const figureImg = doc.querySelector('figure img') || doc.querySelector('img');
  let rightPanelImageUrl = null;
  let rightPanelImageAlt = 'Premier Flights';
  let isPngImage = false;

  if (figureImg?.getAttribute('src')) {
    const src = figureImg.getAttribute('src');
    isPngImage = src.toLowerCase().endsWith('.png');
    rightPanelImageAlt = figureImg.getAttribute('alt')?.trim() || 'Premier Flights';
    rightPanelImageUrl = normalizeFrontendImageSrc(src);
    figureImg.closest('figure')?.remove();
  }

  doc.querySelectorAll("img").forEach((img) => {
    const src = img.getAttribute("src");
    if (src) img.setAttribute("src", normalizeFrontendImageSrc(src));
  });

  const filteredDescription = doc.body.innerHTML;
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = filteredDescription;
  const hasContent = tempDiv.textContent.trim().length > 0;

  return {
    filteredDescription,
    rightPanelImageUrl,
    rightPanelImageAlt,
    isPngImage,
    hasContent,
  };
}

function ScrollDetailView({
  filteredDescription,
  rightPanelImageUrl,
  rightPanelImageAlt,
  isPngImage,
}) {
  return (
    <div className="flex flex-col lg:flex-row gap-[36px] h-[634px] container sd-con mt-[53px]">
      {/* Left: scrollable text panel */}
      <div className="flex-1 min-w-0">
        <div className="h-[630px] flex flex-col">
          <div className="flex-1 overflow-y-auto scrollbar-thin py-[35px]" style={{ direction: 'rtl' }}>
            <div
              style={{ direction: 'ltr' }}
              className="px-4 prose max-w-none font-quicksand"
              dangerouslySetInnerHTML={{ __html: filteredDescription }}
            />
          </div>
        </div>
      </div>

      {/* Right: bordered image panel */}
      <div
        className={`
          w-[476px] flex-shrink-0
          relative
          overflow-visible
          border-2 border-[#A57233] rounded-[25px]
          h-[634px]
          ${isPngImage ? 'hidden lg:block' : 'hidden lg:block'}
        `}
      >
        <img
          src={rightPanelImageUrl}
          alt={rightPanelImageAlt}
          width={424}
          height={610}
          className={`absolute object-cover rounded-2xl 
            ${isPngImage
              ? 'top-[50px] left-[-25px]'
              : 'bottom-[-35px] left-[-25px]'
            }`}
        />
      </div>
    </div>
  );
}

function ScrollDetailSkeleton() {
  return (
    <div
      className="flex flex-col lg:flex-row border-2 border-[#A57233] rounded-[25px] h-[560px]"
      aria-hidden="true"
    >
      <div className="w-full lg:w-1/2 p-[15px] sm:p-[30px]">
        <div className="bg-white h-[500px] flex flex-col animate-pulse">
          <div className="flex-1 space-y-3 px-4 py-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
      </div>
      <div className="hidden lg:flex w-full lg:w-1/2 items-center justify-center mt-10 lg:mt-0">
        <div className="relative w-full flex justify-end" style={{ height: '500px' }}>
          <div className="bg-gray-100 animate-pulse rounded-2xl w-[90%] h-full" />
        </div>
      </div>
    </div>
  );
}

export default function ScrollDetail({ description, parsedContent = null }) {
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
  const hasDescription = typeof description === 'string' && description.trim().length > 0;
  const isWaitingForParse = hasDescription && parsed === null;

  if (parsed?.hasContent) {
    return (
      <ScrollDetailView
        filteredDescription={parsed.filteredDescription}
        rightPanelImageUrl={parsed.rightPanelImageUrl}
        rightPanelImageAlt={parsed.rightPanelImageAlt}
        isPngImage={parsed.isPngImage}
      />
    );
  }

  if (isWaitingForParse) {
    return <ScrollDetailSkeleton />;
  }

  return null;
}
