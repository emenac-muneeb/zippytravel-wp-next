'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

NProgress.configure({
  showSpinner: false,
  speed: 280,
  minimum: 0.12,
  trickleSpeed: 120,
});

const SAFETY_DONE_MS = 8000;
/** Delay after App Router URL settles before completing the bar */
const ROUTE_SETTLE_MS = 120;

function normalizePathname(pathname) {
  if (!pathname || pathname === '/') return '/';
  return pathname.replace(/\/+$/, '') || '/';
}

/** Stable key for comparing route changes (ignores hash-only updates). */
function routeKeyFromWindow() {
  if (typeof window === 'undefined') return '';
  return normalizePathname(window.location.pathname) + window.location.search;
}

export default function TopLoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const safetyTimerRef = useRef(null);
  const settleTimerRef = useRef(null);
  const progressActiveRef = useRef(false);

  const clearTimer = (ref) => {
    if (ref.current) {
      clearTimeout(ref.current);
      ref.current = null;
    }
  };

  const finishProgress = () => {
    clearTimer(safetyTimerRef);
    clearTimer(settleTimerRef);
    progressActiveRef.current = false;
    NProgress.done(true);
  };

  const startProgress = () => {
    clearTimer(settleTimerRef);
    if (!progressActiveRef.current) {
      progressActiveRef.current = true;
      NProgress.start();
    }
    clearTimer(safetyTimerRef);
    safetyTimerRef.current = setTimeout(() => {
      finishProgress();
    }, SAFETY_DONE_MS);
  };

  // Finish after the App Router URL updates (client navigations and query changes).
  useEffect(() => {
    if (!progressActiveRef.current) {
      return undefined;
    }

    clearTimer(settleTimerRef);
    settleTimerRef.current = setTimeout(() => {
      finishProgress();
    }, ROUTE_SETTLE_MS);

    return () => clearTimer(settleTimerRef);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  useEffect(() => {
    const patchHistoryMethod = (methodName) => {
      const original = window.history[methodName].bind(window.history);

      window.history[methodName] = function patchedHistoryMethod(...args) {
        const before = routeKeyFromWindow();
        const result = original(...args);
        const after = routeKeyFromWindow();
        if (before !== after) {
          startProgress();
        }
        return result;
      };

      return original;
    };

    const originalPushState = patchHistoryMethod('pushState');
    const originalReplaceState = patchHistoryMethod('replaceState');

    return () => {
      clearTimer(safetyTimerRef);
      clearTimer(settleTimerRef);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      NProgress.done(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
