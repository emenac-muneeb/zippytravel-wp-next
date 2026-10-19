import { Suspense } from "react";
import FlightCardList from "../../Components/FlightCardList";
import { ContentSkeleton, Skeleton } from "../../Components/common/Skeleton";

function FlightDetailsFallback() {
  return (
    <div className="container" aria-busy="true">
      <div className="w-full mx-auto pt-[40px] sm:pt-[55px] pb-10 min-h-[60vh]">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-[280px] space-y-3 flex-shrink-0">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
          <div className="flex-1 space-y-4">
            <ContentSkeleton />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FlightDetailsPage() {
  return (
    <Suspense fallback={<FlightDetailsFallback />}>
      <FlightCardList />
    </Suspense>
  );
}
