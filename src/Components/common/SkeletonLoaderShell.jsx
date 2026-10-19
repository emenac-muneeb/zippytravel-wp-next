'use client';

import React, { useState, useEffect } from 'react';
import { BannerSkeleton, SliderSkeleton, ContentSkeleton } from './Skeleton';

export default function SkeletonLoaderShell({ children }) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <BannerSkeleton />
        <ContentSkeleton />
        <div className="my-12">
          <SliderSkeleton />
        </div>
        <div style={{ display: 'none' }}>{children}</div>
      </div>
    );
  }

  return <>{children}</>;
}
