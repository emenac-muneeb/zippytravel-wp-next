import React from 'react';

export default function HolidayPackageDetailsLoading() {
  return (
    <div className="container max-w-[80%] mx-auto px-2 py-8 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="h-4 w-48 bg-gray-200 rounded mb-6"></div>

      <div className="flex flex-col lg:flex-row justify-between gap-6">
        {/* LEFT SIDE */}
        <div className="left w-full lg:w-[45%] space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2 w-1/2">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="space-y-2 w-1/3 flex flex-col items-end">
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>

          <hr className="border-gray-200" />
          <div className="h-6 bg-gray-200 rounded w-5/6"></div>

          {/* Services row */}
          <div className="flex gap-4 my-6 justify-between">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col items-center space-y-2">
                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                <div className="h-3 bg-gray-200 rounded w-10"></div>
              </div>
            ))}
          </div>

          {/* Short description */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>

          {/* Price & call buttons */}
          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded w-24"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE (Carousel) — reserve ImageCarousel min height */}
        <div className="right w-full lg:w-[45%]">
          <div className="min-h-[300px] md:min-h-[500px] h-[300px] md:h-[500px] bg-gray-200 rounded-[25px]"></div>
        </div>
      </div>

      {/* Trust/Branding Section */}
      <div className="my-10 h-24 bg-gray-100 rounded-[15px]"></div>

      {/* Detailed Description */}
      <div className="space-y-4 my-8">
        <div className="h-6 bg-gray-200 rounded w-32"></div>
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
      </div>

      {/* Includes + enquiry row */}
      <div className="flex flex-col lg:flex-row gap-6 my-8">
        <div className="w-full lg:w-[45%] space-y-3">
          <div className="h-6 bg-gray-200 rounded w-40"></div>
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          <div className="h-3 bg-gray-200 rounded w-4/5"></div>
        </div>
        <div className="w-full lg:w-[45%] h-[280px] bg-gray-200 rounded-[20px]"></div>
      </div>
    </div>
  );
}
