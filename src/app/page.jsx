import { Suspense } from 'react';
import HomePageClient from './HomePageClient';
import { endpoints } from '../Helpers/endpoints';
import { BASE_URL_IMG } from '../Helpers/imageurl';
import ScriptInjector from '../Components/common/ScriptInjector';
import { getGeneralSettings, getWebsiteTitle, parseScrollDescription, GetCanonicalUrl } from "../Helpers/metadata";
import { HomePageSkeleton } from '../Components/common/Skeleton';

async function getHomePageData() {
  try {
    const res = await fetch(endpoints.getPage, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    console.error("Error fetching home page data:", err);
    return null;
  }
}

async function getCityFares() {
  try {
    const res = await fetch(endpoints.cityFares, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return res.json();
  } catch (err) {
    console.error("Error fetching city fares:", err);
    return [];
  } 
}

async function getBannerData() {
  try {
    const res = await fetch(endpoints.banner, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.status === 1 ? data.result : [];
  } catch (err) {
    console.error("Error fetching banners:", err);
    return [];
  }
}

async function getContinents() {
  try {
    const res = await fetch(endpoints.getContinents, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.status === 1 ? data.result.data : [];
  } catch (err) {
    console.error("Error fetching continents:", err);
    return [];
  }
}

async function getReviews() {
  try {
    const res = await fetch(endpoints.reviews, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.status === 1 ? data.result : [];
  } catch (err) {
    console.error("Error fetching reviews:", err);
    return [];
  }
}

export async function generateMetadata() {
  const [data, generalSettings] = await Promise.all([
    getHomePageData(),
    getGeneralSettings()
  ]);
  const websiteTitle = getWebsiteTitle(generalSettings);
  const homePage = data?.result;
  const imageUrl = homePage?.banner_img?.[0]?.url 
    ? `${BASE_URL_IMG}/${homePage.banner_img[0].url}` 
    : '';

  return {
    title: homePage?.browser_title || websiteTitle,
    description: homePage?.meta_description || "",
    keywords: homePage?.meta_keywords || "",
    openGraph: {
      title: homePage?.browser_title || websiteTitle,
      description: homePage?.meta_description || "",
      images: imageUrl ? [{ url: imageUrl }] : [],
      type: 'website',
      url: GetCanonicalUrl("/"),
    },
    twitter: {
      card: 'summary_large_image',
      title: homePage?.browser_title || websiteTitle,
      description: homePage?.meta_description || "",
      images: imageUrl ? [imageUrl] : [],
    },
    alternates: {
      canonical: GetCanonicalUrl("/"),
    }
  };
}

export default async function Page() {
  const [homePageRes, cityFaresRes, bannerRes, continents, reviews] =
    await Promise.all([
      getHomePageData(),
      getCityFares(),
      getBannerData(),
      getContinents(),
      getReviews(),
    ]);

  const scrollDescription = homePageRes?.result?.scroll_description;
  const initialScrollParsed = scrollDescription
    ? parseScrollDescription(scrollDescription)
    : null;

  // Hero LCP poster is preloaded via next/image `priority` in HeroSectionNew
  // (avoids double-fetch of raw JPG + optimized WebP).

  return (
    <>
      <ScriptInjector scriptContent={homePageRes?.result?.script} />
      <Suspense fallback={<HomePageSkeleton />}>
        <HomePageClient 
          initialHomePage={homePageRes?.result} 
          initialCityFares={cityFaresRes?.result}
          initialContinentCities={cityFaresRes}
          initialBanners={bannerRes}
          initialContinents={continents}
          initialReviews={reviews}
          initialScrollParsed={initialScrollParsed}
        />
      </Suspense>
    </>
  );
}

