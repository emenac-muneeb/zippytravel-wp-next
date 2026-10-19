import React from 'react';

export default function HolidaysLoading() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 max-w-[85%] mx-auto py-8 animate-pulse">
      {/* Breadcrumb */}
      <div className="h-4 w-40 bg-gray-200 rounded mb-6" />

      {/* Hero — match CommonHeroSection (text + image 50/50) */}
      <div className="flex flex-col-reverse lg:flex-row w-full justify-center items-center gap-6 py-4 mb-8">
        <div className="w-full lg:w-[50%] flex flex-col space-y-4">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-4/5" />
          <div className="h-[180px] sm:h-[220px] bg-gray-200 rounded-[20px] mt-4" />
        </div>
        <div className="w-full lg:w-[50%]">
          <div className="w-full h-[338px] sm:h-[400px] md:h-[600px] lg:h-[490px] bg-gray-200 rounded-none md:rounded-3xl" />
        </div>
      </div>

      {/* Branding Section */}
      <div className="flex flex-wrap gap-6 items-center justify-between mb-12">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 w-32 bg-gray-200 rounded" />
        ))}
      </div>

      {/* Heading */}
      <div className="mb-6 space-y-2">
        <div className="h-8 w-64 bg-gray-200 rounded" />
        <div className="h-4 w-full max-w-2xl bg-gray-200 rounded" />
      </div>

      {/* HolidayCustom-style cards: portrait on mobile, horizontal on sm+ */}
      <div className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-12">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i}>
            {/* Mobile card */}
            <div className="block sm:hidden w-[90%] mx-auto bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
              <div className="w-full aspect-[4/3] bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-5 w-3/4 bg-gray-200 rounded" />
                <div className="h-4 w-1/2 bg-gray-200 rounded" />
                <div className="flex justify-between mt-2">
                  <div className="h-5 w-20 bg-gray-200 rounded" />
                  <div className="h-4 w-16 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
            {/* Desktop horizontal card */}
            <div className="hidden sm:flex items-center bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
              <div className="w-[130px] h-[122px] bg-gray-200 flex-shrink-0 rounded-l-xl" />
              <div className="flex-1 p-3 space-y-2">
                <div className="h-5 w-3/4 bg-gray-200 rounded" />
                <div className="h-4 w-1/2 bg-gray-200 rounded" />
                <div className="flex justify-between mt-1">
                  <div className="h-5 w-20 bg-gray-200 rounded" />
                  <div className="h-4 w-16 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ area */}
      <div className="max-w-[90%] sm:max-w-[80%] mx-auto pt-8 space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 bg-gray-200 rounded-3xl border border-gray-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
