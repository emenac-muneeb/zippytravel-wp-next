import CountryPackagesClient from '../../[...slug]/CountryPackagesClient';
import { endpoints } from '../../../Helpers/endpoints';
import { BASE_URL_IMG } from '../../../Helpers/imageurl';
import { notFound } from 'next/navigation';
import { GetCanonicalUrl } from '../../../Helpers/metadata';
import { ensureHtmlExt, stripHtmlExt } from '../../../Helpers/holidayUrls';
import ScriptInjector from '../../../Components/common/ScriptInjector';

async function getCountryData(countrySlug) {
  const slug = ensureHtmlExt(countrySlug);
  try {
    const res = await fetch(endpoints.holidaysCountryDetailsBySlug(slug), {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data?.length ? data.data : null;
  } catch (err) {
    console.error('Error fetching holiday country:', err);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { countrySlug } = await params;
  const cities = await getCountryData(countrySlug);
  if (!cities?.length) return { title: 'Page Not Found' };

  const countryData = cities[0] || {};
  const pageTitle =
    countryData.country_browser_title ||
    countryData.holiday_country_title ||
    `Holidays to ${stripHtmlExt(countrySlug)}`;
  const metaDesc = countryData.country_meta_description || countryData.meta_description || '';
  const imageUrl = countryData.banner_img?.[0]?.url
    ? `${BASE_URL_IMG}/${countryData.banner_img[0].url}`
    : '';
  const canonical = GetCanonicalUrl(`/holidays/${ensureHtmlExt(countrySlug)}`);

  return {
    title: pageTitle,
    description: metaDesc,
    keywords: countryData.country_meta_keywords || countryData.meta_keywords || '',
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
  const { countrySlug } = await params;
  const cities = await getCountryData(countrySlug);

  if (!cities) notFound();

  const scriptContent =
    cities[0]?.country_script ||
    cities[0]?.script ||
    cities[0]?.page_script ||
    cities[0]?.contents?.script;

  return (
    <>
      <ScriptInjector scriptContent={scriptContent} />
      <CountryPackagesClient initialData={cities} countrySlug={countrySlug} />
    </>
  );
}