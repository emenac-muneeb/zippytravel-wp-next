import React from 'react';

export default function CityPackagesLoading() {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-[80%] mx-auto py-8 animate-pulse">
      {/* Breadcrumbs */}
      <div className="w-full text-left mb-6">
        <div className="h-4 w-48 bg-gray-200 rounded"></div>
      </div>

      {/* Hero — match CommonHeroSection */}
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
      <div className="w-full flex flex-wrap gap-6 items-center justify-between mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 w-28 bg-gray-200 rounded"></div>
        ))}
      </div>

      {/* Heading */}
      <div className="w-full text-left my-6 space-y-2">
        <div className="h-8 w-64 bg-gray-200 rounded"></div>
        <div className="h-4 w-full bg-gray-200 rounded max-w-2xl"></div>
      </div>

      {/* Grid of package cards — match PackageCard (no outer padding) */}
      <div className="flex flex-wrap gap-6 justify-center mt-6 w-full">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm w-full max-w-[270px]">
            <div className="w-full h-[160px] bg-gray-200 rounded-t-lg"></div>
            <div className="px-2 py-3 space-y-3">
              <div className="flex flex-row justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="flex justify-between items-center mt-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-5 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
