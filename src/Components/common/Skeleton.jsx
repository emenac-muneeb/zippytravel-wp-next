import React from 'react';

export const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} aria-hidden />
);

export const BannerSkeleton = () => (
  <div className="w-full h-[300px] mb-8">
    <Skeleton className="w-full h-full" />
  </div>
);

export const SliderSkeleton = () => (
  <div className="flex gap-4 overflow-hidden mb-8">
    {[1, 2, 3, 4].map((i) => (
      <Skeleton key={i} className="min-w-[250px] h-[200px]" />
    ))}
  </div>
);

export const ContentSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="w-3/4 h-8" />
    <Skeleton className="w-full h-4" />
    <Skeleton className="w-full h-4" />
    <Skeleton className="w-5/6 h-4" />
  </div>
);

/**
 * Matches DestinationSlider heights on mobile/desktop to prevent CLS:
 * heading (wraps 2–3 lines on mobile) + card strip (295px image + content + pagination).
 */
export const DEST_SLIDER_STRIP_MIN_H =
  "min-h-[488px] sm:min-h-[500px]";

export const DestinationSliderSkeleton = () => (
  <div
    id="recommended-destinations"
    className="pt-[30px] sm:pt-[50px] pb-[15px] sm:pb-[25px] bg-white"
    aria-hidden
  >
    <div className="container">
      <div className="heading_section min-h-[170px] sm:min-h-[120px] md:min-h-[130px]">
        <Skeleton className="h-[26px] sm:h-8 md:h-9 w-[90%] max-w-[420px] mb-2" />
        <Skeleton className="h-4 w-full max-w-[640px]" />
        <Skeleton className="h-4 w-full max-w-[560px] mt-1.5" />
        <Skeleton className="h-4 w-[70%] max-w-[400px] mt-1.5 sm:hidden" />
      </div>
    </div>
    <div
      className={`${DEST_SLIDER_STRIP_MIN_H} relative overflow-hidden pl-[20px] sm:pl-[27px]`}
    >
      <div className="flex gap-[10px] min-[576px]:gap-5 overflow-hidden pt-4 pb-[78px]">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="shrink-0 w-[calc((100%-1px)/1.1)] min-[576px]:w-[calc((100%-20px)/1.5)] min-[768px]:w-[calc((100%-20px)/2.2)] min-[1024px]:w-[calc((100%-20px)/2.6)] min-[1199px]:w-[calc((100%-40px)/3.3)] rounded-[30px] overflow-hidden shadow-[0_3px_14px_0_#A5723326] bg-white"
          >
            <Skeleton className="w-full h-[295px] rounded-[30px] rounded-b-none" />
            <div className="pt-[13px] pb-[16px] px-[22px] flex justify-between min-h-[100px]">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
              <div className="space-y-2 flex flex-col items-end">
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/** Single review-card placeholder matching ReviewCard size */
export const TestimonialCardSkeleton = () => (
  <div className="w-full max-w-[350px] sm:max-w-none pt-[58px] mx-auto">
    <div className="relative bg-white rounded-[24px] px-6 pb-8 min-h-[300px] border border-[#f0f0f0] shadow-[0_3px_14px_0_#A5723326] flex flex-col items-center">
      <div className="absolute left-1/2 top-[-58px] -translate-x-1/2 w-[116px] h-[116px] rounded-full bg-gray-200 animate-pulse border-[2px] border-gray-100" />
      <div className="absolute right-6 top-[30px] flex gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="w-4 h-4 rounded bg-gray-200 animate-pulse" />
        ))}
      </div>
      <div className="pt-[80px] w-full space-y-3 flex flex-col items-center">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-20" />
        <div className="w-[70%] h-px bg-gray-200 my-4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  </div>
);

/** Carousel strip only — used inside Testimonials while waiting for mount/API */
export const TestimonialsCarouselSkeleton = () => (
  <div className="min-h-[430px] pt-[70px] pb-[60px]" aria-hidden>
    <div className="flex gap-5 sm:gap-5 lg:gap-6 overflow-hidden">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="min-w-full sm:min-w-[calc(50%-10px)] lg:min-w-[calc(33.333%-16px)] xl:min-w-[calc(25%-18px)] flex-shrink-0"
        >
          <TestimonialCardSkeleton />
        </div>
      ))}
    </div>
  </div>
);

/** Matches Testimonials: .container heading + cream band + swiper strip */
export const TestimonialsSkeleton = () => (
  <div className="py-[15px] sm:py-[25px]" aria-hidden>
    <div
      className="pt-[50px] relative before:content-[''] before:absolute before:top-0 before:left-0
      before:w-full min-[1400px]:before:w-[1060px] before:h-[442px] before:bg-[#FFF6EC] before:rounded-[40px]"
    >
      <div className="container">
        <div className="heading_section max-w-[800px] space-y-2">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
      </div>
      <div className="relative w-full testimonials-swiper-container">
        <TestimonialsCarouselSkeleton />
      </div>
    </div>
  </div>
);

/** FAQ skeleton matching FaqSection 2-column accordion layout */
export const FaqSectionSkeleton = () => (
  <section className="" aria-hidden>
    <div className="container">
      <div className="heading_section space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
        <div className="space-y-[24px]">
          {[1, 2, 3].map((i) => (
            <div
              key={`faq-l-${i}`}
              className="border border-[#A57233] rounded-3xl shadow-md animate-pulse"
            >
              <div className="px-6 py-4 flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-4/5" />
                <div className="w-6 h-6 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-[24px]">
          {[1, 2, 3].map((i) => (
            <div
              key={`faq-r-${i}`}
              className="border border-[#A57233] rounded-3xl shadow-md animate-pulse"
            >
              <div className="px-6 py-4 flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-4/5" />
                <div className="w-6 h-6 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

/** Full homepage skeleton — sized like real sections to prevent CLS */
export function HomePageSkeleton() {
  return (
    <div className="w-full bg-white" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading page content</span>

      {/* Hero — match HeroSectionNew min-heights + rounded bottom */}
      <section className="relative w-full">
        <div className="relative w-full overflow-hidden rounded-b-[40px] sm:rounded-b-[56px] lg:rounded-b-[72px] min-h-[640px] sm:min-h-[720px] lg:min-h-[820px] bg-[#2a211c]">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(25,18,14,0.55) 0%, rgba(25,18,14,0.45) 40%, rgba(25,18,14,0.72) 100%)",
            }}
          />
          <div className="relative z-10 flex flex-col items-center w-[94%] max-w-[1320px] mx-auto pt-[100px] sm:pt-[120px] lg:pt-[250px] pb-10 sm:pb-12 lg:pb-14">
            <div className="text-center max-w-[900px] mx-auto mb-6 sm:mb-8 px-2 min-h-[120px] w-full space-y-4">
              <div className="mx-auto h-7 w-48 sm:w-64 rounded bg-white/20 animate-pulse" />
              <div className="mx-auto h-12 sm:h-14 w-[80%] max-w-[640px] rounded bg-white/25 animate-pulse" />
              <div className="mx-auto h-4 w-[60%] max-w-[420px] rounded bg-white/15 animate-pulse" />
            </div>
            <div className="w-full max-w-[1100px] mt-4 sm:mt-6">
              <div className="w-full min-h-[300px] md:min-h-[140px] rounded-[15px] bg-white/15 animate-pulse border border-white/10" />
            </div>
            <div className="w-full mt-8 sm:mt-10 min-h-[88px] flex flex-wrap justify-center gap-6 sm:gap-10">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-10 sm:h-12 w-20 sm:w-28 rounded bg-white/15 animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <DestinationSliderSkeleton />

      {/* Affordable tour — matches AffordableTourSection .container */}
      <div className="py-[15px] sm:py-[25px]" aria-hidden>
        <div className="pb-[50px] relative">
          <div className="container">
            <div className="heading_section space-y-2">
              <Skeleton className="h-8 w-72" />
              <Skeleton className="h-4 w-96 max-w-full" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[24px] justify-center">
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

      {/* Exclusive airline fares — match ExclusiveAirlineFaresSkeleton */}
      <section className="py-[25px] bg-white" aria-hidden>
        <div className="container mx-auto px-4 max-w-[960px]">
          <div className="mb-9 space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </div>
          <div className="flex flex-col lg:flex-row items-center w-full">
            <Skeleton className="w-full lg:w-[58%] min-h-[460px] rounded-[40px]" />
            <Skeleton className="w-full lg:w-[50%] lg:-ml-[8%] h-[280px] lg:h-[380px] rounded-[20px] lg:rounded-[44px] mt-4 lg:mt-0" />
          </div>
        </div>
      </section>

      <TestimonialsSkeleton />

      {/* Airline partners strip — match AirlineSlider sizes */}
      <div className="relative w-full py-14 overflow-hidden bg-[#2a211c]" aria-hidden>
        <div className="container">
          <div className="heading_section space-y-2 mb-6">
            <div className="h-8 w-56 rounded bg-white/20 animate-pulse" />
            <div className="h-4 w-64 rounded bg-white/15 animate-pulse" />
          </div>
          <div className="flex gap-4 overflow-hidden pb-16">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[200px] h-[104px] rounded-xl bg-white/20 animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Scroll detail — match ScrollDetail .container + h-[634px] */}
      <div className="container mt-[53px] pb-[55px]" aria-hidden>
        <div className="flex flex-col lg:flex-row gap-[36px] h-auto lg:h-[634px]">
          <Skeleton className="flex-1 min-h-[320px] lg:h-[630px] rounded-[25px]" />
          <Skeleton className="w-full lg:w-[476px] h-[320px] lg:h-[630px] rounded-[25px]" />
        </div>
      </div>

      {/* Latest news — match LatestNews .container */}
      <div className="py-[15px] sm:py-[25px]" aria-hidden>
        <div className="pt-[50px] pb-[40px]">
          <div className="container">
            <div className="mb-8 space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-72 max-w-full" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="w-[160px] h-[100px] rounded-[16px] flex-shrink-0" />
                    <div className="flex-1 space-y-3 py-2">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                ))}
              </div>
              <Skeleton className="h-[320px] rounded-[16px]" />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-16 pb-20" aria-hidden>
        <FaqSectionSkeleton />
      </div>
    </div>
  );
}

/**
 * Airlines listing page — matches BannerInner (no class selector bar) + AirlineGrid.
 */
export function AirlinesPageSkeleton() {
  return (
    <div className="w-full bg-white" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading airlines</span>

      {/* BannerInner mirror — flights search hero without overhanging class selector */}
      <section className="relative w-full mb-0">
        <div className="relative w-full overflow-hidden rounded-b-[40px] sm:rounded-b-[56px] lg:rounded-b-[72px] min-h-[640px] sm:min-h-[620px] lg:min-h-[620px] bg-[#2a211c]">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(25,18,14,0.55) 0%, rgba(25,18,14,0.45) 40%, rgba(25,18,14,0.72) 100%)",
            }}
          />
          <div className="relative z-1 flex flex-col items-center w-[94%] max-w-[1320px] mx-auto pt-[100px] sm:pt-[120px] lg:pt-[250px] pb-20 min-[576px]:pb-12 lg:pb-20">
            <div className="w-full space-y-4">
              {/* Trip type / class row */}
              <div className="flex flex-wrap items-center justify-center gap-3 min-h-[44px]">
                <div className="h-10 w-[180px] sm:w-[220px] rounded-full bg-white/15 animate-pulse" />
                <div className="flex gap-4 sm:gap-6">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-5 w-16 sm:w-20 rounded bg-white/15 animate-pulse"
                    />
                  ))}
                </div>
              </div>
              {/* Flight search form — mobile stacked height matches FlightTabNew */}
              <div className="w-full min-h-[300px] md:min-h-[140px] rounded-[15px] bg-white/15 animate-pulse border border-white/10" />
            </div>
            {/* Brand logos row */}
            <div className="w-full mt-3 mb-2 min-[576px]:mb-0 sm:mt-10 min-h-[88px] flex flex-wrap justify-center gap-6 sm:gap-10">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-10 sm:h-12 w-20 sm:w-28 rounded bg-white/15 animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="w-full mx-auto py-2 pt-[40px] sm:pt-[55px]">
        <div className="container">
          <div className="mx-auto pb-6">
            <section className="mb-14 sm:mb-16">
              <div className="heading_section min-h-[100px] sm:min-h-[110px]">
                <Skeleton className="h-[26px] sm:h-9 w-64 sm:w-80 mb-2" />
                <Skeleton className="h-4 w-full max-w-xl" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="w-full h-[90px] sm:h-[105px] rounded-[16px] sm:rounded-[20px] bg-slate-100 animate-pulse" />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Matches DestinationPageClient /continents — HeroSectionNew + country cards */
export function ContinentsPageSkeleton() {
  return (
    <div className="w-full bg-white font-poppins" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading destinations</span>

      {/* Hero — match HeroSectionNew min-heights + rounded bottom */}
      <section className="w-full relative mt-[28px] mb-[30px] sm:mb-[40px] lg:mb-[50px]">
        <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 relative">
          <div className="w-full relative overflow-hidden rounded-[28px] sm:rounded-[36px] lg:rounded-[40px] min-h-[580px] sm:min-h-[625px] xl:min-h-[640px] bg-[#1a102f] flex flex-col items-center">
            <div className="w-full max-w-[1360px] mx-auto text-center pt-[70px] sm:pt-[90px] lg:pt-[107px] px-4 space-y-4">
              <Skeleton className="h-6 w-36 mx-auto bg-white/20" />
              <Skeleton className="h-14 sm:h-20 w-96 max-w-full mx-auto bg-white/20" />
              <Skeleton className="h-6 w-80 max-w-full mx-auto bg-white/20" />
            </div>
            <div className="w-full h-[180px] sm:h-[220px]" />
          </div>
          {/* Form card skeleton */}
          <div className="w-full max-w-[1236px] mx-auto -mt-[130px] relative z-20 px-3 sm:px-4 xl:px-0">
            <div className="w-full h-[260px] bg-white rounded-[25px] shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-gray-100/50 p-6 flex flex-col justify-center">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-[88px] w-full rounded-[10px]" />
                <Skeleton className="h-[88px] w-full rounded-[10px]" />
                <Skeleton className="h-[88px] w-full rounded-[10px]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="w-full pb-16">
        <div className="text-center mt-12 sm:mt-16 mb-8 sm:mb-10 max-w-3xl mx-auto px-4 space-y-3">
          <Skeleton className="h-10 w-64 sm:w-80 mx-auto" />
          <Skeleton className="h-4 w-full max-w-2xl mx-auto" />
        </div>

        {/* Continent tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-[1236px] mx-auto mb-8 sm:mb-12 px-4 sm:px-6 xl:px-0">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-[10px]" />
          ))}
        </div>

        {/* Country cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 max-w-[1236px] mx-auto px-4 sm:px-6 xl:px-0 mt-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="w-full aspect-[1/1.05] sm:aspect-square min-h-[270px] max-w-[340px] bg-gray-200 rounded-[24px] sm:rounded-[28px] shadow-sm animate-pulse relative overflow-hidden p-4 sm:p-5 flex flex-col justify-end mx-auto"
            >
              <div className="flex justify-between items-end w-full gap-2">
                <div className="flex flex-col gap-2 w-1/2">
                  <div className="h-3.5 bg-gray-300 rounded w-2/3" />
                  <div className="h-6 bg-gray-300 rounded w-4/5" />
                </div>
                <div className="flex flex-col items-end gap-2 w-1/3">
                  <div className="h-6 bg-gray-300 rounded w-3/4" />
                  <div className="h-6 bg-gray-300 rounded-[6px] w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Privacy / Cookies / Terms — white content pages with breadcrumbs + text only (no hero banner).
 */
export function LegalStaticPageSkeleton() {
  return (
    <div className="w-full bg-white" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading page content</span>
      <div className="container">
        <div className="pt-[87px] sm:pt-[100px] pb-[24px] sm:pb-[32px]">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-4 w-28" />
          </div>

          <div className="w-full mx-auto lg:mt-[50px] mt-[30px] space-y-4">
            <Skeleton className="h-9 sm:h-10 w-56 sm:w-72 max-w-full" />
            <div className="space-y-3 pt-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[92%]" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[88%]" />
              <Skeleton className="h-4 w-full mt-4" />
              <Skeleton className="h-4 w-[95%]" />
              <Skeleton className="h-4 w-[80%]" />
              <Skeleton className="h-4 w-full mt-4" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[70%]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Generic inner-page skeleton for other [...slug] CMS pages */
export function GenericInnerPageSkeleton() {
  return (
    <div className="w-full bg-white" aria-busy="true" aria-live="polite">
      <section className="relative w-full mb-0">
        <div className="relative w-full overflow-hidden rounded-b-[40px] sm:rounded-b-[56px] lg:rounded-b-[72px] min-h-[640px] sm:min-h-[620px] lg:min-h-[620px] bg-[#2a211c]">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(25,18,14,0.55) 0%, rgba(25,18,14,0.45) 40%, rgba(25,18,14,0.72) 100%)",
            }}
          />
          <div className="relative z-1 flex flex-col items-center w-[94%] max-w-[1320px] mx-auto pt-[100px] sm:pt-[120px] lg:pt-[250px] pb-20 min-[576px]:pb-12 lg:pb-20">
            <div className="w-full space-y-4">
              <div className="flex justify-center gap-4 min-h-[44px]">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-5 w-16 sm:w-20 rounded bg-white/15 animate-pulse"
                  />
                ))}
              </div>
              <div className="w-full min-h-[300px] md:min-h-[140px] rounded-[15px] bg-white/15 animate-pulse border border-white/10" />
            </div>
            <div className="w-full mt-3 sm:mt-10 min-h-[88px]" />
          </div>
        </div>
      </section>
      <div className="container py-10 space-y-6">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 rounded-[20px]" />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Single fare row matching FlightCard (cols=1) */
export function FlightFareCardSkeleton() {
  return (
    <div className="bg-white rounded-[24px] border border-[#F2ECE4] p-3.5 sm:p-4 min-[1360px]:p-5 flex flex-col md:flex-row justify-between items-stretch gap-4 sm:gap-5 min-[1360px]:gap-6 animate-pulse">
      <div className="flex flex-col flex-grow justify-between gap-4 pr-0 md:pr-5">
        <div className="flex flex-col min-[500px]:grid min-[500px]:grid-cols-2 items-center gap-3">
          <div className="space-y-2 w-full">
            <Skeleton className="h-4 w-28 mx-auto min-[500px]:mx-0" />
            <Skeleton className="h-3 w-20 mx-auto min-[500px]:mx-0" />
          </div>
          <div className="space-y-2 w-full">
            <Skeleton className="h-4 w-28 mx-auto min-[500px]:ml-auto min-[500px]:mr-0" />
            <Skeleton className="h-3 w-20 mx-auto min-[500px]:ml-auto min-[500px]:mr-0" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 py-2">
          <Skeleton className="h-3 w-16" />
          <div className="flex items-center w-full max-w-[280px] gap-2">
            <Skeleton className="h-5 w-10" />
            <div className="flex-grow h-px bg-gray-200" />
            <Skeleton className="h-5 w-10" />
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
      <div className="hidden md:block w-[1px] bg-[#F0E6D8] self-stretch my-2 shrink-0" />
      <div className="flex flex-col items-center justify-center shrink-0 gap-2 py-2 min-w-[120px]">
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-28 rounded-xl mt-2" />
      </div>
    </div>
  );
}

/**
 * City fares page skeleton — matches CityFlightFaresClient:
 * BannerInner (search + class selector) + sidebar filters + fare list
 */
export function CityFlightFaresSkeleton() {
  return (
    <div className="w-full bg-white font-poppins" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading city flight fares</span>

      {/* Hero — match HeroSectionNew */}
      <section className="w-full relative mt-[28px] mb-[30px] sm:mb-[40px] lg:mb-[50px]">
        <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 relative">
          <div className="w-full relative overflow-hidden rounded-[28px] sm:rounded-[36px] lg:rounded-[40px] min-h-[580px] sm:min-h-[625px] xl:min-h-[640px] bg-[#1a102f] flex flex-col items-center">
            <div className="w-full max-w-[1360px] mx-auto text-center pt-[70px] sm:pt-[90px] lg:pt-[107px] px-4 space-y-4">
              <Skeleton className="h-6 w-36 mx-auto bg-white/20" />
              <Skeleton className="h-14 sm:h-20 w-96 max-w-full mx-auto bg-white/20" />
              <Skeleton className="h-6 w-80 max-w-full mx-auto bg-white/20" />
            </div>
            <div className="w-full h-[180px] sm:h-[220px]" />
          </div>
          {/* Form card skeleton */}
          <div className="w-full max-w-[1236px] mx-auto -mt-[130px] relative z-20 px-3 sm:px-4 xl:px-0">
            <div className="w-full h-[260px] bg-white rounded-[25px] shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-gray-100/50 p-6 flex flex-col justify-center">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-[88px] w-full rounded-[10px]" />
                <Skeleton className="h-[88px] w-full rounded-[10px]" />
                <Skeleton className="h-[88px] w-full rounded-[10px]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="w-full pb-16">
        <div className="text-center mt-12 sm:mt-16 mb-8 sm:mb-10 max-w-3xl mx-auto px-4 space-y-3">
          <Skeleton className="h-10 w-72 sm:w-96 mx-auto" />
          <Skeleton className="h-4 w-full max-w-2xl mx-auto" />
        </div>

        {/* 2-by-2 Fares list */}
        <div className="max-w-[1236px] mx-auto px-4 sm:px-6 xl:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 w-full">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[140px] bg-gray-100 rounded-[20px] animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
