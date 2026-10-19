import CityPackages from '../../../../Components/CityPackages';
import { endpoints } from '../../../../Helpers/endpoints';
import { BASE_URL_IMG } from '../../../../Helpers/imageurl';
import { notFound } from 'next/navigation';
import { GetCanonicalUrl } from '../../../../Helpers/metadata';
import { ensureHtmlExt, stripHtmlExt } from '../../../../Helpers/holidayUrls';
import ScriptInjector from '../../../../Components/common/ScriptInjector';

async function getCityPackages(citySlug) {
  const slug = ensureHtmlExt(citySlug);
  try {
    const res = await fetch(endpoints.holidaysCityDetailsBySlug(slug), {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data?.length ? data.data : null;
  } catch (err) {
    console.error('Error fetching holiday city:', err);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { countrySlug, citySlug } = await params;
  const packages = await getCityPackages(citySlug);
  if (!packages?.length) return { title: 'Page Not Found' };

  const cityData = packages[0] || {};
  const pageTitle =
    cityData.city_browser_title ||
    cityData.holiday_city_title ||
    cityData.city_title ||
    stripHtmlExt(citySlug);
  const metaDesc = cityData.city_meta_description || cityData.meta_description || '';
  const imageUrl = cityData.banner_img?.[0]?.url
    ? `${BASE_URL_IMG}/${cityData.banner_img[0].url}`
    : '';
  const canonical = GetCanonicalUrl(
    `/holidays/${stripHtmlExt(countrySlug)}/${ensureHtmlExt(citySlug)}`
  );

  return {
    title: pageTitle,
    description: metaDesc,
    keywords: cityData.city_meta_keywords || cityData.meta_keywords || '',
    alternates: { canonical },
    openGraph: {
      title: pageTitle,
      description: metaDesc,
      url: canonical,
      images: imageUrl ? [{ url: imageUrl }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: metaDesc,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function Page({ params }) {
  const { countrySlug, citySlug } = await params;
  const packages = await getCityPackages(citySlug);

  if (!packages) notFound();

  const cityData = packages[0] || {};
  const scriptContent =
    cityData.city_script ||
    cityData.script ||
    cityData.page_script ||
    cityData.contents?.script;

  return (
    <>
      <ScriptInjector scriptContent={scriptContent} />
      <CityPackages
        countrySlug={countrySlug}
        citySlug={citySlug}
        initialPackages={packages}
      />
    </>
  );
}