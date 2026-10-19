'use client';

import { usePathname } from 'next/navigation';
import {
  HomePageSkeleton,
  ContinentsPageSkeleton,
  CityFlightFaresSkeleton,
  AirlinesPageSkeleton,
  LegalStaticPageSkeleton,
  GenericInnerPageSkeleton,
} from '../Components/common/Skeleton';

function isCityFaresPath(path) {
  const segments = path.split('/').filter(Boolean);
  if (segments.some((s) => /^flights-to-/i.test(s))) return true;
  // /continent/country/city-slug (e.g. /africa/algeria/flights-to-algiers)
  if (segments.length >= 3) return true;
  return false;
}

function isLegalStaticPath(path) {
  return (
    path.includes('privacy-policy') ||
    path.includes('cookies') ||
    path.includes('terms-condition') ||
    path.includes('terms-and-conditions')
  );
}

/**
 * Root loading UI — pick skeleton by destination URL.
 */
export default function Loading() {
  const pathname = usePathname() || '/';
  const path = pathname.replace(/\/+$/, '') || '/';

  if (path === '/') {
    return <HomePageSkeleton />;
  }

  if (path === '/continents' || path.startsWith('/continents/')) {
    return <ContinentsPageSkeleton />;
  }

  if (path === '/airlines' || path.startsWith('/airlines/')) {
    return <AirlinesPageSkeleton />;
  }

  if (isLegalStaticPath(path)) {
    return <LegalStaticPageSkeleton />;
  }

  if (isCityFaresPath(path)) {
    return <CityFlightFaresSkeleton />;
  }

  return <GenericInnerPageSkeleton />;
}
