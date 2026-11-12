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

function parseCityIds(raw) {
  if (typeof raw !== "string") return [];
  return raw
    .split(",")
    .map((id) => id.trim())
    .filter((id) => /^\d+$/.test(id));
}

function parseFarePrice(fare) {
  const num = parseFloat(fare?.price);
  return !Number.isNaN(num) && num > 0 ? num : null;
}

async function fetchContinentCitiesBySlug(slug) {
  if (!slug) return [];
  try {
    const res = await fetch(endpoints.ContinentCountriesBySlug(slug), {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data?.status === 1 && Array.isArray(data?.result?.data)
      ? data.result.data
      : [];
  } catch (err) {
    console.error("Error fetching continent cities:", err);
    return [];
  }
}

/**
 * Same price source as continent cards: match-location city.fare.price
 * (backend lowest/featured fare). City meta (image/slug) from city-fares.
 */
async function getCheapestFlightDestinations(cityIds, continentsList = []) {
  if (!cityIds.length) return [];
  try {
    const params = new URLSearchParams({
      city_ids: cityIds.join(","),
      page: "1",
      per_page: "100",
    });
    const res = await fetch(`${endpoints.cityFares}?${params.toString()}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (data?.status !== 1) return [];

    const cities = Array.isArray(data.result?.cities) ? data.result.cities : [];
    const byId = new Map(cities.map((city) => [String(city.id), city]));

    const continentIdToSlug = new Map(
      (Array.isArray(continentsList) ? continentsList : [])
        .filter((c) => c?.id != null && c?.slug)
        .map((c) => [String(c.id), c.slug])
    );

    const continentSlugs = [
      ...new Set(
        cityIds
          .map((id) => byId.get(String(id)))
          .map((city) => continentIdToSlug.get(String(city?.continent_id)))
          .filter(Boolean)
      ),
    ];

    const continentCities = (
      await Promise.all(continentSlugs.map(fetchContinentCitiesBySlug))
    ).flat();

    const fareByCityId = new Map(
      continentCities
        .filter((city) => city?.id != null)
        .map((city) => [String(city.id), parseFarePrice(city.fare)])
    );

    return cityIds
      .map((id) => {
        const city = byId.get(String(id));
        if (!city?.title || !city?.slug || !city?.image_url) return null;
        return {
          id: city.id,
          title: city.title,
          slug: city.slug,
          image: city.image_url,
          price: fareByCityId.get(String(id)) ?? null,
        };
      })
      .filter(Boolean);
  } catch (err) {
    console.error("Error fetching cheapest flight destinations:", err);
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

  const cityFaresWidget = homePageRes?.result?.cityfares_widget?.[0] || null;
  const cheapestCityIds = parseCityIds(cityFaresWidget?.city_ids);
  const cheapestFlightDestinations = await getCheapestFlightDestinations(
    cheapestCityIds,
    continents
  );

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
          cheapestFlightDestinations={cheapestFlightDestinations}
        />
      </Suspense>
    </>
  );
}

